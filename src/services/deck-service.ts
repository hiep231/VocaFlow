import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  getDoc,
  addDoc,
  serverTimestamp,
  increment,
  updateDoc,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Deck, Card } from "@/types";

export const deckService = {
  // Fetch all public decks
  async getPublicDecks(): Promise<Deck[]> {
    try {
      const q = query(collection(db, "decks"), where("isPublic", "==", true));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Deck)
      );
    } catch (error) {
      console.error("Error fetching public decks:", error);
      throw error;
    }
  },

  // Create a snapshot of cards in the deck document for fast preview/cloning
  async syncDeckSnapshot(deckId: string) {
    try {
      // Fetch all cards
      const q = query(collection(db, "cards"), where("deckId", "==", deckId));
      const snapshot = await getDocs(q);
      const cards = snapshot.docs.map((doc) => {
        const data = doc.data();
        // Return only data, we don't need IDs as they will be generated on clone
        // We can strip SRS fields to save space
        const {
          userId,
          deckId,
          nextReview,
          reps,
          interval,
          easeFactor,
          createdAt,
          ...rest
        } = data;
        return rest as Card;
      });

      const deckRef = doc(db, "decks", deckId);
      await updateDoc(deckRef, {
        cardsSnapshot: cards,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error syncing deck snapshot:", error);
      throw error;
    }
  },

  // Clone a deck
  async cloneDeck(
    originalDeckId: string,
    currentUserId: string
  ): Promise<string> {
    try {
      // 1. Fetch original Deck data
      const deckRef = doc(db, "decks", originalDeckId);
      const deckSnap = await getDoc(deckRef);

      if (!deckSnap.exists()) {
        throw new Error("Deck not found");
      }

      const originalDeckData = deckSnap.data() as Deck;

      // 2. Create NEW Deck document
      const newDeckRef = await addDoc(collection(db, "decks"), {
        title: originalDeckData.title,
        description: originalDeckData.description || "",
        userId: currentUserId,
        cardCount: originalDeckData.cardCount,
        isPublic: false, // Default to private
        createdAt: serverTimestamp(),
        authorName: originalDeckData.authorName,
      });

      let cardsToClone: Card[] = [];

      // 3. CHECK SNAPSHOT FIRST
      if (
        originalDeckData.cardsSnapshot &&
        originalDeckData.cardsSnapshot.length > 0
      ) {
        cardsToClone = originalDeckData.cardsSnapshot;
      } else {
        // Fallback: Fetch from collection
        const cardsQuery = query(
          collection(db, "cards"),
          where("deckId", "==", originalDeckId)
        );
        const cardsSnap = await getDocs(cardsQuery);
        cardsToClone = cardsSnap.docs.map((doc) => doc.data() as Card);
      }

      // 4. Batch Write to copy cards
      const BATCH_SIZE = 500;
      let batch = writeBatch(db);
      let operationCount = 0;

      for (const cardData of cardsToClone) {
        const newCardRef = doc(collection(db, "cards"));

        // 5. RESET SRS stats
        const { id, ...restData } = cardData; // Remove ID if present

        const newCardData = {
          ...restData,
          userId: currentUserId,
          deckId: newDeckRef.id,
          // Reset SRS fields
          reps: 0,
          interval: 0,
          easeFactor: 2.5,
          nextReview: serverTimestamp(),
          createdAt: serverTimestamp(),
        };

        batch.set(newCardRef, newCardData);
        operationCount++;

        if (operationCount >= BATCH_SIZE) {
          await batch.commit();
          batch = writeBatch(db);
          operationCount = 0;
        }
      }

      if (operationCount > 0) {
        await batch.commit();
      }

      // 6. Increment downloads on original deck
      await updateDoc(deckRef, {
        downloads: increment(1),
      });

      return newDeckRef.id;
    } catch (error) {
      console.error("Error cloning deck:", error);
      throw error;
    }
  },

  // Get a single deck
  async getDeck(deckId: string): Promise<Deck | null> {
    try {
      const deckRef = doc(db, "decks", deckId);
      const deckSnap = await getDoc(deckRef);
      if (deckSnap.exists()) {
        return { id: deckSnap.id, ...deckSnap.data() } as Deck;
      }
      return null;
    } catch (error) {
      console.error("Error fetching deck:", error);
      throw error;
    }
  },

  // Get all cards for a deck (for owner)
  async getDeckCards(deckId: string, userId: string): Promise<Card[]> {
    try {
      const q = query(
        collection(db, "cards"),
        where("deckId", "==", deckId),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Card)
      );
    } catch (error) {
      console.error("Error fetching deck cards:", error);
      throw error;
    }
  },

  // Get preview cards for a deck
  async getPreviewCards(deckId: string, limitCount = 20): Promise<Card[]> {
    try {
      const q = query(
        collection(db, "cards"),
        where("deckId", "==", deckId),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Card)
      );
    } catch (error) {
      console.error("Error fetching preview cards:", error);
      return [];
    }
  },
};
