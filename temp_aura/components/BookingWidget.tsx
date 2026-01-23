
import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Check, Code, X, Copy } from 'lucide-react';
import { Currency, Language } from '../types';
import { formatCurrency, translations } from '../utils/helpers';

interface BookingWidgetProps {
  currency?: Currency;
  language?: Language;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ currency = 'TRY' as Currency, language = 'tr' }) => {
  const [step, setStep] = useState(1);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = translations[language];
  const locale = language === 'tr' ? 'tr-TR' : 'en-US';

  const embedCode = `<iframe src="https://aura-hotel-management-61866932950.us-west1.run.app/widget/HOTEL_ID" width="100%" height="600" frameborder="0"></iframe>
<script src="https://aura-hotel-management-61866932950.us-west1.run.app/sdk.js"></script>`;

  const handleCopy = () => {
      navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      
      {/* Embed Modal */}
      {showEmbedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-serif font-bold text-xl text-slate-800 flex items-center gap-2">
                          <Code size={20} className="text-primary-600" />
                          {t.embedTitle}
                      </h3>
                      <button onClick={() => setShowEmbedModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
                          <X size={20} />
                      </button>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">{t.embedDesc}</p>
                  
                  <div className="bg-slate-900 rounded-lg p-4 mb-4 relative group">
                      <pre className="text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all">
                          {embedCode}
                      </pre>
                      <button 
                        onClick={handleCopy}
                        className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded transition-colors"
                      >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                  </div>

                  <div className="flex justify-end">
                      <button 
                        onClick={() => setShowEmbedModal(false)}
                        className="bg-slate-100 text-slate-600 font-bold py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                      >
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div className="text-center flex-1">
            <h2 className="text-3xl font-serif font-bold text-slate-800">{t.bookingPreview}</h2>
            <p className="text-slate-500">{t.bookingPreviewSub}</p>
        </div>
        <button 
            onClick={() => setShowEmbedModal(true)}
            className="bg-white border border-slate-200 text-primary-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary-50 transition-colors shadow-sm"
        >
            <Code size={16} /> {t.embedOnWebsite}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[500px]">
        {/* Left: Hotel Image & Summary */}
        <div className="md:w-1/3 bg-slate-900 text-white p-8 flex flex-col relative overflow-hidden">
           <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center mix-blend-overlay"></div>
           <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 to-slate-900/90"></div>
           <div className="relative z-10 flex-1 flex flex-col justify-between">
               <div>
                   <div className="text-xs font-bold tracking-[0.2em] uppercase text-accent-500 mb-2">Boutique Collection</div>
                   <h3 className="text-3xl font-serif font-bold mb-4 text-white">Aura Hotel</h3>
                   <div className="flex gap-1 text-accent-500 mb-4">
                       {[1,2,3,4,5].map(i => <span key={i}>★</span>)}
                   </div>
               </div>
               <div className="space-y-4 font-light">
                   <div className="flex justify-between border-b border-white/10 pb-2">
                       <span className="text-white/70 text-sm">{t.checkInDate}</span>
                       <span className="font-medium">Oct 28, 2023</span>
                   </div>
                   <div className="flex justify-between border-b border-white/10 pb-2">
                       <span className="text-white/70 text-sm">{t.checkOutDate}</span>
                       <span className="font-medium">Oct 31, 2023</span>
                   </div>
                   <div className="flex justify-between pt-2">
                       <span className="text-lg">{t.total}</span>
                       <span className="text-2xl font-serif font-bold text-accent-400">{formatCurrency(10350, currency, locale)}</span>
                   </div>
               </div>
           </div>
        </div>

        {/* Right: Steps */}
        <div className="md:w-2/3 p-8 bg-white">
            {/* Progress */}
            <div className="flex items-center mb-8 text-sm">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center transition-colors ${step >= 1 ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
                <div className={`h-1 w-12 transition-colors ${step >= 2 ? 'bg-primary-700' : 'bg-slate-100'}`}></div>
                <div className={`rounded-full w-8 h-8 flex items-center justify-center transition-colors ${step >= 2 ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
                <div className={`h-1 w-12 transition-colors ${step >= 3 ? 'bg-primary-700' : 'bg-slate-100'}`}></div>
                <div className={`rounded-full w-8 h-8 flex items-center justify-center transition-colors ${step >= 3 ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
            </div>

            {step === 1 && (
                <div className="animate-fade-in">
                    <h4 className="text-xl font-bold text-slate-800 mb-4 font-serif">{t.roomSelection}</h4>
                    <div className="space-y-4">
                        <div className="border border-primary-500 bg-primary-50/30 p-4 rounded-xl flex justify-between items-center cursor-pointer ring-1 ring-primary-500 shadow-sm">
                            <div>
                                <h5 className="font-bold text-primary-900">{t.roomTypes['Deluxe']}</h5>
                                <p className="text-xs text-slate-500">King Bed • Balcony • 35m²</p>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-primary-700">{formatCurrency(3450, currency, locale)}</div>
                                <div className="text-xs text-slate-400">/{t.night}</div>
                            </div>
                        </div>
                        <div className="border border-slate-200 p-4 rounded-xl flex justify-between items-center cursor-pointer hover:border-primary-200 transition-colors opacity-60 grayscale hover:grayscale-0">
                            <div>
                                <h5 className="font-bold text-slate-800">{t.roomTypes['Suite']}</h5>
                                <p className="text-xs text-slate-500">Queen Bed • Garden Access • 45m²</p>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-slate-800">{formatCurrency(4200, currency, locale)}</div>
                                <div className="text-xs text-slate-400">/{t.night}</div>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setStep(2)} className="w-full mt-8 bg-slate-900 text-white py-4 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-lg tracking-wide uppercase text-xs">{t.continueDetails}</button>
                </div>
            )}

            {step === 2 && (
                <div className="animate-fade-in">
                    <h4 className="text-xl font-bold text-slate-800 mb-4 font-serif">{t.guestDetails}</h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder={t.firstName} className="border border-slate-200 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            <input type="text" placeholder={t.lastName} className="border border-slate-200 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <input type="email" placeholder={t.bookingEmail} className="border border-slate-200 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <input type="tel" placeholder={t.bookingPhone} className="border border-slate-200 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div className="flex gap-4 mt-8">
                        <button onClick={() => setStep(1)} className="flex-1 border border-slate-300 text-slate-600 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors uppercase text-xs">{t.back}</button>
                        <button onClick={() => setStep(3)} className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-lg uppercase text-xs">{t.continuePayment}</button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="animate-fade-in">
                    <h4 className="text-xl font-bold text-slate-800 mb-4 font-serif">{t.securePayment}</h4>
                    
                    <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100">
                        <div className="flex gap-4 justify-center mb-4 opacity-70 grayscale">
                             {/* Mock Payment Logos */}
                             <div className="font-bold text-slate-700 italic text-xl">Stripe</div>
                             <div className="font-bold text-indigo-700 text-xl">iyzico</div>
                             <div className="font-bold text-green-600 text-xl">PayTR</div>
                        </div>
                        <div className="relative">
                             <CreditCard className="absolute left-3 top-3 text-slate-400" size={20} />
                             <input type="text" placeholder="Card Number" className="pl-10 border border-slate-200 p-3 rounded-lg w-full mb-3" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="MM / YY" className="border border-slate-200 p-3 rounded-lg w-full" />
                            <input type="text" placeholder="CVC" className="border border-slate-200 p-3 rounded-lg w-full" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 justify-center">
                        <ShieldCheck size={14} className="text-primary-600" />
                        <span>{t.sslSecure}</span>
                    </div>

                    <button className="w-full bg-primary-700 text-white py-4 rounded-lg font-bold hover:bg-primary-800 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-primary-700/20">
                        {t.completeBooking}
                        <Check size={20} />
                    </button>
                    <button onClick={() => setStep(2)} className="w-full mt-4 text-slate-400 text-xs uppercase tracking-wide hover:text-slate-600">{t.back}</button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BookingWidget;
