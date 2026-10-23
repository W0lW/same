import { 
  MascotExpression, 
  SecretChemistryOutcome, 
  WildEvent 
} from '../types/game';

/**
 * Normalizes text for deterministic comparison:
 * Lowercases, strips accents, removes punctuation, collapses whitespace.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, '') // remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks whether two answers match.
 * Exact match after normalization, or checks containment if both are multi-word phrases.
 */
export function areAnswersMatching(ans1: string, ans2: string): boolean {
  if (!ans1 || !ans2) return false;
  const n1 = normalizeText(ans1);
  const n2 = normalizeText(ans2);
  
  if (n1 === n2) return true;

  // If one string is a significant substring of the other (for free-text inputs)
  if (n1.length > 4 && n2.length > 4) {
    if (n1.includes(n2) || n2.includes(n1)) {
      return true;
    }
  }

  return false;
}

export interface SameBrainScoreResult {
  isMatch: boolean;
  pointsAwarded: { [playerId: string]: number };
  reaction: MascotExpression;
  streakIncrement: number;
  explanation: string;
}

export function evaluateSameBrainScore(
  ans1: string,
  ans2: string,
  p1Id: string,
  p2Id: string,
  wildEvent?: WildEvent | null,
  responseTimes?: { [playerId: string]: number }
): SameBrainScoreResult {
  const isMatch = areAnswersMatching(ans1, ans2);
  const pointsAwarded: { [playerId: string]: number } = { [p1Id]: 0, [p2Id]: 0 };

  let basePoints = isMatch ? 100 : 20; // 20 comfort points for trying
  let explanation = isMatch 
    ? '✨ Sulla stessa lunghezza d\'onda! Risposte sincronizzate!' 
    : '💫 Frequenze diverse stavolta, ma la curiosità cresce!';

  // Apply Wild Events
  if (wildEvent?.type === 'DOUBLE_POINTS' && isMatch) {
    basePoints *= 2;
    explanation += ' (Double Points attivo: 200 pt!)';
  } else if (wildEvent?.type === 'RISK_IT') {
    if (isMatch) {
      basePoints = 150;
      explanation += ' (Rischio premiato: +150 pt!)';
    } else {
      basePoints = -30;
      explanation += ' (Rischio mancato: -30 pt!)';
    }
  } else if (wildEvent?.type === 'SECRET_BONUS' && isMatch) {
    basePoints += 50;
    explanation += ' (Risonanza rapida: +50 bonus!)';
  }

  pointsAwarded[p1Id] = basePoints;
  pointsAwarded[p2Id] = basePoints;

  const reaction: MascotExpression = isMatch 
    ? (basePoints >= 150 ? 'excited' : 'happy')
    : 'curious';

  return {
    isMatch,
    pointsAwarded,
    reaction,
    streakIncrement: isMatch ? 1 : 0,
    explanation,
  };
}

export interface BluffScoreResult {
  bluffSuccess: boolean;
  pointsAwarded: { [playerId: string]: number };
  blufferReaction: MascotExpression;
  guesserReaction: MascotExpression;
  explanation: string;
}

export function evaluateBluffScore(
  blufferId: string,
  guesserId: string,
  actualSecret: string,
  guess: string,
  wildEvent?: WildEvent | null
): BluffScoreResult {
  const normalizedActual = normalizeText(actualSecret);
  const normalizedGuess = normalizeText(guess);

  // If guess matches actualSecret, detective uncovered the truth!
  const detectiveWon = normalizedActual === normalizedGuess;
  const bluffSuccess = !detectiveWon;

  let detectivePoints = detectiveWon ? 120 : 20;
  let blufferPoints = bluffSuccess ? 120 : 30;

  let multiplier = 1;
  if (wildEvent?.type === 'DOUBLE_POINTS') {
    multiplier = 2;
    detectivePoints *= 2;
    blufferPoints *= 2;
  }

  const pointsAwarded: { [playerId: string]: number } = {
    [guesserId]: detectivePoints,
    [blufferId]: blufferPoints,
  };

  const explanation = detectiveWon
    ? '🔍 Smantellato! Il detective ha intuito la verità autentica!'
    : '🎭 Bluff perfetto! L\'illusione è andata a segno!';

  return {
    bluffSuccess,
    pointsAwarded,
    blufferReaction: bluffSuccess ? 'smug' : 'surprised',
    guesserReaction: detectiveWon ? 'excited' : 'confused',
    explanation,
  };
}

