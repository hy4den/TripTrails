import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiAward,
  FiBarChart2,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiCompass,
  FiFlag,
  FiGlobe,
  FiMap,
  FiMapPin,
  FiSearch,
  FiSliders,
} from 'react-icons/fi';
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
const TOTAL_COUNTRIES = WORLD_DATA.length;
const TOTAL_CITIES = WORLD_DATA.reduce((sum, country) => sum + country.cities.length, 0);

const FILTERS = [
  { value: 'all', label: 'Tümü' },
  { value: 'active', label: 'Devam' },
  { value: 'notStarted', label: 'Başlanmadı' },
  { value: 'complete', label: 'Biten' },
];

const SORT_OPTIONS = [
  { value: 'progress', label: 'İlerlemeye göre' },
  { value: 'remaining', label: 'Bitirmeye yakın' },
  { value: 'name', label: 'Ülke adına göre' },
];

const MILESTONES = [25, 50, 75, 100];

function normalizeText(value) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i');
}

function countrySearchText(country) {
  return normalizeText(
    [
      country.name,
      country.code,
      ...country.cities.flatMap((city) => [
        city.name,
        ...city.attractions.map((attraction) => attraction.name),
      ]),
    ].join(' ')
  );
}

function citySearchText(city) {
  return normalizeText([
    city.name,
    ...city.attractions.map((attraction) => attraction.name),
  ].join(' '));
}

function ProgressBar({ value, total }) {
  const percent = pct(value, total);
  const color = percent === 100
    ? 'var(--color-secondary)'
    : percent > 0
      ? 'var(--color-primary)'
      : 'var(--color-border)';

  return (
    <div className={styles.barTrack} aria-hidden="true">
      <div
        className={styles.barFill}
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  );
}

