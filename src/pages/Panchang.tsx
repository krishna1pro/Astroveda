import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sunrise, Sunset, Clock, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { getISTDate, formatDate, cn, parseSheetDate, getISTDateDDMMYYYY } from "../lib/utils";
import { PanchangData } from "../types";
import { AdSlot } from "../components/AdSlot";
import { SidebarAd, MobileAdStack } from "../components/AdSidebar";

export default function Panchang() {
  const [data, setData] = useState<PanchangData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getISTDateDDMMYYYY());
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPanchang = async () => {
      setLoading(true);
      try {
        const todayStr = getISTDateDDMMYYYY();
        const response = await fetch(`/api/panchang?date=${todayStr}`);
        const result = await response.json();
        if (Array.isArray(result)) {
          setData(result);
        } else {
          console.error("Invalid response format:", result);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPanchang();
  }, []);

  const todayIST = getISTDateDDMMYYYY();
  const currentPanchang = data.find(d => d.date === selectedDate) || data[0];

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const jumpToToday = () => {
    setSelectedDate(todayIST);
    const index = data.findIndex(d => d.date === todayIST);
    if (index !== -1 && scrollRef.current) {
      const container = scrollRef.current;
      const activeItem = container.children[index] as HTMLElement;
      if (activeItem) {
        const scrollAmount = activeItem.offsetLeft - (container.clientWidth / 2) + (activeItem.clientWidth / 2);
        container.scrollTo({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      const timer = setTimeout(jumpToToday, 100);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const shiftWeek = (direction: 'prev' | 'next') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'next' ? 400 : -400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const formattedDateHeader = currentPanchang ? formatDate(currentPanchang.date) : "";

  return (
    <div className="min-h-screen bg-bg pt-24 pb-20 md:pt-32 px-4 md:px-8 lg:px-12 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-ink">Daily Panchang</h1>
          <p className="text-ink-muted text-sm font-bold uppercase tracking-widest italic opacity-60">Vedic Astronomical Calculations</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:gap-10">
          {/* Main Content Column */}
          <div className="min-w-0 flex-1">
            {/* Date Selection Area */}
            <div className="mb-12 relative bg-white/50 p-6 rounded-[32px] border border-yellow-100/50">
              <div className="flex justify-center md:justify-start mb-6">
                <button 
                  onClick={jumpToToday}
                  className="premium-button !py-1.5 !text-[10px] uppercase tracking-widest"
                >
                  Jump to Today
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => shiftWeek('prev')}
                  className="p-2 bg-white rounded-full shadow-sm hover:bg-yellow-50 transition-colors text-slate-400 hover:text-primary shrink-0"
                >
                  <ChevronLeft size={20} />
                </button>

                <div 
                  ref={scrollRef}
                  className="flex-1 flex overflow-x-auto gap-1.5 md:gap-2 lg:gap-3 pb-2 hide-scrollbar snap-x no-scrollbar md:overflow-x-hidden lg:overflow-x-auto"
                >
                  {data.map((day, idx) => {
                    const isSelected = selectedDate === day.date;
                    const isToday = todayIST === day.date;
                    const { day: d, month: monthName, dayName } = parseSheetDate(day.date);

                    return (
                      <button
                        key={day.date || idx}
                        onClick={() => handleDateSelect(day.date)}
                        className={cn(
                          "flex-shrink-0 w-14 md:w-[calc((100%-48px)/7)] lg:w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 snap-center border shrink-0",
                          isSelected 
                            ? "bg-primary border-primary text-slate-900 shadow-xl scale-105 z-10" 
                            : "bg-white border-transparent text-gray-500 hover:border-yellow-200"
                        )}
                      >
                        <span className="text-[9px] md:text-[8px] lg:text-[9px] font-bold tracking-wider mb-1 opacity-60">{dayName}</span>
                        <span className="text-xl md:text-lg lg:text-xl font-bold leading-none mb-1">{d}</span>
                        <span className="text-[9px] md:text-[8px] lg:text-[9px] font-bold uppercase tracking-tight opacity-60">{monthName}</span>
                        {isToday && !isSelected && <div className="w-1 h-1 bg-primary rounded-full mt-1" />}
                      </button>
                    );
                  })}
                </div>

                <button 
                  onClick={() => shiftWeek('next')}
                  className="p-2 bg-white rounded-full shadow-sm hover:bg-yellow-50 transition-colors text-slate-400 hover:text-primary shrink-0"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* Unified Ledger Card */}
                <div className="bg-white rounded-3xl border border-yellow-100 shadow-2xl shadow-yellow-900/5 overflow-hidden mb-8">
                  {/* Card Header */}
                  <div className="bg-yellow-50/50 py-6 px-4 border-b border-yellow-100 text-center">
                     <p className="text-sm font-bold text-ink uppercase tracking-[0.2em] mb-1 opacity-40">Panchangam For</p>
                     <h2 className="text-xl font-bold text-ink">{formattedDateHeader}</h2>
                  </div>

                  {/* Sunrise/Sunset strip */}
                  <div className="grid grid-cols-2 bg-yellow-50/30 border-b border-yellow-100 italic">
                    <div className="flex items-center justify-center gap-2 py-4 border-r border-yellow-100">
                      <Sunrise size={16} className="text-orange-500" />
                      <span className="text-xs font-bold text-ink-muted uppercase tracking-widest mr-2">Sunrise</span>
                      <span className="text-sm font-bold text-ink">{currentPanchang?.sunrise || "--:--"}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Sunset size={16} className="text-blue-500" />
                      <span className="text-xs font-bold text-ink-muted uppercase tracking-widest mr-2">Sunset</span>
                      <span className="text-sm font-bold text-ink">{currentPanchang?.sunset || "--:--"}</span>
                    </div>
                  </div>

                  {/* Data Rows */}
                  <div className="px-8 py-4">
                    <LedgerRow label="Tithi" value={currentPanchang?.tithi} />
                    <LedgerRow label="Nakshatra" value={currentPanchang?.nakshatra} />
                    <LedgerRow label="Yoga" value={currentPanchang?.yoga} />
                    <LedgerRow label="Karana" value={currentPanchang?.karana} />
                    <LedgerRow label="Varjyam" value={currentPanchang?.varjyam} type="bad" />
                    <LedgerRow label="Durmuhurtam" value={currentPanchang?.durmuhurtam} type="bad" />
                    <LedgerRow label="Amrutam" value={currentPanchang?.amrutam} type="good" />
                  </div>
                  
                  <div className="px-8 pb-8 flex justify-center italic">
                     <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                       <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                       Verified Vedic Calculations
                     </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <MobileAdStack />
          </div>

          <SidebarAd />
        </div>
      </div>
    </div>
  );
}

function LedgerRow({ label, value, type }: { label: string; value?: string; type?: 'good' | 'bad' }) {
  if (!value || value === "---" || value === "N/A") return null;

  return (
    <div className="flex items-center justify-between py-5 border-b border-dashed border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors px-2 -mx-2 rounded-lg">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        {type === 'bad' && <div className="w-1.5 h-1.5 rounded-full bg-red-400" />}
        {type === 'good' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        <span className={cn(
          "text-lg font-bold text-slate-900 tracking-tight",
          type === 'bad' && "text-red-600/80",
          type === 'good' && "text-emerald-700"
        )}>
          {value}
        </span>
      </div>
    </div>
  );
}

