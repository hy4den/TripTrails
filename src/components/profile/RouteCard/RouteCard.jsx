import { Link } from 'react-router-dom';
import { FiMap, FiMapPin, FiCalendar, FiHeart, FiStar } from 'react-icons/fi';
import styles from './RouteCard.module.css';

export default function RouteCard({ route }) {
  const meta = route.metadata || {};
  const engagement = route.engagement || {};

  return (
    <Link to={`/routes/${route.id}`} className={styles.card}>
      <div className={styles.coverArea}>
        {route.coverImageURL ? (
          <img src={route.coverImageURL} alt={route.title} className={styles.coverImg} />
        ) : (
          <div className={styles.coverPlaceholder}>
            <FiMap size={24} />
          </div>
        )}
        {route.status === 'draft' && (
          <span className={styles.draftBadge}>Taslak</span>
        )}
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.routeTitle}>{route.title || 'Isimsiz Rota'}</h3>
        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <FiCalendar size={12} />
            {meta.totalDays || 0} gun
          </span>
          <span className={styles.metaItem}>
            <FiMapPin size={12} />
            {meta.totalPins || 0} pin
          </span>
        </div>
        {(engagement.likes > 0 || engagement.averageRating > 0) && (
          <div className={styles.engagementRow}>
            {engagement.likes > 0 && (
              <span className={styles.engagementItem}>
                <FiHeart size={12} />
                {engagement.likes}
              </span>
            )}
            {engagement.averageRating > 0 && (
              <span className={styles.engagementItem}>
                <FiStar size={12} />
                {engagement.averageRating.toFixed(1)}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
