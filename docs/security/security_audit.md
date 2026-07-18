# Security Audit Report

**Audit date:** 2026-07-18  
**Scope:** All 68 working-tree files, generated frontend bundles, configuration and templates, backend logic, package lockfile, image metadata, and all six Git commits. Read-only live checks were made against the Supabase REST API; no row contents were retrieved and no database writes were attempted.

## Executive Summary

The application has one confirmed critical breach condition: the live Supabase project permits unauthenticated users to select existing `registrations` rows, including the `teacher_whatsapp` and plaintext `password` columns. The `profiles.id` and `profiles.is_admin` columns are also anonymously readable. Existing school credentials must be treated as exposed.

Immediate actions:

1. Revoke anonymous reads from `registrations` and `profiles`.
2. Disable the custom school login and rotate every issued school credential.
3. Review Supabase API logs for bulk or unexpected reads.
4. Replace custom passwords with Supabase Auth and deploy reviewed RLS migrations.

## Findings

### SEC-01: Anonymous disclosure of registration data

- **Severity:** Critical
- **Location:** `src/pages/portal/PortalPage.jsx:50-56`; `dist/assets/index-CLaF9EMi.js:8`
- **Exploit path:** An attacker extracts the public Supabase URL and anon token from the client bundle and directly queries PostgREST to retrieve registration passwords and teacher phone numbers.
- **Evidence:** A zero-content `HEAD` request using the anon role returned HTTP 206, confirmed existing rows, and allowed selection of `teacher_whatsapp` and `password`. A similar request to `profiles` returned HTTP 200 for `id` and `is_admin`.
- **Fix:** Immediately apply:

```sql
revoke select, update, delete on public.registrations from anon;
revoke select on public.profiles from anon;

alter table public.registrations enable row level security;
alter table public.profiles enable row level security;
```

Move registration/login behind Supabase Auth or a trusted server/Edge Function. Add version-controlled policies using `TO authenticated`, `auth.uid()`, `USING`, and `WITH CHECK`. The live anonymous endpoint advertised `GET, HEAD, POST, OPTIONS`, not `PATCH`; anonymous updates described in the older `security.md` were not confirmed.

### SEC-02: Weak plaintext school passwords

- **Severity:** High
- **Location:** `src/pages/admin/AdminDashboard.jsx:20-21,52-61,165`; `src/pages/portal/PortalPage.jsx:50-55`
- **Exploit path:** Six-digit values generated with `Math.random()` are stored, displayed, and compared as plaintext, allowing database readers to replay credentials and enabling targeted brute force.
- **Fix:** Migrate schools to Supabase Auth with email/phone password authentication or OTP. Rotate current credentials, migrate accounts, and then remove `registrations.password`. Do not expose password-verification queries through PostgREST.

### SEC-03: Unauthenticated Gemini API proxy

- **Severity:** High
- **Location:** `server/index.js:16-20,45-52,84-105`
- **Exploit path:** Any caller or website can repeatedly invoke `GET /api/generate-dossier`, consuming the server's Gemini quota and causing billing or availability impact.
- **Evidence:** A local unauthenticated request returned `200 OK` with `Access-Control-Allow-Origin: *`.
- **Fix:** Accept only `POST`, validate a Supabase bearer token server-side, authorize the caller, add per-user/IP rate limits and quotas, restrict the production origin, and cap each accepted field. CORS must not be treated as authentication.

```diff
- 'Access-Control-Allow-Origin': '*',
+ 'Access-Control-Allow-Origin': process.env.APP_ORIGIN,

- if (req.method !== 'GET' && req.method !== 'POST') {
+ if (req.method !== 'POST') {
```

### SEC-04: Forgeable client-side school session

