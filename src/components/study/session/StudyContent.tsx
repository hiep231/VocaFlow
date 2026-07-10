import { useState } from "react";
import type { Card } from "@/types";
import type { StudyMode } from "@/hooks/useStudySession";
import type { ReviewRating } from "@/lib/srs-algorithm";
import Flashcard from "@/components/study/Flashcard";
import { SpeakingDrill } from "@/components/study/SpeakingDrill";
import { ClozeCard } from "@/components/study/ClozeCard";
import { GrammarCard } from "@/components/study/GrammarCard";
import { ShadowingCard } from "@/components/study/ShadowingCard";
import { Button } from "@/components/ui/button";
import { useSound } from "@/contexts/SoundContext";
import { RatingControls } from "./RatingControls";
import { HelpDialog } from "./HelpDialog";
import { useFlashcardShortcuts } from "@/hooks/useFlashcardShortcuts";

interface StudyContentProps {
  currentCard: Card;
  mode: StudyMode;
  practiceType: string;
  onRate: (rating: ReviewRating) => void;
  onSetMode: (mode: StudyMode) => void;
}

export function StudyContent({
  currentCard,
  mode,
  practiceType,
  onRate,
  onSetMode,
}: StudyContentProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { playSFX } = useSound();

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleRate = (rating: ReviewRating) => {
    playSFX(rating === "good" ? "correct" : "click");
    onRate(rating);
  };

  const { activeKey } = useFlashcardShortcuts({
    onFlip: handleFlip,
    onRate: handleRate,
    isFlipped,
    isEnabled: mode === "flashcard",
  });

  if (mode === "flashcard") {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center gap-8 overflow-hidden px-4">
        <Flashcard
          cardData={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          onRate={handleRate}
        />

        {!isFlipped ? (
          <Button size="lg" className="min-w-[200px]" onClick={handleFlip}>
            Show Answer <span className="text-xs opacity-60 ml-2">[Space]</span>
          </Button>
        ) : (
          <div className="w-full max-w-xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
            <p className="text-slate-500 dark:text-slate-400 mb-4 font-medium">
              How well did you recall this?
            </p>
            <RatingControls onRate={handleRate} activeKey={activeKey} />
          </div>
        )}

        <div className="mt-4">
          <HelpDialog />
        </div>
      </div>
    );
  }

  // Common wrapper for other modes to keep code DRY
  const renderContent = (child: React.ReactNode) => (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
      <div className="w-full">{child}</div>
    </div>
  );

  if (mode === "grammar") {
    return renderContent(
      <GrammarCard
        key={currentCard.id}
        card={currentCard}
        onSuccess={() => handleRate("good")}
      />
    );
  }

  if (mode === "shadowing") {
    return renderContent(
      <ShadowingCard
        key={currentCard.id}
        card={currentCard}
        onSuccess={() => handleRate("good")}
      />
    );
  }

  // Practice Mode (Speaking / Cloze / Grammar fallback)
  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-6">
      {practiceType === "speaking" ? (
        <SpeakingDrill
          term={currentCard.term}
          onSuccess={() => handleRate("good")}
        />
      ) : practiceType === "cloze" ? (
        <ClozeCard card={currentCard} onSuccess={() => handleRate("good")} />
      ) : (
        <GrammarCard
          key={currentCard.id}
          card={currentCard}
          onSuccess={() => handleRate("good")}
        />
      )}

      <p className="text-sm text-muted-foreground text-center max-w-md">
        Pass this drill to mark the card as <strong>Good</strong>. <br />
        (Fail/Hard options are hidden in this mode).
      </p>

      <Button
        variant="ghost"
        className="mt-4 bg-accent text-accent-foreground"
        onClick={() => onSetMode("flashcard")}
      >
        Switch to Flashcard view if too hard
      </Button>
    </div>
  );
}
