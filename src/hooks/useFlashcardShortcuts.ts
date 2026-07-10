import { useEffect, useState, useRef } from "react";
import type { ReviewRating } from "@/lib/srs-algorithm";

interface UseFlashcardShortcutsProps {
  onFlip: () => void;
  onRate: (rating: ReviewRating) => void;
  isFlipped: boolean;
  isEnabled?: boolean;
}

export function useFlashcardShortcuts({
  onFlip,
  onRate,
  isFlipped,
  isEnabled = true,
}: UseFlashcardShortcutsProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const lastPressRef = useRef<number>(0);
  const DEBOUNCE_MS = 300; // prevent rapid double-firing

  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Safety Mechanism: Ignore if typing in an input, textarea, or select
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
        return;
      }

      // Ignore if modifier keys are pressed (e.g., Ctrl+C)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const now = Date.now();
      if (now - lastPressRef.current < DEBOUNCE_MS) {
        return; // Throttled
      }

      let handled = false;
      let pressedKey: string | null = null;

      if (e.code === "Space") {
        e.preventDefault();
        handled = true;
        
        // Allow space to toggle flip back and forth
        onFlip();
      } else if (isFlipped) {
        // Only allow rating keys if the card is flipped
        if (e.key === "1") {
          e.preventDefault();
          handled = true;
          pressedKey = "1";
          onRate("fail");
        } else if (e.key === "2") {
          e.preventDefault();
          handled = true;
          pressedKey = "2";
          onRate("hard");
        } else if (e.key === "3") {
          e.preventDefault();
          handled = true;
          pressedKey = "3";
          onRate("good");
        }
      }

      if (handled) {
        lastPressRef.current = now;
        
        if (pressedKey) {
          setActiveKey(pressedKey);
          setTimeout(() => {
            setActiveKey(null);
          }, 200); // Visual feedback duration
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onFlip, onRate, isFlipped, isEnabled]);

  return { activeKey };
}
