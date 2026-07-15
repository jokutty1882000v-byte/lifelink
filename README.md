# LifeLink — Blood Donor Search

Angular 18 frontend for finding suitable blood donors, nearby hospitals & blood banks, with AI-assisted matching.

## Stack
- Angular 18 (standalone components + Signals)
- Angular Material 3 + Tailwind CSS
- Leaflet (maps)
- Python (FastAPI) backend — separate repo

## Getting started
```bash
npm install
npm start        # http://localhost:4200
```

The frontend runs against mock data by default. Toggle `useMockApi: false` in
`src/environments/environment.ts` once the FastAPI backend is running.

## Project structure
See `src/app/` — `core/` holds singletons, `shared/` reusable UI,
`features/` per-screen modules (lazy-loaded), `state/` signal stores.
