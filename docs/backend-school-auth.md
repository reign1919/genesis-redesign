# School enrollment backend

This repository uses the hosted Supabase project `kcnmvggxqcxlbbfgtrwq` for school enrollment, approval, and authentication.

## User-facing routes

- `/login` — school registration and code/password sign-in
- `/dashboard` — authenticated approved-school dashboard
- `/admin` — administrator sign-in and registration approval panel
- `/contact` — existing Contact Us flow; independent of Supabase enrollment

## Enrollment flow

1. A school submits its name and teacher-in-charge WhatsApp number.
2. The admin panel lists the application as pending.
3. Rejection finalizes the application without sending a notification.
4. Approval creates a `GEN-####` code, a 16-character password, and a Supabase Auth account.
5. The admin copies or opens the generated WhatsApp message and sends it manually.
6. The same code and password are visible to administrators and the authenticated school dashboard.

## Frontend configuration

The ignored local `.env` requires these public values:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_ENROLLMENT_ENABLED=true
```

`VITE_SCHOOL_AUTH_DOMAIN` is optional and defaults to `schools.genesis.invalid`. It must match the Edge Function `SCHOOL_AUTH_EMAIL_DOMAIN` value if changed.

Do not add service-role, encryption, or database credentials to a frontend environment file.

## Hosted Edge Function secrets

Configure these with `supabase secrets set`:

```text
ALLOWED_ORIGINS
ENROLLMENT_ENABLED
SCHOOL_AUTH_EMAIL_DOMAIN
SCHOOL_CREDENTIAL_ENCRYPTION_KEY
PUBLIC_PORTAL_URL
```

For production, replace the current localhost values in `ALLOWED_ORIGINS` and `PUBLIC_PORTAL_URL` with the deployed frontend origin and `/login` URL.

## Deployment order

From this repository:

```bash
supabase link --project-ref kcnmvggxqcxlbbfgtrwq
supabase db push
supabase functions deploy submit-registration
supabase functions deploy admin-registrations
supabase functions deploy school-credentials
```

The hosted project already contains this migration/function version. Re-run deployment only when these backend files change.

## Administrator authorization

An Auth account becomes an administrator only when its matching `public.profiles` row has `is_admin = true`. Client-side metadata does not grant admin access. Make this change only through a trusted Supabase SQL/admin workflow.

## Verification

```bash
npm test
npm run build
npm run test:edge
npm run typecheck:edge
supabase start
supabase db reset
npm run test:db
```

Before launch, manually verify registration, approval, credential delivery, school login/dashboard access, rejection, admin authorization, Contact Us, CORS, and direct route refreshes using the final production hostname.
