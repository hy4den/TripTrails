import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUsers, FiBell, FiX, FiCheck, FiMessageSquare, FiUserMinus, FiRss, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  acceptFriendRequest, rejectFriendRequest,
  removeFriend, getFriends, getPendingRequests,
} from '../../services/friendService';
import { getOrCreateConversation } from '../../services/messageService';
import { toggleFollow, isFollowing, getFollowers, getFollowing } from '../../services/socialService';
import styles from './FriendsPage.module.css';

function Avatar({ name, photoURL, size = 40 }) {
  const [err, setErr] = useState(false);
  if (photoURL && !err) {
    return <img src={photoURL} alt={name} width={size} height={size} className={styles.avatar} onError={() => setErr(true)} />;
  }
  return <div className={styles.avatarFallback} style={{ width: size, height: size, fontSize: size * 0.4 }}>{(name || '?').charAt(0).toUpperCase()}</div>;
}

export default function FriendsPage() {
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  // Following / Followers tabs
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [followerFollowState, setFollowerFollowState] = useState({}); // followerId → bool (do I follow them back?)

  // Load friends + pending requests
  const reload = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const [f, r] = await Promise.all([
      getFriends(currentUser.uid),
      getPendingRequests(currentUser.uid),
    ]);
    setFriends(f);
    setRequests(r);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => { reload(); }, [reload]);

  const setAction = (userId, val) => setActionLoading((prev) => ({ ...prev, [userId]: val }));

  // Load following list when tab is opened
  useEffect(() => {
    if (tab !== 'following' || !currentUser) return;
    setLoadingFollowing(true);
    getFollowing(currentUser.uid).then((data) => {
      setFollowingList(data);
      setLoadingFollowing(false);
    });
  }, [tab, currentUser]);

  // Load followers list when tab is opened
  useEffect(() => {
    if (tab !== 'followers' || !currentUser) return;
    setLoadingFollowers(true);
    getFollowers(currentUser.uid).then(async (data) => {
      setFollowersList(data);
      const followStates = {};
      await Promise.all(data.map(async (u) => {
        followStates[u.id] = await isFollowing(currentUser.uid, u.id);
      }));
      setFollowerFollowState(followStates);
      setLoadingFollowers(false);
    });
  }, [tab, currentUser]);

  const handleAccept = async (req) => {
    setAction(req.id, true);
    try {
      await acceptFriendRequest(req.fromId, currentUser.uid,
        { displayName: req.fromName, photoURL: req.fromPhotoURL },
        { displayName: userProfile?.displayName, photoURL: userProfile?.photoURL }
      );
      addToast(`${req.fromName} ile artık arkadaşsınız!`, 'success');
      reload();
    } catch {
      addToast('Kabul edilemedi.', 'error');
    }
    setAction(req.id, false);
  };

  const handleReject = async (req) => {
    setAction(req.id, true);
    try {
      await rejectFriendRequest(req.fromId, currentUser.uid);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      addToast('İstek reddedildi.', 'info');
    } catch {
      addToast('İşlem başarısız.', 'error');
    }
    setAction(req.id, false);
  };

  const handleRemoveFriend = async (friend) => {
    setAction(friend.id, true);
    try {
      await removeFriend(currentUser.uid, friend.friendId);
      setFriends((prev) => prev.filter((f) => f.id !== friend.id));
      addToast('Arkadaşlıktan çıkarıldı.', 'info');
    } catch {
      addToast('İşlem başarısız.', 'error');
    }
    setAction(friend.id, false);
  };

  const handleMessage = async (friend) => {
    setAction(friend.id, true);
    try {
      const convId = await getOrCreateConversation(
        currentUser.uid, friend.friendId,
        { displayName: userProfile?.displayName, photoURL: userProfile?.photoURL },
        { displayName: friend.friendName, photoURL: friend.friendPhotoURL }
      );
      navigate(`/messages?conv=${convId}`);
    } catch {
      addToast('Mesaj açılamadı.', 'error');
    }
    setAction(friend.id, false);
  };

  const handleUnfollowFromList = async (userId) => {
    setAction(userId, true);
    try {
      await toggleFollow(currentUser.uid, userId);
      setFollowingList((prev) => prev.filter((u) => u.id !== userId));
      addToast('Takipten çıkıldı.', 'info');
    } catch {
      addToast('İşlem başarısız.', 'error');
    }
    setAction(userId, false);
  };

  const handleFollowBack = async (userId) => {
    setAction(userId, true);
    try {
      const result = await toggleFollow(currentUser.uid, userId);
      setFollowerFollowState((prev) => ({ ...prev, [userId]: result.following }));
      addToast(result.following ? 'Takip edildi.' : 'Takipten çıkıldı.', 'success');
    } catch {
      addToast('İşlem başarısız.', 'error');
    }
    setAction(userId, false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <FiUsers size={24} />
          Arkadaşlar
        </h1>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'friends' ? styles.tabActive : ''}`}
          onClick={() => setTab('friends')}
        >
          <FiUsers size={15} />
          Arkadaşlarım
          {friends.length > 0 && <span className={styles.badge}>{friends.length}</span>}
        </button>
        <button
          className={`${styles.tab} ${tab === 'requests' ? styles.tabActive : ''}`}
          onClick={() => setTab('requests')}
        >
          <FiBell size={15} />
          İstekler
          {requests.length > 0 && <span className={`${styles.badge} ${styles.badgePrimary}`}>{requests.length}</span>}
        </button>
        <button
          className={`${styles.tab} ${tab === 'following' ? styles.tabActive : ''}`}
          onClick={() => setTab('following')}
        >
          <FiRss size={15} />
          Takip Ettiklerim
        </button>
        <button
          className={`${styles.tab} ${tab === 'followers' ? styles.tabActive : ''}`}
          onClick={() => setTab('followers')}
        >
          <FiHeart size={15} />
          Takipçilerim
        </button>
      </div>

      {/* ── Content ── */}
      {loading && (tab === 'friends' || tab === 'requests') ? (
        <p className={styles.hint}>Yükleniyor...</p>
      ) : tab === 'friends' ? (
        friends.length === 0 ? (
          <div className={styles.empty}>
            <FiUsers size={40} className={styles.emptyIcon} />
            <p>Henüz arkadaşın yok.</p>
            <p className={styles.emptyHint}><Link to="/people">Kullanıcı arama</Link> sayfasından arkadaşlık isteği gönderebilirsin.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {friends.map((f) => (
              <div key={f.id} className={styles.friendCard}>
                <Link to={`/profile/${f.friendId}`} className={styles.cardInfo}>
                  <Avatar name={f.friendName} photoURL={f.friendPhotoURL} size={52} />
                  <p className={styles.friendName}>{f.friendName}</p>
                </Link>
                <div className={styles.cardActions}>
                  <button
                    className={styles.btnMessage}
                    disabled={actionLoading[f.id]}
                    onClick={() => handleMessage(f)}
                  >
                    <FiMessageSquare size={15} />
                    Mesaj
                  </button>
                  <button
                    className={styles.btnRemove}
                    disabled={actionLoading[f.id]}
                    onClick={() => handleRemoveFriend(f)}
                    title="Arkadaşlıktan çıkar"
                  >
                    <FiUserMinus size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === 'requests' ? (
        requests.length === 0 ? (
          <div className={styles.empty}>
            <FiBell size={40} className={styles.emptyIcon} />
            <p>Bekleyen istek yok.</p>
          </div>
        ) : (
          <div className={styles.requestList}>
            {requests.map((req) => (
              <div key={req.id} className={styles.requestRow}>
                <Link to={`/profile/${req.fromId}`} className={styles.userInfo}>
                  <Avatar name={req.fromName} photoURL={req.fromPhotoURL} size={44} />
                  <div>
                    <p className={styles.userName}>{req.fromName}</p>
                    <p className={styles.userBio}>Sana arkadaşlık isteği gönderdi</p>
                  </div>
                </Link>
                <div className={styles.userActions}>
                  <button className={styles.btnPrimary} disabled={actionLoading[req.id]} onClick={() => handleAccept(req)}>
                    <FiCheck size={14} /> Kabul Et
                  </button>
                  <button className={styles.btnSecondary} disabled={actionLoading[req.id]} onClick={() => handleReject(req)}>
                    <FiX size={14} /> Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === 'following' ? (
        loadingFollowing ? (
          <p className={styles.hint}>Yükleniyor...</p>
        ) : followingList.length === 0 ? (
          <div className={styles.empty}>
            <FiRss size={40} className={styles.emptyIcon} />
            <p>Henüz kimseyi takip etmiyorsun.</p>
            <p className={styles.emptyHint}><Link to="/people">Kullanıcı arama</Link> sayfasından takip edebilirsin.</p>
          </div>
        ) : (
          <div className={styles.requestList}>
            {followingList.map((u) => (
              <div key={u.id} className={styles.requestRow}>
                <Link to={`/profile/${u.id}`} className={styles.userInfo}>
                  <Avatar name={u.displayName} photoURL={u.photoURL} size={44} />
                  <div>
                    <p className={styles.userName}>{u.displayName || 'Kullanıcı'}</p>
                    {u.bio && <p className={styles.userBio}>{u.bio}</p>}
                  </div>
                </Link>
                <div className={styles.userActions}>
                  <button
                    className={styles.btnUnfollow}
                    disabled={actionLoading[u.id]}
                    onClick={() => handleUnfollowFromList(u.id)}
                  >
                    Takipten Çık
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // tab === 'followers'
        loadingFollowers ? (
          <p className={styles.hint}>Yükleniyor...</p>
        ) : followersList.length === 0 ? (
          <div className={styles.empty}>
            <FiHeart size={40} className={styles.emptyIcon} />
            <p>Henüz takipçin yok.</p>
          </div>
        ) : (
          <div className={styles.requestList}>
            {followersList.map((u) => (
              <div key={u.id} className={styles.requestRow}>
                <Link to={`/profile/${u.id}`} className={styles.userInfo}>
                  <Avatar name={u.displayName} photoURL={u.photoURL} size={44} />
                  <div>
                    <p className={styles.userName}>{u.displayName || 'Kullanıcı'}</p>
                    {u.bio && <p className={styles.userBio}>{u.bio}</p>}
                  </div>
                </Link>
                <div className={styles.userActions}>
                  <button
                    className={followerFollowState[u.id] ? styles.btnUnfollow : styles.btnFollow}
                    disabled={actionLoading[u.id]}
                    onClick={() => handleFollowBack(u.id)}
                  >
                    {followerFollowState[u.id] ? 'Takipten Çık' : 'Takip Et'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
