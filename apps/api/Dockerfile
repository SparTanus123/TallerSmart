FROM node:20-alpine
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @tallersmart/api db:generate && pnpm --filter @tallersmart/api build
EXPOSE 3001
CMD ["pnpm", "--filter", "@tallersmart/api", "start"]
