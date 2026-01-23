import React, { useState, useEffect } from 'react';
import { HotelDetails, Language, Room, WebsiteConfig, Review, DailyRate, Currency } from '../types';
import { translations, formatCurrency } from '../utils/helpers';
import { Layout, Eye, UploadCloud, ExternalLink, Monitor, Smartphone, Check, Menu, Twitter, Facebook, Instagram, Download, MessageCircle, Star, X, BarChart3, Image, Phone, Search, Calendar, Users, Edit3 } from 'lucide-react';

interface WebsiteBuilderProps {
    hotelDetails: HotelDetails;
    rooms: Room[];
    language: Language;
    config: WebsiteConfig;
    onSave: (config: WebsiteConfig) => void;
    reviews?: Review[]; 
    currency: Currency;
}

const WebsiteBuilder: React.FC<WebsiteBuilderProps> = ({ hotelDetails, rooms, language, config: initialConfig, onSave, reviews = [], currency }) => {
    const t = translations[language];
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    const [config, setConfig] = useState<WebsiteConfig>(initialConfig);
    const [loading, setLoading] = useState(false);
    const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [showExportModal, setShowExportModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'analytics'>('content');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    // Mobile View State
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
    
    // Image Selector State
    const [showImageModal, setShowImageModal] = useState(false);
    const [targetImageField, setTargetImageField] = useState<keyof WebsiteConfig | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedImages, setSearchedImages] = useState<string[]>([]);

    // Sync config when prop changes (important for async data load)
    useEffect(() => {
        setConfig(initialConfig);
    }, [initialConfig]);

    // Auto-update defaults if user switches language and hasn't customized the text yet
    useEffect(() => {
        const checkAndReplace = (key: keyof WebsiteConfig, defaultKey: string) => {
            // @ts-ignore
            const currentVal = config[key];
            // Check if current value matches ANY language's default for this key
            const isDefault = Object.values(translations).some(tr => 
                // @ts-ignore
                tr[defaultKey] === currentVal || 
                // Handle the specific hardcoded English defaults if they exist in DB
                (defaultKey === 'defaultHeroTitle' && currentVal === 'Welcome to Paradise') ||
                (defaultKey === 'defaultHeroSubtitle' && currentVal === 'Experience luxury and comfort') ||
                (defaultKey === 'aboutTitle' && currentVal === 'A Sanctuary for the Senses')
            );

            if (isDefault) {
                // @ts-ignore
                setConfig(prev => ({ ...prev, [key]: t[defaultKey] }));
            }
        };

        checkAndReplace('heroTitle', 'defaultHeroTitle');
        checkAndReplace('heroSubtitle', 'defaultHeroSubtitle');
    }, [language, t]);

    // Derive unique room types for the preview
    const uniqueRooms = Array.from(new Set(rooms.map(r => r.type))).map(type => rooms.find(r => r.type === type)!);

    // Reliable Gallery Images
    const galleryImages = [
        'https://images.unsplash.com/photo-1571896349842-6e53ce41be03?auto=format&fit=crop&w=800&q=80', // Bedroom
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', // Bedroom 2
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', // Pool
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', // Dining
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', // Modern Room
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', // Resort View
        'https://images.unsplash.com/photo-1560668392-dcda98063171?auto=format&fit=crop&w=800&q=80', // Lobby
        'https://images.unsplash.com/photo-1590490360182-f33d5e6a385c?auto=format&fit=crop&w=800&q=80'  // Interior
    ];

    // Mock Reviews (Localized)
    const displayReviews = reviews.length > 0 ? reviews : [
        { id: '1', author: 'Jane Doe', content: t.mockReview1, rating: 5, source: 'Google', date: '2023-10-01' },
        { id: '2', author: 'John Smith', content: t.mockReview2, rating: 5, source: 'TripAdvisor', date: '2023-09-15' }
    ];

    const handleImageSearch = () => {
        setSearchedImages(galleryImages);
    };

    const handleSelectImage = (url: string) => {
        if (targetImageField) {
            updateConfig(targetImageField, url);
            setShowImageModal(false);
        }
    };

    const handlePublish = () => {
        setLoading(true);
        const htmlContent = generateHtml();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);

        // Simulate a robust publishing process
        setTimeout(() => {
            const newDomain = `https://${hotelDetails.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.aura-hotels.app`;
            const newConfig = { ...config, published: true, domain: newDomain };
            setConfig(newConfig);
            onSave(newConfig);
            setLoading(false);
            
            // Notify user
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(t.sitePublished, { body: newDomain });
            }
            
            // Open preview
            window.open(url, '_blank');
        }, 2000);
    };

    const generateHtml = () => {
        return `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.heroTitle} | ${hotelDetails.companyName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    ${config.analyticsId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${config.analyticsId}"></script>
    <script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${config.analyticsId}');</script>` : ''}
    <style>
       html { scroll-behavior: smooth; } 
       .font-serif { font-family: 'Playfair Display', serif; }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body class="font-sans text-slate-800 relative">
    <nav class="bg-white px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div class="font-serif font-bold text-xl">${hotelDetails.companyName}</div>
        
        <div class="hidden md:flex items-center gap-8">
            <div class="flex gap-6 text-sm font-medium">
                ${config.showAbout ? `<a href="#about" class="hover:text-slate-600 transition-colors">${t.navAbout || 'About'}</a>` : ''}
                ${config.showRooms ? `<a href="#rooms" class="hover:text-slate-600 transition-colors">${t.navRooms || 'Rooms'}</a>` : ''}
                ${config.showContact ? `<a href="#contact" class="hover:text-slate-600 transition-colors">${t.navContact || 'Contact'}</a>` : ''}
            </div>
            <a href="#book" class="px-6 py-2.5 text-white font-bold rounded uppercase text-sm shadow-lg hover:opacity-90 transition-opacity" style="background-color: ${config.primaryColor}">${t.bookNow || 'Book Now'}</a>
        </div>
        
        <button id="mobile-menu-btn" class="md:hidden text-slate-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
        </button>
    </nav>

    <!-- Mobile Menu (Hidden by default) -->
    <div id="mobile-menu" class="hidden fixed inset-0 z-40 bg-white pt-20 px-6">
        <div class="flex flex-col gap-6 text-lg font-medium">
            ${config.showAbout ? `<a href="#about" class="mobile-link border-b pb-2">${t.navAbout || 'About'}</a>` : ''}
            ${config.showRooms ? `<a href="#rooms" class="mobile-link border-b pb-2">${t.navRooms || 'Rooms'}</a>` : ''}
            ${config.showContact ? `<a href="#contact" class="mobile-link border-b pb-2">${t.navContact || 'Contact'}</a>` : ''}
            <a href="#book" class="mobile-link px-6 py-3 text-white font-bold rounded text-center" style="background-color: ${config.primaryColor}">${t.bookNow || 'Book Now'}</a>
        </div>
        <button id="close-menu" class="absolute top-6 right-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    </div>
    
    <header class="h-[600px] bg-cover bg-center relative flex items-center justify-center text-center text-white" style="background-image: url('${config.heroImage}')">
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="relative z-10 max-w-2xl px-4">
            <h1 class="text-5xl font-serif font-bold mb-4 leading-tight">${config.heroTitle}</h1>
            <p class="text-lg mb-8 opacity-90">${config.heroSubtitle}</p>
        </div>
    </header>

    <main>
        ${config.showAbout ? `
        <section id="about" class="py-24 px-6 text-center bg-slate-50">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">${t.welcomePublic || 'Welcome'}</span>
            <h2 class="text-3xl font-serif font-bold mb-6 text-slate-900">${t.aboutTitle}</h2>
            <p class="max-w-2xl mx-auto text-slate-600 leading-relaxed">${t.aboutContent}</p>
        </section>` : ''}

        ${config.customHtml ? `<section class="py-10 px-6">${config.customHtml}</section>` : ''}

        ${config.showRooms ? `
        <section id="rooms" class="py-20 px-6 max-w-6xl mx-auto">
            <h2 class="text-3xl font-serif font-bold mb-10 text-center text-slate-900">${t.ourRooms || 'Our Rooms'}</h2>
            <div class="grid md:grid-cols-3 gap-8">
                ${uniqueRooms.map(r => `
                <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <img src="${r.images?.[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80'}" class="w-full h-64 object-cover">
                    <div class="p-6">
                        <h3 class="font-bold text-xl mb-2 text-slate-800">${r.type}</h3>
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-slate-500">${t.startFrom || 'Starting from'}</span>
                            <p class="font-bold text-lg" style="color: ${config.primaryColor}">
                                ${formatCurrency(r.dailyRates && Object.values(r.dailyRates).length > 0 ? (Object.values(r.dailyRates)[0] as DailyRate).onlinePrice || r.price : r.price, currency, locale)}
                            </p>
                        </div>
                    </div>
                </div>`).join('')}
            </div>
        </section>` : ''}

        ${config.showGallery ? `
        <section class="py-20 px-6 bg-slate-50">
             <h2 class="text-3xl font-serif font-bold mb-10 text-center text-slate-900">${t.gallery || 'Gallery'}</h2>
             <div class="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-6xl mx-auto">
                ${galleryImages.slice(0, 8).map(img => `
                    <div class="aspect-square overflow-hidden rounded">
                        <img src="${img}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-700">
                    </div>
                `).join('')}
             </div>
        </section>
        ` : ''}
    </main>

    ${config.showContact ? `
    <footer id="contact" class="bg-slate-950 text-white py-16 px-6">
        <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
            <div>
                <h4 class="font-serif font-bold text-xl mb-4">${hotelDetails.companyName}</h4>
                <p class="text-slate-400 text-sm">${t.footerDesc || 'Luxury living in the heart of the city.'}</p>
            </div>
            <div>
                <h4 class="font-bold text-sm uppercase text-slate-500 mb-4">${t.contactUs || 'Contact'}</h4>
                <p>${config.phoneNumber || ''}</p>
            </div>
        </div>
    </footer>
    ` : ''}

    <script>
        const menuBtn = document.getElementById('mobile-menu-btn');
        const closeBtn = document.getElementById('close-menu');
        const menu = document.getElementById('mobile-menu');
        const links = document.querySelectorAll('.mobile-link');

        function toggleMenu() {
            menu.classList.toggle('hidden');
        }

        menuBtn.addEventListener('click', toggleMenu);
        closeBtn.addEventListener('click', toggleMenu);
        
        links.forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    </script>
