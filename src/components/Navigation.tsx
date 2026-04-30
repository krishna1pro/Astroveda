import { Link, useLocation } from "react-router-dom";
import { Calendar, Star, BookOpen, User } from "lucide-react";
import { cn } from "../lib/utils";

export function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: "Panchangam", path: "/", icon: Calendar },
    { name: "Rashiphalau", path: "/rashiphalau", icon: Star },
    { name: "Pujas", path: "/pujas", icon: BookOpen },
  ];

  return (
    <>
      {/* Top Navbar for Desktop */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-bg border-bottom border-yellow-100 z-50 hidden md:flex items-center px-8 border-b">
        <Link to="/" className="flex items-center gap-2 mr-12">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center border-2 border-white shadow-sm">
            <span className="text-xl font-bold text-slate-900">A</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-ink">AstroVeda</span>
        </Link>
        <div className="flex gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary-dark",
                location.pathname === item.path ? "text-ink" : "text-ink-muted"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Sticky Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-bg border-t border-yellow-100 z-50 flex md:hidden items-center justify-around px-4 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px]",
                isActive ? "text-primary" : "text-ink-muted"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all",
                isActive && "bg-primary/20"
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-bg py-12 px-8 mt-20 border-t border-yellow-100">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm text-ink-muted leading-relaxed max-w-2xl mx-auto italic opacity-70">
          "Astrology is an ancient science based on mathematical planetary calculations and predictions. 
          It is intended for guidance and is not guaranteed to be 100% accurate."
        </p>
        <div className="mt-8 text-[11px] font-medium tracking-widest uppercase text-ink/30">
          © 2026 AstroVeda Premium • High Quality Personal Astrology
        </div>
      </div>
    </footer>
  );
}
