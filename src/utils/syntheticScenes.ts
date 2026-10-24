import { VirtualScene } from '../types/camera';

export const VIRTUAL_SCENES: VirtualScene[] = [
  {
    id: 'metropolis',
    name: 'Metropolis Skyline & Telephoto Test',
    description: 'Golden hour skyscrapers with antennas, clock towers & distant cars to test 5x optical & 10x zoom',
    tags: ['Architecture', 'High Detail', 'Telephoto'],
  },
  {
    id: 'portrait_studio',
    name: 'Portrait Model & Bokeh',
    description: 'Studio portrait with natural skin tones to test Portrait mode f/1.4 blur & Real Tone',
    tags: ['Portrait', 'Bokeh', 'Skin Tone'],
  },
  {
    id: 'cyberpunk_night',
    name: 'Cyberpunk Neon & Night Sight',
    description: 'Rainy neon alleys and deep shadows to test Night Sight HDR & low-light exposure',
    tags: ['Low Light', 'Neon', 'Night Sight'],
  },
  {
    id: 'mountain_range',
    name: 'Alpine Panoramic Vista',
    description: 'Majestic snowy peaks and pine forests ideal for Wide 0.5x and Panorama mode sweeping',
    tags: ['Wide Angle', 'Landscape', 'Panorama'],
  },
  {
    id: 'drone_aerial',
    name: 'Coastal Cliffs & Ocean (Drone Aerial)',
    description: 'High-altitude drone flight over turquoise ocean, white surf, yacht, and mountain highway',
    tags: ['Drone', 'Aerial', '4K QuickShot'],
  },
  {
    id: 'macro_botanical',
    name: 'Exotic Orchid & Dew Drops',
    description: 'Microscopic petal textures and water refraction to test Macro Focus & Pro manual peaking',
    tags: ['Macro', 'Pro Focus', 'Detail'],
  },
];

/**
 * Procedural ultra-high-resolution canvas scene renderer
 * Generates continuous visual depth with micro elements so zoom up to 30x shows crisp details!
 */
export function drawVirtualScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sceneId: string,
  timeMs: number,
  zoom: number,
  panX: number,
  panY: number,
  focusDistance: number = 50,
  blurAmount: number = 0,
  droneAltitude: number = 75,
  dronePitch: number = -35,
  droneHeading: number = 45,
  droneQuickShotProgress: number = 0,
  droneQuickShotType: string = 'manual'
) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Apply optical transform based on Zoom & subtle Pan/Gyroscopic movement
  const cx = width / 2;
  const cy = height / 2;

  ctx.translate(cx, cy);
  ctx.scale(zoom, zoom);
  ctx.translate(-cx + panX / zoom, -cy + panY / zoom);

  // Apply defocus blur if manual focus is off or portrait mode blur
  if (blurAmount > 0) {
    ctx.filter = `blur(${blurAmount}px)`;
  }

  switch (sceneId) {
    case 'drone_aerial':
      drawDroneAerial(
        ctx,
        width,
        height,
        timeMs,
        zoom,
        droneAltitude,
        dronePitch,
        droneHeading,
        droneQuickShotProgress,
        droneQuickShotType
      );
      break;
    case 'cyberpunk_night':
      drawCyberpunkNight(ctx, width, height, timeMs, zoom);
      break;
    case 'portrait_studio':
      drawPortraitStudio(ctx, width, height, timeMs, zoom);
      break;
    case 'mountain_range':
      drawMountainRange(ctx, width, height, timeMs, zoom);
      break;
    case 'macro_botanical':
      drawMacroBotanical(ctx, width, height, timeMs, zoom);
      break;
    case 'metropolis':
    default:
      drawMetropolis(ctx, width, height, timeMs, zoom);
      break;
  }

  ctx.restore();
}

