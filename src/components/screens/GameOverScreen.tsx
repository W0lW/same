import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Sparkles, Heart, Brain, Zap, Award } from 'lucide-react';
import { RoomState, PlayerProfile } from '../../types/game';
import { CyberKitten } from '../mascots/CyberKitten';
import { sounds } from '../../audio/soundEffects';

interface GameOverScreenProps {
  room: RoomState;
  myPlayer: PlayerProfile | null;
  otherPlayer: PlayerProfile | null;
  onRematch: () => Promise<void>;
  onHome: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  room,
  myPlayer,
  otherPlayer,
  onRematch,
  onHome,
}) => {
  useEffect(() => {
    sounds.playMatch();
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }
  }, []);

  const wavelength = room.stats.wavelengthScore;

  // Derive archetype badge
  let archetypeTitle = 'Telepathic Duo ✨';
  let archetypeDesc = 'La vostra sinergia supera i confini dello spazio-tempo! Risposte sincronizzate e complicità ad altissima frequenza.';
  if (wavelength >= 90) {
    archetypeTitle = 'Risonanza Quantica Perfetta 🌌';
    archetypeDesc = 'Siete praticamente una mente sola divisa in due corpi. Pensate all\'unisono!';
  } else if (wavelength >= 80) {
    archetypeTitle = 'Cosmic Partners in Crime 🚀';
    archetypeDesc = 'Grande intuito reciproco con la giusta dose di imprevedibilità che rende tutto divertente.';
  } else if (wavelength >= 65) {
    archetypeTitle = 'Galassie Curiosissime 🔮';
    archetypeDesc = 'Due mondi affascinanti che si scoprono a vicenda. Tante sorprese e ottima chimica!';
  } else {
    archetypeTitle = 'Spiriti Caotici & Imprevedibili ⚡';
    archetypeDesc = 'Impossibile prevedervi! La vostra bellezza sta proprio nei colpi di scena continui.';
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full text-center relative z-10 animate-fade-in">
      <div className="mb-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full holo-tag mb-3">
          <Trophy className="w-4 h-4 text-yellow-300" />
          <span className="text-xs font-mono font-bold tracking-wider text-purple-200 uppercase">
            PARTITA COMPLETATA
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white mb-2">
          SAME WAVELENGTH REPORT
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          Ecco il resoconto cosmico della vostra connessione e delle vostre sfide.
        </p>
      </div>

      {/* Mascots Celebrating */}
      <div className="flex items-center justify-center space-x-8 mb-6">
        <CyberKitten
          type={myPlayer?.mascot || 'lumi'}
          expression="excited"
          accessory={myPlayer?.accessory}
          size="lg"
          isFloating
        />
        <div className="flex flex-col items-center">
          <span className="text-4xl sm:text-6xl font-display font-extrabold bg-gradient-to-r from-sky-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            {wavelength}%
          </span>
          <span className="text-[11px] font-mono tracking-widest text-purple-300 uppercase font-bold mt-1">
            WAVELENGTH SYNCH
          </span>
        </div>
        <CyberKitten
          type={otherPlayer?.mascot || 'nova'}
          expression="excited"
          accessory={otherPlayer?.accessory}
          size="lg"
          isFloating
        />
      </div>

      {/* Archetype Card */}
      <div className="w-full p-6 rounded-3xl glass-panel-glow border-purple-500/40 text-center mb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold block mb-1">
          IL VOSTRO ARCHETIPO DI COPPIA
        </span>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 mb-2">
          {archetypeTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          {archetypeDesc}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-8">
        <div className="p-3.5 rounded-2xl glass-panel text-center">
          <Brain className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-100">{room.stats.totalMatches}</p>
          <span className="text-[10px] text-slate-400 uppercase font-mono">Match Perfetti</span>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel text-center">
          <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-100">{room.stats.bluffsSucceeded}</p>
          <span className="text-[10px] text-slate-400 uppercase font-mono">Bluff Riusciti</span>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel text-center">
          <Sparkles className="w-4 h-4 text-sky-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-100">{room.stats.bluffsBusted}</p>
          <span className="text-[10px] text-slate-400 uppercase font-mono">Bluff Scoperti</span>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel text-center">
          <Award className="w-4 h-4 text-pink-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-100">
            {Math.max(myPlayer?.score || 0, otherPlayer?.score || 0)} pt
          </p>
          <span className="text-[10px] text-slate-400 uppercase font-mono">Punteggio Top</span>
        </div>
      </div>

      {/* Actions: Rematch or New Game */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
        <button
          onClick={() => {
            sounds.playClick();
            onRematch();
          }}
          className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl glass-button-primary font-bold text-sm sm:text-base tracking-wide text-white flex items-center justify-center space-x-2 shadow-xl cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Rivincita Immediata! 🔄</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onHome();
          }}
          className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl glass-panel hover:bg-slate-800/60 font-bold text-sm sm:text-base tracking-wide text-purple-200 border border-purple-500/40 flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Nuova Stanza</span>
        </button>
      </div>
    </div>
  );
};
