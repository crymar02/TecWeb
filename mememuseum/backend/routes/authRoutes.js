import express from 'express';
import { signup, login } from '../controllers/authController.js';

const router = express.Router();

//Definisce le rotte per la registrazione e il login degli utenti
router.post('/signup', signup);
router.post('/login', login);

export default router; 