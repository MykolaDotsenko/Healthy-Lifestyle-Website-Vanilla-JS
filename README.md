# NourishFlow

[![Quality](https://github.com/MykolaDotsenko/Healthy-Lifestyle-Website-Vanilla-JS/actions/workflows/quality.yml/badge.svg)](https://github.com/MykolaDotsenko/Healthy-Lifestyle-Website-Vanilla-JS/actions/workflows/quality.yml)

**A privacy-first meal-planning companion built with the native web platform — no framework, no bundler, and no production dependencies.**

[Live site](https://mykoladotsenko.github.io/Healthy-Lifestyle-Website-Vanilla-JS/) · [Architecture](ARCHITECTURE.md) · [Quality strategy](QUALITY.md)

## Product

NourishFlow helps a user move through one small, coherent planning loop:

1. choose a meal approach;
2. optionally estimate daily maintenance energy;
3. build a practical day with Morning, Midday, and Evening ideas;
4. switch to another set without changing the selected approach;
5. keep a small shopping starter;
6. save one plan locally or copy it elsewhere;
7. return later and reopen the saved plan.

The current approaches are **Whole-Food, Mediterranean, Plant-Based, and Balanced**. Each has a four-week content rotation, so the Monday refresh corresponds to real content rather than a decorative countdown.

NourishFlow deliberately does **not** require an account, collect a name or phone number, send plan data to a server, track the user, or present the calculator as medical advice.

## Why this project exists

This repository started as a small healthy-lifestyle Vanilla JavaScript exercise and was rebuilt into a production-minded frontend case study without hiding the web platform behind a framework.

The result demonstrates that a small application can still have explicit product boundaries, pure domain logic, accessible native interactions, safe local persistence, responsive image delivery, cross-browser verification, and a coherent user flow.

## What it demonstrates

| Area | Implementation |
| --- | --- |
| HTML | Semantic landmarks, native controls, labels, fieldsets, skip link, native dialog |
| CSS | Mobile-first cascade layers, design tokens, Grid/Flexbox, fluid sizing, reduced-motion and forced-colors support |
| JavaScript | Native ES modules with a small explicit composition root |
| Meal approaches | One canonical domain model shared by weekly cards and plans |
| Tabs | WAI-style keyboard model with roving focus and automatic activation |
| Carousel | Manual, resize-safe planning shortcuts with visible captions and meaningful announcements |
| Calculator | Pure domain calculation, validation, safe versioned preferences |
| Plan | Three meal slots, another-set action, shopping starter, copy and local save/reopen |
| Weekly cycle | Shared deterministic Monday boundary for menu rotation and countdown |
| Persistence | Small adapters for versioned calculator preferences and one saved plan |
| Performance | Responsive AVIF/WebP sources, JPEG fallback, intrinsic sizing, lazy below-fold media |
| Quality | Node contracts, semantic HTML validation, axe, responsive/touch journeys, Chromium/Firefox/WebKit, visual audit artifacts |

## Architecture at a glance

```text
js/
├── app.js
├── domain/
│   ├── calculator.js
│   ├── meal-styles.js
│   └── weekly-cycle.js
├── ui/
│   ├── modal.js
│   └── tabs.js
└── features/
    ├── calculator.js
    ├── calculator-storage.js
    ├── carousel.js
    ├── menu.js
    ├── plan.js
    ├── plan-storage.js
    └── timer.js
```

`app.js` is the composition root. It wires feature callbacks explicitly:

- tabs report the selected approach to the plan feature;
- the calculator reports the latest valid estimate;
- the timer asks the menu and plan features to roll into the next weekly cycle.

There is no document-level custom-event bus and no global state library.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the complete boundaries and trade-offs.

## Visual direction

The UI intentionally keeps the character of the original project: a light canvas, pale blue and yellow fields, a restrained green accent, image-led meal selection, and compact typography.

The old template SVG that rendered the literal word **“Logotype”** was removed. The header now uses a lightweight NourishFlow wordmark and CSS leaf mark, avoiding an extra brand-image dependency while making the identity clear at small mobile sizes.

Technical or recruiter-facing commentary does not appear on the live product surface.

## Accessibility

The interface is designed around native semantics first:

- keyboard-operable vertical tabs with `ArrowUp`, `ArrowDown`, `Home`, and `End`;
- visible `:focus-visible` states;
- native `<dialog>` modality and Escape behavior;
- deterministic focus restoration;
- labeled calculator inputs and validation feedback;
- meaningful manual-carousel announcements;
- reduced-motion and forced-colors support;
- a 44px interaction baseline;
- mobile reflow tests down to 320 CSS pixels.

CI runs axe in multiple product states and exercises the critical flow in Chromium, Firefox, and WebKit.

## Performance

NourishFlow serves responsive AVIF first, WebP second, and the original JPEG as a compatibility fallback.

The seven source JPEGs total **3,459,362 bytes**; their 768px AVIF variants total **199,272 bytes (94.2% smaller)** and their 1440px AVIF variants total **566,645 bytes (83.6% smaller)**.

Only the first visible raster is eager and high-priority. Inactive tabs, carousel media, and generated menu cards remain lazy and asynchronously decoded. Authored raster fallbacks carry intrinsic dimensions to protect layout stability.

The next-generation assets are reproducible with the pinned generator:

```bash
npm install --no-save --package-lock=false sharp@0.35.4
node scripts/optimize-images.mjs
```

`img/optimized/manifest.json` records generated variants and byte sizes, and automated tests enforce those budgets.

## Privacy and product integrity

- no name, phone number, account, or profile is requested;
- no plan is submitted to a remote API;
- calculator preferences use a versioned local-storage object;
- one saved plan can be retained locally on the current device;
- unknown future calculator-storage schemas are preserved rather than destructively downgraded;
- the four-week content rotation uses the same Monday boundary shown by the countdown;
- the energy calculator is presented as an approximate adult maintenance estimate for general information.

## Run locally

Requirements: Node.js 22+.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:8080`.

## Verify

```bash
npm run check
```

GitHub Actions additionally runs:

- semantic HTML validation;
- responsive and touch-aware Chromium journeys;
- automated axe scans;
- Chromium, Firefox, and WebKit critical journeys;
- screenshot capture at mobile, tablet, and desktop sizes.

The screenshots are uploaded as the `nourishflow-visual-audit` workflow artifact for manual visual review.

See [QUALITY.md](QUALITY.md) for the full verification model.

## Key trade-offs

- **No framework:** the current scale benefits from explicit native modules more than framework infrastructure.
- **No backend:** the useful plan flow works locally and does not justify remote persistence or authentication.
- **One saved plan:** intentionally small retention value without introducing a plan database or account model.
- **Shopping starter, not grocery automation:** provides a practical next step without pretending to calculate quantities or inventories.
- **Four-week authored rotation:** enough variation to make the weekly refresh real while keeping content reviewable and deterministic.
- **No calorie allocation per meal:** the calculator gives context but does not imply nutrition-prescription precision.

## License

ISC — see [LICENSE](LICENSE).
