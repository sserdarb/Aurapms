import React from 'react';
import { ViewState, Language, User } from '../types';
import { LayoutDashboard, CalendarRange, BedDouble, Globe, MessageSquare, CreditCard, LogOut, Building2, BookOpen, FileText, BarChart3, ShieldAlert, LayoutTemplate, MessageCircle, Phone, TrendingUp, Moon, Sun } from 'lucide-react';
import { translations } from '../utils/helpers';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  language: Language;
  setLanguage?: (lang: Language) => void;
  onLogout: () => void;
  isImpersonating?: boolean;
  onBackToAdmin?: () => void;
  user?: User | null;
  darkMode?: boolean;
  toggleTheme?: () => void;
  unreadCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, language, setLanguage, onLogout, isImpersonating, onBackToAdmin, user, darkMode, toggleTheme, unreadCount = 0 }) => {
  const t = translations[language];

  const menuItems = [
    { id: ViewState.DASHBOARD, label: t.dashboard, icon: LayoutDashboard },
    { id: ViewState.CALENDAR, label: t.calendar, icon: CalendarRange },
    { id: ViewState.HOUSEKEEPING, label: t.housekeeping, icon: BedDouble },
    { id: ViewState.CHANNELS, label: t.channels, icon: Globe },
    { id: ViewState.PRICING, label: t.pricing || 'Pricing & Revenue', icon: TrendingUp },
    { id: ViewState.MESSAGES, label: t.messages || 'Messages', icon: MessageCircle },
    { id: ViewState.REVIEWS, label: t.reviews, icon: MessageSquare },
    { id: ViewState.BOOKING_ENGINE, label: t.bookingEngine, icon: CreditCard },
    { id: ViewState.WEBSITE_BUILDER, label: t.websiteBuilder || 'Website Management', icon: LayoutTemplate },
    { id: ViewState.REPORTING, label: t.reporting || 'Reporting', icon: BarChart3 },
    { id: ViewState.INVOICES, label: t.invoices || 'Invoices', icon: FileText },
    { id: ViewState.SETTINGS, label: t.settings, icon: Building2 },
    { id: ViewState.GUIDE, label: t.guide, icon: BookOpen },
  ];

  // Calculate credit percentage
  const creditsUsed = user?.creditsUsed || 0;
  const creditLimit = user?.creditLimit || 1000;
  const creditPct = Math.min(100, (creditsUsed / creditLimit) * 100);
  const isLowCredits = creditPct > 90;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-20 shadow-2xl transition-colors duration-300">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-900 rounded-lg flex items-center justify-center font-serif font-bold text-xl shadow-lg text-white">A</div>
             <span className="font-serif font-bold text-xl tracking-wide text-slate-800 dark:text-slate-100">AURA</span>
        </div>
        <p className="text-[10px] text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] font-medium pl-1">Boutique Collection</p>
      </div>
      
      {isImpersonating && (
          <div className="px-4 mb-2">
              <button onClick={onBackToAdmin} className="w-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors animate-pulse">
                  <ShieldAlert size={14} /> Back to Super Admin
              </button>
          </div>
      )}

      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1 hide-scrollbar">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              currentView === item.id 
                ? 'bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700/50' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <item.icon size={18} className={currentView === item.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'} />
            {item.label}
            {item.id === ViewState.MESSAGES && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">{unreadCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
         
         {/* Theme & Language */}
         <div className="flex items-center gap-2 mb-4 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
             {toggleTheme && (
                 <button 
                    onClick={toggleTheme}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                    title={darkMode ? t.lightMode : t.darkMode}
                 >
                     {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                 </button>
             )}
             <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
             <Globe size={16} className="text-slate-400" />
             <select 
                value={language}
                onChange={(e) => setLanguage && setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-medium text-slate-600 dark:text-slate-300 outline-none w-full cursor-pointer"
             >
                 <option value="tr">Türkçe</option>
                 <option value="en">English</option>
                 <option value="de">Deutsch</option>
                 <option value="ru">Русский</option>
                 <option value="sv">Svenska</option>
             </select>
         </div>

         {/* Credit Usage */}
         {user && user.role !== 'MASTER_ADMIN' && (
             <div className="mb-4">
                 <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 dark:text-slate-500 mb-1">
                     <span>Credits</span>
                     <span className={isLowCredits ? 'text-red-500 dark:text-red-400' : 'text-primary-600 dark:text-primary-400'}>{creditsUsed}/{creditLimit}</span>
                 </div>
                 <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                     <div 
                        className={`h-full rounded-full ${isLowCredits ? 'bg-red-500' : 'bg-primary-600'}`} 
                        style={{ width: `${creditPct}%` }}
                     ></div>
                 </div>
             </div>
         )}

         <a 
            href="https://wa.me/905415079974" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-green-600 dark:text-green-500 hover:text-green-500 dark:hover:text-green-400 mb-3 justify-center font-medium transition-colors"
         >
             <Phone size={14} /> {t.whatsappSupport}
         </a>

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 py-2.5 rounded-lg transition-all text-sm font-medium border border-slate-200 dark:border-slate-700 group"
        >
          <LogOut size={16} className="group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
          {t.logout}
        </button>
        
        <div className="text-[10px] text-slate-400 dark:text-slate-700 text-center mt-2 font-medium">
            {t.copyright}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;