import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StudyHeatmap } from "@/components/ui/StudyHeatmap";
import { Activity, Flame, Calendar, Trophy } from "lucide-react";
import type { UserStats } from "@/types";

interface ActivityDialogProps {
  activityData: Record<string, number>;
  userStats: UserStats | null;
}

export function ActivityDialog({ activityData, userStats }: ActivityDialogProps) {
  const totalActiveDays = Object.keys(activityData).length;
  // Calculate max streak could be complex, for now we use current streak from userStats
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-auto flex flex-col items-start p-4 gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 shadow-sm transition-all group w-full md:w-auto">
             <div className="flex items-center gap-2 text-slate-500 group-hover:text-indigo-500 transition-colors">
                <Activity className="w-5 h-5" />
                <span className="font-semibold">Activity Log</span>
             </div>
             <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-bold font-mono">{totalActiveDays}</span>
                 <span className="text-xs text-slate-400">days active</span>
             </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-4xl bg-slate-950/95 backdrop-blur-xl border-slate-800 text-slate-50 shadow-2xl overflow-y-auto max-h-[90vh] rounded-xl md:rounded-2xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
             <Activity className="w-7 h-7 text-indigo-400" />
             Study Activity
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 flex flex-col items-center justify-center gap-2 group hover:border-orange-500/40 transition-colors">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 blur-3xl rounded-full" />
                <div className="p-3 bg-orange-500/20 rounded-full mb-1 ring-1 ring-orange-500/40 shadow-lg shadow-orange-500/10">
                    <Flame className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-center relative z-10">
                    <div className="text-3xl font-bold text-white mb-1">{userStats?.streak || 0}</div>
                    <div className="text-xs font-bold text-orange-400/80 uppercase tracking-widest">Current Streak</div>
                </div>
            </div>
            
            <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 flex flex-col items-center justify-center gap-2 group hover:border-blue-500/40 transition-colors">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 blur-3xl rounded-full" />
                 <div className="p-3 bg-blue-500/20 rounded-full mb-1 ring-1 ring-blue-500/40 shadow-lg shadow-blue-500/10">
                    <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-center relative z-10">
                    <div className="text-3xl font-bold text-white mb-1">{totalActiveDays}</div>
                    <div className="text-xs font-bold text-blue-400/80 uppercase tracking-widest">Active Days</div>
                </div>
            </div>

             <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 flex flex-col items-center justify-center gap-2 group hover:border-indigo-500/40 transition-colors">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 blur-3xl rounded-full" />
                 <div className="p-3 bg-indigo-500/20 rounded-full mb-1 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10">
                    <Trophy className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-center relative z-10">
                    <div className="text-3xl font-bold text-white mb-1">{userStats?.xp || 0}</div>
                    <div className="text-xs font-bold text-indigo-400/80 uppercase tracking-widest">Total XP</div>
                </div>
            </div>
        </div>

        <div className="rounded-3xl border border-slate-800/60 p-6 md:p-8 bg-slate-900/50 backdrop-blur-sm relative overflow-hidden">
             <div className="flex items-center justify-between mb-6">
                 <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Activity Map</h4>
                 <div className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700">Last 365 Days</div>
             </div>
             <StudyHeatmap data={activityData} streak={userStats?.streak || 0} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
