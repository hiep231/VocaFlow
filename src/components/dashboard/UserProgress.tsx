import { motion } from "framer-motion";
import {
  Flame,
  Trophy,
  Crown,
  Star,
  Shield,
  Zap,
  Snowflake,
} from "lucide-react";
import { getLevelProgress } from "@/lib/gamification";
import { cn } from "@/lib/utils";

interface UserProgressProps {
  xp: number;
  level: number;
  streak: number;
  activeFreezes?: number;
}

const LEVEL_TITLES = [
  "Novice",
  "Rookie",
  "Apprentice",
  "Scholar",
  "Expert",
  "Master",
  "Grandmaster",
  "Legend",
];

// Helper to get rank configuration based on level
// Neo-brutalism "Playful Retro Sticker" aesthetic — solid colors, no gradients
const getRankConfig = (level: number) => {
  if (level < 5)
    return {
      tier: "Bronze",
      /** Solid warm peach background */
      bg: "bg-orange-300",
      /** Matching dark icon/text color for contrast */
      text: "text-slate-900",
      iconColor: "#78350f", // amber-900 equivalent
      pillBg: "bg-orange-300",
      icon: Shield,
    };
  if (level < 10)
    return {
      tier: "Silver",
      bg: "bg-slate-300",
      text: "text-slate-900",
      iconColor: "#1e293b", // slate-800
      pillBg: "bg-slate-300",
      icon: Star,
    };
  if (level < 20)
    return {
      tier: "Gold",
      bg: "bg-yellow-300",
      text: "text-slate-900",
      iconColor: "#713f12", // yellow-900
      pillBg: "bg-yellow-300",
      icon: Trophy,
    };
  if (level < 50)
    return {
      tier: "Diamond",
      bg: "bg-cyan-300",
      text: "text-slate-900",
      iconColor: "#0c4a6e", // sky-900
      pillBg: "bg-cyan-300",
      icon: Zap,
    };
  return {
    tier: "Legendary",
    bg: "bg-fuchsia-400",
    text: "text-slate-900",
    iconColor: "#4a044e", // fuchsia-950
    pillBg: "bg-fuchsia-400",
    icon: Crown,
  };
};

function RankBadge({ level }: { level: number }) {
  const config = getRankConfig(level);
  const Icon = config.icon;

  return (
    <div className="relative flex flex-col items-center justify-center group w-32 h-36">
      {/* Main Badge Container — Neo-brutalism squircle with hard offset shadow */}
      <motion.div
        whileHover={{
          x: -2,
          y: -2,
          boxShadow: "8px 8px 0px rgba(15,23,42,1)",
        }}
        whileTap={{
          x: 6,
          y: 6,
          boxShadow: "0px 0px 0px rgba(15,23,42,1)",
        }}
        initial={{
          boxShadow: "6px 6px 0px rgba(15,23,42,1)",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className={cn(
          "relative z-10 w-24 h-24 flex flex-col items-center justify-center",
          "rounded-3xl border-4 border-slate-900 dark:border-slate-100",
          config.bg,
        )}
      >
        <div className="flex flex-col items-center gap-1 z-20 mt-1">
          <Icon
            className={cn("w-8 h-8", config.text)}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: config.iconColor }}
          />
          <span className={cn("text-2xl font-black leading-none", config.text)}>
            {level}
          </span>
        </div>
      </motion.div>

      {/* Rank Label Pill — Retro sticker style */}
      <div
        className={cn(
          "absolute -bottom-3 z-30 px-4 py-1.5 rounded-full",
          "text-[10px] font-black uppercase tracking-[0.18em]",
          "border-2 border-slate-900 dark:border-slate-100",
          "text-slate-900 dark:text-slate-900",
          "shadow-[3px_3px_0px_rgba(15,23,42,1)]",
          "transition-transform duration-200 group-hover:-translate-y-1",
          config.pillBg,
        )}
      >
        {config.tier}
      </div>
    </div>
  );
}

export function UserProgress({
  xp,
  level,
  streak,
  activeFreezes = 0,
}: UserProgressProps) {
  const { percent, next, current } = getLevelProgress(xp);
  // Determine title based on level ranges matching the new progressive curve
  let titleIndex = 0;
  if (level >= 50)
    titleIndex = 7; // Legend
  else if (level >= 40)
    titleIndex = 6; // Grandmaster
  else if (level >= 30)
    titleIndex = 5; // Master
  else if (level >= 20)
    titleIndex = 4; // Expert
  else if (level >= 15)
    titleIndex = 3; // Scholar
  else if (level >= 10)
    titleIndex = 2; // Apprentice
  else if (level >= 5) titleIndex = 1; // Rookie

  const title = LEVEL_TITLES[titleIndex];

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-visible">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        {/* New Game-Style Rank Badge */}
        <div className="flex-shrink-0">
          <RankBadge level={level} />
        </div>

        {/* Stats & Progress */}
        <div className="flex-1 w-full text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-3">
                {title}
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Current Rank • Next Tier at Lvl{" "}
                {(Math.floor(level / 10) + 1) * 10}
              </p>
            </div>

            {/* Streak & Freezes */}
            <div className="mt-4 md:mt-0 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 rounded-xl shadow-sm">
                <div className="bg-orange-100 dark:bg-orange-900/40 p-1.5 rounded-lg">
                  <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {streak}
                  </span>
                  <span className="text-xs font-semibold text-orange-600/80 dark:text-orange-400 uppercase tracking-wide">
                    Day Streak
                  </span>
                </div>
              </div>

              {/* Freezes Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-2.5 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 rounded-xl shadow-sm h-full">
                <div className="bg-sky-100 dark:bg-sky-900/40 p-1.5 rounded-lg">
                  <Snowflake className="w-4 h-4 text-sky-500" />
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    {activeFreezes}
                  </span>
                  <span className="text-[10px] font-semibold text-sky-600/80 dark:text-sky-400 uppercase tracking-wide">
                    Freezes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              <span>XP Progress</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {Math.round(percent)}% to Lvl {level + 1}
              </span>
            </div>
            <div className="relative h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-200 dark:ring-slate-700">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%]"
                initial={{ width: 0 }}
                animate={{
                  width: `${percent}%`,
                  backgroundPosition: ["0% 0%", "100% 0%"],
                }}
                transition={{
                  width: { duration: 1, ease: "easeOut" },
                  backgroundPosition: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  },
                }}
              />
              {/* Shine effect on bar */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            </div>
            <div className="text-right text-xs text-slate-400 px-1 font-medium">
              <span className="text-slate-700 dark:text-slate-300">
                {Math.round(xp).toLocaleString()}
              </span>
              <span className="mx-1">/</span>
              {Math.round(xp - current + next).toLocaleString()} XP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
