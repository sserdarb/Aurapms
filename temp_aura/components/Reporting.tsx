
import React, { useMemo, useState } from 'react';
import { Currency, Language, Reservation, Room } from '../types';
import { formatCurrency, translations } from '../utils/helpers';
import { Calendar, TrendingUp, Users, DollarSign, PieChart as PieIcon, Activity, Sparkles, BarChart, LineChart, Lightbulb, Map } from 'lucide-react';
import { generateReportingInsights, ReportingInsights } from '../services/geminiService';

interface ReportingProps {
  currency: Currency;
  language: Language;
  reservations: Reservation[];
  rooms: Room[];
}

// Mock Daily Exchange Rates (Base: TRY)
const EXCHANGE_RATES: Record<string, number> = {
    'TRY': 1,
    'USD': 0.032, 
    'EUR': 0.029 
};

const Reporting: React.FC<ReportingProps> = ({ currency, language, reservations, rooms }) => {
  const t = translations[language];
  const locale = language === 'tr' ? 'tr-TR' : 'en-US';
  const [dateRange, setDateRange] = useState('last7');
  const [aiInsights, setAiInsights] = useState<ReportingInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Get current conversion rate based on selected currency
  const conversionRate = EXCHANGE_RATES[currency] || 1;

  // Metrics Calculation
  const metrics = useMemo(() => {
      const activeReservations = reservations.filter(r => r.status !== 'cancelled');
      
      const totalRevBase = activeReservations.reduce((acc, curr) => acc + curr.amount, 0);
      const totalRev = totalRevBase * conversionRate;

      const confirmed = activeReservations.length;
      const cancelled = reservations.filter(r => r.status === 'cancelled').length;
      
      const totalNights = activeReservations.reduce((acc, curr) => {
           const start = new Date(curr.checkIn);
           const end = new Date(curr.checkOut);
           const days = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 3600 * 24));
           return acc + days;
      }, 0);

      const avgDailyRate = totalNights > 0 ? totalRev / totalNights : 0;
      
      // Approximate Occupancy Rate for "Last 7 Days" context
      // Total available room nights = rooms * 7
      const capacity = rooms.length * 7;
      const occupancyRate = capacity > 0 ? Math.min(100, Math.round((totalNights / capacity) * 100)) : 0;

      return { totalRev, confirmed, cancelled, avgDailyRate, occupancyRate };
  }, [reservations, conversionRate, rooms.length]);

  // Dynamic Trend Data Calculation (Last 7 Days)
  const trendData = useMemo(() => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push(d.toISOString().split('T')[0]);
      }

      return days.map(date => {
          let dailyRevenueBase = 0;
          let occupiedRooms = 0;

          reservations.forEach(r => {
              if (r.status !== 'cancelled' && date >= r.checkIn && date < r.checkOut) {
                  const start = new Date(r.checkIn);
                  const end = new Date(r.checkOut);
                  const nights = Math.max(1, (end.getTime() - start.getTime()) / 86400000);
                  const nightlyRate = r.amount / nights;
                  
                  dailyRevenueBase += nightlyRate;
                  occupiedRooms++;
              }
          });

          const revenue = dailyRevenueBase * conversionRate;
          const adr = occupiedRooms > 0 ? revenue / occupiedRooms : 0;

          return {
              date,
              label: new Date(date).toLocaleDateString(locale, { weekday: 'short' }),
              revenue,
              adr
          };
      });
  }, [reservations, locale, conversionRate]);

  // Source Breakdown Calculation
  const sourceData = useMemo(() => {
      const counts: Record<string, number> = {
          'Booking.com': 0,
          'Direct': 0,
          'Expedia': 0,
          'Other': 0
      };
      let activeTotal = 0;

      reservations.forEach(r => {
          if (r.status !== 'cancelled') {
              const s = r.source;
              if (s === 'Booking.com' || s === 'Direct' || s === 'Expedia') {
                  counts[s]++;
              } else {
                  counts['Other']++;
              }
              activeTotal++;
          }
      });

      const getPct = (val: number) => activeTotal > 0 ? Math.round((val / activeTotal) * 100) : 0;

      return {
          sources: [
            { name: 'Booking.com', pct: getPct(counts['Booking.com']), count: counts['Booking.com'], color: '#0ea5e9' },
            { name: 'Direct', pct: getPct(counts['Direct']), count: counts['Direct'], color: '#10b981' },
            { name: 'Expedia', pct: getPct(counts['Expedia']), count: counts['Expedia'], color: '#f59e0b' },
            { name: t.other || 'Other', pct: getPct(counts['Other']), count: counts['Other'], color: '#94a3b8' }
          ],
          activeTotal
      };
  }, [reservations, t.other]);

  const handleGenerateInsights = async () => {
      setLoadingInsights(true);
      // Summarize data for AI
      const simplifiedData = trendData.map(d => ({ date: d.label, revenue: Math.round(d.revenue), adr: Math.round(d.adr) }));
      
      const insights = await generateReportingInsights(simplifiedData, metrics, language);
      setAiInsights(insights);
      setLoadingInsights(false);
  };

  const RevenueBarChart = ({ data }: { data: typeof trendData }) => {
      const maxVal = Math.max(...data.map(d => d.revenue), 100);
      return (
        <div className="h-48 flex items-end justify-between gap-2 pt-6">
            {data.map((d, i) => {
                const heightPct = (d.revenue / maxVal) * 100;
                return (
                    <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-default">
                        <div className="w-full bg-primary-100 rounded-t-sm relative h-full flex items-end">
                            <div 
                                className="w-full bg-primary-500 rounded-t-sm transition-all duration-500 group-hover:bg-primary-600 relative" 
                                style={{ height: `${Math.max(heightPct, 5)}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                                    {formatCurrency(d.revenue, currency, locale)}
                                </div>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{d.label}</span>
                    </div>
                );
            })}
        </div>
      );
  };

  const ADRLineChart = ({ data }: { data: typeof trendData }) => {
      const maxVal = Math.max(...data.map(d => d.adr), 100) * 1.2;
      const width = 100;
      const height = 100;
      const points = data.map((d, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((d.adr / maxVal) * height);
          return `${x},${y}`;
      }).join(' ');

      return (
          <div className="h-48 relative pt-6 pb-6">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <line x1="0" y1="0" x2="100" y2="0" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                  <line x1="0" y1="100" x2="100" y2="100" stroke="#e2e8f0" strokeWidth="0.5" />
                  <polyline fill="none" stroke="#d97706" strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
                  {data.map((d, i) => {
                       const x = (i / (data.length - 1)) * width;
                       const y = height - ((d.adr / maxVal) * height);
                       return (
                           <g key={i} className="group">
                               <circle cx={x} cy={y} r="3" fill="#d97706" className="group-hover:r-4 transition-all cursor-pointer" />
                           </g>
                       );
                  })}
              </svg>
              <div className="absolute inset-0 flex justify-between items-end pointer-events-none pb-6 pt-6">
                  {data.map((d, i) => (
                      <div key={i} className="flex flex-col items-center justify-end h-full relative group pointer-events-auto w-4">
                           <div className="absolute -top-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1 shadow-lg z-10">
                               {formatCurrency(d.adr, currency, locale)}
                           </div>
                           <div className="absolute -bottom-6 text-[10px] text-slate-400 uppercase font-bold">{d.label}</div>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const DonutChart = () => {
      let cumulativePct = 0;
      return (
        <div className="relative w-48 h-48 mx-auto">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                {sourceData.sources.map((source, i) => {
                    const dashArray = `${source.pct} ${100 - source.pct}`;
                    const dashOffset = -cumulativePct;
                    cumulativePct += source.pct;
                    return (
                        <circle 
                            key={i}
                            cx="18" cy="18" r="15.915" 
                            fill="transparent" 
                            stroke={source.color} 
                            strokeWidth="3" 
                            strokeDasharray={dashArray} 
                            strokeDashoffset={dashOffset}
                        ></circle>
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-slate-700">{sourceData.activeTotal}</span>
                <span className="text-[10px] text-slate-400 uppercase">{t.bookings || 'Bookings'}</span>
            </div>
        </div>
      );
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800">{t.smartReporting}</h2>
            <p className="text-slate-500 text-sm">{t.reportingDesc}</p>
          </div>
          <div className="flex items-center gap-3">
              <button 
                onClick={handleGenerateInsights}
                disabled={loadingInsights}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm font-bold hover:shadow-lg transition-all disabled:opacity-70"
              >
                  <Sparkles size={16} className={loadingInsights ? "animate-spin" : ""} />
                  {loadingInsights ? t.analyzing : t.generateAiReport}
              </button>
              <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                  {['last7', 'last30', 'thisYear'].map(range => (
                      <button 
                        key={range}
                        onClick={() => setDateRange(range)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dateRange === range ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                          {range === 'last7' ? t.last7Days : range === 'last30' ? t.last30Days : t.thisYear}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {/* AI Insights Section */}
      {aiInsights && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl animate-slide-up border border-slate-700/50">
              <div className="flex items-center gap-2 mb-6">
                  <div className="bg-white/10 p-2 rounded-lg">
                      <Sparkles className="text-yellow-400" size={20} />
                  </div>
                  <h3 className="text-lg font-bold">{t.aiExecutiveSummary}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2 text-primary-300 mb-3 font-bold text-sm uppercase tracking-wider">
                          <TrendingUp size={16} /> {t.revenueTrendAnalysis}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                          {aiInsights.revenueTrendAnalysis}
                      </p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2 text-blue-300 mb-3 font-bold text-sm uppercase tracking-wider">
                          <LineChart size={16} /> {t.demandForecast || "Demand Forecast"}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                          {aiInsights.occupancyForecast}
                      </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2 text-green-300 mb-3 font-bold text-sm uppercase tracking-wider">
                          <Lightbulb size={16} /> {t.strategicAdvice}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                          {aiInsights.strategicAdvice}
                      </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2 text-amber-300 mb-3 font-bold text-sm uppercase tracking-wider">
                          <Map size={16} /> {t.marketAnalysis}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                          {aiInsights.marketAnalysis}
                      </p>
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600"><DollarSign size={20}/></div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+12%</span>
              </div>
              <div className="text-slate-500 text-xs uppercase font-bold mb-1">{t.totalRevenue}</div>
              <div className="text-2xl font-serif font-bold text-slate-800">{formatCurrency(metrics.totalRev, currency, locale)}</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
               <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Users size={20}/></div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">+5%</span>
              </div>
              <div className="text-slate-500 text-xs uppercase font-bold mb-1">{t.adr} (Avg Rate)</div>
              <div className="text-2xl font-serif font-bold text-slate-800">{formatCurrency(metrics.avgDailyRate, currency, locale)}</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
               <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Calendar size={20}/></div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">0%</span>
              </div>
              <div className="text-slate-500 text-xs uppercase font-bold mb-1">{t.confirmedBookings}</div>
              <div className="text-2xl font-serif font-bold text-slate-800">{metrics.confirmed}</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
               <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-red-50 rounded-lg text-red-600"><TrendingUp size={20}/></div>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">-2%</span>
              </div>
              <div className="text-slate-500 text-xs uppercase font-bold mb-1">{t.cancellationRate}</div>
              <div className="text-2xl font-serif font-bold text-slate-800">
                  {metrics.confirmed > 0 ? Math.round((metrics.cancelled / (metrics.confirmed + metrics.cancelled)) * 100) : 0}%
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-primary-100 text-primary-600 rounded">
                          <DollarSign size={16} />
                      </div>
                      <h3 className="font-serif font-bold text-slate-800">{t.revenueOccupancyTrend}</h3>
                  </div>
                  <RevenueBarChart data={trendData} />
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-accent-100 text-accent-600 rounded">
                          <Activity size={16} />
                      </div>
                      <h3 className="font-serif font-bold text-slate-800">{t.adrTrend}</h3>
                  </div>
                  <ADRLineChart data={trendData} />
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-slate-100 text-slate-600 rounded">
                      <PieIcon size={16} />
                  </div>
                  <h3 className="font-serif font-bold text-slate-800">{t.bookingsBySource}</h3>
              </div>
              
              <div className="flex-1 flex flex-col justify-center items-center">
                <DonutChart />
                <div className="w-full mt-8 space-y-3">
                    {sourceData.sources.map((source) => (
                        <div key={source.name} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div> 
                                {source.name}
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-slate-700 block">{source.pct}%</span>
                                <span className="text-xs text-slate-400">({source.count})</span>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Reporting;
