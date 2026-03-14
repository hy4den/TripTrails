import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import styles from './StarRating.module.css';

export default function StarRating({ value = 0, onChange, size = 20, readonly = false }) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div
      className={styles.stars}
      onMouseLeave={() => !readonly && setHoverValue(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hoverValue || Math.round(value));
        return (
          <button
            key={star}
            type="button"
            className={`${styles.star} ${filled ? styles.starFilled : ''} ${readonly ? styles.starReadonly : ''}`}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            disabled={readonly}
          >
            <FiStar size={size} fill={filled ? 'currentColor' : 'none'} />
          </button>
        );
      })}
    </div>
  );
}
