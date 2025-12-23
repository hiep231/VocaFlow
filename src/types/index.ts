export type CardType = "vocab" | "grammar" | "sentence";

export interface Card {
  id?: string;
  type?: CardType; // Default to 'vocab' if missing
  term: string;
  definition: string;
  ipa?: string;
  collocation?: string;
  example?: string;

  // Grammar fields
  structure?: string; // e.g., 'S + V + O'
  grammarNotes?: string;

  // Shadowing fields
  audioUrl?: string;
  breakdown?: string[]; // Array of chunks for breakdown practice

  userId: string;
  deckId: string;
  nextReview?: any; // Timestamp or Date
  level: number;
  createdAt?: any;
}

export interface Deck {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  cardCount: number;
  isPublic?: boolean;
  authorName?: string;
  downloads?: number;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastStudyDate: any; // Timestamp
  displayName?: string;
  photoURL?: string;
}
