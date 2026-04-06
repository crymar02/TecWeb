import express from 'express';
import multer from 'multer';
import path from 'path';
import { pool } from '../db.js';

const router = express.Router();

// Configurazione dello storage per multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Assicurati di creare questa cartella in /backend
  },
  filename: (req, file, cb) => {
    // Rinomina il file con un timestamp per evitare duplicati
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Rotta POST per l'upload
router.post('/upload', upload.single('immagine'), async (req, res) => {
    try {
        const { titolo, descrizione, user_id } = req.body;
        const url_immagine = `http://localhost:3000/uploads/${req.file.filename}`;

        // Definizione query basata sui tuoi campi e sulla struttura del database
        const query = `
            INSERT INTO meme (titolo, descrizione, url_immagine, user_id) VALUES ($1, $2, $3, $4) RETURNING *`;

        const values = [titolo, descrizione, url_immagine, parseInt(user_id)];

        const newMeme = await pool.query(query, values);
        res.status(201).json(newMeme.rows[0]);
    } catch (err) {
        console.error("Errore SQL:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Rotta per ottenere tutti i meme
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT m.*, u.username 
            FROM meme m 
            JOIN utente u ON m.user_id = u.user_id 
            ORDER BY m.data_creazione DESC`;
        
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Errore nel recupero dei meme" });
    }
});

// Rotta per eliminare un meme
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body; // Passiamo l'id utente per sicurezza

    try {
        // Verifichiamo che il meme appartenga effettivamente all'utente
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