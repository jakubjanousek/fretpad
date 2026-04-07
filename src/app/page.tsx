import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { DEFAULT_SHARE_MODE } from "@/lib/modes";
import { decodeStateFromUrl } from "@/lib/persistence";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ chords?: string; tempo?: string; p?: string }>;
}) {
  const { chords, tempo, p } = await searchParams;

  // New readable format: ?chords=Dm7|G7|Cmaj7&tempo=140
  if (chords) {
    const params = new URLSearchParams();
    params.set("chords", chords);
    if (tempo) params.set("tempo", tempo);
    redirect(`/practice/${DEFAULT_SHARE_MODE}?${params.toString()}`);
  }

  // Legacy base64 format: ?p=eyJwcm9...
  if (p && decodeStateFromUrl(p)) {
    redirect(`/practice/${DEFAULT_SHARE_MODE}?p=${encodeURIComponent(p)}`);
  }

  return <LandingPage />;
}
