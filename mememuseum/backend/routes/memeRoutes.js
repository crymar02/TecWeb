import express from 'express';
import multer from 'multer';
import path from 'path';
import { pool } from '../db.js';

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// GET Meme (Aggiornata per includere il voto dell'utente loggato)
router.get('/', async (req, res) => {
    const { userId } = req.query; // Recuperiamo l'ID utente passato dal frontend

    try {
        const query = `
            SELECT 
                m.*, 
                u.username,
                (SELECT COUNT(*) FROM voto v WHERE v.meme_id = m.id_meme AND v.voto = TRUE) AS likes,
                (SELECT COUNT(*) FROM voto v WHERE v.meme_id = m.id_meme AND v.voto = FALSE) AS dislikes,
                -- Qui inseriamo la logica per il voto dell'utente attuale
                (SELECT voto FROM voto v WHERE v.meme_id = m.id_meme AND v.user_id = $1) AS voto_utente,
                COALESCE(
                    (SELECT json_agg(json_build_object(
                        'id_commento', c.id_commento,
                        'contenuto', c.contenuto,
                        'username', uc.username,
                        'user_id', c.user_id,
                        'data_creazione_commento', c.data_creazione_commento
                    ) ORDER BY c.data_creazione_commento ASC)
                     FROM commento c
                     JOIN utente uc ON c.user_id = uc.user_id
                     WHERE c.meme_id = m.id_meme
                    ), '[]'
                ) AS commenti
            FROM meme m
            JOIN utente u ON m.user_id = u.user_id
            ORDER BY m.data_creazione DESC;
        `;
        
        // Se userId non c'è, passiamo null alla query
        const result = await pool.query(query, [userId ? parseInt(userId) : null]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload Meme
router.post('/upload', upload.single('immagine'), async (req, res) => {
    try {
        const { titolo, descrizione, user_id } = req.body;
        const url_immagine = `http://localhost:3000/uploads/${req.file.filename}`;
        const query = `INSERT INTO meme (titolo, descrizione, url_immagine, user_id) VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await pool.query(query, [titolo, descrizione, url_immagine, parseInt(user_id)]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Meme
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;
    try {
        const result = await pool.query('DELETE FROM meme WHERE id_meme = $1 AND user_id = $2 RETURNING *', [id, user_id]);
        if (result.rows.length === 0) return res.status(403).json({ error: "Non autorizzato" });
        res.json({ message: "Eliminato" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;