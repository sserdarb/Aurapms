import { Hotel, User, Role, SystemLog } from '../types';

// API Base URL - relative for production (served by same origin) or localhost for dev
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:7080/api';

// --- Helper Functions ---

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP Error: ${response.status}`);
    }
    return response.json();
};

// --- Auth Services ---

export const loginUser = async (email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        return data; // { success: true, user: ... } or { success: false, message: ... }
    } catch (e: any) {
        console.error("Login Error:", e);
        return { success: false, message: e.message || 'Login failed' };
    }
};

export const registerHotel = async (hotelData: any, userData: any): Promise<{ success: boolean; user?: User }> => {
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hotelData, userData })
        });
        const data = await res.json();
        return data;
    } catch (e: any) {
        console.error("Register Error:", e);
        return { success: false };
    }
};

// --- Data Services ---

export const getHotelData = async (hotelId: string): Promise<Hotel | undefined> => {
    try {
        return await handleResponse(await fetch(`${API_URL}/hotels/${hotelId}`));
    } catch (e) {
        console.error("Get Hotel Error:", e);
        return undefined;
    }
};

export const saveHotelData = async (hotelId: string, data: Partial<Hotel>) => {
    try {
        await fetch(`${API_URL}/hotels/${hotelId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } catch (e) {
        console.error("Save Hotel Error:", e);
    }
};

export const getAllHotels = async (): Promise<Hotel[]> => {
    try {
        return await handleResponse(await fetch(`${API_URL}/hotels`));
    } catch (e) {
        console.error("Get All Hotels Error:", e);
        return [];
    }
};

export const getAllUsers = async (): Promise<User[]> => {
    try {
        return await handleResponse(await fetch(`${API_URL}/users`));
    } catch (e) {
        console.error("Get All Users Error:", e);
        return [];
    }
};

// --- System Logs ---

export const getSystemLogs = async (): Promise<SystemLog[]> => {
    try {
        return await handleResponse(await fetch(`${API_URL}/logs`));
    } catch (e) {
        console.error("Get Logs Error:", e);
        return [];
    }
};

export const logSystemAction = async (userEmail: string, action: string, details: string) => {
    try {
        await fetch(`${API_URL}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                userEmail,
                action,
                details
            })
        });
    } catch (e) {
        console.error("Log Action Error:", e);
    }
};

// --- Admin/Credit (Optional/Partial Impl) ---
export const addUserCredits = async (userId: string, amount: number) => {
    // This would likely be another API endpoint in a real scenario
    console.warn("addUserCredits not fully implemented in API yet");
    return false;
};

// --- Legacy/Unused Placeholders (to prevent breakages) ---

export const getStorageMode = () => 'Cloud (MongoDB)';
export const getFallbackReason = () => null;
export const retryConnection = async () => true;
export const testConnection = async () => ({ success: true, message: "API Connected" });
export const seedInitialData = async () => { /* No-op: DB is persistent now */ };