import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw, PartyPopper } from "lucide-react";
import { cn, shuffleArray } from "@/lib/utils";
import confetti from "canvas-confetti";
import type { Card } from "@/types";

interface SentenceScrambleProps {
  card: Card;
  onSuccess?: () => void;
}

interface WordItem {
  id: string;
  text: string;
  originalIndex: number;
}

export function SentenceScramble({ card, onSuccess }: SentenceScrambleProps) {
  const [shuffledWords, setShuffledWords] = useState<WordItem[]>([]);
  const [userAnswer, setUserAnswer] = useState<WordItem[]>([]);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">(
    "idle",
  );
  const { example } = card;

  // Initialize and shuffle words when example changes
  useEffect(() => {
    if (!example) return;

    // Remove punctuation for easier scrambling/checking, or keep it?
    // Let's keep punctuation attached to words for now for simplicity,
    // or we can clean it. The prompt says "Tách câu thành mảng các từ".
    // A simple space split is usually good enough for a basic MVP.
    const words = example.split(" ").map((word, index) => ({
      id: `${index}-${word}-${Math.random()}`,
      text: word,
      originalIndex: index,
    }));

    const shuffled = shuffleArray(words);

    setShuffledWords(shuffled);
    setUserAnswer([]);
    setStatus("idle");
  }, [example]);

  const handleWordClick = (word: WordItem, fromSource: boolean) => {
    if (status === "correct") return;

    if (fromSource) {
      // Move from source to answer
      setShuffledWords((prev) => prev.filter((w) => w.id !== word.id));
      setUserAnswer((prev) => [...prev, word]);
    } else {
      // Move from answer back to source
      setUserAnswer((prev) => prev.filter((w) => w.id !== word.id));
      setShuffledWords((prev) => [...prev, word]);
    }
    setStatus("idle");
  };

  const handleCheck = () => {
    // Reconstruct sentence
    const currentSentence = userAnswer.map((w) => w.text).join(" ");

    // Strict comparison? Or permissive?
    // Let's go with exact string match for now.
    if (currentSentence === example) {
      setStatus("correct");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      if (onSuccess) onSuccess();
    } else {
      setStatus("incorrect");
    }
  };

  const handleReset = () => {
    // Return all words to source and re-shuffle? Or just reset positions?
    // Let's just reset everything back to initial shuffled state?
    // Actually, better to just put everything back in source but maybe keep current shuffle order or simple append.
    // To be safe, let's regenerate everything from scratch to "reset" effectively.
    if (!example) return;

    const words = example.split(" ").map((word, index) => ({
      id: `${index}-${word}-${Math.random()}`,
      text: word,
      originalIndex: index,
    }));

    const shuffled = shuffleArray(words);

    setShuffledWords(shuffled);
    setUserAnswer([]);
    setStatus("idle");
  };

  if (!example) {
    return (
      <div className="text-center p-4">
        No example sentence available for this card.
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl p-6 md:p-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-2xl shadow-xl flex flex-col items-center gap-6 md:gap-8 relative overflow-hidden">
      {/* Background Gradient Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-muted-foreground flex items-center justify-center gap-2">
          <PartyPopper className="w-5 h-5 text-indigo-500" />
          Sentence Scramble
        </h3>
        <p className="text-sm text-muted-foreground">
          Arrange the words to form the correct sentence.
        </p>
      </div>

      {/* Answer Area */}
      <div
        className={cn(
          "w-full min-h-[120px] p-6 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-wrap gap-3 items-center justify-center cursor-pointer",
          status === "idle"
            ? "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:border-indigo-400 dark:hover:border-indigo-500/50"
            : "",
          status === "correct"
            ? "border-green-500 bg-green-50/20 dark:bg-green-900/10"
            : "",
          status === "incorrect"
            ? "border-red-400 bg-red-50/20 dark:bg-red-900/10"
            : "",
        )}
      >
        {userAnswer.length === 0 && (
          <span className="text-slate-400 italic pointer-events-none select-none">
            Click words below to build sentence
          </span>
        )}
        {userAnswer.map((word) => (
          <Button
            key={word.id}
            variant="secondary"
            className="animate-in zoom-in-50 duration-200"
            onClick={() => handleWordClick(word, false)}
            disabled={status === "correct"}
          >
            {word.text}
          </Button>
        ))}
      </div>

      {status === "correct" && (
        <div className="text-green-600 font-bold text-lg animate-in fade-in slide-in-from-bottom-2">
          Correct! well done!
        </div>
      )}

      {status === "incorrect" && (
        <div className="text-red-500 font-bold animate-in fade-in slide-in-from-bottom-2">
          Incorrect order. Try again or reset.
        </div>
      )}

      {/* Source Area (Shuffled Words) */}
      <div className="flex flex-wrap gap-3 justify-center min-h-[80px]">
        {shuffledWords.map((word) => (
          <Button
            key={word.id}
            variant="outline"
            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-300 shadow-sm border-slate-200 dark:border-slate-700 animate-in fade-in duration-300 text-base md:text-lg px-3 py-1.5 md:px-4 md:py-2 h-auto"
            onClick={() => handleWordClick(word, true)}
            disabled={status === "correct"}
          >
            {word.text}
          </Button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-4">
        <Button
          variant="ghost"
          onClick={handleReset}
          disabled={status === "correct"}
          className="text-slate-500 hover:text-slate-700"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>

        {userAnswer.length > 0 && status !== "correct" && (
          <Button
            size="lg"
            onClick={handleCheck}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
          >
            <Check className="w-4 h-4 mr-2" />
            Check Answer
          </Button>
        )}

        {status === "correct" && (
          <Button size="lg" variant="outline" onClick={onSuccess}>
            Next Card
          </Button>
        )}
      </div>
    </div>
  );
}
