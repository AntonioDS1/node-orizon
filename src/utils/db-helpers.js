const { httpError } = require('./errors');

// Verifica che un utente esista. Se non esiste, lancia un 404.
// Ritorna la riga dell'utente.
async function ensureUserExists(pool, userId) {

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
        throw httpError(404, `Utente con ID: ${userId} non trovato.`);
    };

    return rows[0];

};

// Verifica che un intervallo esista. Se non esiste, lancia un 404.
async function ensureIntervalExists(pool, intervalId) {

    const [rows] = await pool.query("SELECT * FROM intervals_table WHERE id = ?", [intervalId]);

    if (rows.length === 0) {
        throw httpError(404, `Intervallo con ID: ${intervalId} non trovato.`);
    };

    return rows[0];

};

// Verifica che un goal esista. Se non esiste, lancia un 404.
async function ensureGoalExists(pool, goalId) {

    const [rows] = await pool.query("SELECT * FROM goals WHERE id = ?", [goalId]);

    if (rows.length === 0) {
        throw httpError(404, `Obiettivo con ID: ${goalId} non trovato.`);
    };

    return rows[0];

};

module.exports = {
    ensureUserExists,
    ensureIntervalExists,
    ensureGoalExists
};
