import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UploadCard = ({ onUploadSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Seleziona un'immagine!");

    const userId = localStorage.getItem('userId');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('titolo', titolo);
    formData.append('descrizione', descrizione);
    formData.append('tags', tags);
    formData.append('user_id', userId);

    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/memes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success("Opera pubblicata nel museo!");
      
      // Reset form e chiusura
      setTitolo('');
      setDescrizione('');
      setTags('');
      setFile(null);
      setShowForm(false);
      
      // Notifica la Home di ricaricare la lista
      onUploadSuccess();
    } catch (err) {
      toast.error("Errore durante la pubblicazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`meme-card upload-card ${showForm ? 'form-active' : ''}`}>
      {!showForm ? (
        <div className="upload-placeholder" onClick={() => setShowForm(true)}>
          <div className="plus-icon">+</div>
          <p>Aggiungi una nuova opera</p>
        </div>
      ) : (
        <form onSubmit={handleUpload} className="upload-form">
          <h3>Nuova Opera</h3>
          
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
            required 
          />
          
          <input 
            type="text" 
            placeholder="Tags (separati da virgola...)" 
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <div className="file-input-container">
            {file ? file.name : "Scegli Immagine"}
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files[0])}
              id="file-upload"
            />
            <label htmlFor="file-upload" className="btn-file">
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-publish" disabled={loading}>
              {loading ? "Pubblicazione..." : "Pubblica"}
            </button>
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={() => setShowForm(false)}
            >
              Annulla
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UploadCard;