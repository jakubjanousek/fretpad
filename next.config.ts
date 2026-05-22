import withSerwistInit from "@serwist/next";
import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  // Empty turbopack config tells Next.js we intentionally have webpack config
  // (from Serwist) but want to use Turbopack for dev
  turbopack: {},
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

// botid is typed against an older Next.js release; the config shape is
// compatible at runtime, so cast to the parameter type withBotId expects.
export default withBotId(
  withSerwist(nextConfig) as Parameters<typeof withBotId>[0],
);
