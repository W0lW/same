import { 
  RoomState, 
  PlayerProfile, 
  RoundState, 
  GameSettings, 
  CatalogItem, 
  WildEvent,
  GameMode,
  ClientSyncPayload
} from '../types/game';
import { GAME_CATALOG, WILD_EVENTS } from '../data/catalog';
import { 
  evaluateSameBrainScore, 
  evaluateBluffScore, 
  evaluateSecretChemistry, 
  calculateWavelength 
} from '../game/scoring';
import { Response } from 'express';

interface InternalRoom extends RoomState {
  secretAnswers: { [playerId: string]: string };
  timerInterval?: NodeJS.Timeout | null;
  catalogQueue: CatalogItem[];
  sseClients: Map<string, Response>;
}

export class GameServer {
  private rooms: Map<string, InternalRoom> = new Map();

  constructor() {
    // Periodic room cleanup for inactive rooms (> 3 hours)
    setInterval(() => {
      const now = Date.now();
      for (const [code, room] of this.rooms.entries()) {
        if (now - room.lastUpdate > 3 * 60 * 60 * 1000) {
          if (room.timerInterval) clearInterval(room.timerInterval);
          this.rooms.delete(code);
        }
      }
    }, 15 * 60 * 1000);
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  public createRoom(
    hostName: string,
    hostMascot: 'lumi' | 'nova' = 'lumi',
    hostAccessory: any = 'none',
    settingsPartial?: Partial<GameSettings>
  ): { roomCode: string; playerId: string } {
    let roomCode = this.generateRoomCode();
    while (this.rooms.has(roomCode)) {
      roomCode = this.generateRoomCode();
    }

    const hostId = 'p_' + Math.random().toString(36).substring(2, 9);
    const hostProfile: PlayerProfile = {
      id: hostId,
      name: hostName.trim() || 'Giocatore 1',
      mascot: hostMascot,
      color: hostMascot === 'lumi' ? '#38bdf8' : '#c084fc',
      accessory: hostAccessory || 'none',
      isHost: true,
      isReady: true,
      score: 0,
      streak: 0,
      connected: true,
      lastActive: Date.now(),
    };

    const defaultSettings: GameSettings = {
      totalRounds: 10,
      allowSecretChemistry: true,
      includeNegativeOption: true,
      soundEnabled: true,
      reducedMotion: false,
      notificationsEnabled: true,
      ...settingsPartial,
    };

    // Prepare catalog queue (shuffled)
    const shuffledCatalog = [...GAME_CATALOG].sort(() => Math.random() - 0.5);

    const room: InternalRoom = {
      roomCode,
      createdAt: Date.now(),
      status: 'LOBBY',
      players: {
        [hostId]: hostProfile,
      },
      playerOrder: [hostId],
      settings: defaultSettings,
      roundHistory: [],
      stats: {
        totalMatches: 0,
        bluffsSucceeded: 0,
        bluffsBusted: 0,
        wavelengthScore: 75,
      },
      lastUpdate: Date.now(),
      secretAnswers: {},
      catalogQueue: shuffledCatalog,
      sseClients: new Map(),
    };

    this.rooms.set(roomCode, room);
    return { roomCode, playerId: hostId };
  }

  public joinRoom(
    roomCode: string,
    playerName: string,
    mascot?: 'lumi' | 'nova',
    accessory: any = 'none'
  ): { playerId: string; success: boolean; error?: string } {
    const code = roomCode.toUpperCase().trim();
    const room = this.rooms.get(code);

    if (!room) {
      return { playerId: '', success: false, error: 'Stanza non trovata! Verifica il codice.' };
    }

    const currentPlayers = Object.values(room.players);
    if (currentPlayers.length >= 2) {
      return { playerId: '', success: false, error: 'La stanza è già piena (massimo 2 giocatori).' };
    }

    const playerId = 'p_' + Math.random().toString(36).substring(2, 9);
    // Suggest the other mascot if host already took one
    const hostMascot = currentPlayers[0]?.mascot;
    const assignedMascot = mascot || (hostMascot === 'lumi' ? 'nova' : 'lumi');

    const profile: PlayerProfile = {
      id: playerId,
      name: playerName.trim() || 'Giocatore 2',
      mascot: assignedMascot,
      color: assignedMascot === 'lumi' ? '#38bdf8' : '#c084fc',
      accessory: accessory || 'none',
      isHost: false,
      isReady: true,
      score: 0,
      streak: 0,
      connected: true,
      lastActive: Date.now(),
    };

    room.players[playerId] = profile;
    room.playerOrder.push(playerId);
    room.lastUpdate = Date.now();

    this.broadcast(code, {
      type: 'PLAYER_JOINED',
      message: `${profile.name} è entrato nella stanza!`,
    });

    return { playerId, success: true };
  }

  public registerSSE(roomCode: string, playerId: string, res: Response) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) {
      res.status(404).end();
      return;
    }

