const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool }= require('../db'); 

exports.signup = async (req, res) => {
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

        // 3. Inserimento nel database [cite: 170-178]
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

exports.login = async (req, res) => {
    // Qui implementerai la logica di verifica password e generazione JWT
};