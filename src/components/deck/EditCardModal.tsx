import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Card } from "@/types";
import { toast } from "sonner";

interface EditCardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditCardModal({
  card,
  isOpen,
  onClose,
  onSuccess,
}: EditCardModalProps) {
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [ipa, setIpa] = useState("");
  const [example, setExample] = useState("");
  const [collocation, setCollocation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (card) {
      setTerm(card.term);
      setDefinition(card.definition);
      setIpa(card.ipa || "");
      setExample(card.example || "");
      setCollocation(card.collocation || "");
    }
  }, [card]);

  const handleSave = async () => {
    if (!card?.id) return;
    if (!term.trim() || !definition.trim()) {
      toast.error("Term and Definition are required.");
      return;
    }

    try {
      setLoading(true);
      const cardRef = doc(db, "cards", card.id);

      await updateDoc(cardRef, {
        term,
        definition,
        ipa: ipa || null,
        example: example || null,
        collocation: collocation || null,
        updatedAt: serverTimestamp(),
      });

      toast.success("Card updated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating card:", error);
      toast.error("Failed to update card.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[90vw] sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            Edit Card
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="term"
              className="text-slate-700 dark:text-slate-300"
            >
              Term
            </Label>
            <Input
              id="term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="definition"
              className="text-slate-700 dark:text-slate-300"
            >
              Definition
            </Label>
            <Textarea
              id="definition"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 rounded-lg max-h-32"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ipa" className="text-slate-700 dark:text-slate-300">
              IPA
            </Label>
            <Input
              id="ipa"
              value={ipa}
              onChange={(e) => setIpa(e.target.value)}
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
              placeholder="/.../"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="collocation"
              className="text-slate-700 dark:text-slate-300"
            >
              Collocation
            </Label>
            <Input
              id="collocation"
              value={collocation}
              onChange={(e) => setCollocation(e.target.value)}
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="example"
              className="text-slate-700 dark:text-slate-300"
            >
              Example
            </Label>
            <Textarea
              id="example"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 rounded-lg max-h-32"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg w-full sm:w-auto"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