function StatCard({ icon, label, value, detail }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statDetail}>{detail}</span>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('progress');

  useEffect(() => {
    if (!currentUser) return;
    getVisited(currentUser.uid).then((v) => {
      setVisited(v);
      setLoading(false);
    });
  }, [currentUser]);

  const totalVisited = Object.keys(visited).length;
  const worldPercent = pct(totalVisited, TOTAL_ATTRACTIONS);
  const query = normalizeText(searchTerm.trim());

  const allCountries = useMemo(() => {
    return WORLD_DATA.map((country) => {
      const total = countryAttractionCount(country);
      const visitedCount = countryVisitedCount(country, visited);
      const percent = pct(visitedCount, total);
      const isComplete = visitedCount === total && total > 0;
      const isActive = visitedCount > 0 && !isComplete;
      const isNotStarted = visitedCount === 0;

      return {
        ...country,
        total,
        visitedCount,
        percent,
        remaining: total - visitedCount,
        isComplete,
        isActive,
        isNotStarted,
        searchText: countrySearchText(country),
      };
    });
  }, [visited]);

  const summary = useMemo(() => {
    let visitedCountries = 0;
    let visitedCities = 0;
    let completedCountries = 0;
    let completedCities = 0;
    let nextStop = null;

    allCountries.forEach((country) => {
      const countryTotal = country.total;
      const countryVisited = country.visitedCount;

      if (countryVisited > 0) visitedCountries += 1;
      if (countryVisited === countryTotal && countryTotal > 0) completedCountries += 1;

      country.cities.forEach((city) => {
        const cityVisited = cityVisitedCount(city, visited);

        if (cityVisited > 0) visitedCities += 1;
        if (cityVisited === city.attractions.length && city.attractions.length > 0) completedCities += 1;

        city.attractions.forEach((attraction) => {
          if (!nextStop && !visited[attraction.id]) {
            nextStop = {
              ...attraction,
              country: country.name,
              countryFlag: country.flag,
              city: city.name,
            };
          }
        });
      });
    });

    const topCountries = [...allCountries]
      .filter((country) => country.visitedCount > 0)
      .sort((a, b) => b.percent - a.percent || b.visitedCount - a.visitedCount)
      .slice(0, 3);

    const closestCountry = [...allCountries]
      .filter((country) => country.isActive)
      .sort((a, b) => a.remaining - b.remaining || b.percent - a.percent)[0] || null;

    return {
      visitedCountries,
      visitedCities,
      completedCountries,
      completedCities,
      nextStop,
      topCountries,
      closestCountry,
      activeCountries: allCountries.filter((country) => country.isActive).length,
      notStartedCountries: allCountries.filter((country) => country.isNotStarted).length,
    };
  }, [allCountries, visited]);

  const countries = useMemo(() => {
    const filtered = allCountries.filter((country) => {
      const matchesSearch = !query || country.searchText.includes(query);
      const matchesFilter =
        filter === 'all'
        || (filter === 'active' && country.isActive)
        || (filter === 'notStarted' && country.isNotStarted)
        || (filter === 'complete' && country.isComplete);

      return matchesSearch && matchesFilter;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'remaining') {
        return a.remaining - b.remaining || b.percent - a.percent;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'tr-TR');
      }
      return b.percent - a.percent || b.visitedCount - a.visitedCount || a.name.localeCompare(b.name, 'tr-TR');
    });
  }, [allCountries, filter, query, sortBy]);

  const handleToggle = useCallback(async (attractionId) => {
    if (!currentUser || saving[attractionId]) return;
    const isVisited = !!visited[attractionId];

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
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            <FiGlobe size={16} />
            Dünya İlerlemem
          </span>
          <h1 className={styles.title}>Rotanı dünya haritasına dönüştür.</h1>
          <p className={styles.subtitle}>
            İkonik mekanları işaretle; ülkeler, şehirler ve sıradaki durak tek bakışta görünsün.
          </p>
        </div>

        <div className={styles.scoreWrap}>
          <div
            className={styles.scoreRing}
            style={{ '--score': `${worldPercent * 3.6}deg` }}
            aria-label={`Dünya ilerlemesi yüzde ${worldPercent}`}
          >
            <strong>{worldPercent}%</strong>
            <span>tamamlandı</span>
          </div>
          <div className={styles.scoreCopy}>
            <span className={styles.scoreNumber}>{totalVisited}/{TOTAL_ATTRACTIONS}</span>
            <span className={styles.scoreLabel}>mekan ziyaret edildi</span>
          </div>
        </div>
      </section>

      <section className={styles.summaryGrid} aria-label="Dünya ilerleme özeti">
        <StatCard
          icon={<FiMapPin size={18} />}
          value={totalVisited}
          label="Mekan"
          detail={`${TOTAL_ATTRACTIONS - totalVisited} durak kaldı`}
        />
        <StatCard
          icon={<FiGlobe size={18} />}
          value={`${summary.visitedCountries}/${TOTAL_COUNTRIES}`}
          label="Ülke"
          detail={`${summary.completedCountries} ülke tamam`}
        />
        <StatCard
          icon={<FiMap size={18} />}
          value={`${summary.visitedCities}/${TOTAL_CITIES}`}
          label="Şehir"
          detail={`${summary.completedCities} şehir tamam`}
        />
        <StatCard
          icon={<FiAward size={18} />}
          value={`${worldPercent}%`}
          label="Skor"
          detail="Genel keşif yüzdesi"
        />
      </section>

      <section className={styles.progressPanel} aria-label="Dünya ilerleme planı">
        <div className={styles.progressPanelHeader}>
          <div>
            <h2>İlerleme planı</h2>
            <p>Hedefler ve sıradaki odak noktaların.</p>
          </div>
          <span>{worldPercent}% tamamlandı</span>
        </div>

        <div className={styles.goalGrid} aria-label="Dünya ilerleme hedefleri">
          {MILESTONES.map((milestone) => (
            <div
              key={milestone}
              className={`${styles.goalCard} ${worldPercent >= milestone ? styles.goalCardDone : ''}`}
            >
              <span className={styles.goalMark}>{worldPercent >= milestone ? <FiCheck size={14} /> : `${milestone}%`}</span>
              <span className={styles.goalText}>{milestone === 100 ? 'Dünya turu' : `${milestone}% hedefi`}</span>
            </div>
          ))}
        </div>

        <div className={styles.progressInsights} aria-label="Dünya ilerleme içgörüleri">
          <div className={styles.insightCard}>
            <FiBarChart2 size={17} />
            <span>
              En iyi ülke: <strong>{summary.topCountries[0]?.name || 'Henüz yok'}</strong>
            </span>
          </div>
          <div className={styles.insightCard}>
            <FiFlag size={17} />
            <span>
              Bitirmeye yakın: <strong>{summary.closestCountry ? `${summary.closestCountry.name} (${summary.closestCountry.remaining} kaldı)` : 'Henüz yok'}</strong>
            </span>
          </div>
          <div className={styles.insightCard}>
            <FiSliders size={17} />
            <span>
              {summary.activeCountries} devam eden · {summary.notStartedCountries} başlanmadı
            </span>
          </div>
        </div>
      </section>

      <section className={styles.toolbar} aria-label="Ülke listesi kontrolleri">
        <label className={styles.searchBox}>
          <FiSearch size={18} />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Ülke, şehir veya mekan ara"
          />
        </label>

        <div className={styles.filterGroup}>
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.filterButton} ${filter === option.value ? styles.filterButtonActive : ''}`}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className={styles.sortBox}>
          <FiSliders size={16} />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.nextPanel}>
          <span className={styles.panelIcon}>
            <FiCompass size={18} />
          </span>
          <div>
            <h2 className={styles.panelTitle}>Sıradaki durak</h2>
            {summary.nextStop ? (
              <>
                <p className={styles.nextStopName}>
                  <span>{summary.nextStop.icon}</span>
                  {summary.nextStop.name}
                </p>
                <p className={styles.nextStopMeta}>
                  {summary.nextStop.countryFlag} {summary.nextStop.city}, {summary.nextStop.country}
                </p>
              </>
            ) : (
              <>
                <p className={styles.nextStopName}>Bütün liste tamamlandı</p>
                <p className={styles.nextStopMeta}>Harika bir dünya turu olmuş.</p>
              </>
            )}
          </div>
          <div className={styles.panelProgress}>
            <span>{worldPercent}%</span>
            <ProgressBar value={totalVisited} total={TOTAL_ATTRACTIONS} />
          </div>
          <div className={styles.topCountries}>
            <h3>Öne çıkan ülkeler</h3>
            {summary.topCountries.length > 0 ? summary.topCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                className={styles.topCountry}
                onClick={() => toggleCountry(country.code)}
              >
                <span>{country.flag} {country.name}</span>
                <strong>{country.percent}%</strong>
              </button>
            )) : (
              <p>İlk mekanını işaretleyince burada görünecek.</p>
            )}
          </div>
        </aside>

        <section className={styles.countryList} aria-label="Ülkeler">
          {countries.map((country) => {
            const isOpen = expandedCountry === country.code;
            const countryNameMatches = query && normalizeText(country.name).includes(query);
            const visibleCities = query && !countryNameMatches
              ? country.cities.filter((city) => citySearchText(city).includes(query))
              : country.cities;
            const statusLabel = country.isComplete
              ? 'Tamam'
              : country.isActive
                ? 'Devam'
                : 'Başlamadı';

            return (
              <div key={country.code} className={`${styles.countryCard} ${isOpen ? styles.countryCardOpen : ''}`}>
                <button
                  type="button"
                  className={styles.countryRow}
                  onClick={() => toggleCountry(country.code)}
                  aria-expanded={isOpen}
                >
                  <span className={styles.countryIdentity}>
                    <span className={styles.countryFlag}>{country.flag}</span>
                    <span className={styles.countryMain}>
                      <span className={styles.countryName}>{country.name}</span>
                      <span className={styles.countryMeta}>
                        {country.cities.length} şehir · {country.total} mekan
                      </span>
                    </span>
                  </span>

                  <span className={`${styles.statusPill} ${country.isComplete ? styles.statusDone : ''}`}>
                    {statusLabel}
                  </span>

                  <span className={styles.countryProgress}>
                    <span className={styles.progressTop}>
                      <span>{country.visitedCount}/{country.total}</span>
                      <strong>{country.percent}%</strong>
                    </span>
                    <ProgressBar value={country.visitedCount} total={country.total} />
                  </span>

                  <span className={styles.chevronBox}>
                    {isOpen ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                  </span>
                </button>

                {isOpen && (
                  <div className={styles.cityList}>
                    {visibleCities.map((city) => {
                      const cityTotal = city.attractions.length;
                      const cityVisited = cityVisitedCount(city, visited);
                      const cityPercent = pct(cityVisited, cityTotal);
                      const cityOpen = expandedCity === city.id;
                      const cityNameMatches = query && normalizeText(city.name).includes(query);
                      const visibleAttractions = query && !countryNameMatches && !cityNameMatches
                        ? city.attractions.filter((attraction) => normalizeText(attraction.name).includes(query))
                        : city.attractions;

                      return (
                        <div key={city.id} className={styles.cityBlock}>
                          <button
                            type="button"
                            className={styles.cityRow}
                            onClick={() => toggleCity(city.id)}
                            aria-expanded={cityOpen}
                          >
                            <span className={styles.cityMain}>
                              <span className={styles.cityName}>{city.name}</span>
                              <span className={styles.cityMeta}>{cityTotal} mekan</span>
                            </span>
                            <span className={styles.cityProgress}>
                              <span className={styles.progressTop}>
                                <span>{cityVisited}/{cityTotal}</span>
                                <strong>{cityPercent}%</strong>
                              </span>
                              <ProgressBar value={cityVisited} total={cityTotal} />
                            </span>
                            <span className={styles.chevronBox}>
                              {cityOpen ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                            </span>
                          </button>

                          {cityOpen && (
                            <div className={styles.attractionGrid}>
                              {visibleAttractions.map((attraction) => {
                                const done = !!visited[attraction.id];
                                return (
                                  <button
                                    key={attraction.id}
                                    type="button"
                                    className={`${styles.attractionBtn} ${done ? styles.attractionDone : ''}`}
                                    onClick={() => handleToggle(attraction.id)}
                                    disabled={saving[attraction.id]}
                                    aria-pressed={done}
                                  >
                                    <span className={styles.attrCheck}>
                                      {done && <FiCheck size={14} />}
                                    </span>
                                    <span className={styles.attrIcon}>{attraction.icon}</span>
                                    <span className={styles.attrName}>{attraction.name}</span>
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

          {countries.length === 0 && (
            <div className={styles.emptyState}>
              <FiSearch size={24} />
              <strong>Sonuç bulunamadı</strong>
              <span>Aramayı veya filtreyi değiştir.</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
