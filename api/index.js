// src/server/serverless.ts
import express from "express";

// src/data/catalog.ts
var GAME_CATALOG = [
  // --- SAME BRAIN: INTUITION & SIMULTANEOUS CHOICES (25 items) ---
  {
    id: "sb_1",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Se potessimo sparire per 24 ore senza conseguenze, dove andremmo?",
    options: ["In una baita sperduta tra i boschi", "A una festa clandestina a Tokyo", "In spiaggia deserta di notte", "Chiusi in una sala giochi arcade anni 90"],
    timeLimitSeconds: 30
  },
  {
    id: "sb_2",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Quale animale descrive meglio l'energia che sprigiono?",
    options: ["Gatto ninja notturno", "Golden Retriever euforico", "Gufo iper-analitico", "Panda che fa finta di non capire"],
    timeLimitSeconds: 25
  },
  {
    id: "sb_3",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Quale sarebbe il mio superpotere pi\xF9 inutile ma divertente?",
    options: ["Far saltare i popcorn con lo sguardo", "Riconoscere le bugie solo se dette cantando", "Teletrasportarsi ma solo dentro un frigorifero", "Poter parlare con le piante che spettegolano"],
    timeLimitSeconds: 25
  },
  {
    id: "sb_4",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Qual \xE8 la cosa pi\xF9 assurda che potremmo fare alle 3 di notte insieme?",
    options: ["Cucinare pancake gourmet con ingredienti a caso", "Costruire una fortezza di cuscini e complotti", "Fare una maratona di film horror commentati malissimo", "Uscire a camminare cercando gatti randagi da salutare"],
    timeLimitSeconds: 30
  },
  {
    id: "sb_5",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Quale sarebbe il nome della nostra band indie synth-pop?",
    options: ["Cosmic Napkins", "Onde Gamma & Glitch", "Notte Fondente", "Caff\xE8 Freddo & Ansia"],
    timeLimitSeconds: 25
  },
  {
    id: "sb_6",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "In un film apocalittico, chi di noi sopravviverebbe pi\xF9 a lungo?",
    options: ["Io, per puro spirito di autoconservazione e astuzia", "Tu, per carisma e colpi di fortuna assurdi", "Entrambi, alleandoci come villain carismatici", "Nessuno dei due, moriremmo ridendo al primo ostacolo"],
    timeLimitSeconds: 30
  },
  {
    id: "sb_7",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Quale colore descrive meglio la nostra sinergia oggi?",
    options: ["Viola galattico profondo", "Azzurro elettrico frizzante", "Rosa pesca caldo e confortevole", "Verde menta imprevedibile"],
    timeLimitSeconds: 20
  },
  {
    id: "sb_8",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Se fossimo condannati a mangiare una sola cosa per una settimana:",
    options: ["Pizza fumante con crosta ripiena", "Ramen piccante fumante", "Sushi misto con salmone", "Gelato artigianale a ogni ora"],
    timeLimitSeconds: 25
  },
  {
    id: "sb_9",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Quale oggetto porteresti su una stazione orbitale abbandonata?",
    options: ["Una consolle retr\xF2 carica di giochi", "Una macchina per il caff\xE8 espresso perfetta", "Un proiettore con tutta la musica dell'universo", "Un telescopio per guardare la Terra da lontano"],
    timeLimitSeconds: 25
  },
  {
    id: "sb_10",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Quale genere di film rappresenterebbe la nostra vita insieme?",
    options: ["Commedia brillante con gag imbarazzanti", "Sci-fi d'avventura interdimensionale", "Giallo investigativo dove siamo entrambi sospettati", "Slice of life rilassante ambientato in autunno"],
    timeLimitSeconds: 25
  },
  {
    id: "sb_11",
    mode: "SAME_BRAIN",
    category: "preferences",
    prompt: "Qual \xE8 il tipo di messaggio a cui rispondo pi\xF9 velocemente?",
    options: ["Un meme talmente stupido da fare il giro", "\xABHo uno scoop clamoroso da raccontarti\xBB", "\xABHo preso cibo anche per te, vieni\xBB", "Una nota vocale da 6 minuti piena di dramma"],
    timeLimitSeconds: 25
  },
  {
    id: "sb_12",
    mode: "SAME_BRAIN",
    category: "preferences",
    prompt: "Quale sarebbe il nostro lavoro ideale in un multiverso parallelo?",
    options: ["Cacciatori di leggende metropolitane", "Proprietari di un caff\xE8 gatti nello spazio", "Critici anonimi di hotel a 5 stelle", "Piloti collaudatori di montagne russe"],
    timeLimitSeconds: 25
  },
  {
    id: "sb_13",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Se vincessimo un milione di euro adesso, qual \xE8 la prima spesa folle?",
    options: ["Comprare un'isola disabitata e fondare la nostra repubblica", "Affittare un parco divertimenti tutto per noi per una notte", "Costruire una villa con passaggi segreti e scivoli al posto delle scale", "Scomparire in viaggio senza data di ritorno"],
    timeLimitSeconds: 30
  },
  {
    id: "sb_14",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Quale brano musicale descrive meglio la nostra \xABvibrazione\xBB?",
    options: ["Synthwave nostalgica al tramonto", "Pop anni 2000 cantato a squarciagola", "Lo-fi hip hop rilassante da pioggia alla finestra", "Rock energico con chitarre distorti"],
    timeLimitSeconds: 25
  },
  {
    id: "sb_15",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Qual \xE8 la mia debolezza pi\xF9 evidente quando ho sonno o fame?",
    options: ["Divento un distributore di battute senza senso", "Mi lamento drammaticamente come in una tragedia greca", "Mi isolo col broncio fissando il vuoto", "Divento iperattivo e intrattabile"],
    timeLimitSeconds: 25
  },
  {
    id: "sb_16",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Quale emoji uso (o pensi che userei) con pi\xF9 frequenza?",
    options: ["\u2728 Scintille mistiche", "\u{1F480} Morto dal ridere", "\u{1F440} Occhi indagatori", "\u{1F979} Cuoricino commosso"],
    timeLimitSeconds: 20
  },
  {
    id: "sb_17",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Se fossimo personaggi dei videogiochi, quale classe saremmo?",
    options: ["Mago del caos / Evocatore di disastri", "Ladro furtivo che ruba snack non visto", "Paladino protettore con armatura lucida", "Bardo stonato che distrae i nemici"],
    timeLimitSeconds: 25
  },
  {
    id: "sb_18",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Qual \xE8 il miglior modo per tirarmi su di morale dopo una brutta giornata?",
    options: ["Ascoltarmi sfogare senza dare consigli non richiesti", "Portarmi il mio comfort food preferito a sorpresa", "Farmi ridere con un aneddoto ridicolo", "Lasciarmi mezz'ora di pace totale in silenzio"],
    timeLimitSeconds: 25
  },
  {
    id: "sb_19",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Se ci arrestassero insieme, per quale motivo plausibile sarebbe?",
    options: ["Invasione notturna di un castello per fare foto aesthetic", "Furto con scasso in una pasticceria chiusa", "Aver hackerato il cartellone pubblicitario del comune", "Disturbo della quiete pubblica ridendo troppo"],
    timeLimitSeconds: 25
  },
  {
    id: "sb_20",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Qual \xE8 la stagione che meglio si adatta al nostro ritmo?",
    options: ["Primavera con brezza leggera e nuovi inizi", "Estate caotica tra notti insonni e stelle cadenti", "Autunno con pioggia, coperte e tisane calde", "Inverno sotto la neve con luci soffuse"],
    timeLimitSeconds: 20
  },
  {
    id: "sb_21",
    mode: "SAME_BRAIN",
    category: "preferences",
    prompt: "Scrivi in una parola o breve frase: Qual \xE8 il mio pi\xF9 grande pregio visibile?",
    subtext: "Rispondi sinceramente! Le risposte verranno normalizzate per verificare la sintonia.",
    allowCustom: true,
    timeLimitSeconds: 35
  },
  {
    id: "sb_22",
    mode: "SAME_BRAIN",
    category: "preferences",
    prompt: "In una sola parola: quale valore conta di pi\xF9 per noi?",
    options: ["Sincerit\xE0", "Complicit\xE0", "Libert\xE0", "Ironia"],
    timeLimitSeconds: 20
  },
  {
    id: "sb_23",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Qual \xE8 il mio livello di pazienza con le persone lente?",
    options: ["Sotto zero: sospiro visibilmente", "Media: soffro in silenzio sorridendo", "Zen: non mi scompongo quasi mai", "Dipende se ho gi\xE0 preso il caff\xE8"],
    timeLimitSeconds: 20
  },
  {
    id: "sb_24",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Se dovessimo fare una rapina in banca (ipotetica!), quale sarebbe il mio ruolo?",
    options: ["Il capo stratega che pianifica ogni secondo", "L'hacker che disattiva le telecamere al buio", "Il negoziatore carismatico che distrae tutti", "L'autista spericolato in fuga a tutta velocit\xE0"],
    timeLimitSeconds: 25
  },
  {
    id: "sb_25",
    mode: "SAME_BRAIN",
    category: "intuition",
    prompt: "Quanto siamo sulla stessa lunghezza d'onda in questo preciso istante?",
    options: ["100% \u2014 Leggiamo nel pensiero reciproco", "75% \u2014 In sintonia con qualche colpo di scena", "50% \u2014 Due galassie che si incrociano curiose", "Sorprendimi, sto per ribaltare tutto"],
    timeLimitSeconds: 20
  },
  // --- BLUFF MODE: AUTHENTIC VS FAKE DEDUCTIONS (20 items) ---
  {
    id: "bm_1",
    mode: "BLUFF_MODE",
    category: "bluff",
    prompt: "Quale di queste fobie assurde \xE8 la MIA VERA preferenza/timore segreto?",
    subtext: "Il Bluffer sceglie l'opzione autentica o inventa; l'altro deve smascherare il bluff!",
    options: [
      "Il terrore inspiegabile che i piccioni mi giudichino",
      "L'angoscia che le porte degli ascensori si chiudano troppo presto",
      "L'odio viscerale per il rumore dei palloncini gonfiati",
      "La paura di mandare uno screenshot compromettente alla persona stessa"
    ],
    timeLimitSeconds: 35
  },
  {
    id: "bm_2",
    mode: "BLUFF_MODE",
    category: "bluff",
    prompt: "Quale tra questi \xE8 il mio reale \xABguilty pleasure\xBB inconfessabile?",
    options: [
      "Guardare drama trash e soap opera di bassa lega alle 2 di notte",
      "Mangiare formaggio fuso direttamente con le dita",
      "Sapere a memoria testi di canzoni dei cartoni animati anni 90",
      "Fare conversazioni simulate allo specchio per sembrare misterioso"
    ],
    timeLimitSeconds: 35
  },
  {
    id: "bm_3",
    mode: "BLUFF_MODE",
    category: "bluff",
    prompt: "Quale bugia innocente ho detto pi\xF9 spesso nella mia vita per evitare un impegno?",
    options: [
      "\xABScusa ho un mal di testa fulminante, devo stare a letto\xBB",
      "\xABNon ho sentito il telefono perch\xE9 era in modalit\xE0 aereo\xBB",
      "\xABDevo aiutare un parente con un trasloco improvviso\xBB",
      "\xABSono rimasto bloccato in un traffico surreale\xBB"
    ],
    timeLimitSeconds: 35
  },
  {
    id: "bm_4",
    mode: "BLUFF_MODE",
    category: "bluff",
    prompt: "Quale tra queste abitudini bizzarre \xE8 autenticamente mia?",
    options: [
      "Mettere la sveglia 45 minuti prima per posticiparla 6 volte",
      "Riorganizzare le app dello smartphone per gradiente di colore",
      "Bere l'acqua solo ed esclusivamente ghiacciata anche a gennaio",
      "Leggere l'ultima pagina di un libro prima di comprarlo"
    ],
    timeLimitSeconds: 35
  },
  {
    id: "bm_5",
    mode: "BLUFF_MODE",
    category: "bluff",
    prompt: "Se potessi avere una stanza segreta a casa mia, quale sarebbe la VERIT\xC0?",
    options: [
      "Un cinema privato con soffitto stellato e cuscini giganti",
      "Un laboratorio segreto con specchi e console retro-gaming",
      "Una stanza insonorizzata dove urlare o ascoltare musica a palla",
      "Una serra tropicale notturna illuminata da neon lilla"
    ],
    timeLimitSeconds: 35
  },
  {
    id: "bm_6",
    mode: "BLUFF_MODE",
    category: "bluff",
    prompt: "Quale di queste abilit\xE0 insolite vorrei davvero saper fare alla perfezione?",
    options: [
      "Leggere le persone dal linguaggio del corpo in 3 secondi",
      "Saper suonare il pianoforte a orecchio senza spartito",
      "Cucinare piatti stellati con 4 avanzi trovati in dispensa",
      "Parlare fluentemente 5 lingue senza accento"
    ],
    timeLimitSeconds: 35
  },
  {
    id: "bm_7",
    mode: "BLUFF_MODE",
    category: "bluff",
    prompt: "Quale ricordo d'infanzia imbarazzante si avvicina di pi\xF9 al vero?",
    options: [
      "Essere rimasto incastrato a testa in gi\xF9 in un parco giochi",
      "Aver salutato calorosamente un manichino scambiandolo per mia madre",
      "Aver provato a volare con un ombrello come Mary Poppins",
      "Aver nascosto le verdure dietro un termosifone per settimane"
    ],
    timeLimitSeconds: 35
  },
  {
    id: "bm_8",
    mode: "BLUFF_MODE",
    category: "bluff",
    prompt: "Cosa penso DAVVERO quando qualcuno ci vede insieme?",
    options: [
      "\xABSembriamo i protagonisti fighi di un anime cyber-chic\xBB",
      "\xABSembriamo due disastri ambulanti ma adorabili\xBB",
      "\xABChiss\xE0 se la gente si chiede come facciamo a sopportarci\xBB",
      "\xABEmaniamo un'aura di mistero assolutamente irresistibile\xBB"
    ],
    timeLimitSeconds: 35
  },
  {
    id: "bm_9",
    mode: "BLUFF_MODE",
    category: "bluff",
    prompt: "Qual \xE8 il mio vero talento nascosto che nessuno sospetta?",
    options: [
      "Indovinare i finali dei film dopo i primi 15 minuti",
      "Imitare alla perfezione gli accenti regionali",
      "Riconoscere le canzoni dai primi due accordi",
      "Tener testa a chiunque in un dibattito assurdo"
    ],
    timeLimitSeconds: 35
  },
  {
    id: "bm_10",
    mode: "BLUFF_MODE",
    category: "bluff",
    prompt: "Se dovessi scusarmi per un mio difetto con te, quale sarebbe la sincera verit\xE0?",
    options: [
      "A volte rispondo con calma biblica anche se ho letto subito",
      "Posso diventare un po' competitivo anche nei giochi da tavolo",
      "Mi distraggo guardando dettagli insignificanti mentre parli",
      "Faccio battute nei momenti meno opportuni"
    ],
    timeLimitSeconds: 35
  },
  {
    id: "bm_11",
    mode: "BLUFF_MODE",
    category: "bluff",
    prompt: "Quale di questi viaggi da sogno sceglierei ORA senza pensarci?",
    options: [
      "Islanda sotto l'aurora boreale in una cupola trasparente",
      "Kyoto durante la fioritura dei ciliegi nei vicoli antichi",
      "Un road trip sulla costa atlantica con musica a tutto volume",
      "Un rifugio sulle Alpi svizzere con vasca calda sulla neve"
    ],
    timeLimitSeconds: 35
  },
  {
    id: "bm_12",
    mode: "BLUFF_MODE",
    category: "bluff",
    prompt: "Qual \xE8 il mio rapporto autentico con i complimenti?",
    options: [
      "Fingo indifferenza ma ci ripenso per i successivi 3 giorni",
      "Divento subito rosso e cerco di deviare l'attenzione",
      "Li incasso con nonchalance come se me li aspettassi",
      "Rispondo con un complimento doppio per sdebitarmi subito"
    ],
    timeLimitSeconds: 35
  },
  {
    id: "bm_13",
    mode: "BLUFF_MODE",
    category: "bluff",
    prompt: "Quale tra questi tratti mi attrae o incuriosisce di pi\xF9 in una persona?",
    options: [
      "Un senso dell'umorismo tagliente e imprevedibile",
      "La passione travolgente per qualcosa di insolito",
      "La gentilezza discreta che non cerca applausi",
      "Uno sguardo magnetico che sembra leggerti dentro"
    ],
    timeLimitSeconds: 35
  },
  {
    id: "bm_14",
    mode: "BLUFF_MODE",
    category: "bluff",
    prompt: "Cosa farei se a cena mi servissero un piatto totalmente sbagliato?",
    options: [
      "Lo mangio comunque senza dire nulla per non disturbare",
      "Faccio presente l'errore col sorriso pi\xF9 dolce e diplomatico",
      "Chiedo all'altra persona se vuole fare a met\xE0 col suo",
      "Lo analizzo come se fosse un'esperienza gastronomica imprevista"
    ],
    timeLimitSeconds: 35
  },
  {
    id: "bm_15",
    mode: "BLUFF_MODE",
    category: "bluff",
    prompt: "Qual \xE8 la prima cosa che ho notato o pensato di te quando ci siamo parlati?",
    options: [
      "\xABHa un'energia magnetica e curiosa\xBB",
      "\xABScommetto che \xE8 molto pi\xF9 imprevedibile di quanto mostri\xBB",
      "\xABMi sento a mio agio molto pi\xF9 in fretta del solito\xBB",
      "\xABDobbiamo assolutamente sfidarci a qualcosa per metterci alla prova\xBB"
    ],
    timeLimitSeconds: 35
  },
  // --- CHAOS ROUND: FAST 20-60S CHALLENGES (25 items) ---
  {
    id: "cr_1",
    mode: "CHAOS_ROUND",
    category: "absurdity",
    prompt: "Dilemma Rapido: Preferiresti avere le dita che suonano come campanelli ogni volta che tocchi qualcosa, o dover parlare cantando come in un musical ogni volta che sei agitato?",
    options: ["Dita campanelli tintinnanti", "Musical teatrale obbligatorio"],
    timeLimitSeconds: 20
  },
  {
    id: "cr_2",
    mode: "CHAOS_ROUND",
    category: "creativity",
    prompt: "Inventa il peggior nome possibile per una catena di pizzerie gourmet:",
    subtext: "Scrivi una risposta breve e delirante!",
    allowCustom: true,
    timeLimitSeconds: 35
  },
  {
    id: "cr_3",
    mode: "CHAOS_ROUND",
    category: "creativity",
    prompt: "Descrivi la trama di un film fantascientifico inESISTENTE usando solo 5 parole:",
    subtext: 'Es: "Gatti cibernetici conquistano la Luna"',
    allowCustom: true,
    timeLimitSeconds: 35
  },
  {
    id: "cr_4",
    mode: "CHAOS_ROUND",
    category: "absurdity",
    prompt: "Scelta Istintiva: Se fossi costretto a convivere con un dinosauro in salotto, quale sceglieresti?",
    options: ["Un T-Rex formato tascabile (20 cm)", "Un Brontosauro gigante ma pacifista", "Un Velociraptor che fa le fusa come un gatto", "Uno Pterodattilo che ruba telecomandi"],
    timeLimitSeconds: 20
  },
  {
    id: "cr_5",
    mode: "CHAOS_ROUND",
    category: "creativity",
    prompt: "Crea uno slogan accattivante per un cuscino ripieno di spaghetti:",
    subtext: "Basta una frase memorabile!",
    allowCustom: true,
    timeLimitSeconds: 30
  },
  {
    id: "cr_6",
    mode: "CHAOS_ROUND",
    category: "absurdity",
    prompt: "Completa la frase: \xABNon fidarti mai di qualcuno che\u2026\xBB",
    options: [
      "\u2026non mangia i bordi della pizza",
      "\u2026ha sempre la batteria del telefono al 100%",
      "\u2026non ride alle proprie battute pessime",
      "\u2026cammina troppo dritto alle 8 di mattina"
    ],
    timeLimitSeconds: 25
  },
  {
    id: "cr_7",
    mode: "CHAOS_ROUND",
    category: "creativity",
    prompt: "Se dovessimo inventare una nuova festivit\xE0 mondiale, quale sarebbe?",
    options: [
      "La Giornata Mondiale del Sonnellino Pomeridiano Senza Sensi di Colpa",
      "Il Giorno delle Verit\xE0 Imbarazzanti con Cioccolata Calda",
      "La Notte Senza Notifiche e Solo Stelle Cadenti",
      "Il Festival del Cibo Confortevole a Letto"
    ],
    timeLimitSeconds: 25
  },
  {
    id: "cr_8",
    mode: "CHAOS_ROUND",
    category: "creativity",
    prompt: "Inventa un prodotto futuristico assolutamente inutile:",
    subtext: "Scrivi il nome o l'effetto del prodotto!",
    allowCustom: true,
    timeLimitSeconds: 30
  },
  {
    id: "cr_9",
    mode: "CHAOS_ROUND",
    category: "absurdity",
    prompt: "Dilemma Spaziale: Preferiresti essere teletrasportato 500 anni nel passato o 500 anni nel futuro?",
    options: ["500 anni nel passato (tra castelli e pericoli)", "500 anni nel futuro (tra navicelle e cyborg)"],
    timeLimitSeconds: 20
  },
  {
    id: "cr_10",
    mode: "CHAOS_ROUND",
    category: "creativity",
    prompt: "Tre parole per descrivere l'umore perfetto per il nostro prossimo incontro:",
    options: [
      "Risate, pizza e mistero",
      "Tranquillit\xE0, musica e chiacchiere",
      "Avventura, imprevisti e follia",
      "Caff\xE8, complicit\xE0 e confidenze"
    ],
    timeLimitSeconds: 25
  },
  {
    id: "cr_11",
    mode: "CHAOS_ROUND",
    category: "absurdity",
    prompt: "Se fossimo costretti a scambiarci i corpi per 24 ore, cosa faresti per prima cosa?",
    options: [
      "Guardarmi allo specchio e fare pose drammatiche",
      "Mandare messaggi criptici ai tuoi amici per confonderli",
      "Mangiare tutto quello che c'\xE8 nel tuo frigorifero",
      "Cercare di capire come funziona il tuo cervello"
    ],
    timeLimitSeconds: 25
  },
  {
    id: "cr_12",
    mode: "CHAOS_ROUND",
    category: "creativity",
    prompt: "Dai un titolo alla nostra biografia non autorizzata:",
    subtext: "Scrivi un titolo esilarante!",
    allowCustom: true,
    timeLimitSeconds: 30
  },
  {
    id: "cr_13",
    mode: "CHAOS_ROUND",
    category: "absurdity",
    prompt: "Dilemma del Gusto: Scegli il male minore:",
    options: ["Caff\xE8 al sapore di cipolla", "Cioccolato al sapore di dentifricio"],
    timeLimitSeconds: 20
  },
  {
    id: "cr_14",
    mode: "CHAOS_ROUND",
    category: "absurdity",
    prompt: "In una sfida di sguardi senza battere ciglio, chi cede prima?",
    options: ["Io, inizio a ridere dopo tre secondi netti", "Tu, perdi la concentrazione subito", "Resistiamo entrambi fino a lacrimare", "Uno dei due fa una smorfia illegale per barare"],
    timeLimitSeconds: 20
  },
  {
    id: "cr_15",
    mode: "CHAOS_ROUND",
    category: "creativity",
    prompt: "Qual \xE8 il miglior complimento non convenzionale che potresti ricevere?",
    options: [
      "\xABCon te il tempo scorre a una velocit\xE0 diversa\xBB",
      "\xABHai il gusto musicale pi\xF9 caotico e affascinante che abbia mai visto\xBB",
      "\xABFaresti sembrare divertente anche una fila alle poste\xBB",
      "\xABNon riesco mai a prevedere cosa farai nei prossimi dieci secondi\xBB"
    ],
    timeLimitSeconds: 25
  },
  // --- SECRET CHEMISTRY SPECIAL QUESTIONS (10 items) ---
  {
    id: "chem_primary",
    mode: "SECRET_CHEMISTRY",
    category: "chemistry",
    prompt: "La persona con cui stai giocando ti piace?",
    subtext: "Le risposte sono rigidamente private fino alla rivelazione sincronizzata. Nessun giudizio, solo autenticit\xE0.",
    options: ["S\xEC.", "No.", "Non lo so ancora.", "Preferisco non rispondere."],
    timeLimitSeconds: 45
  },
  {
    id: "chem_alt_1",
    mode: "SECRET_CHEMISTRY",
    category: "chemistry",
    prompt: "Ti piacerebbe conoscere questa persona meglio anche fuori dal gioco?",
    subtext: "Rispondi secondo il tuo sentire. La rivelazione avverr\xE0 solo quando entrambi avrete inviato la risposta.",
    options: ["S\xEC, assolutamente.", "No, sto bene cos\xEC.", "Forse, con calma.", "Preferisco non rispondere."],
    timeLimitSeconds: 45
  },
  {
    id: "chem_alt_2",
    mode: "SECRET_CHEMISTRY",
    category: "chemistry",
    prompt: "Se questa persona ti proponesse di uscire o passare una serata insieme, accetteresti?",
    subtext: "Momento di sintonia pura: le vostre risposte appariranno insieme sullo schermo.",
    options: ["Accetterei volentieri.", "No, preferisco di no.", "Ci penserei seriamente.", "Preferisco non rispondere."],
    timeLimitSeconds: 45
  },
  {
    id: "chem_alt_3",
    mode: "SECRET_CHEMISTRY",
    category: "chemistry",
    prompt: "Ti incuriosisce scoprire come sarebbe passare pi\xF9 tempo insieme?",
    subtext: "Un momento intimo e divertente tra di voi.",
    options: ["Molto incuriosito/a.", "No, non particolarmente.", "Un po' curioso/a s\xEC.", "Preferisco non rispondere."],
    timeLimitSeconds: 45
  },
  {
    id: "chem_alt_4",
    mode: "SECRET_CHEMISTRY",
    category: "chemistry",
    prompt: "Senti che tra voi c'\xE8 una scintilla o complicit\xE0 speciale?",
    options: ["S\xEC, la percepisco chiaramente.", "No, siamo solo buoni conoscenti.", "C'\xE8 del potenziale interessante.", "Preferisco non rispondere."],
    timeLimitSeconds: 45
  }
];
var WILD_EVENTS = [
  {
    id: "we_double_points",
    name: "DOUBLE POINTS \u2728",
    description: "La sincronia raddoppia! Questo round assegna il 200% dei punti a entrambi i giocatori in caso di successo.",
    type: "DOUBLE_POINTS",
    multiplier: 2,
    durationRounds: 1
  },
  {
    id: "we_role_reversal",
    name: "ROLE REVERSAL \u{1F504}",
    description: "Inversione dei ruoli quantica! Chi doveva bluffare ora deve dedurre, chi deduceva ora inventa la trappola.",
    type: "ROLE_REVERSAL",
    durationRounds: 1
  },
  {
    id: "we_secret_bonus",
    name: "SECRET RESONANCE \u{1F48E}",
    description: "Frequenza armonica attiva: se le risposte coincidono entro 10 secondi, scatta un bonus di 50 punti ekstra!",
    type: "SECRET_BONUS",
    durationRounds: 1
  },
  {
    id: "we_quick_chaos",
    name: "QUICK CHAOS \u26A1",
    description: "Timer lampo! Il tempo per rispondere \xE8 dimezzato: solo riflessi puri e zero tempo per pensare!",
    type: "QUICK_CHAOS",
    durationRounds: 1
  },
  {
    id: "we_risk_it",
    name: "RISK IT ALL \u{1F3B2}",
    description: "Scommessa d'onore: risposta corretta = +150 punti, risposta discorde = -30 punti! Vale la pena osare?",
    type: "RISK_IT",
    durationRounds: 1
  }
];

