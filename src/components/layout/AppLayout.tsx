import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ReleaseNotesModal } from "@/components/ui/ReleaseNotesModal";
import { useAuth } from "@/contexts/AuthContext";
import { useVersionCheck } from "@/hooks/useVersionCheck";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  bgTheme?: "default" | "study" | "deck";
}

export function AppLayout({
  children,
  hideHeader,
  hideFooter,
  bgTheme = "default",
}: AppLayoutProps) {
  const { logout } = useAuth();
  const { showReleaseNotes, latestRelease, dismiss } = useVersionCheck();

  // Pick background blobs based on theme to maintain the unique vibe of certain pages
  // while keeping the codebase DRY.
  const getBackgroundBlobs = () => {
    switch (bgTheme) {
      case "study":
        return (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none transform-gpu" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl pointer-events-none transform-gpu" />
          </>
        );
      case "deck":
        return (
          <>
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[60%] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-normal animate-pulse-slow z-0" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[60%] bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-normal animate-pulse-slow delay-1000 z-0" />
          </>
        );
      case "default":
      default:
        // Dashboard doesn't traditionally have blobs, but we can keep it clean or add subtle ones
        return null;
    }
  };

  return (
    <div className="min-w-full min-h-screen relative bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col">
      {getBackgroundBlobs()}

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col h-full w-full">
        {!hideHeader && <DashboardHeader onLogout={logout} />}

        {/* Child pages will render here. We let them decide their own max-width constraints. */}
        <div className="flex-1 w-full h-full">{children}</div>

        {!hideFooter && (
          <footer className="w-full py-6 text-center text-slate-400 text-sm border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
            <p>
              Built with ❤️ by{" "}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Hiep DT
              </span>
            </p>
            <p className="text-xs mt-1 opacity-70">
              © {new Date().getFullYear()} VocaFlow. All rights reserved.
            </p>
          </footer>
        )}
      </div>

      {/* App-level Modals */}
      <ReleaseNotesModal
        open={showReleaseNotes}
        release={latestRelease}
        onDismiss={dismiss}
      />
    </div>
  );
}
