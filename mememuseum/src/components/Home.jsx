// src/components/Home.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = ({ isLoggedIn }) => {
  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [file, setFile] = useState(null);
  const [memes, setMemes] = useState([]);

  // Funzione per recuperare i meme dal backend
  const fetchMemes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/memes');
      setMemes(response.data);
    } catch (err) {
      console.error("Errore nel recupero della galleria:", err);
    }
  };

  useEffect(() => {
    fetchMemes();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    const parsedUserId = parseInt(userId);

    if (!userId || isNaN(parsedUserId)) {
      alert("Sessione non valida. Per favore, riesegui il login.");
      return;
    }

    const formData = new FormData();
    formData.append('titolo', titolo);
    formData.append('descrizione', descrizione);
    formData.append('immagine', file);
    formData.append('user_id', parsedUserId);

    try {
      const response = await axios.post('http://localhost:3000/api/memes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 201 || response.status === 200) {
        alert("Meme caricato con successo! 🖼️");
        setTitolo('');
        setDescrizione('');
        setFile(null);
        e.target.reset();
        fetchMemes(); // Ricarica la galleria per vedere il nuovo meme
      }
    } catch (err) {
      alert("Errore durante il caricamento");
    }
  };

  return (
    <div className="home-container">
      {/* SEZIONE 1: Messaggio di Benvenuto e Form (Solo se Loggato) */}
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
                  accept="image/*" 
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
          <p>Effettua il login per esporre le tue opere nella galleria.</p>
        </div>
      )}

      {/* SEZIONE 2: Galleria dei Meme (Sempre visibile) */}
      <div className="meme-gallery">
        <h2 className="gallery-title">Galleria delle Opere</h2>
        <div className="gallery-grid">
          {memes.length > 0 ? (
            memes.map((meme) => (
              <div key={meme.id_meme} className="meme-card">
                <img src={meme.url_immagine} alt={meme.titolo} className="meme-img" />
                <div className="meme-info">
                  <h3>{meme.titolo}</h3>
                  <p>{meme.descrizione}</p>
                  <span className="author">Artista: <strong>{meme.username}</strong></span>
                </div>
              </div>
            ))
          ) : (
            <p>Il museo è ancora vuoto. Sii il primo a esporre!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;