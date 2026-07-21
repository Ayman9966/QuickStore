import express from "express";
import path from "path";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Supabase environment variables are required');
    }
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

const PORT = 3000;

// Default Telegram credentials (user provided)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7573867584:AAE4B4kDxPkTCCk85X7SeW9UyHim8DNuSkA";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "7579384719";
const TELEGRAM_ADMIN_USERNAME = process.env.TELEGRAM_ADMIN_USERNAME || "aymaansamy96";

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
      database: "supabase",
      timestamp: new Date().toISOString()
    });
  });

  // API Route: CRUD for stores
  app.get("/api/stores", async (req, res) => {
    const { data, error } = await getSupabase().from('stores').select('*');
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
      
      const { data: existing, error: findError } = await getSupabase().from('stores').select('id').eq('username', trimmedUsername).single();
      if (existing) {
        return res.status(400).json({ error: "Username is already taken" });
      }

      const storeId = `store-${Math.floor(100000 + Math.random() * 900000)}`;
      const hashedPassword = await bcrypt.hash(password, 10);

      const newStore = {
        store_id: storeId,
        username: trimmedUsername,
        password: hashedPassword,
        store_name: storeName || "Unnamed Store",
        whatsapp_number: whatsappNumber || "",
        business_type: businessType || "retail",
        language: language || "en",
        is_subscribed: false,
        registered_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
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

      const { data, error } = await getSupabase().from('stores').insert(newStore);
      if (error) throw error;

      // Notify Admin on Telegram
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
      res.status(500).json({ 
        error: error.message || "Internal server error",
        details: typeof error === 'object' ? error : String(error)
      });
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
      
      const { data: store, error } = await getSupabase().from('stores').select('*').eq('username', trimmedUsername).single();

      if (!store || !(await bcrypt.compare(password, store.password || ""))) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      await getSupabase().from('stores').update({ last_active_at: new Date().toISOString() }).eq('id', store.id);

      res.json({
        success: true,
        storeId: store.store_id,
        settings: store.settings,
        products: store.products
      });
    } catch (error: any) {
      console.error("Login endpoint error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });


  // API Route: Sync/Update settings and products state
  app.post("/api/store/update-data", async (req, res) => {
    try {
      const { storeId, settings, products } = req.body;
      if (!storeId) {
        return res.status(400).json({ error: "Missing storeId" });
      }

      const { data: store, error: findError } = await getSupabase().from('stores').select('*').eq('store_id', storeId).single();

      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }

      const updateData: any = { last_active_at: new Date().toISOString() };
      
      if (settings) {
        updateData.settings = settings;
        updateData.store_name = settings.storeName || store.store_name;
        updateData.whatsapp_number = settings.whatsappNumber || store.whatsapp_number;
        updateData.business_type = settings.businessType || store.business_type;
        updateData.language = settings.language || store.language;
      }
      if (products) {
        updateData.products = products;
      }
      
      const { error: updateError } = await getSupabase().from('stores').update(updateData).eq('id', store.id);
      if (updateError) throw updateError;

      res.json({
        success: true,
        isSubscribed: store.is_subscribed,
        subscriptionEndDate: store.subscription_end_date
      });
    } catch (error: any) {
      console.error("Update-data endpoint error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Route: Register / Sync Store
  app.post("/api/store/register", async (req, res) => {
    try {
      const { storeId, storeName, whatsappNumber, businessType, language } = req.body;
      if (!storeId) {
        return res.status(400).json({ error: "Missing storeId" });
      }

      const { data: store, error: findError } = await getSupabase().from('stores').select('*').eq('store_id', storeId).single();
      const isNew = !store;

      if (isNew) {
        const newStore = {
          store_id: storeId,
          username: `user_${storeId}`, // Default username if register through sync
          password: 'password', // Default
          store_name: storeName || "Unnamed Store",
          whatsapp_number: whatsappNumber || "",
          business_type: businessType || "food",
          language: language || "ar",
          is_subscribed: false,
          registered_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
        };
        await getSupabase().from('stores').insert(newStore);

        // Notify Admin on Telegram
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
        await getSupabase().from('stores').update({
          store_name: storeName || store.store_name,
          whatsapp_number: whatsappNumber || store.whatsapp_number,
          business_type: businessType || store.business_type,
          language: language || store.language,
          last_active_at: new Date().toISOString()
        }).eq('id', store.id);
      }

      res.json({
        success: true,
        isSubscribed: store ? store.is_subscribed : false,
        subscriptionEndDate: store ? store.subscription_end_date : null,
      });
    } catch (error: any) {
      console.error("Register endpoint error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Route: Get Store Status
  app.get("/api/store/status", async (req, res) => {
    try {
      const { storeId } = req.query;
      if (!storeId || typeof storeId !== "string") {
        return res.status(400).json({ error: "Missing or invalid storeId" });
      }

      const { data: store, error: findError } = await getSupabase().from('stores').select('*').eq('store_id', storeId).single();

      if (!store) {
        return res.json({ isSubscribed: false });
      }

      // Check if subscription has expired
      let isSubscribed = store.is_subscribed;
      if (store.is_subscribed && store.subscription_end_date) {
        const expiry = new Date(store.subscription_end_date);
        if (expiry < new Date()) {
          isSubscribed = false;
          await getSupabase().from('stores').update({ is_subscribed: false }).eq('id', store.id);

          // Notify admin of expiry
          sendTelegramMessage(
            TELEGRAM_CHAT_ID,
            `⚠️ *انتهاء اشتراك متجر!*
• *المتجر:* ${store.store_name}
• *المعرف:* \`${store.store_id}\`
• انتهت صلاحية الاشتراك تلقائياً.`
          );
        }
      }

      res.json({
        isSubscribed,
        subscriptionEndDate: store.subscription_end_date,
      });
    } catch (error: any) {
      console.error("Status endpoint error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
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

  // Catch-all for undefined API routes to return JSON instead of HTML
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
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
                const { data: stores, error } = await getSupabase().from('stores').select('*');
                if (error || !stores || stores.length === 0) {
                  await sendTelegramMessage(fromChatId, "📋 لا يوجد أي متاجر مسجلة حالياً.");
                } else {
                  let reply = `📋 *قائمة المتاجر المسجلة (${stores.length}):*\n\n`;
                  stores.forEach((s: any) => {
                    const status = s.is_subscribed ? `✅ نشط (ينتهي: ${s.subscription_end_date ? new Date(s.subscription_end_date).toLocaleDateString("ar-EG") : "غير محدد"})` : "❌ مجاني/منتهي";
                    reply += `• *${s.store_name}*\n  المعرف: \`${s.store_id}\`\n  الاشتراك: ${status}\n  الواتساب: \`${s.whatsapp_number}\`\n\n`;
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

                const { data: store, error } = await getSupabase().from('stores').select('*').eq('store_id', targetId).single();

                if (!store) {
                  await sendTelegramMessage(fromChatId, `❌ لم يتم العثور على متجر بالمعرف \`${targetId}\`. تأكد من كتابة المعرف بشكل صحيح.`);
                } else {
                  const endDate = new Date();
                  endDate.setDate(endDate.getDate() + days);

                  await getSupabase().from('stores').update({ 
                    is_subscribed: true, 
                    subscription_end_date: endDate.toISOString() 
                  }).eq('id', store.id);

                  const reply = `✅ *تم تفعيل الاشتراك الاحترافي بنجاح!*
• *المتجر:* ${store.store_name}
• *المعرف:* \`${store.store_id}\`
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

                const { data: store, error } = await getSupabase().from('stores').select('*').eq('store_id', targetId).single();

                if (!store) {
                  await sendTelegramMessage(fromChatId, `❌ لم يتم العثور على متجر بالمعرف \`${targetId}\`.`);
                } else {
                  await getSupabase().from('stores').update({ 
                    is_subscribed: false, 
                    subscription_end_date: null 
                  }).eq('id', store.id);

                  const reply = `❌ *تم إلغاء تفعيل اشتراك المتجر بنجاح:*
• *المتجر:* ${store.store_name}
• *المعرف:* \`${store.store_id}\``;
                  
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

                const { data: store, error } = await getSupabase().from('stores').select('*').eq('store_id', targetId).single();

                if (!store) {
                  await sendTelegramMessage(fromChatId, `❌ لم يتم العثور على متجر بالمعرف \`${targetId}\`.`);
                } else {
                  const reply = `ℹ️ *تفاصيل المتجر:*
• *الاسم:* ${store.store_name}
• *المعرف:* \`${store.store_id}\`
• *الاشتراك:* ${store.is_subscribed ? "✅ نشط/احترافي" : "❌ غير نشط/مجاني"}
• *تاريخ الانتهاء:* ${store.subscription_end_date ? new Date(store.subscription_end_date).toLocaleString("ar-EG") : "لا يوجد"}
• *الواتساب:* \`${store.whatsapp_number}\`
• *اللغة المعتمدة:* ${store.language.toUpperCase()}
• *نوع النشاط:* ${store.business_type.toUpperCase()}
• *تاريخ التسجيل:* ${new Date(store.registered_at).toLocaleString("ar-EG")}
• *آخر ظهور:* ${new Date(store.last_active_at).toLocaleString("ar-EG")}`;
                  
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
