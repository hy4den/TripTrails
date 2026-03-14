import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FiCompass } from 'react-icons/fi';
import { getPublishedRoutesPage } from '../../services/routeService';
import SearchBar from '../../components/explore/SearchBar/SearchBar';
import FilterPanel from '../../components/explore/FilterPanel/FilterPanel';
import ExploreRouteCard from '../../components/explore/ExploreRouteCard/ExploreRouteCard';
import RouteCardSkeleton from '../../components/explore/RouteCardSkeleton/RouteCardSkeleton';
import styles from './ExplorePage.module.css';

const PAGE_SIZE = 20;

const DEFAULT_FILTERS = {
  country: '',
  countryCode: '',
  city: '',
  minDays: '',
  maxDays: '',
  minBudget: '',
  maxBudget: '',
  budgetCurrency: '',
  sortBy: 'newest',
};

function applyFiltersAndSort(routes, searchQuery, filters) {
  const q = searchQuery.trim().toLowerCase();

  let result = routes.filter((route) => {
    const location = route.location || {};
    const meta = route.metadata || {};

    if (q) {
      const searchable = [route.title, route.description, route.authorName, location.city, location.country, ...(route.tags || [])]
        .filter(Boolean).join(' ').toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    if (filters.country && location.country !== filters.country) return false;

    if (filters.city && location.city !== filters.city) return false;

    const days = meta.totalDays || 0;
    if (filters.minDays && days < Number(filters.minDays)) return false;
    if (filters.maxDays && days > Number(filters.maxDays)) return false;

    if (filters.budgetCurrency) {
      if (meta.currency !== filters.budgetCurrency) return false;
      const budget = meta.totalBudget || 0;
      if (filters.minBudget && budget < Number(filters.minBudget)) return false;
      if (filters.maxBudget && budget > Number(filters.maxBudget)) return false;
    }

    return true;
  });

  if (filters.sortBy === 'likes') {
    result = [...result].sort((a, b) => (b.engagement?.likes || 0) - (a.engagement?.likes || 0));
  } else if (filters.sortBy === 'rating') {
    result = [...result].sort((a, b) => (b.engagement?.averageRating || 0) - (a.engagement?.averageRating || 0));
  } else if (filters.sortBy === 'saves') {
    result = [...result].sort((a, b) => (b.engagement?.saves || 0) - (a.engagement?.saves || 0));
  }

  return result;
}

export default function ExplorePage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const lastDocRef = useRef(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { routes: data, lastVisible, hasMore: more } = await getPublishedRoutesPage(PAGE_SIZE, null);
      setRoutes(data);
      lastDocRef.current = lastVisible;
      setHasMore(more);
    } catch (err) {
      console.error('ExplorePage fetch error:', err);
      setError(err.message || 'Rotalar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { routes: data, lastVisible, hasMore: more } = await getPublishedRoutesPage(PAGE_SIZE, lastDocRef.current);
      setRoutes((prev) => [...prev, ...data]);
      lastDocRef.current = lastVisible;
      setHasMore(more);
    } catch (err) {
      console.error('ExplorePage loadMore error:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  useEffect(() => { loadInitial(); }, [loadInitial]);

  const filteredRoutes = useMemo(
    () => applyFiltersAndSort(routes, searchQuery, filters),
    [routes, searchQuery, filters]
  );

  const showLoadMore = hasMore && !searchQuery && filters.sortBy === 'newest' &&
    !filters.country && !filters.city && !filters.minDays && !filters.maxDays &&
    !filters.minBudget && !filters.maxBudget && !filters.budgetCurrency;

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Rotaları Keşfet</h1>

      <div className={styles.controls}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          totalResults={filteredRoutes.length}
          totalCount={routes.length}
        />
      </div>

      {loading ? (
        <div className={styles.routeGrid}>
          {Array.from({ length: 8 }).map((_, i) => <RouteCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <FiCompass size={32} className={styles.emptyIcon} />
          <p>Rotalar yüklenemedi. Lütfen sayfayı yenileyin.</p>
          <small style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{error}</small>
        </div>
      ) : filteredRoutes.length > 0 ? (
        <>
          <div className={styles.routeGrid}>
            {filteredRoutes.map((route) => (
              <ExploreRouteCard key={route.id} route={route} />
            ))}
            {loadingMore && Array.from({ length: 4 }).map((_, i) => <RouteCardSkeleton key={`more-${i}`} />)}
          </div>
          {showLoadMore && (
            <div className={styles.loadMoreRow}>
              <button
                className={styles.loadMoreBtn}
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <FiCompass size={32} className={styles.emptyIcon} />
          <p>
            {routes.length === 0
              ? 'Henüz yayınlanmış rota yok.'
              : 'Arama kriterlerine uyan rota bulunamadı.'}
          </p>
        </div>
      )}
    </div>
  );
}
