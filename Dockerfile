# --------- Build Stage ---------
FROM node:20-slim AS build

WORKDIR /app

# Install deps first (for better caching)
COPY package*.json ./
RUN npm ci

# Copy source and env
COPY . .
# (You can pass envs at build-time instead of copying .env if secrets shouldn’t be baked in)

# Build Quasar SSR
RUN npx quasar build -m ssr

# --------- Runtime Stage ---------
FROM node:20-slim AS runtime

WORKDIR /app

# Copy SSR dist from build stage
COPY --from=build /app/dist/ssr ./

# Copy package.json & lock for production deps
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Install PM2 globally
RUN npm install -g pm2

EXPOSE 3000

ENTRYPOINT ["pm2-runtime", "index.js"]
