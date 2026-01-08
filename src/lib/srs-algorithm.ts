export type ReviewRating = "fail" | "hard" | "good";

export interface ReviewResult {
  nextReview: Date;
  newLevel: number;
}

export function calculateNextReview(
  currentLevel: number,
  rating: ReviewRating
): ReviewResult {
  const now = new Date();

  if (rating === "fail") {
    // Fail: Reset to Level 0, review in 15 minutes
    const nextReview = new Date(now.getTime() + 15 * 60 * 1000);
    return { nextReview, newLevel: 0 };
  }

  if (rating === "hard") {
    // Hard: No level increase, review in 1 day (or stay at 15m if level 0)
    // If level is 0, keep it 15m to be safe, otherwise 24h
    const intervalMs =
      currentLevel === 0 ? 15 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const nextReview = new Date(now.getTime() + intervalMs);
    return { nextReview, newLevel: currentLevel };
  }

  // Good: Increase level
  // Cycle:
  // Level 0 -> 15m (Already handled by "Fail" or initial state, strictly speaking L0 is "New")
  // Transitioning FROM Level X -> Y:
  // L0 -> L1: 1 day
  // L1 -> L2: 3 days
  // L2 -> L3: 7 days
  // L3 -> L4: 30 days
  // L4+ -> L5+: 30 days (max cap for now or explicit increments)

  const newLevel = currentLevel + 1;
  let intervalDays = 1;

  if (newLevel === 1) {
    // Just learned (L0 -> L1) -> 1 day
    intervalDays = 1;
  } else if (newLevel === 2) {
    // L1 -> L2 -> 3 days
    intervalDays = 3;
  } else if (newLevel === 3) {
    // L2 -> L3 -> 7 days
    intervalDays = 7;
  } else if (newLevel === 4) {
    // L3 -> L4 -> 14 days (Smoothing the gap)
    intervalDays = 14;
  } else if (newLevel === 5) {
    // L4 -> L5 -> 30 days
    intervalDays = 30;
  } else if (newLevel === 6) {
    // L5 -> L6 -> 90 days (3 months)
    intervalDays = 90;
  } else if (newLevel === 7) {
    // L6 -> L7 -> 180 days (6 months)
    intervalDays = 180;
  } else {
    // L7+ -> 365 days (1 year) - Mastered
    intervalDays = 365;
  }

  const nextReview = new Date(
    now.getTime() + intervalDays * 24 * 60 * 60 * 1000
  );

  return { nextReview, newLevel };
}
