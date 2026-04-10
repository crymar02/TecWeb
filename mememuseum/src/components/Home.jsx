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
  const [commentiAperti, setCommentiAperti] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [testoModifica, setTestoModifica] = useState("");
  const [tags, setTags] = useState(""); 
  const [filtroTag, setFiltroTag] = useState("");
  const [ordinamento, setOrdinamento] = useState("recent");
  const [pagina, setPagina] = useState(1);

const fetchMemes = async () => {
  try {
    const userId = localStorage.getItem('userId');
    const res = await axios.get('http://localhost:3000/api/memes', {
      params: { 
        userId: userId,
        sortBy: ordinamento,
        page: pagina // <--- Invia la pagina corrente
      }
    });
    setMemes(res.data);
  } catch (err) { console.error(err); }
};


useEffect(() => {
  fetchMemes();
  window.scrollTo(0, 0); 
}, [pagina, ordinamento]);

  const toggleCommenti = (memeId) => {
    setCommentiAperti(prev => ({ ...prev, [memeId]: !prev[memeId] }));
  };

const handleUpload = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('titolo', titolo);
  formData.append('descrizione', descrizione);
  formData.append('immagine', file);
  formData.append('user_id', localStorage.getItem('userId'));
  formData.append('tags', tags.toLocaleLowerCase()); 

  try {
    await axios.post('http://localhost:3000/api/memes/upload', formData);
    // Reset campi e chiusura form
    setTitolo("");
    setDescrizione("");
    setTags("");
    setFile(null);
    setShowForm(false);
    fetchMemes();
  } catch (err) {
    console.error(err);
  }
};

