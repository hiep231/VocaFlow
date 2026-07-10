import { motion } from "framer-motion";
import { Flame, Trophy, Crown, Star, Shield, Zap, Snowflake } from "lucide-react";
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
const getRankConfig = (level: number) => {
  if (level < 5)
    return {
      tier: "Bronze",
      gradient: "from-orange-600 via-amber-700 to-amber-900",
      text: "text-amber-700 dark:text-amber-500",
      border: "border-amber-600",
      ring: "ring-amber-600/30",
      glow: "shadow-amber-600/40",
      icon: Shield,
      wingType: "none",
    };
  if (level < 10)
    return {
      tier: "Silver",
      gradient: "from-slate-300 via-slate-400 to-slate-600",
      text: "text-slate-600 dark:text-slate-200",
      border: "border-slate-300",
      ring: "ring-slate-400/50",
      glow: "shadow-slate-400/50",
      icon: Star,
      wingType: "small",
    };
  if (level < 20)
    return {
      tier: "Gold",
      gradient: "from-yellow-300 via-amber-500 to-yellow-600",
      text: "text-amber-600 dark:text-yellow-400",
      border: "border-yellow-400",
      ring: "ring-yellow-400/60",
      glow: "shadow-yellow-500/60",
      icon: Trophy,
      wingType: "medium",
    };
  if (level < 50)
    return {
      tier: "Diamond",
      gradient: "from-cyan-300 via-blue-500 to-indigo-600",
      text: "text-blue-600 dark:text-cyan-300",
      border: "border-cyan-400",
      ring: "ring-cyan-400/80",
      glow: "shadow-cyan-400/80",
      icon: Zap,
      wingType: "large",
    };
  return {
    tier: "Legendary",
    gradient: "from-pink-500 via-purple-500 to-indigo-600",
    text: "text-purple-600 dark:text-fuchsia-300",
    border: "border-fuchsia-400",
    ring: "ring-fuchsia-500/80",
    glow: "shadow-fuchsia-500/80",
    icon: Crown,
    wingType: "epic",
  };
};

