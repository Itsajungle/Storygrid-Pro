# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps --force

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy everything from builder
COPY --from=builder /app ./

# Expose port
EXPOSE 8080

ENV PORT=8080

# Start with vite preview
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080"]
