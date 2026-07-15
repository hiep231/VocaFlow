import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  increment,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import type { UserStats } from "@/types";
import { calculateLevel } from "@/lib/gamification";

export const updateUserStreak = async (
  userId: string,
  userProfile?: { displayName?: string; photoURL?: string }
) => {
  const statsRef = doc(db, "user_stats", userId);
  const statsSnap = await getDoc(statsRef);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const profileUpdate = userProfile
    ? {
        displayName: userProfile.displayName || "Anonymous",
        photoURL: userProfile.photoURL || "",
      }
    : {};

  if (!statsSnap.exists()) {
    const initialStats: UserStats = {
      streak: 1,
      lastStudyDate: Timestamp.fromDate(now),
      xp: 0,
      level: 1,
      ...profileUpdate,
    };
    await setDoc(statsRef, initialStats, { merge: true });
    return 1;
  }

  const data = statsSnap.data() as UserStats;
  const lastDate =
    data.lastStudyDate instanceof Timestamp
      ? data.lastStudyDate.toDate()
      : new Date(data.lastStudyDate);
  const lastStudyDay = new Date(
    lastDate.getFullYear(),
    lastDate.getMonth(),
    lastDate.getDate()
  );

  const diffTime = Math.abs(today.getTime() - lastStudyDay.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = data.streak;

  if (diffDays === 0) {
    // Same day, check if we need to update profile
    if (Object.keys(profileUpdate).length > 0) {
      await updateDoc(statsRef, profileUpdate);
    }
    return newStreak;
  } else if (diffDays === 1) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  await updateDoc(statsRef, {
    streak: newStreak,
    lastStudyDate: Timestamp.fromDate(now),
    ...profileUpdate,
  });

  return newStreak;
  return newStreak;
};

export const checkAndResetStreak = async (
  userId: string
): Promise<UserStats | null> => {
  const statsRef = doc(db, "user_stats", userId);
  const statsSnap = await getDoc(statsRef);
  if (!statsSnap.exists()) return null;

  const data = statsSnap.data() as UserStats;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const lastDate =
    data.lastStudyDate instanceof Timestamp
      ? data.lastStudyDate.toDate()
      : new Date(data.lastStudyDate);

  const lastStudyDay = new Date(
    lastDate.getFullYear(),
    lastDate.getMonth(),
    lastDate.getDate()
  );

  const diffTime = Math.abs(today.getTime() - lastStudyDay.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If more than 1 day has passed (diffDays > 1), check for streak freeze.
  if (diffDays > 1 && data.streak > 0) {
    if (diffDays === 2 && data.activeFreezes && data.activeFreezes > 0) {
      // Consume 1 freeze
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      await updateDoc(statsRef, {
        activeFreezes: data.activeFreezes - 1,
        lastStudyDate: Timestamp.fromDate(yesterday)
      });
      
      return { 
        ...data, 
        activeFreezes: data.activeFreezes - 1,
        lastStudyDate: Timestamp.fromDate(yesterday)
      };
    } else {
      // Streak broken. Reset to 0.
      await updateDoc(statsRef, { streak: 0 });
      return { ...data, streak: 0 };
    }
  }

  return data;
};

export const getUserStats = async (
  userId: string
): Promise<UserStats | null> => {
  const statsRef = doc(db, "user_stats", userId);
  const statsSnap = await getDoc(statsRef);
  if (statsSnap.exists()) {
    return statsSnap.data() as UserStats;
  }
  return null;
};

export const addXP = async (
  userId: string,
  amount: number,
  userProfile?: { displayName?: string; photoURL?: string }
) => {
  const statsRef = doc(db, "user_stats", userId);
  const statsSnap = await getDoc(statsRef);

  const profileUpdate = userProfile
    ? {
        displayName: userProfile.displayName || "Anonymous",
        photoURL: userProfile.photoURL || "",
      }
    : {};

  if (!statsSnap.exists()) {
    const level = calculateLevel(amount);
    const initialStats: UserStats = {
      streak: 0,
      lastStudyDate: Timestamp.fromDate(new Date()),
      xp: amount,
      level: level,
      coins: amount,
      ...profileUpdate,
    };
    await setDoc(statsRef, initialStats, { merge: true });
    return;
  }

  const data = statsSnap.data() as UserStats;
  const newXP = (data.xp || 0) + amount;
  const newLevel = calculateLevel(newXP);
  const currentCoins = data.coins !== undefined ? data.coins : (data.xp || 0);
  const newCoins = currentCoins + amount;

  await updateDoc(statsRef, {
    xp: newXP,
    level: newLevel,
    coins: newCoins,
    ...profileUpdate,
  });
};

const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff)).setHours(0, 0, 0, 0);
};

