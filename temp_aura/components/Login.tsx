
import React, { useState } from 'react';
import { translations } from '../utils/helpers';
import { Language, User } from '../types';
import { loginUser } from '../services/db';
import { Phone, Eye, CheckCircle, Star, ArrowRight, Globe, ShieldCheck, Zap, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  language: Language;
  switchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, language, switchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Local state for language selector within Login component, 
  // in a real app this might need to lift up to App.tsx if we want it to persist immediately
  const [currentLang, setCurrentLang] = useState<Language>(language);
  
  // Use local lang state for immediate UI feedback
  const t = translations[currentLang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
        const result = await loginUser(email, password);
        
        if (result.success && result.user) {
          onLogin(result.user);
        } else {
          setError(result.message || t.invalidCredentials);
        }
    } catch (e) {
        setError("Connection error. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
      setLoading(true);
      try {
          const result = await loginUser('demo@aura.com', 'demo');
          if (result.success && result.user) {
              onLogin(result.user);
          } else {
              setError('Demo account setup failed. Please try again.');
          }
      } catch (e) {
          setError('Demo login failed.');
      } finally {
          setLoading(false);
      }
  };

  // Enhanced Input Style: Explicit Light/Dark mode colors + Stylish Border/Shadow
  const inputClass = "w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-4 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm font-medium placeholder-slate-400";

  return (
    <div className="min-h-screen flex bg-white animate-fade-in">
      
      {/* Language Selector (Top Right) */}
      <div className="absolute top-4 right-4 z-50">
          <select 
             value={currentLang}
             onChange={(e) => setCurrentLang(e.target.value as Language)}
             className="bg-white/80 backdrop-blur border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          >
             <option value="tr">Türkçe</option>
             <option value="en">English</option>
             <option value="de">Deutsch</option>
             <option value="ru">Русский</option>
             <option value="sv">Svenska</option>
          </select>
      </div>

      {/* Left Side - Feature Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-16 text-white">
          {/* Background Accents */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-600/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center font-serif font-bold text-xl border border-white/10">
                      A
                  </div>
                  <span className="font-serif font-bold text-2xl tracking-wide">AURA PMS</span>
              </div>
              
              <h1 className="text-5xl font-serif font-bold leading-tight mb-6">
                  {t.loginHeadline?.split(' ').slice(0, 2).join(' ')} <br/>
                  <span className="text-primary-400">{t.loginHeadline?.split(' ').slice(2).join(' ')}</span>
              </h1>
              <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                  {t.loginSubHeadline}
              </p>
          </div>

          <div className="relative z-10 space-y-8">
              <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-start gap-4">
                      <div className="bg-primary-500/20 p-3 rounded-xl border border-primary-500/30 text-primary-300">
                          <Zap size={24} />
                      </div>
                      <div>
                          <h3 className="font-bold text-lg">{t.loginFeature1Title}</h3>
                          <p className="text-slate-400 text-sm">{t.loginFeature1Desc}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <div className="bg-accent-500/20 p-3 rounded-xl border border-accent-500/30 text-accent-300">
                          <Globe size={24} />
                      </div>
                      <div>
                          <h3 className="font-bold text-lg">{t.loginFeature2Title}</h3>
                          <p className="text-slate-400 text-sm">{t.loginFeature2Desc}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/30 text-purple-300">
                          <ShieldCheck size={24} />
                      </div>
                      <div>
                          <h3 className="font-bold text-lg">{t.loginFeature3Title}</h3>
                          <p className="text-slate-400 text-sm">{t.loginFeature3Desc}</p>
                      </div>
                  </div>
              </div>

              {/* Testimonial Card */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl mt-8">
                  <div className="flex text-yellow-400 mb-3">
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                  </div>
                  <p className="text-slate-200 italic mb-4">{t.testimonialQuote}</p>
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">A</div>
                      <div>
                          <div className="font-bold text-sm">{t.testimonialAuthor}</div>
                          <div className="text-xs text-slate-400">{t.testimonialRole}</div>
                      </div>
                  </div>
              </div>
          </div>
          
          <div className="relative z-10 text-xs text-slate-500 mt-8">
              {t.trustedBy}
          </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 transition-colors">
        <div className="w-full max-w-md">
            <div className="lg:hidden flex justify-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-900 rounded-xl flex items-center justify-center font-serif font-bold text-2xl text-white shadow-xl">
                    A
                </div>
            </div>
            
            <div className="text-center lg:text-left mb-10">
                <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">{t.loginTitle}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">{t.loginSub}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2 tracking-wide">{t.email}</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        placeholder="manager@hotel.com"
                        disabled={loading}
                    />
                </div>
                
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{t.password}</label>
                    </div>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                        placeholder="••••••"
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div className="text-red-500 text-sm flex items-center gap-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/50">
                        <CheckCircle size={16} className="text-red-500" /> {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-900 dark:bg-primary-600 text-white font-bold py-4 rounded-xl hover:bg-slate-800 dark:hover:bg-primary-700 transition-all shadow-lg shadow-slate-900/20 dark:shadow-primary-600/20 tracking-wide flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>{t.loginButton} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                </button>
            </form>
            
            <div className="my-8 flex items-center gap-4">
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                <span className="text-xs text-slate-400 font-medium uppercase">{t.orContinue}</span>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            </div>

            {/* Demo Button */}
            <button 
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 text-sm border border-slate-200 dark:border-slate-700 shadow-sm group disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Eye size={18} className="text-slate-400 group-hover:text-primary-600 transition-colors" />}
                {t.demoButton || 'View Demo Account'}
            </button>
            
            <div className="mt-8 text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {t.noAccount} {' '}
                    <button onClick={switchToRegister} className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                        {t.registerLink}
                    </button>
                </p>
            </div>
            
            <div className="mt-12 flex flex-col items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-6">
                <div className="text-xs text-slate-400 font-medium">
                    {t.copyright}
                </div>
                <a href="https://wa.me/905415079974" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors font-bold">
                    <Phone size={14} /> {t.whatsappSupport}
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
