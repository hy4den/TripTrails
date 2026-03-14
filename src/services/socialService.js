import {
  doc, getDoc, setDoc, deleteDoc, updateDoc, addDoc,
  collection, query, where, getDocs,
  serverTimestamp, increment, arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ─── LIKES ───────────────────────────────────────────────

export async function toggleLike(routeId, userId) {
  const likeRef = doc(db, 'likes', `${routeId}_${userId}`);
  const likeSnap = await getDoc(likeRef);

  if (likeSnap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(doc(db, 'routes', routeId), {
      'engagement.likes': increment(-1),
    });
    return { liked: false };
  } else {
    await setDoc(likeRef, {
      routeId,
      userId,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'routes', routeId), {
      'engagement.likes': increment(1),
    });
    return { liked: true };
  }
}

export async function hasUserLiked(routeId, userId) {
  if (!userId) return false;
  const likeRef = doc(db, 'likes', `${routeId}_${userId}`);
  const likeSnap = await getDoc(likeRef);
  return likeSnap.exists();
}

// ─── RATINGS ─────────────────────────────────────────────

export async function rateRoute(routeId, userId, score) {
  const ratingRef = doc(db, 'ratings', `${routeId}_${userId}`);
  const ratingSnap = await getDoc(ratingRef);
  const routeRef = doc(db, 'routes', routeId);
  const routeSnap = await getDoc(routeRef);
  const engagement = routeSnap.data()?.engagement || {};

  if (ratingSnap.exists()) {
    const oldScore = ratingSnap.data().score;
    const count = engagement.ratingCount || 1;
    const oldAvg = engagement.averageRating || 0;
    const newAvg = (oldAvg * count - oldScore + score) / count;

    await setDoc(ratingRef, { routeId, userId, score, updatedAt: serverTimestamp() }, { merge: true });
    await updateDoc(routeRef, { 'engagement.averageRating': newAvg });
  } else {
    const count = engagement.ratingCount || 0;
    const oldAvg = engagement.averageRating || 0;
    const newAvg = (oldAvg * count + score) / (count + 1);

    await setDoc(ratingRef, { routeId, userId, score, createdAt: serverTimestamp() });
    await updateDoc(routeRef, {
      'engagement.averageRating': newAvg,
      'engagement.ratingCount': increment(1),
    });
  }

  return { score };
}

export async function getUserRating(routeId, userId) {
  if (!userId) return null;
  const ratingRef = doc(db, 'ratings', `${routeId}_${userId}`);
  const ratingSnap = await getDoc(ratingRef);
  return ratingSnap.exists() ? ratingSnap.data().score : null;
}

// ─── COMMENTS ────────────────────────────────────────────

export async function addComment(routeId, user, text) {
  const commentData = {
    routeId,
    userId: user.uid,
    userName: user.displayName || 'Anonim',
    userPhotoURL: user.photoURL || null,
    text,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'comments'), commentData);
  await updateDoc(doc(db, 'routes', routeId), {
    'engagement.comments': increment(1),
  });

  return { id: docRef.id, ...commentData, createdAt: new Date() };
}

export async function deleteComment(commentId, routeId) {
  await deleteDoc(doc(db, 'comments', commentId));
  await updateDoc(doc(db, 'routes', routeId), {
    'engagement.comments': increment(-1),
  });
}

export async function getRouteComments(routeId) {
  const q = query(
    collection(db, 'comments'),
    where('routeId', '==', routeId)
  );
  const snap = await getDocs(q);
  const comments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return comments.sort((a, b) => {
    const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
    const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
    return bTime - aTime;
  });
}

// ─── SAVES (Bookmark) ───────────────────────────────────

export async function toggleSave(routeId, userId) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const savedRoutes = userSnap.data()?.savedRoutes || [];

  if (savedRoutes.includes(routeId)) {
    await updateDoc(userRef, { savedRoutes: arrayRemove(routeId) });
    await updateDoc(doc(db, 'routes', routeId), {
      'engagement.saves': increment(-1),
    });
    return { saved: false };
  } else {
    await updateDoc(userRef, { savedRoutes: arrayUnion(routeId) });
    await updateDoc(doc(db, 'routes', routeId), {
      'engagement.saves': increment(1),
    });
    return { saved: true };
  }
}

export async function hasUserSaved(routeId, userId) {
  if (!userId) return false;
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const savedRoutes = userSnap.data()?.savedRoutes || [];
  return savedRoutes.includes(routeId);
}

// ─── FOLLOWS ─────────────────────────────────────────────

export async function toggleFollow(followerId, followingId) {
  const followRef = doc(db, 'follows', `${followerId}_${followingId}`);
  const followSnap = await getDoc(followRef);

  if (followSnap.exists()) {
    await deleteDoc(followRef);
    await updateDoc(doc(db, 'users', followerId), { following: increment(-1) });
    await updateDoc(doc(db, 'users', followingId), { followers: increment(-1) });
    return { following: false };
  } else {
    await setDoc(followRef, {
      followerId,
      followingId,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'users', followerId), { following: increment(1) });
    await updateDoc(doc(db, 'users', followingId), { followers: increment(1) });
    return { following: true };
  }
}

export async function isFollowing(followerId, followingId) {
  if (!followerId || !followingId) return false;
  const followRef = doc(db, 'follows', `${followerId}_${followingId}`);
  const followSnap = await getDoc(followRef);
  return followSnap.exists();
}
