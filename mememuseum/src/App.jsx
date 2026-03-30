import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'; 
import Home from './components/Home.jsx';
import Login from './components/Auth/Login.jsx';
import Signup from './components/Auth/Singup.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="logo">
            <Link to="/">🖼️ MEMEMUSEUM</Link>
          </div>
          <div className="menu">
            <Link to="/" className="nav-link">Home</Link>
            
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/signup" className="btn-signup">Registrati</Link>
              </>
            ) : (
              <>
                <span className="user-welcome">
                  Ciao, <strong>{localStorage.getItem('username')}</strong>!
                </span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<h2>404 - Pagina non trovata</h2>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;