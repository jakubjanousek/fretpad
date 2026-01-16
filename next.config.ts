import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  // Empty turbopack config tells Next.js we intentionally have webpack config
  // (from Serwist) but want to use Turbopack for dev
  turbopack: {},
};

export default withSerwist(nextConfig);
