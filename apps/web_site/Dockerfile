# Build context: raiz do monorepo
# docker build -f apps/web_site/Dockerfile .

FROM node:20-alpine AS base
RUN corepack enable

# ── 1. Dependências ───────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web_site/package.json             ./apps/web_site/
COPY packages/design_system_web/package.json ./packages/design_system_web/

RUN pnpm install --no-frozen-lockfile --shamefully-hoist \
    --filter @cadernedu/web_site...

# ── 2. Build ──────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json pnpm-workspace.yaml ./
COPY --from=deps /app/node_modules ./node_modules

COPY packages/ ./packages/
COPY apps/web_site ./apps/web_site

ARG NEXT_PUBLIC_API_URL=https://api.placeholder.com/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN pnpm --filter @cadernedu/web_site build

# ── 3. Runner ─────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# workspace root para next start funcionar
COPY package.json pnpm-workspace.yaml ./
COPY --from=deps /app/node_modules ./node_modules

COPY packages/ ./packages/
COPY --from=builder /app/apps/web_site/public       ./apps/web_site/public
COPY --from=builder /app/apps/web_site/.next        ./apps/web_site/.next
COPY --from=builder /app/apps/web_site/next.config.js ./apps/web_site/next.config.js
COPY --from=builder /app/apps/web_site/package.json   ./apps/web_site/package.json

WORKDIR /app/apps/web_site
EXPOSE 3000
CMD ["/app/node_modules/.bin/next", "start", "-p", "3000"]
