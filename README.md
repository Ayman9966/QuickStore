# QuickStore Builder

A fast, elegant, and mobile-optimized restaurant and retail catalog builder. Create your digital store in seconds, manage your products, and receive orders directly via WhatsApp.

## 🚀 Features

- **Instant Setup**: Create a store and start adding products immediately.
- **WhatsApp Integration**: Orders are sent directly to your WhatsApp with a formatted message.
- **Multilingual Support**: Supports English and Arabic (RTL) out of the box.
- **Dynamic Routing**: Clean URLs for every store and admin panel.
- **CSV Import**: Quickly populate your catalog using CSV files.
- **Store Customization**: Change currency, language, and store metadata easily.
- **Admin Security**: Protected admin access with passcode verification.

## 🛠️ Architecture

- **Frontend**: React 18+ with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Animations**: Motion (framer-motion)
- **Icons**: Lucide React
- **Persistence**: Firebase (Firestore) for data and Auth for user management.

## 📍 Routing Structure

- `/`: Landing page where users can sign up, log in, or try a demo.
- `/:restaurantId`: Public storefront for customers to browse and order.
- `/:restaurantId/admin`: Private dashboard for store owners to manage their catalog and settings.

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## 📄 Environment Variables

Required variables for Firebase integration:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

---

Built with precision and focus on speed.
