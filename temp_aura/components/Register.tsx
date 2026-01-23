
import React, { useState } from 'react';
import { translations } from '../utils/helpers';
import { Language } from '../types';
import { ArrowRight, Building, Globe, Phone, FileText, Mail, Lock, Loader2 } from 'lucide-react';
import { registerHotel } from '../services/db';

interface RegisterProps {
  onRegister: (data: any) => void;
  language: Language;
  switchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, language, switchToLogin }) => {
  const t = translations[language];
  const [formData, setFormData] = useState({
    companyName: '',
    taxId: '',
    taxOffice: '',
    website: '',
    phone: '',
    email: '',
    password: ''
  });
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData({...formData, email});
    if (email && !validateEmail(email)) {
        setEmailError('Please enter a valid email address.');
    } else {
        setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateEmail(formData.email)) {
        setEmailError('Please enter a valid email address.');
        return;
    }
    if (formData.password.length < 6) {
        setGeneralError('Password must be at least 6 characters.');
        return;
    }

    setLoading(true);
    try {
        // Create the user in the DB
        const result = await registerHotel(formData, formData);
        
        if (result.success && result.user) {
            // Pass data to App to start Onboarding flow (logged in as the new user)
            onRegister({ ...formData, user: result.user });
        } else {
            setGeneralError('Registration failed. Email might be already in use.');
        }
    } catch (e) {
        setGeneralError('An unexpected error occurred during registration.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-100">
        <div className="p-10">
            <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-900 rounded-xl flex items-center justify-center font-serif font-bold text-xl text-white border border-primary-500">
                    A
                 </div>
                 <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide">AURA</h1>
            </div>
            
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2 font-serif">{t.registerTitle}</h2>
                <p className="text-slate-500">{t.registerSub}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Billing Info Section */}
                <div>
                    <h3 className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">{t.billingInfo}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">{t.companyName}</label>
                            <div className="relative">
                                <Building size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <input 
                                    type="text" 
                                    required
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                    className="w-full border border-slate-200 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-slate-50 focus:bg-white"
                                    placeholder="Aura Hotels Ltd. Şti."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">{t.taxId} / {t.taxOffice}</label>
                            <div className="relative flex gap-2">
                                <div className="relative flex-1">
                                    <FileText size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.taxId}
                                        onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                                        className="w-full border border-slate-200 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-slate-50 focus:bg-white"
                                        placeholder="1234567890"
                                    />
                                </div>
                                <input 
                                    type="text" 
                                    value={formData.taxOffice}
                                    onChange={(e) => setFormData({...formData, taxOffice: e.target.value})}
                                    className="w-1/3 border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-slate-50 focus:bg-white"
                                    placeholder="Office"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact & Web */}
                <div>
                    <h3 className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">{t.contactInfo}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">{t.websiteUrl} <span className="text-primary-500">*</span></label>
                            <div className="relative">
                                <Globe size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <input 
                                    type="url" 
                                    required
                                    value={formData.website}
                                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                                    className="w-full border border-slate-200 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-primary-50/30 border-primary-100 text-primary-900"
                                    placeholder={t.websitePlaceholder}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">{t.phone}</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <input 
                                    type="tel" 
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full border border-slate-200 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-slate-50 focus:bg-white"
                                    placeholder="+90 555 ..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">{t.email}</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <input 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={handleEmailChange}
                                    className={`w-full border p-3 pl-10 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-slate-50 focus:bg-white ${emailError ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`}
                                    placeholder="info@..."
                                />
                            </div>
                            {emailError && <p className="text-xs text-red-500 mt-1 ml-1">{emailError}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">{t.password}</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <input 
                                    type="password" 
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full border border-slate-200 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-slate-50 focus:bg-white"
                                    placeholder="••••••"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                {generalError && (
                    <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg">
                        {generalError}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={!!emailError || loading}
                    className="w-full bg-primary-900 text-white font-bold py-4 rounded-xl hover:bg-primary-800 transition-all shadow-xl shadow-primary-900/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <>{t.continueToSetup} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                </button>

                <div className="text-center mt-4">
                    <button type="button" onClick={switchToLogin} className="text-sm text-slate-500 hover:text-primary-600 underline">
                        Already have an account? Login
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
