import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewBannerProps {
  cardsDue: number;
}

export function ReviewBanner({ cardsDue }: ReviewBannerProps) {
  return (
    <AnimatePresence>
      {cardsDue > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg mx-auto max-w-3xl">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-xl animate-pulse">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Review Time!</h3>
                <p className="text-indigo-100 text-sm">
                  You have {cardsDue} cards due for review.
                </p>
              </div>
            </div>
            <Link to="/study">
              <Button
                variant="secondary"
                size="sm"
                className="font-bold shadow-sm"
              >
                Review All
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
