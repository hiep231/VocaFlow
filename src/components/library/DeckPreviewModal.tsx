import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, User, BookOpen } from "lucide-react";
import type { Deck } from "@/types";
import { deckService } from "@/services/deck-service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface DeckPreviewModalProps {
  deck: Deck | null;
  isOpen: boolean;
  onClose: () => void;
  onCloneSuccess: () => void;
}

export function DeckPreviewModal({
  deck,
  isOpen,
  onClose,
  onCloneSuccess,
}: DeckPreviewModalProps) {
  const [cloning, setCloning] = useState(false);
  const { currentUser } = useAuth();

  const { data: cards = [], isLoading: loading } = useQuery({
    queryKey: ["previewCards", deck?.id],
    queryFn: async () => {
      if (deck?.id) {
        // If snapshot exists, use it for instant preview
        if (deck.cardsSnapshot && deck.cardsSnapshot.length > 0) {
          return deck.cardsSnapshot;
        }
        return deckService.getPreviewCards(deck.id);
      }
      return [];
    },
    enabled: isOpen && !!deck?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const queryClient = useQueryClient();

  const handleClone = async () => {
    if (!deck?.id || !currentUser) return;

    try {
      setCloning(true);
      await deckService.cloneDeck(deck.id, currentUser.uid);
      toast.success("Deck cloned to your collection!");
      
      // Invalidate dashboard queries so the new deck shows up immediately
      queryClient.invalidateQueries({ queryKey: ["decks", currentUser.uid] });
      queryClient.invalidateQueries({ queryKey: ["allCards", currentUser.uid] });
      
      onCloneSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to clone deck", error);
      toast.error("Failed to clone deck");
    } finally {
      setCloning(false);
    }
  };

  if (!deck) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                {deck.title}
              </DialogTitle>
              <DialogDescription className="mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <User className="w-3.5 h-3.5" />
                  {deck.authorName || "Unknown Author"}
                </span>
                <span>•</span>
                <span>{deck.cardCount} cards</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" />
                  {deck.downloads || 0}
                </span>
              </DialogDescription>
            </div>
          </div>

          {deck.description && (
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-2">
              {deck.description}
            </p>
          )}
        </DialogHeader>

        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-3 text-slate-900 dark:text-white">
            Preview (First {cards.length} cards)
          </h4>

          <div className="h-[250px] w-full rounded-md border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950/50 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            ) : cards.length > 0 ? (
              <div className="space-y-3">
                {cards.map((card, idx) => (
                  <div
                    key={card.id || idx}
                    className="flex justify-between items-start gap-4 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex-1 font-medium text-slate-900 dark:text-slate-200">
                      {card.term}
                    </div>
                    <div className="flex-1 text-slate-600 dark:text-slate-400 text-sm">
                      {card.definition}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">
                No cards available for preview.
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={cloning}>
            Cancel
          </Button>
          {deck.userId === currentUser?.uid ? (
            <Button variant="outline" disabled className="bg-gray-400 text-gray-700 cursor-not-allowed">
              Your Deck (cannot clone)
            </Button>
          ) : (
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              onClick={handleClone}
              disabled={cloning}
            >
              {cloning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cloning...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Clone to My Collection
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
