import { useState, useEffect, useRef, useCallback } from 'react';
import { RoomState, PlayerProfile, ClientSyncPayload } from '../types/game';
import { sounds } from '../audio/soundEffects';
import { safeFetchJson, buildApiUrl } from '../utils/api';

// Safe SessionStorage wrappers for Safari Private Browsing
function safeSessionGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // quota exceeded or private mode
  }
}

function safeSessionRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

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
  const [playerId, setPlayerId] = useState<string | null>(() => safeSessionGet('sw_player_id'));
  const [roomCode, setRoomCode] = useState<string | null>(() => safeSessionGet('sw_room_code'));
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

    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
          });
        }
      } catch (err) {
        // Notification API can throw in Safari when not permitted
        console.debug('[SameWavelength] System notification error (safely handled):', err);
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

    console.log(`[SameWavelength Sync] Starting HTTP polling fallback for room ${code}...`);

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

  // Connect via SSE with automatic polling fallback and Safari-safe URL parsing
  const connectSSE = useCallback((code: string, pId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    // Always generate a safe, absolute URL string
    const sseUrl = buildApiUrl(`/api/rooms/${encodeURIComponent(code)}/events?playerId=${encodeURIComponent(pId)}`);
    console.log(`[SameWavelength Sync] Connecting to SSE at: ${sseUrl}`);

    // Check if EventSource is supported
    if (typeof window === 'undefined' || !('EventSource' in window)) {
      console.log('[SameWavelength Sync] EventSource not available, falling back to polling.');
      startPolling(code, pId);
      return;
    }

    try {
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        console.log('[SameWavelength Sync] SSE Connection established.');
        setIsConnected(true);
        setIsBackendUnreachable(false);
        setError(null);
      };

      es.onmessage = (event) => {
        try {
          if (!event.data || typeof event.data !== 'string') return;
          const data = JSON.parse(event.data);
          if (data.type === 'SYNC') {
            const sync: ClientSyncPayload = data.payload;
            handleStateSync(sync.room, data.pushEvent);
          } else if (data.type === 'PUSH_NOTIFICATION') {
            triggerWebNotification(data.notification.title, data.notification.body);
            sounds.playClick();
          }
        } catch (parseErr) {
          console.warn('[SameWavelength Sync] Error parsing SSE payload:', parseErr, event.data);
        }
      };

      es.onerror = (err) => {
        console.warn('[SameWavelength Sync] SSE encountered error or closed by server. Switching to HTTP polling.', err);
        setIsConnected(false);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        // Seamless fallback to polling
        startPolling(code, pId);
      };
    } catch (err: any) {
      // Catch WebKit's "The string did not match the expected pattern" or network syntax error
      console.warn('[SameWavelength Sync] EventSource creation threw exception, safely switching to polling:', err);
      if (eventSourceRef.current) {
        eventSourceRef.current = null;
      }
      startPolling(code, pId);
    }
  }, [handleStateSync, startPolling, triggerWebNotification]);

  // Initial reconnect on mount from sessionStorage
  useEffect(() => {
    if (roomCode && playerId) {
      console.log(`[SameWavelength] Reconnecting existing session: room ${roomCode}, player ${playerId}`);
      safeFetchJson<{ room: RoomState }>(`/api/rooms/${encodeURIComponent(roomCode)}/state?playerId=${encodeURIComponent(playerId)}`)
        .then((res) => {
          if (res.ok && res.data?.room) {
            setRoom(res.data.room);
            connectSSE(roomCode, playerId);
          } else {
            if (res.isHtmlFallback) {
              setIsBackendUnreachable(true);
              setError(res.error || 'Backend non raggiungibile');
            } else {
              console.log('[SameWavelength] Session no longer valid, clearing cache.');
              safeSessionRemove('sw_room_code');
              safeSessionRemove('sw_player_id');
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
      safeSessionSet('sw_room_code', newCode);
      safeSessionSet('sw_player_id', newPlayerId);
      setRoomCode(newCode);
      setPlayerId(newPlayerId);
      connectSSE(newCode, newPlayerId);
      return newCode;
    } catch (err: any) {
      console.error('[SameWavelength] createRoom threw:', err);
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
      safeSessionSet('sw_room_code', cleanCode);
      safeSessionSet('sw_player_id', newPlayerId);
      setRoomCode(cleanCode);
      setPlayerId(newPlayerId);
      connectSSE(cleanCode, newPlayerId);
      return true;
    } catch (err: any) {
      console.error('[SameWavelength] joinRoom threw:', err);
      setError(err.message || 'Errore durante l\'accesso alla stanza');
      return false;
    }
  };

  const submitAnswer = async (answer: string): Promise<boolean> => {
    if (!roomCode || !playerId) return false;
    try {
      const res = await safeFetchJson<{ success: boolean }>(`/api/rooms/${encodeURIComponent(roomCode)}/submit`, {
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
      console.error('[SameWavelength] submitAnswer threw:', err);
      setError(err.message || 'Errore di rete');
      return false;
    }
  };

  const toggleReady = async () => {
    if (!roomCode || !playerId || !room) return;
    const currentReady = room.players[playerId]?.isReady ?? false;
    await safeFetchJson(`/api/rooms/${encodeURIComponent(roomCode)}/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, isReady: !currentReady }),
    });
    sounds.playClick();
  };

  const updateProfile = async (updates: Partial<Pick<PlayerProfile, 'name' | 'mascot' | 'accessory'>>) => {
    if (!roomCode || !playerId) return;
    await safeFetchJson(`/api/rooms/${encodeURIComponent(roomCode)}/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, updates }),
    });
  };

  const startGame = async (): Promise<boolean> => {
    if (!roomCode || !playerId) return false;
    try {
      const res = await safeFetchJson<{ success: boolean }>(`/api/rooms/${encodeURIComponent(roomCode)}/start`, {
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
      console.error('[SameWavelength] startGame threw:', err);
      setError(err.message || 'Errore di avvio');
      return false;
    }
  };

  const skipReveal = async () => {
    if (!roomCode) return;
    await safeFetchJson(`/api/rooms/${encodeURIComponent(roomCode)}/skip-reveal`, {
      method: 'POST',
    });
  };

  const requestRematch = async () => {
    if (!roomCode) return;
    await safeFetchJson(`/api/rooms/${encodeURIComponent(roomCode)}/rematch`, {
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
    safeSessionRemove('sw_room_code');
    safeSessionRemove('sw_player_id');
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
