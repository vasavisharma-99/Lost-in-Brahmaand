import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Compass,
  Shuffle,
  Sparkles,
  Map as MapIcon,
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  FastForward,
} from 'lucide-react';
import { AppPhase, CELESTIAL_BODIES } from '../data/celestialData';

interface NavigationHUDProps {
  phase: AppPhase;
  selectedPlanetId: string | null;
  visitedIds: Set<string>;
  isMuted: boolean;
  orbitSpeedMultiplier: number;
  guidedTourActive: boolean;
  onNavigate: (target: AppPhase) => void;
  onToggleMute: () => void;
  onChangeOrbitSpeed: (speed: number) => void;
  onRandomPlanet: () => void;
  onOpenStarMap: () => void;
  onToggleGuidedTour: () => void;
  onOpenRandomFact: () => void;
}

export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  phase,
  selectedPlanetId,
  visitedIds,
  isMuted,
  orbitSpeedMultiplier,
  guidedTourActive,
  onNavigate,
  onToggleMute,
  onChangeOrbitSpeed,
  onRandomPlanet,
  onOpenStarMap,
  onToggleGuidedTour,
  onOpenRandomFact,
}) => {
  const [dockCollapsed, setDockCollapsed] = useState(false);

  // Hide heavy navigation during the locked cinematic transitions
  const isCinematicLock =
    phase === 'doors_opening' || phase === 'boarding' || phase === 'launching';

  const showSolarDock =
    phase === 'solar_system' || phase === 'planet_explore';

  const selectedBody = selectedPlanetId
    ? CELESTIAL_BODIES.find((b) => b.id === selectedPlanetId)
    : null;

  const navItems: Array<{ label: string; target: AppPhase; active: boolean }> = [
    {
      label: 'Home',
      target: 'palace',
      active: phase === 'palace' || phase === 'hangar',
    },
    {
      label: 'Solar System',
      target: 'solar_system',
      active: phase === 'solar_system',
    },
    {
      label: 'Planet Explorer',
      target: 'planet_explore',
      active: phase === 'planet_explore',
    },
    {
      label: 'Astronaut Studio',
      target: 'astronaut_studio',
      active: phase === 'astronaut_studio',
    },
    {
      label: 'Missions',
      target: 'missions',
      active: phase === 'missions',
    },
  ];

  return (
    <>
      {/* Top 3-Zone Navigation Contract */}
      <header
        className={`fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-8 py-3.5 border-b border-[#e5b869]/18 bg-[#070914]/88 transition-opacity duration-300 ${
          isCinematicLock ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          onClick={() => onNavigate('palace')}
          className="font-display text-base sm:text-lg font-semibold tracking-[0.14em] text-[#f4f1ea] hover:text-[#e5b869] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          LOST IN BRAHMAAND
        </button>

        {/* Zone 2: Clean Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs tracking-[0.08em] uppercase font-medium">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.target)}
              className={`py-1 border-b transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                item.active
                  ? 'text-[#e5b869] border-[#e5b869]'
                  : 'text-[#cbd5e1] border-transparent hover:text-[#f4f1ea] hover:border-[#e5b869]/40'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Compact Explorer Telemetry & Audio Toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#cbd5e1] font-mono-tabular whitespace-nowrap">
            <span className="text-[#94a3b8]">Explored</span>
            <span className="text-[#e5b869] font-semibold">
              {visitedIds.size}/{CELESTIAL_BODIES.length}
            </span>
          </div>

          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute space audio' : 'Mute space audio'}
            title={isMuted ? 'Unmute ambient audio' : 'Mute ambient audio'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#f4f1ea] border border-[#e5b869]/30 bg-[#0d1124] hover:border-[#e5b869]/70 hover:text-[#e5b869] rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#e5b869]" />}
            <span className="hidden lg:inline">{isMuted ? 'Sound Off' : 'Sound On'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Compact Nav Bar (below header on small screens) */}
      {!isCinematicLock && (
        <div className="md:hidden fixed top-[53px] left-0 right-0 z-30 flex items-center justify-around px-2 py-2 bg-[#070914]/90 border-b border-[#e5b869]/15 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.target)}
              className={`px-2 py-1 text-[11px] font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                item.active ? 'text-[#e5b869]' : 'text-[#94a3b8]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Collapsible Bottom Control Dock for Solar System */}
      {showSolarDock && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center max-w-[min(940px,95vw)]">
          {/* Collapse / Expand Handle */}
          <button
            onClick={() => setDockCollapsed((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] tracking-wider uppercase text-[#cbd5e1] hover:text-[#e5b869] bg-[#090c1a]/92 border border-b-0 border-[#e5b869]/28 rounded-t transition-colors cursor-pointer whitespace-nowrap"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Controls</span>
              </>
            )}
          </button>

          {!dockCollapsed && (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 bg-[#090c1a]/92 border border-[#e5b869]/30 rounded-lg shadow-2xl">
              {/* Spaceship Mini-Dashboard Target Readout */}
              <div className="hidden lg:flex items-center gap-3 pr-3 border-r border-white/10 text-xs whitespace-nowrap">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#94a3b8]">
                    Target Telemetry
                  </div>
                  <div className="font-mono-tabular text-[#f4f1ea] font-medium">
                    {selectedBody ? `${selectedBody.name} · ${selectedBody.distanceAU}` : 'Solar System · 0–40 AU'}
                  </div>
                </div>
              </div>

              {/* Orbit Time Multiplier */}
              <div className="flex items-center gap-1 bg-[#11162c] p-1 rounded border border-white/10">
                <button
                  onClick={() => onChangeOrbitSpeed(0)}
                  title="Pause Orbits"
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer whitespace-nowrap ${
                    orbitSpeedMultiplier === 0
                      ? 'bg-[#e5b869] text-[#05070e] font-semibold'
                      : 'text-[#cbd5e1] hover:text-white'
                  }`}
                >
                  <Pause className="w-3 h-3" />
                  <span>Pause</span>
                </button>
                <button
                  onClick={() => onChangeOrbitSpeed(1)}
                  title="Normal Speed"
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer whitespace-nowrap ${
                    orbitSpeedMultiplier === 1
                      ? 'bg-[#e5b869] text-[#05070e] font-semibold'
                      : 'text-[#cbd5e1] hover:text-white'
                  }`}
                >
                  <Play className="w-3 h-3" />
                  <span>1x</span>
                </button>
                <button
                  onClick={() => onChangeOrbitSpeed(3)}
                  title="Fast Orbit"
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer whitespace-nowrap ${
                    orbitSpeedMultiplier === 3
                      ? 'bg-[#e5b869] text-[#05070e] font-semibold'
                      : 'text-[#cbd5e1] hover:text-white'
                  }`}
                >
                  <FastForward className="w-3 h-3" />
                  <span>3x</span>
                </button>
              </div>

              {/* Action Controls */}
              <button
                onClick={onOpenStarMap}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#f4f1ea] bg-[#11162c] hover:bg-[#1a2242] border border-white/15 rounded transition-colors cursor-pointer whitespace-nowrap"
              >
                <MapIcon className="w-3.5 h-3.5 text-[#5eead4]" />
                <span>Star Map</span>
              </button>

              <button
                onClick={onRandomPlanet}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#f4f1ea] bg-[#11162c] hover:bg-[#1a2242] border border-white/15 rounded transition-colors cursor-pointer whitespace-nowrap"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#e5b869]" />
                <span>Random Planet</span>
              </button>

              <button
                onClick={onToggleGuidedTour}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap ${
                  guidedTourActive
                    ? 'bg-[#e5b869] text-[#05070e] border-[#e5b869] font-semibold'
                    : 'text-[#f4f1ea] bg-[#11162c] hover:bg-[#1a2242] border-white/15'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{guidedTourActive ? 'Stop Tour' : 'Guided Tour'}</span>
              </button>

              <button
                onClick={onOpenRandomFact}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#f4f1ea] bg-[#11162c] hover:bg-[#1a2242] border border-white/15 rounded transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#a78bfa]" />
                <span>Did You Know?</span>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
