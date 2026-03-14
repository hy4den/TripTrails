import { useRef, useState, useMemo } from 'react';
import { FiImage, FiDownload } from 'react-icons/fi';
import styles from './TripperCard.module.css';

// ── Haversine distance (km) ──────────────────────────────────────
function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * (Math.PI / 180);
  const dLng = (b.lng - a.lng) * (Math.PI / 180);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * (Math.PI / 180)) *
      Math.cos(b.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function totalDistance(pins) {
  return pins
    .slice(1)
    .reduce((sum, pin, i) => sum + haversineKm(pins[i].coordinates, pin.coordinates), 0);
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

// ── Component ────────────────────────────────────────────────────
export default function TripperCard({ route }) {
  const cardRef = useRef(null);
  const [bgImage, setBgImage] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const sortedPins = useMemo(
    () =>
      [...(route?.pins || [])].sort(
        (a, b) => a.dayNumber - b.dayNumber || (a.orderIndex || 0) - (b.orderIndex || 0)
      ),
    [route?.pins]
  );

  const distKm = sortedPins.length > 1 ? totalDistance(sortedPins) : 0;
  const days = route?.days?.length || 0;
  const cityLabel = [route?.location?.city, route?.location?.country]
    .filter(Boolean)
    .join(', ');

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBgImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 2,
        logging: false,
        backgroundColor: null,
      });
      const a = document.createElement('a');
      a.download = `tripper-${(route?.title || 'rota').replace(/\s+/g, '-')}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.cardWrap}>
        <div ref={cardRef} className={styles.card}>
          {/* Background photo */}
          {bgImage ? (
            <img src={bgImage} alt="" className={styles.bgImg} crossOrigin="anonymous" />
          ) : (
            <div className={styles.bgPlaceholder}>
              <FiImage size={40} opacity={0.3} />
              <span>Fotoğraf seçilmedi</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className={styles.overlay} />

          {/* Content */}
          <div className={styles.content}>
            {cityLabel && <p className={styles.cityLabel}>{cityLabel}</p>}

            <div className={styles.statsSection}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Distance</span>
                <span className={styles.statValue}>
                  {distKm > 0 ? formatDistance(distKm) : '—'}
                </span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statLabel}>Duration</span>
                <span className={styles.statValue}>{days > 0 ? `${days} Gün` : '—'}</span>
              </div>
            </div>

            <div className={styles.brandRow}>
              <span className={styles.brand}>
                Trip<span className={styles.brandAccent}>Trails</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <label className={styles.uploadBtn}>
          <FiImage size={14} />
          {bgImage ? 'Fotoğrafı Değiştir' : 'Fotoğraf Seç'}
          <input type="file" accept="image/*" onChange={handleUpload} hidden />
        </label>
        <button
          className={styles.downloadBtn}
          onClick={handleDownload}
          disabled={!bgImage || downloading}
        >
          <FiDownload size={14} />
          {downloading ? 'Hazırlanıyor...' : 'İndir'}
        </button>
      </div>
    </div>
  );
}