// src/game/scoring.ts
function normalizeText(text) {
  if (!text) return "";
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, "").replace(/\s+/g, " ").trim();
}
function areAnswersMatching(ans1, ans2) {
  if (!ans1 || !ans2) return false;
  const n1 = normalizeText(ans1);
  const n2 = normalizeText(ans2);
  if (n1 === n2) return true;
  if (n1.length > 4 && n2.length > 4) {
    if (n1.includes(n2) || n2.includes(n1)) {
      return true;
    }
  }
  return false;
}
function evaluateSameBrainScore(ans1, ans2, p1Id, p2Id, wildEvent, responseTimes) {
  const isMatch = areAnswersMatching(ans1, ans2);
  const pointsAwarded = { [p1Id]: 0, [p2Id]: 0 };
  let basePoints = isMatch ? 100 : 20;
  let explanation = isMatch ? "\u2728 Sulla stessa lunghezza d'onda! Risposte sincronizzate!" : "\u{1F4AB} Frequenze diverse stavolta, ma la curiosit\xE0 cresce!";
  if (wildEvent?.type === "DOUBLE_POINTS" && isMatch) {
    basePoints *= 2;
    explanation += " (Double Points attivo: 200 pt!)";
  } else if (wildEvent?.type === "RISK_IT") {
    if (isMatch) {
      basePoints = 150;
      explanation += " (Rischio premiato: +150 pt!)";
    } else {
      basePoints = -30;
      explanation += " (Rischio mancato: -30 pt!)";
    }
  } else if (wildEvent?.type === "SECRET_BONUS" && isMatch) {
    basePoints += 50;
    explanation += " (Risonanza rapida: +50 bonus!)";
  }
  pointsAwarded[p1Id] = basePoints;
  pointsAwarded[p2Id] = basePoints;
  const reaction = isMatch ? basePoints >= 150 ? "excited" : "happy" : "curious";
  return {
    isMatch,
    pointsAwarded,
    reaction,
    streakIncrement: isMatch ? 1 : 0,
    explanation
  };
}
function evaluateBluffScore(blufferId, guesserId, actualSecret, guess, wildEvent) {
  const normalizedActual = normalizeText(actualSecret);
  const normalizedGuess = normalizeText(guess);
  const detectiveWon = normalizedActual === normalizedGuess;
  const bluffSuccess = !detectiveWon;
  let detectivePoints = detectiveWon ? 120 : 20;
  let blufferPoints = bluffSuccess ? 120 : 30;
  let multiplier = 1;
  if (wildEvent?.type === "DOUBLE_POINTS") {
    multiplier = 2;
    detectivePoints *= 2;
    blufferPoints *= 2;
  }
  const pointsAwarded = {
    [guesserId]: detectivePoints,
    [blufferId]: blufferPoints
  };
  const explanation = detectiveWon ? "\u{1F50D} Smantellato! Il detective ha intuito la verit\xE0 autentica!" : "\u{1F3AD} Bluff perfetto! L'illusione \xE8 andata a segno!";
  return {
    bluffSuccess,
    pointsAwarded,
    blufferReaction: bluffSuccess ? "smug" : "surprised",
    guesserReaction: detectiveWon ? "excited" : "confused",
    explanation
  };
}
function evaluateSecretChemistry(p1AnsRaw, p2AnsRaw) {
  const p1 = normalizeText(p1AnsRaw);
  const p2 = normalizeText(p2AnsRaw);
  const hasWord = (text, words) => {
    return words.some((w) => {
      const regex = new RegExp(`(^|\\s)${w}(\\s|$)`, "i");
      return regex.test(text) || text.includes(w);
    });
  };
  const isYes = (t) => {
    return /\b(si|yes|volentieri|assolutamente|molto)\b/i.test(t);
  };
  const isNo = (t) => {
    return /\b(no|non)\b/i.test(t) && !t.includes("non lo so");
  };
  const isUnsure = (t) => {
    return t.includes("non lo so") || t.includes("forse") || t.includes("penserei") || t.includes("potenziale") || t.includes("curioso");
  };
  const isPass = (t) => {
    return t.includes("preferisco") || t.includes("rispondere") || t.includes("passo") || t.trim() === "";
  };
  const p1Yes = isYes(p1);
  const p2Yes = isYes(p2);
  const p1No = isNo(p1);
  const p2No = isNo(p2);
  const p1Unsure = isUnsure(p1);
  const p2Unsure = isUnsure(p2);
  const p1Pass = isPass(p1);
  const p2Pass = isPass(p2);
  if (p1Yes && p2Yes) {
    return {
      p1Answer: p1AnsRaw,
      p2Answer: p2AnsRaw,
      type: "MUTUAL_VIBE",
      title: "\u2728 Mutual Vibe \u2014 Risonanza Cosmica!",
      description: "Entrambi avete risposto di s\xEC! Una scintilla reciproca, dolce e luminosa come una supernova. La vostra sintonia \xE8 tangibile!",
      badge: "\u{1F49E} Cosmic Resonance"
    };
  }
  if (p1Yes && p2Unsure || p2Yes && p1Unsure) {
    return {
      p1Answer: p1AnsRaw,
      p2Answer: p2AnsRaw,
      type: "PLOT_TWIST",
      title: "\u{1F300} Unexpected Plot Twist \u2014 Curiosit\xE0 nell'Aria",
      description: "Uno slancio da una parte, una porta aperta dall'altra! C'\xE8 curiosit\xE0 e un bel mistero da esplorare senza fretta.",
      badge: "\u{1F52E} Spark in Motion"
    };
  }
  if (p1Yes && p1Pass || p2Yes && p2Pass) {
    return {
      p1Answer: p1AnsRaw,
      p2Answer: p2AnsRaw,
      type: "ONE_SIDED_SIGNAL",
      title: "\u{1F54A}\uFE0F Segnale Discreto \u2014 Rispetto & Leggerezza",
      description: "Uno sguardo sincero e un riserbo rispettato. Il gioco continua fluido e allegro, nella piena complicit\xE0 tra amici.",
      badge: "\u{1F338} Gentle Breeze"
    };
  }
  if (p1Yes && p2No || p2Yes && p1No) {
    return {
      p1Answer: p1AnsRaw,
      p2Answer: p2AnsRaw,
      type: "DIFFERENT_FEELINGS",
      title: "\u{1F31F} Frequenze Distinte \u2014 Onest\xE0 Totale",
      description: "Limpidezza e trasparenza! Il bello di Same Wavelength \xE8 scoprire chi siamo davvero, ridendo insieme senza alcuna pressione.",
      badge: "\u{1F90D} Pure Transparency"
    };
  }
  if (p1Unsure && p2Unsure) {
    return {
      p1Answer: p1AnsRaw,
      p2Answer: p2AnsRaw,
      type: "BOTH_CURIOUS",
      title: "\u{1F440} Both Curious \u2014 Due Orbite in Avvicinamento",
      description: "Nessuno dei due si sbilancia troppo, ma entrambi siete intrigati! Un dolce enigma che il tempo potrebbe svelare.",
      badge: "\u{1F319} Mysterious Orbit"
    };
  }
  if (p1Pass && p2Pass) {
    return {
      p1Answer: p1AnsRaw,
      p2Answer: p2AnsRaw,
      type: "BOTH_PASSING",
      title: "\u{1F92B} Custodi del Segreto \u2014 Intesa Tattica",
      description: "Entrambi avete scelto la privacy! I vostri pensieri restano protetti in una bolla speciale. Avanti tutta con la sfida!",
      badge: "\u{1F6E1}\uFE0F Enigma Shield"
    };
  }
  return {
    p1Answer: p1AnsRaw,
    p2Answer: p2AnsRaw,
    type: "MUTUAL_MYSTERY",
    title: "\u{1F30C} Mutual Mystery \u2014 Onde Indecifrabili",
    description: "Le risposte sfumano in un territorio tutto vostro. Niente etichette forzate, solo divertimento e mistero.",
    badge: "\u{1F4AB} Galactic Enigma"
  };
}
function calculateWavelength(history) {
  if (!history || history.length === 0) return 75;
  const matches = history.filter((h) => h.matched).length;
  const total = history.length;
  const ratio = matches / total;
  return Math.min(99, Math.round(50 + ratio * 48));
}

