import React, { useState } from 'react';
import { Copy, Check, Play, Sparkles, UserPlus, CheckCircle2, Circle } from 'lucide-react';
import { RoomState, PlayerProfile } from '../../types/game';
import { CyberKitten } from '../mascots/CyberKitten';
import { sounds } from '../../audio/soundEffects';

interface LobbyScreenProps {
  room: RoomState;
  myPlayer: PlayerProfile | null;
  otherPlayer: PlayerProfile | null;
  isHost: boolean;
  onToggleReady: () => Promise<void>;
  onStartGame: () => Promise<boolean>;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  room,
  myPlayer,
  otherPlayer,
  isHost,
  onToggleReady,
  onStartGame,
}) => {
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const copyInviteLink = () => {
    const url = `${window.location.origin}?join=${room.roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    setIsStarting(true);
    sounds.playClick();
    const success = await onStartGame();
    if (!success) {
      setIsStarting(false);
    }
  };

  const isBothReady = myPlayer?.isReady && otherPlayer?.isReady;
  const canStart = isHost && otherPlayer && isBothReady;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-4xl mx-auto w-full text-center relative z-10">
      {/* Lobby Header */}
      <div className="mb-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full holo-tag mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-purple-200 tracking-wider uppercase font-mono">
            DIGITAL LOBBY // STANZA {room.roomCode}
          </span>
        </div>
        <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-100">
          In attesa dei giocatori
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Condividi il codice con il tuo partner per sincronizzare la partita.
        </p>
      </div>

      {/* Share Box */}
      <div className="w-full max-w-md p-4 rounded-2xl glass-panel-glow border-purple-500/30 mb-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-left">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Codice Univoco</span>
          <p className="text-xl font-mono font-extrabold tracking-widest text-sky-200">{room.roomCode}</p>
        </div>
        <button
          onClick={copyInviteLink}
          aria-label="Copia link d'invito"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl glass-button text-xs font-bold text-purple-200 flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
          <span>{copied ? 'Link Copiato!' : 'Copia Link d\'Invito'}</span>
        </button>
      </div>

      {/* Player Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mb-8">
        {/* Player 1 (You) */}
        <div className="p-6 rounded-3xl glass-panel border-purple-500/30 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950/70 border border-purple-500/30 text-purple-300">
            {myPlayer?.isHost ? 'HOST' : 'GIOCATORE'} (TU)
          </div>

          <div className="my-3">
            <CyberKitten
              type={myPlayer?.mascot || 'lumi'}
              expression="happy"
              accessory={myPlayer?.accessory || 'cyber_visor'}
              size="lg"
              isFloating
            />
          </div>

          <h3 className="font-display text-lg font-bold text-slate-100 mb-1">{myPlayer?.name}</h3>
          
          <div className="flex items-center space-x-1.5 text-xs mb-4">
            {myPlayer?.isReady ? (
              <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pronto al decollo</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                <Circle className="w-4 h-4" />
                <span>In attesa di conferma</span>
              </span>
            )}
          </div>

          <button
            onClick={onToggleReady}
            aria-label="Modifica stato di preparazione"
            className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
              myPlayer?.isReady
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
                : 'glass-button-primary text-white shadow-lg shadow-purple-500/20'
            }`}
          >
            {myPlayer?.isReady ? 'Annulla Pronto' : 'Sono Pronto! ✨'}
          </button>
        </div>

        {/* Player 2 */}
        {otherPlayer ? (
          <div className="p-6 rounded-3xl glass-panel border-sky-500/30 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-950/70 border border-sky-500/30 text-sky-300">
              {otherPlayer.isHost ? 'HOST' : 'PARTNER'}
            </div>

            <div className="my-3">
              <CyberKitten
                type={otherPlayer.mascot}
                expression="curious"
                accessory={otherPlayer.accessory}
                size="lg"
                isFloating
              />
            </div>

            <h3 className="font-display text-lg font-bold text-slate-100 mb-1">{otherPlayer.name}</h3>

            <div className="flex items-center space-x-1.5 text-xs mb-4">
              {otherPlayer.isReady ? (
                <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pronto al decollo</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                  <Circle className="w-4 h-4" />
                  <span>Sta scegliendo...</span>
                </span>
              )}
            </div>

            <div className="w-full py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-slate-400 text-xs font-semibold">
              {otherPlayer.connected ? 'Connesso' : 'Disconnesso temporaneamente'}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl glass-panel border-dashed border-slate-700 flex flex-col items-center justify-center min-h-[280px]">
            <div className="w-16 h-16 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center mb-3 text-slate-500 animate-pulse">
              <UserPlus className="w-8 h-8" />
            </div>
            <h3 className="font-display text-base font-bold text-slate-300 mb-1">
              Slot Giocatore 2 Vuoto
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mb-3">
              Condividi il codice <strong>{room.roomCode}</strong> per far entrare il tuo compagno di gioco.
            </p>
          </div>
        )}
      </div>

      {/* Start Game Action */}
      <div className="w-full max-w-md">
        {isHost ? (
          <button
            onClick={handleStart}
            disabled={!canStart || isStarting}
            className="w-full py-4 rounded-2xl glass-button-primary font-bold text-base tracking-wide text-white flex items-center justify-center space-x-2.5 shadow-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>
              {isStarting
                ? 'Avvio in corso...'
                : !otherPlayer
                ? 'In attesa del secondo giocatore...'
                : !isBothReady
                ? 'In attesa che entrambi siano pronti'
                : 'Avvia Partita! 🚀'}
            </span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300 flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>
              {!otherPlayer?.isReady
                ? 'In attesa dell\'Host per l\'avvio della partita...'
                : 'L\'Host avvierà la partita tra pochi istanti!'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
