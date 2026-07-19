# syntax=docker/dockerfile:1
# Real (non-placeholder) Dockerfile: builds the actual Next.js app. Standalone
# output keeps the runtime image small and self-contained (single next server —
# API routes serve the backend role; no separate backend image).
#
# NEXT_PUBLIC_BASE_PATH is baked in at build time so the compiled asset URLs
# include /e2e-nextjs-quicknotes prefix. This matches the prefix-passthrough
# ingress (no rewrite) used in step 7 of the deploy.
FROM node:22-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_BASE_PATH=/e2e-nextjs-quicknotes
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
# Placeholder DATABASE_URL for prisma generate — real one is injected at runtime
ENV DATABASE_URL=postgresql://x:x@localhost:5432/x
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --no-fund
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 3000
CMD ["node", "server.js"]
