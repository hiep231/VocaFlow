import { useState } from "react";
import type { Card as CardType } from "@/types";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Volume2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface VocabularyListProps {
  cards: CardType[];
}

export function VocabularyList({ cards }: VocabularyListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Simple search filter
  const filteredCards = cards.filter(
    (card) =>
      card.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search vocabulary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 h-11 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl transition-all"
          />
        </div>
        <div className="h-11 bg-indigo-600 dark:bg-indigo-500 px-4 rounded-xl font-medium text-white shadow-sm flex items-center whitespace-nowrap">
          Total: {filteredCards.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.length > 0 ? (
          filteredCards.map((card) => (
            <VocabItem key={card.id || card.term} card={card} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No words found
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Try adjusting your search term
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function VocabItem({ card }: { card: CardType }) {
  const { speak } = useTextToSpeech({ text: card.term });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all p-4 flex flex-col gap-2 relative group h-full">
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
          {card.term}
        </h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => speak()}
          className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 -mt-1 -mr-1 shrink-0"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>

      {card.ipa && (
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700 w-fit">
          {card.ipa}
        </span>
      )}

      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
        {card.definition}
      </p>

      {card.collocation && (
        <div className="mt-2 bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-500/10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Collocation</span>
          </div>
          <p className="text-xs text-indigo-900 dark:text-indigo-200 italic leading-relaxed">
            "{card.collocation}"
          </p>
        </div>
      )}
    </div>
  );
}
