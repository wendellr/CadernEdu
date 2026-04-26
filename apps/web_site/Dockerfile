# Build context: raiz do monorepo (infra/../)
# docker build -f apps/web_site/Dockerfile .

FROM node:20-alpine AS base
RUN corepack enable

# ── 1. Instala dependências ────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

# Copia apenas os manifestos para cache de camada eficiente
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web_site/package.json ./apps/web_site/

# packages/* não tem package.json ainda — cria placeholder para o workspace
RUN mkdir -p packages/design_system_web && echo '{"name":"@cadernedu/design-system-web","version":"0.0.0"}' > packages/design_system_web/package.json

RUN pnpm install --filter @cadernedu/web_site...

# ── 2. Build ───────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web_site/node_modules ./apps/web_site/node_modules

# Copia o código — packages/ é necessário para a importação relativa dos tokens
COPY packages/ ./packages/
COPY apps/web_site ./apps/web_site

WORKDIR /app/apps/web_site
RUN pnpm build

# ── 3. Runner (imagem mínima de produção) ─────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# standalone output do Next.js contém tudo que precisa para rodar
COPY --from=builder /app/apps/web_site/public          ./public
COPY --from=builder --chown=nextjs:nodejs \
     /app/apps/web_site/.next/standalone             ./
COPY --from=builder --chown=nextjs:nodejs \
     /app/apps/web_site/.next/static               ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
