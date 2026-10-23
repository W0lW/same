import React, { useState } from 'react';
import { X, Sparkles, Heart, Shield, Settings2 } from 'lucide-react';
import { MascotType, MascotAccessory } from '../../types/game';
import { CyberKitten } from '../mascots/CyberKitten';
import { sounds } from '../../audio/soundEffects';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, mascot: MascotType, accessory: MascotAccessory, settings: any) => Promise<void>;
  isLoading?: boolean;
}

const ACCESSORIES: { id: MascotAccessory; label: string }[] = [
  { id: 'none', label: 'Nessuno' },
  { id: 'cyber_visor', label: 'Cyber Visor' },
  { id: 'neon_headphones', label: 'Headphones' },
  { id: 'star_clip', label: 'Star Clip' },
  { id: 'halo', label: 'Cyber Halo' },
  { id: 'angel_wings', label: 'Holo Wings' },
  { id: 'bell_collar', label: 'Bell Collar' },
];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [nickname, setNickname] = useState('');
  const [mascot, setMascot] = useState<MascotType>('lumi');
  const [accessory, setAccessory] = useState<MascotAccessory>('cyber_visor');
  const [rounds, setRounds] = useState<number>(10);
  const [allowSecretChemistry, setAllowSecretChemistry] = useState(true);
  const [includeNegativeOption, setIncludeNegativeOption] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    onSubmit(nickname.trim() || 'Giocatore 1', mascot, accessory, {
      totalRounds: rounds,
      allowSecretChemistry,
      includeNegativeOption,
    });
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
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-sky-400 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold bg-gradient-to-r from-purple-200 to-sky-200 bg-clip-text text-transparent">
              Crea Stanza Privata
            </h2>
            <p className="text-xs text-purple-300/80">Genera una stanza con codice univoco per due giocatori</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nickname */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Il tuo Nickname
            </label>
            <input
              type="text"
              required
              maxLength={20}
              placeholder="es. Astra, Cosmo, Alex..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-900/70 border border-slate-700 focus:border-purple-400 focus:outline-none text-slate-100 placeholder-slate-500 text-sm transition-all shadow-inner"
            />
          </div>

          {/* Mascot Selector & Live Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Scegli la tua Mascotte
            </label>
            <div className="grid grid-cols-2 gap-3 mb-4">
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
                <span className="text-[10px] text-slate-400">Ice Cyber Cat</span>
              </button>

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
                <span className="text-[10px] text-slate-400">Lavender Cosmic Cat</span>
              </button>
            </div>
          </div>

          {/* Accessory Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Accessorio Mascotte
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
                      ? 'bg-purple-500/30 border-purple-400 text-purple-100 font-bold'
                      : 'bg-slate-900/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Game Options (Rounds & Secret Chemistry) */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-purple-400" />
                Numero di Round
              </span>
              <div className="flex items-center space-x-2">
                {[8, 10, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRounds(num)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      rounds === num
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Secret Chemistry Toggle */}
            <div className="p-3 rounded-2xl bg-pink-950/20 border border-pink-500/30 flex items-center justify-between">
              <div className="flex items-start space-x-2.5 pr-2">
                <Heart className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-pink-200">Abilita SECRET CHEMISTRY</p>
                  <p className="text-[11px] text-slate-400">Attiva la modalità speciale a sorpresa a metà partita</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowSecretChemistry}
                onChange={(e) => setAllowSecretChemistry(e.target.checked)}
                className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl glass-button-primary font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Creazione in corso...' : 'Crea Stanza & Vai in Lobby'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
