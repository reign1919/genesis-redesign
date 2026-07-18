# Repository Guidelines

## Project Structure & Module Organization

This repository contains a React 19 application built with Vite and a small Node HTTP API. Frontend code lives in `src/`: reusable UI is in `src/components/`, route-level screens are under `src/pages/`, shared hooks are in `src/hooks/`, event content is in `src/data/`, and service clients are in `src/lib/`. Static images belong in `public/`. The API implementation is `server/index.js`; `scripts/dev.js` starts the frontend and API together. Treat `dist/` as generated build output.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies from `package-lock.json`.
- `npm run dev` starts the Vite frontend at `http://localhost:5173`.
- `node scripts/dev.js` starts both Vite and the API (default API port `8787`).
- `npm run build` creates a production bundle in `dist/`.
- `npm run preview` serves the production bundle for local verification.
- `curl http://127.0.0.1:8787/api/health` checks API configuration and availability.

## Coding Style & Naming Conventions

Follow the existing JavaScript and JSX style: two-space indentation, single quotes, semicolons, trailing commas in multiline objects, and ES modules. Name React components and their files in PascalCase (`EventCard.jsx`), hooks with a `use` prefix (`useHashRoute.js`), and functions or variables in camelCase. Keep component-specific CSS beside its component and prefer existing CSS classes over new inline styles. No formatter or linter is currently configured, so keep changes consistent with neighboring code.

## Testing Guidelines

There is no automated test framework or coverage threshold yet. Before opening a pull request, run `npm run build`, exercise affected hash routes (for example `#/portal` and `#/admin`), and verify API changes through `/api/health` and the relevant endpoint. If tests are introduced, place them beside the implementation as `*.test.jsx` or `*.test.js` and add the runner to `package.json`.

## Commit & Pull Request Guidelines

History favors short, outcome-focused subjects such as `fix: remove node_modules to fix vercel permissions` and `Design updates with terminal intro updates and compass intro`. Use an imperative subject, optionally with a conventional prefix such as `fix:` or `feat:`, and keep each commit focused. Pull requests should explain the change, list verification performed, link related issues, and include before/after screenshots for UI work.

## Security & Configuration

Copy `.env.example` to `.env` and keep secrets out of commits. Frontend Supabase values use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; server configuration includes `GEMINI_API_KEY`, `GEMINI_MODEL`, and `API_PORT`. Never expose privileged Supabase keys in client code, and review `security.md` before changing authentication, registration data, CORS, or storage behavior.
