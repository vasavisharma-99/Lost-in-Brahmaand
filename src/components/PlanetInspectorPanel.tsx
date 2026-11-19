import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Globe,
  Layers,
  Scale,
  Sparkles,
} from 'lucide-react';
import { CELESTIAL_BODIES, CelestialBodyData } from '../data/celestialData';

interface PlanetInspectorPanelProps {
  planet: CelestialBodyData;
  explore3DMode: boolean;
  onToggleExplore3D: (enabled: boolean) => void;
  onBackToSolarSystem: () => void;
  onSelectPlanet: (id: string) => void;
}

export const PlanetInspectorPanel: React.FC<PlanetInspectorPanelProps> = ({
  planet,
  explore3DMode,
  onToggleExplore3D,
  onBackToSolarSystem,
  onSelectPlanet,
}) => {
  const [expandedFactIndex, setExpandedFactIndex] = useState<number | null>(0);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [compareId, setCompareId] = useState<string>('earth');

  const compareTarget =
    CELESTIAL_BODIES.find((b) => b.id === compareId && b.id !== planet.id) ||
    CELESTIAL_BODIES.find((b) => b.id !== planet.id)!;

  if (explore3DMode) {
    return (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 bg-[#090c1a]/92 border border-[#e5b869]/35 rounded-lg shadow-2xl max-w-[94vw]">
        <div className="pr-3 border-r border-white/10">
          <div className="font-display text-sm tracking-wider text-[#e5b869] whitespace-nowrap">
            {planet.name} — 3D Inspection
          </div>
          <div className="text-[11px] text-[#94a3b8] whitespace-nowrap">
            Drag to rotate · Scroll to zoom
          </div>
        </div>

        <button
          onClick={() => onToggleExplore3D(false)}
          className="px-3 py-1.5 text-xs font-medium text-[#f4f1ea] bg-[#141933] hover:bg-[#1d2447] border border-white/15 rounded transition-colors cursor-pointer whitespace-nowrap"
        >
          Show Dossier
        </button>

        <button
          onClick={onBackToSolarSystem}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#05070e] bg-[#e5b869] hover:bg-[#ffd27d] rounded transition-colors cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Solar System</span>
        </button>
      </div>
    );
  }

  return (
    <aside className="fixed top-[68px] sm:top-[64px] right-0 bottom-20 z-30 w-full sm:w-[420px] p-4 pointer-events-none flex flex-col justify-start">
      <div className="pointer-events-auto flex flex-col max-h-full bg-[#080b18]/92 border border-[#e5b869]/30 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between gap-2 text-xs text-[#e5b869] tracking-wide mb-1.5">
            <span>{planet.category}</span>
            <span className="font-mono-tabular text-[#94a3b8]">{planet.distanceAU}</span>
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-wide text-[#f4f1ea] leading-snug">
            {planet.name.toUpperCase()} — {planet.title.toUpperCase()}
          </h2>
        </div>

        {/* Scrollable Scientific Dossier */}
        <div className="p-5 space-y-5 overflow-y-auto cosmic-scroll">
          {/* Verified Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#0e1326] border border-white/8 rounded">
              <div className="text-[11px] text-[#94a3b8] mb-0.5">Distance from Sun</div>
              <div className="font-mono-tabular text-sm font-medium text-[#f4f1ea]">
                {planet.distanceFromSun}
              </div>
            </div>
            <div className="p-3 bg-[#0e1326] border border-white/8 rounded">
              <div className="text-[11px] text-[#94a3b8] mb-0.5">Diameter</div>
              <div className="font-mono-tabular text-sm font-medium text-[#f4f1ea]">
                {planet.diameter}
              </div>
            </div>
            <div className="p-3 bg-[#0e1326] border border-white/8 rounded">
              <div className="text-[11px] text-[#94a3b8] mb-0.5">Verified Moons</div>
              <div className="font-mono-tabular text-sm font-medium text-[#e5b869]">
                {planet.moonsNote ? planet.moonsNote : `${planet.moonsCount}`}
              </div>
            </div>
            <div className="p-3 bg-[#0e1326] border border-white/8 rounded">
              <div className="text-[11px] text-[#94a3b8] mb-0.5">Orbital Period</div>
              <div className="font-mono-tabular text-sm font-medium text-[#f4f1ea]">
                {planet.orbitalPeriod}
              </div>
            </div>
            <div className="p-3 bg-[#0e1326] border border-white/8 rounded">
              <div className="text-[11px] text-[#94a3b8] mb-0.5">Rotation Period</div>
              <div className="font-mono-tabular text-sm font-medium text-[#f4f1ea]">
                {planet.rotationPeriod}
              </div>
            </div>
            <div className="p-3 bg-[#0e1326] border border-white/8 rounded">
              <div className="text-[11px] text-[#94a3b8] mb-0.5">Average Temp</div>
              <div className="font-mono-tabular text-sm font-medium text-[#5eead4]">
                {planet.avgTemp}
              </div>
            </div>
          </div>

          {/* Engaging Summary & Uniqueness */}
          <div className="space-y-3">
            <p className="text-sm text-[#e2e8f0] leading-relaxed">
              {planet.overview}
            </p>
            <div className="p-3.5 bg-[#0e1326] border border-[#e5b869]/22 rounded">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#e5b869] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>What Makes It Unique</span>
              </div>
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                {planet.whatMakesUnique}
              </p>
            </div>
          </div>

          {/* Expandable "Did You Know?" Sections */}
          <div className="space-y-2">
            <div className="text-xs font-semibold tracking-wider uppercase text-[#94a3b8]">
              Did You Know?
            </div>
            {planet.didYouKnow.map((fact, idx) => {
              const isOpen = expandedFactIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-white/10 bg-[#0c1021] rounded overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFactIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs font-medium text-[#f4f1ea] hover:text-[#e5b869] transition-colors cursor-pointer"
                  >
                    <span>Curiosity #{idx + 1}</span>
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 shrink-0 text-[#e5b869]" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#94a3b8]" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3 text-xs text-[#cbd5e1] leading-relaxed border-t border-white/5 pt-2">
                      {fact}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Discover More Deep Dive & Side-by-Side Planet Comparison */}
          {showDeepDive && (
            <div className="space-y-4 pt-2 border-t border-white/10">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5eead4] mb-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Astrophysics Deep Dive</span>
                </div>
                <p className="text-xs text-[#cbd5e1] leading-relaxed mb-2">
                  {planet.deepDive}
                </p>
                <div className="text-xs text-[#94a3b8] font-mono-tabular">
                  Surface Gravity: <span className="text-[#f4f1ea]">{planet.gravity}</span>
                </div>
              </div>

              {/* Planet Comparison Feature */}
              <div className="p-3.5 bg-[#0e1326] border border-white/10 rounded space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#f4f1ea]">
                    <Scale className="w-3.5 h-3.5 text-[#e5b869]" />
                    <span>Compare With</span>
                  </div>
                  <select
                    value={compareTarget.id}
                    onChange={(e) => setCompareId(e.target.value)}
                    className="bg-[#070914] text-xs text-[#f4f1ea] border border-[#e5b869]/35 rounded px-2 py-1 focus:outline-none focus:border-[#e5b869]"
                  >
                    {CELESTIAL_BODIES.filter((b) => b.id !== planet.id).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono-tabular border-t border-white/10 pt-2">
                  <div className="text-[#94a3b8]">Metric</div>
                  <div className="text-[#e5b869] font-semibold truncate">{planet.name}</div>
                  <div className="text-[#5eead4] font-semibold truncate">{compareTarget.name}</div>

                  <div className="text-[#94a3b8]">Diameter</div>
                  <div className="text-[#f4f1ea]">{planet.diameterKm.toLocaleString()} km</div>
                  <div className="text-[#f4f1ea]">{compareTarget.diameterKm.toLocaleString()} km</div>

                  <div className="text-[#94a3b8]">Moons</div>
                  <div className="text-[#f4f1ea]">{planet.moonsCount}</div>
                  <div className="text-[#f4f1ea]">{compareTarget.moonsCount}</div>

                  <div className="text-[#94a3b8]">Temp</div>
                  <div className="text-[#f4f1ea] truncate">{planet.avgTemp}</div>
                  <div className="text-[#f4f1ea] truncate">{compareTarget.avgTemp}</div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Neighbor Jump */}
          <div className="pt-1 flex items-center justify-between gap-2 text-xs text-[#94a3b8]">
            <span>Jump to world:</span>
            <select
              value={planet.id}
              onChange={(e) => onSelectPlanet(e.target.value)}
              className="bg-[#0e1326] text-xs text-[#f4f1ea] border border-white/15 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#e5b869]"
            >
              {CELESTIAL_BODIES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 border-t border-white/10 bg-[#070914] flex flex-wrap items-center gap-2">
          <button
            onClick={() => onToggleExplore3D(true)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#05070e] bg-[#e5b869] hover:bg-[#ffd27d] rounded transition-colors cursor-pointer whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Explore in 3D</span>
          </button>

          <button
            onClick={() => setShowDeepDive((prev) => !prev)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#f4f1ea] bg-[#141933] hover:bg-[#1c2347] border border-white/15 rounded transition-colors cursor-pointer whitespace-nowrap"
          >
            <Layers className="w-3.5 h-3.5 text-[#5eead4]" />
            <span>{showDeepDive ? 'Hide Details' : 'Discover More'}</span>
          </button>

          <button
            onClick={onBackToSolarSystem}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#cbd5e1] hover:text-[#f4f1ea] border border-white/10 hover:border-[#e5b869]/40 rounded transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Solar System</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
