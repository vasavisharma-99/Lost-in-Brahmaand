import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Download,
  Move,
  RotateCw,
  Upload,
  UserCheck,
  ZoomIn,
  ArrowLeft,
} from 'lucide-react';
import {
  ASTRONAUT_MISSIONS,
  CALLSIGN_PRESETS,
  CELESTIAL_BODIES,
  SUIT_STYLES,
  SuitStyleOption,
} from '../data/celestialData';

interface AstronautStudioProps {
  studioPlanetId: string;
  onSelectStudioPlanet: (planetId: string) => void;
  onBackToSolarSystem: () => void;
}

export const AstronautStudio: React.FC<AstronautStudioProps> = ({
  studioPlanetId,
  onSelectStudioPlanet,
  onBackToSolarSystem,
}) => {
  const [explorerName, setExplorerName] = useState('Aarav Sharma');
  const [callsign, setCallsign] = useState('ASTRA-07');
  const [mission, setMission] = useState(ASTRONAUT_MISSIONS[0]);
  const [suitStyle, setSuitStyle] = useState<SuitStyleOption>(SUIT_STYLES[0]);

  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1.15);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const dragStartRef = useRef<{ x: number; y: number; ox: number; oy: number }>({
    x: 0,
    y: 0,
    ox: 0,
    oy: 0,
  });
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedPlanet = useMemo(
    () =>
      CELESTIAL_BODIES.find((b) => b.id === studioPlanetId) ||
      CELESTIAL_BODIES.find((b) => b.id === 'saturn')!,
    [studioPlanetId]
  );

  // Locally generated futuristic Explorer ID deterministic from callsign + planet
  const generatedId = useMemo(() => {
    const seedStr = `${explorerName}-${callsign}-${selectedPlanet.id}`;
    let hash = 5381;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash * 33) ^ seedStr.charCodeAt(i);
    }
    const num = Math.abs(hash % 9000) + 1000;
    const code = selectedPlanet.id.slice(0, 3).toUpperCase();
    return `LIB-2026-${num}-${code}`;
  }, [explorerName, callsign, selectedPlanet.id]);

  // Handle real file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!photoSrc) {
      setLoadedImage(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setLoadedImage(img);
      setZoom(1.1);
      setOffsetX(0);
      setOffsetY(0);
      setRotationDeg(0);
    };
    img.src = photoSrc;
  }, [photoSrc]);

  // Shared high-res poster renderer (powers both the live preview canvas & 1200x1500 PNG export)
  const renderPosterToCanvas = (
    canvas: HTMLCanvasElement,
    w: number,
    h: number
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = w / 600;
    ctx.save();
    ctx.scale(scale, scale);

    // Base design space: 600 x 750
    const W = 600;
    const H = 750;

    // 1. Planet-themed deep cosmic background
    const bgGrad = ctx.createRadialGradient(300, 260, 30, 300, 340, 480);
    bgGrad.addColorStop(0, `${selectedPlanet.colorHex}33`);
    bgGrad.addColorStop(0.45, '#120e28');
    bgGrad.addColorStop(1, '#05070e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle procedural stars
    for (let i = 0; i < 95; i++) {
      const sx = ((i * 197 + 43) % 580) + 10;
      const sy = ((i * 313 + 71) % 690) + 10;
      const sr = (i % 3 === 0 ? 1.5 : 0.9);
      ctx.fillStyle = i % 5 === 0 ? '#ffd88a' : 'rgba(244,241,234,0.72)';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Planet-themed landscape / orb behind astronaut
    const px = 470;
    const py = 175;
    const pr = 95;

    // Atmospheric halo
    const halo = ctx.createRadialGradient(px, py, pr * 0.7, px, py, pr * 1.65);
    halo.addColorStop(0, `${selectedPlanet.colorHex}55`);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(px, py, pr * 1.65, 0, Math.PI * 2);
    ctx.fill();

    // Planet sphere
    const pGrad = ctx.createRadialGradient(px - pr * 0.35, py - pr * 0.35, pr * 0.1, px, py, pr);
    pGrad.addColorStop(0, selectedPlanet.colorHex);
    pGrad.addColorStop(0.65, selectedPlanet.accentHex);
    pGrad.addColorStop(1, '#090b16');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();

    // Rings for Saturn or Uranus
    if (selectedPlanet.hasRings) {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.34);
      ctx.strokeStyle = 'rgba(245, 224, 178, 0.65)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.ellipse(0, 0, pr * 1.9, pr * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(229, 184, 105, 0.38)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(0, 0, pr * 2.15, pr * 0.49, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Planetary horizon terrain curve for rocky worlds (Mars, Moon, Mercury, Pluto)
    if (['mars', 'moon', 'mercury', 'pluto'].includes(selectedPlanet.id)) {
      const hGrad = ctx.createLinearGradient(0, 490, 0, 750);
      hGrad.addColorStop(0, `${selectedPlanet.accentHex}55`);
      hGrad.addColorStop(1, '#05070e');
      ctx.fillStyle = hGrad;
      ctx.beginPath();
      ctx.moveTo(0, 560);
      ctx.quadraticCurveTo(300, 495, 600, 565);
      ctx.lineTo(600, 750);
      ctx.lineTo(0, 750);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Outer Gold Architectural Frame
    ctx.strokeStyle = 'rgba(229, 184, 105, 0.48)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    ctx.strokeStyle = 'rgba(229, 184, 105, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    // Top Header Branding
    ctx.fillStyle = '#e5b869';
    ctx.font = '600 13px "Cinzel", Georgia, serif';
    ctx.fillText('LOST IN BRAHMAAND', 44, 58);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(generatedId, W - 44, 58);
    ctx.textAlign = 'left';

    // 4. Astronaut Suit Body & Backpack Silhouette
    // Life support backpack behind shoulders
    ctx.fillStyle = suitStyle.secondary;
    ctx.beginPath();
    ctx.roundRect(145, 345, 310, 205, 34);
    ctx.fill();
    ctx.strokeStyle = suitStyle.trim;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Main Torso & Shoulders
    const torsoGrad = ctx.createLinearGradient(160, 365, 440, 595);
    torsoGrad.addColorStop(0, suitStyle.primary);
    torsoGrad.addColorStop(1, suitStyle.secondary);
    ctx.fillStyle = torsoGrad;
    ctx.beginPath();
    ctx.moveTo(118, 595);
    ctx.quadraticCurveTo(128, 410, 210, 392);
    ctx.lineTo(390, 392);
    ctx.quadraticCurveTo(472, 410, 482, 595);
    ctx.closePath();
    ctx.fill();

    // Suit trim stripes on shoulders
    ctx.strokeStyle = suitStyle.trim;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(175, 420);
    ctx.lineTo(155, 565);
    ctx.moveTo(425, 420);
    ctx.lineTo(445, 565);
    ctx.stroke();

    // Chest Control Module
    ctx.fillStyle = '#0b0f1f';
    ctx.strokeStyle = suitStyle.trim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(236, 446, 128, 86, 10);
    ctx.fill();
    ctx.stroke();

    // Chest Telemetry Bars inside module
    ctx.fillStyle = suitStyle.trim;
    ctx.fillRect(252, 464, 42, 8);
    ctx.fillStyle = '#5eead4';
    ctx.fillRect(252, 480, 74, 6);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(252, 494, 56, 6);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.fillText(callsign.toUpperCase() || 'EXPLORER', 252, 518);

    // Metallic Neck Ring Collar
    const collarGrad = ctx.createLinearGradient(205, 368, 395, 412);
    collarGrad.addColorStop(0, '#475569');
    collarGrad.addColorStop(0.5, suitStyle.trim);
    collarGrad.addColorStop(1, '#334155');
    ctx.fillStyle = collarGrad;
    ctx.beginPath();
    ctx.ellipse(300, 394, 102, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Helmet Shell
    const helmetGrad = ctx.createRadialGradient(265, 220, 25, 300, 265, 145);
    helmetGrad.addColorStop(0, suitStyle.primary);
    helmetGrad.addColorStop(0.8, suitStyle.secondary);
    helmetGrad.addColorStop(1, '#090b14');
    ctx.fillStyle = helmetGrad;
    ctx.beginPath();
    ctx.arc(300, 262, 134, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = suitStyle.trim;
    ctx.lineWidth = 3;
    ctx.stroke();

    // 6. Visor Opening & Uploaded Photo Portrait inside Helmet!
    const visorCx = 300;
    const visorCy = 264;
    const visorRx = 96;
    const visorRy = 104;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(visorCx, visorCy, visorRx, visorRy, 0, 0, Math.PI * 2);
    ctx.clip();

    // Dark visor interior backing
    ctx.fillStyle = '#0b1022';
    ctx.fillRect(visorCx - visorRx, visorCy - visorRy, visorRx * 2, visorRy * 2);

    if (loadedImage) {
      const aspect = loadedImage.width / loadedImage.height;
      const baseH = visorRy * 2.1;
      const baseW = baseH * aspect;
      const drawW = baseW * zoom;
      const drawH = baseH * zoom;

      ctx.save();
      ctx.translate(visorCx + offsetX, visorCy + offsetY);
      ctx.rotate((rotationDeg * Math.PI) / 180);
      ctx.drawImage(loadedImage, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    } else {
      // Clean stylized silhouette placeholder inviting photo upload
      ctx.fillStyle = 'rgba(229, 184, 105, 0.14)';
      ctx.beginPath();
      ctx.arc(visorCx, visorCy - 18, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(visorCx, visorCy + 65, 62, 52, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(244, 241, 234, 0.72)';
      ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload Portrait', visorCx, visorCy + 52);
      ctx.textAlign = 'left';
    }

    // Subtle colored visor glass tint & specular highlight
    ctx.fillStyle = suitStyle.visorTint;
    ctx.fillRect(visorCx - visorRx, visorCy - visorRy, visorRx * 2, visorRy * 2);

    const specGrad = ctx.createLinearGradient(
      visorCx - visorRx,
      visorCy - visorRy,
      visorCx + visorRx * 0.4,
      visorCy + visorRy * 0.2
    );
    specGrad.addColorStop(0, 'rgba(255,255,255,0.34)');
    specGrad.addColorStop(0.35, 'rgba(255,255,255,0.06)');
    specGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = specGrad;
    ctx.fillRect(visorCx - visorRx, visorCy - visorRy, visorRx * 2, visorRy * 2);
    ctx.restore();

    // Visor golden gasket rim
    ctx.strokeStyle = suitStyle.trim;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(visorCx, visorCy, visorRx, visorRy, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 7. Bottom Identity Dossier Strip
    ctx.fillStyle = 'rgba(7, 9, 20, 0.94)';
    ctx.fillRect(28, 560, W - 56, 162);
    ctx.strokeStyle = 'rgba(229, 184, 105, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(28, 560);
    ctx.lineTo(W - 28, 560);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillText('EXPLORER IDENTITY', 48, 588);
    ctx.textAlign = 'right';
    ctx.fillText(`SECTOR: ${selectedPlanet.name.toUpperCase()}`, W - 48, 588);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#f4f1ea';
    ctx.font = '700 26px "Cinzel", Georgia, serif';
    ctx.fillText((explorerName || 'Cosmic Explorer').toUpperCase(), 48, 622);

    ctx.fillStyle = '#e5b869';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillText(`CALLSIGN // ${callsign || 'ASTRA-07'}`, 48, 648);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Mission: ${mission}`, 48, 676);

    ctx.fillStyle = '#5eead4';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillText(
      `${selectedPlanet.distanceAU} · ${selectedPlanet.category}`,
      48,
      702
    );

    ctx.restore();
  };

  // Redraw preview canvas whenever attributes change
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    renderPosterToCanvas(canvas, 600, 750);
  });

  // Drag-to-reposition photo directly inside the visor preview
  const handlePreviewPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!loadedImage) return;
    setIsDraggingPhoto(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offsetX,
      oy: offsetY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePreviewPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingPhoto) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setOffsetX(Math.max(-120, Math.min(120, dragStartRef.current.ox + dx * 1.2)));
    setOffsetY(Math.max(-120, Math.min(120, dragStartRef.current.oy + dy * 1.2)));
  };

  const handlePreviewPointerUp = () => {
    setIsDraggingPhoto(false);
  };

  // High-resolution PNG download (1200 x 1500 px)
  const handleDownloadPortrait = () => {
    const offscreen = document.createElement('canvas');
    offscreen.width = 1200;
    offscreen.height = 1500;
    renderPosterToCanvas(offscreen, 1200, 1500);

    offscreen.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = (callsign || explorerName || 'astronaut')
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-');
      a.href = url;
      a.download = `lost-in-brahmaand-${safeName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportStatus('Portrait downloaded as high-resolution PNG.');
      setTimeout(() => setExportStatus(null), 3500);
    }, 'image/png');
  };

  const selectablePlanets = CELESTIAL_BODIES.filter((b) => b.id !== 'comet');

  return (
    <div className="fixed inset-0 z-20 pt-[66px] pb-4 px-4 sm:px-8 overflow-y-auto cosmic-scroll">
      <div className="max-w-[1320px] mx-auto min-h-full flex flex-col justify-center py-4">
        {/* Studio Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <div className="text-xs tracking-[0.18em] uppercase text-[#e5b869] mb-1">
              Explorer Synthesis · {selectedPlanet.name} Backdrop
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-wide text-[#f4f1ea]">
              CREATE YOUR ASTRONAUT IDENTITY
            </h1>
          </div>

          <button
            onClick={onBackToSolarSystem}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#f4f1ea] bg-[#0a0d1c]/92 border border-[#e5b869]/35 hover:border-[#e5b869] rounded transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Solar System</span>
          </button>
        </div>

        {/* Selectable Floating 3D-Shaded Planet Orbs */}
        <div className="mb-5 p-3.5 bg-[#080b18]/90 border border-[#e5b869]/22 rounded-lg">
          <div className="text-[11px] uppercase tracking-wider text-[#94a3b8] mb-2.5">
            Select Background Planet (Updates Live 3D Backdrop & Poster)
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1 cosmic-scroll">
            {selectablePlanets.map((p) => {
              const active = p.id === selectedPlanet.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectStudioPlanet(p.id)}
                  className={`group flex flex-col items-center gap-1.5 px-3 py-2 rounded border transition-all shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#141a33] border-[#e5b869]'
                      : 'bg-[#0b0f20] border-white/10 hover:border-[#e5b869]/45'
                  }`}
                >
                  <div className="relative flex items-center justify-center w-9 h-9">
                    <span
                      className="w-7 h-7 rounded-full shadow-inner transition-transform group-hover:scale-110"
                      style={{
                        background: `radial-gradient(circle at 32% 30%, ${p.colorHex}, ${p.accentHex} 70%, #05070e 100%)`,
                        boxShadow: active ? `0 0 14px ${p.colorHex}80` : 'none',
                      }}
                    />
                    {p.hasRings && (
                      <span
                        className="absolute w-10 h-2.5 rounded-full border border-[#e5b869]/75 -rotate-12 pointer-events-none"
                      />
                    )}
                  </div>
                  <span
                    className={`text-[11px] whitespace-nowrap ${
                      active ? 'text-[#e5b869] font-semibold' : 'text-[#cbd5e1]'
                    }`}
                  >
                    {p.name.replace('Ceres & Asteroid Belt', 'Ceres').replace('The ', '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Split: Left Customization Controls + Right Astronaut Poster Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Photo Upload, Framing, Suit & Mission Details */}
          <div className="lg:col-span-7 bg-[#080b18]/92 border border-[#e5b869]/25 rounded-lg p-5 sm:p-6 space-y-5">
            {/* 1. Photo Upload & Visor Framing */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-sm font-semibold tracking-wider text-[#f4f1ea]">
                    1. Portrait Upload & Visor Framing
                  </h2>
                  <p className="text-xs text-[#94a3b8]">
                    Upload your photo, then drag directly on the helmet visor or adjust sliders.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#05070e] bg-[#e5b869] hover:bg-[#ffd27d] rounded transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{photoSrc ? 'Change Photo' : 'Upload Photo'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex flex-col gap-1 text-xs text-[#cbd5e1]">
                  <span className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#94a3b8]">
                      <ZoomIn className="w-3.5 h-3.5" /> Zoom
                    </span>
                    <span className="font-mono-tabular text-[#e5b869]">{zoom.toFixed(2)}x</span>
                  </span>
                  <input
                    type="range"
                    min="0.6"
                    max="2.4"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="accent-[#e5b869] cursor-pointer"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs text-[#cbd5e1]">
                  <span className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#94a3b8]">
                      <RotateCw className="w-3.5 h-3.5" /> Tilt
                    </span>
                    <span className="font-mono-tabular text-[#e5b869]">{rotationDeg}°</span>
                  </span>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={rotationDeg}
                    onChange={(e) => setRotationDeg(parseInt(e.target.value, 10))}
                    className="accent-[#e5b869] cursor-pointer"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs text-[#cbd5e1]">
                  <span className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#94a3b8]">
                      <Move className="w-3.5 h-3.5" /> Horizontal Shift
                    </span>
                    <span className="font-mono-tabular text-[#e5b869]">{Math.round(offsetX)}px</span>
                  </span>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                    className="accent-[#e5b869] cursor-pointer"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs text-[#cbd5e1]">
                  <span className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#94a3b8]">
                      <Move className="w-3.5 h-3.5" /> Vertical Shift
                    </span>
                    <span className="font-mono-tabular text-[#e5b869]">{Math.round(offsetY)}px</span>
                  </span>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                    className="accent-[#e5b869] cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* 2. Explorer Identity Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10">
              <label className="flex flex-col gap-1.5 text-xs">
                <span className="text-[#94a3b8] font-medium">Explorer Name</span>
                <input
                  type="text"
                  maxLength={28}
                  value={explorerName}
                  onChange={(e) => setExplorerName(e.target.value)}
                  placeholder="Enter your name"
                  className="px-3 py-2 bg-[#0d1226] border border-white/15 focus:border-[#e5b869] rounded text-sm text-[#f4f1ea] focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs">
                <span className="text-[#94a3b8] font-medium">Astronaut Callsign</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={14}
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 bg-[#0d1226] border border-white/15 focus:border-[#e5b869] rounded text-sm font-mono-tabular text-[#e5b869] focus:outline-none"
                  />
                  <select
                    value={CALLSIGN_PRESETS.includes(callsign) ? callsign : ''}
                    onChange={(e) => e.target.value && setCallsign(e.target.value)}
                    className="px-2 py-2 bg-[#0d1226] border border-white/15 rounded text-xs text-[#cbd5e1] focus:outline-none"
                  >
                    <option value="">Presets</option>
                    {CALLSIGN_PRESETS.map((cs) => (
                      <option key={cs} value={cs}>
                        {cs}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="sm:col-span-2 flex flex-col gap-1.5 text-xs">
                <span className="text-[#94a3b8] font-medium">Assigned Mission</span>
                <select
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="px-3 py-2 bg-[#0d1226] border border-white/15 focus:border-[#e5b869] rounded text-sm text-[#f4f1ea] focus:outline-none"
                >
                  {ASTRONAUT_MISSIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* 3. Spacesuit Style Selector */}
            <div className="pt-3 border-t border-white/10">
              <div className="text-xs font-medium text-[#94a3b8] mb-2.5">
                Spacesuit Architecture
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SUIT_STYLES.map((style) => {
                  const active = style.id === suitStyle.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setSuitStyle(style)}
                      className={`flex items-center gap-2 p-2.5 rounded border text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#151c36] border-[#e5b869] text-[#f4f1ea]'
                          : 'bg-[#0c1022] border-white/10 text-[#cbd5e1] hover:border-white/25'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 border border-white/25"
                        style={{
                          background: `linear-gradient(135deg, ${style.primary} 50%, ${style.trim} 50%)`,
                        }}
                      />
                      <span className="text-xs font-medium truncate">{style.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Generated ID Summary & Export CTA */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-[#5eead4]" />
                <div>
                  <div className="text-[11px] text-[#94a3b8]">Generated Explorer ID</div>
                  <div className="font-mono-tabular text-xs font-semibold text-[#5eead4]">
                    {generatedId}
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownloadPortrait}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-[#05070e] bg-[#e5b869] hover:bg-[#ffd27d] rounded shadow-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Download My Astronaut Portrait</span>
              </button>
            </div>

            {exportStatus && (
              <div className="text-xs text-[#5eead4] font-medium">
                {exportStatus}
              </div>
            )}
          </div>

          {/* Right Column: Live Interactive Astronaut Identity Poster Canvas */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#080b18]/92 border border-[#e5b869]/25 rounded-lg p-4">
            <canvas
              ref={previewCanvasRef}
              width={600}
              height={750}
              onPointerDown={handlePreviewPointerDown}
              onPointerMove={handlePreviewPointerMove}
              onPointerUp={handlePreviewPointerUp}
              onPointerCancel={handlePreviewPointerUp}
              className={`w-full max-w-[400px] aspect-[4/5] rounded border border-[#e5b869]/30 shadow-2xl ${
                loadedImage ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
              }`}
            />
            <p className="mt-2.5 text-[11px] text-[#94a3b8] text-center">
              {loadedImage
                ? 'Tip: Drag directly inside the helmet visor to reposition your portrait.'
                : 'Upload a portrait photo to place yourself inside the helmet.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
