import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CHANGELOG } from "@/config/changelog";
import { Sparkles, Bug, Wrench } from "lucide-react";

interface ChangelogModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangelogModal({ isOpen, onOpenChange }: ChangelogModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            What's New in VocaFlow
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 p-6 pt-2 overflow-y-auto">
          <div className="space-y-10">
            {CHANGELOG.map((release, index) => (
              <div key={release.version} className={`relative ${index !== CHANGELOG.length - 1 ? 'pb-10 border-b border-slate-100 dark:border-slate-800' : ''}`}>
                <div className="flex items-baseline gap-3 mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    v{release.version}
                  </h3>
                  <span className="text-sm text-slate-500 font-medium">
                    {new Date(release.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400 mb-6">
                  {release.title}
                </p>

                <div className="space-y-6">
                  {release.features && release.features.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        New Features
                      </h4>
                      <ul className="space-y-2">
                        {release.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                            <span className="select-none text-indigo-500 mt-1">•</span>
                            <span className="leading-relaxed">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {release.improvements && release.improvements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-emerald-500" />
                        Improvements
                      </h4>
                      <ul className="space-y-2">
                        {release.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                            <span className="select-none text-emerald-500 mt-1">•</span>
                            <span className="leading-relaxed">{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {release.bugfixes && release.bugfixes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Bug className="w-4 h-4 text-rose-500" />
                        Bug Fixes
                      </h4>
                      <ul className="space-y-2">
                        {release.bugfixes.map((bug, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                            <span className="select-none text-rose-500 mt-1">•</span>
                            <span className="leading-relaxed">{bug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
