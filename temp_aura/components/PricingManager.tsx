
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Room, RoomType, Competitor, Language, DailyRate, Currency, PriceChangeLog } from '../types';
import { translations, formatCurrency } from '../utils/helpers';
import { generatePricingStrategy } from '../services/geminiService';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Save, Plus, X, BarChart2, Zap, RefreshCw, Globe, ArrowRight, Lock, Unlock, Percent, Clock, Activity, History, User, Sparkles, Layers, DollarSign, List, Filter, Ban, CalendarDays, CheckSquare, LogIn, LogOut, MoreHorizontal } from 'lucide-react';

interface PricingManagerProps {
    rooms: Room[];
    onUpdateRooms: (rooms: Room[]) => void;
    language: Language;
    currency: Currency;
    autoSync?: boolean;
}

const initialCompetitors: Competitor[] = [
    { id: '1', name: 'Sunset Boutique', website: '', avgPriceOffset: 10 }, 
    { id: '2', name: 'Blue Wave Resort', website: '', avgPriceOffset: -15 }, 
];

const PricingManager: React.FC<PricingManagerProps> = ({ rooms, onUpdateRooms, language, currency, autoSync = true }) => {
    const t = translations[language];
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    
    const [activeTab, setActiveTab] = useState<'calendar' | 'competitors' | 'history'>('calendar');
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMsg, setSyncMsg] = useState('');
    const [competitors, setCompetitors] = useState(initialCompetitors);
    const [selectedRoomType, setSelectedRoomType] = useState<RoomType>(RoomType.STANDARD);
    const [history, setHistory] = useState<PriceChangeLog[]>([]); // Local log state
    
    // AI Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiStrategy, setAiStrategy] = useState<{action: string, pct: number, reason: string} | null>(null);

    // Context Menu
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, date: string } | null>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);

    // Bulk Update State
    const [showBulk, setShowBulk] = useState(false);
    const [bulkStart, setBulkStart] = useState(new Date().toISOString().split('T')[0]);
    const [bulkEnd, setBulkEnd] = useState(new Date(Date.now() + 30*86400000).toISOString().split('T')[0]);
    
    // Bulk Fields
    const [bulkPrice, setBulkPrice] = useState<number|''>('');
    const [bulkOnlinePrice, setBulkOnlinePrice] = useState<number|''>('');
    const [bulkAgencyPrice, setBulkAgencyPrice] = useState<number|''>('');
    const [bulkInv, setBulkInv] = useState<number|''>('');
    const [bulkStop, setBulkStop] = useState<'true'|'false'|''>('');
    
    // New Restriction Fields
    const [bulkMinStay, setBulkMinStay] = useState<number|''>('');
    const [bulkClosedArr, setBulkClosedArr] = useState<'true'|'false'|''>('');
    const [bulkClosedDep, setBulkClosedDep] = useState<'true'|'false'|''>('');

    // Day of Week Selector (0=Sun, 1=Mon ... 6=Sat)
    const [selectedDays, setSelectedDays] = useState<boolean[]>([true, true, true, true, true, true, true]);
    
    // Enhanced Input Style: Explicit Light/Dark mode colors + Stylish Border/Shadow
    const inputClass = "w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm font-medium";

    const dayLabels = useMemo(() => {
        const days = [];
        for(let i=0; i<7; i++) {
            // Create a date that is definitely Sunday, Monday, etc.
            // Jan 5 2025 is Sunday.
            const d = new Date(2025, 0, 5 + i); 
            days.push(d.toLocaleDateString(locale, { weekday: 'short' }));
        }
        return days;
    }, [locale]);

    // Logic
    const dates = useMemo(() => Array.from({length: 14}, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() + i); return d.toISOString().split('T')[0];
    }), []);

    const getRate = (type: RoomType, date: string): DailyRate => {
        const room = rooms.find(r => r.type === type);
        return room?.dailyRates?.[date] || { 
            date, 
            price: room?.price || 0, 
            inventory: 5, 
            stopSale: false,
            onlinePrice: room?.price || 0,
            agencyPrice: room?.price ? room.price * 0.85 : 0,
            minStay: 1,
            closedForArrival: false,
            closedForDeparture: false
        };
    };

    const logChange = (type: RoomType, date: string, oldPrice: number, newPrice: number, action: string) => {
        if (oldPrice === newPrice) return;
        const newLog: PriceChangeLog = {
            id: Date.now().toString() + Math.random(),
            date: new Date().toISOString(),
            roomType: type,
            targetDate: date,
            oldPrice,
            newPrice,
            action,
            user: 'Manager', 
            timestamp: new Date().toLocaleTimeString()
        };
        setHistory(prev => [newLog, ...prev]);
    };

    // Helper to generate date range array
    const getDatesInRange = (startDate: string, endDate: string) => {
        const dateArray = [];
        const current = new Date(startDate);
        const end = new Date(endDate);
        while (current <= end) {
            dateArray.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }
        return dateArray;
    };

    const updateRates = (updateFn: (rate: DailyRate) => DailyRate, targetDates: string[], actionName: string = 'Manual Update') => {
        const newRooms = rooms.map(r => {
            if (r.type === selectedRoomType) {
                const newRates = { ...(r.dailyRates || {}) };
                
                targetDates.forEach(d => {
                    // Use getRate to ensure we have a base object if it doesn't exist in the map yet
                    const existing = newRates[d] || getRate(r.type, d);
                    const updated = updateFn(existing);
                    
                    if (updated.price !== existing.price) {
                        logChange(r.type, d, existing.price, updated.price, actionName);
                    }

                    newRates[d] = updated;
                });
                return { ...r, dailyRates: newRates };
            }
            return r;
        });
        onUpdateRooms(newRooms);
        
        if (autoSync) {
            setIsSyncing(true);
            setSyncMsg(t.syncingChannels);
            setTimeout(() => { setIsSyncing(false); setSyncMsg(t.syncedSuccessfully); setTimeout(() => setSyncMsg(''), 2000); }, 1000);
        }
    };

    const toggleDay = (index: number) => {
        const newDays = [...selectedDays];
        newDays[index] = !newDays[index];
        setSelectedDays(newDays);
    };

    const handleBulkApply = () => {
        let targetDates = getDatesInRange(bulkStart, bulkEnd);
        
        // Filter by days of week
        targetDates = targetDates.filter(date => {
            const dayIndex = new Date(date).getDay();
            return selectedDays[dayIndex];
        });

        if (targetDates.length === 0) {
            alert("No dates selected. Check your date range and day filters.");
            return;
        }
        
        updateRates(rate => ({
            ...rate,
            price: bulkPrice !== '' ? Number(bulkPrice) : rate.price,
            onlinePrice: bulkOnlinePrice !== '' ? Number(bulkOnlinePrice) : rate.onlinePrice,
            agencyPrice: bulkAgencyPrice !== '' ? Number(bulkAgencyPrice) : rate.agencyPrice,
            inventory: bulkInv !== '' ? Number(bulkInv) : rate.inventory,
            stopSale: bulkStop !== '' ? bulkStop === 'true' : rate.stopSale,
            minStay: bulkMinStay !== '' ? Number(bulkMinStay) : (rate.minStay || 1),
            closedForArrival: bulkClosedArr !== '' ? bulkClosedArr === 'true' : (rate.closedForArrival || false),
            closedForDeparture: bulkClosedDep !== '' ? bulkClosedDep === 'true' : (rate.closedForDeparture || false),
        }), targetDates, 'Bulk Update');
        
        setShowBulk(false);
        
        // Reset form
        setBulkPrice('');
        setBulkOnlinePrice('');
        setBulkAgencyPrice('');
        setBulkInv('');
        setBulkStop('');
        setBulkMinStay('');
        setBulkClosedArr('');
        setBulkClosedDep('');
    };

    // Real Gemini Integration
    const handleAiAnalysis = async () => {
        setIsAnalyzing(true);
        
        // Calculate simple occupancy mock for next 7 days
        const occupancy = Math.floor(Math.random() * 100); 
        
        // Get current room base price
        const currentRoom = rooms.find(r => r.type === selectedRoomType);
        const basePrice = currentRoom ? currentRoom.price : 0;

        // Competitor avg mock
        const compAvg = basePrice * (1 + (Math.random() * 0.4 - 0.2)); 

        try {
            const strategy = await generatePricingStrategy(selectedRoomType, basePrice, occupancy, compAvg, language);
            setAiStrategy({
                action: strategy.suggestedAction,
                pct: strategy.percentage,
                reason: strategy.reasoning
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const applyStrategy = () => {
        if (!aiStrategy) return;
        const multiplier = aiStrategy.action === 'raise' 
            ? (1 + aiStrategy.pct / 100) 
            : aiStrategy.action === 'lower' 
                ? (1 - aiStrategy.pct / 100) 
                : 1;
        
        const endDate = new Date(); endDate.setDate(endDate.getDate() + 7);
        const endStr = endDate.toISOString().split('T')[0];
        const targetDates = getDatesInRange(new Date().toISOString().split('T')[0], endStr);
        
        updateRates(rate => ({ 
            ...rate, 
            price: Math.round(rate.price * multiplier),
            onlinePrice: Math.round((rate.onlinePrice || rate.price) * multiplier),
            agencyPrice: Math.round((rate.agencyPrice || rate.price * 0.85) * multiplier)
        }), targetDates, `AI Smart Strategy (${aiStrategy.action})`);
        
        setAiStrategy(null); // Clear after apply
    };

    const handleContextAction = (action: string, value?: any) => {
        if (!contextMenu) return;
        const { date } = contextMenu;

        if (action === 'stopSale') {
            updateRates(r => ({ ...r, stopSale: value }), [date], 'Quick Action');
        } else if (action === 'price_inc') {
            const current = getRate(selectedRoomType, date);
            updateRates(r => ({ ...r, price: Math.ceil(r.price * 1.1) }), [date], 'Quick +10%');
        } else if (action === 'price_dec') {
            const current = getRate(selectedRoomType, date);
            updateRates(r => ({ ...r, price: Math.floor(r.price * 0.9) }), [date], 'Quick -10%');
        } else if (action === 'minStay') {
            updateRates(r => ({ ...r, minStay: value }), [date], 'Quick MinStay');
        }

        setContextMenu(null);
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) setContextMenu(null);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="animate-fade-in space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">{t.pricingTitle}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{t.pricingDesc}</p>
                </div>
                {isSyncing && <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm flex items-center gap-2" title="Changes are being pushed to OTAs"><RefreshCw size={14} className="animate-spin"/> {t.syncingChannels}</div>}
                {syncMsg && !isSyncing && <div className="bg-green-600 text-white px-4 py-1 rounded-full text-sm flex items-center gap-2"><CheckCircle size={14}/> {syncMsg}</div>}
            </div>

            {/* AI Revenue Manager Section */}
            <div className="bg-gradient-to-r from-primary-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-primary-300 font-bold text-sm uppercase tracking-wider">
                            <Sparkles size={16} /> Gemini Revenue Intelligence
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{t.smartSuggestions}</h3>
                        <p className="text-primary-200 text-sm max-w-lg">
                            {t.pricingDesc}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        {!aiStrategy ? (
                            <button 
                                onClick={handleAiAnalysis}
                                disabled={isAnalyzing}
                                className="bg-white text-primary-900 px-6 py-3 rounded-xl font-bold hover:bg-primary-50 transition-colors flex items-center gap-2 disabled:opacity-70"
                                title="Click to analyze market trends and get pricing suggestions"
                            >
                                {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Zap />}
                                {isAnalyzing ? t.analyzingMarket : t.generateStrategy}
                            </button>
                        ) : (
                            <div className="bg-white/10 backdrop-blur border border-white/20 p-4 rounded-xl min-w-[300px] animate-slide-up">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                        aiStrategy.action === 'raise' ? 'bg-green-500' : aiStrategy.action === 'lower' ? 'bg-red-500' : 'bg-slate-500'
                                    }`}>
                                        {aiStrategy.action} Rates
                                    </span>
                                    <button onClick={() => setAiStrategy(null)} title="Dismiss Suggestion"><X size={16} className="text-white/50 hover:text-white"/></button>
                                </div>
                                <p className="text-sm font-medium mb-3">{aiStrategy.reason}</p>
                                <button onClick={applyStrategy} className="w-full bg-white text-primary-900 py-2 rounded-lg font-bold text-sm hover:bg-primary-50" title="Apply this suggested pricing strategy">
                                    {t.applyAdjustment} ({aiStrategy.pct > 0 ? `${aiStrategy.pct}%` : ''})
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Table Area */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={() => setActiveTab('calendar')} title="View Pricing Calendar" className={`flex-1 md:flex-none px-4 py-1.5 rounded text-xs font-bold ${activeTab==='calendar' ? 'bg-slate-800 text-white dark:bg-primary-600' : 'text-slate-500 bg-white dark:bg-slate-700 dark:text-slate-300'}`}>{t.calendar}</button>
                        <button onClick={() => setActiveTab('history')} title="View Price Change History" className={`flex-1 md:flex-none px-4 py-1.5 rounded text-xs font-bold ${activeTab==='history' ? 'bg-slate-800 text-white dark:bg-primary-600' : 'text-slate-500 bg-white dark:bg-slate-700 dark:text-slate-300'}`}>{t.history}</button>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        <select 
                            value={selectedRoomType} 
                            onChange={(e)=>setSelectedRoomType(e.target.value as RoomType)} 
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-xs font-bold outline-none text-slate-800 dark:text-white shadow-sm cursor-pointer w-full md:w-auto"
                            title="Select Room Type to Edit"
                        >
                            {Object.values(RoomType).map(rt => <option key={rt} value={rt}>{t.roomTypes[rt] || rt}</option>)}
                        </select>
                        <button 
                            onClick={() => setShowBulk(true)} 
                            className="bg-primary-600 text-white border border-primary-700 px-4 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary-700 shadow-sm transition-all w-full md:w-auto"
                            title="Update multiple dates at once"
                        >
                            <Layers size={14}/> {t.bulkUpdate}
                        </button>
                    </div>
                </div>

                {activeTab === 'calendar' && (
                    <div className="overflow-x-auto min-h-[500px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] uppercase text-slate-600 dark:text-slate-400 font-bold">
                                <tr>
                                    <th className="p-3 border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10 min-w-[100px]" title="Tarih">{t.date}</th>
                                    <th className="p-3 min-w-[120px]" title="Resepsiyon / Kapı satış fiyatı">{t.basePrice}</th>
                                    <th className="p-3 min-w-[100px]" title="Online kanallara (Booking, Expedia) giden fiyat">{t.onlinePrice}</th>
                                    <th className="p-3 min-w-[100px]" title="Acentelere sunulan net fiyat">{t.agencyPrice}</th>
                                    <th className="p-3 min-w-[80px] text-center" title="Satılabilir oda sayısı">{t.inventoryUpdate}</th>
                                    <th className="p-3 min-w-[80px] text-center" title="Odayı satışa kapat/aç">{t.stopSale}</th>
                                    <th className="p-3 min-w-[80px] text-center" title="Minimum konaklama süresi">{t.minStay}</th>
                                    <th className="p-3 min-w-[120px]" title="Giriş/Çıkış kısıtlamaları">{t.restrictions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                                {dates.map(date => {
                                    const rate = getRate(selectedRoomType, date);
                                    const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
                                    
                                    return (
                                        <tr 
                                            key={date} 
                                            onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, date }); }}
                                            className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150 ${isWeekend ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-400' : ''}`}
                                        >
                                            <td className="p-3 border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-inherit font-medium text-slate-700 dark:text-slate-200 z-10" title={date}>
                                                <div className="flex flex-col">
                                                    <span>{new Date(date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>
                                                    <span className={`text-[10px] uppercase ${isWeekend ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}`}>
                                                        {new Date(date).toLocaleDateString(locale, { weekday: 'short' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="relative w-full group">
                                                    <span className="absolute left-2 top-1.5 text-slate-400 text-[10px] pointer-events-none">{currency}</span>
                                                    <input 
                                                        type="number" 
                                                        value={rate.price} 
                                                        onChange={(e) => updateRates(r => ({...r, price: Number(e.target.value)}), [date])}
                                                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md px-2 pl-7 py-1.5 text-right font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none shadow-sm transition-all"
                                                        title={`Change Base Price for ${date}`}
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <input 
                                                    type="number" 
                                                    value={rate.onlinePrice} 
                                                    onChange={(e) => updateRates(r => ({...r, onlinePrice: Number(e.target.value)}), [date])}
                                                    className="w-20 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1.5 text-right text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none shadow-sm transition-all"
                                                    title={`Change Online Price for ${date}`}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input 
                                                    type="number" 
                                                    value={rate.agencyPrice} 
                                                    onChange={(e) => updateRates(r => ({...r, agencyPrice: Number(e.target.value)}), [date])}
                                                    className="w-20 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1.5 text-right text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none shadow-sm transition-all"
                                                    title={`Change Agency Price for ${date}`}
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <input 
                                                    type="number" 
                                                    value={rate.inventory} 
                                                    onChange={(e) => updateRates(r => ({...r, inventory: Number(e.target.value)}), [date])}
                                                    className="w-16 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1.5 text-center font-medium text-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none shadow-sm transition-all"
                                                    title={`Update Inventory for ${date}`}
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <button 
                                                    onClick={() => updateRates(r => ({...r, stopSale: !r.stopSale}), [date])}
                                                    className={`p-1.5 rounded transition-colors border border-transparent hover:border-slate-300 ${rate.stopSale ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'}`}
                                                    title={rate.stopSale ? "Click to Open Sale" : "Click to Stop Sale"}
                                                >
                                                    {rate.stopSale ? <Ban size={16}/> : <CheckCircle size={16}/>}
                                                </button>
                                            </td>
                                            <td className="p-3 text-center">
                                                 <input 
                                                    type="number" 
                                                    min="1"
                                                    value={rate.minStay || 1} 
                                                    onChange={(e) => updateRates(r => ({...r, minStay: Number(e.target.value)}), [date])}
                                                    className="w-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md px-1 py-1.5 text-center text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none shadow-sm transition-all"
                                                    title={`Set Minimum Stay for ${date}`}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        title={rate.closedForArrival ? "Girişe Kapalı (Aktif)" : "Girişe Açık"}
                                                        onClick={() => updateRates(r => ({...r, closedForArrival: !r.closedForArrival}), [date])}
                                                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-all flex items-center gap-1 ${rate.closedForArrival ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400' : 'bg-slate-50 border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 hover:border-primary-400 hover:text-primary-600'}`}
                                                    >
                                                        {rate.closedForArrival ? <LogIn size={10}/> : null} CTA
                                                    </button>
                                                    <button 
                                                        title={rate.closedForDeparture ? "Çıkışa Kapalı (Aktif)" : "Çıkışa Açık"}
                                                        onClick={() => updateRates(r => ({...r, closedForDeparture: !r.closedForDeparture}), [date])}
                                                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-all flex items-center gap-1 ${rate.closedForDeparture ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400' : 'bg-slate-50 border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 hover:border-primary-400 hover:text-primary-600'}`}
                                                    >
                                                        {rate.closedForDeparture ? <LogOut size={10}/> : null} CTD
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="max-h-[600px] overflow-y-auto p-4">
                        <table className="w-full text-left">
                            <thead className="text-xs uppercase text-slate-500 bg-slate-50 dark:bg-slate-900 dark:text-slate-400">
                                <tr>
                                    <th className="p-3">{t.changeDate}</th>
                                    <th className="p-3">{t.targetDate}</th>
                                    <th className="p-3">{t.user}</th>
                                    <th className="p-3">Action</th>
                                    <th className="p-3 text-right">{t.oldVal}</th>
                                    <th className="p-3 text-right">{t.newVal}</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
                                {history.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="p-3 text-xs text-slate-500 dark:text-slate-400">{new Date(log.date).toLocaleString()}</td>
                                        <td className="p-3 font-medium dark:text-slate-200">{log.targetDate}</td>
                                        <td className="p-3 dark:text-slate-300">{log.user}</td>
                                        <td className="p-3">
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold">{log.action}</span>
                                        </td>
                                        <td className="p-3 text-right text-red-500 line-through text-xs">{formatCurrency(log.oldPrice, currency, locale)}</td>
                                        <td className="p-3 text-right text-green-600 font-bold">{formatCurrency(log.newPrice, currency, locale)}</td>
                                    </tr>
                                ))}
                                {history.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400">No history records found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div 
                    ref={contextMenuRef}
                    className="fixed z-50 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-lg w-56 animate-fade-in overflow-hidden"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2 border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">
                        Actions for {new Date(contextMenu.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="p-1 space-y-0.5">
                        <button 
                            onClick={() => handleContextAction('stopSale', true)} 
                            className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md transition-colors font-medium"
                        >
                            <Ban size={14} /> Stop Sale (Close)
                        </button>
                        <button 
                            onClick={() => handleContextAction('stopSale', false)} 
                            className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md transition-colors font-medium"
                        >
                            <CheckCircle size={14} /> Open Sale
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                        <button 
                            onClick={() => handleContextAction('price_inc')} 
                            className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md transition-colors font-medium"
                        >
                            <TrendingUp size={14} /> Increase Price (+10%)
                        </button>
                        <button 
                            onClick={() => handleContextAction('price_dec')} 
                            className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-md transition-colors font-medium"
                        >
                            <TrendingDown size={14} /> Decrease Price (-10%)
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                        <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase">Min Stay</div>
                        <div className="flex gap-1 px-2 pb-1">
                            {[1, 2, 3, 5].map(n => (
                                <button 
                                    key={n}
                                    onClick={() => handleContextAction('minStay', n)}
                                    className="flex-1 bg-slate-50 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 py-1.5 rounded text-xs font-bold border border-slate-200 dark:border-slate-600"
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Update Modal */}
            {showBulk && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                            <div>
                                <h3 className="font-serif font-bold text-xl text-slate-800 dark:text-slate-100">{t.bulkUpdate}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t.applyChangesTo} {t.roomTypes[selectedRoomType] || selectedRoomType}</p>
                            </div>
                            <button onClick={() => setShowBulk(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400"><X size={20} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Col: Dates & Days */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-2">
                                        <CalendarDays size={14}/> {t.dateRange}
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 block mb-1">{t.start}</label>
                                            <input type="date" value={bulkStart} onChange={e => setBulkStart(e.target.value)} className={inputClass} title="Start Date" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 block mb-1">{t.end}</label>
                                            <input type="date" value={bulkEnd} onChange={e => setBulkEnd(e.target.value)} className={inputClass} title="End Date" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-2">
                                        <Filter size={14}/> {t.applyOnDays}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {dayLabels.map((day, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => toggleDay(i)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                                    selectedDays[i] 
                                                    ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-600 dark:border-primary-600' 
                                                    : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                                                }`}
                                                title={`Toggle ${day}`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => setSelectedDays(Array(7).fill(true))} className="text-[10px] text-primary-600 hover:underline font-bold">{t.selectAll}</button>
                                        <button onClick={() => setSelectedDays([false, true, true, true, true, true, false])} className="text-[10px] text-primary-600 hover:underline font-bold">{t.weekdaysOnly}</button>
                                        <button onClick={() => setSelectedDays([true, false, false, false, false, false, true])} className="text-[10px] text-primary-600 hover:underline font-bold">{t.weekendsOnly}</button>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-lg">
                                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                        {t.bulkNote}
                                    </p>
                                </div>
                            </div>

                            {/* Right Col: Values */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                                        <DollarSign size={16}/> {t.pricing}
                                    </h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">{t.basePrice}</label>
                                            <input type="number" placeholder={t.noChange} value={bulkPrice} onChange={e => setBulkPrice(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} title="Set New Base Price"/>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">{t.online}</label>
                                            <input type="number" placeholder={t.noChange} value={bulkOnlinePrice} onChange={e => setBulkOnlinePrice(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} title="Set New Online Price"/>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">{t.agency}</label>
                                            <input type="number" placeholder={t.noChange} value={bulkAgencyPrice} onChange={e => setBulkAgencyPrice(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} title="Set New Agency Price"/>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                                        <Layers size={16}/> {t.inventory}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">{t.stock}</label>
                                            <input type="number" placeholder={t.noChange} value={bulkInv} onChange={e => setBulkInv(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} title="Set Inventory Count"/>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">{t.stopSale}</label>
                                            <select value={bulkStop} onChange={e => setBulkStop(e.target.value as any)} className={inputClass} title="Update Stop Sale Status">
                                                <option value="">{t.noChange}</option>
                                                <option value="true">{t.stopSale} ({t.closed})</option>
                                                <option value="false">{t.openSale}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                                        <Lock size={16}/> {t.restrictions}
                                    </h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">{t.minStay}</label>
                                            <input type="number" placeholder={t.noChange} value={bulkMinStay} onChange={e => setBulkMinStay(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} title="Set Minimum Stay"/>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">{t.closedArrival}</label>
                                            <select value={bulkClosedArr} onChange={e => setBulkClosedArr(e.target.value as any)} className={inputClass} title="Closed to Arrival">
                                                <option value="">{t.noChange}</option>
                                                <option value="true">{t.closed}</option>
                                                <option value="false">{t.open}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">{t.closedDepart}</label>
                                            <select value={bulkClosedDep} onChange={e => setBulkClosedDep(e.target.value as any)} className={inputClass} title="Closed to Departure">
                                                <option value="">{t.noChange}</option>
                                                <option value="true">{t.closed}</option>
                                                <option value="false">{t.open}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4 border-t border-slate-100 dark:border-slate-700 pt-6">
                            <button onClick={() => setShowBulk(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">{t.cancel}</button>
                            <button onClick={handleBulkApply} className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 shadow-lg">{t.applyUpdates}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PricingManager;
