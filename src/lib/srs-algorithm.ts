import { FSMState, FSMAction, transitionCardState } from "@/lib/fsm";

export type ReviewRating = "fail" | "hard" | "good";

export interface ReviewResult {
  nextReview: Date;
  newLevel: number;
}

export interface SM2Result {
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: Date;
  newLevel: number;
  newFsmState: FSMState;
}

export function getMidnightLocalTime(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

export function calculateSM2(
  quality: number,
  interval: number,
  repetitions: number,
  easeFactor: number,
  currentLevel: number,
  currentFsmState?: FSMState
): SM2Result {
  // 1. Infer state if missing (Backwards compatibility)
  let fsmState: FSMState = currentFsmState || "NEW";
  if (!currentFsmState && repetitions > 0) {
    if (interval > 21) {
      fsmState = "MASTERED";
    } else {
      fsmState = "REVIEWING";
    }
  }

  // 2. Map quality to FSM Action
  let action: FSMAction = "RATE_GOOD";
  if (quality === 1) action = "RATE_FAIL";
  if (quality === 3) action = "RATE_HARD";
  if (quality >= 4) action = "RATE_GOOD";

  // 3. Determine next FSM State
  const nextFsmState = transitionCardState(fsmState, action, interval);

  // 4. Calculate SM-2 as base
  let nextInterval = interval;
  let nextRepetitions = repetitions;
  let nextEaseFactor = easeFactor;

  // quality: 0-5. Typical SM-2 mapping: Fail: 1, Hard: 3, Good: 4
  if (quality >= 3) {
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * easeFactor);
    }
    nextRepetitions = repetitions + 1;
  } else {
    nextRepetitions = 0;
    nextInterval = 1;
  }

  // Update ease factor
  nextEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (nextEaseFactor < 1.3) {
    nextEaseFactor = 1.3;
  }

  // 5. Override SM-2 based on FSM State
  if (nextFsmState === "LAPSED") {
    nextInterval = 1; // Reset interval
    // Ease factor is typically penalized but SM-2 base calculation above already did it.
  } else if (nextFsmState === "LEARNING") {
    nextInterval = 1; // Short interval for learning
  } else if (nextFsmState === "NEW") {
    nextInterval = 0; // Immediate review
    nextRepetitions = 0;
  } else if (nextFsmState === "MASTERED") {
    if (nextInterval < 30) nextInterval = 30; // Enforce minimum long interval
  }

  const now = new Date();
  const nextReviewDate = new Date(now.getTime() + nextInterval * 24 * 60 * 60 * 1000);
  
  // Set to midnight local time to ensure reviews trigger correctly the next day
  const midnightNextReview = getMidnightLocalTime(nextReviewDate);

  // Keep newLevel logic as fallback for backwards compatibility
  let newLevel = currentLevel;
  if (quality >= 4) {
    newLevel = currentLevel + 1;
  } else if (quality <= 2) {
    newLevel = 0;
  }

  return {
    interval: nextInterval,
    repetitions: nextRepetitions,
    easeFactor: nextEaseFactor,
    nextReview: midnightNextReview,
    newLevel,
    newFsmState: nextFsmState
  };
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
