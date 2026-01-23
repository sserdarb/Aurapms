const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
    host: '76.13.0.113',
    port: 22,
    username: 'root',
    password: "tvONwId?Z.nm'c/M-k7N"
};

const localZipPath = path.join(__dirname, '../aura-deploy-v6.zip');
const localDockerPath = path.join(__dirname, 'Dockerfile');
const localComposePath = path.join(__dirname, 'docker-compose.yml');

const remoteDir = '/opt/pms-innovmar';
const remoteZipPath = '/root/aura-deploy-v6.zip';

const conn = new Client();

console.log('Connecting...');

conn.on('ready', () => {
    console.log('Ready');

    conn.sftp((err, sftp) => {
        if (err) throw err;

        console.log('Uploading Zip...');
        sftp.fastPut(localZipPath, remoteZipPath, (err) => {
            if (err) {
                console.error("SFTP Upload Error:", err);
                conn.end();
                return;
            }
            console.log('Zip uploaded.');

            const setupCmd = `mkdir -p ${remoteDir} && mv ${remoteZipPath} ${remoteDir}/ && cd ${remoteDir} && unzip -o aura-deploy-v6.zip`;
            console.log('Setting up files...');
            conn.exec(setupCmd, (err, stream) => {
                if (err) throw err;
                stream.on('close', () => {
                    console.log('Files extracted. Patching config files via SFTP...');

                    sftp.fastPut(localDockerPath, `${remoteDir}/Dockerfile`, (err) => {
                        if (err) throw err;
                        sftp.fastPut(localComposePath, `${remoteDir}/docker-compose.yml`, (err) => {
                            if (err) throw err;
                            console.log('Config files patched. Rebuilding containers...');

                            // Force rebuild with new network config
                            const buildCmd = `cd ${remoteDir} && docker compose down --remove-orphans && docker compose up -d --build --force-recreate`;
                            conn.exec(buildCmd, (err, stream) => {
                                if (err) throw err;
                                stream.on('close', (code) => {
                                    console.log('Deployment complete. Exit code: ' + code);
                                    conn.end();
                                });
                                stream.on('data', (data) => process.stdout.write(data));
                                stream.stderr.on('data', (data) => process.stderr.write(data));
                            });
                        });
                    });
                });
            });
        });
    });
}).connect(config);

conn.on('error', (err) => {
    console.error('Connection Error:', err);
});
