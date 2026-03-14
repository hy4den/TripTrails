import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiUsers, FiBell, FiX, FiCheck, FiMessageSquare, FiUserPlus, FiUserMinus } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { searchUsers } from '../../services/userService';
import {
  sendFriendRequest, cancelFriendRequest,
  acceptFriendRequest, rejectFriendRequest,
  removeFriend, getFriends, getPendingRequests, getFriendRelation,
} from '../../services/friendService';
import { getOrCreateConversation } from '../../services/messageService';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [relations, setRelations] = useState({});   // userId → 'none'|'sent'|'received'|'friends'
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

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

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsers(searchQuery, currentUser.uid);
        setSearchResults(results);
        // Fetch relation for each result
        const rels = {};
        await Promise.all(results.map(async (u) => {
          rels[u.id] = await getFriendRelation(currentUser.uid, u.id);
        }));
        setRelations(rels);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, currentUser]);

  const setAction = (userId, val) => setActionLoading((prev) => ({ ...prev, [userId]: val }));

  const handleSendRequest = async (user) => {
    setAction(user.id, true);
    try {
      await sendFriendRequest(currentUser.uid, user.id, { displayName: userProfile?.displayName, photoURL: userProfile?.photoURL });
      setRelations((prev) => ({ ...prev, [user.id]: 'sent' }));
      addToast('Arkadaşlık isteği gönderildi.', 'success');
    } catch {
      addToast('İstek gönderilemedi.', 'error');
    }
    setAction(user.id, false);
  };

  const handleCancel = async (user) => {
    setAction(user.id, true);
    try {
      await cancelFriendRequest(currentUser.uid, user.id);
      setRelations((prev) => ({ ...prev, [user.id]: 'none' }));
      addToast('İstek iptal edildi.', 'info');
    } catch {
      addToast('İşlem başarısız.', 'error');
    }
    setAction(user.id, false);
  };

  const handleAcceptFromSearch = async (user) => {
    setAction(user.id, true);
    try {
      await acceptFriendRequest(user.id, currentUser.uid,
        { displayName: user.displayName, photoURL: user.photoURL },
        { displayName: userProfile?.displayName, photoURL: userProfile?.photoURL }
      );
      setRelations((prev) => ({ ...prev, [user.id]: 'friends' }));
      addToast(`${user.displayName} ile artık arkadaşsınız!`, 'success');
      reload();
    } catch {
      addToast('İşlem başarısız.', 'error');
    }
    setAction(user.id, false);
  };

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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <FiUsers size={24} />
          Arkadaşlar
        </h1>
      </div>

      {/* ── Search ── */}
      <div className={styles.searchSection}>
        <div className={styles.searchWrap}>
          <FiSearch size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Kullanıcı adı ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && <button className={styles.clearBtn} onClick={() => setSearchQuery('')}><FiX size={14} /></button>}
        </div>

        {(searchResults.length > 0 || searching) && (
          <div className={styles.searchResults}>
            {searching ? (
              <p className={styles.searchHint}>Aranıyor...</p>
            ) : searchResults.length === 0 ? (
              <p className={styles.searchHint}>Kullanıcı bulunamadı.</p>
            ) : (
              searchResults.map((u) => (
                <div key={u.id} className={styles.userRow}>
                  <Link to={`/profile/${u.id}`} className={styles.userInfo}>
                    <Avatar name={u.displayName} photoURL={u.photoURL} size={40} />
                    <div>
                      <p className={styles.userName}>{u.displayName || 'Kullanici'}</p>
                      {u.bio && <p className={styles.userBio}>{u.bio}</p>}
                    </div>
                  </Link>
                  <div className={styles.userActions}>
                    {relations[u.id] === 'friends' && (
                      <span className={styles.alreadyFriends}><FiCheck size={14} /> Arkadaş</span>
                    )}
                    {relations[u.id] === 'sent' && (
                      <button className={styles.btnSecondary} disabled={actionLoading[u.id]} onClick={() => handleCancel(u)}>İstek İptal</button>
                    )}
                    {relations[u.id] === 'received' && (
                      <button className={styles.btnPrimary} disabled={actionLoading[u.id]} onClick={() => handleAcceptFromSearch(u)}>
                        <FiCheck size={14} /> Kabul Et
                      </button>
                    )}
                    {(!relations[u.id] || relations[u.id] === 'none') && (
                      <button className={styles.btnPrimary} disabled={actionLoading[u.id]} onClick={() => handleSendRequest(u)}>
                        <FiUserPlus size={14} /> İstek Gönder
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
      </div>

      {/* ── Content ── */}
      {loading ? (
        <p className={styles.hint}>Yükleniyor...</p>
      ) : tab === 'friends' ? (
        friends.length === 0 ? (
          <div className={styles.empty}>
            <FiUsers size={40} className={styles.emptyIcon} />
            <p>Henüz arkadaşın yok.</p>
            <p className={styles.emptyHint}>Yukarıdan kullanıcı arayarak arkadaşlık isteği gönderebilirsin.</p>
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
      ) : (
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
      )}
    </div>
  );
}
