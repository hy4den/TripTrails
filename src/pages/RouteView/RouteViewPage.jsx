import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getRoute } from '../../services/routeService';
import { rateRoute, getUserRating } from '../../services/socialService';
import { getDayColor, getCurrencySymbol } from '../../utils/constants';
import { groupPinsByDay, getBounds } from '../../utils/mapHelpers';

import MapView from '../../components/map/MapView/MapView';
import Pin from '../../components/map/Pin/Pin';
import PinPopup from '../../components/map/PinPopup/PinPopup';
import RouteLayer from '../../components/map/RouteLayer/RouteLayer';
import LikeButton from '../../components/social/LikeButton/LikeButton';
import SaveButton from '../../components/social/SaveButton/SaveButton';
import TrackingButton from '../../components/social/TrackingButton/TrackingButton';
import StarRating from '../../components/common/StarRating/StarRating';
import CommentSection from '../../components/social/CommentSection/CommentSection';
import TripperCard from '../../components/route/TripperCard/TripperCard';

import { FiMapPin, FiCalendar, FiMap } from 'react-icons/fi';
import styles from './RouteViewPage.module.css';

export default function RouteViewPage() {
  const { routeId } = useParams();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const mapRef = useRef(null);

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    getRoute(routeId)
      .then((data) => {
        if (!data) setError('Rota bulunamadi.');
        else setRoute(data);
      })
      .catch(() => setError('Rota yuklenirken hata olustu.'))
      .finally(() => setLoading(false));
  }, [routeId]);

  useEffect(() => {
    if (currentUser && routeId) {
      getUserRating(routeId, currentUser.uid).then(setUserRating);
    }
  }, [routeId, currentUser]);

  const handleMapLoad = useCallback(() => setMapLoaded(true), []);

  // Fly to route location once BOTH map and route data are ready
  useEffect(() => {
    if (!mapLoaded || !route || !mapRef.current) return;

    if (route.pins?.length > 0) {
      const bounds = getBounds(route.pins);
      if (bounds) {
        mapRef.current.fitBounds(bounds, { padding: 60, duration: 1200 });
        return;
      }
    }
    if (route.location?.coordinates) {
      const { lat, lng } = route.location.coordinates;
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 10,
        duration: 1200,
      });
    }
  }, [mapLoaded, route]);

  const handleRate = async (score) => {
    if (!currentUser) {
      addToast('Puan vermek için giriş yapmalısınız.', 'info');
      return;
    }
    setUserRating(score);
    try {
      await rateRoute(routeId, currentUser.uid, score);
      const updatedRoute = await getRoute(routeId);
      setRoute(updatedRoute);
      addToast('Puanınız kaydedildi.', 'success');
    } catch (err) {
      console.error('Rate failed:', err);
      addToast('Puan kaydedilemedi.', 'error');
    }
  };

  const selectedPin = route?.pins?.find((p) => p.id === selectedPinId);
  const grouped = route ? groupPinsByDay(route.pins || []) : {};

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loadingText}>Rota yukleniyor...</p>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <FiMap size={32} />
          <p>{error || 'Rota bulunamadi.'}</p>
        </div>
      </div>
    );
  }

  const engagement = route.engagement || {};
  const meta = route.metadata || {};

  return (
    <div className={styles.page}>
      <div className={styles.mapSection}>
        <MapView mode="view" mapRef={mapRef} onLoad={handleMapLoad}>
          {route.pins.map((pin) => (
            <Pin
              key={pin.id}
              pin={pin}
              color={getDayColor(pin.dayNumber)}
              isSelected={selectedPinId === pin.id}
              onClick={setSelectedPinId}
            />
          ))}
          {selectedPin && (
            <PinPopup
              pin={selectedPin}
              color={getDayColor(selectedPin.dayNumber)}
              onClose={() => setSelectedPinId(null)}
            />
          )}
          <RouteLayer pins={route.pins} days={route.days} />
        </MapView>
      </div>

      <div className={styles.routeHeader}>
        <h1 className={styles.routeTitle}>{route.title}</h1>
        <Link to={`/profile/${route.authorId}`} className={styles.authorLink}>
          {route.authorPhotoURL ? (
            <img src={route.authorPhotoURL} alt="" className={styles.authorAvatar} />
          ) : (
            <span className={styles.authorAvatarFallback}>
              {(route.authorName || '?').charAt(0).toUpperCase()}
            </span>
          )}
          {route.authorName}
        </Link>
        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <FiCalendar size={14} />
            {meta.totalDays || 0} gun
          </span>
          <span className={styles.metaItem}>
            <FiMapPin size={14} />
            {meta.totalPins || 0} pin
          </span>
          {meta.totalBudget > 0 && (
            <span className={styles.metaItem}>
              {getCurrencySymbol(meta.currency || 'TRY')}{meta.totalBudget}
            </span>
          )}
        </div>
      </div>

      <div className={styles.socialBar}>
        <LikeButton routeId={route.id} likeCount={engagement.likes || 0} />
        <SaveButton routeId={route.id} saveCount={engagement.saves || 0} />
        <TrackingButton routeId={route.id} />
        <div className={styles.ratingArea}>
          <StarRating
            value={userRating || engagement.averageRating || 0}
            onChange={handleRate}
            readonly={!currentUser}
          />
          <span className={styles.ratingText}>
            ({(engagement.averageRating || 0).toFixed(1)})
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'details' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Rota Detayları
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'tripper' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('tripper')}
        >
          Tripper
        </button>
      </div>

      {activeTab === 'details' && (
        <>
          {route.description && (
            <div className={styles.description}>
              <p>{route.description}</p>
            </div>
          )}

          <div className={styles.dayDetails}>
            <h2 className={styles.sectionTitle}>Rota Detaylari</h2>
            {(route.days || []).map((day) => {
              const dayPins = grouped[day.dayNumber] || [];
              const color = getDayColor(day.dayNumber);
              return (
                <div key={day.dayNumber} className={styles.dayGroup}>
                  <div className={styles.dayHeader}>
                    <div className={styles.dayCircle} style={{ backgroundColor: color }}>
                      {day.dayNumber}
                    </div>
                    <span className={styles.dayLabel}>
                      Gun {day.dayNumber}
                      {day.title ? ` — ${day.title}` : ''}
                    </span>
                  </div>
                  {dayPins.length > 0 ? (
                    <ul className={styles.pinList}>
                      {dayPins.map((pin) => (
                        <li
                          key={pin.id}
                          className={styles.pinItem}
                          onClick={() => setSelectedPinId(pin.id)}
                        >
                          <FiMapPin size={12} style={{ color, flexShrink: 0 }} />
                          <span>{pin.placeName || 'Isimsiz Konum'}</span>
                          {pin.budget > 0 && (
                            <span className={styles.pinBudget}>
                              {getCurrencySymbol(pin.currency || 'TRY')}{pin.budget}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.noPins}>Bu gunde pin yok.</p>
                  )}
                </div>
              );
            })}
          </div>

          <CommentSection routeId={route.id} />
        </>
      )}

      {activeTab === 'tripper' && <TripperCard route={route} />}
    </div>
  );
}
