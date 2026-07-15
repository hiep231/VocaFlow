export type FSMState = "NEW" | "LEARNING" | "REVIEWING" | "MASTERED" | "LAPSED";
export type FSMAction = "RATE_FAIL" | "RATE_HARD" | "RATE_GOOD" | "RATE_EASY";

/**
 * Pure function to determine the next FSM state based on current state and rating.
 */
export function transitionCardState(
  currentState: FSMState,
  action: FSMAction,
  currentInterval: number = 0
): FSMState {
  switch (currentState) {
    case "NEW":
      if (action === "RATE_GOOD" || action === "RATE_EASY") return "LEARNING";
      if (action === "RATE_FAIL" || action === "RATE_HARD") return "NEW";
      break;

    case "LEARNING":
      if (action === "RATE_GOOD" || action === "RATE_EASY") return "REVIEWING";
      if (action === "RATE_FAIL") return "NEW";
      if (action === "RATE_HARD") return "LEARNING";
      break;

    case "REVIEWING":
      if (action === "RATE_FAIL") return "LAPSED";
      if (action === "RATE_GOOD" || action === "RATE_EASY") {
        // Condition for mastering a card
        if (currentInterval > 21) {
          return "MASTERED";
        }
        return "REVIEWING";
      }
      if (action === "RATE_HARD") return "REVIEWING";
      break;

    case "LAPSED":
      if (action === "RATE_GOOD" || action === "RATE_EASY") return "LEARNING";
      if (action === "RATE_FAIL" || action === "RATE_HARD") return "LAPSED";
      break;

    case "MASTERED":
      if (action === "RATE_FAIL") return "LAPSED";
      if (action === "RATE_HARD") return "REVIEWING";
      if (action === "RATE_GOOD" || action === "RATE_EASY") return "MASTERED";
      break;
  }

  // Fallback (should not reach here if all paths are covered)
  return currentState;
}
