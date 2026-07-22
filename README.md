# QuickStore Builder

QuickStore is a blazing-fast, mobile-optimized digital storefront and catalog builder designed for independent restaurants, cafes, and retail shops. Create your online store in under 3 minutes, manage your inventory with CSV uploads or manual entries, generate instant QR codes for tables/counters, and receive orders directly on WhatsApp.

---

## 🚀 Key Features

- **Instant Storefront Creation**: Launch your branded digital store instantly with custom colors, currency, and business type (Food & Drink or Retail).
- **Direct WhatsApp Checkout**: Customers browse your catalog, add items to their cart, and submit orders directly via WhatsApp with clean, pre-formatted messages.
- **CSV Catalog Import**: Drag and drop or upload CSV spreadsheets to populate dozens of products with images and categories in seconds.
- **Bilingual & RTL Support**: Seamlessly switch between English and Arabic (RTL) with localized layout and text direction.
- **Instant QR Code Generator**: Generate vector-quality QR codes for your store link to print on physical menus, tables, and packaging.
- **Secure Plan Activation**: Request Pro Plan activation directly through Telegram with super admin verification.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Routing**: React Router v7
- **Animations**: Motion (`motion/react`)
- **Icons**: Lucide React
- **Backend & Persistence**: Express.js server, Firebase Firestore cloud database, and secure Auth.

---

## 📍 Routing Structure

- `/`: Landing page featuring product overview, interactive live preview, FAQs, and authentication modals.
- `/:storeId`: Public customer storefront to browse categories, search products, manage cart, and order via WhatsApp.
- `/:storeId/admin`: Secure store owner dashboard for catalog management, CSV upload, QR code generation, order tracking, and store settings.

---

## 📦 Getting Started & Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ayman9966/QuickStore.git
   cd QuickStore
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## ☁️ Deployment (Vercel / Render)

QuickStore is fully configured for modern cloud platforms like Vercel and Render:

- **Vercel**: Configured with `vercel.json` for SPA routing and static asset serving.
- **Render / Node.js**: Configured with Express backend (`server.ts`), Vite bundling via `esbuild`, and automatic `postinstall` builds (`npm run build`).

---

## 📄 Environment Variables

Ensure your environment or deployment platform has the necessary Firebase configuration:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

---

Built with precision and high-performance design.
