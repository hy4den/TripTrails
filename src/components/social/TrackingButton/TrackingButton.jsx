import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiNavigation } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import { getActiveRoute } from '../../../services/trackingService';
import styles from './TrackingButton.module.css';

export default function TrackingButton({ routeId }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentUser) {
      getActiveRoute(currentUser.uid, routeId).then((tracking) => {
        if (tracking && tracking.status === 'active') {
          setIsActive(true);
          setProgress(tracking.progress || 0);
        }
      });
    }
  }, [routeId, currentUser]);

  const handleClick = () => {
    if (!currentUser) return;
    navigate(`/routes/${routeId}/track`);
  };

  return (
    <button
      className={`${styles.trackBtn} ${isActive ? styles.active : ''}`}
      onClick={handleClick}
      disabled={!currentUser}
      title={currentUser ? '' : 'Takip icin giris yapin'}
    >
      <FiNavigation size={18} />
      <span>{isActive ? `Devam Et (%${progress})` : 'Rotayi Takip Et'}</span>
    </button>
  );
}
