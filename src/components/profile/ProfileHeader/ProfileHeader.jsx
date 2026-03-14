import { useState, useEffect } from 'react';
import { FiEdit2, FiCompass, FiMapPin, FiMap, FiUsers } from 'react-icons/fi';
import styles from './ProfileHeader.module.css';

export default function ProfileHeader({ profile, isOwnProfile, onEditClick, onFollowToggle, isFollowing: isFollowingProp, routeCount, onFollowersClick, onFollowingClick }) {
  const displayName = profile?.displayName || 'Kullanıcı';
  const stats = profile?.stats || {};
  // Derive counts from actual arrays (always accurate) — fallback to stats numbers
  const countriesCount = (profile?.countriesVisited || []).length || stats.countriesVisited || 0;
  const citiesCount    = (profile?.citiesVisited    || []).length || stats.citiesVisited    || 0;
  const routesCount    = routeCount !== undefined ? routeCount : (stats.routesCreated || 0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [profile?.photoURL]);

  return (
    <div className={styles.header}>
      <div className={styles.avatarSection}>
        {profile?.photoURL && !imgError ? (
          <img
            src={profile.photoURL}
            alt={displayName}
            className={styles.avatarImg}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.avatarFallback}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.nameRow}>
          <h1 className={styles.displayName}>{displayName}</h1>
          {isOwnProfile && (
            <button className={styles.editBtn} onClick={onEditClick}>
              <FiEdit2 size={16} />
              Profili Düzenle
            </button>
          )}
          {!isOwnProfile && onFollowToggle && (
            <button
              className={`${styles.followBtn} ${isFollowingProp ? styles.followBtnActive : ''}`}
              onClick={onFollowToggle}
            >
              {isFollowingProp ? 'Takipten Çık' : 'Takip Et'}
            </button>
          )}
        </div>
        {profile?.bio && <p className={styles.bio}>{profile.bio}</p>}

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <FiCompass size={16} />
            <span className={styles.statValue}>{countriesCount}</span>
            <span className={styles.statLabel}>Ülke</span>
          </div>
          <div className={styles.statItem}>
            <FiMapPin size={16} />
            <span className={styles.statValue}>{citiesCount}</span>
            <span className={styles.statLabel}>Şehir</span>
          </div>
          <div className={styles.statItem}>
            <FiMap size={16} />
            <span className={styles.statValue}>{routesCount}</span>
            <span className={styles.statLabel}>Rota</span>
          </div>
          <button className={styles.statItemBtn} onClick={onFollowersClick} type="button">
            <FiUsers size={16} />
            <span className={styles.statValue}>{profile?.followers || 0}</span>
            <span className={styles.statLabel}>Takipçi</span>
          </button>
          <button className={styles.statItemBtn} onClick={onFollowingClick} type="button">
            <span className={styles.statValue}>{profile?.following || 0}</span>
            <span className={styles.statLabel}>Takip</span>
          </button>
        </div>
      </div>
    </div>
  );
}
