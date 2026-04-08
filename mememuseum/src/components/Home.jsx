// src/components/Home.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [memes, setMemes] = useState([]);
  const [showForm, setShowForm] = useState(false); 
  const [memeDaEliminare, setMemeDaEliminare] = useState(null);

  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [file, setFile] = useState(null);

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
      setTitolo('');
      setDescrizione('');
      setFile(null);
      setShowForm(false); 
      e.target.reset();
      fetchMemes();
    } catch (err) {
      alert("Errore upload");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/memes/${id}`, {
        data: { user_id: localStorage.getItem('userId') }
      });
      setMemeDaEliminare(null);
      fetchMemes();
    } catch (err) {
      alert("Errore durante l'eliminazione");
    }
  };

  const handlePlusClick = () => {
    if (isLoggedIn) {
      setShowForm(true);
    } else {
      alert("Devi effettuare il login o registrarti per esporre le tue opere nel museo!");
      navigate('/login');
    }
  };

  return (
    <div className="home-container">
      <div className="museum-header">
        {isLoggedIn ? (
          <h1>Bentornato, {localStorage.getItem('username')}!</h1>
        ) : (
          <h1>Benvenuto nel Mememuseum 🏛️</h1>
        )}
        <p>Esplora l'esposizione corrente o contribuisci con la tua arte.</p>
      </div>

      <div className="gallery-grid">
        <div className={`meme-card create-card ${showForm ? 'form-active' : ''}`}>
          {!showForm ? (
            <div className="plus-icon-wrapper" onClick={handlePlusClick}>
              <span className="plus-icon">+</span>
              <p>Aggiungi Opera</p>
            </div>
          ) : (
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
                placeholder="Descrizione..." 
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

        {memes.map((meme) => (
          <div key={meme.id_meme} className="meme-card">
            <img src={meme.url_immagine} alt={meme.titolo} className="meme-img" />
            <div className="meme-info">
              <h3>{meme.titolo}</h3>
              <p>{meme.descrizione}</p>
              
              <div className="meme-footer">
                <div className="meme-meta">
                  <span className="author">Artista: <strong>{meme.username}</strong></span>
                  <span className="meme-date">
                    {new Date(meme.data_creazione).toLocaleDateString('it-IT')}
                  </span>
                </div>

                <div className="delete-wrapper">
                  {isLoggedIn && parseInt(localStorage.getItem('userId')) === meme.user_id && (
                    <div className="delete-container">
                      {memeDaEliminare === meme.id_meme ? (
                        <div className="confirm-box">
                          <span>Sicuro?</span>
                          <button onClick={() => handleDelete(meme.id_meme)} className="btn-confirm-yes">Sì</button>
                          <button onClick={() => setMemeDaEliminare(null)} className="btn-confirm-no">No</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setMemeDaEliminare(meme.id_meme)} 
                          className="btn-delete-mini"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}     
      </div>
    </div>
  );
};

export default Home;