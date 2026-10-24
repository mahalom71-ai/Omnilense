import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sun, Sparkles, AlertCircle } from 'lucide-react';
import { 
  CameraMode, 
  AspectRatio, 
  GridType, 
  FilterPreset, 
  ProSettings 
} from '../types/camera';
import { drawVirtualScene } from '../utils/syntheticScenes';
import { cameraAudio } from '../utils/audio';

interface ViewfinderProps {
  mode: CameraMode;
  aspectRatio: AspectRatio;
  grid: GridType;
  zoom: number;
  isSimulated: boolean;
  sceneId: string;
  preset: FilterPreset;
  proSettings: ProSettings;
  isShutterFlashing: boolean;
  timerCountdown: number | null;
  videoStream: MediaStream | null;
  facingMode: 'user' | 'environment';
  onTapFocus?: (x: number, y: number) => void;
  // External ref access for snapshot capture
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  // Drone specific props
  droneAltitude?: number;
  dronePitch?: number;
  droneHeading?: number;
  droneQuickShotProgress?: number;
  droneQuickShotType?: string;
}

export const Viewfinder: React.FC<ViewfinderProps> = ({
  mode,
  aspectRatio,
  grid,
  zoom,
  isSimulated,
  sceneId,
  preset,
  proSettings,
  isShutterFlashing,
  timerCountdown,
  videoStream,
  facingMode,
  onTapFocus,
  canvasRef,
  videoRef,
  droneAltitude = 75,
  dronePitch = -35,
  droneHeading = 45,
  droneQuickShotProgress = 0,
  droneQuickShotType = 'manual',
}) => {
  // Focus point state
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const [exposureSlider, setExposureSlider] = useState<number>(0); // -1 to 1
  const [contrastSlider, setContrastSlider] = useState<number>(0);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Horizon leveler angle
  const [tiltAngle, setTiltAngle] = useState(0);
  const [isLevel, setIsLevel] = useState(false);
  const prevLevelRef = useRef(false);

  // Pan coordinates for gyro/drag in simulated scene
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Attach video stream
  useEffect(() => {
    if (videoRef.current && videoStream && !isSimulated) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play().catch(() => {});
    }
  }, [videoStream, isSimulated, videoRef]);

  // Synthetic scene render loop
  useEffect(() => {
    if (!isSimulated) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (time: number) => {
      // Calculate portrait blur if mode is portrait
      let blurPx = 0;
      if (mode === 'portrait') {
        blurPx = 1.2; // soft cinematic portrait depth
      }

      // If manual focus distance is low, defocus background
      if (proSettings.focusMode === 'manual') {
        const defocus = Math.abs(proSettings.manualFocusDistance - 50) * 0.05;
        blurPx += defocus;
      }

      // If mode is drone, auto use drone_aerial or active scene
      const activeScene = mode === 'drone' ? 'drone_aerial' : sceneId;

      drawVirtualScene(
        ctx,
        canvas.width,
        canvas.height,
        activeScene,
        time,
        zoom,
        pan.x,
        pan.y,
        proSettings.manualFocusDistance,
        blurPx,
        droneAltitude,
        dronePitch,
        droneHeading,
        droneQuickShotProgress,
        droneQuickShotType
      );

      // Subtle simulated camera gyro wobble
      setTiltAngle(Math.sin(time * 0.001) * 1.5 + Math.cos(time * 0.002) * 0.8);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    isSimulated, 
    sceneId, 
    zoom, 
    pan, 
    mode, 
    proSettings.focusMode, 
    proSettings.manualFocusDistance, 
    canvasRef,
    droneAltitude,
    dronePitch,
    droneHeading,
    droneQuickShotProgress,
    droneQuickShotType
  ]);

  // Detect level snap
  useEffect(() => {
    const levelNow = Math.abs(tiltAngle) < 0.6;
    setIsLevel(levelNow);
    if (levelNow && !prevLevelRef.current) {
      cameraAudio.playLevelSnap();
    }
    prevLevelRef.current = levelNow;
  }, [tiltAngle]);

  // Handle tap on viewfinder for focus ring & exposure adjustment
  const handleViewfinderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Ignore if clicking on slider controls
    if ((e.target as HTMLElement).closest('.exposure-slider-control')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setFocusPoint({ x, y });
    cameraAudio.playZoomTick();

    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }
    focusTimeoutRef.current = setTimeout(() => {
      setFocusPoint(null);
    }, 4500);

    onTapFocus?.(x, y);
  };

  // Drag to pan in simulated scene
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isSimulated) return;
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !isSimulated) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    setPan(prev => ({
      x: prev.x - dx / zoom,
      y: prev.y - dy / zoom,
    }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Aspect ratio styling container
  const getAspectClass = () => {
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square max-h-[75vh]';
      case '16:9':
        return 'aspect-[9/16] h-full';
      case 'full':
        return 'h-full w-full';
      case '4:3':
      default:
        return 'aspect-[3/4] max-h-[82vh]';
    }
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Aspect Ratio Viewport Frame */}
      <div
        onClick={handleViewfinderClick}
        className={`relative w-full max-w-full overflow-hidden transition-all duration-300 flex items-center justify-center ${getAspectClass()}`}
        style={{
          filter: preset.cssFilter,
        }}
      >
        {/* PHYSICAL CAMERA VIDEO ELEMENT */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-transform ${
            isSimulated ? 'hidden' : 'block'
          } ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          style={{
            transform: `scale(${zoom}) ${facingMode === 'user' ? 'scaleX(-1)' : ''}`,
            transformOrigin: 'center center',
          }}
        />

        {/* VIRTUAL SCENE SIMULATION CANVAS */}
        <canvas
          ref={canvasRef}
          width={1080}
          height={1440}
          className={`absolute inset-0 w-full h-full object-cover ${
            isSimulated ? 'block' : 'hidden'
          }`}
        />

        {/* PRO MODE FOCUS PEAKING GREEN HIGHLIGHT OVERLAY */}
        {proSettings.focusMode === 'manual' && proSettings.focusPeaking && (
          <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70 border-2 border-emerald-400/40">
            <div className="absolute top-3 left-3 bg-emerald-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow">
              FOCUS PEAKING ON
            </div>
          </div>
        )}

        {/* LIGHT TRAILS MOTION BLUR VIEWFINDER INDICATOR */}
        {preset.motionBlur?.enabled && (
          <div className="absolute top-3 right-3 pointer-events-none z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-400/70 shadow-lg text-amber-300 animate-in fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8] animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-wider">LIGHT TRAILS • {preset.motionBlur.distance}PX</span>
          </div>
        )}

        {/* COMPOSITION GRIDS */}
        {grid === '3x3' && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10">
            <div className="border-r border-b border-white/25" />
            <div className="border-r border-b border-white/25" />
            <div className="border-b border-white/25" />
            <div className="border-r border-b border-white/25" />
            <div className="border-r border-b border-white/25" />
            <div className="border-b border-white/25" />
            <div className="border-r border-white/25" />
            <div className="border-r border-white/25" />
            <div className="" />
          </div>
        )}

        {grid === 'golden' && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute inset-x-0 top-[38.2%] border-b border-white/25" />
            <div className="absolute inset-x-0 bottom-[38.2%] border-t border-white/25" />
            <div className="absolute inset-y-0 left-[38.2%] border-r border-white/25" />
            <div className="absolute inset-y-0 right-[38.2%] border-l border-white/25" />
          </div>
        )}

        {grid === 'square' && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="w-[85%] aspect-square border-2 border-dashed border-white/35 rounded-lg" />
          </div>
        )}

        {/* PIXEL HORIZON LEVEL INDICATOR */}
        {mode !== 'drone' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-15">
            <div
              className="relative w-44 flex items-center justify-center transition-all duration-75"
              style={{ transform: `rotate(${tiltAngle}deg)` }}
            >
              {/* Center tick */}
              <div
                className={`w-1 h-3 rounded-full transition-colors duration-200 ${
                  isLevel ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-white/80'
                }`}
              />
              {/* Left line */}
              <div
                className={`h-0.5 w-16 transition-colors duration-200 ${
                  isLevel ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-white/70'
                }`}
              />
              <div className="w-5" />
              {/* Right line */}
              <div
                className={`h-0.5 w-16 transition-colors duration-200 ${
                  isLevel ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-white/70'
                }`}
              />

              {/* Angle readout */}
              <span
                className={`absolute -bottom-4 text-[10px] font-mono font-bold transition-colors ${
                  isLevel ? 'text-amber-400' : 'text-white/60'
                }`}
              >
                {isLevel ? '0° LEVEL' : `${tiltAngle.toFixed(1)}°`}
              </span>
            </div>
          </div>
        )}

        {/* FOCUS RING WITH PIXEL DUAL EXPOSURE SLIDERS */}
        {focusPoint && (
          <div
            className="absolute z-20 pointer-events-auto"
            style={{
              left: `${focusPoint.x}px`,
              top: `${focusPoint.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Focus Ring circle with 4 corner ticks */}
            <div className="w-16 h-16 rounded-full border-2 border-amber-400 animate-focus-ring relative flex items-center justify-center shadow-lg">
              <div className="w-1 h-1 bg-amber-400 rounded-full" />
              {/* Corner brackets */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-0.5 bg-amber-400" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-0.5 bg-amber-400" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 h-2 w-0.5 bg-amber-400" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 h-2 w-0.5 bg-amber-400" />
            </div>

            {/* Pixel Exposure Sliders (Right side) */}
            <div className="exposure-slider-control absolute left-20 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-full border border-neutral-700 shadow-xl">
              <Sun size={13} className="text-amber-400" />
              <input
                type="range"
                min={-1}
                max={1}
                step={0.1}
                value={exposureSlider}
                onChange={e => setExposureSlider(parseFloat(e.target.value))}
                className="w-16 h-1 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        )}

        {/* TIMER COUNTDOWN LARGE OVERLAY */}
        {timerCountdown !== null && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-xs">
            <span className="text-8xl font-black text-amber-400 animate-ping font-mono drop-shadow-[0_4px_24px_rgba(251,191,36,0.6)]">
              {timerCountdown}
            </span>
          </div>
        )}

        {/* SHUTTER FLASH EFFECT */}
        {isShutterFlashing && (
          <div className="absolute inset-0 z-40 bg-white animate-flash pointer-events-none" />
        )}

        {/* LIVE HISTOGRAM (PRO MODE) */}
        {proSettings.showHistogram && (
          <div className="absolute bottom-3 left-3 z-20 pointer-events-none bg-black/65 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-neutral-700 flex flex-col gap-1">
            <span className="text-[9px] font-mono text-neutral-400">HISTOGRAM</span>
            <div className="w-24 h-10 flex items-end gap-0.5">
              {[12, 18, 30, 45, 60, 85, 70, 55, 40, 25, 15, 8].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-amber-400/80 rounded-t-xs"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
