import React, { useRef, useEffect } from 'react';
import { CameraMode } from '../types/camera';
import { cameraAudio } from '../utils/audio';

interface ModeCarouselProps {
  currentMode: CameraMode;
  onModeChange: (mode: CameraMode) => void;
  disabled?: boolean;
}

interface ModeItem {
  id: CameraMode;
  label: string;
}

const MODES: ModeItem[] = [
  { id: 'drone', label: 'DRONE SHOT' },
  { id: 'panorama', label: 'PANORAMA' },
  { id: 'night', label: 'NIGHT SIGHT' },
  { id: 'portrait', label: 'PORTRAIT' },
  { id: 'photo', label: 'CAMERA' },
  { id: 'video', label: 'VIDEO' },
  { id: 'pro', label: 'PRO' },
  { id: 'long_exposure', label: 'LONG EXPOSURE' },
];

export const ModeCarousel: React.FC<ModeCarouselProps> = ({
  currentMode,
  onModeChange,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Center the active mode button when changed
  useEffect(() => {
    if (activeBtnRef.current && containerRef.current) {
      const container = containerRef.current;
      const btn = activeBtnRef.current;
      const scrollTarget = btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2;
      container.scrollTo({
        left: scrollTarget,
        behavior: 'smooth',
      });
    }
  }, [currentMode]);

  const handleSelect = (mode: CameraMode) => {
    if (disabled || mode === currentMode) return;
    cameraAudio.playZoomTick();
    onModeChange(mode);
  };

  return (
    <div className="relative w-full py-2 z-20 overflow-hidden select-none">
      {/* Subtle fade edges for horizontal carousel */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/80 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/80 to-transparent pointer-events-none z-10" />

      <div
        ref={containerRef}
        className="flex items-center gap-3 overflow-x-auto no-scrollbar px-16 scroll-smooth snap-x snap-mandatory justify-start sm:justify-center"
      >
        {MODES.map(m => {
          const isActive = m.id === currentMode;
          return (
            <button
              key={m.id}
              ref={isActive ? activeBtnRef : null}
              onClick={() => handleSelect(m.id)}
              disabled={disabled}
              className={`snap-center flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 ${
                isActive
                  ? 'bg-neutral-800/90 text-amber-400 border border-amber-400/40 shadow-md font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
