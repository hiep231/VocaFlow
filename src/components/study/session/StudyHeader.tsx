import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface StudyHeaderProps {
  deckId?: string;
  currentIndex: number;
  totalCards: number;
}

export function StudyHeader({
  deckId,
  currentIndex,
  totalCards,
}: StudyHeaderProps) {
  return (
    <div className="w-full max-w-5xl mx-auto z-10 flex justify-between items-center mb-8">
      <Link to={deckId ? `/decks/${deckId}` : "/dashboard"}>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {deckId ? "Back to Deck" : "Dashboard"}
        </Button>
      </Link>
      <div className="text-sm font-semibold text-slate-200 bg-slate-900/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-sm">
        Card{" "}
        <span className="text-purple-300 font-bold">{currentIndex + 1}</span> /{" "}
        {totalCards}
      </div>
    </div>
  );
}
