import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { TRANSLATIONS } from '../data/translations';
import { 
  Store, 
  Upload, 
  MessageSquare, 
  QrCode, 
  Sliders, 
  Sparkles, 
  ChevronRight, 
  Play, 
  Check, 
  Clock, 
  TrendingUp, 
  Languages,
  Lock,
  User,
  Phone,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setView, loadDemoData, settings, currentUser, loginUser, registerUser, logoutUser } = useStore();
  const t = TRANSLATIONS.en; // Use English for the main builder landing page

  // Auth Overlay / Modal states
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [businessType, setBusinessType] = useState<'food' | 'retail'>('retail');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTryDemo = () => {
    loadDemoData();
    navigate('/demo/admin');
  };

  const handleStartBuilder = () => {
    if (currentUser) {
      navigate(`/${currentUser}/admin`);
    } else {
      setError(null);
      setAuthMode('signup');
      setAuthOpen(true);
    }
  };

  const handleOpenLogin = () => {
    setError(null);
    setAuthMode('login');
    setAuthOpen(true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authMode === 'login') {
        const res = await loginUser({ username, password });
        if (res.success) {
          setAuthOpen(false);
          navigate(`/${username}/admin`);
        } else {
          setError(res.error || 'Invalid credentials');
        }
      } else {
        if (!storeName.trim() || !whatsappNumber.trim()) {
          setError('Please fill in all store metadata fields');
          setLoading(false);
          return;
        }
        const res = await registerUser({
          username,
          password,
          storeName,
          whatsappNumber,
          businessType,
          language
        });
        if (res.success) {
          setAuthOpen(false);
          navigate(`/${username}/admin`);
        } else {
          setError(res.error || 'Registration failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div id="landing-page" className="bg-slate-50 min-h-screen text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden">
      {/* Header Navigation */}
      <nav id="main-nav" className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 text-white p-2 rounded-xl shadow-md shadow-amber-500/20">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-amber-600 bg-clip-text text-transparent">
              QuickStore
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              id="try-demo-btn"
              onClick={handleTryDemo}
              className="text-slate-600 hover:text-amber-600 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors duration-150"
            >
              Try Demo
            </button>
            {currentUser ? (
              <>
                <span className="text-slate-400 text-xs hidden sm:inline-block font-mono bg-slate-100 px-2.5 py-1.5 rounded-lg">
                  👤 @{currentUser}
                </span>
                <button 
                  id="logout-btn"
                  onClick={logoutUser}
                  className="text-red-500 hover:text-red-600 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors duration-150"
                >
                  Logout
                </button>
                <button 
                  id="go-to-dashboard-btn"
                  onClick={() => setView('builder')}
                  className="bg-slate-900 text-white hover:bg-slate-800 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-150 shadow-sm"
                >
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <button 
                  id="login-btn"
                  onClick={handleOpenLogin}
                  className="text-slate-700 hover:text-amber-600 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors duration-150"
                >
                  Log In
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="hero-section" className="relative py-24 px-4 overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-200/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-teal-100/40 rounded-full blur-2xl -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 font-semibold text-xs uppercase tracking-wider px-3 py-1.5 rounded-full border border-amber-100 mb-6 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {t.freeTrialBadge}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl sm:text-7xl font-black tracking-tight text-slate-950 leading-tight mb-8"
          >
            Launch Your <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">Online Store</span> in Minutes
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-12"
          >
            {t.heroSubtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
          >
            <button
              id="start-builder-btn"
              onClick={handleStartBuilder}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-amber-500/20 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
            >
              {t.buildStoreBtn}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              id="try-demo-btn-hero"
              onClick={handleTryDemo}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 font-semibold px-8 py-4 rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
              {t.tryDemoBtn}
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-xs text-slate-500 flex items-center justify-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {t.noCardRequired}
          </motion.div>
        </div>
      </header>

      {/* Visual Mockup Section */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-3 relative">
          <div className="bg-slate-100 rounded-2xl border border-slate-200/50 min-h-[520px] md:min-h-0 md:aspect-[16/9] flex flex-col overflow-hidden relative">
            {/* Header of fake workspace */}
            <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-400 font-mono ml-2">quickstore.io/my-cafe-preview</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Customer Preview
              </div>
            </div>

            {/* Simulated Live Cafe App */}
            <div className="flex-1 bg-slate-50 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              <div className="col-span-12 md:col-span-8 p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&h=100&fit=crop&q=80" 
                      alt="Logo" 
                      className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500 shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-lg text-slate-950">Bella Vista Cafe Menu</h3>
                      <p className="text-xs text-slate-500">Fresh organic brews & hand-stretched stone pizzas</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-2 mb-6">
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">CSV Auto-Parsed</span>
                    <span className="text-xs text-slate-600">12 products instantly structured across 3 categories</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-3">
                      <img src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=120" className="w-16 h-16 object-cover rounded-lg" alt="Margherita Pizza" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-xs text-slate-900 truncate">Margherita Pizza</h4>
                          <span className="font-bold text-xs text-amber-600">$12.99</span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">Fresh buffalo mozzarella, tomato basil sauce.</p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-3">
                      <img src="https://images.unsplash.com/photo-1534778101976-62847782c213?w=120" className="w-16 h-16 object-cover rounded-lg" alt="Tuscan Cappuccino" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-xs text-slate-900 truncate">Tuscan Cappuccino</h4>
                          <span className="font-bold text-xs text-amber-600">$4.50</span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">Espresso with warm frothy milk & organic cocoa.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center bg-white border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <TrendingUp className="w-4 h-4 text-emerald-500 animate-bounce" />
                    <span>WhatsApp Order Ready</span>
                  </div>
                  <div className="bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Order on WhatsApp</span>
                  </div>
                </div>
              </div>

              {/* Sidebar Settings controller */}
              <div className="hidden md:flex md:col-span-4 bg-white p-6 flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    <span>Branding Controls</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">ACCENT COLOR</label>
                      <div className="flex gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500 ring-2 ring-offset-2 ring-slate-900 cursor-pointer" />
                        <span className="w-6 h-6 rounded-full bg-teal-600 cursor-pointer" />
                        <span className="w-6 h-6 rounded-full bg-rose-500 cursor-pointer" />
                        <span className="w-6 h-6 rounded-full bg-indigo-600 cursor-pointer" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">CATALOG VIEW LAYOUT</label>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="border-2 border-amber-500 bg-amber-50 text-amber-900 font-semibold text-[10px] py-1.5 rounded-lg text-center cursor-pointer block">Grid Cards</span>
                        <span className="border border-slate-200 text-slate-500 text-[10px] py-1.5 rounded-lg text-center cursor-pointer block">Vertical List</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">BILINGUAL LAYOUT</label>
                      <div className="flex gap-2">
                        <span className="bg-slate-100 text-slate-800 font-semibold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Languages className="w-3 h-3" /> LTR English
                        </span>
                        <span className="border border-slate-200 text-slate-400 text-[10px] px-2.5 py-1 rounded-full">
                          RTL العربية
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="border-t border-slate-150 pt-4 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">SCAN PHYSICAL MENU</span>
                    <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl inline-block shadow-sm">
                      <QrCode className="w-14 h-14 text-slate-800" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-white py-24 px-4 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 mb-4">
              {t.featuresTitle}
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Skip complex e-commerce builders, servers, and hosting fees. Launch your storefront with just a spreadsheet.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <motion.div variants={itemVariants} className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5 shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{t.featureCsvTitle}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t.featureCsvDesc}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5 shadow-sm">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{t.featureWaTitle}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t.featureWaDesc}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5 shadow-sm">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{t.featureQrTitle}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t.featureQrDesc}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5 shadow-sm">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{t.featureCustomTitle}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t.featureCustomDesc}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section - Prominent 14-Day Free Trial */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">{t.pricingTitle}</h2>
            <p className="text-slate-600 max-w-lg mx-auto">{t.pricingDesc}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 max-w-3xl mx-auto relative">
            <div className="absolute top-4 right-4">
              <span className="bg-amber-100 text-amber-800 font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full border border-amber-200 shadow-sm">
                Most Popular
              </span>
            </div>

            <div className="md:col-span-7 p-8 sm:p-10">
              <h3 className="font-extrabold text-2xl text-slate-900 mb-2">{t.pricingPlanName}</h3>
              <p className="text-slate-500 text-sm mb-6">Fully featured access. Launch your direct ordering channel today.</p>

              <ul className="space-y-3.5">
                {[t.pricingFeature1, t.pricingFeature2, t.pricingFeature3, t.pricingFeature4, t.pricingFeature5].map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <div className="bg-emerald-100 text-emerald-700 rounded-full p-0.5 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-5 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-8 flex flex-col justify-between items-center text-center">
              <div>
                <span className="text-slate-400 font-semibold text-xs tracking-wider uppercase block mb-1">
                  14-DAY TRIAL
                </span>
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-slate-400 font-medium text-2xl">$</span>
                  <span className="text-slate-900 font-black text-5xl tracking-tight">0</span>
                  <span className="text-slate-500 text-sm font-medium">/14 days</span>
                </div>
                <span className="text-xs text-slate-400 block mt-2">
                  Then {settings.currencySymbol}{t.pricingPrice}{t.pricingPeriod}
                </span>
              </div>

              <div className="w-full mt-8">
                <button
                  onClick={handleStartBuilder}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-colors"
                >
                  {t.startTrialBtn}
                </button>
                <span className="text-[10px] text-slate-400 mt-2 block">{t.noCardRequired}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Store className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-slate-900">QuickStore Builder</span>
          </div>
          <p className="text-xs text-slate-500">{t.footerCopyright}</p>
        </div>
      </footer>

      {/* Sign Up / Log In Modal */}
      <AnimatePresence>
        {authOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md z-[110] bg-white border border-slate-200 p-6 sm:p-8 rounded-[28px] shadow-2xl flex flex-col overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-500 text-white p-1.5 rounded-lg">
                    <Store className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-lg bg-gradient-to-r from-slate-900 to-amber-600 bg-clip-text text-transparent">
                    {authMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 border border-red-100 text-xs font-medium p-3.5 rounded-xl mb-4 leading-normal flex items-start gap-2">
                  <span>❌</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {/* Credentials */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                    Username / Email
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. coffee_owner"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Additional metadata for registration only */}
                {authMode === 'signup' && (
                  <div className="space-y-4 pt-2 border-t border-slate-100 mt-4">
                    <span className="text-[10px] text-amber-600 font-extrabold tracking-wider uppercase block">
                      Store Information
                    </span>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                        Store Name
                      </label>
                      <input
                        type="text"
                        required={authMode === 'signup'}
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="La Dolce Vita Cafe 🇮🇹"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                        WhatsApp Contact Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required={authMode === 'signup'}
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="+201234567890"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium transition-all"
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-1 leading-normal">
                        Include country code so clients can message you directly on WhatsApp.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                          Business Type
                        </label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value as any)}
                          className="w-full px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium bg-white transition-all"
                        >
                          <option value="food">🍔 Food & Drink</option>
                          <option value="retail">🛍️ Retail/Services</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                          Default Language
                        </label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as any)}
                          className="w-full px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium bg-white transition-all"
                        >
                          <option value="en">🇺🇸 English (LTR)</option>
                          <option value="ar">🇸🇦 العربية (RTL)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-slate-900/10 transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : authMode === 'login' ? (
                    'Log In'
                  ) : (
                    'Create Account & Launch'
                  )}
                </button>
              </form>

              <div className="mt-5 border-t border-slate-100 pt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  }}
                  className="text-xs text-amber-600 hover:text-amber-700 font-bold transition-colors cursor-pointer"
                >
                  {authMode === 'login'
                    ? "Don't have an account? Sign Up Free"
                    : 'Already have an account? Log In'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
