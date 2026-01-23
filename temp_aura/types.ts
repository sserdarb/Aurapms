
export enum RoomStatus {
  CLEAN = 'CLEAN',
  DIRTY = 'DIRTY',
  INSPECTION = 'INSPECTION',
  OOO = 'OOO', // Out of Order (Major issue)
  MAINTENANCE = 'MAINTENANCE' // Minor fix needed
}

export enum RoomType {
  STANDARD = 'Standard',
  DELUXE = 'Deluxe',
  SUITE = 'Suite',
  VILLA = 'Garden Villa'
}

export enum BoardType {
  RO = 'Room Only',
  BB = 'Bed & Breakfast',
  HB = 'Half Board',
  FB = 'Full Board',
  AI = 'All Inclusive'
}

export enum Role {
  MASTER_ADMIN = 'MASTER_ADMIN',
  HOTEL_MANAGER = 'HOTEL_MANAGER'
}

export type Currency = 'TRY' | 'USD' | 'EUR';
export type Language = 'tr' | 'en' | 'de' | 'ru' | 'sv';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: Role;
  hotelId?: string; // Null if Master Admin
  creditsUsed: number; // AI/System Usage Credits
  creditLimit: number; // Monthly Limit (Default 1000)
}

export interface WebsiteConfig {
  domain: string;
  published: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  showAbout: boolean;
  showRooms: boolean;
  showContact: boolean;
  showGallery?: boolean;
  primaryColor: string;
  socialUrls?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  whatsappNumber?: string;
  phoneNumber?: string;
  customHtml?: string;
  analyticsId?: string;
  defaultLanguage?: Language;
  supportedLanguages?: Language[];
  translations?: Record<Language, Record<string, string>>;
}

export interface IntegrationSettings {
  pos: {
    provider: 'None' | 'Stripe' | 'PayTR' | 'Iyzico';
    isActive: boolean;
    apiKey: string;
    secretKey: string;
    merchantId?: string;
    merchantSalt?: string;
    testMode: boolean;
  };
  eInvoice: {
    provider: 'None' | 'GIB' | 'Parasut' | 'Logo' | 'BizimHesap';
    isActive: boolean;
    username: string;
    password: string;
    apiKey?: string;
    testMode: boolean;
  };
  kbs: {
    isActive: boolean;
    facilityCode: string;
    password: string;
    ipAddress?: string;
    autoSend: boolean;
  };
  channelManager: {
    autoSync: boolean;
  };
  aiSettings?: {
    geminiApiKey?: string;
    isUsingDefault?: boolean;
  };
}

export interface Hotel {
  id: string;
  name: string;
  ownerId: string;
  website: string;
  phone: string;
  details: HotelDetails;
  rooms: Room[];
  reservations: Reservation[];
  maintenanceTickets?: MaintenanceTicket[];
  settings: {
    currency: Currency;
    language: Language;
  };
  integrations?: IntegrationSettings;
  websiteConfig?: WebsiteConfig;
  createdAt: string;
}

export interface HotelDetails {
  companyName: string;
  taxId: string;
  taxOffice: string;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string;
  userEmail: string;
  details: string;
}

export interface DailyRate {
  date: string; // YYYY-MM-DD
  price: number;
  agencyPrice?: number;
  onlinePrice?: number;
  inventory: number;
  stopSale: boolean;
  minStay?: number;
  closedForArrival?: boolean;
  closedForDeparture?: boolean;
}

export interface PriceChangeLog {
  id: string;
  date: string;
  roomType: RoomType;
  targetDate: string;
  oldPrice: number;
  newPrice: number;
  action: string; // 'Bulk Update', 'Manual', 'Smart Campaign'
  user: string;
  timestamp: string;
}

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  status: RoomStatus;
  floor: number;
  price: number;
  features: string[];
  boardTypes: BoardType[];
  dailyRates?: Record<string, DailyRate>; // Map of date -> rate info
  images?: string[];
}

export interface Competitor {
  id: string;
  name: string;
  website: string;
  avgPriceOffset: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  date: string;
}

export interface Reservation {
  id: string;
  guestName: string;
  roomId: string;
  checkIn: string; // ISO Date string
  checkOut: string; // ISO Date string
  source: string; // Booking.com, Direct, Expedia, etc.
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'refunded';
  amount: number;
  paid: boolean;
  boardType?: BoardType;
  extras?: ServiceItem[]; // Added for folio management
  notes?: string;
}

export interface MaintenanceTicket {
  id: string;
  roomId: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  resolvedAt?: string;
  reportedBy: string;
}

export interface Review {
  id: string;
  source: 'Google' | 'TripAdvisor' | 'Booking.com';
  author: string;
  rating: number;
  date: string;
  content: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface ChatMessage {
  id: string;
  sender: 'guest' | 'agent';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  guestName: string;
  lastMessage: string;
  unreadCount: number;
  messages: ChatMessage[];
  status: 'active' | 'closed';
}

export interface ImageSearchParams {
  query: string;
  page: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  HOUSEKEEPING = 'HOUSEKEEPING',
  CHANNELS = 'CHANNELS',
  REVIEWS = 'REVIEWS',
  BOOKING_ENGINE = 'BOOKING_ENGINE',
  SETTINGS = 'SETTINGS',
  GUIDE = 'GUIDE',
  INVOICES = 'INVOICES',
  REPORTING = 'REPORTING',
  WEBSITE_BUILDER = 'WEBSITE_BUILDER',
  MESSAGES = 'MESSAGES',
  PRICING = 'PRICING',
  MASTER_ADMIN = 'MASTER_ADMIN'
}
