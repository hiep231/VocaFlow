import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMemo, useState, useEffect } from "react";
import { Calendar, Flame } from "lucide-react";

interface StudyHeatmapProps {
  data?: Record<string, number>; // Format: "YYYY-MM-DD": count
  streak?: number;
}

export function StudyHeatmap({ data = {}, streak = 0 }: StudyHeatmapProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Responsive Day Count logic
  const [daysToShow, setDaysToShow] = useState(365);

  useEffect(() => {
    const handleResize = () => {
        // Show 100 days on mobile (< 640px), 365 on larger screens
        setDaysToShow(window.innerWidth < 640 ? 105 : 365); // 105 is divisible by 7 (15 weeks)
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate days based on daysToShow
  const days = useMemo(() => {
    const dates = [];
    const today = new Date();
    // We want the grid to end on today, and fill backwards.
    // For CSS Grid flow-col, we usually want rows=7. 
    // To ensure the grid looks "full", we generated exactly 'daysToShow' days.
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  }, [daysToShow]); // Re-calculate when daysToShow changes

  // Use data prop directly
  const displayData = useMemo(() => {
    return data;
  }, [data]);

  const getColor = (count: number) => {
    if (!count) return "bg-slate-800/50"; // Darker empty state for premium feel
    if (count >= 4) return "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]";
    if (count === 3) return "bg-green-500";
    if (count === 2) return "bg-green-600";
    return "bg-green-800";
  };

  const getDayInfo = (dateStr: string | null) => {
    if (!dateStr) return { count: 0, date: null };
    return {
        count: displayData[dateStr] || 0,
        date: new Date(dateStr)
    };
  };

  const selectedInfo = useMemo(() => getDayInfo(selectedDate), [selectedDate, displayData]);

  return (
    <div className="w-full">
        {/* Scrollable Heatmap Container */}
        <div className="w-full overflow-hidden mb-4">
            <div className="overflow-x-auto pb-4 scrollbar-thin-custom">
                <div className="min-w-fit pr-4"> 
                    {/* Legend hardcoded for simplicity as per previous design */}
                    
                    {/* Heatmap Grid */}
                    <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                        {days.map((date) => {
                            const dateStr = date.toISOString().split('T')[0];
                            const count = displayData[dateStr] || 0;
                            const isSelected = selectedDate === dateStr;
                            
                            return (
                                <TooltipProvider key={dateStr}>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <button 
                                                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                                                className={cn(
                                                    // Mobile: Bigger squares (w-5 h-5) for touch. Desktop: Compact (w-3 h-3) for dense "GitHub" look
                                                    "w-[1.2rem] h-[1.2rem] sm:w-3 sm:h-3 rounded-[2px] sm:rounded-[2px] transition-all",
                                                    "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 focus:ring-offset-slate-900",
                                                    isSelected ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 z-10 scale-110" : "hover:scale-125 hover:z-10",
                                                    getColor(count)
                                                )} 
                                            />
                                        </TooltipTrigger>
                                        {/* Desktop Tooltip - Hidden on mobile via interaction, but kept for desktop hover */}
                                        <TooltipContent side="top">
                                            <div className="text-center">
                                                <p className="font-bold text-sm">{count} activities</p>
                                                <p className="text-xs text-muted-foreground">{date.toLocaleDateString()}</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>

        {/* Detailed Footer - The "Interaction" Area */}
        <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex items-center justify-between min-h-[60px]">
            {selectedDate ? (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className={cn("p-2 rounded-lg", selectedInfo.count > 0 ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-400")}>
                        <Calendar className="w-5 h-5" />
                     </div>
                     <div>
                         <p className="text-sm font-medium text-slate-200">
                             {selectedInfo.date?.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                         </p>
                         <p className="text-xs text-slate-400">
                             {selectedInfo.count} study activities recorded
                         </p>
                     </div>
                </div>
            ) : (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                        <Flame className="w-5 h-5" />
                     </div>
                     <div>
                         <p className="text-sm font-medium text-slate-200">
                             Current Streak: <span className="text-orange-400 font-bold">{streak} days</span>
                         </p>
                         <p className="text-xs text-slate-400">
                             Keep practicing to build your habit!
                         </p>
                     </div>
                </div>
            )}
            
            {/* Legend (Mini) */}
            <div className="hidden sm:flex gap-1 items-center ml-auto pl-4 border-l border-white/5">
                <span className="text-[10px] text-slate-500 mr-2">Less</span>
                <div className="w-2.5 h-2.5 rounded-[1px] bg-slate-800/50" />
                <div className="w-2.5 h-2.5 rounded-[1px] bg-green-900" />
                <div className="w-2.5 h-2.5 rounded-[1px] bg-green-700" />
                <div className="w-2.5 h-2.5 rounded-[1px] bg-green-500" />
                <div className="w-2.5 h-2.5 rounded-[1px] bg-green-400" />
                <span className="text-[10px] text-slate-500 ml-2">More</span>
            </div>
        </div>
    </div>
  );
}
