<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->

![Stars](https://img.shields.io/github/stars/AntonioDS1/node-orizon?style=for-the-badge)
![Forks](https://img.shields.io/github/forks/AntonioDS1/node-orizon?style=for-the-badge)
![Issues](https://img.shields.io/github/issues/AntonioDS1/node-orizon?style=for-the-badge)

<!-- PROJECT TITLE -->
<br />
<div align="center">
  <h3 align="center">Orizon — REST API</h3>

  <p align="center">
    RESTful API per la gestione di utenti, intervalli e obiettivi dell'agenzia di viaggi Orizon,
    pensata per sponsorizzare le offerte dell'ultimo minuto.
    <br />
    Costruita con Node.js, Express e MySQL.
    <br />
    <a href="https://github.com/AntonioDS1/node-orizon"><strong>Visita la repository »</strong></a>
    <br /><br />
    <a href="https://github.com/AntonioDS1/node-orizon/issues">Segnala un Bug</a>
    ·
    <a href="https://github.com/AntonioDS1/node-orizon/issues">Richiedi una Feature</a>
  </p>
</div>

---

## 📑 Indice

- [Overview](#-overview)
- [Funzionalità principali](#-funzionalità-principali)
- [Built With](#️-built-with)
- [Getting Started](#-getting-started)
- [Tutti gli endpoint](#-tutti-gli-endpoint)
- [Come testare l'API live](#-come-testare-lapi-live)
- [Schema del Database](#️-schema-del-database)
- [Struttura del progetto](#-struttura-del-progetto)
- [Scelte di design](#-scelte-di-design)
- [Autore](#-autore)

---

## 🌍 Overview

**Orizon** è un'agenzia di viaggi che promuove un turismo consapevole e sostenibile.
Questo progetto realizza il **backend** delle API necessarie a tracciare gli intervalli di obiettivi degli agenti dell'agenzia, così da identificare i viaggi che hanno bisogno di promozioni last-minute.

Il progetto si concentra su:
- architettura **RESTful** rigorosa (naming, metodi HTTP, status code)
- gestione completa **CRUD** di tre entità (Users, Intervals, Goals)
- **prepared statement** per prevenire SQL Injection
- relazioni **1:N** e **N:M** nel database
- filtri dinamici sugli intervalli (per date e per obiettivi inclusi)
- **gestione errori centralizzata** con pattern asimmetrico (log ricco lato server, risposta sobria al client)

Non è previsto un frontend: il progetto è una API JSON consumabile via Postman, Thunder Client, curl o qualunque client HTTP.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## ✨ Funzionalità principali

### 🔹 1. CRUD completo per Utenti
Creazione, lettura, aggiornamento e cancellazione di utenti con email univoca, nome e cognome.

### 🔹 2. CRUD completo per Intervalli
Ogni intervallo ha una data di inizio, una data di fine e appartiene a un utente specifico (relazione 1:N).

### 🔹 3. CRUD completo per Obiettivi
Catalogo di obiettivi aziendali riutilizzabili (es. "Vendi viaggi in Asia", "Promuovi Bali").

### 🔹 4. Associazione Intervallo ↔ Obiettivo (N:M)
Un obiettivo può essere associato a più intervalli, e un intervallo può contenere più obiettivi, tramite la tabella ponte `interval_goals`.

### 🔹 5. Filtri dinamici sugli intervalli
La rotta `GET /intervals` accetta i seguenti query parameter combinabili:
- `start_date` — solo intervalli che iniziano dalla data indicata in poi
- `end_date` — solo intervalli che finiscono entro la data indicata
- `goal_id` — solo intervalli che includono uno specifico obiettivo

### 🔹 6. Sicurezza contro SQL Injection
Tutte le query usano **prepared statement** (`?` placeholder + array di parametri), evitando concatenazione di input utente nel codice SQL.

### 🔹 7. Bulk delete protette
Le rotte di cancellazione massiva (`DELETE /users`, `DELETE /intervals`, `DELETE /goals`, `DELETE /intervals/goals`) richiedono `?confirm=true` esplicito per evitare cancellazioni accidentali.

### 🔹 8. Gestione errori centralizzata
Middleware di error handling che intercetta tutte le eccezioni e risponde con JSON standardizzato. Status code REST conformi: 200, 201, 204, 400, 404, 409, 500. Il pattern è **asimmetrico**: tutti i dettagli vengono loggati lato server, ma al client viene restituito un messaggio generico per gli errori 500 (per non esporre dettagli interni del database), riservando i messaggi specifici agli errori controllati (400, 404, 409).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🛠️ Built With

- **Node.js** (runtime JavaScript server-side)
- **Express 5** (framework per le API)
- **MySQL 8** (database relazionale)
- **mysql2** (driver MySQL con supporto Promise e prepared statement)
- **dotenv** (gestione variabili d'ambiente)
- **nodemon** (live reload in sviluppo)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🚀 Getting Started

### Prerequisiti

- **Node.js** ≥ 18
- **MySQL** ≥ 8 in esecuzione localmente
- Un client HTTP per testare le API: [Thunder Client](https://www.thunderclient.com/), [Postman](https://www.postman.com/), [Hoppscotch](https://hoppscotch.io) o `curl`

### 1️⃣ Clona la repository

```bash
git clone https://github.com/AntonioDS1/node-orizon.git
cd node-orizon
```

### 2️⃣ Installa le dipendenze

```bash
npm install
```

### 3️⃣ Configura le variabili d'ambiente

Copia il file `.env.example` rinominandolo in `.env`:

```bash
copy .env.example .env       # Windows
cp .env.example .env         # macOS / Linux
```

Apri `.env` e inserisci le tue credenziali MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=la_tua_password_mysql
DB_NAME=orizon
PORT=3000
```

### 4️⃣ Crea il database

Esegui il file `migrations.sql` su MySQL. Puoi farlo via:

**MySQL Workbench**: apri il file (`File → Open SQL Script`), poi esegui (`⚡ Execute SQL Script`).

**Riga di comando**:
```bash
mysql -u root -p < migrations.sql
```

Il file crea il database `orizon` e tutte le tabelle necessarie.

### 5️⃣ Avvia il server

Modalità sviluppo (con auto-reload):
```bash
npm run dev
```

Modalità produzione:
```bash
npm start
```

Il server sarà in ascolto su `http://localhost:3000`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 📡 Tutti gli endpoint

Base URL (locale): `http://localhost:3000`
Base URL (produzione): `https://node-orizon-production.up.railway.app`

Tutte le richieste con body devono avere l'header `Content-Type: application/json`.

### Root

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET` | `/` | Messaggio di benvenuto |
| `GET` | `/test-db` | Verifica connessione al database |

### Users

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `POST` | `/users` | Crea un utente |
| `GET` | `/users` | Lista utenti |
| `GET` | `/users/:id` | Singolo utente |
| `PUT` | `/users/:id` | Modifica utente |
| `DELETE` | `/users/:id` | Cancella utente (cancella anche i suoi intervalli via CASCADE) |
| `DELETE` | `/users?confirm=true` | Cancella tutti gli utenti (bulk) |

**Body per POST / PUT:**
```json
{
  "email": "mario@orizon.it",
  "first_name": "Mario",
  "last_name": "Rossi"
}
```
Tutti i campi sono obbligatori. L'email deve essere unica (un duplicato restituisce `409 Conflict`).

### Intervals

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `POST` | `/intervals` | Crea un intervallo |
| `GET` | `/intervals` | Lista intervalli (supporta filtri) |
| `GET` | `/intervals/:id` | Singolo intervallo con i suoi obiettivi (JOIN) |
| `PUT` | `/intervals/:id` | Modifica intervallo |
| `DELETE` | `/intervals/:id` | Cancella intervallo (cancella anche le associazioni via CASCADE) |
| `DELETE` | `/intervals?confirm=true` | Cancella tutti gli intervalli (bulk) |

**Filtri disponibili sulla GET `/intervals`** (combinabili con `&`):
- `?start_date=YYYY-MM-DD` — intervalli che iniziano da quella data in poi
- `?end_date=YYYY-MM-DD` — intervalli che finiscono entro quella data
- `?goal_id=N` — intervalli che includono l'obiettivo N (JOIN con `interval_goals`)

**Body per POST / PUT:**
```json
{
  "start_date": "2026-06-01",
  "end_date": "2026-06-30",
  "user_id": 1
}
```
Le date devono essere in formato `YYYY-MM-DD` con `end_date >= start_date`. L'`user_id` deve riferirsi a un utente esistente (altrimenti `404`).

**Esempio di risposta di `GET /intervals/:id`** (con goals annidati):
```json
{
  "id": 1,
  "start_date": "2026-06-01",
  "end_date": "2026-06-30",
  "user_id": 1,
  "goals": [
    { "id": 1, "name": "Vendi viaggi Asia", "description": "..." },
    { "id": 2, "name": "Promuovi Bali", "description": "..." }
  ]
}
```

### Goals

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `POST` | `/goals` | Crea un obiettivo |
| `GET` | `/goals` | Lista obiettivi |
| `GET` | `/goals/:id` | Singolo obiettivo |
| `PUT` | `/goals/:id` | Modifica obiettivo |
| `DELETE` | `/goals/:id` | Cancella obiettivo (cancella anche le associazioni via CASCADE) |
| `DELETE` | `/goals?confirm=true` | Cancella tutti gli obiettivi (bulk) |

**Body per POST / PUT:**
```json
{
  "name": "Vendi viaggi Asia",
  "description": "Promozione viaggi in destinazioni asiatiche"
}
```
Il campo `name` è obbligatorio, `description` è opzionale.

### Associazioni Intervallo ↔ Obiettivi (relazione N:M)

La tabella ponte `interval_goals` non è esposta come risorsa autonoma: le associazioni si gestiscono tramite rotte annidate sotto `/intervals`. Le associazioni si **leggono** automaticamente chiamando `GET /intervals/:id`, che restituisce l'intervallo con l'array `goals: [...]` annidato.

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `POST` | `/intervals/:id/goals` | Associa un obiettivo all'intervallo |
| `DELETE` | `/intervals/:id/goals/:goalId` | Rimuove una specifica associazione |
| `DELETE` | `/intervals/goals?confirm=true` | Cancella tutte le associazioni (bulk) |

**Body per POST `/intervals/:id/goals`:**
```json
{
  "goal_id": 1
}
```
Il `goal_id` deve riferirsi a un obiettivo esistente. Non si possono creare associazioni duplicate (la coppia `(interval_id, goal_id)` è primary key composta; un duplicato restituisce `409 Conflict`).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🧪 Come testare l'API live

L'API è disponibile online su Railway: **`https://node-orizon-production.up.railway.app`**

### 🌐 Endpoint GET testabili dal browser

Cliccando i link qui sotto si vede direttamente la risposta JSON nel browser.

**Root & utility:**
- [GET /](https://node-orizon-production.up.railway.app/)
- [GET /test-db](https://node-orizon-production.up.railway.app/test-db)

**Users:**
- [GET /users](https://node-orizon-production.up.railway.app/users) — lista tutti gli utenti
- [GET /users/1](https://node-orizon-production.up.railway.app/users/1) — singolo utente (sostituisci l'id se necessario)

**Intervals:**
- [GET /intervals](https://node-orizon-production.up.railway.app/intervals) — lista tutti gli intervalli
- [GET /intervals/1](https://node-orizon-production.up.railway.app/intervals/1) — singolo intervallo (include i goals annidati)
- [GET /intervals?start_date=2026-06-01](https://node-orizon-production.up.railway.app/intervals?start_date=2026-06-01) — filtro per data di inizio
- [GET /intervals?end_date=2026-12-31](https://node-orizon-production.up.railway.app/intervals?end_date=2026-12-31) — filtro per data di fine
- [GET /intervals?goal_id=1](https://node-orizon-production.up.railway.app/intervals?goal_id=1) — filtro per obiettivo incluso
- [GET /intervals?start_date=2026-06-01&end_date=2026-12-31&goal_id=1](https://node-orizon-production.up.railway.app/intervals?start_date=2026-06-01&end_date=2026-12-31&goal_id=1) — filtri combinati

**Goals:**
- [GET /goals](https://node-orizon-production.up.railway.app/goals) — lista tutti gli obiettivi
- [GET /goals/1](https://node-orizon-production.up.railway.app/goals/1) — singolo obiettivo (sostituisci l'id se necessario)

### ⚡ Test di POST, PUT, DELETE

Le richieste con body (e quelle diverse da GET) non si possono fare direttamente dal browser. Usa uno di questi strumenti gratuiti (nessuna installazione richiesta):

- **Hoppscotch** (consigliato): apri [hoppscotch.io](https://hoppscotch.io), seleziona il metodo, incolla l'URL, vai sulla tab **Body → JSON**, inserisci i dati e premi **Send**.
- **ReqBin**: apri [reqbin.com](https://reqbin.com), seleziona il metodo, incolla l'URL, vai sulla tab **Content → JSON**, inserisci i dati e premi **Send**.
- **Postman / Thunder Client / curl**: tutti supportati.

Esempio con `curl`:
```bash
# Crea un utente
curl -X POST https://node-orizon-production.up.railway.app/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@orizon.it","first_name":"Test","last_name":"User"}'
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🗄️ Schema del Database

Il database è composto da **4 tabelle**.

| Tabella | Descrizione |
|---------|-------------|
| `users` | Utenti (agenti di viaggio) — entità autonoma |
| `goals` | Catalogo degli obiettivi — entità autonoma |
| `intervals_table` | Intervalli di obiettivi assegnati a un utente |
| `interval_goals` | Tabella ponte per la relazione N:M tra intervalli e obiettivi |

### Relazioni

- **users ↔ intervals_table = 1:N**
  Un utente ha molti intervalli; ogni intervallo appartiene a un solo utente. Implementata con la foreign key `intervals_table.user_id`.

- **intervals_table ↔ goals = N:M**
  Un intervallo può includere più obiettivi; uno stesso obiettivo può comparire in più intervalli. Implementata tramite la tabella ponte `interval_goals` con primary key composta `(interval_id, goal_id)`.

### Vincoli di integrità

- Tutte le foreign key hanno **`ON DELETE CASCADE`**: cancellando un utente si cancellano i suoi intervalli (e di conseguenza le loro associazioni); cancellando un goal o un intervallo si cancellano automaticamente le associazioni in `interval_goals`.
- La tabella `intervals_table` ha un **`CHECK (end_date >= start_date)`** che impedisce date incoerenti a livello di database.
- Indici espliciti sui campi usati nei filtri (date e `user_id`) per migliorare le performance delle query.

> **Nota**: la tabella si chiama `intervals_table` (e non `intervals`) perché `INTERVAL` è una parola riservata di MySQL.

### Diagramma testuale

```
users (1) ─────< (N) intervals_table (N) >─────< (M) goals
                                  │
                            interval_goals
                          (tabella ponte N:M)
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 📂 Struttura del progetto

```
node-orizon/
├── src/
│   ├── routes/
│   │   ├── users.js          # CRUD utenti
│   │   ├── intervals.js      # CRUD intervalli + filtri + associazioni
│   │   └── goals.js          # CRUD obiettivi
│   ├── utils/
│   │   ├── errors.js         # httpError(): crea errori con status HTTP
│   │   ├── validation.js     # parseId() e validatori del body (DRY)
│   │   └── db-helpers.js     # ensureXExists(): verifiche di esistenza sul DB
│   ├── db.js                 # Pool di connessione MySQL
│   └── server.js             # Entry point Express + error handler
├── migrations.sql            # Schema del database
├── .env.example              # Template variabili d'ambiente
├── .gitignore
├── package.json
└── README.md
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🧭 Scelte di design

Alcune decisioni architetturali prese consapevolmente nel progetto:

**Ordine delle rotte.** In Express le rotte vengono valutate nell'ordine di dichiarazione e la prima che combacia vince. Le rotte con segmenti letterali (es. `DELETE /intervals/goals`) sono dichiarate **prima** delle rotte con parametri dinamici (es. `DELETE /intervals/:id`) che potrebbero altrimenti "ingoiarle". Questo rende il routing robusto anche a futuri riordini.

**Validazioni riutilizzabili (DRY).** La logica di validazione è estratta in `utils/validation.js`: `parseId()` centralizza il controllo che un id sia un intero positivo, mentre `validateUserBody()`, `validateIntervalBody()` e `validateGoalBody()` validano i rispettivi body. Ogni regola vive in un posto solo.

**Helper di esistenza sul DB.** Le verifiche "questa risorsa esiste?" sono centralizzate in `utils/db-helpers.js` (`ensureUserExists`, `ensureIntervalExists`, `ensureGoalExists`). Vengono usate quando serve verificare una risorsa *diversa* da quella su cui si agisce (es. controllare che l'utente esista prima di creare un intervallo). Per le operazioni dirette su una risorsa per id (UPDATE/DELETE), si usa invece `affectedRows` della query principale, evitando una query in più.

**Error handler asimmetrico.** Il middleware di errore logga **tutti** i dettagli lato server (code, errno, sqlMessage, sqlState, stack) per facilitare il debug, ma al client restituisce un messaggio **generico** per gli errori 500 (per non esporre la struttura interna del database) e messaggi **specifici** solo per gli errori controllati (400, 404, 409). I duplicati MySQL (`ER_DUP_ENTRY`) sono gestiti centralmente come `409 Conflict`.

**Lista leggera vs dettaglio completo.** `GET /intervals` (lista) restituisce gli intervalli **senza** i goals annidati, per due motivi: efficienza (evita un JOIN su ogni elemento) ed evitare l'over-fetching (con la relazione N:M gli stessi goals comparirebbero ripetuti in più intervalli, gonfiando la risposta). La rappresentazione completa con i goals è fornita da `GET /intervals/:id`. Un'eventuale inclusione futura dei goals nella lista andrebbe fatta con un'unica query JOIN e raggruppamento in memoria, mai con una query per ogni intervallo (problema N+1).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---


## 👤 Autore


**Antonio De Siena**

Progetto realizzato per il corso **Start2impact**.


GitHub: [@AntonioDS1](https://github.com/AntonioDS1)


<p align="right">(<a href="#readme-top">back to top</a>)</p>
