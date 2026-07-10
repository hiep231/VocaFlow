import {
  collection,
  query,
  getDocs,
  doc,
  writeBatch,
  addDoc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Deck, Card } from "@/types";

export interface StarterDeck extends Deck {
  cards: Omit<Card, "id" | "userId" | "deckId" | "createdAt" | "updatedAt" | "nextReview" | "reps" | "interval" | "easeFactor" | "level">[];
}

const STARTER_DECKS: StarterDeck[] = [
  {
    id: "template_1",
    title: "Essential English Verbs",
    description: "Master the 20 most common verbs used in daily English conversations.",
    userId: "system",
    isPublic: true,
    cardCount: 5,
    authorName: "VocaFlow Team",
    cards: [
      { term: "Initiate", definition: "To cause or start the beginning of something.", ipa: "/ɪˈnɪʃieɪt/", example: "They plan to initiate a new project.", collocation: "initiate a project", clozeHint: "start/begin" },
      { term: "Accomplish", definition: "To succeed in doing or completing something.", ipa: "/əˈkɑːmplɪʃ/", example: "We didn't accomplish much today.", collocation: "accomplish a task", clozeHint: "achieve" },
      { term: "Collaborate", definition: "To work together with somebody in order to produce or achieve something.", ipa: "/kəˈlæbəreɪt/", example: "Researchers are collaborating to develop a vaccine.", collocation: "collaborate with someone", clozeHint: "work together" },
      { term: "Evaluate", definition: "To form an idea of the amount, number, or value of something.", ipa: "/ɪˈvæljueɪt/", example: "We need to evaluate the success of the campaign.", collocation: "evaluate a situation", clozeHint: "assess" },
      { term: "Implement", definition: "To put a plan or system into operation.", ipa: "/ˈɪmplɪment/", example: "The changes will be implemented next year.", collocation: "implement a policy", clozeHint: "put into effect" }
    ]
  },
  {
    id: "template_2",
    title: "Daily Conversation Basics",
    description: "Common phrases and words to help you survive in an English-speaking environment.",
    userId: "system",
    isPublic: true,
    cardCount: 4,
    authorName: "VocaFlow Team",
    cards: [
      { term: "Absolutely", definition: "Used to emphasize that you agree with someone.", ipa: "/ˈæbsəluːtli/", example: "Are you sure? Absolutely!", collocation: "absolutely sure", clozeHint: "completely" },
      { term: "Fascinating", definition: "Extremely interesting.", ipa: "/ˈfæsɪneɪtɪŋ/", example: "That's a fascinating story.", collocation: "fascinating subject", clozeHint: "very interesting" },
      { term: "Regardless", definition: "Paying no attention to what has been said or done.", ipa: "/rɪˈɡɑːrdləs/", example: "We will proceed regardless of the weather.", collocation: "regardless of", clozeHint: "anyway" },
      { term: "Ultimately", definition: "In the end; finally.", ipa: "/ˈʌltɪmətli/", example: "Ultimately, you'll have to make the decision yourself.", collocation: "ultimately responsible", clozeHint: "finally" }
    ]
  }
];

export const templateService = {
  async seedStarterDecks(): Promise<void> {
    try {
      const batch = writeBatch(db);
      for (const starterDeck of STARTER_DECKS) {
        const docRef = doc(db, "templates", starterDeck.id!);
        batch.set(docRef, starterDeck);
      }
      await batch.commit();
      console.log("Starter decks seeded successfully.");
    } catch (error) {
      console.error("Error seeding starter decks:", error);
      throw error;
    }
  },

  async getStarterDecks(): Promise<StarterDeck[]> {
    try {
      const q = query(collection(db, "templates"));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Auto-seed if templates collection is empty
        await this.seedStarterDecks();
        return STARTER_DECKS;
      }

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StarterDeck));
    } catch (error) {
      console.error("Error fetching starter decks:", error);
      return [];
    }
  },

  async claimStarterDeck(templateId: string, currentUserId: string): Promise<string> {
    try {
      // 1. Fetch template data
      const templateRef = doc(db, "templates", templateId);
      const templateSnap = await getDoc(templateRef);
      
      if (!templateSnap.exists()) {
        throw new Error("Template not found");
      }
      
      const templateData = templateSnap.data() as StarterDeck;

      // 2. Create NEW Deck document for the user
      const newDeckRef = await addDoc(collection(db, "decks"), {
        title: templateData.title,
        description: templateData.description || "",
        userId: currentUserId,
        cardCount: templateData.cards?.length || 0,
        isPublic: false,
        createdAt: serverTimestamp(),
        authorName: templateData.authorName,
      });

      // 3. Batch Write to copy cards to user's cards collection
      const cardsToClone = templateData.cards || [];
      const BATCH_SIZE = 500;
      let batch = writeBatch(db);
      let operationCount = 0;

      for (const cardData of cardsToClone) {
        const newCardRef = doc(collection(db, "cards"));
        
        const newCardData = {
          ...cardData,
          userId: currentUserId,
          deckId: newDeckRef.id,
          level: 0,
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

      return newDeckRef.id;
    } catch (error) {
      console.error("Error claiming starter deck:", error);
      throw error;
    }
  }
};
