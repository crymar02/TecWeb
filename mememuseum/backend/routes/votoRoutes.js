import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// CREA o AGGIORNA un voto (like/dislike)
router.post('/', async (req, res) => {
    const { meme_id, user_id, voto } = req.body;
    try {
        //Controlla se esiste già un voto di questo utente su questo meme
        const checkVoto = await pool.query(
            'SELECT voto FROM voto WHERE meme_id = $1 AND user_id = $2',
            [meme_id, user_id]
        );

        if (checkVoto.rows.length > 0) {
            const votoEsistente = checkVoto.rows[0].voto;

            if (votoEsistente === voto) {
                // Se il voto è identico, lo cancella
                await pool.query(
                    'DELETE FROM voto WHERE meme_id = $1 AND user_id = $2',
                    [meme_id, user_id]
                );
                return res.json({ message: "Voto rimosso" });
            } else {
                // Se il voto è diverso (es. da like a dislike), lo aggiorna
                await pool.query(
                    'UPDATE voto SET voto = $1 WHERE meme_id = $2 AND user_id = $3',
                    [voto, meme_id, user_id]
                );
                return res.json({ message: "Voto aggiornato" });
            }
        } else {
            // Se non esiste, lo crea
            await pool.query(
                'INSERT INTO voto (meme_id, user_id, voto) VALUES ($1, $2, $3)',
                [meme_id, user_id, voto]
            );
            return res.status(201).json({ message: "Voto aggiunto" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;