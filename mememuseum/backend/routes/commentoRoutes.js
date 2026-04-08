import express from 'express';
import { pool } from '../db.js';
const router = express.Router();

// POST: Crea un commento
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

export default router;