const express = require("express");
const pool = require("../db");
const router = express.Router();
const { parseId, validateGoalBody } = require('../utils/validation');

// ============================================================
// ROTTE SULLA RADICE
// ============================================================

router.post("/", async (req, res, next) => {

    try {

        validateGoalBody(req.body);

        const { name, description } = req.body;

        const [result] = await pool.query(
            "INSERT INTO goals (name, description) VALUES (?, ?)",
            [name, description || null]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            description: description || null,
        });

    } catch (err) {

        next(err);

    }

});

router.get("/", async (req, res, next) => {

    try {
        const [goals] = await pool.query("SELECT * FROM goals");
        res.json(goals);
    } catch (err) {

        next(err);

    }

});

// ============================================================
// ROTTE BULK (prima di /:id)
// ============================================================

router.delete('/', async (req, res, next) => {

    try {
        if (req.query.confirm !== 'true') {
            return res.status(400).json({
                error: true,
                message: 'Operazione distruttiva. Cancellerà anche tutte le associazioni intervallo-obiettivo. Per procedere, aggiungi ?confirm=true alla URL'
            });
        }

        const [result] = await pool.query('DELETE FROM goals');

        res.status(200).json({
            message: 'Tutti gli obiettivi sono stati cancellati',
            deleted_count: result.affectedRows
        });

    } catch (err) {

        next(err);

    }

});

// ============================================================
// ROTTE CON /:id
// ============================================================

router.get("/:id", async (req, res, next) => {

    try {

        const goalId = parseId(req.params.id);

        const [goal] = await pool.query("SELECT * FROM goals WHERE id = ?", [goalId]);

        if (goal.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Obiettivo con ID: ${goalId} non trovato`, // Controllo manuale per evitare ulteriori query
            });
        }

        res.json(goal[0]);

    } catch (err) {

        next(err);

    }

});

router.put("/:id", async (req, res, next) => {

    try {

        const goalId = parseId(req.params.id);
        validateGoalBody(req.body);

        const { name, description } = req.body;

        const [result] = await pool.query(
            "UPDATE goals SET name = ?, description = ? WHERE id = ?",
            [name, description || null, goalId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Obiettivo con ID: ${goalId} non trovato`, // Controllo manuale per evitare ulteriori query
            });
        }

        res.json({
            id: goalId,
            name,
            description: description || null,
        });

    } catch (err) {

        next(err);

    }

});

router.delete("/:id", async (req, res, next) => {

    try {

        const goalId = parseId(req.params.id);

        const [result] = await pool.query("DELETE FROM goals WHERE id = ?", [goalId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Obiettivo con ID: ${goalId} non trovato`, // Controllo manuale per evitare ulteriori query
            });
        }

        res.status(204).send();

    } catch (err) {

        next(err);

    }

});

module.exports = router;
