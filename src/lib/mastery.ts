import type { Card } from "@/types";

export function calculateDeckMastery(deckId: string, cards: Card[]): number {
  if (!cards || cards.length === 0) return 0;
  const deckCards = cards.filter(c => c.deckId === deckId);
  if (deckCards.length === 0) return 0;

  // Mastered threshold: interval > 10 days
  const masteredCards = deckCards.filter(c => (c.interval || 0) > 10);
  return Math.round((masteredCards.length / deckCards.length) * 100);
}
