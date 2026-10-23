import { useState, useEffect, useRef, useCallback } from 'react';
import { RoomState, PlayerProfile, ClientSyncPayload } from '../types/game';
import { sounds } from '../audio/soundEffects';
import { safeFetchJson, getBackendBaseUrl } from '../utils/api';

export interface UseMultiplayerReturn {
  room: RoomState | null;
  playerId: string | null;
  myPlayer: PlayerProfile | null;
  otherPlayer: PlayerProfile | null;
  isHost: boolean;
  isConnected: boolean;
  isBackendUnreachable: boolean;
  error: string | null;
  inAppNotification: { title: string; body: string } | null;
  clearNotification: () => void;
  createRoom: (name: string, mascot: 'lumi' | 'nova', accessory: any, settings?: any) => Promise<string | null>;
  joinRoom: (code: string, name: string, mascot?: 'lumi' | 'nova', accessory?: any) => Promise<boolean>;
  submitAnswer: (answer: string) => Promise<boolean>;
  toggleReady: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<PlayerProfile, 'name' | 'mascot' | 'accessory'>>) => Promise<void>;
  startGame: () => Promise<boolean>;
  skipReveal: () => Promise<void>;
  requestRematch: () => Promise<void>;
  leaveRoom: () => void;
  retryConnection: () => void;
}

