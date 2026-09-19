import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:8080";
const viewports = [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1024, height: 900 },
  { width: 1440, height: 1000 },
];

function assertNoHorizontalDocumentOverflow(metrics, label) {
  assert.ok(
    metrics.scrollWidth <= metrics.clientWidth + 1,
    `${label}: document overflows horizontally (${metrics.scrollWidth}px > ${metrics.clientWidth}px)`,
  );
}

const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

    await page.waitForFunction(() => document.querySelectorAll(".menu__item").length === 3);
    assert.equal(
      await page.locator(".menu__item").count(),
      3,
      `${viewport.width}px: ES modules should render all menu cards`,
    );

    await page.locator("#height").fill("180");
    await page.locator("#weight").fill("80");
    await page.locator("#age").fill("36");
    assert.notEqual(
      await page.locator(".calculating__result span").textContent(),
      "____",
      `${viewport.width}px: calculator should initialize and calculate`,
    );

    const readDocumentMetrics = () =>
      page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));

    assertNoHorizontalDocumentOverflow(
      await readDocumentMetrics(),
      `${viewport.width}px initial layout`,
    );

    await page.getByRole("button", { name: "Premium", exact: true }).click();
    assertNoHorizontalDocumentOverflow(
      await readDocumentMetrics(),
      `${viewport.width}px after tab change`,
    );

    await page.getByRole("button", { name: "Next slide" }).click();
    assertNoHorizontalDocumentOverflow(
      await readDocumentMetrics(),
      `${viewport.width}px after carousel interaction`,
    );

    await page.getByRole("button", { name: "Contact Us" }).first().click();
    const modalBox = await page.locator(".modal__dialog").boundingBox();

    assert.ok(modalBox, `${viewport.width}px: modal dialog should be visible`);
    assert.ok(
      modalBox.width <= viewport.width + 1,
      `${viewport.width}px: modal width ${modalBox.width}px exceeds viewport`,
    );

    assertNoHorizontalDocumentOverflow(
      await readDocumentMetrics(),
      `${viewport.width}px with modal open`,
    );

    await page.getByRole("button", { name: "Close contact form" }).click();

    assert.deepEqual(
      pageErrors,
      [],
      `${viewport.width}px: page emitted browser errors: ${pageErrors.join("; ")}`,
    );

    await context.close();
  }
} finally {
  await browser.close();
}

console.log(`Responsive browser smoke passed for ${viewports.length} viewports.`);
