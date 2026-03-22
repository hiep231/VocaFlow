import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  scheduleService,
  parseVocabularyText,
  type Schedule,
} from "@/services/schedule-service";
import type { Deck } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CalendarClock,
  Send,
  Plus,
  CheckCircle2,
  Clock,
  Loader2,
  BookOpen,
  Info,
  X,
} from "lucide-react";

interface ScheduleTabProps {
  decks: Deck[];
}

export function ScheduleTab({ decks }: ScheduleTabProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [rawText, setRawText] = useState("");
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [wordsPerDay, setWordsPerDay] = useState(5);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch schedules
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["schedules", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return [];
      return scheduleService.getAllSchedules(currentUser.uid);
    },
    enabled: !!currentUser,
  });

  const activeSchedules = schedules.filter((s) => s.status === "active");
  const completedSchedules = schedules.filter((s) => s.status === "completed");

  // Preview parsed words
  const parsedPreview = rawText.trim()
    ? parseVocabularyText(rawText, wordsPerDay)
    : [];
  const totalDays = parsedPreview.length > 0
    ? Math.ceil(parsedPreview.length / wordsPerDay)
    : 0;

  const handleCreate = async () => {
    if (!currentUser || !selectedDeckId || !rawText.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    const deck = decks.find((d) => d.id === selectedDeckId);
    if (!deck) {
      toast.error("Selected deck not found.");
      return;
    }

    setIsCreating(true);
    try {
      await scheduleService.createSchedule(
        currentUser.uid,
        selectedDeckId,
        deck.title,
        wordsPerDay,
        rawText
      );
      toast.success(
        `Schedule created! ${parsedPreview.length} words over ${totalDays} days.`
      );
      setRawText("");
      setSelectedDeckId("");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to create schedule.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = async (scheduleId: string) => {
    try {
      await scheduleService.cancelSchedule(scheduleId);
      toast.success("Schedule cancelled.");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    } catch {
      toast.error("Failed to cancel schedule.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Guide Section */}
      <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
            <CalendarClock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              Drip-Feed Schedule
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Paste a large vocabulary list and set how many words you want to
              learn per day. The Telegram Bot will send you daily reminders with
              new words and automatically add them to your deck.
            </p>
          </div>
        </div>

        {/* Telegram Setup Instructions */}
        <div className="mt-4 p-3 rounded-lg bg-white/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Connect Telegram Bot
            </span>
          </div>
          <ol className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-decimal list-inside">
            <li>
              Search for your VocaFlow Bot on Telegram and press{" "}
              <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                /start
              </code>
            </li>
            <li>
              Send the command{" "}
              <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                /link {currentUser?.uid ? currentUser.uid.slice(0, 8) + "..." : "<your-uid>"}
              </code>{" "}
              to pair your account
            </li>
            <li>
              The bot will confirm the link — you're all set!
            </li>
          </ol>
          {currentUser?.uid && (
            <div className="mt-2 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Your UID:{" "}
                <code className="px-1 py-0.5 bg-amber-50 dark:bg-amber-900/30 rounded text-xs select-all">
                  {currentUser.uid}
                </code>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create New Schedule Button */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          New Schedule
        </Button>
      )}

      {/* Create Schedule Form */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Create New Schedule
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Target Deck */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Target Deck
            </label>
            <select
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a deck...</option>
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.title} ({deck.cardCount} cards)
                </option>
              ))}
            </select>
          </div>

          {/* Words Per Day */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Words per day
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={wordsPerDay}
              onChange={(e) =>
                setWordsPerDay(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-full sm:w-32 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Vocabulary Text */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Vocabulary List
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Paste your vocabulary here (one per line):\napple | quả táo | /ˈæp.əl/ | apple pie | I eat an apple every day.\nbook | cuốn sách | /bʊk/ | a good book | She is reading a book.`}
              rows={8}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
            />
          </div>

          {/* Preview */}
          {parsedPreview.length > 0 && (
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Preview
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                📚 <strong>{parsedPreview.length}</strong> words detected →{" "}
                <strong>{wordsPerDay}</strong> words/day →{" "}
                <strong>{totalDays}</strong> days total
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Array.from({ length: Math.min(totalDays, 7) }).map(
                  (_, dayIdx) => {
                    const wordsForDay = parsedPreview.filter(
                      (w) => w.dayIndex === dayIdx
                    );
                    return (
                      <div
                        key={dayIdx}
                        className="px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-xs text-indigo-700 dark:text-indigo-300"
                      >
                        Day {dayIdx + 1}: {wordsForDay.length} words
                      </div>
                    );
                  }
                )}
                {totalDays > 7 && (
                  <div className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs text-slate-500">
                    +{totalDays - 7} more days...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleCreate}
            disabled={
              isCreating ||
              !selectedDeckId ||
              !rawText.trim() ||
              parsedPreview.length === 0
            }
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CalendarClock className="w-4 h-4" />
                Create Schedule ({parsedPreview.length} words, {totalDays} days)
              </>
            )}
          </Button>
        </div>
      )}

      {/* Active Schedules */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : activeSchedules.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Active Schedules
          </h3>
          {activeSchedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onCancel={() => schedule.id && handleCancel(schedule.id)}
            />
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-12 text-slate-400">
            <CalendarClock className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              No active schedules. Create one to start drip-feeding vocabulary!
            </p>
          </div>
        )
      )}

      {/* Completed Schedules */}
      {completedSchedules.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </h3>
          {completedSchedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleCard({
  schedule,
  onCancel,
}: {
  schedule: Schedule;
  onCancel?: () => void;
}) {
  const progress = schedule.totalWords > 0
    ? Math.round((schedule.processedCount / schedule.totalWords) * 100)
    : 0;
  const isActive = schedule.status === "active";

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isActive
          ? "border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-slate-900"
          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isActive
                ? "bg-indigo-100 dark:bg-indigo-900/30"
                : "bg-slate-100 dark:bg-slate-800"
            }`}
          >
            <BookOpen
              className={`w-4 h-4 ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400"
              }`}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {schedule.deckTitle}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {schedule.wordsPerDay} words/day · {schedule.totalWords} total
            </p>
          </div>
        </div>
        {isActive && onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-red-500 hover:text-red-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>
            {schedule.processedCount} / {schedule.totalWords} words sent
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isActive
                ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                : "bg-slate-300 dark:bg-slate-600"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
