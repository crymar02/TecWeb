import express from 'express';
import { pool } from '../db.js';
const router = express.Router();

// CREA un commento
router.post('/', async (req, res) => {
    const { meme_id, user_id, contenuto } = req.body;
    try {
        const query = `
            INSERT INTO commento (meme_id, user_id, contenuto) 
            VALUES ($1, $2, $3) RETURNING *`;
        const result = await pool.query(query, [meme_id, user_id, contenuto]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ELIMINA un commento
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body; 

    try {
        const result = await pool.query(
            'DELETE FROM commento WHERE id_commento = $1 AND user_id = $2 RETURNING *',
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ error: "Non autorizzato o commento inesistente" });
        }
        res.json({ message: "Commento rimosso" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// MODIFICA un commento
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id, nuovoContenuto } = req.body;

    try {
        const result = await pool.query(
            'UPDATE commento SET contenuto = $1 WHERE id_commento = $2 AND user_id = $3 RETURNING *',
            [nuovoContenuto, id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ error: "Non autorizzato" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;