function RankBadge({ level }: { level: number }) {
  const config = getRankConfig(level);
  const Icon = config.icon;

  return (
    <div className="relative group w-40 h-32 flex items-center justify-center">
      {/* 1. Outer Ambient Glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-3xl opacity-30 transition-all duration-700 group-hover:opacity-60",
          config.gradient.replace("from-", "bg-")
        )}
      />

      {/* 2. Wings Container */}
      <svg
        className="absolute w-full h-full drop-shadow-md pointer-events-none z-0 overflow-visible"
        viewBox="0 0 160 120"
        fill="none"
      >
        <defs>
          <linearGradient
            id={`grad-${level}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              className={cn(
                "stop-color",
                String(config.text.split(" ")[0]).replace(
                  "text-",
                  "text-opacity-20 text-"
                )
              )}
              stopColor="currentColor"
              stopOpacity="0.8"
            />
            <stop
              offset="50%"
              className={cn(
                "stop-color",
                String(config.text.split(" ")[0]).replace("text-", "text-")
              )}
              stopColor="currentColor"
              stopOpacity="1"
            />
            <stop
              offset="100%"
              className={cn(
                "stop-color",
                String(config.text.split(" ")[0]).replace(
                  "text-",
                  "text-opacity-20 text-"
                )
              )}
              stopColor="currentColor"
              stopOpacity="0.8"
            />
          </linearGradient>

          {/* Unique gradients for wings */}
          <linearGradient id="wing-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="wing-diamond" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="wing-epic" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E879F9" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>

        {/* -- WINGS LOGIC -- */}

        {/* Small Wings (Silver+) */}
        {level >= 5 && (
          <g
            className={cn(
              "transition-all duration-500 origin-center",
              level >= 20 ? "scale-90 opacity-0" : "opacity-100"
            )}
          >
            {/* Left Small Wing */}
            <path
              d="M45,60 Q30,50 35,30 Q25,40 20,60 L45,65 Z"
              fill={level < 10 ? "#CBD5E1" : "url(#wing-gold)"}
              stroke="none"
            />
            {/* Right Small Wing */}
            <path
              d="M115,60 Q130,50 125,30 Q135,40 140,60 L115,65 Z"
              fill={level < 10 ? "#CBD5E1" : "url(#wing-gold)"}
              stroke="none"
            />
          </g>
        )}

        {/* Medium to Large Wings (Gold/Diamond) */}
        {level >= 10 && level < 50 && (
          <g
            className={cn(
              "transition-all duration-500",
              level >= 20 ? "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : ""
            )}
          >
            {/* Left Wing Layers */}
            <path
              d="M50,60 C40,40 20,20 10,25 C20,35 30,50 40,65 Z"
              fill={level >= 20 ? "url(#wing-diamond)" : "url(#wing-gold)"}
            />
            <path
              d="M45,70 C35,60 15,55 5,65 C15,70 30,75 42,75 Z"
              fill={level >= 20 ? "url(#wing-diamond)" : "url(#wing-gold)"}
              opacity="0.8"
            />

            {/* Right Wing Layers */}
            <path
              d="M110,60 C120,40 140,20 150,25 C140,35 130,50 120,65 Z"
              fill={level >= 20 ? "url(#wing-diamond)" : "url(#wing-gold)"}
            />
            <path
              d="M115,70 C125,60 145,55 155,65 C145,70 130,75 118,75 Z"
              fill={level >= 20 ? "url(#wing-diamond)" : "url(#wing-gold)"}
              opacity="0.8"
            />
          </g>
        )}

        {/* EPIC Wings (Legendary) */}
        {level >= 50 && (
          <g className="animate-pulse-slow drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]">
            <path
              d="M50,60 Q30,20 0,10 Q20,40 40,70 Z"
              fill="url(#wing-epic)"
            />
            <path
              d="M45,75 Q20,60 5,50 Q25,80 40,85 Z"
              fill="url(#wing-epic)"
              opacity="0.7"
            />
            <path
              d="M48,85 Q30,90 10,95 Q35,95 48,90 Z"
              fill="url(#wing-epic)"
              opacity="0.5"
            />

            <path
              d="M110,60 Q130,20 160,10 Q140,40 120,70 Z"
              fill="url(#wing-epic)"
            />
            <path
              d="M115,75 Q140,60 155,50 Q135,80 120,85 Z"
              fill="url(#wing-epic)"
              opacity="0.7"
            />
            <path
              d="M112,85 Q130,90 150,95 Q125,95 112,90 Z"
              fill="url(#wing-epic)"
              opacity="0.5"
            />
          </g>
        )}
      </svg>

      {/* 3. Main Circle Container */}
      <div
        className={cn(
          "relative z-10 w-24 h-24 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 transition-transform group-hover:scale-105",
          "border-[4px]",
          config.border,
          config.glow
        )}
      >
        {/* Inner Ring */}
        <div
          className={cn(
            "absolute inset-1 rounded-full border border-dashed opacity-40",
            config.border
          )}
        />

        {/* Valid Level Content */}
        <div className="flex flex-col items-center justify-center relative z-10">
          <Icon className={cn("w-6 h-6 mb-0.5 drop-shadow-sm", config.text)} />
          <span
            className={cn(
              "text-3xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-br filter drop-shadow-sm",
              config.gradient
            )}
          >
            {level}
          </span>
        </div>

        {/* Glass Shine */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent opacity-50 pointer-events-none" />
      </div>

      {/* 4. Rank Label (Pill at bottom) */}
      <div
        className={cn(
          "absolute -bottom-3 z-30 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg border border-white/20",
          "bg-gradient-to-r text-white",
          config.gradient
        )}
      >
        {config.tier}
      </div>
    </div>
  );
}

export function UserProgress({ xp, level, streak, activeFreezes = 0 }: UserProgressProps) {
  const { percent, next, current } = getLevelProgress(xp);
  // Determine title based on level ranges matching the new progressive curve
  let titleIndex = 0;
  if (level >= 50) titleIndex = 7; // Legend
  else if (level >= 40) titleIndex = 6; // Grandmaster
  else if (level >= 30) titleIndex = 5; // Master
  else if (level >= 20) titleIndex = 4; // Expert
  else if (level >= 15) titleIndex = 3; // Scholar
  else if (level >= 10) titleIndex = 2; // Apprentice
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
