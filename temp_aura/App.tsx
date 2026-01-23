import React, { useState, useEffect } from 'react';
import { Room, RoomStatus, RoomType, ViewState, Reservation, Currency, Language, BoardType, User, Hotel, Role, HotelDetails, WebsiteConfig, Review, IntegrationSettings } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import Housekeeping from './components/Housekeeping';
import ChannelManager from './components/ChannelManager';
import Reviews from './components/Reviews';
import BookingWidget from './components/BookingWidget';
import PropertySettings from './components/PropertySettings';
import UserGuide from './components/UserGuide';
import Login from './components/Login';
import Register from './components/Register';
import Onboarding from './components/Onboarding';
import Invoicing from './components/Invoicing';
import Reporting from './components/Reporting';
import WebsiteBuilder from './components/WebsiteBuilder';
import MasterAdmin from './components/MasterAdmin';
import LiveChat from './components/LiveChat';
import PricingManager from './components/PricingManager';
import LandingPage from './components/LandingPage';
import { Menu } from 'lucide-react';
import { getHotelData, saveHotelData } from './services/db';
import { translations } from './utils/helpers';

// Auth State Enum
type AuthState = 'LANDING' | 'REGISTER' | 'ONBOARDING' | 'LOGIN' | 'APP' | 'MASTER_ADMIN';

