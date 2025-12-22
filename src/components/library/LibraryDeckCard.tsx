import { BookOpen, User, Download } from "lucide-react";
import type { Deck } from "@/types";

interface LibraryDeckCardProps {
  deck: Deck;
  onClick: (deck: Deck) => void;
}

export function LibraryDeckCard({ deck, onClick }: LibraryDeckCardProps) {
  console.log("🚀 ~ LibraryDeckCard ~ deck:", deck);
  return (
    <div onClick={() => onClick(deck)} className="group h-full cursor-pointer">
      <div className="h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all relative overflow-hidden flex flex-col">
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          {/* Could handle 'isPublic' badge here, but it's redundant in Library */}
        </div>

        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-500 transition-colors">
          {deck.title}
        </h3>

        <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow min-h-[40px]">
          {deck.description || "No description provided."}
        </p>

        <div className="relative z-10 pt-4 mt-auto border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-[100px]">
                {deck.authorName || "Unknown"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                {deck.cardCount} cards
              </span>
              <span className="flex items-center gap-1" title="Downloads">
                <Download className="w-3.5 h-3.5" />
                {deck.downloads || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
