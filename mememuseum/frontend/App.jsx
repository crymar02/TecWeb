import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './App.css'; 
import Home from './pages/Home.jsx';
import Auth from './pages/Auth.jsx';
import MemeDelGiorno from './pages/MemeDelGiorno.jsx';

axios.defaults.withCredentials = true;
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
    const username = localStorage.getItem('username');
    setIsLoggedIn(!!username);
  }, []);

  const checkLoginStatus = () => {
    const username = localStorage.getItem('username');
    setIsLoggedIn(!!username);
  };

const handleLogout = async () => {
    try {
        await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
        localStorage.clear();
        setIsLoggedIn(false);
        toast.info("Logout effettuato");
    } catch (err) {
        toast.error("Errore durante il logout");
        localStorage.clear();
        setIsLoggedIn(false);
    }
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="logo">
            <img src="/logomememuseum.png" className="navbar-logo" />
            <Link to="/"> MEMEMUSEUM</Link>
          </div>
          <div className="menu">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/meme-del-giorno" className="nav-link">Meme del Giorno</Link>
            {!isLoggedIn ? (
              <>
                <Link to="/auth" className="nav-link">Accedi</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            )}
          </div>
        </nav>

        <div className="content">
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          <Route path="/auth" element={<Auth onLoginSuccess={checkLoginStatus} />} />
          <Route path="/meme-del-giorno" element={<MemeDelGiorno />} />
        </Routes>
        </div>
        <ToastContainer position="bottom-right" theme="colored" />
      </div>
    </Router>
    
  );
}

export default App;