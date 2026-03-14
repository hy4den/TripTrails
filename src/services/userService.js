import {
  doc, getDoc, setDoc, getDocs, updateDoc,
  collection, query, where, orderBy, limit, documentId, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export async function getUserProfile(userId) {
  const docSnap = await getDoc(doc(db, 'users', userId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function updateUserProfile(userId, updates) {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getSavedRoutes(savedRouteIds) {
  if (!savedRouteIds || savedRouteIds.length === 0) return [];
  const results = [];
  for (let i = 0; i < savedRouteIds.length; i += 30) {
    const batch = savedRouteIds.slice(i, i + 30);
    const q = query(
      collection(db, 'routes'),
      where(documentId(), 'in', batch)
    );
    const snap = await getDocs(q);
    results.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }
  return results;
}

// Safely update nested stats fields using dot-notation (won't overwrite sibling fields)
export async function syncUserStats(userId, statsUpdates) {
  const dotNotation = {};
  for (const [key, val] of Object.entries(statsUpdates)) {
    dotNotation[`stats.${key}`] = val;
  }
  await updateDoc(doc(db, 'users', userId), dotNotation);
}

// Prefix search by displayName (case-sensitive prefix)
export async function searchUsers(searchQuery, excludeUserId) {
  if (!searchQuery.trim()) return [];
  const q = query(
    collection(db, 'users'),
    orderBy('displayName'),
    where('displayName', '>=', searchQuery),
    where('displayName', '<=', searchQuery + '\uf8ff'),
    limit(12),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => u.id !== excludeUserId);
}

