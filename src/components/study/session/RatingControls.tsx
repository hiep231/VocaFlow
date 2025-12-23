import { Button } from "@/components/ui/button";
import type { ReviewRating } from "@/lib/srs-algorithm";

interface RatingControlsProps {
  onRate: (rating: ReviewRating) => void;
}

export function RatingControls({ onRate }: RatingControlsProps) {
  return (
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
  );
}
