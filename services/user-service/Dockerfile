# ── Stage 1: Build ────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/user-service/package.json services/user-service/
COPY packages/ packages/

RUN pnpm install --frozen-lockfile

COPY services/user-service/ services/user-service/
COPY tsconfig.base.json ./

RUN pnpm --filter user-service exec prisma generate
RUN pnpm --filter user-service build

# ── Stage 2: Production ──────────────────────────────────────
FROM node:20-alpine AS production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/services/user-service/dist ./dist
COPY --from=builder /app/services/user-service/package.json ./
COPY --from=builder /app/services/user-service/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

USER appuser

EXPOSE 4001

CMD ["node", "dist/main.js"]
