import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Compass,
  Rocket,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react';
import {
  CELESTIAL_BODIES,
  RANDOM_SPACE_FACTS,
  SPACE_MISSIONS,
} from '../data/celestialData';

interface MissionsViewProps {
  visitedIds: Set<string>;
  onSelectTarget: (planetId: string) => void;
  onOpenAstronautStudio: () => void;
  onBackToSolarSystem: () => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  visitedIds,
  onSelectTarget,
  onOpenAstronautStudio,
  onBackToSolarSystem,
}) => {
  const progressPct = Math.round((visitedIds.size / CELESTIAL_BODIES.length) * 100);

  return (
    <div className="fixed inset-0 z-20 pt-[66px] pb-6 px-4 sm:px-8 overflow-y-auto cosmic-scroll">
      <div className="max-w-[1200px] mx-auto py-5 space-y-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.18em] uppercase text-[#e5b869] mb-1">
              Expedition Log · Deep Space Reconnaissance
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-wide text-[#f4f1ea]">
              SOLAR SYSTEM MISSIONS & PROGRESS
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAstronautStudio}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#05070e] bg-[#e5b869] hover:bg-[#ffd27d] rounded transition-colors cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Astronaut Studio</span>
            </button>
            <button
              onClick={onBackToSolarSystem}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#f4f1ea] bg-[#0a0d1c]/92 border border-[#e5b869]/35 hover:border-[#e5b869] rounded transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Solar System</span>
            </button>
          </div>
        </div>

        {/* Explorer Discovery Tracker */}
        <section className="p-5 bg-[#080b18]/92 border border-[#e5b869]/25 rounded-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-[#f4f1ea]">
                Celestial Discovery Checklist
              </h2>
              <p className="text-xs text-[#94a3b8]">
                Click any world below to warp your spacecraft directly to its orbit.
              </p>
            </div>
            <div className="font-mono-tabular text-sm text-[#e5b869] font-semibold">
              {visitedIds.size} / {CELESTIAL_BODIES.length} Explored ({progressPct}%)
            </div>
          </div>

          {/* Clean Progress Bar */}
          <div className="w-full h-2 bg-[#121730] rounded overflow-hidden">
            <div
              className="h-full bg-[#e5b869] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
            {CELESTIAL_BODIES.map((body) => {
              const visited = visitedIds.has(body.id);
              return (
                <button
                  key={body.id}
                  onClick={() => onSelectTarget(body.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded border text-left transition-colors cursor-pointer ${
                    visited
                      ? 'bg-[#121832] border-[#e5b869]/45 text-[#f4f1ea]'
                      : 'bg-[#0b0f20] border-white/10 text-[#cbd5e1] hover:border-[#e5b869]/35'
                  }`}
                >
                  {visited ? (
                    <CheckCircle2 className="w-4 h-4 text-[#e5b869] shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#475569] shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{body.name}</div>
                    <div className="text-[10px] font-mono-tabular text-[#94a3b8]">
                      {body.distanceAU}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Historic & Active Missions Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SPACE_MISSIONS.map((m) => (
            <div
              key={m.id}
              className="p-5 bg-[#080b18]/92 border border-white/12 hover:border-[#e5b869]/40 rounded-lg flex flex-col justify-between gap-4 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs text-[#94a3b8]">
                  <span>{m.agency} · {m.year}</span>
                  <span className="font-mono-tabular text-[#5eead4]">{m.targetName}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-[#f4f1ea]">
                  {m.name}
                </h3>
                <p className="text-xs text-[#cbd5e1] leading-relaxed">
                  {m.objective}
                </p>
                <p className="text-xs text-[#e5b869]/90 leading-relaxed">
                  Milestone: {m.milestone}
                </p>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-white/8">
                <button
                  onClick={() => onSelectTarget(m.targetId)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#05070e] bg-[#e5b869] hover:bg-[#ffd27d] rounded transition-colors cursor-pointer"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Fly to {m.targetName}</span>
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

interface StarMapModalProps {
  isOpen: boolean;
  visitedIds: Set<string>;
  selectedPlanetId: string | null;
  onSelectPlanet: (id: string) => void;
  onClose: () => void;
}

export const StarMapModal: React.FC<StarMapModalProps> = ({
  isOpen,
  visitedIds,
  selectedPlanetId,
  onSelectPlanet,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#03040a]/82">
      <div className="w-full max-w-3xl bg-[#080b18] border border-[#e5b869]/35 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#5eead4]" />
            <h2 className="font-display text-lg font-semibold text-[#f4f1ea]">
              Heliocentric Star Map & Quick Warp
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close star map"
            className="p-1.5 text-[#94a3b8] hover:text-[#f4f1ea] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[72vh] overflow-y-auto cosmic-scroll space-y-4">
          <p className="text-xs text-[#94a3b8]">
            Select any celestial body from the solar core out to the Kuiper Belt to plot an immediate course.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {CELESTIAL_BODIES.map((body) => {
              const active = body.id === selectedPlanetId;
              const visited = visitedIds.has(body.id);
              return (
                <button
                  key={body.id}
                  onClick={() => {
                    onSelectPlanet(body.id);
                    onClose();
                  }}
                  className={`flex items-center gap-3 p-3 rounded border text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#151c36] border-[#e5b869]'
                      : 'bg-[#0d1226] border-white/10 hover:border-[#e5b869]/50'
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-full shrink-0 border border-white/20"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${body.colorHex}, ${body.accentHex})`,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-[#f4f1ea] truncate">
                        {body.name}
                      </span>
                      {visited && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#e5b869] shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] font-mono-tabular text-[#94a3b8] truncate">
                      {body.distanceAU} · {body.category}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

interface FactModalProps {
  factIndex: number | null;
  onNextFact: () => void;
  onClose: () => void;
}

export const FactModal: React.FC<FactModalProps> = ({
  factIndex,
  onNextFact,
  onClose,
}) => {
  if (factIndex === null) return null;
  const fact = RANDOM_SPACE_FACTS[factIndex % RANDOM_SPACE_FACTS.length];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#03040a]/78">
      <div className="w-full max-w-md bg-[#080b18] border border-[#e5b869]/40 rounded-lg shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#e5b869]">
            <Sparkles className="w-4 h-4" />
            <span>Did You Know?</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close space fact"
            className="p-1 text-[#94a3b8] hover:text-[#f4f1ea] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-[#f4f1ea] leading-relaxed">{fact}</p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-[#cbd5e1] hover:text-white border border-white/15 rounded cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={onNextFact}
            className="px-4 py-1.5 text-xs font-semibold text-[#05070e] bg-[#e5b869] hover:bg-[#ffd27d] rounded cursor-pointer"
          >
            Next Space Fact
          </button>
        </div>
      </div>
    </div>
  );
};
