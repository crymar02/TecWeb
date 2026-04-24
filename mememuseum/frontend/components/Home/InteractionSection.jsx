import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './InteractionSection.css';

const InteractionSection = ({ meme, isLoggedIn, onActionSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nuovoCommento, setNuovoCommento] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [testoModifica, setTestoModifica] = useState("");
  const userId = localStorage.getItem('userId');

  // --- GESTIONE VOTI ---
  const handleVoto = async (tipoVoto) => {
    if (!isLoggedIn) return toast.warn("Devi effettuare il login per votare!");
    try {
      await axios.post('http://localhost:3000/api/voti', {
        withCredentials: true,
        meme_id: meme.id_meme, 
        user_id: userId, 
        voto: tipoVoto
      });
      onActionSuccess(); 
    } catch (err) { 
      toast.error("Impossibile registrare il voto"); 
    }
  };

  // --- GESTIONE COMMENTI ---
  const handleInviaCommento = async () => {
    if (!nuovoCommento.trim()) return;
    try {
      await axios.post('http://localhost:3000/api/commenti', {
        withCredentials: true,
        meme_id: meme.id_meme, 
        user_id: userId, 
        contenuto: nuovoCommento
      });
      setNuovoCommento("");
      onActionSuccess();
    } catch (err) { 
      toast.error("Errore nell'invio del commento");
    }
  };

  const handleSalvaModifica = async (commentoId) => {
    try {
      await axios.put(`http://localhost:3000/api/commenti/${commentoId}`, {
        withCredentials: true,
        user_id: userId, 
        nuovoContenuto: testoModifica
      });
      setEditingCommentId(null);
      toast.success("Commento aggiornato!");
      onActionSuccess();
    } catch (err) { 
      toast.error("Errore durante la modifica"); 
    }
  };

  const handleEliminaCommento = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/commenti/${id}`, {
        withCredentials: true,
        data: { user_id: userId }
      });
      toast.success("Commento eliminato");
      onActionSuccess();
    } catch (err) { 
      toast.error("Errore nell'eliminazione");
    }
  };

  return (
    <div className="meme-interactions">
      <div className="interaction-bar">
        {/* Sezione Voti */}
        <div className="vote-section"> 
          <button 
            onClick={() => handleVoto(true)} 
            className={`btn-vote ${meme.voto_utente === true ? 'active-like' : ''}`}
          >
            <i className="fa-solid fa-thumbs-up"></i> {meme.likes}
          </button>

          <button  
            onClick={() => handleVoto(false)} 
            className={`btn-vote ${meme.voto_utente === false ? 'active-dislike' : ''}`}
          >
            <i className="fa-solid fa-thumbs-down"></i> {meme.dislikes}
          </button>
        </div>

        {/* Pulsante Mostra Commenti */}
        <button className="btn-show-comments" onClick={() => setIsOpen(!isOpen)}>
          <i className="fa-solid fa-comment"></i> {meme.commenti?.length || 0}
        </button>
      </div>

      {/* Dropdown Commenti */}
      {isOpen && (
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
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button onClick={() => handleSalvaModifica(c.id_commento)}>Salva</button>
                        <button onClick={() => setEditingCommentId(null)}>Annulla</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="comment-body">{c.contenuto}</p>
                      {isLoggedIn && parseInt(userId) === c.user_id && (
                        <div className="comment-actions">
                          <button 
                            onClick={() => { setEditingCommentId(c.id_commento); setTestoModifica(c.contenuto); }} 
                            className="btn-edit-small"
                          >
                            modifica
                          </button>
                          <button 
                            onClick={() => handleEliminaCommento(c.id_commento)} 
                            className="btn-delete-small"
                          >
                            elimina
                          </button>
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
                value={nuovoCommento}
                onChange={(e) => setNuovoCommento(e.target.value)}
              />
              <button onClick={handleInviaCommento}>➔</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractionSection;