
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../utils/helpers';
import {
  LayoutDashboard, CalendarRange, BedDouble, Building2, Globe, Phone,
  Sparkles, CreditCard, ChevronRight, BookOpen, ShieldCheck,
  Settings, Zap, MessageCircle, BarChart3, Star, Mail, Search
} from 'lucide-react';

interface UserGuideProps {
  language: Language;
}

const UserGuide: React.FC<UserGuideProps> = ({ language }) => {
  const t = translations[language];
  const [activeCategory, setActiveCategory] = useState<'getting-started' | 'operations' | 'revenue' | 'ai'>('getting-started');

  const categories = [
    { id: 'getting-started', label: 'Basics & Setup', icon: BookOpen },
    { id: 'operations', label: 'Operations Desk', icon: BedDouble },
    { id: 'revenue', label: 'Revenue & Sales', icon: TrendingUp }, // Note: TrendingUp might not be in the imports above
    { id: 'ai', label: 'AI Intelligence', icon: Sparkles },
  ];

  // Replacing TrendingUp if not exists in the simplified imports
  const TrendingUp = Zap;

  const guideContent = {
    'getting-started': [
      {
        title: t.step1Title || 'Step 1: Dashboard Flow',
        desc: t.step1Desc || 'Check your daily arrivals, VIP guests, and revenue snapshot. This is your command center.',
        icon: LayoutDashboard,
        color: 'bg-blue-500'
      },
      {
        title: t.step4Title || 'Step 4: Configuration',
        desc: t.step4Desc || 'Go to Settings to define your room types, pricing, and hotel policies (check-in/out times).',
        icon: Settings,
        color: 'bg-amber-500'
      }
    ],
    'operations': [
      {
        title: t.step3Title || 'Housekeeping Fix',
        desc: t.step3Desc || 'Manage room statuses (Clean, Dirty, Inspection) to coordinate with your cleaning staff in real-time.',
        icon: BedDouble,
        color: 'bg-green-500'
      },
      {
        title: 'Folio & Invoicing',
        desc: 'Issue E-Invoices and E-Archive invoices directly from the reservation panel. No 3rd party software needed.',
        icon: CreditCard,
        color: 'bg-slate-700'
      }
    ],
    'revenue': [
      {
        title: t.step2Title || 'Calendar Control',
        desc: t.step2Desc || 'Drag and drop reservations, create new bookings instantly, and manage availability across all dates.',
        icon: CalendarRange,
        color: 'bg-purple-500'
      },
      {
        title: t.step5Title || 'Channel Manager Sync',
        desc: t.step5Desc || 'Sync with Booking.com and Expedia. Prices and availability are pushed automatically when you make a change.',
        icon: Globe,
        color: 'bg-indigo-500'
      }
    ],
    'ai': [
      {
        title: 'Gemini Revenue Assistant',
        desc: 'Use AI to analyze market trends and suggest the best price for your rooms. Increase RevPAR by up to 15%.',
        icon: Zap,
        color: 'bg-purple-600'
      },
      {
        title: 'AI Guest Reviews',
        desc: 'Automate replies to guest feedback. The Gemini AI reads sentiment and drafts a professional, warm response.',
        icon: MessageCircle,
        color: 'bg-blue-600'
      }
    ]
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-12 px-4">
      <div className="mb-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="text-primary-600" size={32} />
        </div>
        <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-3 text-center">{t.guideTitle}</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-center">{t.guideDesc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation */}
        <div className="lg:col-span-1 border-r dark:border-slate-800 pr-4">
          <div className="space-y-2 sticky top-8">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeCategory === cat.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 translate-x-1'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <cat.icon size={18} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm min-h-[500px]">
            <div className="flex items-center gap-2 mb-8 text-primary-600 font-bold uppercase tracking-widest text-xs">
              <ChevronRight size={16} />
              {categories.find(c => c.id === activeCategory)?.label}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {guideContent[activeCategory].map((section, idx) => (
                <div key={idx} className="group p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-900 transition-all bg-slate-50/50 dark:bg-slate-900/30 hover:shadow-xl hover:shadow-primary-500/5">
                  <div className={`w-14 h-14 ${section.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <section.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">{section.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{section.desc}</p>
                </div>
              ))}
            </div>

            {/* Additional Tips Section */}
            <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
              <h4 className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm mb-3">
                <Zap size={16} /> Pro Tip
              </h4>
              <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed font-medium">
                Did you know? You can access Aura PMS from your smartphone. Just open your hotel's domain in your mobile browser to manage check-ins while you are on the move.
              </p>
            </div>
          </div>

          {/* Support Footer */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white p-10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 max-w-md">
              <div className="flex items-center gap-2 text-primary-400 font-bold uppercase tracking-wider text-xs mb-3">
                <ShieldCheck size={16} /> Verified Partner Support
              </div>
              <h3 className="text-2xl font-serif font-bold mb-3">Still have questions?</h3>
              <p className="text-slate-400 text-sm">Our expert hospitality team is standing by to help you optimize your hotel operations.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto">
              <a
                href="https://wa.me/905415079974"
                target="_blank"
                rel="noreferrer"
                className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-green-500 transition-all shadow-xl shadow-green-500/20"
              >
                <Phone size={20} /> WhatsApp Support
              </a>
              <button className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-bold border border-white/10 hover:bg-white/20 transition-all">
                Schedule Training
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
