require('dotenv').config();

const express = require('express');
const pool = require('./db');

const usersRouter = require('./routes/users');
const intervalsRouter = require('./routes/intervals');
const goalsRouter = require('./routes/goals');

const app = express();

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();

});

// Rotte pubbliche
app.get('/', (req, res) => {

  res.json({ message: 'Benvenuto nelle API di Orizon!' });

});

app.get('/test-db', async (req, res, next) => {

  try {

    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ message: 'Connessione al database OK!', result: rows[0].result });

  } catch (err) {

      next(err);

    };

});

// Rotte delle risorse
app.use('/users', usersRouter);
app.use('/intervals', intervalsRouter);
app.use('/goals', goalsRouter);

// Error handler centralizzato (4 parametri).
// Pattern asimmetrico: log completo lato server, risposta sobria al client.
app.use((err, req, res, next) => {

    // LOG COMPLETO lato server (per il debug)
    console.error('=== ERRORE ===');
    console.error('message:', err.message);
    console.error('code:', err.code);
    console.error('errno:', err.errno);
    console.error('sqlMessage:', err.sqlMessage);
    console.error('sqlState:', err.sqlState);
    console.error('stack:', err.stack);
    console.error('==============');

    // Gestione centralizzata dei duplicati MySQL (vincolo UNIQUE o PK).
    // Se la rotta ha impostato un messaggio personalizzato, lo usa;
    // altrimenti un messaggio generico.
  if (err.code === 'ER_DUP_ENTRY') {

      return res.status(409).json({
          error: true,
          message: err.duplicateMessage || 'Risorsa duplicata: viola un vincolo di unicità.'
      });

  };

    const status = err.status || 500;

    // RISPOSTA AL CLIENT
  if (status === 500) {

        // Errore imprevisto: messaggio generico, non esporre dettagli interni del DB
        return res.status(500).json({
            error: true,
            message: 'Si è verificato un errore interno del server.'
        });

  };

    // Errori controllati (400, 404, 409): messaggio specifico
  res.status(status).json({

    error: true,
    message: err.message

  });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`Server in ascolto su http://localhost:${PORT}`);

});
