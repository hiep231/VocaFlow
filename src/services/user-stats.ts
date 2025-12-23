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
      ...profileUpdate,
    };
    await setDoc(statsRef, initialStats, { merge: true });
    return;
  }

  const data = statsSnap.data() as UserStats;
  const newXP = (data.xp || 0) + amount;
  const newLevel = calculateLevel(newXP);

  await updateDoc(statsRef, {
    xp: newXP,
    level: newLevel,
    ...profileUpdate,
  });
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

export const logStudyActivity = async (userId: string) => {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];

  const activityRef = doc(db, "user_stats", userId, "activity", dateStr);

  try {
    await setDoc(
      activityRef,
      {
        count: increment(1),
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
): Promise<Record<string, { xp: number; duration: number; count: number }>> => {
  try {
    const activityRef = collection(db, "user_stats", userId, "activity");
    const q = query(activityRef, orderBy("date", "desc"), limit(365));

    const querySnapshot = await getDocs(q);
    const activityMap: Record<
      string,
      { xp: number; duration: number; count: number }
    > = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Doc ID is dateStr (YYYY-MM-DD)
      activityMap[doc.id] = {
        count: data.count || 0,
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
