import React, { useState, useEffect } from 'react';
import { useMultiplayer } from './hooks/useMultiplayer';
import { Header } from './components/ui/Header';
import { HomeScreen } from './components/screens/HomeScreen';
import { CreateRoomModal } from './components/screens/CreateRoomModal';
import { JoinRoomModal } from './components/screens/JoinRoomModal';
import { LobbyScreen } from './components/screens/LobbyScreen';
import { SameBrainRound } from './components/screens/SameBrainRound';
import { BluffRound } from './components/screens/BluffRound';
import { ChaosRound } from './components/screens/ChaosRound';
import { SecretChemistryRound } from './components/screens/SecretChemistryRound';
import { RevealScreen } from './components/screens/RevealScreen';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { HowToPlayModal } from './components/modals/HowToPlayModal';
import { BackendConfigModal } from './components/modals/BackendConfigModal';
import { NotificationToast } from './components/notifications/NotificationToast';
import { Server, AlertTriangle } from 'lucide-react';

export default function App() {
  const {
    room,
    myPlayer,
    otherPlayer,
    isHost,
    isConnected,
    isBackendUnreachable,
    error,
    inAppNotification,
    clearNotification,
    createRoom,
    joinRoom,
    submitAnswer,
    toggleReady,
    startGame,
    skipReveal,
    requestRematch,
    leaveRoom,
    retryConnection,
  } = useMultiplayer();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isBackendConfigOpen, setIsBackendConfigOpen] = useState(false);
  const [joinCodeParam, setJoinCodeParam] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Check URL parameters for ?join=CODE or ?autostart=1
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const join = urlParams.get('join');
      if (join && !room) {
        setJoinCodeParam(join.toUpperCase());
        setIsJoinOpen(true);
      }

      const autostart = urlParams.get('autostart');
      if (autostart === '1' && !room) {
        createRoom('Lumi Pilot', 'lumi', 'cyber_visor', { totalRounds: 8 });
      }
    }
  }, [room, createRoom]);

  const handleCreateSubmit = async (name: string, mascot: any, accessory: any, settings: any) => {
    setIsCreating(true);
    const code = await createRoom(name, mascot, accessory, settings);
    setIsCreating(false);
    if (code) {
      setIsCreateOpen(false);
    }
  };

  const handleJoinSubmit = async (code: string, name: string, mascot: any, accessory: any) => {
    setIsJoining(true);
    const success = await joinRoom(code, name, mascot, accessory);
    setIsJoining(false);
    if (success) {
      setIsJoinOpen(false);
    }
    return success;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-x-hidden">
      {/* Top Navigation Header */}
      <Header
        roomCode={room?.roomCode}
        isConnected={isConnected}
        isBackendUnreachable={isBackendUnreachable}
        onLeaveRoom={room ? leaveRoom : undefined}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenBackendConfig={() => setIsBackendConfigOpen(true)}
      />

      {/* Global In-App Notification Toast */}
      <NotificationToast
        notification={inAppNotification}
        onClose={clearNotification}
      />

      {/* Vercel / Backend Unreachable Diagnostic Banner */}
      {isBackendUnreachable && (
        <div className="max-w-2xl mx-auto my-2 px-4 py-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xl z-50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Attenzione Vercel:</strong> Il backend Node.js non risponde all'indirizzo configurato.
            </span>
          </div>
          <button
            onClick={() => setIsBackendConfigOpen(true)}
            className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition-colors flex items-center space-x-1 cursor-pointer flex-shrink-0"
          >
            <Server className="w-3 h-3" />
            <span>Configura Backend</span>
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {error && !isBackendUnreachable && (
        <div className="max-w-md mx-auto my-2 px-4 py-2 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs text-center shadow-lg z-50">
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative w-full">
        {!room ? (
          <HomeScreen
            onCreateRoomClick={() => setIsCreateOpen(true)}
            onJoinRoomClick={() => setIsJoinOpen(true)}
            onHowToPlayClick={() => setIsHelpOpen(true)}
          />
        ) : room.status === 'LOBBY' ? (
          <LobbyScreen
            room={room}
            myPlayer={myPlayer}
            otherPlayer={otherPlayer}
            isHost={isHost}
            onToggleReady={toggleReady}
            onStartGame={startGame}
          />
        ) : room.status === 'IN_PROGRESS' && room.currentRound ? (
          room.currentRound.revealedAnswers ? (
            <RevealScreen
              round={room.currentRound}
              room={room}
              myPlayer={myPlayer}
              otherPlayer={otherPlayer}
              isHost={isHost}
              onSkipReveal={skipReveal}
            />
          ) : room.currentRound.mode === 'SAME_BRAIN' ? (
            <SameBrainRound
              round={room.currentRound}
              myPlayer={myPlayer}
              otherPlayer={otherPlayer}
              onSubmitAnswer={submitAnswer}
            />
          ) : room.currentRound.mode === 'BLUFF_MODE' ? (
            <BluffRound
              round={room.currentRound}
              myPlayer={myPlayer}
              otherPlayer={otherPlayer}
              onSubmitAnswer={submitAnswer}
            />
          ) : room.currentRound.mode === 'CHAOS_ROUND' ? (
            <ChaosRound
              round={room.currentRound}
              myPlayer={myPlayer}
              otherPlayer={otherPlayer}
              onSubmitAnswer={submitAnswer}
            />
          ) : room.currentRound.mode === 'SECRET_CHEMISTRY' ? (
            <SecretChemistryRound
              round={room.currentRound}
              myPlayer={myPlayer}
              otherPlayer={otherPlayer}
              onSubmitAnswer={submitAnswer}
            />
          ) : (
            <SameBrainRound
              round={room.currentRound}
              myPlayer={myPlayer}
              otherPlayer={otherPlayer}
              onSubmitAnswer={submitAnswer}
            />
          )
        ) : room.status === 'FINISHED' ? (
          <GameOverScreen
            room={room}
            myPlayer={myPlayer}
            otherPlayer={otherPlayer}
            onRematch={requestRematch}
            onHome={leaveRoom}
          />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 px-4 text-[11px] text-slate-500 z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
        <p>SAME WAVELENGTH — Party Game per 2 Giocatori • Soft Y2K & Anime Cyber Mascots</p>
        <button
          onClick={() => setIsBackendConfigOpen(true)}
          className="text-purple-400/80 hover:text-purple-300 underline cursor-pointer"
        >
          Impostazioni Server / Vercel
        </button>
      </footer>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
      />

      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSubmit={handleJoinSubmit}
        isLoading={isJoining}
        defaultCode={joinCodeParam}
      />

      <HowToPlayModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <BackendConfigModal
        isOpen={isBackendConfigOpen}
        onClose={() => setIsBackendConfigOpen(false)}
        onConfigSaved={retryConnection}
      />
    </div>
  );
}
