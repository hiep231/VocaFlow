import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Trash2, BookOpen } from "lucide-react";
import type { Deck, Card } from "@/types";
import { DeckGrowthVisual } from "@/components/deck/DeckGrowthVisual";
import { calculateDeckMastery } from "@/lib/mastery";
import { useMemo } from "react";

interface DeckWithStats extends Deck {
  learnedCount: number;
}

interface DeckCardProps {
  deck: DeckWithStats;
  onDeleteClick: (deck: Deck) => void;
  allCards?: Card[];
}

export function DeckCard({
  deck,
  onDeleteClick,
  allCards = [],
}: DeckCardProps) {
  const progress =
    deck.cardCount > 0
      ? Math.round((deck.learnedCount / deck.cardCount) * 100)
      : 0;

  // Memoize mastery calculation strictly based on initial fetch / changes to allCards and deck ID
  const masteryPercentage = useMemo(
    () => calculateDeckMastery(deck.id!, allCards),
    [deck.id, allCards],
  );

  // Calculate days since the most recent study activity for this deck's cards
  const daysSinceLastStudy = useMemo(() => {
    const deckCards = allCards.filter((c) => c.deckId === deck.id);
    if (deckCards.length === 0) return 0;

    const now = Date.now();
    let mostRecentMs = 0;

    for (const card of deckCards) {
      // Approximate last study = nextReview minus interval (in days)
      if (card.nextReview && (card.interval || 0) > 0) {
        const nextMs =
          typeof card.nextReview.toMillis === "function"
            ? card.nextReview.toMillis()
            : new Date(card.nextReview).getTime();
        const lastStudyMs = nextMs - (card.interval || 0) * 86400000;
        if (lastStudyMs > mostRecentMs) mostRecentMs = lastStudyMs;
      }
    }

    if (mostRecentMs === 0) return 999; // Never studied
    return Math.floor((now - mostRecentMs) / 86400000);
  }, [deck.id, allCards]);

  return (
    <div className="relative group h-full">
      <Link to={`/decks/${deck.id}`} className="block h-full">
        <div className="h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <DeckGrowthVisual
                masteryPercentage={masteryPercentage}
                daysSinceLastStudy={daysSinceLastStudy}
              />
            </div>
            {/* Options or Badge could go here */}
          </div>

          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-500 transition-colors">
            {deck.title}
          </h3>
          <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px] flex-1">
            {deck.description || "No description provided."}
          </p>

          <div className="relative z-10 mt-auto">
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
