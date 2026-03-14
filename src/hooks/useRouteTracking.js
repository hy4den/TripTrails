import { useState, useEffect, useCallback, useRef } from 'react';
import useGeolocation from './useGeolocation';
import {
  startTracking,
  stopTracking,
  markPinVisited,
  getActiveRoute,
} from '../services/trackingService';
import { checkAndAwardBadges } from '../services/badgeService';
import { isWithinProximity } from '../utils/mapHelpers';
import { PROXIMITY_RADIUS_METERS } from '../utils/constants';

export default function useRouteTracking(userId, routeId, pins, userProfile, onBadgeEarned) {
  const { position, accuracy, error: gpsError, isWatching, startWatching, stopWatching } =
    useGeolocation();

  const [trackingData, setTrackingData] = useState(null);
  const [visitedPinIds, setVisitedPinIds] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newlyVisitedPinId, setNewlyVisitedPinId] = useState(null);

  const checkingRef = useRef(false);

  // Load existing tracking data on mount
  useEffect(() => {
    if (!userId || !routeId) {
      setIsLoading(false);
      return;
    }
    getActiveRoute(userId, routeId)
      .then((data) => {
        if (data && data.status === 'active') {
          setTrackingData(data);
          setVisitedPinIds(data.visitedPins || []);
          setProgress(data.progress || 0);
        } else if (data && data.status === 'completed') {
          setTrackingData(data);
          setVisitedPinIds(data.visitedPins || []);
          setProgress(100);
          setIsCompleted(true);
        }
      })
      .finally(() => setIsLoading(false));
  }, [userId, routeId]);

  // Proximity check whenever position updates
  useEffect(() => {
    if (!position || !trackingData || trackingData.status !== 'active') return;
    if (!pins || pins.length === 0 || checkingRef.current) return;

    const checkProximity = async () => {
      checkingRef.current = true;

      for (const pin of pins) {
        if (visitedPinIds.includes(pin.id)) continue;

        if (isWithinProximity(position, pin.coordinates, PROXIMITY_RADIUS_METERS)) {
          try {
            const result = await markPinVisited(userId, routeId, pin.id, pins.length);
            setVisitedPinIds(result.visitedPins);
            setProgress(result.progress);
            setNewlyVisitedPinId(pin.id);

            setTimeout(() => setNewlyVisitedPinId(null), 3000);

            if (result.isCompleted) {
              setIsCompleted(true);
              setTrackingData((prev) => ({ ...prev, status: 'completed' }));
              stopWatching();
            }

            // Check for badges
            if (userProfile) {
              const newBadges = await checkAndAwardBadges(userId, userProfile);
              if (newBadges.length > 0 && onBadgeEarned) {
                onBadgeEarned(newBadges);
              }
            }
          } catch (err) {
            console.error('Failed to mark pin visited:', err);
          }
          break; // Process one pin at a time
        }
      }

      checkingRef.current = false;
    };

    checkProximity();
  }, [position, trackingData, pins, visitedPinIds, userId, routeId, userProfile, onBadgeEarned, stopWatching]);

  const startRoute = useCallback(async () => {
    if (!userId || !routeId || !pins) return;
    setIsLoading(true);
    try {
      const data = await startTracking(userId, routeId, pins.length);
      setTrackingData(data);
      setVisitedPinIds(data.visitedPins || []);
      setProgress(data.progress || 0);
      startWatching();

      if (userProfile) {
        const newBadges = await checkAndAwardBadges(userId, userProfile);
        if (newBadges.length > 0 && onBadgeEarned) {
          onBadgeEarned(newBadges);
        }
      }
    } catch (err) {
      console.error('Failed to start tracking:', err);
    }
    setIsLoading(false);
  }, [userId, routeId, pins, startWatching, userProfile, onBadgeEarned]);

  const stopRoute = useCallback(async () => {
    if (!userId || !routeId) return;
    try {
      await stopTracking(userId, routeId);
      stopWatching();
      setTrackingData(null);
    } catch (err) {
      console.error('Failed to stop tracking:', err);
    }
  }, [userId, routeId, stopWatching]);

  return {
    trackingData,
    position,
    accuracy,
    gpsError,
    isGpsActive: isWatching,
    isLoading,
    visitedPinIds,
    progress,
    isCompleted,
    newlyVisitedPinId,
    startRoute,
    stopRoute,
  };
}
