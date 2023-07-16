FROM node:18-slim as build

WORKDIR /app
COPY ./package.json ./pnpm-lock.yaml ./tsconfig.json ./src/prisma/schema.prisma ./
RUN corepack enable
RUN corepack prepare pnpm@latest --activate
RUN pnpm i
COPY ./src ./src
RUN pnpm build
RUN pnpm prune --prod

FROM node:18-slim as run
WORKDIR /app
COPY --from=build /app ./

RUN chown -R node:node ./
USER node
EXPOSE 8000

CMD ["npm", "start"]
