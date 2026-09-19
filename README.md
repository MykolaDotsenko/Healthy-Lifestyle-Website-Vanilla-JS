# Healthy Lifestyle Website

A healthy-lifestyle landing page built with semantic HTML, Vanilla CSS, and Vanilla JavaScript.

**Live demo:** https://mykoladotsenko.github.io/Healthy-Lifestyle-Website-Vanilla-JS/

## Current feature baseline

- eating-style tabs;
- promotion countdown;
- contact modal;
- menu cards;
- order/contact forms;
- image carousel;
- calorie calculator;
- saved gender and activity preferences via `localStorage`.

## Local development

Requirements: Node.js 22+.

```bash
npm install
npm run dev
```

The static site is then available at `http://127.0.0.1:8080`.

## Responsive CSS foundation

The interface now uses a mobile-first Vanilla CSS architecture with cascade layers, design tokens, fluid containers, CSS Grid/Flexbox, `clamp()` typography/spacing, accessible focus states, reduced-motion support, and content-driven breakpoints. The layout is designed to reflow down to a 320 CSS-pixel viewport without relying on the old fixed desktop widths.

## JavaScript architecture

The browser code uses native ES modules with a deliberately shallow structure:

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
    ├── menu.js
    └── timer.js
```

`app.js` is the composition root. Feature modules do not import each other; the only explicit cross-feature dependency is the modal API passed into forms. This keeps the Vanilla JavaScript architecture easy to trace without introducing a framework, bundler, global event bus, repository layer, or unnecessary abstraction.

## Calculator domain

The calorie estimator keeps formula and validation logic independent from the DOM. `js/domain/calculator.js` is pure and unit-tested, while `calculator.js` owns browser interaction and `calculator-storage.js` owns the versioned local-storage boundary. Invalid or corrupted saved preferences fall back safely, legacy `sex`/`ratio` keys migrate automatically, and invalid numeric input never renders `NaN`.

The current formula is preserved for continuity. The UI labels the result as an adult general-information estimate rather than medical advice.

## Accessible tabs

The eating-style selector implements the WAI-ARIA tabs pattern with one roving tab stop, explicit `tablist/tab/tabpanel` semantics, automatic activation, vertical `ArrowUp/ArrowDown` navigation, and `Home/End` shortcuts.

## Accessible carousel

The meal carousel uses index-based percentage transforms instead of pixel measurements, so resize cannot corrupt the active slide. It has no autoplay, exposes carousel/slide semantics, uses native buttons for previous/next and slide pickers, and keeps visual layout rules in CSS rather than inline JavaScript.

## Native dialog

Contact UI uses the platform `<dialog>` element with `showModal()`/`close()`, explicit initial focus, deterministic focus return, native Escape behavior, and a CSS `::backdrop`. Intrusive timed and scroll-triggered popups were removed.

## Static form boundary

The portfolio is intentionally static. Request forms validate with native HTML constraints and demonstrate the UX flow locally, but they do not transmit or persist personal data. No request payload leaves the browser. The old localhost `json-server`, `db.json`, spinner asset, and network submission path were removed rather than simulating a successful backend request.

## Quality checks

```bash
npm run check
```

The refactor baseline now includes regression checks plus a semantic HTML foundation: native buttons, labeled form controls, fieldset/legend radio groups, landmark structure, a skip link, semantic menu cards, and keyboard-focusable primary interactions.

## Known baseline limitations

The remaining major legacy behavior is the hard-coded expired promotion. Final performance, product positioning, and repository presentation are handled in later roadmap PRs.
