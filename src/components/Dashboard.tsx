import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useParams, useNavigate } from 'react-router-dom';
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
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const t = TRANSLATIONS[settings.language];
  const isRtl = settings.language === 'ar';

  const [supportUsername, setSupportUsername] = useState<string>(adminUsername || 'aymaansamy96');
  useEffect(() => {
    fetch('/api/telegram/bot-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.adminUsername) {
          setSupportUsername(data.adminUsername);
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
    <div id="dashboard-page" className="bg-[#f8fafc] min-h-screen text-slate-800 font-sans selection:bg-amber-100 flex flex-col grain">
      {/* Top Admin Nav Bar */}
      <header id="dashboard-header" className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              id="back-to-landing-btn"
              onClick={() => navigate('/')}
              className="p-2.5 -ml-2.5 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all cursor-pointer group"
              title={t.backToLanding}
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-white p-2.5 rounded-[14px] shadow-lg shadow-slate-200">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-slate-900 leading-tight">
                  {settings.storeName || t.dashboardTitle}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                      Local Storage
                    </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-slate-600 text-xs font-semibold">@{currentUser}</span>
              </div>
            )}
            <button
              id="preview-store-btn"
              onClick={() => navigate('/' + restaurantId)}
              className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold text-xs px-4 py-2.5 rounded-[14px] transition-all shadow-soft flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              {t.previewStoreBtn}
            </button>
            {currentUser && (
              <button
                id="logout-btn"
                onClick={logoutUser}
                className="text-slate-400 hover:text-rose-500 font-bold text-xs px-3 py-2.5 rounded-xl transition-all cursor-pointer hover:bg-rose-50/50"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Side: Builder Controls Panel (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          
          {/* Quick Analytics Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-soft hover:shadow-hard transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                  <Package className="w-6 h-6" />
                </div>
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">Live</div>
              </div>
              <div className="text-slate-500 text-xs font-semibold mb-1">Total Products</div>
              <div className="font-black text-3xl text-slate-900 tracking-tight">{totalProducts}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-soft hover:shadow-hard transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">Active</div>
              </div>
              <div className="text-slate-500 text-xs font-semibold mb-1">Categories</div>
              <div className="font-black text-3xl text-slate-900 tracking-tight">{totalCategories}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-soft hover:shadow-hard transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">Config</div>
              </div>
              <div className="text-slate-500 text-xs font-semibold mb-1">Currency</div>
              <div className="font-black text-3xl text-slate-900 tracking-tight">{settings.currencySymbol}</div>
            </div>
          </div>

          {/* Builder Navigation Tab selectors */}
          <div className="bg-slate-100/50 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar border border-slate-200/60">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 min-w-[100px] px-4 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'catalog'
                  ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Package className="w-4 h-4" />
              {t.tabCatalog}
            </button>

            <button
              onClick={() => setActiveTab('csv')}
              className={`flex-1 min-w-[100px] px-4 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'csv'
                  ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              {t.tabUpload}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 min-w-[100px] px-4 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              {t.tabSettings}
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 min-w-[100px] px-4 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'qr'
                  ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <QrCode className="w-4 h-4" />
              {t.tabQrCode}
            </button>
          </div>

          {/* Tab Render Switcher */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft min-h-[500px]">
            {activeTab === 'catalog' && <CatalogManager />}
            {activeTab === 'csv' && <CsvImporter />}
            {activeTab === 'settings' && <StoreSettingsForm />}
            {activeTab === 'qr' && <QrCodeShare />}
          </div>
        </div>

        {/* Right Side: Interactive Smartphone Mockup */}
        <div className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-28 flex flex-col items-center">
            
            {/* Phone Shell */}
            <div className="relative w-[320px] h-[640px] bg-slate-900 rounded-[54px] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] ring-1 ring-slate-800 flex flex-col">
              {/* Dynamic Island */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-28 h-7.5 bg-black rounded-3xl z-50 flex items-center justify-end px-3">
                <div className="w-2 h-2 rounded-full bg-[#1c1c1e] mr-1" />
                <div className="w-2 h-2 rounded-full bg-[#1c1c1e]" />
              </div>

              {/* Screen */}
              <div className="flex-1 bg-white rounded-[44px] overflow-hidden relative shadow-inner">
                <div className="absolute inset-0 overflow-y-auto pointer-events-none no-scrollbar">
                  <Storefront />
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-soft">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                Real-time Preview Active
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Upgrade Call to Action Footer (Sticky for non-subscribers) */}
      {!settings.isSubscribed && (
        <div className="sticky bottom-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">Unlock Full Potential</p>
                <p className="text-xs text-slate-500">Go Pro to remove limits and get custom branding.</p>
              </div>
            </div>
            <button
              onClick={() => {
                window.open(`https://t.me/${supportUsername}`, '_blank');
              }}
              className="bg-slate-900 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isRtl ? 'التواصل المباشر مع الدعم عبر تيليجرام 💬' : 'Direct Support Chat via Telegram 💬'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
