import React from 'react'

export default function SearchBar({ value, onChange, placeholder = 'Buscar país...' }) {
  return (
    <div className="search-bar-container">
      <span className="search-icon" aria-hidden="true">🔍</span>
      <input
        className="search-bar-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar"
      />
      {value && (
        <button
          className="search-clear"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
        >
          ✕
        </button>
      )}
    </div>
  )
}
