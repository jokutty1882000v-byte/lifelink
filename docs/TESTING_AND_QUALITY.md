# Testing, PWA & Accessibility

## Unit tests

We have specs for the pure business logic — the parts that break silently and
matter most (Haversine distance, donor ranking, form validators, date helpers).

```powershell
npm test              # Karma + Chrome, watch mode
npm test -- --watch=false --browsers=ChromeHeadless   # CI-style single run
```

Specs live next to their sources, e.g.:
- `src/app/core/utils/distance.util.spec.ts`
- `src/app/core/utils/donor-ranking.util.spec.ts`
- `src/app/core/utils/validators.util.spec.ts`
- `src/app/core/utils/date.util.spec.ts`

**Coverage focus:** we don't test Angular components with heavy mocking here.
Cover the code that has actual conditional logic — utils, services with
non-trivial branching, and API contract mappers when they exist.

## PWA / installable

The app registers a service worker in production builds only (not `npm start`).

**To try it locally**:
```powershell
npm run build
npx http-server dist/lifelink/browser -p 4200
```

Then open `http://localhost:4200` in Chrome — you should see an "Install app"
icon in the address bar. Once installed, it opens in its own window and works
offline for the app shell + cached hospital/blood-bank lookups (freshness
strategy, 1-day TTL — see `ngsw-config.json`).

**Icons**: drop `icon-192.png` and `icon-512.png` into `public/icons/` — the
manifest already references them.

## Accessibility

Baked-in a11y features:
- **Skip link** — press Tab on any page after login → "Skip to main content"
  becomes visible; Enter jumps to `<main>`.
- **Landmarks** — `<mat-toolbar role="banner">`, `<nav aria-label="Primary">`,
  `<main id="ll-main">`, `<nav aria-label="Bottom">`.
- **Focus rings** — Angular Material handles buttons/inputs; the global CSS
  adds a red 2 px ring for anchors and custom buttons on keyboard focus.
- **Reduced motion** — `@media (prefers-reduced-motion)` disables animations
  in `styles.scss`.
- **ARIA labels** — icon-only buttons in the top bar and cards carry
  `aria-label` / `matTooltip` fallbacks.

### Manual audit
1. Chrome DevTools → Lighthouse → Accessibility category → run against
   `http://localhost:4200/dashboard` (log in first).
2. Target ≥ 90.
3. Common misses to watch: color contrast on custom pills, form-error
   `role="alert"` (add if a formal audit fails).

## Bundle audit

Production build enforces two budgets (see `angular.json`):
- Initial bundle: warn > 700 kB, error > 1.5 MB
- Any single component style: warn > 6 kB, error > 12 kB

To visualise what's in the bundle:
```powershell
npm run build -- --stats-json
npx source-map-explorer "dist/lifelink/browser/*.js"
```

Leaflet + `@angular/material` dominate. Both are already tree-shaken by the
standalone-component setup (unused Material modules never load).
