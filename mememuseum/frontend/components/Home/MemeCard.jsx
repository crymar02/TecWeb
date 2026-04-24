import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import InteractionSection from './InteractionSection';

const MemeCard = ({ meme, isLoggedIn, onActionSuccess }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [nuovoTitolo, setNuovoTitolo] = useState(meme.titolo);
  const [memeDaEliminare, setMemeDaEliminare] = useState(false);
  const currentUserId = parseInt(localStorage.getItem('userId'));
  const isOwner = isLoggedIn && currentUserId === meme.user_id;

  // Funzione per salvare la modifica del titolo
  const handleSalvaTitolo = async () => {
    try {
      await axios.put(`http://localhost:3000/api/memes/${meme.id_meme}/titolo`, {
        titolo: nuovoTitolo,
        user_id: currentUserId
      });
      setIsEditingTitle(false);
      toast.success("Titolo aggiornato con successo!");
      onActionSuccess(); // Ricarica i dati nella Home
    } catch (err) {
      toast.error("Errore nel salvataggio del titolo");
    }
  };

  // Funzione per eliminare il meme
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/memes/${meme.id_meme}`, {
        data: { user_id: currentUserId }
      });
      toast.success("Opera rimossa dal museo.");
      onActionSuccess();
    } catch (err) {
      toast.error("Non è stato possibile eliminare l'opera");
    }
  };

  return (
    <div id={`meme-${meme.id_meme}`} className="meme-card">
      
      {/* Eliminazione */}
      {isOwner && (
        <div className="top-delete-container">
          {memeDaEliminare ? (
            <div className="confirm-box-top">
              <span>Confermi?</span>
              <button onClick={handleDelete} className="btn-confirm-yes-small">Sì</button>
              <button onClick={() => setMemeDaEliminare(false)} className="btn-confirm-no-small">No</button>
            </div>
          ) : (
            <button onClick={() => setMemeDaEliminare(true)} className="btn-delete-cross">×</button>
          )}
        </div>
      )}

      <img src={meme.url_immagine} alt={meme.titolo} className="meme-img" />
      
      <div className="meme-info">
        <div className="meme-header">
          {isEditingTitle ? (
            <div className="edit-title-container">
              <input 
                value={nuovoTitolo} 
                onChange={(e) => setNuovoTitolo(e.target.value)}
                className="edit-title-input"
                autoFocus
              />
              <div className="edit-actions">
                <button onClick={handleSalvaTitolo} className="btn-edit-small">Salva</button>
                <button onClick={() => setIsEditingTitle(false)} className="btn-edit-small">Annulla</button>
              </div>
            </div>
          ) : (
            <h3 className="title-with-icon">
              {meme.titolo}
              {isOwner && (
                <i 
                  className="fa-solid fa-pen btn-edit-icon" 
                  onClick={() => setIsEditingTitle(true)}
                  title="Modifica titolo"
                ></i>
              )}
            </h3>
          )}
        </div>

        <p className="meme-description">{meme.descrizione}</p>

         <div className="meme-tags">
           {meme.tags && meme.tags.map((tag, index) => (
           <span key={index} className="tag-badge">#{tag}</span>
        ))}
            </div>

        <InteractionSection 
          meme={meme} 
          isLoggedIn={isLoggedIn} 
          onActionSuccess={onActionSuccess} 
        />

    <div className="meme-footer">
      <div className="meme-meta">
        <span className="author">Autore: <strong>{meme.username}</strong></span>
        <span className="meme-date">
        Creato il giorno {new Date(meme.data_creazione).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })} alle ore {new Date(meme.data_creazione).toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
      })}
         </span>
        </div>
       </div>
      </div>
    </div>
  );
};

export default MemeCard;