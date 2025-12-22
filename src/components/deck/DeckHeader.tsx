import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Plus,
  Calendar,
  PlayCircle,
  Pencil,
  Trash2,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import type { Deck } from "@/types";

interface DeckHeaderProps {
  deck: Deck;
  cardsCount: number;
  onEditDeck: () => void;
  onDeleteDeck: () => void;
}

export function DeckHeader({
  deck,
  cardsCount,
  onEditDeck,
  onDeleteDeck,
}: DeckHeaderProps) {
  return (
    <>
      {/* Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
            {deck.title}
          </span>
        </div>
      </div>

      {/* Deck Header */}
      <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl dark:shadow-2xl mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl -z-10 group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-all duration-700" />

        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {deck.title}
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-2xl">
              {deck.description || "No description provided."}
            </p>

            <div className="flex flex-col lg:flex-row items-start lg:items-center  gap-6 mt-6">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10">
                <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span className="font-bold">{cardsCount}</span> Cards
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10">
                <Calendar className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                <span>Created recently</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-6 md:mt-0">
            {cardsCount > 0 ? (
              <Link to={`/study/${deck.id}`} className="flex-1 sm:flex-none">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 border-0 text-white text-lg h-12 rounded-xl px-8 transition-transform hover:scale-105 active:scale-95"
                >
                  <PlayCircle className="w-5 h-5 fill-white/20" />
                  Start Quest
                </Button>
              </Link>
            ) : (
              <div className="flex-1 sm:flex-none">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25 border-0 text-white text-lg h-12 rounded-xl px-8 opacity-50 cursor-not-allowed"
                  disabled
                  title="Add cards to start studying"
                >
                  <PlayCircle className="w-5 h-5 fill-white/20" />
                  Start Quest
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              {deck.id && (
                <div className="flex-1 sm:flex-none">
                  <Link to={`/decks/${deck.id}/add`}>
                    <Button className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5 backdrop-blur-sm h-12">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Cards
                    </Button>
                  </Link>
                </div>
              )}

              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onEditDeck}
                  className="border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:!text-white h-12 w-12 rounded-xl"
                >
                  <Pencil className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onDeleteDeck}
                  className="border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/10 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-500/80 h-12 w-12 rounded-xl"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
