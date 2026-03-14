import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidModeId, PRACTICE_MODE_IDS, PRACTICE_MODES } from "@/lib/modes";
import type { PracticeModeId } from "@/lib/types";
import { PracticePage } from "./PracticePage";

type Props = {
  params: Promise<{ mode: string }>;
};

export function generateStaticParams() {
  return PRACTICE_MODE_IDS.map((mode) => ({ mode }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mode } = await params;
  if (!isValidModeId(mode)) return {};
  const config = PRACTICE_MODES[mode as PracticeModeId];
  return {
    title: config.label,
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: Props) {
  const { mode } = await params;
  if (!isValidModeId(mode)) {
    notFound();
  }
  return <PracticePage modeId={mode as PracticeModeId} />;
}
