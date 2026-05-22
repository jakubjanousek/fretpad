import { Analytics } from "@vercel/analytics/react";
import { BotIdClient } from "botid/client";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { InstallPromptBanner } from "@/components/InstallPromptBanner";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FretPad — Practice Jazz Improvisation on Guitar",
    template: "%s | FretPad",
  },
  description:
    "Practice jazz improvisation over chord changes. Guide tones light up on a visual fretboard, jazz swing backing tracks groove, and your mic scores your solos.",
  openGraph: {
    type: "website",
    siteName: "FretPad",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FretPad",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// Routes guarded by Vercel BotID — keep in sync with the API route handlers.
const protectedRoutes = [{ path: "/api/feedback", method: "POST" }];

const themeScript = `
(function() {
  document.documentElement.classList.add('dark');
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <BotIdClient protect={protectedRoutes} />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Required for theme flash prevention */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased safe-area-pad`}
      >
        {children}
        <OfflineIndicator />
        <InstallPromptBanner />
        <Analytics />
      </body>
    </html>
  );
}
