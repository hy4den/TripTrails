import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMap, FiUsers, FiMessageSquare, FiSearch, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import { logout } from '../../../services/authService';
import { getPendingRequests } from '../../../services/friendService';
import { getUserConversations } from '../../../services/messageService';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { currentUser, loading } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) { setPendingCount(0); setUnreadCount(0); return; }
    let cancelled = false;

    const fetchCounts = async () => {
      try {
        const [reqs, convs] = await Promise.all([
          getPendingRequests(currentUser.uid),
          getUserConversations(currentUser.uid),
        ]);
        if (cancelled) return;
        setPendingCount(reqs.length);
        setUnreadCount(convs.reduce((s, c) => s + (c.unread?.[currentUser.uid] || 0), 0));
      } catch { /* silent */ }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [currentUser]);

  const handleLogout = async () => {
    try { await logout(); } catch (err) { console.error('Logout failed:', err); }
  };

  const navClass = ({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        <FiMap size={24} />
        Trip<span>Trails</span>
      </Link>

      <div className={styles.navLinks}>
        <NavLink to="/explore" className={navClass}>Keşfet</NavLink>
        {currentUser && (
          <>
            <NavLink to="/routes/create" className={navClass}>Rota Oluştur</NavLink>
            <NavLink to="/world" className={navClass}>
              <span className={styles.navLinkInner}>
                <FiGlobe size={14} />
                Dünyam
              </span>
            </NavLink>
            <NavLink to="/people" className={navClass}>
              <span className={styles.navLinkInner}>
                <FiSearch size={14} />
                Kişiler
              </span>
            </NavLink>
            <NavLink to="/friends" className={navClass}>
              <span className={styles.navLinkInner}>
                <FiUsers size={14} />
                Arkadaşlar
                {pendingCount > 0 && <span className={styles.navBadge}>{pendingCount}</span>}
              </span>
            </NavLink>
            <NavLink to="/messages" className={navClass}>
              <span className={styles.navLinkInner}>
                <FiMessageSquare size={14} />
                Mesajlar
                {unreadCount > 0 && <span className={styles.navBadge}>{unreadCount}</span>}
              </span>
            </NavLink>
          </>
        )}
      </div>

      <div className={styles.authButtons}>
        {loading ? null : currentUser ? (
          <div className={styles.userInfo}>
            <Link to="/profile" className={styles.userName}>
              {currentUser.displayName || 'Profil'}
            </Link>
            <button onClick={handleLogout} className={styles.logoutBtn}>Çıkış</button>
          </div>
        ) : (
          <>
            <Link to="/login" className={styles.loginBtn}>Giriş Yap</Link>
            <Link to="/register" className={styles.registerBtn}>Kayıt Ol</Link>
          </>
        )}
      </div>
    </nav>
  );
}
