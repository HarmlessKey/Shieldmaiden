# --------- Build Stage ---------
FROM node:24-slim AS build

WORKDIR /app

# Install deps first (for better caching)
COPY package*.json ./
RUN npm ci

# Copy source and env
COPY . .

# Build Quasar SSR
RUN npx quasar build -m ssr

# --------- Runtime Stage ---------
FROM node:24-slim AS runtime

WORKDIR /app

# Copy SSR dist from build stage
COPY --from=build /app/dist/ssr ./

# Install only production dependencies
RUN npm install --ignore-scripts

# Install PM2 globally
RUN npm install -g pm2

# Create non-root user and set ownership
RUN groupadd -r nodeuser && useradd -r -g nodeuser nodeuser \
    && chown -R nodeuser:nodeuser /app

# Switch to non-root user
USER nodeuser

EXPOSE 3000

ENV UV_THREADPOOL_SIZE=1

ENTRYPOINT ["pm2-runtime", "index.js"]
