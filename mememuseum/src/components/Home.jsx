import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from  "react-datepicker";
import it from 'date-fns/locale/it';
registerLocale('it', it);

const Home = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [memes, setMemes] = useState([]);
  const [totalMemes, setTotalMemes] = useState(0);
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
  const [editingMemeId, setEditingMemeId] = useState(null);
  const [nuovoTitolo, setNuovoTitolo] = useState(""); 
  const location = useLocation();
  const [commentoDaEliminare, setCommentoDaEliminare] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);


const fetchMemes = async () => {
    try {
      const userId = localStorage.getItem('userId');
      
      const res = await axios.get('http://localhost:3000/api/memes', {
        params: { 
          userId: userId,
          sortBy: ordinamento, 
          page: pagina, 
          filtroTag: filtroTag,
          date: selectedDate 
            ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
            : undefined
        }
      });

     

      // Verifichiamo che i dati siano un array
      if (res.data && Array.isArray(res.data)) {
        setMemes(res.data);
        
        // Recuperiamo il conteggio totale dal primo elemento (se esiste)
        if (res.data.length > 0 && res.data[0].total_count) {
          setTotalMemes(parseInt(res.data[0].total_count));
        } else {
          setTotalMemes(0);
        }
      } else {
        setMemes([]);
        setTotalMemes(0);
      }
    } catch (err) {
      console.error("Errore durante il caricamento dei meme:", err);
      setMemes([]);
      setTotalMemes(0);
    }
  };

  useEffect(() => {
    fetchMemes();
  }, [ordinamento, pagina, filtroTag, selectedDate]);


useEffect(() => {
  fetchMemes();
   setCommentiAperti({});
  window.scrollTo(0, 0); 
}, [pagina, ordinamento, filtroTag]);

useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightId = params.get('highlight');

    if (highlightId && memes.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`meme-${highlightId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-red');
          setTimeout(() => {
            element.classList.remove('highlight-red');
          }, 3000);
        }
      }, 500); 
    }
  }, [memes, location.search]);

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
  if (!isLoggedIn) return toast.warn("Devi effettuare il login per votare!");
  try {
    await axios.post('http://localhost:3000/api/voti', {
      meme_id: memeId, 
      user_id: localStorage.getItem('userId'), 
      voto: tipoVoto
    });
    fetchMemes(); 
  } catch (err) { toast.error("Impossibile registrare il voto"); }
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
  try {
    await axios.delete(`http://localhost:3000/api/commenti/${id}`, {
      data: { user_id: localStorage.getItem('userId') }
    });
    setCommentoDaEliminare(null); 
    fetchMemes();
    toast.success("Commento eliminato");
  } catch (err) { 
    console.error(err); 
    toast.error("Errore nell'eliminazione");
  }
};

  const handleSalvaModifica = async (commentoId) => {
    try {
      await axios.put(`http://localhost:3000/api/commenti/${commentoId}`, {
        user_id: localStorage.getItem('userId'), nuovoContenuto: testoModifica
      });
      setEditingCommentId(null);
      toast.success("Commento aggiornato con successo!");
      fetchMemes();
    } catch (err) { toast.error("Errore durante la modifica del commento"); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/memes/${id}`, {
        data: { user_id: localStorage.getItem('userId') }
      });
      setMemeDaEliminare(null);
      toast.success("Opera rimossa dal museo.");
      fetchMemes();
    } catch (err) {
      toast.error("Non è stato possibile eliminare l'opera");
    }
  };

  const handleSalvaTitolo = async (memeId) => {
  try {
    const userId = localStorage.getItem('userId');
    await axios.put(`http://localhost:3000/api/memes/${memeId}/titolo`, {
      titolo: nuovoTitolo,
      user_id: userId
    });
    setEditingMemeId(null);
    toast.success("Titolo aggiornato con successo!");
    fetchMemes(); 
  } catch (err) {
    toast.error("Errore nel salvataggio del titolo");
  }
};


return (
    <div className="home-container">
      <div className="museum-header">
        <h1>{isLoggedIn ? `Bentornato, ${localStorage.getItem('username')}!` : "Benvenuto nel Mememuseum"}</h1>
        <p>Esplora l'esposizione corrente o contribuisci con la tua arte.</p>
      </div>
      <div className="search-section">
  <div className="search-bar">
   <input 
  type="text" 
  placeholder="Cerca per tag o titolo..." 
  value={filtroTag}
  onChange={(e) => {
    setFiltroTag(e.target.value.toLowerCase());
    setPagina(1); 
  }}
/>
    {filtroTag && <button onClick={() => setFiltroTag("")} className="btn-clear">×</button>}
  </div>

  <div className="date-picker-group">
    <label>Filtra per data:</label>
    <DatePicker
      selected={selectedDate}
      onChange={(date) => {
        setSelectedDate(date);
        setPagina(1); 
      }}
      dateFormat="dd/MM/yyyy"
      isClearable
      placeholderText="Cerca per data..."
      locale="it"
      className="custom-date-input"
    />
  </div>
  
  <div className="sort-options">
    <label>Ordina per:</label>
    <select value={ordinamento} onChange={(e) => setOrdinamento(e.target.value)}>
      <option value="recent">Più Recenti</option>
      <option value="oldest">Meno Recenti</option>
      <option value="popular">Più Votati (Upvoted)</option>
      <option value="controversial">Meno votati (Downvoted)</option>
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

        {memes.map((meme) => (
          <div key={meme.id_meme} id={`meme-${meme.id_meme}`} className="meme-card">
            
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
  <div className="meme-header">
  {editingMemeId === meme.id_meme ? (
    <div className="edit-title-container">
      <input 
        value={nuovoTitolo} 
        onChange={(e) => setNuovoTitolo(e.target.value)}
        className="edit-title-input"
        autoFocus
      />
      <div className="edit-actions">
        <button onClick={() => handleSalvaTitolo(meme.id_meme)} className="btn-edit-small">Salva</button>
        <span className="button-spacer"> </span>
        <button onClick={() => setEditingMemeId(null)} className="btn-edit-small">Annulla</button>
      </div>
    </div>
  ) : (
    <h3 className="title-with-icon">
      {meme.titolo}
      {isLoggedIn && parseInt(localStorage.getItem('userId')) === meme.user_id && (
        <i 
          className="fa-solid fa-pen btn-edit-icon" 
          onClick={() => { setEditingMemeId(meme.id_meme); setNuovoTitolo(meme.titolo); }}
          title="Modifica titolo"
        ></i>
      )}
    </h3>
  )}
</div>
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
                  <i className="fa-solid fa-comment"></i> {meme.commenti?.length || 0}
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
                    <span className="meme-date">{new Date(meme.data_creazione).toLocaleDateString('it-IT')} ore {new Date(meme.data_creazione).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
              
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        ))}
        </div>
     {/* Sezione Paginazione fuori dalla griglia */}
      <div className="site-pagination">
        <div className="pagination-pill">
          <button 
            disabled={pagina === 1} 
            onClick={() => { setPagina(pagina - 1); window.scrollTo(0, 0); }}
            className="nav-btn"
          >
            ← Precedente
          </button>
          
          <span className="current-page">Pagina {pagina}</span>

          <button 
            disabled={pagina * 10 >= totalMemes} 
            onClick={() => { setPagina(pagina + 1); window.scrollTo(0, 0); }}
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