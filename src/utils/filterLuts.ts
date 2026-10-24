import { FilterPreset } from '../types/camera';

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'natural',
    name: 'Real Tone',
    subtitle: 'Pixel authentic & true-to-life skin',
    category: 'pixel',
    cssFilter: 'contrast(1.02) saturate(1.05) brightness(1.01)',
    contrast: 1.02,
    brightness: 1.01,
    saturation: 1.05,
    sepia: 0,
    hueRotate: 0,
    temperature: 0,
    tint: 0,
    vignette: 0,
    grain: 0,
  },
  {
    id: 'vibrant',
    name: 'Pixel HDR+',
    subtitle: 'Punchy sky, rich foliage & contrast',
    category: 'pixel',
    cssFilter: 'contrast(1.15) saturate(1.35) brightness(1.03)',
    contrast: 1.15,
    brightness: 1.03,
    saturation: 1.35,
    sepia: 0,
    hueRotate: -2,
    temperature: 8,
    tint: 2,
    vignette: 0.1,
    grain: 0,
  },
  {
    id: 'warm_cinema',
    name: 'Warm Cinema',
    subtitle: 'Golden hour amber & film shadows',
    category: 'cinematic',
    cssFilter: 'contrast(1.1) saturate(1.18) sepia(0.18) brightness(0.98)',
    contrast: 1.1,
    brightness: 0.98,
    saturation: 1.18,
    sepia: 0.18,
    hueRotate: -6,
    temperature: 28,
    tint: -5,
    vignette: 0.25,
    grain: 0.08,
  },
  {
    id: 'teal_orange',
    name: 'Teal & Orange',
    subtitle: 'Blockbuster Hollywood color grade',
    category: 'cinematic',
    cssFilter: 'contrast(1.22) saturate(1.25) hue-rotate(-12deg) brightness(1.02)',
    contrast: 1.22,
    brightness: 1.02,
    saturation: 1.25,
    sepia: 0.05,
    hueRotate: -12,
    temperature: 15,
    tint: -12,
    vignette: 0.2,
    grain: 0.05,
  },
  {
    id: 'noir_pro',
    name: 'Pixel Noir',
    subtitle: 'Dramatic high-contrast monochrome',
    category: 'bw',
    cssFilter: 'grayscale(1) contrast(1.4) brightness(0.95)',
    contrast: 1.4,
    brightness: 0.95,
    saturation: 0,
    sepia: 0,
    hueRotate: 0,
    temperature: 0,
    tint: 0,
    vignette: 0.35,
    grain: 0.15,
  },
  {
    id: 'kodak_gold',
    name: 'Vintage 400',
    subtitle: 'Classic 35mm film grain & mellow highlights',
    category: 'film',
    cssFilter: 'contrast(1.08) saturate(1.12) sepia(0.24) brightness(1.02)',
    contrast: 1.08,
    brightness: 1.02,
    saturation: 1.12,
    sepia: 0.24,
    hueRotate: 4,
    temperature: 20,
    tint: 8,
    vignette: 0.28,
    grain: 0.2,
  },
  {
    id: 'cool_steel',
    name: 'Cyber Steel',
    subtitle: 'Modern blue tones & sharp contrast',
    category: 'cinematic',
    cssFilter: 'contrast(1.18) saturate(0.95) hue-rotate(18deg) brightness(1.0)',
    contrast: 1.18,
    brightness: 1.0,
    saturation: 0.95,
    sepia: 0,
    hueRotate: 18,
    temperature: -25,
    tint: 10,
    vignette: 0.15,
    grain: 0.06,
  },
  {
    id: 'sunset_glow',
    name: 'Sunset Magic',
    subtitle: 'Radiant twilight pinks & golden reds',
    category: 'cinematic',
    cssFilter: 'contrast(1.12) saturate(1.4) sepia(0.12) hue-rotate(-16deg)',
    contrast: 1.12,
    brightness: 1.04,
    saturation: 1.4,
    sepia: 0.12,
    hueRotate: -16,
    temperature: 35,
    tint: -15,
    vignette: 0.2,
    grain: 0.04,
  },
  {
    id: 'motion_light_trails',
    name: 'Light Trails',
    subtitle: 'Long exposure silky highway & neon ribbons',
    category: 'creative',
    cssFilter: 'contrast(1.28) saturate(1.45) brightness(1.08)',
    contrast: 1.28,
    brightness: 1.08,
    saturation: 1.45,
    sepia: 0.04,
    hueRotate: -4,
    temperature: 12,
    tint: -2,
    vignette: 0.28,
    grain: 0.02,
    motionBlur: {
      enabled: true,
      angle: 0, // horizontal car light trails
      distance: 95,
      decay: 0.94,
      trailPasses: 36,
      highlightThreshold: 140,
      bloomGlow: 0.85,
    },
  },
  {
    id: 'motion_speed_pan',
    name: 'Action Light Pan',
    subtitle: 'Diagonal 20° silky motion blur & light smear',
    category: 'creative',
    cssFilter: 'contrast(1.22) saturate(1.35) brightness(1.05)',
    contrast: 1.22,
    brightness: 1.05,
    saturation: 1.35,
    sepia: 0.08,
    hueRotate: -8,
    temperature: 18,
    tint: 4,
    vignette: 0.22,
    grain: 0.04,
    motionBlur: {
      enabled: true,
      angle: 20, // dynamic 20° panning angle
      distance: 75,
      decay: 0.92,
      trailPasses: 30,
      highlightThreshold: 135,
      bloomGlow: 0.8,
    },
  },
];

