import express, { Request, Response } from 'express';
import { gameServer } from '../src/server/gameServer';

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

// API Endpoints
app.post('/api/rooms/create', (req: Request, res: Response) => {
  const { hostName, mascot, accessory, settings } = req.body || {};
  const result = gameServer.createRoom(hostName, mascot, accessory, settings);
  res.json(result);
});

app.post('/api/rooms/join', (req: Request, res: Response) => {
  const { roomCode, playerName, mascot, accessory } = req.body || {};
  if (!roomCode) {
    return res.status(400).json({ success: false, error: 'Codice stanza mancante.' });
  }
  const result = gameServer.joinRoom(roomCode, playerName, mascot, accessory);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.get('/api/rooms/:code/events', (req: Request, res: Response) => {
  const roomCode = req.params.code;
  const playerId = req.query.playerId as string;

  if (!roomCode || !playerId) {
    return res.status(400).send('roomCode and playerId are required');
  }

  gameServer.registerSSE(roomCode, playerId, res);
});

app.get('/api/rooms/:code/state', (req: Request, res: Response) => {
  const roomCode = req.params.code;
  const playerId = req.query.playerId as string;
  const room = gameServer.getRoom(roomCode);

  if (!room) {
    return res.status(404).json({ error: 'Stanza non trovata' });
  }

  const sanitized = gameServer.getSanitizedRoom(room, playerId || '');
  res.json({
    room: sanitized,
    myPlayerId: playerId,
    serverTime: Date.now(),
  });
});

app.post('/api/rooms/:code/ready', (req: Request, res: Response) => {
  const roomCode = req.params.code;
  const { playerId, isReady } = req.body || {};
  gameServer.setPlayerReady(roomCode, playerId, isReady);
  res.json({ success: true });
});

app.post('/api/rooms/:code/update-profile', (req: Request, res: Response) => {
  const roomCode = req.params.code;
  const { playerId, updates } = req.body || {};
  gameServer.updatePlayerProfile(roomCode, playerId, updates);
  res.json({ success: true });
});

app.post('/api/rooms/:code/start', (req: Request, res: Response) => {
  const roomCode = req.params.code;
  const { playerId } = req.body || {};
  const result = gameServer.startGame(roomCode, playerId);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/api/rooms/:code/submit', (req: Request, res: Response) => {
  const roomCode = req.params.code;
  const { playerId, answer } = req.body || {};
  const result = gameServer.submitAnswer(roomCode, playerId, answer);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/api/rooms/:code/skip-reveal', (req: Request, res: Response) => {
  const roomCode = req.params.code;
  gameServer.nextRoundManual(roomCode);
  res.json({ success: true });
});

app.post('/api/rooms/:code/rematch', (req: Request, res: Response) => {
  const roomCode = req.params.code;
  const result = gameServer.restartGame(roomCode);
  res.json(result);
});

export default app;
