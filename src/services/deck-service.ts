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
        // Don't copy downloads or authorName as this is a new copy owned by the current user
        authorName: originalDeckData.authorName, // Potentially keep original author credit in description or separate field if needed, but per request implies ownership transfer or copy
        // Actually the request says "The cloning user becomes the owner of the new copy only".
        // We probably don't want to carry over 'downloads' count to the new deck.
      });

      // 3. Fetch ALL Cards from the original Deck
      const cardsQuery = query(
        collection(db, "cards"),
        where("deckId", "==", originalDeckId)
      );
      const cardsSnap = await getDocs(cardsQuery);

      // 4. Batch Write to copy cards
      // FireStore batch limit is 500 operations. We need to handle chunks if > 500 cards.
      const BATCH_SIZE = 500;
      let batch = writeBatch(db);
      let operationCount = 0;

      for (const cardDoc of cardsSnap.docs) {
        const cardData = cardDoc.data() as Card;

        const newCardRef = doc(collection(db, "cards"));

        // 5. RESET SRS stats
        const newCardData = {
          ...cardData,
          userId: currentUserId,
          deckId: newDeckRef.id,
          // Reset SRS fields
          reps: 0,
          interval: 0,
          easeFactor: 2.5, // Standard default or whatever system uses
          nextReview: serverTimestamp(), // Available immediately
          createdAt: serverTimestamp(),
        };

        // Remove ID to let Firestore generate one (already done by doc(collection...))
        delete (newCardData as any).id;

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

  // Get preview cards for a deck
  async getPreviewCards(deckId: string, limitCount = 10): Promise<Card[]> {
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
