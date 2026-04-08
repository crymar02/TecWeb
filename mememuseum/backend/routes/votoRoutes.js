import express from 'express';
import { pool } from '../db.js';
const router = express.Router();

// POST: Inserisci o aggiorna un voto (Upsert)
router.post('/', async (req, res) => {
    const { meme_id, user_id, voto } = req.body; 

    // Validazione base
    if (!meme_id || !user_id || voto === undefined) {
        return res.status(400).json({ error: "Dati mancanti (meme_id, user_id o voto)" });
    }

    try {
        const query = `
            INSERT INTO voto (meme_id, user_id, voto) 
            VALUES ($1, $2, $3)
            ON CONFLICT (meme_id, user_id) 
            DO UPDATE SET voto = EXCLUDED.voto, data_creazione_voto = CURRENT_TIMESTAMP
            RETURNING *`;
            
        const result = await pool.query(query, [meme_id, user_id, voto]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Errore nel salvataggio del voto:", err.message);
        res.status(500).json({ error: "Errore interno del server" });
    }
});

export default router;