import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { TRANSLATIONS } from '../data/translations';
import { Share2, Copy, Check, Download, QrCode as QrIcon, MapPin, Smartphone, ChevronRight } from 'lucide-react';

export const QrCodeShare: React.FC = () => {
  const { settings } = useStore();
  const t = TRANSLATIONS[settings.language];

  const [copied, setCopied] = useState(false);

  // Generate the customer storefront shareable link dynamically
  const getCustomerStoreUrl = () => {
    const origin = window.location.origin;
    // Embed the specific view as a query param so that scanning visitors land on the catalog directly.
    return `${origin}?view=customer`;
  };

  const storeUrl = getCustomerStoreUrl();

  // Generate QR Code URL via QRServer API (reliable, fast, client-side, offline-compatible)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(storeUrl)}&margin=10`;

  const copyStoreLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const downloadQrCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${settings.storeName.toLowerCase().replace(/\s+/g, '_')}_qr_menu.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback: open in new tab for saving
      window.open(qrCodeUrl, '_blank');
    }
  };

  const isRtl = settings.language === 'ar';

  return (
    <div className="space-y-6" id="qrcode-share-container" dir={isRtl ? 'rtl' : 'ltr'} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      {/* Link Sharing Panel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-amber-500" />
          {t.shareTitle}
        </h3>
        <p className="text-sm text-slate-500 mb-6">{t.shareDesc}</p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={storeUrl}
            readOnly
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs font-mono select-all focus:outline-none"
          />
          <button
            onClick={copyStoreLink}
            style={{ backgroundColor: settings.primaryColor }}
            className="w-full sm:w-auto text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                {t.copyLink}
              </>
            )}
          </button>
        </div>
      </div>

      {/* QR Flyer Display and Info */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Step guidance */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm h-full flex flex-col justify-between">
            <div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block mb-4">HOW IT WORKS FOR GUESTS</span>
              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0">1</div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm mb-1">Scan physical QR Menu</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">Guests scan the sticker on their table, seat, or storefront window using their phone.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm mb-1">Browse Catalog & Add Items</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">They view descriptions, pictures, prices and construct their perfect order in the shopping cart.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0">3</div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm mb-1">Send to WhatsApp</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">With 1 click, guests check out and dispatch a neatly formatted message straight to your business inbox.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100">
              <button
                onClick={downloadQrCode}
                className="w-full text-center border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4.5 h-4.5" />
                {t.downloadQr}
              </button>
            </div>
          </div>
        </div>

        {/* The Printable Table Flyer Card */}
        <div className="md:col-span-7">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center max-w-sm mx-auto relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute top-0 left-0 right-0 h-4" style={{ backgroundColor: settings.primaryColor }} />

            <div className="mt-4 flex items-center gap-2 mb-2">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-sm font-bold text-lg select-none">
                  {settings.storeName ? settings.storeName.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              <span className="font-extrabold text-base text-slate-900 tracking-tight">{settings.storeName}</span>
            </div>

            <div className="my-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl relative shadow-inner">
              <img
                src={qrCodeUrl}
                alt="QuickStore generated QR code"
                className="w-48 h-48 rounded-lg border border-slate-200 shadow-sm bg-white"
              />
            </div>

            <div className="space-y-4 max-w-xs">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 tracking-wider uppercase">
                <Smartphone className="w-4 h-4" />
                <span>Scan with Camera</span>
              </div>
              <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                {t.scanToView}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>QuickStore Digital Menu</span>
              <span className="flex items-center gap-0.5">Order direct <ChevronRight className="w-3 h-3" /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
