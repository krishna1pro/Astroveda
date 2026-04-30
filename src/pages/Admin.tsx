import React, { useState, useEffect, useRef } from "react";
import { Lock, Download, Printer, User, Phone, Globe, MapPin } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Puja, PujaItem } from "../types";
import { cn } from "../lib/utils";

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [selectedPuja, setSelectedPuja] = useState<string>("");
  const [items, setItems] = useState<PujaItem[]>([]);
  const [language, setLanguage] = useState<'english' | 'telugu'>('english');
  const [isExporting, setIsExporting] = useState(false);
  
  const letterpadRef = useRef<HTMLDivElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode })
      });
      const data = await resp.json();
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setError("Invalid Passcode");
      }
    } catch (err) {
      setError("Auth failed");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/pujas").then(r => r.json()).then(data => {
        if (Array.isArray(data)) {
          setPujas(data);
          if (data.length > 0) setSelectedPuja(data[0].name);
        } else {
          console.error("Invalid response format:", data);
          setPujas([]);
        }
      }).catch(err => {
        console.error("Fetch error:", err);
        setPujas([]);
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedPuja) {
      fetch(`/api/pujas/${selectedPuja}`).then(r => r.json()).then(data => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          console.error("Invalid response format:", data);
          setItems([]);
        }
      }).catch(err => {
        console.error("Fetch error:", err);
        setItems([]);
      });
    }
  }, [selectedPuja]);

  const exportAsImage = async () => {
    if (!letterpadRef.current) return;
    setIsExporting(true);
    try {
       const canvas = await html2canvas(letterpadRef.current, {
         scale: 3, // HD
         useCORS: true,
         backgroundColor: '#ffffff'
       });
       const link = document.createElement('a');
       link.download = `${selectedPuja}-List.png`;
       link.href = canvas.toDataURL('image/png');
       link.click();
    } finally {
       setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!letterpadRef.current) return;
    setIsExporting(true);
    try {
       const canvas = await html2canvas(letterpadRef.current, { scale: 3 });
       const imgData = canvas.toDataURL('image/png');
       const pdf = new jsPDF('p', 'mm', 'a4');
       const imgProps = pdf.getImageProperties(imgData);
       const pdfWidth = pdf.internal.pageSize.getWidth();
       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
       pdf.save(`${selectedPuja}-List.pdf`);
    } finally {
       setIsExporting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-bg flex items-center justify-center p-6 z-[200]">
        <div className="premium-card p-8 w-full max-w-sm text-center bg-white">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/20">
            <Lock className="text-slate-900" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-ink">Admin Access</h1>
          <p className="text-ink-muted text-sm mb-8 opacity-60">Enter secure passcode to continue.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password"
              placeholder="•••••"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-bg border border-yellow-100 rounded-xl px-5 py-3 text-center text-2xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {error && <p className="text-xs font-bold text-red-500">{error}</p>}
            <button className="premium-button w-full">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-32 grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-12 bg-bg">
      {/* Controls */}
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-ink">Export Studio</h1>
          <p className="text-ink-muted font-bold italic opacity-60">Generate high-definition printables for clients.</p>
        </header>

        <div className="premium-card p-6 space-y-6">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-ink-muted mb-2 block">Select Puja</label>
            <select
              value={selectedPuja}
              onChange={(e) => setSelectedPuja(e.target.value)}
              className="w-full bg-surface border border-gray-100 rounded-xl px-5 py-3 font-bold text-sm"
            >
              {pujas.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-ink-muted mb-2 block">Language</label>
            <div className="flex bg-surface p-1 rounded-xl">
              <button 
                onClick={() => setLanguage('english')}
                className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all", language === 'english' ? "bg-white shadow-sm" : "text-ink-muted")}
              >English</button>
              <button 
                onClick={() => setLanguage('telugu')}
                className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all", language === 'telugu' ? "bg-white shadow-sm" : "text-ink-muted")}
              >తెలుగు</button>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={exportAsImage}
              disabled={isExporting}
              className="flex-1 premium-button bg-ink text-white hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download size={18} />
              HD Image
            </button>
            <button 
              onClick={exportAsPDF}
              disabled={isExporting}
              className="flex-1 premium-button border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Printer size={18} />
              PDF Document
            </button>
          </div>
        </div>
      </div>

      {/* Preview Letterpad */}
      <div className="bg-yellow-50/20 p-8 rounded-3xl overflow-hidden hidden lg:block border border-yellow-100/50">
         <div className="scale-[0.45] origin-top border border-yellow-200 shadow-2xl">
            <div ref={letterpadRef} className="admin-letterpad" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
               <header className="flex justify-between items-start pb-8 mb-12" style={{ borderBottom: '2px solid #EAB308' }}>
                 <div className="flex items-center gap-4">
                   <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-4 border-white" style={{ backgroundColor: '#EAB308', boxShadow: '0 10px 15px -3px rgba(234,179,8,0.3)' }}>
                     <span className="text-4xl font-bold" style={{ color: '#111111' }}>A</span>
                   </div>
                   <div>
                     <h2 className="text-4xl font-bold tracking-tighter uppercase" style={{ color: '#111111' }}>Astrologer Name</h2>
                     <p className="text-lg italic" style={{ color: '#666666' }}>Ancient Vedic Sciences & Ritual Specialist</p>
                   </div>
                 </div>
                 <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-2 text-sm font-bold" style={{ color: '#111111' }}><Phone size={14} style={{ color: '#ccac00' }} /> +91 91234 56789</div>
                    <div className="flex items-center justify-end gap-2 text-sm font-bold" style={{ color: '#111111' }}><User size={14} style={{ color: '#ccac00' }} /> contact@astroveda.com</div>
                    <div className="flex items-center justify-end gap-2 text-sm font-bold" style={{ color: '#111111' }}><Globe size={14} style={{ color: '#ccac00' }} /> www.astroveda.com</div>
                 </div>
               </header>

               <main className="flex-1">
                 <h3 className="text-3xl font-bold text-center mb-10 underline decoration-4 underline-offset-8" style={{ textDecorationColor: '#FFD700' }}>
                   {selectedPuja} - Samagri List
                 </h3>
                 
                <div className="grid grid-cols-2 gap-x-12 gap-y-1">
                  {items.map((item, i) => {
                    const itemName = language === 'telugu' 
                      ? (item.Item_TE || item.telugu || "---") 
                      : (item.Item_EN || item.english || "---");
                    
                    const isSubHeading = itemName.endsWith(':-') || 
                                       itemName.includes('సామాగ్రి') || 
                                       itemName.toLowerCase().includes('samagri');

                    if (isSubHeading) {
                      return (
                        <div key={i} className="col-span-2 py-6 text-center mt-4">
                           <span className="text-2xl font-bold border-b-2 border-primary-dark pb-1 text-black uppercase">
                             {itemName}
                           </span>
                        </div>
                      );
                    }

                    return (
                      <div key={i} className="flex justify-start items-center border-b border-gray-100 py-3">
                         <span className="text-lg font-medium text-black">{itemName}</span>
                      </div>
                    );
                  })}
                </div>
               </main>

               <footer className="mt-12 pt-8 flex justify-between items-end italic" style={{ borderTop: '1px solid #f3f4f6' }}>
                 <div className="max-w-[300px]">
                    <p className="text-sm font-bold flex items-start gap-2" style={{ color: '#111111' }}>
                      <MapPin size={18} style={{ color: '#ccac00' }} className="shrink-0" />
                      123, Celestial Heights, Temple Road, Hyderabad, IST - 500001
                    </p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#e5e7eb' }}>Blessed & Certified</p>
                    <div className="w-40 h-24 border border-dashed rounded flex items-center justify-center" style={{ borderColor: '#e5e7eb', color: '#e5e7eb' }}>
                       Signature / Office Seal
                    </div>
                 </div>
               </footer>
            </div>
          </div>
         <p className="text-center text-xs font-bold text-ink-muted mt-4">Letterpad HD Preview (Scale 45%)</p>
      </div>
    </div>
  );
}
