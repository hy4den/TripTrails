import { FiSearch, FiX } from 'react-icons/fi';
import styles from './SearchBar.module.css';

export default function SearchBar({ value, onChange, placeholder = 'Rota, şehir veya ülke ara...' }) {
  return (
    <div className={styles.wrapper}>
      <FiSearch size={16} className={styles.icon} />
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button className={styles.clearBtn} onClick={() => onChange('')} type="button" aria-label="Temizle">
          <FiX size={14} />
        </button>
      )}
    </div>
  );
}
