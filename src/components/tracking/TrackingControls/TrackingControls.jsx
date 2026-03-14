import { FiPlay, FiSquare, FiNavigation, FiAlertCircle } from 'react-icons/fi';
import styles from './TrackingControls.module.css';

export default function TrackingControls({
  isTracking,
  isLoading,
  progress,
  isCompleted,
  isGpsActive,
  gpsError,
  accuracy,
  visitedCount,
  totalCount,
  onStart,
  onStop,
}) {
  return (
    <div className={styles.controls}>
      <div className={styles.gpsStatus}>
        <FiNavigation
          size={14}
          className={isGpsActive ? styles.gpsActive : styles.gpsInactive}
        />
        <span className={styles.gpsText}>
          {isGpsActive
            ? `GPS Aktif${accuracy ? ` (±${Math.round(accuracy)}m)` : ''}`
            : 'GPS Kapalı'}
        </span>
      </div>

      {gpsError && (
        <div className={styles.errorBanner}>
          <FiAlertCircle size={14} />
          <span>{gpsError}</span>
        </div>
      )}

      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>İlerleme</span>
          <span className={styles.progressValue}>
            {visitedCount}/{totalCount} pin ({progress}%)
          </span>
        </div>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isCompleted ? (
        <div className={styles.completedBanner}>
          Tebrikler! Rotayı tamamladınız!
        </div>
      ) : isTracking ? (
        <button
          className={styles.stopBtn}
          onClick={onStop}
          disabled={isLoading}
        >
          <FiSquare size={16} />
          Takibi Durdur
        </button>
      ) : (
        <button
          className={styles.startBtn}
          onClick={onStart}
          disabled={isLoading}
        >
          <FiPlay size={16} />
          {isLoading ? 'Yükleniyor...' : 'Takibe Başla'}
        </button>
      )}
    </div>
  );
}
