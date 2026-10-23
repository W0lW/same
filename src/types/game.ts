export type GameMode = 
  | 'LOBBY'
  | 'SAME_BRAIN'
  | 'BLUFF_MODE'
  | 'CHAOS_ROUND'
  | 'WILD_EVENT'
  | 'SECRET_CHEMISTRY'
  | 'ROUND_REVEAL'
  | 'GAME_OVER';

export type MascotType = 'lumi' | 'nova'; // Lumi: Ice/Celestial Blue cyber cat; Nova: Lavender/Lilac cosmic cat

export type MascotExpression = 
  | 'happy'
  | 'excited'
  | 'curious'
  | 'surprised'
  | 'bluffing'
  | 'confused'
  | 'smug'
  | 'intense'
  | 'complicity'
  | 'heart_eyes';

export type MascotAccessory = 
  | 'cyber_visor'
  | 'neon_headphones'
  | 'star_clip'
  | 'halo'
  | 'angel_wings'
  | 'bell_collar'
  | 'none';

export interface PlayerProfile {
  id: string; // unique session/player ID
  name: string;
  mascot: MascotType;
  color: string; // primary accent color
  accessory: MascotAccessory;
  isHost: boolean;
  isReady: boolean;
  score: number;
  streak: number;
  connected: boolean;
  lastActive: number;
}

export type QuestionCategory = 
  | 'intuition'
  | 'absurdity'
  | 'preferences'
  | 'fantasy'
  | 'bluff'
  | 'creativity'
  | 'chemistry';

export interface CatalogItem {
  id: string;
  mode: 'SAME_BRAIN' | 'BLUFF_MODE' | 'CHAOS_ROUND' | 'SECRET_CHEMISTRY';
  category: QuestionCategory;
  prompt: string;
  subtext?: string;
  options?: string[]; // for multiple choice
  allowCustom?: boolean;
  timeLimitSeconds: number; // e.g. 30, 45, 60
}

export interface WildEvent {
  id: string;
  name: string;
  description: string;
  type: 'DOUBLE_POINTS' | 'ROLE_REVERSAL' | 'SECRET_BONUS' | 'QUICK_CHAOS' | 'RISK_IT';
  multiplier?: number;
  durationRounds: number;
}

export interface SecretChemistryOutcome {
  p1Answer: string;
  p2Answer: string;
  type: 
    | 'MUTUAL_VIBE' 
    | 'PLOT_TWIST' 
    | 'ONE_SIDED_SIGNAL' 
    | 'DIFFERENT_FEELINGS' 
    | 'BOTH_CURIOUS' 
    | 'BOTH_PASSING' 
    | 'MUTUAL_MYSTERY';
  title: string;
  description: string;
  badge: string;
}

export interface RoundState {
  roundNumber: number;
  totalRounds: number;
  mode: GameMode;
  catalogItem: CatalogItem;
  activeWildEvent?: WildEvent | null;
  // Role assignments for modes like BLUFF_MODE
  blufferId?: string;
  guesserId?: string;
  bluffCorrectOption?: string; // stored privately on server until reveal
  
  // Timers
  startTime: number;
  timeLimit: number;
  remainingSeconds: number;
  isTimerPaused: boolean;

  // Submission flags visible to both players
  submissions: {
    [playerId: string]: {
      hasSubmitted: boolean;
      submittedAt?: number;
    };
  };

  // Revealed data (only populated when in ROUND_REVEAL or SECRET_CHEMISTRY reveal)
  revealedAnswers?: {
    [playerId: string]: string;
  };
  
  roundOutcome?: {
    isMatch?: boolean;
    pointsAwarded: { [playerId: string]: number };
    bonusReason?: string;
    mascotReaction: MascotExpression;
    chemistryOutcome?: SecretChemistryOutcome;
    explanation?: string;
  };
}

export interface GameSettings {
  totalRounds: number;
  allowSecretChemistry: boolean;
  includeNegativeOption: boolean; // include "No" along with "Sì", "Non lo so ancora", "Preferisco non rispondere"
  soundEnabled: boolean;
  reducedMotion: boolean;
  notificationsEnabled: boolean;
}

export interface RoomState {
  roomCode: string;
  createdAt: number;
  status: 'LOBBY' | 'IN_PROGRESS' | 'FINISHED';
  players: {
    [playerId: string]: PlayerProfile;
  };
  playerOrder: string[]; // [p1Id, p2Id]
  settings: GameSettings;
  currentRound?: RoundState;
  roundHistory: Array<{
    roundNumber: number;
    mode: GameMode;
    prompt: string;
    matched?: boolean;
    points: { [playerId: string]: number };
  }>;
  stats: {
    totalMatches: number;
    bluffsSucceeded: number;
    bluffsBusted: number;
    wavelengthScore: number; // 0 - 100%
  };
  lastUpdate: number;
}

export interface ClientSyncPayload {
  room: RoomState;
  myPlayerId: string;
  serverTime: number;
}
