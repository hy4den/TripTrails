import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiMap,
  FiUser,
  FiHeart,
  FiAward,
  FiArrowRight,
  FiCompass,
  FiGlobe,
  FiPlusCircle,
  FiSearch,
} from 'react-icons/fi';
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
    background: '#eff6ff',
  },
  {
    icon: FiUser,
    title: 'Dijital Pasaport',
    description: 'Tamamladığın rotalar, ziyaret ettiğin ülkeler ve kazandığın rozetlerle kişisel seyahat pasaportunu yarat.',
    color: 'var(--color-secondary)',
    background: '#ecfdf5',
  },
  {
    icon: FiHeart,
    title: 'Sosyal Topluluk',
    description: 'Diğer gezginlerin rotalarını beğen, kaydet, puan ver ve yorumla. Takip et, ilham al.',
    color: '#e74c3c',
    background: '#fef2f2',
  },
  {
    icon: FiAward,
    title: 'Rozet Sistemi',
    description: 'Rotaları takip et, pinleri ziyaret et ve özel rozetler kazan. Seyahat maceranda seviye atla.',
    color: '#f39c12',
    background: '#fff7ed',
  },
];

export default function HomePage() {
  const { currentUser, userProfile } = useAuth();
  const [featuredRoutes, setFeaturedRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  useEffect(() => {
    getPublishedRoutes(6)
      .then((routes) => setFeaturedRoutes(routes))
      .catch(() => {})
      .finally(() => setLoadingRoutes(false));
  }, []);

  const heroRoute = featuredRoutes.find((route) => route.coverImageURL) || featuredRoutes[0];
  const countriesCount = new Set(
    featuredRoutes.map((route) => route.location?.country).filter(Boolean)
  ).size;
  const totalPins = featuredRoutes.reduce((sum, route) => sum + (route.metadata?.totalPins || 0), 0);
  const averageDays = featuredRoutes.length
    ? Math.max(1, Math.round(featuredRoutes.reduce((sum, route) => sum + (route.metadata?.totalDays || 0), 0) / featuredRoutes.length))
    : 0;

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <FiCompass size={14} />
            <span>{currentUser ? `Merhaba ${userProfile?.displayName || currentUser.displayName || 'gezgin'}` : 'Seyahat Sosyal Ağı'}</span>
          </div>
          <h1 className={styles.title}>
            Rotaları planla,<br />
            anılarını <span className={styles.highlight}>haritada yaşat.</span>
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
              <span className={styles.statNumber}>{featuredRoutes.length || '0'}</span>
              <span className={styles.statLabel}>Rota</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>{countriesCount || '0'}</span>
              <span className={styles.statLabel}>Ülke</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>{totalPins || '0'}</span>
              <span className={styles.statLabel}>Durak</span>
            </div>
          </div>

          {currentUser && (
            <div className={styles.quickActions}>
              <Link to="/routes/create" className={styles.quickAction}>
                <FiPlusCircle size={17} />
                Yeni rota
              </Link>
              <Link to="/world" className={styles.quickAction}>
                <FiGlobe size={17} />
                Dünya ilerlemem
              </Link>
              <Link to="/people" className={styles.quickAction}>
                <FiSearch size={17} />
                Gezgin bul
              </Link>
            </div>
          )}
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.routePreview}>
            {heroRoute?.coverImageURL && (
              <img
                src={heroRoute.coverImageURL}
                alt={heroRoute.title || 'Öne çıkan rota'}
                className={styles.previewImage}
              />
            )}
            <div className={styles.previewShade} />
            <div className={styles.previewHeader}>
              <span className={styles.previewKicker}>Öne çıkan rota</span>
              <strong>{heroRoute?.title || 'Hafta sonu keşif rotası'}</strong>
              <span>{[heroRoute?.location?.city, heroRoute?.location?.country].filter(Boolean).join(', ') || 'Yeni bir şehir seç'}</span>
            </div>
            <div className={styles.previewStats}>
              <span>{heroRoute?.metadata?.totalDays || averageDays || 3} gün</span>
              <span>{heroRoute?.metadata?.totalPins || 8} pin</span>
              <span>{heroRoute?.engagement?.likes || 0} beğeni</span>
            </div>
            <div className={styles.previewTimeline}>
              <span className={styles.timelinePoint} />
              <span className={styles.timelineLine} />
              <span className={styles.timelinePoint} />
              <span className={styles.timelineLine} />
              <span className={styles.timelinePoint} />
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
              <div className={styles.featureIcon} style={{ color: f.color, backgroundColor: f.background }}>
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
