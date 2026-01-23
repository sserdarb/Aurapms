import express from 'express';
import { Hotel, User, Log } from './models.js';

const router = express.Router();

// --- Auth Routes ---

router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Return user without password
        const userObj = user.toObject();
        delete userObj.password;

        // Log login
        const log = new Log({
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            userEmail: email,
            action: 'Login',
            details: 'User logged in successfully'
        });
        await log.save();

        res.json({ success: true, user: userObj });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/auth/register', async (req, res) => {
    try {
        const { hotelData, userData } = req.body;

        // Check existing
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hotelId = `hotel-${Date.now()}`;
        const userId = `user-${Date.now()}`;

        // Create Hotel
        const newHotel = new Hotel({
            id: hotelId,
            name: userData.companyName || 'New Hotel',
            ownerId: userId,
            website: userData.website,
            phone: userData.phone,
            details: {
                companyName: userData.companyName,
                taxId: userData.taxId,
                taxOffice: userData.taxOffice,
                checkInTime: '14:00',
                checkOutTime: '12:00',
                cancellationPolicy: 'Free cancellation up to 24h.'
            },
            rooms: [],
            reservations: [],
            settings: { currency: 'TRY', language: 'tr' },
            createdAt: new Date().toISOString()
        });

        // Create User
        const newUser = new User({
            id: userId,
            email: userData.email,
            password: userData.password,
            name: userData.companyName,
            role: 'HOTEL_MANAGER', // Hardcoded enum string
            hotelId: hotelId,
            creditsUsed: 0,
            creditLimit: 100
        });

        await newHotel.save();
        await newUser.save();

        res.json({ success: true, user: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- Hotel Routes ---

router.get('/hotels/:id', async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ id: req.params.id });
        if (!hotel) return res.status(404).json(undefined);
        res.json(hotel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/hotels/:id', async (req, res) => {
    try {
        const data = req.body;
        // Use findOneAndUpdate with upsert=true for flexibility, or just update
        await Hotel.findOneAndUpdate({ id: req.params.id }, data, { new: true, upsert: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/hotels', async (req, res) => {
    try {
        const hotels = await Hotel.find({});
        res.json(hotels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- User Routes ---

router.get('/users', async (req, res) => {
    try {
        // Exclude master admin for privacy/security listing
        const users = await User.find({ role: { $ne: 'MASTER_ADMIN' } });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Logs ---
router.get('/logs', async (req, res) => {
    try {
        const logs = await Log.find({}).sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/logs', async (req, res) => {
    try {
        const newLog = new Log(req.body);
        await newLog.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
