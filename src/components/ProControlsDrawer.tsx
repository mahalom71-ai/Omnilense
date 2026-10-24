import React, { useState } from 'react';
import { 
  X, 
  RotateCcw, 
  Sun, 
  Sliders, 
  Focus, 
  Gauge, 
  Eye, 
  Activity, 
  Check
} from 'lucide-react';
import { ProSettings } from '../types/camera';
import { cameraAudio } from '../utils/audio';

interface ProControlsDrawerProps {
  settings: ProSettings;
  onChange: (updated: Partial<ProSettings>) => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const SHUTTER_PRESETS = [
  { label: 'Auto', value: 'auto', seconds: 0.02 },
  { label: '1/8000s', value: '1/8000', seconds: 1 / 8000 },
  { label: '1/4000s', value: '1/4000', seconds: 1 / 4000 },
  { label: '1/2000s', value: '1/2000', seconds: 1 / 2000 },
  { label: '1/1000s', value: '1/1000', seconds: 1 / 1000 },
  { label: '1/500s', value: '1/500', seconds: 1 / 500 },
  { label: '1/250s', value: '1/250', seconds: 1 / 250 },
  { label: '1/125s', value: '1/125', seconds: 1 / 125 },
  { label: '1/60s', value: '1/60', seconds: 1 / 60 },
  { label: '1/30s', value: '1/30', seconds: 1 / 30 },
  { label: '1/15s', value: '1/15', seconds: 1 / 15 },
  { label: '1/4s', value: '1/4', seconds: 1 / 4 },
  { label: '1s', value: '1s', seconds: 1 },
  { label: '2s', value: '2s', seconds: 2 },
  { label: '4s', value: '4s', seconds: 4 },
  { label: '8s', value: '8s', seconds: 8 },
  { label: '15s', value: '15s', seconds: 15 },
  { label: '30s', value: '30s', seconds: 30 },
];

const ISO_PRESETS: (number | 'auto')[] = ['auto', 50, 100, 200, 400, 800, 1600, 3200, 6400];

const WB_PRESETS = [
  { label: 'Auto', val: 'auto', kelvin: 5500 },
  { label: 'Daylight (5500K)', val: 5500, kelvin: 5500 },
  { label: 'Cloudy (6500K)', val: 6500, kelvin: 6500 },
  { label: 'Shade (7500K)', val: 7500, kelvin: 7500 },
  { label: 'Tungsten (3200K)', val: 3200, kelvin: 3200 },
  { label: 'Fluorescent (4000K)', val: 4000, kelvin: 4000 },
];

export const ProControlsDrawer: React.FC<ProControlsDrawerProps> = ({
  settings,
  onChange,
  onReset,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'shutter' | 'iso' | 'ev' | 'wb' | 'focus'>('shutter');

  if (!isOpen) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 bg-neutral-950/95 backdrop-blur-2xl border-t border-neutral-800 rounded-t-3xl pt-3 pb-6 px-4 shadow-2xl flex flex-col gap-3 max-h-[420px] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-sm font-bold tracking-wider text-neutral-100">PRO CONTROLS</span>
          <span className="text-[11px] text-neutral-400 font-mono">Pixel 9 Pro Expert</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              cameraAudio.playZoomTick();
              onReset();
            }}
            className="text-xs text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
            title="Reset to Auto"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Primary Category Selector */}
      <div className="grid grid-cols-5 gap-1.5 p-1 bg-neutral-900 rounded-2xl border border-neutral-800 text-xs">
        <button
          onClick={() => setActiveTab('shutter')}
          className={`py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
            activeTab === 'shutter' ? 'bg-amber-400 text-black font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Gauge size={15} />
          <span className="text-[10px]">Shutter</span>
          <span className="text-[9px] opacity-75 font-mono">{settings.shutterSpeed}</span>
        </button>

        <button
          onClick={() => setActiveTab('iso')}
          className={`py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
            activeTab === 'iso' ? 'bg-amber-400 text-black font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sliders size={15} />
          <span className="text-[10px]">ISO</span>
          <span className="text-[9px] opacity-75 font-mono">{settings.iso}</span>
        </button>

        <button
          onClick={() => setActiveTab('ev')}
          className={`py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
            activeTab === 'ev' ? 'bg-amber-400 text-black font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sun size={15} />
          <span className="text-[10px]">EV</span>
          <span className="text-[9px] opacity-75 font-mono">{settings.ev >= 0 ? `+${settings.ev}` : settings.ev}</span>
        </button>

        <button
          onClick={() => setActiveTab('wb')}
          className={`py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
            activeTab === 'wb' ? 'bg-amber-400 text-black font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span className="text-xs font-bold leading-tight">WB</span>
          <span className="text-[10px]">Color</span>
          <span className="text-[9px] opacity-75 font-mono">
            {typeof settings.whiteBalance === 'number' ? `${settings.whiteBalance}K` : settings.whiteBalance}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('focus')}
          className={`py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
            activeTab === 'focus' ? 'bg-amber-400 text-black font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Focus size={15} />
          <span className="text-[10px]">Focus</span>
          <span className="text-[9px] opacity-75 font-mono">
            {settings.focusMode === 'auto' ? 'AF' : `${settings.manualFocusDistance}%`}
          </span>
        </button>
      </div>

      {/* Tab Content Panel */}
      <div className="py-2">
        {/* SHUTTER SPEED */}
        {activeTab === 'shutter' && (
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-neutral-400 font-mono">
              <span>Shutter Speed (Motion & Light)</span>
              <span className="text-amber-400 font-bold">{settings.shutterSpeed}</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {SHUTTER_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => {
                    cameraAudio.playZoomTick();
                    onChange({ shutterSpeed: preset.value, shutterSeconds: preset.seconds });
                  }}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                    settings.shutterSpeed === preset.value
                      ? 'bg-amber-400 text-black font-bold shadow-md'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ISO */}
        {activeTab === 'iso' && (
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-neutral-400 font-mono">
              <span>Sensor Sensitivity (ISO)</span>
              <span className="text-amber-400 font-bold">
                {settings.iso === 'auto' ? 'Auto ISO' : `ISO ${settings.iso}`}
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {ISO_PRESETS.map(val => (
                <button
                  key={val}
                  onClick={() => {
                    cameraAudio.playZoomTick();
                    onChange({ iso: val });
                  }}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono transition-all ${
                    settings.iso === val
                      ? 'bg-amber-400 text-black font-bold shadow-md'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {val === 'auto' ? 'Auto' : val}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* EV EXPOSURE COMPENSATION */}
        {activeTab === 'ev' && (
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-neutral-400 font-mono">
              <span>Exposure Value (EV)</span>
              <span className="text-amber-400 font-bold">
                {settings.ev > 0 ? `+${settings.ev.toFixed(1)}` : settings.ev.toFixed(1)} EV
              </span>
            </div>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.3}
              value={settings.ev}
              onChange={e => onChange({ ev: parseFloat(e.target.value) })}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>-3.0 (Darker)</span>
              <span>0.0 (Standard)</span>
              <span>+3.0 (Brighter)</span>
            </div>
          </div>
        )}

        {/* WHITE BALANCE */}
        {activeTab === 'wb' && (
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-neutral-400 font-mono">
              <span>Color Temperature (White Balance)</span>
              <span className="text-amber-400 font-bold">
                {typeof settings.whiteBalance === 'number'
                  ? `${settings.whiteBalance}K`
                  : settings.whiteBalance.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {WB_PRESETS.map(wb => (
                <button
                  key={wb.label}
                  onClick={() => {
                    cameraAudio.playZoomTick();
                    onChange({ whiteBalance: wb.val as 'auto' | number });
                  }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs transition-all ${
                    settings.whiteBalance === wb.val
                      ? 'bg-amber-400 text-black font-bold shadow-md'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {wb.label}
                </button>
              ))}
            </div>

            {/* Custom Kelvin Slider */}
            <div className="pt-2">
              <div className="text-[11px] text-neutral-400 mb-1 flex justify-between">
                <span>Custom Kelvin</span>
                <span>2000K — 10000K</span>
              </div>
              <input
                type="range"
                min={2000}
                max={10000}
                step={100}
                value={typeof settings.whiteBalance === 'number' ? settings.whiteBalance : 5500}
                onChange={e => onChange({ whiteBalance: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gradient-to-r from-amber-500 via-neutral-200 to-sky-400 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>
        )}

        {/* FOCUS */}
        {activeTab === 'focus' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-mono">Focus Mode</span>
              <div className="flex gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
                <button
                  onClick={() => onChange({ focusMode: 'auto' })}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    settings.focusMode === 'auto' ? 'bg-amber-400 text-black' : 'text-neutral-400'
                  }`}
                >
                  AF (Auto)
                </button>
                <button
                  onClick={() => onChange({ focusMode: 'manual' })}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    settings.focusMode === 'manual' ? 'bg-amber-400 text-black' : 'text-neutral-400'
                  }`}
                >
                  MF (Manual)
                </button>
              </div>
            </div>

            {settings.focusMode === 'manual' && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                <div className="flex justify-between text-xs text-neutral-400 font-mono">
                  <span>Focus Distance</span>
                  <span className="text-amber-400 font-bold">
                    {settings.manualFocusDistance < 20
                      ? 'Macro (Close-up)'
                      : settings.manualFocusDistance > 80
                      ? 'Infinity (∞)'
                      : `${settings.manualFocusDistance}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.manualFocusDistance}
                  onChange={e => onChange({ manualFocusDistance: parseInt(e.target.value, 10) })}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />

                {/* Focus Peaking toggle */}
                <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Eye size={15} className="text-emerald-400" />
                    <span className="text-xs text-neutral-300">Focus Peaking (Green Edges)</span>
                  </div>
                  <button
                    onClick={() => onChange({ focusPeaking: !settings.focusPeaking })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      settings.focusPeaking ? 'bg-emerald-500' : 'bg-neutral-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        settings.focusPeaking ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pro Toggles Bar: RAW, Histogram */}
      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
        <button
          onClick={() => onChange({ rawEnabled: !settings.rawEnabled })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            settings.rawEnabled
              ? 'bg-emerald-500 text-black shadow-md'
              : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <span className="text-[11px] font-bold">RAW</span>
          <span>DNG + JPEG</span>
          {settings.rawEnabled && <Check size={13} />}
        </button>

        <button
          onClick={() => onChange({ showHistogram: !settings.showHistogram })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            settings.showHistogram
              ? 'bg-amber-400 text-black shadow-md'
              : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <Activity size={14} />
          <span>Live Histogram</span>
        </button>
      </div>
    </div>
  );
};
