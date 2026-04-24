import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.css';

const initialState = {
    nome: '', 
    cognome: '', 
    username: '', 
    email: '', 
    password: ''
};

const Auth = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false); // Nuovo stato
    const [formData, setFormData] = useState(initialState);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setFormData(initialState);
        setShowPassword(false); 
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin 
        ? 'http://localhost:3000/api/auth/login' 
        : 'http://localhost:3000/api/auth/signup';
    
    try {
        const res = await axios.post(url, formData, { withCredentials: true });
        
        if (isLogin) {
            localStorage.setItem('username', res.data.user.username);
            localStorage.setItem('userId', res.data.user.id);
            toast.success("Login effettuato con successo!");
            onLoginSuccess();
            navigate('/');
        } else {
            toast.info("Registrazione completata! Ora effettua il login.");
            setIsLogin(true); 
        }
    } catch (err) {
       toast.error(err.response?.data?.message || "Errore durante l'operazione");
    }
};

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? 'Accedi' : 'Registrati'}</h2>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <input type="text" name="nome" placeholder="Nome" value={formData.nome} onChange={handleChange} required />
                            <input type="text" name="cognome" placeholder="Cognome" value={formData.cognome} onChange={handleChange} required />
                            <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                        </>
                    )}
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    
                    {/* Container per la password con icona */}
                    <div className="password-wrapper">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            placeholder="Password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                        />
                        <span 
                            className="password-toggle-icon" 
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                        </span>
                    </div>

                    <button type="submit" className="btn-auth">
                        {isLogin ? 'Login' : 'Crea Account'}
                    </button>
                </form>

                <div className="switch-auth">
                    <span>{isLogin ? "Non hai un account?" : "Hai già un account?"}</span>
                    <button type="button" className="switch-link" onClick={toggleAuthMode}>
                        {isLogin ? 'Registrati qui' : 'Accedi qui'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;