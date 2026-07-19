import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { TRANSLATIONS } from '../data/translations';
import { Product, CartItem } from '../types';
import { 
  ShoppingBag, 
  Search, 
  ChevronRight, 
  Plus, 
  Minus, 
  X, 
  MessageSquare, 
  Moon, 
  Sun, 
  LayoutGrid, 
  List, 
  Check, 
  ChevronLeft, 
  Info,
  Globe,
  Lock,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Storefront: React.FC = () => {
  const { 
    products, 
    settings, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    getWhatsAppLink,
    updateSettings,
    setView,
    view
  } = useStore();

  // Settings translations
  const t = TRANSLATIONS[settings.language];
  const isRtl = settings.language === 'ar';

  // UI state
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartOpen, setCartOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Admin security passcode lock states
  const [passcodeOpen, setPasscodeOpen] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const isSubscribed = !!settings.isSubscribed;

  const [botUsername, setBotUsername] = useState<string>('QuickStoreBuilderBot');

  // Listen to physical keyboard events when passcode modal is open
  useEffect(() => {
    if (!passcodeOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        const reqLen = (settings.adminPasscode || '1234').length;
        if (enteredPasscode.length < reqLen) {
          setEnteredPasscode(prev => prev + e.key);
        }
      } else if (e.key === 'Backspace') {
        setEnteredPasscode(prev => prev.slice(0, -1));
      } else if (e.key === 'Escape') {
        setPasscodeOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [passcodeOpen, enteredPasscode, settings.adminPasscode]);

  // Auto-submit passcode verification
  useEffect(() => {
    const requiredLength = (settings.adminPasscode || '1234').length;
    if (enteredPasscode.length === requiredLength && requiredLength > 0) {
      const delay = setTimeout(() => {
        if (enteredPasscode === (settings.adminPasscode || '1234')) {
          setPasscodeOpen(false);
          setEnteredPasscode('');
          setView('builder');
        } else {
          setPasscodeError(true);
          const shakeDelay = setTimeout(() => {
            setPasscodeError(false);
            setEnteredPasscode('');
          }, 800);
          return () => clearTimeout(shakeDelay);
        }
      }, 150);
      return () => clearTimeout(delay);
    }
  }, [enteredPasscode, settings.adminPasscode, setView]);

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

  // Fake loading skeleton on startup for premium feel
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  // Update language dynamically on storefront
  const toggleLanguage = () => {
    updateSettings({ language: settings.language === 'en' ? 'ar' : 'en' });
  };

  // Update view mode dynamically
  const setViewMode = (mode: 'list' | 'cards') => {
    updateSettings({ viewMode: mode });
  };

  const handleAddToCart = (prod: Product) => {
    addToCart(prod);
    setActiveToast(`${prod.name} ${t.itemAdded}`);
    setTimeout(() => {
      setActiveToast(null);
    }, 2000);
  };

  // 1. Paid users: show everything. Unpaid users: show 2 products per category. Never delete user data
  const getDisplayProducts = () => {
    if (isSubscribed) return products;
    
    const categoryMap: { [key: string]: Product[] } = {};
    products.forEach(p => {
      const cat = p.category || 'General';
      if (!categoryMap[cat]) {
        categoryMap[cat] = [];
      }
      if (categoryMap[cat].length < 2) {
        categoryMap[cat].push(p);
      }
    });
    return Object.values(categoryMap).flat();
  };

  const displayProducts = getDisplayProducts();

  // 2. Unpaid users: show 2 pages only (All + first category, or first two categories). Slicing unique categories to 2.
  const rawCategories = Array.from(new Set(products.map(p => p.category)));
  const uniqueCategories = !isSubscribed
    ? ['All', ...rawCategories].slice(0, 2)
    : ['All', ...rawCategories];

  const hasHiddenCategories = !isSubscribed && rawCategories.length > 1;

  // 3. Unpaid users: show 4 images max
  const allowedImageProductIds = !isSubscribed
    ? displayProducts.filter(p => p.image_url).slice(0, 4).map(p => p.id)
    : displayProducts.map(p => p.id);

  const filteredProducts = displayProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate cart sum
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Group products by category for the Classic List View
  const groupedProducts = uniqueCategories.filter(c => c !== 'All').map(category => ({
    category,
    items: filteredProducts.filter(p => p.category === category)
  })).filter(g => g.items.length > 0);

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`min-h-screen font-sans transition-colors duration-250 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* Customer Header */}
      <header className={`sticky top-0 z-30 shadow-sm backdrop-blur-md transition-colors border-b ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Store logo */}
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.storeName}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-sm shrink-0 select-none">
                <ShoppingBag className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className={`font-black tracking-tight text-base sm:text-lg ${
                darkMode ? 'text-white' : 'text-slate-950'
              }`}>{settings.storeName}</h1>
              <p className={`text-[10px] sm:text-xs font-semibold ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {settings.businessType === 'food' ? '🍽️ Cafe & Bistro' : '🛍️ Retail Outlet'}
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2.5">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className={`p-2.5 sm:p-3 rounded-xl border transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-bold ${
                darkMode 
                  ? 'border-slate-800 hover:bg-slate-800 text-slate-300' 
                  : 'border-slate-200 hover:bg-slate-100 text-slate-750'
              }`}
              title="Change Language"
            >
              <Globe className="w-4.5 h-4.5 text-amber-500" />
              <span className="hidden sm:inline">{settings.language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 sm:p-3 rounded-xl border transition-colors cursor-pointer ${
                darkMode 
                  ? 'border-slate-800 hover:bg-slate-800 text-amber-400' 
                  : 'border-slate-200 hover:bg-slate-100 text-slate-650'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              style={{ backgroundColor: settings.primaryColor }}
              className="text-white p-2.5 sm:p-3 rounded-xl shadow-md font-extrabold flex items-center gap-1.5 cursor-pointer relative shrink-0 transition-opacity hover:opacity-90"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ring-1 ring-red-500/10">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Back to Creator Panel Alert (For demo purposes) */}
      {view !== 'customer' && (
        <div className={`py-2 px-4 text-center text-xs font-semibold border-b ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-amber-50 border-amber-100 text-amber-800'
        }`}>
          <span className="mr-2">🔧 {isRtl ? 'وضع إدارة المتجر:' : 'Owner Mode:'}</span>
          <button 
            onClick={() => {
              setEnteredPasscode('');
              setPasscodeError(false);
              setPasscodeOpen(true);
            }}
            className="underline hover:text-amber-600 font-bold cursor-pointer"
          >
            {isRtl ? 'اضغط للعودة إلى لوحة التحكم وتعديل الألوان أو رفع ملف CSV (مَحمي بكلمة مرور)' : 'Click to return to Admin Dashboard (Passcode Protected)'}
          </button>
        </div>
      )}

      {/* Upgrade Banner for Unpaid Users */}
      {view !== 'customer' && !isSubscribed && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white py-4 px-4 shadow-md text-center text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 justify-center">
            <Sparkles className="w-4.5 h-4.5 text-amber-200 shrink-0" />
            <span className="leading-relaxed">
              {isRtl 
                ? "⚠️ تنبيه: أنت تستخدم النسخة المجانية (يظهر للعملاء منتجين لكل قسم، 4 صور بحد أقصى، وقسمين فقط)." 
                : "⚠️ Notice: You are on the Free Plan (Showing only 2 products per category, 4 images, 2 pages only)."}
            </span>
          </div>
          <button
            onClick={() => setUpgradeOpen(true)}
            className="w-full sm:w-auto bg-white text-orange-700 hover:bg-orange-50 font-black text-sm sm:text-xs px-5 py-3 sm:px-4 sm:py-2 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isRtl ? "ترقية المتجر وإلغاء القيود 🚀" : "Upgrade & Unlock Store 🚀"}</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Categories bar */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm font-semibold transition-all ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-800 text-white focus:border-amber-500' 
                    : 'bg-white border-slate-200 text-slate-800 focus:border-amber-500'
                }`}
              />
              <Search className={`w-4.5 h-4.5 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400`} />
            </div>
            
            {/* View Mode Toggle Button */}
            <button
              onClick={() => setViewMode(settings.viewMode === 'cards' ? 'list' : 'cards')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                darkMode 
                  ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white' 
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              }`}
              title={settings.viewMode === 'cards' ? t.classicListMode : t.modernCardMode}
            >
              {settings.viewMode === 'cards' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
            </button>
          </div>

          {/* Categories Selector Carousel */}
          <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar justify-start sm:justify-center scroll-smooth">
            {uniqueCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{ 
                  backgroundColor: selectedCategory === cat ? settings.primaryColor : undefined,
                  borderColor: selectedCategory === cat ? settings.primaryColor : undefined
                }}
                className={`px-5 py-3 rounded-full text-sm sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                  selectedCategory === cat
                    ? 'text-white shadow-sm'
                    : (darkMode 
                        ? 'border-slate-800 bg-slate-900 text-slate-350 hover:text-white' 
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100')
                }`}
              >
                {cat === 'All' ? t.categoryAll : cat}
              </button>
            ))}
            {hasHiddenCategories && (
              <button
                onClick={() => setUpgradeOpen(true)}
                className={`px-5 py-3 rounded-full text-sm sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer border border-dashed border-amber-300 dark:border-amber-900/60 bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-1.5 hover:bg-amber-500/20`}
                title="أقسام إضافية متوفرة في النسخة المدفوعة"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>{isRtl ? 'أقسام إضافية 🔒' : 'More Pages 🔒'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-6 w-32 bg-slate-300 dark:bg-slate-800 rounded mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between aspect-[16/11]">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-slate-250 dark:bg-slate-800 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-250 dark:bg-slate-800 rounded w-2/3" />
                      <div className="h-3 bg-slate-250 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-8 bg-slate-250 dark:bg-slate-800 rounded w-full mt-4" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-8 max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1">No products available</h3>
            <p className="text-slate-400 text-xs max-w-xs mx-auto">Either there are no items matching this filter or the store catalog is currently offline.</p>
          </div>
        ) : (
          /* Swappable Product grid/list displays */
          settings.viewMode === 'cards' ? (
            /* CARDS VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(prod => (
                <div 
                  key={prod.id} 
                  className={`border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group transition-all hover:-translate-y-0.5 ${
                    darkMode 
                      ? 'bg-slate-900 border-slate-800/80 hover:border-slate-700' 
                      : 'bg-white border-slate-200/60 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Item Image area */}
                    <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-950 relative overflow-hidden shrink-0 border-b dark:border-slate-800">
                      {prod.image_url ? (
                        allowedImageProductIds.includes(prod.id) ? (
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          />
                        ) : (
                          <div 
                            className="w-full h-full bg-slate-900/10 dark:bg-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:bg-amber-500/10 transition-colors"
                            onClick={() => setUpgradeOpen(true)}
                          >
                            <Lock className="w-5 h-5 text-amber-500 mb-1 animate-bounce" />
                            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 block px-1.5 py-0.5 rounded-md bg-amber-500/10">
                              {isRtl ? 'صورة مقفلة (نسخة مدفوعة) 🔒' : 'Premium Image 🔒'}
                            </span>
                            <span className="text-[9px] text-slate-400 mt-1 block max-w-[150px] leading-tight">
                              {isRtl ? 'الخطة المجانية تظهر 4 صور فقط' : 'Free plan limited to 4 images'}
                            </span>
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}

                      {/* Currency badge float */}
                      <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full text-xs font-black shadow-sm text-amber-500">
                        {settings.currencySymbol}
                        {prod.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Meta info area */}
                    <div className="p-4 sm:p-5">
                      <div className="mb-2">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold bg-amber-50 dark:bg-slate-850 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-slate-800 px-2.5 py-0.5 rounded-full">
                          {prod.category}
                        </span>
                      </div>
                      <h3 className={`font-bold text-sm sm:text-base leading-tight mb-2 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>{prod.name}</h3>
                      <p className={`text-xs leading-relaxed line-clamp-3 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>{prod.description}</p>
                    </div>
                  </div>

                  {/* Add / Checkout Actions footer */}
                  <div className="p-4 pt-0 border-t dark:border-slate-800/60 flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(prod)}
                      style={{ 
                        borderColor: settings.primaryColor,
                        color: settings.primaryColor
                      }}
                      className="flex-1 border text-xs font-bold py-2.5 rounded-xl transition-all hover:bg-slate-100/50 dark:hover:bg-slate-850 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t.addToCart}
                    </button>
                    
                    {/* Instant Direct Order on WhatsApp button */}
                    <a
                      href={getWhatsAppLink(prod)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs p-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center"
                      title={t.orderNow}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* CLASSIC LIST VIEW (Dividers, grouped categories, clean alignment) */
            <div className="space-y-10 max-w-3xl mx-auto">
              {groupedProducts.map(group => (
                <div key={group.category} className="space-y-4">
                  {/* Category Title Heading */}
                  <div className="flex items-center gap-3">
                    <h2 className={`font-black text-lg sm:text-xl tracking-tight ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>{group.category}</h2>
                    <div className="flex-1 h-[2px] bg-slate-200 dark:bg-slate-800" />
                  </div>

                  {/* Category Items list */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-900">
                    {group.items.map(prod => (
                      <div 
                        key={prod.id} 
                        className="py-4.5 sm:py-5 flex items-start gap-4 hover:bg-slate-150/10 dark:hover:bg-slate-900/30 rounded-xl px-2.5 transition-colors"
                      >
                        {/* Compact thumbnail */}
                        {prod.image_url && (
                          allowedImageProductIds.includes(prod.id) ? (
                            <img 
                              src={prod.image_url} 
                              alt={prod.name} 
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-slate-250 dark:border-slate-800 shadow-sm shrink-0" 
                            />
                          ) : (
                            <div 
                              onClick={() => setUpgradeOpen(true)}
                              className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-900 border border-amber-200/50 dark:border-amber-900/40 rounded-xl flex flex-col items-center justify-center text-center p-1 cursor-pointer hover:bg-amber-500/10 transition-colors shrink-0"
                              title="أنت في الخطة المجانية"
                            >
                              <Lock className="w-4 h-4 text-amber-500" />
                              <span className="text-[8px] text-amber-600 dark:text-amber-400 font-extrabold mt-1">
                                {isRtl ? 'مقفل 🔒' : 'Locked 🔒'}
                              </span>
                            </div>
                          )
                        )}

                        {/* Text and metadata layout */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <h3 className={`font-bold text-sm sm:text-base ${
                              darkMode ? 'text-white' : 'text-slate-950'
                            }`}>{prod.name}</h3>
                            <span className="font-extrabold text-amber-500 text-sm sm:text-base shrink-0">
                              {settings.currencySymbol}
                              {prod.price.toFixed(2)}
                            </span>
                          </div>
                          
                          <p className={`text-xs leading-relaxed mb-3.5 line-clamp-2 ${
                            darkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>{prod.description}</p>

                          {/* Quick checkout */}
                          <div className="flex flex-wrap items-center gap-2.5 mt-1">
                            <button
                              onClick={() => handleAddToCart(prod)}
                              style={{ backgroundColor: settings.primaryColor }}
                              className="text-white font-bold text-xs sm:text-[11px] px-4.5 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer min-h-[42px]"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              {t.addToCart}
                            </button>
                            <a
                              href={getWhatsAppLink(prod)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold text-xs sm:text-[11px] px-4.5 py-2.5 rounded-xl border border-emerald-200/50 dark:border-emerald-900/50 flex items-center gap-1.5 transition-colors min-h-[42px]"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              {t.orderNow}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {/* Floating Active Toast Notification */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 p-4 rounded-2xl shadow-xl flex items-center gap-2.5 border text-xs sm:text-sm font-semibold ${
              darkMode 
                ? 'bg-slate-900 border-slate-800 text-white shadow-slate-950/40' 
                : 'bg-white border-slate-100 text-slate-850 shadow-slate-200/50'
            }`}
          >
            <div className="bg-emerald-100 text-emerald-700 rounded-full p-1">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{activeToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Slider Panel Draw-out */}
      <AnimatePresence>
        {cartOpen && (
          <>
            {/* Backdrop lock */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-slate-950 z-40"
            />

            {/* Slider container */}
            <motion.div
              initial={{ x: isRtl ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`fixed top-0 bottom-0 ${isRtl ? 'left-0' : 'right-0'} w-full max-w-md z-50 border-t sm:border-t-0 shadow-2xl flex flex-col justify-between ${
                darkMode ? 'bg-slate-900 border-slate-850 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {/* Drawer head */}
              <div className="px-5 py-4 border-b dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{t.shoppingCart}</h4>
                  <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                    {cartCount} items
                  </span>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-24 flex flex-col items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">{t.cartEmpty}</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div 
                      key={item.product.id} 
                      className="flex items-start gap-3.5 pb-4 border-b dark:border-slate-800/60"
                    >
                      {item.product.image_url && (
                        <img 
                          src={item.product.image_url} 
                          alt={item.product.name} 
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0" 
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-bold text-slate-900 dark:text-white text-xs truncate leading-tight">{item.product.name}</h5>
                          <span className="font-bold text-xs shrink-0 text-slate-900 dark:text-white">
                            {settings.currencySymbol}
                            {(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{settings.currencySymbol}{item.product.price.toFixed(2)} each</span>

                        {/* Quantity manipulators */}
                        <div className="flex items-center gap-3 mt-2.5">
                          <div className={`p-1 border dark:border-slate-800 rounded-xl flex items-center gap-2 ${
                            darkMode ? 'bg-slate-950' : 'bg-slate-50'
                          }`}>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="p-2 rounded-lg hover:bg-slate-250 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 cursor-pointer active:scale-90 transition-transform"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold w-5 text-center text-slate-800 dark:text-slate-100">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="p-2 rounded-lg hover:bg-slate-250 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 cursor-pointer active:scale-90 transition-transform"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer p-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Foot summary */}
              {cart.length > 0 && (
                <div className="p-5 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{t.subtotal}</span>
                      <span>{settings.currencySymbol}{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-extrabold text-slate-900 dark:text-white">
                      <span>{t.total}</span>
                      <span>{settings.currencySymbol}{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <a
                    href={getWhatsAppLink(cart)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm py-4 rounded-2xl transition-colors shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>{t.sendOrder}</span>
                  </a>

                  <button
                    onClick={clearCart}
                    className="w-full text-center text-[10px] text-slate-400 hover:text-slate-500 hover:underline cursor-pointer"
                  >
                    Clear Order Cart
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Upgrade / Subscription Modal */}
      <AnimatePresence>
        {upgradeOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setUpgradeOpen(false)}
              className="fixed inset-0 bg-slate-950 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md z-[60] p-6 rounded-3xl shadow-2xl border flex flex-col justify-between ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-100 dark:bg-amber-950/40 p-2 rounded-2xl">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                    {isRtl ? 'الترقية للمتجر الاحترافي ✨' : 'Upgrade to Pro Store ✨'}
                  </h4>
                </div>
                <button
                  onClick={() => setUpgradeOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm leading-relaxed mb-6">
                <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                  {isRtl 
                    ? 'أطلق العنان لكامل إمكانيات متجرك! عند الاشتراك في الخطة الاحترافية، سيتم تفعيل الميزات التالية فوراً وبشكل تلقائي للعملاء:' 
                    : 'Unlock the full potential of your online store! Upgrading to the professional plan instantly activates:'}
                </p>

                <div className="space-y-2 bg-amber-500/5 dark:bg-amber-500/10 p-4 rounded-2xl border border-amber-500/10">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {isRtl ? 'منتجات وقوائم غير محدودة' : 'Unlimited Products & Categories'}
                      </span>
                      <span className="text-[11.5px] text-slate-600 dark:text-slate-300 block leading-normal font-medium">
                        {isRtl ? 'عرض كافة منتجات الكتالوج للعملاء (بدلاً من منتجين فقط لكل قسم).' : 'Show all catalog items to customers (instead of just 2 per category).'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {isRtl ? 'صور غير محدودة' : 'Unlimited Images'}
                      </span>
                      <span className="text-[11.5px] text-slate-600 dark:text-slate-300 block leading-normal font-medium">
                        {isRtl ? 'عرض صور كافة المنتجات دون قيود أو إخفاء (بدلاً من 4 صور فقط).' : 'Show images for all your products without any premium locks.'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {isRtl ? 'أقسام وصفحات كاملة' : 'Full Navigation & Pages'}
                      </span>
                      <span className="text-[11.5px] text-slate-600 dark:text-slate-300 block leading-normal font-medium">
                        {isRtl ? 'تصفح غير محدود لكافة الأقسام والمجموعات داخل متجرك.' : 'Navigate through all custom pages and categories without limits.'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center p-3 rounded-xl bg-slate-100 dark:bg-slate-850">
                  <span className="text-[11px] text-slate-550 dark:text-slate-400 block font-semibold">
                    {isRtl ? 'قيمة الاشتراك الشهري' : 'Monthly Subscription'}
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block">
                    $15.00<span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/{isRtl ? 'شهرياً' : 'month'}</span>
                  </span>
                </div>

                <div className="bg-amber-500/5 dark:bg-amber-500/10 p-3 rounded-2xl border border-amber-500/10 text-center space-y-1.5">
                  <span className="text-[10px] text-slate-550 dark:text-slate-400 block font-bold uppercase tracking-wider">
                    {isRtl ? 'معرف متجرك الخاص (Store ID)' : 'Your Unique Store ID'}
                  </span>
                  <div className="flex items-center justify-center gap-1.5">
                    <code className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-xs font-mono font-bold text-amber-500">
                      {settings.storeId || 'N/A'}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(settings.storeId || '');
                        setActiveToast(isRtl ? '📋 تم نسخ معرف المتجر!' : '📋 Store ID copied!');
                        setTimeout(() => setActiveToast(null), 2500);
                      }}
                      className="text-[10px] underline text-slate-500 hover:text-amber-600 font-bold cursor-pointer"
                    >
                      {isRtl ? 'نسخ' : 'Copy'}
                    </button>
                  </div>
                </div>

                <a
                  href={`https://t.me/${botUsername}?start=${settings.storeId || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#229ED9] hover:bg-[#1a85b8] text-white font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all text-center"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.15-.3.3-.45.45l-4.71 4.71c-.1.1-.1.25 0 .35l1.83 1.83c.1.1.25.1.35 0l4.71-4.71c.15-.15.3-.3.45-.45.2-.2.2-.5 0-.7-.2-.2-.5-.2-.7 0zm-7.93 5.4l1.83 1.83c.1.1.1.25 0 .35l-1.3 1.3c-.1.1-.25.1-.35 0l-1.83-1.83c-.1-.1-.1-.25 0-.35l1.3-1.3c.1-.1.25-.1.35 0z" />
                  </svg>
                  <span>{isRtl ? 'تفعيل وإدارة الاشتراك عبر تيليجرام 💬' : 'Activate & Manage via Telegram Bot 💬'}</span>
                </a>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setUpgradeOpen(false)}
                  className={`flex-1 font-bold text-xs py-3.5 rounded-2xl border transition-all cursor-pointer ${
                    darkMode 
                      ? 'border-slate-800 hover:bg-slate-800 text-slate-300' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    updateSettings({ isSubscribed: true });
                    setUpgradeOpen(false);
                    setActiveToast(isRtl ? '🎉 تم تفعيل الخطة الاحترافية وإلغاء كافة القيود بنجاح!' : '🎉 Pro Plan activated successfully! All limits unlocked.');
                    setTimeout(() => setActiveToast(null), 3000);
                  }}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-xs py-3.5 rounded-2xl shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isRtl ? 'اشترك الآن' : 'Subscribe Now'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Admin Passcode Gate Modal */}
      <AnimatePresence>
        {passcodeOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setPasscodeOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm z-[110] p-6 rounded-[32px] shadow-2xl border flex flex-col items-center ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Lock className="w-6 h-6 text-amber-500" />
              </div>

              <h4 className="font-extrabold text-base sm:text-lg mb-1 text-center">
                {isRtl ? 'التحقق من الهوية (محمي)' : 'Security Verification'}
              </h4>
              <p className="text-xs text-slate-400 mb-4 text-center leading-relaxed">
                {isRtl 
                  ? 'أدخل رمز حماية المدير للوصول إلى لوحة التحكم' 
                  : 'Enter the admin passcode to access your control panel'}
              </p>

              {/* Secure Dots Visualizer */}
              <motion.div
                animate={passcodeError ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="flex justify-center gap-3.5 my-6"
              >
                {Array.from({ length: (settings.adminPasscode || '1234').length }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      passcodeError
                        ? 'bg-red-500 border-red-500 animate-pulse'
                        : idx < enteredPasscode.length
                        ? 'bg-amber-500 border-amber-500 scale-125 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                        : darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-100'
                    }`}
                  />
                ))}
              </motion.div>

              {/* Numerical Virtual Keypad */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-6">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      const reqLen = (settings.adminPasscode || '1234').length;
                      if (enteredPasscode.length < reqLen) {
                        setEnteredPasscode(prev => prev + num);
                      }
                    }}
                    className={`h-14 rounded-2xl font-mono text-xl font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                      darkMode 
                        ? 'bg-slate-800 hover:bg-slate-700 text-white active:bg-slate-650' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900 active:bg-slate-300'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                
                {/* Clear 'C' key */}
                <button
                  type="button"
                  onClick={() => setEnteredPasscode('')}
                  className={`h-14 rounded-2xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                    darkMode ? 'bg-slate-800 hover:bg-red-950/40 text-red-400' : 'bg-slate-100 hover:bg-red-50 text-red-500'
                  }`}
                >
                  {isRtl ? 'مسح' : 'Clear'}
                </button>

                {/* '0' key */}
                <button
                  type="button"
                  onClick={() => {
                    const reqLen = (settings.adminPasscode || '1234').length;
                    if (enteredPasscode.length < reqLen) {
                      setEnteredPasscode(prev => prev + '0');
                    }
                  }}
                  className={`h-14 rounded-2xl font-mono text-xl font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                    darkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 text-white active:bg-slate-650' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 active:bg-slate-300'
                  }`}
                >
                  0
                </button>

                {/* Backspace key */}
                <button
                  type="button"
                  onClick={() => setEnteredPasscode(prev => prev.slice(0, -1))}
                  className={`h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                    darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                  }`}
                >
                  {isRtl ? '←' : '←'}
                </button>
              </div>

              {/* Status / Feedback message */}
              {passcodeError && (
                <p className="text-xs text-red-500 font-bold mb-4 animate-bounce">
                  ❌ {isRtl ? 'الرمز غير صحيح! حاول مجدداً.' : 'Incorrect passcode! Try again.'}
                </p>
              )}

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setPasscodeOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold underline cursor-pointer"
              >
                {isRtl ? 'إلغاء وإغلاق' : 'Cancel & Go Back'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
