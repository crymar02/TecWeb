import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

// Crea una connessione al database usando il pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Funzione di test della connessione al database
async function testConnection() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Database connesso:', res.rows[0]);
    } catch (err) {
        console.error('Errore di connessione al database:', err.message);
    }
}



// Esportazione per i moduli ESM
export { pool };