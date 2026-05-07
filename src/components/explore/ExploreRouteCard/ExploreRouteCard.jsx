import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMap, FiMapPin, FiCalendar, FiHeart, FiStar, FiBookmark, FiDollarSign } from 'react-icons/fi';
import { getCurrencySymbol } from '../../../utils/constants';
import styles from './ExploreRouteCard.module.css';

export default function ExploreRouteCard({ route }) {
  const meta = route.metadata || {};
  const engagement = route.engagement || {};
  const location = route.location || {};
  const [imgError, setImgError] = useState(false);

  const locationText = [location.city, location.country].filter(Boolean).join(', ');
  const budgetText = meta.totalBudget > 0
    ? `${getCurrencySymbol(meta.currency || 'TRY')}${Number(meta.totalBudget).toLocaleString('tr-TR')}`
    : null;

  return (
    <Link to={`/routes/${route.id}`} className={styles.card}>
      <div className={styles.coverArea}>
        {route.coverImageURL && !imgError ? (
          <img
            src={route.coverImageURL}
            alt={route.title}
            className={styles.coverImg}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.coverPlaceholder}>
            <FiMap size={28} />
          </div>
        )}
        <div className={styles.coverOverlay}>
          <div className={styles.daysBadge}>
            <FiCalendar size={11} />
            {meta.totalDays || 0} gün
          </div>
          {engagement.averageRating > 0 && (
            <div className={styles.ratingBadge}>
              <FiStar size={11} />
              {engagement.averageRating.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.routeTitle}>{route.title || 'Isimsiz Rota'}</h3>

        {locationText && (
          <p className={styles.location}>
            <FiMapPin size={12} />
            {locationText}
          </p>
        )}

        {route.description && (
          <p className={styles.description}>{route.description}</p>
        )}

        <div className={styles.authorRow}>
          {route.authorPhotoURL ? (
            <img src={route.authorPhotoURL} alt="" className={styles.authorAvatar} />
          ) : (
            <div className={styles.authorAvatarFallback}>
              {(route.authorName || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <span className={styles.authorName}>{route.authorName || 'Kullanici'}</span>
        </div>

        <div className={styles.statsRow}>
          <span className={styles.statItem}>
            <FiMapPin size={11} />
            {meta.totalPins || 0} pin
          </span>
          {budgetText && (
            <span className={styles.statItem}>
              <FiDollarSign size={11} />
              {budgetText}
            </span>
          )}
        </div>

        <div className={styles.engagementRow}>
          {engagement.likes > 0 && (
            <span className={styles.engItem}>
              <FiHeart size={11} />
              {engagement.likes}
            </span>
          )}
          {engagement.saves > 0 && (
            <span className={styles.engItem}>
              <FiBookmark size={11} />
              {engagement.saves}
            </span>
          )}
          {engagement.averageRating > 0 && (
            <span className={styles.engItem}>
              <FiStar size={11} />
              {engagement.averageRating.toFixed(1)}
            </span>
          )}
          <span className={styles.openRoute}>
            İncele
            <FiArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
