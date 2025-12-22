import { Trophy } from "lucide-react";
import { getLevelProgress } from "@/lib/gamification";
import { ProgressBar } from "@/components/ui/progress-bar";
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
    <div className="flex flex-col gap-1 min-w-[140px]">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
             <div className="flex items-center gap-2 mb-1">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-lg">
                    <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">Level {level}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{Math.floor(xp)} XP</span>
                </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {Math.floor(current)} / {next} XP to Level {level + 1}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <ProgressBar value={percent} className="h-1.5" barClassName="bg-amber-500" />
    </div>
  );
}
