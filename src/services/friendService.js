import {
  doc, setDoc, deleteDoc, getDoc, getDocs,
  collection, query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ─── ID helpers ──────────────────────────────────────────────────────────────
const reqId    = (fromId, toId) => `${fromId}_${toId}`;
const friendId = (uid1, uid2)   => `${uid1}_${uid2}`;

// ─── Send / Cancel ────────────────────────────────────────────────────────────
export async function sendFriendRequest(fromId, toId, fromInfo) {
  await setDoc(doc(db, 'friendRequests', reqId(fromId, toId)), {
    fromId,
    toId,
    fromName: fromInfo.displayName || 'Kullanici',
    fromPhotoURL: fromInfo.photoURL || null,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

export async function cancelFriendRequest(fromId, toId) {
  await deleteDoc(doc(db, 'friendRequests', reqId(fromId, toId)));
}

// ─── Accept / Reject ──────────────────────────────────────────────────────────
export async function acceptFriendRequest(fromId, toId, fromInfo, toInfo) {
  // Remove the request doc
  await deleteDoc(doc(db, 'friendRequests', reqId(fromId, toId)));

  // Create bilateral friendship docs
  await setDoc(doc(db, 'friends', friendId(toId, fromId)), {
    userId: toId,
    friendId: fromId,
    friendName: fromInfo.displayName || 'Kullanici',
    friendPhotoURL: fromInfo.photoURL || null,
    createdAt: serverTimestamp(),
  });
  await setDoc(doc(db, 'friends', friendId(fromId, toId)), {
    userId: fromId,
    friendId: toId,
    friendName: toInfo.displayName || 'Kullanici',
    friendPhotoURL: toInfo.photoURL || null,
    createdAt: serverTimestamp(),
  });
}

export async function rejectFriendRequest(fromId, toId) {
  await deleteDoc(doc(db, 'friendRequests', reqId(fromId, toId)));
}

export async function removeFriend(userId1, userId2) {
  await deleteDoc(doc(db, 'friends', friendId(userId1, userId2)));
  await deleteDoc(doc(db, 'friends', friendId(userId2, userId1)));
}

// ─── Queries ──────────────────────────────────────────────────────────────────

// Received pending requests
export async function getPendingRequests(userId) {
  const q = query(collection(db, 'friendRequests'), where('toId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((r) => r.status === 'pending');
}

// Sent pending requests
export async function getSentRequests(userId) {
  const q = query(collection(db, 'friendRequests'), where('fromId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((r) => r.status === 'pending');
}

// Friends list
export async function getFriends(userId) {
  const q = query(collection(db, 'friends'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Relationship status between currentUser and another user
export async function getFriendRelation(meId, otherId) {
  // Already friends?
  const friendDoc = await getDoc(doc(db, 'friends', friendId(meId, otherId)));
  if (friendDoc.exists()) return 'friends';

  // I sent them a request?
  const sentDoc = await getDoc(doc(db, 'friendRequests', reqId(meId, otherId)));
  if (sentDoc.exists() && sentDoc.data().status === 'pending') return 'sent';

  // They sent me a request?
  const receivedDoc = await getDoc(doc(db, 'friendRequests', reqId(otherId, meId)));
  if (receivedDoc.exists() && receivedDoc.data().status === 'pending') return 'received';

  return 'none';
}
