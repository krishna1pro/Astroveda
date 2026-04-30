import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Heart, Briefcase, Activity, Calendar } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { RashiHoroscope } from "../types";
import { AdSlot } from "../components/AdSlot";
import { cn, getISTDate } from "../lib/utils";
import { SidebarAd, MobileAdStack } from "../components/AdSidebar";

const RASHI_DATA = [
  { en: "Aries", te: "మేష రాశి", icon: "♈" },
  { en: "Taurus", te: "వృషభ రాశి", icon: "♉" },
  { en: "Gemini", te: "మిథున రాశి", icon: "♊" },
  { en: "Cancer", te: "కర్కాటక రాశి", icon: "♋" },
  { en: "Leo", te: "సింహ రాశి", icon: "♌" },
  { en: "Virgo", te: "కన్యా రాశి", icon: "♍" },
  { en: "Libra", te: "తులా రాశి", icon: "♎" },
  { en: "Scorpio", te: "వృశ్చిక రాశి", icon: "♏" },
  { en: "Sagittarius", te: "ధనుస్సు రాశి", icon: "♐" },
  { en: "Capricorn", te: "మకర రాశి", icon: "♑" },
  { en: "Aquarius", te: "కుంభ రాశి", icon: "♒" },
  { en: "Pisces", te: "మీన రాశి", icon: "♓" },
];

