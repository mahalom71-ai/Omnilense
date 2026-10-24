import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Battery, 
  Wifi, 
  Crosshair, 
  Play, 
  RotateCcw, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  Disc,
  X,
  Gauge,
  Sliders,
  Maximize2
} from 'lucide-react';
import { DroneTelemetry, DroneQuickShot } from '../types/camera';
import { cameraAudio } from '../utils/audio';

interface DroneFlightHUDProps {
  telemetry: DroneTelemetry;
  onUpdateTelemetry: (updated: Partial<DroneTelemetry>) => void;
  activeQuickShot: DroneQuickShot;
  quickShotProgress: number; // 0 to 100
  isExecutingQuickShot: boolean;
  onStartQuickShot: (type: DroneQuickShot) => void;
  onCancelQuickShot: () => void;
}

const QUICKSHOT_MODES: { id: DroneQuickShot; name: string; desc: string }[] = [
  { id: 'dronie', name: 'Dronie', desc: 'Flies back & upwards revealing landscape' },
  { id: 'rocket', name: 'Rocket', desc: 'Ascends straight up with camera tilted down 90°' },
  { id: 'orbit', name: 'Orbit 360°', desc: 'Smooth circular orbit around tracked target' },
  { id: 'helix', name: 'Helix', desc: 'Spirals upward while expanding radius' },
  { id: 'fpv', name: 'FPV Cruise', desc: 'High-speed forward flight with dynamic horizon bank' },
];

