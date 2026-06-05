# ── Stage 1: Build ────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/forgewind-api/package.json apps/forgewind-api/
COPY packages/ packages/

RUN pnpm install --frozen-lockfile

COPY apps/forgewind-api/ apps/forgewind-api/
COPY tsconfig.base.json ./

RUN pnpm --filter @forgewind-engine/config build
RUN pnpm --filter @forgewind-engine/utils build
RUN pnpm --filter @forgewind-engine/forgewind-api build

# ── Stage 2: Production ──────────────────────────────────────
FROM node:20-alpine AS production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/apps/forgewind-api/dist ./dist
COPY --from=builder /app/apps/forgewind-api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

USER appuser

EXPOSE 3001

CMD ["node", "dist/main.js"]