function drawMetropolis(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  zoom: number
) {
  // Sky Gradient (Golden hour twilight)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  skyGrad.addColorStop(0, '#101728');
  skyGrad.addColorStop(0.35, '#3b244d');
  skyGrad.addColorStop(0.65, '#a44243');
  skyGrad.addColorStop(0.9, '#f68c51');
  skyGrad.addColorStop(1, '#ffc77d');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(-w * 2, -h * 2, w * 5, h * 5);

  // Golden Sun
  const sunX = w * 0.65;
  const sunY = h * 0.42;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 180);
  sunGlow.addColorStop(0, 'rgba(255, 245, 210, 1)');
  sunGlow.addColorStop(0.3, 'rgba(255, 180, 80, 0.7)');
  sunGlow.addColorStop(1, 'rgba(255, 120, 50, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 180, 0, Math.PI * 2);
  ctx.fill();

  // Distant Mountain Silhouettes
  ctx.fillStyle = '#2a1a33';
  ctx.beginPath();
  ctx.moveTo(-w, h * 0.55);
  for (let x = -w; x <= w * 2; x += 40) {
    const my = h * 0.53 + Math.sin(x * 0.005) * 45 + Math.cos(x * 0.012) * 20;
    ctx.lineTo(x, my);
  }
  ctx.lineTo(w * 2, h);
  ctx.lineTo(-w, h);
  ctx.closePath();
  ctx.fill();

  // Distant Skyline layer
  ctx.fillStyle = '#1b1b2f';
  const bCount = 28;
  for (let i = 0; i < bCount; i++) {
    const bx = -w * 0.5 + i * (w * 2 / bCount);
    const bw = (w * 2 / bCount) * 0.9;
    const bh = 140 + ((i * 37) % 180);
    ctx.fillRect(bx, h * 0.58 - bh, bw, bh + 300);
  }

  // Midground Skyscraper Cluster (Target for 5x and 10x Zoom!)
  const centerBx = w * 0.5 - 90;
  const centerBy = h * 0.15;
  const centerBw = 180;
  const centerBh = h * 0.85;

  // Iconic Spire Skyscraper (Tower 1)
  const towerGrad = ctx.createLinearGradient(centerBx, 0, centerBx + centerBw, 0);
  towerGrad.addColorStop(0, '#121624');
  towerGrad.addColorStop(0.5, '#232b42');
  towerGrad.addColorStop(1, '#3b4766');
  ctx.fillStyle = towerGrad;
  ctx.fillRect(centerBx, centerBy, centerBw, centerBh);

  // Spire needle on top
  ctx.fillStyle = '#7a8ba8';
  ctx.fillRect(centerBx + centerBw / 2 - 3, centerBy - 80, 6, 80);
  // Red warning beacon blinking
  const beaconAlpha = 0.5 + Math.sin(t * 0.006) * 0.5;
  ctx.fillStyle = `rgba(255, 40, 40, ${beaconAlpha})`;
  ctx.beginPath();
  ctx.arc(centerBx + centerBw / 2, centerBy - 80, 5, 0, Math.PI * 2);
  ctx.fill();

  // Glass Window Grid on Tower 1
  const cols = 8;
  const rows = 36;
  const winW = 12;
  const winH = 8;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = centerBx + 16 + c * (winW + 7);
      const wy = centerBy + 20 + r * (winH + 11);
      // Deterministic light patterns
      const isLit = ((r * 13 + c * 7) % 5 !== 0);
      const isWarm = (r + c) % 3 === 0;
      if (isLit) {
        ctx.fillStyle = isWarm ? '#ffe082' : '#80d8ff';
        ctx.fillRect(wx, wy, winW, winH);

        // If high zoom (5x or 10x), render tiny silhouettes inside windows!
        if (zoom > 3 && r === 12 && c === 3) {
          ctx.fillStyle = '#111';
          ctx.fillRect(wx + 4, wy + 2, 4, 6); // Person silhouette!
        }
      } else {
        ctx.fillStyle = '#151b29';
        ctx.fillRect(wx, wy, winW, winH);
      }
    }
  }

  // Large Telephoto Billboard on adjacent building (Pixel Camera Test Target!)
  const billX = centerBx + centerBw + 20;
  const billY = centerBy + 120;
  ctx.fillStyle = '#1e2436';
  ctx.fillRect(billX, billY - 30, 160, 280);

  // Billboard Frame
  ctx.fillStyle = '#ff5722';
  ctx.fillRect(billX + 10, billY + 20, 140, 90);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('PIXEL 9 PRO', billX + 22, billY + 50);
  ctx.font = '9px monospace';
  ctx.fillText('5X OPTICAL • 50MP', billX + 20, billY + 70);
  ctx.fillText('SUPER RES ZOOM 30X', billX + 16, billY + 86);

  // Left Building with Clock / Observation Deck
  const leftBx = centerBx - 170;
  const leftBy = centerBy + 70;
  ctx.fillStyle = '#1a2030';
  ctx.fillRect(leftBx, leftBy, 150, centerBh);

  // Clock face
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(leftBx + 75, leftBy + 60, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Clock hands (moving with time)
  const hourAngle = (t * 0.0001) % (Math.PI * 2);
  const minAngle = (t * 0.001) % (Math.PI * 2);
  ctx.beginPath();
  ctx.moveTo(leftBx + 75, leftBy + 60);
  ctx.lineTo(leftBx + 75 + Math.cos(hourAngle) * 16, leftBy + 60 + Math.sin(hourAngle) * 16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(leftBx + 75, leftBy + 60);
  ctx.lineTo(leftBx + 75 + Math.cos(minAngle) * 24, leftBy + 60 + Math.sin(minAngle) * 24);
  ctx.stroke();

  // Foreground Bridge & Highway with Moving Car Lights
  const roadY = h * 0.72;
  ctx.fillStyle = '#0f131a';
  ctx.fillRect(-w, roadY, w * 3, h * 0.35);

  // Suspension bridge cables
  ctx.strokeStyle = 'rgba(255, 200, 150, 0.4)';
  ctx.lineWidth = 2;
  for (let k = 0; k < 12; k++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.1, roadY - 140);
    ctx.lineTo(w * (0.1 + k * 0.07), roadY + 40);
    ctx.stroke();
  }

  // Moving car headlights & taillights
  for (let i = 0; i < 20; i++) {
    const speed = 0.15 + (i % 5) * 0.05;
    const xHead = ((-w + i * 90 + t * speed) % (w * 2)) - w * 0.3;
    const xTail = ((w * 1.5 - i * 110 - t * speed * 1.2) % (w * 2)) - w * 0.3;

    // Headlight (white/amber flare)
    ctx.fillStyle = '#fff4cc';
    ctx.fillRect(xHead, roadY + 30 + (i % 3) * 12, 14, 4);

    // Taillight (red streak)
    ctx.fillStyle = '#ff2a2a';
    ctx.fillRect(xTail, roadY + 75 + (i % 3) * 12, 16, 4);
  }

  // Birds in sky (high-detail test)
  for (let b = 0; b < 6; b++) {
    const bx = (w * 0.2 + b * 45 + Math.sin(t * 0.001 + b) * 30);
    const by = (h * 0.3 + b * 20 + Math.cos(t * 0.002 + b) * 15);
    ctx.strokeStyle = '#2d1d33';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(bx - 4, by, 6, Math.PI, 0);
    ctx.arc(bx + 4, by, 6, Math.PI, 0);
    ctx.stroke();
  }
}

