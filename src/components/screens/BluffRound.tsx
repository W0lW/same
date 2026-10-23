import React, { useState } from 'react';
import { Eye, Clock, ShieldAlert, Send, Lock, CheckCircle, Sparkles } from 'lucide-react';
import { RoundState, PlayerProfile } from '../../types/game';
import { CyberKitten } from '../mascots/CyberKitten';
import { sounds } from '../../audio/soundEffects';

interface BluffRoundProps {
  round: RoundState;
  myPlayer: PlayerProfile | null;
  otherPlayer: PlayerProfile | null;
  onSubmitAnswer: (answer: string) => Promise<boolean>;
}

export const BluffRound: React.FC<BluffRoundProps> = ({
  round,
  myPlayer,
  otherPlayer,
  onSubmitAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myId = myPlayer?.id || '';
  const isBluffer = round.blufferId === myId;
  const hasMySubmitted = round.submissions[myId]?.hasSubmitted ?? false;
  const hasOtherSubmitted = otherPlayer ? round.submissions[otherPlayer.id]?.hasSubmitted ?? false : false;

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
      {/* Round & Mode Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-950/70 border border-sky-500/40 text-sky-200">
            ROUND {round.roundNumber} / {round.totalRounds}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/60 border border-slate-700 text-slate-300 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            BLUFF MODE
          </span>
        </div>

        {/* Server Timer */}
        <div
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold transition-colors ${
            isLowTime
              ? 'bg-rose-950/70 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-900/70 border-slate-700 text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{round.remainingSeconds}s</span>
        </div>
      </div>

      {/* Role Banner */}
      <div
        className={`w-full p-4 rounded-2xl mb-5 flex items-center justify-between border ${
          isBluffer
            ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
            : 'bg-sky-950/40 border-sky-500/40 text-sky-200'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-white/20 flex items-center justify-center">
            {isBluffer ? (
              <CyberKitten type={myPlayer?.mascot || 'lumi'} expression="bluffing" size="sm" />
            ) : (
              <CyberKitten type={myPlayer?.mascot || 'nova'} expression="surprised" size="sm" />
            )}
          </div>
          <div className="text-left">
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-80">Il tuo ruolo in questo round:</span>
            <h3 className="font-display text-sm font-extrabold">
              {isBluffer ? '🎭 IL BLUFFATORE' : '🔍 IL DETECTIVE'}
            </h3>
            <p className="text-xs text-slate-300">
              {isBluffer
                ? 'Scegli la tua autentica verità! Se il Detective sbaglia, prendi tu tutti i punti.'
                : 'Indovina quale tra queste opzioni è la VERA autentica scelta del tuo partner!'}
            </p>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="w-full p-6 sm:p-8 rounded-3xl glass-panel-glow border-sky-500/30 text-center mb-6">
        <span className="text-[11px] font-mono uppercase tracking-widest text-sky-300/80 mb-2 block">
          DEDUZIONE & PSICOLOGIA
        </span>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 leading-snug">
          {round.catalogItem.prompt}
        </h2>
      </div>

      {/* Options */}
      {!hasMySubmitted ? (
        <div className="w-full space-y-3 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {round.catalogItem.options?.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`p-4 rounded-2xl border text-left text-sm font-semibold transition-all cursor-pointer ${
                  selectedOption === opt
                    ? 'bg-sky-600/40 border-sky-400 text-white shadow-lg shadow-sky-500/20 scale-[1.01]'
                    : 'glass-panel hover:bg-slate-800/60 border-slate-700/60 text-slate-200'
                }`}
              >
                <span className="inline-block w-6 text-xs text-sky-400 font-mono font-bold">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={!selectedOption || isSubmitting}
              className="w-full py-4 rounded-2xl glass-button-primary font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 shadow-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Invio in corso...'
                  : isBluffer
                  ? 'Conferma Verità Segreta 🔒'
                  : 'Scommetti su Questa Risposta 🔍'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Lock-in State */
        <div className="w-full p-6 rounded-3xl glass-panel border-sky-500/30 text-center mb-6 animate-pulse-glow">
          <div className="w-12 h-12 rounded-full bg-sky-950/80 border border-sky-400/50 flex items-center justify-center mx-auto mb-3 text-sky-400">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-sky-200 mb-1">
            Scelta Inviata!
          </h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            {isBluffer
              ? 'Il Detective sta analizzando le opzioni per smascherarti... Resisterà il tuo bluff?'
              : 'Ipotesi formulata! Stiamo per verificare se hai smascherato il compagno!'}
          </p>
        </div>
      )}

      {/* Players status */}
      <div className="w-full grid grid-cols-2 gap-4 max-w-lg">
        <div className="p-3.5 rounded-2xl glass-panel border-slate-700/60 flex items-center space-x-3">
          <CyberKitten
            type={myPlayer?.mascot || 'lumi'}
            expression={hasMySubmitted ? 'smug' : 'curious'}
            accessory={myPlayer?.accessory}
            size="sm"
          />
          <div className="text-left flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{myPlayer?.name} (Tu)</p>
            <p className="text-[11px] font-semibold mt-0.5">
              {hasMySubmitted ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Scelta fatta
                </span>
              ) : (
                <span className="text-amber-400">In decisione...</span>
              )}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel border-slate-700/60 flex items-center space-x-3">
          <CyberKitten
            type={otherPlayer?.mascot || 'nova'}
            expression={hasOtherSubmitted ? 'bluffing' : 'curious'}
            accessory={otherPlayer?.accessory}
            size="sm"
          />
          <div className="text-left flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{otherPlayer?.name || 'Partner'}</p>
            <p className="text-[11px] font-semibold mt-0.5">
              {hasOtherSubmitted ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Scelta fatta
                </span>
              ) : (
                <span className="text-amber-400">In decisione...</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
