import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserProfile, updateUserProfile, getSavedRoutes, syncUserStats } from '../../services/userService';
import { getUserRoutes, getRoute } from '../../services/routeService';
import { uploadAvatar } from '../../services/storageService';
import { toggleFollow, isFollowing, getFollowers, getFollowing } from '../../services/socialService';
import { getUserActiveRoutes, getUserCompletedRoutes } from '../../services/trackingService';
import { updateProfile } from 'firebase/auth';

import ProfileHeader from '../../components/profile/ProfileHeader/ProfileHeader';
import DigitalPassport from '../../components/profile/DigitalPassport/DigitalPassport';
import BadgeGrid from '../../components/profile/BadgeGrid/BadgeGrid';
import RouteCard from '../../components/profile/RouteCard/RouteCard';
import RouteCardSkeleton from '../../components/explore/RouteCardSkeleton/RouteCardSkeleton';
import ProfileEditModal from '../../components/profile/ProfileEditModal/ProfileEditModal';
import FollowListModal from '../../components/profile/FollowListModal/FollowListModal';

import { FiMap, FiBookmark, FiNavigation } from 'react-icons/fi';
import styles from './ProfilePage.module.css';

const TABS = [
  { value: 'routes', label: 'Rotalarım', icon: FiMap },
  { value: 'saved', label: 'Kaydedilenler', icon: FiBookmark },
  { value: 'tracking', label: 'Takip Ettiklerim', icon: FiNavigation },
];

