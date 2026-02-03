
import React, { useState, useEffect } from 'react';
import { Save, MapPin, Hotel, Image, Bed, Wifi, Coffee, Car, Utensils, Check, Users, DollarSign, Layers, Plus, ShieldAlert, Send, Sparkles, CreditCard, Server, Loader2, Lock } from 'lucide-react';
import { RoomType, BoardType, Currency, Language, Room, HotelDetails, IntegrationSettings } from '../types';
import { translations } from '../utils/helpers';
import { getMaskedApiKey, setApiKey as setGeminiKey, resetToDefaultKey, isUsingDefaultKey } from '../services/geminiService';

// Mock state interface for room configuration
interface RoomConfig {
  basePrice: number;
  size: number;
  totalRooms: number;
  capacity: { adults: number, children: number };
  description: string;
  images: string[];
  boardTypes: BoardType[];
  features: string[];
}

interface PropertySettingsProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  rooms: Room[];
  onUpdateRooms: (configs: Record<RoomType, RoomConfig>) => void;
  hotelDetails: HotelDetails;
  onUpdateDetails: (details: Partial<HotelDetails>) => void;
  integrationSettings?: IntegrationSettings;
  onUpdateIntegrations?: (settings: IntegrationSettings) => void;
}

const PropertySettings: React.FC<PropertySettingsProps> = ({ currency, setCurrency, language, setLanguage, rooms, onUpdateRooms, hotelDetails, onUpdateDetails, integrationSettings, onUpdateIntegrations }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'location' | 'rooms' | 'amenities' | 'legal' | 'payments' | 'integrations' | 'ai'>('general');
  const [saved, setSaved] = useState(false);
  const t = translations[language];

  // Enhanced Input Style: Explicit Light/Dark mode colors + Stylish Border/Shadow
  const inputClass = "w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm font-medium placeholder-slate-400";

  // Integration Testing States
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({
    pos: 'idle',
    eInvoice: 'idle',
    kbs: 'idle'
  });

  // Helper to extract config from existing rooms or use defaults
  const getInitialConfig = (type: RoomType, currentRooms: Room[]): RoomConfig => {
    const typeRooms = currentRooms.filter(r => r.type === type);
    const firstRoom = typeRooms[0];

    return {
      basePrice: firstRoom ? firstRoom.price : (type === RoomType.STANDARD ? 2500 : type === RoomType.DELUXE ? 3500 : 5000),
      size: type === RoomType.STANDARD ? 25 : type === RoomType.DELUXE ? 35 : 55,
      totalRooms: typeRooms.length,
      capacity: { adults: 2, children: type === RoomType.STANDARD ? 0 : 1 },
      description: t.roomDescriptions[type] || '',
      images: firstRoom?.images || [],
      boardTypes: firstRoom ? firstRoom.boardTypes : [BoardType.RO, BoardType.BB],
      features: firstRoom ? firstRoom.features : []
    };
  };

  const [roomConfigs, setRoomConfigs] = useState<Record<RoomType, RoomConfig>>({
    [RoomType.STANDARD]: getInitialConfig(RoomType.STANDARD, rooms),
    [RoomType.DELUXE]: getInitialConfig(RoomType.DELUXE, rooms),
    [RoomType.SUITE]: getInitialConfig(RoomType.SUITE, rooms),
    [RoomType.VILLA]: getInitialConfig(RoomType.VILLA, rooms),
  });

  // Sync config if rooms prop changes externally (e.g. after onboarding)
  useEffect(() => {
    if (rooms.length > 0) {
      setRoomConfigs({
        [RoomType.STANDARD]: getInitialConfig(RoomType.STANDARD, rooms),
        [RoomType.DELUXE]: getInitialConfig(RoomType.DELUXE, rooms),
        [RoomType.SUITE]: getInitialConfig(RoomType.SUITE, rooms),
        [RoomType.VILLA]: getInitialConfig(RoomType.VILLA, rooms),
      });
    }
  }, [rooms.length]);

  // Update descriptions when language changes
  useEffect(() => {
    setRoomConfigs(prevConfigs => {
      const newConfigs = { ...prevConfigs };
      Object.keys(newConfigs).forEach((key) => {
        const roomType = key as RoomType;
        // @ts-ignore - dynamic access
        if (t.roomDescriptions[roomType]) {
          // @ts-ignore
          newConfigs[roomType] = { ...newConfigs[roomType], description: t.roomDescriptions[roomType] };
        }
      });
      return newConfigs;
    });
  }, [language]);

  const handleSave = () => {
    setSaved(true);
    onUpdateRooms(roomConfigs);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestConnection = (type: 'pos' | 'eInvoice' | 'kbs') => {
    setTestStatus(prev => ({ ...prev, [type]: 'loading' }));
    setTimeout(() => {
      setTestStatus(prev => ({ ...prev, [type]: 'success' }));
      setTimeout(() => setTestStatus(prev => ({ ...prev, [type]: 'idle' })), 3000);
    }, 2000);
  };

  const updateIntegration = (section: 'pos' | 'eInvoice' | 'kbs', field: string, value: any) => {
    if (onUpdateIntegrations && integrationSettings) {
      const newSettings = { ...integrationSettings };
      // @ts-ignore
      newSettings[section] = { ...newSettings[section], [field]: value };
      onUpdateIntegrations(newSettings);
    }
  }

  const handleConfigChange = (type: RoomType, field: keyof RoomConfig, value: any) => {
    setRoomConfigs({
      ...roomConfigs,
      [type]: {
        ...roomConfigs[type],
        [field]: value
      }
    });
  }

  const toggleBoardType = (type: RoomType, board: BoardType) => {
    const current = roomConfigs[type].boardTypes;
    const newBoards = current.includes(board)
      ? current.filter(b => b !== board)
      : [...current, board];

    handleConfigChange(type, 'boardTypes', newBoards);
  };

  const handleFeaturesChange = (type: RoomType, value: string) => {
    handleConfigChange(type, 'features', value.split(',').map(s => s.trim()));
  };

  const handleCapacityChange = (type: RoomType, field: 'adults' | 'children', value: string) => {
    let val = parseInt(value);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;

    const maxCapacities: Record<RoomType, number> = {
      [RoomType.STANDARD]: 4,
      [RoomType.DELUXE]: 6,
      [RoomType.SUITE]: 10,
      [RoomType.VILLA]: 20
    };

    const limit = maxCapacities[type];
    const currentCap = roomConfigs[type].capacity;
    const otherVal = field === 'adults' ? currentCap.children : currentCap.adults;

    if (val + otherVal > limit) {
      val = Math.max(0, limit - otherVal);
    }

    setRoomConfigs({
      ...roomConfigs,
      [type]: {
        ...roomConfigs[type],
        capacity: {
          ...roomConfigs[type].capacity,
          [field]: val
        }
      }
    });
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">{t.settings}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t.description}</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-sm"
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          {saved ? t.saved : t.saveChanges}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-4">
            {[
              { id: 'general', label: t.generalInfo, icon: Hotel },
              { id: 'location', label: t.locationMap, icon: MapPin },
              { id: 'rooms', label: t.roomDefinitions, icon: Bed },
              { id: 'amenities', label: t.amenitiesPhotos, icon: Image },
              { id: 'payments', label: t.paymentSettings, icon: CreditCard },
              { id: 'integrations', label: t.eInvoiceSettings, icon: Server },
              { id: 'ai', label: 'AI & Intelligence', icon: Sparkles },
              { id: 'legal', label: t.legalKbs, icon: ShieldAlert },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full text-left px-4 py-4 flex items-center gap-3 text-sm font-medium transition-colors border-l-4 ${activeTab === item.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                  }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif border-b border-slate-100 dark:border-slate-700 pb-4">{t.generalInfo}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.hotelName}</label>
                  <input type="text" defaultValue="Aura Boutique Hotel" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.starRating}</label>
                  <select className={inputClass}>
                    <option>5 Stars</option>
                    <option>4 Stars</option>
                    <option>3 Stars</option>
                    <option>Boutique Special</option>
                  </select>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.description}</label>
                  <textarea rows={4} defaultValue="Experience luxury in the heart of the Aegean coast." className={inputClass} />
                </div>
              </div>

              {/* System Settings */}
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif border-b border-slate-100 dark:border-slate-700 pb-4 pt-4">System Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.baseCurrency}</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className={inputClass}
                  >
                    <option value="TRY">Turkish Lira (₺)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.appLanguage}</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className={inputClass}
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="ru">Русский</option>
                    <option value="sv">Svenska</option>
                  </select>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif border-b border-slate-100 dark:border-slate-700 pb-4 pt-4">{t.contactInfo}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Email Address</label>
                  <input type="email" defaultValue="info@aurahotel.com" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Phone Number</label>
                  <input type="tel" defaultValue="+90 555 123 4567" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Website</label>
                  <input type="url" defaultValue="https://www.aurahotel.com" className={inputClass} />
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif border-b border-slate-100 dark:border-slate-700 pb-4 pt-4">{t.policies}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.checkIn}</label>
                  <input
                    type="time"
                    value={hotelDetails.checkInTime}
                    onChange={(e) => onUpdateDetails({ checkInTime: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.checkOut}</label>
                  <input
                    type="time"
                    value={hotelDetails.checkOutTime}
                    onChange={(e) => onUpdateDetails({ checkOutTime: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.cancellationPolicy}</label>
                  <textarea
                    rows={4}
                    value={hotelDetails.cancellationPolicy}
                    onChange={(e) => onUpdateDetails({ cancellationPolicy: e.target.value })}
                    className={inputClass}
                    placeholder="Enter cancellation policy details..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Location Tab */}
          {activeTab === 'location' && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif border-b border-slate-100 dark:border-slate-700 pb-4">{t.locationMap}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Address Line 1</label>
                  <input type="text" defaultValue="Sahil Cad. No:42, Yalikavak" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">City / District</label>
                  <input type="text" defaultValue="Bodrum" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Country</label>
                  <input type="text" defaultValue="Turkey" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Latitude</label>
                  <input type="text" defaultValue="37.1082" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Longitude</label>
                  <input type="text" defaultValue="27.2935" className={inputClass} />
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-900/50 h-64 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <div className="text-slate-400 flex flex-col items-center">
                  <MapPin size={32} className="mb-2" />
                  <span className="text-sm font-medium">Google Maps Integration Preview</span>
                </div>
              </div>
            </div>
          )}

          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex gap-3 text-blue-800 dark:text-blue-300 text-sm">
                <Layers size={20} className="flex-shrink-0" />
                <p>Define your room categories here. Changes to price, capacity, and board types will be reflected in the Booking Engine and Reception Desk.</p>
              </div>

              {Object.values(RoomType).map((type, idx) => {
                const config = roomConfigs[type];
                // @ts-ignore
                const translatedType = t.roomTypes[type] || type;

                return (
                  <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-primary-600">
                          <Bed size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight">{translatedType}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{config.description}</p>
                        </div>
                      </div>
                      <button className="text-xs bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 font-medium shadow-sm">Edit Gallery</button>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column: Pricing & Inventory */}
                      <div className="space-y-6">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700 pb-2">{t.pricingInventory}</h5>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block">{t.basePrice}</label>
                            <div className="relative">
                              <div className="absolute left-3 top-3 text-slate-400 font-bold text-xs">{currency}</div>
                              <input
                                type="number"
                                value={config.basePrice}
                                onChange={(e) => handleConfigChange(type, 'basePrice', Number(e.target.value))}
                                className={`${inputClass} pl-12`}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block">{t.totalRooms}</label>
                            <input
                              type="number"
                              value={config.totalRooms}
                              onChange={(e) => handleConfigChange(type, 'totalRooms', Number(e.target.value))}
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block">{t.roomSize}</label>
                          <input
                            type="number"
                            value={config.size}
                            onChange={(e) => handleConfigChange(type, 'size', Number(e.target.value))}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      {/* Right Column: Capacity & Board Types */}
                      <div className="space-y-6">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700 pb-2">{t.capacityBoard}</h5>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block flex items-center gap-1"><Users size={12} /> {t.maxAdults}</label>
                            <input
                              type="number"
                              min="0"
                              value={config.capacity.adults}
                              onChange={(e) => handleCapacityChange(type, 'adults', e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block flex items-center gap-1"><Users size={12} /> {t.maxChildren}</label>
                            <input
                              type="number"
                              min="0"
                              value={config.capacity.children}
                              onChange={(e) => handleCapacityChange(type, 'children', e.target.value)}
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2 block flex items-center gap-1"><Utensils size={12} /> {t.allowedBoardTypes}</label>
                          <div className="flex flex-wrap gap-2">
                            {Object.values(BoardType).map((board) => {
                              // @ts-ignore
                              const translatedBoard = t.boardTypes[board] || board;
                              return (
                                <button
                                  key={board}
                                  onClick={() => toggleBoardType(type, board)}
                                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${config.boardTypes.includes(board)
                                    ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400'
                                    : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700'
                                    }`}
                                >
                                  {translatedBoard}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block flex items-center gap-1"><Sparkles size={12} /> Room Features</label>
                          <input
                            type="text"
                            value={config.features.join(', ')}
                            onChange={(e) => handleFeaturesChange(type, e.target.value)}
                            className={inputClass}
                            placeholder="Wifi, TV, Balcony, etc."
                          />
                          <p className="text-xs text-slate-400 mt-1">Comma separated values</p>
                        </div>
                      </div>
                    </div>

                    {/* Full Width: Images */}
                    <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-700 mt-2">
                      <h5 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide pt-4 pb-2">{t.roomImages}</h5>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {config.images.map((img, i) => (
                          <div key={i} className="w-24 h-24 flex-shrink-0 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center relative group overflow-hidden">
                            <img src={img} alt="Room" className="w-full h-full object-cover" />
                            <button className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus size={12} className="rotate-45" />
                            </button>
                          </div>
                        ))}
                        <button className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-primary-400 hover:text-primary-600 transition-colors">
                          <Plus size={24} />
                          <span className="text-[10px] mt-1 uppercase font-bold">Add Photo</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}

              <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl text-slate-400 font-bold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all flex items-center justify-center gap-2">
                <Plus size={20} />
                {t.createRoomCategory}
              </button>
            </div>
          )}

          {/* Amenities Tab */}
          {activeTab === 'amenities' && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif border-b border-slate-100 dark:border-slate-700 pb-4">{t.amenitiesPhotos}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Free High-Speed Wifi', icon: Wifi },
                  { name: 'Swimming Pool', icon: Utensils }, // Using Utensils as generic placeholder if Pool not avail
                  { name: 'Spa & Wellness', icon: Coffee },
                  { name: 'Valet Parking', icon: Car },
                  { name: 'Fine Dining Restaurant', icon: Utensils },
                  { name: 'Room Service (24/7)', icon: Utensils },
                  { name: 'Concierge Service', icon: Hotel },
                  { name: 'Airport Shuttle', icon: Car },
                ].map((feature, idx) => (
                  <label key={idx} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 bg-slate-100 dark:bg-slate-600 border-slate-300 dark:border-slate-500" />
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-medium">
                      <feature.icon size={16} className="text-slate-400" />
                      {feature.name}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && integrationSettings && integrationSettings.pos && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif border-b border-slate-100 dark:border-slate-700 pb-4">{t.paymentSettings}</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {['PayTR', 'Iyzico', 'Stripe'].map(p => (
                  <button
                    key={p}
                    onClick={() => updateIntegration('pos', 'provider', p)}
                    className={`p-4 rounded-xl border text-center transition-all ${integrationSettings.pos.provider === p
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-400 font-bold ring-1 ring-primary-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {integrationSettings.pos.provider !== 'None' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-200">Activate {integrationSettings.pos.provider} Integration</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={integrationSettings.pos.isActive}
                        onChange={(e) => updateIntegration('pos', 'isActive', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {integrationSettings.pos.provider !== 'Stripe' && (
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Merchant ID</label>
                        <input
                          type="text"
                          value={integrationSettings.pos.merchantId || ''}
                          onChange={(e) => updateIntegration('pos', 'merchantId', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">{integrationSettings.pos.provider === 'Stripe' ? 'Publishable Key' : 'API Key'}</label>
                      <input
                        type="password"
                        value={integrationSettings.pos.apiKey || ''}
                        onChange={(e) => updateIntegration('pos', 'apiKey', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">{integrationSettings.pos.provider === 'Stripe' ? 'Secret Key' : 'Secret Key'}</label>
                      <input
                        type="password"
                        value={integrationSettings.pos.secretKey || ''}
                        onChange={(e) => updateIntegration('pos', 'secretKey', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    {integrationSettings.pos.provider === 'PayTR' && (
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Merchant Salt</label>
                        <input
                          type="password"
                          value={integrationSettings.pos.merchantSalt || ''}
                          onChange={(e) => updateIntegration('pos', 'merchantSalt', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end border-t border-slate-100 dark:border-slate-700 pt-4">
                    <button
                      onClick={() => handleTestConnection('pos')}
                      disabled={testStatus.pos === 'loading' || testStatus.pos === 'success'}
                      className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${testStatus.pos === 'success' ? 'bg-green-500 text-white' : 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800'
                        }`}
                    >
                      {testStatus.pos === 'loading' ? <Loader2 size={18} className="animate-spin" /> : testStatus.pos === 'success' ? <Check size={18} /> : <CreditCard size={18} />}
                      {testStatus.pos === 'success' ? 'Connected' : 'Test Connection'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && integrationSettings && integrationSettings.eInvoice && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif border-b border-slate-100 dark:border-slate-700 pb-4">{t.eInvoiceSettings}</h3>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Select Provider</label>
                <select
                  value={integrationSettings.eInvoice.provider}
                  onChange={(e) => updateIntegration('eInvoice', 'provider', e.target.value)}
                  className={inputClass}
                >
                  <option value="None">Select Provider...</option>
                  <option value="GIB">GIB Portal</option>
                  <option value="Parasut">Paraşüt</option>
                  <option value="Logo">Logo İşbaşı</option>
                  <option value="BizimHesap">Bizim Hesap</option>
                </select>
              </div>

              {integrationSettings.eInvoice.provider !== 'None' && (
                <div className="space-y-6 animate-slide-up">
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Server className="text-primary-600" size={20} />
                      <span className="font-bold text-slate-700 dark:text-slate-200">{integrationSettings.eInvoice.provider} Integration Status</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={integrationSettings.eInvoice.isActive}
                        onChange={(e) => updateIntegration('eInvoice', 'isActive', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">{t.username}</label>
                      <input
                        type="text"
                        value={integrationSettings.eInvoice.username}
                        onChange={(e) => updateIntegration('eInvoice', 'username', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">{t.password}</label>
                      <input
                        type="password"
                        value={integrationSettings.eInvoice.password}
                        onChange={(e) => updateIntegration('eInvoice', 'password', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">API Key (Optional)</label>
                      <input
                        type="password"
                        value={integrationSettings.eInvoice.apiKey}
                        onChange={(e) => updateIntegration('eInvoice', 'apiKey', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex items-center pt-6">
                      <input
                        type="checkbox"
                        checked={integrationSettings.eInvoice.testMode}
                        onChange={(e) => updateIntegration('eInvoice', 'testMode', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 mr-2"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-300">Enable Test Mode (Sandbox)</span>
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-slate-100 dark:border-slate-700 pt-4">
                    <button
                      onClick={() => handleTestConnection('eInvoice')}
                      disabled={testStatus.eInvoice === 'loading' || testStatus.eInvoice === 'success'}
                      className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${testStatus.eInvoice === 'success' ? 'bg-green-500 text-white' : 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800'
                        }`}
                    >
                      {testStatus.eInvoice === 'loading' ? <Loader2 size={18} className="animate-spin" /> : testStatus.eInvoice === 'success' ? <Check size={18} /> : <Server size={18} />}
                      {testStatus.eInvoice === 'success' ? 'Connected' : 'Test Connection'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legal & KBS Tab */}
          {activeTab === 'legal' && integrationSettings && integrationSettings.kbs && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 animate-fade-in">
              <div className="flex items-start gap-4 mb-4 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <ShieldAlert className="text-blue-600 dark:text-blue-400 mt-1" size={24} />
                <div>
                  <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300">{t.kbsSettings}</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{t.kbsDesc}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.facilityCode}</label>
                  <input
                    type="text"
                    value={integrationSettings.kbs.facilityCode}
                    onChange={(e) => updateIntegration('kbs', 'facilityCode', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.kbsPassword}</label>
                  <input
                    type="password"
                    value={integrationSettings.kbs.password}
                    onChange={(e) => updateIntegration('kbs', 'password', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Static IP (Optional)</label>
                  <input
                    type="text"
                    value={integrationSettings.kbs.ipAddress || ''}
                    onChange={(e) => updateIntegration('kbs', 'ipAddress', e.target.value)}
                    placeholder="e.g. 195.175..."
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.lawEnforcementType}</label>
                  <select className={inputClass}>
                    <option value="police">{t.police}</option>
                    <option value="jandarma">{t.gendarmerie}</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3 pt-7">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integrationSettings.kbs.autoSend}
                      onChange={(e) => updateIntegration('kbs', 'autoSend', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200">{t.autoSend}</label>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-6 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.lastKbsReport}</div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">24.10.2023 00:01</div>
                  </div>
                  <button
                    onClick={() => handleTestConnection('kbs')}
                    disabled={testStatus.kbs === 'loading' || testStatus.kbs === 'success'}
                    className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${testStatus.kbs === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900'
                      }`}
                  >
                    {testStatus.kbs === 'loading' ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : testStatus.kbs === 'success' ? (
                      <Check size={20} />
                    ) : (
                      <Lock size={20} />
                    )}
                    {testStatus.kbs === 'loading' ? 'Verifying...' : testStatus.kbs === 'success' ? t.kbsSuccess : 'Test Login'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 animate-fade-in">
              <div className="flex items-start gap-4 mb-4 bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                <Sparkles className="text-purple-600 dark:text-purple-400 mt-1" size={24} />
                <div>
                  <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300">Aura AI Management</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Configure your Gemini AI settings for smart pricing, guest reviews, and automated messaging.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="block font-bold text-slate-700 dark:text-slate-200">Use System Default API Key</span>
                        <span className="text-xs text-slate-500">Enable this to use Aura's shared Gemini quota.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isUsingDefaultKey()}
                          onChange={(e) => {
                            if (e.target.checked) resetToDefaultKey();
                            else setGeminiKey(''); // Force custom key mode
                            handleSave(); // Trigger UI refresh
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className={`space-y-2 transition-opacity ${isUsingDefaultKey() ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Your Gemini API Key</label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-slate-400">
                          <Lock size={18} />
                        </div>
                        <input
                          type="password"
                          placeholder={isUsingDefaultKey() ? getMaskedApiKey() : 'AIzaSy...'}
                          onChange={(e) => {
                            if (!isUsingDefaultKey()) setGeminiKey(e.target.value);
                          }}
                          className={inputClass + " pl-10"}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">Get your API key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">Google AI Studio</a></p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <ShieldAlert size={16} className="text-amber-500" />
                      AI Usage Tips
                    </h4>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-4">
                      <li>Automated Review Replying saves approx. 4 hours/week.</li>
                      <li>AI Pricing Strategies can increase RevPAR by 5-15% during peak season.</li>
                      <li>Keep your API key private. Default keys have shared quotas.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PropertySettings;
