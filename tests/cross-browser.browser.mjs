import assert from "node:assert/strict";
import { chromium, firefox, webkit } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:8080";
const browsers = [
  ["chromium", chromium],
  ["firefox", firefox],
  ["webkit", webkit],
];

for (const [name, browserType] of browsers) {
  const browser = await browserType.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

    assert.equal(
      await page.getByRole("heading", { level: 1, name: "Choose Your Eating Style" }).isVisible(),
      true,
      `${name}: product-first H1 is visible`,
    );
    assert.equal(
      await page.locator(".preview__intro").count(),
      0,
      `${name}: removed portfolio-meta hero stays removed`,
    );

    const fitnessTab = page.getByRole("tab", { name: "Fitness", exact: true });
    await fitnessTab.focus();
    await page.keyboard.press("ArrowDown");

    assert.equal(
      await page.getByRole("tab", { name: "Premium", exact: true }).getAttribute("aria-selected"),
      "true",
      `${name}: tab keyboard activation`,
    );

    await page.getByRole("button", { name: "Next slide" }).click();
    assert.equal(
      await page.locator("#current").textContent(),
      "02",
      `${name}: carousel next state`,
    );

    await page.locator("#height").fill("180");
    await page.locator("#weight").fill("80.5");
    await page.locator("#age").fill("36");
    assert.match(
      (await page.locator(".calculating__result span").textContent()) ?? "",
      /^≈\s/,
      `${name}: approximate calculator result`,
    );

    const trigger = page.getByRole("button", { name: "Build My Plan" }).first();
    await trigger.focus();
    await trigger.click();

    const dialog = page.locator("#plan-dialog");
    assert.equal(
      await dialog.evaluate((element) => element.open),
      true,
      `${name}: native plan dialog opens`,
    );

    assert.equal(
      await page.locator("[data-plan-style]").textContent(),
      "Premium",
      `${name}: plan uses selected meal style`,
    );

    await page.keyboard.press("Escape");
    assert.equal(
      await dialog.evaluate((element) => element.open),
      false,
      `${name}: native Escape closes plan dialog`,
    );
    assert.equal(
      await trigger.evaluate((element) => document.activeElement === element),
      true,
      `${name}: dialog restores trigger focus`,
    );

    assert.deepEqual(pageErrors, [], `${name}: page errors`);
    await context.close();
  } finally {
    await browser.close();
  }
}

console.log("Critical journey passed in Chromium, Firefox, and WebKit.");
