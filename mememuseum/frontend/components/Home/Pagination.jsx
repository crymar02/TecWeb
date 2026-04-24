import React from 'react';

const Pagination = ({ pagina, setPagina, totalMemes }) => {
  const LIMIT = 10;
  const hasNext = pagina * LIMIT < totalMemes;

  const handlePageChange = (nuovaPagina) => {
    setPagina(nuovaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (totalMemes === 0) return null;

  return (
    <div className="site-pagination">
      <div className="pagination-pill">
        <button 
          disabled={pagina === 1} 
          onClick={() => handlePageChange(pagina - 1)}
          className="nav-btn"
        >
          ← Precedente
        </button>
        
        <span className="current-page">Pagina {pagina}</span>

        <button 
          disabled={!hasNext} 
          onClick={() => handlePageChange(pagina + 1)}
          className="nav-btn"
        >
          Successiva →
        </button>
      </div>
    </div>
  );
};

export default Pagination;