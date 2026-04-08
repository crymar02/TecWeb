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
  const [commentiTesto, setCommentiTesto] = useState({});
  // Stato per gestire quali sezioni commenti sono visibili
  const [commentiAperti, setCommentiAperti] = useState({}); 

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

  const toggleCommenti = (memeId) => {
    setCommentiAperti(prev => ({
      ...prev,
      [memeId]: !prev[memeId]
    }));
  };

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

  const handleVoto = async (memeId, tipoVoto) => {
    if (!isLoggedIn) return alert("Devi effettuare il login per votare!");
    try {
      await axios.post('http://localhost:3000/api/voti', {
        meme_id: memeId,
        user_id: localStorage.getItem('userId'),
        voto: tipoVoto
      });
      fetchMemes(); 
    } catch (err) {
      console.error("Errore voto:", err);
    }
  };

  const handleInviaCommento = async (memeId) => {
    if (!isLoggedIn) return alert("Devi essere loggato per commentare!");
    const contenuto = commentiTesto[memeId];
    if (!contenuto || !contenuto.trim()) return;

    try {
      await axios.post('http://localhost:3000/api/commenti', {
        meme_id: memeId,
        user_id: localStorage.getItem('userId'),
        contenuto: contenuto
      });
      setCommentiTesto({ ...commentiTesto, [memeId]: "" }); 
      fetchMemes(); 
    } catch (err) {
      console.error("Errore invio commento:", err);
    }
  };

  return (
    <div className="home-container">
      <div className="museum-header">
        <h1>{isLoggedIn ? `Bentornato, ${localStorage.getItem('username')}!` : "Benvenuto nel Mememuseum 🏛️"}</h1>
        <p>Esplora l'esposizione corrente o contribuisci con la tua arte.</p>
      </div>

      <div className="gallery-grid">
        {/* Card di Upload */}
        <div className={`meme-card create-card ${showForm ? 'form-active' : ''}`}>
          {!showForm ? (
            <div className="plus-icon-wrapper" onClick={() => isLoggedIn ? setShowForm(true) : navigate('/login')}>
              <span className="plus-icon">+</span>
              <p>Aggiungi Opera</p>
            </div>
          ) : (
            <form onSubmit={handleUpload} className="card-upload-form">
              <h3>Nuova Esposizione</h3>
              <input type="text" placeholder="Titolo..." value={titolo} onChange={(e) => setTitolo(e.target.value)} required />
              <textarea placeholder="Descrizione..." value={descrizione} onChange={(e) => setDescrizione(e.target.value)} />
              <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
              <div className="form-buttons">
                <button type="submit" className="btn-publish">Pubblica</button>
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Annulla</button>
              </div>
            </form>
          )}
        </div>

        {/* Lista Meme */}
        {memes.map((meme) => (
          <div key={meme.id_meme} className="meme-card">
            <img src={meme.url_immagine} alt={meme.titolo} className="meme-img" />
            <div className="meme-info">
              <div>
                <h3>{meme.titolo}</h3>
                <p>{meme.descrizione}</p>
              </div>

              <div className="meme-interactions">
                <div className="interaction-bar">
                  <div className="vote-section">
                    <button onClick={() => handleVoto(meme.id_meme, true)} className="btn-vote">👍 {meme.likes || 0}</button>
                    <button onClick={() => handleVoto(meme.id_meme, false)} className="btn-vote">👎 {meme.dislikes || 0}</button>
                  </div>
                  <button className="btn-show-comments" onClick={() => toggleCommenti(meme.id_meme)}>
                    💬 {meme.commenti?.length || 0} Commenti
                  </button>
                </div>

                {commentiAperti[meme.id_meme] && (
                  <div className="comments-dropdown">
                    <div className="comments-list">
                      {meme.commenti && meme.commenti.length > 0 ? (
                        meme.commenti.map(c => (
                          <div key={c.id_commento} className="single-comment">
                            <strong>{c.username}</strong>: {c.contenuto}
                          </div>
                        ))
                      ) : <p className="no-comments">Nessun commento...</p>}
                    </div>
                    {isLoggedIn && (
                      <div className="comment-input-area">
                        <input 
                          type="text" 
                          placeholder="Scrivi..." 
                          value={commentiTesto[meme.id_meme] || ""}
                          onChange={(e) => setCommentiTesto({...commentiTesto, [meme.id_meme]: e.target.value})}
                        />
                        <button onClick={() => handleInviaCommento(meme.id_meme)}>➔</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="meme-footer">
                <div className="meme-meta">
                  <span className="author">Artista: <strong>{meme.username}</strong></span>
                  <span className="meme-date">{new Date(meme.data_creazione).toLocaleDateString('it-IT')}</span>
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
                        <button onClick={() => setMemeDaEliminare(meme.id_meme)} className="btn-delete-mini">🗑️</button>
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