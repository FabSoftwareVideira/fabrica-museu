FROM node:22-bookworm-slim AS base

WORKDIR /app

COPY --chown=node:node package*.json ./

FROM base AS dev

ENV NODE_ENV=development

RUN npm ci
COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["npm", "run", "dev"]

FROM base AS prod

ENV NODE_ENV=production

RUN npm ci --omit=dev
COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["npm", "start"]
