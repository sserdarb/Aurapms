
import React, { useState, useEffect } from 'react';
import { translations } from '../utils/helpers';
import { Language, RoomType, RoomStatus, Room } from '../types';
import { Check, Loader2, Globe, MapPin, Instagram, Facebook, Layout, Bed, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  websiteUrl: string;
  onComplete: (rooms: Room[]) => void;
  language: Language;
}

const Onboarding: React.FC<OnboardingProps> = ({ websiteUrl, onComplete, language }) => {
  const t = translations[language];
  const [step, setStep] = useState(1); // 1: Scanning, 2: Review Info, 3: Room Setup
  const [progress, setProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState(t.analyzingSite);
  
  // Extracted Data State
  const [hotelData, setHotelData] = useState({
      name: 'Aura Boutique Hotel',
      description: 'Experience luxury in the heart of the Aegean.',
      address: 'Sahil Cad. No:42, Bodrum/Muğla',
      instagram: '@aurahotel',
      facebook: 'Aura Hotel Bodrum'
  });

  // Room Config State
  const [detectedRooms, setDetectedRooms] = useState([
      { type: RoomType.STANDARD, count: 10, price: 2500, capacity: 2 },
      { type: RoomType.DELUXE, count: 5, price: 3500, capacity: 3 },
      { type: RoomType.SUITE, count: 2, price: 6000, capacity: 4 },
  ]);

  // Simulation of Web Scraping
  useEffect(() => {
      if (step === 1) {
          const timer1 = setTimeout(() => { setProgress(30); setScanStatus(t.extractingData); }, 1000);
          const timer2 = setTimeout(() => { setProgress(70); setScanStatus(t.detectingRooms); }, 2500);
          const timer3 = setTimeout(() => { setProgress(100); setStep(2); }, 4000);
          return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
      }
  }, [step, t]);

  const handleRoomChange = (index: number, field: string, value: any) => {
      const newRooms = [...detectedRooms];
      // @ts-ignore
      newRooms[index][field] = value;
      setDetectedRooms(newRooms);
  };

  const handleFinish = () => {
      // Generate Room Objects
      const finalRooms: Room[] = [];
      detectedRooms.forEach(config => {
          for(let i = 1; i <= config.count; i++) {
              finalRooms.push({
                  id: `${config.type}-${i}-${Date.now()}`,
                  number: `${config.type.substring(0,1).toUpperCase()}${100 + i}`,
                  type: config.type,
                  status: RoomStatus.CLEAN,
                  floor: 1,
                  price: config.price,
                  features: ['Wifi', 'TV'], // Default
                  boardTypes: [] // Will be populated by settings defaults
              });
          }
      });
      onComplete(finalRooms);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-center">
            <div className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center font-bold">A</div>
                <h2 className="font-serif font-bold text-lg">{t.setupWizard}</h2>
            </div>
            <div className="flex gap-2">
                <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary-500' : 'bg-slate-700'}`}></div>
                <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-slate-700'}`}></div>
                <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-primary-500' : 'bg-slate-700'}`}></div>
            </div>
        </div>

        <div className="p-8 flex-1 flex flex-col">
            
            {/* Step 1: Scanning */}
            {step === 1 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                        <Globe className="absolute inset-0 m-auto text-primary-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{scanStatus}</h3>
                    <p className="text-slate-500 text-sm mb-6">{websiteUrl}</p>
                    <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            {/* Step 2: Review Info */}
            {step === 2 && (
                <div className="animate-slide-up">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Check className="text-green-500" /> {t.foundInfo}
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Hotel Name</label>
                                <input type="text" value={hotelData.name} onChange={e => setHotelData({...hotelData, name: e.target.value})} className="w-full border border-slate-200 p-2 rounded font-medium text-slate-800" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                <textarea value={hotelData.description} onChange={e => setHotelData({...hotelData, description: e.target.value})} className="w-full border border-slate-200 p-2 rounded text-sm text-slate-600" rows={3} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><MapPin size={12}/> Address</label>
                                <input type="text" value={hotelData.address} onChange={e => setHotelData({...hotelData, address: e.target.value})} className="w-full border border-slate-200 p-2 rounded text-sm text-slate-600" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2">{t.scannedSocials}</label>
                                <div className="flex gap-3">
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded border border-slate-200 text-sm">
                                        <Instagram size={16} className="text-pink-600" />
                                        {hotelData.instagram}
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded border border-slate-200 text-sm">
                                        <Facebook size={16} className="text-blue-600" />
                                        {hotelData.facebook}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end">
                        <button onClick={() => setStep(3)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                            {t.roomSetup} <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Room Setup */}
            {step === 3 && (
                <div className="animate-slide-up">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-800">{t.roomSetup}</h3>
                        <p className="text-slate-500 text-sm">{t.roomSetupDesc}</p>
                    </div>

                    <div className="space-y-4 mb-8">
                        {detectedRooms.map((room, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 shadow-sm">
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <Bed className="text-slate-500" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{room.type}</h4>
                                    <p className="text-xs text-slate-500">Detected from website</p>
                                </div>
                                <div className="flex gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t.quantity}</label>
                                        <input 
                                            type="number" 
                                            value={room.count} 
                                            onChange={(e) => handleRoomChange(idx, 'count', parseInt(e.target.value))}
                                            className="w-20 border border-slate-200 p-2 rounded text-center font-bold" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t.price} (₺)</label>
                                        <input 
                                            type="number" 
                                            value={room.price} 
                                            onChange={(e) => handleRoomChange(idx, 'price', parseInt(e.target.value))}
                                            className="w-24 border border-slate-200 p-2 rounded text-center font-bold" 
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end">
                        <button onClick={handleFinish} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary-600/20">
                            {t.finishSetup} <Check size={18} />
                        </button>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default Onboarding;
