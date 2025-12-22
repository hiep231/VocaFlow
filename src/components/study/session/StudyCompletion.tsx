import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, RotateCw } from "lucide-react";

interface StudyCompletionProps {
  deckId?: string;
}

export function StudyCompletion({ deckId }: StudyCompletionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] h-screen px-4 text-center bg-slate-50 dark:bg-slate-950 w-full">
      <div className="mb-6 text-green-500">
        <CheckCircle className="w-16 h-16" />
      </div>
      <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
        Session Complete!
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
        You've reviewed all due cards for now. Great job!
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {deckId && (
          <Link
            to={`/study/deck/${deckId}?cram=true`}
            onClick={() =>
              (window.location.href = `/study/deck/${deckId}?cram=true`)
            }
          >
            <Button
              variant="outline"
              size="lg"
              className="flex items-center gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCw className="w-4 h-4" />
              Review Again
            </Button>
          </Link>
        )}

        <Link to={deckId ? `/decks/${deckId}` : "/dashboard"}>
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
          >
            {deckId ? "Back to Deck" : "Back to Dashboard"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
