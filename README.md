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
| Forms | Native validation, explicit local-only privacy boundary |
| Performance | One eager raster, lazy below-fold media, rendering containment |
| Quality | Unit/static checks, HTML validation, axe, responsive and cross-browser journeys |

## Architecture at a glance

```text
js/
├── app.js
├── domain/
│   └── calculator.js
├── ui/
│   ├── modal.js
│   └── tabs.js
└── features/
    ├── calculator.js
    ├── calculator-storage.js
    ├── carousel.js
    ├── forms.js
    └── menu.js
```

`app.js` is the composition root. The calculator keeps formula/validation logic independent from the DOM. Persistence is isolated behind a small storage adapter. Features stay shallow and explicit rather than introducing framework-like abstractions.

See [ARCHITECTURE.md](ARCHITECTURE.md) for boundaries and trade-offs.

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

The initial page keeps only one authored raster eager. Inactive tabs, carousel media, and generated menu images use browser-native lazy loading and asynchronous decoding. The CSS deliberately avoids section-level rendering skips so accessibility and visual state remain deterministic.

A repository test enforces the current eager-raster budget. The original JPEG source assets remain an explicit optimization opportunity for future AVIF/WebP conversion.

## Privacy and product integrity

- request forms do not call a backend;
- no request payload is persisted;
- expired countdown/scarcity mechanics were removed instead of moved to a fake future date;
- intrusive timed/scroll-triggered modal opening was removed;
- calorie output is labeled as a general-information adult estimate, not medical advice.

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
- **Static forms:** honest demo behavior is preferred over a fake or unreliable backend.
- **Original JPEG sources:** loading strategy is optimized now; next-gen binary re-encoding remains future work.
- **Calculator formula preserved:** architecture and validation were improved without silently changing the original calculation model.

## License

ISC — see [LICENSE](LICENSE).
