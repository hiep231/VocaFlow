import { Trophy } from "lucide-react";
import { getLevelProgress } from "@/lib/gamification";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LevelBadgeProps {
  xp: number;
  level: number;
}

export function LevelBadge({ xp, level }: LevelBadgeProps) {
  const { current, next, percent } = getLevelProgress(xp);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:border-amber-200 dark:hover:border-amber-900/50 transition-colors cursor-help group">
            <Trophy className="w-4 h-4 text-amber-500 fill-amber-500/20" />

            <div className="flex flex-col gap-0.5 min-w-[90px]">
              <div className="flex items-center justify-between text-xs leading-none">
                <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Level {level}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {Math.floor(percent)}%
                </span>
              </div>

              <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {Math.floor(current)} / {next} XP to next level
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
