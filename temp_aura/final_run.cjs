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

const conn = new Client();

console.log('Connecting...');

conn.on('ready', () => {
    console.log('Ready');

    // 1. Force Dockerfile
    const forceDoc = `cat <<'EOF' > ${remoteDir}/Dockerfile\n${dockerFileContent}\nEOF`;

    conn.exec(forceDoc, (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
            console.log('Dockerfile forced.');

            // 2. Start Build
            console.log('Starting Docker Build...');
            const buildCmd = `cd ${remoteDir} && docker compose up -d --build`;

            const buildStream = conn.exec(buildCmd, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code) => {
                    console.log('Build finished with code: ' + code);
                    conn.end();
                }).on('data', (data) => process.stdout.write(data))
                    .stderr.on('data', (data) => process.stderr.write(data));
            });
        });
    });
}).connect(config);
