import React from 'react';
import { Wifi, BatteryMedium, Signal, Maximize2, Minimize2 } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  isFrameActive: boolean;
  onToggleFrame: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  isFrameActive,
  onToggleFrame,
}) => {
  if (!isFrameActive) {
    return <div className="relative w-full h-full overflow-hidden bg-black">{children}</div>;
  }

  // Current time for phone status bar
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-neutral-950 p-2 sm:p-6 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial from-neutral-900/60 to-black pointer-events-none" />

      {/* Frame Switcher button floating top-right */}
      <button
        onClick={onToggleFrame}
        className="absolute top-4 right-4 z-50 px-3 py-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 border border-neutral-700 shadow-xl transition-all"
        title="Switch to full screen edge-to-edge mode"
      >
        <Maximize2 size={13} />
        <span className="hidden sm:inline">Edge-to-Edge View</span>
      </button>

      {/* Google Pixel 9 Pro Chassis */}
      <div className="relative w-full max-w-[420px] h-[92vh] max-h-[880px] bg-neutral-900 rounded-[48px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_2px_rgba(255,255,255,0.08),0_0_0_8px_rgba(30,30,30,0.8)] border border-neutral-700/60 flex flex-col justify-between overflow-hidden">
        
        {/* Physical hardware volume rocker & power button on side (decorative) */}
        <div className="absolute -right-2 top-28 w-1 h-12 bg-neutral-700 rounded-r-md pointer-events-none" />
        <div className="absolute -right-2 top-44 w-1 h-20 bg-neutral-700 rounded-r-md pointer-events-none" />

        {/* Android Phone Display (Screen) */}
        <div className="relative w-full h-full bg-black rounded-[40px] overflow-hidden flex flex-col justify-between border border-neutral-800">
          
          {/* Android Status Bar with Punch Hole Selfie Camera */}
          <div className="relative z-40 w-full pt-2 pb-1 px-6 flex items-center justify-between text-neutral-300 text-[11px] font-medium bg-black/40 select-none">
            {/* Clock */}
            <span className="font-semibold tracking-tight">{currentTime}</span>

            {/* Pixel Center Punch Hole Camera */}
            <div className="absolute left-1/2 top-2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border-2 border-neutral-800/80 flex items-center justify-center shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-950 ring-1 ring-blue-500/30" />
            </div>

            {/* Android Icons: 5G, Wifi, Battery */}
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="font-bold text-[9px] tracking-tighter">5G</span>
              <Signal size={12} />
              <Wifi size={12} />
              <BatteryMedium size={14} className="text-neutral-200" />
            </div>
          </div>

          {/* Camera Viewport & Controls */}
          <div className="relative flex-1 w-full overflow-hidden flex flex-col">
            {children}
          </div>

          {/* Android Home Navigation Bar Pill */}
          <div className="relative z-40 w-full pb-2 pt-1 flex items-center justify-center bg-black/60 pointer-events-none">
            <div className="w-32 h-1 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </div>
  );
};