// src/server/gameServer.ts
var GameServer = class {
  constructor() {
    this.rooms = /* @__PURE__ */ new Map();
    setInterval(() => {
      const now = Date.now();
      for (const [code, room] of this.rooms.entries()) {
        if (now - room.lastUpdate > 3 * 60 * 60 * 1e3) {
          if (room.timerInterval) clearInterval(room.timerInterval);
          this.rooms.delete(code);
        }
      }
    }, 15 * 60 * 1e3);
  }
  generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  createRoom(hostName, hostMascot = "lumi", hostAccessory = "none", settingsPartial) {
    let roomCode = this.generateRoomCode();
    while (this.rooms.has(roomCode)) {
      roomCode = this.generateRoomCode();
    }
    const hostId = "p_" + Math.random().toString(36).substring(2, 9);
    const hostProfile = {
      id: hostId,
      name: hostName.trim() || "Giocatore 1",
      mascot: hostMascot,
      color: hostMascot === "lumi" ? "#38bdf8" : "#c084fc",
      accessory: hostAccessory || "none",
      isHost: true,
      isReady: true,
      score: 0,
      streak: 0,
      connected: true,
      lastActive: Date.now()
    };
    const defaultSettings = {
      totalRounds: 10,
      allowSecretChemistry: true,
      includeNegativeOption: true,
      soundEnabled: true,
      reducedMotion: false,
      notificationsEnabled: true,
      ...settingsPartial
    };
    const shuffledCatalog = [...GAME_CATALOG].sort(() => Math.random() - 0.5);
    const room = {
      roomCode,
      createdAt: Date.now(),
      status: "LOBBY",
      players: {
        [hostId]: hostProfile
      },
      playerOrder: [hostId],
      settings: defaultSettings,
      roundHistory: [],
      stats: {
        totalMatches: 0,
        bluffsSucceeded: 0,
        bluffsBusted: 0,
        wavelengthScore: 75
      },
      lastUpdate: Date.now(),
      secretAnswers: {},
      catalogQueue: shuffledCatalog,
      sseClients: /* @__PURE__ */ new Map()
    };
    this.rooms.set(roomCode, room);
    return { roomCode, playerId: hostId };
  }
  joinRoom(roomCode, playerName, mascot, accessory = "none") {
    const code = roomCode.toUpperCase().trim();
    const room = this.rooms.get(code);
    if (!room) {
      return { playerId: "", success: false, error: "Stanza non trovata! Verifica il codice." };
    }
    const currentPlayers = Object.values(room.players);
    if (currentPlayers.length >= 2) {
      return { playerId: "", success: false, error: "La stanza \xE8 gi\xE0 piena (massimo 2 giocatori)." };
    }
    const playerId = "p_" + Math.random().toString(36).substring(2, 9);
    const hostMascot = currentPlayers[0]?.mascot;
    const assignedMascot = mascot || (hostMascot === "lumi" ? "nova" : "lumi");
    const profile = {
      id: playerId,
      name: playerName.trim() || "Giocatore 2",
      mascot: assignedMascot,
      color: assignedMascot === "lumi" ? "#38bdf8" : "#c084fc",
      accessory: accessory || "none",
      isHost: false,
      isReady: true,
      score: 0,
      streak: 0,
      connected: true,
      lastActive: Date.now()
    };
    room.players[playerId] = profile;
    room.playerOrder.push(playerId);
    room.lastUpdate = Date.now();
    this.broadcast(code, {
      type: "PLAYER_JOINED",
      message: `${profile.name} \xE8 entrato nella stanza!`
    });
    return { playerId, success: true };
  }
  registerSSE(roomCode, playerId, res) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) {
      res.status(404).end();
      return;
    }
    room.sseClients.set(playerId, res);
    if (room.players[playerId]) {
      room.players[playerId].connected = true;
      room.players[playerId].lastActive = Date.now();
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    this.sendToClient(res, playerId, room);
    const pingInterval = setInterval(() => {
      res.write(": ping\n\n");
    }, 15e3);
    res.on("close", () => {
      clearInterval(pingInterval);
      room.sseClients.delete(playerId);
      if (room.players[playerId]) {
        room.players[playerId].connected = false;
      }
      this.broadcast(roomCode, {
        type: "PLAYER_DISCONNECTED",
        playerId
      });
    });
  }
  setPlayerReady(roomCode, playerId, isReady) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || !room.players[playerId]) return;
    room.players[playerId].isReady = isReady;
    room.lastUpdate = Date.now();
    this.broadcast(roomCode);
  }
  updatePlayerProfile(roomCode, playerId, updates) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || !room.players[playerId]) return;
    Object.assign(room.players[playerId], updates);
    room.lastUpdate = Date.now();
    this.broadcast(roomCode);
  }
  startGame(roomCode, requesterId) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false, error: "Stanza non trovata" };
    const players = Object.values(room.players);
    if (players.length < 2) {
      return { success: false, error: "Attendi il secondo giocatore prima di iniziare!" };
    }
    room.status = "IN_PROGRESS";
    room.stats.totalMatches = 0;
    room.roundHistory = [];
    room.lastUpdate = Date.now();
    this.startNextRound(room);
    return { success: true };
  }
  startNextRound(room) {
    if (room.timerInterval) {
      clearInterval(room.timerInterval);
      room.timerInterval = null;
    }
    const currentRoundNum = (room.currentRound?.roundNumber || 0) + 1;
    if (currentRoundNum > room.settings.totalRounds) {
      this.finishGame(room);
      return;
    }
    room.secretAnswers = {};
    let targetMode = "SAME_BRAIN";
    const hasSecretChemistryAlready = room.roundHistory.some((h) => h.mode === "SECRET_CHEMISTRY");
    if (room.settings.allowSecretChemistry && !hasSecretChemistryAlready && (currentRoundNum === 5 || currentRoundNum === Math.floor(room.settings.totalRounds / 2))) {
      targetMode = "SECRET_CHEMISTRY";
    } else {
      const mod = currentRoundNum % 4;
      if (mod === 1 || mod === 3) targetMode = "SAME_BRAIN";
      else if (mod === 2) targetMode = "BLUFF_MODE";
      else targetMode = "CHAOS_ROUND";
    }
    let catalogItem = room.catalogQueue.find((item) => item.mode === targetMode);
    if (!catalogItem) {
      catalogItem = GAME_CATALOG.find((item) => item.mode === targetMode) || GAME_CATALOG[0];
    } else {
      room.catalogQueue = room.catalogQueue.filter((item) => item.id !== catalogItem.id);
    }
    let wildEvent = null;
    if (targetMode !== "SECRET_CHEMISTRY" && Math.random() < 0.35 && currentRoundNum > 1) {
      wildEvent = WILD_EVENTS[Math.floor(Math.random() * WILD_EVENTS.length)];
    }
    let blufferId;
    let guesserId;
    if (targetMode === "BLUFF_MODE") {
      const pIndex = currentRoundNum % 2;
      blufferId = room.playerOrder[pIndex];
      guesserId = room.playerOrder[1 - pIndex];
    }
    const submissions = {};
    for (const pId of room.playerOrder) {
      submissions[pId] = { hasSubmitted: false };
    }
    const timeLimit = wildEvent?.type === "QUICK_CHAOS" ? Math.max(15, Math.floor(catalogItem.timeLimitSeconds / 2)) : catalogItem.timeLimitSeconds;
    room.currentRound = {
      roundNumber: currentRoundNum,
      totalRounds: room.settings.totalRounds,
      mode: targetMode,
      catalogItem,
      activeWildEvent: wildEvent,
      blufferId,
      guesserId,
      startTime: Date.now(),
      timeLimit,
      remainingSeconds: timeLimit,
      isTimerPaused: false,
      submissions
    };
    room.lastUpdate = Date.now();
    room.timerInterval = setInterval(() => {
      if (!room.currentRound || room.currentRound.isTimerPaused) return;
      room.currentRound.remainingSeconds -= 1;
      if (room.currentRound.remainingSeconds <= 0) {
        this.handleRoundTimeout(room);
      } else {
        this.broadcast(room.roomCode);
      }
    }, 1e3);
    this.broadcast(room.roomCode, {
      type: "ROUND_STARTED",
      mode: targetMode,
      message: targetMode === "SECRET_CHEMISTRY" ? "\u{1F496} SECRET CHEMISTRY ATTIVATA! Atmosfera speciale..." : `Round ${currentRoundNum}: ${targetMode}`
    });
  }
  submitAnswer(roomCode, playerId, answer) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || !room.currentRound) return { success: false, error: "Nessun round attivo" };
    const round = room.currentRound;
    if (round.submissions[playerId]?.hasSubmitted) {
      return { success: false, error: "Hai gi\xE0 inviato la risposta per questo round." };
    }
    room.secretAnswers[playerId] = answer.trim();
    round.submissions[playerId] = {
      hasSubmitted: true,
      submittedAt: Date.now()
    };
    room.lastUpdate = Date.now();
    const opponentId = room.playerOrder.find((id) => id !== playerId);
    if (opponentId) {
      this.sendPushNotificationToPlayer(room, opponentId, {
        title: "\u26A1 L'avversario ha risposto!",
        body: "Il tuo partner ha inviato la sua scelta. Tocca a te!",
        type: "OPPONENT_SUBMITTED"
      });
    }
    const allSubmitted = room.playerOrder.every((id) => round.submissions[id]?.hasSubmitted);
    if (round.mode === "BLUFF_MODE") {
      if (allSubmitted) {
        this.authorizeReveal(room);
      } else {
        this.broadcast(room.roomCode);
      }
    } else {
      if (allSubmitted) {
        this.authorizeReveal(room);
      } else {
        this.broadcast(room.roomCode);
      }
    }
    return { success: true };
  }
  handleRoundTimeout(room) {
    if (!room.currentRound) return;
    for (const pId of room.playerOrder) {
      if (!room.currentRound.submissions[pId]?.hasSubmitted) {
        room.secretAnswers[pId] = room.currentRound.catalogItem.options?.[0] || "Tempo scaduto!";
        room.currentRound.submissions[pId] = {
          hasSubmitted: true,
          submittedAt: Date.now()
        };
      }
    }
    this.authorizeReveal(room);
  }
  authorizeReveal(room) {
    if (room.timerInterval) {
      clearInterval(room.timerInterval);
      room.timerInterval = null;
    }
    const round = room.currentRound;
    if (!round) return;
    const [p1Id, p2Id] = room.playerOrder;
    const p1Ans = room.secretAnswers[p1Id] || "";
    const p2Ans = room.secretAnswers[p2Id] || "";
    round.revealedAnswers = {
      [p1Id]: p1Ans,
      [p2Id]: p2Ans
    };
    if (round.mode === "SAME_BRAIN") {
      const outcome = evaluateSameBrainScore(
        p1Ans,
        p2Ans,
        p1Id,
        p2Id,
        round.activeWildEvent
      );
      round.roundOutcome = {
        isMatch: outcome.isMatch,
        pointsAwarded: outcome.pointsAwarded,
        mascotReaction: outcome.reaction,
        explanation: outcome.explanation
      };
      room.players[p1Id].score += outcome.pointsAwarded[p1Id];
      room.players[p2Id].score += outcome.pointsAwarded[p2Id];
      if (outcome.isMatch) {
        room.players[p1Id].streak += 1;
        room.players[p2Id].streak += 1;
        room.stats.totalMatches += 1;
      } else {
        room.players[p1Id].streak = 0;
        room.players[p2Id].streak = 0;
      }
    } else if (round.mode === "BLUFF_MODE") {
      const bluffer = round.blufferId || p1Id;
      const guesser = round.guesserId || p2Id;
      const secret = room.secretAnswers[bluffer];
      const guess = room.secretAnswers[guesser];
      const bluffResult = evaluateBluffScore(
        bluffer,
        guesser,
        secret,
        guess,
        round.activeWildEvent
      );
      round.roundOutcome = {
        isMatch: !bluffResult.bluffSuccess,
        pointsAwarded: bluffResult.pointsAwarded,
        mascotReaction: bluffResult.blufferReaction,
        explanation: bluffResult.explanation
      };
      room.players[bluffer].score += bluffResult.pointsAwarded[bluffer];
      room.players[guesser].score += bluffResult.pointsAwarded[guesser];
      if (bluffResult.bluffSuccess) {
        room.stats.bluffsSucceeded += 1;
      } else {
        room.stats.bluffsBusted += 1;
      }
    } else if (round.mode === "CHAOS_ROUND") {
      const points = { [p1Id]: 80, [p2Id]: 80 };
      round.roundOutcome = {
        isMatch: true,
        pointsAwarded: points,
        mascotReaction: "excited",
        explanation: "\u26A1 Sfida del caos completata! Entrambi ottengono 80 punti energia!"
      };
      room.players[p1Id].score += 80;
      room.players[p2Id].score += 80;
    } else if (round.mode === "SECRET_CHEMISTRY") {
      const chemOutcome = evaluateSecretChemistry(p1Ans, p2Ans);
      round.roundOutcome = {
        chemistryOutcome: chemOutcome,
        pointsAwarded: { [p1Id]: 0, [p2Id]: 0 },
        mascotReaction: chemOutcome.type === "MUTUAL_VIBE" ? "heart_eyes" : chemOutcome.type === "PLOT_TWIST" ? "surprised" : "complicity",
        explanation: chemOutcome.description
      };
    }
    room.roundHistory.push({
      roundNumber: round.roundNumber,
      mode: round.mode,
      prompt: round.catalogItem.prompt,
      matched: round.roundOutcome?.isMatch,
      points: round.roundOutcome?.pointsAwarded || { [p1Id]: 0, [p2Id]: 0 }
    });
    room.stats.wavelengthScore = calculateWavelength(room.roundHistory);
    room.lastUpdate = Date.now();
    this.broadcast(room.roomCode, {
      type: "ROUND_REVEAL",
      message: "\u2728 Risposte svelate! Scoprite la vostra sintonia!"
    });
    room.timerInterval = setTimeout(() => {
      this.startNextRound(room);
    }, 8500);
  }
  nextRoundManual(roomCode) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return;
    if (room.timerInterval) {
      clearTimeout(room.timerInterval);
      clearInterval(room.timerInterval);
      room.timerInterval = null;
    }
    this.startNextRound(room);
  }
  finishGame(room) {
    room.status = "FINISHED";
    room.currentRound = void 0;
    room.lastUpdate = Date.now();
    this.broadcast(room.roomCode, {
      type: "GAME_OVER",
      message: "\u{1F389} Partita conclusa! Ecco le vostre statistiche cosmiche!"
    });
  }
  restartGame(roomCode) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false };
    if (room.timerInterval) {
      clearTimeout(room.timerInterval);
      clearInterval(room.timerInterval);
      room.timerInterval = null;
    }
    room.status = "LOBBY";
    room.roundHistory = [];
    room.currentRound = void 0;
    room.secretAnswers = {};
    room.catalogQueue = [...GAME_CATALOG].sort(() => Math.random() - 0.5);
    for (const pId of room.playerOrder) {
      room.players[pId].score = 0;
      room.players[pId].streak = 0;
      room.players[pId].isReady = true;
    }
    room.stats = {
      totalMatches: 0,
      bluffsSucceeded: 0,
      bluffsBusted: 0,
      wavelengthScore: 75
    };
    room.lastUpdate = Date.now();
    this.broadcast(room.roomCode, {
      type: "REMATCH_ACCEPTED",
      message: "Rivincita avviata! Benvenuti di nuovo nella lobby."
    });
    return { success: true };
  }
  /**
   * Sanitizes room state so clients never see unrevealed secret answers of their opponent!
   */
  getSanitizedRoom(room, forPlayerId) {
    const isReveal = !!room.currentRound?.revealedAnswers;
    let sanitizedRound = void 0;
    if (room.currentRound) {
      sanitizedRound = {
        ...room.currentRound,
        // Only include revealedAnswers if server authorized reveal
        revealedAnswers: isReveal ? room.currentRound.revealedAnswers : void 0,
        // Hide bluffer's secret option during deduction phase
        bluffCorrectOption: isReveal ? room.currentRound.bluffCorrectOption : void 0
      };
    }
    return {
      roomCode: room.roomCode,
      createdAt: room.createdAt,
      status: room.status,
      players: room.players,
      playerOrder: room.playerOrder,
      settings: room.settings,
      currentRound: sanitizedRound,
      roundHistory: room.roundHistory,
      stats: room.stats,
      lastUpdate: room.lastUpdate
    };
  }
  broadcast(roomCode, pushEvent) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return;
    for (const [pId, res] of room.sseClients.entries()) {
      this.sendToClient(res, pId, room, pushEvent);
    }
  }
  sendToClient(res, playerId, room, pushEvent) {
    try {
      const sanitized = this.getSanitizedRoom(room, playerId);
      const payload = {
        room: sanitized,
        myPlayerId: playerId,
        serverTime: Date.now()
      };
      res.write(`data: ${JSON.stringify({ type: "SYNC", payload, pushEvent })}

`);
    } catch {
    }
  }
  sendPushNotificationToPlayer(room, playerId, notification) {
    const res = room.sseClients.get(playerId);
    if (res) {
      try {
        res.write(`data: ${JSON.stringify({ type: "PUSH_NOTIFICATION", notification })}

`);
      } catch {
      }
    }
  }
  getRoom(roomCode) {
    return this.rooms.get(roomCode.toUpperCase());
  }
};
var gameServer = new GameServer();

