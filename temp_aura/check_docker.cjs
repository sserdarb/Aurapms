const { Client } = require('ssh2');

const config = {
    host: '76.13.0.113',
    port: 22,
    username: 'root',
    password: "tvONwId?Z.nm'c/M-k7N"
};

const conn = new Client();

conn.on('ready', () => {
    console.log('Client :: ready');
    conn.exec('docker compose version && which docker-compose', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect(config);
