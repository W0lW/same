import React, { useState } from 'react';
import { Heart, Clock, Lock, Send, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import { RoundState, PlayerProfile } from '../../types/game';
import { CyberKitten } from '../mascots/CyberKitten';
import { sounds } from '../../audio/soundEffects';

interface SecretChemistryRoundProps {
  round: RoundState;
  myPlayer: PlayerProfile | null;
  otherPlayer: PlayerProfile | null;
  onSubmitAnswer: (answer: string) => Promise<boolean>;
}

export const SecretChemistryRound: React.FC<SecretChemistryRoundProps> = ({
  round,
  myPlayer,
  otherPlayer,
  onSubmitAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myId = myPlayer?.id || '';
  const otherId = otherPlayer?.id || '';
  const hasMySubmitted = round.submissions[myId]?.hasSubmitted ?? false;
  const hasOtherSubmitted = round.submissions[otherId]?.hasSubmitted ?? false;

  const handleSelect = (opt: string) => {
    if (hasMySubmitted) return;
    setSelectedOption(opt);
    sounds.playClick();
  };

  const handleSubmit = async () => {
    if (!selectedOption || hasMySubmitted || isSubmitting) return;
    setIsSubmitting(true);
    await onSubmitAnswer(selectedOption);
    setIsSubmitting(false);
  };

  const isLowTime = round.remainingSeconds <= 5;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-3xl mx-auto w-full relative z-10">
      {/* Intimate background glow */}
      <div className="absolute inset-0 bg-radial from-pink-500/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Mode Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-pink-950/70 border border-pink-500/40 text-pink-200">
            EVENTO SPECIALE
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/60 border border-pink-500/40 text-pink-300 flex items-center gap-1.5 shadow-sm">
            <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400 animate-pulse" />
            SECRET CHEMISTRY
          </span>
        </div>

        {/* Server Timer */}
        <div
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold transition-colors ${
            isLowTime
              ? 'bg-rose-950/70 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-pink-950/50 border-pink-500/40 text-pink-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{round.remainingSeconds}s</span>
        </div>
      </div>

      {/* Mascots looking at each other curiously */}
      <div className="flex items-center justify-center space-x-8 mb-5">
        <CyberKitten
          type={myPlayer?.mascot || 'lumi'}
          expression={hasMySubmitted ? 'heart_eyes' : 'curious'}
          accessory={myPlayer?.accessory}
          size="md"
          isFloating
        />
        <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-400/30 flex items-center justify-center animate-pulse-glow">
          <Sparkles className="w-5 h-5 text-pink-300" />
        </div>
        <CyberKitten
          type={otherPlayer?.mascot || 'nova'}
          expression={hasOtherSubmitted ? 'heart_eyes' : 'curious'}
          accessory={otherPlayer?.accessory}
          size="md"
          isFloating
        />
      </div>

      {/* Special Question Card */}
      <div className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-purple-950/60 via-slate-900/80 to-pink-950/60 border border-pink-500/40 text-center mb-6 shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pink-950/80 border border-pink-500/40 text-[11px] font-mono tracking-widest text-pink-300 uppercase mb-3">
          <Heart className="w-3 h-3 fill-pink-400" />
          <span>SINTONIA SINCERA // NESSUN PUNTEGGIO IN PALIO</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-snug">
          {round.catalogItem.prompt}
        </h2>
        <p className="text-xs text-pink-200/80 mt-3 max-w-lg mx-auto leading-relaxed">
          {round.catalogItem.subtext || 'Le risposte sono rigidamente private fino alla rivelazione sincronizzata. Nessun giudizio: solo autenticità.'}
        </p>
      </div>

      {/* Respectful Options */}
      {!hasMySubmitted ? (
        <div className="w-full space-y-3 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {round.catalogItem.options?.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`p-4 rounded-2xl border text-left text-sm font-bold transition-all cursor-pointer flex items-center justify-between ${
                  selectedOption === opt
                    ? 'bg-gradient-to-r from-pink-600/40 to-purple-600/40 border-pink-400 text-white shadow-lg shadow-pink-500/20 scale-[1.01]'
                    : 'glass-panel hover:bg-slate-800/60 border-slate-700/60 text-slate-200'
                }`}
              >
                <span>{opt}</span>
                {selectedOption === opt && <Sparkles className="w-4 h-4 text-pink-300" />}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={!selectedOption || isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 shadow-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvataggio...' : 'Conferma Risposta Riservata 💖'}</span>
            </button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
            <span>Nessun punto viene assegnato o tolto. La risposta resta privata fino alla rivelazione comune.</span>
          </div>
        </div>
      ) : (
        /* Waiting State */
        <div className="w-full p-6 rounded-3xl bg-pink-950/30 border border-pink-500/40 text-center mb-6 animate-pulse-glow">
          <div className="w-12 h-12 rounded-full bg-pink-950/80 border border-pink-400/50 flex items-center justify-center mx-auto mb-3 text-pink-400">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-pink-200 mb-1">
            Risposta Sigillata nel Cuore Digitale!
          </h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            La tua risposta è al sicuro. Appena il tuo partner avrà inviato la sua, assisterete insieme alla rivelazione simultanea!
          </p>
        </div>
      )}

      {/* Players status */}
      <div className="w-full grid grid-cols-2 gap-4 max-w-lg">
        <div className="p-3.5 rounded-2xl glass-panel border-pink-500/30 flex items-center space-x-3">
          <CyberKitten
            type={myPlayer?.mascot || 'lumi'}
            expression={hasMySubmitted ? 'heart_eyes' : 'curious'}
            accessory={myPlayer?.accessory}
            size="sm"
          />
          <div className="text-left flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{myPlayer?.name} (Tu)</p>
            <p className="text-[11px] font-semibold mt-0.5">
              {hasMySubmitted ? (
                <span className="text-pink-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Inviato
                </span>
              ) : (
                <span className="text-amber-400">Sta rispondendo...</span>
              )}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel border-pink-500/30 flex items-center space-x-3">
          <CyberKitten
            type={otherPlayer?.mascot || 'nova'}
            expression={hasOtherSubmitted ? 'heart_eyes' : 'curious'}
            accessory={otherPlayer?.accessory}
            size="sm"
          />
          <div className="text-left flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{otherPlayer?.name || 'Partner'}</p>
            <p className="text-[11px] font-semibold mt-0.5">
              {hasOtherSubmitted ? (
                <span className="text-pink-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Ha risposto!
                </span>
              ) : (
                <span className="text-amber-400">Sta rispondendo...</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
