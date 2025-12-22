import { Button } from "@/components/ui/button";
import { Calendar, Pencil, Trash2, Volume2, Sparkles } from "lucide-react";
import type { Card } from "@/types";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface CardItemProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
}

export function CardItem({ card, onEdit, onDelete }: CardItemProps) {
  const { speak } = useTextToSpeech({ text: card.term });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all p-4 flex flex-col gap-2 relative group h-full">
      {/* Header: Term & Speaker */}
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight break-words">
          {card.term}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            speak();
          }}
          className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 -mt-1 -mr-1 shrink-0"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>

      {/* IPA & Level */}
      <div className="flex items-center gap-2 flex-wrap mb-1">
        {card.ipa && (
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">
            {card.ipa}
          </span>
        )}
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            card.level === 0
              ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              : card.level <= 2
              ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40"
              : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/40"
          }`}
        >
          LVL {card.level}
        </span>
      </div>

      {/* Definition */}
      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
        {card.definition}
      </p>

      {/* Collocation (New) */}
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

      <div className="flex-1" />

      {/* Footer: Date & Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
          <Calendar className="w-3 h-3" />
          <span>
            {card.nextReview instanceof Object && "toDate" in card.nextReview
              ? card.nextReview.toDate().toLocaleDateString()
              : "Pending"}
          </span>
        </div>

        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              if (card.id) onDelete(card.id);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
