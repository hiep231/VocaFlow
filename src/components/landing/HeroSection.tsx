import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onStartClick: () => void;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120 } as any,
  },
};

export function HeroSection({ onStartClick }: HeroSectionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-4">
          ✨ The new way to master English
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white">
          Master Vocabulary <br /> with{" "}
          <span className="text-indigo-600 dark:text-indigo-400">Context.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Stop memorizing word lists. VocaFlow combines{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Spaced Repetition
          </span>
          ,{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Game Mechanics
          </span>
          , and{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Speech Recognition
          </span>{" "}
          to help you speak confidently.
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
      >
        <Button
          size="lg"
          className="h-14 px-8 text-lg rounded-full shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-105"
          onClick={onStartClick}
        >
          Start Learning Now <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-14 px-8 text-lg rounded-full border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white transition-all hover:scale-105"
        >
          View Demo
        </Button>
      </motion.div>
    </motion.div>
  );
}
