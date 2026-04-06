// src/components/Home.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importiamo navigate per il redirect

const Home = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [memes, setMemes] = useState([]);
  const [showForm, setShowForm] = useState(false); // Stato per mostrare/nascondere il form

  // Stati per i campi del form
  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [file, setFile] = useState(null);

  // Recupera i meme
  const fetchMemes = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/memes');
      setMemes(res.data);
    } catch (err) {
      console.error("Errore gallery:", err);
    }
  };

  useEffect(() => {
    fetchMemes();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    const formData = new FormData();
    formData.append('titolo', titolo);
    formData.append('descrizione', descrizione);
    formData.append('immagine', file);
    formData.append('user_id', userId);

    try {
      await axios.post('http://localhost:3000/api/memes/upload', formData);
      alert("Meme pubblicato!");
      // Reset campi e chiusura form
      setTitolo('');
      setDescrizione('');
      setFile(null);
      setShowForm(false); 
      e.target.reset();
      fetchMemes(); // Ricarica la lista
    } catch (err) {
      alert("Errore upload");
    }
  };

  const handleDelete = async (memeId) => {
    if (!window.confirm("Rimuovere l'opera?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/memes/${memeId}`, {
        data: { user_id: localStorage.getItem('userId') }
      });
      fetchMemes();
    } catch (err) { alert("Errore cancellazione"); }
  };

  // Funzione per gestire il click sul "+"
  const handlePlusClick = () => {
    if (isLoggedIn) {
      setShowForm(true); // Mostra il form se loggato
    } else {
      alert("Devi effettuare il login o registrarti per esporre le tue opere nel museo!");
      navigate('/login'); // Reindirizza al login se ospite
    }
  };

  return (
    <div className="home-container">
      
      {/* Intestazione del Museo */}
      <div className="museum-header">
        {isLoggedIn ? (
          <h1>Bentornato, {localStorage.getItem('username')}!</h1>
        ) : (
          <h1>Benvenuto nel Mememuseum 🏛️</h1>
        )}
        <p>Esplora l'esposizione corrente o contribuisci con la tua arte.</p>
      </div>

      {/* Griglia della Galleria */}
      <div className="gallery-grid">
        
        {/* CARD CREATIVA (Il pulsante "+" o il Form) */}
        <div className={`meme-card create-card ${showForm ? 'form-active' : ''}`}>
          {!showForm ? (
            // Stato 1: Il grande "+" centrale
            <div className="plus-icon-wrapper" onClick={handlePlusClick}>
              <span className="plus-icon">+</span>
              <p>Aggiungi Opera</p>
            </div>
          ) : (
            // Stato 2: Il Form di upload (visibile solo se loggato e showForm è true)
            <form onSubmit={handleUpload} className="card-upload-form">
              <h3>Nuova Esposizione</h3>
              <input 
                type="text" 
                placeholder="Titolo dell'opera..." 
                value={titolo}
                onChange={(e) => setTitolo(e.target.value)}
                required 
              />
              <textarea 
                placeholder="Breve descrizione (opzionale)..." 
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
              />
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setFile(e.target.files[0])} 
                required 
              />
              <div className="form-buttons">
                <button type="submit" className="btn-publish">Pubblica</button>
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Annulla</button>
              </div>
            </form>
          )}
        </div>

        {/* CARD DEI MEME ESISTENTI */}
        {memes.map((meme) => (
          <div key={meme.id_meme} className="meme-card">
            <img src={meme.url_immagine} alt={meme.titolo} className="meme-img" />
            <div className="meme-info">
              <h3>{meme.titolo}</h3>
              <p>{meme.descrizione}</p>
              <div className="meme-footer">
                <span className="author">Artista: <strong>{meme.username}</strong></span>
                {/* Tasto Elimina condizionale */}
                {isLoggedIn && parseInt(localStorage.getItem('userId')) === meme.user_id && (
                  <button onClick={() => handleDelete(meme.id_meme)} className="btn-delete-mini">
                    🗑️
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;