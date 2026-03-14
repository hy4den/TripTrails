import { useMemo } from 'react';
import { FiSliders, FiX } from 'react-icons/fi';
import { Country, State } from 'country-state-city';
import { CURRENCIES } from '../../../utils/constants';
import styles from './FilterPanel.module.css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'likes', label: 'En Begenilen' },
  { value: 'rating', label: 'En Yuksek Puan' },
  { value: 'saves', label: 'En Cok Kaydedilen' },
];

export default function FilterPanel({ filters, onChange, totalResults, totalCount }) {
  const allCountries = useMemo(() => Country.getAllCountries(), []);
  const citiesForCountry = useMemo(
    () => (filters.countryCode ? State.getStatesOfCountry(filters.countryCode) : []),
    [filters.countryCode]
  );

  const hasActiveFilters =
    filters.country || filters.city || filters.minDays || filters.maxDays ||
    filters.minBudget || filters.maxBudget || filters.budgetCurrency ||
    filters.sortBy !== 'newest';

  const set = (key, value) => onChange({ ...filters, [key]: value });

  const setCountry = (isoCode) => {
    const country = allCountries.find((c) => c.isoCode === isoCode);
    onChange({
      ...filters,
      country: country ? country.name : '',
      countryCode: isoCode,
      city: '',
    });
  };

  const reset = () =>
    onChange({
      country: '',
      countryCode: '',
      city: '',
      minDays: '',
      maxDays: '',
      minBudget: '',
      maxBudget: '',
      budgetCurrency: '',
      sortBy: 'newest',
    });

  return (
    <div className={styles.panel}>
      <div className={styles.topRow}>
        <div className={styles.titleRow}>
          <FiSliders size={15} />
          <span className={styles.title}>Filtrele</span>
          {hasActiveFilters && (
            <button className={styles.resetBtn} onClick={reset} type="button">
              <FiX size={12} /> Temizle
            </button>
          )}
        </div>
        <span className={styles.resultCount}>
          {totalResults} / {totalCount} rota
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Ülke</label>
          <select
            className={styles.select}
            value={filters.countryCode}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">Tümü</option>
            {allCountries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Şehir / Bölge</label>
          <select
            className={styles.select}
            value={filters.city}
            onChange={(e) => set('city', e.target.value)}
            disabled={!filters.countryCode}
          >
            <option value="">Tümü</option>
            {citiesForCountry.map((s) => (
              <option key={s.isoCode} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Gün Sayısı</label>
          <div className={styles.rangeRow}>
            <input
              type="number"
              className={styles.rangeInput}
              placeholder="Min"
              min="1"
              value={filters.minDays}
              onChange={(e) => set('minDays', e.target.value)}
            />
            <span className={styles.rangeSep}>–</span>
            <input
              type="number"
              className={styles.rangeInput}
              placeholder="Maks"
              min="1"
              value={filters.maxDays}
              onChange={(e) => set('maxDays', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Bütçe</label>
          <div className={styles.budgetRow}>
            <select
              className={styles.currencySelect}
              value={filters.budgetCurrency}
              onChange={(e) => onChange({ ...filters, budgetCurrency: e.target.value, minBudget: '', maxBudget: '' })}
            >
              <option value="">Para Birimi</option>
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <div className={styles.rangeRow}>
              <input
                type="number"
                className={styles.rangeInput}
                placeholder="Min"
                min="0"
                value={filters.minBudget}
                onChange={(e) => set('minBudget', e.target.value)}
                disabled={!filters.budgetCurrency}
              />
              <span className={styles.rangeSep}>–</span>
              <input
                type="number"
                className={styles.rangeInput}
                placeholder="Maks"
                min="0"
                value={filters.maxBudget}
                onChange={(e) => set('maxBudget', e.target.value)}
                disabled={!filters.budgetCurrency}
              />
            </div>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Sırala</label>
          <select className={styles.select} value={filters.sortBy} onChange={(e) => set('sortBy', e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
