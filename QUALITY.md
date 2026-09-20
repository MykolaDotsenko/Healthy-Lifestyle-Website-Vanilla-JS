# Quality Strategy

Quality checks are split by failure type so regressions are caught at the cheapest useful layer.

## 1. Syntax and static integrity

`npm run check:syntax` syntax-checks authored JavaScript and test files.

`npm run check:static` recursively discovers authored source/test files, verifies unresolved merge markers are absent, confirms local HTML/CSS references resolve, and checks required package scripts.

## 2. Node test suite

`npm test` covers contracts that do not require a browser, including:

- calculator formulas and validation;
- forward-safe calculator storage migration;
- canonical four-style meal model;
- deterministic weekly meal rotation;
- plan-summary construction without personal data;
- semantic markup invariants;
- responsive CSS architecture;
- module/domain boundaries;
- tab keyboard model;
- carousel architecture;
- native dialog behavior;
- image loading/performance budgets;
- product/SEO metadata;
- repository documentation and hygiene.

## 3. Semantic HTML validation

CI runs `html-validate` against `index.html`.

This catches structural and ARIA misuse that source-string tests should not duplicate.

## 4. Responsive Chromium journey

The browser smoke suite checks multiple viewports:

- 320 × 800;
- 360 × 800;
- 390 × 844;
- 768 × 900;
- 1024 × 900;
- 1440 × 1000.

It verifies real rendering and interaction states, including:

- no document-level horizontal overflow;
- module boot and four weekly menu cards;
- calculator valid/invalid recovery;
- keyboard tabs;
- carousel navigation and resize stability;
- plan-summary open/copy/close behavior;
- focus restoration;
- absence of page errors.

## 5. Automated accessibility

CI installs `@axe-core/playwright` temporarily and scans:

- 320px initial state;
- 390px initial state;
- desktop initial state;
- state after tab activation;
- state with the native plan dialog open.

Any axe violation fails the gate.

## 6. Cross-browser critical journey

The same core product journey runs in:

- Chromium;
- Firefox;
- WebKit.

The gate verifies the visible product H1, keyboard tab activation, carousel state, approximate calculator output, native plan dialog behavior, Escape closing, focus restoration, and browser runtime errors.

## Dependency policy

The shipped product has no runtime dependencies. Browser quality tools are pinned and installed only inside CI so the product remains native-web while verification stays reproducible.

## What remains manual

Automation does not replace human review. Before treating a release as portfolio-ready, manually inspect:

- visual hierarchy;
- product copy accuracy;
- zoom/readability;
- focus visibility;
- touch ergonomics;
- real screen-reader announcements;
- clipboard fallback messaging;
- image quality and art direction.

Automated tests are regression protection, not proof that every UX decision is optimal.
