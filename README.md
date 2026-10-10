# JIT COFFIE

A premium coffee-inspired productivity workspace built with Next.js, TypeScript, PostgreSQL, Prisma, and Auth.js. The provided café artwork is used in the experience. The cartoon mascot mentioned in the brief was not included among the visible source images, so the visual system leaves room to add it later.

## What is included

- Responsive landing page with editorial coffee imagery, motion, and reduced-motion support.
- Signup validation for Indian mobile numbers, PIN codes, states/union territories, consent, duplicate email/mobile prevention, and Argon2id password hashing.
- Auth.js credentials and Google providers, verified-email sign-in, secure reset links, rate limiting, and session invalidation after password reset.
- Per-account PostgreSQL persistence for tasks, notes, focus sessions, profile data, and administrative audit events.
- Profile settings, JSON account export, account deletion, role-checked admin dashboard, and masked member details.
- Terms and privacy pages, Prisma schema and migrations, environment template, and validation tests.

## Local setup

1. Install Node.js 20 or newer and PostgreSQL 15 or newer.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, a random `AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL`.
3. Configure a working SMTP account (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `MAIL_FROM`). Signup requires email verification, and the API intentionally refuses to create accounts if mail is not configured.
4. To enable Google login, create OAuth credentials with `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI and fill `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
5. Run:

   ```powershell
   npm install
   npm run db:generate
   npm run db:deploy
   npm run dev
   ```

6. Open `http://localhost:3000`.

For the first administrator, temporarily set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, run `npm run db:seed`, then remove those variables. The seed prints only the administrator email and never the password.

## Database changes

Prisma schema is in `prisma/schema.prisma`; migrations are in `prisma/migrations`. For future schema edits, run `npm run db:migrate` in development and commit the generated migration. Deploy with `npm run db:deploy`.

## Production deployment

Deploy the Next.js app to a Node hosting service with HTTPS and connect it to managed PostgreSQL. Provide all required environment variables through the host’s secret manager, use a production SMTP provider with verified sender identity, and register the production Google OAuth callback URL. Set `AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the HTTPS origin. Run `npm run db:deploy` as a release step before serving traffic. Back up the database, restrict network access to the database, and rotate secrets through the hosting provider. The application never returns password hashes or raw verification/reset tokens from API responses.

## Security and current scope

The overview admin API is role-gated and returns masked email/mobile values; every view is written to the audit log. Tasks, notes, and focus history are filtered by the authenticated user ID in server queries. Signup, login, and reset requests use database-backed IP rate-limit records and same-origin checks on state-changing requests. Auth.js applies CSRF protections to its own endpoints.

Google OAuth accounts are created with their provider email and name; users complete a required profile and terms-consent onboarding step before entering the workspace. Existing mobile-number changes are rejected until a verification workflow is configured. Profile-photo upload and detailed growth charts are not currently implemented. End-to-end account, email, isolation, and production deployment checks still require configured infrastructure.

The brief’s requested 10-second 4K/60fps 3D liquid animation is not a raster website asset. The site currently uses the supplied still chai-pour artwork, steam accents, and CSS motion. A rendered video/3D animation needs to be produced separately and added as an optimized video asset to replace the still image.

## Checks

```powershell
npm test
npm run lint
npm run build
```

Signup, sign-in, email delivery, account isolation, and persistence require a running PostgreSQL database and a working SMTP configuration to test end-to-end.
