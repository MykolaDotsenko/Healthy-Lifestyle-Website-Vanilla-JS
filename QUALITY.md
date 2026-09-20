# Quality Strategy

Quality checks are split by failure type so regressions are caught at the cheapest useful layer while visual judgment remains explicitly human-reviewed.

## 1. Syntax and static integrity

`npm run check:syntax` recursively discovers JavaScript under `js/`, `scripts/`, and `tests/` and runs Node syntax validation on every file. New modules cannot silently escape the syntax gate.

`npm run check:static` recursively verifies authored source/test files for merge markers, confirms local HTML/CSS references resolve, and checks required package scripts.

## 2. Node contracts

`npm test` covers browser-independent or source-level contracts including:

- calculator formulas and validation;
- forward-safe calculator preference migration;
- coherent four-approach taxonomy;
- four weekly variants per approach;
- Morning/Midday/Evening plan structure;
- static HTML/domain alignment for tab labels, images, and descriptions;
- another-set behavior;
- plan text generation;
- saved-plan validation and versioned persistence;
- module/domain boundaries;
- callback-oriented composition instead of a document event bus;
- accessible tab and carousel contracts;
- responsive CSS protections;
- image source and byte budgets;
- product/SEO metadata;
- documentation and hygiene.

## 3. Semantic HTML validation

CI runs `html-validate` against `index.html`.

## 4. Responsive and touch-aware Chromium journey

The browser journey checks:

- 320 × 800;
- 360 × 800;
- 390 × 844;
- 768 × 900;
- 1024 × 900;
- 1440 × 1000.

Mobile-width contexts enable touch/mobile behavior.

The journey verifies:

- the product selector remains near the first fold on small screens;
- no document-level horizontal overflow;
- four meal approaches render;
- responsive AVIF selection;
- calculator valid/invalid recovery;
- keyboard tabs;
- carousel state and useful live announcement;
- three plan meal slots;
- shopping starter content;
- Another Set changes the current plan;
- Save Plan persists locally;
- Copy Plan provides success feedback;
- dialog sizing and focus restoration;
- saved-plan recovery after reload;
- no browser runtime errors.

## 5. Automated accessibility

Axe scans:

- 320px initial state;
- 390px initial state;
- desktop initial state;
- a changed tab state;
- the full plan dialog.

Axe is a regression gate, not a substitute for screen-reader review.

## 6. Cross-browser critical journey

The core flow runs in:

- Chromium;
- Firefox;
- WebKit.

It verifies the visible H1, keyboard tab activation, carousel state, calculator output, three-meal plan rendering, native dialog Escape behavior, focus restoration, and browser runtime errors.

## 7. Visual audit artifacts

CI captures actual rendered screenshots at:

- 390px mobile;
- 768px tablet;
- 1440px desktop.

It captures both first-fold and full-page states, forces lazy media to load, and also captures the mobile plan dialog.

The files are uploaded as the `nourishflow-visual-audit` workflow artifact for manual review. This exists because overflow tests and axe cannot judge hierarchy, cropping, whitespace, brand quality, or whether a CTA visually dominates the wrong part of the page.

## Dependency policy

The shipped product has no runtime dependencies. Browser quality tools are pinned to explicit top-level versions in CI and are not shipped to the user.

## What remains manual

Before release, inspect the visual-audit artifacts for:

- logo/wordmark legibility;
- first-fold hierarchy;
- image crop and lazy-loading completion;
- spacing rhythm;
- touch ergonomics;
- dialog density on mobile;
- content usefulness;
- real screen-reader announcements;
- clipboard fallback messaging.

Automation protects contracts. It does not decide whether the product feels good.
