import React from 'react';
import { X, Sparkles, Brain, Eye, Zap, Heart, ShieldCheck } from 'lucide-react';
import { CyberKitten } from '../mascots/CyberKitten';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 text-slate-100 relative shadow-2xl border-purple-500/30">
        <button
          onClick={onClose}
          aria-label="Chiudi guida"
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-sky-400 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-sky-200 bg-clip-text text-transparent">
              Come si gioca a SAME WAVELENGTH
            </h2>
            <p className="text-xs text-purple-300/80">Il party game per due persone mentre siete in chiamata vocale</p>
          </div>
        </div>

        {/* Mascots mini intro */}
        <div className="flex items-center justify-around p-4 rounded-2xl bg-slate-900/50 border border-purple-500/20 mb-6">
          <div className="flex items-center space-x-3">
            <CyberKitten type="lumi" expression="excited" accessory="cyber_visor" size="sm" isFloating />
            <div>
              <p className="text-xs font-bold text-sky-300">LUMI</p>
              <p className="text-[11px] text-slate-400">Cyber cat di ghiaccio & intuito</p>
            </div>
          </div>
          <div className="text-slate-600 font-bold text-sm">✕</div>
          <div className="flex items-center space-x-3">
            <CyberKitten type="nova" expression="heart_eyes" accessory="neon_headphones" size="sm" isFloating />
            <div>
              <p className="text-xs font-bold text-purple-300">NOVA</p>
              <p className="text-[11px] text-slate-400">Cosmic cat di lavanda & complicità</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-slate-300">
          {/* Mode 1 */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-700/50 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center space-x-2.5 mb-1.5 text-purple-300 font-bold">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>1. SAME BRAIN — Intuizione Simultanea</span>
            </div>
            <p className="text-xs text-slate-300">
              Entrambi ricevete la stessa domanda e rispondete in segreto. Quando entrambi inviate la scelta, le risposte vengono svelate simultaneamente. Se siete sulla stessa lunghezza d'onda, i punti volano!
            </p>
          </div>

          {/* Mode 2 */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-700/50 hover:border-sky-500/40 transition-colors">
            <div className="flex items-center space-x-2.5 mb-1.5 text-sky-300 font-bold">
              <Eye className="w-4 h-4 text-sky-400" />
              <span>2. BLUFF MODE — Verità o Inganno</span>
            </div>
            <p className="text-xs text-slate-300">
              Un giocatore è il <strong>Bluffatore</strong> e nasconde la sua scelta reale in mezzo a risposte esilaranti. L'altro è il <strong>Detective</strong> e deve dedurre quale opzione è autentica.
            </p>
          </div>

          {/* Mode 3 */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-700/50 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center space-x-2.5 mb-1.5 text-amber-300 font-bold">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>3. CHAOS ROUND & WILD EVENTS</span>
            </div>
            <p className="text-xs text-slate-300">
              Sfide lampo da 20-30 secondi ed eventi imprevisti come <em>Double Points</em>, <em>Role Reversal</em> o <em>Quick Chaos</em> che rimescolano le carte in tavola.
            </p>
          </div>

          {/* Mode 4: Special */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 to-purple-950/40 border border-pink-500/30">
            <div className="flex items-center space-x-2.5 mb-1.5 text-pink-300 font-bold">
              <Heart className="w-4 h-4 text-pink-400" />
              <span>4. SECRET CHEMISTRY — Momento Speciale</span>
            </div>
            <p className="text-xs text-slate-300">
              A sorpresa, a metà partita, si attiva la modalità cinematografica. Viene posta una domanda di sintonia («La persona con cui stai giocando ti piace?»). Le risposte sono rigidamente private fino alla rivelazione sincronizzata. Nessuna penalità, nessun punteggio forzato: solo autenticità e reazioni uniche delle mascotte!
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Privacy garantita: il server nasconde le scelte fino alla rivelazione autorizzata. Nessuna registrazione né account obbligatorio.</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl glass-button-primary font-bold text-sm tracking-wide text-white cursor-pointer"
          >
            Capito, Giochiamo! ✨
          </button>
        </div>
      </div>
    </div>
  );
};
