import { useState, useEffect, useMemo, useCallback } from "react";
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

export type StudyMode = "flashcard" | "practice" | "grammar" | "shadowing";

export function useStudySession(deckId?: string, options?: { cram?: boolean }) {
  const { currentUser } = useAuth();
  const [studyQueue, setStudyQueue] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch due cards
  useEffect(() => {
    async function fetchDueCards() {
      if (!currentUser) return;
      try {
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

        // If cramming, maybe shuffle the cards? For now just fetch them.
        setStudyQueue(cardsData);
      } catch (error) {
        console.error("Error fetching study cards:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDueCards();
  }, [currentUser, deckId, options?.cram]);

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
        setStudyQueue((prevQueue) => {
          const newQueue = [...prevQueue];
          // We don't remove the card from its current position here because currentIndex increments.
          // Instead, we just add a copy of it ahead.

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
          }
        } catch (error) {
          console.error("Background update failed:", error);
          // In a real app, we might want to queue this or show a toast
        }
      };

      processUpdates();
    },
    [currentCard, isProcessing, currentUser]
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