export const DroneFlightHUD: React.FC<DroneFlightHUDProps> = ({
  telemetry,
  onUpdateTelemetry,
  activeQuickShot,
  quickShotProgress,
  isExecutingQuickShot,
  onStartQuickShot,
  onCancelQuickShot,
}) => {
  const [showFlightSticks, setShowFlightSticks] = useState(false);
  const [showQuickShotPicker, setShowQuickShotPicker] = useState(true);

  // Manual pitch toggle: -90 (down) or -20 (horizon)
  const toggleGimbalPitch = () => {
    cameraAudio.playZoomTick();
    const nextPitch = telemetry.gimbalPitch <= -60 ? -20 : -90;
    onUpdateTelemetry({ gimbalPitch: nextPitch });
  };

  // Flight Mode toggle: CINE, NORMAL, SPORT
  const cycleFlightMode = () => {
    cameraAudio.playZoomTick();
    const modes: ('CINE' | 'NORMAL' | 'SPORT')[] = ['CINE', 'NORMAL', 'SPORT'];
    const idx = modes.indexOf(telemetry.flightMode);
    onUpdateTelemetry({ flightMode: modes[(idx + 1) % modes.length] });
  };

  // Flight Stick nudges
  const handleNudgeAltitude = (delta: number) => {
    cameraAudio.playZoomTick();
    const nextAlt = Math.max(10, Math.min(450, telemetry.altitude + delta));
    onUpdateTelemetry({ altitude: nextAlt });
  };

  const handleNudgeHeading = (delta: number) => {
    cameraAudio.playZoomTick();
    const nextH = (telemetry.heading + delta + 360) % 360;
    onUpdateTelemetry({ heading: nextH });
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-3 select-none">
      
      {/* 1. TOP FLIGHT TELEMETRY BAR */}
      <div className="w-full flex items-center justify-between text-white font-mono text-[11px] bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-700/80 pointer-events-auto shadow-2xl">
        {/* Left: Flight Mode & Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={cycleFlightMode}
            className="px-2 py-0.5 rounded-full bg-amber-400 text-black font-bold text-[10px] tracking-wider"
          >
            {telemetry.flightMode}
          </button>
          <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
            <ShieldCheck size={13} />
            <span>OA ON</span>
          </span>
        </div>

        {/* Center: GPS & Compass */}
        <div className="flex items-center gap-2 text-neutral-300">
          <span className="flex items-center gap-1">
            <Compass size={13} className="text-amber-400" />
            <span>{Math.round(telemetry.heading)}°</span>
          </span>
          <span className="text-neutral-500">|</span>
          <span className="text-emerald-400 font-bold">{telemetry.gpsSats} Sats</span>
        </div>

        {/* Right: RC Signal & Battery */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Wifi size={13} className="text-emerald-400" />
            <span className="text-[10px] hidden sm:inline">HD 1080p</span>
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <Battery size={14} />
            <span>{telemetry.batteryPercent}%</span>
            <span className="text-[9px] text-neutral-400 hidden sm:inline font-normal">({telemetry.flightTimeRemaining})</span>
          </span>
        </div>
      </div>

      {/* 2. CENTER: ACTIVETRACK SUBJECT RETICLE & GIMBAL PITCH DIAL */}
      <div className="relative w-full flex-1 flex items-center justify-center">
        {/* ActiveTrack Target Box */}
        <div className="relative w-28 h-28 border-2 border-emerald-400/80 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300">
          {/* Corner tick brackets */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

          {/* Center reticle */}
          <Crosshair size={24} className="text-emerald-400/70 animate-pulse" />

          {/* ActiveTrack Tag */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[9px] font-bold tracking-widest whitespace-nowrap shadow">
            ACTIVETRACK LOCKED
          </div>
        </div>

        {/* Right Edge: Gimbal Pitch Dial Slider & Preset Button */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-700/80">
          <button
            onClick={toggleGimbalPitch}
            className="px-1.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-[9px] font-bold font-mono transition-all"
            title="Toggle Nadir (90° down) or Horizon (20°)"
          >
            {telemetry.gimbalPitch <= -60 ? '90°' : 'HORIZ'}
          </button>

          <div className="relative h-32 flex items-center">
            <input
              type="range"
              min={-90}
              max={-10}
              step={1}
              value={telemetry.gimbalPitch}
              onChange={e => onUpdateTelemetry({ gimbalPitch: parseInt(e.target.value, 10) })}
              className="h-28 w-1.5 bg-neutral-700 rounded appearance-none cursor-pointer accent-amber-400 -rotate-90"
            />
          </div>

          <span className="text-[9px] font-mono font-bold text-amber-400">
            {Math.abs(telemetry.gimbalPitch)}°
          </span>
        </div>

        {/* QuickShot Execution Progress Overlay */}
        {isExecutingQuickShot && (
          <div className="absolute top-10 flex flex-col items-center gap-1 pointer-events-auto">
            <div className="px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-md border border-amber-400/80 shadow-2xl flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <div className="text-left font-mono">
                <div className="text-xs font-bold text-amber-400 tracking-wider uppercase">
                  EXECUTING {activeQuickShot}...
                </div>
                <div className="text-[10px] text-neutral-300">
                  {Math.round(quickShotProgress)}% Completed • Standby
                </div>
              </div>

              <button
                onClick={onCancelQuickShot}
                className="w-7 h-7 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center ml-2 shadow"
                title="Emergency Cancel"
              >
                <X size={15} />
              </button>
            </div>

            <div className="w-56 h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-1 shadow">
              <div
                className="h-full bg-amber-400 transition-all duration-100"
                style={{ width: `${quickShotProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. FLIGHT STICKS OVERLAY (OPTIONAL ON/OFF) */}
      {showFlightSticks && (
        <div className="relative w-full flex items-center justify-between px-4 pb-2 pointer-events-auto">
          {/* Left Stick: Altitude Up/Down & Yaw Turn */}
          <div className="p-2 rounded-2xl bg-black/75 backdrop-blur-md border border-neutral-700 flex flex-col items-center gap-1 shadow-2xl">
            <span className="text-[9px] font-mono text-neutral-400">ALT / YAW</span>
            <button
              onClick={() => handleNudgeAltitude(15)}
              className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 flex items-center justify-center active:scale-95"
            >
              <ArrowUp size={16} />
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => handleNudgeHeading(-15)}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center active:scale-95"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={() => handleNudgeHeading(15)}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center active:scale-95"
              >
                <ArrowRight size={16} />
              </button>
            </div>
            <button
              onClick={() => handleNudgeAltitude(-15)}
              className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 flex items-center justify-center active:scale-95"
            >
              <ArrowDown size={16} />
            </button>
          </div>

          {/* Right Stick: Quick Pitch Gimbal */}
          <div className="p-2 rounded-2xl bg-black/75 backdrop-blur-md border border-neutral-700 flex flex-col items-center gap-1 shadow-2xl">
            <span className="text-[9px] font-mono text-neutral-400">PITCH</span>
            <button
              onClick={() => onUpdateTelemetry({ gimbalPitch: Math.min(-10, telemetry.gimbalPitch + 10) })}
              className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 flex items-center justify-center active:scale-95"
            >
              <ArrowUp size={16} />
            </button>
            <button
              onClick={() => onUpdateTelemetry({ gimbalPitch: Math.max(-90, telemetry.gimbalPitch - 10) })}
              className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 flex items-center justify-center active:scale-95"
            >
              <ArrowDown size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 4. BOTTOM FLIGHT METRICS & QUICKSHOTS DRAWER */}
      <div className="w-full flex flex-col gap-2 pointer-events-auto">
        
        {/* QuickShots Automation Selector Carousel */}
        {showQuickShotPicker && !isExecutingQuickShot && (
          <div className="w-full bg-black/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-neutral-800 shadow-2xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-300">
              <span className="font-bold flex items-center gap-1 text-amber-400">
                <Disc size={13} />
                <span>QUICKSHOTS MODES</span>
              </span>
              <button
                onClick={() => setShowFlightSticks(!showFlightSticks)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                  showFlightSticks ? 'bg-amber-400 text-black border-amber-400' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
              >
                Flight Sticks
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {QUICKSHOT_MODES.map(qs => (
                <button
                  key={qs.id}
                  onClick={() => onStartQuickShot(qs.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeQuickShot === qs.id
                      ? 'bg-amber-400 text-black border-amber-400 font-bold shadow'
                      : 'bg-neutral-900/90 text-neutral-200 border-neutral-700/80 hover:bg-neutral-800'
                  }`}
                  title={qs.desc}
                >
                  <Play size={11} className={activeQuickShot === qs.id ? 'fill-current' : ''} />
                  <span>{qs.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Real-time Flight Metrics Strip */}
        <div className="w-full bg-black/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-neutral-700/80 shadow-2xl grid grid-cols-4 gap-2 text-center font-mono">
          <div>
            <span className="text-[9px] text-neutral-400 block">ALTITUDE</span>
            <span className="text-xs font-bold text-amber-400">{telemetry.altitude.toFixed(1)}m</span>
          </div>

          <div>
            <span className="text-[9px] text-neutral-400 block">DISTANCE</span>
            <span className="text-xs font-bold text-white">{telemetry.distance.toFixed(0)}m</span>
          </div>

          <div>
            <span className="text-[9px] text-neutral-400 block">V. SPEED</span>
            <span className="text-xs font-bold text-emerald-400">{telemetry.verticalSpeed.toFixed(1)} m/s</span>
          </div>

          <div>
            <span className="text-[9px] text-neutral-400 block">H. SPEED</span>
            <span className="text-xs font-bold text-sky-400">{telemetry.horizontalSpeed.toFixed(1)} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};
