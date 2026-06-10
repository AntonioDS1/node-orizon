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

## 🌍 Overview

**Orizon** è un'agenzia di viaggi che promuove un turismo consapevole e sostenibile.
Questo progetto realizza il **backend** delle API necessarie a tracciare gli intervalli di obiettivi degli agenti dell'agenzia, così da identificare i viaggi che hanno bisogno di promozioni last-minute.

Il progetto si concentra su:
- architettura **RESTful** rigorosa (naming, metodi HTTP, status code)
- gestione completa **CRUD** di tre entità (Users, Intervals, Goals)
- **prepared statement** per prevenire SQL Injection
- relazioni 1:N e N:M nel database
- filtri dinamici sugli intervalli (per date e per obiettivi inclusi)

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
Un obiettivo può essere associato a più intervalli, e un intervallo può contenere più obiettivi, tramite tabella ponte `interval_goals`.

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
Middleware di error handling che intercetta tutte le eccezioni e risponde con JSON standardizzato. Status code REST conformi: 200, 201, 204, 400, 404, 409, 500.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 📡 Tutti gli endpoint

Base URL (locale): `http://localhost:3000`
Base URL (produzione): `https://node-orizon-production.up.railway.app`

Tutte le richieste con body devono avere l'header `Content-Type: application/json`.

---

### Root

