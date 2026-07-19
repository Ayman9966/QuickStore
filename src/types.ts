export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image_url?: string;
}

export interface StoreSettings {
  storeId?: string;
  storeName: string;
  logoUrl: string;
  primaryColor: string; // Tailwind color class or hex, let's store hex values
  currencySymbol: string;
  whatsappNumber: string;
  businessType: 'food' | 'retail';
  language: 'en' | 'ar';
  viewMode: 'list' | 'cards';
  isSubscribed?: boolean;
  subscriptionEndDate?: string;
  adminPasscode?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type AppView = 'landing' | 'builder' | 'customer';
