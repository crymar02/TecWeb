import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js'; 
import 'dotenv/config';

export const signup = async (req, res) => {
    try {
        const { nome, cognome, username, email, password } = req.body;

        // 1. Verifica se l'utente o l'email esistono già 
        const userExists = await pool.query(
            'SELECT * FROM utente WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Username o Email già in uso" });
        }

        // 2. Hashing della password 
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Inserimento user nel database 
        const newUser = await pool.query(
            'INSERT INTO utente (nome, cognome, username, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username',
            [nome, cognome, username, email, hashedPassword]
        );

        res.status(201).json({
            message: "Utente registrato con successo",
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Errore del server durante la registrazione");
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Cerca l'utente nel database 
        const userResult = await pool.query('SELECT * FROM utente WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "Credenziali non valide" });
        }

        const user = userResult.rows[0];

        // 2. Confronta la password passata con quella hash nel DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Credenziali non valide" });
        }

        // 3. Crea il Token JWT
        const token = jwt.sign(
            { userId: user.user_id, username: user.username },
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login effettuato con successo",
            token: token,
            user: { id: user.user_id, username: user.username }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Errore del server durante il login");
    }
};