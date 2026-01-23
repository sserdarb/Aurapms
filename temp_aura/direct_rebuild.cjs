const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
    host: '76.13.0.113',
    port: 22,
    username: 'root',
    password: "tvONwId?Z.nm'c/M-k7N"
};

const localComposePath = path.join(__dirname, 'docker-compose.yml');
const remoteDir = '/opt/pms-innovmar';

const conn = new Client();

conn.on('ready', () => {
    console.log('Ready');

    conn.sftp((err, sftp) => {
        if (err) throw err;

        // Patch docker-compose.yml with Traefik labels
        console.log('Patching docker-compose.yml...');
        sftp.fastPut(localComposePath, `${remoteDir}/docker-compose.yml`, (err) => {
            if (err) throw err;
            console.log('File patched. Rebuilding...');

            const cmd = `cd ${remoteDir} && docker compose down --remove-orphans && docker compose up -d --build --force-recreate`;
            conn.exec(cmd, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code) => {
                    console.log('Exit code: ' + code);
                    conn.end();
                });
                stream.on('data', (data) => process.stdout.write(data));
                stream.stderr.on('data', (data) => process.stderr.write(data));
            });
        });
    });
}).connect(config);
