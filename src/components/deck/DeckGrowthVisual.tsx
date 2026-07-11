import { motion, type TargetAndTransition, type Transition } from "framer-motion";

interface DeckGrowthVisualProps {
  masteryPercentage: number;
  daysSinceLastStudy?: number;
}

// ─── Stage helpers ───────────────────────────────────────────────
type Stage = "egg" | "cracked" | "chick" | "rooster";

function getStage(mastery: number): Stage {
  if (mastery > 75) return "rooster";
  if (mastery > 50) return "chick";
  if (mastery > 25) return "cracked";
  return "egg";
}

function getLabel(stage: Stage): string {
  switch (stage) {
    case "egg":
      return "Whole Egg";
    case "cracked":
      return "Cracked Egg";
    case "chick":
      return "Chick";
    case "rooster":
      return "Alpha Rooster";
  }
}

// ─── Mascot image paths ──────────────────────────────────────────
const mascotImages: Record<Stage, string> = {
  egg: "/mascots/egg.png",
  cracked: "/mascots/cracked.png",
  chick: "/mascots/chick.png",
  rooster: "/mascots/rooster.png",
};

// ─── Idle animation configs per stage ────────────────────────────
const idleAnimations: Record<Stage, { animate: TargetAndTransition; transition: Transition }> = {
  egg: {
    animate: { rotate: [-4, 4, -4] },
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
  cracked: {
    animate: { x: [-1.5, 1.5, -1.5, 1.5, 0] },
    transition: { duration: 0.45, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" },
  },
  chick: {
    animate: { y: [0, -6, 0] },
    transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2, ease: "easeOut" },
  },
  rooster: {
    animate: { scale: [1, 1.06, 1] },
    transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
  },
};

// ─── Main component ──────────────────────────────────────────────
export function DeckGrowthVisual({
  masteryPercentage,
  daysSinceLastStudy = 0,
}: DeckGrowthVisualProps) {
  const stage = getStage(masteryPercentage);
  const label = getLabel(stage);
  const neglected = daysSinceLastStudy > 3;
  const idle = idleAnimations[stage];

  return (
    <div
      className="relative inline-flex items-center justify-center"
      title={`${label} — ${masteryPercentage}% mastered${neglected ? " (neglected!)" : ""}`}
    >
      {/* Neglect "Zzz" bubble */}
      {neglected && (
        <span
          className="absolute -top-3 -right-3 z-10 bg-slate-700/85 text-white text-[11px] font-black rounded-full px-1.5 py-0.5 leading-none border-2 border-slate-500 select-none pointer-events-none"
          style={{ letterSpacing: "0.08em" }}
        >
          Zzz
        </span>
      )}

      {/* Animated mascot wrapper */}
      <motion.div
        animate={neglected ? {} : idle.animate}
        transition={neglected ? {} : idle.transition}
        className="flex items-center justify-center"
        style={{
          filter: neglected
            ? "grayscale(70%) opacity(0.5) drop-shadow(2px 2px 0px rgba(0,0,0,0.4))"
            : "drop-shadow(3px 3px 0px rgba(0,0,0,0.7))",
        }}
      >
        <img
          src={mascotImages[stage]}
          alt={label}
          className="w-10 h-10 object-contain select-none pointer-events-none"
          draggable={false}
        />
      </motion.div>
    </div>
  );
}
