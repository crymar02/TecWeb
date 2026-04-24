// backend/app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';  
import authRoutes from './routes/authRoutes.js';
import memeRoutes from './routes/memeRoutes.js';
import commentoRoutes from './routes/commentoRoutes.js';
import votoRoutes from './routes/votoRoutes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// --- SICUREZZA E MIDDLEWARE BASE ---
app.use(cookieParser());
app.disable('x-powered-by'); 
app.use(express.json());    
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;

// --- ROTTE ---
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true
    }
)); 
app.use('/api/auth', authRoutes);
app.use('/api/memes', memeRoutes);
app.use('/api/voti', votoRoutes);
app.use('/api/commenti', commentoRoutes);

app.get('/', (req, res) => {
    res.send('Ciao, benvenuto nel MEMEMUSEUM!');
});

// --- GESTIONE ERRORI ---

// 404 - Risorsa non trovata 
app.use((req, res, next) => {
    res.status(404).json({ error: 'Risorsa non trovata' });
});

// 500 - Errore interno globale
app.use((err, req, res, next) => {
    console.error('Errore catturato:', err.stack);
    res.status(500).json({ error: 'Errore interno del server', message: err.message });
});

// --- AVVIO APPLICAZIONE ---

// Funzione per connettersi al database
async function connectDatabase() {
    try {
        //Connessione al database
        const client = await pool.connect(); 
        console.log('Connesso al database con successo');
        client.release(); 

        //Avvio effettivo del server sulla porta 3000
        app.listen(PORT, () => {
            console.log(`Server in esecuzione su http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Errore durante l\'avvio:', err.message);
        process.exit(1); 
    }
}

connectDatabase();


