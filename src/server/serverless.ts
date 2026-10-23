import express, { Request, Response } from 'express';
import { gameServer } from './gameServer';

const app = express();
app.use(express.json());

// CORS headers for cross-origin or local testing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

const router = express.Router();

// Health/Status check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: Date.now() });
});

// API Endpoints
router.post('/rooms/create', (req: Request, res: Response) => {
  try {
    const { hostName, mascot, accessory, settings } = req.body || {};
    const result = gameServer.createRoom(hostName, mascot, accessory, settings);
    res.json(result);
  } catch (err: any) {
    console.error('[API /rooms/create] Error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Errore interno del server' });
  }
});

router.post('/rooms/join', (req: Request, res: Response) => {
  try {
    const { roomCode, playerName, mascot, accessory } = req.body || {};
    if (!roomCode) {
      return res.status(400).json({ success: false, error: 'Codice stanza mancante.' });
    }
    const result = gameServer.joinRoom(roomCode, playerName, mascot, accessory);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    console.error('[API /rooms/join] Error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Errore interno del server' });
  }
});

router.get('/rooms/:code/events', (req: Request, res: Response) => {
  try {
    const roomCode = req.params.code;
    const playerId = req.query.playerId as string;

    if (!roomCode || !playerId) {
      return res.status(400).json({ success: false, error: 'roomCode and playerId are required' });
    }

    gameServer.registerSSE(roomCode, playerId, res);
  } catch (err: any) {
    console.error('[API /rooms/:code/events] Error:', err);
    res.status(500).end();
  }
});

router.get('/rooms/:code/state', (req: Request, res: Response) => {
  try {
    const roomCode = req.params.code;
    const playerId = req.query.playerId as string;
    const room = gameServer.getRoom(roomCode);

    if (!room) {
      return res.status(404).json({ success: false, error: 'Stanza non trovata' });
    }

    const sanitized = gameServer.getSanitizedRoom(room, playerId || '');
    res.json({
      room: sanitized,
      myPlayerId: playerId,
      serverTime: Date.now(),
    });
  } catch (err: any) {
    console.error('[API /rooms/:code/state] Error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Errore interno del server' });
  }
});

router.post('/rooms/:code/ready', (req: Request, res: Response) => {
  try {
    const roomCode = req.params.code;
    const { playerId, isReady } = req.body || {};
    gameServer.setPlayerReady(roomCode, playerId, isReady);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[API /rooms/:code/ready] Error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Errore interno del server' });
  }
});

router.post('/rooms/:code/update-profile', (req: Request, res: Response) => {
  try {
    const roomCode = req.params.code;
    const { playerId, updates } = req.body || {};
    gameServer.updatePlayerProfile(roomCode, playerId, updates);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[API /rooms/:code/update-profile] Error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Errore interno del server' });
  }
});

router.post('/rooms/:code/start', (req: Request, res: Response) => {
  try {
    const roomCode = req.params.code;
    const { playerId } = req.body || {};
    const result = gameServer.startGame(roomCode, playerId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    console.error('[API /rooms/:code/start] Error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Errore interno del server' });
  }
});

router.post('/rooms/:code/submit', (req: Request, res: Response) => {
  try {
    const roomCode = req.params.code;
    const { playerId, answer } = req.body || {};
    const result = gameServer.submitAnswer(roomCode, playerId, answer);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    console.error('[API /rooms/:code/submit] Error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Errore interno del server' });
  }
});

router.post('/rooms/:code/skip-reveal', (req: Request, res: Response) => {
  try {
    const roomCode = req.params.code;
    gameServer.nextRoundManual(roomCode);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[API /rooms/:code/skip-reveal] Error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Errore interno del server' });
  }
});

router.post('/rooms/:code/rematch', (req: Request, res: Response) => {
  try {
    const roomCode = req.params.code;
    const result = gameServer.restartGame(roomCode);
    res.json(result);
  } catch (err: any) {
    console.error('[API /rooms/:code/rematch] Error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Errore interno del server' });
  }
});

// Mount router on both /api and / to handle Vercel rewrites whether /api prefix is preserved or stripped
app.use('/api', router);
app.use('/', router);

export default app;
