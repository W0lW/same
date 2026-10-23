import React, { useState } from 'react';
import { X, LogIn, Sparkles } from 'lucide-react';
import { MascotType, MascotAccessory } from '../../types/game';
import { CyberKitten } from '../mascots/CyberKitten';
import { sounds } from '../../audio/soundEffects';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string, name: string, mascot: MascotType, accessory: MascotAccessory) => Promise<boolean>;
  isLoading?: boolean;
  defaultCode?: string;
}

const ACCESSORIES: { id: MascotAccessory; label: string }[] = [
  { id: 'none', label: 'Nessuno' },
  { id: 'neon_headphones', label: 'Headphones' },
  { id: 'cyber_visor', label: 'Cyber Visor' },
  { id: 'star_clip', label: 'Star Clip' },
  { id: 'halo', label: 'Cyber Halo' },
  { id: 'angel_wings', label: 'Holo Wings' },
  { id: 'bell_collar', label: 'Bell Collar' },
];

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  defaultCode = '',
}) => {
  const [roomCode, setRoomCode] = useState(defaultCode);
  const [nickname, setNickname] = useState('');
  const [mascot, setMascot] = useState<MascotType>('nova');
  const [accessory, setAccessory] = useState<MascotAccessory>('neon_headphones');
  const [joinError, setJoinError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setJoinError('Inserisci il codice della stanza.');
      return;
    }
    setJoinError(null);
    sounds.playClick();
    const success = await onSubmit(
      roomCode.trim().toUpperCase(),
      nickname.trim() || 'Giocatore 2',
      mascot,
      accessory
    );
    if (!success) {
      setJoinError('Codice non valido o stanza già piena.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 text-slate-100 relative shadow-2xl border-purple-500/30">
        <button
          onClick={onClose}
          aria-label="Chiudi finestra"
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-purple-600 flex items-center justify-center shadow-lg">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold bg-gradient-to-r from-sky-200 to-purple-200 bg-clip-text text-transparent">
              Entra nella Stanza
            </h2>
            <p className="text-xs text-purple-300/80">Inserisci il codice a 6 caratteri condiviso dal partner</p>
          </div>
        </div>

        {joinError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs">
            {typeof joinError === 'string' ? joinError : JSON.stringify(joinError)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Code */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Codice Stanza
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="es. WAVE88"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-2xl bg-slate-900/70 border border-purple-500/40 focus:border-sky-400 focus:outline-none text-sky-200 text-center font-mono font-bold tracking-widest text-lg uppercase transition-all shadow-inner placeholder-slate-600"
            />
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Il tuo Nickname
            </label>
            <input
              type="text"
              required
              maxLength={20}
              placeholder="es. Nova, Luna, Sam..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-900/70 border border-slate-700 focus:border-purple-400 focus:outline-none text-slate-100 placeholder-slate-500 text-sm transition-all"
            />
          </div>

          {/* Mascot Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Scegli la tua Mascotte
            </label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => {
                  setMascot('nova');
                  sounds.playClick();
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center transition-all ${
                  mascot === 'nova'
                    ? 'bg-purple-950/50 border-purple-400 shadow-lg shadow-purple-500/20 scale-[1.02]'
                    : 'bg-slate-900/40 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <CyberKitten type="nova" accessory={mascot === 'nova' ? accessory : 'none'} size="md" isFloating={mascot === 'nova'} />
                <span className="mt-2 text-xs font-bold text-purple-200">NOVA</span>
                <span className="text-[10px] text-slate-400">Cosmic Lavender</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMascot('lumi');
                  sounds.playClick();
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center transition-all ${
                  mascot === 'lumi'
                    ? 'bg-sky-950/50 border-sky-400 shadow-lg shadow-sky-500/20 scale-[1.02]'
                    : 'bg-slate-900/40 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <CyberKitten type="lumi" accessory={mascot === 'lumi' ? accessory : 'none'} size="md" isFloating={mascot === 'lumi'} />
                <span className="mt-2 text-xs font-bold text-sky-200">LUMI</span>
                <span className="text-[10px] text-slate-400">Ice Cyber</span>
              </button>
            </div>
          </div>

          {/* Accessory Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Accessorio
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ACCESSORIES.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    setAccessory(acc.id);
                    sounds.playClick();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    accessory === acc.id
                      ? 'bg-sky-500/30 border-sky-400 text-sky-100 font-bold'
                      : 'bg-slate-900/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl glass-button-primary font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Connessione...' : 'Entra nella Lobby'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
