FROM node:20-alpine

ENV HUSKY=0
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api-gateway/package.json apps/api-gateway/
COPY packages/ packages/

RUN pnpm install --frozen-lockfile

COPY apps/api-gateway/ apps/api-gateway/
COPY tsconfig.base.json ./

RUN pnpm --filter @forgewind-engine/config build \
  && pnpm --filter @forgewind-engine/utils build \
  && pnpm --filter @forgewind-engine/api-gateway build

EXPOSE 4000

CMD ["node", "apps/api-gateway/dist/main.js"]
