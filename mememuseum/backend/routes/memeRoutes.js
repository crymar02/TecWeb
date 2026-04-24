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

// GET di un meme con filtri, ordinamento e paginazione 
router.get('/', async (req, res) => {
    const { userId, sortBy, page = 1, filtroTag = "", date } = req.query;
    const limit = 10; 
    const offset = (page - 1) * limit;

    try {
        const searchTerm = `%${filtroTag}%`;
        
        // 1. Costruzione dinamica della query e dei parametri
        let queryParams = [
            userId && userId !== 'null' ? parseInt(userId) : null, 
            searchTerm
        ];

        let query = `
            SELECT 
                m.*, 
                u.username,
                (SELECT COUNT(*) FROM voto v WHERE v.meme_id = m.id_meme AND v.voto = TRUE) AS likes,
                (SELECT COUNT(*) FROM voto v WHERE v.meme_id = m.id_meme AND v.voto = FALSE) AS dislikes,
                (SELECT voto FROM voto v WHERE v.meme_id = m.id_meme AND v.user_id = $1) AS voto_utente,
                (SELECT COALESCE(JSON_AGG(json_build_object(
                    'id_commento', c.id_commento,
                    'username', cu.username,
                    'contenuto', c.contenuto,
                    'user_id', c.user_id,
                    'data_creazione_commento', c.data_creazione_commento
                )), '[]') 
                 FROM commento c 
                 JOIN utente cu ON c.user_id = cu.user_id 
                 WHERE c.meme_id = m.id_meme) AS commenti,
                COUNT(*) OVER() AS total_count
            FROM meme m
            JOIN utente u ON m.user_id = u.user_id
            WHERE (
                m.titolo ILIKE $2 
                OR EXISTS (
                    SELECT 1 FROM unnest(m.tags) AS t 
                    WHERE t ILIKE $2
                )
            )
        `;

        // 2. Filtro per data 
        if (date && date !== 'undefined' && date !== '') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateOnly = `${year}-${month}-${day}`; 

        queryParams.push(dateOnly); 
        query += ` AND m.data_creazione::date = $${queryParams.length}::date`;
    }

        // 3. Group By necessario per le subquery di aggregazione (likes, dislikes, commenti)
        query += ` GROUP BY m.id_meme, u.username`;

        // 4. Ordinamento 
        if (sortBy === 'popular') {
            query += ` ORDER BY likes DESC`;
        } else if (sortBy === 'controversial') {
            query += ` ORDER BY dislikes DESC`;
        } else if (sortBy === 'oldest') {
            query += ` ORDER BY m.data_creazione ASC`; 
        } else {
            query += ` ORDER BY m.data_creazione DESC`;
        }

        // 5. Paginazione
        queryParams.push(limit, offset);
        query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

        const result = await pool.query(query, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
       

// UPLOAD di un nuovo meme 
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
            tagsArray 
        ]);
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE di un meme (solo se è il proprietario)
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

// MODIFICA titolo di un meme (solo se è il proprietario)
router.put('/:id/titolo', async (req, res) => {
    const { id } = req.params;
    const { titolo, user_id } = req.body;

    try {
        // Controlla che chi modifica sia il proprietario
        const result = await pool.query(
            'UPDATE meme SET titolo = $1 WHERE id_meme = $2 AND user_id = $3 RETURNING *',
            [titolo, id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ error: "Non autorizzato o meme non trovato" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET del meme del giorno (1 meme random fisso per tutto il giorno)
router.get('/del-giorno', async (req, res) => {
    try {
        // 1. Ottiene una stringa per il giorno (es: "20240520")
        const oggi = new Date().toISOString().split('T')[0].replace(/-/g, '');
        
        // Divide per un numero grande per normalizzare il valore
        const seed = (parseInt(oggi) % 1000) / 1000; 

        // 3. Esegue setseed per bloccare la sequenza di random() per oggi
        await pool.query('SELECT setseed($1)', [seed]);

        // 4. Seleziona il meme 
        const result = await pool.query(`
            SELECT m.*, u.username,
            (SELECT COUNT(*) FROM voto v WHERE v.meme_id = m.id_meme AND v.voto = TRUE) AS likes,
            (SELECT COUNT(*) FROM voto v WHERE v.meme_id = m.id_meme AND v.voto = FALSE) AS dislikes
            FROM meme m
            JOIN utente u ON m.user_id = u.user_id
            ORDER BY random()
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Nessun meme in archivio" });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Errore nel calcolo del meme del giorno:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET per calcolare la posizione di un meme specifico (per evidenziarlo in home)
router.get('/posizione/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const limit = 10; 

        const query = `
            SELECT riga FROM (
                SELECT id_meme, ROW_NUMBER() OVER (ORDER BY data_creazione DESC) as riga
                FROM meme
            ) as lista_ordinata
            WHERE id_meme = $1
        `;
        
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Meme non trovato" });
        }

        const posizione = parseInt(result.rows[0].riga);
        const paginaCalcolata = Math.ceil(posizione / limit);

        res.json({ pagina: paginaCalcolata });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;