# Complete Security Remediation Plan

## Summary

Replace the custom school credential system with CAPTCHA-protected Supabase email magic-link authentication, lock down all database access with version-controlled RLS, move registration administration into Supabase Edge Functions, and remove the unused Gemini/Node API surface. Existing credentials will be invalidated and legacy registrations moved to a restricted archive without passwords.

## Incident Containment and Data Migration

- Immediately disable school login/registration, revoke all `anon` access to `registrations` and `profiles`, enable RLS, and confirm anonymous reads and writes fail.
- Review and preserve Supabase API logs for unexpected `registrations` or `profiles` reads; document the exposure window and escalate any notification obligations.
- Add a transactional Supabase migration that:
  - Copies legacy school, contact, status, code, and timestamp data into an admin-only `registration_archive`, excluding passwords.
  - Deletes active legacy rows, drops `registrations.password`, and invalidates every issued credential.
  - Adds a required unique `user_id` referencing `auth.users`, database-generated non-secret `school_code`, `status default 'pending'`, timestamps, and constraints for 2–120 character school names and E.164-style phone numbers.
  - Prevents duplicate active registrations per Auth user.
- Require every school to re-enroll through a newly verified email; legacy archive records are never treated as active identities.

## Authentication, Authorization, and API Changes

- Configure Supabase Auth for PKCE email magic links and Cloudflare Turnstile. Use query-based callbacks compatible with the existing hash router.
- Change the portal flow to:
  1. Accept email and a Turnstile token.
  2. Send a magic link through `signInWithOtp`.
  3. Restore the Supabase session after callback.
  4. Show a CAPTCHA-protected registration form to verified users without a registration.
  5. Route approved users to the dashboard and show pending/rejected status otherwise.
- Replace `sessionStorage.genesis_school` with the Supabase session. Fetch only the authenticated user's school name, code, and status; never persist contact data or credentials in browser storage.
- Add Edge Functions:
  - `submit-registration`: authenticated `POST` accepting `{ schoolName, teacherWhatsapp, captchaToken }`; verify Turnstile, derive email/user ID from the JWT, normalize and validate input, enforce one registration per user, and apply limits of 5 attempts/user/hour and 20 attempts/IP/hour.
  - `admin-registrations`: authenticated admin-only listing and status changes. Approval generates the display-only school code; rejection records the status without creating credentials.
- Keep the service-role key only in Edge Function secrets. Verify admin status server-side from `profiles`; client-side checks are presentation only.
- RLS and grants:
  - `anon`: no access to `registrations`, `profiles`, archives, or rate-limit data.
  - School users: select only their own registration and profile; no direct inserts, updates, or deletes.
  - Admins: select active registrations and archives through reviewed admin policies; mutations still go through the Edge Function.
  - Protect `profiles.is_admin` from all client updates and use a non-recursive security-definer helper where policies need an admin check.
- Remove `/api/generate-dossier`, Gemini configuration, `server/index.js`, and the combined Node development runner because the endpoint is unused and the selected backend is Supabase Functions.
- Restrict Edge Function CORS to configured production origins plus explicit localhost development origins, return `Vary: Origin`, and allow only required methods and headers.

## Error Handling and Repository Hardening

- Give Edge Function responses a stable shape such as `{ ok, code, message, requestId }`; expose generic messages while logging structured internal details under the same correlation ID.
- Replace raw Supabase/Auth errors in portal and admin screens with stable user-facing messages. Do not log tokens, CAPTCHA values, phone numbers, or upstream payloads.
- Change `.gitignore` to ignore `.env` and `.env.*` while retaining `.env.example`.
- Add `.env.example` entries for the public Supabase and Turnstile values; document Edge Function secrets separately and remove obsolete Gemini/API variables.
- Configure Resend as Supabase Auth's custom SMTP provider using a restricted API key, a verified sending subdomain, and authenticated DNS records. Disable link tracking for magic-link messages and keep the API key out of frontend variables.
- Upgrade and lock Vite to at least `8.1.5` and PostCSS to at least `8.5.19`, refresh the lockfile, and rerun `npm audit`.

## Verification and Rollout

- Add local/CI Supabase integration tests covering:
  - Anonymous denial for every sensitive table and operation.
  - School ownership isolation and inability to mutate status, code, or admin flags.
  - Admin reads and Edge Function approval/rejection authorization.
  - Rejection of missing/invalid JWTs, non-admin callers, reused/invalid CAPTCHA tokens, malformed and oversized values, duplicate registrations, and exceeded rate limits.
  - Migration guarantees that no plaintext password column or value remains.
- Add frontend tests for magic-link callback restoration, pending/rejected/approved routing, logout, stale forged `sessionStorage` data, generic errors, and absence of sensitive browser storage.
- Run `npm run build`, `npm audit`, local Supabase migrations/tests, and manual checks of `#/portal` and `#/admin`.
- Deploy in order: containment SQL, database migration, Edge Functions and secrets, Auth/CAPTCHA configuration, then frontend. Keep enrollment closed until anonymous probes return denial or zero authorized rows and all old credentials have been invalidated.
- Reopen registration, monitor Auth, Edge Function, CAPTCHA, and database denial/rate-limit logs, and remove the temporary maintenance notice after successful verification.

## Assumptions

- Cloudflare Turnstile is the CAPTCHA provider.
- Resend is the SMTP provider. The deployment targets its free transactional tier of 3,000 emails per month and 100 emails per day; exceeding either limit requires a paid plan or controlled enrollment scheduling.
- Verified email magic links are the only school authentication method; school codes remain display identifiers, not credentials.
- Rejected users cannot resubmit automatically and must contact an administrator.
- Legacy contact data is retained only in the admin-only audit archive according to the organization's eventual retention policy; plaintext passwords are never archived.
