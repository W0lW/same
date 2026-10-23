import React, { useState } from 'react';
import { Sparkles, Clock, Lock, Send, CheckCircle } from 'lucide-react';
import { RoundState, PlayerProfile } from '../../types/game';
import { CyberKitten } from '../mascots/CyberKitten';
import { sounds } from '../../audio/soundEffects';

interface SameBrainRoundProps {
  round: RoundState;
  myPlayer: PlayerProfile | null;
  otherPlayer: PlayerProfile | null;
  onSubmitAnswer: (answer: string) => Promise<boolean>;
}

export const SameBrainRound: React.FC<SameBrainRoundProps> = ({
  round,
  myPlayer,
  otherPlayer,
  onSubmitAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myId = myPlayer?.id || '';
  const otherId = otherPlayer?.id || '';
  const hasMySubmitted = round.submissions[myId]?.hasSubmitted ?? false;
  const hasOtherSubmitted = round.submissions[otherId]?.hasSubmitted ?? false;

  const handleSelectOption = (opt: string) => {
    if (hasMySubmitted) return;
    setSelectedOption(opt);
    sounds.playClick();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const answer = round.catalogItem.allowCustom && customText.trim() 
      ? customText.trim() 
      : selectedOption;

    if (!answer || hasMySubmitted || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onSubmitAnswer(answer);
    setIsSubmitting(false);
  };

  const isLowTime = round.remainingSeconds <= 5;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-3xl mx-auto w-full relative z-10">
      {/* Round & Mode Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-950/70 border border-purple-500/40 text-purple-200">
            ROUND {round.roundNumber} / {round.totalRounds}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/60 border border-slate-700 text-slate-300">
            SAME BRAIN
          </span>
        </div>

        {/* Server Authoritative Timer */}
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

      {/* Wild Event Banner if active */}
      {round.activeWildEvent && (
        <div className="w-full mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-sky-950/40 border border-amber-500/40 flex items-center justify-between text-xs text-amber-200 animate-pulse-glow">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-bold">{round.activeWildEvent.name}:</span>
            <span className="text-amber-100/90">{round.activeWildEvent.description}</span>
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="w-full p-6 sm:p-8 rounded-3xl glass-panel-glow border-purple-500/30 text-center mb-6 relative overflow-hidden">
        <span className="text-[11px] font-mono uppercase tracking-widest text-purple-300/80 mb-2 block">
          INTUIZIONE SIMULTANEA
        </span>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 leading-snug">
          {round.catalogItem.prompt}
        </h2>
        {round.catalogItem.subtext && (
          <p className="text-xs text-purple-200/70 mt-2 italic">
            {round.catalogItem.subtext}
          </p>
        )}
      </div>

      {/* Options or Custom Input Area */}
      {!hasMySubmitted ? (
        <div className="w-full space-y-3 mb-6">
          {round.catalogItem.options && round.catalogItem.options.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {round.catalogItem.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-2xl border text-left text-sm font-semibold transition-all cursor-pointer ${
                    selectedOption === opt
                      ? 'bg-purple-600/40 border-purple-400 text-white shadow-lg shadow-purple-500/20 scale-[1.01]'
                      : 'glass-panel hover:bg-slate-800/60 border-slate-700/60 text-slate-200'
                  }`}
                >
                  <span className="inline-block w-6 text-xs text-purple-400 font-mono font-bold">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          ) : null}

          {/* Custom text field if allowed */}
          {round.catalogItem.allowCustom && (
            <div className="mt-4">
              <input
                type="text"
                maxLength={80}
                placeholder="Scrivi qui la tua risposta..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/40 focus:border-purple-300 focus:outline-none text-slate-100 text-sm shadow-inner"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => handleSubmit()}
              disabled={(!selectedOption && !customText.trim()) || isSubmitting}
              className="w-full py-4 rounded-2xl glass-button-primary font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 shadow-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Invio in corso...' : 'Invia Risposta Segreta 🔒'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Waiting Lock-In State */
        <div className="w-full p-6 rounded-3xl glass-panel border-emerald-500/30 text-center mb-6 animate-pulse-glow">
          <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-center mx-auto mb-3 text-emerald-400">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-emerald-200 mb-1">
            Risposta Inviata & Protetta!
          </h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            La tua scelta è custodita in segreto. Non appena il tuo partner invierà la sua, scoprirete se siete sulla stessa lunghezza d'onda!
          </p>
        </div>
      )}

      {/* Both Players Live Submission Status */}
      <div className="w-full grid grid-cols-2 gap-4 max-w-lg">
        {/* You */}
        <div className="p-3.5 rounded-2xl glass-panel border-slate-700/60 flex items-center space-x-3">
          <CyberKitten
            type={myPlayer?.mascot || 'lumi'}
            expression={hasMySubmitted ? 'happy' : 'curious'}
            accessory={myPlayer?.accessory}
            size="sm"
          />
          <div className="text-left flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{myPlayer?.name} (Tu)</p>
            <p className="text-[11px] font-semibold flex items-center space-x-1 mt-0.5">
              {hasMySubmitted ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Risposto
                </span>
              ) : (
                <span className="text-amber-400">Sta pensando...</span>
              )}
            </p>
          </div>
        </div>

        {/* Opponent */}
        <div className="p-3.5 rounded-2xl glass-panel border-slate-700/60 flex items-center space-x-3">
          <CyberKitten
            type={otherPlayer?.mascot || 'nova'}
            expression={hasOtherSubmitted ? 'smug' : 'curious'}
            accessory={otherPlayer?.accessory}
            size="sm"
          />
          <div className="text-left flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{otherPlayer?.name || 'Partner'}</p>
            <p className="text-[11px] font-semibold flex items-center space-x-1 mt-0.5">
              {hasOtherSubmitted ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Ha risposto!
                </span>
              ) : (
                <span className="text-amber-400">Sta pensando...</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
