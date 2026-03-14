import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMap, FiUser, FiHeart, FiAward, FiArrowRight, FiCompass } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { getPublishedRoutes } from '../../services/routeService';
import ExploreRouteCard from '../../components/explore/ExploreRouteCard/ExploreRouteCard';
import RouteCardSkeleton from '../../components/explore/RouteCardSkeleton/RouteCardSkeleton';
import styles from './HomePage.module.css';

const FEATURES = [
  {
    icon: FiMap,
    title: 'Harita Üzerinde Rota Oluştur',
    description: 'Gideceğin yerleri harita üzerinde pinleyerek gün gün detaylı seyahat rotası oluştur.',
    color: 'var(--color-primary)',
  },
  {
    icon: FiUser,
    title: 'Dijital Pasaport',
    description: 'Tamamladığın rotalar, ziyaret ettiğin ülkeler ve kazandığın rozetlerle kişisel seyahat pasaportunu yarat.',
    color: 'var(--color-secondary)',
  },
  {
    icon: FiHeart,
    title: 'Sosyal Topluluk',
    description: 'Diğer gezginlerin rotalarını beğen, kaydet, puan ver ve yorumla. Takip et, ilham al.',
    color: '#e74c3c',
  },
  {
    icon: FiAward,
    title: 'Rozet Sistemi',
    description: 'Rotaları takip et, pinleri ziyaret et ve özel rozetler kazan. Seyahat maceranda seviye atla.',
    color: '#f39c12',
  },
];

export default function HomePage() {
  const { currentUser } = useAuth();
  const [featuredRoutes, setFeaturedRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  useEffect(() => {
    getPublishedRoutes(6)
      .then((routes) => setFeaturedRoutes(routes))
      .catch(() => {})
      .finally(() => setLoadingRoutes(false));
  }, []);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <FiCompass size={14} />
            <span>Seyahat Sosyal Ağı</span>
          </div>
          <h1 className={styles.title}>
            Seyahatlerini <span className={styles.highlight}>Keşfet</span>,<br />
            Rotalarını <span className={styles.highlight}>Paylaş</span>
          </h1>
          <p className={styles.subtitle}>
            TripTrails ile seyahat rotalarını harita üzerinde oluştur, dijital pasaportunu yarat
            ve dünyanın dört bir yanından gezginlerden ilham al.
          </p>
          <div className={styles.actions}>
            {currentUser ? (
              <Link to="/routes/create" className={styles.primaryBtn}>
                Rota Oluştur
                <FiArrowRight size={16} />
              </Link>
            ) : (
              <Link to="/register" className={styles.primaryBtn}>
                Ücretsiz Başla
                <FiArrowRight size={16} />
              </Link>
            )}
            <Link to="/explore" className={styles.secondaryBtn}>
              Rotaları Keşfet
            </Link>
          </div>
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>13+</span>
              <span className={styles.statLabel}>Rota</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>8+</span>
              <span className={styles.statLabel}>Ülke</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>8</span>
              <span className={styles.statLabel}>Rozet</span>
            </div>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.mapPreview}>
            <div className={styles.mapPlaceholder}>
              <FiMap size={48} className={styles.mapIcon} />
              <p>İnteraktif Harita</p>
            </div>
            <div className={styles.mapPin} style={{ top: '30%', left: '40%' }} />
            <div className={styles.mapPin} style={{ top: '50%', left: '60%' }} />
            <div className={styles.mapPin} style={{ top: '65%', left: '35%' }} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Her Şey Bir Arada</h2>
          <p className={styles.sectionSubtitle}>
            Seyahatlerinizi planlamak, takip etmek ve paylaşmak için ihtiyacınız olan her şey.
          </p>
        </div>
        <div className={styles.featureGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon} style={{ color: f.color, backgroundColor: `${f.color}18` }}>
                <f.icon size={24} />
              </div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Routes Section */}
      <section className={styles.featured}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Öne Çıkan Rotalar</h2>
          <p className={styles.sectionSubtitle}>Gezginler tarafından oluşturulan en güncel rotalar.</p>
        </div>
        {loadingRoutes ? (
          <div className={styles.routeGrid}>
            {Array.from({ length: 6 }).map((_, i) => <RouteCardSkeleton key={i} />)}
          </div>
        ) : featuredRoutes.length === 0 ? (
          <div className={styles.emptyRoutes}>
            <FiCompass size={40} className={styles.emptyIcon} />
            <p>Henüz rota paylaşılmamış.</p>
            <Link to="/routes/create" className={styles.primaryBtn} style={{ marginTop: '1rem' }}>
              İlk Rotayı Oluştur
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.routeGrid}>
              {featuredRoutes.map((route) => (
                <ExploreRouteCard key={route.id} route={route} />
              ))}
            </div>
            <div className={styles.seeAllRow}>
              <Link to="/explore" className={styles.seeAllBtn}>
                Tüm Rotaları Gör
                <FiArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* CTA Section (not logged in) */}
      {!currentUser && (
        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Maceraya Başlamaya Hazır Mısın?</h2>
            <p className={styles.ctaSubtitle}>
              Ücretsiz hesap oluştur, rotanı planla ve dünyayı keşfet.
            </p>
            <div className={styles.ctaActions}>
              <Link to="/register" className={styles.primaryBtn}>
                Hemen Kaydol
                <FiArrowRight size={16} />
              </Link>
              <Link to="/login" className={styles.secondaryBtn}>
                Giriş Yap
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
