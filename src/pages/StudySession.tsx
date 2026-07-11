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
  }, [currentCard]);

  if (loading) return <StudyLoading />;
  if (currentIndex >= studyQueue.length)
    return <StudyCompletion deckId={deckId} limitReached={limitReached && currentIndex === 0} limitInfo={limitInfo} />;
  if (!currentCard) return <StudyLoading />;

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-normal" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-normal" />

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
