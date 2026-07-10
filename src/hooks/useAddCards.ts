import { useState, useEffect } from "react";
import { parseVocabText } from "@/lib/vocab-parser";
import type { Card } from "@/types";
import {
  collection,
  writeBatch,
  doc,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export function useAddCards(deckId?: string) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("smart");

  const [text, setText] = useState("");
  const [parsedCards, setParsedCards] = useState<Partial<Card>[]>([]);

  useEffect(() => {
    const cards = parseVocabText(text);
    setParsedCards(cards);
  }, [text]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [manualCards, setManualCards] = useState<Partial<Card>[]>([
    { term: "", definition: "", ipa: "", collocation: "", example: "" },
  ]);

  useEffect(() => {
    if (activeTab === "manual" && parsedCards.length > 0) {
      setManualCards(() => {
        return parsedCards;
      });
    }
  }, [activeTab, parsedCards]);

  const updateParsedCardType = (
    index: number,
    type: "vocab" | "grammar" | "sentence"
  ) => {
    const newCards = [...parsedCards];
    newCards[index] = { ...newCards[index], type };
    setParsedCards(newCards);
  };

  const addManualRow = () => {
    setManualCards([
      ...manualCards,
      { term: "", definition: "", ipa: "", collocation: "", example: "" },
    ]);
  };

  const removeManualRow = (index: number) => {
    if (manualCards.length > 1) {
      const newCards = [...manualCards];
      newCards.splice(index, 1);
      setManualCards(newCards);
    }
  };

  const updateManualCard = (
    index: number,
    field: keyof Card,
    value: string
  ) => {
    setManualCards((prev) => {
      const newCards = [...prev];
      newCards[index] = { ...newCards[index], [field]: value };
      return newCards;
    });
  };

  const handleSave = async () => {
    if (!currentUser || !deckId) {
      toast.error("You must be logged in to save cards.");
      return;
    }

    if (isSubmitting) return;

    let cardsToSave: Partial<Card>[] = [];

    if (activeTab === "smart") {
      if (parsedCards.length === 0) {
        toast.info("No parsed cards to save. Try previewing first.");
        return;
      }
      cardsToSave = parsedCards;
    } else {
      // Filter out empty rows for manual import
      cardsToSave = manualCards.filter((c) => c.term && c.definition);
      if (cardsToSave.length === 0) {
        toast.info("Please fill in at least a term and definition.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const batch = writeBatch(db);
      const cardsCollectionRef = collection(db, "cards");

      cardsToSave.forEach((card) => {
        const newCardRef = doc(cardsCollectionRef);
        batch.set(newCardRef, {
          term: card.term || "",
          definition: card.definition || "",
          ipa: card.ipa || null,
          collocation: card.collocation || null,
          example: card.example || null,
          clozeHint: card.clozeHint || null,
          type: card.type || "vocab",
          userId: currentUser.uid,
          deckId: deckId,
          level: 0,
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
          nextReview: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      });

      await batch.commit();

      // Update deck's cardCount
      const deckRef = doc(db, "decks", deckId);
      await updateDoc(deckRef, {
        cardCount: increment(cardsToSave.length),
        updatedAt: serverTimestamp(),
      });

      toast.success(`Successfully added ${cardsToSave.length} cards!`);

      // Invalidate queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["deck", deckId] }),
        queryClient.invalidateQueries({ queryKey: ["deckCards", deckId] }),
      ]);

      navigate(`/decks/${deckId}`);
    } catch (error) {
      console.error("Error saving cards:", error);
      toast.error("Failed to save cards. Please try again.");
      setIsSubmitting(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    text,
    setText,
    parsedCards,
    setParsedCards,
    manualCards,
    setManualCards,
    isSubmitting,
    updateParsedCardType,
    addManualRow,
    removeManualRow,
    updateManualCard,
    handleSave,
  };
}
