import type { Card } from "@/types";

export function calculateDeckMastery(deckId: string, cards: Card[]): number {
  if (!cards || cards.length === 0) return 0;
  const deckCards = cards.filter(c => c.deckId === deckId);
  if (deckCards.length === 0) return 0;

  const totalMastery = deckCards.reduce((acc, card) => {
    const interval = card.interval || 0;
    let mastery = 0;
    
    if (interval >= 10) mastery = 100;
    else if (interval >= 7) mastery = 70;
    else if (interval >= 3) mastery = 30;
    else if (interval >= 1) mastery = 10;
    
    return acc + mastery;
  }, 0);

  return Math.round(totalMastery / deckCards.length);
}
