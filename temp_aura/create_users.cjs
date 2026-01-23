const { Client } = require('ssh2');

const config = {
    host: '76.13.0.113',
    port: 22,
    username: 'root',
    password: "tvONwId?Z.nm'c/M-k7N"
};

const conn = new Client();

console.log('Connecting...');

conn.on('ready', () => {
    console.log('Ready. Creating users in MongoDB...');

    // Create master admin and demo users
    const mongoCmd = `docker exec aura_mongodb mongosh aura_hotel_db --eval '
// Create Master Admin User
db.users.deleteOne({ email: "sserdarb@gmail.com" });
db.users.insertOne({
    id: "master-admin-001",
    email: "sserdarb@gmail.com",
    password: "Tuba@2015Tuana",
    name: "Master Admin",
    role: "MASTER_ADMIN",
    hotelId: null,
    creditsUsed: 0,
    creditLimit: 999999,
    createdAt: new Date().toISOString()
});

// Create Demo Hotel
db.hotels.deleteOne({ id: "demo-hotel" });
db.hotels.insertOne({
    id: "demo-hotel",
    name: "Demo Butik Otel",
    ownerId: "demo-user-001",
    website: "https://demo.pms.innovmar.cloud",
    phone: "+90 555 123 4567",
    details: {
        companyName: "Demo Otelcilik A.Ş.",
        taxId: "1234567890",
        taxOffice: "Demo Vergi Dairesi",
        checkInTime: "14:00",
        checkOutTime: "12:00",
        cancellationPolicy: "Ücretsiz iptal 24 saat öncesine kadar."
    },
    rooms: [
        { id: "room-1", name: "Standart Oda", type: "standard", capacity: 2, basePrice: 500, status: "available" },
        { id: "room-2", name: "Deluxe Oda", type: "deluxe", capacity: 2, basePrice: 800, status: "available" },
        { id: "room-3", name: "Suite", type: "suite", capacity: 4, basePrice: 1500, status: "available" }
    ],
    reservations: [],
    settings: { currency: "TRY", language: "tr" },
    createdAt: new Date().toISOString()
});

// Create Demo User
db.users.deleteOne({ email: "demo@aura.pms" });
db.users.insertOne({
    id: "demo-user-001",
    email: "demo@aura.pms",
    password: "demo123",
    name: "Demo Kullanıcı",
    role: "HOTEL_MANAGER",
    hotelId: "demo-hotel",
    creditsUsed: 25,
    creditLimit: 100,
    createdAt: new Date().toISOString()
});

print("Users created successfully!");
print("Master Admin: sserdarb@gmail.com");
print("Demo User: demo@aura.pms / demo123");
'`;

    conn.exec(mongoCmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code) => {
            console.log('Exit code: ' + code);
            conn.end();
        });
        stream.on('data', (data) => console.log('STDOUT: ' + data));
        stream.stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);

conn.on('error', (err) => {
    console.error('Connection Error:', err);
});
