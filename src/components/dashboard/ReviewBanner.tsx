import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewBannerProps {
  cardsDue: number;
  totalCardsDue?: number;
}

export function ReviewBanner({ cardsDue, totalCardsDue = 0 }: ReviewBannerProps) {
  const limitReached = cardsDue === 0 && totalCardsDue > 0;
  const shouldShow = cardsDue > 0 || limitReached;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className={`flex items-center justify-between p-4 rounded-2xl text-white shadow-lg mx-auto max-w-3xl ${limitReached ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-xl animate-pulse">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{limitReached ? 'Daily Limit Reached' : 'Review Time!'}</h3>
                <p className={`${limitReached ? 'text-amber-100' : 'text-indigo-100'} text-sm`}>
                  {limitReached 
                    ? `You have ${totalCardsDue} cards due, but you've reached your daily limit.` 
                    : `You have ${cardsDue} cards due for review.`}
                </p>
              </div>
            </div>
            <Link to={limitReached ? "/study?cram=true" : "/study"}>
              <Button
                variant="secondary"
                size="sm"
                className="font-bold shadow-sm"
              >
                {limitReached ? "Cram Mode" : "Review All"}
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
