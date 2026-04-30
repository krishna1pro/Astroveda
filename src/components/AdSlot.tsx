export function AdSlot({ size = "300x250", className }: { size?: "300x250" | "320x50", className?: string }) {
  return (
    <div className={cn(
      "bg-surface border border-dashed border-gray-200 rounded-lg flex items-center justify-center mx-auto overflow-hidden",
      size === "300x250" ? "w-[300px] h-[250px]" : "w-[320px] h-[50px]",
      className
    )}>
      <span className="text-[10px] uppercase font-bold tracking-widest text-ink/20 transform rotate-12">Ad Space</span>
    </div>
  );
}

import { cn } from "../lib/utils";
