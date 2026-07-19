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

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="settings-form">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-500" />
            {t.tabSettings}
          </h3>
          
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-3 sm:px-4 sm:py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            {t.saveSettingsBtn}
          </button>
        </div>

        {/* Saved Success Toast */}
        {showSavedToast && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 text-emerald-800 text-sm animate-fadeIn">
            <Check className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{t.settingsSaved}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                {t.storeName}
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium transition-all"
                placeholder="e.g. Romano's Pizza, Blue Horizon Retail"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                {t.waNumberLabel}
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium transition-all"
                placeholder="e.g. +1234567890"
              />
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1.5">
                <HelpCircle className="w-3 h-3 text-slate-400" />
                {t.waNumberHelp}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  {t.currencyLabel}
                </label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  required
                  maxLength={5}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium transition-all text-center"
                  placeholder="e.g. $, €, ر.س"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  {t.businessTypeLabel}
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as 'food' | 'retail')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium transition-all bg-white"
                >
                  <option value="food">🍽️ Food & Beverage</option>
                  <option value="retail">🛍️ Retail & Fashion</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                {t.languageLabel}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium transition-all bg-white"
              >
                <option value="en">🇬🇧 English (LTR Layout)</option>
                <option value="ar">🇸🇦 العربية (RTL Layout)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                {language === 'ar' ? 'رمز حماية لوحة التحكم (Passcode)' : 'Admin Dashboard Passcode (PIN)'}
              </label>
              <input
                type="text"
                maxLength={8}
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-mono font-bold transition-all"
                placeholder="e.g. 1234"
              />
              <span className="text-[10px] text-slate-400 block mt-1.5 leading-normal">
                {language === 'ar' 
                  ? '🔒 يحمي لوحة التحكم من وصول العملاء عند الضغط على "وضع إدارة المتجر". القيمة الافتراضية هي 1234.' 
                  : '🔒 Protects your Admin Dashboard from unauthorized customer access. Default value is 1234.'}
              </span>
            </div>
          </div>

          {/* Branding, Logos and Visuals */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-slate-400" />
                {t.primaryColorLabel}
              </label>
              
              {/* Preset Palette Circular select */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3.5">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setPrimaryColor(col.hex)}
                    className={`p-3.5 sm:p-2.5 rounded-xl border text-sm sm:text-xs font-semibold flex items-center justify-start gap-2 cursor-pointer transition-all active:scale-95 ${
                      primaryColor === col.hex
                        ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/5 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${col.bg} shrink-0`} />
                    <span className="truncate text-slate-700">{col.name}</span>
                  </button>
                ))}
              </div>

              {/* Advanced Custom Hex Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs font-mono font-medium transition-all"
                    placeholder="Hex format: #ffffff"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full border border-slate-200" style={{ backgroundColor: primaryColor }} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                {t.logoUrlLabel}
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium transition-all mb-3.5"
                placeholder="Paste direct URL to your logo image"
              />

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Or Select a Sample Logo Preset:</span>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_LOGOS.map((logo) => (
                    <button
                      key={logo.name}
                      type="button"
                      onClick={() => setLogoUrl(logo.url)}
                      className={`p-3.5 sm:p-2 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer transition-all active:scale-95 ${
                        logoUrl === logo.url
                          ? 'border-amber-500 bg-amber-50/25'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={logo.url} alt={logo.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                      <span className="text-sm sm:text-xs text-slate-700 font-semibold truncate">{logo.name}</span>
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
