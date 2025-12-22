export const LEVEL_THRESHOLD = 100;

export function calculateLevel(xp: number): number {
  return Math.floor(xp / LEVEL_THRESHOLD) + 1;
}

export function getLevelProgress(xp: number): { current: number; next: number; percent: number } {
  const level = calculateLevel(xp);
  const currentLevelXP = (level - 1) * LEVEL_THRESHOLD;
  const xpInCurrentLevel = xp - currentLevelXP;
  const percent = (xpInCurrentLevel / LEVEL_THRESHOLD) * 100;

  return {
    current: xpInCurrentLevel,
    next: LEVEL_THRESHOLD,
    percent: Math.min(Math.max(percent, 0), 100),
  };
}