// src/server/serverless.ts
var app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
var router = express.Router();
router.get("/health", (_req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});
router.post("/rooms/create", (req, res) => {
  try {
    const { hostName, mascot, accessory, settings } = req.body || {};
    const result = gameServer.createRoom(hostName, mascot, accessory, settings);
    res.json(result);
  } catch (err) {
    console.error("[API /rooms/create] Error:", err);
    res.status(500).json({ success: false, error: err?.message || "Errore interno del server" });
  }
});
router.post("/rooms/join", (req, res) => {
  try {
    const { roomCode, playerName, mascot, accessory } = req.body || {};
    if (!roomCode) {
      return res.status(400).json({ success: false, error: "Codice stanza mancante." });
    }
    const result = gameServer.joinRoom(roomCode, playerName, mascot, accessory);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error("[API /rooms/join] Error:", err);
    res.status(500).json({ success: false, error: err?.message || "Errore interno del server" });
  }
});
router.get("/rooms/:code/events", (req, res) => {
  try {
    const roomCode = req.params.code;
    const playerId = req.query.playerId;
    if (!roomCode || !playerId) {
      return res.status(400).json({ success: false, error: "roomCode and playerId are required" });
    }
    gameServer.registerSSE(roomCode, playerId, res);
  } catch (err) {
    console.error("[API /rooms/:code/events] Error:", err);
    res.status(500).end();
  }
});
router.get("/rooms/:code/state", (req, res) => {
  try {
    const roomCode = req.params.code;
    const playerId = req.query.playerId;
    const room = gameServer.getRoom(roomCode);
    if (!room) {
      return res.status(404).json({ success: false, error: "Stanza non trovata" });
    }
    const sanitized = gameServer.getSanitizedRoom(room, playerId || "");
    res.json({
      room: sanitized,
      myPlayerId: playerId,
      serverTime: Date.now()
    });
  } catch (err) {
    console.error("[API /rooms/:code/state] Error:", err);
    res.status(500).json({ success: false, error: err?.message || "Errore interno del server" });
  }
});
router.post("/rooms/:code/ready", (req, res) => {
  try {
    const roomCode = req.params.code;
    const { playerId, isReady } = req.body || {};
    gameServer.setPlayerReady(roomCode, playerId, isReady);
    res.json({ success: true });
  } catch (err) {
    console.error("[API /rooms/:code/ready] Error:", err);
    res.status(500).json({ success: false, error: err?.message || "Errore interno del server" });
  }
});
router.post("/rooms/:code/update-profile", (req, res) => {
  try {
    const roomCode = req.params.code;
    const { playerId, updates } = req.body || {};
    gameServer.updatePlayerProfile(roomCode, playerId, updates);
    res.json({ success: true });
  } catch (err) {
    console.error("[API /rooms/:code/update-profile] Error:", err);
    res.status(500).json({ success: false, error: err?.message || "Errore interno del server" });
  }
});
router.post("/rooms/:code/start", (req, res) => {
  try {
    const roomCode = req.params.code;
    const { playerId } = req.body || {};
    const result = gameServer.startGame(roomCode, playerId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error("[API /rooms/:code/start] Error:", err);
    res.status(500).json({ success: false, error: err?.message || "Errore interno del server" });
  }
});
router.post("/rooms/:code/submit", (req, res) => {
  try {
    const roomCode = req.params.code;
    const { playerId, answer } = req.body || {};
    const result = gameServer.submitAnswer(roomCode, playerId, answer);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error("[API /rooms/:code/submit] Error:", err);
    res.status(500).json({ success: false, error: err?.message || "Errore interno del server" });
  }
});
router.post("/rooms/:code/skip-reveal", (req, res) => {
  try {
    const roomCode = req.params.code;
    gameServer.nextRoundManual(roomCode);
    res.json({ success: true });
  } catch (err) {
    console.error("[API /rooms/:code/skip-reveal] Error:", err);
    res.status(500).json({ success: false, error: err?.message || "Errore interno del server" });
  }
});
router.post("/rooms/:code/rematch", (req, res) => {
  try {
    const roomCode = req.params.code;
    const result = gameServer.restartGame(roomCode);
    res.json(result);
  } catch (err) {
    console.error("[API /rooms/:code/rematch] Error:", err);
    res.status(500).json({ success: false, error: err?.message || "Errore interno del server" });
  }
});
app.use("/api", router);
app.use("/", router);
var serverless_default = app;
export {
  serverless_default as default
};
