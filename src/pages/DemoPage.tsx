import { StudyContent } from "@/components/study/session/StudyContent";
import { Button } from "@/components/ui/button";
import type { StudyMode } from "@/hooks/useStudySession";
import type { ReviewRating } from "@/lib/srs-algorithm";
import type { Card } from "@/types";
import confetti from "canvas-confetti";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DEMO_CARDS: Card[] = [
  {
    id: "demo-1",
    deckId: "demo-deck-1",
    term: "Epiphany",
    definition: "A moment of sudden revelation or insight.",
    example: "He had an epiphany that changed his entire perspective on life.",
    nextReview: null,
    level: 0,
    type: "vocab",
    userId: "demo",
  },
  {
    id: "demo-2",
    deckId: "demo-deck-1",
    term: "Serendipity",
    definition:
      "The occurrence of events by chance in a happy or beneficial way.",
    example: "Finding my favorite book at the sale was pure serendipity.",
    nextReview: null,
    level: 0,
    type: "vocab",
    userId: "demo",
  },
  {
    id: "demo-3",
    deckId: "demo-deck-1",
    term: "Resilience",
    definition: "The capacity to recover quickly from difficulties; toughness.",
    example: "Her resilience in the face of adversity is inspiring.",
    nextReview: null,
    level: 0,
    type: "vocab",
    userId: "demo",
  },
  {
    id: "demo-4",
    deckId: "demo-deck-1",
    term: "I have been waiting for you.",
    definition: "Tôi đã đợi bạn.",
    example: "I have been waiting for you since morning.",
    grammarNotes:
      "Present Perfect Continuous: Describes an action that started in the past and continues to the present.",
    structure: "S + have/has + been + V-ing",
    nextReview: null,
    level: 0,
    type: "grammar",
    userId: "demo",
  },
];

export default function DemoPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<StudyMode>("flashcard");
  const [isFinished, setIsFinished] = useState(false);

  // Cycle through modes for demo variety
  // 1. Flashcard -> 2. Speaking/Cloze -> 3. Flashcard...
  // For simplicity, just use flashcard unless it's a grammar card
  const currentCard = DEMO_CARDS[currentIndex];

  // Logic to determine mode based on card type for demo purposes
  const effectiveMode =
    mode !== "flashcard"
      ? mode
      : currentCard.type === "grammar"
      ? "grammar"
      : "flashcard";

  const handleRate = (_rating: ReviewRating) => {
    // Demo effect: just move to next card
    if (currentIndex < DEMO_CARDS.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setMode("flashcard"); // Reset mode
      }, 300);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
      });
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 blur-xl opacity-30 animate-pulse"></div>
            <Sparkles className="w-24 h-24 text-indigo-500 mx-auto relative z-10" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Demo Complete!
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              You've experienced how VocaFlow makes learning effortless. Ready
              to create your own decks?
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="w-full sm:w-auto h-14 text-lg rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20"
              onClick={() => navigate("/login")}
            >
              Get Started for Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-14 text-lg rounded-2xl"
              onClick={() => {
                setIsFinished(false);
                setCurrentIndex(0);
              }}
            >
              Replay Demo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Demo Header */}
      <header className="h-16 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white leading-tight">
              Demo Session
            </span>
            <span className="text-xs text-indigo-500 font-medium tracking-wide uppercase">
              {currentIndex + 1} / {DEMO_CARDS.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate("/login")}
            className="hidden sm:inline-flex bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6"
          >
            Sign Up
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
          {currentCard && (
            <StudyContent
              key={currentCard.id} // Remount on card change
              currentCard={currentCard}
              mode={effectiveMode}
              practiceType="speaking" // Default for demo
              onRate={handleRate}
              onSetMode={(newMode) => setMode(newMode)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
