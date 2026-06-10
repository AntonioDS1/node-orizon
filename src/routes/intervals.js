const express = require('express');
const router = express.Router();
const pool = require('../db');
const { parseId, validateIntervalBody } = require('../utils/validation');
const { ensureUserExists, ensureIntervalExists, ensureGoalExists } = require('../utils/db-helpers');

// ============================================================
// ROTTE SULLA RADICE
// ============================================================

router.post("/", async (req, res, next) => {

    try {

        validateIntervalBody(req.body);

        const { start_date, end_date, user_id } = req.body;

        await ensureUserExists(pool, user_id);   // lancia 404 se l'utente non esiste

        const [result] = await pool.query(
            "INSERT INTO intervals_table (start_date, end_date, user_id) VALUES (?, ?, ?)",
            [start_date, end_date, user_id]
        );

        res.status(201).json({
            id: result.insertId,
            start_date,
            end_date,
            user_id,
        });

    } catch (err) {

        next(err);

    }

});

// GET /intervals — lista intervalli (con filtri opzionali).
//
// Scelta di design: la lista restituisce una rappresentazione "leggera"
// degli intervalli, SENZA i goals annidati. Questo per due motivi:
//   1. Efficienza: evita un JOIN su ogni elemento della lista quando,
//      nella maggior parte dei casi, chi consuma la lista vuole solo
//      una panoramica e non i dettagli completi di ciascun intervallo.
//   2. Evitare over-fetching: con la relazione N:M, gli stessi goals
//      comparirebbero ripetuti in più intervalli, gonfiando inutilmente
//      la risposta.
//
// La rappresentazione "completa" con i goals annidati è fornita da
// GET /intervals/:id, da usare quando si vuole il dettaglio di un
// singolo intervallo.
router.get("/", async (req, res, next) => {

    try {

        const { start_date, end_date, goal_id } = req.query;

        let sql = "SELECT DISTINCT i.* FROM intervals_table i";
        let conditions = [];
        let params = [];

        if (goal_id) {
            sql += ' JOIN interval_goals ig ON i.id = ig.interval_id';
            conditions.push('ig.goal_id = ?');
            params.push(Number(goal_id));
        }

        if (start_date) {
            conditions.push('i.start_date >= ?');
            params.push(start_date);
        }

        if (end_date) {
            conditions.push('i.end_date <= ?');
            params.push(end_date);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await pool.query(sql, params);
        res.json(rows);

    } catch (err) {

        next(err);

    }

});

// ============================================================
// ROTTE LETTERALI E BULK (PRIMA di /:id)
// ============================================================

router.delete('/goals', async (req, res, next) => {

    try {

        if (req.query.confirm !== 'true') {
            return res.status(400).json({
                error: true,
                message: 'Operazione distruttiva. Per cancellare tutte le associazioni intervallo-obiettivo, aggiungi ?confirm=true alla URL'
            });
        }

        const [result] = await pool.query('DELETE FROM interval_goals');

        res.status(200).json({
            message: 'Tutte le associazioni intervallo-obiettivo sono state cancellate',
            deleted_count: result.affectedRows
        });

    } catch (err) {

        next(err);

    }

});

router.delete('/', async (req, res, next) => {

    try {

        if (req.query.confirm !== 'true') {
            return res.status(400).json({
                error: true,
                message: 'Operazione distruttiva. Per cancellare tutti gli intervalli, aggiungi ?confirm=true alla URL'
            });
        }

        const [result] = await pool.query('DELETE FROM intervals_table');

        res.status(200).json({
            message: 'Tutti gli intervalli sono stati cancellati',
            deleted_count: result.affectedRows
        });

    } catch (err) {

        next(err);

    }

});

// ============================================================
// ROTTE ANNIDATE CON SEGMENTO LETTERALE DOPO :id
// ============================================================

router.post("/:id/goals", async (req, res, next) => {

    try {

        const intervalId = parseId(req.params.id);

        const { goal_id } = req.body;
        if (!goal_id) {
            return res.status(400).json({
                error: true,
                message: 'Il campo goal_id è obbligatorio'
            });
        }

        await ensureIntervalExists(pool, intervalId);   // 404 se l'intervallo non esiste
        await ensureGoalExists(pool, goal_id);          // 404 se il goal non esiste

        try {
            await pool.query(
                "INSERT INTO interval_goals (interval_id, goal_id) VALUES (?, ?)",
                [intervalId, goal_id]
            );
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                err.duplicateMessage = 'Questo obiettivo è già associato a questo intervallo.';
            }
            throw err;
        }

        res.status(201).json({
            message: 'Obiettivo associato con successo',
            interval_id: intervalId,
            goal_id: Number(goal_id)
        });

    } catch (err) {

        next(err);

    }

});

router.delete('/:id/goals/:goalId', async (req, res, next) => {

    try {

        const intervalId = parseId(req.params.id);
        const goalId = parseId(req.params.goalId, 'goalId');

        const [result] = await pool.query(
            'DELETE FROM interval_goals WHERE interval_id = ? AND goal_id = ?',
            [intervalId, goalId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: 'Associazione non trovata'
            });
        }

        res.status(204).send();

    } catch (err) {

        next(err);

    }

});

// ============================================================
// ROTTE CON :id SEMPLICE (devono stare PER ULTIME)
// ============================================================

router.get("/:id", async (req, res, next) => {

    try {

        const intervalId = parseId(req.params.id);

        const interval = await ensureIntervalExists(pool, intervalId);   // 404 se non esiste

        const [goals] = await pool.query(
            `SELECT g.* FROM goals g
            JOIN interval_goals ig ON g.id = ig.goal_id
            WHERE ig.interval_id = ?`,
            [intervalId]
        );

        res.json({
            ...interval,
            goals: goals
        });

    } catch (err) {

        next(err);

    }

});

router.put("/:id", async (req, res, next) => {

    try {

        const intervalId = parseId(req.params.id);
        validateIntervalBody(req.body);

        const { start_date, end_date, user_id } = req.body;

        await ensureUserExists(pool, user_id);   // 404 se l'utente non esiste

        const [result] = await pool.query(
            "UPDATE intervals_table SET start_date = ?, end_date = ?, user_id = ? WHERE id = ?",
            [start_date, end_date, user_id, intervalId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Intervallo con ID: ${intervalId} non trovato`,
            });
        }

        res.json({
            id: intervalId,
            start_date,
            end_date,
            user_id,
        });

    } catch (err) {

        next(err);

    }

});

router.delete("/:id", async (req, res, next) => {

    try {

        const intervalId = parseId(req.params.id);

        const [result] = await pool.query("DELETE FROM intervals_table WHERE id = ?", [intervalId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Intervallo con ID: ${intervalId} non trovato`,
            });
        }

        res.status(204).send();

    } catch (err) {

        next(err);

    }
});

module.exports = router;
