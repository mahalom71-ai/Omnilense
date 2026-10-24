import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, X, Compass, AlertCircle } from 'lucide-react';
import { cameraAudio } from '../utils/audio';

interface PanoramaCaptureProps {
  isActive: boolean;
  onFinishPanorama: (dataUrl: string) => void;
  onCancel: () => void;
  getVideoOrCanvasElement: () => HTMLVideoElement | HTMLCanvasElement | null;
}

export const PanoramaCapture: React.FC<PanoramaCaptureProps> = ({
  isActive,
  onFinishPanorama,
  onCancel,
  getVideoOrCanvasElement,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [sweepOffset, setSweepOffset] = useState(0); // visual offset
  const [tiltAngle, setTiltAngle] = useState(0); // leveling

  const panoramaCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentStepRef = useRef(0);
  const totalSteps = 40;

  useEffect(() => {
    if (!isActive) {
      setIsRecording(false);
      setProgress(0);
      setSweepOffset(0);
    }
  }, [isActive]);

  const startPanorama = () => {
    cameraAudio.playShutter();
    setIsRecording(true);
    setProgress(0);
    currentStepRef.current = 0;

    // Create stitch canvas: wide aspect 3:1
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 1600;
    pCanvas.height = 540;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = '#111';
      pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    }
    panoramaCanvasRef.current = pCanvas;

    // Sweep simulation loop
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Increment progress
      currentStepRef.current += dt * 8; // takes ~5 seconds to sweep 180°
      const prog = Math.min(100, (currentStepRef.current / totalSteps) * 100);
      setProgress(prog);
      setSweepOffset(prog * 2.8);

      // Subtle tilt variation
      setTiltAngle(Math.sin(time * 0.003) * 1.2);

      // Capture slice from active video/canvas
      const source = getVideoOrCanvasElement();
      if (source && panoramaCanvasRef.current) {
        const ctx = panoramaCanvasRef.current.getContext('2d');
        if (ctx) {
          const sw = source instanceof HTMLVideoElement ? source.videoWidth || 640 : source.width;
          const sh = source instanceof HTMLVideoElement ? source.videoHeight || 480 : source.height;

          // Slice width
          const sliceW = 40;
          const targetX = (prog / 100) * (panoramaCanvasRef.current.width - sliceW);

          // Center crop from source
          const srcSliceW = sw * 0.15;
          const srcX = (sw - srcSliceW) / 2;

          ctx.drawImage(
            source,
            srcX, 0, srcSliceW, sh,
            targetX, 0, sliceW + 4, panoramaCanvasRef.current.height
          );
        }
      }

      if (prog < 100) {
        animationFrameRef.current = requestAnimationFrame(loop);
      } else {
        // Complete panorama
        finishPanorama();
      }
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  const finishPanorama = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRecording(false);
    cameraAudio.playLevelSnap();
    if (panoramaCanvasRef.current) {
      const dataUrl = panoramaCanvasRef.current.toDataURL('image/jpeg', 0.95);
      onFinishPanorama(dataUrl);
    }
  };

  const cancelSweep = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRecording(false);
    setProgress(0);
    onCancel();
  };

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-6">
      {/* Top Banner Guide */}
      <div className="flex flex-col items-center gap-1">
        <div className="px-4 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-2 shadow-xl">
          <Compass size={15} className="text-amber-400" />
          <span>
            {isRecording
              ? 'Pan steadily along the line →'
              : 'Hold phone vertically and tap shutter to start panorama'}
          </span>
        </div>

        {isRecording && (
          <div className="w-48 h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-amber-400 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Center Panoramic Track & Leveling Indicator */}
      <div className="relative w-full flex items-center justify-center">
        {/* Horizontal panoramic target guide */}
        <div className="relative w-72 sm:w-80 h-16 border-2 border-dashed border-amber-400/60 rounded-xl bg-black/20 backdrop-blur-xs flex items-center overflow-hidden">
          {/* Level line */}
          <div
            className="absolute left-0 right-0 h-0.5 bg-amber-400 transition-transform"
            style={{ transform: `rotate(${tiltAngle}deg)` }}
          />

          {/* Sweeping progress fill */}
          <div
            className="h-full bg-amber-400/20 border-r-2 border-amber-400 transition-all"
            style={{ width: `${progress}%` }}
          />

          {/* Center Target Box */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border-2 border-white rounded-lg flex items-center justify-center shadow-md">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>

          {/* Moving Guide Arrow */}
          <div
            className="absolute top-1/2 -translate-y-1/2 text-amber-400 transition-all"
            style={{ left: `calc(${progress}% + 10px)` }}
          >
            <ArrowRight size={22} className="animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom status and cancel button */}
      <div className="flex items-center justify-between pointer-events-auto">
        <button
          onClick={cancelSweep}
          className="h-9 px-3 rounded-full bg-black/70 backdrop-blur-md text-neutral-300 text-xs font-semibold flex items-center gap-1 hover:text-white"
        >
          <X size={15} />
          <span>Cancel</span>
        </button>

        {isRecording ? (
          <button
            onClick={finishPanorama}
            className="h-9 px-4 rounded-full bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg"
          >
            <Check size={16} />
            <span>Finish Early ({Math.round(progress)}%)</span>
          </button>
        ) : (
          <button
            onClick={startPanorama}
            className="h-9 px-4 rounded-full bg-amber-400 text-black text-xs font-bold shadow-lg"
          >
            Start Panorama
          </button>
        )}
      </div>
    </div>
  );
};
