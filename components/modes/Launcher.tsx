"use client";

import { Eye, Guitar, Music } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PRACTICE_MODES } from "@/lib/modes";
import type { PracticeModeId } from "@/lib/types";

const MODE_ICONS: Record<PracticeModeId, React.ReactNode> = {
  "learn-the-neck": <Eye className="w-6 h-6" />,
  "outline-chord-changes": <Music className="w-6 h-6" />,
  "comp-with-voicings": <Guitar className="w-6 h-6" />,
};

const MODE_ORDER: PracticeModeId[] = [
  "learn-the-neck",
  "outline-chord-changes",
  "comp-with-voicings",
];

export function Launcher() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            FretPad
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
            What do you want to practice today?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
          {MODE_ORDER.map((modeId) => {
            const config = PRACTICE_MODES[modeId];
            return (
              <Link
                key={modeId}
                href={`/practice/${config.id}`}
                className="block group"
              >
                <Card className="h-full transition-all hover:shadow-md hover:border-foreground/20 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                  <CardContent className="flex flex-col items-center text-center gap-3 py-8 px-6">
                    <div className="p-3 rounded-full bg-muted text-foreground">
                      {MODE_ICONS[modeId]}
                    </div>
                    <h2 className="font-semibold text-lg">{config.label}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {config.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