function drawPortraitStudio(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  zoom: number
) {
  // Studio backdrop with subtle warm lighting
  const bgGrad = ctx.createRadialGradient(w * 0.6, h * 0.3, 50, w / 2, h / 2, w * 0.9);
  bgGrad.addColorStop(0, '#594a42');
  bgGrad.addColorStop(0.5, '#2e2522');
  bgGrad.addColorStop(1, '#171210');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(-w, -h, w * 3, h * 3);

  // Soft studio light bokeh particles in background
  for (let i = 0; i < 15; i++) {
    const bx = (w * 0.2 + (i * 73) % (w * 0.8));
    const by = (h * 0.15 + (i * 91) % (h * 0.7));
    const br = 25 + (i % 4) * 20;
    const bokehGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    bokehGrad.addColorStop(0, 'rgba(255, 215, 170, 0.12)');
    bokehGrad.addColorStop(0.8, 'rgba(255, 180, 120, 0.04)');
    bokehGrad.addColorStop(1, 'rgba(255, 150, 90, 0)');
    ctx.fillStyle = bokehGrad;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  const cx = w * 0.5;
  const cy = h * 0.45;

  // Shoulders & Clothing (Dark knitted jacket)
  ctx.fillStyle = '#22272e';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 280, 190, 130, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.fillStyle = '#d49b77';
  ctx.fillRect(cx - 36, cy + 90, 72, 90);

  // Face Oval
  ctx.fillStyle = '#e8ad88';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 30, 95, 125, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face Highlight (Key light from left)
  const faceLight = ctx.createRadialGradient(cx - 30, cy + 10, 10, cx, cy + 30, 90);
  faceLight.addColorStop(0, 'rgba(255, 235, 215, 0.35)');
  faceLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = faceLight;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 30, 95, 125, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stylized Hair
  ctx.fillStyle = '#1b120c';
  ctx.beginPath();
  ctx.arc(cx, cy - 20, 110, Math.PI * 0.85, Math.PI * 2.15);
  ctx.bezierCurveTo(cx + 120, cy + 80, cx + 90, cy + 160, cx + 70, cy + 180);
  ctx.bezierCurveTo(cx, cy + 120, cx - 70, cy + 180, cx - 110, cy + 90);
  ctx.closePath();
  ctx.fill();

  // Eyes (Catchlight in iris for real portrait photography inspection)
  const eyeY = cy + 15;
  [-36, 36].forEach(offset => {
    const ex = cx + offset;
    // Sclera
    ctx.fillStyle = '#f8f8f8';
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, 16, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris (Hazel brown with depth)
    ctx.fillStyle = '#5c3a21';
    ctx.beginPath();
    ctx.arc(ex, eyeY, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(ex, eyeY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight (Softbox reflection)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex - 2, eyeY - 2, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Eyelashes & Brow
    ctx.strokeStyle = '#2b1b11';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(ex, eyeY - 4, 17, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Eyebrows
    ctx.strokeStyle = '#322014';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(ex, eyeY - 18, 22, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  });

  // Nose contour
  ctx.strokeStyle = 'rgba(160, 95, 60, 0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 15);
  ctx.lineTo(cx + 3, cy + 50);
  ctx.lineTo(cx - 8, cy + 56);
  ctx.stroke();

  // Lips
  ctx.fillStyle = '#c46962';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 85, 24, 9, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCyberpunkNight(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  zoom: number
) {
  // Deep midnight ambient
  ctx.fillStyle = '#06080e';
  ctx.fillRect(-w, -h, w * 3, h * 3);

  // Wet reflective street with neon spill
  const streetGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
  streetGrad.addColorStop(0, '#0a0e17');
  streetGrad.addColorStop(0.5, '#131924');
  streetGrad.addColorStop(1, '#1b2333');
  ctx.fillStyle = streetGrad;
  ctx.fillRect(-w, h * 0.6, w * 3, h * 0.5);

  // Background Dark Alleyway Buildings
  ctx.fillStyle = '#0e121a';
  ctx.fillRect(w * 0.15, h * 0.1, w * 0.7, h * 0.6);

  // Massive Animated Neon Sign "PIXEL NIGHT SIGHT"
  const neonPulse = 0.8 + Math.sin(t * 0.005) * 0.2;
  const neonX = w * 0.5;
  const neonY = h * 0.28;

  // Glow
  ctx.save();
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 25 * neonPulse;
  ctx.fillStyle = '#e0ffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NIGHT SIGHT', neonX, neonY);
  ctx.restore();

  // Secondary Magenta Neon Bar
  ctx.save();
  ctx.shadowColor = '#ff007f';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ff77bb';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('f/1.68 • 50MP OCTA PD • OIS', neonX, neonY + 36);
  ctx.restore();

  // Chinese / Japanese Neon Kanji Signs on sides (Classic Cyberpunk)
  const kanji = ['夜', '視', '光', '影', '電', '腦'];
  kanji.forEach((char, idx) => {
    ctx.save();
    ctx.shadowColor = idx % 2 === 0 ? '#ffea00' : '#00ff66';
    ctx.shadowBlur = 15;
    ctx.fillStyle = idx % 2 === 0 ? '#fff59d' : '#b9f6ca';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(char, w * 0.22, h * 0.2 + idx * 38);
    ctx.restore();
  });

  // Wet asphalt reflections of the neon signs
  const reflY = h * 0.7;
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#00f0ff';
  ctx.fillRect(w * 0.35, reflY, w * 0.3, 60);
  ctx.fillStyle = '#ff007f';
  ctx.fillRect(w * 0.4, reflY + 40, w * 0.2, 50);
  ctx.restore();

  // Rain particle streaks
  ctx.strokeStyle = 'rgba(180, 220, 255, 0.25)';
  ctx.lineWidth = 1;
  for (let r = 0; r < 40; r++) {
    const rx = (r * 37 + (t * 0.8)) % w;
    const ry = (r * 53 + (t * 1.4)) % h;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 4, ry + 22);
    ctx.stroke();
  }
}

function drawMountainRange(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  zoom: number
) {
  // Crisp Alpine Sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  skyGrad.addColorStop(0, '#1976d2');
  skyGrad.addColorStop(0.6, '#90caf9');
  skyGrad.addColorStop(1, '#e3f2fd');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(-w, -h, w * 3, h * 3);

  // Distant Snow-capped Mountain Peaks
  ctx.fillStyle = '#546e7a';
  ctx.beginPath();
  ctx.moveTo(-w, h * 0.55);
  ctx.lineTo(w * 0.1, h * 0.25);
  ctx.lineTo(w * 0.3, h * 0.38);
  ctx.lineTo(w * 0.5, h * 0.18);
  ctx.lineTo(w * 0.75, h * 0.35);
  ctx.lineTo(w * 1.1, h * 0.22);
  ctx.lineTo(w * 2, h * 0.55);
  ctx.lineTo(w * 2, h);
  ctx.lineTo(-w, h);
  ctx.closePath();
  ctx.fill();

  // Snow caps on peaks
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.18);
  ctx.lineTo(w * 0.44, h * 0.28);
  ctx.lineTo(w * 0.48, h * 0.26);
  ctx.lineTo(w * 0.52, h * 0.29);
  ctx.lineTo(w * 0.56, h * 0.27);
  ctx.closePath();
  ctx.fill();

  // Pine forest foreground
  ctx.fillStyle = '#1b3b22';
  for (let i = 0; i < 40; i++) {
    const tx = -w * 0.2 + i * (w * 1.4 / 35);
    const ty = h * 0.52 + ((i * 17) % 35);
    const th = 60 + ((i * 23) % 40);
    ctx.beginPath();
    ctx.moveTo(tx, ty - th);
    ctx.lineTo(tx + 18, ty);
    ctx.lineTo(tx - 18, ty);
    ctx.closePath();
    ctx.fill();
  }

  // Alpine Lake in foreground with water reflections
  const lakeGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
  lakeGrad.addColorStop(0, '#26a69a');
  lakeGrad.addColorStop(1, '#00695c');
  ctx.fillStyle = lakeGrad;
  ctx.fillRect(-w, h * 0.65, w * 3, h * 0.4);
}

function drawMacroBotanical(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  zoom: number
) {
  // Lush forest bokeh background
  const bg = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.8);
  bg.addColorStop(0, '#2e7d32');
  bg.addColorStop(0.7, '#1b5e20');
  bg.addColorStop(1, '#0d2810');
  ctx.fillStyle = bg;
  ctx.fillRect(-w, -h, w * 3, h * 3);

  // Large Orchid Petal in Center
  const cx = w * 0.5;
  const cy = h * 0.5;

  ctx.save();
  ctx.translate(cx, cy);

  // Draw 5 Flower Petals radiating
  for (let p = 0; p < 5; p++) {
    ctx.save();
    ctx.rotate((p * Math.PI * 2) / 5);

    const petalGrad = ctx.createRadialGradient(0, 0, 10, 0, 120, 140);
    petalGrad.addColorStop(0, '#f8bbd0');
    petalGrad.addColorStop(0.6, '#e91e63');
    petalGrad.addColorStop(1, '#880e4f');
    ctx.fillStyle = petalGrad;

    ctx.beginPath();
    ctx.ellipse(0, 110, 55, 110, 0, 0, Math.PI * 2);
    ctx.fill();

    // Microscopic Veins on Petal (Test focus peaking!)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let v = -3; v <= 3; v++) {
      ctx.beginPath();
      ctx.moveTo(0, 30);
      ctx.quadraticCurveTo(v * 20, 100, v * 35, 190);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Center Pistil / Stamen with golden pollen grains
  ctx.fillStyle = '#ffeb3b';
  ctx.beginPath();
  ctx.arc(0, 0, 35, 0, Math.PI * 2);
  ctx.fill();

  // Individual Pollen beads
  for (let b = 0; b < 24; b++) {
    const angle = b * 1.3;
    const dist = 12 + (b % 4) * 5;
    ctx.fillStyle = '#f57f17';
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dew Drops with glass refraction
  const drops = [
    { x: 35, y: -65, r: 14 },
    { x: -50, y: 70, r: 18 },
    { x: 75, y: 40, r: 10 },
  ];

  drops.forEach(drop => {
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.arc(drop.x + 3, drop.y + 4, drop.r, 0, Math.PI * 2);
    ctx.fill();

    // Liquid body
    const dropGrad = ctx.createRadialGradient(drop.x - 3, drop.y - 3, 2, drop.x, drop.y, drop.r);
    dropGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    dropGrad.addColorStop(0.4, 'rgba(230, 245, 255, 0.4)');
    dropGrad.addColorStop(1, 'rgba(100, 150, 180, 0.7)');
    ctx.fillStyle = dropGrad;
    ctx.beginPath();
    ctx.arc(drop.x, drop.y, drop.r, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(drop.x - drop.r * 0.35, drop.y - drop.r * 0.35, drop.r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function drawDroneAerial(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  zoom: number,
  altitude: number,
  pitch: number, // -90 (down) to -10 (horizon)
  heading: number,
  quickProg: number,
  quickType: string
) {
  // Altitude factor: scale terrain according to altitude (50m = 1.0, 200m = 0.5)
  const altScale = Math.max(0.35, 120 / Math.max(25, altitude));
  const isNadir = pitch <= -80;
  const horizonY = isNadir ? -h : h * (0.35 + (pitch + 20) * 0.008);

  ctx.save();

  // If FPV or quickshot orbit, apply heading & roll
  let roll = 0;
  if (quickType === 'fpv') {
    roll = Math.sin(t * 0.002) * 8;
  } else if (quickType === 'orbit') {
    roll = 3.5;
  }
  ctx.translate(w / 2, h / 2);
  ctx.rotate((roll * Math.PI) / 180);
  ctx.scale(altScale, altScale);
  ctx.translate(-w / 2, -h / 2);

  // 1. SKY (if horizon is visible)
  if (!isNadir && horizonY > 0) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#0d47a1');
    skyGrad.addColorStop(0.7, '#64b5f6');
    skyGrad.addColorStop(1, '#e1f5fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(-w, -h, w * 3, horizonY + h);

    // Distant horizon haze
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(-w, horizonY - 12, w * 3, 24);

    // Distant mountain islands on horizon
    ctx.fillStyle = '#455a64';
    ctx.beginPath();
    ctx.moveTo(-w, horizonY);
    ctx.lineTo(w * 0.2, horizonY - 25);
    ctx.lineTo(w * 0.5, horizonY - 15);
    ctx.lineTo(w * 0.8, horizonY - 35);
    ctx.lineTo(w * 1.5, horizonY);
    ctx.closePath();
    ctx.fill();
  }

  // 2. OCEAN & CORAL REEF (Deep cobalt to crystal turquoise)
  const seaStartY = Math.max(0, horizonY);
  const oceanGrad = ctx.createLinearGradient(0, seaStartY, w, h);
  oceanGrad.addColorStop(0, '#012a4a');
  oceanGrad.addColorStop(0.3, '#01497c');
  oceanGrad.addColorStop(0.65, '#2a6f97');
  oceanGrad.addColorStop(0.85, '#2ec4b6');
  oceanGrad.addColorStop(1, '#00f5d4');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(-w, seaStartY, w * 3, h * 2);

  // Turquoise shallow sandbar & coral formations under water
  ctx.fillStyle = 'rgba(78, 222, 204, 0.45)';
  for (let c = 0; c < 5; c++) {
    const cx = w * (0.35 + c * 0.12);
    const cy = h * (0.55 + (c % 2) * 0.15);
    ctx.beginPath();
    ctx.ellipse(cx, cy, 140, 75, (c * 0.4), 0, Math.PI * 2);
    ctx.fill();
  }

  // Animated ocean swells (gentle white highlights)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 2;
  for (let s = 0; s < 12; s++) {
    const sy = seaStartY + 40 + s * 45 + Math.sin(t * 0.002 + s) * 8;
    ctx.beginPath();
    ctx.moveTo(-w * 0.2, sy);
    ctx.bezierCurveTo(w * 0.3, sy + 15, w * 0.7, sy - 15, w * 1.4, sy + 5);
    ctx.stroke();
  }

  // 3. RUGGED COASTAL CLIFFS (Terra cotta & emerald scrub)
  ctx.fillStyle = '#c97a54'; // warm rock base
  ctx.beginPath();
  ctx.moveTo(w * 0.2, h);
  ctx.bezierCurveTo(w * 0.15, h * 0.75, w * 0.4, h * 0.6, w * 0.5, h * 0.45);
  ctx.bezierCurveTo(w * 0.6, h * 0.35, w * 0.85, h * 0.4, w * 1.1, h * 0.25);
  ctx.lineTo(w * 2, h * 0.2);
  ctx.lineTo(w * 2, h * 1.5);
  ctx.lineTo(w * 0.2, h * 1.5);
  ctx.closePath();
  ctx.fill();

  // Emerald green coastal vegetation on cliff top
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath();
  ctx.moveTo(w * 0.3, h);
  ctx.bezierCurveTo(w * 0.25, h * 0.78, w * 0.48, h * 0.62, w * 0.58, h * 0.47);
  ctx.bezierCurveTo(w * 0.68, h * 0.37, w * 0.9, h * 0.42, w * 1.15, h * 0.26);
  ctx.lineTo(w * 2, h * 0.25);
  ctx.lineTo(w * 2, h * 1.5);
  ctx.lineTo(w * 0.3, h * 1.5);
  ctx.closePath();
  ctx.fill();

  // Breaking White Foam Waves on shoreline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, h);
  ctx.bezierCurveTo(w * 0.15, h * 0.75, w * 0.4, h * 0.6, w * 0.5, h * 0.45);
  ctx.bezierCurveTo(w * 0.6, h * 0.35, w * 0.85, h * 0.4, w * 1.1, h * 0.25);
  ctx.stroke();

  // Secondary surf wash line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 12;
  ctx.stroke();

  // 4. SERPENTINE COASTAL HIGHWAY
  ctx.strokeStyle = '#2b2d42';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(w * 0.4, h);
  ctx.bezierCurveTo(w * 0.35, h * 0.8, w * 0.55, h * 0.7, w * 0.68, h * 0.55);
  ctx.bezierCurveTo(w * 0.75, h * 0.45, w * 0.95, h * 0.48, w * 1.2, h * 0.35);
  ctx.stroke();

  // Highway yellow divider line
  ctx.strokeStyle = '#fca311';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Moving cars on coastal highway
  for (let car = 0; car < 4; car++) {
    const carProg = ((t * 0.0004 + car * 0.28) % 1);
    // Interpolate roughly along highway curve
    const carX = w * (0.4 + carProg * 0.75);
    const carY = h * (1.0 - carProg * 0.65);
    ctx.fillStyle = car % 2 === 0 ? '#e63946' : '#f1faee';
    ctx.fillRect(carX - 4, carY - 2, 8, 5);
  }

  // 5. ICONIC RED/WHITE LIGHTHOUSE on the cliff point
  const lhX = w * 0.52;
  const lhY = h * 0.44;
  // Lighthouse base & tower
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(lhX - 5, lhY - 32, 10, 32);
  ctx.fillStyle = '#d90429';
  ctx.fillRect(lhX - 5, lhY - 24, 10, 8);
  ctx.fillRect(lhX - 5, lhY - 8, 10, 8);
  // Lantern room & beacon
  ctx.fillStyle = '#111827';
  ctx.fillRect(lhX - 6, lhY - 38, 12, 6);
  ctx.fillStyle = '#ffb703';
  ctx.beginPath();
  ctx.arc(lhX, lhY - 35, 4, 0, Math.PI * 2);
  ctx.fill();

  // 6. SCENIC CLIFFTOP GAZEBO / OVERLOOK (ACTIVETRACK SUBJECT!)
  const gazX = w * 0.68;
  const gazY = h * 0.56;

  // Circular white pavilion
  ctx.fillStyle = '#f8f9fa';
  ctx.beginPath();
  ctx.arc(gazX, gazY, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ced4da';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Red umbrella & tiny visitors in gazebo
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.arc(gazX - 3, gazY - 3, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(gazX + 5, gazY + 4, 3, 0, Math.PI * 2);
  ctx.fill();

  // 7. LUXURY YACHT CRUISING IN OCEAN with V-SHAPED FOAMING WAKE
  const yachtX = w * 0.32 + Math.sin(t * 0.0003) * 30;
  const yachtY = h * 0.72;

  // Foaming wake trail behind yacht
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.moveTo(yachtX - 18, yachtY);
  ctx.lineTo(yachtX - 110, yachtY - 24);
  ctx.lineTo(yachtX - 95, yachtY);
  ctx.lineTo(yachtX - 110, yachtY + 24);
  ctx.closePath();
  ctx.fill();

  // Yacht Hull (White catamaran)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(yachtX + 22, yachtY);
  ctx.lineTo(yachtX - 16, yachtY - 9);
  ctx.lineTo(yachtX - 22, yachtY);
  ctx.lineTo(yachtX - 16, yachtY + 9);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Yacht teak deck & windshield
  ctx.fillStyle = '#bc6c25';
  ctx.fillRect(yachtX - 8, yachtY - 5, 14, 10);
  ctx.fillStyle = '#0077b6';
  ctx.fillRect(yachtX + 4, yachtY - 4, 6, 8);

  // 8. DRIFTING CLOUD SHADOWS
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  for (let cd = 0; cd < 3; cd++) {
    const cdx = ((t * 0.015 + cd * 320) % (w * 2)) - w * 0.5;
    const cdy = h * (0.3 + cd * 0.25);
    ctx.beginPath();
    ctx.ellipse(cdx, cdy, 120, 70, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
