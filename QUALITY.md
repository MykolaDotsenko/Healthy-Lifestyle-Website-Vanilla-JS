# Quality Strategy

Quality checks are split by failure type so regressions are caught at the cheapest useful layer.

## 1. Syntax and static integrity

`npm run lint` syntax-checks authored JavaScript and test files.

`npm run check:static` verifies:

- no unresolved merge markers;
- local HTML/CSS references resolve;
- required package scripts exist.

## 2. Node test suite

`npm test` covers contracts that do not require a browser, including:

- legacy behavior characterization;
- semantic markup invariants;
- responsive CSS architecture;
- module dependency boundaries;
- calculator formulas and validation;
- calculator storage recovery/migration;
- tab keyboard model;
- carousel architecture;
- native dialog behavior;
- static-form privacy boundary;
- removal of expired urgency;
- image loading/performance budget;
- product/SEO metadata;
- recruiter-facing hero signal.

## 3. Semantic HTML validation

CI runs `html-validate` against `index.html`.

This catches structural and ARIA misuse that string-level tests should not try to duplicate.

## 4. Responsive Chromium journey

The browser smoke suite checks multiple viewports:

- 320 × 800;
- 390 × 844;
- 768 × 900;
- 1024 × 900;
- 1440 × 1000.

It verifies real rendering and interaction states, including:

- no document-level horizontal overflow;
- module boot and menu rendering;
- calculator valid/invalid recovery;
- keyboard tabs;
- carousel navigation and resize stability;
- dialog open/close/focus behavior;
- local-only form disclosure;
- absence of page errors.

## 5. Automated accessibility

CI temporarily installs `@axe-core/playwright` and scans:

- 320px initial state;
- desktop initial state;
- state after tab activation;
- state with the native dialog open.

Any axe violation fails the gate.

## 6. Cross-browser critical journey

The same core product journey runs in:

- Chromium;
- Firefox;
- WebKit.

The gate verifies the visible H1, keyboard tab activation, carousel state, calculator output, native dialog behavior, Escape closing, and browser runtime errors.

## Dependency policy

The production project intentionally has no runtime or development packages.

Browser quality tools are pinned and installed only inside CI so verification depth does not become shipped product complexity.

## What remains manual

Automation does not replace human review. Before treating a release as portfolio-ready, manually inspect:

- visual hierarchy;
- copy accuracy;
- zoom/readability;
- focus visibility;
- touch ergonomics;
- real screen-reader announcements;
- image quality and art direction.

Automated tests are regression protection, not proof that every UX decision is optimal.
