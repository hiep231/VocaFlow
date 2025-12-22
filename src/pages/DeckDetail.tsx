import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Deck, Card } from "@/types";

import { EditCardModal } from "@/components/deck/EditCardModal";
import { EditDeckDialog } from "@/components/deck/EditDeckDialog";
import { DeleteDeckDialog } from "@/components/deck/DeleteDeckDialog";
import { DeckHeader } from "@/components/deck/DeckHeader";
import { CardGrid } from "@/components/deck/CardGrid";
import { DeleteCardDialog } from "@/components/deck/DeleteCardDialog";

export default function DeckDetail() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isEditCardOpen, setIsEditCardOpen] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [isDeletingCard, setIsDeletingCard] = useState(false);

  const [isEditDeckOpen, setIsEditDeckOpen] = useState(false);
  const [isDeleteDeckOpen, setIsDeleteDeckOpen] = useState(false);
  const [isDeletingDeck, setIsDeletingDeck] = useState(false);

  const fetchData = async () => {
    if (!deckId) return;
    try {
      const deckRef = doc(db, "decks", deckId);
      const deckSnap = await getDoc(deckRef);
      if (deckSnap.exists()) {
        setDeck({ id: deckSnap.id, ...deckSnap.data() } as Deck);
      } else {
        toast.error("Deck not found");
        navigate("/dashboard");
      }

      if (currentUser) {
        const cardsQ = query(
          collection(db, "cards"),
          where("deckId", "==", deckId),
          where("userId", "==", currentUser.uid)
        );
        const cardsSnap = await getDocs(cardsQ);
        const cardsData: Card[] = [];
        cardsSnap.forEach((doc) => {
          cardsData.push({ id: doc.id, ...doc.data() } as Card);
        });
        setCards(cardsData);
      }
    } catch (error) {
      console.error("Error fetching deck details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [deckId, currentUser]);

  const handleDeleteCard = async () => {
    if (!deletingCardId) return;
    try {
      setIsDeletingCard(true);
      await deleteDoc(doc(db, "cards", deletingCardId));
      toast.success("Card deleted.");
      fetchData();
    } catch (err) {
      console.error("Error deleting card:", err);
      toast.error("Failed to delete card.");
    } finally {
      setIsDeletingCard(false);
      setDeletingCardId(null);
    }
  };

  const handleDeleteDeck = async () => {
    if (!deckId || !currentUser || !deck) return;
    try {
      setIsDeletingDeck(true);
      const batch = writeBatch(db);

      const cardsQ = query(
        collection(db, "cards"),
        where("deckId", "==", deckId),
        where("userId", "==", currentUser.uid)
      );
      const cardsSnap = await getDocs(cardsQ);
      cardsSnap.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const deckRef = doc(db, "decks", deckId);
      batch.delete(deckRef);

      await batch.commit();

      toast.success("Deck deleted.");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error deleting deck:", err);
      toast.error("Failed to delete deck.");
      toast.error("Failed to delete deck.");
      setIsDeletingDeck(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!deck) {
    return <div className="p-8 text-white">Deck not found.</div>;
  }

  return (
    <div className="min-w-full min-h-screen p-8 relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans selection:bg-purple-500/30">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[60%] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-normal animate-pulse-slow" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[60%] bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-normal animate-pulse-slow delay-1000" />

      <div className="max-w-7xl mx-auto relative z-10">
        <DeckHeader
          deck={deck}
          cardsCount={cards.length}
          onEditDeck={() => setIsEditDeckOpen(true)}
          onDeleteDeck={() => setIsDeleteDeckOpen(true)}
        />

        <CardGrid
          cards={cards}
          onEditCard={(card) => {
            setEditingCard(card);
            setIsEditCardOpen(true);
          }}
          onDeleteCard={(cardId) => setDeletingCardId(cardId)}
        />

        <EditCardModal
          card={editingCard}
          isOpen={isEditCardOpen}
          onClose={() => setIsEditCardOpen(false)}
          onSuccess={fetchData}
        />

        <EditDeckDialog
          deck={deck}
          isOpen={isEditDeckOpen}
          onClose={() => setIsEditDeckOpen(false)}
          onSuccess={fetchData}
        />

        <DeleteCardDialog
          isOpen={!!deletingCardId}
          onOpenChange={(open) => !open && setDeletingCardId(null)}
          onConfirm={handleDeleteCard}
          isDeleting={isDeletingCard}
        />

        <DeleteDeckDialog
          deckToDelete={isDeleteDeckOpen ? deck : null}
          isDeleting={isDeletingDeck}
          onOpenChange={(open) => setIsDeleteDeckOpen(open)}
          onConfirm={handleDeleteDeck}
        />
      </div>
    </div>
  );
}
