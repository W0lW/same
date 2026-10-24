import React, { useState } from 'react';
import { X, Server, Check, AlertTriangle, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';
import { getBackendBaseUrl, setCustomBackendUrl, safeFetchJson } from '../../utils/api';
import { sounds } from '../../audio/soundEffects';

interface BackendConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const BackendConfigModal: React.FC<BackendConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const currentUrl = getBackendBaseUrl();
  const [backendUrl, setBackendUrl] = useState(currentUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleTest = async () => {
    setTestStatus('testing');
    setStatusMessage('Test di connessione al backend in corso...');

    // Temporarily set URL to test
    const targetUrl = backendUrl.trim().replace(/\/+$/, '');
    const fullUrl = targetUrl ? `${targetUrl}/api/rooms/TEST99/state` : '/api/rooms/TEST99/state';

    // Test connection using safeFetchJson
    try {
      const res = await safeFetchJson<{ room: any }>(fullUrl);
      if (res.status === 404 && res.data?.error === 'Stanza non trovata') {
        // A 404 JSON with {"error": "Stanza non trovata"} confirms the backend API is ALIVE!
        setTestStatus('success');
        setStatusMessage('Connessione al backend riuscita! Il server risponde con JSON valido.');
        sounds.playMatch();
      } else if (res.ok) {
        setTestStatus('success');
        setStatusMessage('Connessione al backend riuscita!');
        sounds.playMatch();
      } else if (res.isHtmlFallback) {
        setTestStatus('error');
        setStatusMessage('Il server ha risposto con una pagina HTML 404. Su Vercel è necessario configurare VITE_BACKEND_URL.');
        sounds.playMiss();
      } else {
        setTestStatus('error');
        setStatusMessage(res.error || `Risposta non valida (HTTP ${res.status})`);
        sounds.playMiss();
      }
    } catch (err: any) {
      setTestStatus('error');
      setStatusMessage(`Impossibile raggiungere il server: ${err.message || 'Errore di rete'}.`);
      sounds.playMiss();
    }
  };

  const handleSave = () => {
    setCustomBackendUrl(backendUrl);
    sounds.playClick();
    onConfigSaved();
    onClose();
  };

  const handleResetToOrigin = () => {
    setBackendUrl('');
    setCustomBackendUrl('');
    sounds.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 text-slate-100 relative shadow-2xl border-purple-500/30">
        <button
          onClick={onClose}
          aria-label="Chiudi finestra"
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-sky-400 flex items-center justify-center shadow-lg">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-200 to-sky-200 bg-clip-text text-transparent">
              Configurazione Server Multiplayer
            </h2>
            <p className="text-xs text-purple-300/80">Supporto per Vercel, Render, Railway e hosting gratuito</p>
          </div>
        </div>

        {/* Diagnostic info about Vercel */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 mb-5 text-xs text-slate-300 leading-relaxed space-y-2">
          <div className="flex items-center space-x-2 text-amber-300 font-bold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Perché compare l'errore "The page could not be found" su Vercel?</span>
          </div>
          <p>
            Vercel distribuisce il frontend Vite come file statici sulla sua CDN. Poiché il multiplayer di <em>Same Wavelength</em> utilizza un server Node.js autorevole (con timer e protezione segreta delle risposte), su hosting statici serve specificare l'indirizzo del backend.
          </p>
          <p className="text-purple-300">
            Puoi ospitare gratuitamente il backend Node.js su <strong>Render.com</strong>, <strong>Railway.app</strong> o <strong>Fly.io</strong> (100% gratuiti per Web Service Node).
          </p>
        </div>

        {/* Input for custom backend URL */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              URL Backend / API
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                placeholder="es. https://same-wavelength.onrender.com (lascia vuoto per same-origin)"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-900/80 border border-purple-500/40 focus:border-purple-300 focus:outline-none text-slate-100 text-sm shadow-inner placeholder-slate-600"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testStatus === 'testing'}
                className="px-4 py-3 rounded-2xl glass-button text-xs font-bold text-sky-200 flex items-center space-x-1.5 cursor-pointer hover:bg-slate-800 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>Testa</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Attualmente attivo: <strong className="text-sky-300">{currentUrl || 'Same-origin (/api/...)'}</strong>
            </p>
          </div>

          {/* Test Status feedback */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-2xl border text-xs flex items-start space-x-2 ${
                testStatus === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : testStatus === 'error'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  : 'bg-slate-900/40 border-slate-700 text-slate-300'
              }`}
            >
              {testStatus === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : testStatus === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-4 h-4 text-sky-400 animate-spin flex-shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Free Hosting Quick Guide */}
        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 mb-6 text-xs text-slate-300 space-y-2">
          <p className="font-bold text-purple-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            Come pubblicare il backend gratuitamente in 2 minuti:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-300/90 text-[11px]">
            <li>Crea un account gratuito su <strong>Render.com</strong> o <strong>Railway.app</strong>.</li>
            <li>Collega la repository GitHub del gioco e scegli <strong>Web Service</strong>.</li>
            <li>Build Command: <code className="text-purple-200 bg-slate-900 px-1 py-0.5 rounded">npm install</code>, Start Command: <code className="text-purple-200 bg-slate-900 px-1 py-0.5 rounded">npm start</code>.</li>
            <li>Copia l'URL assegnato da Render (es. <em>https://same-wavelength.onrender.com</em>) e inseriscilo qui sopra.</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleResetToOrigin}
            className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            Ripristina Default (/api)
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl glass-button text-xs font-semibold text-slate-300 cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-bold text-white shadow-lg cursor-pointer"
            >
              Salva e Applica ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
