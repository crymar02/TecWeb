import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Accesso negato. Token mancante." });
    }

    try {
        // 2. Verifica il token usando la chiave segreta
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Salva i dati dell'utente (id e username) nella richiesta
        req.user = verified;
        
        // 4. Passa alla funzione successiva (il controller)
        next();
    } catch (err) {
        res.status(403).json({ message: "Token non valido o scaduto." });
    }
};

export default authMiddleware;