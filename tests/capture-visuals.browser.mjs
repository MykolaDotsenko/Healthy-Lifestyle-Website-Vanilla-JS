import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:8080";
const outputDir = "artifacts/visual-audit";

const shots = [
  { name: "mobile-390", width: 390, height: 844, mobile: true },
  { name: "tablet-768", width: 768, height: 900, mobile: true },
  { name: "desktop-1440", width: 1440, height: 1000, mobile: false },
];

async function loadLazyContent(page) {
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const step = Math.max(420, Math.floor(window.innerHeight * 0.7));

    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await delay(80);
    }

    window.scrollTo(0, document.documentElement.scrollHeight);
    await delay(160);
    window.scrollTo(0, 0);
  });

  await page.waitForFunction(
    () =>
      [...document.images].every(
        (image) => image.loading !== "lazy" || image.complete,
      ),
    null,
    { timeout: 5_000 },
  );
}

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  for (const shot of shots) {
    const context = await browser.newContext({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: shot.mobile ? 2 : 1,
      hasTouch: shot.mobile,
      isMobile: shot.mobile,
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.screenshot({
      path: `${outputDir}/${shot.name}-fold.png`,
      fullPage: false,
    });

    await loadLazyContent(page);
    await page.screenshot({
      path: `${outputDir}/${shot.name}.png`,
      fullPage: true,
    });

    if (shot.name === "mobile-390") {
      await page.getByRole("tab", { name: "Plant-Based", exact: true }).click();
      await page.locator("#height").fill("180");
      await page.locator("#weight").fill("80");
      await page.locator("#age").fill("36");
      await page.getByRole("button", { name: "Build My Plan" }).click();
      await page.screenshot({
        path: `${outputDir}/mobile-390-plan-dialog.png`,
        fullPage: false,
      });
      await page.keyboard.press("Escape");
    }

    await context.close();
  }
} finally {
  await browser.close();
}

console.log("Visual audit screenshots captured.");
