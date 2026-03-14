import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

export async function registerWithEmail(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName });

  await setDoc(doc(db, 'users', user.uid), {
    displayName,
    email: user.email,
    photoURL: null,
    bio: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    stats: {
      countriesVisited: 0,
      citiesVisited: 0,
      routesCreated: 0,
      totalDistance: 0,
      totalBudgetSpent: 0,
    },
    countriesVisited: [],
    citiesVisited: [],
    savedRoutes: [],
    badges: [],
    followers: 0,
    following: 0,
  });

  return user;
}

export async function loginWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  await setDoc(doc(db, 'users', user.uid), {
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    bio: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    stats: {
      countriesVisited: 0,
      citiesVisited: 0,
      routesCreated: 0,
      totalDistance: 0,
      totalBudgetSpent: 0,
    },
    countriesVisited: [],
    citiesVisited: [],
    savedRoutes: [],
    badges: [],
    followers: 0,
    following: 0,
  }, { merge: true });

  return user;
}

export async function logout() {
  await signOut(auth);
}
