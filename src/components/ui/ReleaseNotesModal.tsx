import { Sparkles, Bug, Zap, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReleaseEntry } from "@/config/changelog";
import { CURRENT_APP_VERSION } from "@/config/changelog";
import { Button } from "@/components/ui/button";

interface ReleaseNotesModalProps {
  open: boolean;
  release: ReleaseEntry | null;
  onDismiss: () => void;
}

function SectionTitle({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-2 mb-2 ${color}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-xs font-bold uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
        >
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-50" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ReleaseNotesModal({
  open,
  release,
  onDismiss,
}: ReleaseNotesModalProps) {
  if (!release) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Overlay ────────────────────────────────────────────────────────── */}
          {/* z-[60]: above dropdowns (z-50), below Sonner toasts (z-[100])        */}
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDismiss}
          />

          {/* ── Centering wrapper (Flexbox, no transform conflict) ─────────────── */}
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
            {/* ── Panel ──────────────────────────────────────────────────────────── */}
            {/* Mobile: slides up from bottom as a sheet                            */}
            {/* Desktop: scales in from center                                      */}
            <motion.div
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="release-modal-title"
              className="pointer-events-auto w-full max-w-[90vw] sm:max-w-lg"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="
                  relative bg-white dark:bg-slate-900
                  /* Center modal style */
                  rounded-2xl
                  shadow-2xl
                  border border-slate-200 dark:border-slate-700
                  overflow-hidden
                  /* Mobile: limit to 90dvh; desktop: 85vh */
                  max-h-[90dvh] sm:max-h-[85vh]
                  flex flex-col
                "
              >
                {/* ── Gradient header ── */}
                <div className="relative h-28 sm:h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex-shrink-0">
                  {/* Subtle dot grid */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {/* Title area */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-8 text-center">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse flex-shrink-0" />
                      <h2
                        id="release-modal-title"
                        className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight"
                      >
                        What's New in v{CURRENT_APP_VERSION}
                      </h2>
                      <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse flex-shrink-0" />
                    </div>
                    <p className="text-indigo-100 text-sm font-medium">
                      {release.title}
                    </p>
                    <span className="mt-1 text-[11px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-semibold tracking-wide">
                      {release.date}
                    </span>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={onDismiss}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/20 hover:bg-white/35 text-white transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>


                </div>

                {/* ── Scrollable content ── */}
                <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-6 space-y-6">
                  {release.features && release.features.length > 0 && (
                    <section>
                      <SectionTitle
                        icon={Sparkles}
                        label="New Features"
                        color="text-indigo-600 dark:text-indigo-400"
                      />
                      <BulletList items={release.features} />
                    </section>
                  )}

                  {release.improvements && release.improvements.length > 0 && (
                    <section>
                      <SectionTitle
                        icon={Zap}
                        label="Improvements"
                        color="text-amber-600 dark:text-amber-400"
                      />
                      <BulletList items={release.improvements} />
                    </section>
                  )}

                  {release.bugfixes && release.bugfixes.length > 0 && (
                    <section>
                      <SectionTitle
                        icon={Bug}
                        label="Bug Fixes"
                        color="text-emerald-600 dark:text-emerald-400"
                      />
                      <BulletList items={release.bugfixes} />
                    </section>
                  )}
                </div>

                {/* ── Footer ── */}
                <div className="px-6 sm:px-8 pb-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                  <Button
                    onClick={onDismiss}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-base sm:text-sm"
                  >
                    Got it, let's study! 🚀
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
