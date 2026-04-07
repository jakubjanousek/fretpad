import { redirect } from "next/navigation";
import { DEFAULT_SHARE_MODE } from "@/lib/modes";

export default function Page() {
  redirect(`/practice/${DEFAULT_SHARE_MODE}`);
}
