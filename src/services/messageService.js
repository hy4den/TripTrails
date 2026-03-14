import {
  doc, setDoc, addDoc, getDoc, getDocs, updateDoc,
  collection, query, where, orderBy, limit, onSnapshot,
  serverTimestamp, increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Deterministic conversation ID: sort UIDs so A-B === B-A
export function convId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

// ─── Conversation ─────────────────────────────────────────────────────────────

export async function getOrCreateConversation(meId, otherId, meInfo, otherInfo) {
  const id = convId(meId, otherId);
  const ref = doc(db, 'conversations', id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [meId, otherId],
      participantNames: {
        [meId]:    meInfo.displayName    || 'Kullanici',
        [otherId]: otherInfo.displayName || 'Kullanici',
      },
      participantPhotos: {
        [meId]:    meInfo.photoURL    || null,
        [otherId]: otherInfo.photoURL || null,
      },
      lastMessage: null,
      lastMessageAt: null,
      unread: { [meId]: 0, [otherId]: 0 },
      createdAt: serverTimestamp(),
    });
  }
  return id;
}

export async function getUserConversations(userId) {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const at = a.lastMessageAt?.seconds || 0;
      const bt = b.lastMessageAt?.seconds || 0;
      return bt - at;
    });
}

export async function markConversationRead(conversationId, userId) {
  await updateDoc(doc(db, 'conversations', conversationId), {
    [`unread.${userId}`]: 0,
  });
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function sendMessage(conversationId, senderId, receiverId, text) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderId,
    text: trimmed,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: trimmed,
    lastMessageAt: serverTimestamp(),
    [`unread.${receiverId}`]: increment(1),
    [`unread.${senderId}`]: 0,
  });
}

// Returns unsubscribe function for real-time messages
export function subscribeToMessages(conversationId, callback) {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(100),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// Get total unread count for a user across all conversations
export async function getTotalUnread(userId) {
  const convs = await getUserConversations(userId);
  return convs.reduce((sum, c) => sum + (c.unread?.[userId] || 0), 0);
}
