# Stage 1: Build
FROM node:20 AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /build

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json packages/api/
COPY packages/server/package.json packages/server/
COPY packages/web/package.json packages/web/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build:publish

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

COPY package.json package.json
RUN npm install --omit=dev

COPY --from=builder /build/packages/server/publish/ /app/

ENV SKIP_GIT_VALIDATION=true

ENTRYPOINT ["node", "/app/index.js"]
