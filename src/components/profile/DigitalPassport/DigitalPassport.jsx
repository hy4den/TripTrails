import { FiGlobe, FiMapPin } from 'react-icons/fi';
import styles from './DigitalPassport.module.css';

export default function DigitalPassport({ countriesVisited = [], citiesVisited = [] }) {
  const hasData = countriesVisited.length > 0 || citiesVisited.length > 0;

  if (!hasData) {
    return (
      <div className={styles.empty}>
        <FiGlobe size={32} className={styles.emptyIcon} />
        <p>Henüz ziyaret edilen yer yok.</p>
      </div>
    );
  }

  return (
    <div className={styles.passport}>
      <h2 className={styles.title}>Dijital Pasaport</h2>

      {countriesVisited.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FiGlobe size={16} />
            Ülkeler ({countriesVisited.length})
          </h3>
          <div className={styles.stampGrid}>
            {countriesVisited.map((country) => (
              <div key={country} className={styles.countryStamp}>
                {country}
              </div>
            ))}
          </div>
        </div>
      )}

      {citiesVisited.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FiMapPin size={16} />
            Şehirler ({citiesVisited.length})
          </h3>
          <div className={styles.stampGrid}>
            {citiesVisited.map((city) => (
              <div key={city} className={styles.cityStamp}>
                {city}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
