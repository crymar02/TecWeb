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

// GET Meme 
router.get('/', async (req, res) => {
    const { userId, sortBy, page = 1 } = req.query;
    const limit = 10; 
    const offset = (page - 1) * limit;

    try {
        let query = `
            SELECT 
                m.*, 
                u.username,
                (SELECT COUNT(*) FROM voto v WHERE v.meme_id = m.id_meme AND v.voto = TRUE) AS likes,
                (SELECT COUNT(*) FROM voto v WHERE v.meme_id = m.id_meme AND v.voto = FALSE) AS dislikes,
                (SELECT voto FROM voto v WHERE v.meme_id = m.id_meme AND v.user_id = $1) AS voto_utente,
                COUNT(*) OVER() AS total_count -- Ci dice quanti meme esistono in tutto per calcolare le pagine
            FROM meme m
            JOIN utente u ON m.user_id = u.user_id
            WHERE 1=1
        `;

        const params = [userId ? parseInt(userId) : null];

        // Ordinamento 
        if (sortBy === 'popular') query += ` ORDER BY likes DESC`;
        else if (sortBy === 'controversial') query += ` ORDER BY dislikes DESC`;
        else query += ` ORDER BY m.data_creazione DESC`;

        //LIMIT E OFFSET
        query += ` LIMIT ${limit} OFFSET ${offset}`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload Meme 
router.post('/upload', upload.single('immagine'), async (req, res) => {
    try {
        const { titolo, descrizione, user_id, tags } = req.body;
        const url_immagine = `http://localhost:3000/uploads/${req.file.filename}`;
        const tagsArray = tags ? tags.split(',').map(t => t.trim()) : [];

        const query = `
            INSERT INTO meme (titolo, descrizione, url_immagine, user_id, tags) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `;
        const result = await pool.query(query, [
            titolo, 
            descrizione, 
            url_immagine, 
            parseInt(user_id), 
            tagsArray // PostgreSQL accetta array JS per colonne TEXT[]
        ]);
        
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