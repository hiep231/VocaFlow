import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";

interface LimitInfo {
  maxNew: number;
  studiedNew: number;
  maxReview: number;
  studiedReview: number;
}

interface StudyCompletionProps {
  deckId?: string;
  limitReached?: boolean;
  limitInfo?: LimitInfo;
  onReviewAgain?: () => void;
  isCramMode?: boolean;
}

export function StudyCompletion({ deckId, limitReached, limitInfo, onReviewAgain, isCramMode }: StudyCompletionProps) {

  const handleReviewAgainClick = (e: React.MouseEvent) => {
    if (isCramMode && onReviewAgain) {
      e.preventDefault();
      onReviewAgain();
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] h-screen px-4 text-center bg-slate-50 dark:bg-slate-950 w-full">
      <div className={`mb-6 ${limitReached ? 'text-amber-500' : 'text-green-500'}`}>
        {limitReached ? <AlertCircle className="w-16 h-16" /> : <CheckCircle className="w-16 h-16" />}
      </div>
      <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
        {limitReached ? "Daily Limit Reached!" : "Session Complete!"}
      </h2>
      
      {limitReached && limitInfo ? (
        <div className="mb-8 max-w-md">
          <p className="text-slate-600 dark:text-slate-400 mb-4 text-lg">
            You have more cards due, but you've reached your daily review limit.
          </p>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-left shadow-sm">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Today's Progress:</h4>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">New Cards:</span>
              <span className={`font-medium ${limitInfo.studiedNew >= limitInfo.maxNew ? 'text-amber-500' : 'text-green-500'}`}>
                {limitInfo.studiedNew} / {limitInfo.maxNew}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Review Cards:</span>
              <span className={`font-medium ${limitInfo.studiedReview >= limitInfo.maxReview ? 'text-amber-500' : 'text-green-500'}`}>
                {limitInfo.studiedReview} / {limitInfo.maxReview}
              </span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm">
            You can continue studying in Cram Mode without affecting your stats.
          </p>
        </div>
      ) : (
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
          You've reviewed all due cards for now. Great job!
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        {deckId && (
          <Link to={`/study/${deckId}?cram=true`} onClick={handleReviewAgainClick}>
            <Button
              variant={limitReached ? "default" : "outline"}
              size="lg"
              className={limitReached 
                ? "flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                : "flex items-center gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }
            >
              <RotateCw className="w-4 h-4" />
              {limitReached ? "Continue in Cram Mode" : "Review Again"}
            </Button>
          </Link>
        )}
        {!deckId && limitReached && (
          <Link to={`/study?cram=true`}>
            <Button
              variant="default"
              size="lg"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <RotateCw className="w-4 h-4" />
              Cram All Due Cards
            </Button>
          </Link>
        )}

        <Link to={deckId ? `/decks/${deckId}` : "/dashboard"}>
          <Button
            variant={limitReached ? "outline" : "default"}
            size="lg"
            className={limitReached 
              ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              : "bg-indigo-600 hover:bg-indigo-700 text-white border-0"
            }
          >
            {deckId ? "Back to Deck" : "Back to Dashboard"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