export default function Horoscope() {
  const [horoscopes, setHoroscopes] = useState<RashiHoroscope[]>([]);
  const [selectedRashi, setSelectedRashi] = useState<RashiHoroscope | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHoroscopes = async () => {
      try {
        const response = await fetch("/api/horoscope");
        const json = await response.json();
        
        if (json.data) {
          setHoroscopes(json.data);
          setLoading(false);
        } else if (json.needsUpdate) {
          console.log("Cache miss. Generating horoscopes from frontend...");
          
          const ai = new GoogleGenAI({ apiKey: process.env.Astro || "" });
          const todayStr = json.todayDate;
          
          const prompt = `
            Generate today's astrological forecast for all 12 Zodiac signs. 
            Format STRICTLY as a JSON array of 12 objects containing the exact keys: 
            Date (${todayStr}), Rashi_EN, Rashi_TE, General_TE, General_EN, Love_TE, Love_EN, Career_TE, Career_EN, Health_TE, Health_EN. 
            Keep Telugu natural and optimistic.
            Signs: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces.
          `;

          const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });

          const jsonText = (result.text || "[]").trim();
          const freshData = JSON.parse(jsonText);
          
          if (Array.isArray(freshData) && freshData.length > 0) {
            // Update Backend Cache
            await fetch("/api/horoscope", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ horoscopes: freshData })
            });
            setHoroscopes(freshData);
          } else {
            throw new Error("Failed to generate or parse horoscope data");
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Horoscope Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHoroscopes();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20 md:pt-32 px-4 md:px-8 lg:px-12 bg-bg transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight mb-3 text-ink">Rashiphalau</h1>
          <p className="text-ink-muted text-sm font-bold tracking-wide uppercase italic opacity-60">Daily Celestial Forecasts • Insights for Today</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:gap-10">
          {/* Main Content Column */}
          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-ink/30 animate-pulse">Consulting the alignment...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {horoscopes.map((h, i) => {
                  const staticData = RASHI_DATA.find(r => r.en.toLowerCase() === h.Rashi_EN.toLowerCase()) || RASHI_DATA[i];
                  return (
                    <motion.button
                      key={h.Rashi_EN}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.5, ease: "easeOut" }}
                      onClick={() => setSelectedRashi(h)}
                      className="group w-full bg-white border border-yellow-100 rounded-[32px] p-4 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_20px_40px_-20px_rgba(234,179,8,0.2)] hover:border-primary/50 relative overflow-hidden min-w-0"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500" />
                      
                      <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-[18px] md:rounded-[20px] lg:rounded-[24px] bg-bg flex items-center justify-center text-3xl md:text-4xl lg:text-5xl shadow-sm border border-yellow-50 relative z-10 shrink-0">
                        {staticData.icon}
                      </div>
                      
                      <div className="text-center relative z-10 min-w-0 w-full px-1">
                        <h3 className="font-bold text-ink text-sm md:text-base lg:text-lg mb-0.5 leading-tight truncate">
                          {h.Rashi_TE}
                        </h3>
                        <p className="text-[9px] md:text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.15em] lg:tracking-[0.2em] text-ink-muted group-hover:text-primary-dark transition-colors truncate">
                          {h.Rashi_EN}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            <MobileAdStack />
          </div>

          <SidebarAd />
        </div>

        <AnimatePresence>
          {selectedRashi && (
            <Modal 
              rashi={selectedRashi} 
              onClose={() => setSelectedRashi(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Modal({ rashi, onClose }: { rashi: RashiHoroscope; onClose: () => void }) {
  const staticData = RASHI_DATA.find(r => r.en.toLowerCase() === rashi.Rashi_EN.toLowerCase()) || { icon: "✨" };
  const today = rashi.Date || getISTDate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-bg w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative max-h-[85vh] flex flex-col"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 bg-white hover:bg-yellow-50 rounded-full flex items-center justify-center text-ink transition-all z-20 group border border-yellow-100"
        >
          <X size={24} strokeWidth={1.5} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        <div className="p-10 md:p-14 overflow-y-auto hide-scrollbar">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center gap-8 mb-14">
            <div className="w-28 h-28 rounded-[36px] bg-primary flex items-center justify-center text-6xl shadow-xl shadow-primary/20 shrink-0">
               {staticData.icon}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={14} className="text-primary-dark" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">{today} • Daily Prediction</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tighter mb-1">{rashi.Rashi_TE}</h2>
              <p className="text-lg font-medium text-ink-muted italic">{rashi.Rashi_EN} Horizon</p>
            </div>
          </div>

          <div className="space-y-12 pb-10">
            <PredictionSection 
              titleTe="సాధారణ" 
              titleEn="General" 
              textTe={rashi.General_TE} 
              textEn={rashi.General_EN} 
              icon={<Sparkles size={20} className="text-orange-400" />} 
            />
            <PredictionSection 
              titleTe="కెరీర్" 
              titleEn="Career" 
              textTe={rashi.Career_TE} 
              textEn={rashi.Career_EN} 
              icon={<Briefcase size={20} className="text-blue-400" />} 
            />
            <PredictionSection 
              titleTe="ప్రేమ" 
              titleEn="Love" 
              textTe={rashi.Love_TE} 
              textEn={rashi.Love_EN} 
              icon={<Heart size={20} className="text-red-400" />} 
            />
            <PredictionSection 
              titleTe="ఆరోగ్యం" 
              titleEn="Health" 
              textTe={rashi.Health_TE} 
              textEn={rashi.Health_EN} 
              icon={<Activity size={20} className="text-green-400" />} 
            />
          </div>
          
          <div className="mt-4 pt-10 border-t border-gray-100">
             <AdSlot size="320x50" />
             <p className="text-[10px] text-center text-ink/20 font-bold uppercase tracking-[0.3em] mt-8">Authenticated AstroVeda Forecast</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PredictionSection({ titleTe, titleEn, textTe, textEn, icon }: { titleTe: string; titleEn: string; textTe: string; textEn: string; icon: React.ReactNode }) {
  return (
    <div className="relative pl-10">
      <div className="absolute left-0 top-0 mt-1">
        {icon}
      </div>
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-xl font-bold tracking-tight">{titleTe}</h3>
        <span className="w-1 h-1 rounded-full bg-gray-200" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">{titleEn}</span>
      </div>
      <div className="space-y-3">
        <p className="text-ink leading-relaxed font-medium text-lg">
          {textTe}
        </p>
        <p className="text-gray-500 leading-relaxed text-sm italic">
          {textEn}
        </p>
      </div>
    </div>
  );
}

