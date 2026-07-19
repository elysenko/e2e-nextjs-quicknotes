# Architecture

## Stack requested
- `nextjs-fullstack` (Next.js 15 App Router + TypeScript, Prisma/PostgreSQL, single-image fullstack)

## Scaffolding status
- Newly scaffolded from `template-nextjs-fullstack` — project directory was empty (only `.git`, `.github`, `README.md` existed).

## Layout
- Project root **is** the Next.js app root (no subdirectory nesting) — pages, API routes, Prisma schema, and Dockerfile all live at `{project_dir}/`.
- `app/` — App Router pages and API routes (`app/api/health/route.ts` is the only route currently scaffolded).
- `lib/auth.ts` — minimal JWT sign/verify helpers (`jsonwebtoken`), to be extended for the app's real session/cookie handling.
- `prisma/schema.prisma` — `User` model (PostgreSQL provider) as a starting point; `Note` model and any other domain models still need to be added.
- `prisma/seed.ts` — seed script; prints `SEED_CRED`/`SEED_CREDS_JSON` lines consumed by the deploy pipeline — keep this contract when extending.
- `.pipeline/surface.json` — manifest of routes/components/testIds; keep in sync as routes and components are added (test-generation agents read this).
- `.colossus-acceptance.json` — post-deploy render-gate contract; `reject_signatures` currently target the untouched stub home page — update `expect_text` once the real front page is built.
- `Dockerfile` — multi-stage build producing a Next.js `standalone` output; single image, no separate backend service (API routes serve the backend role).

## Next steps for the developer/coder agent
1. Copy `.env.example` to `.env` and fill in `DATABASE_URL` (PostgreSQL) and `JWT_SECRET` for local dev.
2. Extend `prisma/schema.prisma` with the app's real models (e.g. `Note`), then run `npx prisma migrate dev` locally to create a migration.
3. Build out the real pages/routes per the technical plan, updating `.pipeline/surface.json` and `.colossus-acceptance.json.expect_text` to match the real UI.
4. `npm install` then `npm run dev` to iterate locally.

## Template source
- `template-nextjs-fullstack` from the scaffold-templates library.
