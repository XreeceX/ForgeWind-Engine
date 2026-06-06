# ── Single-stage image: keeps pnpm workspace node_modules intact ──
FROM node:20-alpine

ENV HUSKY=0
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/forgewind-api/package.json apps/forgewind-api/
COPY packages/ packages/

RUN pnpm install --frozen-lockfile

COPY apps/forgewind-api/ apps/forgewind-api/
COPY tsconfig.base.json ./

RUN pnpm --filter @forgewind-engine/config build \
  && pnpm --filter @forgewind-engine/utils build \
  && pnpm --filter @forgewind-engine/forgewind-api build

EXPOSE 3001

CMD ["node", "apps/forgewind-api/dist/main.js"]
