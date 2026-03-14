import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './SearchableSelect.module.css';

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Seçin...',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleOpen = () => {
    if (disabled) return;
    setSearch('');
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (option) => {
    onChange(option.value);
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setOpen(false);
    setSearch('');
  };

  const handleClickOutside = useCallback((e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setOpen(false);
      setSearch('');
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClickOutside]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${disabled ? styles.disabled : ''}`}
    >
      <div
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={handleOpen}
      >
        {open ? (
          <input
            ref={inputRef}
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ara..."
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={selectedOption ? styles.selectedLabel : styles.placeholderText}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        )}
        <div className={styles.icons}>
          {value && !open && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClear}
              tabIndex={-1}
            >
              ×
            </button>
          )}
          <span className={`${styles.caret} ${open ? styles.caretOpen : ''}`}>▾</span>
        </div>
      </div>

      {open && (
        <ul className={styles.dropdown}>
          {filtered.length === 0 ? (
            <li className={styles.noResults}>Sonuç bulunamadı</li>
          ) : (
            filtered.map((option) => (
              <li
                key={option.value}
                className={`${styles.option} ${option.value === value ? styles.optionSelected : ''}`}
                onMouseDown={() => handleSelect(option)}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
