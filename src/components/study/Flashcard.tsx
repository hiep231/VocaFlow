import { motion, useAnimation, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Volume2, RotateCw, Check, X, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import type { Card } from "@/types";
import type { ReviewRating } from "@/lib/srs-algorithm";

interface FlashcardProps {
  cardData: Card;
  isFlipped: boolean;
  onFlip: () => void;
  onRate?: (rating: ReviewRating) => void;
}

const Flashcard = ({ cardData, isFlipped, onFlip, onRate }: FlashcardProps) => {
  const { speak, isSpeaking } = useTextToSpeech({
    text: cardData.term,
    rate: 0.8,
  });

  const handleSpeakerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak();
  };

  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Background overlays based on drag position
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacityRight = useTransform(x, [0, 100], [0, 1]);
  const opacityLeft = useTransform(x, [0, -100], [0, 1]);
  const opacityTop = useTransform(y, [0, -100], [0, 1]);

  const handleDragEnd = async (e: any, info: PanInfo) => {
    const offset = info.offset;
    const swipeThreshold = 100;

    if (offset.x > swipeThreshold) {
      // Swiped right (Good)
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
      if (onRate) onRate("good");
      controls.set({ x: 0, y: 0, opacity: 1 });
    } else if (offset.x < -swipeThreshold) {
      // Swiped left (Fail)
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
      if (onRate) onRate("fail");
      controls.set({ x: 0, y: 0, opacity: 1 });
    } else if (offset.y < -swipeThreshold) {
      // Swiped up (Hard)
      await controls.start({ y: -500, opacity: 0, transition: { duration: 0.3 } });
      if (onRate) onRate("hard");
      controls.set({ x: 0, y: 0, opacity: 1 });
    } else {
      // Spring back
      controls.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  return (
    <motion.div
      className="w-full max-w-xl mx-auto cursor-grab active:cursor-grabbing group perspective-1000 relative"
      onClick={onFlip}
      drag={isFlipped ? true : false}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{ x, y, rotate }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        // THAY ĐỔI 1: Chuyển sang Grid để các con xếp chồng lên nhau
        className="relative w-full grid grid-cols-1"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Visual Overlays */}
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center bg-green-500/20 rounded-2xl pointer-events-none"
          style={{ opacity: opacityRight }}
        >
          <div className="bg-green-500 text-white p-4 rounded-full shadow-lg border-4 border-white">
            <Check size={48} />
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center bg-red-500/20 rounded-2xl pointer-events-none"
          style={{ opacity: opacityLeft }}
        >
          <div className="bg-red-500 text-white p-4 rounded-full shadow-lg border-4 border-white">
            <X size={48} />
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center bg-orange-500/20 rounded-2xl pointer-events-none"
          style={{ opacity: opacityTop }}
        >
          <div className="bg-orange-500 text-white p-4 rounded-full shadow-lg border-4 border-white">
            <Flame size={48} />
          </div>
        </motion.div>
        {/* ================================================== */}
        {/* MẶT TRƯỚC (FRONT) */}
        {/* ================================================== */}
        <div
          // THAY ĐỔI 2:
          // - Bỏ absolute inset-0
          // - Thêm col-start-1 row-start-1 (để chồng lên nhau)
          // - Bỏ overflow-y-auto (để div tự giãn cao)
          className="col-start-1 row-start-1 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-2 border-transparent bg-clip-padding flex flex-col items-center justify-center p-6 md:p-8 text-center ring-1 ring-white/20"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Gradient Border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-indigo-100 dark:border-indigo-500/30 pointer-events-none" />

          <div className="absolute top-6 right-6 text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1.5 opacity-60 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
            <RotateCw size={12} /> Flip
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white drop-shadow-sm">
            {cardData.term}
          </h2>

          {cardData.ipa && (
            <span className="mb-6 px-3 py-1 text-sm font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700 inline-block">
              {cardData.ipa}
            </span>
          )}

          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full h-14 w-14 hover:scale-110 transition-transform duration-200 ${
              isSpeaking
                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                : "text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            onClick={handleSpeakerClick}
          >
            <Volume2 className="h-7 w-7" />
          </Button>
        </div>

        {/* ================================================== */}
        {/* MẶT SAU (BACK) */}
        {/* ================================================== */}
        <div
          // THAY ĐỔI 3: Tương tự mặt trước
          // - Bỏ absolute inset-0, thêm col-start-1 row-start-1
          // - Bỏ overflow-y-auto
          className="col-start-1 row-start-1 w-full bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-xl border-2 border-indigo-50 dark:border-indigo-900/30 flex flex-col items-center justify-center p-6 md:p-10 text-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {cardData.ipa && (
            <span className="mb-6 px-3 py-1 text-sm font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700 inline-block">
              {cardData.ipa}
            </span>
          )}

          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">
            {cardData.definition}
          </h3>

          <Separator className="my-2 w-16 bg-slate-200 dark:bg-slate-700 mx-auto mb-6" />

          <div className="text-left w-full space-y-4 text-sm">
            {cardData.collocation && (
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border-l-4 border-blue-500 shadow-sm relative overflow-hidden text-left w-full">
                <span className="font-bold text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wider mb-2 block">
                  Collocation
                </span>
                <span className="text-slate-700 dark:text-slate-200 font-medium italic block text-base leading-relaxed">
                  {cardData.collocation}
                </span>
              </div>
            )}

            {cardData.example && (
              <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border-l-4 border-slate-300 dark:border-slate-600 shadow-sm relative overflow-hidden text-left w-full">
                <span className="font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-2 block">
                  Example
                </span>
                <p className="text-slate-700 dark:text-slate-200 text-base leading-relaxed italic">
                  "{cardData.example}"
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Flashcard;
