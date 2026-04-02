import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3000/api/auth/login', credentials);
            
            // Salviamo il token nel localStorage per mantenere la sessione
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.user.username);
            localStorage.setItem('userId', res.data.user.id);
            
            alert("Login effettuato!");
            if (onLoginSuccess) {
                onLoginSuccess();
            }
            navigate('/'); // Reindirizza alla home
        } catch (err) {
            alert("Credenziali errate");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <button type="submit">Entra</button>
        </form>
    );
};

export default Login;