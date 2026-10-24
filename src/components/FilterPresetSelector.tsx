import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { FilterPreset } from '../types/camera';
import { FILTER_PRESETS } from '../utils/filterLuts';
import { cameraAudio } from '../utils/audio';

interface FilterPresetSelectorProps {
  currentPresetId: string;
  onSelectPreset: (preset: FilterPreset) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const FilterPresetSelector: React.FC<FilterPresetSelectorProps> = ({
  currentPresetId,
  onSelectPreset,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 bg-neutral-950/95 backdrop-blur-2xl border-t border-neutral-800 rounded-t-3xl pt-3 pb-6 px-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          <span className="text-sm font-bold tracking-wider text-neutral-100">PIXEL COLOR PRESETS & LUTS</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center"
        >
          <X size={18} />
        </button>
      </div>

      <div className="py-3 flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory">
        {FILTER_PRESETS.map(preset => {
          const isSelected = preset.id === currentPresetId;
          return (
            <button
              key={preset.id}
              onClick={() => {
                cameraAudio.playZoomTick();
                onSelectPreset(preset);
              }}
              className={`snap-center flex-shrink-0 w-28 flex flex-col items-center gap-2 p-2 rounded-2xl transition-all duration-200 text-center ${
                isSelected
                  ? 'bg-amber-400/20 border-2 border-amber-400 shadow-lg'
                  : 'bg-neutral-900 border border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Swatch visual representation */}
              <div 
                className="w-20 h-16 rounded-xl overflow-hidden relative border border-white/10 shadow-inner flex items-center justify-center"
                style={{
                  background: preset.motionBlur?.enabled 
                    ? 'linear-gradient(135deg, #0f172a, #1e1b4b, #311042)'
                    : 'linear-gradient(135deg, #2b3a4a, #d49b77, #f68c51)',
                  filter: preset.cssFilter,
                }}
              >
                {preset.motionBlur?.enabled ? (
                  /* Glowing light trail streaks */
                  <div className="absolute inset-0 flex flex-col justify-center gap-1.5 px-2">
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-white rounded-full shadow-[0_0_8px_#38bdf8] animate-pulse" />
                    <div className="h-1.5 w-4/5 bg-gradient-to-r from-transparent via-red-500 to-amber-300 rounded-full shadow-[0_0_10px_#ef4444]" />
                    <div className="h-0.5 w-3/5 bg-gradient-to-r from-transparent via-amber-400 to-white rounded-full shadow-[0_0_6px_#f59e0b]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/80 shadow-md" />
                )}

                {preset.motionBlur?.enabled && (
                  <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-amber-400 text-[8px] font-bold text-black tracking-tighter">
                    TRAILS
                  </span>
                )}
              </div>

              <div className="w-full">
                <div className={`text-xs font-bold truncate ${isSelected ? 'text-amber-400' : 'text-neutral-200'}`}>
                  {preset.name}
                </div>
                <div className="text-[10px] text-neutral-400 truncate leading-tight mt-0.5">
                  {preset.motionBlur?.enabled ? 'LIGHT TRAILS' : preset.category.toUpperCase()}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
