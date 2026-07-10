import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { templateService } from "@/services/template-service";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface StarterDecksProps {
  onClaimed: () => void;
}

export function StarterDecks({ onClaimed }: StarterDecksProps) {
  const { currentUser } = useAuth();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const { data: starterDecks = [], isLoading } = useQuery({
    queryKey: ["starterDecks"],
    queryFn: () => templateService.getStarterDecks(),
  });

  const handleClaim = async (templateId: string) => {
    if (!currentUser) return;
    try {
      setClaimingId(templateId);
      await templateService.claimStarterDeck(templateId, currentUser.uid);
      toast.success("Starter deck added to your library!");
      onClaimed();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add starter deck");
    } finally {
      setClaimingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (starterDecks.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-indigo-500" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Starter Decks
        </h3>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Don't know where to start? Add these curated decks to your library
        instantly.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {starterDecks.map((deck) => (
          <div
            key={deck.id}
            className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />

            <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-1 relative z-10">
              {deck.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 relative z-10">
              {deck.description}
            </p>

            <div className="flex items-center justify-between mt-auto relative z-10">
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
                {deck.cardCount} cards
              </span>

              <Button
                onClick={() => handleClaim(deck.id!)}
                disabled={claimingId === deck.id}
                size="sm"
                className={cn(
                  "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 transition-colors",
                  claimingId === deck.id && "opacity-70 cursor-not-allowed",
                )}
              >
                {claimingId === deck.id ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-1" />
                )}
                {claimingId === deck.id ? "Adding..." : "Add to Library"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
