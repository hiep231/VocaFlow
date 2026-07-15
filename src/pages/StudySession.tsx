import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useStudySession, type StudyMode } from "@/hooks/useStudySession";
import { StudyLoading } from "@/components/study/session/StudyLoading";
import { StudyCompletion } from "@/components/study/session/StudyCompletion";
import { StudyHeader } from "@/components/study/session/StudyHeader";
import { StudyModes } from "@/components/study/session/StudyModes";
import { StudyContent } from "@/components/study/session/StudyContent";

export default function StudySession() {
  const { deckId } = useParams<{ deckId: string }>();
  const [searchParams] = useSearchParams();
  const isCramMode = searchParams.get("cram") === "true";

  const {
    studyQueue,
    currentCard,
    currentIndex,
    loading,
    practiceType,
    handleRate,
    limitReached,
    limitInfo,
    resetSession,
  } = useStudySession(deckId, { cram: isCramMode });

  const [mode, setMode] = useState<StudyMode>("practice");

  useEffect(() => {
    if (!currentCard) return;

    if (currentCard.type === "grammar") {
      setMode("grammar");
    } else if (currentCard.type === "sentence") {
      setMode("shadowing");
    } else {
      if (currentCard.level < 2) {
        setMode("flashcard");
      } else {
        setMode("practice");
      }
    }
  }, [currentCard?.id]);

  if (loading) return <StudyLoading />;
  if (currentIndex >= studyQueue.length)
    return <StudyCompletion deckId={deckId} limitReached={limitReached && currentIndex === 0} limitInfo={limitInfo} onReviewAgain={resetSession} isCramMode={isCramMode} />;
  if (!currentCard) return <StudyLoading />;

  return (
    <div className="flex flex-col items-center w-full h-full p-4 md:p-8 relative">

      <StudyHeader
        deckId={deckId}
        currentIndex={currentIndex}
        totalCards={studyQueue.length}
      />

      <StudyModes mode={mode} onModeChange={setMode} />

      <div className="w-full flex-1 flex flex-col items-center justify-center gap-8 relative z-10">
        <StudyContent
          key={`${currentCard.id}-${currentIndex}`}
          currentCard={currentCard}
          mode={mode}
          practiceType={practiceType}
          onRate={handleRate}
          onSetMode={setMode}
        />
      </div>
    </div>
  );
}
