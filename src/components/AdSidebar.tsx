import React from 'react';

export function SidebarAd() {
  return (
    <aside className="hidden lg:flex flex-none w-[300px] flex-col gap-6">
      <div className="sticky top-24 flex flex-col gap-6 items-center">
        {/* AdSense 300x250 */}
        <div className="w-[300px] h-[250px] bg-yellow-50/50 border-2 border-dashed border-yellow-200 rounded-xl flex items-center justify-center text-ink-muted/40 font-mono text-xs text-center p-4">
          <div>
            <p className="font-bold mb-1">AdSense 300x250</p>
            <p className="opacity-60 text-[10px]">Desktop Sidebar - Top</p>
          </div>
        </div>

        {/* AdSense 300x600 */}
        <div className="w-[300px] h-[600px] bg-yellow-50/50 border-2 border-dashed border-yellow-200 rounded-xl flex items-center justify-center text-ink-muted/40 font-mono text-xs text-center p-4">
          <div>
            <p className="font-bold mb-1">AdSense 300x600</p>
            <p className="opacity-60 text-[10px]">Desktop Sidebar - Skyscraper</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileAdStack() {
  return (
    <div className="flex lg:hidden flex-col gap-4 mt-8 pb-10 items-center">
      <div className="w-full max-w-[300px] h-[250px] bg-yellow-50/50 border-2 border-dashed border-yellow-200 rounded-xl flex items-center justify-center text-ink-muted/40 font-mono text-xs text-center p-4">
        <p className="font-bold">AdSense 300x250</p>
      </div>
      <div className="w-full max-w-[300px] h-[600px] bg-yellow-50/50 border-2 border-dashed border-yellow-200 rounded-xl flex items-center justify-center text-ink-muted/40 font-mono text-xs text-center p-4">
        <p className="font-bold">AdSense 300x600</p>
      </div>
    </div>
  );
}
