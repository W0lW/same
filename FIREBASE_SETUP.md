# SAME WAVELENGTH — ARCHITETTURA E GUIDA DI DEPLOY MULTIPLAYER

## 1. Architettura Attiva (Full-Stack Express + Server-Sent Events Autorevole)
Attualmente il progetto è configurato con un **backend full-stack autorevole in Node.js/Express (`server.ts`)** con sincronizzazione in tempo reale tramite **Server-Sent Events (SSE)** e REST API protetta.

### Vantaggi dell'Architettura Attiva:
- **Segretezza Assoluta delle Risposte:** Le risposte segrete in `SAME BRAIN`, `BLUFF MODE` e `SECRET CHEMISTRY` vengono conservate nella memoria privata del server (`room.secretAnswers`) e filtrate rigorosamente prima dell'invio ai client.
- **Timer Autorevole:** I conti alla rovescia e i timeout sono gestiti dal server con intervalli di 1 secondo, evitando disallineamenti o freeze se un giocatore perde la connessione.
- **Zero Costi o Setup Esterno per i Test:** Due sessioni del browser o due dispositivi possono connettersi istantaneamente digitando il codice a 6 cifre o cliccando il link di invito.
- **Notifiche Push in Tempo Reale:** Supporto integrato sia per la Web Notification API del browser che per avvisi dinamici in-app (avviso quando l'avversario ha risposto, round avviato, rivelazione in corso).

---

## 2. Configurazione Alternativa: Firebase Firestore + Cloud Functions
Se desideri migrare o distribuire l'applicazione su Google Cloud Firebase:

### Passaggi di Configurazione:
1. Crea un progetto su [Firebase Console](https://console.firebase.google.com/).
2. Abilita **Firebase Authentication** con il provider **Anonimo** (permette ai giocatori di ottenere un `uid` temporaneo senza password).
3. Abilita **Cloud Firestore** in modalità Native.
4. Distribuisci le regole di sicurezza fornite nel file `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```
5. Distribuisci una Cloud Function per la gestione dell'autorevolezza dei round:
   - Funzione `onAnswerSubmitted`: verifica se entrambi i giocatori hanno risposto e aggiorna lo stato su `ROUND_REVEAL`.
   - Funzione `onRoundTimeout`: scatta alla scadenza del timer ed esegue il calcolo dei punteggi.

---

## 3. Come Avviare il Progetto in Locale
1. Installa le dipendenze:
   ```bash
   npm install
   ```
2. Avvia il server di sviluppo (Express + Vite middlewares):
   ```bash
   npm run dev
   ```
3. Apri due finestre del browser su `http://localhost:3000`:
   - Finestra 1: Clicca su **Crea Stanza Privata**, scegli nickname e la tua mascotte (*Lumi* o *Nova*), ottieni il codice univoco.
   - Finestra 2: Clicca su **Entra con Codice**, inserisci il codice a 6 cifre e unisciti alla lobby!
   - Entrambi cliccano su **Sono Pronto**, e l'Host avvia la partita.

---

## 4. Test di Verifica Eseguiti
- ✅ Creazione della stanza con codice univoco a 6 caratteri.
- ✅ Selezione e personalizzazione delle mascotte anime (*Lumi* & *Nova*) con accessori (*cyber visor, headphones, star clip, halo, wings*).
- ✅ Unione del secondo giocatore e sincronizzazione bidirezionale in tempo reale via SSE.
- ✅ Privacy rigorosa: l'avversario riceve l'indicatore `hasSubmitted: true` ma non il contenuto della risposta fino al reveal.
- ✅ Unit test eseguiti con successo per la normalizzazione del testo, il calcolo dei punteggi, i moltiplicatori wild events e tutti i casi di Secret Chemistry (`npx tsx --test src/game/scoring.test.ts`).
- ✅ SECRET CHEMISTRY con rivelazione sincronizzata e gestione di tutti gli esiti (*Mutual Vibe, Plot Twist, One-Sided Signal, Different Feelings, Both Curious, Both Passing, Mutual Mystery*).
- ✅ Sistema di notifiche push in tempo reale e sintetizzatore audio Web Audio API.
