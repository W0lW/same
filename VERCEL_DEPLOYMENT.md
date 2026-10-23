# GUIDA DEPLOY VERCEL & SOLUZIONE ERRORE JSON

## 1. Causa Reale dell'Errore
L'errore mostrato in precedenza:
```
Unexpected token 'T', "The page c"... is not valid JSON
```
si verificava per due ragioni collegate:
1. **Comportamento Statico di Vercel per SPA Vite**:
   Quando si importa una repository Vite in Vercel con impostazioni standard, Vercel esegue `npm run build` e distribuisce la cartella `dist/` come file statici su CDN. Il file `server.ts` (il server Node.js autorevole) **non viene eseguito in background**.
2. **Risposta HTML 404 invece di JSON**:
   Qualsiasi chiamata a `/api/rooms/create` o `/api/rooms/join` veniva intercettata dalla CDN di Vercel, la quale restituiva la pagina di errore HTML predefinita:
   `"The page could not be found (404)"`.
   Poiché il client eseguiva direttamente `await res.json()`, il parser JSON cercava di interpretare il testo HTML (`The page...`) iniziante con la lettera **'T'**, sollevando l'eccezione di sintassi.

---

## 2. Correzioni Applicate nel Codice

1. **`safeFetchJson` (`src/utils/api.ts`)**:
   - Nessuna chiamata a `.json()` viene più effettuata alla cieca.
   - Viene verificato `res.headers.get('content-type')`. Se il server restituisce HTML (come la pagina 404 di Vercel), la funzione intercetta la risposta ed emette un messaggio di errore chiaro e dettagliato.
   - Gestione centralizzata di tutti gli errori HTTP e di rete.

2. **Inclusione di `api/index.ts` e `vercel.json`**:
   - Creato l'handler serverless `api/index.ts` con esportazione dell'app Express.
   - Configurato `vercel.json` con regole di riscrittura (`rewrites`) per instradare `/api/(.*)` alla funzione serverless e le altre rotte a `index.html`.

3. **Fallback Automatico a HTTP Polling (`src/hooks/useMultiplayer.ts`)**:
   - Su serverless o proxy che non supportano connessioni Server-Sent Events (SSE) a lunga durata, il client passa automaticamente al polling sincronizzato a intervalli di 1.5 secondi.

4. **Supporto URL Backend Personalizzato (`VITE_BACKEND_URL` o UI)**:
   - È ora possibile impostare la variabile d'ambiente `VITE_BACKEND_URL` in Vercel.
   - Gli utenti possono anche cliccare sull'icona **Server** nell'interfaccia per inserire o testare l'URL del proprio backend.

---

## 3. Soluzioni Consigliate per il Multiplayer Online

### Opzione A (Consigliata): Frontend su Vercel + Backend Gratuito su Render / Railway
Poiché il gioco si basa su stanze sincronizzate con timer autorevoli al secondo, un processo Node.js persistente garantisce la migliore esperienza:
1. **Frontend**: Rimane su Vercel.
2. **Backend**:
   - Crea un account gratuito su [Render.com](https://render.com/) o [Railway.app](https://railway.app/).
   - Crea un **Web Service** collegato alla stessa repository.
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (esegue `node server.ts` o `tsx server.ts`).
   - Copia l'URL del servizio (es. `https://same-wavelength.onrender.com`).
3. **Collegamento**:
   - Nel pannello Vercel del tuo progetto, vai su **Settings > Environment Variables** e aggiungi:
     - Nome: `VITE_BACKEND_URL`
     - Valore: `https://same-wavelength.onrender.com`
   - Oppure, aprilo direttamente nel gioco cliccando sul pulsante **Impostazioni Server / Vercel** in basso.

### Opzione B: Deploy Full-Stack su Render / Fly.io / Cloud Run
Se preferisci ospitare sia frontend che backend su un unico servizio Node.js gratuito:
- Esegui il deploy come Web Service unico su Render o Koyeb con `npm start`: il server Express gestirà sia gli endpoint `/api/*` che i file statici del client.
