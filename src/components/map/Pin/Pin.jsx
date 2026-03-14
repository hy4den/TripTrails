import { Marker } from 'react-map-gl/mapbox';
import styles from './Pin.module.css';

export default function Pin({ pin, color, isSelected, onClick }) {
  const handleClick = (e) => {
    e.originalEvent.stopPropagation();
    onClick?.(pin.id);
  };

  return (
    <Marker
      longitude={pin.coordinates.lng}
      latitude={pin.coordinates.lat}
      anchor="bottom"
      onClick={handleClick}
    >
      <div
        className={`${styles.pinMarker} ${isSelected ? styles.pinMarkerSelected : ''}`}
        style={{ backgroundColor: color }}
      >
        <span className={styles.pinLabel}>{pin.orderIndex + 1}</span>
      </div>
    </Marker>
  );
}
