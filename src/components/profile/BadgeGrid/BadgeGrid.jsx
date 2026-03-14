import * as Icons from 'react-icons/fi';
import { BADGES } from '../../../utils/constants';
import styles from './BadgeGrid.module.css';

export default function BadgeGrid({ earnedBadgeIds = [] }) {
  return (
    <div className={styles.badgeSection}>
      <h2 className={styles.title}>Rozetler</h2>
      {earnedBadgeIds.length === 0 ? (
        <p className={styles.empty}>Henüz rozet kazanılmadı.</p>
      ) : null}
      <div className={styles.grid}>
        {BADGES.map((badge) => {
          const earned = earnedBadgeIds.includes(badge.id);
          const IconComponent = Icons[badge.icon] || Icons.FiAward;
          return (
            <div
              key={badge.id}
              className={`${styles.badgeCard} ${earned ? styles.earned : styles.locked}`}
              title={badge.description}
            >
              <IconComponent size={24} className={styles.badgeIcon} />
              <span className={styles.badgeLabel}>{badge.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
