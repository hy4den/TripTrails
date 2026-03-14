import { Popup } from 'react-map-gl/mapbox';
import { FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';
import { getCurrencySymbol, getCategoryLabel } from '../../../utils/constants';
import styles from './PinPopup.module.css';

export default function PinPopup({ pin, color, onClose, onEdit, onDelete }) {
  const photoCount = pin.photos?.length || 0;
  const categoryLabel = getCategoryLabel(pin.category);

  return (
    <Popup
      longitude={pin.coordinates.lng}
      latitude={pin.coordinates.lat}
      anchor="bottom"
      offset={[0, -36]}
      closeOnClick={false}
      onClose={onClose}
    >
      <div className={styles.popup}>
        <div className={styles.colorBar} style={{ backgroundColor: color }} />

        {photoCount > 0 && (
          <div className={styles.photoPreview}>
            <img src={pin.photos[0]} alt="" className={styles.previewImg} />
            {photoCount > 1 && (
              <span className={styles.photoCount}>+{photoCount - 1}</span>
            )}
          </div>
        )}

        <div className={styles.content}>
          <h4 className={styles.placeName}>
            {pin.placeName || 'Isimsiz Konum'}
          </h4>

          <div className={styles.meta}>
            <span className={styles.dayLabel}>Gun {pin.dayNumber}</span>
            {categoryLabel && (
              <span className={styles.categoryBadge}>{categoryLabel}</span>
            )}
          </div>

          {pin.budget > 0 && (
            <p className={styles.budget}>
              {getCurrencySymbol(pin.currency)}{pin.budget}
            </p>
          )}

          {pin.notes && (
            <p className={styles.notes}>
              {pin.notes.length > 80
                ? pin.notes.slice(0, 80) + '...'
                : pin.notes}
            </p>
          )}

          {photoCount > 0 && !pin.photos[0] && (
            <span className={styles.photoIndicator}>
              <FiImage size={12} /> {photoCount} fotograf
            </span>
          )}

          {(onEdit || onDelete) && (
            <div className={styles.actions}>
              <button
                className={styles.actionBtn}
                onClick={() => onEdit?.(pin.id)}
              >
                <FiEdit2 size={14} />
                Duzenle
              </button>
              <button
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                onClick={() => onDelete?.(pin.id)}
              >
                <FiTrash2 size={14} />
                Sil
              </button>
            </div>
          )}
        </div>
      </div>
    </Popup>
  );
}
