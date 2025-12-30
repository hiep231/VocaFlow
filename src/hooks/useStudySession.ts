import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Card } from "@/types";
import { calculateNextReview, type ReviewRating } from "@/lib/srs-algorithm";
import {
  updateUserStreak,
  addXP,
  logStudyActivity,
} from "@/services/user-stats";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type StudyMode = "flashcard" | "practice" | "grammar" | "shadowing";

export function useStudySession(deckId?: string, options?: { cram?: boolean }) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localQueueUpdates, setLocalQueueUpdates] = useState<Card[]>([]);

  // Fetch due cards
  const { data: initialStudyQueue = [], isLoading: loading } = useQuery({
    queryKey: ["studyCards", currentUser?.uid, deckId, options?.cram],
    queryFn: async () => {
      if (!currentUser) return [];

      const constraints = [where("userId", "==", currentUser.uid)];

      // Only filter by date if NOT in cram mode
      if (!options?.cram) {
        const now = new Date();
        constraints.push(where("nextReview", "<=", Timestamp.fromDate(now)));
      }

      if (deckId) {
        constraints.push(where("deckId", "==", deckId));
      }

      const q = query(collection(db, "cards"), ...constraints);
      const querySnapshot = await getDocs(q);

      const cardsData: Card[] = [];
      querySnapshot.forEach((doc) => {
        cardsData.push({ id: doc.id, ...doc.data() } as Card);
      });

      return cardsData;
    },
    enabled: !!currentUser,
    staleTime: 1000 * 60 * 2, // 2 minutes stale time ensures fresh cards if re-entering quickly but caches for session stability
  });

  // Merge server data with local re-queue operations
  const studyQueue = useMemo(() => {
    // If we have local updates (failed cards inserted), use that as the source of truth merged with initial
    if (localQueueUpdates.length > 0) return localQueueUpdates;
    return initialStudyQueue;
  }, [initialStudyQueue, localQueueUpdates]);

  // Initialize local queue when data first loads
  useMemo(() => {
    if (
      initialStudyQueue.length > 0 &&
      localQueueUpdates.length === 0 &&
      currentIndex === 0
    ) {
      // This logic is tricky with React Query because data updates.
      // We only want to init once.
      // Actually, let's just use initialStudyQueue as base and copy to state if we modify it.
    }
  }, [initialStudyQueue]);

  const currentCard = studyQueue[currentIndex];

  const handleRate = useCallback(
    async (rating: ReviewRating) => {
      if (!currentCard || !currentCard.id || isProcessing || !currentUser)
        return;

      // OPTIMISTIC UPDATE: Immediate UI transition
      setIsProcessing(true);
      setCurrentIndex((prev) => prev + 1);

      // Re-queue card if rating is "fail"
      if (rating === "fail") {
        setLocalQueueUpdates((prevQueue) => {
          const baseQueue =
            prevQueue.length > 0 ? prevQueue : initialStudyQueue;
          const newQueue = [...baseQueue];

          // Insert 3 steps ahead, or at the end if queue is short
          const insertionIndex = Math.min(
            currentIndex + 1 + 3,
            newQueue.length
          );

          newQueue.splice(insertionIndex, 0, currentCard);
          return newQueue;
        });
      }

      // Allow a small delay for animation before allowing next interaction
      setTimeout(() => setIsProcessing(false), 300);

      // Background Processing (Fire and Forget)
      const processUpdates = async () => {
        try {
          const { nextReview, newLevel } = calculateNextReview(
            currentCard.level,
            rating
          );

          // 1. Critical: Update Card SRS
          const cardRef = doc(db, "cards", currentCard.id!);
          await updateDoc(cardRef, {
            nextReview: Timestamp.fromDate(nextReview),
            level: newLevel,
          });

          // Invalidate queries so dashboard and future sessions get fresh data
          // We don't invalidate immediately to prevent UI jumps, but maybe on unmount or after delay
          // For now, let's rely on staleness, but if we want dashboard to be right:
          queryClient.invalidateQueries({ queryKey: ["allCards"] });
          queryClient.invalidateQueries({ queryKey: ["decks"] });

          // 2. Secondary: Update Stats (Non-blocking)
          if (rating === "good" || rating === "hard") {
            const userProfile = {
              displayName: currentUser.displayName || undefined,
              photoURL: currentUser.photoURL || undefined,
            };

            // Run in parallel
            Promise.all([
              updateUserStreak(currentUser.uid, userProfile).catch((err) =>
                console.error("Streak sync error:", err)
              ),
              addXP(
                currentUser.uid,
                rating === "good" ? 10 : 5,
                userProfile
              ).catch((err) => console.error("XP sync error:", err)),
              logStudyActivity(currentUser.uid).catch((err) =>
                console.error("Activity sync error:", err)
              ),
            ]);

            // Invalidate user stats/activity
            queryClient.invalidateQueries({ queryKey: ["userStats"] });
            queryClient.invalidateQueries({ queryKey: ["userActivity"] });
          }
        } catch (error) {
          console.error("Background update failed:", error);
        }
      };

      processUpdates();
    },
    [
      currentCard,
      isProcessing,
      currentUser,
      currentIndex,
      initialStudyQueue,
      queryClient,
    ]
  );

  const practiceType = useMemo(() => {
    if (!currentCard) return "speaking";

    if (currentCard.type === "grammar") return "grammar";
    if (currentCard.type === "sentence") return "shadowing";

    const hasExample = !!currentCard.example;
    const rand = Math.random();

    if (!hasExample) return "speaking";

    if (rand < 0.33) return "speaking";
    if (rand < 0.66) return "cloze";
    return "scramble";
  }, [currentCard]);

  return {
    studyQueue,
    currentCard,
    currentIndex,
    loading,
    isProcessing,
    practiceType,
    handleRate,
  };
}
