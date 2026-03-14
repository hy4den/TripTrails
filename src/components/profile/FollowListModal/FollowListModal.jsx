import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import styles from './FollowListModal.module.css';

function Avatar({ name, photoURL, size = 40 }) {
  const [err, setErr] = useState(false);
  if (photoURL && !err) {
    return (
      <img
        src={photoURL}
        alt={name}
        width={size}
        height={size}
        className={styles.avatar}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div
      className={styles.avatarFallback}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

export default function FollowListModal({ title, users, loading, onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className={styles.list}>
          {loading ? (
            <p className={styles.hint}>Yükleniyor...</p>
          ) : users.length === 0 ? (
            <p className={styles.hint}>Henüz kimse yok.</p>
          ) : (
            users.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className={styles.userRow}
                onClick={onClose}
              >
                <Avatar name={user.displayName} photoURL={user.photoURL} size={44} />
                <div className={styles.userInfo}>
                  <p className={styles.userName}>{user.displayName || 'Kullanıcı'}</p>
                  {user.bio && <p className={styles.userBio}>{user.bio}</p>}
                </div>
                <div className={styles.userStats}>
                  <span>{user.followers || 0} takipçi</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
