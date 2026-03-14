import { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import { toggleLike, hasUserLiked } from '../../../services/socialService';
import styles from './LikeButton.module.css';

export default function LikeButton({ routeId, likeCount = 0 }) {
  const { currentUser } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likeCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      hasUserLiked(routeId, currentUser.uid).then(setLiked);
    }
  }, [routeId, currentUser]);

  const handleClick = async () => {
    if (!currentUser || loading) return;
    setLoading(true);
    setLiked((prev) => !prev);
    setCount((prev) => prev + (liked ? -1 : 1));

    try {
      await toggleLike(routeId, currentUser.uid);
    } catch {
      setLiked((prev) => !prev);
      setCount((prev) => prev + (liked ? 1 : -1));
    }
    setLoading(false);
  };

  return (
    <button
      className={`${styles.likeBtn} ${liked ? styles.liked : ''}`}
      onClick={handleClick}
      disabled={!currentUser}
    >
      <FiHeart size={18} fill={liked ? 'currentColor' : 'none'} />
      <span>{count}</span>
    </button>
  );
}
