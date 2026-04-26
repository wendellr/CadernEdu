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

# --no-frozen-lockfile: evita falha se lockfile estiver fora de sync com o workspace
# --shamefully-hoist: coloca tudo em node_modules/ raiz, sem symlinks do pnpm store
RUN pnpm install --no-frozen-lockfile --shamefully-hoist \
    --filter @cadernedu/web_site...

# ── 2. Build ──────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Com shamefully-hoist tudo fica em node_modules raiz — copiar apenas esse dir
COPY --from=deps /app/node_modules ./node_modules

COPY packages/ ./packages/
COPY apps/web_site ./apps/web_site

ARG NEXT_PUBLIC_API_URL=https://api.placeholder.com/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

WORKDIR /app/apps/web_site
RUN pnpm build

# Garante que o standalone foi gerado — falha o build se não existir
RUN test -f .next/standalone/server.js \
    || (echo "ERRO: .next/standalone/server.js não gerado — verifique next.config.js" && exit 1)

# ── 3. Runner ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web_site/public           ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web_site/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web_site/.next/static     ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
