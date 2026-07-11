export const CURRENT_APP_VERSION = "1.4.1";

export interface ReleaseEntry {
  version: string;
  date: string;
  title: string;
  features?: string[];
  bugfixes?: string[];
  improvements?: string[];
}

export const CHANGELOG: ReleaseEntry[] = [
  {
    version: "1.4.1",
    date: "2026-07-12",
    title: "Mascot Polish & Bug Fixes",
    features: [
      "In-app Changelog — Easily view new updates right from the dashboard"
    ],
    bugfixes: [
      "Fixed Daily Study Limits tracking issue (TypeScript index error)",
      "Removed fake checkerboard background from mascot images for clean transparency",
      "Fixed Dark Mode text contrast in Changelog modal"
    ]
  },
  {
    version: "1.4.0",
    date: "2026-07-11",
    title: "Gamification & Visual Overhaul",
    features: [
      "Seed & Plant Visual Progression — Watch your decks grow from a seed into a thriving plant as you earn XP and maintain your streak, or wither if neglected",
      "Tinder-Style Swiping — A fun, interactive swipe effect in Review Mode",
      "Keyboard Shortcuts System — Navigate and study faster with hotkeys",
      "Deck Mastery Visualization — Track your progress visually",
      "Neo-Brutalism Rank Badges — A fresh, playful retro sticker aesthetic for your user rank",
    ],
    improvements: [
      "Major UI/UX improvements across the dashboard and study screens",
    ],
  },
  {
    version: "1.3.0",
    date: "2026-07-10",
    title: "Smarter Learning Engine",
    features: [
      "SuperMemo-2 (SM-2) algorithm for adaptive card scheduling — intervals now grow dynamically based on your performance",
      "Daily Study Limits — set a cap on new and review cards per day to prevent SRS fatigue",
      "Streak Freeze — protect your streak for one missed day using a consumable freeze",
    ],
    improvements: [
      "Next review dates now snap to midnight local time for consistent daily scheduling",
      "Study session now separates 'New' cards from 'Due' cards and respects your daily allowance even after a page refresh",
      "Settings dialog added to the Dashboard header — easily adjust your daily card limits",
    ],
    bugfixes: [
      "Fixed streak not persisting across timezone boundaries",
    ],
  },
  {
    version: "1.2.0",
    date: "2026-06-15",
    title: "Practice Modes & Shadowing",
    features: [
      "Cloze (fill-in-the-blank) and Scramble practice modes",
      "Shadowing mode for sentence cards with audio playback",
      "Grammar card type with structural breakdown",
    ],
    improvements: [
      "Flashcard flip animation smoothed with spring physics",
      "Sound effects for correct and incorrect answers",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-05-01",
    title: "Public Library & Leaderboard",
    features: [
      "Browse and clone community decks from the Public Library",
      "Global XP-based Leaderboard",
      "Drip-feeding — schedule cards to unlock over time",
    ],
  },
];
