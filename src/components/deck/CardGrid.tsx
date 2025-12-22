import { Layers } from "lucide-react";
import { CardItem } from "./CardItem";
import type { Card } from "@/types";

interface CardGridProps {
  cards: Card[];
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
}

export function CardGrid({ cards, onEditCard, onDeleteCard }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="col-span-full py-16 text-center text-slate-500 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-3xl">
        <div className="flex flex-col items-center gap-2">
          <Layers className="w-12 h-12 opacity-20" />
          <p>No cards in this deck yet.</p>
          <p className="text-sm">Use "Import Cards" to add new vocabulary.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onEdit={onEditCard}
          onDelete={onDeleteCard}
        />
      ))}
    </div>
  );
}
