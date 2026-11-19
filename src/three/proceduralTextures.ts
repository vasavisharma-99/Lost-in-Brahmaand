import * as THREE from 'three';

function createSeededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  isColor: boolean,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = Math.min(maxAnisotropy, 8);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

export function createRadialGlowTexture(innerColor = 'rgba(255,255,255,1)', outerColor = 'rgba(255,255,255,0)'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.35, innerColor.replace(/[\d.]+\)$/, '0.55)'));
  grad.addColorStop(1, outerColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export interface PlanetTextureSet {
  map: THREE.CanvasTexture;
  bumpMap?: THREE.CanvasTexture;
  cloudMap?: THREE.CanvasTexture;
  ringMap?: THREE.CanvasTexture;
}

export function createPlanetTextures(id: string, maxAnisotropy: number): PlanetTextureSet {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 256;
  const bCtx = bumpCanvas.getContext('2d')!;

  if (id === 'mercury' || id === 'moon' || id === 'ceres') {
    const rand = createSeededRandom(id === 'mercury' ? 101 : id === 'moon' ? 202 : 303);
    const base = id === 'mercury' ? '#8c857d' : id === 'moon' ? '#b8bec8' : '#787e88';
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 512, 256);

    // Dark maria basins
    const mariaCount = id === 'moon' ? 16 : 9;
    for (let i = 0; i < mariaCount; i++) {
      const x = rand() * width;
      const y = (0.18 + rand() * 0.64) * height;
      const rx = 45 + rand() * 110;
      const ry = 28 + rand() * 70;
      const grad = ctx.createRadialGradient(x, y, rx * 0.1, x, y, rx);
      grad.addColorStop(0, id === 'moon' ? 'rgba(65,72,86,0.55)' : 'rgba(72,66,60,0.4)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Impact craters
    const craters = id === 'mercury' ? 220 : 170;
    for (let i = 0; i < craters; i++) {
      const x = rand() * width;
      const y = (0.08 + rand() * 0.84) * height;
      const r = 3 + Math.pow(rand(), 2.3) * 34;

      // Color crater floor & rim
      ctx.fillStyle = 'rgba(42, 42, 46, 0.35)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(235, 232, 224, 0.28)';
      ctx.lineWidth = Math.max(1, r * 0.14);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();

      // Bump crater
      const bx = (x / width) * 512;
      const by = (y / height) * 256;
      const br = (r / width) * 512;
      const bGrad = bCtx.createRadialGradient(bx, by, br * 0.2, bx, by, br * 1.15);
      bGrad.addColorStop(0, '#303030');
      bGrad.addColorStop(0.75, '#707070');
      bGrad.addColorStop(0.92, '#d8d8d8');
      bGrad.addColorStop(1, 'rgba(128,128,128,0)');
      bCtx.fillStyle = bGrad;
      bCtx.beginPath();
      bCtx.arc(bx, by, br * 1.15, 0, Math.PI * 2);
      bCtx.fill();
    }

    if (id === 'ceres') {
      // Occator Crater bright salt deposit
      const grad = ctx.createRadialGradient(width * 0.56, height * 0.45, 1, width * 0.56, height * 0.45, 16);
      grad.addColorStop(0, 'rgba(255,255,255,0.95)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(width * 0.56, height * 0.45, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    return {
      map: finalizeTexture(canvas, true, maxAnisotropy),
      bumpMap: finalizeTexture(bumpCanvas, false, maxAnisotropy),
    };
  }

  if (id === 'venus') {
    const rand = createSeededRandom(404);
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#d8b478');
    grad.addColorStop(0.25, '#e8ca8e');
    grad.addColorStop(0.5, '#d19852');
    grad.addColorStop(0.75, '#eccd92');
    grad.addColorStop(1, '#c99756');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 65; i++) {
      const y = rand() * height;
      const h = 8 + rand() * 32;
      ctx.fillStyle = rand() > 0.5 ? 'rgba(255, 232, 185, 0.16)' : 'rgba(158, 98, 38, 0.18)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= width; x += 64) {
        ctx.lineTo(x, y + Math.sin((x / width) * Math.PI * 4 + i) * 14);
      }
      ctx.lineTo(width, y + h);
      ctx.lineTo(0, y + h);
      ctx.closePath();
      ctx.fill();
    }
    return { map: finalizeTexture(canvas, true, maxAnisotropy) };
  }

  if (id === 'earth') {
    const rand = createSeededRandom(505);
    // Deep oceanic gradient
    const ocean = ctx.createLinearGradient(0, 0, 0, height);
    ocean.addColorStop(0, '#133a75');
    ocean.addColorStop(0.5, '#14539a');
    ocean.addColorStop(1, '#10346c');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, width, height);

    bCtx.fillStyle = '#404040';
    bCtx.fillRect(0, 0, 512, 256);

    // Continental landmasses
    const continentSeeds = [
      { cx: 230, cy: 185, rx: 95, ry: 72, color: '#2e6f40' }, // N America
      { cx: 300, cy: 315, rx: 58, ry: 85, color: '#387d44' }, // S America
      { cx: 525, cy: 170, rx: 68, ry: 50, color: '#457a42' }, // Europe
      { cx: 545, cy: 270, rx: 76, ry: 88, color: '#9c7c48' }, // Africa
      { cx: 700, cy: 175, rx: 145, ry: 85, color: '#4a7a47' }, // Asia
      { cx: 810, cy: 345, rx: 56, ry: 44, color: '#b57b45' }, // Australia
    ];

    continentSeeds.forEach((c) => {
      for (let k = 0; k < 22; k++) {
        const ox = (rand() - 0.5) * c.rx * 1.1;
        const oy = (rand() - 0.5) * c.ry * 1.1;
        const r = 18 + rand() * (c.rx * 0.45);
        ctx.fillStyle = k % 3 === 0 ? '#748c4c' : c.color;
        ctx.beginPath();
        ctx.ellipse(c.cx + ox, c.cy + oy, r, r * (0.65 + rand() * 0.5), rand() * Math.PI, 0, Math.PI * 2);
        ctx.fill();

        bCtx.fillStyle = '#b4b4b4';
        bCtx.beginPath();
        bCtx.arc(((c.cx + ox) / width) * 512, ((c.cy + oy) / height) * 256, (r / width) * 512, 0, Math.PI * 2);
        bCtx.fill();
      }
      // Coastal shelf turquoise halo
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(c.cx, c.cy, c.rx * 0.85, c.ry * 0.85, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Polar ice caps
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, width, 28);
    ctx.fillRect(0, height - 30, width, 30);

    // Cloud layer canvas
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 1024;
    cloudCanvas.height = 512;
    const cCtx = cloudCanvas.getContext('2d')!;
    cCtx.clearRect(0, 0, 1024, 512);
    for (let i = 0; i < 160; i++) {
      const x = rand() * 1024;
      const y = (0.08 + rand() * 0.84) * 512;
      const rx = 25 + rand() * 90;
      const ry = 8 + rand() * 24;
      const g = cCtx.createRadialGradient(x, y, 2, x, y, rx);
      g.addColorStop(0, 'rgba(255,255,255,0.68)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      cCtx.fillStyle = g;
      cCtx.beginPath();
      cCtx.ellipse(x, y, rx, ry, (rand() - 0.5) * 0.4, 0, Math.PI * 2);
      cCtx.fill();
    }

    return {
      map: finalizeTexture(canvas, true, maxAnisotropy),
      bumpMap: finalizeTexture(bumpCanvas, false, maxAnisotropy),
      cloudMap: finalizeTexture(cloudCanvas, true, maxAnisotropy),
    };
  }

  if (id === 'mars') {
    const rand = createSeededRandom(606);
    const base = ctx.createLinearGradient(0, 0, 0, height);
    base.addColorStop(0, '#b85c38');
    base.addColorStop(0.5, '#cc673d');
    base.addColorStop(1, '#9e4726');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 512, 256);

    // Dark basaltic regions (Syrtis Major, Acidalia)
    for (let i = 0; i < 28; i++) {
      const x = rand() * width;
      const y = (0.15 + rand() * 0.7) * height;
      const rx = 35 + rand() * 110;
      const ry = 22 + rand() * 60;
      const g = ctx.createRadialGradient(x, y, 4, x, y, rx);
      g.addColorStop(0, 'rgba(84, 34, 20, 0.55)');
      g.addColorStop(1, 'rgba(84, 34, 20, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Valles Marineris canyon scar
    ctx.strokeStyle = 'rgba(65, 22, 12, 0.72)';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(width * 0.36, height * 0.52);
    ctx.bezierCurveTo(width * 0.45, height * 0.56, width * 0.52, height * 0.49, width * 0.62, height * 0.53);
    ctx.stroke();

    bCtx.strokeStyle = '#202020';
    bCtx.lineWidth = 5;
    bCtx.beginPath();
    bCtx.moveTo(512 * 0.36, 256 * 0.52);
    bCtx.bezierCurveTo(512 * 0.45, 256 * 0.56, 512 * 0.52, 256 * 0.49, 512 * 0.62, 256 * 0.53);
    bCtx.stroke();

    // Craters + Polar ice caps
    for (let i = 0; i < 95; i++) {
      const x = rand() * width;
      const y = (0.12 + rand() * 0.76) * height;
      const r = 3 + rand() * 16;
      ctx.fillStyle = 'rgba(95, 38, 22, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, 20);
    ctx.fillRect(0, height - 18, width, 18);

    return {
      map: finalizeTexture(canvas, true, maxAnisotropy),
      bumpMap: finalizeTexture(bumpCanvas, false, maxAnisotropy),
    };
  }

  if (id === 'jupiter') {
    const rand = createSeededRandom(707);
    const bandColors = [
      '#c9b399', '#8c674a', '#e8d7be', '#b8764c', '#f2e5cf',
      '#a8623d', '#dfd0b8', '#c88c5d', '#ede2cf', '#8c5d3c', '#d9c4a6',
    ];
    let y = 0;
    let idx = 0;
    while (y < height) {
      const bandH = 22 + rand() * 34;
      ctx.fillStyle = bandColors[idx % bandColors.length];
      ctx.fillRect(0, y, width, bandH + 2);
      y += bandH;
      idx++;
    }

    // Turbulent festoons & swirling eddies
    for (let i = 0; i < 90; i++) {
      const ey = rand() * height;
      const ex = rand() * width;
      const ew = 40 + rand() * 140;
      const eh = 5 + rand() * 14;
      ctx.fillStyle = rand() > 0.5 ? 'rgba(255, 244, 228, 0.24)' : 'rgba(130, 68, 38, 0.24)';
      ctx.beginPath();
      ctx.ellipse(ex, ey, ew, eh, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Great Red Spot
    const grsX = width * 0.62;
    const grsY = height * 0.63;
    const grsGrad = ctx.createRadialGradient(grsX, grsY, 4, grsX, grsY, 54);
    grsGrad.addColorStop(0, '#c84b2c');
    grsGrad.addColorStop(0.55, '#d9643a');
    grsGrad.addColorStop(0.85, '#e8a274');
    grsGrad.addColorStop(1, 'rgba(232,162,116,0)');
    ctx.fillStyle = grsGrad;
    ctx.beginPath();
    ctx.ellipse(grsX, grsY, 56, 32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner swirl ring inside GRS
    ctx.strokeStyle = 'rgba(255, 220, 190, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(grsX, grsY, 34, 18, 0, 0, Math.PI * 1.6);
    ctx.stroke();

    return { map: finalizeTexture(canvas, true, maxAnisotropy) };
  }

  if (id === 'saturn') {
    const rand = createSeededRandom(808);
    const satColors = [
      '#c8b384', '#dfc99b', '#efe0ba', '#cbb079', '#f5e8c8',
      '#d5ba86', '#e6d0a2', '#bfa26d', '#e8d5ab',
    ];
    let y = 0;
    let idx = 0;
    while (y < height) {
      const bandH = 26 + rand() * 38;
      ctx.fillStyle = satColors[idx % satColors.length];
      ctx.fillRect(0, y, width, bandH + 2);
      y += bandH;
      idx++;
    }

    // Soft atmospheric gradient wash
    const wash = ctx.createLinearGradient(0, 0, 0, height);
    wash.addColorStop(0, 'rgba(110, 115, 130, 0.35)');
    wash.addColorStop(0.15, 'rgba(255, 255, 255, 0)');
    wash.addColorStop(0.85, 'rgba(255, 255, 255, 0)');
    wash.addColorStop(1, 'rgba(110, 115, 130, 0.35)');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);

    // Radial ring texture (1D radial along X, drawn 1024x32)
    const ringCanvas = document.createElement('canvas');
    ringCanvas.width = 1024;
    ringCanvas.height = 32;
    const rCtx = ringCanvas.getContext('2d')!;
    const stops: Array<[number, string]> = [
      [0.0, 'rgba(160,145,120,0.0)'],
      [0.1, 'rgba(170,152,126,0.22)'],
      [0.24, 'rgba(218,196,158,0.68)'],
      [0.42, 'rgba(244,225,186,0.92)'],
      [0.56, 'rgba(235,213,172,0.85)'],
      // Cassini Division!
      [0.60, 'rgba(30,26,22,0.08)'],
      [0.65, 'rgba(30,26,22,0.08)'],
      [0.68, 'rgba(224,204,166,0.78)'],
      [0.84, 'rgba(206,184,146,0.62)'],
      // Encke gap
      [0.87, 'rgba(30,26,22,0.12)'],
      [0.89, 'rgba(215,194,158,0.55)'],
      [0.96, 'rgba(180,164,136,0.18)'],
      [1.0, 'rgba(180,164,136,0.0)'],
    ];
    const rGrad = rCtx.createLinearGradient(0, 0, 1024, 0);
    stops.forEach(([pos, col]) => rGrad.addColorStop(pos, col));
    rCtx.fillStyle = rGrad;
    rCtx.fillRect(0, 0, 1024, 32);

    // Fine ringlets micro-texture
    for (let x = 80; x < 980; x += 3) {
      if (x > 610 && x < 668) continue;
      rCtx.fillStyle = x % 2 === 0 ? 'rgba(255,255,255,0.09)' : 'rgba(60,45,25,0.09)';
      rCtx.fillRect(x, 0, 1, 32);
    }

    return {
      map: finalizeTexture(canvas, true, maxAnisotropy),
      ringMap: finalizeTexture(ringCanvas, true, maxAnisotropy),
    };
  }

  if (id === 'uranus') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#8fe2ee');
    grad.addColorStop(0.35, '#72d5e8');
    grad.addColorStop(0.65, '#5ec4de');
    grad.addColorStop(1, '#85dce8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const ringCanvas = document.createElement('canvas');
    ringCanvas.width = 512;
    ringCanvas.height = 16;
    const rCtx = ringCanvas.getContext('2d')!;
    const rGrad = rCtx.createLinearGradient(0, 0, 512, 0);
    rGrad.addColorStop(0, 'rgba(165,243,252,0)');
    rGrad.addColorStop(0.3, 'rgba(165,243,252,0.22)');
    rGrad.addColorStop(0.55, 'rgba(186,230,253,0.08)');
    rGrad.addColorStop(0.75, 'rgba(207,250,254,0.34)');
    rGrad.addColorStop(1, 'rgba(165,243,252,0)');
    rCtx.fillStyle = rGrad;
    rCtx.fillRect(0, 0, 512, 16);

    return {
      map: finalizeTexture(canvas, true, maxAnisotropy),
      ringMap: finalizeTexture(ringCanvas, true, maxAnisotropy),
    };
  }

  if (id === 'neptune') {
    const rand = createSeededRandom(909);
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#2749b8');
    grad.addColorStop(0.35, '#2f5ef0');
    grad.addColorStop(0.65, '#2247c9');
    grad.addColorStop(1, '#1c399e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Great Dark Spot
    const gds = ctx.createRadialGradient(width * 0.44, height * 0.56, 3, width * 0.44, height * 0.56, 44);
    gds.addColorStop(0, 'rgba(14, 24, 78, 0.85)');
    gds.addColorStop(1, 'rgba(14, 24, 78, 0)');
    ctx.fillStyle = gds;
    ctx.beginPath();
    ctx.ellipse(width * 0.44, height * 0.56, 44, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bright high-altitude methane cirrus streaks
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = 'rgba(205, 232, 255, 0.42)';
      ctx.beginPath();
      ctx.ellipse(rand() * width, (0.15 + rand() * 0.7) * height, 30 + rand() * 70, 2 + rand() * 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    return { map: finalizeTexture(canvas, true, maxAnisotropy) };
  }

  // Pluto & Comet default
  const rand = createSeededRandom(1010);
  ctx.fillStyle = id === 'comet' ? '#7b93b8' : '#b79779';
  ctx.fillRect(0, 0, width, height);

  if (id === 'pluto') {
    // Dark reddish-brown Cthulhu Macula tholin belt
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = 'rgba(104, 54, 34, 0.55)';
      ctx.beginPath();
      ctx.ellipse(width * (0.12 + rand() * 0.35), height * (0.45 + rand() * 0.2), 60 + rand() * 70, 28 + rand() * 30, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Iconic Tombaugh Regio ("Heart" glacier)
    const hx = width * 0.62;
    const hy = height * 0.46;
    const hGrad = ctx.createRadialGradient(hx, hy, 10, hx, hy, 100);
    hGrad.addColorStop(0, 'rgba(246, 238, 224, 0.95)');
    hGrad.addColorStop(0.75, 'rgba(232, 218, 198, 0.85)');
    hGrad.addColorStop(1, 'rgba(232, 218, 198, 0)');
    ctx.fillStyle = hGrad;
    ctx.beginPath();
    ctx.ellipse(hx - 24, hy - 8, 52, 62, -0.2, 0, Math.PI * 2);
    ctx.ellipse(hx + 28, hy - 4, 48, 56, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  return { map: finalizeTexture(canvas, true, maxAnisotropy) };
}

export function createPalaceMarbleTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = createSeededRandom(31415);

  ctx.fillStyle = '#0e1120';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 24; i++) {
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(229, 184, 105, 0.22)' : 'rgba(99, 102, 241, 0.14)';
    ctx.lineWidth = 0.8 + rand() * 1.8;
    ctx.beginPath();
    let x = rand() * size;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < size) {
      y += 24;
      x += (rand() - 0.5) * 44;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  return finalizeTexture(canvas, true, maxAnisotropy);
}

export function createPalaceAstrolabeTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;

  ctx.fillStyle = '#111426';
  ctx.fillRect(0, 0, size, size);

  // Concentric engraved golden celestial rings
  const radii = [470, 445, 380, 350, 260, 180, 95];
  radii.forEach((r, i) => {
    ctx.strokeStyle = i % 2 === 0 ? '#e5b869' : 'rgba(229, 184, 105, 0.5)';
    ctx.lineWidth = i === 0 || i === 2 ? 4 : 2;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Degree & zodiac ticks
  for (let deg = 0; deg < 360; deg += 5) {
    const rad = (deg * Math.PI) / 180;
    const isMajor = deg % 30 === 0;
    const r1 = isMajor ? 380 : 428;
    const r2 = 445;
    ctx.strokeStyle = isMajor ? '#ffd88a' : 'rgba(229, 184, 105, 0.45)';
    ctx.lineWidth = isMajor ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(rad) * r1, c + Math.sin(rad) * r1);
    ctx.lineTo(c + Math.cos(rad) * r2, c + Math.sin(rad) * r2);
    ctx.stroke();
  }

  // Geometric sacred star & orbital ellipses
  ctx.strokeStyle = 'rgba(255, 214, 132, 0.72)';
  ctx.lineWidth = 2.5;
  for (let k = 0; k < 6; k++) {
    ctx.save();
    ctx.translate(c, c);
    ctx.rotate((k * Math.PI) / 6);
    ctx.beginPath();
    ctx.ellipse(0, 0, 340, 110, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Central golden sun emblem
  const sunGrad = ctx.createRadialGradient(c, c, 5, c, c, 90);
  sunGrad.addColorStop(0, '#fff3cc');
  sunGrad.addColorStop(0.5, '#e5b869');
  sunGrad.addColorStop(1, 'rgba(229, 184, 105, 0.15)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(c, c, 90, 0, Math.PI * 2);
  ctx.fill();

  return finalizeTexture(canvas, true, maxAnisotropy);
}

export function createCockpitHudTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#070b18';
  ctx.fillRect(0, 0, 512, 256);

  // Outer telemetry frame
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.strokeRect(12, 12, 488, 232);

  // Radar / orbital rings on left
  ctx.strokeStyle = 'rgba(94, 234, 212, 0.6)';
  ctx.lineWidth = 2;
  [28, 52, 76].forEach((r) => {
    ctx.beginPath();
    ctx.arc(120, 128, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(120, 128, 7, 0, Math.PI * 2);
  ctx.fill();

  // Telemetry bars on right
  ctx.fillStyle = '#e5b869';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('ODYSSEY-IX FLIGHT DECK', 230, 52);

  ctx.fillStyle = '#5eead4';
  ctx.font = '14px monospace';
  ctx.fillText('VECTOR: HELIOCENTRIC', 230, 88);
  ctx.fillText('DRIVE: PLASMA THRUST', 230, 114);
  ctx.fillText('NAV: SOLAR LOCK READY', 230, 140);

  // Power bars
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i < 6 ? '#38bdf8' : '#e5b869';
    ctx.fillRect(230 + i * 30, 175, 22, 34);
  }

  return finalizeTexture(canvas, true, maxAnisotropy);
}
