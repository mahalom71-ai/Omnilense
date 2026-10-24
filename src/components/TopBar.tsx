import React, { useState } from 'react';
import { 
  Zap, 
  ZapOff, 
  Timer, 
  SlidersHorizontal, 
  Settings, 
  Ratio, 
  Sparkles,
  Camera as CameraIcon,
  HelpCircle,
  Eye
} from 'lucide-react';
import { AspectRatio, FlashMode, TimerMode, CameraMode } from '../types/camera';

interface TopBarProps {
  mode: CameraMode;
  flash: FlashMode;
  onCycleFlash: () => void;
  timer: TimerMode;
  onCycleTimer: () => void;
  aspectRatio: AspectRatio;
  onCycleAspectRatio: () => void;
  rawEnabled: boolean;
  onToggleRaw: () => void;
  macroActive: boolean;
  onToggleMacro: () => void;
  onOpenSettings: () => void;
  onOpenFilters: () => void;
  activeFilterName: string;
  isSimulated: boolean;
  onToggleSource: () => void;
  activeSceneName?: string;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  mode,
  flash,
  onCycleFlash,
  timer,
  onCycleTimer,
  aspectRatio,
  onCycleAspectRatio,
  rawEnabled,
  onToggleRaw,
  macroActive,
  onToggleMacro,
  onOpenSettings,
  onOpenFilters,
  activeFilterName,
  isSimulated,
  onToggleSource,
  activeSceneName,
  isPhoneFrame,
  onTogglePhoneFrame,
}) => {
  const [showQuickPill, setShowQuickPill] = useState(false);

  return (
    <div className="relative z-30 w-full pt-3 pb-2 px-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
      {/* Left controls: Flash & Timer */}
      <div className="flex items-center gap-2">
        {/* Flash Toggle */}
        <button
          onClick={onCycleFlash}
          className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
            flash !== 'off' 
              ? 'bg-amber-400 text-black font-semibold shadow-md' 
              : 'bg-black/50 text-neutral-200 hover:bg-black/70 backdrop-blur-md'
          }`}
          title={`Flash: ${flash.toUpperCase()}`}
          aria-label="Flash mode"
        >
          {flash === 'off' && <ZapOff size={18} />}
          {flash === 'auto' && (
            <div className="relative flex items-center justify-center">
              <Zap size={18} />
              <span className="absolute -top-1 -right-2 text-[9px] font-bold">A</span>
            </div>
          )}
          {flash === 'on' && <Zap size={18} />}
          {flash === 'torch' && (
            <div className="relative flex items-center justify-center">
              <Zap size={18} className="fill-current" />
            </div>
          )}
        </button>

        {/* Timer Toggle */}
        <button
          onClick={onCycleTimer}
          className={`h-9 px-2.5 rounded-full flex items-center justify-center gap-1 transition-all ${
            timer > 0 
              ? 'bg-amber-400 text-black font-semibold shadow-md' 
              : 'bg-black/50 text-neutral-200 hover:bg-black/70 backdrop-blur-md'
          }`}
          title={`Timer: ${timer === 0 ? 'Off' : `${timer}s`}`}
          aria-label="Timer"
        >
          <Timer size={17} />
          {timer > 0 && <span className="text-xs font-bold">{timer}s</span>}
        </button>

        {/* RAW/JPEG Toggle (Available in Pro and Photo modes) */}
        {(mode === 'photo' || mode === 'pro') && (
          <button
            onClick={onToggleRaw}
            className={`h-9 px-2 rounded-full flex items-center justify-center text-[11px] font-bold tracking-wider transition-all ${
              rawEnabled
                ? 'bg-emerald-400 text-black shadow-md'
                : 'bg-black/50 text-neutral-300 hover:bg-black/70 backdrop-blur-md'
            }`}
            title="Toggle RAW DNG + JPEG"
          >
            RAW
          </button>
        )}
      </div>

      {/* Center: Pixel Camera Status Pill */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleSource}
          className={`h-8 px-3 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all backdrop-blur-md border ${
            isSimulated 
              ? 'bg-indigo-950/70 border-indigo-500/40 text-indigo-200 hover:bg-indigo-900/80' 
              : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/80'
          }`}
          title="Toggle between physical camera and simulated telephoto scenes"
        >
          <span className={`w-2 h-2 rounded-full ${isSimulated ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="truncate max-w-[110px]">
            {isSimulated ? (activeSceneName ? activeSceneName.split(' ')[0] : 'Pixel Lab') : 'Live Cam'}
          </span>
        </button>

        {/* Filters Badge */}
        <button
          onClick={onOpenFilters}
          className={`h-8 px-2.5 rounded-full flex items-center gap-1 text-xs font-medium backdrop-blur-md transition-all ${
            activeFilterName !== 'Real Tone'
              ? 'bg-amber-400 text-neutral-950 font-semibold'
              : 'bg-black/50 text-neutral-300 hover:bg-black/70'
          }`}
          title="Pixel Color Presets & LUTs"
        >
          <Sparkles size={14} />
          <span className="text-[11px] max-w-[70px] truncate">{activeFilterName}</span>
        </button>
      </div>

      {/* Right controls: Aspect Ratio & Settings */}
      <div className="flex items-center gap-2">
        {/* Aspect Ratio */}
        <button
          onClick={onCycleAspectRatio}
          className="h-9 px-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-neutral-200 flex items-center justify-center gap-1 text-xs font-semibold"
          title={`Aspect Ratio: ${aspectRatio}`}
        >
          <Ratio size={16} />
          <span className="text-[11px]">{aspectRatio}</span>
        </button>

        {/* Settings modal trigger */}
        <button
          onClick={onOpenSettings}
          className="h-9 w-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-neutral-200 flex items-center justify-center transition-all"
          title="Camera Settings"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
};
