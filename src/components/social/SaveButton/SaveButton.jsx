import { useState, useEffect } from 'react';
import { FiBookmark } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import { toggleSave, hasUserSaved } from '../../../services/socialService';
import styles from './SaveButton.module.css';

export default function SaveButton({ routeId, saveCount = 0 }) {
  const { currentUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(saveCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      hasUserSaved(routeId, currentUser.uid).then(setSaved);
    }
  }, [routeId, currentUser]);

  const handleClick = async () => {
    if (!currentUser || loading) return;
    setLoading(true);
    setSaved((prev) => !prev);
    setCount((prev) => prev + (saved ? -1 : 1));

    try {
      await toggleSave(routeId, currentUser.uid);
    } catch {
      setSaved((prev) => !prev);
      setCount((prev) => prev + (saved ? 1 : -1));
    }
    setLoading(false);
  };

  return (
    <button
      className={`${styles.saveBtn} ${saved ? styles.saved : ''}`}
      onClick={handleClick}
      disabled={!currentUser}
    >
      <FiBookmark size={18} fill={saved ? 'currentColor' : 'none'} />
      <span>{count}</span>
    </button>
  );
}
