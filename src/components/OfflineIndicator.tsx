"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Subtle badge shown when the browser is offline.
 * Listens to online/offline events and auto-dismisses when connectivity returns.
 */
export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Set initial state (avoid SSR mismatch by only reading in effect)
    setOffline(!navigator.onLine);

    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-3 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-md">
        <WifiOff className="h-3.5 w-3.5" />
        <span>Offline</span>
      </div>
    </div>
  );
}
