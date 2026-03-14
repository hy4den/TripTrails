import { useState, useEffect, useCallback } from 'react';
import { FiGlobe, FiChevronDown, FiChevronRight, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import {
  WORLD_DATA,
  totalAttractions,
  countryAttractionCount,
  countryVisitedCount,
  cityVisitedCount,
  pct,
} from '../../data/worldAttractions';
import { getVisited, toggleVisited } from '../../services/progressService';
import styles from './WorldProgressPage.module.css';

const TOTAL_ATTRACTIONS = totalAttractions();

function ProgressBar({ value, total }) {
  const percent = pct(value, total);
  const color = percent === 100 ? 'var(--color-secondary)' : percent > 0 ? 'var(--color-primary)' : 'var(--color-border)';
  return (
    <div className={styles.barTrack}>
      <div
        className={styles.barFill}
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function WorldProgressPage() {
  const { currentUser } = useAuth();
  const [visited, setVisited] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [expandedCountry, setExpandedCountry] = useState(null);
  const [expandedCity, setExpandedCity] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    getVisited(currentUser.uid).then((v) => {
      setVisited(v);
      setLoading(false);
    });
  }, [currentUser]);

  const totalVisited = Object.keys(visited).length;

  const handleToggle = useCallback(async (attractionId) => {
    if (!currentUser || saving[attractionId]) return;
    const isVisited = !!visited[attractionId];

    // Optimistic update
    setVisited((prev) => {
      const next = { ...prev };
      if (isVisited) delete next[attractionId];
      else next[attractionId] = true;
      return next;
    });

    setSaving((prev) => ({ ...prev, [attractionId]: true }));
    try {
      await toggleVisited(currentUser.uid, attractionId, isVisited);
    } catch {
      // Revert on error
      setVisited((prev) => {
        const next = { ...prev };
        if (isVisited) next[attractionId] = true;
        else delete next[attractionId];
        return next;
      });
    }
    setSaving((prev) => ({ ...prev, [attractionId]: false }));
  }, [currentUser, saving, visited]);

  const toggleCountry = (code) => {
    setExpandedCountry((prev) => (prev === code ? null : code));
    setExpandedCity(null);
  };

  const toggleCity = (cityId) => {
    setExpandedCity((prev) => (prev === cityId ? null : cityId));
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loadingText}>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <FiGlobe size={28} />
          Dünya İlerlemem
        </h1>
        <p className={styles.subtitle}>İkonik mekanları işaretle ve dünyayı ne kadar keşfettiğini gör.</p>
      </div>

      {/* ── World Stats ── */}
      <div className={styles.worldStats}>
        <div className={styles.statNum}>
          <span className={styles.statBig}>{totalVisited}</span>
          <span className={styles.statOf}>/ {TOTAL_ATTRACTIONS}</span>
        </div>
        <div className={styles.statLabel}>mekan ziyaret edildi</div>
        <ProgressBar value={totalVisited} total={TOTAL_ATTRACTIONS} />
        <div className={styles.statPct}>{pct(totalVisited, TOTAL_ATTRACTIONS)}% dünya</div>
      </div>

      {/* ── Country list ── */}
      <div className={styles.countryList}>
        {WORLD_DATA.map((country) => {
          const total = countryAttractionCount(country);
          const vis = countryVisitedCount(country, visited);
          const isOpen = expandedCountry === country.code;

          return (
            <div key={country.code} className={`${styles.countryCard} ${isOpen ? styles.countryCardOpen : ''}`}>
              {/* Country header row */}
              <button className={styles.countryRow} onClick={() => toggleCountry(country.code)}>
                <span className={styles.countryFlag}>{country.flag}</span>
                <span className={styles.countryName}>{country.name}</span>
                <span className={styles.countryCount}>
                  {vis}/{total}
                  {vis === total && total > 0 && <span className={styles.allDone}>✓</span>}
                </span>
                <ProgressBar value={vis} total={total} />
                <span className={styles.countryPct}>{pct(vis, total)}%</span>
                {isOpen ? <FiChevronDown size={18} className={styles.chevron} /> : <FiChevronRight size={18} className={styles.chevron} />}
              </button>

              {/* Cities */}
              {isOpen && (
                <div className={styles.cityList}>
                  {country.cities.map((city) => {
                    const cityTotal = city.attractions.length;
                    const cityVis = cityVisitedCount(city, visited);
                    const cityOpen = expandedCity === city.id;

                    return (
                      <div key={city.id} className={styles.cityBlock}>
                        {/* City row */}
                        <button className={styles.cityRow} onClick={() => toggleCity(city.id)}>
                          <span className={styles.cityName}>{city.name}</span>
                          <span className={styles.cityCount}>
                            {cityVis}/{cityTotal}
                            {cityVis === cityTotal && <span className={styles.allDone}>✓</span>}
                          </span>
                          <ProgressBar value={cityVis} total={cityTotal} />
                          <span className={styles.cityPct}>{pct(cityVis, cityTotal)}%</span>
                          {cityOpen ? <FiChevronDown size={15} className={styles.chevron} /> : <FiChevronRight size={15} className={styles.chevron} />}
                        </button>

                        {/* Attractions */}
                        {cityOpen && (
                          <div className={styles.attractionGrid}>
                            {city.attractions.map((attr) => {
                              const done = !!visited[attr.id];
                              return (
                                <button
                                  key={attr.id}
                                  className={`${styles.attractionBtn} ${done ? styles.attractionDone : ''}`}
                                  onClick={() => handleToggle(attr.id)}
                                  disabled={saving[attr.id]}
                                >
                                  <span className={styles.attrIcon}>{attr.icon}</span>
                                  <span className={styles.attrName}>{attr.name}</span>
                                  {done && <FiCheck size={14} className={styles.checkIcon} />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
