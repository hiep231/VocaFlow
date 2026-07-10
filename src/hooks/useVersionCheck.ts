import { useState, useEffect, useCallback } from "react";
import { CURRENT_APP_VERSION, CHANGELOG, type ReleaseEntry } from "@/config/changelog";

const STORAGE_KEY = "vocaflow_lastSeenVersion";

interface UseVersionCheckResult {
  showReleaseNotes: boolean;
  latestRelease: ReleaseEntry | null;
  dismiss: () => void;
}

/**
 * Compares two semver strings. Returns true if `a` is greater than `b`.
 */
function isNewerVersion(a: string, b: string): boolean {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff > 0) return true;
    if (diff < 0) return false;
  }
  return false; // equal
}

export function useVersionCheck(): UseVersionCheckResult {
  const latestRelease = CHANGELOG[0] ?? null;

  const [showReleaseNotes, setShowReleaseNotes] = useState<boolean>(() => {
    try {
      const lastSeen = localStorage.getItem(STORAGE_KEY);
      if (!lastSeen) return true;
      return isNewerVersion(CURRENT_APP_VERSION, lastSeen);
    } catch {
      // localStorage unavailable (SSR / private browsing edge case)
      return false;
    }
  });

  // Persist dismissal so closing via Escape / outside-click also writes localStorage.
  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, CURRENT_APP_VERSION);
    } catch {
      // ignore
    }
    setShowReleaseNotes(false);
  }, []);

  return { showReleaseNotes, latestRelease, dismiss };
}