#### `GET /`
Messaggio di benvenuto.
Nessun body. Risposta esempio:
\`\`\`json
{ "message": "Benvenuto nelle API di Orizon!" }
\`\`\`

#### `GET /test-db`
Verifica la connessione al database (esegue `SELECT 1 + 1`).
Nessun body. Risposta esempio:
\`\`\`json
{ "message": "Connessione al database OK!", "result": 2 }
\`\`\`

---

### Users

#### `POST /users`
Crea un nuovo utente.
Body:
\`\`\`json
{
  "email": "mario@orizon.it",
  "first_name": "Mario",
  "last_name": "Rossi"
}
\`\`\`
Tutti i campi sono obbligatori. L'email deve essere unica.
Risposta: 201 Created con l'utente creato (incluso `id` e `created_at`).

#### `GET /users`
Lista tutti gli utenti. Nessun body.
Risposta: array di utenti.

#### `GET /users/:id`
Singolo utente per id. Nessun body.
Esempio: `GET /users/1`
Risposta: oggetto utente, oppure 404 se non esiste.

#### `PUT /users/:id`
Modifica un utente esistente. Tutti i campi sono **obbligatori**.
Body:
\`\`\`json
{
  "email": "mario.nuovo@orizon.it",
  "first_name": "Mario",
  "last_name": "Rossi"
}
\`\`\`
Risposta: 200 OK con l'utente aggiornato.

#### `DELETE /users/:id`
Cancella un singolo utente. Nessun body.
Risposta: 204 No Content.
**Attenzione**: in cascata vengono cancellati anche tutti gli intervalli dell'utente, e a loro volta le loro associazioni con i goals.

#### `DELETE /users?confirm=true`
Cancella **tutti** gli utenti. Richiede il parametro `?confirm=true` per evitare cancellazioni accidentali.
Nessun body.
Risposta: 200 OK con messaggio di conferma.

---

### Intervals

#### `POST /intervals`
Crea un nuovo intervallo.
Body:
\`\`\`json
{
  "start_date": "2026-06-01",
  "end_date": "2026-06-30",
  "user_id": 1
}
\`\`\`
Tutti i campi sono obbligatori. Le date devono essere in formato `YYYY-MM-DD` e `end_date >= start_date`. L'`user_id` deve riferirsi a un utente esistente.
Risposta: 201 Created.

#### `GET /intervals`
Lista intervalli, con filtri opzionali via query string. Nessun body.

Filtri supportati (combinabili con `&`):
- `?start_date=YYYY-MM-DD` — intervalli che iniziano da quella data in poi
- `?end_date=YYYY-MM-DD` — intervalli che finiscono entro quella data
- `?goal_id=N` — intervalli che includono l'obiettivo N (JOIN con `interval_goals`)

Esempi:
- `GET /intervals`
- `GET /intervals?start_date=2026-06-01`
- `GET /intervals?goal_id=1`
- `GET /intervals?start_date=2026-06-01&end_date=2026-12-31&goal_id=1`

#### `GET /intervals/:id`
Singolo intervallo con i suoi obiettivi annidati (ottenuti via JOIN con la tabella ponte). Nessun body.

Esempio: `GET /intervals/1`
Risposta esempio:
\`\`\`json
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
\`\`\`

#### `PUT /intervals/:id`
Modifica un intervallo esistente. Tutti i campi sono **obbligatori**.
Body:
\`\`\`json
{
  "start_date": "2026-07-01",
  "end_date": "2026-07-31",
  "user_id": 1
}
\`\`\`
Risposta: 200 OK con l'intervallo aggiornato.

#### `DELETE /intervals/:id`
Cancella un singolo intervallo. Nessun body.
Le associazioni con i goals vengono cancellate in cascata.
Risposta: 204 No Content.

#### `DELETE /intervals?confirm=true`
Cancella **tutti** gli intervalli (bulk). Richiede `?confirm=true`.
Nessun body.

---

### Goals

#### `POST /goals`
Crea un nuovo obiettivo.
Body:
\`\`\`json
{
  "name": "Vendi viaggi Asia",
  "description": "Promozione viaggi in destinazioni asiatiche"
}
\`\`\`
Il campo `name` è obbligatorio. `description` è opzionale.
Risposta: 201 Created.

#### `GET /goals`
Lista tutti gli obiettivi. Nessun body.

#### `GET /goals/:id`
Singolo obiettivo per id. Nessun body.
Esempio: `GET /goals/1`

#### `PUT /goals/:id`
Modifica un obiettivo. Il campo `name` è obbligatorio, `description` è opzionale.
Body:
\`\`\`json
{
  "name": "Promuovi Bali — campagna estiva",
  "description": "Aggiornamento della campagna Bali con sconto del 15%"
}
\`\`\`

#### `DELETE /goals/:id`
Cancella un singolo obiettivo. Nessun body.
Le associazioni con gli intervalli vengono cancellate in cascata.

#### `DELETE /goals?confirm=true`
Cancella **tutti** gli obiettivi (bulk). Richiede `?confirm=true`.
Nessun body.

---

### Associazioni Intervallo ↔ Obiettivi (relazione N:M)

La tabella ponte `interval_goals` non è esposta come risorsa autonoma. Le associazioni si gestiscono tramite rotte annidate sotto `/intervals`.

> Le associazioni si **leggono** automaticamente chiamando `GET /intervals/:id`, che restituisce l'intervallo con dentro l'array `goals: [...]` annidato.

#### `POST /intervals/:id/goals`
Associa un obiettivo all'intervallo specificato.
Esempio: `POST /intervals/1/goals`
Body:
\`\`\`json
{
  "goal_id": 1
}
\`\`\`
Il `goal_id` deve riferirsi a un obiettivo esistente. Non si possono creare duplicati (l'associazione è una primary key composta).
Risposta: 201 Created.

#### `DELETE /intervals/:id/goals/:goalId`
Rimuove una specifica associazione tra un intervallo e un obiettivo. Nessun body.
Esempio: `DELETE /intervals/1/goals/2` rimuove l'associazione tra intervallo 1 e goal 2.
Risposta: 204 No Content.

#### `DELETE /intervals/goals?confirm=true`
Cancella **tutte** le associazioni (bulk), senza toccare intervalli o goals.
Richiede `?confirm=true`. Nessun body.
Esempio: `DELETE /intervals/goals?confirm=true`

---

## 🧪 Come testare l'API live


L'API è disponibile online su Railway: `https://node-orizon-production.up.railway.app`


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
- [GET /intervals/1](https://node-orizon-production.up.railway.app/intervals/1) — singolo intervallo (include i suoi goals annidati)
- [GET /intervals?start_date=2026-06-01](https://node-orizon-production.up.railway.app/intervals?start_date=2026-06-01) — filtro per data di inizio
- [GET /intervals?end_date=2026-12-31](https://node-orizon-production.up.railway.app/intervals?end_date=2026-12-31) — filtro per data di fine
- [GET /intervals?goal_id=1](https://node-orizon-production.up.railway.app/intervals?goal_id=1) — filtro per obiettivo incluso
- [GET /intervals?start_date=2026-06-01&end_date=2026-12-31&goal_id=1](https://node-orizon-production.up.railway.app/intervals?start_date=2026-06-01&end_date=2026-12-31&goal_id=1) — filtri combinati

**Goals:**
- [GET /goals](https://node-orizon-production.up.railway.app/goals) — lista tutti gli obiettivi
- [GET /goals/1](https://node-orizon-production.up.railway.app/goals/1) — singolo obiettivo (sostituisci l'id se necessario)

---

### ⚡ Test di POST, PUT, DELETE

Le richieste con body o senza GET non si possono fare direttamente dal browser. Usa uno di questi strumenti gratuiti (nessuna installazione richiesta):

**Hoppscotch** (consigliato): apri [hoppscotch.io](https://hoppscotch.io), seleziona il metodo, incolla l'URL, vai sulla tab Body → JSON → inserisci i dati → Send.

**ReqBin**: apri [reqbin.com](https://reqbin.com), seleziona il metodo, incolla l'URL, vai sulla tab Content → JSON → inserisci i dati → Send.

**Postman / Thunder Client / curl**: tutti supportati.

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
- Un client HTTP per testare le API: [Thunder Client](https://www.thunderclient.com/), [Postman](https://www.postman.com/), o `curl`

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
DB_PASSWORD=password_mysql
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

## 📡 Endpoints

### Users — `/users`

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `POST` | `/users` | Crea un nuovo utente |
| `GET` | `/users` | Lista tutti gli utenti |
| `GET` | `/users/:id` | Restituisce un utente singolo |
| `PUT` | `/users/:id` | Modifica un utente |
| `DELETE` | `/users/:id` | Cancella un utente |
| `DELETE` | `/users?confirm=true` | Cancella tutti gli utenti |

**Body per POST/PUT:**
```json
{
  "email": "mario@orizon.it",
  "first_name": "Mario",
  "last_name": "Rossi"
}
```

### Intervals — `/intervals`

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `POST` | `/intervals` | Crea un nuovo intervallo |
| `GET` | `/intervals` | Lista tutti gli intervalli (con filtri) |
| `GET` | `/intervals/:id` | Intervallo singolo con i suoi obiettivi |
| `PUT` | `/intervals/:id` | Modifica un intervallo |
| `DELETE` | `/intervals/:id` | Cancella un intervallo |
| `DELETE` | `/intervals?confirm=true` | Cancella tutti gli intervalli |
| `POST` | `/intervals/:id/goals` | Associa un obiettivo all'intervallo |
| `DELETE` | `/intervals/:id/goals/:goalId` | Rimuove l'associazione |
| `DELETE` | `/intervals/goals?confirm=true` | Cancella tutte le associazioni |

**Filtri sulla GET (combinabili):**
- `GET /intervals?start_date=2026-06-01`
- `GET /intervals?end_date=2026-06-30`
- `GET /intervals?goal_id=1`
- `GET /intervals?start_date=2026-06-01&end_date=2026-12-31&goal_id=1`

**Body per POST/PUT:**
```json
{
  "start_date": "2026-06-01",
  "end_date": "2026-06-30",
  "user_id": 1
}
```

**Body per POST `/intervals/:id/goals`:**
```json
{
  "goal_id": 1
}
```

### Goals — `/goals`

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `POST` | `/goals` | Crea un nuovo obiettivo |
| `GET` | `/goals` | Lista tutti gli obiettivi |
| `GET` | `/goals/:id` | Obiettivo singolo |
| `PUT` | `/goals/:id` | Modifica un obiettivo |
| `DELETE` | `/goals/:id` | Cancella un obiettivo |
| `DELETE` | `/goals?confirm=true` | Cancella tutti gli obiettivi |

**Body per POST/PUT:**
```json
{
  "name": "Vendi viaggi in Asia",
  "description": "Promuovere e vendere pacchetti viaggio per l'Asia"
}
```

(`description` è opzionale)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🗄️ Schema del Database

Il database è composto da **4 tabelle**:
