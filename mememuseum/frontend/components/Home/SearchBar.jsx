import React from 'react';
import DatePicker, { registerLocale } from "react-datepicker";
import it from 'date-fns/locale/it';
import "react-datepicker/dist/react-datepicker.css";



registerLocale('it', it);


const SearchBar = ({ 
  filtroTag, setFiltroTag, 
  selectedDate, setSelectedDate, 
  ordinamento, setOrdinamento, 
  setPagina 
}) => {
  
  return (
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
        {filtroTag && (
          <button onClick={() => { setFiltroTag(""); setPagina(1); }} className="btn-clear">×</button>
        )}
      </div>

      <div className="date-picker-group">
      <DatePicker
      selected={selectedDate}
      onChange={(date) => {
       if (date) {
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, 0, 0 
      );
      setSelectedDate(normalizedDate);
    } else {
      setSelectedDate(null);
    }
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
        <select 
          value={ordinamento} 
          onChange={(e) => {
            setOrdinamento(e.target.value);
            setPagina(1);
          }}
        >
          <option value="recent">Più Recenti</option>
          <option value="oldest">Meno Recenti</option>
          <option value="popular">Più Votati</option>
          <option value="unpopular">Meno Votati</option>
        </select>
      </div>
    </div>
  );
};

export default SearchBar;