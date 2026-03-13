"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Launcher } from "@/components/modes/Launcher";
import { isValidModeId } from "@/lib/modes";

export default function Page() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const lastMode = localStorage.getItem("fretpad-last-mode");
      if (lastMode && isValidModeId(lastMode)) {
        router.replace(`/practice/${lastMode}`);
        return;
      }
    } catch {
      // Ignore localStorage errors
    }
    setChecked(true);
  }, [router]);

  // Don't render launcher until we've checked for auto-resume
  if (!checked) return null;

  return <Launcher />;
}
