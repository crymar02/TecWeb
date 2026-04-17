import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MemeDelGiorno = () => {
  const [meme, setMeme] = useState(null);

  useEffect(() => {
    const fetchMemeDelGiorno = async () => {
      try {
        // Recuperiamo il meme dal backend
        const res = await axios.get('http://localhost:3000/api/memes/del-giorno');
        setMeme(res.data);
      } catch (err) {
        console.error("Errore nel recupero del meme del giorno", err);
      }
    };
    fetchMemeDelGiorno();
  }, []);

  if (!meme) return <div className="loading">Caricamento dell'opera del giorno...</div>;

  return (
    <div className="home-container">
      <div className="museum-header">
        <h1>L'Opera del Giorno 🏛️</h1>
        <p>Un capolavoro selezionato per questo {new Date().toLocaleDateString('it-IT')}</p>
      </div>

      {/* Container per centrare la card */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        
        {/* Usiamo la stessa classe 'meme-card' della Home */}
        <div className="meme-card" style={{ margin: 0 }}>
          <img src={meme.url_immagine} alt={meme.titolo} className="meme-img" />
          
          <div className="meme-info">
            <div className="meme-header">
              <h3 className="title-with-icon">{meme.titolo}</h3>
            </div>
            
            <p className="meme-description">{meme.descrizione}</p>

            <div className="meme-tags">
              {meme.tags && meme.tags.map((tag, index) => (
                <span key={index} className="tag-badge">#{tag}</span>
              ))}
            </div>

            <div className="meme-interactions">
              <div className="interaction-bar">
                <div className="vote-section">
                  <button className="btn-vote">
                    <i className="fa-solid fa-thumbs-up"></i> {meme.likes}
                  </button>
                  <button className="btn-vote">
                    <i className="fa-solid fa-thumbs-down"></i> {meme.dislikes}
                  </button>
                </div>
              </div>
            </div>

            <div className="meme-footer">
              <div className="meme-meta">
                <span className="author">Autore: <strong>{meme.username}</strong></span>
                <span className="meme-date">
                  {new Date(meme.data_creazione).toLocaleDateString('it-IT')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeDelGiorno;