# Build context: raiz do monorepo
# docker build -f apps/web_painel/Dockerfile .

FROM node:20-alpine AS base
RUN corepack enable

# ── 1. Dependências ───────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web_painel/package.json        ./apps/web_painel/
COPY packages/design_system_web/package.json ./packages/design_system_web/

RUN pnpm install --frozen-lockfile --shamefully-hoist \
    --filter @cadernedu/web_painel...

# ── 2. Build ──────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules             ./node_modules
COPY --from=deps /app/apps/web_painel/node_modules ./apps/web_painel/node_modules

COPY packages/ ./packages/
COPY apps/web_painel ./apps/web_painel

ARG NEXT_PUBLIC_API_URL=https://api.placeholder.com/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

WORKDIR /app/apps/web_painel
RUN pnpm build

# ── 3. Runner ─────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web_painel/public            ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web_painel/.next/standalone  ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web_painel/.next/static      ./.next/static

USER nextjs
EXPOSE 3001
CMD ["node", "server.js"]
