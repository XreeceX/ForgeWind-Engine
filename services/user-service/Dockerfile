# ── Single-stage image: keeps pnpm workspace node_modules intact ──
FROM node:20-alpine

ENV HUSKY=0
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/user-service/package.json services/user-service/
COPY packages/ packages/

RUN pnpm install --frozen-lockfile

COPY services/user-service/ services/user-service/
COPY tsconfig.base.json ./

RUN pnpm --filter @forgewind-engine/user-service exec prisma generate \
  && pnpm --filter @forgewind-engine/user-service build

EXPOSE 4001

CMD ["node", "services/user-service/dist/main.js"]
