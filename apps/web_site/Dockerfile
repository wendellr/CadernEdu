# Build context: raiz do monorepo
# docker build -f apps/web_site/Dockerfile .

FROM node:20-alpine AS base
RUN corepack enable

# ── 1. Dependências ───────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web_site/package.json        ./apps/web_site/
COPY packages/design_system_web/package.json ./packages/design_system_web/

# shamefully-hoist resolve symlinks do pnpm no Docker (sem virtual store)
RUN pnpm install --frozen-lockfile --shamefully-hoist \
    --filter @cadernedu/web_site...

# ── 2. Build ──────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules           ./node_modules
COPY --from=deps /app/apps/web_site/node_modules ./apps/web_site/node_modules

COPY packages/ ./packages/
COPY apps/web_site ./apps/web_site

# NEXT_PUBLIC_* são substituídas em build time — obrigatório passar como ARG
ARG NEXT_PUBLIC_API_URL=https://api.placeholder.com/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

WORKDIR /app/apps/web_site
RUN pnpm build

# ── 3. Runner ─────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# HOSTNAME=0.0.0.0 obrigatório para o servidor standalone escutar em todas as interfaces
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web_site/public           ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web_site/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web_site/.next/static     ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
