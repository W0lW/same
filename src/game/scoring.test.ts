import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeText,
  areAnswersMatching,
  evaluateSameBrainScore,
  evaluateBluffScore,
  evaluateSecretChemistry,
  calculateWavelength,
} from './scoring';

test('normalizeText cleans accents, whitespace, and punctuation', () => {
  assert.equal(normalizeText('  Gatto Ninja!  '), 'gatto ninja');
  assert.equal(normalizeText('SÌ, assolutamente...'), 'si assolutamente');
  assert.equal(normalizeText('Pancake & sciroppo'), 'pancake sciroppo');
});

test('areAnswersMatching compares normalized text and significant subphrases', () => {
  assert.equal(areAnswersMatching('Baita nei boschi', 'baita nei boschi'), true);
  assert.equal(areAnswersMatching('Pizza con crosta ripiena!', 'Pizza con crosta ripiena'), true);
  assert.equal(areAnswersMatching('Tokyo', 'Parigi'), false);
});

test('evaluateSameBrainScore computes correct scores and wild event multipliers', () => {
  // Standard matching
  const matchResult = evaluateSameBrainScore('Tokyo', 'Tokyo', 'p1', 'p2', null);
  assert.equal(matchResult.isMatch, true);
  assert.equal(matchResult.pointsAwarded['p1'], 100);
  assert.equal(matchResult.pointsAwarded['p2'], 100);

  // Double Points wild event
  const doubleResult = evaluateSameBrainScore(
    'Tokyo',
    'Tokyo',
    'p1',
    'p2',
    { id: '1', name: 'Double', description: 'x2', type: 'DOUBLE_POINTS', durationRounds: 1 }
  );
  assert.equal(doubleResult.pointsAwarded['p1'], 200);

  // Mismatch gives comfort points without crash
  const mismatchResult = evaluateSameBrainScore('Tokyo', 'Kyoto', 'p1', 'p2', null);
  assert.equal(mismatchResult.isMatch, false);
  assert.equal(mismatchResult.pointsAwarded['p1'], 20);
});

test('evaluateBluffScore correctly handles detective win vs bluffer win', () => {
  // Detective guess matches secret
  const detWin = evaluateBluffScore('p1', 'p2', 'Fobia dei piccioni', 'Fobia dei piccioni', null);
  assert.equal(detWin.bluffSuccess, false);
  assert.equal(detWin.pointsAwarded['p2'], 120); // detective points
  assert.equal(detWin.guesserReaction, 'excited');

  // Detective fell for fake
  const blufferWin = evaluateBluffScore('p1', 'p2', 'Fobia dei piccioni', 'Ascensori', null);
  assert.equal(blufferWin.bluffSuccess, true);
  assert.equal(blufferWin.pointsAwarded['p1'], 120); // bluffer points
  assert.equal(blufferWin.blufferReaction, 'smug');
});

test('evaluateSecretChemistry produces respectful and correct outcomes', () => {
  // Mutual Vibe
  const mutual = evaluateSecretChemistry('Sì.', 'Sì, assolutamente!');
  assert.equal(mutual.type, 'MUTUAL_VIBE');
  assert.ok(mutual.title.includes('Mutual Vibe'));

  // Plot Twist
  const twist = evaluateSecretChemistry('Sì.', 'Non lo so ancora.');
  assert.equal(twist.type, 'PLOT_TWIST');

  // Both Curious
  const curious = evaluateSecretChemistry('Non lo so ancora.', 'Forse un giorno');
  assert.equal(curious.type, 'BOTH_CURIOUS');

  // Both Passing
  const passing = evaluateSecretChemistry('Preferisco non rispondere.', 'Passo');
  assert.equal(passing.type, 'BOTH_PASSING');

  // Different Feelings
  const diff = evaluateSecretChemistry('Sì.', 'No, sto bene così.');
  assert.equal(diff.type, 'DIFFERENT_FEELINGS');
});

test('calculateWavelength scales gracefully', () => {
  assert.equal(calculateWavelength([]), 75);
  assert.ok(calculateWavelength([{ matched: true, mode: 'SAME_BRAIN' }]) >= 75);
  assert.ok(calculateWavelength([{ matched: false, mode: 'SAME_BRAIN' }]) <= 75);
});
