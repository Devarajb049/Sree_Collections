import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value = '', onChange, placeholder = 'Search sarees by name, fabric, color, or code (e.g. Kanchipuram, Navy, SRC-101)...' }) => {
  return (
    <div className="search-box-wrapper">
      <Search size={18} className="search-icon-inside" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        aria-label="Search sarees"
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="clear-search-btn"
          aria-label="Clear search text"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
