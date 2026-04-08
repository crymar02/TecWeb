import express from 'express';
import multer from 'multer';
import path from 'path';
import { pool } from '../db.js';

const router = express.Router();

// Configurazione dello storage per multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 1. Rotta POST per l'upload
router.post('/upload', upload.single('immagine'), async (req, res) => {
    try {
        const { titolo, descrizione, user_id } = req.body;
        const url_immagine = `http://localhost:3000/uploads/${req.file.filename}`;

        const query = `
            INSERT INTO meme (titolo, descrizione, url_immagine, user_id) 
            VALUES ($1, $2, $3, $4) RETURNING *`;

        const values = [titolo, descrizione, url_immagine, parseInt(user_id)];

        const newMeme = await pool.query(query, values);
        res.status(201).json(newMeme.rows[0]);
    } catch (err) {
        console.error("Errore SQL:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 2. Rotta GET (UNIFICATA): Ottiene meme con username, likes, dislikes e commenti
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                m.*, 
                u.username,
                (SELECT COUNT(*) FROM voto v WHERE v.meme_id = m.id_meme AND v.voto = TRUE) AS likes,
                (SELECT COUNT(*) FROM voto v WHERE v.meme_id = m.id_meme AND v.voto = FALSE) AS dislikes,
                COALESCE(
                    (SELECT json_agg(json_build_object(
                        'id_commento', c.id_commento,
                        'contenuto', c.contenuto,
                        'username', uc.username
                    ))
                     FROM commento c
                     JOIN utente uc ON c.user_id = uc.user_id
                     WHERE c.meme_id = m.id_meme
                    ), '[]'
                ) AS commenti
            FROM meme m
            JOIN utente u ON m.user_id = u.user_id
            ORDER BY m.data_creazione DESC;
        `;
        
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Errore nel recupero dei meme:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 3. Rotta DELETE: Elimina un meme
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body; 

    try {
        const checkMeme = await pool.query(
            'SELECT * FROM meme WHERE id_meme = $1 AND user_id = $2',
            [id, user_id]
        );

        if (checkMeme.rows.length === 0) {
            return res.status(403).json({ error: "Non sei autorizzato o il meme non esiste" });
        }

        await pool.query('DELETE FROM meme WHERE id_meme = $1', [id]);
        res.json({ message: "Meme eliminato con successo dal museo" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Errore durante l'eliminazione" });
    }
});

export default router;