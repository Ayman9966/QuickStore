# 🚀 Deploying to Vercel

This full-stack application (Vite/React frontend + Express/Node.js backend) is prepared for hosting on [Vercel](https://vercel.com).

We have included a `vercel.json` configuration file at the root of the project to handle the routing between the frontend and the Express backend.

---

## 📋 Steps to Deploy

### 1. Push Code to GitHub / GitLab
Make sure this codebase is pushed to a Git repository on **GitHub** or **GitLab** so Vercel can access it.

### 2. Deploy via Vercel Dashboard
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** and select **Project**.
3. Import your GitHub/GitLab repository.
4. Vercel will automatically detect the project settings.
5. **Environment Variables:** Provide the required variables in the Vercel project settings:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `TELEGRAM_ADMIN_USERNAME`
   - `VERCEL` = `1` (Automatically set by Vercel, but used in our code)
   - *(Optional)* Firebase credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) if using Firestore for live cloud storage.
6. Click **Deploy**. Vercel will build and start your application!

---

### ⚠️ Note on Telegram Bot
Since Vercel uses a **Serverless environment**, the built-in **Telegram Long Polling** service is disabled in production to prevent execution timeouts and high costs. 

For the Telegram bot to function on Vercel, you should:
1. **Use Webhooks:** Refactor the bot logic to use Webhooks instead of Long Polling.
2. **Alternative Hosting:** Use a traditional VPS or PaaS like Render/Railway if you require the Long Polling background service to run 24/7.

---

### 🛠️ Local Development
To test the production build locally as if it were on Vercel:
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel dev`

---

## 🔒 Environment Variable Settings for Firebase

This application features a fully **self-healing, fault-tolerant dual storage system**:
- **Automatic Fallback:** If Firebase variables are not set (or if the Firebase API is disabled in your project), the application automatically falls back to utilizing a local JSON database file (`stores_db.json`). Everything will function beautifully right out of the box!
- **Production Persistence:** To use persistent live cloud storage, supply your Firebase Admin SDK service account key credentials in the environment variables listed above.
