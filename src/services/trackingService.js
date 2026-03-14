import {
  doc, getDoc, setDoc, updateDoc,
  collection, query, where, getDocs,
  serverTimestamp, arrayUnion,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ─── ACTIVE ROUTE TRACKING ─────────────────────────────

export async function startTracking(userId, routeId, totalPins) {
  const trackingId = `${userId}_${routeId}`;
  const trackingRef = doc(db, 'activeRoutes', trackingId);

  const existing = await getDoc(trackingRef);
  if (existing.exists() && existing.data().status === 'active') {
    return { id: trackingId, ...existing.data() };
  }

  const trackingData = {
    userId,
    routeId,
    startedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    visitedPins: [],
    totalPins,
    progress: 0,
    status: 'active',
  };

  await setDoc(trackingRef, trackingData);
  return { id: trackingId, ...trackingData };
}

export async function stopTracking(userId, routeId) {
  const trackingRef = doc(db, 'activeRoutes', `${userId}_${routeId}`);
  await updateDoc(trackingRef, {
    status: 'abandoned',
    updatedAt: serverTimestamp(),
  });
}

export async function markPinVisited(userId, routeId, pinId, totalPins) {
  const trackingRef = doc(db, 'activeRoutes', `${userId}_${routeId}`);
  const snap = await getDoc(trackingRef);
  if (!snap.exists()) throw new Error('Tracking not found');

  const data = snap.data();
  if (data.visitedPins.includes(pinId)) {
    return {
      visitedPins: data.visitedPins,
      progress: data.progress,
      isCompleted: false,
    };
  }

  const newVisited = [...data.visitedPins, pinId];
  const newProgress = Math.round((newVisited.length / totalPins) * 100);
  const isCompleted = newVisited.length === totalPins;

  const updates = {
    visitedPins: arrayUnion(pinId),
    progress: newProgress,
    updatedAt: serverTimestamp(),
  };

  if (isCompleted) {
    updates.status = 'completed';
    updates.completedAt = serverTimestamp();
  }

  await updateDoc(trackingRef, updates);

  return { visitedPins: newVisited, progress: newProgress, isCompleted };
}

export async function getActiveRoute(userId, routeId) {
  if (!userId) return null;
  const trackingRef = doc(db, 'activeRoutes', `${userId}_${routeId}`);
  const snap = await getDoc(trackingRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getUserActiveRoutes(userId) {
  const q = query(
    collection(db, 'activeRoutes'),
    where('userId', '==', userId),
    where('status', '==', 'active')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getUserCompletedRoutes(userId) {
  const q = query(
    collection(db, 'activeRoutes'),
    where('userId', '==', userId),
    where('status', '==', 'completed')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function isTrackingRoute(userId, routeId) {
  if (!userId) return false;
  const tracking = await getActiveRoute(userId, routeId);
  return tracking !== null && tracking.status === 'active';
}
