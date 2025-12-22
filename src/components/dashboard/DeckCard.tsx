import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Trash2, BookOpen } from "lucide-react";
import type { Deck } from "@/types";

interface DeckWithStats extends Deck {
  learnedCount: number;
}

interface DeckCardProps {
  deck: DeckWithStats;
  onDeleteClick: (deck: Deck) => void;
}

export function DeckCard({ deck, onDeleteClick }: DeckCardProps) {
  const progress =
    deck.cardCount > 0
      ? Math.round((deck.learnedCount / deck.cardCount) * 100)
      : 0;

  return (
    <div className="relative group h-full">
      <Link to={`/decks/${deck.id}`} className="block h-full">
        <div className="h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            {/* Options or Badge could go here */}
          </div>

          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-500 transition-colors">
            {deck.title}
          </h3>
          <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">
            {deck.description || "No description provided."}
          </p>

          <div className="relative z-10">
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
              <span>Progress</span>
              <span>
                {deck.learnedCount} / {deck.cardCount} cards
              </span>
            </div>
            <ProgressBar
              value={progress}
              max={100}
              className="h-2.5 bg-slate-100 dark:bg-slate-800"
              barClassName="bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
        </div>
      </Link>

      {/* Delete Button - Positioned absolutely over the card but outside the Link */}
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDeleteClick(deck);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
