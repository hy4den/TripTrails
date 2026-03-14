import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiX, FiCheck, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { searchUsers } from '../../services/userService';
import {
  sendFriendRequest, cancelFriendRequest,
  acceptFriendRequest, getFriendRelation,
} from '../../services/friendService';
import { toggleFollow, isFollowing } from '../../services/socialService';
import styles from './PeoplePage.module.css';

function Avatar({ name, photoURL, size = 40 }) {
  const [err, setErr] = useState(false);
  if (photoURL && !err) {
    return <img src={photoURL} alt={name} width={size} height={size} className={styles.avatar} onError={() => setErr(true)} />;
  }
  return <div className={styles.avatarFallback} style={{ width: size, height: size, fontSize: size * 0.4 }}>{(name || '?').charAt(0).toUpperCase()}</div>;
}

export default function PeoplePage() {
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [relations, setRelations] = useState({});  // userId → 'none'|'sent'|'received'|'friends'
  const [follows, setFollows] = useState({});       // userId → boolean
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsers(searchQuery, currentUser.uid);
        setSearchResults(results);
        const rels = {};
        const flws = {};
        await Promise.all(results.map(async (u) => {
          [rels[u.id], flws[u.id]] = await Promise.all([
            getFriendRelation(currentUser.uid, u.id),
            isFollowing(currentUser.uid, u.id),
          ]);
        }));
        setRelations(rels);
        setFollows(flws);
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

  const handleAccept = async (user) => {
    setAction(user.id, true);
    try {
      await acceptFriendRequest(user.id, currentUser.uid,
        { displayName: user.displayName, photoURL: user.photoURL },
        { displayName: userProfile?.displayName, photoURL: userProfile?.photoURL }
      );
      setRelations((prev) => ({ ...prev, [user.id]: 'friends' }));
      addToast(`${user.displayName} ile artık arkadaşsınız!`, 'success');
    } catch {
      addToast('İşlem başarısız.', 'error');
    }
    setAction(user.id, false);
  };

  const handleToggleFollow = async (user) => {
    setAction(user.id, true);
    try {
      const result = await toggleFollow(currentUser.uid, user.id);
      setFollows((prev) => ({ ...prev, [user.id]: result.following }));
      addToast(result.following ? 'Takip edildi.' : 'Takipten çıkıldı.', 'success');
    } catch {
      addToast('İşlem başarısız.', 'error');
    }
    setAction(user.id, false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <FiSearch size={24} />
          Kullanıcı Ara
        </h1>
        <p className={styles.subtitle}>Kullanıcıları bul, takip et veya arkadaşlık isteği gönder.</p>
      </div>

      <div className={styles.searchWrap}>
        <FiSearch size={16} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Kullanıcı adı ile ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
        {searchQuery && (
          <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>
            <FiX size={14} />
          </button>
        )}
      </div>

      {!searchQuery.trim() ? (
        <div className={styles.empty}>
          <FiSearch size={40} className={styles.emptyIcon} />
          <p>Aramaya başla</p>
          <p className={styles.emptyHint}>Kullanıcı adı yazarak kişi arayabilirsin.</p>
        </div>
      ) : searching ? (
        <p className={styles.hint}>Aranıyor...</p>
      ) : searchResults.length === 0 ? (
        <p className={styles.hint}>Kullanıcı bulunamadı.</p>
      ) : (
        <div className={styles.results}>
          {searchResults.map((u) => (
            <div key={u.id} className={styles.userRow}>
              <Link to={`/profile/${u.id}`} className={styles.userInfo}>
                <Avatar name={u.displayName} photoURL={u.photoURL} size={44} />
                <div>
                  <p className={styles.userName}>{u.displayName || 'Kullanıcı'}</p>
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
                  <button className={styles.btnPrimary} disabled={actionLoading[u.id]} onClick={() => handleAccept(u)}>
                    <FiCheck size={14} /> Kabul Et
                  </button>
                )}
                {(!relations[u.id] || relations[u.id] === 'none') && (
                  <button className={styles.btnPrimary} disabled={actionLoading[u.id]} onClick={() => handleSendRequest(u)}>
                    <FiUserPlus size={14} /> İstek Gönder
                  </button>
                )}
                <button
                  className={follows[u.id] ? styles.btnUnfollow : styles.btnFollow}
                  disabled={actionLoading[u.id]}
                  onClick={() => handleToggleFollow(u)}
                >
                  {follows[u.id] ? 'Takipten Çık' : 'Takip Et'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
