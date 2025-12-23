import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getLeaderboard } from "@/services/user-stats";
import { useAuth } from "@/contexts/AuthContext";
import type { UserStats } from "@/types";
import { Trophy, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardUser extends UserStats {
  userId: string;
}

export function Leaderboard() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboard(10);
        setUsers(data);
      } catch (error) {
        console.error("Failed to load leaderboard", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-slate-400 fill-slate-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-700 fill-amber-700" />;
      default:
        return (
          <span className="text-slate-500 font-bold w-5 text-center">
            {index + 1}
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
          Leaderboard
        </h3>
      </div>

      <div className="space-y-3">
        {users.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-4">
            No data yet. Be the first!
          </p>
        ) : (
          users.map((user, index) => {
            const isCurrentUser = user.userId === currentUser?.uid;
            return (
              <div
                key={user.userId}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl transition-colors",
                  isCurrentUser
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <div className="flex-shrink-0 flex items-center justify-center w-8">
                  {getRankIcon(index)}
                </div>

                <Avatar className="w-10 h-10 border-2 border-white dark:border-slate-800 shadow-sm">
                  <AvatarImage src={user.photoURL} alt={user.displayName} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xs">
                    {(user.displayName || "A").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-bold truncate",
                      isCurrentUser
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-slate-900 dark:text-slate-100"
                    )}
                  >
                    {user.displayName || "Anonymous"} {isCurrentUser && "(You)"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Lvl {user.level}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    {user.xp.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    XP
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