export default function ProfilePage() {
  const { userId } = useParams();
  const { currentUser, userProfile, refreshUserProfile, patchUserProfile } = useAuth();
  const { addToast } = useToast();

  const currentUserId = currentUser?.uid;
  const isOwnProfile = !userId || userId === currentUserId;
  const targetUserId = isOwnProfile ? currentUserId : userId;

  const [otherProfile, setOtherProfile] = useState(null);
  const profile = isOwnProfile ? userProfile : otherProfile;

  const [activeTab, setActiveTab] = useState('routes');
  const [routes, setRoutes] = useState([]);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [trackingRoutes, setTrackingRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [totalRouteCount, setTotalRouteCount] = useState(undefined);
  const [showEditModal, setShowEditModal] = useState(false);
  const [followingState, setFollowingState] = useState(false);
  const [followListType, setFollowListType] = useState(null); // null | 'followers' | 'following'
  const [followListUsers, setFollowListUsers] = useState([]);
  const [loadingFollowList, setLoadingFollowList] = useState(false);

  useEffect(() => {
    if (!isOwnProfile && userId) {
      getUserProfile(userId).then(setOtherProfile);
    }
  }, [isOwnProfile, userId]);

  useEffect(() => {
    if (!isOwnProfile && currentUser && userId) {
      isFollowing(currentUser.uid, userId).then(setFollowingState);
    }
  }, [isOwnProfile, currentUser, userId]);

  useEffect(() => {
    if (!targetUserId) return;
    setLoadingRoutes(true);

    if (activeTab === 'routes') {
      getUserRoutes(targetUserId)
        .then((r) => {
          setRoutes(r);
          setTotalRouteCount(r.length);
          // Sync stats.routesCreated for own profile (fixes existing data)
          if (isOwnProfile && currentUserId) {
            syncUserStats(currentUserId, { routesCreated: r.length }).catch(() => {});
          }
        })
        .finally(() => setLoadingRoutes(false));
    } else if (activeTab === 'saved' && isOwnProfile && profile?.savedRoutes) {
      getSavedRoutes(profile.savedRoutes)
        .then(setSavedRoutes)
        .finally(() => setLoadingRoutes(false));
    } else if (activeTab === 'tracking' && isOwnProfile) {
      Promise.all([
        getUserActiveRoutes(targetUserId),
        getUserCompletedRoutes(targetUserId),
      ])
        .then(async ([active, completed]) => {
          const allTrackings = [...active, ...completed];
          const routePromises = allTrackings.map((t) =>
            getRoute(t.routeId).then((r) =>
              r ? { ...r, trackingProgress: t.progress, trackingStatus: t.status } : null
            )
          );
          const resolvedRoutes = await Promise.all(routePromises);
          setTrackingRoutes(resolvedRoutes.filter(Boolean));
        })
        .finally(() => setLoadingRoutes(false));
    } else {
      setLoadingRoutes(false);
    }
  }, [targetUserId, activeTab, isOwnProfile, profile?.savedRoutes, currentUserId]);

  const handleEditSave = useCallback(async ({ displayName, bio, avatarFile }) => {
    const updates = { displayName, bio };

    if (avatarFile) {
      try {
        const photoURL = await uploadAvatar(currentUser.uid, avatarFile);
        updates.photoURL = photoURL;
      } catch (err) {
        throw new Error('Avatar yüklenemedi: ' + (err.message || 'Bilinmeyen hata'));
      }
    }

    updateProfile(currentUser, {
      displayName,
      ...(updates.photoURL ? { photoURL: updates.photoURL } : {}),
    }).catch(() => {});

    try {
      await updateUserProfile(currentUser.uid, updates);
    } catch (err) {
      throw new Error('Profil güncellenemedi: ' + (err.code || err.message || 'Firestore hatası'));
    }

    patchUserProfile(updates);
    setShowEditModal(false);
    refreshUserProfile().catch(() => {});
    addToast('Profil güncellendi.', 'success');
  }, [currentUser, refreshUserProfile, patchUserProfile, addToast]);

  const handleFollowToggle = useCallback(async () => {
    if (!currentUser || !userId) return;
    try {
      const result = await toggleFollow(currentUser.uid, userId);
      setFollowingState(result.following);
      const updated = await getUserProfile(userId);
      setOtherProfile(updated);
      addToast(result.following ? 'Takip edildi.' : 'Takipten çıkıldı.', 'success');
    } catch {
      addToast('İşlem gerçekleştirilemedi.', 'error');
    }
  }, [currentUser, userId, addToast]);

  const handleFollowersClick = useCallback(async () => {
    if (!targetUserId) return;
    setFollowListType('followers');
    setLoadingFollowList(true);
    setFollowListUsers([]);
    const users = await getFollowers(targetUserId);
    setFollowListUsers(users);
    setLoadingFollowList(false);
  }, [targetUserId]);

  const handleFollowingClick = useCallback(async () => {
    if (!targetUserId) return;
    setFollowListType('following');
    setLoadingFollowList(true);
    setFollowListUsers([]);
    const users = await getFollowing(targetUserId);
    setFollowListUsers(users);
    setLoadingFollowList(false);
  }, [targetUserId]);

  const getDisplayedRoutes = () => {
    if (activeTab === 'routes') return routes;
    if (activeTab === 'saved') return savedRoutes;
    if (activeTab === 'tracking') return trackingRoutes;
    return [];
  };

  const getEmptyMessage = () => {
    if (activeTab === 'routes') return 'Henüz rota oluşturulmadı.';
    if (activeTab === 'saved') return 'Henüz kaydedilen rota yok.';
    return 'Henüz takip edilen rota yok.';
  };

  const displayedRoutes = getDisplayedRoutes();

  if (!profile && !isOwnProfile) {
    return (
      <div className={styles.page}>
        <p className={styles.loadingText}>Profil yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEditClick={() => setShowEditModal(true)}
        onFollowToggle={handleFollowToggle}
        isFollowing={followingState}
        routeCount={totalRouteCount}
        onFollowersClick={handleFollowersClick}
        onFollowingClick={handleFollowingClick}
      />

      <DigitalPassport
        countriesVisited={profile?.countriesVisited || []}
        citiesVisited={profile?.citiesVisited || []}
      />

      <BadgeGrid earnedBadgeIds={profile?.badges || []} />

      <div className={styles.tabs}>
        {TABS.map((tab) => {
          if ((tab.value === 'saved' || tab.value === 'tracking') && !isOwnProfile) return null;
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              className={`${styles.tab} ${activeTab === tab.value ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.value)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loadingRoutes ? (
        <div className={styles.routeGrid}>
          {Array.from({ length: 4 }).map((_, i) => <RouteCardSkeleton key={i} />)}
        </div>
      ) : displayedRoutes.length > 0 ? (
        <div className={styles.routeGrid}>
          {displayedRoutes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <FiMap size={32} className={styles.emptyIcon} />
          <p>{getEmptyMessage()}</p>
        </div>
      )}

      {showEditModal && (
        <ProfileEditModal
          profile={profile}
          onSave={handleEditSave}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {followListType && (
        <FollowListModal
          title={followListType === 'followers' ? 'Takipçiler' : 'Takip Edilenler'}
          users={followListUsers}
          loading={loadingFollowList}
          onClose={() => setFollowListType(null)}
        />
      )}
    </div>
  );
}
