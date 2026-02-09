import { CreateDeckDialog } from "@/components/deck/CreateDeckDialog";
import { UserProgress } from "@/components/dashboard/UserProgress";
import { ReviewBanner } from "@/components/dashboard/ReviewBanner";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { DeckList } from "@/components/dashboard/DeckList";
import { DeleteDeckDialog } from "@/components/deck/DeleteDeckDialog";
import { useDashboard } from "@/hooks/useDashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { VocabularyList } from "@/components/dashboard/VocabularyList";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { calculateLevel } from "@/lib/gamification";

export default function Dashboard() {
  const {
    logout,
    decks,
    cardsDue,
    loading,
    userStats,
    activityData,
    deckToDelete,
    isDeleting,
    setDeckToDelete,
    confirmDeleteDeck,
    fetchDecksAndStats,
    allCards,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState("decks");

  return (
    <div className="min-w-full min-h-screen relative bg-slate-50 dark:bg-slate-950 font-sans">
      <DashboardHeader onLogout={logout} />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8 min-h-[calc(100vh-10rem)]">
        <ReviewBanner cardsDue={cardsDue} />

        <div className="space-y-6">
          <div className="mb-6">
            <UserProgress
              xp={userStats?.xp || 0}
              level={calculateLevel(userStats?.xp || 0)}
              streak={userStats?.streak || 0}
            />
          </div>

          <Tabs
            defaultValue="decks"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div className="w-full overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 relative w-max sm:w-auto flex whitespace-nowrap">
                  {["decks", "activity", "vocab", "leaderboard"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="relative z-10 text-slate-600 dark:text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-colors px-4 py-2"
                    >
                      {activeTab === tab && (
                        <motion.div
                          layoutId="active-tab"
                          className="absolute inset-0 bg-white dark:bg-slate-700/50 rounded-sm shadow-sm"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      <span className="relative z-20">
                        {tab === "decks"
                          ? "My Decks"
                          : tab === "activity"
                            ? "Activity Log"
                            : tab === "vocab"
                              ? "Vocabulary"
                              : "Leaderboard"}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Only show Create button when on Decks tab */}
              {activeTab === "decks" && (
                <div className="w-full sm:w-auto">
                  <CreateDeckDialog onDeckCreated={fetchDecksAndStats} />
                </div>
              )}
            </div>

            <TabsContent value="decks" className="space-y-6">
              <AnimatePresence mode="wait">
                {activeTab === "decks" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DeckList
                      decks={decks}
                      loading={loading}
                      onDeleteClick={setDeckToDelete}
                      onDeckCreated={fetchDecksAndStats}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="activity">
              <AnimatePresence mode="wait">
                {activeTab === "activity" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <StreakCalendar activityLog={activityData} />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="vocab">
              <AnimatePresence mode="wait">
                {activeTab === "vocab" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <VocabularyList cards={allCards || []} />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="leaderboard">
              <AnimatePresence mode="wait">
                {activeTab === "leaderboard" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Leaderboard />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-slate-400 text-sm border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <p>
          Built with ❤️ by{" "}
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Hiep DT
          </span>
        </p>
        <p className="text-xs mt-1 opacity-70">
          © {new Date().getFullYear()} VocaFlow. All rights reserved.
        </p>
      </footer>

      <DeleteDeckDialog
        deckToDelete={deckToDelete}
        isDeleting={isDeleting}
        onOpenChange={(open) => !open && setDeckToDelete(null)}
        onConfirm={confirmDeleteDeck}
      />
    </div>
  );
}
