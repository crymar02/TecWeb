import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const initialState = {
    nome: '', 
    cognome: '', 
    username: '', 
    email: '', 
    password: ''
};

const Auth = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        nome: '', cognome: '', username: '', email: '', password: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setFormData(initialState); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Sceglie l'URL in base allo stato
        const url = isLogin 
            ? 'http://localhost:3000/api/auth/login' 
            : 'http://localhost:3000/api/auth/signup';
        
        try {
            const res = await axios.post(url, formData);
            setFormData(initialState);
            if (isLogin) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('username', res.data.user.username);
                localStorage.setItem('userId', res.data.user.id);
                onLoginSuccess();
                navigate('/');
            } else {
                toast.info("Registrazione completata! Ora effettua il login.");
                setFormData(initialState);
                setIsLogin(true); 
            }
        } catch (err) {
            setFormData(initialState);
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
                            <input type="text" name="nome" placeholder="Nome" onChange={handleChange} required />
                            <input type="text" name="cognome" placeholder="Cognome" onChange={handleChange} required />
                            <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                        </>
                    )}
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                    <button type="submit" className="btn-auth">
                        {isLogin ? 'Login' : 'Crea Account'}
                    </button>
                </form>

                <div className="switch-auth">
                    <span>{isLogin ? "Non hai un account?" : "Hai già un account?"}</span>
                    <button 
                        type="button" 
                        className="switch-link" 
                        onClick={toggleAuthMode}
                    >
                        {isLogin ? 'Registrati qui' : 'Accedi qui'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;