</body>
</html>
        `;
    };

    const handleExport = () => {
        const html = generateHtml();
        const blob = new Blob([html], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'index.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportModal(false);
    };

    const updateConfig = (key: keyof WebsiteConfig, value: any) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
    };

    const updateSocial = (platform: 'instagram' | 'facebook' | 'twitter', value: string) => {
        const newSocial = { ...config.socialUrls, [platform]: value };
        updateConfig('socialUrls', newSocial);
    };

    return (
        <div className="animate-fade-in h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6 relative">
            
            {/* Export Modal */}
            {showExportModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 animate-slide-up">
                         <div className="flex justify-between items-center mb-6">
                             <h3 className="font-serif font-bold text-2xl text-slate-800">{t.exportSite}</h3>
                             <button onClick={() => setShowExportModal(false)}><X size={24} className="text-slate-400" /></button>
                         </div>
                         <p className="text-slate-600 mb-6">{t.exportDesc}</p>
                         
                         <div className="flex flex-col gap-3">
                             <button onClick={handleExport} className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700">
                                 <Download size={18} /> {t.downloadCode} (HTML)
                             </button>
                         </div>
                    </div>
                </div>
            )}

            {/* Image Selector Modal */}
            {showImageModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 animate-slide-up h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-800">{t.searchImage}</h3>
                            <button onClick={() => setShowImageModal(false)}><X size={24} className="text-slate-400"/></button>
                        </div>
                        <div className="flex gap-2 mb-6">
                            <input 
                                type="text" 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t.searchPlaceholder} 
                                className="flex-1 border p-2 rounded-lg"
                            />
                            <button onClick={handleImageSearch} className="bg-slate-900 text-white px-4 rounded-lg"><Search size={18}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2">
                            {searchedImages.map((img, i) => (
                                <div key={i} onClick={() => handleSelectImage(img)} className="aspect-video cursor-pointer hover:opacity-80 relative group">
                                    <img src={img} className="w-full h-full object-cover rounded-lg" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                </div>
                            ))}
                            {searchedImages.length === 0 && <div className="col-span-3 text-center text-slate-400 mt-10">Search for images to select</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Tabs */}
            <div className="lg:hidden flex border-b border-slate-200 bg-white -mt-2 mx-[-16px] px-4 mb-4 sticky top-0 z-30">
                <button 
                    onClick={() => setMobileTab('editor')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${mobileTab === 'editor' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'}`}
                >
                    <Edit3 size={16} /> Editor
                </button>
                <button 
                    onClick={() => setMobileTab('preview')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${mobileTab === 'preview' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'}`}
                >
                    <Eye size={16} /> {t.preview}
                </button>
            </div>

            {/* Left: Editor Panel (Hidden on mobile if preview tab active) */}
            <div className={`lg:w-1/3 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden ${mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-6 border-b border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                         <h2 className="font-serif font-bold text-2xl text-slate-800">{t.builderTitle}</h2>
                    </div>
                    <div className="flex gap-4 text-sm font-bold border-b border-transparent mt-4">
                        <button 
                            onClick={() => setActiveTab('content')}
                            className={`pb-2 border-b-2 transition-colors ${activeTab === 'content' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-400'}`}
                        >
                            Content
                        </button>
                        <button 
                            onClick={() => setActiveTab('analytics')}
                            className={`pb-2 border-b-2 transition-colors ${activeTab === 'analytics' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-400'}`}
                        >
                            Analytics & SEO
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {activeTab === 'content' ? (
                        <>
                            {/* Hero Section Editor */}
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Layout size={14} /> {t.heroSection}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">{t.heroTitle}</label>
                                        <input 
                                            type="text" 
                                            value={config.heroTitle}
                                            onChange={(e) => updateConfig('heroTitle', e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">{t.heroSubtitle}</label>
                                        <input 
                                            type="text" 
                                            value={config.heroSubtitle}
                                            onChange={(e) => updateConfig('heroSubtitle', e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">{t.heroImage}</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={config.heroImage}
                                                onChange={(e) => updateConfig('heroImage', e.target.value)}
                                                className="flex-1 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-500"
                                            />
                                            <button onClick={() => { setTargetImageField('heroImage'); setShowImageModal(true); }} className="bg-slate-100 border p-2 rounded-lg text-slate-500 hover:bg-slate-200"><Image size={18}/></button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Sections Toggle */}
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Eye size={14} /> {t.contentSections}
                                </h3>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50">
                                        <span className="text-sm font-medium text-slate-700">{t.showAbout}</span>
                                        <input type="checkbox" checked={config.showAbout} onChange={(e) => updateConfig('showAbout', e.target.checked)} className="accent-primary-600 w-4 h-4" />
                                    </label>
                                    <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50">
                                        <span className="text-sm font-medium text-slate-700">{t.showRooms}</span>
                                        <input type="checkbox" checked={config.showRooms} onChange={(e) => updateConfig('showRooms', e.target.checked)} className="accent-primary-600 w-4 h-4" />
                                    </label>
                                    <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50">
                                        <span className="text-sm font-medium text-slate-700">{t.showGallery}</span>
                                        <input type="checkbox" checked={config.showGallery} onChange={(e) => updateConfig('showGallery', e.target.checked)} className="accent-primary-600 w-4 h-4" />
                                    </label>
                                    <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50">
                                        <span className="text-sm font-medium text-slate-700">{t.showContact}</span>
                                        <input type="checkbox" checked={config.showContact} onChange={(e) => updateConfig('showContact', e.target.checked)} className="accent-primary-600 w-4 h-4" />
                                    </label>
                                </div>
                            </section>

                            {/* Contact & Social */}
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Phone size={14} /> {t.contactSettings}
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">{t.whatsappNumber}</label>
                                        <input 
                                            type="text" 
                                            value={config.whatsappNumber || ''}
                                            onChange={(e) => updateConfig('whatsappNumber', e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-primary-300"
                                            placeholder="+905..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">{t.phoneNumber}</label>
                                        <input 
                                            type="text" 
                                            value={config.phoneNumber || ''}
                                            onChange={(e) => updateConfig('phoneNumber', e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-primary-300"
                                            placeholder="+90 212..."
                                        />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Instagram size={14} /> {t.socialMedia}
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Instagram size={16} className="text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Instagram username"
                                            value={config.socialUrls?.instagram || ''}
                                            onChange={(e) => updateSocial('instagram', e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-primary-300"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Facebook size={16} className="text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Facebook page"
                                            value={config.socialUrls?.facebook || ''}
                                            onChange={(e) => updateSocial('facebook', e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-primary-300"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Twitter size={16} className="text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Twitter handle"
                                            value={config.socialUrls?.twitter || ''}
                                            onChange={(e) => updateSocial('twitter', e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-primary-300"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Theme */}
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Layout size={14} /> {t.primaryColor}
                                </h3>
                                <div className="flex gap-3">
                                    {['#0f766e', '#1e293b', '#4338ca', '#be123c', '#059669'].map(color => (
                                        <button 
                                            key={color}
                                            onClick={() => updateConfig('primaryColor', color)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${config.primaryColor === color ? 'border-slate-400 scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </section>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <BarChart3 size={14} /> {t.analyticsSeo}
                            </h3>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">{t.googleAnalyticsId}</label>
                                <input 
                                    type="text" 
                                    value={config.analyticsId || ''}
                                    onChange={(e) => updateConfig('analyticsId', e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="G-12345678"
                                />
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-700 border border-blue-100">
                                Tracking codes will be automatically injected into the &lt;head&gt; of your published site.
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                     {config.published ? (
                         <div className="mb-4 bg-green-100 border border-green-200 rounded-lg p-3">
                             <div className="flex items-center gap-2 text-green-800 font-bold text-sm mb-1">
                                 <Check size={14} /> {t.sitePublished}
                             </div>
                             <a href={config.domain} target="_blank" rel="noreferrer" className="text-xs text-green-700 underline break-all hover:text-green-900">{config.domain}</a>
                         </div>
                     ) : null}

                     <button 
                        onClick={handlePublish}
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-70 mb-3"
                     >
                         {loading ? (
                             <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                {t.publishing}
                             </>
                         ) : config.published ? (
                            <>
                                <UploadCloud size={18} /> Update Site
                            </>
                         ) : (
                             <>
                                <UploadCloud size={18} /> {t.publishSite}
                             </>
                         )}
                     </button>
                     
                     <div className="flex gap-2">
                         {config.published && previewUrl && (
                             <a href={previewUrl} target="_blank" rel="noreferrer" className="flex-1 text-slate-500 text-xs font-bold flex items-center justify-center gap-2 hover:text-primary-600 py-2 border border-slate-200 rounded-lg bg-white">
                                 {t.visitSite} <ExternalLink size={12} />
                             </a>
                         )}
                         <button 
                             onClick={() => setShowExportModal(true)}
                             className="flex-1 text-slate-500 text-xs font-bold flex items-center justify-center gap-2 hover:text-primary-600 py-2 border border-slate-200 rounded-lg bg-white"
                         >
                             {t.exportSite} <Download size={12} />
                         </button>
                     </div>
                </div>
            </div>

            {/* Right: Live Preview (Hidden on mobile if editor tab active) */}
            <div className={`lg:w-2/3 flex flex-col h-full ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
                <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Eye size={18} className="text-primary-600" /> {t.preview}
                    </h3>
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1 flex">
                        <button 
                            onClick={() => setDevice('desktop')}
                            className={`p-2 rounded transition-colors ${device === 'desktop' ? 'bg-slate-100 text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Monitor size={18} />
                        </button>
                        <button 
                            onClick={() => setDevice('mobile')}
                            className={`p-2 rounded transition-colors ${device === 'mobile' ? 'bg-slate-100 text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Smartphone size={18} />
                        </button>
                    </div>
                </div>

                {/* Browser Frame */}
                <div className={`flex-1 bg-slate-800 rounded-t-xl overflow-hidden flex flex-col transition-all duration-500 ${device === 'mobile' ? 'mx-auto w-[375px]' : 'w-full'}`}>
                    {/* Browser Bar */}
                    <div className="bg-slate-800 p-3 flex items-center gap-4 border-b border-slate-700">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex-1 bg-slate-700 rounded px-3 py-1 text-xs text-slate-300 flex items-center justify-center font-mono">
                            {config.published ? config.domain : 'localhost:3000'}
                        </div>
                    </div>

                    {/* Simulated Website Content */}
                    <div className="flex-1 bg-white overflow-y-auto relative scroll-smooth">
                        <iframe 
                            title="preview"
                            srcDoc={generateHtml()}
                            className="w-full h-full border-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebsiteBuilder;