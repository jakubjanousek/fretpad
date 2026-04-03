import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { DEFAULT_SHARE_MODE } from "@/lib/modes";
import { decodeStateFromUrl } from "@/lib/persistence";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  if (p && decodeStateFromUrl(p)) {
    redirect(`/practice/${DEFAULT_SHARE_MODE}?p=${encodeURIComponent(p)}`);
  }
  return <LandingPage />;
}
