import { useEffect, useState } from "react";

const MOBILE_FRETS = 8;
const TABLET_FRETS = 10;

export function useResponsiveFrets(maxFrets: number): number {
  const [fretCount, setFretCount] = useState(maxFrets);

  useEffect(() => {
    const updateFretCount = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setFretCount(Math.min(MOBILE_FRETS, maxFrets));
      } else if (width < 768) {
        setFretCount(Math.min(TABLET_FRETS, maxFrets));
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
