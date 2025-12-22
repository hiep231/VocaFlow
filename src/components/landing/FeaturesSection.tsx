import { motion } from "framer-motion";
import { Mic, Zap, Trophy } from "lucide-react";

export function FeaturesSection() {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20 text-left"
    >
      <FeatureCard
        icon={<Zap className="w-6 h-6 text-amber-500" />}
        title="Smart Flashcards"
        desc="Context-first learning with IPA, collocations, and auto-generated audio examples."
        delay={0.2}
      />
      <FeatureCard
        icon={<Mic className="w-6 h-6 text-red-500" />}
        title="Speaking Drills"
        desc="Real-time pronunciation feedback with visual audio analysis to perfect your accent."
        delay={0.4}
      />
      <FeatureCard
        icon={<Trophy className="w-6 h-6 text-green-500" />}
        title="Gamified Progress"
        desc="Earn XP, maintain streaks, and visualize your daily consistency with heatmaps."
        delay={0.6}
      />
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
    >
      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}
