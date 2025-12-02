# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install only express (the only runtime dependency needed for server.js)
RUN npm install express

# Copy built files and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./

# Expose port
EXPOSE 8080

ENV PORT=8080

# Start with Express server
CMD ["node", "server.js"]
