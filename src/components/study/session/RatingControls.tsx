import { Button } from "@/components/ui/button";
import type { ReviewRating } from "@/lib/srs-algorithm";

import { cn } from "@/lib/utils";

interface RatingControlsProps {
  onRate: (rating: ReviewRating) => void;
  activeKey?: string | null;
}

export function RatingControls({ onRate, activeKey }: RatingControlsProps) {
  return (
    <div className="grid grid-cols-3 gap-6 w-full transition-all duration-300">
      <Button
        variant="default"
        className={cn(
          "h-20 rounded-2xl bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-slate-900 border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:border-red-500 hover:bg-red-50 hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-1 transition-all",
          activeKey === "1" && "scale-95 ring-4 ring-red-500/30 bg-red-50 shadow-lg shadow-red-500/20 border-red-500"
        )}
        onClick={() => onRate("fail")}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold">Again <span className="text-xs opacity-60 font-normal ml-1">[1]</span></span>
          <span className="text-xs font-medium opacity-70 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">
            1m
          </span>
        </div>
      </Button>
      <Button
        variant="default"
        className={cn(
          "h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900 border-2 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:border-amber-500 hover:bg-amber-50 hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-1 transition-all",
          activeKey === "2" && "scale-95 ring-4 ring-amber-500/30 bg-amber-50 shadow-lg shadow-amber-500/20 border-amber-500"
        )}
        onClick={() => onRate("hard")}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold">Hard <span className="text-xs opacity-60 font-normal ml-1">[2]</span></span>
          <span className="text-xs font-medium opacity-70 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
            1d
          </span>
        </div>
      </Button>
      <Button
        variant="default"
        className={cn(
          "h-20 rounded-2xl bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-slate-900 border-2 border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 hover:border-green-500 hover:bg-green-50 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-1 transition-all",
          activeKey === "3" && "scale-95 ring-4 ring-green-500/30 bg-green-50 shadow-lg shadow-green-500/20 border-green-500"
        )}
        onClick={() => onRate("good")}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold">Good <span className="text-xs opacity-60 font-normal ml-1">[3]</span></span>
          <span className="text-xs font-medium opacity-70 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full text-green-700 dark:text-green-300">
            Next
          </span>
        </div>
      </Button>
    </div>
  );
}
