import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import styles from './PlaceSearch.module.css';

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

async function fetchSuggestions(input) {
  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_KEY,
    },
    body: JSON.stringify({ input, languageCode: 'tr' }),
  });
  const data = await res.json();
  return data.suggestions || [];
}

async function fetchPlaceCoords(placeId) {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?fields=location&key=${GOOGLE_KEY}`
  );
  const data = await res.json();
  return data.location || null;
}

export default function PlaceSearch({ onPlaceSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchSuggestions(query);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = useCallback(
    async (suggestion) => {
      const pred = suggestion.placePrediction;
      if (!pred) return;

      const mainText = pred.structuredFormat?.mainText?.text || pred.text?.text || '';
      const secondaryText = pred.structuredFormat?.secondaryText?.text || '';
      const placeName = secondaryText ? `${mainText}, ${secondaryText}` : mainText;

      setQuery(mainText);
      setIsOpen(false);
      setSuggestions([]);

      try {
        const location = await fetchPlaceCoords(pred.placeId);
        if (location) {
          onPlaceSelect({ lng: location.longitude, lat: location.latitude, placeName });
          setQuery('');
        }
      } catch {
        // ignore coordinate fetch error
      }
    },
    [onPlaceSelect]
  );

  const clear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.card}>
        <div className={styles.inputRow}>
          <FiSearch size={16} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Mekan veya adres ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          />
          {loading && <span className={styles.spinner} />}
          {query && !loading && (
            <button className={styles.clearBtn} onClick={clear} type="button">
              <FiX size={14} />
            </button>
          )}
        </div>

        {isOpen && suggestions.length > 0 && (
          <ul className={styles.dropdown}>
            {suggestions.map((s, i) => {
              const pred = s.placePrediction;
              if (!pred) return null;
              const main = pred.structuredFormat?.mainText?.text || pred.text?.text || '';
              const secondary = pred.structuredFormat?.secondaryText?.text || '';
              return (
                <li
                  key={pred.placeId || i}
                  className={styles.option}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(s)}
                >
                  <span className={styles.optionIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="#9aa0a6"/>
                    </svg>
                  </span>
                  <div className={styles.optionText}>
                    <span className={styles.mainText}>{main}</span>
                    {secondary && <span className={styles.secondaryText}>{secondary}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
