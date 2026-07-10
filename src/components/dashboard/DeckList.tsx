import { CreateDeckDialog } from "@/components/deck/CreateDeckDialog";
import { DeckCard } from "./DeckCard";
import { StarterDecks } from "./StarterDecks";
import { Zap } from "lucide-react";
import type { Deck } from "@/types";

interface DeckWithStats extends Deck {
  learnedCount: number;
}

interface DeckListProps {
  decks: DeckWithStats[];
  loading: boolean;
  onDeleteClick: (deck: Deck) => void;
  onDeckCreated: () => void;
}

export function DeckList({
  decks,
  loading,
  onDeleteClick,
  onDeckCreated,
}: DeckListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <>
        <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            No decks yet
          </h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Create your first deck to start learning.
          </p>
          <CreateDeckDialog onDeckCreated={onDeckCreated} />
        </div>

        <StarterDecks onClaimed={onDeckCreated} />
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} onDeleteClick={onDeleteClick} />
      ))}
    </div>
  );
}
