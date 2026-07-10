import { motion } from "framer-motion";
import { Sprout, TreePine, Flower2, Bean } from "lucide-react";

interface DeckGrowthVisualProps {
  masteryPercentage: number;
}

export function DeckGrowthVisual({ masteryPercentage }: DeckGrowthVisualProps) {
  let Icon = Bean;
  let colorClass = "text-amber-600 dark:text-amber-500";
  let bgClass = "bg-amber-100 dark:bg-amber-950/30";
  let label = "Seed";

  if (masteryPercentage > 75) {
    Icon = Flower2; // Blooming Tree / Flower
    colorClass = "text-pink-600 dark:text-pink-500";
    bgClass = "bg-pink-100 dark:bg-pink-950/30";
    label = "Blooming Tree";
  } else if (masteryPercentage > 50) {
    Icon = TreePine; // Small Plant / Tree
    colorClass = "text-emerald-600 dark:text-emerald-500";
    bgClass = "bg-emerald-100 dark:bg-emerald-950/30";
    label = "Small Plant";
  } else if (masteryPercentage > 25) {
    Icon = Sprout; // Sprout
    colorClass = "text-green-600 dark:text-green-500";
    bgClass = "bg-green-100 dark:bg-green-950/30";
    label = "Sprout";
  }

  return (
    <div 
      className={`flex items-center justify-center p-2 rounded-xl ${bgClass} shadow-sm`} 
      title={`${label} (${masteryPercentage}% mastered)`}
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </motion.div>
    </div>
  );
}