export function evaluateSecretChemistry(
  p1AnsRaw: string,
  p2AnsRaw: string
): SecretChemistryOutcome {
  const p1 = normalizeText(p1AnsRaw);
  const p2 = normalizeText(p2AnsRaw);

  const hasWord = (text: string, words: string[]) => {
    return words.some(w => {
      const regex = new RegExp(`(^|\\s)${w}(\\s|$)`, 'i');
      return regex.test(text) || text.includes(w);
    });
  };

  const isYes = (t: string) => {
    return /\b(si|yes|volentieri|assolutamente|molto)\b/i.test(t);
  };

  const isNo = (t: string) => {
    return /\b(no|non)\b/i.test(t) && !t.includes('non lo so');
  };

  const isUnsure = (t: string) => {
    return t.includes('non lo so') || t.includes('forse') || t.includes('penserei') || t.includes('potenziale') || t.includes('curioso');
  };

  const isPass = (t: string) => {
    return t.includes('preferisco') || t.includes('rispondere') || t.includes('passo') || t.trim() === '';
  };

  const p1Yes = isYes(p1);
  const p2Yes = isYes(p2);
  const p1No = isNo(p1);
  const p2No = isNo(p2);
  const p1Unsure = isUnsure(p1);
  const p2Unsure = isUnsure(p2);
  const p1Pass = isPass(p1);
  const p2Pass = isPass(p2);

  // Scenario 1: Mutual Vibe
  if (p1Yes && p2Yes) {
    return {
      p1Answer: p1AnsRaw,
      p2Answer: p2AnsRaw,
      type: 'MUTUAL_VIBE',
      title: '✨ Mutual Vibe — Risonanza Cosmica!',
      description: 'Entrambi avete risposto di sì! Una scintilla reciproca, dolce e luminosa come una supernova. La vostra sintonia è tangibile!',
      badge: '💞 Cosmic Resonance',
    };
  }

  // Scenario 2: Unexpected Plot Twist
  if ((p1Yes && p2Unsure) || (p2Yes && p1Unsure)) {
    return {
      p1Answer: p1AnsRaw,
      p2Answer: p2AnsRaw,
      type: 'PLOT_TWIST',
      title: '🌀 Unexpected Plot Twist — Curiosità nell\'Aria',
      description: 'Uno slancio da una parte, una porta aperta dall\'altra! C\'è curiosità e un bel mistero da esplorare senza fretta.',
      badge: '🔮 Spark in Motion',
    };
  }

  // Scenario 3: One-Sided Signal
  if ((p1Yes && p1Pass) || (p2Yes && p2Pass)) {
    return {
      p1Answer: p1AnsRaw,
      p2Answer: p2AnsRaw,
      type: 'ONE_SIDED_SIGNAL',
      title: '🕊️ Segnale Discreto — Rispetto & Leggerezza',
      description: 'Uno sguardo sincero e un riserbo rispettato. Il gioco continua fluido e allegro, nella piena complicità tra amici.',
      badge: '🌸 Gentle Breeze',
    };
  }

  // Scenario 4: Different Feelings (with "No")
  if ((p1Yes && p2No) || (p2Yes && p1No)) {
    return {
      p1Answer: p1AnsRaw,
      p2Answer: p2AnsRaw,
      type: 'DIFFERENT_FEELINGS',
      title: '🌟 Frequenze Distinte — Onestà Totale',
      description: 'Limpidezza e trasparenza! Il bello di Same Wavelength è scoprire chi siamo davvero, ridendo insieme senza alcuna pressione.',
      badge: '🤍 Pure Transparency',
    };
  }

  // Scenario 5: Both Curious
  if (p1Unsure && p2Unsure) {
    return {
      p1Answer: p1AnsRaw,
      p2Answer: p2AnsRaw,
      type: 'BOTH_CURIOUS',
      title: '👀 Both Curious — Due Orbite in Avvicinamento',
      description: 'Nessuno dei due si sbilancia troppo, ma entrambi siete intrigati! Un dolce enigma che il tempo potrebbe svelare.',
      badge: '🌙 Mysterious Orbit',
    };
  }

  // Scenario 6: Both Passing
  if (p1Pass && p2Pass) {
    return {
      p1Answer: p1AnsRaw,
      p2Answer: p2AnsRaw,
      type: 'BOTH_PASSING',
      title: '🤫 Custodi del Segreto — Intesa Tattica',
      description: 'Entrambi avete scelto la privacy! I vostri pensieri restano protetti in una bolla speciale. Avanti tutta con la sfida!',
      badge: '🛡️ Enigma Shield',
    };
  }

  // Default: Mutual Mystery
  return {
    p1Answer: p1AnsRaw,
    p2Answer: p2AnsRaw,
    type: 'MUTUAL_MYSTERY',
    title: '🌌 Mutual Mystery — Onde Indecifrabili',
    description: 'Le risposte sfumano in un territorio tutto vostro. Niente etichette forzate, solo divertimento e mistero.',
    badge: '💫 Galactic Enigma',
  };
}

/**
 * Calculates session wavelength percentage based on round history
 */
export function calculateWavelength(
  history: Array<{ matched?: boolean; mode: string }>
): number {
  if (!history || history.length === 0) return 75; // baseline starting vibe
  const matches = history.filter(h => h.matched).length;
  const total = history.length;
  const ratio = matches / total;
  // Scaled gracefully between 50% and 98%
  return Math.min(99, Math.round(50 + ratio * 48));
}
