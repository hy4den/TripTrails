import { Marker } from 'react-map-gl/mapbox';
import { FiCheck } from 'react-icons/fi';
import styles from './TrackingPin.module.css';

export default function TrackingPin({ pin, color, isVisited, isNewlyVisited, onClick }) {
  const handleClick = (e) => {
    e.originalEvent.stopPropagation();
    onClick?.(pin.id);
  };

  const markerColor = isVisited ? color : '#94a3b8';

  return (
    <Marker
      longitude={pin.coordinates.lng}
      latitude={pin.coordinates.lat}
      anchor="bottom"
      onClick={handleClick}
    >
      <div
        className={`${styles.pinMarker} ${isVisited ? styles.visited : styles.unvisited} ${isNewlyVisited ? styles.pulse : ''}`}
        style={{ backgroundColor: markerColor }}
      >
        {isVisited ? (
          <span className={styles.checkIcon}>
            <FiCheck size={14} />
          </span>
        ) : (
          <span className={styles.pinLabel}>{pin.orderIndex + 1}</span>
        )}
      </div>
    </Marker>
  );
}
