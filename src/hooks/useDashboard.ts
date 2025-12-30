import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  writeBatch,
  doc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Deck, UserStats, Card } from "@/types";
import { getStudyActivity, checkAndResetStreak } from "@/services/user-stats";

interface DeckWithStats extends Deck {
  learnedCount: number;
}

export function useDashboard() {
  const { currentUser, logout } = useAuth();
  const [decks, setDecks] = useState<DeckWithStats[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [cardsDue, setCardsDue] = useState(0);
  const [loading, setLoading] = useState(true);

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activityData, setActivityData] = useState<
    Record<string, { xp: number; duration: number; count: number }>
  >({});

  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDecksAndStats = async () => {
    if (!currentUser) return;
    try {
      // 1. Fetch Decks
      const decksQ = query(
        collection(db, "decks"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const decksSnap = await getDocs(decksQ);
      const decksData: Deck[] = [];
      decksSnap.forEach((doc) => {
        decksData.push({ id: doc.id, ...doc.data() } as Deck);
      });

      // 2. Fetch Cards for Stats
      const cardsQ = query(
        collection(db, "cards"),
        where("userId", "==", currentUser.uid)
      );
      const cardsSnap = await getDocs(cardsQ);

      const deckCounts: Record<string, number> = {};
      const deckLearnedCounts: Record<string, number> = {};
      let dueCount = 0;
      const now = new Date();

      const allCardsData: any[] = []; // Explicitly Card[] but let's just push objects

      cardsSnap.forEach((doc) => {
        const data = doc.data();
        allCardsData.push({ id: doc.id, ...data });

        const level = data.level || 0;
        const deckId = data.deckId;
        const nextReview =
          data.nextReview instanceof Timestamp
            ? data.nextReview.toDate()
            : new Date(data.nextReview);

        if (nextReview <= now) {
          dueCount++;
        }

        // Deck Count Aggregation
        if (deckId) {
          deckCounts[deckId] = (deckCounts[deckId] || 0) + 1;
          if (level > 0) {
            deckLearnedCounts[deckId] = (deckLearnedCounts[deckId] || 0) + 1;
          }
        }
      });

      setCardsDue(dueCount);
      setAllCards(allCardsData as any[]); // Cast to Card[]

      // 3. User Stats & Activity (Parallel)
      // Use checkAndResetStreak to ensure if user missed days, it shows 0 immediately
      const statsPromise = checkAndResetStreak(currentUser.uid)
        .then((stats) => {
          if (stats) setUserStats(stats);
        })
        .catch((err) => console.error("Failed to fetch user stats:", err));

      const activityPromise = getStudyActivity(currentUser.uid)
        .then((activity) => setActivityData(activity))
        .catch((err) => console.error("Failed to fetch activity data:", err));

      // 5. Combine Deck Data & Self-healing sync
      const decksWithCounts = decksData.map((d) => ({
        ...d,
        cardCount: deckCounts[d.id || ""] || 0,
        learnedCount: deckLearnedCounts[d.id || ""] || 0,
      }));

      // SYNC: Check if deck.cardCount in DB matches actual card count. If not, update it.
      const batch = writeBatch(db);
      let batchCount = 0;

      decksWithCounts.forEach((d) => {
        if (d.id && d.cardCount !== (d as any).originalCardCount) {
          // Wait, we need the original count from 'decksData' to compare.
          // decksData already has 'cardCount'. We can just compare d.cardCount (calculated) vs original.
          // But 'd' here is the merged object.
        }
      });

      // Let's iterate decksData directly
      decksData.forEach((d) => {
        const calculatedCount = deckCounts[d.id || ""] || 0;
        if (d.id && d.cardCount !== calculatedCount) {
          console.log(
            `Syncing card count for deck ${d.title}: ${d.cardCount} -> ${calculatedCount}`
          );
          const deckRef = doc(db, "decks", d.id);
          batch.update(deckRef, { cardCount: calculatedCount });
          batchCount++;
        }
      });

      if (batchCount > 0) {
        await batch.commit();
        console.log(`Synced ${batchCount} decks with incorrect card counts.`);
      }

      setDecks(decksWithCounts);

      await Promise.all([statsPromise, activityPromise]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteDeck = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser || !deckToDelete) return;

    try {
      setIsDeleting(true);
      const batch = writeBatch(db);
      const deckId = deckToDelete.id;

      const cardsQ = query(
        collection(db, "cards"),
        where("deckId", "==", deckId),
        where("userId", "==", currentUser.uid)
      );
      const cardsSnap = await getDocs(cardsQ);
      cardsSnap.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const deckRef = doc(db, "decks", deckId!);
      batch.delete(deckRef);

      await batch.commit();

      setDecks((prev) => prev.filter((d) => d.id !== deckId));
      fetchDecksAndStats();
    } catch (error) {
      console.error("Error deleting deck:", error);
    } finally {
      setIsDeleting(false);
      setDeckToDelete(null);
    }
  };

  useEffect(() => {
    fetchDecksAndStats();
  }, [currentUser]);

  return {
    currentUser,
    logout,
    decks,
    cardsDue,
    loading,
    userStats,
    activityData,
    deckToDelete,
    isDeleting,
    setDeckToDelete,
    confirmDeleteDeck,
    fetchDecksAndStats,
    allCards,
  };
}
