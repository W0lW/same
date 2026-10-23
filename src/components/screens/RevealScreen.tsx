import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, CheckCircle2, XCircle, Heart, Zap, Eye, Award } from 'lucide-react';
import { RoundState, PlayerProfile, RoomState } from '../../types/game';
import { CyberKitten } from '../mascots/CyberKitten';
import { sounds } from '../../audio/soundEffects';

interface RevealScreenProps {
  round: RoundState;
  room: RoomState;
  myPlayer: PlayerProfile | null;
  otherPlayer: PlayerProfile | null;
  isHost: boolean;
  onSkipReveal: () => Promise<void>;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({
  round,
  room,
  myPlayer,
  otherPlayer,
  isHost,
  onSkipReveal,
}) => {
  const outcome = round.roundOutcome;
  const isMatch = outcome?.isMatch ?? false;
  const isChemistry = round.mode === 'SECRET_CHEMISTRY';
  const chemOutcome = outcome?.chemistryOutcome;

  useEffect(() => {
    // Fire celebratory confetti if matched or mutual vibe
    if (isMatch || chemOutcome?.type === 'MUTUAL_VIBE') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: isChemistry ? ['#ec4899', '#c084fc', '#f472b6', '#ffffff'] : ['#a855f7', '#38bdf8', '#facc15', '#ffffff'],
        });
      } catch {
        // ignore
      }
    }
  }, [isMatch, isChemistry, chemOutcome]);

  const p1Id = room.playerOrder[0];
  const p2Id = room.playerOrder[1];
  const p1 = room.players[p1Id];
  const p2 = room.players[p2Id];

  const p1Answer = round.revealedAnswers?.[p1Id] || 'Nessuna risposta';
  const p2Answer = round.revealedAnswers?.[p2Id] || 'Nessuna risposta';

  // Mascot expression to render
  const reaction = outcome?.mascotReaction || (isMatch ? 'happy' : 'curious');

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-3xl mx-auto w-full relative z-10 animate-fade-in">
      {/* Top Banner */}
      <div className="mb-4 text-center">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full holo-tag text-xs font-mono font-bold uppercase text-purple-200">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>RIVELAZIONE RISPOSTE // ROUND {round.roundNumber}</span>
        </span>
      </div>

      {/* Outcome Title & Status Card */}
      <div
        className={`w-full p-6 rounded-3xl text-center mb-6 shadow-2xl transition-all border ${
          isChemistry
            ? 'bg-gradient-to-r from-pink-950/60 via-purple-950/60 to-slate-900/80 border-pink-400/50'
            : isMatch
            ? 'bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-sky-950/60 border-purple-400/50'
            : 'bg-slate-900/80 border-slate-700/60'
        }`}
      >
        {isChemistry && chemOutcome ? (
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-pink-900/80 text-pink-200 text-xs font-bold mb-2 shadow-sm">
              {chemOutcome.badge}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-2">
              {chemOutcome.title}
            </h2>
            <p className="text-xs sm:text-sm text-pink-200/90 max-w-lg mx-auto leading-relaxed">
              {chemOutcome.description}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              {isMatch ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <Sparkles className="w-6 h-6 text-sky-400" />
              )}
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                {isMatch ? 'SAME WAVELENGTH! ✨' : 'FREQUENZE DIFFERENTI 💫'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              {outcome?.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Question Prompt Recap */}
      <div className="w-full text-center mb-5 text-xs text-purple-300/80 font-medium">
        Domanda: <span className="text-slate-200 italic font-normal">«{round.catalogItem.prompt}»</span>
      </div>

      {/* Side-by-Side Answers with Animated Mascots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-6">
        {/* Player 1 Card */}
        {p1 && (
          <div className="p-5 rounded-3xl glass-panel border-purple-500/30 flex flex-col items-center text-center relative">
            <div className="absolute top-3 left-3 text-[10px] font-mono font-bold text-purple-300 bg-purple-950/60 px-2.5 py-0.5 rounded-full">
              {p1.name} {p1.id === myPlayer?.id ? '(Tu)' : ''}
            </div>

            <div className="my-2">
              <CyberKitten
                type={p1.mascot}
                expression={reaction}
                accessory={p1.accessory}
                size="md"
                isFloating
              />
            </div>

            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-1">
              Risposta Inviata:
            </span>
            <div className="w-full p-3.5 rounded-2xl bg-slate-900/80 border border-purple-400/30 text-sm font-bold text-purple-100 shadow-inner">
              «{p1Answer}»
            </div>

            {!isChemistry && outcome?.pointsAwarded && (
              <div className="mt-3 text-xs font-bold text-emerald-400">
                +{outcome.pointsAwarded[p1.id] || 0} Punti
              </div>
            )}
          </div>
        )}

        {/* Player 2 Card */}
        {p2 && (
          <div className="p-5 rounded-3xl glass-panel border-sky-500/30 flex flex-col items-center text-center relative">
            <div className="absolute top-3 left-3 text-[10px] font-mono font-bold text-sky-300 bg-sky-950/60 px-2.5 py-0.5 rounded-full">
              {p2.name} {p2.id === myPlayer?.id ? '(Tu)' : ''}
            </div>

            <div className="my-2">
              <CyberKitten
                type={p2.mascot}
                expression={reaction}
                accessory={p2.accessory}
                size="md"
                isFloating
              />
            </div>

            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-1">
              Risposta Inviata:
            </span>
            <div className="w-full p-3.5 rounded-2xl bg-slate-900/80 border border-sky-400/30 text-sm font-bold text-sky-100 shadow-inner">
              «{p2Answer}»
            </div>

            {!isChemistry && outcome?.pointsAwarded && (
              <div className="mt-3 text-xs font-bold text-emerald-400">
                +{outcome.pointsAwarded[p2.id] || 0} Punti
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress & Skip Countdown */}
      <div className="w-full max-w-md flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-purple-400" />
          <span>Wavelength Attuale: <strong className="text-sky-300">{room.stats.wavelengthScore}%</strong></span>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onSkipReveal();
          }}
          className="px-4 py-2 rounded-xl glass-button text-xs font-bold text-white flex items-center space-x-1.5 cursor-pointer hover:bg-slate-800"
        >
          <span>Prossimo Round</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
