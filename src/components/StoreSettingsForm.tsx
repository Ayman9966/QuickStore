import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { TRANSLATIONS } from '../data/translations';
import { Sliders, Save, Check, HelpCircle, Palette } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Amber Orange', hex: '#f59e0b', bg: 'bg-[#f59e0b]', text: 'text-[#f59e0b]' },
  { name: 'Teal Blue', hex: '#0d9488', bg: 'bg-[#0d9488]', text: 'text-[#0d9488]' },
  { name: 'Rose Red', hex: '#e11d48', bg: 'bg-[#e11d48]', text: 'text-[#e11d48]' },
  { name: 'Indigo Violet', hex: '#4f46e5', bg: 'bg-[#4f46e5]', text: 'text-[#4f46e5]' },
  { name: 'Emerald Green', hex: '#059669', bg: 'bg-[#059669]', text: 'text-[#059669]' },
  { name: 'Slate Gray', hex: '#1e293b', bg: 'bg-[#1e293b]', text: 'text-[#1e293b]' }
];

const PRESET_LOGOS = [
  { name: 'Bistro / Cafe', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop&q=80' },
  { name: 'Pizza / Diner', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&h=150&fit=crop&q=80' },
  { name: 'Boutique / Retail', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&h=150&fit=crop&q=80' },
  { name: 'Organic Bakery', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&h=150&fit=crop&q=80' }
];

export const StoreSettingsForm: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const t = TRANSLATIONS[settings.language];

  // Component local draft state
  const [storeName, setStoreName] = useState(settings.storeName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [businessType, setBusinessType] = useState(settings.businessType);
  const [language, setLanguage] = useState(settings.language);
  const [adminPasscode, setAdminPasscode] = useState(settings.adminPasscode || '1234');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      logoUrl,
      primaryColor,
      currencySymbol,
      whatsappNumber,
      businessType,
      language,
      adminPasscode
    });
    
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 3000);
  };

  const isRtl = settings.language === 'ar';

  return (
    <form onSubmit={handleSubmit} className="space-y-8" id="settings-form" dir={isRtl ? 'rtl' : 'ltr'} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <div className="bg-white border border-slate-200/60 rounded-[32px] p-8 shadow-soft">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
          <div>
            <h3 className="font-black text-xl text-slate-950 tracking-tight flex items-center gap-3">
              <Sliders className="w-6 h-6 text-amber-500" />
              {t.tabSettings}
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configure your store identity</p>
          </div>
          
          <button
            type="submit"
            className="bg-slate-950 hover:bg-slate-900 text-white font-black text-xs px-6 py-3.5 rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            {t.saveSettingsBtn}
          </button>
        </div>

        {/* Saved Success Toast */}
        {showSavedToast && (
          <div className="mb-10 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-bold animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <span>{t.settingsSaved}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* General Fields */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2.5">
                  {t.storeName}
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 text-sm font-bold transition-all text-slate-900"
                  placeholder="e.g. Romano's Pizza"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2.5">
                  {t.waNumberLabel}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 text-sm font-bold transition-all text-slate-900"
                    placeholder="e.g. +1234567890"
                  />
                  <HelpCircle className={`w-4 h-4 text-slate-300 absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2`} />
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed">
                  {t.waNumberHelp}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2.5">
                    {t.currencyLabel}
                  </label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    required
                    maxLength={5}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 text-sm font-bold transition-all text-slate-900 text-center"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2.5">
                    {t.businessTypeLabel}
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as 'food' | 'retail')}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 text-sm font-bold transition-all text-slate-900 appearance-none"
                  >
                    <option value="food">🍽️ Food & Beverage</option>
                    <option value="retail">🛍️ Retail & Fashion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2.5">
                  {t.languageLabel}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`p-4 rounded-2xl border font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      language === 'en' ? 'bg-slate-950 border-slate-950 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <span>🇬🇧 English</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('ar')}
                    className={`p-4 rounded-2xl border font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      language === 'ar' ? 'bg-slate-950 border-slate-950 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <span>🇸🇦 العربية</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2.5">
                  {language === 'ar' ? 'رمز حماية لوحة التحكم (Passcode)' : 'Admin Dashboard Passcode (PIN)'}
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 text-sm font-mono font-black transition-all text-slate-900"
                />
                <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed italic">
                  {language === 'ar' 
                    ? '🔒 يحمي لوحة التحكم من وصول العملاء. الرمز الافتراضي: 1234.' 
                    : '🔒 Protects your Admin Dashboard from unauthorized access. Default: 1234.'}
                </p>
              </div>
            </div>
          </div>

          {/* Branding, Logos and Visuals */}
          <div className="space-y-10">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4 text-slate-400" />
                {t.primaryColorLabel}
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setPrimaryColor(col.hex)}
                    className={`p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer group ${
                      primaryColor === col.hex
                        ? 'border-slate-950 bg-slate-50 ring-4 ring-slate-950/5'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-lg ${col.bg} shrink-0 shadow-sm group-hover:scale-110 transition-transform`} />
                    <span className="text-[11px] font-black text-slate-700 truncate tracking-tight">{col.name}</span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  required
                  className={`w-full ${isRtl ? 'pr-14 pl-4' : 'pl-14 pr-4'} py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 text-xs font-mono font-black transition-all text-slate-900 uppercase`}
                />
                <div className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg border border-slate-200 shadow-sm`} style={{ backgroundColor: primaryColor }} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
                {t.logoUrlLabel}
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 text-sm font-bold transition-all text-slate-900 mb-6"
                placeholder="Direct URL to your logo image"
              />

              <div className="space-y-4">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Sample Logo Presets:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESET_LOGOS.map((logo) => (
                    <button
                      key={logo.name}
                      type="button"
                      onClick={() => setLogoUrl(logo.url)}
                      className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                        logoUrl === logo.url
                          ? 'border-slate-950 bg-slate-50 ring-4 ring-slate-950/5'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <img src={logo.url} alt={logo.name} className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm shrink-0" />
                      <span className="text-[11px] font-black text-slate-700 truncate tracking-tight">{logo.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
