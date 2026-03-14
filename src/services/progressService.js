import {
  doc, getDoc, setDoc, updateDoc, deleteField,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const ref = (userId) => doc(db, 'worldProgress', userId);

// Returns an object: { attractionId: true, ... }
export async function getVisited(userId) {
  const snap = await getDoc(ref(userId));
  return snap.exists() ? (snap.data().visited || {}) : {};
}

export async function markVisited(userId, attractionId) {
  await setDoc(ref(userId), { visited: { [attractionId]: true } }, { merge: true });
}

export async function unmarkVisited(userId, attractionId) {
  await updateDoc(ref(userId), { [`visited.${attractionId}`]: deleteField() });
}

export async function toggleVisited(userId, attractionId, currentlyVisited) {
  if (currentlyVisited) {
    await unmarkVisited(userId, attractionId);
    return false;
  } else {
    await markVisited(userId, attractionId);
    return true;
  }
}
