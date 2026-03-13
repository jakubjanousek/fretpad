"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PracticeModeConfig } from "@/lib/types";

interface ModeHeaderProps {
  modeConfig: PracticeModeConfig;
}

export function ModeHeader({ modeConfig }: ModeHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          // Clear auto-resume before navigating — don't call exitMode()
          // because it sets activeMode=null, which triggers the practice
          // page's useEffect to re-enter the mode (race condition).
          try {
            localStorage.removeItem("fretpad-last-mode");
          } catch {
            // Ignore
          }
          router.push("/");
        }}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Back to launcher"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
        {modeConfig.label}
      </h1>
    </div>
  );
}
