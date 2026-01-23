const { Client } = require('ssh2');

const config = {
    host: 'pms.innovmar.cloud',
    port: 22,
    username: 'root',
    password: "tvONwId?Z.nm'c/M-k7N"
};

const conn = new Client();
console.log('Connecting...');
conn.on('ready', () => {
    console.log('Ready');
    conn.exec('echo "SSH Connection Verified"', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect(config);
