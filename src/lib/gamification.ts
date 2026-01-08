export const BASE_XP_PER_LEVEL = 100;

/**
 * Calculates user level based on total XP using an arithmetic progression sequence.
 * Formula: Total XP required for level L = 50 * L * (L - 1)
 * Inverse: L = (1 + sqrt(1 + 8 * XP / 100)) / 2
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) return 1;
  // Using the inverse sum of arithmetic series formula: n/2 * (2a + (n-1)d)
  // With a=100, d=100: Sum = n/2 * (200 + (n-1)100) = n/2 * (100n + 100) = 50n(n+1)
  // Let Level = n + 1 (since level 1 starts at 0 XP)
  // XP_for_Level_L = 50 * (L-1) * L
  // Solving for L: 50L^2 - 50L - XP = 0
  // L = (50 + sqrt(2500 - 4(50)(-XP))) / 100
  // L = (50 + sqrt(2500 + 200XP)) / 100
  // L = 0.5 + sqrt(0.25 + XP/50)

  // Let's use the simpler derivation from planning:
  // L = (1 + sqrt(1 + 8 * (xp / 100))) / 2
  // Let's verify: XP=100 -> L=2. XP=300 -> L=3.

  const level = (1 + Math.sqrt(1 + (8 * xp) / BASE_XP_PER_LEVEL)) / 2;
  return Math.floor(level);
}

export function getLevelProgress(xp: number): {
  current: number;
  next: number;
  percent: number;
} {
  const level = calculateLevel(xp);

  // Total XP required to reach the current level
  // Formula: 50 * L * (L - 1)
  const currentLevelBaseXP = (BASE_XP_PER_LEVEL / 2) * level * (level - 1);

  // XP required to finish current level and reach next level
  // This series: L1->L2 = 100, L2->L3 = 200, ... Ln->Ln+1 = n * 100
  const xpNeededForNextLevel = level * BASE_XP_PER_LEVEL;

  const xpInCurrentLevel = xp - currentLevelBaseXP;
  const percent = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  return {
    current: xpInCurrentLevel,
    next: xpNeededForNextLevel,
    percent: Math.min(Math.max(percent, 0), 100),
  };
}
