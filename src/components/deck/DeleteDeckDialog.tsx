import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import type { Deck } from "@/types";
import { useState, useEffect } from "react";

interface DeleteDeckDialogProps {
  deckToDelete: Deck | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (e: React.MouseEvent) => void;
}

export function DeleteDeckDialog({
  deckToDelete,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteDeckDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const isMatch = deckToDelete ? confirmText === deckToDelete.title : false;

  // Reset input when the dialog opens/changes deck
  useEffect(() => {
    if (deckToDelete) {
      setConfirmText("");
    }
  }, [deckToDelete]);

  return (
    <AlertDialog open={!!deckToDelete} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md dark:bg-slate-950 dark:border-slate-800 dark:text-white">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 text-red-500 mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-xl text-slate-900 dark:text-white">
              Delete Deck
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-slate-600 dark:text-slate-300">
            This action cannot be undone. This will permanently delete the{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              "{deckToDelete?.title}"
            </span>{" "}
            deck and all <span className="font-semibold">cards</span> contained
            within it.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-3">
          <Label
            htmlFor="confirm-deck-name"
            className="text-sm font-medium dark:text-slate-200"
          >
            To confirm, type{" "}
            <span className="font-bold select-all text-slate-900 dark:text-white">
              "{deckToDelete?.title}"
            </span>{" "}
            below:
          </Label>
          <Input
            id="confirm-deck-name"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={deckToDelete?.title}
            className="w-full dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
            autoComplete="off"
            onPaste={(e) => e.preventDefault()}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            onClick={() => setConfirmText("")}
            className="dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 dark:border-slate-700"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 transition-all"
            onClick={onConfirm}
            disabled={!isMatch || isDeleting}
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete Deck"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
