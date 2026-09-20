# NourishFlow

[![Quality](https://github.com/MykolaDotsenko/Healthy-Lifestyle-Website-Vanilla-JS/actions/workflows/quality.yml/badge.svg)](https://github.com/MykolaDotsenko/Healthy-Lifestyle-Website-Vanilla-JS/actions/workflows/quality.yml)

**Accessible nutrition UX built with the native web platform — no framework, no bundler, no production dependencies.**

[Live demo](https://mykoladotsenko.github.io/Healthy-Lifestyle-Website-Vanilla-JS/) · [Architecture](ARCHITECTURE.md) · [Quality strategy](QUALITY.md)

## Why this project exists

NourishFlow is a portfolio product concept designed to demonstrate frontend fundamentals that frameworks can hide: semantic HTML, accessible interaction patterns, responsive CSS architecture, explicit state management, pure domain logic, browser APIs, and automated quality gates.

It is intentionally **not** presented as a functioning meal-delivery company. Request forms are local-only demos and no personal data is transmitted or stored.

## What it demonstrates

| Area | Implementation |
| --- | --- |
| HTML | Semantic landmarks, native controls, labels, fieldsets, skip link |
| CSS | Mobile-first cascade layers, design tokens, Grid/Flexbox, fluid sizing |
| JavaScript | Native ES modules with a small composition root |
| Tabs | WAI-style keyboard model with roving focus and automatic activation |
| Carousel | Index-based, resize-safe, button-controlled, no autoplay |
| Dialog | Native `<dialog>`, initial focus, Escape, focus restoration |
| Calculator | Pure domain calculation, validation, safe versioned preferences |
| Plan | Local meal-style + energy + weekly-idea summary with clipboard copy |
| Weekly cycle | Deterministic Monday rotation shared by the menu and countdown |
| Performance | Responsive AVIF/WebP sources, JPEG fallback, intrinsic sizing, lazy below-fold media |
| Quality | Unit/static checks, HTML validation, axe, responsive and cross-browser journeys |

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
    └── timer.js
```

`app.js` is the composition root. Calculator rules, meal-style data, and weekly-cycle logic live in browser-independent domain modules. Persistence is isolated behind a small storage adapter, while the plan feature coordinates selected style and energy events without introducing global state infrastructure.

See [ARCHITECTURE.md](ARCHITECTURE.md) for boundaries and trade-offs.

## Visual direction

NourishFlow keeps the character of the original healthy-lifestyle interface while polishing it for a modern portfolio: a light canvas, pale blue and yellow section fields, a restrained bright-green interaction accent, the original image-led meal selector, compact typography, and product content before implementation commentary. The redesign deliberately avoids a large recruiter-facing hero or engineering-scorecard UI; technical evidence lives in the repository documentation instead of competing with the product experience. Section labels use product language, headings rely on a tighter system-font hierarchy, and the weekly countdown is presented as one restrained editorial surface rather than four separate dashboard cards.

## Accessibility

The interface is designed around native semantics first:

- keyboard-operable tabs with `ArrowUp`, `ArrowDown`, `Home`, and `End`;
- visible `:focus-visible` states;
- native dialog modality and Escape behavior;
- labeled inputs and validation feedback;
- reduced-motion and forced-colors support;
- 44px interaction baseline for primary controls;
- responsive reflow down to 320 CSS pixels without hiding horizontal overflow bugs.

CI runs axe against mobile and desktop states and exercises the critical journey in Chromium, Firefox, and WebKit.

## Performance

NourishFlow serves responsive AVIF first, WebP second, and the original JPEG as a compatibility fallback. The seven source JPEGs total **3,459,362 bytes**; their 768px AVIF variants total **199,272 bytes (94.2% smaller)** and their 1440px AVIF variants total **566,645 bytes (83.6% smaller)**. The first visible meal image drops from 367,553 bytes as JPEG to 29,692 bytes at 768px AVIF or 72,399 bytes at 1440px AVIF.

Only the first visible raster is eager and high-priority. Inactive tabs, carousel media, and generated menu images remain lazy and asynchronously decoded. Every authored raster fallback carries intrinsic `width`/`height` metadata to protect layout stability.

The next-gen assets are reproducible with the pinned generator:

```bash
npm install --no-save --package-lock=false sharp@0.35.4
node scripts/optimize-images.mjs
```

`img/optimized/manifest.json` records source dimensions and byte sizes for every generated variant, and automated tests enforce the modern-source and size budgets.

## Privacy and product integrity

- the product asks for no name, phone number, account, or other personal details;
- only calculator preferences are stored locally in a versioned key;
- unknown future storage schemas are preserved rather than destructively downgraded;
- meal ideas genuinely rotate on the same Monday boundary shown by the countdown;
- calorie output is presented as an approximate general-information adult maintenance estimate, not medical advice.

## Run locally

Requirements: Node.js 22+.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:8080`.

## Verify

Fast dependency-free checks:

```bash
npm run check
```

GitHub Actions additionally installs browser-test tooling temporarily and runs HTML validation, responsive browser smoke, automated accessibility scans, and cross-browser critical journeys.

See [QUALITY.md](QUALITY.md) for the complete verification model.

## Key trade-offs

- **No framework:** chosen deliberately to expose web-platform fundamentals and keep runtime complexity low.
- **No bundler:** native modules are sufficient for this project size.
- **Local plan:** the useful end state is a copyable summary rather than a fake request submission or simulated backend.
- **JPEG fallbacks retained:** originals remain for compatibility and social-preview safety, while supporting browsers receive responsive AVIF/WebP sources.
- **Calculator formula preserved:** architecture and validation were improved without silently changing the original calculation model.

## License

ISC — see [LICENSE](LICENSE).