export const buyStreakFreeze = async (userId: string): Promise<UserStats | null> => {
  const statsRef = doc(db, "user_stats", userId);
  const statsSnap = await getDoc(statsRef);
  
  if (!statsSnap.exists()) {
    throw new Error("User stats not found");
  }
  
  const data = statsSnap.data() as UserStats;
  const currentCoins = data.coins !== undefined ? data.coins : (data.xp || 0);
  
  const today = new Date();
  let freezesBoughtThisWeek = data.freezesBoughtThisWeek || 0;
  
  if (data.lastFreezePurchaseDate) {
    const lastPurchaseDate = data.lastFreezePurchaseDate.toDate();
    if (getMonday(today) > getMonday(lastPurchaseDate)) {
      // It's a new week, reset
      freezesBoughtThisWeek = 0;
    }
  }
  
  const cost = 50 + (freezesBoughtThisWeek * 25);
  
  if (currentCoins < cost) {
    throw new Error("Not enough coins");
  }
  
  const newCoins = currentCoins - cost;
  const newActiveFreezes = (data.activeFreezes || 0) + 1;
  const newFreezesBoughtThisWeek = freezesBoughtThisWeek + 1;
  
  await updateDoc(statsRef, {
    coins: newCoins,
    activeFreezes: newActiveFreezes,
    freezesBoughtThisWeek: newFreezesBoughtThisWeek,
    lastFreezePurchaseDate: Timestamp.fromDate(today)
  });
  
  return {
    ...data,
    coins: newCoins,
    activeFreezes: newActiveFreezes,
    freezesBoughtThisWeek: newFreezesBoughtThisWeek,
    lastFreezePurchaseDate: Timestamp.fromDate(today)
  };
};

export const getLeaderboard = async (limitCount = 10) => {
  try {
    const statsRef = collection(db, "user_stats");
    const q = query(statsRef, orderBy("xp", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    })) as (UserStats & { userId: string })[];
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

export const logStudyActivity = async (userId: string, isNew: boolean = false) => {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];

  const activityRef = doc(db, "user_stats", userId, "activity", dateStr);

  try {
    await setDoc(
      activityRef,
      {
        count: increment(1),
        newCards: increment(isNew ? 1 : 0),
        reviewCards: increment(isNew ? 0 : 1),
        date: Timestamp.fromDate(today),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error logging study activity:", error);
  }
};

export const getStudyActivity = async (
  userId: string
): Promise<Record<string, { xp: number; duration: number; count: number; newCards: number; reviewCards: number }>> => {
  try {
    const activityRef = collection(db, "user_stats", userId, "activity");
    const q = query(activityRef, orderBy("date", "desc"), limit(365));

    const querySnapshot = await getDocs(q);
    const activityMap: Record<
      string,
      { xp: number; duration: number; count: number; newCards: number; reviewCards: number }
    > = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Doc ID is dateStr (YYYY-MM-DD)
      activityMap[doc.id] = {
        count: data.count || 0,
        newCards: data.newCards || 0,
        reviewCards: data.reviewCards || 0,
        xp: data.xp || data.count * 10 || 0, // Fallback for demo
        duration: data.duration || data.count * 5 || 0, // Fallback for demo
      };
    });

    return activityMap;
  } catch (error) {
    console.error("Error fetching study activity:", error);
    return {};
  }
};
