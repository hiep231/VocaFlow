import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Card } from "@/types";

interface ManualImportTabProps {
  manualCards: Partial<Card>[];
  onUpdateCard: (index: number, field: keyof Card, value: string) => void;
  onRemoveRow: (index: number) => void;
  onAddRow: () => void;
}

export function ManualImportTab({
  manualCards,
  onUpdateCard,
  onRemoveRow,
  onAddRow,
}: ManualImportTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2">
        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm animate-in zoom-in">
          {manualCards.length} Cards
        </span>
      </div>
      <AnimatePresence>
        {manualCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/30 flex flex-col md:flex-row gap-4 relative group"
          >
            <div className="absolute top-2 right-2 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-400 hover:text-red-500"
                onClick={() => onRemoveRow(index)}
                disabled={manualCards.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Desktop: Row Layout / Mobile: Stack Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase md:hidden">
                  Term
                </label>
                <Input
                  placeholder="Term"
                  value={card.term || ""}
                  onChange={(e) => onUpdateCard(index, "term", e.target.value)}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase md:hidden">
                  Definition
                </label>
                <Input
                  placeholder="Definition"
                  value={card.definition || ""}
                  onChange={(e) =>
                    onUpdateCard(index, "definition", e.target.value)
                  }
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase md:hidden">
                  IPA
                </label>
                <Input
                  placeholder="/ipa/"
                  value={card.ipa || ""}
                  onChange={(e) => onUpdateCard(index, "ipa", e.target.value)}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 font-mono text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase md:hidden">
                  Collocation (Cụm từ)
                </label>
                <Input
                  placeholder="Collocation"
                  value={card.collocation || ""}
                  onChange={(e) =>
                    onUpdateCard(index, "collocation", e.target.value)
                  }
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <div className="md:col-span-12 space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase md:hidden">
                  Example
                </label>
                <Textarea
                  placeholder="Example sentence..."
                  value={card.example || ""}
                  onChange={(e) =>
                    onUpdateCard(index, "example", e.target.value)
                  }
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[60px]"
                />
              </div>
            </div>

            {/* Desktop Delete Button */}
            <div className="hidden md:flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => onRemoveRow(index)}
                disabled={manualCards.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button
        variant="outline"
        onClick={onAddRow}
        className="w-full md:w-auto border-dashed"
      >
        <Plus className="w-4 h-4 mr-2" /> Add Another Card
      </Button>
    </div>
  );
}
