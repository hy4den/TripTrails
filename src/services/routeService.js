import {
  doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  collection, query, where, orderBy, limit, startAfter,
  serverTimestamp, writeBatch, increment, arrayUnion,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export async function saveRoute(routeId, user, routeState) {
  const { title, description, city, country, days, pins } = routeState;

  const totalBudget = pins.reduce((sum, p) => sum + (p.budget || 0), 0);
  const coverPhoto = pins.find((p) => p.photos && p.photos.length > 0);
  const coverImageURL = coverPhoto ? coverPhoto.photos[0] : null;

  const routeDoc = {
    title: title || 'Isimsiz Rota',
    description: description || '',
    authorId: user.uid,
    authorName: user.displayName || '',
    authorPhotoURL: user.photoURL || null,
    coverImageURL,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'draft',
    days: days.map((d) => ({ dayNumber: d.dayNumber, title: d.title || '' })),
    location: {
      country: country || '',
      city: city || '',
      coordinates: pins.length > 0
        ? { lat: pins[0].coordinates.lat, lng: pins[0].coordinates.lng }
        : null,
    },
    metadata: {
      totalDays: days.length,
      totalPins: pins.length,
      totalBudget,
      currency: 'TRY',
    },
    engagement: {
      likes: 0,
      saves: 0,
      comments: 0,
      averageRating: 0,
      ratingCount: 0,
    },
    tags: [],
    isPublic: false,
  };

  const batch = writeBatch(db);
  const routeRef = doc(db, 'routes', routeId);
  batch.set(routeRef, routeDoc);

  for (const pin of pins) {
    const pinRef = doc(db, 'routes', routeId, 'pins', pin.id);
    batch.set(pinRef, {
      dayNumber: pin.dayNumber,
      orderIndex: pin.orderIndex,
      placeName: pin.placeName || '',
      coordinates: { lat: pin.coordinates.lat, lng: pin.coordinates.lng },
      category: pin.category || '',
      notes: pin.notes || '',
      photos: pin.photos || [],
      budget: {
        amount: pin.budget || 0,
        currency: pin.currency || 'TRY',
        category: pin.category || '',
      },
      rating: null,
      duration: null,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return routeId;
}

export async function updateRoute(routeId, user, routeState) {
  const { title, description, city, country, days, pins } = routeState;

  const pinsSnap = await getDocs(collection(db, 'routes', routeId, 'pins'));
  const batch = writeBatch(db);
  pinsSnap.docs.forEach((d) => batch.delete(d.ref));

  const totalBudget = pins.reduce((sum, p) => sum + (p.budget || 0), 0);
  const coverPhoto = pins.find((p) => p.photos && p.photos.length > 0);

  const routeRef = doc(db, 'routes', routeId);
  batch.update(routeRef, {
    title: title || 'Isimsiz Rota',
    description: description || '',
    coverImageURL: coverPhoto ? coverPhoto.photos[0] : null,
    updatedAt: serverTimestamp(),
    days: days.map((d) => ({ dayNumber: d.dayNumber, title: d.title || '' })),
    'location.city': city || '',
    'location.country': country || '',
    'metadata.totalDays': days.length,
    'metadata.totalPins': pins.length,
    'metadata.totalBudget': totalBudget,
  });

  for (const pin of pins) {
    const pinRef = doc(db, 'routes', routeId, 'pins', pin.id);
    batch.set(pinRef, {
      dayNumber: pin.dayNumber,
      orderIndex: pin.orderIndex,
      placeName: pin.placeName || '',
      coordinates: { lat: pin.coordinates.lat, lng: pin.coordinates.lng },
      category: pin.category || '',
      notes: pin.notes || '',
      photos: pin.photos || [],
      budget: {
        amount: pin.budget || 0,
        currency: pin.currency || 'TRY',
        category: pin.category || '',
      },
      rating: null,
      duration: null,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

export async function publishRoute(routeId) {
  const routeRef = doc(db, 'routes', routeId);

  // Read route to get authorId + location for stats update
  const routeSnap = await getDoc(routeRef);
  if (!routeSnap.exists()) return;
  const { authorId, location = {} } = routeSnap.data();

  // Mark route as published
  await updateDoc(routeRef, {
    status: 'published',
    isPublic: true,
    updatedAt: serverTimestamp(),
  });

  // Update author's stats
  if (authorId) {
    const userUpdates = {
      'stats.routesCreated': increment(1),
    };
    if (location.country) userUpdates.countriesVisited = arrayUnion(location.country);
    if (location.city)    userUpdates.citiesVisited    = arrayUnion(location.city);
    await updateDoc(doc(db, 'users', authorId), userUpdates);
  }
}

export async function getRoute(routeId) {
  const routeRef = doc(db, 'routes', routeId);
  const routeSnap = await getDoc(routeRef);
  if (!routeSnap.exists()) return null;

  const routeData = routeSnap.data();

  const pinsSnap = await getDocs(collection(db, 'routes', routeId, 'pins'));
  const pins = pinsSnap.docs
    .map((d) => ({
      id: d.id,
      ...d.data(),
      budget: d.data().budget?.amount || 0,
      currency: d.data().budget?.currency || 'TRY',
    }))
    .sort((a, b) => a.dayNumber - b.dayNumber || a.orderIndex - b.orderIndex);

  return {
    id: routeSnap.id,
    ...routeData,
    pins,
  };
}

export async function getUserRoutes(userId) {
  const q = query(
    collection(db, 'routes'),
    where('authorId', '==', userId),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function deleteRoute(routeId) {
  const pinsSnap = await getDocs(collection(db, 'routes', routeId, 'pins'));
  const batch = writeBatch(db);
  pinsSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, 'routes', routeId));
  await batch.commit();
}

export async function getPublishedRoutes(limitCount = 20) {
  const q = query(
    collection(db, 'routes'),
    where('status', '==', 'published'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPublishedRoutesPage(limitCount = 20, lastDoc = null) {
  const constraints = [
    where('status', '==', 'published'),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];
  if (lastDoc) constraints.push(startAfter(lastDoc));
  const snap = await getDocs(query(collection(db, 'routes'), ...constraints));
  const routes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const lastVisible = snap.docs[snap.docs.length - 1] || null;
  const hasMore = snap.docs.length === limitCount;
  return { routes, lastVisible, hasMore };
}
