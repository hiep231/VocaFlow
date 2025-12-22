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

export const updateUserStreak = async (userId: string) => {
  const statsRef = doc(db, "user_stats", userId);
  const statsSnap = await getDoc(statsRef);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!statsSnap.exists()) {
    const initialStats: UserStats = {
      streak: 1,
      lastStudyDate: Timestamp.fromDate(now),
      xp: 0,
      level: 1,
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
    return newStreak;
  } else if (diffDays === 1) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  await updateDoc(statsRef, {
    streak: newStreak,
    lastStudyDate: Timestamp.fromDate(now),
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

export const addXP = async (userId: string, amount: number) => {
  const statsRef = doc(db, "user_stats", userId);
  const statsSnap = await getDoc(statsRef);

  if (!statsSnap.exists()) {
    const level = calculateLevel(amount);
    const initialStats: UserStats = {
      streak: 0,
      lastStudyDate: Timestamp.fromDate(new Date()),
      xp: amount,
      level: level,
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
  });
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
