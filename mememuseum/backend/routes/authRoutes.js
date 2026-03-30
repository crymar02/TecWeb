import express from 'express';
const router = express.Router();
// Importiamo le funzioni del controller (aggiungi .js!)
import { signup, login } from '../controllers/authController.js';

router.post('/signup', signup);
router.post('/login', login);

export default router; 