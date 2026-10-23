# GUIDA DEPLOY VERCEL & RISOLUZIONE ERRORI

## 1. Analisi Comparativa: Google AI Studio Preview vs Vercel

| Aspetto | Preview Google AI Studio | Vercel (Default SPA) |
| :--- | :--- | :--- |
| **Ambiente di Esecuzione** | Server Node.js full-stack attivo (`tsx server.ts`) su porta 3000 | CDN per file statici HTML/JS/CSS (`dist/`) |
| **Endpoint `/api/*`** | Risponde con l'applicazione Express locale | Risponde con pagina HTML 404 ("The page could not be found") |
| **Errore su Chrome/Firefox** | Nessun errore | `Unexpected token 'T', "The page c"... is not valid JSON` |
| **Errore su Safari/WebKit** | Nessun errore | `The string did not match the expected pattern.` |

### Perché su Safari compare *"The string did not match the expected pattern."*?
Nel motore WebKit (Safari su macOS, iOS, iPadOS):
- Quando un'API `fetch()` o `new EventSource()` riceve una risposta non valida o una stringa HTML al posto di un oggetto JSON, il motore WebKit non genera l'errore dettagliato di Chrome, ma solleva un'eccezione generica di sintassi (`DOMException: SYNTAX_ERR` / DOM Exception 12):
  `"The string did not match the expected pattern."`
- Lo stesso errore si verifica se a `new EventSource()` o `fetch()` viene passata una stringa URL con sintassi anomala (ad esempio un dominio privo di `https://` o la stringa letterale `"undefined"`).

---

## 2. Modifiche Applicate al Codice

1. **Lettura Sicura del Testo Prima del Parsing (`src/utils/api.ts`)**:
   - Eliminata qualsiasi invocazione diretta di `res.json()`.
   - Il corpo della risposta viene sempre letto come testo grezzo (`res.text()`).
   - Se il server risponde con una pagina HTML (404/500/502), la risposta viene intercettata senza sollevare errori di sintassi né su Chrome né su Safari.
   - Solo se il testo è presente e conforme viene eseguito il parsing protetto in un blocco `try...catch`.

2. **Sanitizzazione e Costruzione URL Assoluti (`sanitizeBackendUrl` e `buildApiUrl`)**:
   - I valori di `VITE_BACKEND_URL` vengono ripuliti da virgolette accidentali, stringhe vuote, o letterali `"undefined"`.
   - Se l'utente inserisce un dominio senza prefisso di protocollo (es. `same-wavelength.onrender.com`), il sistema aggiunge automaticamente `https://`, garantendo che `new EventSource()` e `fetch()` ricevano URL conformi allo standard.

3. **Protezione Completa di `EventSource` e Fallback Polling (`src/hooks/useMultiplayer.ts`)**:
   - La creazione di `new EventSource()` è protetta da un blocco `try...catch` che intercetta qualsiasi eccezione WebKit.
   - Se la connessione SSE non è disponibile o fallisce (comportamento tipico dell'ambiente serverless Vercel), il gioco passa automaticamente a una sincronizzazione via **HTTP Polling ogni 1.5s**, mantenendo la partita perfettamente giocabile.

4. **Logging Dettagliato in Console**:
   - Aggiunti log con prefisso `[SameWavelength API]` e `[SameWavelength Sync]` per visualizzare nel browser (Console / Web Inspector) esattamente quale URL è stato chiamato, il codice HTTP ricevuto e il tipo di contenuto.

---

## 3. Configurazione Esatta Richiesta su Vercel

Poiché *Same Wavelength* richiede un backend autorevole per la gestione delle stanze private, dei timer al secondo e della segretezza delle risposte fino alla rivelazione:

### Passo 1: Pubblica il Backend Gratuito su Render o Railway
1. Vai su [Render.com](https://render.com/) (o [Railway.app](https://railway.app/)) e crea un account gratuito.
2. Clicca su **New > Web Service** e collega la repository GitHub del gioco.
3. Configura:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Render genererà un URL pubblico gratuito con HTTPS (es. `https://same-wavelength.onrender.com`).

### Passo 2: Configura la Variabile d'Ambiente su Vercel
1. Vai sulla dashboard del tuo progetto su **Vercel**.
2. Clicca su **Settings > Environment Variables**.
3. Aggiungi la variabile:
   - **Key**: `VITE_BACKEND_URL`
   - **Value**: `https://same-wavelength.onrender.com` *(sostituisci con il tuo URL Render, senza barra finale)*
4. Salva e fai un **Redeploy** dell'applicazione su Vercel.

### In Alternativa (Configurazione Diretta dall'Interfaccia)
Non vuoi rifare il deploy?
1. Apri l'app distribuita su Vercel.
2. In basso nella schermata o nella barra in alto, clicca sul pulsante **Impostazioni Server / Vercel** (icona Server).
3. Incolla l'URL del tuo backend.
4. Clicca su **Testa** (vedrai la conferma verde: *"Connessione al backend riuscita!"*).
5. Clicca su **Salva e Applica**: l'app si connetterà immediatamente al backend senza dover rieseguire il build!
