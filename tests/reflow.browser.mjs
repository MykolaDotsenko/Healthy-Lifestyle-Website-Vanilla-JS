import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:8080";
const viewports = [
  { width: 320, height: 800, mobile: true },
  { width: 360, height: 800, mobile: true },
  { width: 390, height: 844, mobile: true },
  { width: 768, height: 900, mobile: false },
  { width: 1024, height: 900, mobile: false },
  { width: 1440, height: 1000, mobile: false },
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
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      hasTouch: viewport.mobile,
      isMobile: viewport.mobile,
      permissions: ["clipboard-read", "clipboard-write"],
    });
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
      await page
        .getByRole("heading", {
          level: 1,
          name: "Choose Your Meal Approach",
        })
        .isVisible(),
      true,
      `${viewport.width}px: visible product H1`,
    );

    if (viewport.mobile) {
      const firstProductTop = await page
        .locator(".tabcontainer")
        .evaluate((element) => element.getBoundingClientRect().top);

      assert.ok(
        firstProductTop < 320,
        `${viewport.width}px: product selector should remain visible near the first fold`,
      );
    }

    await page.waitForFunction(
      () => document.querySelectorAll(".menu__item").length === 4,
    );
    assert.equal(
      await page.locator(".menu__item").count(),
      4,
      `${viewport.width}px: four canonical meal approaches render`,
    );

    await page.locator("#menu-list").scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      [...document.querySelectorAll(".menu__item img")].every(
        (image) => image.complete && image.naturalWidth > 0,
      ),
    );

    const brokenMenuImages = await page
      .locator(".menu__item img")
      .evaluateAll((images) =>
        images
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src),
      );
    assert.deepEqual(
      brokenMenuImages,
      [],
      `${viewport.width}px: all visible weekly menu images should load`,
    );

    if (viewport.width === 320) {
      const selectedImage = await page
        .locator("#plan-whole-food img")
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

    assert.match(
      (await page.locator(".calculating__result span").textContent()) ?? "",
      /^≈\s/,
      `${viewport.width}px: calculator should show an approximate estimate`,
    );

    await page.locator("#age").fill("17");
    assert.equal(await page.locator(".calculating__result span").textContent(), "—");
    assert.equal(await page.locator("#age").getAttribute("aria-invalid"), "true");
    assert.equal(await page.locator("#age-error").isVisible(), true);

    await page.locator("#age").fill("36");
    assert.equal(await page.locator("#age").getAttribute("aria-invalid"), "false");

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

    const wholeFoodTab = page.getByRole("tab", {
      name: "Whole-Food",
      exact: true,
    });
    const mediterraneanTab = page.getByRole("tab", {
      name: "Mediterranean",
      exact: true,
    });

    await wholeFoodTab.focus();
    await page.keyboard.press("ArrowDown");
    assert.equal(await mediterraneanTab.getAttribute("aria-selected"), "true");
    assert.equal(await mediterraneanTab.getAttribute("tabindex"), "0");
    assert.equal(await page.locator("#plan-mediterranean").isVisible(), true);

    await page.keyboard.press("End");
    const balancedTab = page.getByRole("tab", {
      name: "Balanced",
      exact: true,
    });
    assert.equal(await balancedTab.getAttribute("aria-selected"), "true");
    await page.keyboard.press("Home");
    assert.equal(await wholeFoodTab.getAttribute("aria-selected"), "true");

    await mediterraneanTab.click();

    const selectedMenuCard = page.locator(
      '.menu__item[data-approach-id="mediterranean"]',
    );
    assert.equal(
      await selectedMenuCard.getAttribute("aria-current"),
      "true",
      `${viewport.width}px: weekly ideas should highlight the selected approach`,
    );
    assert.match(
      (await selectedMenuCard.locator(".menu__item-week").textContent()) ?? "",
      /Your current approach/,
    );

    await page.getByRole("button", { name: "Next slide" }).click();
    assert.equal(await page.locator("#current").textContent(), "02");
    assert.match(
      (await page.locator("[data-carousel-status]").textContent()) ?? "",
      /Use a simple three-part plate/,
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

    const planTrigger = page.getByRole("button", {
      name: "Build My Plan",
      exact: true,
    });
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
      await page.locator("[data-plan-approach]").textContent(),
      "Mediterranean",
      `${viewport.width}px: plan should use the selected approach`,
    );
    assert.match(
      (await page.locator("[data-plan-energy]").textContent()) ?? "",
      /kcal\/day$/,
      `${viewport.width}px: plan should include the calculator estimate`,
    );
    assert.equal(
      await page.locator("[data-plan-meals] .plan-meal").count(),
      3,
      `${viewport.width}px: plan should expose morning, midday, and evening ideas`,
    );
    assert.ok(
      (await page.locator("[data-plan-shopping] li").count()) >= 5,
      `${viewport.width}px: plan should expose a practical shopping starter`,
    );

    const firstPlanTitle =
      (await page.locator("[data-plan-title]").textContent()) ?? "";
    await page.getByRole("button", { name: "Another Set" }).click();
    const secondPlanTitle =
      (await page.locator("[data-plan-title]").textContent()) ?? "";
    assert.notEqual(secondPlanTitle, firstPlanTitle);

    await page.getByRole("button", { name: "Save Plan" }).click();
    assert.match(
      (await page.locator("[data-plan-status]").textContent()) ?? "",
      /saved on this device/i,
    );
    assert.equal(
      await page.evaluate(() => Boolean(localStorage.getItem("nourishflow.saved-plan"))),
      true,
    );

    await page.getByRole("button", { name: "Copy Plan" }).click();
    await page.waitForFunction(() => {
      const message =
        document.querySelector("[data-plan-status]")?.textContent ?? "";
      return /copied to your clipboard|copy is unavailable/i.test(message);
    });
    assert.match(
      (await page.locator("[data-plan-status]").textContent()) ?? "",
      /copied to your clipboard|copy is unavailable/i,
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

    if (viewport.width === 390) {
      await page.reload({ waitUntil: "domcontentloaded" });
      assert.equal(await page.locator("[data-saved-plan]").isVisible(), true);
      await page.getByRole("button", { name: "Open Saved Plan" }).click();
      assert.equal(await dialog.evaluate((element) => element.open), true);
      assert.equal(
        await page.locator("[data-plan-meals] .plan-meal").count(),
        3,
      );
      assert.equal(
        await page.locator("[data-plan-approach]").textContent(),
        "Mediterranean",
        "saved plan should restore its original meal approach",
      );

      await page.getByRole("button", { name: "Another Set" }).click();
      assert.equal(
        await page.locator("[data-plan-approach]").textContent(),
        "Mediterranean",
        "Another Set after reload must preserve the saved meal approach",
      );

      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: "Remove Saved Plan" }).click();
      assert.equal(await page.locator("[data-saved-plan]").isVisible(), false);
      assert.equal(
        await page.evaluate(() => localStorage.getItem("nourishflow.saved-plan")),
        null,
      );
    }

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
