import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, Mic, MicOff, MapPin, Star, History, X, Loader2 } from 'lucide-react';
import { searchCities } from '../services/api';
import { useVoiceSearch } from '../hooks/useVoiceSearch';

export default function Search({
  currentCity,
  onSelectCity,
  onUseLocation,
  isLocationLoading,
  favorites = [],
  onToggleFavorite,
  recentSearches = [],
  onClearRecent,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Voice Search Hook
  const handleVoiceResult = (text) => {
    setQuery(text);
    performSearch(text);
  };

  const { isListening, isSupported, startListening, stopListening, voiceError } =
    useVoiceSearch(handleVoiceResult);

  // Debounced search
  const performSearch = async (val) => {
    if (!val || val.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const items = await searchCities(val);
      setResults(items);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    onSelectCity(item);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const isCurrentFavorite = favorites.some((f) => f.name === currentCity?.name);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', maxWidth: '520px' }}>
      {/* Search Input Container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '0.45rem 0.8rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.25s ease',
        }}
      >
        <SearchIcon size={18} color="#94a3b8" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search city, capital, or coordinates..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#f8fafc',
            fontSize: '0.92rem',
            fontFamily: 'inherit',
          }}
        />

        {/* Clear query */}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Loading Spinner */}
        {loading && <Loader2 size={16} color="#38bdf8" className="animate-spin" />}

        {/* Voice Search Button */}
        {isSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            style={{
              background: isListening ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              color: isListening ? '#ffffff' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title={isListening ? 'Listening... click to stop' : 'Search by voice'}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}

        {/* Use My Location Button */}
        <button
          onClick={onUseLocation}
          disabled={isLocationLoading}
          style={{
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '8px',
            padding: '6px',
            color: '#38bdf8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          title="Use my current GPS location"
        >
          {isLocationLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
        </button>

        {/* Favorite Star Button */}
        {currentCity && (
          <button
            onClick={() => onToggleFavorite(currentCity)}
            style={{
              background: isCurrentFavorite ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: isCurrentFavorite ? '1px solid #f59e0b' : '1px solid transparent',
              borderRadius: '8px',
              padding: '6px',
              color: isCurrentFavorite ? '#f59e0b' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title={isCurrentFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={16} fill={isCurrentFavorite ? '#f59e0b' : 'none'} />
          </button>
        )}
      </div>

      {/* Voice feedback toast */}
      {voiceError && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, padding: '4px 10px', fontSize: '0.75rem', color: '#f87171' }}>
          {voiceError}
        </div>
      )}

      {/* Autocomplete & Recents Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
            maxHeight: '340px',
            overflowY: 'auto',
            zIndex: 50,
            padding: '0.5rem',
          }}
        >
          {/* Autocomplete Results */}
          {results.length > 0 && (
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', padding: '6px 10px', fontWeight: 600, textTransform: 'uppercase' }}>
                Search Suggestions
              </div>
              {results.map((item, idx) => (
                <div
                  key={`${item.id || idx}-${item.name}`}
                  onClick={() => handleSelect(item)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{item.name}</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '6px' }}>
                      {[item.admin1, item.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {item.latitude.toFixed(1)}°, {item.longitude.toFixed(1)}°
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Favorites in dropdown */}
          {query.trim().length === 0 && favorites.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#f59e0b', padding: '6px 10px', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={12} fill="#f59e0b" /> Favorite Cities
              </div>
              {favorites.map((fav) => (
                <div
                  key={fav.name}
                  onClick={() => handleSelect(fav)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{fav.name}</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{fav.country}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent Searches in dropdown */}
          {query.trim().length === 0 && recentSearches.length > 0 && (
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', padding: '6px 10px', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <History size={12} /> Recent Searches
                </span>
                {onClearRecent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearRecent();
                    }}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.7rem', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                )}
              </div>
              {recentSearches.map((rec) => (
                <div
                  key={rec.name}
                  onClick={() => handleSelect(rec)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{rec.name}</span>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{rec.country}</span>
                </div>
              ))}
            </div>
          )}

          {results.length === 0 && query.trim().length >= 2 && !loading && (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              No cities found for "{query}". Try checking the spelling.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
