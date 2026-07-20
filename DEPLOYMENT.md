# 🚀 Deploying to Render

This full-stack application (Vite/React frontend + Express/Node.js backend) is fully prepared for hosting on [Render](https://render.com).

We have included a `render.yaml` Blueprint file at the root of the project which automates the setup. Follow the instructions below to deploy your app in under 5 minutes.

---

## 📋 Steps to Deploy

### 1. Push Code to GitHub / GitLab
Make sure this codebase is pushed to a Git repository on **GitHub** or **GitLab** so Render can access it.

### 2. Deploy via Render Blueprint (Recommended)
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top right and select **Blueprint**.
3. Connect your GitHub/GitLab repository.
4. Render will automatically detect the `render.yaml` file.
5. Provide the required Environment Variables in the UI prompt:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `TELEGRAM_ADMIN_USERNAME`
   - *(Optional)* Firebase credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) if using Firestore for live cloud storage instead of local JSON file database fallback.
6. Click **Approve** or **Deploy**. Render will build and start your application automatically!

---

### 🛠️ Manual Deployment Option
If you prefer to configure the Web Service manually on Render:
1. Click **New +** and select **Web Service**.
2. Connect your repository.
3. Configure the following settings:
   - **Language / Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
4. Under **Advanced**, add the following environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `TELEGRAM_BOT_TOKEN` = *(Your token)*
   - `TELEGRAM_CHAT_ID` = *(Your chat ID)*
   - `TELEGRAM_ADMIN_USERNAME` = *(Your admin username)*
   - *(Optional for Firestore database)*:
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_CLIENT_EMAIL`
     - `FIREBASE_PRIVATE_KEY` *(make sure to copy the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)*

---

## 🔒 Environment Variable Settings for Firebase

This application features a fully **self-healing, fault-tolerant dual storage system**:
- **Automatic Fallback:** If Firebase variables are not set (or if the Firebase API is disabled in your project), the application automatically falls back to utilizing a local JSON database file (`stores_db.json`). Everything will function beautifully right out of the box!
- **Production Persistence:** To use persistent live cloud storage, supply your Firebase Admin SDK service account key credentials in the environment variables listed above.
