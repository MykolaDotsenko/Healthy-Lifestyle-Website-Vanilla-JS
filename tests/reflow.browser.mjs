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

    if (viewport.width === 320) {
      await page.evaluate(() => {
        localStorage.setItem(
          "healthy-lifestyle.calculator.preferences",
          "{malformed-json",
        );
      });
      await page.reload({ waitUntil: "domcontentloaded" });
      assert.equal(
        await page.locator("#female").isChecked(),
        true,
        "corrupted preferences should recover to the default sex",
      );
      assert.equal(
        await page.locator("#small").isChecked(),
        true,
        "corrupted preferences should recover to the default activity",
      );
    }

    await page.waitForFunction(() => document.querySelectorAll(".menu__item").length === 3);
    assert.equal(
      await page.locator(".menu__item").count(),
      3,
      `${viewport.width}px: ES modules should render all menu cards`,
    );

    await page.locator("#height").fill("180");
    await page.locator("#weight").fill("80.5");
    await page.locator("#age").fill("36");

    const validResult = await page.locator(".calculating__result span").textContent();
    assert.match(
      validResult ?? "",
      /^\d+$/,
      `${viewport.width}px: calculator should produce a numeric estimate`,
    );

    await page.locator("#age").fill("17");
    assert.equal(
      await page.locator(".calculating__result span").textContent(),
      "—",
      `${viewport.width}px: invalid calculator input should suppress the estimate`,
    );
    assert.equal(
      await page.locator("#age").getAttribute("aria-invalid"),
      "true",
      `${viewport.width}px: invalid age should expose aria-invalid`,
    );
    assert.equal(
      await page.locator("#age-error").isVisible(),
      true,
      `${viewport.width}px: invalid age should show an inline error`,
    );

    await page.locator("#age").fill("36");
    assert.equal(
      await page.locator("#age").getAttribute("aria-invalid"),
      "false",
      `${viewport.width}px: corrected age should clear aria-invalid`,
    );
    assert.match(
      (await page.locator(".calculating__result span").textContent()) ?? "",
      /^\d+$/,
      `${viewport.width}px: corrected input should restore the estimate`,
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

    const fitnessTab = page.getByRole("tab", { name: "Fitness", exact: true });
    const premiumTab = page.getByRole("tab", { name: "Premium", exact: true });
    await fitnessTab.focus();
    await page.keyboard.press("ArrowDown");
    assert.equal(await premiumTab.getAttribute("aria-selected"), "true");
    assert.equal(await premiumTab.getAttribute("tabindex"), "0");
    assert.equal(await page.locator("#plan-premium").isVisible(), true);

    await page.keyboard.press("End");
    const balancedTab = page.getByRole("tab", { name: "Balanced", exact: true });
    assert.equal(await balancedTab.getAttribute("aria-selected"), "true");
    await page.keyboard.press("Home");
    assert.equal(await fitnessTab.getAttribute("aria-selected"), "true");

    await premiumTab.click();
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
