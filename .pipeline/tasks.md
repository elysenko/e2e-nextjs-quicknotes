# Pipeline Task Decomposition

## Summary
QuickNotes is a full-stack Next.js 14 (App Router, TypeScript) note-taking app with cookie-based JWT authentication (`jose`), Prisma persistence, and Tailwind styling. Authenticated users can sign up, log in, create notes, view their notes list (newest-first with body snippets), and open individual note detail pages — all scoped strictly to the owning user. The app uses the `full_auth` model with public signup where the first registered user becomes admin, exposes health endpoints, and ships as a containerized standalone build.

## Surface contract

### Routes — Pages
- `/` — root; redirects to `/notes` (authed) or `/login`
- `/login` — email/password login form
- `/signup` — email/password signup form
- `/notes` — current user's notes list (title + body snippet, newest first); link to `/notes/new`
- `/notes/new` — create-note form (title, body)
- `/notes/[id]` — single note detail (full title + body); 404 if not found/not owned
- `/admin/settings` — admin settings page (service + integration credentials)

### Routes — API
- `POST /api/auth/signup` — create user (first user → admin), set session cookie
- `POST /api/auth/login` — verify credentials, set session cookie; 401 on bad password
- `POST /api/auth/logout` — clear session cookie
- `GET /api/notes` — list current user's notes, `orderBy createdAt desc`
- `POST /api/notes` — create note for current user
- `GET /api/notes/[id]` — fetch single note scoped to current user; 404 if not owner
- `GET /api/health` — `{status:"ok"}`
- `GET /api/health/deep` — DB connectivity check via Prisma `$queryRaw`
- `GET /api/admin/settings` — list service/integration keys with masked values + configured status (admin only)
- `PATCH /api/admin/settings` — upsert key-value settings pairs (admin only)

### Entities
- `User { id, email @unique, passwordHash, role UserRole @default(USER), createdAt }`
- `Note { id, title, body, userId → User, createdAt }`
- `SystemSetting { key @id, value, updatedAt }`

## db_agent tasks
- [ ] Create `prisma/schema.prisma` with SQLite provider and datasource/generator blocks (per spec assumption `DATABASE_URL=file:./dev.db`).
- [ ] Add `enum UserRole { ADMIN USER }` to the schema.
- [ ] Define `User` model: `id`, `email @unique`, `passwordHash`, `role UserRole @default(USER)`, `createdAt DateTime @default(now())`. (Retain spec `isAdmin` semantics via the `role` field — see Open questions.)
- [ ] Define `Note` model: `id`, `title`, `body`, `userId` relation to `User`, `createdAt DateTime @default(now())`; add index/relation scoping on `userId`.
- [ ] Add `SystemSetting` model: `key String @id`, `value String`, `updatedAt DateTime @updatedAt` (required for admin settings — deployments present).
- [ ] Create `lib/db.ts` — singleton Prisma client.
- [ ] Create initial Prisma migration and `prisma/seed.ts` (optional dev seed creating an admin user + sample notes).

