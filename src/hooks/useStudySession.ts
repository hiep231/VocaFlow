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
import { calculateSM2, type ReviewRating } from "@/lib/srs-algorithm";
import {
  updateUserStreak,
  addXP,
  logStudyActivity,
  getUserStats,
  getStudyActivity,
} from "@/services/user-stats";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { shuffleArray } from "@/lib/utils";

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

      // 1. Fetch Limits and Today's Activity
      const stats = await getUserStats(currentUser.uid);
      const activityMap = await getStudyActivity(currentUser.uid);
      const todayStr = new Date().toISOString().split("T")[0];
      const todayActivity = activityMap[todayStr] || { newCards: 0, reviewCards: 0 };

      // Ignore limits if cramming
      const maxNewCards = options?.cram ? Infinity : (stats?.maxNewCardsPerDay ?? 20);
      const maxReviewCards = options?.cram ? Infinity : (stats?.maxReviewCardsPerDay ?? 100);

      const remainingNew = Math.max(0, maxNewCards - (todayActivity.newCards || 0));
      const remainingReview = Math.max(0, maxReviewCards - (todayActivity.reviewCards || 0));

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

      const newBucket: Card[] = [];
      const reviewBucket: Card[] = [];
      const nowMs = Date.now();
      
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        // Client-side filtering for drip-feeding:
        // Exclude cards that have a future unlockAt timestamp.
        if (docData.unlockAt && typeof docData.unlockAt.toMillis === 'function') {
          if (docData.unlockAt.toMillis() > nowMs) {
            return; // Skip this card
          }
        }
        
        const card = { id: doc.id, ...docData } as Card;
        const isNew = card.repetitions === 0 || !card.repetitions;

        if (isNew) {
          if (newBucket.length < remainingNew) {
            newBucket.push(card);
          }
        } else {
          if (reviewBucket.length < remainingReview) {
            reviewBucket.push(card);
          }
        }
      });

      return shuffleArray([...newBucket, ...reviewBucket]);
    },
    enabled: !!currentUser,
    staleTime: 0, // Always consider stale to force fresh shuffle on new session remount
    refetchOnWindowFocus: false, // Prevent reshuffling during active session
    refetchOnMount: "always", // Ensure fresh cards every time study page is entered
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
            newQueue.length,
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
          // Map ReviewRating to SM-2 quality (Fail: 1, Hard: 3, Good: 4)
          const quality = rating === "fail" ? 1 : rating === "hard" ? 3 : 4;
          
          // Handle legacy cards missing these fields
          const currentInterval = currentCard.interval ?? 0;
          const currentRepetitions = currentCard.repetitions ?? 0;
          const currentEaseFactor = currentCard.easeFactor ?? 2.5;

          const sm2Result = calculateSM2(
            quality,
            currentInterval,
            currentRepetitions,
            currentEaseFactor,
            currentCard.level
          );

          // 1. Critical: Update Card SRS
          const cardRef = doc(db, "cards", currentCard.id!);
          await updateDoc(cardRef, {
            nextReview: Timestamp.fromDate(sm2Result.nextReview),
            level: sm2Result.newLevel,
            interval: sm2Result.interval,
            repetitions: sm2Result.repetitions,
            easeFactor: sm2Result.easeFactor,
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
                console.error("Streak sync error:", err),
              ),
              addXP(
                currentUser.uid,
                rating === "good" ? 10 : 5,
                userProfile,
              ).catch((err) => console.error("XP sync error:", err)),
              logStudyActivity(currentUser.uid, currentCard.repetitions === 0 || !currentCard.repetitions).catch((err) =>
                console.error("Activity sync error:", err),
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
    ],
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
