import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "stores_db.json");

export interface StoreRecord {
  storeId: string;
  username?: string;
  password?: string;
  storeName: string;
  whatsappNumber: string;
  businessType: string;
  language: string;
  isSubscribed: boolean;
  subscriptionEndDate?: string;
  registeredAt: string;
  lastActiveAt: string;
  settings?: any;
  products?: any[];
}

// Helper to load stores locally as fallback
function loadLocalStores(): StoreRecord[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error loading local stores database:", error);
  }
  return [];
}

function saveLocalStores(stores: StoreRecord[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(stores, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving local stores database:", error);
  }
}

let db: Firestore | null = null;
let isFirebaseEnabled = false;

// Verify Firestore connection in the background right after initialization
async function verifyConnection() {
  if (!db) return;
  try {
    // Try to perform a quiet look up to verify Firestore API is fully enabled and active
    await db.collection("stores").limit(1).get();
    console.log("✅ [Firebase] Live Firestore connection verified successfully!");
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (
      errMsg.includes("PERMISSION_DENIED") ||
      errMsg.includes("disabled") ||
      errMsg.includes("has not been used") ||
      errMsg.includes("not enabled") ||
      errMsg.includes("7")
    ) {
      isFirebaseEnabled = false;
      console.log("ℹ️ [Firebase] Firestore API is not enabled or permissions are missing in this project.");
      console.log("ℹ️ [Firebase] Gracefully utilizing Local JSON Database fallback (stores_db.json). This is normal behavior for this sandbox.");
    } else {
      console.log("⚠️ [Firebase] Unexpected error during connection verification:", errMsg);
    }
  }
}

// Dynamic self-healing fallback: disable Firestore if API is disabled or permission denied
function handleFirestoreError(err: any, actionDescription: string) {
  const errMsg = err?.message || String(err);

  if (
    errMsg.includes("PERMISSION_DENIED") ||
    errMsg.includes("disabled") ||
    errMsg.includes("has not been used") ||
    errMsg.includes("not enabled") ||
    errMsg.includes("7")
  ) {
    if (isFirebaseEnabled) {
      console.log(`ℹ️ [Firebase] Firestore connection failed during "${actionDescription}" because Firestore API is not enabled or active.`);
      console.log("ℹ️ [Firebase] Automatically disabled live connection. Switching to Local JSON Database fallback.");
      isFirebaseEnabled = false;
    }
  } else {
    console.error(`❌ [Firebase] Unexpected Firestore error during "${actionDescription}":`, errMsg);
  }
}

// Safe init function that doesn't throw or crash on startup
export function initFirebase() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    try {
      // Fix private key formatting if it comes with escaped newlines
      privateKey = privateKey.replace(/\\n/g, "\n");

      if (getApps().length === 0) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      }
      db = getFirestore();
      isFirebaseEnabled = true;
      console.log("🔥 [Firebase] Initialized with manual Service Account credentials.");
      verifyConnection();
    } catch (err) {
      console.error("❌ [Firebase] Failed to initialize Firebase admin SDK with manual credentials:", err);
      isFirebaseEnabled = false;
    }
  } else {
    // Try Application Default Credentials (ADC) - 100% Automatic in Google Cloud/Cloud Run environment!
    try {
      if (getApps().length === 0) {
        initializeApp(); // No options passed means initializeApp() will automatically use ADC!
      }
      db = getFirestore();
      isFirebaseEnabled = true;
      console.log("🔥 [Firebase] Initialized automatically using Application Default Credentials (ADC).");
      verifyConnection();
    } catch (err) {
      console.log("ℹ️ [Firebase] Environment variables or Google Application Default Credentials not found. Operating in Local Fallback mode (using stores_db.json).");
      isFirebaseEnabled = false;
    }
  }
}

export function isFirebaseActive(): boolean {
  return isFirebaseEnabled;
}

export async function getAllStores(): Promise<StoreRecord[]> {
  if (isFirebaseEnabled && db) {
    try {
      const snapshot = await db.collection("stores").get();
      const stores: StoreRecord[] = [];
      snapshot.forEach((doc) => {
        stores.push(doc.data() as StoreRecord);
      });
      return stores;
    } catch (err) {
      handleFirestoreError(err, "getAllStores");
    }
  }
  return loadLocalStores();
}

export async function getStoreById(storeId: string): Promise<StoreRecord | null> {
  if (isFirebaseEnabled && db) {
    try {
      const doc = await db.collection("stores").doc(storeId).get();
      if (doc.exists) {
        return doc.data() as StoreRecord;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, `getStoreById(${storeId})`);
    }
  }
  const local = loadLocalStores();
  return local.find((s) => s.storeId === storeId) || null;
}

export async function getStoreByUsername(username: string): Promise<StoreRecord | null> {
  const trimmed = username.trim().toLowerCase();
  if (isFirebaseEnabled && db) {
    try {
      const snapshot = await db.collection("stores").where("username", "==", trimmed).limit(1).get();
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as StoreRecord;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, `getStoreByUsername(${username})`);
    }
  }
  const local = loadLocalStores();
  return local.find((s) => s.username === trimmed) || null;
}

export async function saveStore(store: StoreRecord): Promise<void> {
  if (isFirebaseEnabled && db) {
    try {
      await db.collection("stores").doc(store.storeId).set(store);
      return;
    } catch (err) {
      handleFirestoreError(err, `saveStore(${store.storeId})`);
    }
  }
  const local = loadLocalStores();
  const index = local.findIndex((s) => s.storeId === store.storeId);
  if (index !== -1) {
    local[index] = store;
  } else {
    local.push(store);
  }
  saveLocalStores(local);
}

export async function updateStoreLastActive(storeId: string): Promise<void> {
  const lastActiveAt = new Date().toISOString();
  if (isFirebaseEnabled && db) {
    try {
      await db.collection("stores").doc(storeId).update({ lastActiveAt });
      return;
    } catch (err) {
      handleFirestoreError(err, `updateStoreLastActive(${storeId})`);
    }
  }
  const local = loadLocalStores();
  const store = local.find((s) => s.storeId === storeId);
  if (store) {
    store.lastActiveAt = lastActiveAt;
    saveLocalStores(local);
  }
}
