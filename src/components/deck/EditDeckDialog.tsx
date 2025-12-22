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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Deck</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-public" className="text-right">
              Public
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="edit-public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <span className="text-sm text-slate-500">
                Allow others to view and clone this deck
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
