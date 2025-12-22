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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

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

  const handleFlip = () => setIsFlipped(!isFlipped);

  // When card changes, reset flipped state
  // We can do this in parent or useEffect here?
  // Actually, parent handles key={} so this component unmounts/remounts on card change.
  // So state naturally resets. Nice.

  if (mode === "flashcard") {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center gap-8">
        <Flashcard
          cardData={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlip}
        />

        {!isFlipped ? (
          <Button size="lg" className="min-w-[200px]" onClick={handleFlip}>
            Show Answer
          </Button>
        ) : (
          <div className="w-full max-w-xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
            <p className="text-slate-500 dark:text-slate-400 mb-4 font-medium">
              How well did you recall this?
            </p>

            <div className="grid grid-cols-3 gap-6 w-full transition-all duration-300">
              <Button
                variant="default"
                className="h-20 rounded-2xl bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-slate-900 border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:border-red-500 hover:bg-red-50 hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-1 transition-all"
                onClick={() => onRate("fail")}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg font-bold">Again</span>
                  <span className="text-xs font-medium opacity-70 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">
                    1m
                  </span>
                </div>
              </Button>
              <Button
                variant="default"
                className="h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900 border-2 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:border-amber-500 hover:bg-amber-50 hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-1 transition-all"
                onClick={() => onRate("hard")}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg font-bold">Hard</span>
                  <span className="text-xs font-medium opacity-70 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                    1d
                  </span>
                </div>
              </Button>
              <Button
                variant="default"
                className="h-20 rounded-2xl bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-slate-900 border-2 border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 hover:border-green-500 hover:bg-green-50 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-1 transition-all"
                onClick={() => onRate("good")}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg font-bold">Good</span>
                  <span className="text-xs font-medium opacity-70 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full text-green-700 dark:text-green-300">
                    Next
                  </span>
                </div>
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white hover:bg-white/10 gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Hướng dẫn đánh giá
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-md rounded-xl">
              <DialogHeader>
                <DialogTitle>Hướng dẫn đánh giá (SRS)</DialogTitle>
                <DialogDescription>
                  Hệ thống lặp lại ngắt quãng (SRS) giúp bạn ghi nhớ từ vựng
                  hiệu quả hơn.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 items-start">
                  <div className="min-w-[80px] font-bold text-destructive">
                    Fail (Lại)
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">
                      Quên hoàn toàn hoặc trả lời sai.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Thẻ sẽ được sắp xếp để ôn lại ngy trong vòng 10-15 phút.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 items-start">
                  <div className="min-w-[80px] font-bold text-orange-600">
                    Hard (Khó)
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">
                      Nhớ mang máng, tốn nhiều sức mới nhớ ra.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Khoảng cách ôn tập ngắn (khoảng 1 ngày).
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 items-start">
                  <div className="min-w-[80px] font-bold text-green-600">
                    Good (Tốt)
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">
                      Nhớ ngay lập tức, trả lời chính xác.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Khoảng cách ôn tập sẽ tăng lên (vài ngày, 1 tuần...).
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  if (mode === "grammar") {
    return (
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        <div className="w-full">
          <GrammarCard
            key={currentCard.id}
            card={currentCard}
            onSuccess={() => onRate("good")}
          />
        </div>
      </div>
    );
  }

  if (mode === "shadowing") {
    return (
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        <div className="w-full">
          <ShadowingCard
            key={currentCard.id}
            card={currentCard}
            onSuccess={() => onRate("good")}
          />
        </div>
      </div>
    );
  }

  // Practice Mode
  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-6">
      {practiceType === "speaking" ? (
        <SpeakingDrill
          term={currentCard.term}
          onSuccess={() => onRate("good")}
        />
      ) : practiceType === "cloze" ? (
        <ClozeCard card={currentCard} onSuccess={() => onRate("good")} />
      ) : (
        <GrammarCard
          key={currentCard.id}
          card={currentCard}
          onSuccess={() => onRate("good")}
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
