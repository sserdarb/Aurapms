import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../utils/helpers';
import { ArrowRight, Star, Zap, Globe, TrendingUp, CheckCircle, Layout, Lock, BarChart3, ChevronDown, Monitor, ShieldCheck, MessageSquare, CalendarRange } from 'lucide-react';

interface LandingPageProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    onLoginClick: () => void;
    onRegisterClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ language, setLanguage, onLoginClick, onRegisterClick }) => {
    const t = translations[language];
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans overflow-x-hidden relative">
            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[80px]"></div>
            </div>

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0f172a]/90 backdrop-blur-md py-4 border-b border-white/5 shadow-lg' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-indigo-500 rounded-xl flex items-center justify-center font-serif font-bold text-xl text-white shadow-glow">
                            A
                        </div>
                        <span className="font-serif font-bold text-2xl tracking-wide text-white">AURA</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Özellikler</a>
                        <a href="#benefits" onClick={(e) => handleNavClick(e, 'benefits')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Avantajlar</a>
                        <a href="#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Yorumlar</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value as Language)}
                            className="bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none cursor-pointer hover:border-white/30 transition-colors"
                        >
                            <option value="tr">TR</option>
                            <option value="en">EN</option>
                        </select>
                        <button onClick={onLoginClick} className="text-sm font-bold text-white hover:text-teal-400 transition-colors hidden sm:block">
                            {t.lpCtaLogin}
                        </button>
                        <button onClick={onRegisterClick} className="bg-white text-[#0f172a] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-teal-50 transition-all hover:scale-105 shadow-lg">
                            {t.lpCtaStart}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-40 pb-20 md:pt-52 md:pb-32 px-6 text-center">
                <div className="max-w-5xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-teal-300 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
                        <Sparkles size={14} />
                        Yeni Nesil Otel Yönetimi
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-8 animate-fade-in-up delay-100">
                        {t.lpHeroTitle} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400 animate-gradient-x">
                            {t.lpHeroTitleHighlight}
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-200">
                        {t.lpHeroSub}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
                        <button onClick={onRegisterClick} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-full text-white font-bold text-lg hover:shadow-glow hover:scale-105 transition-all flex items-center justify-center gap-2">
                            {t.lpCtaStart} <ArrowRight size={20} />
                        </button>
                        <button onClick={onLoginClick} className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-full text-white font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                            Demo Hesabı İncele
                        </button>
                    </div>
                </div>

                {/* Floating Dashboard Preview */}
                <div className="mt-20 max-w-6xl mx-auto relative animate-float">
                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-2xl blur opacity-30"></div>
                    <div className="relative bg-[#1e293b] rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
                        <div className="h-8 bg-[#0f172a] border-b border-slate-700 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        {/* Updated Image: More reliable link, removed blend mode for visibility */}
                        <img 
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80" 
                            alt="Dashboard Preview" 
                            className="w-full h-auto opacity-95"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#1e293b] via-transparent to-transparent pointer-events-none">
                            <div className="text-center mt-auto pb-10">
                                <p className="text-sm font-mono text-teal-400 mb-2 bg-black/50 inline-block px-3 py-1 rounded">SYSTEM ACTIVE</p>
                                <h3 className="text-3xl font-bold text-white drop-shadow-lg">Tüm Operasyon Tek Ekranda</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-[#0f172a] relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<Zap size={32} className="text-yellow-400" />}
                            title={t.lpFeatAI}
                            desc={t.lpFeatAIDesc}
                            delay={0}
                        />
                        <FeatureCard 
                            icon={<Globe size={32} className="text-blue-400" />}
                            title={t.lpFeatSync}
                            desc={t.lpFeatSyncDesc}
                            delay={100}
                        />
                        <FeatureCard 
                            icon={<Layout size={32} className="text-purple-400" />}
                            title={t.lpFeatRes}
                            desc={t.lpFeatResDesc}
                            delay={200}
                        />
                    </div>
                </div>
            </section>

            {/* Detailed Feature: AI */}
            <section className="py-24 bg-gradient-to-b from-[#0f172a] to-[#1e293b] relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
                    <div>
                        <div className="inline-block p-3 bg-teal-500/10 rounded-2xl mb-6">
                            <BarChart3 size={32} className="text-teal-400" />
                        </div>
                        <h2 className="text-4xl font-serif font-bold mb-6">{t.lpStat1}</h2>
                        <p className="text-lg text-slate-400 leading-relaxed mb-8">
                            Aura'nın yapay zeka motoru, bölgenizdeki rakip fiyatlarını 7/24 analiz eder. Doluluk oranınıza ve pazar talebine göre fiyatlarınızı otomatik optimize ederek kârlılığınızı artırır.
                        </p>
                        <ul className="space-y-4">
                            <ListItem text="Otomatik Fiyat Güncelleme" />
                            <ListItem text="Rakip Analiz Raporları" />
                            <ListItem text="Doluluk Tahminleme" />
                        </ul>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-teal-500/20 rounded-full blur-[100px]"></div>
                        <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <p className="text-slate-400 text-sm uppercase font-bold">Bu Ayki Gelir</p>
                                    <h3 className="text-4xl font-bold text-white">₺845,250</h3>
                                </div>
                                <span className="text-teal-400 font-bold bg-teal-400/10 px-3 py-1 rounded-full">+24%</span>
                            </div>
                            <div className="h-32 flex items-end gap-2">
                                {[40, 65, 45, 70, 55, 80, 60].map((h, i) => (
                                    <div key={i} className="flex-1 bg-slate-700 rounded-t-lg overflow-hidden relative group">
                                        <div className="absolute bottom-0 left-0 right-0 bg-teal-500 transition-all duration-1000" style={{ height: `${h}%` }}></div>
                                        <div className="absolute inset-0 bg-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Detailed Feature: Website Builder */}
            <section className="py-24 bg-[#1e293b] relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="order-2 md:order-1 relative">
                         <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-[100px]"></div>
                         <div className="relative bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                             <div className="h-6 bg-slate-800 border-b border-slate-700 flex items-center gap-2 px-3">
                                 <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                 <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                             </div>
                             {/* Updated Hotel Image */}
                             <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80" className="w-full h-64 object-cover opacity-90" />
                             <div className="p-6">
                                 <div className="h-4 w-3/4 bg-slate-700 rounded mb-3"></div>
                                 <div className="h-4 w-1/2 bg-slate-700 rounded mb-6"></div>
                                 <div className="h-10 w-1/3 bg-indigo-600 rounded"></div>
                             </div>
                         </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <div className="inline-block p-3 bg-indigo-500/10 rounded-2xl mb-6">
                            <Monitor size={32} className="text-indigo-400" />
                        </div>
                        <h2 className="text-4xl font-serif font-bold mb-6">Kodlama Bilmeden Web Sitesi</h2>
                        <p className="text-lg text-slate-400 leading-relaxed mb-8">
                            Sürükle-bırak editörümüz ile dakikalar içinde profesyonel, mobil uyumlu ve rezervasyon motoru entegre edilmiş otel web sitenizi oluşturun.
                        </p>
                        <ul className="space-y-4">
                            <ListItem text="SEO Uyumlu Altyapı" />
                            <ListItem text="Komisyonsuz Doğrudan Rezervasyon" />
                            <ListItem text="Mobil & Tablet Uyumlu Tasarım" />
                        </ul>
                    </div>
                </div>
            </section>

            {/* Stats & Trust */}
            <section id="benefits" className="py-20 bg-[#0f172a] border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <StatItem value="2000+" label={t.lpStat2} />
                    <StatItem value="%40" label="Ort. Gelir Artışı" />
                    <StatItem value="15dk" label="Kurulum Süresi" />
                    <StatItem value="7/24" label={t.lpStat3} />
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 bg-[#0f172a] relative">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-16">{t.lpBenefitTitle}</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <TestimonialCard 
                            quote={t.lpTestimonial1}
                            author={t.lpTestimonial1Auth}
                            delay={0}
                        />
                        <TestimonialCard 
                            quote={t.lpTestimonial2}
                            author={t.lpTestimonial2Auth}
                            delay={200}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="py-24 bg-gradient-to-br from-indigo-900 to-slate-900 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-3xl mx-auto px-6 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">Otelinizin Potansiyelini Açığa Çıkarın</h2>
                    <p className="text-xl text-indigo-200 mb-10">Kurulum ücreti yok. Kredi kartı gerekmez. 14 gün boyunca tüm özellikleri ücretsiz deneyin.</p>
                    <button onClick={onRegisterClick} className="px-10 py-5 bg-white text-indigo-900 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-2xl">
                        {t.lpCtaStart}
                    </button>
                    <p className="mt-6 text-sm text-indigo-300/60">{t.lpFooterText}</p>
                </div>
            </section>

            <footer className="bg-[#020617] py-10 border-t border-white/5 text-center text-slate-500 text-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>&copy; 2025 Aura PMS. Tüm hakları saklıdır.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Gizlilik</a>
                        <a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a>
                        <a href="#" className="hover:text-white transition-colors">İletişim</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) => (
    <div 
        className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 group animate-fade-in-up"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="mb-6 p-4 bg-[#0f172a] rounded-xl inline-block group-hover:scale-110 transition-transform duration-300 border border-white/5 shadow-lg">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-teal-400 transition-colors">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
);

const ListItem = ({ text }: { text: string }) => (
    <li className="flex items-center gap-3 text-slate-300">
        <div className="p-1 bg-teal-500/20 rounded-full text-teal-400">
            <CheckCircle size={16} />
        </div>
        {text}
    </li>
);

const StatItem = ({ value, label }: { value: string, label: string }) => (
    <div className="p-4">
        <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{value}</div>
        <div className="text-sm text-slate-400 uppercase font-bold tracking-wider">{label}</div>
    </div>
);

const TestimonialCard = ({ quote, author, delay }: { quote: string, author: string, delay: number }) => (
    <div 
        className="p-8 bg-white/5 border border-white/10 rounded-2xl text-left relative animate-fade-in-up"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex text-yellow-400 mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
        </div>
        <p className="text-lg text-slate-300 mb-6 italic">"{quote}"</p>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-white">
                {author.charAt(0)}
            </div>
            <div>
                <div className="font-bold text-white">{author}</div>
                <div className="text-xs text-slate-500">Otel Yöneticisi</div>
            </div>
        </div>
    </div>
);

// Helper component for icons
const Sparkles = ({size}: {size:number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
)

export default LandingPage;