export function useMultiplayer(): UseMultiplayerReturn {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? sessionStorage.getItem('sw_player_id') : null;
  });
  const [roomCode, setRoomCode] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? sessionStorage.getItem('sw_room_code') : null;
  });
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isBackendUnreachable, setIsBackendUnreachable] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inAppNotification, setInAppNotification] = useState<{ title: string; body: string } | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStateVersionRef = useRef<number>(0);

  const clearNotification = useCallback(() => {
    setInAppNotification(null);
  }, []);

  const triggerWebNotification = useCallback((title: string, body: string) => {
    setInAppNotification({ title, body });

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch {
        // Notification API in restricted iframe
      }
    }
  }, []);

  // Sync handler for state updates from either SSE or polling
  const handleStateSync = useCallback((updatedRoom: RoomState, pushEvent?: any) => {
    if (!updatedRoom) return;
    setIsBackendUnreachable(false);
    setIsConnected(true);

    const prevRoundNum = room?.currentRound?.roundNumber;
    const prevReveal = room?.currentRound?.revealedAnswers;

    setRoom(updatedRoom);
    lastStateVersionRef.current = updatedRoom.lastUpdate;

    if (pushEvent) {
      if (pushEvent.type === 'PLAYER_JOINED') {
        sounds.playClick();
        triggerWebNotification('👋 Nuovo Giocatore', pushEvent.message);
      } else if (pushEvent.type === 'ROUND_STARTED') {
        if (pushEvent.mode === 'SECRET_CHEMISTRY') {
          sounds.playChemistryReveal();
          triggerWebNotification('💖 SECRET CHEMISTRY', 'Momento intimo e speciale attivato!');
        } else {
          sounds.playClick();
          triggerWebNotification('🎮 Nuovo Round', `Inizia ${pushEvent.mode}!`);
        }
      } else if (pushEvent.type === 'ROUND_REVEAL') {
        if (updatedRoom.currentRound?.mode === 'SECRET_CHEMISTRY') {
          sounds.playChemistryReveal();
        } else if (updatedRoom.currentRound?.roundOutcome?.isMatch) {
          sounds.playMatch();
        } else {
          sounds.playMiss();
        }
        triggerWebNotification('✨ Rivelazione!', 'Le risposte sono state svelate!');
      }
    } else {
      // In polling mode, detect transitions from room state changes
      if (updatedRoom.currentRound && prevRoundNum !== updatedRoom.currentRound.roundNumber) {
        sounds.playClick();
      }
      if (updatedRoom.currentRound?.revealedAnswers && !prevReveal) {
        if (updatedRoom.currentRound.mode === 'SECRET_CHEMISTRY') {
          sounds.playChemistryReveal();
        } else if (updatedRoom.currentRound.roundOutcome?.isMatch) {
          sounds.playMatch();
        } else {
          sounds.playMiss();
        }
      }
    }
  }, [room, triggerWebNotification]);

  // Polling fallback function for environments where SSE is blocked (e.g. Vercel serverless / proxy)
  const startPolling = useCallback((code: string, pId: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    const poll = async () => {
      const res = await safeFetchJson<{ room: RoomState }>(`/api/rooms/${code}/state?playerId=${pId}`);
      if (res.ok && res.data?.room) {
        handleStateSync(res.data.room);
      } else if (res.isHtmlFallback) {
        setIsBackendUnreachable(true);
        setIsConnected(false);
      }
    };

    poll();
    pollIntervalRef.current = setInterval(poll, 1500);
  }, [handleStateSync]);

  // Connect via SSE with automatic polling fallback
  const connectSSE = useCallback((code: string, pId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    const baseUrl = getBackendBaseUrl();
    const url = `${baseUrl}/api/rooms/${code}/events?playerId=${pId}`;

    try {
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        setIsBackendUnreachable(false);
        setError(null);
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'SYNC') {
            const sync: ClientSyncPayload = data.payload;
            handleStateSync(sync.room, data.pushEvent);
          } else if (data.type === 'PUSH_NOTIFICATION') {
            triggerWebNotification(data.notification.title, data.notification.body);
            sounds.playClick();
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err);
        }
      };

      es.onerror = () => {
        // If SSE fails (common in serverless like Vercel), fall back to HTTP polling
        setIsConnected(false);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        startPolling(code, pId);
      };
    } catch {
      // EventSource instantiation failed, fallback to polling
      startPolling(code, pId);
    }
  }, [handleStateSync, startPolling, triggerWebNotification]);

  // Initial reconnect on mount from sessionStorage
  useEffect(() => {
    if (roomCode && playerId) {
      safeFetchJson<{ room: RoomState }>(`/api/rooms/${roomCode}/state?playerId=${playerId}`)
        .then((res) => {
          if (res.ok && res.data?.room) {
            setRoom(res.data.room);
            connectSSE(roomCode, playerId);
          } else {
            if (res.isHtmlFallback) {
              setIsBackendUnreachable(true);
              setError(res.error || 'Backend non raggiungibile');
            } else {
              // Room expired
              sessionStorage.removeItem('sw_room_code');
              sessionStorage.removeItem('sw_player_id');
              setRoomCode(null);
              setPlayerId(null);
            }
          }
        });
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [roomCode, playerId, connectSSE]);

  const createRoom = async (
    name: string,
    mascot: 'lumi' | 'nova',
    accessory: any,
    settings?: any
  ): Promise<string | null> => {
    try {
      setError(null);
      setIsBackendUnreachable(false);

      const res = await safeFetchJson<{ roomCode: string; playerId: string }>('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: name, mascot, accessory, settings }),
      });

      if (!res.ok || !res.data) {
        if (res.isHtmlFallback) {
          setIsBackendUnreachable(true);
        }
        setError(res.error || 'Errore nella creazione della stanza');
        return null;
      }

      const { roomCode: newCode, playerId: newPlayerId } = res.data;
      sessionStorage.setItem('sw_room_code', newCode);
      sessionStorage.setItem('sw_player_id', newPlayerId);
      setRoomCode(newCode);
      setPlayerId(newPlayerId);
      connectSSE(newCode, newPlayerId);
      return newCode;
    } catch (err: any) {
      setError(err.message || 'Errore di connessione');
      return null;
    }
  };

  const joinRoom = async (
    code: string,
    name: string,
    mascot?: 'lumi' | 'nova',
    accessory: any = 'none'
  ): Promise<boolean> => {
    try {
      setError(null);
      setIsBackendUnreachable(false);
      const cleanCode = code.toUpperCase().trim();

      const res = await safeFetchJson<{ playerId: string; success: boolean }>('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: cleanCode, playerName: name, mascot, accessory }),
      });

      if (!res.ok || !res.data?.success) {
        if (res.isHtmlFallback) {
          setIsBackendUnreachable(true);
        }
        setError(res.error || 'Impossibile entrare nella stanza');
        return false;
      }

      const { playerId: newPlayerId } = res.data;
      sessionStorage.setItem('sw_room_code', cleanCode);
      sessionStorage.setItem('sw_player_id', newPlayerId);
      setRoomCode(cleanCode);
      setPlayerId(newPlayerId);
      connectSSE(cleanCode, newPlayerId);
      return true;
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'accesso alla stanza');
      return false;
    }
  };

  const submitAnswer = async (answer: string): Promise<boolean> => {
    if (!roomCode || !playerId) return false;
    try {
      const res = await safeFetchJson<{ success: boolean }>(`/api/rooms/${roomCode}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, answer }),
      });

      if (!res.ok || !res.data?.success) {
        setError(res.error || 'Errore nell\'invio della risposta');
        return false;
      }
      sounds.playClick();
      return true;
    } catch (err: any) {
      setError(err.message || 'Errore di rete');
      return false;
    }
  };

  const toggleReady = async () => {
    if (!roomCode || !playerId || !room) return;
    const currentReady = room.players[playerId]?.isReady ?? false;
    await safeFetchJson(`/api/rooms/${roomCode}/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, isReady: !currentReady }),
    });
    sounds.playClick();
  };

  const updateProfile = async (updates: Partial<Pick<PlayerProfile, 'name' | 'mascot' | 'accessory'>>) => {
    if (!roomCode || !playerId) return;
    await safeFetchJson(`/api/rooms/${roomCode}/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, updates }),
    });
  };

  const startGame = async (): Promise<boolean> => {
    if (!roomCode || !playerId) return false;
    try {
      const res = await safeFetchJson<{ success: boolean }>(`/api/rooms/${roomCode}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      if (!res.ok || !res.data?.success) {
        setError(res.error || 'Impossibile avviare la partita');
        return false;
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Errore di avvio');
      return false;
    }
  };

  const skipReveal = async () => {
    if (!roomCode) return;
    await safeFetchJson(`/api/rooms/${roomCode}/skip-reveal`, {
      method: 'POST',
    });
  };

  const requestRematch = async () => {
    if (!roomCode) return;
    await safeFetchJson(`/api/rooms/${roomCode}/rematch`, {
      method: 'POST',
    });
  };

  const leaveRoom = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    sessionStorage.removeItem('sw_room_code');
    sessionStorage.removeItem('sw_player_id');
    setRoomCode(null);
    setPlayerId(null);
    setRoom(null);
    setIsConnected(false);
  };

  const retryConnection = () => {
    setError(null);
    setIsBackendUnreachable(false);
    if (roomCode && playerId) {
      connectSSE(roomCode, playerId);
    }
  };

  const myPlayer = (room && playerId && room.players[playerId]) ? room.players[playerId] : null;
  const otherPlayer = (room && playerId) 
    ? Object.values(room.players).find(p => p.id !== playerId) || null 
    : null;
  const isHost = myPlayer?.isHost ?? false;

  return {
    room,
    playerId,
    myPlayer,
    otherPlayer,
    isHost,
    isConnected,
    isBackendUnreachable,
    error,
    inAppNotification,
    clearNotification,
    createRoom,
    joinRoom,
    submitAnswer,
    toggleReady,
    updateProfile,
    startGame,
    skipReveal,
    requestRematch,
    leaveRoom,
    retryConnection,
  };
}
