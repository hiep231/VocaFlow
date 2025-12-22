import { motion } from "framer-motion";
import { Flame, Trophy } from "lucide-react";
import { getLevelProgress } from "@/lib/gamification";

interface UserProgressProps {
  xp: number;
  level: number;
  streak: number;
}

const LEVEL_TITLES = [
  "Novice", "Rookie", "Apprentice", "Scholar", "Expert", "Master", "Grandmaster", "Legend"
];

export function UserProgress({ xp, level, streak }: UserProgressProps) {
  const { percent, next } = getLevelProgress(xp);
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] || "Novice";

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
       {/* Background Decor */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
       
       <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          
          {/* Level Badge */}
          <div className="flex-shrink-0 relative group cursor-pointer">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-slate-900 relative">
                  <span className="text-3xl font-extrabold text-white">{level}</span>
                  <div className="absolute -bottom-2 bg-slate-900 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-slate-700">
                    Lvl
                  </div>
              </div>
          </div>

          {/* Stats & Progress */}
          <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                  <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                          {title} 
                          <Trophy className="w-4 h-4 text-yellow-500" />
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Keep studying to reach the next rank!</p>
                  </div>

                  {/* Streak Tag */}
                  <div className="mt-3 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-xl mx-auto md:mx-0">
                      <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                      <div className="flex flex-col items-start leading-none">
                          <span className="text-lg font-bold text-orange-700 dark:text-orange-400">{streak}</span>
                          <span className="text-[10px] font-bold text-orange-600/70 uppercase">Day Streak</span>
                      </div>
                  </div>
              </div>

              {/* XP Bar */}
              <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <span>XP Progress</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{Math.round(percent)}% to Lvl {level + 1}</span>
                  </div>
                  <div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%]"
                          initial={{ width: 0 }}
                          animate={{ 
                              width: `${percent}%`,
                              backgroundPosition: ["0% 0%", "100% 0%"]
                          }}
                          transition={{ 
                              width: { duration: 1, ease: "easeOut" },
                              backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
                          }}
                      />
                  </div>
                  <div className="text-right text-xs text-slate-400">
                      <span className="font-mono text-slate-600 dark:text-slate-300">{Math.round(xp)}</span> / <span className="font-mono">{Math.round(xp + (next - (xp % next)))} XP</span>
                  </div>
              </div>
          </div>

       </div>
    </div>
  );
}
