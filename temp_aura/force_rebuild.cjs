const { Client } = require('ssh2');

const config = {
    host: '76.13.0.113',
    port: 22,
    username: 'root',
    password: "tvONwId?Z.nm'c/M-k7N"
};

const remoteDir = '/opt/pms-innovmar';

const conn = new Client();

console.log('Connecting...');

conn.on('ready', () => {
    console.log('Ready. Forcing rebuild...');

    const cmd = `cd ${remoteDir} && docker compose down --rmi local && docker compose up -d --build --force-recreate`;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code) => {
            console.log('Rebuild complete. Exit code: ' + code);
            conn.end();
        }).on('data', (data) => process.stdout.write(data))
            .stderr.on('data', (data) => process.stderr.write(data));
    });
}).connect(config);

conn.on('error', (err) => {
    console.error('Connection Error:', err);
});
