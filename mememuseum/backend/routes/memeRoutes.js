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

export default router;