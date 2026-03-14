import {
  doc, updateDoc, serverTimestamp, arrayUnion,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { BADGES } from '../utils/constants';
import { getUserActiveRoutes, getUserCompletedRoutes } from './trackingService';

function buildConditionMap(userProfile, trackingStats) {
  return {
    trackingStarted: trackingStats.trackingStarted || 0,
    routesCompleted: trackingStats.routesCompleted || 0,
    pinsVisited: trackingStats.pinsVisited || 0,
    routesCreated: userProfile?.stats?.routesCreated || 0,
    followers: userProfile?.followers || 0,
  };
}

export function checkNewBadges(userProfile, trackingStats) {
  const currentBadges = userProfile?.badges || [];
  const conditionMap = buildConditionMap(userProfile, trackingStats);

  return BADGES.filter((badge) => {
    if (currentBadges.includes(badge.id)) return false;
    const value = conditionMap[badge.condition] || 0;
    return value >= badge.threshold;
  });
}

export async function awardBadges(userId, badgeIds) {
  if (!badgeIds || badgeIds.length === 0) return;
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    badges: arrayUnion(...badgeIds),
    updatedAt: serverTimestamp(),
  });
}

export async function getTrackingStats(userId) {
  const [activeRoutes, completedRoutes] = await Promise.all([
    getUserActiveRoutes(userId),
    getUserCompletedRoutes(userId),
  ]);

  const allTrackings = [...activeRoutes, ...completedRoutes];
  const totalPinsVisited = allTrackings.reduce(
    (sum, t) => sum + (t.visitedPins?.length || 0),
    0
  );

  return {
    pinsVisited: totalPinsVisited,
    routesCompleted: completedRoutes.length,
    trackingStarted: allTrackings.length,
  };
}

export async function checkAndAwardBadges(userId, userProfile) {
  const stats = await getTrackingStats(userId);
  const newBadges = checkNewBadges(userProfile, stats);

  if (newBadges.length > 0) {
    await awardBadges(userId, newBadges.map((b) => b.id));
  }

  return newBadges;
}
