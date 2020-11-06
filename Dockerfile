FROM node:14.10.1-alpine3.12 AS node
ENV NODE_OPTIONS --unhandled-rejections=strict --enable-source-maps
WORKDIR /app

COPY .npmrc \
  package.json \
  package-lock.json \
  ./



#
# Stage: npm-dependencies and source
#
FROM node as base
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm ci --production
RUN mv node_modules prod_node_modules

RUN npm ci

COPY .eslintignore \
  .eslintrc.js \
  .stylelintignore \
  .stylelintrc \
  jest.config.js \
  tsconfig.json \
  tsconfig.dev.json \
  ./
COPY test/ test/
COPY src/ src/
COPY static/ static/
COPY scripts/ scripts/
COPY data/ data/


#
# Stage: Development environment
#
FROM base AS dev
ENV NODE_ENV=development
ENV PRETTY_LOG=true

CMD ["npm", "run", "start:dev"]


#
# Stage: Production build
#
FROM base AS build-prod
ENV NODE_ENV=production

RUN npm run build


#
# Stage: Production environment
#
FROM node AS prod
ENV NODE_ENV=production

COPY --from=base /app/prod_node_modules ./node_modules
COPY --from=build-prod /app/build/ build/
COPY --from=build-prod /app/static/ static/
COPY data/ data/

HEALTHCHECK --interval=5s --timeout=1s \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ping || exit 1

CMD ["npm", "run", "start"]
