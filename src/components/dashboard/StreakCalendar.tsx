import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isToday,
  startOfMonth,
  subDays,
} from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Flame,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ActivityStats {
  xp: number;
  duration: number; // in minutes
}

interface StreakCalendarProps {
  activityLog: Record<string, ActivityStats>;
}

// Custom hook for media query
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

export function StreakCalendar({ activityLog }: StreakCalendarProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showFullMonth, setShowFullMonth] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Helper to check if a day has activity
  const hasActivity = (date: Date) => {
    const key = format(date, "yyyy-MM-dd");
    return !!activityLog[key];
  };

  const getActivity = (date: Date) => {
    const key = format(date, "yyyy-MM-dd");
    return activityLog[key];
  };

  // --- Mobile View Logic ---
  const today = new Date();
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });

  // Calculate current streak (simplified logic for demo)
  const calculateStreak = () => {
    let streak = 0;
    let current = today;

    // Check today first
    if (hasActivity(current)) streak++;

    // Check backwards
    while (true) {
      current = subDays(current, 1);
      if (hasActivity(current)) {
        streak++;
      } else {
        // Allow missing today if checked yesterday (not implemented here fully, standard streak logic)
        // For visual demo, just count contiguous active days ending today or yesterday
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  // --- Shared Grid Logic ---
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the start of the month to align with grid
  const startDayOfWeek = getDay(monthStart); // 0 = Sunday
  const paddingDays = Array.from({ length: startDayOfWeek });

  const nextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const prevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const CalendarGrid = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div className="font-bold text-slate-700 dark:text-slate-200">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          disabled={
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear()
          }
          aria-label="Next Month"
        >
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-3 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-slate-400 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {calendarDays.map((day, i) => {
          const active = hasActivity(day);
          const isCurrentDay = isToday(day);
          const stats = getActivity(day);

          return (
            <TooltipProvider key={i}>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all cursor-default border-2 relative overflow-hidden group",
                      active
                        ? "border-orange-500 bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md shadow-orange-500/20"
                        : "border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50 text-slate-600 dark:text-slate-600",
                      isCurrentDay &&
                        !active &&
                        "border-indigo-500 border-dashed text-indigo-500 bg-indigo-50/50",
                    )}
                  >
                    {active && (
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    <span className="relative z-10">{format(day, "d")}</span>
                    {active && (
                      <Flame className="absolute bottom-1 right-1 w-3 h-3 text-white/50 fill-white/20" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <div className="font-bold mb-1">
                      {format(day, "MMM do")}
                    </div>
                    {active ? (
                      <div className="text-xs space-y-1">
                        <div className="text-orange-500 font-bold flex items-center justify-center gap-1">
                          <Flame className="w-3 h-3 fill-orange-500" />
                          {stats?.xp} XP Earned
                        </div>
                        <div className="text-slate-500">
                          Studied for {stats?.duration}m
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">No activity</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="w-full">
      {/* Mobile Weekly Strip */}
      {!isDesktop && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center px-2">
            <div>
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                {currentStreak} Day Streak
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You're on fire! Keep it up!
              </p>
            </div>
            <button
              onClick={() => setShowFullMonth(true)}
              className="text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-full"
            >
              View Month
            </button>
          </div>

          <div className="flex justify-between items-center gap-2 px-1">
            {last7Days.map((day, index) => {
              const active = hasActivity(day);
              const isCurrentDay = isToday(day);

              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-slate-400 uppercase">
                    {format(day, "EEEEE")}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => active && setSelectedDay(day)}
                    disabled={!active}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all relative overflow-hidden",
                      active
                        ? "border-orange-500 bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/30"
                        : "border-slate-200 dark:border-slate-800 bg-transparent",
                      isCurrentDay &&
                        !active &&
                        "border-indigo-500 border-dashed",
                    )}
                  >
                    {active ? (
                      <Flame className="w-5 h-5 text-white fill-white animate-pulse" />
                    ) : isCurrentDay ? (
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                    )}
                  </motion.button>
                </div>
              );
            })}
          </div>

          {/* Full Month Dialog for Mobile */}
          <Dialog open={showFullMonth} onOpenChange={setShowFullMonth}>
            <DialogContent className="w-[95%] rounded-2xl">
              <div className="mt-4">
                <CalendarGrid />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={!!selectedDay}
            onOpenChange={(open) => !open && setSelectedDay(null)}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-indigo-500" />
                  {selectedDay && format(selectedDay, "EEEE, MMMM do")}
                </DialogTitle>
              </DialogHeader>
              {selectedDay && getActivity(selectedDay) && (
                <div className="py-4 space-y-4">
                  <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mb-3">
                      <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                    </div>
                    <div className="text-2xl font-black text-orange-600 dark:text-orange-400">
                      {getActivity(selectedDay)?.xp || 0} XP
                    </div>
                    <div className="text-sm text-orange-600/70 dark:text-orange-400/70 font-medium">
                      Earned on this day
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                      <div className="text-xs text-slate-500 uppercase font-bold mb-1">
                        Study Time
                      </div>
                      <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        {getActivity(selectedDay)?.duration || 0}m
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                      <div className="text-xs text-slate-500 uppercase font-bold mb-1">
                        Activity
                      </div>
                      <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        Completed
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Desktop Monthly Grid */}
      {isDesktop && (
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-900 dark:text-white font-bold flex items-center gap-2">
                Monthly Progress
              </CardTitle>
              <div className="text-sm font-medium text-orange-500 flex items-center gap-1">
                <Flame className="w-4 h-4 fill-orange-500" />
                {currentStreak} Day Streak
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <CalendarGrid />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
