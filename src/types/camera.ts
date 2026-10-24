export type CameraMode = 
  | 'photo' 
  | 'portrait' 
  | 'night' 
  | 'pro' 
  | 'panorama' 
  | 'drone' 
  | 'video' 
  | 'long_exposure';

export type DroneQuickShot = 'manual' | 'dronie' | 'rocket' | 'orbit' | 'helix' | 'fpv';

export interface DroneTelemetry {
  altitude: number; // in meters (e.g. 15m to 500m)
  distance: number; // in meters
  horizontalSpeed: number; // km/h
  verticalSpeed: number; // m/s
  batteryPercent: number;
  flightTimeRemaining: string; // e.g. "26 min"
  gpsSats: number;
  gimbalPitch: number; // degrees -90 (down) to +20 (horizon/up)
  heading: number; // 0-360 deg
  flightMode: 'CINE' | 'NORMAL' | 'SPORT';
  activeTrackLocked: boolean;
}


export type FlashMode = 'off' | 'auto' | 'on' | 'torch';
export type TimerMode = 0 | 3 | 10;
export type AspectRatio = '4:3' | '16:9' | '1:1' | 'full';
export type GridType = 'none' | '3x3' | 'golden' | 'square';

export interface ProSettings {
  iso: number | 'auto'; // 50 to 6400
  shutterSpeed: string | 'auto'; // '1/8000', '1/1000', ..., '1s', etc.
  shutterSeconds: number; // numeric seconds for capture simulation
  ev: number; // -3.0 to +3.0
  whiteBalance: 'auto' | 'daylight' | 'cloudy' | 'shade' | 'tungsten' | 'fluorescent' | number; // kelvin
  focusMode: 'auto' | 'manual';
  manualFocusDistance: number; // 0 (macro) to 100 (infinity)
  focusPeaking: boolean;
  rawEnabled: boolean;
  showHistogram: boolean;
}

export interface FilterPreset {
  id: string;
  name: string;
  subtitle: string;
  category: 'pixel' | 'cinematic' | 'film' | 'bw' | 'creative';
  cssFilter: string;
  contrast: number; // 0 to 2
  brightness: number; // 0 to 2
  saturation: number; // 0 to 2
  sepia: number;
  hueRotate: number; // deg
  temperature: number; // -100 to 100 (cool to warm)
  tint: number; // -100 to 100 (green to magenta)
  vignette: number; // 0 to 1
  grain: number; // 0 to 1
  motionBlur?: {
    enabled: boolean;
    angle: number; // degrees
    distance: number; // pixels streak length
    decay: number; // 0 to 1
    trailPasses: number; // number of blur samples
    highlightThreshold: number; // 0 to 255 luminance threshold for light sources
    bloomGlow: number; // 0 to 1
  };
}

export interface CapturedMedia {
  id: string;
  type: 'photo' | 'video' | 'panorama';
  dataUrl: string;
  timestamp: number;
  lens: string;
  zoomFactor: number;
  mode: CameraMode;
  aspectRatio: AspectRatio;
  filterName: string;
  exif: {
    camera: string;
    lensModel: string;
    focalLength: string;
    aperture: string;
    iso: number;
    shutterSpeed: string;
    exposureBias: string;
    resolution: string;
    fileSize: string;
  };
}

export interface VirtualScene {
  id: string;
  name: string;
  description: string;
  tags: string[];
}
