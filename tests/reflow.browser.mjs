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

// Diagnostic payload intentionally includes the first overflow offenders.
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
    const requestedUrls = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });
    page.on("request", (request) => {
      requestedUrls.push(request.url());
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

    assert.equal(
      await page.getByRole("heading", {
        level: 1,
        name: "Nutrition UX, built on the web platform.",
      }).isVisible(),
      true,
      `${viewport.width}px: recruiter-facing product heading should be visible`,
    );

    await page.waitForFunction(() => document.querySelectorAll(".menu__item").length === 3);

    if (viewport.width === 320) {
      const selectedImage = await page
        .locator("#plan-fitness img")
        .evaluate((image) => image.currentSrc);

      assert.match(
        selectedImage,
        /\/img\/optimized\/tabs\/vegy-768\.avif$/,
        "320px: Chromium should select the responsive AVIF candidate",
      );
    }
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
    assert.equal(
      await page.locator("#current").textContent(),
      "02",
      `${viewport.width}px: next control should advance exactly one slide`,
    );
    assert.equal(
      await page.locator('.carousel-indicator[aria-current="true"]').getAttribute("data-slide-to"),
      "1",
      `${viewport.width}px: active slide picker should track state`,
    );

    if (viewport.width === 390) {
      await page.setViewportSize({ width: 1024, height: viewport.height });
      assert.equal(
        await page.locator("#current").textContent(),
        "02",
        "carousel state should survive viewport resize",
      );
      assert.match(
        (await page.locator(".offer__slider-inner").getAttribute("style")) ?? "",
        /translateX\(-100%\)/,
      );
      await page.setViewportSize(viewport);
    }

    assertNoHorizontalDocumentOverflow(
      await readDocumentMetrics(),
      `${viewport.width}px after carousel interaction`,
    );

    const contactTrigger = page.getByRole("button", { name: "Preview Request" }).first();
    await contactTrigger.focus();
    await contactTrigger.click();

    const dialog = page.locator("#contact-dialog");
    assert.equal(await dialog.evaluate((element) => element.open), true);
    assert.equal(
      await page.evaluate(() => document.activeElement?.id),
      "modal-name",
      `${viewport.width}px: dialog should focus the first meaningful field`,
    );

    const modalBox = await dialog.boundingBox();

    assert.ok(modalBox, `${viewport.width}px: modal dialog should be visible`);

    await page.locator("#modal-name").fill("Demo User");
    await page.locator("#modal-phone").fill("+358401234567");
    await page.getByRole("button", { name: "Preview Request" }).last().click();

    assert.match(
      (await page.locator("[data-dialog-status-message]").textContent()) ?? "",
      /Nothing was sent or stored/,
      `${viewport.width}px: demo form must disclose that it does not transmit data`,
    );
    assert.equal(
      requestedUrls.some((url) => url.includes("localhost:3000")),
      false,
      `${viewport.width}px: demo form must not call the removed local API`,
    );
    assert.ok(
      modalBox.width <= viewport.width + 1,
      `${viewport.width}px: modal width ${modalBox.width}px exceeds viewport`,
    );

    assertNoHorizontalDocumentOverflow(
      await readDocumentMetrics(),
      `${viewport.width}px with modal open`,
    );

    await page.keyboard.press("Escape");
    assert.equal(await dialog.evaluate((element) => element.open), false);
    assert.equal(
      await contactTrigger.evaluate((element) => document.activeElement === element),
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

console.log(`Responsive browser smoke passed for ${viewports.length} viewports.`);
