import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildDocumentTitle } from "@/lib/documentTitle";
import { isValidModeId, PRACTICE_MODE_IDS, PRACTICE_MODES } from "@/lib/modes";
import type { PracticeModeId } from "@/lib/types";
import { PracticePage } from "./PracticePage";

type Props = {
  params: Promise<{ mode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return PRACTICE_MODE_IDS.map((mode) => ({ mode }));
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { mode } = await params;
  if (!isValidModeId(mode)) return {};

  const sp = await searchParams;
  const name = typeof sp.name === "string" ? sp.name : "";
  const chords = typeof sp.chords === "string" ? sp.chords : "";

  let title: string;
  if (name || chords) {
    const bars = chords
      ? chords.split("|").map((b) => ({ chords: b.trim().split(/\s+/) }))
      : [];
    title = buildDocumentTitle({ name, bars });
  } else {
    const config = PRACTICE_MODES[mode as PracticeModeId];
    title = config.label;
  }

  return {
    title: { absolute: title },
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
