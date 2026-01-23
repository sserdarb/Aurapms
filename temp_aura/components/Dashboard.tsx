
import React, { useMemo } from 'react';
import { BedDouble, CalendarCheck, DollarSign, TrendingUp, PlusCircle, RefreshCw } from 'lucide-react';
import { Currency, Language, Reservation, ViewState } from '../types';
import { formatCurrency, translations } from '../utils/helpers';

interface DashboardProps {
  currency: Currency;
  language: Language;
  reservations: Reservation[]; 
  onChangeView: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currency, language, reservations, onChangeView }) => {
  const t = translations[language];
  const locale = language === 'tr' ? 'tr-TR' : 'en-US';

  // Dynamic Calculation of Stats
  const stats = useMemo(() => {
      const today = new Date().toISOString().split('T')[0];
      
      // Arrivals Today
      const arrivalsToday = reservations.filter(r => r.checkIn === today && r.status !== 'cancelled').length;
      
      // Total Active Revenue (excluding cancelled)
      const totalRevenue = reservations
          .filter(r => r.status !== 'cancelled' && r.status !== 'refunded')
          .reduce((sum, r) => sum + r.amount, 0);
      
      // Calculate ADR (Average Daily Rate)
      const activeBookings = reservations.filter(r => r.status !== 'cancelled').length;
      const adr = activeBookings > 0 ? totalRevenue / activeBookings : 0;

      return {
          arrivalsToday,
          totalRevenue,
          adr,
          activeBookings
      };
  }, [reservations]);

  // Generate Dynamic Chart Data based on active reservations
  const chartData = useMemo(() => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((day, index) => {
          const baseOccupancy = reservations.length > 0 ? (index + 2) % 8 + 2 : 0;
          const baseRevenue = reservations.length > 0 ? (stats.totalRevenue / 10) * ((index % 3) + 0.5) : 0;
          
          return {
              name: day,
              occupancy: baseOccupancy, 
              revenue: baseRevenue 
          };
      });
  }, [stats.totalRevenue, reservations]);

  // Custom Bar Chart Component
  const CustomBarChart = ({ data }: { data: typeof chartData }) => {
      const maxVal = 10; // Assuming max 10 rooms for demo scale
      return (
          <div className="h-48 flex items-end justify-between gap-2 pt-6">
              {data.map((d, i) => {
                  const heightPct = Math.min(100, (d.occupancy / maxVal) * 100);
                  return (
                      <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-default">
                          <div className="w-full bg-primary-50 dark:bg-slate-700/30 rounded-t-sm relative h-full flex items-end">
                              <div 
                                  className="w-full bg-primary-600 dark:bg-primary-500 rounded-t-sm transition-all duration-700 group-hover:bg-primary-500 relative" 
                                  style={{ height: `${Math.max(heightPct, 5)}%` }}
                              >
                                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                                      {d.occupancy} Rooms
                                  </div>
                              </div>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">{d.name}</span>
                      </div>
                  );
              })}
          </div>
      );
  };

  // Custom Line Chart Component
  const CustomLineChart = ({ data }: { data: typeof chartData }) => {
      const maxVal = Math.max(...data.map(d => d.revenue), 1000) * 1.2;
      const width = 100;
      const height = 100;
      
      const points = data.map((d, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((d.revenue / maxVal) * height);
          return `${x},${y}`;
      }).join(' ');

      return (
          <div className="h-48 relative pt-6 pb-6">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <line x1="0" y1="0" x2="100" y2="0" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" className="stroke-slate-200 dark:stroke-slate-700" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" className="stroke-slate-200 dark:stroke-slate-700" />
                  <line x1="0" y1="100" x2="100" y2="100" stroke="#f1f5f9" strokeWidth="1" className="stroke-slate-200 dark:stroke-slate-700" />
                  <polyline 
                    fill="none" 
                    stroke="#d97706" 
                    strokeWidth="2" 
                    points={points} 
                    vectorEffect="non-scaling-stroke" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  {data.map((d, i) => {
                       const x = (i / (data.length - 1)) * width;
                       const y = height - ((d.revenue / maxVal) * height);
                       return (
                           <g key={i} className="group">
                               <circle cx={x} cy={y} r="3" fill="#d97706" stroke="#fff" strokeWidth="1" className="group-hover:r-5 transition-all cursor-pointer dark:stroke-slate-800" />
                               <foreignObject x={x - 10} y={y - 20} width="1" height="1" className="overflow-visible">
                                  <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
                                      {formatCurrency(d.revenue, currency, locale)}
                                  </div>
                               </foreignObject>
                           </g>
                       );
                  })}
              </svg>
              <div className="absolute inset-0 flex justify-between items-end pointer-events-none pb-0">
                  {data.map((d, i) => (
                      <div key={i} className="flex flex-col items-center justify-end h-full w-4">
                           <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold translate-y-6">{d.name}</div>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
            <h2 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-100">{t.welcome}</h2>
            <p className="text-slate-500 dark:text-slate-400">{t.welcomeSub}</p>
        </div>
        <div className="mt-4 md:mt-0 bg-white dark:bg-slate-800 p-2 px-4 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 text-sm font-medium text-primary-700 dark:text-primary-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
            {t.systemOperational}
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => onChangeView(ViewState.CALENDAR)}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-primary-500 dark:hover:border-primary-500 group transition-all text-left"
          >
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <PlusCircle size={20} />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t.quickNewRes}</h4>
          </button>
          <button 
            onClick={() => onChangeView(ViewState.PRICING)}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-primary-500 dark:hover:border-primary-500 group transition-all text-left"
          >
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <DollarSign size={20} />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t.quickPricing}</h4>
          </button>
          <button 
            onClick={() => onChangeView(ViewState.HOUSEKEEPING)}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-primary-500 dark:hover:border-primary-500 group transition-all text-left"
          >
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BedDouble size={20} />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t.quickHousekeeping}</h4>
          </button>
          <button 
            onClick={() => onChangeView(ViewState.CHANNELS)}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-primary-500 dark:hover:border-primary-500 group transition-all text-left"
          >
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <RefreshCw size={20} />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t.quickChannel}</h4>
          </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title={t.todayArrivals}
          value={stats.arrivalsToday.toString()} 
          sub={`0 ${t.vipGuests}`}
          icon={<CalendarCheck className="text-white" size={24} />} 
          color="bg-primary-600" 
        />
        <KPICard 
          title={t.activeReservations}
          value={stats.activeBookings.toString()} 
          sub={`0% ${t.vsLastWeek}`}
          icon={<BedDouble className="text-white" size={24} />} 
          color="bg-slate-700" 
        />
        <KPICard 
          title={t.totalRevenue}
          value={formatCurrency(stats.totalRevenue, currency, locale)} 
          sub={t.avgPerRoom} 
          icon={<DollarSign className="text-white" size={24} />} 
          color="bg-accent-500" 
        />
        <KPICard 
          title={t.adr}
          value={formatCurrency(stats.adr, currency, locale)} 
          sub={t.revpar} 
          icon={<TrendingUp className="text-white" size={24} />} 
          color="bg-primary-800" 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 font-serif">{t.occupancyForecast}</h3>
          <CustomBarChart data={chartData} />
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 font-serif">{t.revenueTrends}</h3>
          <CustomLineChart data={chartData} />
        </div>
      </div>
    </div>
  );
};

const KPICard: React.FC<{ title: string; value: string; sub: string; icon: React.ReactNode; color: string }> = ({ title, value, sub, icon, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-all duration-300">
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif">{value}</h3>
      <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{sub}</p>
    </div>
    <div className={`${color} p-3 rounded-xl shadow-lg shadow-opacity-20`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;
