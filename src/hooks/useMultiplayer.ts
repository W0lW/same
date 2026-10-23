import { useState, useEffect, useRef, useCallback } from 'react';
import { RoomState, PlayerProfile, ClientSyncPayload } from '../types/game';
import { sounds } from '../audio/soundEffects';

export interface UseMultiplayerReturn {
  room: RoomState | null;
  playerId: string | null;
  myPlayer: PlayerProfile | null;
  otherPlayer: PlayerProfile | null;
  isHost: boolean;
  isConnected: boolean;
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
}

export function useMultiplayer(): UseMultiplayerReturn {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(() => {
    return sessionStorage.getItem('sw_player_id') || null;
  });
  const [roomCode, setRoomCode] = useState<string | null>(() => {
    return sessionStorage.getItem('sw_room_code') || null;
  });
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inAppNotification, setInAppNotification] = useState<{ title: string; body: string } | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const lastRoundRef = useRef<number | undefined>(undefined);
  const lastModeRef = useRef<string | undefined>(undefined);

  // Clear in-app notification after 4 seconds
  const clearNotification = useCallback(() => {
    setInAppNotification(null);
  }, []);

  // Request browser Notification permission if supported and enabled
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

  // Connect to SSE stream
  const connectSSE = useCallback((code: string, pId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `/api/rooms/${code}/events?playerId=${pId}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'SYNC') {
          const sync: ClientSyncPayload = data.payload;
          const updatedRoom = sync.room;
          setRoom(updatedRoom);

          // Handle audio triggers and notifications on transitions
          if (data.pushEvent) {
            if (data.pushEvent.type === 'PLAYER_JOINED') {
              sounds.playClick();
              triggerWebNotification('👋 Nuovo Giocatore', data.pushEvent.message);
            } else if (data.pushEvent.type === 'ROUND_STARTED') {
              if (data.pushEvent.mode === 'SECRET_CHEMISTRY') {
                sounds.playChemistryReveal();
                triggerWebNotification('💖 SECRET CHEMISTRY', 'Momento intimo e speciale attivato!');
              } else {
                sounds.playClick();
                triggerWebNotification('🎮 Nuovo Round', `Inizia ${data.pushEvent.mode}!`);
              }
            } else if (data.pushEvent.type === 'ROUND_REVEAL') {
              if (updatedRoom.currentRound?.mode === 'SECRET_CHEMISTRY') {
                sounds.playChemistryReveal();
              } else if (updatedRoom.currentRound?.roundOutcome?.isMatch) {
                sounds.playMatch();
              } else {
                sounds.playMiss();
              }
              triggerWebNotification('✨ Rivelazione!', 'Le risposte sono state svelate!');
            }
          }
        } else if (data.type === 'PUSH_NOTIFICATION') {
          triggerWebNotification(data.notification.title, data.notification.body);
          sounds.playClick();
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    es.onerror = () => {
      setIsConnected(false);
    };
  }, [triggerWebNotification]);

  // Initial reconnect from sessionStorage
  useEffect(() => {
    if (roomCode && playerId) {
      // Fetch initial state first
      fetch(`/api/rooms/${roomCode}/state?playerId=${playerId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Stanza non trovata');
        })
        .then((data) => {
          setRoom(data.room);
          connectSSE(roomCode, playerId);
        })
        .catch(() => {
          // Clear dead session
          sessionStorage.removeItem('sw_room_code');
          sessionStorage.removeItem('sw_player_id');
          setRoomCode(null);
          setPlayerId(null);
        });
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
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
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: name, mascot, accessory, settings }),
      });

      const data = await res.json();
      if (data.roomCode && data.playerId) {
        sessionStorage.setItem('sw_room_code', data.roomCode);
        sessionStorage.setItem('sw_player_id', data.playerId);
        setRoomCode(data.roomCode);
        setPlayerId(data.playerId);
        connectSSE(data.roomCode, data.playerId);
        return data.roomCode;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Errore nella creazione della stanza');
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
      const cleanCode = code.toUpperCase().trim();
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: cleanCode, playerName: name, mascot, accessory }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Impossibile entrare nella stanza');
        return false;
      }

      sessionStorage.setItem('sw_room_code', cleanCode);
      sessionStorage.setItem('sw_player_id', data.playerId);
      setRoomCode(cleanCode);
      setPlayerId(data.playerId);
      connectSSE(cleanCode, data.playerId);
      return true;
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'accesso alla stanza');
      return false;
    }
  };

  const submitAnswer = async (answer: string): Promise<boolean> => {
    if (!roomCode || !playerId) return false;
    try {
      const res = await fetch(`/api/rooms/${roomCode}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, answer }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Errore nell\'invio della risposta');
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
    await fetch(`/api/rooms/${roomCode}/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, isReady: !currentReady }),
    });
    sounds.playClick();
  };

  const updateProfile = async (updates: Partial<Pick<PlayerProfile, 'name' | 'mascot' | 'accessory'>>) => {
    if (!roomCode || !playerId) return;
    await fetch(`/api/rooms/${roomCode}/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, updates }),
    });
  };

  const startGame = async (): Promise<boolean> => {
    if (!roomCode || !playerId) return false;
    try {
      const res = await fetch(`/api/rooms/${roomCode}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Impossibile avviare la partita');
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
    await fetch(`/api/rooms/${roomCode}/skip-reveal`, {
      method: 'POST',
    });
  };

  const requestRematch = async () => {
    if (!roomCode) return;
    await fetch(`/api/rooms/${roomCode}/rematch`, {
      method: 'POST',
    });
  };

  const leaveRoom = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    sessionStorage.removeItem('sw_room_code');
    sessionStorage.removeItem('sw_player_id');
    setRoomCode(null);
    setPlayerId(null);
    setRoom(null);
    setIsConnected(false);
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
  };
}
