# --------- Build Stage ---------
FROM node:20-slim AS build

WORKDIR /app

# Install deps first (for better caching)
COPY package*.json ./
RUN npm ci

# Copy source and env
COPY . .

# Set environment variables for production build
ARG STAGING_ENV_FILE
RUN printf "%s\n" "$STAGING_ENV_FILE" > .env.production.local

# Build Quasar SSR
RUN npx quasar build -m ssr

# --------- Runtime Stage ---------
FROM node:20-slim AS runtime

WORKDIR /app

# Copy SSR dist from build stage
COPY --from=build /app/dist/ssr ./

# Install only production dependencies
RUN npm install

# Install PM2 globally
RUN npm install -g pm2

EXPOSE 3000

ENV UV_THREADPOOL_SIZE=1

ENTRYPOINT ["pm2-runtime", "index.js"]
