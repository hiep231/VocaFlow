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
import { Switch } from "@/components/ui/switch";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Deck } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface EditDeckDialogProps {
  deck: Deck | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditDeckDialog({
  deck,
  isOpen,
  onClose,
  onSuccess,
}: EditDeckDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (deck) {
      setTitle(deck.title || "");
      setDescription(deck.description || "");
      setIsPublic(deck.isPublic || false);
    }
  }, [deck]);

  const handleSave = async () => {
    if (!deck?.id) return;
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }

    try {
      setLoading(true);
      const deckRef = doc(db, "decks", deck.id);

      const updates: any = {
        title,
        description,
        isPublic,
        updatedAt: serverTimestamp(),
      };

      // If making public and authorName is missing, set it
      if (isPublic && !deck.authorName) {
        updates.authorName =
          currentUser?.displayName || currentUser?.email || "Anonymous";
      }

      await updateDoc(deckRef, updates);

      toast.success("Deck updated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating deck:", error);
      toast.error("Failed to update deck.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[425px] rounded-2xl bg-white dark:bg-slate-950 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            Edit Deck
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-slate-700 dark:text-slate-300"
            >
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              placeholder="e.g., Essential Grammar"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-slate-700 dark:text-slate-300"
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="dark:bg-slate-900 dark:border-slate-700 dark:text-white min-h-[100px]"
              placeholder="Briefly describe this deck..."
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="space-y-0.5">
              <Label
                htmlFor="edit-public"
                className="text-base text-slate-800 dark:text-slate-200"
              >
                Public Deck
              </Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Allow others to view and clone this deck
              </p>
            </div>
            <Switch
              id="edit-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
