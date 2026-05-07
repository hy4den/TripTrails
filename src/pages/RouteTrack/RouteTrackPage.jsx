import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GeolocateControl } from 'react-map-gl/mapbox';
import { useAuth } from '../../contexts/AuthContext';
import { getRoute } from '../../services/routeService';
import useRouteTracking from '../../hooks/useRouteTracking';
import { getDayColor } from '../../utils/constants';
import { getBounds } from '../../utils/mapHelpers';

import MapView from '../../components/map/MapView/MapView';
import TrackingPin from '../../components/map/TrackingPin/TrackingPin';
import PinPopup from '../../components/map/PinPopup/PinPopup';
import RouteLayer from '../../components/map/RouteLayer/RouteLayer';
import TrackingControls from '../../components/tracking/TrackingControls/TrackingControls';
import BadgeNotification from '../../components/tracking/BadgeNotification/BadgeNotification';

import { FiArrowLeft, FiMap } from 'react-icons/fi';
import styles from './RouteTrackPage.module.css';

export default function RouteTrackPage() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const mapRef = useRef(null);

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState(null);

  useEffect(() => {
    getRoute(routeId)
      .then((data) => {
        if (!data) setError('Rota bulunamadı.');
        else setRoute(data);
      })
      .catch(() => setError('Rota yüklenirken hata oluştu.'))
      .finally(() => setLoading(false));
  }, [routeId]);

  useEffect(() => {
    if (!mapLoaded || !route || !mapRef.current) return;
    if (route.pins?.length > 0) {
      const bounds = getBounds(route.pins);
      if (bounds) {
        mapRef.current.fitBounds(bounds, { padding: 80, duration: 1200 });
        return;
      }
    }
    if (route.location?.coordinates) {
      const { lat, lng } = route.location.coordinates;
      mapRef.current.flyTo({ center: [lng, lat], zoom: 10, duration: 1200 });
    }
  }, [mapLoaded, route]);

  const handleMapLoad = useCallback(() => setMapLoaded(true), []);

  const handleBadgeEarned = useCallback((badges) => {
    setEarnedBadges(badges);
  }, []);

  const {
    trackingData,
    accuracy,
    gpsError,
    isGpsActive,
    isLoading: trackingLoading,
    visitedPinIds,
    progress,
    isCompleted,
    newlyVisitedPinId,
    startRoute,
    stopRoute,
  } = useRouteTracking(
    currentUser?.uid,
    routeId,
    route?.pins || [],
    userProfile,
    handleBadgeEarned
  );

  const selectedPin = route?.pins?.find((p) => p.id === selectedPinId);
  const isTracking = trackingData?.status === 'active';

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loadingText}>Rota yükleniyor...</p>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <FiMap size={32} />
          <p>{error || 'Rota bulunamadı.'}</p>
          <button className={styles.backLink} onClick={() => navigate(`/routes/${routeId}`)}>
            Rotaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(`/routes/${routeId}`)}>
          <FiArrowLeft size={18} />
        </button>
        <h1 className={styles.title}>{route.title}</h1>
      </div>

      <div className={styles.mapSection}>
        <MapView mode="view" mapRef={mapRef} onLoad={handleMapLoad}>
          <GeolocateControl
            position="top-left"
            trackUserLocation
            showUserHeading
          />

          {route.pins.map((pin) => (
            <TrackingPin
              key={pin.id}
              pin={pin}
              color={getDayColor(pin.dayNumber)}
              isVisited={visitedPinIds.includes(pin.id)}
              isNewlyVisited={newlyVisitedPinId === pin.id}
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

      <div className={styles.controlsPanel}>
        <TrackingControls
          isTracking={isTracking}
          isLoading={trackingLoading}
          progress={progress}
          isCompleted={isCompleted}
          isGpsActive={isGpsActive}
          gpsError={gpsError}
          accuracy={accuracy}
          visitedCount={visitedPinIds.length}
          totalCount={route.pins.length}
          onStart={startRoute}
          onStop={stopRoute}
        />

        <div className={styles.pinChecklist}>
          {(route.days || []).map((day) => {
            const dayPins = (route.pins || []).filter((p) => p.dayNumber === day.dayNumber);
            const color = getDayColor(day.dayNumber);
            return (
              <div key={day.dayNumber} className={styles.dayGroup}>
                <div className={styles.dayHeader}>
                  <div className={styles.dayCircle} style={{ backgroundColor: color }}>
                    {day.dayNumber}
                  </div>
                  <span className={styles.dayLabel}>
                    Gün {day.dayNumber}{day.title ? ` — ${day.title}` : ''}
                  </span>
                </div>
                <ul className={styles.checklistItems}>
                  {dayPins.map((pin) => {
                    const visited = visitedPinIds.includes(pin.id);
                    return (
                      <li
                        key={pin.id}
                        className={`${styles.checklistItem} ${visited ? styles.checklistItemVisited : ''}`}
                        onClick={() => setSelectedPinId(pin.id)}
                      >
                        <span className={`${styles.checkbox} ${visited ? styles.checked : ''}`}>
                          {visited ? '✓' : ''}
                        </span>
                        <span>{pin.placeName || 'İsimsiz Konum'}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {earnedBadges && (
        <BadgeNotification
          badges={earnedBadges}
          onDismiss={() => setEarnedBadges(null)}
        />
      )}
    </div>
  );
}
