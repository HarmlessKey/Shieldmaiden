# --------- Build Stage ---------
FROM node:20-slim AS build

WORKDIR /app

# Install deps first (for better caching)
COPY package*.json ./
RUN npm install

# Copy source and env
COPY . .
# (You can pass envs at build-time instead of copying .env if secrets shouldn’t be baked in)

ARG STAGING_ENV_FILE
RUN echo "$STAGING_ENV_FILE" > .env.production.local
# Build Quasar SSR
RUN npx quasar build -m ssr

# --------- Runtime Stage ---------
FROM node:20-slim AS runtime

WORKDIR /app

# Copy SSR dist from build stage
COPY --from=build /app/dist/ssr ./
COPY --from=build /app/.env.production.local .

# Install only production dependencies
RUN npm install

# Install PM2 globally
RUN npm install -g pm2

EXPOSE 3000

ENV UV_THREADPOOL_SIZE=1

ENTRYPOINT ["pm2-runtime", "index.js"]
