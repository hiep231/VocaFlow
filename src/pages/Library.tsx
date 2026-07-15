import { useState, useMemo } from "react";
import { deckService } from "@/services/deck-service";
import type { Deck } from "@/types";
import { LibraryDeckCard } from "@/components/library/LibraryDeckCard";
import { DeckPreviewModal } from "@/components/library/DeckPreviewModal";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const {
    data: decks = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["publicDecks"],
    queryFn: deckService.getPublicDecks,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const filteredDecks = useMemo(() => {
    if (!searchQuery.trim()) return decks;
    const q = searchQuery.toLowerCase();
    return decks.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.authorName?.toLowerCase().includes(q)
    );
  }, [decks, searchQuery]);

  const handleDeckClick = (deck: Deck) => {
    setSelectedDeck(deck);
    setIsPreviewOpen(true);
  };

  return (
    <div className="w-full relative">
      <div className="container mx-auto px-4 py-8 pb-32 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Public Library
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Explore and clone decks shared by the community.
          </p>
        </div>

        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search decks, authors..."
            className="pl-10 text-slate-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : filteredDecks.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No decks found
            </h3>
            <p className="text-slate-500">
              {searchQuery
                ? "Try adjusting your search terms."
                : "The library is currently empty."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks.map((deck) => (
              <LibraryDeckCard
                key={deck.id}
                deck={deck}
                onClick={handleDeckClick}
              />
            ))}
          </div>
        )}

        <DeckPreviewModal
          deck={selectedDeck}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onCloneSuccess={() => {
            // Optional: refresh public decks if needed, or redirect user?
            // For now, staying on library is fine.
            refetch(); // to update download counts potentially
          }}
        />
      </div>
    </div>
  );
}
