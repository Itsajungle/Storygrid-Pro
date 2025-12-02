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

# Install only express
RUN npm install express

# Copy built files and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.cjs ./

# Expose port
EXPOSE 8080

ENV PORT=8080

# Start with CommonJS server (no ES modules needed)
CMD ["node", "server.cjs"]
