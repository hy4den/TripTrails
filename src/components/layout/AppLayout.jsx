import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import styles from './AppLayout.module.css';

function PageLoader() {
  return <div className={styles.pageLoader}>Yükleniyor...</div>;
}

export default function AppLayout() {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
