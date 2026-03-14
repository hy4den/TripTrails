import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.subtitle}>Sayfa bulunamadı</p>
      <Link to="/" className={styles.homeLink}>
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
