// backend/app.js
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';  
import authRoutes from './routes/authRoutes.js';

const app = express();




// --- SICUREZZA E MIDDLEWARE BASE ---
app.disable('x-powered-by'); // Nasconde Express agli attaccanti
app.use(express.json());    // Parsing del corpo delle richieste in JSON

const PORT = process.env.PORT || 3000;

// --- ROTTE ---
app.use(cors()); // Abilita CORS per tutte le rotte 
app.use('/api/auth', authRoutes);

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


