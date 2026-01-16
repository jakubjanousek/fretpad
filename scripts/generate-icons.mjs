#!/usr/bin/env node
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const iconsDir = join(__dirname, "..", "public", "icons");

// Create a simple SVG icon with guitar fret design
const createSvg = (size, isMaskable = false) => {
  const padding = isMaskable ? size * 0.2 : size * 0.1;
  const innerSize = size - padding * 2;

  // Guitar fret-inspired design: orange on dark background
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#0a0a0a"/>
  <g transform="translate(${padding}, ${padding})">
    <!-- Fret lines (horizontal) -->
    <line x1="0" y1="${innerSize * 0.25}" x2="${innerSize}" y2="${innerSize * 0.25}" stroke="#374151" stroke-width="${size * 0.02}"/>
    <line x1="0" y1="${innerSize * 0.5}" x2="${innerSize}" y2="${innerSize * 0.5}" stroke="#374151" stroke-width="${size * 0.02}"/>
    <line x1="0" y1="${innerSize * 0.75}" x2="${innerSize}" y2="${innerSize * 0.75}" stroke="#374151" stroke-width="${size * 0.02}"/>

    <!-- Strings (vertical) -->
    <line x1="${innerSize * 0.2}" y1="0" x2="${innerSize * 0.2}" y2="${innerSize}" stroke="#9ca3af" stroke-width="${size * 0.008}"/>
    <line x1="${innerSize * 0.4}" y1="0" x2="${innerSize * 0.4}" y2="${innerSize}" stroke="#9ca3af" stroke-width="${size * 0.008}"/>
    <line x1="${innerSize * 0.6}" y1="0" x2="${innerSize * 0.6}" y2="${innerSize}" stroke="#9ca3af" stroke-width="${size * 0.008}"/>
    <line x1="${innerSize * 0.8}" y1="0" x2="${innerSize * 0.8}" y2="${innerSize}" stroke="#9ca3af" stroke-width="${size * 0.008}"/>

    <!-- Note dot (root note - orange) -->
    <circle cx="${innerSize * 0.5}" cy="${innerSize * 0.5}" r="${innerSize * 0.15}" fill="#f97316"/>

    <!-- FF text -->
    <text x="${innerSize * 0.5}" y="${innerSize * 0.58}" font-family="system-ui, -apple-system, sans-serif" font-size="${innerSize * 0.18}" font-weight="bold" fill="white" text-anchor="middle">FF</text>
  </g>
</svg>`;
};

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "maskable-icon-512.png", size: 512, maskable: true },
  { name: "apple-touch-icon-180.png", size: 180 },
];

async function generateIcons() {
  for (const { name, size, maskable } of sizes) {
    const svg = createSvg(size, maskable);
    const pngPath = join(iconsDir, name);

    await sharp(Buffer.from(svg)).png().toFile(pngPath);
    console.log(`Created ${name}`);
  }

  console.log("Icon generation complete!");
}

generateIcons().catch(console.error);
