import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ScheduleWord {
  term: string;
  definition: string;
  ipa: string;
  collocation: string;
  example: string;
  dayIndex: number; // which day this word unlocks (0 = today, 1 = tomorrow, ...)
}

export interface Schedule {
  id?: string;
  userId: string;
  deckId: string;
  deckTitle: string;
  wordsPerDay: number;
  totalWords: number;
  processedCount: number;
  status: "active" | "completed";
  createdAt?: any;
  words: ScheduleWord[];
}

/**
 * Parses raw text in VocaFlow format into ScheduleWord objects.
 * Format per line: Term | Definition | IPA | Collocation | Example
 */
export function parseVocabularyText(
  rawText: string,
  wordsPerDay: number
): ScheduleWord[] {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return lines.map((line, index) => {
    const parts = line.split("|").map((p) => p.trim());
    return {
      term: parts[0] || "",
      definition: parts[1] || "",
      ipa: parts[2] || "",
      collocation: parts[3] || "",
      example: parts[4] || "",
      dayIndex: Math.floor(index / wordsPerDay),
    };
  }).filter((w) => w.term !== "");
}

export const scheduleService = {
  /**
   * Create a new drip-feed schedule.
   */
  async createSchedule(
    userId: string,
    deckId: string,
    deckTitle: string,
    wordsPerDay: number,
    rawText: string
  ): Promise<string> {
    const words = parseVocabularyText(rawText, wordsPerDay);

    if (words.length === 0) {
      throw new Error("No valid vocabulary found in the text.");
    }

    const scheduleDoc = await addDoc(collection(db, "schedules"), {
      userId,
      deckId,
      deckTitle,
      wordsPerDay,
      totalWords: words.length,
      processedCount: 0,
      status: "active",
      createdAt: serverTimestamp(),
      words,
    });

    return scheduleDoc.id;
  },

  /**
   * Get all active schedules for a user.
   */
  async getActiveSchedules(userId: string): Promise<Schedule[]> {
    const q = query(
      collection(db, "schedules"),
      where("userId", "==", userId),
      where("status", "==", "active")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Schedule)
    );
  },

  /**
   * Get all schedules (active + completed) for a user.
   */
  async getAllSchedules(userId: string): Promise<Schedule[]> {
    const q = query(
      collection(db, "schedules"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Schedule)
    );
  },

  /**
   * Cancel / delete a schedule.
   */
  async cancelSchedule(scheduleId: string): Promise<void> {
    const ref = doc(db, "schedules", scheduleId);
    await updateDoc(ref, { status: "completed" });
  },
};