    room.sseClients.set(playerId, res);

    if (room.players[playerId]) {
      room.players[playerId].connected = true;
      room.players[playerId].lastActive = Date.now();
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send immediate sync
    this.sendToClient(res, playerId, room);

    // Keep alive ping every 15s
    const pingInterval = setInterval(() => {
      res.write(': ping\n\n');
    }, 15000);

    res.on('close', () => {
      clearInterval(pingInterval);
      room.sseClients.delete(playerId);
      if (room.players[playerId]) {
        room.players[playerId].connected = false;
      }
      this.broadcast(roomCode, {
        type: 'PLAYER_DISCONNECTED',
        playerId,
      });
    });
  }

  public setPlayerReady(roomCode: string, playerId: string, isReady: boolean) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || !room.players[playerId]) return;

    room.players[playerId].isReady = isReady;
    room.lastUpdate = Date.now();
    this.broadcast(roomCode);
  }

  public updatePlayerProfile(
    roomCode: string, 
    playerId: string, 
    updates: Partial<Pick<PlayerProfile, 'name' | 'mascot' | 'accessory'>>
  ) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || !room.players[playerId]) return;

    Object.assign(room.players[playerId], updates);
    room.lastUpdate = Date.now();
    this.broadcast(roomCode);
  }

  public startGame(roomCode: string, requesterId: string): { success: boolean; error?: string } {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false, error: 'Stanza non trovata' };

    const players = Object.values(room.players);
    if (players.length < 2) {
      return { success: false, error: 'Attendi il secondo giocatore prima di iniziare!' };
    }

    room.status = 'IN_PROGRESS';
    room.stats.totalMatches = 0;
    room.roundHistory = [];
    room.lastUpdate = Date.now();

    this.startNextRound(room);
    return { success: true };
  }

  private startNextRound(room: InternalRoom) {
    if (room.timerInterval) {
      clearInterval(room.timerInterval);
      room.timerInterval = null;
    }

    const currentRoundNum = (room.currentRound?.roundNumber || 0) + 1;
    if (currentRoundNum > room.settings.totalRounds) {
      // Game over
      this.finishGame(room);
      return;
    }

    room.secretAnswers = {};

    // Determine mode:
    // Round 5 (or midpoint) can be SECRET CHEMISTRY if allowed and not triggered yet
    let targetMode: GameMode = 'SAME_BRAIN';
    const hasSecretChemistryAlready = room.roundHistory.some(h => h.mode === 'SECRET_CHEMISTRY');

    if (
      room.settings.allowSecretChemistry &&
      !hasSecretChemistryAlready &&
      (currentRoundNum === 5 || currentRoundNum === Math.floor(room.settings.totalRounds / 2))
    ) {
      targetMode = 'SECRET_CHEMISTRY';
    } else {
      // Alternate modalities
      const mod = currentRoundNum % 4;
      if (mod === 1 || mod === 3) targetMode = 'SAME_BRAIN';
      else if (mod === 2) targetMode = 'BLUFF_MODE';
      else targetMode = 'CHAOS_ROUND';
    }

    // Pick catalog question matching mode
    let catalogItem = room.catalogQueue.find(item => item.mode === targetMode);
    if (!catalogItem) {
      // Fallback from general catalog
      catalogItem = GAME_CATALOG.find(item => item.mode === targetMode) || GAME_CATALOG[0];
    } else {
      // Remove from queue so we don't repeat
      room.catalogQueue = room.catalogQueue.filter(item => item.id !== catalogItem!.id);
    }

    // Maybe trigger Wild Event (30% chance on round 3, 6, 8)
    let wildEvent: WildEvent | null = null;
    if (targetMode !== 'SECRET_CHEMISTRY' && Math.random() < 0.35 && currentRoundNum > 1) {
      wildEvent = WILD_EVENTS[Math.floor(Math.random() * WILD_EVENTS.length)];
    }

    // Assign roles for Bluff mode
    let blufferId: string | undefined;
    let guesserId: string | undefined;
    if (targetMode === 'BLUFF_MODE') {
      const pIndex = currentRoundNum % 2;
      blufferId = room.playerOrder[pIndex];
      guesserId = room.playerOrder[1 - pIndex];
    }

    // Initialize round submissions
    const submissions: RoundState['submissions'] = {};
    for (const pId of room.playerOrder) {
      submissions[pId] = { hasSubmitted: false };
    }

    const timeLimit = wildEvent?.type === 'QUICK_CHAOS' 
      ? Math.max(15, Math.floor(catalogItem.timeLimitSeconds / 2))
      : catalogItem.timeLimitSeconds;

    room.currentRound = {
      roundNumber: currentRoundNum,
      totalRounds: room.settings.totalRounds,
      mode: targetMode,
      catalogItem,
      activeWildEvent: wildEvent,
      blufferId,
      guesserId,
      startTime: Date.now(),
      timeLimit,
      remainingSeconds: timeLimit,
      isTimerPaused: false,
      submissions,
    };

    room.lastUpdate = Date.now();

    // Start authoritative server timer ticker
    room.timerInterval = setInterval(() => {
      if (!room.currentRound || room.currentRound.isTimerPaused) return;

      room.currentRound.remainingSeconds -= 1;

      if (room.currentRound.remainingSeconds <= 0) {
        // Time expired! Handle timeout safely
        this.handleRoundTimeout(room);
      } else {
        // Broadcast timer update every second
        this.broadcast(room.roomCode);
      }
    }, 1000);

    this.broadcast(room.roomCode, {
      type: 'ROUND_STARTED',
      mode: targetMode,
      message: targetMode === 'SECRET_CHEMISTRY'
        ? '💖 SECRET CHEMISTRY ATTIVATA! Atmosfera speciale...'
        : `Round ${currentRoundNum}: ${targetMode}`,
    });
  }

  public submitAnswer(
    roomCode: string,
    playerId: string,
    answer: string
  ): { success: boolean; error?: string } {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || !room.currentRound) return { success: false, error: 'Nessun round attivo' };

    const round = room.currentRound;
    if (round.submissions[playerId]?.hasSubmitted) {
      return { success: false, error: 'Hai già inviato la risposta per questo round.' };
    }

    // Store securely on server
    room.secretAnswers[playerId] = answer.trim();
    round.submissions[playerId] = {
      hasSubmitted: true,
      submittedAt: Date.now(),
    };
    room.lastUpdate = Date.now();

    // Notify other player that opponent has submitted (without leaking answer!)
    const opponentId = room.playerOrder.find(id => id !== playerId);
    if (opponentId) {
      this.sendPushNotificationToPlayer(room, opponentId, {
        title: '⚡ L\'avversario ha risposto!',
        body: 'Il tuo partner ha inviato la sua scelta. Tocca a te!',
        type: 'OPPONENT_SUBMITTED',
      });
    }

    // Check if round is ready for reveal
    const allSubmitted = room.playerOrder.every(id => round.submissions[id]?.hasSubmitted);

    if (round.mode === 'BLUFF_MODE') {
      // In bluff mode: bluffer picks authentic answer first, or if bluffer submitted, guesser now guesses
      if (allSubmitted) {
        this.authorizeReveal(room);
      } else {
        this.broadcast(room.roomCode);
      }
    } else {
      if (allSubmitted) {
        this.authorizeReveal(room);
      } else {
        this.broadcast(room.roomCode);
      }
    }

    return { success: true };
  }

  private handleRoundTimeout(room: InternalRoom) {
    if (!room.currentRound) return;

    // Fill in default for players who haven't submitted
    for (const pId of room.playerOrder) {
      if (!room.currentRound.submissions[pId]?.hasSubmitted) {
        room.secretAnswers[pId] = room.currentRound.catalogItem.options?.[0] || 'Tempo scaduto!';
        room.currentRound.submissions[pId] = {
          hasSubmitted: true,
          submittedAt: Date.now(),
        };
      }
    }

    this.authorizeReveal(room);
  }

  private authorizeReveal(room: InternalRoom) {
    if (room.timerInterval) {
      clearInterval(room.timerInterval);
      room.timerInterval = null;
    }

    const round = room.currentRound;
    if (!round) return;

    const [p1Id, p2Id] = room.playerOrder;
    const p1Ans = room.secretAnswers[p1Id] || '';
    const p2Ans = room.secretAnswers[p2Id] || '';

    // Authorize answers to become public
    round.revealedAnswers = {
      [p1Id]: p1Ans,
      [p2Id]: p2Ans,
    };

    if (round.mode === 'SAME_BRAIN') {
      const outcome = evaluateSameBrainScore(
        p1Ans,
        p2Ans,
        p1Id,
        p2Id,
        round.activeWildEvent
      );

      round.roundOutcome = {
        isMatch: outcome.isMatch,
        pointsAwarded: outcome.pointsAwarded,
        mascotReaction: outcome.reaction,
        explanation: outcome.explanation,
      };

      // Update player scores
      room.players[p1Id].score += outcome.pointsAwarded[p1Id];
      room.players[p2Id].score += outcome.pointsAwarded[p2Id];

      if (outcome.isMatch) {
        room.players[p1Id].streak += 1;
        room.players[p2Id].streak += 1;
        room.stats.totalMatches += 1;
      } else {
        room.players[p1Id].streak = 0;
        room.players[p2Id].streak = 0;
      }
    } else if (round.mode === 'BLUFF_MODE') {
      const bluffer = round.blufferId || p1Id;
      const guesser = round.guesserId || p2Id;
      const secret = room.secretAnswers[bluffer];
      const guess = room.secretAnswers[guesser];

      const bluffResult = evaluateBluffScore(
        bluffer,
        guesser,
        secret,
        guess,
        round.activeWildEvent
      );

      round.roundOutcome = {
        isMatch: !bluffResult.bluffSuccess,
        pointsAwarded: bluffResult.pointsAwarded,
        mascotReaction: bluffResult.blufferReaction,
        explanation: bluffResult.explanation,
      };

      room.players[bluffer].score += bluffResult.pointsAwarded[bluffer];
      room.players[guesser].score += bluffResult.pointsAwarded[guesser];

      if (bluffResult.bluffSuccess) {
        room.stats.bluffsSucceeded += 1;
      } else {
        room.stats.bluffsBusted += 1;
      }
    } else if (round.mode === 'CHAOS_ROUND') {
      // Award creative engagement points
      const points = { [p1Id]: 80, [p2Id]: 80 };
      round.roundOutcome = {
        isMatch: true,
        pointsAwarded: points,
        mascotReaction: 'excited',
        explanation: '⚡ Sfida del caos completata! Entrambi ottengono 80 punti energia!',
      };
      room.players[p1Id].score += 80;
      room.players[p2Id].score += 80;
    } else if (round.mode === 'SECRET_CHEMISTRY') {
      const chemOutcome = evaluateSecretChemistry(p1Ans, p2Ans);
      round.roundOutcome = {
        chemistryOutcome: chemOutcome,
        pointsAwarded: { [p1Id]: 0, [p2Id]: 0 },
        mascotReaction: chemOutcome.type === 'MUTUAL_VIBE' ? 'heart_eyes' : (chemOutcome.type === 'PLOT_TWIST' ? 'surprised' : 'complicity'),
        explanation: chemOutcome.description,
      };
    }

    // Save to round history
    room.roundHistory.push({
      roundNumber: round.roundNumber,
      mode: round.mode,
      prompt: round.catalogItem.prompt,
      matched: round.roundOutcome?.isMatch,
      points: round.roundOutcome?.pointsAwarded || { [p1Id]: 0, [p2Id]: 0 },
    });

    // Update overall wavelength score
    room.stats.wavelengthScore = calculateWavelength(room.roundHistory);
    room.lastUpdate = Date.now();

    // Broadcast reveal
    this.broadcast(room.roomCode, {
      type: 'ROUND_REVEAL',
      message: '✨ Risposte svelate! Scoprite la vostra sintonia!',
    });

    // Keep the reveal/interlude window long enough for the arcade mini-game between questions.
    // Players can still use the reveal screen's manual skip action to move on sooner.
    room.timerInterval = setTimeout(() => {
      this.startNextRound(room);
    }, 35000);
  }

  public nextRoundManual(roomCode: string) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return;
    if (room.timerInterval) {
      clearTimeout(room.timerInterval);
      clearInterval(room.timerInterval);
      room.timerInterval = null;
    }
    this.startNextRound(room);
  }

  private finishGame(room: InternalRoom) {
    room.status = 'FINISHED';
    room.currentRound = undefined;
    room.lastUpdate = Date.now();

    this.broadcast(room.roomCode, {
      type: 'GAME_OVER',
      message: '🎉 Partita conclusa! Ecco le vostre statistiche cosmiche!',
    });
  }

  public restartGame(roomCode: string): { success: boolean } {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false };

    if (room.timerInterval) {
      clearTimeout(room.timerInterval);
      clearInterval(room.timerInterval);
      room.timerInterval = null;
    }

    room.status = 'LOBBY';
    room.roundHistory = [];
    room.currentRound = undefined;
    room.secretAnswers = {};
    room.catalogQueue = [...GAME_CATALOG].sort(() => Math.random() - 0.5);

    for (const pId of room.playerOrder) {
      room.players[pId].score = 0;
      room.players[pId].streak = 0;
      room.players[pId].isReady = true;
    }

    room.stats = {
      totalMatches: 0,
      bluffsSucceeded: 0,
      bluffsBusted: 0,
      wavelengthScore: 75,
    };

    room.lastUpdate = Date.now();
    this.broadcast(room.roomCode, {
      type: 'REMATCH_ACCEPTED',
      message: 'Rivincita avviata! Benvenuti di nuovo nella lobby.',
    });

    return { success: true };
  }

  /**
   * Sanitizes room state so clients never see unrevealed secret answers of their opponent!
   */
  public getSanitizedRoom(room: InternalRoom, forPlayerId: string): RoomState {
    const isReveal = !!room.currentRound?.revealedAnswers;

    let sanitizedRound: RoundState | undefined = undefined;
    if (room.currentRound) {
      sanitizedRound = {
        ...room.currentRound,
        // Only include revealedAnswers if server authorized reveal
        revealedAnswers: isReveal ? room.currentRound.revealedAnswers : undefined,
        // Hide bluffer's secret option during deduction phase
        bluffCorrectOption: isReveal ? room.currentRound.bluffCorrectOption : undefined,
      };
    }

    return {
      roomCode: room.roomCode,
      createdAt: room.createdAt,
      status: room.status,
      players: room.players,
      playerOrder: room.playerOrder,
      settings: room.settings,
      currentRound: sanitizedRound,
      roundHistory: room.roundHistory,
      stats: room.stats,
      lastUpdate: room.lastUpdate,
    };
  }

  public broadcast(roomCode: string, pushEvent?: any) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return;

    for (const [pId, res] of room.sseClients.entries()) {
      this.sendToClient(res, pId, room, pushEvent);
    }
  }

  private sendToClient(res: Response, playerId: string, room: InternalRoom, pushEvent?: any) {
    try {
      const sanitized = this.getSanitizedRoom(room, playerId);
      const payload: ClientSyncPayload = {
        room: sanitized,
        myPlayerId: playerId,
        serverTime: Date.now(),
      };

      res.write(`data: ${JSON.stringify({ type: 'SYNC', payload, pushEvent })}\n\n`);
    } catch {
      // client connection might be dead
    }
  }

  private sendPushNotificationToPlayer(room: InternalRoom, playerId: string, notification: { title: string; body: string; type: string }) {
    const res = room.sseClients.get(playerId);
    if (res) {
      try {
        res.write(`data: ${JSON.stringify({ type: 'PUSH_NOTIFICATION', notification })}\n\n`);
      } catch {
        // ignore
      }
    }
  }

  public getRoom(roomCode: string): InternalRoom | undefined {
    return this.rooms.get(roomCode.toUpperCase());
  }
}

export const gameServer = new GameServer();
