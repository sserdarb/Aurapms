
import React, { useState } from 'react';
import { Globe, RefreshCw, Settings, X, Layers, DownloadCloud, CheckCircle, AlertTriangle, DollarSign, Link, Link2Off } from 'lucide-react';
import { Language, RoomType, Currency } from '../types';
import { translations } from '../utils/helpers';

const initialChannels = [
  { id: 1, name: 'Booking.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Booking.com_logo.svg', status: 'disconnected', lastSync: 'Never', commission: '15%' },
  { id: 2, name: 'Expedia', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Expedia_2024_Logo.svg', status: 'disconnected', lastSync: 'Never', commission: '18%' },
  { id: 3, name: 'Airbnb', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_Bélo.svg', status: 'disconnected', lastSync: 'Never', commission: '3%' },
  { id: 4, name: 'Hotels.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Hotels.com_Logo_2023.svg', status: 'disconnected', lastSync: 'Never', commission: '15%' },
  { id: 5, name: 'TripAdvisor', logo: 'https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_secondary_registered.svg', status: 'disconnected', lastSync: 'Never', commission: '12%' },
  { id: 6, name: 'Trivago', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Trivago_logo_2023.svg', status: 'disconnected', lastSync: 'Never', commission: 'Cost per Click' },
  { id: 7, name: 'ETS Tur', logo: 'https://img.etstur.com/banners/web/header/ets-logo.svg', status: 'disconnected', lastSync: 'Never', commission: '12%' },
  { id: 8, name: 'Odamax', logo: 'https://cdn.odamax.com/assets/img/logo.png', status: 'disconnected', lastSync: 'Never', commission: '10%' },
  { id: 9, name: 'TatilSepeti', logo: 'https://images.tatilsepeti.com/assets/img/tatilsepeti-logo.png', status: 'disconnected', lastSync: 'Never', commission: '10%' },
  { id: 10, name: 'Google Hotels', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Hotels_logo.svg', status: 'disconnected', lastSync: 'Never', commission: 'Free / Ads' },
];

interface ChannelManagerProps {
    language: Language;
    onSimulateBooking?: () => boolean;
    currency: Currency;
    setCurrency: (c: Currency) => void;
    autoSync?: boolean;
    toggleAutoSync?: (val: boolean) => void;
}

const ChannelManager: React.FC<ChannelManagerProps> = ({ language, onSimulateBooking, currency, setCurrency, autoSync, toggleAutoSync }) => {
  const [channels, setChannels] = useState(initialChannels);
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [simulationMessage, setSimulationMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotification, setSyncNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const t = translations[language];

  const handleToggleStatus = (id: number) => {
      setChannels(channels.map(c => {
          if (c.id === id) {
              return { ...c, status: c.status === 'connected' ? 'disconnected' : 'connected', lastSync: c.status === 'connected' ? 'Never' : 'Just now' };
          }
          return c;
      }));
      setSelectedChannel(null);
  };

  const handleSimulateClick = () => {
      if (onSimulateBooking) {
          const success = onSimulateBooking();
          if (success) {
              setSimulationMessage(t.incomingBookingDesc);
              setTimeout(() => setSimulationMessage(null), 4000);
          }
      }
  }

  const handleForceSync = () => {
      if (isSyncing) return;
      
      setIsSyncing(true);
      setSyncNotification(null);

      // Simulate API Latency
      setTimeout(() => {
          const isSuccess = Math.random() > 0.2;

          if (isSuccess) {
              setChannels(prev => prev.map(c => 
                  c.status === 'connected' ? { ...c, lastSync: 'Just now' } : c
              ));
              setSyncNotification({ 
                  type: 'success', 
                  message: 'Availability and rates successfully pushed to all connected channels.' 
              });
          } else {
              setSyncNotification({ 
                  type: 'error', 
                  message: 'Sync Warning: Connection timed out for Expedia API. Other channels updated.' 
              });
          }

          setIsSyncing(false);
          setTimeout(() => {
              setSyncNotification(null);
          }, 5000);

      }, 2500);
  };

  const openSettings = (id: number) => {
      setSelectedChannel(id);
  };

  const activeChannel = channels.find(c => c.id === selectedChannel);

  return (
    <div className="animate-fade-in relative pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">{t.channelManager}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t.channelDesc}</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
            {/* Auto Sync Toggle */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 mr-2 shadow-sm">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={autoSync} onChange={(e) => toggleAutoSync && toggleAutoSync(e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                </label>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.autoSync}</span>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-sm">
                <DollarSign size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.defaultCurrency || 'Currency'}:</span>
                <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                >
                    <option value="TRY">TRY (₺)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                </select>
            </div>
            <button 
                onClick={handleSimulateClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
                <DownloadCloud size={16} />
                {t.simulateBooking}
            </button>
            <button 
                onClick={handleForceSync}
                disabled={isSyncing}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium disabled:opacity-70 transition-all shadow-sm"
            >
                <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? t.syncingChannels : t.forceSync}
            </button>
        </div>
      </div>

      {/* Notifications Area */}
      <div className="space-y-4 mb-6 min-h-[60px]">
        {simulationMessage && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-xl flex items-center gap-3 animate-slide-up shadow-sm">
                <div className="bg-green-500 text-white p-2 rounded-full">
                    <DownloadCloud size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-green-800 dark:text-green-400">{t.incomingBooking}</h4>
                    <p className="text-sm text-green-600 dark:text-green-300">{simulationMessage}</p>
                </div>
            </div>
        )}

        {syncNotification && (
            <div className={`p-4 rounded-xl flex items-center gap-3 animate-slide-up shadow-sm border ${
                syncNotification.type === 'success' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
            }`}>
                <div className={`p-2 rounded-full text-white ${
                    syncNotification.type === 'success' ? 'bg-blue-500' : 'bg-amber-500'
                }`}>
                    {syncNotification.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                    <h4 className={`font-bold ${syncNotification.type === 'success' ? 'text-blue-800 dark:text-blue-400' : 'text-amber-800 dark:text-amber-400'}`}>
                        {syncNotification.type === 'success' ? 'Sync Complete' : 'Sync Issue'}
                    </h4>
                    <p className={`text-sm ${syncNotification.type === 'success' ? 'text-blue-600 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'}`}>
                        {syncNotification.message}
                    </p>
                </div>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {channels.map(channel => (
          <div key={channel.id} className={`bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-sm border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
              channel.status === 'connected' 
              ? 'border-primary-200 dark:border-primary-900/50 ring-1 ring-primary-100 dark:ring-primary-900/20' 
              : 'border-slate-100 dark:border-slate-700'
          }`}>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-20 h-16 flex-shrink-0 bg-white rounded-lg flex items-center justify-center p-2 border border-slate-100 dark:border-slate-600 overflow-hidden shadow-sm">
                 {channel.logo ? 
                   <img 
                        src={channel.logo} 
                        alt={channel.name} 
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                            // Fallback to text or generic icon if logo fails
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
                        }} 
                   /> : 
                   <Globe className="text-slate-300" />
                 }
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{channel.name}</h3>
                <div className="flex items-center gap-2 text-xs font-medium">
                   {channel.status === 'connected' ? (
                       <span className="text-green-600 dark:text-green-400 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                           <Link size={12} /> {t.liveConnection}
                       </span>
                   ) : (
                       <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                           <Link2Off size={12} /> {t.notConnected}
                       </span>
                   )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-center">
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">{t.commission}</div>
                    <div className="font-bold text-slate-700 dark:text-slate-300">{channel.commission}</div>
                </div>
                <div className="text-center min-w-[80px]">
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">{t.lastSync}</div>
                    {isSyncing && channel.status === 'connected' ? (
                        <div className="flex justify-center py-1"><RefreshCw size={14} className="animate-spin text-primary-500"/></div>
                    ) : (
                        <div className="font-bold text-slate-700 dark:text-slate-300 text-xs">{channel.lastSync}</div>
                    )}
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => openSettings(channel.id)}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title={t.configure}
                    >
                        <Settings size={20} />
                    </button>
                    <button
                        onClick={() => handleToggleStatus(channel.id)}
                        className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors relative ${channel.status === 'connected' ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-all ${channel.status === 'connected' ? 'left-5' : 'left-1'}`}></div>
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Channel Configuration Modal */}
      {selectedChannel !== null && activeChannel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
              <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] transition-colors">
                  <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                          <Settings className="text-slate-400" />
                          <div>
                              <h3 className="font-serif font-bold text-xl text-slate-800 dark:text-slate-100">{t.channelSettings} - {activeChannel.name}</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">v2.4 API Integration</p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedChannel(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"><X size={24} /></button>
                  </div>

                  <div className="p-8 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div>
                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-2">{t.hotelId} ({activeChannel.name})</label>
                              <input type="text" placeholder="e.g. 123456" className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-2">{t.apiKey}</label>
                              <input type="password" placeholder="••••••••••••••••" className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                          </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 mb-8">
                          <div className="flex items-center gap-2 mb-4">
                              <Layers className="text-primary-600 dark:text-primary-400" size={20} />
                              <h4 className="font-bold text-slate-800 dark:text-slate-200">{t.roomMapping}</h4>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t.mapRoomsDesc}</p>

                          <div className="space-y-3">
                              {Object.values(RoomType).map((room, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-1/3 truncate">
                                          {/* @ts-ignore */}
                                          {t.roomTypes[room] || room}
                                      </span>
                                      <span className="text-slate-300 dark:text-slate-600">↔</span>
                                      <select className="w-1/2 text-sm border-none bg-transparent text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer text-right">
                                          <option>{room} (Channel ID: {100 + idx})</option>
                                          <option value="0">-- Not Mapped --</option>
                                      </select>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-2xl flex justify-between items-center">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                          Status: <span className={`font-bold ${activeChannel.status === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>{activeChannel.status === 'connected' ? t.liveConnection : t.notConnected}</span>
                      </div>
                      <button 
                          onClick={() => handleToggleStatus(activeChannel.id)}
                          className={`px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all flex items-center gap-2 ${
                              activeChannel.status === 'connected' 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                      >
                          {activeChannel.status === 'connected' ? t.disconnectChannel : t.connectChannel}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default ChannelManager;
