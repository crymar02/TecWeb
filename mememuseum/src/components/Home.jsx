// src/components/Home.jsx
import React, { useState } from 'react';
import axios from 'axios';

const Home = ({ isLoggedIn }) => {
  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [file, setFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();

    // Recuperiamo l'ID utente salvato nel localStorage dal Login.jsx
    const userId = localStorage.getItem('userId');
    const parsedUserId = parseInt(userId);

  if (!userId || isNaN(parsedUserId)) {
    alert("Sessione non valida. Per favore, riesegui il login.");
    return;
    }
    
    // Controllo di sicurezza: se non c'è l'ID, non possiamo caricare il meme
    if (!userId) {
      alert("Errore: ID utente non trovato. Prova a rifare il login.");
      return;
    }

    const formData = new FormData();
    formData.append('titolo', titolo);
    formData.append('descrizione', descrizione);
    formData.append('immagine', file); // Corrisponde a upload.single('immagine') nel backend
    formData.append('user_id', parsedUserId); // Assicuriamoci che sia un numero intero

    try {
      const response = await axios.post('http://localhost:3000/api/memes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201 || response.status === 200) {
        alert("Meme caricato con successo nel museo! 🖼️");
        // Reset dei campi
        setTitolo('');
        setDescrizione('');
        setFile(null);
        e.target.reset();
      }
    } catch (err) {
      console.error("Errore durante l'upload:", err.response?.data || err.message);
      alert("Errore durante il caricamento: " + (err.response?.data?.error || "Verifica la console"));
    }
  };

  return (
    <div className="home-container">
      {isLoggedIn ? (
        <div className="welcome-upload-section">
          <h1>Ciao, {localStorage.getItem('username')}!</h1>
          <p className="sub-welcome">Sei pronto a caricare nuovi meme?</p>
          
          <div className="upload-box">
            <form onSubmit={handleUpload} className="central-upload-form">
              <input 
                type="text" 
                placeholder="Dai un titolo alla tua opera..." 
                value={titolo}
                onChange={(e) => setTitolo(e.target.value)}
                required 
              />
              <textarea 
                placeholder="Scrivi una breve descrizione (opzionale)..." 
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
              />
              <div className="file-input-group">
                <label htmlFor="file-upload">Seleziona l'immagine:</label>
                <input 
                  id="file-upload"
                  type="file" 
                  accept="image/jpeg, image/png, image/gif" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  required 
                />
              </div>
              <button type="submit" className="btn-main-upload">
                Pubblica nel Museo
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="guest-welcome">
          <h1>Benvenuto nel Mememuseum 🏛️</h1>
          <p>Il tempio dell'arte digitale. Effettua il login per esporre le tue opere.</p>
          <div className="guest-buttons">
            <button onClick={() => window.location.href='/login'} className="nav-link">Accedi</button>
          </div>
        </div>
      )}
      
      {/* Qui caricheremo la galleria dei meme nel prossimo step */}
    </div>
  );
};

export default Home;