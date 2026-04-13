# ── Stage 1: Build ────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api-gateway/package.json apps/api-gateway/
COPY packages/ packages/

RUN pnpm install --frozen-lockfile

COPY apps/api-gateway/ apps/api-gateway/
COPY tsconfig.base.json ./

RUN pnpm --filter api-gateway build

# ── Stage 2: Production ──────────────────────────────────────
FROM node:20-alpine AS production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/apps/api-gateway/package.json ./
COPY --from=builder /app/node_modules ./node_modules

USER appuser

EXPOSE 4000

CMD ["node", "dist/main.js"]
