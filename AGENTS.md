# Repository Guidelines

## Project Structure & Module Organization

The Vite/React application lives in `src/`. Route-level views are in `src/pages/`, with mobile variants under `src/pages/mobile/`; reusable UI follows the same split in `src/components/`. Shared authentication, Supabase clients, and hooks belong in `src/lib/`. Keep component styles beside their JSX files, bundled assets in `src/assets/`, and unchanged static files in `public/`.

Backend infrastructure is under `supabase/`: Edge Functions live in `supabase/functions/`, shared server utilities in `_shared/`, SQL migrations in `migrations/`, and database tests in `tests/database/`. Longer project and security notes are in `docs/`.

## Build, Test, and Development Commands

- `npm install` installs the locked dependency set.
- `npm run dev` starts Vite on port 5173 and opens the app locally.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves that bundle for a final browser check.
- `npm test` runs the Vitest suite once; `npm run test:watch` reruns tests during development.
- `npm run test:edge` runs Deno tests for Edge Functions.
- `npm run typecheck:edge` checks all deployed function entry points.
- `npm run test:db` runs pgTAP tests against the local Supabase stack.

## Coding Style & Naming Conventions

Use ES modules, two-space indentation, single quotes, semicolons, and trailing commas in multiline structures. React components and files use PascalCase (`SchoolDashboardPage.jsx`); hooks begin with `use`, and functions use camelCase. Deno formatting is configured for 100-column lines. No repository-wide lint command exists, so match nearby code and keep changes narrowly scoped.

## Testing Guidelines

Place frontend tests beside their modules as `*.test.js` and use Vitest with Testing Library. Name Deno cases descriptively with `Deno.test`; keep database security assertions in pgTAP SQL. Add or update tests for authentication, validation, permissions, and state transitions. There is no stated coverage threshold; all relevant suites and `npm run build` should pass before review.

## Commit & Pull Request Guidelines

Recent commits use short, lowercase, outcome-focused subjects such as `mobile functionality added`. Keep commits focused and use imperative summaries. Pull requests should explain intent, list validation commands, link issues, and include screenshots for visible changes. Call out migrations, environment changes, and security impact explicitly.

## Security & Configuration

Keep `.env` and privileged Supabase keys out of commits. Client variables must use the `VITE_` prefix; service-role and encryption keys belong only in Edge Function secrets. Review `docs/security/` before modifying authentication, CORS, credentials, registration flows, or row-level access.
