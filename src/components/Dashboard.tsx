import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { TRANSLATIONS } from '../data/translations';
import { CsvImporter } from './CsvImporter';
import { CatalogManager } from './CatalogManager';
import { StoreSettingsForm } from './StoreSettingsForm';
import { QrCodeShare } from './QrCodeShare';
import { Storefront } from './Storefront';
import { 
  Home, 
  Store, 
  FileSpreadsheet, 
  Settings, 
  QrCode, 
  Eye, 
  Package, 
  Layers, 
  DollarSign, 
  Smartphone,
  ChevronLeft,
  Sparkles
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { setView, products, settings, updateSettings, currentUser, logoutUser, adminUsername } = useStore();
  const t = TRANSLATIONS[settings.language];
  const isRtl = settings.language === 'ar';

  const [botUsername, setBotUsername] = useState<string>('QuickStoreBuilderBot');
  useEffect(() => {
    fetch('/api/telegram/bot-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.botUsername) {
          setBotUsername(data.botUsername);
        }
      })
      .catch(err => console.error('Error fetching bot info:', err));
  }, []);

  // Active admin tab: 'catalog' | 'csv' | 'settings' | 'qr'
  const [activeTab, setActiveTab] = useState<'catalog' | 'csv' | 'settings' | 'qr'>('catalog');

  // Count analytics
  const totalProducts = products.length;
  const totalCategories = Array.from(new Set(products.map(p => p.category))).length;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans selection:bg-amber-100 flex flex-col">
      {/* Top Admin Nav Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 px-4 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('landing')}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title={t.backToLanding}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-amber-500 text-white p-1.5 rounded-lg">
                <Store className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight text-slate-900 hidden sm:inline">
                {t.dashboardTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <span className="text-slate-500 text-xs hidden sm:inline-block font-mono bg-slate-100 px-3 py-1.5 rounded-xl">
                👤 @{currentUser}
              </span>
            )}
            <button
              onClick={() => setView('customer')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              {t.previewStoreBtn}
            </button>
            {currentUser && (
              <button
                onClick={logoutUser}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Upgrade Banner for Unpaid Users */}
      {!settings.isSubscribed ? (
        <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white py-4 px-4 shadow-sm text-center text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
            <div className="flex items-center gap-1.5 justify-center">
              <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
              <span>
                {isRtl 
                  ? "⚠️ تنبيه: أنت في الخطة المجانية. يتم عرض منتجين لكل قسم، 4 صور بحد أقصى وقسمين فقط للعملاء." 
                  : "⚠️ Notice: You are on the Free Plan. Customers only see 2 products per category, 4 images and 2 pages max."}
              </span>
            </div>
            
            {/* Store ID copy badge inside banner */}
            <div className="bg-black/20 px-2.5 py-1 rounded-lg flex items-center gap-2 text-white border border-white/10 text-xs">
              <span>{isRtl ? "معرّف متجرك:" : "Store ID:"}</span>
              <code className="font-mono font-bold text-amber-200">{settings.storeId || 'N/A'}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(settings.storeId || '');
                  alert(isRtl ? '📋 تم نسخ معرّف المتجر بنجاح!' : '📋 Store ID copied successfully!');
                }}
                className="underline hover:text-amber-100 cursor-pointer"
              >
                {isRtl ? "نسخ" : "Copy"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <button
              onClick={() => {
                updateSettings({ isSubscribed: true });
              }}
              className="bg-white text-orange-700 hover:bg-orange-50 font-black text-[11px] px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isRtl ? "ترقية فورية تجريبية ($15) 🚀" : "Instant Upgrade Demo ($15) 🚀"}</span>
            </button>

            <a
              href={`https://t.me/${adminUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#229ED9] hover:bg-[#1a85b8] text-white font-black text-[11px] px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border border-white/10"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.15-.3.3-.45.45l-4.71 4.71c-.1.1-.1.25 0 .35l1.83 1.83c.1.1.25.1.35 0l4.71-4.71c.15-.15.3-.3.45-.45.2-.2.2-.5 0-.7-.2-.2-.5-.2-.7 0zm-7.93 5.4l1.83 1.83c.1.1.1.25 0 .35l-1.3 1.3c-.1.1-.25.1-.35 0l-1.83-1.83c-.1-.1-.1-.25 0-.35l1.3-1.3c.1-.1.25-.1.35 0z" />
              </svg>
              <span>{isRtl ? `تواصل مع مدير المنصة لتفعيل المتجر مباشرة 💬` : `Chat with Admin directly to activate 💬`}</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500 text-white py-3.5 px-4 shadow-sm text-center text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 justify-center">
            <Sparkles className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>
              {isRtl 
                ? "🌟 تهانينا! متجرك مشترك في الخطة الاحترافية ومفعل بالكامل لجميع الزوار." 
                : "🌟 Congratulations! Your store is subscribed to the Pro Plan and fully unlocked for all visitors."}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://t.me/${adminUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1"
            >
              <span>{isRtl ? "تواصل مع مدير المنصة على تيليجرام 💬" : "Contact Platform Admin on Telegram 💬"}</span>
            </a>

            <button
              onClick={() => updateSettings({ isSubscribed: false })}
              className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              {isRtl ? "تنزيل للخطة المجانية للاختبار" : "Downgrade to Free for testing"}
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Dashboard Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Builder Controls Panel (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Quick Analytics Counters */}
          <div className="grid grid-cols-3 gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Products</span>
                <span className="font-extrabold text-base sm:text-lg text-slate-900 leading-none">{totalProducts}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-x border-slate-100 px-4">
              <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Categories</span>
                <span className="font-extrabold text-base sm:text-lg text-slate-900 leading-none">{totalCategories}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Currency</span>
                <span className="font-extrabold text-base sm:text-lg text-slate-900 leading-none">{settings.currencySymbol}</span>
              </div>
            </div>
          </div>

          {/* Builder Navigation Tab Pill selectors */}
          <div className="border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4.5 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'catalog'
                  ? 'border-amber-500 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Package className="w-4 h-4" />
              {t.tabCatalog}
            </button>

            <button
              onClick={() => setActiveTab('csv')}
              className={`px-4.5 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'csv'
                  ? 'border-amber-500 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              {t.tabUpload}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4.5 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'border-amber-500 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Settings className="w-4 h-4" />
              {t.tabSettings}
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`px-4.5 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'qr'
                  ? 'border-amber-500 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <QrCode className="w-4 h-4" />
              {t.tabQrCode}
            </button>
          </div>

          {/* Tab Render Switcher */}
          <div className="min-h-[400px]">
            {activeTab === 'catalog' && <CatalogManager />}
            {activeTab === 'csv' && <CsvImporter />}
            {activeTab === 'settings' && <StoreSettingsForm />}
            {activeTab === 'qr' && <QrCodeShare />}
          </div>
        </div>

        {/* Right Side: Interactive Live-Updating Smartphone Mockup (4 columns) */}
        <div className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-24 flex flex-col items-center">
            
            {/* Live Phone Indicator Tag */}
            <div className="mb-4 flex items-center gap-1.5 bg-emerald-50 text-emerald-800 font-bold text-[10px] tracking-wider uppercase px-3 py-1.5 border border-emerald-100 rounded-full shadow-sm animate-pulse">
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              <span>Real-time Shop Preview</span>
            </div>

            {/* Smart Phone Shell Card Container */}
            <div className="relative w-[300px] h-[600px] bg-slate-950 rounded-[40px] border-[10px] border-slate-900 shadow-2xl overflow-hidden ring-4 ring-slate-800/10 flex flex-col select-none">
              
              {/* iPhone Notch Speaker Accent */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
                <span className="w-10 h-1 bg-slate-800 rounded-full mb-1" />
              </div>

              {/* Internal Storefront preview */}
              <div className="flex-1 overflow-hidden relative scale-[0.98] origin-top rounded-[32px]">
                {/* Embed the customer-facing Storefront screen directly inside the phone frame */}
                <div className="absolute inset-0 overflow-y-auto pointer-events-none no-scrollbar">
                  <Storefront />
                </div>
              </div>

              {/* Home Indicator line */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-800 rounded-full z-50" />
            </div>

            <p className="text-xs text-slate-400 mt-4 max-w-[240px] text-center leading-relaxed">
              Every customization, catalog entry, and theme color updates instantly in the customer menu above.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};
