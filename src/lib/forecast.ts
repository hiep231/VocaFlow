import type { Card } from "@/types";

/**
 * Forecast result when there is enough velocity data to project a completion date.
 */
export interface ForecastWithData {
  hasData: true;
  deckComplete: false;
  averageCardsPerDay: number;
  remainingCards: number;
  totalCards: number;
  projectedDate: Date;
  remainingDays: number;
}

/**
 * Forecast result when all cards in the deck have already been learned.
 */
export interface ForecastDeckComplete {
  hasData: true;
  deckComplete: true;
  remainingCards: 0;
  totalCards: number;
}

/**
 * Forecast result when velocity is 0 (no recent study activity).
 */
export interface ForecastNoData {
  hasData: false;
  remainingCards: number;
  totalCards: number;
}

export type ForecastResult = ForecastWithData | ForecastDeckComplete | ForecastNoData;

/**
 * Activity history shape — matches the existing `activityData` from useDashboard.
 * Keys are date strings in YYYY-MM-DD format.
 */
type ActivityHistory = Record<
  string,
  { count: number; newCards: number; reviewCards: number; xp: number; duration: number }
>;

/**
 * Calculate a mastery completion forecast based on the user's 7-day learning velocity.
 *
 * @param deckCards  - All cards belonging to the target deck(s).
 * @param activityHistory - The user's study activity keyed by YYYY-MM-DD date strings.
 * @returns A discriminated union describing the forecast state.
 *
 * Mathematical safety: When the 7-day moving average is 0, we return
 * `{ hasData: false }` to prevent Infinity/NaN propagation.
 */
export function calculateCompletionForecast(
  deckCards: Card[],
  activityHistory: ActivityHistory
): ForecastResult {
  const totalCards = deckCards.length;

  if (totalCards === 0) {
    return { hasData: false, remainingCards: 0, totalCards: 0 };
  }

  // Count remaining unlearned cards (level === 0 means never successfully reviewed)
  const remainingCards = deckCards.filter((c) => (c.level ?? 0) === 0).length;

  // All cards have been learned at least once
  if (remainingCards === 0) {
    return { hasData: true, deckComplete: true, remainingCards: 0, totalCards };
  }

  // --- Step 1: Calculate 7-day moving average of new cards learned per day ---
  const today = new Date();
  let totalNewCardsLast7Days = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayActivity = activityHistory[dateStr];
    if (dayActivity) {
      totalNewCardsLast7Days += dayActivity.newCards || 0;
    }
  }

  const averageCardsPerDay = totalNewCardsLast7Days / 7;

  // --- Edge case: velocity is 0 → prevent Infinity/NaN ---
  if (averageCardsPerDay === 0) {
    return { hasData: false, remainingCards, totalCards };
  }

  // --- Step 3: Project completion date ---
  const remainingDays = Math.ceil(remainingCards / averageCardsPerDay);
  const projectedDate = new Date(today);
  projectedDate.setDate(projectedDate.getDate() + remainingDays);

  return {
    hasData: true,
    deckComplete: false,
    averageCardsPerDay: Math.round(averageCardsPerDay * 10) / 10, // 1 decimal
    remainingCards,
    totalCards,
    projectedDate,
    remainingDays,
  };
}
