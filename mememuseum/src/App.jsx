// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'; 
import Home from './components/Home.jsx';
import Auth from './components/Auth.jsx';
import MemeDelGiorno from './components/MemeDelGiorno.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId'); 
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="logo">
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
      </div>
    </Router>
  );
}

export default App;