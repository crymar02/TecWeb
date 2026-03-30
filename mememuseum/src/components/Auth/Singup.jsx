import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
    const [formData, setFormData] = useState({
        nome: '', cognome: '', username: '', email: '', password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3000/api/auth/signup', formData);
            alert("Registrazione completata! Ora puoi fare il login.");
        } catch (err) {
            alert(err.response?.data?.message || "Errore durante la registrazione");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Registrati al Mememuseum</h2>
            <input 
                type="text" 
                name="nome" 
                placeholder="Nome" 
                value={formData.nome} // <--- Collega lo stato
                onChange={handleChange} 
                required 
            />
            
            <input 
                type="text" 
                name="cognome" 
                placeholder="Cognome" 
                value={formData.cognome} 
                onChange={handleChange} 
                required 
            />
            
            <input 
                type="text" 
                name="username" 
                placeholder="Username" 
                value={formData.username} 
                onChange={handleChange} 
                required 
            />
            
            <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
            />
            
            <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
            />
            
            <button type="submit">Iscriviti</button>
        </form>
    );
};

export default Signup;