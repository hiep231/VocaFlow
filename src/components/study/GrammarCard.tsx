import { useState, useEffect, useMemo } from "react";
import type { Card } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, RefreshCw, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

interface GrammarCardProps {
  card: Card;
  onSuccess?: () => void;
}

interface Word {
  id: string; // unique id for framer-motion layoutId
  text: string;
}

export function GrammarCard({ card, onSuccess }: GrammarCardProps) {
  // Use example if available (better for grammar context), otherwise term
  const targetSentence = useMemo(() => {
    // Prefer example, fallback to term. Clean up punctuation loosely if needed.
    const raw = card.example || card.term;
    return raw.trim();
  }, [card]);

  const [availableWords, setAvailableWords] = useState<Word[]>([]);
  const [selectedWords, setSelectedWords] = useState<Word[]>([]);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">(
    "idle"
  );

  // Initialize game
  useEffect(() => {
    resetGame();
  }, [targetSentence]);

  const resetGame = () => {
    // Split sentence into words, keeping punctuation attached for simplicity or stripping it?
    // User requirement: "shuffle words". Let's split by space.
    const words = targetSentence.split(/\s+/).map((text, i) => ({
      id: `word-${i}-${Math.random().toString(36).substr(2, 9)}`,
      text,
    }));

    // Shuffle
    const shuffled = [...words].sort(() => Math.random() - 0.5);

    setAvailableWords(shuffled);
    setSelectedWords([]);
    setStatus("idle");
  };

  const handleSelectWord = (word: Word) => {
    if (status === "correct") return;
    setAvailableWords((prev) => prev.filter((w) => w.id !== word.id));
    setSelectedWords((prev) => [...prev, word]);
    setStatus("idle"); // Clear error if any
  };

  const handleDeselectWord = (word: Word) => {
    if (status === "correct") return;
    setSelectedWords((prev) => prev.filter((w) => w.id !== word.id));
    setAvailableWords((prev) => [...prev, word]);
    setStatus("idle");
  };

  const checkAnswer = () => {
    const currentSentence = selectedWords.map((w) => w.text).join(" ");

    // Normalize for comparison (ignore case, extra spaces)
    const normalizedCurrent = currentSentence.toLowerCase().trim();
    const normalizedTarget = targetSentence.toLowerCase().trim();

    if (normalizedCurrent === normalizedTarget) {
      setStatus("correct");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#8b5cf6", "#d946ef"],
      });
      // Optionally delay success callback or let user click "Next"
      // If parent handles navigation immediately, user won't see the explanation.
      // So we'll probably want a "Next" button or call onSuccess after delay?
      // User request says "Feedback: Đúng: Hiện màu xanh, hiển thị phần grammarNotes".
      // So don't auto-navigate immediately.
    } else {
      setStatus("incorrect");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto p-4">
      {/* Header / Term Hint */}
      <div className="text-center mb-4">
        <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-1">
          Grammar Challenge
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Assemble the sentence correctly to unlock the structure.
        </p>
      </div>

      {/* Answer Zone */}
      <div
        className={cn(
          "w-full min-h-[120px] p-6 rounded-3xl border-2 transition-all duration-300 flex flex-wrap gap-2 items-start content-start relative",
          status === "idle"
            ? "border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"
            : status === "correct"
            ? "border-solid border-green-500 bg-green-50 dark:bg-green-900/10"
            : "border-solid border-red-400 bg-red-50 dark:bg-red-900/10 animate-shake"
        )}
      >
        {selectedWords.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none">
            <span className="opacity-50">
              Tap words below to build the sentence
            </span>
          </div>
        )}

        <AnimatePresence>
          {selectedWords.map((word) => (
            <motion.div
              layoutId={word.id}
              key={word.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Button
                variant="default"
                size="sm"
                onClick={() => handleDeselectWord(word)}
                className={cn(
                  "rounded-xl shadow-sm text-sm h-9 px-4 font-medium transition-colors",
                  status === "correct"
                    ? "bg-green-600 hover:bg-green-600 text-white"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-red-100 dark:hover:bg-red-900/30 border border-slate-200 dark:border-slate-700"
                )}
              >
                {word.text}
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Word Bank */}
      <div className="w-full">
        <div className="flex flex-wrap justify-center gap-3 min-h-[100px]">
          <AnimatePresence>
            {availableWords.map((word) => (
              <motion.div
                layoutId={word.id}
                key={word.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectWord(word)}
                  className="rounded-xl border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 h-10 px-4 text-base shadow-sm"
                >
                  {word.text}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Feedback / Controls */}
      <div className="w-full max-w-md mt-4 space-y-4">
        {status === "idle" && (
          <Button
            className="w-full h-12 text-lg rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 shadow-lg"
            onClick={checkAnswer}
            disabled={selectedWords.length === 0}
          >
            Check Answer
          </Button>
        )}

        {status === "incorrect" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-500" />
              <p className="text-red-700 dark:text-red-300 font-medium">
                Not quite right. Try again!
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={resetGame}
              className="text-red-500 hover:text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </motion.div>
        )}

        {status === "correct" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Success Banner */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-3">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h4 className="text-2xl font-black text-green-700 dark:text-green-400 mb-1">
                Correct!
              </h4>
              <p className="text-green-600 dark:text-green-300/80">
                You nailed it.
              </p>
            </div>

            {/* Grammar Note / Explanation */}
            {(card.grammarNotes || card.structure) && (
              <div className="bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>

                {card.structure && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                      Structure
                    </p>
                    <p className="font-mono text-lg font-bold text-slate-800 dark:text-indigo-200">
                      {card.structure}
                    </p>
                  </div>
                )}

                {card.grammarNotes && (
                  <div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                      Notes
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {card.grammarNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Continue Button */}
            <Button
              className="w-full h-14 text-lg rounded-2xl bg-green-600 hover:bg-green-700 shadow-green-500/30 shadow-xl animate-in fade-in slide-in-from-bottom-4"
              onClick={onSuccess}
            >
              Continue <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
