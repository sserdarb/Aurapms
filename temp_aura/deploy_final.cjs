const { Client } = require('ssh2');

const config = {
    host: '76.13.0.113',
    port: 22,
    username: 'root',
    password: "tvONwId?Z.nm'c/M-k7N"
};

const remoteDir = '/opt/pms-innovmar';

const dockerFileContent = `# Stage 1: Build Frontend
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
`;

const composeContent = `version: '3.8'
services:
  app:
    build: .
    container_name: aura_app
    ports:
      - "7081:7080"
    environment:
      - PORT=7080
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/aura_hotel_db
    depends_on:
      - mongodb
    restart: always
    networks:
      - aura_network
  mongodb:
    image: mongo:latest
    container_name: aura_mongodb
    volumes:
      - mongodb_data:/data/db
    networks:
      - aura_network
    restart: always
networks:
  aura_network:
volumes:
  mongodb_data:
`;

const conn = new Client();

console.log('Connecting...');

conn.on('ready', () => {
    console.log('Ready');

    const cmd = `
mkdir -p ${remoteDir} && 
cd ${remoteDir} && 
printf '%s' "${dockerFileContent.replace(/"/g, '\\"').replace(/\$/g, '\\$')}" > Dockerfile && 
printf '%s' "${composeContent.replace(/"/g, '\\"').replace(/\$/g, '\\$')}" > docker-compose.yml && 
docker compose down || true && 
docker compose up -d --build
`;

    console.log('Executing deployment command block...');
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code) => {
            console.log('Exit code: ' + code);
            conn.end();
        }).on('data', (data) => process.stdout.write(data))
            .stderr.on('data', (data) => process.stderr.write(data));
    });
}).connect(config);
