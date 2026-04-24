import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Home.css';
import SearchBar from '../components/Home/SearchBar';
import UploadCard from '../components/Home/UploadCard';
import MemeCard from '../components/Home/MemeCard';
import Pagination from '../components/Home/Pagination';

const Home = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATI DEI DATI ---
  const [memes, setMemes] = useState([]);
  const [totalMemes, setTotalMemes] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [filtroTag, setFiltroTag] = useState("");
  const [ordinamento, setOrdinamento] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  // --- LOGICA DI CARICAMENTO ---
  const fetchMemes = useCallback(async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.get('http://localhost:3000/api/memes', {
        params: { 
          userId,
          sortBy: ordinamento, 
          page: pagina, 
          filtroTag,
          date: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined
        }
      });

      if (res.data && Array.isArray(res.data)) {
        setMemes(res.data);
        setTotalMemes(res.data.length > 0 ? parseInt(res.data[0].total_count) : 0);
      }
    } catch (err) {
      console.error("Errore caricamento:", err);
      toast.error("Errore nel caricamento della galleria");
    }
  }, [pagina, ordinamento, filtroTag, selectedDate]);

  // Ricarica quando cambiano filtri o pagina
  useEffect(() => {
    fetchMemes();
  }, [fetchMemes]);

  // Gestione Highlight (scroll al meme specifico se indicato nell'URL)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightId = params.get('highlight');
    if (highlightId && memes.length > 0) {
      const element = document.getElementById(`meme-${highlightId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-red');
        setTimeout(() => element.classList.remove('highlight-red'), 3000);
        navigate('/', { replace: true });
      }
    }
  }, [memes, location.search, navigate]);

  return (
    <div className="home-container">
      <div className="museum-header">
        <h1>{isLoggedIn ? `Ciao, ${localStorage.getItem('username')}!` : "Benvenuti nel Mememuseum"}</h1>
        <p>Esplora l'esposizione corrente o contribuisci con la tua arte.</p>
      </div>

      {/* COMPONENTE FILTRI */}
      <SearchBar 
        filtroTag={filtroTag} 
        setFiltroTag={setFiltroTag}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        ordinamento={ordinamento}
        setOrdinamento={setOrdinamento}
        setPagina={setPagina}
      />

      <div className="gallery-grid">
        {/* COMPONENTE UPLOAD (Solo se loggato) */}
        {isLoggedIn && <UploadCard onUploadSuccess={fetchMemes} />}

        {/* LISTA DEI MEME */}
        {memes.map((meme) => (
          <MemeCard 
            key={meme.id_meme} 
            meme={meme} 
            isLoggedIn={isLoggedIn}
            onActionSuccess={fetchMemes} 
          />
        ))}
      </div>

      {/* COMPONENTE PAGINAZIONE */}
      <Pagination 
        pagina={pagina} 
        setPagina={setPagina} 
        totalMemes={totalMemes} 
      />
    </div>
  );
};

export default Home;