import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:8080";
const outputDir = "artifacts/visual-audit";

const shots = [
  { name: "mobile-390", width: 390, height: 844, mobile: true },
  { name: "tablet-768", width: 768, height: 900, mobile: true },
  { name: "desktop-1440", width: 1440, height: 1000, mobile: false },
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  for (const shot of shots) {
    const context = await browser.newContext({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: 1,
      hasTouch: shot.mobile,
      isMobile: shot.mobile,
    });
    const page = await context.newPage();

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.screenshot({
      path: `${outputDir}/${shot.name}.png`,
      fullPage: true,
    });

    await context.close();
  }
} finally {
  await browser.close();
}

console.log("Visual audit screenshots captured.");