## backend_agent tasks
- [ ] Create `lib/password.ts` — `hashPassword` / `verifyPassword` using `bcryptjs`.
- [ ] Create `lib/auth.ts` — `createSession(userId)` (sign JWT with `jose`), `verifySession(token)`, `getCurrentUser()` (reads cookie in server components), `SESSION_COOKIE` constant; httpOnly, SameSite=Lax cookie.
- [ ] Create `middleware.ts` — verify session cookie; redirect unauthenticated requests to `/login`; exempt public routes (`/login`, `/signup`, `/api/health`, `/api/health/deep`, static assets); use `jose` (edge-compatible) only.
- [ ] Add admin guard: protect the `(admin)` route group / `/api/admin/*` via role check (`role === ADMIN`).
- [ ] Create `app/api/auth/signup/route.ts` — POST; create user (first user gets `ADMIN`, subsequent `USER`), set session cookie.
- [ ] Create `app/api/auth/login/route.ts` — POST; verify credentials, set session cookie; return 401 + error on bad password (no cookie set).
- [ ] Create `app/api/auth/logout/route.ts` — POST; clear session cookie.
- [ ] Create `app/api/notes/route.ts` — GET (current user's notes, `orderBy createdAt desc`), POST (create note for current user); scope all queries by `userId`.
- [ ] Create `app/api/notes/[id]/route.ts` — GET single note scoped to current user; 404 if not found/not owner.
- [ ] Create `app/api/health/route.ts` — returns `{status:"ok"}`.
- [ ] Create `app/api/health/deep/route.ts` — DB connectivity check via Prisma `$queryRaw`.
- [ ] Create `lib/config.ts` — `resolveConfig(key)`: reads `process.env[key]` first; if value equals `PLACEHOLDER_CONFIGURE_IN_SETTINGS` or absent, reads from `SystemSetting` DB row; returns null if neither is set.
- [ ] Create `app/api/admin/settings/route.ts` — `GET` lists service keys (postgresql, minio) with masked values + configured status; `PATCH` upserts key-value pairs; admin role required.

## ui_agent tasks
- [ ] Create `app/layout.tsx` (root html/body + global styles), `app/globals.css`, and Tailwind wiring for a minimal clean UI.
- [ ] Create `app/page.tsx` — redirects to `/notes` (authed) or `/login`.
- [ ] Create `app/login/page.tsx` + `app/login/login-form.tsx` (client) — email/password form with visible error display; part of main app (full_auth).
- [ ] Create `app/signup/page.tsx` + `app/signup/signup-form.tsx` (client) — email/password form with error display.
- [ ] Create `app/notes/page.tsx` (server component) — render current user's notes list (title + ~140-char body snippet), newest first; empty/loading/error states; link to `/notes/new`.
- [ ] Create `app/notes/new/page.tsx` + `app/notes/new/note-form.tsx` (client) — title/body form; redirect to `/notes` on success.
- [ ] Create `app/notes/[id]/page.tsx` (server component) — full title + body; 404 UI if not found/owned.
- [ ] Create a logout button component that calls `POST /api/auth/logout`; show admin nav section only to admins.
- [ ] Create `app/admin/settings/page.tsx` — lists each service in deployments (postgresql, minio) with a configured/unconfigured badge and per-service credential form. Show a prominent banner listing anything needing credentials to activate. (No placeholder services/integrations flagged in inputs — see Open questions.)

## service_agent tasks
- [ ] Create a typed API client data layer for auth flows (`signup`, `login`, `logout`) wiring the login/signup/logout UI to `/api/auth/*`.
- [ ] Create client-side data functions for notes: list (`GET /api/notes`), create (`POST /api/notes`), and fetch-single (`GET /api/notes/[id]`), wiring the notes UI to the backend.
- [ ] Wire the `/admin/settings` forms to `GET`/`PATCH /api/admin/settings`, handling masked values and per-service upserts.
- [ ] Ensure client error/redirect handling: 401 surfaces form errors, successful auth redirects to `/notes`, new note appears at top of `/notes` after save.

## tester tasks
- [ ] Auth happy path: signup → session cookie set → redirect to `/notes`; login with correct creds succeeds.
- [ ] Auth negative: login with wrong password returns 401 + visible error, no cookie set.
- [ ] Guard: requesting `/notes` or `/notes/[id]` while logged out redirects to `/login`; public routes and health endpoints remain accessible.
- [ ] List: seeded user sees titles + snippets ordered newest-first.
- [ ] Create: submitting title+body persists note and it appears at top of `/notes`.
- [ ] Detail: selecting a note opens `/notes/[id]` with full title/body; another user's note returns 404 (cross-user isolation).
- [ ] Health: `GET /api/health` → 200; `GET /api/health/deep` → 200 when DB reachable.
- [ ] Admin: non-admin blocked from `/admin/settings` and `/api/admin/settings`; admin can read (masked) + PATCH settings.
- [ ] Full e2e walkthrough: signup → create → list → detail → logout.

## Open questions
- **Deployment mismatch:** `<spec_deployments>` declares `postgresql` and `minio`, but the spec assumes Prisma + SQLite (`DATABASE_URL=file:./dev.db`) and states "No third-party integrations required." The admin settings model (`SystemSetting`, `lib/config.ts`, `/admin/settings`) has been included per the deployments input. db_agent/backend_agent must confirm whether to (a) keep SQLite and treat postgresql/minio as configurable-but-unused services, or (b) switch the Prisma provider to PostgreSQL and wire MinIO for object storage. No spec scenario references MinIO/object storage.
- **Role vs isAdmin:** Spec's `User` model uses `isAdmin Boolean`; auth model rules require `role UserRole @default(USER)`. Tasks standardize on `role`. Confirm no code path still expects an `isAdmin` boolean field.
- **Auth roles:** `<auth_roles>` = admin, user only — no additional spec-defined roles to add to the enum.
- No `<placeholder_services>`, `<placeholder_integrations>`, or `<spec_integrations>` were provided, so no placeholder-activation banner content or integration client modules were generated. Confirm postgresql/minio need real credential fields on the settings page.
