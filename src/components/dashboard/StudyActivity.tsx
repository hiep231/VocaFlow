import { ActivityDialog } from "@/components/ui/ActivityDialog";
import type { UserStats } from "@/types";

interface StudyActivityProps {
  activityData: Record<string, number>;
  userStats: UserStats | null;
}

export function StudyActivity({ activityData, userStats }: StudyActivityProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
          Study Activity
        </h2>
        <p className="text-slate-500 text-sm">
          Review your daily progress and keep the streak alive!
        </p>
      </div>

      <ActivityDialog activityData={activityData} userStats={userStats} />
    </div>
  );
}
