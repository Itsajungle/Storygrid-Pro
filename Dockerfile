# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy everything first
COPY . .

# Remove any existing node_modules and lock files
RUN rm -rf node_modules package-lock.json

# Install dependencies fresh
RUN npm install --legacy-peer-deps

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
