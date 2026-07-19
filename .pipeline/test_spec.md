# Test Specification

> **⚠️ Warning — `surface.json` is a pre-scaffold placeholder.** `.pipeline/surface.json`
> currently lists only `GET /api/health` (marked `_generated`, "overwritten by the scaffolder
> agent"). The full API surface below is derived from the approved spec and `.pipeline/tasks.md`
> (the `task_decomp` surface contract). Once the scaffolder rewrites `surface.json`, re-reconcile:
> every route it declares must have a case here.
>
> **⚠️ Open question carried from `tasks.md`.** The admin settings surface
> (`/admin/settings`, `GET`/`PATCH /api/admin/settings`, `SystemSetting`, `lib/config.ts`) comes
> from a `deployments` input, not the product spec, which states "No third-party integrations
> required." Admin cases are included and marked **[admin, pending confirmation]**. If the
> implementation drops the admin surface, skip those cases rather than failing them.

## Coverage summary
- Total cases: 58
- API endpoints covered: 10 / 10 (surface.json declares 1; remaining 9 derived from spec + tasks.md)
- User journeys covered: 9

## API tests

### `POST /api/auth/signup`
- **Happy path (first user → admin)**: `{ email: "admin@ex.com", password: "pw123456" }` on an empty
  users table → `2xx`; response sets an httpOnly, `SameSite=Lax` session cookie (`SESSION_COOKIE`);
  a `User` row is created with `role=ADMIN` (spec `isAdmin=true` semantics) and a bcrypt
  `passwordHash` (never the plaintext). Response body does not leak `passwordHash`.
- **Happy path (subsequent user → non-admin)**: signup a second distinct email on a non-empty table
  → `2xx`, session cookie set, new `User` created with `role=USER`.
- **Validation failures**:
  - Missing/empty `email` → `4xx` (400), no user created, no cookie.
  - Missing/empty `password` → `4xx` (400), no user created, no cookie.
  - Malformed email (`"not-an-email"`) → `4xx` (400).
  - Duplicate email (email already registered) → `4xx` (409/400), no second user created, no cookie.
- **Auth failures**: n/a (public route).
- **Idempotency / edge cases**: same email submitted twice concurrently must not create two users
  (`email @unique` enforced); second attempt fails cleanly.

### `POST /api/auth/login`
- **Happy path**: valid `{ email, password }` for an existing user → `2xx`; sets session cookie for
  that user; body does not include `passwordHash`.
- **Validation failures**:
  - Missing `email` or `password` → `400`, no cookie set.
- **Auth failures**:
  - Correct email, wrong password → `401`, error message in body, **no session cookie set**.
  - Unknown email → `401` (same shape as wrong password — must not reveal whether the email exists),
    no cookie set.
- **Idempotency / edge cases**: logging in when already authenticated succeeds and refreshes the
  cookie (does not error).

### `POST /api/auth/logout`
- **Happy path**: authenticated request → `2xx`; response clears the session cookie (expired /
  empty `Set-Cookie`). A subsequent guarded request behaves as unauthenticated.
- **Validation failures**: n/a.
- **Auth failures**: logout while unauthenticated → still succeeds/no-ops (`2xx`), never `500`.
- **Idempotency / edge cases**: calling logout twice is safe and idempotent.

### `GET /api/notes`
- **Happy path**: authenticated user with notes → `200`, JSON array of that user's notes ordered by
  `createdAt` **descending (newest first)**; each item exposes `id`, `title`, `body`/snippet,
  `createdAt`; none belong to another user.
- **Happy path (empty)**: authenticated user with no notes → `200` and empty array `[]`.
- **Validation failures**: n/a (no request body).
- **Auth failures**: unauthenticated request → redirect to `/login` (middleware) or `401`; no note
  data returned.
- **Idempotency / edge cases**: user A's response never contains user B's notes (query scoped by
  `userId`).

### `POST /api/notes`
- **Happy path**: authenticated `{ title: "T", body: "B" }` → `2xx`; a `Note` row is persisted with
  `userId` = current user and `createdAt` = now; response returns the created note (with `id`). The
  note is the newest for that user.
- **Validation failures**:
  - Missing/empty `title` → `400`, no note persisted.
  - Missing/empty `body` → `400`, no note persisted (confirm requiredness against form; if body
    optional, adjust — spec form is title+body).
- **Auth failures**: unauthenticated → redirect to `/login` or `401`; no note persisted; note is
  **not** attributable to any arbitrary user.
- **Idempotency / edge cases**: `userId` is taken from the session, never from the request body
  (client cannot forge ownership by sending a `userId`).

### `GET /api/notes/[id]`
- **Happy path**: authenticated owner requests own note id → `200` with full `title` + `body`.
- **Validation failures**: non-existent id → `404`.
- **Auth failures**:
  - Unauthenticated → redirect to `/login` or `401`.
  - Authenticated user requests a note owned by a **different** user → `404` (not `403`, to avoid
    leaking existence — cross-user isolation).
- **Idempotency / edge cases**: malformed/garbage id → `404` (not `500`).

### `GET /api/health`
- **Happy path**: `GET` (no auth) → `200`, body `{ "status": "ok" }`.
- **Validation failures**: n/a.
- **Auth failures**: publicly accessible even when unauthenticated (exempt in middleware).
- **Idempotency / edge cases**: stable/repeatable; does not touch the DB.

### `GET /api/health/deep`
- **Happy path**: DB reachable → `200` (executes Prisma `$queryRaw` successfully).
- **Validation failures**: n/a.
- **Auth failures**: publicly accessible (exempt in middleware).
- **Idempotency / edge cases**: when DB is unreachable → non-200 (503/500) with a failure indicator
  (verified structurally; may be skipped if DB cannot be taken down in the test env).

### `GET /api/admin/settings` **[admin, pending confirmation]**
- **Happy path**: authenticated **admin** → `200`; lists service/integration keys (e.g. postgresql,
  minio) with **masked** values and a configured/unconfigured status per key. Raw secret values are
  never returned in cleartext.
- **Validation failures**: n/a.
- **Auth failures**:
  - Unauthenticated → redirect to `/login` or `401`.
  - Authenticated non-admin (`role=USER`) → `403` (or `404`), no settings data returned.
- **Idempotency / edge cases**: masking is applied consistently on every read.

### `PATCH /api/admin/settings` **[admin, pending confirmation]**
- **Happy path**: authenticated admin sends key-value pairs → `2xx`; upserts `SystemSetting` rows;
  a subsequent `GET` reflects the new configured status (still masked).
- **Validation failures**: malformed body / unknown non-whitelisted key → `400`.
- **Auth failures**: non-admin `PATCH` → `403`/`404`, no rows written.
- **Idempotency / edge cases**: PATCHing the same key twice updates in place (upsert), never
  duplicates (`key @id`).

## UI / journey tests

### Journey: Signup (first user becomes admin)
- **Steps**: navigate to `/signup` → type email + password → submit.
- **Expected outcomes**: session cookie set; browser redirected to `/notes`; user is admin
  (admin nav section visible if implemented).
- **Negative path**: submitting an already-registered email shows a visible inline error and stays
  on `/signup`; no redirect.

### Journey: Login
- **Steps**: navigate to `/login` → type valid email + password → submit.
- **Expected outcomes**: session cookie set; redirected to `/notes`.
- **Negative path**: wrong password → visible error message rendered on the form, remains on
  `/login`, **no session cookie**, not redirected.

### Journey: Route guard / redirect when logged out
- **Steps**: with no session cookie, navigate directly to `/notes`, then to `/notes/<some-id>`,
  then to `/notes/new`.
- **Expected outcomes**: each guarded route redirects to `/login`.
- **Negative path**: public routes `/login`, `/signup`, `/api/health`, `/api/health/deep` and static
  assets remain reachable without a session (no redirect loop).

### Journey: Notes list (newest first)
- **Steps**: log in as a user seeded with ≥2 notes created at different times → land on `/notes`.
- **Expected outcomes**: list renders each note's title plus a body snippet (~first 140 chars),
  ordered newest-first; a link/button to `/notes/new` is present.
- **Negative path**: user with zero notes sees an empty-state (no error, no other users' notes).

### Journey: Create note
- **Steps**: from `/notes` click "new" → `/notes/new` → type title + body → submit.
- **Expected outcomes**: redirected to `/notes`; the newly created note appears **at the top** of the
  list.
- **Negative path**: submitting with an empty title (and/or body) shows a validation error and does
  not navigate away / does not persist.

### Journey: Note detail + cross-user isolation
- **Steps**: from `/notes` click a note → `/notes/[id]`.
- **Expected outcomes**: full title and full body rendered.
- **Negative path**: navigating to another user's note id (or a non-existent id) renders the 404 UI
  (note not found / not owned).

### Journey: Logout
- **Steps**: while authenticated, click the logout button (calls `POST /api/auth/logout`).
- **Expected outcomes**: session cookie cleared; subsequently navigating to `/notes` redirects to
  `/login`.
- **Negative path**: n/a (idempotent).

### Journey: Admin settings **[admin, pending confirmation]**
- **Steps**: log in as admin → navigate to `/admin/settings` → view service list → enter a
  credential for a service → save (PATCH).
- **Expected outcomes**: each service shows a configured/unconfigured badge; a banner lists anything
  needing credentials; after save the service flips to "configured" with a masked value.
- **Negative path**: a non-admin user navigating to `/admin/settings` is blocked (redirect/403/404)
  and never sees credential fields.

### Journey: Full end-to-end walkthrough
- **Steps**: signup → create a note → view it in the list → open its detail → logout.
- **Expected outcomes**: every step succeeds in sequence; after logout, `/notes` redirects to
  `/login`. Confirms the primary user path works as an integrated whole.
- **Negative path**: n/a (composite happy path).

## Data integrity tests
- After signup: exactly one new `User` row; `passwordHash` is a bcrypt hash, never plaintext; `email`
  is unique (`@unique` rejects duplicates).
- First-ever user has `role=ADMIN`; every subsequent user has `role=USER`.
- After note creation: exactly one new `Note` row with `userId` = the authenticated creator and a
  populated `createdAt`.
- Every `Note` read/list path is filtered by `userId`; no query returns notes across users
  (guards against cross-user data leakage).
- `Note.userId` is a valid foreign key referencing an existing `User`.
- After logout: session cookie is invalidated such that `verifySession` no longer authenticates it.
- **[admin, pending confirmation]** `SystemSetting.key` is a primary key; PATCH upserts (no
  duplicate keys); stored values are returned masked on read.

## Out of scope
- Signup email verification / confirmation emails — spec is silent; no mail integration exists.
- Password reset / "forgot password" flow — not in the spec.
- Note editing and deletion (`PUT`/`PATCH`/`DELETE /api/notes/[id]`) — spec only defines create,
  list, and read; no update/delete surface.
- Pagination / search / filtering of the notes list — spec defines a simple newest-first list only.
- JWT expiry/refresh timing and clock-skew behavior — spec does not specify a TTL; only presence and
  clearing of the cookie are tested.
- MinIO / object storage and switching the Prisma provider to PostgreSQL — flagged as an unresolved
  open question in `tasks.md`; SQLite is the spec's assumption.
- Rate limiting, CSRF tokens, and brute-force lockout — not specified.
- Container/volume persistence across restarts and `Dockerfile` build correctness — deployment
  concern, not a functional test case (noted as a risk in the spec).
- Visual/styling/responsive-layout assertions beyond element presence — Tailwind styling is
  cosmetic and unspecified.

Wrote .pipeline/test_spec.md (58 cases across 10 endpoints / 9 journeys).
