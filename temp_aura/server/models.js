import mongoose from 'mongoose';

const HotelSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    ownerId: { type: String, required: true },
    website: String,
    phone: String,
    details: {
        companyName: String,
        taxId: String,
        taxOffice: String,
        checkInTime: String,
        checkOutTime: String,
        cancellationPolicy: String
    },
    rooms: [{
        id: String,
        number: String,
        type: String, // RoomType enum
        status: String, // RoomStatus enum
        floor: Number,
        price: Number,
        features: [String],
        boardTypes: [String], // BoardType enum
        images: [String]
    }],
    reservations: [{
        id: String,
        guestName: String,
        roomId: String,
        checkIn: String,
        checkOut: String,
        source: String,
        status: String,
        amount: Number,
        paid: Boolean,
        boardType: String,
        extras: [mongoose.Schema.Types.Mixed]
    }],
    maintenanceTickets: [{
        id: String,
        roomId: String,
        description: String,
        priority: String,
        status: String,
        createdAt: String,
        reportedBy: String
    }],
    settings: {
        currency: String,
        language: String
    },
    integrations: {
        pos: mongoose.Schema.Types.Mixed,
        eInvoice: mongoose.Schema.Types.Mixed,
        kbs: mongoose.Schema.Types.Mixed,
        channelManager: mongoose.Schema.Types.Mixed
    },
    websiteConfig: mongoose.Schema.Types.Mixed,
    createdAt: String
}, { minimize: false });

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Simple auth as requested, hashed in real app
    name: String,
    role: String, // Role enum
    hotelId: String,
    creditsUsed: Number,
    creditLimit: Number
});

const LogSchema = new mongoose.Schema({
    id: String,
    timestamp: String,
    userEmail: String,
    action: String,
    details: String
});

export const Hotel = mongoose.model('Hotel', HotelSchema);
export const User = mongoose.model('User', UserSchema);
export const Log = mongoose.model('Log', LogSchema);
