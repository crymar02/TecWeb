import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MemeDelGiorno.css'; 

const MemeDelGiorno = () => {
  const [meme, setMeme] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMemeDelGiorno = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/memes/del-giorno');
        setMeme(res.data);
      } catch (err) {
        console.error("Errore nel recupero del meme del giorno", err);
      }
    };
    fetchMemeDelGiorno();
  }, []);

  if (!meme) return <div className="loading">Caricamento dell'opera del giorno...</div>;

  const vaiAlMemeInHome = () => {
    navigate(`/?highlight=${meme.id_meme}`);
  };

  return (
    <div className="home-container">
      <div className="museum-header">
        <h1>L'Opera del Giorno</h1>
        <p>Un capolavoro selezionato per questo {new Date().toLocaleDateString('it-IT')}</p>
      </div>

      {/* Classe aggiunta per gestire il flex e le dimensioni */}
      <div className="meme-container-flex">
        <div className="meme-card meme-card-day">
          <img src={meme.url_immagine} alt={meme.titolo} className="meme-img" />
          
          <div className="meme-info">
            <div className="meme-header">
              <h3 className="title-with-icon">{meme.titolo}</h3>
            </div>
            
            <p className="meme-description">{meme.descrizione}</p>

            <div className="meme-footer">
              <div className="meme-meta">
                <span className="author">Autore: <strong>{meme.username}</strong></span>
                
                <button 
                  onClick={vaiAlMemeInHome}
                  className="btn-publish btn-details" 
                >
                  Mostra ulteriori dettagli
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeDelGiorno;