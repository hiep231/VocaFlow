import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Card } from "@/types";

interface ClozeCardProps {
  card: Card;
  onSuccess?: () => void;
}

export function ClozeCard({ card, onSuccess }: ClozeCardProps) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">(
    "idle"
  );
  const { term, example } = card;

  // Remove generic part of speech or notes in parens, e.g. "Whole (N)" -> "Whole"
  const cleanTerm = useMemo(() => {
    return term.replace(/\s*\(.*?\)/g, "").trim();
  }, [term]);

  // Reset state when card changes
  useEffect(() => {
    setInput("");
    setStatus("idle");
  }, [card.id, term]);

  // Create masked sentence: replace term with underscores
  const maskedExample = useMemo(() => {
    if (!cleanTerm || !example) return "";
    // Escape special characters and trim whitespace
    const escapedTerm = cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedTerm, "gi");
    return example.replace(regex, "{{BLANK}}");
  }, [cleanTerm, example]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().toLowerCase() === cleanTerm.toLowerCase()) {
      setStatus("correct");
      if (onSuccess) onSuccess();
    } else {
      setStatus("incorrect");
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md text-center">
      <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
        Fill in the blank
      </h3>

      <p className="text-xl mb-4 font-medium leading-relaxed text-slate-800 dark:text-slate-100">
        {maskedExample.split("{{BLANK}}").map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && (
              <span className="inline-block px-1 mx-1 font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-dashed border-indigo-500">
                {cleanTerm.charAt(0)}
                <span className="opacity-50">
                  {"_".repeat(Math.max(3, cleanTerm.length - 1))}
                </span>
              </span>
            )}
          </span>
        ))}
      </p>

      {(card.clozeHint || card.definition) && (
        <div className="mb-6 inline-block p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl text-sm text-slate-600 dark:text-slate-300 border border-indigo-100 dark:border-indigo-800/30">
          <span className="font-semibold text-indigo-500 dark:text-indigo-400 mr-2">Hint:</span>
          {card.clozeHint || card.definition}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setStatus("idle");
          }}
          placeholder="Type the missing word..."
          className={cn(
            "text-center text-lg h-12 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800",
            status === "correct" && "border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-500/20",
            status === "incorrect" && "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-500/20"
          )}
          autoFocus
        />

        {status === "idle" && (
          <Button type="submit" size="lg">
            Check Answer
          </Button>
        )}

        {status === "correct" && (
          <div className="flex items-center justify-center text-green-600 font-bold gap-2 animate-in fade-in slide-in-from-bottom-2">
            <Check className="w-6 h-6" />
            Correct! Well done.
          </div>
        )}

        {status === "incorrect" && (
          <div className="flex items-center justify-center text-red-600 font-bold gap-2 animate-in fade-in slide-in-from-bottom-2">
            <X className="w-6 h-6" />
            Incorrect. Try again!
          </div>
        )}
      </form>
    </div>
  );
}
