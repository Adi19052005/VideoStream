import React, { useState } from 'react';
import '../styles/SearchBar.css';

const SearchBar = ({ onSearch, placeholder = 'Search videos...' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setQuery('');
    }
  };

  return (
    <form className="search-bar mt-2" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      <button type="submit" className="search-btn">
        
      </button>
    </form>
  );
};

export default SearchBar;