const App: React.FC = () => {
  // Default to LANDING instead of LOGIN
  const [authState, setAuthState] = useState<AuthState>('LANDING');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonating, setImpersonating] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Data State
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hotelDetails, setHotelDetails] = useState<HotelDetails>({
    companyName: '', taxId: '', taxOffice: '', checkInTime: '14:00', checkOutTime: '12:00', cancellationPolicy: ''
  });

  // Global Settings
  const [currency, setCurrency] = useState<Currency>('TRY');
  const [language, setLanguage] = useState<Language>('tr');
  const [darkMode, setDarkMode] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Integration State
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    pos: { provider: 'None', isActive: false, apiKey: '', secretKey: '', merchantId: '', merchantSalt: '', testMode: true },
    eInvoice: { provider: 'None', isActive: false, username: '', password: '', apiKey: '', testMode: true },
    kbs: { isActive: false, facilityCode: '', password: '', autoSend: true },
    channelManager: { autoSync: true },
    aiSettings: { geminiApiKey: '', isUsingDefault: true }
  });

  // Website Builder State - Initialized with defaults for the current language
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig>({
    domain: '',
    published: false,
    heroTitle: translations[language]?.defaultHeroTitle || 'Welcome',
    heroSubtitle: translations[language]?.defaultHeroSubtitle || 'Experience Luxury',
    heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
    showAbout: true,
    showRooms: true,
    showContact: true,
    primaryColor: '#0f766e'
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Registration Data Temp Storage
  const [registerData, setRegisterData] = useState<any>(null);

  // Browser Notifications Setup
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Theme Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Watch for new reservations for notifications
  const [prevResCount, setPrevResCount] = useState(0);
  useEffect(() => {
    if (reservations.length > prevResCount && prevResCount > 0) {
      const t = translations[language];
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(t.newBookingTitle, {
          body: t.newBookingBody,
          icon: 'https://cdn-icons-png.flaticon.com/512/201/201623.png'
        });
      }
    }
    setPrevResCount(reservations.length);
  }, [reservations, language, prevResCount]);


  // --- Data Persistence & Loading ---

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser && currentUser.hotelId) {
        setLoadingData(true);
        try {
          const data = await getHotelData(currentUser.hotelId);
          if (data) {
            setRooms(data.rooms || []);
            setReservations(data.reservations || []);
            setHotelDetails(data.details);
            setCurrency(data.settings.currency);

            // Important: Set language first so translations are correct
            const loadedLang = data.settings.language;
            setLanguage(loadedLang);

            if (data.integrations) {
              setIntegrationSettings({
                pos: data.integrations.pos || { provider: 'None', isActive: false, apiKey: '', secretKey: '', merchantId: '', merchantSalt: '', testMode: true },
                eInvoice: data.integrations.eInvoice || { provider: 'None', isActive: false, username: '', password: '', apiKey: '', testMode: true },
                kbs: data.integrations.kbs || { isActive: false, facilityCode: '', password: '', autoSend: true },
                channelManager: data.integrations.channelManager || { autoSync: true },
                aiSettings: data.integrations.aiSettings || { geminiApiKey: '', isUsingDefault: true }
              });
            }
            setReviews([]);

            if (data.websiteConfig) {
              setWebsiteConfig(data.websiteConfig);
            } else {
              // If no config exists, create one with localized defaults based on the loaded language
              const t = translations[loadedLang] || translations['tr'];
              setWebsiteConfig({
                domain: '',
                published: false,
                heroTitle: t.defaultHeroTitle || 'Welcome',
                heroSubtitle: t.defaultHeroSubtitle || 'Experience Luxury',
                heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
                showAbout: true,
                showRooms: true,
                showContact: true,
                primaryColor: '#0f766e'
              });
            }
          }
        } catch (error) {
          console.error("Error loading hotel data:", error);
        } finally {
          setLoadingData(false);
        }
      }
    };
    fetchData();
  }, [currentUser]);

  const saveChanges = async () => {
    if (currentUser && currentUser.hotelId) {
      await saveHotelData(currentUser.hotelId, {
        rooms,
        reservations,
        details: hotelDetails,
        settings: { currency, language },
        integrations: integrationSettings,
        websiteConfig
      });
    }
  };

  useEffect(() => {
    // Simple debouncing logic
    const timer = setTimeout(saveChanges, 2000);
    return () => clearTimeout(timer);
  }, [rooms, reservations, hotelDetails, currency, language, websiteConfig, integrationSettings]);


  // --- Handlers ---

  const handleUpdateRoomStatus = (id: string, status: RoomStatus) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleAddReservation = (reservation: Reservation) => {
    setReservations([...reservations, reservation]);
  };

  const handleUpdateReservation = (updatedRes: Reservation) => {
    const prev = reservations.find(r => r.id === updatedRes.id);
    if (prev && prev.status !== 'cancelled' && updatedRes.status === 'cancelled') {
      const t = translations[language];
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(t.cancellationTitle, {
          body: t.cancellationBody,
          icon: 'https://cdn-icons-png.flaticon.com/512/201/201623.png'
        });
      }
    }
    setReservations(reservations.map(r => r.id === updatedRes.id ? updatedRes : r));
  };

  const handleUpdateRoomSettings = (configs: Record<RoomType, any>) => {
    let newRooms = [...rooms];
    (Object.keys(configs) as RoomType[]).forEach(type => {
      const config = configs[type];
      const existingRoomsOfType = newRooms.filter(r => r.type === type);
      const currentCount = existingRoomsOfType.length;
      const targetCount = config.totalRooms;

      newRooms = newRooms.map(r => {
        if (r.type === type) {
          return { ...r, price: config.basePrice, features: config.features, boardTypes: config.boardTypes, images: config.images };
        }
        return r;
      });

      if (targetCount > currentCount) {
        const roomsToAdd = targetCount - currentCount;
        for (let i = 1; i <= roomsToAdd; i++) {
          const nextNum = currentCount + i;
          newRooms.push({
            id: `${type}-${Date.now()}-${i}`,
            number: `${type.substring(0, 1).toUpperCase()}${100 + nextNum}`,
            type: type,
            status: RoomStatus.CLEAN,
            floor: 1,
            price: config.basePrice,
            features: config.features,
            boardTypes: config.boardTypes,
            dailyRates: {},
            images: config.images || []
          });
        }
      } else if (targetCount < currentCount) {
        const roomsToRemove = currentCount - targetCount;
        const idsToRemove = existingRoomsOfType.slice(-roomsToRemove).map(r => r.id);
        newRooms = newRooms.filter(r => !idsToRemove.includes(r.id));
      }
    });
    setRooms(newRooms);
  };

  const handleUpdateHotelDetails = (updates: Partial<HotelDetails>) => {
    setHotelDetails(prev => ({ ...prev, ...updates }));
  };

  const handleSimulateIncomingBooking = () => {
    if (rooms.length === 0) return false;

    const today = new Date();
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 2);

    const checkIn = today.toISOString().split('T')[0];
    const checkOut = nextDay.toISOString().split('T')[0];

    const availableRoom = rooms.find(room => {
      return !reservations.some(res =>
        res.roomId === room.id &&
        res.status !== 'cancelled' &&
        ((checkIn >= res.checkIn && checkIn < res.checkOut) || (checkOut > res.checkIn && checkOut <= res.checkOut))
      );
    });

    if (availableRoom) {
      const newRes: Reservation = {
        id: Date.now().toString(),
        guestName: "Booking.com Guest",
        roomId: availableRoom.id,
        checkIn,
        checkOut,
        source: "Booking.com",
        status: "confirmed",
        amount: availableRoom.price * 2,
        paid: true,
        boardType: BoardType.BB
      };
      setReservations(prev => [...prev, newRes]);
      return true;
    }
    return false;
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === Role.MASTER_ADMIN) {
      setAuthState('MASTER_ADMIN');
    } else {
      setAuthState('APP');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthState('LANDING');
    setImpersonating(false);
    setRooms([]);
    setReservations([]);
  };

  const handleRegister = (data: any) => {
    setRegisterData(data);
    setCurrentUser(data.user);
    setAuthState('ONBOARDING');
  };

  const handleOnboardingComplete = async (generatedRooms: Room[]) => {
    setRooms(generatedRooms);
    if (currentUser && currentUser.hotelId) {
      await saveHotelData(currentUser.hotelId, { rooms: generatedRooms });
    }
    setAuthState('APP');
  };

  const handleImpersonate = (hotelId: string) => {
    setImpersonating(true);
    const mockUser: User = {
      id: 'admin-impersonator',
      name: 'Admin View',
      email: 'admin@aura.com',
      role: Role.HOTEL_MANAGER,
      hotelId: hotelId,
      creditsUsed: 0,
      creditLimit: 9999
    };
    setCurrentUser(mockUser);
    setAuthState('APP');
  };

  const handleExitImpersonation = () => {
    setImpersonating(false);
    setCurrentUser({
      id: 'master-admin-001',
      email: 'sserdarb@gmail.com',
      name: 'Serdar B.',
      role: Role.MASTER_ADMIN,
      creditsUsed: 0,
      creditLimit: 0
    });
    setAuthState('MASTER_ADMIN');
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setIntegrationSettings(prev => ({
      ...prev,
      channelManager: { ...prev.channelManager, autoSync: enabled }
    }));
  };


  // --- View Routing ---

  if (authState === 'LANDING') {
    return <LandingPage
      language={language}
      setLanguage={setLanguage}
      onLoginClick={() => setAuthState('LOGIN')}
      onRegisterClick={() => setAuthState('REGISTER')}
    />;
  }

  if (authState === 'LOGIN') {
    return <Login onLogin={handleLogin} language={language} switchToRegister={() => setAuthState('REGISTER')} />;
  }

  if (authState === 'REGISTER') {
    return <Register onRegister={handleRegister} language={language} switchToLogin={() => setAuthState('LOGIN')} />;
  }

  if (authState === 'ONBOARDING') {
    return <Onboarding websiteUrl={registerData?.website || 'https://example.com'} onComplete={handleOnboardingComplete} language={language} />;
  }

  if (authState === 'MASTER_ADMIN') {
    return <MasterAdmin onLogout={handleLogout} onImpersonate={handleImpersonate} />;
  }

  if (loadingData && authState === 'APP') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading Hotel Data...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard
          currency={currency}
          language={language}
          reservations={reservations}
          onChangeView={setCurrentView}
        />;
      case ViewState.CALENDAR:
        return <CalendarView
          rooms={rooms}
          reservations={reservations}
          language={language}
          onAddReservation={handleAddReservation}
          onUpdateReservation={handleUpdateReservation}
          autoSync={integrationSettings.channelManager?.autoSync}
        />;
      case ViewState.HOUSEKEEPING:
        return <Housekeeping rooms={rooms} onUpdateStatus={handleUpdateRoomStatus} language={language} />;
      case ViewState.CHANNELS:
        return <ChannelManager
          language={language}
          onSimulateBooking={handleSimulateIncomingBooking}
          currency={currency}
          setCurrency={setCurrency}
          autoSync={integrationSettings.channelManager?.autoSync}
          toggleAutoSync={handleToggleAutoSync}
        />;
      case ViewState.MESSAGES:
        return <LiveChat language={language} onUnreadChange={setUnreadMessages} />;
      case ViewState.REVIEWS:
        return <Reviews language={language} />;
      case ViewState.BOOKING_ENGINE:
        return <BookingWidget currency={currency} language={language} />;
      case ViewState.WEBSITE_BUILDER:
        return <WebsiteBuilder
          hotelDetails={hotelDetails}
          rooms={rooms}
          language={language}
          config={websiteConfig}
          onSave={setWebsiteConfig}
          reviews={reviews}
          currency={currency}
        />;
      case ViewState.INVOICES:
        return <Invoicing currency={currency} language={language} reservations={reservations} hotelDetails={hotelDetails} />;
      case ViewState.REPORTING:
        return <Reporting currency={currency} language={language} reservations={reservations} rooms={rooms} />;
      case ViewState.SETTINGS:
        return <PropertySettings
          currency={currency}
          setCurrency={setCurrency}
          language={language}
          setLanguage={setLanguage}
          rooms={rooms}
          onUpdateRooms={handleUpdateRoomSettings}
          hotelDetails={hotelDetails}
          onUpdateDetails={handleUpdateHotelDetails}
          integrationSettings={integrationSettings}
          onUpdateIntegrations={setIntegrationSettings}
        />;
      case ViewState.PRICING:
        return <PricingManager
          rooms={rooms}
          onUpdateRooms={setRooms}
          language={language}
          currency={currency}
          autoSync={integrationSettings.channelManager?.autoSync}
        />;
      case ViewState.GUIDE:
        return <UserGuide language={language} />;
      default:
        return <Dashboard currency={currency} language={language} reservations={reservations} onChangeView={setCurrentView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors relative">
      <button
        className="lg:hidden fixed top-4 right-4 z-50 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-md"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <Menu size={24} className="text-slate-700 dark:text-slate-200" />
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      <div className={`lg:block ${mobileMenuOpen ? 'block fixed left-0 top-0 bottom-0 z-50' : 'hidden'}`}>
        <Sidebar
          currentView={currentView}
          onChangeView={(view) => {
            setCurrentView(view);
            setMobileMenuOpen(false);
          }}
          language={language}
          setLanguage={setLanguage}
          onLogout={handleLogout}
          isImpersonating={impersonating}
          onBackToAdmin={handleExitImpersonation}
          user={currentUser}
          darkMode={darkMode}
          toggleTheme={() => setDarkMode(!darkMode)}
          unreadCount={unreadMessages}
        />
      </div>

      <main className="flex-1 lg:ml-64 p-4 md:p-8 lg:p-10 transition-all w-full">
        {renderView()}
      </main>
    </div>
  );
};

export default App;