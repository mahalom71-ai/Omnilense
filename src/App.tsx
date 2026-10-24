/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CameraMode, 
  AspectRatio, 
  FlashMode, 
  TimerMode, 
  GridType, 
  FilterPreset, 
  ProSettings, 
  CapturedMedia,
  DroneTelemetry,
  DroneQuickShot
} from './types/camera';
import { FILTER_PRESETS, applyFilterToCanvas } from './utils/filterLuts';
import { VIRTUAL_SCENES } from './utils/syntheticScenes';
import { cameraAudio } from './utils/audio';

import { TopBar } from './components/TopBar';
import { Viewfinder } from './components/Viewfinder';
import { LensSelector } from './components/LensSelector';
import { ModeCarousel } from './components/ModeCarousel';
import { BottomControls } from './components/BottomControls';
import { ProControlsDrawer } from './components/ProControlsDrawer';
import { FilterPresetSelector } from './components/FilterPresetSelector';
import { PanoramaCapture } from './components/PanoramaCapture';
import { DroneFlightHUD } from './components/DroneFlightHUD';
import { GalleryModal } from './components/GalleryModal';
import { SettingsModal } from './components/SettingsModal';
import { PhoneFrame } from './components/PhoneFrame';

export default function App() {
  // Main camera state
  const [mode, setMode] = useState<CameraMode>('photo');
  const [zoom, setZoom] = useState<number>(1.0);
  const [flash, setFlash] = useState<FlashMode>('off');
  const [timer, setTimer] = useState<TimerMode>(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:3');
  const [grid, setGrid] = useState<GridType>('3x3');
  const [macroActive, setMacroActive] = useState(false);

  // Filter Preset state
  const [activeFilter, setActiveFilter] = useState<FilterPreset>(FILTER_PRESETS[0]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Pro Controls state
  const [proSettings, setProSettings] = useState<ProSettings>({
    iso: 'auto',
    shutterSpeed: 'auto',
    shutterSeconds: 0.02,
    ev: 0.0,
    whiteBalance: 'auto',
    focusMode: 'auto',
    manualFocusDistance: 50,
    focusPeaking: false,
    rawEnabled: false,
    showHistogram: false,
  });
  const [isProDrawerOpen, setIsProDrawerOpen] = useState(false);

  // Hardware vs Simulated Feed state
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [activeSceneId, setActiveSceneId] = useState<string>('metropolis');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  // Captured media & Gallery
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Settings & Presentation frame
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);
  const [highRes50MP, setHighRes50MP] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live Shutter & Capture feedback state
  const [isCapturing, setIsCapturing] = useState(false);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);
  const [timerCountdown, setTimerCountdown] = useState<number | null>(null);

  // Drone Flight Telemetry & QuickShots state
  const [droneTelemetry, setDroneTelemetry] = useState<DroneTelemetry>({
    altitude: 85.0,
    distance: 195,
    horizontalSpeed: 18.5,
    verticalSpeed: 1.2,
    batteryPercent: 88,
    flightTimeRemaining: '24 min',
    gpsSats: 22,
    gimbalPitch: -35,
    heading: 50,
    flightMode: 'NORMAL',
    activeTrackLocked: true,
  });
  const [activeQuickShot, setActiveQuickShot] = useState<DroneQuickShot>('dronie');
  const [quickShotProgress, setQuickShotProgress] = useState(0);
  const [isExecutingQuickShot, setIsExecutingQuickShot] = useState(false);
  const quickShotIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Video recording state
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // DOM Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize camera audio preference
  useEffect(() => {
    cameraAudio.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // Clean up quickshot on unmount
  useEffect(() => {
    return () => {
      if (quickShotIntervalRef.current) clearInterval(quickShotIntervalRef.current);
    };
  }, []);

  // Request physical camera if not simulated
  const startCameraStream = useCallback(async (facing: 'user' | 'environment') => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setIsSimulated(true);
      return;
    }

    try {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: mode === 'video',
      });

      setVideoStream(stream);
      setIsSimulated(false);
    } catch {
      // Permission denied or unavailable; gracefully use virtual scenes
      setIsSimulated(true);
    }
  }, [mode, videoStream]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [videoStream]);

  // Flip Camera between Front / Rear
  const handleFlipCamera = () => {
    cameraAudio.playZoomTick();
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (!isSimulated) {
      startCameraStream(nextFacing);
    }
  };

  // Switch between physical camera and simulated test scenes
  const handleToggleSource = () => {
    cameraAudio.playZoomTick();
    if (isSimulated) {
      startCameraStream(facingMode);
    } else {
      if (videoStream) {
        videoStream.getTracks().forEach(t => t.stop());
        setVideoStream(null);
      }
      setIsSimulated(true);
    }
  };

  // Cycle TopBar toggles
  const handleCycleFlash = () => {
    cameraAudio.playZoomTick();
    const cycle: FlashMode[] = ['off', 'auto', 'on', 'torch'];
    const idx = cycle.indexOf(flash);
    setFlash(cycle[(idx + 1) % cycle.length]);
  };

  const handleCycleTimer = () => {
    cameraAudio.playZoomTick();
    const cycle: TimerMode[] = [0, 3, 10];
    const idx = cycle.indexOf(timer);
    setTimer(cycle[(idx + 1) % cycle.length]);
  };

  const handleCycleAspectRatio = () => {
    cameraAudio.playZoomTick();
    const cycle: AspectRatio[] = ['4:3', '16:9', '1:1', 'full'];
    const idx = cycle.indexOf(aspectRatio);
    setAspectRatio(cycle[(idx + 1) % cycle.length]);
  };

  // Lens zoom update
  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    if (newZoom <= 0.6 && !macroActive) {
      // auto hint macro for ultrawide
    }
  };

  // Generate metadata EXIF for capture
  const createExif = (lensLabel: string, zoomFactor: number) => {
    if (mode === 'drone') {
      return {
        camera: 'Pixel Drone 4K Pro Aerial',
        lensModel: `Hasselblad Aerial FOV 84° • 3-Axis Gimbal (${droneTelemetry.altitude.toFixed(0)}m)`,
        focalLength: '12mm Drone Wide (Aerial)',
        aperture: 'f/2.8 Aerial',
        iso: typeof proSettings.iso === 'number' ? proSettings.iso : 100,
        shutterSpeed: proSettings.shutterSpeed === 'auto' ? '1/1000s' : proSettings.shutterSpeed,
        exposureBias: `${proSettings.ev > 0 ? '+' : ''}${proSettings.ev.toFixed(1)} EV`,
        resolution: highRes50MP ? '8160 × 6120 (50 MP Drone)' : '4080 × 3060 (12.5 MP)',
        fileSize: highRes50MP ? '9.6 MB' : '3.8 MB',
      };
    }

    let focalLength = '24mm (Main Wide)';
    let aperture = 'f/1.68';
    if (zoomFactor <= 0.6) {
      focalLength = '14mm (Ultra Wide 126°)';
      aperture = 'f/1.95';
    } else if (zoomFactor >= 4.8 && zoomFactor <= 5.2) {
      focalLength = '120mm (5× Optical Telephoto)';
      aperture = 'f/2.8';
    } else if (zoomFactor > 5.2) {
      focalLength = `${Math.round(24 * zoomFactor)}mm (Super Res Zoom)`;
      aperture = 'f/2.8';
    }

    const isoVal = proSettings.iso === 'auto' ? 100 + Math.floor(Math.random() * 200) : proSettings.iso;
    const shutter = proSettings.shutterSpeed === 'auto' ? '1/250s' : proSettings.shutterSpeed;

    return {
      camera: 'Google Pixel 9 Pro',
      lensModel: `Pixel Octa PD Quad Bayer (${focalLength})`,
      focalLength,
      aperture,
      iso: typeof isoVal === 'number' ? isoVal : 125,
      shutterSpeed: shutter,
      exposureBias: `${proSettings.ev > 0 ? '+' : ''}${proSettings.ev.toFixed(1)} EV`,
      resolution: highRes50MP ? '8160 × 6120 (50 MP)' : '4080 × 3060 (12.5 MP)',
      fileSize: highRes50MP ? `${(8.4 + Math.random() * 2.5).toFixed(1)} MB` : '3.2 MB',
    };
  };

  // Drone QuickShot automated flight execution
  const handleStartQuickShot = (type: DroneQuickShot) => {
    setActiveQuickShot(type);
    setIsExecutingQuickShot(true);
    setQuickShotProgress(0);
    cameraAudio.playQuickShotChime();

    const startAlt = droneTelemetry.altitude;
    const startDist = droneTelemetry.distance;
    const startHeading = droneTelemetry.heading;
    const startPitch = droneTelemetry.gimbalPitch;

    let step = 0;
    const totalSteps = 60; // 6 seconds

    if (quickShotIntervalRef.current) clearInterval(quickShotIntervalRef.current);

    quickShotIntervalRef.current = setInterval(() => {
      step += 1;
      const prog = Math.min(100, (step / totalSteps) * 100);
      setQuickShotProgress(prog);

      // Maneuver kinematics
      if (type === 'dronie') {
        setDroneTelemetry(prev => ({
          ...prev,
          altitude: startAlt + (prog / 100) * 120,
          distance: startDist + (prog / 100) * 160,
          horizontalSpeed: 24.5,
          verticalSpeed: 3.2,
        }));
      } else if (type === 'rocket') {
        setDroneTelemetry(prev => ({
          ...prev,
          altitude: startAlt + (prog / 100) * 180,
          gimbalPitch: Math.max(-90, startPitch - (prog / 100) * 55),
          horizontalSpeed: 2.1,
          verticalSpeed: 4.8,
        }));
      } else if (type === 'orbit') {
        setDroneTelemetry(prev => ({
          ...prev,
          heading: (startHeading + (prog / 100) * 360) % 360,
          horizontalSpeed: 18.0,
          verticalSpeed: 0.2,
        }));
      } else if (type === 'helix') {
        setDroneTelemetry(prev => ({
          ...prev,
          heading: (startHeading + (prog / 100) * 360) % 360,
          altitude: startAlt + (prog / 100) * 80,
          distance: startDist + (prog / 100) * 70,
          horizontalSpeed: 20.4,
          verticalSpeed: 2.1,
        }));
      } else if (type === 'fpv') {
        setDroneTelemetry(prev => ({
          ...prev,
          horizontalSpeed: 48.0,
          verticalSpeed: 0.5,
          distance: startDist + (prog / 100) * 220,
        }));
      }

      if (prog >= 100) {
        if (quickShotIntervalRef.current) clearInterval(quickShotIntervalRef.current);
        setIsExecutingQuickShot(false);
        cameraAudio.playLevelSnap();
        // Automatically capture high-res aerial snapshot at peak!
        captureSnapshot();
      }
    }, 100);
  };

  const handleCancelQuickShot = () => {
    if (quickShotIntervalRef.current) clearInterval(quickShotIntervalRef.current);
    setIsExecutingQuickShot(false);
    setQuickShotProgress(0);
    setDroneTelemetry(prev => ({ ...prev, horizontalSpeed: 0, verticalSpeed: 0 }));
  };

  const handleModeChange = (newMode: CameraMode) => {
    if (newMode === 'drone') {
      cameraAudio.playDroneTakeoff();
      setActiveSceneId('drone_aerial');
    }
    setMode(newMode);
  };

  // Execute snapshot from active canvas or video element
  const captureSnapshot = () => {
    const source = isSimulated ? canvasRef.current : videoRef.current;
    if (!source) return;

    // Flash animation and shutter sound
    setIsShutterFlashing(true);
    cameraAudio.playShutter();
    setTimeout(() => setIsShutterFlashing(false), 350);

    const sw = source instanceof HTMLVideoElement ? source.videoWidth || 1920 : source.width;
    const sh = source instanceof HTMLVideoElement ? source.videoHeight || 1440 : source.height;

    // Target capture canvas
    const targetW = highRes50MP ? 2400 : 1600;
    let targetH = targetW * (4 / 3);
    if (aspectRatio === '16:9') targetH = targetW * (16 / 9);
    if (aspectRatio === '1:1') targetH = targetW;
    if (aspectRatio === 'full') targetH = targetW * 1.8;

    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = targetW;
    snapCanvas.height = Math.round(targetH);
    const snapCtx = snapCanvas.getContext('2d');

    if (snapCtx) {
      // Draw frame with aspect ratio cropping
      snapCtx.save();
      // If user front camera, mirror image
      if (!isSimulated && facingMode === 'user') {
        snapCtx.translate(snapCanvas.width, 0);
        snapCtx.scale(-1, 1);
      }

      snapCtx.drawImage(source, 0, 0, sw, sh, 0, 0, snapCanvas.width, snapCanvas.height);
      snapCtx.restore();

      // Apply baked preset & color grade directly to final photo
      const kelvin = typeof proSettings.whiteBalance === 'number' ? proSettings.whiteBalance : undefined;
      applyFilterToCanvas(snapCtx, snapCanvas.width, snapCanvas.height, activeFilter, proSettings.ev, kelvin);

      // Night Sight / Long Exposure extra stacking glow simulation
      if (mode === 'night' || mode === 'long_exposure') {
        snapCtx.save();
        snapCtx.globalCompositeOperation = 'screen';
        snapCtx.fillStyle = 'rgba(255, 230, 180, 0.15)';
        snapCtx.fillRect(0, 0, snapCanvas.width, snapCanvas.height);
        snapCtx.restore();
      }

      const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.94);
      const newMedia: CapturedMedia = {
        id: `pxl_${Date.now()}`,
        type: 'photo',
        dataUrl,
        timestamp: Date.now(),
        lens: zoom >= 4.9 ? '5× Optical Telephoto' : zoom <= 0.6 ? '0.5× Ultra Wide' : `${zoom.toFixed(1)}×`,
        zoomFactor: parseFloat(zoom.toFixed(1)),
        mode,
        aspectRatio,
        filterName: activeFilter.name,
        exif: createExif(zoom >= 4.9 ? '5× Optical' : `${zoom}×`, zoom),
      };

      setCapturedMedia(prev => [newMedia, ...prev]);
    }
  };

  // Video recording control
  const toggleVideoRecording = () => {
    if (isVideoRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsVideoRecording(false);
      cameraAudio.playVideoChime(false);
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    } else {
      // Start recording
      cameraAudio.playVideoChime(true);
      videoChunksRef.current = [];

      let streamToRecord: MediaStream | null = null;
      if (!isSimulated && videoStream) {
        streamToRecord = videoStream;
      } else if (canvasRef.current) {
        // Record synthetic canvas feed!
        streamToRecord = (canvasRef.current as any).captureStream(30);
      }

      if (streamToRecord) {
        try {
          const recorder = new MediaRecorder(streamToRecord, {
            mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
              ? 'video/webm;codecs=vp9'
              : 'video/webm',
          });

          recorder.ondataavailable = e => {
            if (e.data.size > 0) {
              videoChunksRef.current.push(e.data);
            }
          };

          recorder.onstop = () => {
            const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
            const videoUrl = URL.createObjectURL(blob);
            const newMedia: CapturedMedia = {
              id: `vid_${Date.now()}`,
              type: 'video',
              dataUrl: videoUrl,
              timestamp: Date.now(),
              lens: `${zoom.toFixed(1)}× Zoom`,
              zoomFactor: parseFloat(zoom.toFixed(1)),
              mode: 'video',
              aspectRatio,
              filterName: activeFilter.name,
              exif: createExif('Pixel 4K Video', zoom),
            };
            setCapturedMedia(prev => [newMedia, ...prev]);
          };

          recorder.start();
          mediaRecorderRef.current = recorder;
          setIsVideoRecording(true);
          setVideoDuration(0);
          videoTimerRef.current = setInterval(() => {
            setVideoDuration(prev => prev + 1);
          }, 1000);
        } catch {
          // Fallback if MediaRecorder fails
        }
      }
    }
  };

  // Master Shutter Action Handler (Timer countdown, Night Sight stacking, Video)
  const handleShutterPress = () => {
    if (isCapturing) return;

    if (mode === 'video') {
      toggleVideoRecording();
      return;
    }

    if (mode === 'panorama') {
      // Handled inside PanoramaCapture UI
      return;
    }

    const runCapture = () => {
      if (mode === 'night') {
        // Night Sight simulated multi-frame stacking (1.8s progress)
        setIsCapturing(true);
        cameraAudio.playTimerBeep(false);
        setTimeout(() => {
          captureSnapshot();
          setIsCapturing(false);
        }, 1800);
      } else if (mode === 'long_exposure') {
        setIsCapturing(true);
        setTimeout(() => {
          captureSnapshot();
          setIsCapturing(false);
        }, 1200);
      } else {
        captureSnapshot();
      }
    };

    if (timer > 0) {
      let count = timer;
      setTimerCountdown(count);
      cameraAudio.playTimerBeep(false);

      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setTimerCountdown(count);
          cameraAudio.playTimerBeep(false);
        } else {
          clearInterval(interval);
          setTimerCountdown(null);
          cameraAudio.playTimerBeep(true);
          runCapture();
        }
      }, 1000);
    } else {
      runCapture();
    }
  };

  // Panorama finished callback
  const handlePanoramaFinished = (dataUrl: string) => {
    const newMedia: CapturedMedia = {
      id: `pano_${Date.now()}`,
      type: 'panorama',
      dataUrl,
      timestamp: Date.now(),
      lens: 'Panorama 180° Sweep',
      zoomFactor: 1.0,
      mode: 'panorama',
      aspectRatio: '16:9',
      filterName: activeFilter.name,
      exif: {
        camera: 'Google Pixel 9 Pro',
        lensModel: '180° Computational Panorama',
        focalLength: '12mm Panoramic Stitch',
        aperture: 'f/1.68',
        iso: 100,
        shutterSpeed: '1/500s Auto-Stitch',
        exposureBias: '0.0 EV',
        resolution: '4800 × 1600 (Pan-Res)',
        fileSize: '5.8 MB',
      },
    };
    setCapturedMedia(prev => [newMedia, ...prev]);
  };

  const activeSceneObj = VIRTUAL_SCENES.find(s => s.id === activeSceneId);

  return (
    <PhoneFrame
      isFrameActive={isPhoneFrame}
      onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}
    >
      <div className="relative w-full h-full flex flex-col justify-between bg-black text-white overflow-hidden select-none">
        
        {/* TOP BAR */}
        <TopBar
          mode={mode}
          flash={flash}
          onCycleFlash={handleCycleFlash}
          timer={timer}
          onCycleTimer={handleCycleTimer}
          aspectRatio={aspectRatio}
          onCycleAspectRatio={handleCycleAspectRatio}
          rawEnabled={proSettings.rawEnabled}
          onToggleRaw={() => setProSettings(prev => ({ ...prev, rawEnabled: !prev.rawEnabled }))}
          macroActive={macroActive}
          onToggleMacro={() => setMacroActive(!macroActive)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenFilters={() => setIsFilterDrawerOpen(true)}
          activeFilterName={activeFilter.name}
          isSimulated={isSimulated}
          onToggleSource={handleToggleSource}
          activeSceneName={activeSceneObj?.name}
          isPhoneFrame={isPhoneFrame}
          onTogglePhoneFrame={() => setIsPhoneFrame(!isPhoneFrame)}
        />

        {/* MAIN VIEWFINDER (Live Camera / Canvas) */}
        <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
          <Viewfinder
            mode={mode}
            aspectRatio={aspectRatio}
            grid={grid}
            zoom={zoom}
            isSimulated={isSimulated}
            sceneId={activeSceneId}
            preset={activeFilter}
            proSettings={proSettings}
            isShutterFlashing={isShutterFlashing}
            timerCountdown={timerCountdown}
            videoStream={videoStream}
            facingMode={facingMode}
            canvasRef={canvasRef}
            videoRef={videoRef}
            droneAltitude={droneTelemetry.altitude}
            dronePitch={droneTelemetry.gimbalPitch}
            droneHeading={droneTelemetry.heading}
            droneQuickShotProgress={quickShotProgress}
            droneQuickShotType={activeQuickShot}
          />

          {/* Drone Aerial Flight HUD Overlay */}
          {mode === 'drone' && (
            <DroneFlightHUD
              telemetry={droneTelemetry}
              onUpdateTelemetry={upd => setDroneTelemetry(prev => ({ ...prev, ...upd }))}
              activeQuickShot={activeQuickShot}
              quickShotProgress={quickShotProgress}
              isExecutingQuickShot={isExecutingQuickShot}
              onStartQuickShot={handleStartQuickShot}
              onCancelQuickShot={handleCancelQuickShot}
            />
          )}

          {/* Panorama Sweep Interface Overlay */}
          <PanoramaCapture
            isActive={mode === 'panorama'}
            onFinishPanorama={handlePanoramaFinished}
            onCancel={() => setMode('photo')}
            getVideoOrCanvasElement={() => (isSimulated ? canvasRef.current : videoRef.current)}
          />

          {/* Iconic Pixel Lens Pills Floating right above Bottom Modes */}
          {mode !== 'panorama' && mode !== 'drone' && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center z-25 pointer-events-none">
              <LensSelector
                currentZoom={zoom}
                onZoomChange={handleZoomChange}
              />
            </div>
          )}
        </div>

        {/* BOTTOM AREA: Modes Carousel & Pixel Shutter Controls */}
        <div className="relative z-30 w-full flex flex-col bg-black">
          {/* Mode Carousel */}
          <ModeCarousel
            currentMode={mode}
            onModeChange={handleModeChange}
            disabled={isVideoRecording || isCapturing}
          />

          {/* Shutter Button & Flips */}
          <BottomControls
            mode={mode}
            onShutterPress={handleShutterPress}
            isCapturing={isCapturing}
            isVideoRecording={isVideoRecording}
            videoDuration={videoDuration}
            recentMedia={capturedMedia.length > 0 ? capturedMedia[0] : null}
            onOpenGallery={() => setIsGalleryOpen(true)}
            onFlipCamera={handleFlipCamera}
            onToggleProDrawer={() => setIsProDrawerOpen(!isProDrawerOpen)}
            isProDrawerOpen={isProDrawerOpen}
            onToggleFilters={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            isFiltersOpen={isFilterDrawerOpen}
          />
        </div>

        {/* PRO CONTROLS DRAWER */}
        <ProControlsDrawer
          isOpen={isProDrawerOpen && mode === 'pro'}
          settings={proSettings}
          onChange={updated => setProSettings(prev => ({ ...prev, ...updated }))}
          onReset={() =>
            setProSettings({
              iso: 'auto',
              shutterSpeed: 'auto',
              shutterSeconds: 0.02,
              ev: 0.0,
              whiteBalance: 'auto',
              focusMode: 'auto',
              manualFocusDistance: 50,
              focusPeaking: false,
              rawEnabled: false,
              showHistogram: false,
            })
          }
          onClose={() => setIsProDrawerOpen(false)}
        />

        {/* FILTER PRESETS SELECTOR */}
        <FilterPresetSelector
          isOpen={isFilterDrawerOpen}
          currentPresetId={activeFilter.id}
          onSelectPreset={p => setActiveFilter(p)}
          onClose={() => setIsFilterDrawerOpen(false)}
        />

        {/* GALLERY MODAL */}
        <GalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          mediaList={capturedMedia}
          onDeleteMedia={id => setCapturedMedia(prev => prev.filter(m => m.id !== id))}
        />

        {/* SETTINGS MODAL */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          grid={grid}
          onSelectGrid={setGrid}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          isSimulated={isSimulated}
          onToggleSimulated={sim => {
            if (sim) {
              if (videoStream) {
                videoStream.getTracks().forEach(t => t.stop());
                setVideoStream(null);
              }
              setIsSimulated(true);
            } else {
              startCameraStream(facingMode);
            }
          }}
          activeSceneId={activeSceneId}
          onSelectScene={setActiveSceneId}
          isPhoneFrame={isPhoneFrame}
          onTogglePhoneFrame={() => setIsPhoneFrame(!isPhoneFrame)}
          highRes50MP={highRes50MP}
          onToggleHighRes={() => setHighRes50MP(!highRes50MP)}
        />
      </div>
    </PhoneFrame>
  );
}
