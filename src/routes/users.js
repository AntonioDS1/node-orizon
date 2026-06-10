const express = require('express');
const router = express.Router();
const pool = require("../db");
const { parseId, validateUserBody } = require('../utils/validation');

// ============================================================
// ROTTE SULLA RADICE
// ============================================================

router.post("/", async (req, res, next) => {

    try {

        validateUserBody(req.body);

        const { email, first_name, last_name } = req.body;

        const [result] = await pool.query(
            'INSERT INTO users (email, first_name, last_name) VALUES (?, ?, ?)',
            [email, first_name, last_name]
        );

        res.status(201).json({
            id: result.insertId,
            email,
            first_name,
            last_name
        });

    } catch (err) {

        if (err.code === 'ER_DUP_ENTRY') {
            err.duplicateMessage = 'Esiste già un utente con questa email.';
        }
        next(err);

    };

});

router.get("/", async (req, res, next) => {

    try {

        const [rows] = await pool.query("SELECT * FROM users");
        res.json(rows);

    } catch (err) {

        next(err);

    };

});

// ============================================================
// ROTTE BULK (prima di /:id)
// ============================================================

router.delete('/', async (req, res, next) => {

    try {

        if (req.query.confirm !== 'true') {
            return res.status(400).json({
                error: true,
                message: 'Operazione distruttiva. Per cancellare tutti gli utenti, aggiungi ?confirm=true alla URL'
            });

        };

        const [result] = await pool.query('DELETE FROM users');

        res.status(200).json({
            message: 'Tutti gli utenti sono stati cancellati',
            deleted_count: result.affectedRows
        });

    } catch (err) {

        next(err);

    };

});

// ============================================================
// ROTTE CON /:id
// ============================================================

router.get("/:id", async (req, res, next) => {

    try {

        const userId = parseId(req.params.id);

        const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);

        if (rows.length === 0) {

            return res.status(404).json({
                error: true,
                message: `Utente con ID: ${userId} non trovato`, // Controllo manuale per evitare ulteriori query
            });
        };

        res.json(rows[0]);

    } catch (err) {

        next(err);

    };

});

router.put("/:id", async (req, res, next) => {

    try {

        const userId = parseId(req.params.id);
        validateUserBody(req.body);

        const { email, first_name, last_name } = req.body;

        const [result] = await pool.query(
            'UPDATE users SET email = ?, first_name = ?, last_name = ? WHERE id = ?',
            [email, first_name, last_name, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Utente con ID: ${userId} non trovato`, // Controllo manuale per evitare ulteriori query
            });
        };

        res.json({
            id: userId,
            email,
            first_name,
            last_name
        });

    } catch (err) {

        if (err.code === 'ER_DUP_ENTRY') {
            err.duplicateMessage = 'Esiste già un utente con questa email.';
        }

        next(err);

    };

});

router.delete("/:id", async (req, res, next) => {

    try {

        const userId = parseId(req.params.id);

        const [result] = await pool.query("DELETE FROM users WHERE id = ?", [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Utente con ID: ${userId} non trovato`, // Controllo manuale per evitare ulteriori query
            });
        };

        res.status(204).send();

    } catch (err) {

        next(err);

    };

});

module.exports = router;
