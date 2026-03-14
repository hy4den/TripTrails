import Skeleton from '../../common/Skeleton';
import styles from './RouteCardSkeleton.module.css';

export default function RouteCardSkeleton() {
  return (
    <div className={styles.card}>
      <Skeleton className={styles.cover} />
      <div className={styles.body}>
        <Skeleton height="18px" className={styles.title} />
        <Skeleton height="13px" width="60%" className={styles.line} />
        <div className={styles.authorRow}>
          <Skeleton width="28px" height="28px" borderRadius="50%" />
          <Skeleton height="13px" width="80px" className={styles.line} />
        </div>
        <div className={styles.statsRow}>
          <Skeleton height="13px" width="50px" className={styles.line} />
          <Skeleton height="13px" width="60px" className={styles.line} />
        </div>
      </div>
    </div>
  );
}
