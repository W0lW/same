import React, { useMemo, useState } from 'react';
import { Heart, ArrowLeft, ArrowRight, Zap, ChevronRight, Sparkles, ShieldAlert } from 'lucide-react';

type Props = {
  roundNumber: number;
  totalRounds: number;
  onContinue: () => void;
};

type Hazard = { at: number; lane: number; kind: string };

const LANES = ['SINISTRA', 'CENTRO', 'DESTRA'];

export function ArcadeInterlude({ roundNumber, totalRounds, onContinue }: Props) {
  const isBossRun = roundNumber === Math.max(2, Math.ceil(totalRounds / 2));
  const hazards = useMemo<Hazard[]>(() => {
    const count = Math.min(3 + Math.floor(roundNumber / 2), 8);
    return Array.from({ length: count }, (_, i) => ({
      at: 14 + i * (Math.max(68, 78 - roundNumber) / count),
      lane: (i * 2 + roundNumber) % 3,
      kind: ['🫧', '👾', '🌀', '🧿'][((i + roundNumber) % 4)],
    }));
  }, [roundNumber]);

  const [progress, setProgress] = useState(0);
  const [lane, setLane] = useState(1);
  const [lives, setLives] = useState(3);
  const [hitHazards, setHitHazards] = useState<number[]>([]);
  const [room, setRoom] = useState(1);
  const [enemies, setEnemies] = useState([true, true, true]);
  const [heartTaken, setHeartTaken] = useState(false);
  const [shots, setShots] = useState(0);
  const [message, setMessage] = useState('TAPPA PER SCATTARE. CAMBIA CORSIA PER EVITARE I BRUTTINI.');

  const finished = progress >= 100 || lives <= 0;
  const roomFinished = enemies.every((alive) => !alive) && heartTaken;
  const allRoomsFinished = room > 5;

  const advance = () => {
    if (finished) return;
    const next = Math.min(100, progress + Math.max(3, 6 - Math.floor(roundNumber / 4)));
    const hazardIndex = hazards.findIndex((h, i) => !hitHazards.includes(i) && h.at > progress && h.at <= next && h.lane === lane);
    if (hazardIndex >= 0) {
      setHitHazards((old) => [...old, hazardIndex]);
      setLives((old) => old - 1);
      setProgress(Math.max(progress, hazards[hazardIndex].at - 3));
      setMessage('BOOM! Un bruttino ti ha preso. CAMBIA CORSIA!');
      return;
    }
    setProgress(next);
    setMessage(next >= 100 ? 'CORRIDOIO SUPERATO! ✨' : 'NICE! CONTINUA A TAPPARE.');
  };

  const fire = () => {
    if (allRoomsFinished) return;
    const aliveIndex = enemies.findIndex(Boolean);
    if (aliveIndex < 0) {
      setMessage(heartTaken ? 'STANZA RIPULITA!' : 'TUTTI I NEMICI KO. PRENDI IL CUORICINO!');
      return;
    }
    const next = [...enemies];
    next[aliveIndex] = false;
    setEnemies(next);
    setShots((s) => s + 1);
    setMessage('ZAP! RAGGIO AZZURRO A SEGNO. 💥');
  };

  const collectHeart = () => {
    if (enemies.some(Boolean)) {
      setMessage('PRIMA ELIMINA TUTTI I BRUTTINI!');
      return;
    }
    setHeartTaken(true);
    setMessage('CUORICINO RACCOLTO! STANZA COMPLETATA 💙');
  };

  const nextRoom = () => {
    if (!roomFinished) return;
    if (room === 5) {
      setRoom(6);
      return;
    }
    setRoom((r) => r + 1);
    setEnemies([true, true, true, ...(room >= 3 ? [true] : [])]);
    setHeartTaken(false);
    setMessage('NUOVA STANZA! I BRUTTINI SONO PIÙ NUMEROSI.');
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-3 sm:px-5 py-4 animate-fade-in">
      <div className="rounded-[28px] border border-cyan-300/30 bg-[#090b25]/95 shadow-[0_0_50px_rgba(34,211,238,0.14)] overflow-hidden">
        <header className="px-5 py-4 bg-gradient-to-r from-indigo-950 via-purple-950 to-cyan-950 border-b border-white/10 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black tracking-[0.3em] text-cyan-200 uppercase">SAME WAVELENGTH • ARCADE BREAK</div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{isBossRun ? 'NEON HEART RAID' : 'VAPORWAVE RUN'}</h2>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-purple-200">ROUND {roundNumber}/{totalRounds}</div>
            <div className="text-sm font-bold text-cyan-100">{isBossRun ? (allRoomsFinished ? '5/5 STANZE' : `STANZA ${Math.min(room, 5)}/5`) : `❤ ${lives} vite`}</div>
          </div>
        </header>

        {isBossRun ? (
          <div className="p-4 sm:p-6">
            {allRoomsFinished ? (
              <div className="min-h-[330px] flex flex-col items-center justify-center text-center gap-4">
                <div className="text-7xl animate-bounce">💖</div>
                <h3 className="text-2xl font-black text-cyan-100">CINQUE STANZE, CINQUE CUORI!</h3>
                <p className="text-sm text-purple-200">I bruttini sono stati vaporizzati. La vostra aura è intatta.</p>
                <button onClick={onContinue} className="glass-button-primary rounded-2xl px-6 py-3 font-black flex items-center gap-2">TORNA AL GIOCO <ChevronRight size={18}/></button>
              </div>
            ) : (
              <>
                <div className="relative min-h-[300px] rounded-3xl overflow-hidden border border-cyan-300/30 bg-[#111139]" style={{ backgroundImage: 'radial-gradient(circle at 50% 45%, rgba(34,211,238,.18), transparent 45%), linear-gradient(135deg,#191047,#111735 55%,#301044)' }}>
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(103,232,249,.25) 1px, transparent 1px), linear-gradient(90deg,rgba(103,232,249,.25) 1px, transparent 1px)', backgroundSize: '32px 32px', transform: 'perspective(400px) rotateX(12deg) scale(1.3)' }} />
                  <div className="absolute top-3 left-3 rounded-full bg-black/40 border border-white/10 px-3 py-1 text-xs text-cyan-100">STANZA {room}/5</div>
                  <div className="absolute top-3 right-3 flex gap-1">{Array.from({ length: 5 }, (_, i) => <Heart key={i} size={17} className={i < room ? 'text-pink-400 fill-pink-400' : 'text-white/20'} />)}</div>
                  {enemies.map((alive, i) => alive && (
                    <div key={i} className="absolute text-4xl sm:text-5xl animate-bounce drop-shadow-[0_0_12px_rgba(244,114,182,.8)]" style={{ left: `${18 + i * (62 / Math.max(1, enemies.length - 1))}%`, top: `${24 + (i % 2) * 25}%`, animationDelay: `${i * 120}ms` }}>👾</div>
                  ))}
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-5xl drop-shadow-[0_0_16px_rgba(34,211,238,.9)]">🐱</div>
                  {heartTaken && <div className="absolute bottom-5 right-5 text-3xl">💙</div>}
                  <div className="absolute bottom-2 left-3 text-[10px] text-cyan-100/70">{enemies.filter(Boolean).length} BRUTTINI RIMASTI</div>
                </div>
                <p className="text-center text-xs sm:text-sm text-cyan-100 mt-3 min-h-5">{message}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                  <button onClick={fire} disabled={roomFinished} className="col-span-2 sm:col-span-1 rounded-2xl bg-cyan-300 text-slate-950 font-black py-3 px-3 flex items-center justify-center gap-2 disabled:opacity-40"><Zap size={18}/> SPARA RAGGIO</button>
                  <button onClick={collectHeart} disabled={heartTaken || enemies.some(Boolean)} className="rounded-2xl bg-pink-500/20 border border-pink-300/30 text-pink-100 font-bold py-3 px-3 flex items-center justify-center gap-2 disabled:opacity-40"><Heart size={17}/> PRENDI CUORE</button>
                  <button onClick={nextRoom} disabled={!roomFinished} className="rounded-2xl bg-violet-500/30 border border-violet-300/30 text-white font-bold py-3 px-3 flex items-center justify-center gap-2 disabled:opacity-40">{room === 5 ? 'FINISCI RAID' : 'PROSSIMA STANZA'} <ChevronRight size={16}/></button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-3">Elimina tutti i bruttini, poi raccogli il cuoricino azzurro per sbloccare la stanza successiva.</p>
              </>
            )}
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="relative h-[330px] rounded-3xl overflow-hidden border border-fuchsia-300/30 bg-[#100d35]" style={{ backgroundImage: 'linear-gradient(180deg,rgba(12,10,45,.2),rgba(236,72,153,.15)), repeating-linear-gradient(0deg,transparent 0 28px,rgba(34,211,238,.14) 29px 30px), repeating-linear-gradient(90deg,transparent 0 28px,rgba(34,211,238,.14) 29px 30px)' }}>
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-cyan-400/20 to-transparent" />
              <div className="absolute top-3 left-3 rounded-full bg-black/40 border border-white/10 px-3 py-1 text-xs text-cyan-100">DISTANZA {Math.round(progress)}%</div>
              <div className="absolute top-3 right-3 flex gap-1">{Array.from({ length: 3 }, (_, i) => <Heart key={i} size={17} className={i < lives ? 'text-pink-400 fill-pink-400' : 'text-white/20'} />)}</div>
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1/3 border-x border-dashed border-cyan-300/20" />
              {hazards.map((h, i) => !hitHazards.includes(i) && h.at >= progress && (
                <div key={i} className="absolute text-3xl sm:text-4xl transition-all duration-150 drop-shadow-[0_0_12px_rgba(244,114,182,.8)]" style={{ left: `${17 + h.lane * 33}%`, top: `${Math.max(10, 90 - (h.at - progress) * 1.1)}%` }}>{h.kind}</div>
              ))}
              <div className="absolute bottom-7 transition-all duration-100 text-4xl sm:text-5xl drop-shadow-[0_0_18px_rgba(34,211,238,.9)]" style={{ left: `${17 + lane * 33}%`, transform: 'translateX(-50%)' }}>🐱</div>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">{[0,1,2].map((l) => <div key={l} className={`h-1 w-1/4 rounded-full ${lane === l ? 'bg-cyan-300' : 'bg-white/20'}`} />)}</div>
              {finished && <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4"><div className="text-5xl mb-2">{progress >= 100 ? '🌈' : '💫'}</div><h3 className="text-xl font-black text-white">{progress >= 100 ? 'CORRIDOIO SUPERATO!' : 'QUASI! I BRUTTINI TI HANNO PRESO'}</h3><p className="text-sm text-cyan-100 mt-1">La prossima domanda ti aspetta.</p></div>}
            </div>
            <div className="mt-3 text-center text-xs text-cyan-100 min-h-5">{message}</div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <button onClick={() => setLane((l) => Math.max(0, l - 1))} className="rounded-2xl bg-white/5 border border-white/10 py-3 flex items-center justify-center gap-1 text-sm font-bold"><ArrowLeft size={17}/> SINISTRA</button>
              <button onClick={advance} disabled={finished} className="rounded-2xl bg-cyan-300 text-slate-950 font-black py-3 px-2 flex flex-col items-center justify-center disabled:opacity-40"><span className="text-lg leading-none">TAP!</span><span className="text-[9px] tracking-wider">CORRI</span></button>
              <button onClick={() => setLane((l) => Math.min(2, l + 1))} className="rounded-2xl bg-white/5 border border-white/10 py-3 flex items-center justify-center gap-1 text-sm font-bold">DESTRA <ArrowRight size={17}/></button>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-400 to-cyan-300 transition-all" style={{ width: `${progress}%` }} /></div>
            <div className="flex items-center justify-between gap-3 mt-4">
              <div className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1"><ShieldAlert size={14}/> Più round = più ostacoli e scatti più impegnativi.</div>
              {finished && <button onClick={onContinue} className="shrink-0 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-2 text-xs font-black text-white flex items-center gap-1">CONTINUA <ChevronRight size={15}/></button>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
