const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (process.env.NODE_ENV === "production" && !siteUrl) {
  throw new Error("NEXT_PUBLIC_SITE_URL must be set in production.");
}

export const SITE_URL = siteUrl || "http://localhost:3000";