/**
 * Apply preset adjustments directly onto an HTML5 Canvas context
 */
export function applyFilterToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  preset: FilterPreset,
  ev: number = 0,
  customKelvin?: number
) {
  // 1. Exposure adjustment (EV)
  if (ev !== 0) {
    const factor = Math.pow(2, ev);
    // Draw semi-transparent white or black overlay for simulated exposure
    ctx.save();
    if (ev > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.65, (factor - 1) * 0.35)})`;
      ctx.globalCompositeOperation = 'screen';
    } else {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.75, (1 - factor) * 0.45)})`;
      ctx.globalCompositeOperation = 'multiply';
    }
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // 2. Color temperature tint overlay
  let effectiveTemp = preset.temperature;
  if (customKelvin !== undefined && customKelvin !== 5500) {
    // 5500K is neutral; <5500 is warm (amber), >5500 is cool (blue)
    effectiveTemp += (5500 - customKelvin) / 75;
  }

  if (effectiveTemp !== 0) {
    ctx.save();
    if (effectiveTemp > 0) {
      // Warm amber
      const alpha = Math.min(0.35, Math.abs(effectiveTemp) / 100 * 0.35);
      ctx.fillStyle = `rgba(255, 175, 75, ${alpha})`;
      ctx.globalCompositeOperation = 'color';
    } else {
      // Cool blue
      const alpha = Math.min(0.35, Math.abs(effectiveTemp) / 100 * 0.35);
      ctx.fillStyle = `rgba(80, 160, 255, ${alpha})`;
      ctx.globalCompositeOperation = 'color';
    }
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // 3. Vignette effect
  if (preset.vignette > 0) {
    ctx.save();
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.3,
      width / 2, height / 2, Math.hypot(width / 2, height / 2)
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, `rgba(0, 0, 0, ${preset.vignette * 0.4})`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${preset.vignette * 0.85})`);
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // 4. Subtle film grain
  if (preset.grain > 0) {
    ctx.save();
    const grainCanvas = document.createElement('canvas');
    grainCanvas.width = 128;
    grainCanvas.height = 128;
    const gCtx = grainCanvas.getContext('2d');
    if (gCtx) {
      const imgData = gCtx.createImageData(128, 128);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = (Math.random() * 255) | 0;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = (preset.grain * 45) | 0;
      }
      gCtx.putImageData(imgData, 0, 0);
      const pattern = ctx.createPattern(grainCanvas, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillRect(0, 0, width, height);
      }
    }
    ctx.restore();
  }

  // 5. Motion Blur Light Trails (Long exposure simulation for static photography)
  if (preset.motionBlur?.enabled) {
    applyMotionLightTrails(ctx, width, height, preset.motionBlur);
  }
}

/**
 * Simulates long-exposure directional motion blur with luminous light streaks
 * Extracts highlights (headlights, streetlamps, neon signs, water reflections)
 * and smears them directionally with additive screen blending, creating authentic silky light trails!
 */
export function applyMotionLightTrails(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: NonNullable<FilterPreset['motionBlur']>
) {
  if (!config.enabled) return;

  const offCanvas = document.createElement('canvas');
  offCanvas.width = width;
  offCanvas.height = height;
  const offCtx = offCanvas.getContext('2d');
  if (!offCtx) return;

  // Copy current canvas snapshot
  offCtx.drawImage(ctx.canvas, 0, 0);

  // Extract highlight layer
  let imgData: ImageData;
  try {
    imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const thresh = config.highlightThreshold;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (lum < thresh) {
        // Discard non-highlights to isolate light sources
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
      } else {
        // Intensify light sources for vibrant light ribbons
        const boost = Math.min(2.5, 1.0 + ((lum - thresh) / (255 - thresh)) * 1.5);
        data[i] = Math.min(255, r * boost);
        data[i + 1] = Math.min(255, g * boost);
        data[i + 2] = Math.min(255, b * boost);
        data[i + 3] = 255;
      }
    }

    offCtx.putImageData(imgData, 0, 0);
  } catch {
    // If canvas getImageData fails (e.g. tainted canvas), fallback to direct screen trails
  }

  // Directional smear with additive screen blending
  drawScreenTrails(ctx, offCanvas, config);
}

function drawScreenTrails(
  ctx: CanvasRenderingContext2D,
  trailSource: HTMLCanvasElement,
  config: NonNullable<FilterPreset['motionBlur']>
) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const rad = (config.angle * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  const passes = config.trailPasses;
  const maxDist = config.distance;

  // Multi-pass directional smear
  for (let p = 1; p <= passes; p++) {
    const frac = p / passes;
    const dist = frac * maxDist;
    const alpha = Math.pow(config.decay, p) * 0.45 * config.bloomGlow;

    ctx.globalAlpha = alpha;
    const dx = cosA * dist;
    const dy = sinA * dist;

    // Forward streak
    ctx.drawImage(trailSource, dx, dy);
    // Backward secondary streak (for continuous long exposure trail)
    ctx.drawImage(trailSource, -dx * 0.45, -dy * 0.45);
  }

  // Soft glow bloom pass
  ctx.globalAlpha = 0.35 * config.bloomGlow;
  ctx.filter = 'blur(6px)';
  ctx.drawImage(trailSource, 0, 0);

  ctx.restore();
}
