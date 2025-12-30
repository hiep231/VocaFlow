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
    return example.replace(regex, "______");
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
    <div className="w-full max-w-md p-6 bg-card border rounded-xl shadow-md text-center">
      <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
        Fill in the blank
      </h3>

      <p className="text-xl mb-6 font-medium leading-relaxed">
        {maskedExample.split("______").map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && (
              <span className="inline-block px-1 font-bold text-primary border-b-2 border-dashed border-primary">
                ______
              </span>
            )}
          </span>
        ))}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setStatus("idle");
          }}
          placeholder="Type the missing word..."
          className={cn(
            "text-center text-lg h-12",
            status === "correct" && "border-green-500 bg-green-50/10",
            status === "incorrect" && "border-red-500 bg-red-50/10"
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
