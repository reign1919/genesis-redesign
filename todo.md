# Deployment TODO

Complete these tasks before opening school registration or testing production authentication.

## 1. Configure Vercel environment variables

In Vercel, open **Project Settings → Environment Variables** and add these variables for Production (and Preview if needed):

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_ENROLLMENT_ENABLED=true
```

Copy only these public `VITE_` values from the local `.env`. Do not add service-role, encryption, or database keys to Vercel.

Redeploy after adding or changing environment variables.

## 2. Update hosted Supabase configuration

Replace `YOUR-DOMAIN` with the final Vercel/custom domain:

```text
ALLOWED_ORIGINS=http://localhost:5173,https://YOUR-DOMAIN
PUBLIC_PORTAL_URL=https://YOUR-DOMAIN/login
```

Set these as hosted Supabase Edge Function secrets.

## 3. Vercel SPA routing

The root-level `vercel.json` sends application routes to `index.html` so direct visits and refreshes work for `/login`, `/dashboard`, and `/admin`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Commit, push, and redeploy after adding the rewrite.

## 4. Production verification

- Open `/login` directly and refresh it.
- Submit a new school registration.
- Confirm the registration appears in `/admin`.
- Approve it and confirm credentials are generated.
- Confirm the WhatsApp message contains the production `/login` URL.
- Sign in using the generated school code and password.
- Confirm `/dashboard` displays the same code and password.
- Verify rejection behavior.
- Verify the existing Contact Us form.
- Confirm `/login`, `/dashboard`, and `/admin` do not return Vercel 404 pages when refreshed.
