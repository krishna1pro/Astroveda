import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { GoogleGenAI } from "@google/genai";
import NodeCache from "node-cache";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const cache = new NodeCache({ stdTTL: 86400 }); // 24 hours in seconds

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    time: new Date().toISOString(),
    vercel: !!process.env.VERCEL,
    env: {
      has_panchang_id: !!process.env.GOOGLE_SHEET_ID_PANCHANG,
      has_email: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      has_key: !!process.env.GOOGLE_PRIVATE_KEY,
      node_env: process.env.NODE_ENV
    }
  });
});

// Auth for Google Sheets
const getAuth = () => {
  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
};

// --- API ROUTES ---

// 1. Panchang - Fetch 15 day window
app.get("/api/panchang", async (req, res) => {
  try {
    const { date } = req.query; 
    const sheetId = process.env.GOOGLE_SHEET_ID_PANCHANG;
    if (!sheetId) throw new Error("Panchang Sheet ID missing");

    const auth = getAuth();
    const doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; // Assuming Sheet1 or index 0
    const rows = await sheet.getRows();

    // Standard headers: Date, Tithi, Nakshatra, Yoga, Varjyam, Amrutam, Durmuhurtam, Sunrise, Sunset
    const allData = rows.map(row => ({
      date: row.get("Date"),
      tithi: row.get("Tithi"),
      nakshatra: row.get("Nakshatra"),
      yoga: row.get("Yoga"),
      varjyam: row.get("Varjyam"),
      amrutam: row.get("Amrutam"),
      durmuhurtam: row.get("Durmuhurtam"),
      sunrise: row.get("Sunrise"),
      sunset: row.get("Sunset")
    }));
    
    const centerIndex = allData.findIndex(r => r.date === date);
    if (centerIndex === -1) {
      return res.json(allData.slice(0, 15));
    }

    const start = Math.max(0, centerIndex - 7);
    const end = Math.min(allData.length, centerIndex + 8);
    res.json(allData.slice(start, end));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Horoscope (Rashiphalau)
app.get("/api/horoscope", async (req, res) => {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID_PANCHANG;
    if (!sheetId) throw new Error("Panchang Sheet ID missing for caching");

    const auth = getAuth();
    const doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo();

    const cacheSheet = doc.sheetsByTitle["Daily_Horoscope_Cache"];
    if (!cacheSheet) {
       return res.status(404).json({ error: "Cache sheet 'Daily_Horoscope_Cache' required" });
    }

    const rows = await cacheSheet.getRows();
    // Use consistent IST date format
    const todayStr = new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");

    const firstRowDate = rows.length > 0 ? rows[0].get("Date") : null;

    if (firstRowDate === todayStr && rows.length >= 12) {
      console.log("Serving horoscope from Google Sheets row cache");
      return res.json({ success: true, data: rows.slice(0, 12).map(r => r.toObject()) });
    }

    // Cache Miss or Date Mismatch: Signal client to update
    console.log(`Cache miss or date mismatch (${firstRowDate} vs ${todayStr})`);
    res.json({ success: true, needsUpdate: true, todayDate: todayStr });
  } catch (error: any) {
    console.error("Horoscope Get Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/horoscope", async (req, res) => {
  try {
    const { horoscopes } = req.body;
    if (!horoscopes || !Array.isArray(horoscopes)) throw new Error("Invalid horoscope data");

    const sheetId = process.env.GOOGLE_SHEET_ID_PANCHANG;
    const auth = getAuth();
    const doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo();

    const cacheSheet = doc.sheetsByTitle["Daily_Horoscope_Cache"];
    if (!cacheSheet) throw new Error("Cache sheet missing");

    await cacheSheet.clearRows();
    await cacheSheet.addRows(horoscopes);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Horoscope Cache Update Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Pujas - Dynamic worksheet tabs
app.get("/api/pujas", async (req, res) => {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID_PUJAS;
    if (!sheetId) throw new Error("Pujas Sheet ID missing");

    const auth = getAuth();
    const doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo();

    const pujas = doc.sheetsByIndex.map(sheet => ({
      id: sheet.sheetId,
      name: sheet.title,
    }));

    res.json(pujas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/pujas/:sheetName", async (req, res) => {
  try {
    const { sheetName } = req.params;
    const sheetId = process.env.GOOGLE_SHEET_ID_PUJAS;
    if (!sheetId) throw new Error("Pujas Sheet ID missing");

    const auth = getAuth();
    const doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle[sheetName];
    if (!sheet) return res.status(404).json({ error: "Puja not found" });

    const rows = await sheet.getRows();
    const data = rows.map(row => row.toObject());
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Admin Auth
app.post("/api/admin/auth", (req, res) => {
  const { passcode } = req.body;
  if (passcode === (process.env.ADMIN_PASSCODE || "12026")) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid passcode" });
  }
});

// Export the app for Vercel
export default app;

if (process.env.NODE_ENV !== "production") {
  async function startServer() {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  startServer();
} else if (!process.env.VERCEL) {
  // Only listen if we are in production but NOT on Vercel (e.g. standard VPS)
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
