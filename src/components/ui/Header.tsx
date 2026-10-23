import React, { useState } from 'react';
import { Volume2, VolumeX, Bell, BellOff, Copy, Check, LogOut, HelpCircle, Sparkles, Server } from 'lucide-react';
import { sounds } from '../../audio/soundEffects';

interface HeaderProps {
  roomCode?: string;
  isConnected?: boolean;
  isBackendUnreachable?: boolean;
  onLeaveRoom?: () => void;
  onOpenHelp?: () => void;
  onOpenBackendConfig?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomCode,
  isConnected = true,
  isBackendUnreachable = false,
  onLeaveRoom,
  onOpenHelp,
  onOpenBackendConfig,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [copied, setCopied] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const toggleMute = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
    if (!next) sounds.playClick();
  };

  const requestNotifications = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationsGranted(perm === 'granted');
        if (perm === 'granted') {
          new Notification('SAME WAVELENGTH ✨', {
            body: 'Notifiche push attive! Ti avviseremo quando il partner risponde.',
          });
        }
      } catch {
        // restricted
      }
    }
  };

  const copyRoomCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-3 flex items-center justify-between z-40">
      {/* Brand & Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-sky-400 p-[1px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#0c0d1d] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
            </div>
          </div>
          <span className="font-display font-extrabold tracking-tight text-lg sm:text-xl bg-gradient-to-r from-purple-200 via-pink-200 to-sky-200 bg-clip-text text-transparent">
            SAME WAVELENGTH
          </span>
        </div>

        {roomCode && (
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{isConnected ? 'Sincronizzato' : 'Riconnessione...'}</span>
          </div>
        )}
      </div>

      {/* Room code & Controls */}
      <div className="flex items-center space-x-2">
        {roomCode && (
          <button
            onClick={copyRoomCode}
            aria-label="Copia codice stanza"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 hover:bg-purple-900/60 transition-colors text-xs font-mono font-bold tracking-wider shadow-sm"
          >
            <span>{roomCode}</span>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
          </button>
        )}

        {/* Audio Toggle */}
        <button
          onClick={toggleMute}
          aria-label={isMuted ? 'Riattiva audio' : 'Disattiva audio'}
          className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-purple-300" />}
        </button>

        {/* Notification Push Toggle */}
        <button
          onClick={requestNotifications}
          aria-label="Attiva notifiche push in tempo reale"
          title={notificationsGranted ? 'Notifiche attive' : 'Clicca per attivare notifiche in tempo reale'}
          className={`p-2 rounded-xl border transition-colors ${
            notificationsGranted 
              ? 'bg-purple-950/50 border-purple-500/50 text-purple-300' 
              : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          {notificationsGranted ? <Bell className="w-4 h-4 text-sky-300" /> : <BellOff className="w-4 h-4" />}
        </button>

        {/* Server Config / Backend Status */}
        {onOpenBackendConfig && (
          <button
            onClick={onOpenBackendConfig}
            aria-label="Configurazione Server Multiplayer"
            title={isBackendUnreachable ? 'Backend non raggiungibile (clicca per configurare)' : 'Configurazione Server Multiplayer'}
            className={`p-2 rounded-xl border transition-all ${
              isBackendUnreachable
                ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Server className="w-4 h-4" />
          </button>
        )}

        {/* Help */}
        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            aria-label="Come si gioca"
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        {/* Leave Room */}
        {roomCode && onLeaveRoom && (
          <button
            onClick={onLeaveRoom}
            aria-label="Esci dalla stanza"
            className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
