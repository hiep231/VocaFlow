import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Sparkles, CalendarCheck, Rocket } from "lucide-react";
import { calculateCompletionForecast, type ForecastResult } from "@/lib/forecast";
import type { Card } from "@/types";

interface ProjectionStatsProps {
  allCards: Card[];
  activityData: Record<
    string,
    { count: number; newCards: number; reviewCards: number; xp: number; duration: number }
  >;
}

function formatProjectedDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // For very short projections
  if (diffDays <= 1) return "tomorrow";
  if (diffDays <= 7) return `in ${diffDays} days`;

  // Format the date nicely
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function ProjectionStats({ allCards, activityData }: ProjectionStatsProps) {
  const forecast: ForecastResult = useMemo(
    () => calculateCompletionForecast(allCards, activityData),
    [allCards, activityData]
  );

  // Don't show anything if there are no cards at all
  if (forecast.totalCards === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {forecast.hasData && forecast.deckComplete ? (
          <DeckCompleteCard totalCards={forecast.totalCards} />
        ) : forecast.hasData && !forecast.deckComplete ? (
          <ForecastCard forecast={forecast} />
        ) : (
          <NoDataCard remainingCards={forecast.remainingCards} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── With Data: Forecast Card ───────────────────────────────────────── */
function ForecastCard({
  forecast,
}: {
  forecast: Extract<ForecastResult, { hasData: true; deckComplete: false }>;
}) {
  const dateLabel = formatProjectedDate(forecast.projectedDate);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/10 p-4 sm:p-5 shadow-sm">
      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/10 dark:bg-emerald-400/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-400/10 dark:bg-teal-400/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
          <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">
            <span className="mr-1.5">🔥</span>
            At your current pace of{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
              {forecast.averageCardsPerDay}
            </span>{" "}
            cards/day, you will master this deck by{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {dateLabel}
            </span>
            !
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5 inline" />
            {forecast.remainingCards} of {forecast.totalCards} cards remaining
            <span className="mx-1 opacity-40">•</span>
            ~{forecast.remainingDays} day{forecast.remainingDays !== 1 ? "s" : ""} left
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── No Data: CTA Card ──────────────────────────────────────────────── */
function NoDataCard({ remainingCards }: { remainingCards: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-5 shadow-sm">
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
          <Rocket className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 leading-snug">
            Complete your daily session to unlock your mastery forecast!
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {remainingCards > 0
              ? `${remainingCards} card${remainingCards !== 1 ? "s" : ""} waiting to be learned`
              : "Start adding cards to a deck to begin"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Deck Complete: Celebration Card ────────────────────────────────── */
function DeckCompleteCard({ totalCards }: { totalCards: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/10 p-4 sm:p-5 shadow-sm">
      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/10 dark:bg-amber-400/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
          <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">
            <span className="mr-1.5">🎉</span>
            All {totalCards} cards learned! Keep reviewing to reach full mastery.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Continue your daily reviews to lock these words into long-term memory
          </p>
        </div>
      </div>
    </div>
  );
}