const handleVoto = async (memeId, tipoVoto) => {
  if (!isLoggedIn) return alert("Esegui il login!");
  try {
    await axios.post('http://localhost:3000/api/voti', {
      meme_id: memeId, 
      user_id: localStorage.getItem('userId'), 
      voto: tipoVoto
    });
    fetchMemes(); 
  } catch (err) { console.error(err); }
};
  const handleInviaCommento = async (memeId) => {
    const contenuto = commentiTesto[memeId];
    if (!contenuto?.trim()) return;
    try {
      await axios.post('http://localhost:3000/api/commenti', {
        meme_id: memeId, user_id: localStorage.getItem('userId'), contenuto
      });
      setCommentiTesto({ ...commentiTesto, [memeId]: "" });
      fetchMemes();
    } catch (err) { console.error(err); }
  };

  const handleEliminaCommento = async (id) => {
    if (!window.confirm("Eliminare il commento?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/commenti/${id}`, {
        data: { user_id: localStorage.getItem('userId') }
      });
      fetchMemes();
    } catch (err) { console.error(err); }
  };

  const handleSalvaModifica = async (commentoId) => {
    try {
      await axios.put(`http://localhost:3000/api/commenti/${commentoId}`, {
        user_id: localStorage.getItem('userId'), nuovoContenuto: testoModifica
      });
      setEditingCommentId(null);
      fetchMemes();
    } catch (err) { alert("Errore modifica"); }
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

const memesFiltrati = memes.filter(meme => {
  const search = filtroTag.toLowerCase();
  // Controlla nei tag (se esistono)
  const neiTag = meme.tags?.some(t => t.toLowerCase().includes(search));
  // Controlla nel titolo
  const nelTitolo = meme.titolo.toLowerCase().includes(search);
  
  return neiTag || nelTitolo;
});
return (
    <div className="home-container">
      <div className="museum-header">
        <h1>{isLoggedIn ? `Bentornato, ${localStorage.getItem('username')}!` : "Benvenuto nel Mememuseum 🏛️"}</h1>
        <p>Esplora l'esposizione corrente o contribuisci con la tua arte.</p>
      </div>
      <div className="search-section">
  <div className="search-bar">
    <input 
      type="text" 
      placeholder="Cerca per tag o titolo..." 
      value={filtroTag}
      onChange={(e) => setFiltroTag(e.target.value.toLowerCase())}
    />
    {filtroTag && <button onClick={() => setFiltroTag("")} className="btn-clear">×</button>}
  </div>
  
  <div className="sort-options">
    <label>Ordina per:</label>
    <select value={ordinamento} onChange={(e) => setOrdinamento(e.target.value)}>
      <option value="recent">Più Recenti</option>
      <option value="popular">Più Votati (Upvoted)</option>
      <option value="controversial">Meno Votati (Downvoted)</option>
    </select>
  </div>
</div>
      <div className="gallery-grid">
        {/* Card Upload */}
        {isLoggedIn && (
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
                <input type="text" placeholder="Tags (separati da virgola)" value={tags} onChange={(e) => setTags(e.target.value)} />
                <div className="form-buttons">
                  <button type="submit" className="btn-publish">Pubblica</button>
                  <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Annulla</button>
                </div>
              </form>
            )}
          </div>
        )}

        {memesFiltrati.map((meme) => (
          <div key={meme.id_meme} className="meme-card">
            
            {/* Crocetta di eliminazione in alto a destra */}
            {isLoggedIn && parseInt(localStorage.getItem('userId')) === meme.user_id && (
              <div className="top-delete-container">
                {memeDaEliminare === meme.id_meme ? (
                  <div className="confirm-box-top">
                    <span>Confermi?</span>
                    <button onClick={() => handleDelete(meme.id_meme)} className="btn-confirm-yes-small">Sì</button>
                    <button onClick={() => setMemeDaEliminare(null)} className="btn-confirm-no-small">No</button>
                  </div>
                ) : (
                  <button onClick={() => setMemeDaEliminare(meme.id_meme)} className="btn-delete-cross">×</button>
                )}
              </div>
            )}

            <img src={meme.url_immagine} alt={meme.titolo} className="meme-img" />
            
            <div className="meme-info">
              <h3>{meme.titolo}</h3>
              <p className="meme-description">{meme.descrizione}</p>
              {/* Visualizzazione Tag */}
            <div className="meme-tags">
           {meme.tags && meme.tags.map((tag, index) => (
           <span key={index} className="tag-badge">#{tag}</span>
        ))}
            </div>

              <div className="meme-interactions">
                <div className="interaction-bar">
                  <div className="vote-section"> 
                    <button 
                onClick={() => handleVoto(meme.id_meme, true)} 
              className={`btn-vote ${meme.voto_utente === true || meme.voto_utente === 1 ? 'active-like' : ''}`}
            >
             <i className="fa-solid fa-thumbs-up"></i> {meme.likes}
            </button>

            <button  
           onClick={() => handleVoto(meme.id_meme, false)} 
          className={`btn-vote ${meme.voto_utente === false || meme.voto_utente === 0 ? 'active-dislike' : ''}`}
          >
          <i className="fa-solid fa-thumbs-down"></i> {meme.dislikes}
          </button>
                  </div>
                  <button className="btn-show-comments" onClick={() => toggleCommenti(meme.id_meme)}>
                    💬 {meme.commenti?.length || 0}
                  </button>
                </div>

                {commentiAperti[meme.id_meme] && (
                  <div className="comments-dropdown">
                    <div className="comments-list">
                      {meme.commenti && meme.commenti.length > 0 ? (
                        meme.commenti.map(c => (
                          <div key={c.id_commento} className="single-comment">
                            <div className="comment-header">
                              <span className="comment-author">{c.username}</span>
                              <span className="comment-date">
                                {new Date(c.data_creazione_commento).toLocaleString('it-IT', {
                                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                            </div>

                            {editingCommentId === c.id_commento ? (
                              <div className="edit-comment-inline">
                                <input 
                                  value={testoModifica} 
                                  onChange={(e) => setTestoModifica(e.target.value)}
                                />
                                <div className="edit-actions">
                                  <button onClick={() => handleSalvaModifica(c.id_commento)}>Salva</button>
                                  <button onClick={() => setEditingCommentId(null)}>Annulla</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="comment-body">{c.contenuto}</p>
                                {isLoggedIn && parseInt(localStorage.getItem('userId')) === c.user_id && (
                                  <div className="comment-actions">
                                    <button onClick={() => { setEditingCommentId(c.id_commento); setTestoModifica(c.contenuto); }} className="btn-edit-small">modifica</button>
                                    <button onClick={() => handleEliminaCommento(c.id_commento)} className="btn-delete-small">elimina</button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="no-comments">Nessun commento...</p>
                      )}
                    </div>
                    
                    {isLoggedIn && (
                      <div className="comment-input-area">
                        <input 
                          placeholder="Commenta..." 
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
                  <div>
                    <span className="author">Autore: <strong>{meme.username}</strong></span>
                    <span className="meme-date">{new Date(meme.data_creazione).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        ))}
      </div>
      <div className="site-pagination">
        <div className="pagination-pill">
          <button 
            disabled={pagina === 1} 
            onClick={() => { setPagina(pagina - 1); window.scrollTo(0,0); }}
            className="nav-btn"
          >
            ← Precedente
          </button>

          <span className="current-page">Pagina {pagina}</span>

          <button 
            disabled={memes.length < 10} 
            onClick={() => { setPagina(pagina + 1); window.scrollTo(0,0); }}
            className="nav-btn"
          >
            Successiva →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;