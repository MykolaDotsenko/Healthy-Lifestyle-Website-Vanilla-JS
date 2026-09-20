import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const screenshotPath = resolve(
  root,
  "artifacts/visual-audit/desktop-1440-fold.png",
);
const outputDir = resolve(root, "artifacts/brand");

const palette = {
  background: "#fffefa",
  text: "#223027",
  muted: "#637068",
  accent: "#79d86d",
  accentStrong: "#2f7d45",
  accentSoft: "#eef9eb",
  sage: "#e5f4ef",
  warm: "#faf5c7",
  dark: "#193326",
};

function leafMark(x, y, scale = 1) {
  const s = scale;
  return `
    <g transform="translate(${x} ${y}) scale(${s})">
      <circle cx="28" cy="28" r="26" fill="${palette.accentSoft}" stroke="#c8dbc9" stroke-width="2"/>
      <ellipse cx="27" cy="25" rx="8.5" ry="19" fill="${palette.accent}" transform="rotate(-25 27 25)"/>
      <ellipse cx="34" cy="31" rx="9" ry="16" fill="${palette.dark}" transform="rotate(53 34 31)"/>
    </g>
  `;
}

function screenshotCard({
  dataUri,
  x,
  y,
  width,
  height,
  radius,
  clipId,
  shadowId,
}) {
  return `
    <g filter="url(#${shadowId})">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="#ffffff"/>
      <image
        href="${dataUri}"
        x="${x}"
        y="${y}"
        width="${width}"
        height="${height}"
        preserveAspectRatio="xMidYMin slice"
        clip-path="url(#${clipId})"
      />
    </g>
  `;
}

function defs({ clipId, x, y, width, height, radius, shadowId }) {
  return `
    <defs>
      <clipPath id="${clipId}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}"/>
      </clipPath>
      <filter id="${shadowId}" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#193326" flood-opacity="0.16"/>
      </filter>
    </defs>
  `;
}

function readmeSvg(dataUri) {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1150" viewBox="0 0 1600 1150">
    ${defs({
      clipId: "readme-clip",
      x: 120,
      y: 440,
      width: 1360,
      height: 620,
      radius: 30,
      shadowId: "readme-shadow",
    })}
    <rect width="1600" height="1150" fill="${palette.background}"/>
    <rect x="1110" y="-130" width="530" height="440" rx="110" fill="#edf7f3"/>
    <rect x="-180" y="760" width="640" height="440" rx="120" fill="#faf7d9"/>

    ${leafMark(100, 68, 1.1)}
    <text x="170" y="111" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700" fill="${palette.text}">NourishFlow</text>
    <text x="112" y="169" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="${palette.muted}">Privacy-first meal planning on the native web</text>

    <text x="100" y="257" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" fill="${palette.text}">
      <tspan x="100" dy="0">Plan a practical day without an</tspan>
      <tspan x="100" dy="60">account.</tspan>
    </text>
    <text x="102" y="351" font-family="Arial, Helvetica, sans-serif" font-size="23" fill="${palette.muted}">Choose an approach  •  estimate energy context  •  build, save &amp; reuse a plan</text>

    <rect x="1178" y="78" width="320" height="48" rx="24" fill="${palette.accentSoft}" stroke="#c7ddc7" stroke-width="2"/>
    <text x="1338" y="109" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="${palette.accentStrong}">No account · Local-first</text>

    ${screenshotCard({
      dataUri,
      x: 120,
      y: 440,
      width: 1360,
      height: 620,
      radius: 30,
      clipId: "readme-clip",
      shadowId: "readme-shadow",
    })}

    <text x="120" y="1112" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="${palette.muted}">Semantic HTML · Modern CSS · Native JavaScript · Accessible by design</text>
  </svg>
  `;
}

function ogSvg(dataUri) {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    ${defs({
      clipId: "og-clip",
      x: 600,
      y: 114,
      width: 565,
      height: 402,
      radius: 24,
      shadowId: "og-shadow",
    })}
    <rect width="1200" height="630" fill="${palette.background}"/>
    <rect x="760" y="-100" width="520" height="385" rx="105" fill="${palette.sage}"/>
    <rect x="-170" y="450" width="690" height="310" rx="110" fill="${palette.warm}"/>

    ${leafMark(60, 46, 0.95)}
    <text x="121" y="84" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="${palette.text}">NourishFlow</text>

    <text x="64" y="185" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700" fill="${palette.text}">
      <tspan x="64" dy="0">Meal planning,</tspan>
      <tspan x="64" dy="51">without the</tspan>
      <tspan x="64" dy="51">account.</tspan>
    </text>
    <text x="66" y="329" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="${palette.muted}">
      <tspan x="66" dy="0">A privacy-first nutrition companion built</tspan>
      <tspan x="66" dy="30">with the native web platform.</tspan>
    </text>

    <rect x="64" y="395" width="160" height="42" rx="21" fill="${palette.accentSoft}" stroke="#cadfca"/>
    <rect x="234" y="395" width="150" height="42" rx="21" fill="${palette.accentSoft}" stroke="#cadfca"/>
    <rect x="394" y="395" width="120" height="42" rx="21" fill="${palette.accentSoft}" stroke="#cadfca"/>
    <text x="144" y="422" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="${palette.accentStrong}">Meal approaches</text>
    <text x="309" y="422" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="${palette.accentStrong}">Energy context</text>
    <text x="454" y="422" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="${palette.accentStrong}">Save locally</text>

    <text x="66" y="533" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="${palette.muted}">Semantic HTML · Modern CSS · Native JavaScript</text>
    <rect x="64" y="566" width="270" height="6" rx="3" fill="${palette.accentStrong}"/>

    ${screenshotCard({
      dataUri,
      x: 600,
      y: 114,
      width: 565,
      height: 402,
      radius: 24,
      clipId: "og-clip",
      shadowId: "og-shadow",
    })}
  </svg>
  `;
}

await mkdir(outputDir, { recursive: true });
const screenshot = await readFile(screenshotPath);
const dataUri = `data:image/png;base64,${screenshot.toString("base64")}`;

await sharp(Buffer.from(readmeSvg(dataUri)))
  .png({ compressionLevel: 9 })
  .toFile(resolve(outputDir, "nourishflow-readme-preview.png"));

await sharp(Buffer.from(ogSvg(dataUri)))
  .png({ compressionLevel: 9 })
  .toFile(resolve(outputDir, "nourishflow-og.png"));

console.log("Branded README and OG assets generated from verified UI screenshot.");