- **Severity:** Medium
- **Location:** `src/pages/portal/PortalPage.jsx:65`; `src/pages/portal/SchoolDashboard.jsx:24-34`
- **Exploit path:** An attacker can set `sessionStorage.genesis_school` to arbitrary JSON and enter the dashboard as any claimed school. Legitimate login also stores the complete registration record, including sensitive fields.
- **Fix:** Use a real Supabase Auth session and retrieve the authenticated user's profile through ownership-based RLS. Never use browser-controlled profile JSON as proof of identity. Do not store passwords or phone numbers in web storage.

### SEC-05: Anonymous registration spam and weak validation

- **Severity:** Medium
- **Location:** `src/pages/portal/PortalPage.jsx:16-27,131-157`
- **Exploit path:** Attackers bypass HTML `required` controls and automate anonymous PostgREST inserts containing malformed or oversized values, filling the table and disrupting administrators.
- **Fix:** Submit through a rate-limited Edge Function/API with CAPTCHA; validate names and E.164-style phone numbers; enforce database constraints; make `status` default to `pending` and prevent public callers from setting privileged columns.

```sql
alter table public.registrations
  add constraint school_name_length
    check (char_length(school_name) between 2 and 120),
  add constraint whatsapp_format
    check (teacher_whatsapp ~ '^\+?[1-9][0-9]{7,14}$');
```

### SEC-06: Vulnerable build dependencies

- **Severity:** High
- **Location:** `package-lock.json:937-940,1067-1070`
- **Exploit path:** Vite 8.0.3 is vulnerable to filesystem-deny bypasses and arbitrary file reads when its development server is exposed. Current loopback binding reduces, but does not remove, development risk.
- **Fix:** Upgrade Vite to current 8.1.5 and refresh the lockfile. `npm audit` also identified PostCSS 8.5.8 (`GHSA-qx2v-qp2m-jg93`); its current XSS path is not reachable because this application does not process user CSS, but it should be upgraded to 8.5.19.

```bash
npm install --save-dev vite@8.1.5
npm update
npm audit
```

References: [Vite GHSA-p9ff-h696-f583](https://github.com/advisories/GHSA-p9ff-h696-f583), [PostCSS GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93).

### SEC-07: Raw backend errors exposed to clients

- **Severity:** Low
- **Location:** `src/pages/portal/PortalPage.jsx:31-32`; `src/pages/admin/AdminLogin.jsx:26-29`; `server/index.js:428-437`
- **Exploit path:** Deliberately invalid requests expose database constraint, authentication, or upstream Gemini details that assist reconnaissance.
- **Fix:** Return stable generic messages with correlation IDs and retain detailed errors only in protected server logs.

### SEC-08: Incomplete environment-file exclusions

- **Severity:** Low
- **Location:** `.gitignore:1-2`
- **Exploit path:** A developer can accidentally commit `.env.local`, `.env.development`, or `.env.production` containing production credentials.
- **Fix:** Use:

```gitignore
.env
.env.*
!.env.example
```

## Secret and History Review

No Gemini key, Supabase service-role key, database URI, private key, GitHub token, AWS key, or tracked secret-bearing `.env` file was found in the current tree or six-commit history. The JWT embedded in `dist` has the Supabase `anon` role; it is designed to be public, but open RLS turns it into an effective path to private data.

## Negative Results

- No confirmed SQL, command, template, or DOM XSS injection was found. Supabase SDK filters are parameterized, React escapes text, and canvas rendering uses `fillText`.
- No file upload implementation exists, so upload type, size, and traversal issues do not apply.
- No cookie-authenticated backend mutation exists, so traditional CSRF does not apply. The unauthenticated Gemini route remains independently exploitable.
- The PNG assets contained no profiles or comments indicating sensitive metadata.
- No debug stack trace is returned by the custom Node API; internal errors are logged server-side and a generic 500 is used, except for the upstream warning details noted in SEC-07.

## Verification After Remediation

From an unauthenticated client, verify that `registrations` and `profiles` reads return `401/403` or zero policy-authorized rows, public updates/deletes fail, and inserts can set only approved public fields. Add CI tests for anon, normal authenticated, and admin roles, then rerun `npm audit` and rotate all previously exposed school credentials.
