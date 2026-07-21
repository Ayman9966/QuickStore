import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, StoreSettings, CartItem, AppView } from '../types';
import { SAMPLE_PRODUCTS, DEFAULT_SETTINGS } from '../data/sampleData';

interface StoreContextType {
  view: AppView;
  setView: (view: AppView) => void;
  products: Product[];
  settings: StoreSettings;
  cart: CartItem[];
  currentUser: string | null;
  adminUsername: string;
  loadDemoData: () => void;
  updateSettings: (settings: Partial<StoreSettings>) => void;
  importProductsFromCSV: (parsedData: any[], overwrite: boolean) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  clearCatalog: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getWhatsAppLink: (items: CartItem[] | Product) => string;
  registerUser: (userData: any) => Promise<{ success: boolean; error?: string }>;
  loginUser: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setView] = useState<AppView>(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('view');
    if (mode === 'customer') return 'customer';
    return 'landing';
  });
  
  // Load initial state
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({ ...DEFAULT_SETTINGS });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [adminUsername, setAdminUsername] = useState<string>('aymaansamy96');

  // Fetch admin and bot info on mount
  useEffect(() => {
    fetch('/api/telegram/bot-info')
      .then(res => res.json())
      .then(data => {
        if (data.adminUsername) {
          setAdminUsername(data.adminUsername);
        }
      })
      .catch(err => console.error('Error fetching admin bot info:', err));
  }, []);

  // Fetch store data when user logs in
  useEffect(() => {
    if (!currentUser) {
      setProducts([]);
      setSettings({ ...DEFAULT_SETTINGS });
      return;
    }

    // Since we don't have a direct "getStore" API route for logged in user, 
    // we rely on the login response that populated the context.
    // For now, we can just ensure we sync up.
  }, [currentUser]);


  // Periodic status checker for customer view to check if subscription is active
  useEffect(() => {
    if (!settings.storeId || view !== 'customer') return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/store/status?storeId=${settings.storeId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.isSubscribed !== undefined && (data.isSubscribed !== settings.isSubscribed || data.subscriptionEndDate !== settings.subscriptionEndDate)) {
            setSettings(prev => ({
              ...prev,
              isSubscribed: data.isSubscribed,
              subscriptionEndDate: data.subscriptionEndDate
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch store status from server:', err);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [settings.storeId, settings.isSubscribed, settings.subscriptionEndDate, view]);

  // Periodic update to server when user is logged in (Data Persistence / Cloud Sync)
  useEffect(() => {
    if (!currentUser || !settings.storeId) return;

    const controller = new AbortController();
    
    // De-bounce sync slightly to avoid rapid requests on fast edits
    const timer = setTimeout(() => {
      fetch('/api/store/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: settings.storeId,
          settings,
          products
        }),
        signal: controller.signal
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
      })
      .then(data => {
        if (data && data.isSubscribed !== undefined && (data.isSubscribed !== settings.isSubscribed || data.subscriptionEndDate !== settings.subscriptionEndDate)) {
          setSettings(prev => ({
            ...prev,
            isSubscribed: data.isSubscribed,
            subscriptionEndDate: data.subscriptionEndDate
          }));
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Error syncing store data to server:', err);
        }
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [currentUser, settings.storeId, settings, products]);

  // Authentication Helpers
  const registerUser = async (userData: any) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        return { success: false, error: errorData || 'Registration failed' };
      }
      
      const data = await response.json();
      
      setCurrentUser(userData.username.trim().toLowerCase());
      
      const newSettings = {
        storeId: data.storeId,
        storeName: userData.storeName,
        logoUrl: '',
        primaryColor: '#f59e0b',
        currencySymbol: '$',
        whatsappNumber: userData.whatsappNumber,
        businessType: userData.businessType,
        language: userData.language,
        viewMode: 'cards' as const,
        isSubscribed: false,
        adminPasscode: '1234'
      };
      setSettings(newSettings);
      setProducts([]);
      setCart([]);
      
      // Force initial sync
      fetch('/api/store/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: data.storeId,
          settings: newSettings,
          products: []
        })
      }).catch(err => console.error('Failed initial sync:', err));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error' };
    }
  };

  const loginUser = async (userData: any) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        return { success: false, error: errorData || 'Login failed' };
      }
      
      const data = await response.json();
      
      setCurrentUser(userData.username.trim().toLowerCase());
      
      if (data.settings) {
        setSettings(data.settings);
      }
      if (data.products) {
        setProducts(data.products);
      }
      setCart([]);
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error' };
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setSettings({ ...DEFAULT_SETTINGS });
    setProducts([]);
    setCart([]);
    setView('landing');
  };

  // Demo loader
  const loadDemoData = () => {
    setProducts(SAMPLE_PRODUCTS);
    setSettings({
      ...DEFAULT_SETTINGS,
      storeName: "La Dolce Vita Cafe 🇮🇹",
      whatsappNumber: "+1234567890", // Placeholder but valid structure
    });
    setCart([]);
  };

  // Update Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Import products from CSV parsed rows
  const importProductsFromCSV = (parsedData: any[], overwrite: boolean) => {
    const newProducts: Product[] = parsedData
      .filter(row => row.name && row.price)
      .map((row, index) => {
        // Clean numeric values for price
        const priceNum = parseFloat(String(row.price).replace(/[^0-9.]/g, '')) || 0;
        return {
          id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
          name: String(row.name).trim(),
          price: priceNum,
          description: String(row.description || '').trim(),
          category: String(row.category || 'General').trim(),
          image_url: String(row.image_url || '').trim() || undefined
        };
      });

    if (overwrite) {
      setProducts(newProducts);
    } else {
      setProducts(prev => [...prev, ...newProducts]);
    }
  };

  // Manual Product CRUD
  const addProduct = (p: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...p,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const clearCatalog = () => {
    setProducts([]);
    setCart([]);
  };

  // Customer Cart operations
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // WhatsApp Link compiler helper
  const getWhatsAppLink = (items: CartItem[] | Product): string => {
    // Format number: remove +, space, dash, parentheses, etc.
    const cleanNum = settings.whatsappNumber.replace(/\D/g, '');
    const baseUrl = `https://wa.me/${cleanNum}`;
    let text = '';

    if (Array.isArray(items)) {
      // Multiple items (cart checkout)
      if (items.length === 0) return '#';
      
      const isAr = settings.language === 'ar';
      
      if (isAr) {
        text = `*طلب جديد من ${settings.storeName}* 🛒\n`;
        text += `--------------------------------\n`;
        items.forEach(item => {
          text += `• *${item.product.name}* \n  الكمية: ${item.quantity} × ${settings.currencySymbol}${item.product.price.toFixed(2)} = ${settings.currencySymbol}${(item.product.price * item.quantity).toFixed(2)}\n`;
        });
        text += `--------------------------------\n`;
        const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        text += `*المجموع الكلي:* *${settings.currencySymbol}${totalAmount.toFixed(2)}*\n\n`;
        text += `تم إرساله عبر كويك ستور ✨`;
      } else {
        text = `*New Order from ${settings.storeName}* 🛒\n`;
        text += `--------------------------------\n`;
        items.forEach(item => {
          text += `• *${item.product.name}* \n  Qty: ${item.quantity} × ${settings.currencySymbol}${item.product.price.toFixed(2)} = ${settings.currencySymbol}${(item.product.price * item.quantity).toFixed(2)}\n`;
        });
        text += `--------------------------------\n`;
        const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        text += `*Total Amount:* *${settings.currencySymbol}${totalAmount.toFixed(2)}*\n\n`;
        text += `Sent via QuickStore ✨`;
      }
    } else {
      // Single product direct checkout
      text = `Hi, I want to order: ${items.name} - ${settings.currencySymbol}${items.price.toFixed(2)}`;
    }

    return `${baseUrl}?text=${encodeURIComponent(text)}`;
  };

  return (
    <StoreContext.Provider value={{
      view,
      setView,
      products,
      settings,
      cart,
      currentUser,
      adminUsername,
      loadDemoData,
      updateSettings,
      importProductsFromCSV,
      addProduct,
      updateProduct,
      deleteProduct,
      clearCatalog,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      getWhatsAppLink,
      registerUser,
      loginUser,
      logoutUser
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
