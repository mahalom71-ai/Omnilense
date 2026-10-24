import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Trash2, 
  Info, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Calendar, 
  Sliders,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { CapturedMedia } from '../types/camera';
import { cameraAudio } from '../utils/audio';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaList: CapturedMedia[];
  onDeleteMedia: (id: string) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  mediaList,
  onDeleteMedia,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExif, setShowExif] = useState(true);

  if (!isOpen) return null;

  if (mediaList.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-neutral-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-neutral-800 text-white flex items-center justify-center hover:bg-neutral-700"
        >
          <X size={20} />
        </button>
        <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 text-neutral-500">
          <Camera size={32} />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">No Photos Yet</h3>
        <p className="text-xs text-neutral-400 text-center max-w-xs">
          Take a photo, 5× optical zoom capture, panorama, or video to see them in your Pixel Gallery.
        </p>
      </div>
    );
  }

  const activeMedia = mediaList[Math.min(currentIndex, mediaList.length - 1)];

  const handlePrev = () => {
    cameraAudio.playZoomTick();
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : mediaList.length - 1));
  };

  const handleNext = () => {
    cameraAudio.playZoomTick();
    setCurrentIndex(prev => (prev < mediaList.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    cameraAudio.playLevelSnap();
    const a = document.createElement('a');
    a.href = activeMedia.dataUrl;
    const dateStr = new Date(activeMedia.timestamp).toISOString().replace(/[-:T]/g, '').slice(0, 14);
    a.download = `PXL_${dateStr}_${activeMedia.mode.toUpperCase()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = () => {
    if (confirm('Delete this photo from camera gallery?')) {
      onDeleteMedia(activeMedia.id);
      if (currentIndex >= mediaList.length - 1) {
        setCurrentIndex(Math.max(0, mediaList.length - 2));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* Top action header */}
      <div className="w-full pt-4 pb-3 px-4 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent z-10">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-neutral-900/80 text-white flex items-center justify-center hover:bg-neutral-800"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-xs font-bold tracking-wider text-white">
            {currentIndex + 1} / {mediaList.length}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">
            {new Date(activeMedia.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExif(!showExif)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              showExif ? 'bg-amber-400 text-black font-bold' : 'bg-neutral-900/80 text-white hover:bg-neutral-800'
            }`}
            title="Toggle EXIF Details"
          >
            <Info size={18} />
          </button>

          <button
            onClick={handleDownload}
            className="w-10 h-10 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 flex items-center justify-center"
            title="Download Full Resolution"
          >
            <Download size={18} />
          </button>

          <button
            onClick={handleDelete}
            className="w-10 h-10 rounded-full bg-neutral-900/80 text-red-400 hover:bg-red-950 flex items-center justify-center"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Main photo viewer with navigation arrows */}
      <div className="relative flex-1 w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        {activeMedia.type === 'video' ? (
          <video
            src={activeMedia.dataUrl}
            controls
            autoPlay
            className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
          />
        ) : (
          <img
            src={activeMedia.dataUrl}
            alt="Pixel capture"
            className="max-h-full max-w-full object-contain rounded-xl shadow-2xl select-none"
          />
        )}

        {/* Previous button */}
        {mediaList.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Next button */}
        {mediaList.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* EXIF Metadata Card Overlay */}
      {showExif && (
        <div className="w-full bg-neutral-950/95 border-t border-neutral-800 px-5 py-4 pb-6 z-10 flex flex-col gap-2 max-w-2xl mx-auto rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera size={16} className="text-amber-400" />
              <span className="text-xs font-bold text-neutral-100">{activeMedia.exif.camera}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold uppercase">
                {activeMedia.mode}
              </span>
            </div>

            <span className="text-xs text-neutral-400 font-mono">
              {activeMedia.exif.resolution} • {activeMedia.exif.fileSize}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-neutral-800/80 text-center text-xs">
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block">Lens</span>
              <span className="font-bold text-neutral-100">{activeMedia.exif.focalLength}</span>
              <span className="text-[9px] text-amber-400 font-mono block">{activeMedia.zoomFactor}×</span>
            </div>

            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block">Aperture</span>
              <span className="font-bold text-neutral-100">{activeMedia.exif.aperture}</span>
            </div>

            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block">Shutter</span>
              <span className="font-bold text-neutral-100 font-mono">{activeMedia.exif.shutterSpeed}</span>
            </div>

            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block">ISO</span>
              <span className="font-bold text-neutral-100 font-mono">{activeMedia.exif.iso}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              Filter: <strong className="text-neutral-200">{activeMedia.filterName}</strong>
            </span>
            <span>Ratio: {activeMedia.aspectRatio}</span>
          </div>
        </div>
      )}
    </div>
  );
};
