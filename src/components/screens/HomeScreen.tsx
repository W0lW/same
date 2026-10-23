import React, { useState, useEffect } from 'react';
import { Sparkles, Users, KeyRound, HelpCircle, Heart, Zap, Brain, Shield } from 'lucide-react';
import { CyberKitten } from '../mascots/CyberKitten';
import { sounds } from '../../audio/soundEffects';

interface HomeScreenProps {
  onCreateRoomClick: () => void;
  onJoinRoomClick: () => void;
  onHowToPlayClick: () => void;
  autostart?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onCreateRoomClick,
  onJoinRoomClick,
  onHowToPlayClick,
  autostart = false,
}) => {
  // If ?autostart=1 is present, automatically trigger room creation after mount
  useEffect(() => {
    if (autostart) {
      const timer = setTimeout(() => {
        onCreateRoomClick();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autostart, onCreateRoomClick]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full text-center relative z-10">
      {/* Soft floating background decorative elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Mascots Display */}
      <div className="flex items-center justify-center space-x-6 sm:space-x-12 mb-6">
        <div className="flex flex-col items-center">
          <CyberKitten
            type="lumi"
            expression="happy"
            accessory="cyber_visor"
            size="lg"
            isFloating
          />
          <span className="mt-2 text-xs font-bold tracking-widest text-sky-300 font-mono">
            LUMI // 01
          </span>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500/30 to-pink-500/30 border border-purple-400/40 flex items-center justify-center backdrop-blur-md shadow-lg animate-pulse-glow">
            <Sparkles className="w-6 h-6 text-pink-300" />
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-purple-300/80 mt-1 font-semibold">
            SYNCHRONY
          </span>
        </div>

        <div className="flex flex-col items-center">
          <CyberKitten
            type="nova"
            expression="excited"
            accessory="neon_headphones"
            size="lg"
            isFloating
          />
          <span className="mt-2 text-xs font-bold tracking-widest text-purple-300 font-mono">
            NOVA // 02
          </span>
        </div>
      </div>

      {/* Title & Tagline */}
      <div className="max-w-2xl mb-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full holo-tag mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold text-purple-200 tracking-wide uppercase">
            Party Game Online per 2 Giocatori
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-100 via-pink-100 to-sky-100 bg-clip-text text-transparent drop-shadow-sm mb-4 leading-tight">
          SAME WAVELENGTH
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
          Scoprite se siete sulla stessa lunghezza d'onda mentre siete in chiamata vocale. Tra intuizione simultanea, bluff, sfide caotiche e l'evento speciale <em>Secret Chemistry</em>.
        </p>
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-10">
        <button
          onClick={() => {
            sounds.playClick();
            onCreateRoomClick();
          }}
          className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl glass-button-primary font-bold text-sm sm:text-base tracking-wide text-white flex items-center justify-center space-x-2.5 shadow-xl cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-yellow-200" />
          <span>Crea Stanza Privata</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onJoinRoomClick();
          }}
          className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl glass-panel hover:bg-slate-800/60 font-bold text-sm sm:text-base tracking-wide text-purple-200 border border-purple-500/40 flex items-center justify-center space-x-2.5 transition-all shadow-md cursor-pointer"
        >
          <KeyRound className="w-5 h-5 text-sky-400" />
          <span>Entra con Codice</span>
        </button>
      </div>

      {/* Mode highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl mb-8">
        <div className="p-3.5 rounded-2xl glass-panel text-left border-purple-500/20">
          <Brain className="w-4 h-4 text-purple-400 mb-1.5" />
          <h2 className="text-xs font-bold text-slate-200">SAME BRAIN</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Scelte simultanee segrete</p>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel text-left border-sky-500/20">
          <Zap className="w-4 h-4 text-sky-400 mb-1.5" />
          <h2 className="text-xs font-bold text-slate-200">BLUFF MODE</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Smaschera l'inganno</p>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel text-left border-amber-500/20">
          <Sparkles className="w-4 h-4 text-amber-400 mb-1.5" />
          <h2 className="text-xs font-bold text-slate-200">CHAOS ROUND</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Sfide lampo da 25s</p>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel text-left border-pink-500/30 bg-pink-950/20">
          <Heart className="w-4 h-4 text-pink-400 mb-1.5" />
          <h2 className="text-xs font-bold text-pink-200">SECRET CHEMISTRY</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Momento speciale privato</p>
        </div>
      </div>

      {/* How to play trigger */}
      <button
        onClick={() => {
          sounds.playClick();
          onHowToPlayClick();
        }}
        className="inline-flex items-center space-x-1.5 text-xs text-purple-300 hover:text-purple-100 transition-colors font-medium cursor-pointer"
      >
        <HelpCircle className="w-4 h-4" />
        <span>Come funziona e regole del gioco</span>
      </button>
    </div>
  );
};
