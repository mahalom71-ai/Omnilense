import React, { useState, useRef, useEffect } from 'react';
import { cameraAudio } from '../utils/audio';

interface LensSelectorProps {
  currentZoom: number;
  onZoomChange: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
}

const PRESET_LENSES = [
  { value: 0.5, label: '.5', name: 'Ultra Wide (14mm)' },
  { value: 1, label: '1×', name: 'Wide / Main (24mm)' },
  { value: 2, label: '2', name: '2× Lossless Crop (48mm)' },
  { value: 5, label: '5', name: '5× Optical Telephoto (120mm)' },
  { value: 10, label: '10', name: '10× Super Res (240mm)' },
];

export const LensSelector: React.FC<LensSelectorProps> = ({
  currentZoom,
  onZoomChange,
  minZoom = 0.5,
  maxZoom = 30.0,
}) => {
  const [showSlider, setShowSlider] = useState(false);
  const hideSliderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = () => {
    if (hideSliderTimeoutRef.current) {
      clearTimeout(hideSliderTimeoutRef.current);
    }
    hideSliderTimeoutRef.current = setTimeout(() => {
      setShowSlider(false);
    }, 3800);
  };

  const handlePillClick = (val: number) => {
    cameraAudio.playZoomTick();
    onZoomChange(val);
    setShowSlider(true);
    resetHideTimer();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = parseFloat(e.target.value);
    if (Math.abs(nextVal - currentZoom) >= 0.1) {
      cameraAudio.playZoomTick();
    }
    onZoomChange(nextVal);
    resetHideTimer();
  };

  useEffect(() => {
    return () => {
      if (hideSliderTimeoutRef.current) {
        clearTimeout(hideSliderTimeoutRef.current);
      }
    };
  }, []);

  // Determine active lens tag
  const isOptical5x = currentZoom >= 4.9 && currentZoom <= 5.1;
  const isUltrawide = currentZoom <= 0.6;
  const isSuperRes = currentZoom >= 9.9;

  return (
    <div className="relative z-20 flex flex-col items-center justify-center pointer-events-auto select-none">
      {/* Continuous Zoom Slider Popup */}
      {showSlider && (
        <div className="mb-2 px-4 py-2 rounded-2xl bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 shadow-2xl flex flex-col items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between w-64 text-[11px] text-neutral-400 font-mono">
            <span>0.5× UW</span>
            <span className="text-amber-400 font-bold text-xs">
              {currentZoom.toFixed(1)}×
              {isOptical5x && ' • 5× Optical'}
              {isUltrawide && ' • Ultra Wide'}
              {isSuperRes && ' • Super Res'}
            </span>
            <span>30.0×</span>
          </div>

          <div className="relative w-64 flex items-center">
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={currentZoom > 5 ? 0.2 : 0.1}
              value={currentZoom}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
            />
            {/* Quick tick marks for 0.5, 1, 2, 5, 10 */}
            <div className="absolute -bottom-3.5 left-0 right-0 flex justify-between pointer-events-none px-1 text-[9px] text-neutral-500 font-mono">
              <span>.5</span>
              <span className="ml-1">1</span>
              <span className="ml-2">2</span>
              <span className="ml-6">5</span>
              <span>10</span>
              <span>30</span>
            </div>
          </div>
          <div className="h-2" />
        </div>
      )}

      {/* Iconic Google Pixel Lens Pills Container */}
      <div className="h-10 px-1.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-neutral-800/80 shadow-lg flex items-center gap-1">
        {PRESET_LENSES.map(lens => {
          const isSelected = Math.abs(currentZoom - lens.value) < 0.15;
          return (
            <button
              key={lens.value}
              onClick={() => handlePillClick(lens.value)}
              onDoubleClick={() => setShowSlider(!showSlider)}
              className={`relative h-8 min-w-[34px] px-2 rounded-full flex items-center justify-center font-sans font-medium text-xs transition-all duration-200 ${
                isSelected
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow-md scale-105'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'
              }`}
              title={lens.name}
            >
              {lens.label}
              {isSelected && lens.value === 5 && (
                <span className="absolute -top-1 right-0 w-1.5 h-1.5 bg-sky-400 rounded-full" title="Optical Periscope" />
              )}
            </button>
          );
        })}

        {/* If custom zoom not exactly one of the pills, show current readout */}
        {!PRESET_LENSES.some(l => Math.abs(currentZoom - l.value) < 0.15) && (
          <button
            onClick={() => setShowSlider(!showSlider)}
            className="h-8 px-2 rounded-full bg-amber-400/90 text-neutral-950 font-bold text-xs flex items-center justify-center"
          >
            {currentZoom.toFixed(1)}×
          </button>
        )}
      </div>
    </div>
  );
};
