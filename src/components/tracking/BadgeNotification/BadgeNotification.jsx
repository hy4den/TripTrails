import { useEffect, useState } from 'react';
import { FiAward } from 'react-icons/fi';
import styles from './BadgeNotification.module.css';

export default function BadgeNotification({ badges, onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!badges || badges.length === 0) return null;

  return (
    <div className={`${styles.notification} ${visible ? styles.visible : styles.hidden}`}>
      <FiAward size={24} className={styles.icon} />
      <div className={styles.content}>
        <span className={styles.title}>Yeni Rozet!</span>
        {badges.map((badge) => (
          <span key={badge.id} className={styles.badgeName}>{badge.label}</span>
        ))}
      </div>
    </div>
  );
}
