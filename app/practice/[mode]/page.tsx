import { notFound } from "next/navigation";
import { isValidModeId } from "@/lib/modes";
import type { PracticeModeId } from "@/lib/types";
import { PracticePage } from "./PracticePage";

export default async function Page({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode } = await params;
  if (!isValidModeId(mode)) {
    notFound();
  }
  return <PracticePage modeId={mode as PracticeModeId} />;
}
