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

The existing form flow still uses the legacy local JSON API. Run it in a second terminal when testing form submission:

```bash
npm run api
```

## Quality checks

```bash
npm run check
```

The refactor baseline now includes regression checks plus a semantic HTML foundation: native buttons, labeled form controls, fieldset/legend radio groups, landmark structure, a skip link, semantic menu cards, and keyboard-focusable primary interactions.

## Known baseline limitations

The production GitHub Pages deployment still contains legacy behavior that will be addressed in dedicated follow-up refactors: the contact form targets the local mock API, the promotion deadline is hard-coded, the layout remains desktop-first, and advanced keyboard/focus behavior for the tabs, carousel, and modal is intentionally deferred to their dedicated refactors.
