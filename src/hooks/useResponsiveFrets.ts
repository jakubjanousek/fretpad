import { useEffect, useState } from "react";

const MOBILE_BASE = 8;
const TABLET_BASE = 10;
const DESKTOP_BASE = 12;

export function useResponsiveFrets(maxFrets: number): number {
  const [fretCount, setFretCount] = useState(maxFrets);

  useEffect(() => {
    const updateFretCount = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setFretCount(
          Math.min(
            Math.round((maxFrets * MOBILE_BASE) / DESKTOP_BASE),
            maxFrets,
          ),
        );
      } else if (width < 768) {
        setFretCount(
          Math.min(
            Math.round((maxFrets * TABLET_BASE) / DESKTOP_BASE),
            maxFrets,
          ),
        );
      } else {
        setFretCount(maxFrets);
      }
    };

    updateFretCount();
    window.addEventListener("resize", updateFretCount);
    return () => window.removeEventListener("resize", updateFretCount);
  }, [maxFrets]);

  return fretCount;
}
