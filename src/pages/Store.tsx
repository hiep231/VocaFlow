import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getUserStats, buyStreakFreeze } from "@/services/user-stats";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Coins, Snowflake, ShoppingCart } from "lucide-react";

export default function Store() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isBuying, setIsBuying] = useState(false);

  const { data: userStats, isLoading } = useQuery({
    queryKey: ["userStats", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return null;
      return getUserStats(currentUser.uid);
    },
    enabled: !!currentUser,
  });

  const buyFreezeMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("Not logged in");
      return buyStreakFreeze(currentUser.uid);
    },
    onSuccess: (newStats) => {
      queryClient.setQueryData(["userStats", currentUser?.uid], newStats);
      toast.success("Streak Freeze purchased successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to purchase Streak Freeze");
    },
    onSettled: () => {
      setIsBuying(false);
    }
  });

  const handleBuyFreeze = () => {
    setIsBuying(true);
    buyFreezeMutation.mutate();
  };

  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).setHours(0, 0, 0, 0);
  };

  const coins = userStats?.coins !== undefined ? userStats.coins : (userStats?.xp || 0);
  
  const today = new Date();
  let freezesBoughtThisWeek = userStats?.freezesBoughtThisWeek || 0;
  if (userStats?.lastFreezePurchaseDate) {
    const lastPurchaseDate = userStats.lastFreezePurchaseDate.toDate();
    if (getMonday(today) > getMonday(lastPurchaseDate)) {
      freezesBoughtThisWeek = 0;
    }
  }
  
  const freezeCost = 50 + (freezesBoughtThisWeek * 25);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-indigo-500" />
            Store
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Exchange your hard-earned Coins for helpful items.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-full font-bold shadow-sm border border-amber-100 dark:border-amber-800/30">
          <Coins className="w-5 h-5" />
          <span>{coins} Coins</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          
          <CardHeader className="relative z-10 pb-2">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mb-4 text-blue-500 shadow-inner">
              <Snowflake className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Streak Freeze</CardTitle>
            <CardDescription className="text-slate-500 mt-1">
              Missed a day? Protect your learning streak from breaking for one full day.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10 pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Currently owned</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {userStats?.activeFreezes || 0}
              </span>
            </div>
          </CardContent>
          
          <CardFooter className="relative z-10 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button 
              className="w-full font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md hover:shadow-lg"
              disabled={isBuying || coins < freezeCost}
              onClick={handleBuyFreeze}
            >
              {isBuying ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Buy for {freezeCost}
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
