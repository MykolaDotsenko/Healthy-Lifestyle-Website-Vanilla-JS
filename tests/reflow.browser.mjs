import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:8080";
const viewports = [
  { width: 320, height: 800 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1024, height: 900 },
  { width: 1440, height: 1000 },
];

function assertNoHorizontalDocumentOverflow(metrics, label) {
  const offenderSummary = metrics.offenders?.length
    ? `; offenders: ${metrics.offenders
        .map(({ selector, left, right, width }) =>
          `${selector} [left=${left}, right=${right}, width=${width}]`,
        )
        .join(" | ")}`
    : "";

  assert.ok(
    metrics.scrollWidth <= metrics.clientWidth + 1,
    `${label}: document overflows horizontally (${metrics.scrollWidth}px > ${metrics.clientWidth}px)${offenderSummary}`,
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
          "nourishflow.calculator.preferences",
          "{malformed-json",
        );
      });
      await page.reload({ waitUntil: "domcontentloaded" });

      assert.equal(await page.locator("#female").isChecked(), true);
      assert.equal(await page.locator("#small").isChecked(), true);
    }

    assert.equal(
      await page.getByRole("heading", { level: 1, name: "Choose Your Eating Style" }).isVisible(),
      true,
      `${viewport.width}px: visible product H1`,
    );

    await page.waitForFunction(
      () => document.querySelectorAll(".menu__item").length === 4,
    );
    assert.equal(
      await page.locator(".menu__item").count(),
      4,
      `${viewport.width}px: four canonical meal styles render`,
    );

    if (viewport.width === 320) {
      const selectedImage = await page
        .locator("#plan-fitness img")
        .evaluate((image) => image.currentSrc);

      assert.match(
        selectedImage,
        /\/img\/optimized\/tabs\/vegy-768\.avif$/,
        "320px: responsive AVIF candidate should be selected",
      );
    }

    await page.locator("#height").fill("180");
    await page.locator("#weight").fill("80.5");
    await page.locator("#age").fill("36");

    const validResult = await page.locator(".calculating__result span").textContent();
    assert.match(
      validResult ?? "",
      /^≈\s/,
      `${viewport.width}px: calculator should show an approximate estimate`,
    );

    await page.locator("#age").fill("17");
    assert.equal(await page.locator(".calculating__result span").textContent(), "—");
    assert.equal(await page.locator("#age").getAttribute("aria-invalid"), "true");
    assert.equal(await page.locator("#age-error").isVisible(), true);

    await page.locator("#age").fill("36");
    assert.equal(await page.locator("#age").getAttribute("aria-invalid"), "false");
    assert.match(
      (await page.locator(".calculating__result span").textContent()) ?? "",
      /^≈\s/,
    );

    const readDocumentMetrics = () =>
      page.evaluate(() => {
        const clientWidth = document.documentElement.clientWidth;
        const offenders = [...document.querySelectorAll("body *")]
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const id = element.id ? `#${element.id}` : "";
            const classes =
              typeof element.className === "string" && element.className.trim()
                ? `.${element.className.trim().split(/\s+/).join(".")}`
                : "";

            return {
              selector: `${element.tagName.toLowerCase()}${id}${classes}`,
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            };
          })
          .filter(({ left, right }) => left < -1 || right > clientWidth + 1)
          .slice(0, 8);

        return {
          clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          offenders,
        };
      });

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
    assert.equal(await page.locator("#current").textContent(), "02");
    assert.equal(
      await page.locator('.carousel-indicator[aria-current="true"]').getAttribute("data-slide-to"),
      "1",
    );
    assert.match(
      (await page.locator("[data-carousel-status]").textContent()) ?? "",
      /^Slide 2 of 4:/,
    );

    if (viewport.width === 390) {
      await page.setViewportSize({ width: 1024, height: viewport.height });
      assert.equal(await page.locator("#current").textContent(), "02");
      assert.match(
        (await page.locator(".offer__slider-inner").getAttribute("style")) ?? "",
        /translateX\(-100%\)/,
      );
      await page.setViewportSize(viewport);
    }

    const planTrigger = page.getByRole("button", { name: "Build My Plan" }).first();
    await planTrigger.focus();
    await planTrigger.click();

    const dialog = page.locator("#plan-dialog");
    assert.equal(await dialog.evaluate((element) => element.open), true);
    assert.equal(
      await page.evaluate(() => document.activeElement?.id),
      "plan-dialog-title",
      `${viewport.width}px: dialog should focus its summary heading`,
    );
    assert.equal(
      await page.locator("[data-plan-style]").textContent(),
      "Premium",
      `${viewport.width}px: plan should use the selected style`,
    );
    assert.match(
      (await page.locator("[data-plan-energy]").textContent()) ?? "",
      /kcal\/day$/,
      `${viewport.width}px: plan should include the calculator estimate`,
    );
    assert.ok(
      ((await page.locator("[data-plan-meal]").textContent()) ?? "").length > 0,
      `${viewport.width}px: plan should include this week's meal idea`,
    );

    const modalBox = await dialog.boundingBox();
    assert.ok(modalBox);
    assert.ok(modalBox.width <= viewport.width + 1);

    assertNoHorizontalDocumentOverflow(
      await readDocumentMetrics(),
      `${viewport.width}px with plan dialog open`,
    );

    await page.keyboard.press("Escape");
    assert.equal(await dialog.evaluate((element) => element.open), false);
    assert.equal(
      await planTrigger.evaluate((element) => document.activeElement === element),
      true,
      `${viewport.width}px: closing dialog should restore trigger focus`,
    );

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

console.log(`Responsive product journey passed for ${viewports.length} viewports.`);
