import express from "express";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const PORT = 3000;

// Default Telegram credentials (user provided)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7573867584:AAE4B4kDxPkTCCk85X7SeW9UyHim8DNuSkA";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "7579384719";
const TELEGRAM_ADMIN_USERNAME = process.env.TELEGRAM_ADMIN_USERNAME || "aymaansamy96";

// Simple file-based storage for persistence
const DB_FILE = path.join(process.cwd(), 'stores.json');

function getStores(): any[] {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function getAllStores(): any[] {
  return getStores();
}

function saveStores(stores: any[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(stores, null, 2));
}

function getStoreById(storeId: string) {
  return getStores().find(s => s.storeId === storeId);
}

function getStoreByUsername(username: string) {
  return getStores().find(s => s.username === username);
}

function saveStore(store: any) {
  const stores = getStores();
  const index = stores.findIndex(s => s.storeId === store.storeId);
  if (index !== -1) {
    stores[index] = store;
  } else {
    stores.push(store);
  }
  saveStores(stores);
}

interface StoreRecord {
  storeId: string;
  username: string;
  password?: string;
  storeName: string;
  whatsappNumber: string;
  businessType: string;
  language: string;
  isSubscribed: boolean;
  subscriptionEndDate?: string;
  registeredAt: string;
  lastActiveAt: string;
  settings: any;
  products: any[];
}

// Telegram Helper to Send Message
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

  // API Route: Health check for database
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      database: "local",
      timestamp: new Date().toISOString()
    });
  });

  // API Route: CRUD for stores
  app.get("/api/stores", async (req, res) => {
    const { data, error } = await supabase.from('stores').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/stores", async (req, res) => {
    const { data, error } = await supabase.from('stores').insert(req.body);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.put("/api/stores/:id", async (req, res) => {
    const { data, error } = await supabase.from('stores').update(req.body).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.delete("/api/stores/:id", async (req, res) => {
    const { data, error } = await supabase.from('stores').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // API Route: platform Sign Up / Register Account
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, storeName, whatsappNumber, businessType, language } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const trimmedUsername = username.trim().toLowerCase();
      
      const existing = await getStoreByUsername(trimmedUsername);
      if (existing) {
        return res.status(400).json({ error: "Username is already taken" });
      }

      const storeId = `store-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Hash the password for security
      const hashedPassword = await bcrypt.hash(password, 10);

      const newStore: StoreRecord = {
        storeId,
        username: trimmedUsername,
        password: hashedPassword,
        storeName: storeName || "Unnamed Store",
        whatsappNumber: whatsappNumber || "",
        businessType: businessType || "retail",
        language: language || "en",
        isSubscribed: false,
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

      await saveStore(newStore);

      // Notify Admin on Telegram
      const messageText = `🆕 *حساب تاجر جديد سجّل في كويك ستور!*
• *اسم المستخدم:* ${newStore.username}
• *اسم المتجر:* ${newStore.storeName}
• *معرّف المتجر:* \`${newStore.storeId}\`
• *رقم الواتساب:* ${newStore.whatsappNumber}
• *اللغة:* ${newStore.language.toUpperCase()}
• *نوع النشاط:* ${newStore.businessType === "food" ? "مطعم/مقهى 🍔" : "تجزئة 🛍️"}
• *تاريخ التسجيل:* ${new Date(newStore.registeredAt).toLocaleString("ar-EG")}

💡 _لتفعيل اشتراك هذا المتجر، أرسل:_
\`/activate ${newStore.storeId} 30\``;
      
      await sendTelegramMessage(TELEGRAM_CHAT_ID, messageText);

      res.json({
        success: true,
        storeId,
        store: {
          storeId,
          storeName: newStore.storeName,
          whatsappNumber: newStore.whatsappNumber,
          businessType: newStore.businessType,
          language: newStore.language,
          isSubscribed: newStore.isSubscribed
        }
      });
    } catch (error) {
      console.error("Sign up endpoint error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route: platform Log In
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const trimmedUsername = username.trim().toLowerCase();
      const store = await getStoreByUsername(trimmedUsername);

      if (!store || !(await bcrypt.compare(password, store.password || ""))) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      store.lastActiveAt = new Date().toISOString();
      await saveStore(store);

      res.json({
        success: true,
        storeId: store.storeId,
        settings: store.settings || {
          storeId: store.storeId,
          storeName: store.storeName,
          logoUrl: "",
          primaryColor: "#f59e0b",
          currencySymbol: "$",
          whatsappNumber: store.whatsappNumber,
          businessType: store.businessType,
          language: store.language,
          viewMode: "cards",
          isSubscribed: store.isSubscribed,
          adminPasscode: "1234"
        },
        products: store.products || []
      });
    } catch (error) {
      console.error("Login endpoint error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route: Sync/Update settings and products state
  app.post("/api/store/update-data", async (req, res) => {
    try {
      const { storeId, settings, products } = req.body;
      if (!storeId) {
        return res.status(400).json({ error: "Missing storeId" });
      }

      const store = await getStoreById(storeId);

      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }

      if (settings) {
        store.settings = settings;
        store.storeName = settings.storeName || store.storeName;
        store.whatsappNumber = settings.whatsappNumber || store.whatsappNumber;
        store.businessType = settings.businessType || store.businessType;
        store.language = settings.language || store.language;
      }
      if (products) {
        store.products = products;
      }
      
      store.lastActiveAt = new Date().toISOString();
      await saveStore(store);

      res.json({
        success: true,
        isSubscribed: store.isSubscribed,
        subscriptionEndDate: store.subscriptionEndDate
      });
    } catch (error) {
      console.error("Update-data endpoint error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route: Register / Sync Store
  app.post("/api/store/register", async (req, res) => {
    try {
      const { storeId, storeName, whatsappNumber, businessType, language } = req.body;
      if (!storeId) {
        return res.status(400).json({ error: "Missing storeId" });
      }

      let store = await getStoreById(storeId);
      const isNew = !store;

      if (isNew) {
        store = {
          storeId,
          storeName: storeName || "Unnamed Store",
          whatsappNumber: whatsappNumber || "",
          businessType: businessType || "food",
          language: language || "ar",
          isSubscribed: false,
          registeredAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        };
        await saveStore(store);

        // Notify Admin on Telegram
        const messageText = `🆕 *مستخدم جديد سجّل في كويك ستور!*
• *اسم المتجر:* ${store.storeName}
• *معرّف المتجر:* \`${store.storeId}\`
• *رقم الواتساب:* ${store.whatsappNumber}
• *اللغة:* ${store.language.toUpperCase()}
• *نوع النشاط:* ${store.businessType === "food" ? "مطعم/مقهى 🍔" : "تجزئة 🛍️"}
• *تاريخ التسجيل:* ${new Date(store.registeredAt).toLocaleString("ar-EG")}

💡 _لتفعيل اشتراك هذا المتجر، أرسل:_
\`/activate ${store.storeId} 30\``;
        
        await sendTelegramMessage(TELEGRAM_CHAT_ID, messageText);
      } else {
        // Update metadata
        store.storeName = storeName || store.storeName;
        store.whatsappNumber = whatsappNumber || store.whatsappNumber;
        store.businessType = businessType || store.businessType;
        store.language = language || store.language;
        store.lastActiveAt = new Date().toISOString();
        await saveStore(store);
      }

      res.json({
        success: true,
        isSubscribed: store.isSubscribed,
        subscriptionEndDate: store.subscriptionEndDate,
      });
    } catch (error) {
      console.error("Register endpoint error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route: Get Store Status
  app.get("/api/store/status", async (req, res) => {
    try {
      const { storeId } = req.query;
      if (!storeId) {
        return res.status(400).json({ error: "Missing storeId" });
      }

      if (typeof storeId !== "string") {
        return res.status(400).json({ error: "Invalid storeId" });
      }

      const store = await getStoreById(storeId);

      if (!store) {
        return res.json({ isSubscribed: false });
      }

      // Check if subscription has expired
      let isSubscribed = store.isSubscribed;
      if (store.isSubscribed && store.subscriptionEndDate) {
        const expiry = new Date(store.subscriptionEndDate);
        if (expiry < new Date()) {
          isSubscribed = false;
          store.isSubscribed = false;
          await saveStore(store);

          // Notify admin of expiry
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
    } catch (error) {
      console.error("Status endpoint error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route: Get Bot Username (to link users to chat with support/bot)
  let botUsername = "QuickStoreBuilderBot"; // Default fallback
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    if (meRes.ok) {
      const meData = await meRes.ok ? await meRes.json() : null;
      if (meData?.result?.username) {
        botUsername = meData.result.username;
        console.log(`Telegram Bot authenticated as @${botUsername}`);
      }
    }
  } catch (err) {
    console.warn("Could not fetch Telegram Bot username on startup (might be offline/invalid token).");
  }

  app.get("/api/telegram/bot-info", (req, res) => {
    res.json({ 
      botUsername, 
      ownerChatId: TELEGRAM_CHAT_ID,
      adminUsername: TELEGRAM_ADMIN_USERNAME
    });
  });

  // Vite middleware for development or serving production build
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Listen on specified PORT and Host 0.0.0.0
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  // Start Telegram Bot Long Polling
  startTelegramLongPolling();
}

// Telegram Bot Long Polling Logic
function startTelegramLongPolling() {
  let offset = 0;
  console.log("Starting Telegram Bot Long Polling background service...");

  async function poll() {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}&timeout=10`;
      const response = await fetch(url);
      if (!response.ok) {
        // Silently wait and retry if error occurs (e.g. rate limit, bad token)
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

            // Simple commands parsing
            if (text.startsWith("/")) {
              const parts = text.split(/\s+/);
              const command = parts[0].toLowerCase();

              if (command === "/start") {
                const paramStoreId = parts[1]; // e.g. /start store-123456
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
                const stores = await getAllStores();
                if (stores.length === 0) {
                  await sendTelegramMessage(fromChatId, "📋 لا يوجد أي متاجر مسجلة حالياً.");
                } else {
                  let reply = `📋 *قائمة المتاجر المسجلة (${stores.length}):*\n\n`;
                  stores.forEach((s) => {
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

                const store = await getStoreById(targetId);

                if (!store) {
                  await sendTelegramMessage(fromChatId, `❌ لم يتم العثور على متجر بالمعرف \`${targetId}\`. تأكد من كتابة المعرف بشكل صحيح.`);
                } else {
                  const endDate = new Date();
                  endDate.setDate(endDate.getDate() + days);

                  store.isSubscribed = true;
                  store.subscriptionEndDate = endDate.toISOString();
                  await saveStore(store);

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

                const store = await getStoreById(targetId);

                if (!store) {
                  await sendTelegramMessage(fromChatId, `❌ لم يتم العثور على متجر بالمعرف \`${targetId}\`.`);
                } else {
                  store.isSubscribed = false;
                  store.subscriptionEndDate = undefined;
                  await saveStore(store);

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

                const store = await getStoreById(targetId);

                if (!store) {
                  await sendTelegramMessage(fromChatId, `❌ لم يتم العثور على متجر بالمعرف \`${targetId}\`.`);
                } else {
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
              // Non-command text
              if (!isAdmin) {
                // Forward customer message to system owner with context
                const replyToUser = `📬 تم استلام رسالتك وتوجيهها لمدير النظام. معرّف متجرك هو \`${fromChatId}\` أو يمكن للمدير تفعيل متجرك عبر معرّف المتجر المسجل. شكراً لتواصلك معنا!`;
                await sendTelegramMessage(fromChatId, replyToUser);

                // Notify admin of a customer query
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
      setTimeout(poll, 10000); // Wait longer on error
    }
  }

  // Start polling
  poll();
}

startServer();
