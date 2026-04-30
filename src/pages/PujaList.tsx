import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { List, LayoutGrid, ChevronDown, CheckCircle2, Languages } from "lucide-react";
import { Puja, PujaItem } from "../types";
import { cn } from "../lib/utils";
import { AdSlot } from "../components/AdSlot";

export default function PujaList() {
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [selectedPuja, setSelectedPuja] = useState<string>("");
  const [items, setItems] = useState<PujaItem[]>([]);
  const [viewMode, setViewMode] = useState<'tile' | 'text'>('tile');
  const [language, setLanguage] = useState<'english' | 'telugu'>('english');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPujas = async () => {
      try {
        const response = await fetch("/api/pujas");
        const data = await response.json();
        if (Array.isArray(data)) {
          setPujas(data);
          if (data.length > 0) setSelectedPuja(data[0].name);
        } else {
          console.error("Invalid response format:", data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPujas();
  }, []);

  useEffect(() => {
    if (selectedPuja) {
      const fetchItems = async () => {
        try {
          const response = await fetch(`/api/pujas/${selectedPuja}`);
          const data = await response.json();
          if (Array.isArray(data)) {
            setItems(data);
          } else {
            console.error("Invalid response format:", data);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchItems();
    }
  }, [selectedPuja]);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-20 md:pt-32 bg-bg">
       <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-ink">Puja Samagri</h1>
        <p className="text-ink-muted text-sm font-bold opacity-60">Sacred item lists for your spiritual practice.</p>
      </header>

      {/* Selectors Bar */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
             <select
              value={selectedPuja}
              onChange={(e) => setSelectedPuja(e.target.value)}
              className="w-full appearance-none bg-white border border-yellow-100 rounded-2xl px-5 py-4 font-bold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {pujas.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={18} />
          </div>
          
          <button 
            onClick={() => setLanguage(l => l === 'english' ? 'telugu' : 'english')}
            className="w-14 h-14 bg-white border border-yellow-100 rounded-2xl flex items-center justify-center text-ink shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Languages size={20} />
          </button>
        </div>

        <div className="flex bg-surface p-1 rounded-2xl w-fit self-end">
          <button 
            onClick={() => setViewMode('tile')}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
              viewMode === 'tile' ? "bg-white text-ink shadow-sm" : "text-ink-muted"
            )}
          >
            <LayoutGrid size={14} />
            Tile View
          </button>
          <button 
            onClick={() => setViewMode('text')}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
              viewMode === 'text' ? "bg-white text-ink shadow-sm" : "text-ink-muted"
            )}
          >
            <List size={14} />
            Text View
          </button>
        </div>
      </div>

      <AdSlot className="mb-8" />

      {/* Items Display */}
      <div className="premium-card overflow-hidden">
        {items.map((item, i) => {
          const itemName = language === 'telugu' 
            ? (item.Item_TE || item.telugu || "---") 
            : (item.Item_EN || item.english || "---");
          
          const isSubHeading = itemName.endsWith(':-') || 
                             itemName.includes('సామాగ్రి') || 
                             itemName.toLowerCase().includes('samagri');

          if (isSubHeading) {
            return (
              <div 
                key={i} 
                className="px-6 py-6 border-b border-gray-100 bg-surface/50 text-center"
              >
                <span className="text-lg font-bold text-primary-dark uppercase tracking-tight">
                  {itemName}
                </span>
              </div>
            );
          }

          return (
            <div 
              key={i} 
              className="px-6 py-4 border-b border-yellow-50 flex justify-between items-center last:border-0 hover:bg-yellow-50/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <CheckCircle2 size={16} className="text-primary/40" />
                <span className="text-sm font-semibold text-ink leading-relaxed">
                  {itemName}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-20">
          <p className="text-ink-muted font-medium italic">Select a Puja to view the sacred list.</p>
        </div>
      )}

      <AdSlot className="mt-12" />
    </div>
  );
}
