import express from "express";
import path from "path";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

dotenv.config();

let firebaseConfig: any = {};
try {
  const rawConfig = fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8");
  firebaseConfig = JSON.parse(rawConfig);
} catch (e) {
  console.warn("Could not load firebase-applet-config.json");
}

if (!getApps().length) {
  try {
    initializeApp({
      projectId: firebaseConfig.projectId || "charismatic-descent-kcf5x",
    });
  } catch (e) {
    console.error("Firebase admin init error:", e);
  }
}

const firestoreDb = getFirestore(undefined, firebaseConfig.firestoreDatabaseId || undefined);

const PORT = 3000;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7573867584:AAE4B4kDxPkTCCk85X7SeW9UyHim8DNuSkA";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "7579384719";
const TELEGRAM_ADMIN_USERNAME = process.env.TELEGRAM_ADMIN_USERNAME || "aymaansamy96";

async function sendTelegramMessage(chatId: string, text: string) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
      }),
    });
    if (!response.ok) {
      console.error("Failed to send telegram message:", await response.text());
    }
  } catch (error) {
    console.error("Error sending telegram message:", error);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      database: "firebase-firestore",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/stores", async (req, res) => {
    try {
      const snapshot = await firestoreDb.collection("stores").get();
      const stores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(stores);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, storeName, whatsappNumber, businessType, language } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const trimmedUsername = username.trim().toLowerCase();
      
      const querySnapshot = await firestoreDb.collection("stores").where("username", "==", trimmedUsername).get();
      if (!querySnapshot.empty) {
        return res.status(400).json({ error: "Username is already taken" });
      }

      const storeId = `store-${Math.floor(100000 + Math.random() * 900000)}`;
      const hashedPassword = await bcrypt.hash(password, 10);

      const newStore = {
        storeId,
        username: trimmedUsername,
        password: hashedPassword,
        storeName: storeName || "Unnamed Store",
        whatsappNumber: whatsappNumber || "",
        businessType: businessType || "retail",
        language: language || "en",
        isSubscribed: false,
        subscriptionEndDate: null,
        registeredAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        settings: {
          storeId,
          storeName: storeName || "Unnamed Store",
          logoUrl: "",
          primaryColor: "#f59e0b",
          currencySymbol: "$",
          whatsappNumber: whatsappNumber || "",
          businessType: businessType || "retail",
          language: language || "en",
          viewMode: "cards",
          isSubscribed: false,
          adminPasscode: "1234"
        },
        products: []
      };

      await firestoreDb.collection("stores").doc(storeId).set(newStore);

      const messageText = `🆕 *حساب تاجر جديد سجّل في كويك ستور!*
• *اسم المستخدم:* ${trimmedUsername}
• *اسم المتجر:* ${storeName}
• *معرّف المتجر:* \`${storeId}\`
• *رقم الواتساب:* ${whatsappNumber}
• *اللغة:* ${language.toUpperCase()}
• *نوع النشاط:* ${businessType === "food" ? "مطعم/مقهى 🍔" : "تجزئة 🛍️"}
• *تاريخ التسجيل:* ${new Date().toLocaleString("ar-EG")}

💡 _لتفعيل اشتراك هذا المتجر، أرسل:_
\`/activate ${storeId} 30\``;
      
      await sendTelegramMessage(TELEGRAM_CHAT_ID, messageText);

      res.json({
        success: true,
        storeId,
        store: newStore
      });
    } catch (error: any) {
      console.error("Sign up endpoint error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const trimmedUsername = username.trim().toLowerCase();
      const querySnapshot = await firestoreDb.collection("stores").where("username", "==", trimmedUsername).get();
      
      if (querySnapshot.empty) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const storeDoc = querySnapshot.docs[0];
      const store = storeDoc.data();

      if (!(await bcrypt.compare(password, store.password || ""))) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      await storeDoc.ref.update({ lastActiveAt: new Date().toISOString() });

      res.json({
        success: true,
        storeId: store.storeId,
        settings: store.settings,
        products: store.products
      });
    } catch (error: any) {
      console.error("Login endpoint error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.post("/api/store/update-data", async (req, res) => {
    try {
      const { storeId, settings, products } = req.body;
      if (!storeId) {
        return res.status(400).json({ error: "Missing storeId" });
      }

      const storeRef = firestoreDb.collection("stores").doc(storeId);
      const docSnap = await storeRef.get();

      if (!docSnap.exists) {
        return res.status(404).json({ error: "Store not found" });
      }

      const store = docSnap.data()!;
      const updateData: any = { lastActiveAt: new Date().toISOString() };
      
      if (settings) {
        updateData.settings = settings;
        updateData.storeName = settings.storeName || store.storeName;
        updateData.whatsappNumber = settings.whatsappNumber || store.whatsappNumber;
        updateData.businessType = settings.businessType || store.businessType;
        updateData.language = settings.language || store.language;
      }
      if (products) {
        updateData.products = products;
      }
      
      await storeRef.update(updateData);

      res.json({
        success: true,
        isSubscribed: store.isSubscribed || false,
        subscriptionEndDate: store.subscriptionEndDate || null
      });
    } catch (error: any) {
      console.error("Update-data endpoint error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.post("/api/store/register", async (req, res) => {
    try {
      const { storeId, storeName, whatsappNumber, businessType, language } = req.body;
      if (!storeId) {
        return res.status(400).json({ error: "Missing storeId" });
      }

      const storeRef = firestoreDb.collection("stores").doc(storeId);
      const docSnap = await storeRef.get();
      const isNew = !docSnap.exists;

      if (isNew) {
        const newStore = {
          storeId,
          username: `user_${storeId}`,
          password: 'password',
          storeName: storeName || "Unnamed Store",
          whatsappNumber: whatsappNumber || "",
          businessType: businessType || "food",
          language: language || "ar",
          isSubscribed: false,
          subscriptionEndDate: null,
          registeredAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          settings: {
            storeId,
            storeName: storeName || "Unnamed Store",
            logoUrl: "",
            primaryColor: "#f59e0b",
            currencySymbol: "$",
            whatsappNumber: whatsappNumber || "",
            businessType: businessType || "food",
            language: language || "ar",
            viewMode: "cards",
            isSubscribed: false,
            adminPasscode: "1234"
          },
          products: []
        };
        await storeRef.set(newStore);

        const messageText = `🆕 *مستخدم جديد سجّل في كويك ستور!*
• *اسم المتجر:* ${storeName}
• *معرّف المتجر:* \`${storeId}\`
• *رقم الواتساب:* ${whatsappNumber}
• *اللغة:* ${language.toUpperCase()}
• *نوع النشاط:* ${businessType === "food" ? "مطعم/مقهى 🍔" : "تجزئة 🛍️"}
• *تاريخ التسجيل:* ${new Date().toLocaleString("ar-EG")}

💡 _لتفعيل اشتراك هذا المتجر، أرسل:_
\`/activate ${storeId} 30\``;
        
        await sendTelegramMessage(TELEGRAM_CHAT_ID, messageText);
      } else {
        const store = docSnap.data()!;
        await storeRef.update({
          storeName: storeName || store.storeName,
          whatsappNumber: whatsappNumber || store.whatsappNumber,
          businessType: businessType || store.businessType,
          language: language || store.language,
          lastActiveAt: new Date().toISOString()
        });
      }

      const updatedSnap = await storeRef.get();
      const storeData = updatedSnap.data();

      res.json({
        success: true,
        isSubscribed: storeData ? storeData.isSubscribed : false,
        subscriptionEndDate: storeData ? storeData.subscriptionEndDate : null,
      });
    } catch (error: any) {
      console.error("Register endpoint error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.get("/api/store/status", async (req, res) => {
    try {
      const { storeId } = req.query;
      if (!storeId || typeof storeId !== "string") {
        return res.status(400).json({ error: "Missing or invalid storeId" });
      }

      const storeRef = firestoreDb.collection("stores").doc(storeId);
      const docSnap = await storeRef.get();

      if (!docSnap.exists) {
        return res.json({ isSubscribed: false });
      }

      const store = docSnap.data()!;
      let isSubscribed = store.isSubscribed;
      if (store.isSubscribed && store.subscriptionEndDate) {
        const expiry = new Date(store.subscriptionEndDate);
        if (expiry < new Date()) {
          isSubscribed = false;
          await storeRef.update({ isSubscribed: false });

          sendTelegramMessage(
            TELEGRAM_CHAT_ID,
            `⚠️ *انتهاء اشتراك متجر!*
• *المتجر:* ${store.storeName}
• *المعرف:* \`${store.storeId}\`
• انتهت صلاحية الاشتراك تلقائياً.`
          );
        }
      }

      res.json({
        isSubscribed,
        subscriptionEndDate: store.subscriptionEndDate,
      });
    } catch (error: any) {
      console.error("Status endpoint error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  let botUsername = "QuickStoreBuilderBot";
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    if (meRes.ok) {
      const meData = await meRes.json();
      if (meData?.result?.username) {
        botUsername = meData.result.username;
      }
    }
  } catch (err) {
    console.warn("Could not fetch Telegram Bot username on startup.");
  }

  app.get("/api/telegram/bot-info", (req, res) => {
    res.json({ 
      botUsername, 
      ownerChatId: TELEGRAM_CHAT_ID,
      adminUsername: TELEGRAM_ADMIN_USERNAME
    });
  });

  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist/client");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  startTelegramLongPolling();
}

function startTelegramLongPolling() {
  let offset = 0;
  console.log("Starting Telegram Bot Long Polling background service...");

  async function poll() {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}&timeout=10`;
      const response = await fetch(url);
      if (!response.ok) {
        setTimeout(poll, 10000);
        return;
      }

      const data = await response.json();
      if (data && data.ok && data.result) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          
          if (update.message) {
            const msg = update.message;
            const text = msg.text || "";
            const fromChatId = String(msg.chat.id);
            const isAdmin = fromChatId === TELEGRAM_CHAT_ID;

            if (text.startsWith("/")) {
              const parts = text.split(/\s+/);
              const command = parts[0].toLowerCase();

              if (command === "/start") {
                const paramStoreId = parts[1];
                if (isAdmin) {
                  const reply = `👋 *أهلاً بك يا مدير النظام!*

أنت الآن تتحكم بالكامل في اشتراكات المستخدمين. إليك الأوامر المتاحة:
• \`/list\` : لعرض جميع المتاجر المسجلة واشتراكاتها.
• \`/activate <storeId> <days>\` : لتفعيل اشتراك متجر لعدد من الأيام.
• \`/deactivate <storeId>\` : لإلغاء تفعيل اشتراك متجر.
• \`/info <storeId>\` : لعرض معلومات متجر بالتفصيل.`;
                  await sendTelegramMessage(fromChatId, reply);
                } else {
                  let reply = `👋 *مرحباً بك في كويك ستور (QuickStore)!* \n\n`;
                  if (paramStoreId) {
                    reply += `لقد تم ربط حسابك بمتجرك ذي المعرّف: \`${paramStoreId}\`.\n`;
                    reply += `لتفعيل اشتراكك وإلغاء قيود النسخة المجانية، يرجى كتابة رسالة هنا وسيتواصل معك المدير لتفعيل حسابك يدوياً!`;
                  } else {
                    reply += `إذا كنت تمتلك متجراً وتريد ترقية حسابك، يرجى النقر على زر "ترقية المتجر" من داخل لوحة التحكم لتوجيهك مع معرّف متجرك.`;
                  }
                  await sendTelegramMessage(fromChatId, reply);
                }
              } 
              else if (command === "/list") {
                if (!isAdmin) {
                  await sendTelegramMessage(fromChatId, "⚠️ عذراً، هذا الأمر مخصص لمدير النظام فقط.");
                  continue;
                }
                const snapshot = await firestoreDb.collection("stores").get();
                const stores = snapshot.docs.map(doc => doc.data());
                if (stores.length === 0) {
                  await sendTelegramMessage(fromChatId, "📋 لا يوجد أي متاجر مسجلة حالياً.");
                } else {
                  let reply = `📋 *قائمة المتاجر المسجلة (${stores.length}):*\n\n`;
                  stores.forEach((s: any) => {
                    const status = s.isSubscribed ? `✅ نشط (ينتهي: ${s.subscriptionEndDate ? new Date(s.subscriptionEndDate).toLocaleDateString("ar-EG") : "غير محدد"})` : "❌ مجاني/منتهي";
                    reply += `• *${s.storeName}*\n  المعرف: \`${s.storeId}\`\n  الاشتراك: ${status}\n  الواتساب: \`${s.whatsappNumber}\`\n\n`;
                  });
                  await sendTelegramMessage(fromChatId, reply);
                }
              } 
              else if (command === "/activate") {
                if (!isAdmin) {
                  await sendTelegramMessage(fromChatId, "⚠️ عذراً، هذا الأمر مخصص لمدير النظام فقط.");
                  continue;
                }
                const targetId = parts[1];
                const days = parseInt(parts[2] || "30", 10);

                if (!targetId) {
                  await sendTelegramMessage(fromChatId, "⚠️ يرجى إدخال معرّف المتجر.\nمثال: \`/activate store-123456 30\`");
                  continue;
                }

                const storeRef = firestoreDb.collection("stores").doc(targetId);
                const docSnap = await storeRef.get();

                if (!docSnap.exists) {
                  await sendTelegramMessage(fromChatId, `❌ لم يتم العثور على متجر بالمعرف \`${targetId}\`.`);
                } else {
                  const store = docSnap.data()!;
                  const endDate = new Date();
                  endDate.setDate(endDate.getDate() + days);

                  await storeRef.update({ 
                    isSubscribed: true, 
                    subscriptionEndDate: endDate.toISOString() 
                  });

                  const reply = `✅ *تم تفعيل الاشتراك الاحترافي بنجاح!*
• *المتجر:* ${store.storeName}
• *المعرف:* \`${store.storeId}\`
• *المدة:* ${days} يومًا
• *ينتهي في:* ${endDate.toLocaleDateString("ar-EG")} ${endDate.toLocaleTimeString("ar-EG")}`;
                  
                  await sendTelegramMessage(fromChatId, reply);
                }
              } 
              else if (command === "/deactivate") {
                if (!isAdmin) {
                  await sendTelegramMessage(fromChatId, "⚠️ عذراً، هذا الأمر مخصص لمدير النظام فقط.");
                  continue;
                }
                const targetId = parts[1];

                if (!targetId) {
                  await sendTelegramMessage(fromChatId, "⚠️ يرجى إدخال معرّف المتجر.\nمثال: \`/deactivate store-123456\`");
                  continue;
                }

                const storeRef = firestoreDb.collection("stores").doc(targetId);
                const docSnap = await storeRef.get();

                if (!docSnap.exists) {
                  await sendTelegramMessage(fromChatId, `❌ لم يتم العثور على متجر بالمعرف \`${targetId}\`.`);
                } else {
                  const store = docSnap.data()!;
                  await storeRef.update({ 
                    isSubscribed: false, 
                    subscriptionEndDate: null 
                  });

                  const reply = `❌ *تم إلغاء تفعيل اشتراك المتجر بنجاح:*
• *المتجر:* ${store.storeName}
• *المعرف:* \`${store.storeId}\``;
                  
                  await sendTelegramMessage(fromChatId, reply);
                }
              } 
              else if (command === "/info") {
                if (!isAdmin) {
                  await sendTelegramMessage(fromChatId, "⚠️ عذراً، هذا الأمر مخصص لمدير النظام فقط.");
                  continue;
                }
                const targetId = parts[1];

                if (!targetId) {
                  await sendTelegramMessage(fromChatId, "⚠️ يرجى إدخال معرّف المتجر.\nمثال: \`/info store-123456\`");
                  continue;
                }

                const storeRef = firestoreDb.collection("stores").doc(targetId);
                const docSnap = await storeRef.get();

                if (!docSnap.exists) {
                  await sendTelegramMessage(fromChatId, `❌ لم يتم العثور على متجر بالمعرف \`${targetId}\`.`);
                } else {
                  const store = docSnap.data()!;
                  const reply = `ℹ️ *تفاصيل المتجر:*
• *الاسم:* ${store.storeName}
• *المعرف:* \`${store.storeId}\`
• *الاشتراك:* ${store.isSubscribed ? "✅ نشط/احترافي" : "❌ غير نشط/مجاني"}
• *تاريخ الانتهاء:* ${store.subscriptionEndDate ? new Date(store.subscriptionEndDate).toLocaleString("ar-EG") : "لا يوجد"}
• *الواتساب:* \`${store.whatsappNumber}\`
• *اللغة المعتمدة:* ${store.language.toUpperCase()}
• *نوع النشاط:* ${store.businessType.toUpperCase()}
• *تاريخ التسجيل:* ${new Date(store.registeredAt).toLocaleString("ar-EG")}
• *آخر ظهور:* ${new Date(store.lastActiveAt).toLocaleString("ar-EG")}`;
                  
                  await sendTelegramMessage(fromChatId, reply);
                }
              }
              else {
                await sendTelegramMessage(fromChatId, "⚠️ أمر غير معروف. استخدم `/start` لعرض الأوامر المتاحة.");
              }
            } else {
              if (!isAdmin) {
                const replyToUser = `📬 تم استلام رسالتك وتوجيهها لمدير النظام. معرّف متجرك هو \`${fromChatId}\`. شكراً لتواصلك معنا!`;
                await sendTelegramMessage(fromChatId, replyToUser);

                const adminAlert = `📬 *رسالة واردة من مستخدم:*
• *الاسم:* ${msg.from?.first_name || ""} ${msg.from?.last_name || ""}
• *معرف التيليجرام:* \`${fromChatId}\`
• *الرسالة:* ${text}`;
                await sendTelegramMessage(TELEGRAM_CHAT_ID, adminAlert);
              } else {
                await sendTelegramMessage(fromChatId, "✍️ استخدم الأوامر المخصصة لإدارة الاشتراكات (مثل `/list` أو `/activate`).");
              }
            }
          }
        }
      }
      setTimeout(poll, 1500);
    } catch (error) {
      console.error("Telegram long polling error:", error);
      setTimeout(poll, 10000);
    }
  }

  poll();
}

startServer();
