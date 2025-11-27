# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package.json ./

# Install dependencies fresh
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# List files to debug
RUN ls -la && ls -la src/ || echo "No src directory"

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files for production dependencies
COPY package.json ./
RUN npm install --legacy-peer-deps --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Expose port
EXPOSE 8080

ENV PORT=8080

# Start with node server
CMD ["node", "server.js"]
