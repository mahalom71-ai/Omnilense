import React from 'react';
import { 
  SwitchCamera, 
  Sparkles, 
  SlidersHorizontal, 
  Image as ImageIcon,
  Square,
  Circle
} from 'lucide-react';
import { CameraMode, CapturedMedia } from '../types/camera';

interface BottomControlsProps {
  mode: CameraMode;
  onShutterPress: () => void;
  isCapturing: boolean;
  isVideoRecording: boolean;
  videoDuration: number;
  recentMedia: CapturedMedia | null;
  onOpenGallery: () => void;
  onFlipCamera: () => void;
  onToggleProDrawer: () => void;
  isProDrawerOpen: boolean;
  onToggleFilters: () => void;
  isFiltersOpen: boolean;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  mode,
  onShutterPress,
  isCapturing,
  isVideoRecording,
  videoDuration,
  recentMedia,
  onOpenGallery,
  onFlipCamera,
  onToggleProDrawer,
  isProDrawerOpen,
  onToggleFilters,
  isFiltersOpen,
}) => {
  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative z-30 w-full pb-6 pt-2 px-6 flex items-center justify-between bg-gradient-to-t from-black via-black/90 to-transparent">
      {/* LEFT: Recent photo gallery thumbnail */}
      <div className="w-16 flex items-center justify-start">
        <button
          onClick={onOpenGallery}
          className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/40 hover:border-white shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center bg-neutral-900"
          title="Open Gallery"
          aria-label="Gallery"
        >
          {recentMedia ? (
            <img
              src={recentMedia.dataUrl}
              alt="Recent capture"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon size={20} className="text-neutral-400" />
          )}

          {recentMedia && (
            <div className="absolute inset-0 bg-black/10 hover:bg-transparent" />
          )}
        </button>
      </div>

      {/* CENTER: Google Pixel Iconic Shutter Button */}
      <div className="flex flex-col items-center justify-center">
        {/* Video recording timer pill */}
        {isVideoRecording && (
          <div className="absolute -top-7 px-3 py-1 rounded-full bg-red-600/90 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>{formatTime(videoDuration)}</span>
          </div>
        )}

        <button
          onClick={onShutterPress}
          disabled={isCapturing}
          className="relative w-20 h-20 rounded-full flex items-center justify-center active:scale-90 transition-transform duration-150 focus:outline-none"
          title={
            mode === 'video'
              ? isVideoRecording ? 'Stop Recording' : 'Start Recording'
              : 'Take Photo'
          }
          aria-label="Shutter"
        >
          {/* Outer Ring */}
          <div className={`absolute inset-0 rounded-full border-4 transition-colors ${
            mode === 'video' 
              ? 'border-red-500/80' 
              : mode === 'night' 
              ? 'border-amber-400' 
              : 'border-white/80'
          }`} />

          {/* Inner Shutter Core */}
          {mode === 'video' ? (
            <div
              className={`transition-all duration-200 ${
                isVideoRecording
                  ? 'w-7 h-7 rounded-md bg-red-600 shadow-[0_0_12px_#dc2626]'
                  : 'w-14 h-14 rounded-full bg-red-600 shadow-md'
              }`}
            />
          ) : mode === 'night' && isCapturing ? (
            <div className="relative w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div
              className={`w-15 h-15 rounded-full shadow-lg transition-all ${
                isCapturing ? 'scale-90 bg-neutral-300' : 'bg-white hover:bg-neutral-100'
              }`}
            />
          )}
        </button>
      </div>

      {/* RIGHT: Quick controls (Flip Camera or Pro/Filter trigger) */}
      <div className="w-16 flex items-center justify-end gap-2">
        {mode === 'pro' ? (
          <button
            onClick={onToggleProDrawer}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isProDrawerOpen
                ? 'bg-amber-400 text-black shadow-lg font-bold'
                : 'bg-neutral-900 border border-neutral-700 text-neutral-200 hover:bg-neutral-800'
            }`}
            title="Toggle Pro Manual Sliders"
          >
            <SlidersHorizontal size={20} />
          </button>
        ) : (
          <button
            onClick={onFlipCamera}
            className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-200 hover:bg-neutral-800 hover:text-white flex items-center justify-center shadow-lg transition-transform active:rotate-180 duration-300"
            title="Switch Camera (Front / Back)"
            aria-label="Switch camera"
          >
            <SwitchCamera size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
