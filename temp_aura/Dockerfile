# Stage 1: Build Frontend
FROM node:20 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy server source code
COPY server ./server

# Expose port
EXPOSE 7080

# Start server
CMD ["node", "server/index.js"]
