import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Compass, Rocket, Sparkles } from 'lucide-react';
import { AppPhase, CELESTIAL_BODIES, RANDOM_SPACE_FACTS } from './data/celestialData';
import { cosmicAudio } from './audio/cosmicAudio';
import { CosmicViewport } from './components/CosmicViewport';
import { NavigationHUD } from './components/NavigationHUD';
import { PlanetInspectorPanel } from './components/PlanetInspectorPanel';
import { AstronautStudio } from './components/AstronautStudio';
import { FactModal, MissionsView, StarMapModal } from './components/MissionsAndModals';

export default function App() {
  const [sceneReady, setSceneReady] = useState(false);
  const [phase, setPhase] = useState<AppPhase>('palace');
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
  const [studioPlanetId, setStudioPlanetId] = useState<string>('saturn');
  const [explore3DMode, setExplore3DMode] = useState(false);
  const [orbitSpeedMultiplier, setOrbitSpeedMultiplier] = useState(1);
  const [launchCountdown, setLaunchCountdown] = useState<number | null>(null);
  const [visitedIds, setVisitedIds] = useState<Set<string>>(() => new Set(['earth']));
  const [isMuted, setIsMuted] = useState(false);
  const [starMapOpen, setStarMapOpen] = useState(false);
  const [factModalIndex, setFactModalIndex] = useState<number | null>(null);
  const [guidedTourActive, setGuidedTourActive] = useState(false);

  const markVisited = useCallback((id: string) => {
    setVisitedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleSelectPlanet = useCallback(
    (id: string) => {
      setSelectedPlanetId(id);
      setExplore3DMode(false);
      setPhase('planet_explore');
      markVisited(id);
      cosmicAudio.startAmbient();
    },
    [markVisited]
  );

  const handleStartJourney = () => {
    cosmicAudio.playPalaceDoors();
    setPhase('doors_opening');
  };

  const handleEnterSpaceship = () => {
    cosmicAudio.playChime(523.25, 0.5);
    setPhase('boarding');
  };

  const handleNavigate = (target: AppPhase) => {
    cosmicAudio.startAmbient();
    cosmicAudio.playChime(587.33, 0.25);
    setGuidedTourActive(false);

    if (target === 'planet_explore') {
      const targetId = selectedPlanetId || 'saturn';
      setSelectedPlanetId(targetId);
      markVisited(targetId);
      setExplore3DMode(false);
      setPhase('planet_explore');
      return;
    }

    if (target === 'solar_system') {
      setExplore3DMode(false);
      setPhase('solar_system');
      return;
    }

    setPhase(target);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    cosmicAudio.setMuted(next);
  };

  const handleRandomPlanet = () => {
    const candidates = CELESTIAL_BODIES.filter((b) => b.id !== selectedPlanetId);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    if (pick) {
      cosmicAudio.playChime(698.46, 0.35);
      handleSelectPlanet(pick.id);
    }
  };

  // Guided Tour automatic progression through the Solar System
  useEffect(() => {
    if (!guidedTourActive) return;

    const tourOrder = [
      'sun',
      'mercury',
      'venus',
      'earth',
      'moon',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
      'pluto',
    ];

    const currentIdx = selectedPlanetId ? tourOrder.indexOf(selectedPlanetId) : -1;
    if (currentIdx === -1) {
      handleSelectPlanet(tourOrder[0]);
      return;
    }

    const timer = window.setTimeout(() => {
      const nextIdx = (currentIdx + 1) % tourOrder.length;
      handleSelectPlanet(tourOrder[nextIdx]);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [guidedTourActive, selectedPlanetId, handleSelectPlanet]);

  const handleToggleGuidedTour = () => {
    if (guidedTourActive) {
      setGuidedTourActive(false);
    } else {
      setGuidedTourActive(true);
      handleSelectPlanet('sun');
    }
  };

  const selectedPlanet = selectedPlanetId
    ? CELESTIAL_BODIES.find((b) => b.id === selectedPlanetId) || null
    : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#04060d] select-none">
      {/* Persistent Full-Bleed 3D WebGL Engine */}
      <CosmicViewport
        phase={phase}
        selectedPlanetId={selectedPlanetId}
        studioPlanetId={studioPlanetId}
        explore3DMode={explore3DMode}
        orbitSpeedMultiplier={orbitSpeedMultiplier}
        launchCountdown={launchCountdown}
        onSelectPlanet={handleSelectPlanet}
        onPhaseAutoAdvance={(nextPhase) => setPhase(nextPhase)}
        onCountdownTick={setLaunchCountdown}
        onSceneReady={() => setSceneReady(true)}
      />

      {/* Initial Loading Overlay */}
      <AnimatePresence>
        {!sceneReady && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#04060d] text-center p-6"
          >
            <div className="font-display text-2xl sm:text-3xl tracking-[0.22em] text-[#e5b869] mb-3">
              LOST IN BRAHMAAND
            </div>
            <div className="text-xs tracking-[0.16em] uppercase text-[#94a3b8] mb-6">
              Aligning Celestial Architecture & Planetary Orbits
            </div>
            <div className="w-48 h-1 bg-[#121730] rounded overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-[#e5b869]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation & Collapsible Solar Dock */}
      <NavigationHUD
        phase={phase}
        selectedPlanetId={selectedPlanetId}
        visitedIds={visitedIds}
        isMuted={isMuted}
        orbitSpeedMultiplier={orbitSpeedMultiplier}
        guidedTourActive={guidedTourActive}
        onNavigate={handleNavigate}
        onToggleMute={handleToggleMute}
        onChangeOrbitSpeed={setOrbitSpeedMultiplier}
        onRandomPlanet={handleRandomPlanet}
        onOpenStarMap={() => setStarMapOpen(true)}
        onToggleGuidedTour={handleToggleGuidedTour}
        onOpenRandomFact={() =>
          setFactModalIndex(Math.floor(Math.random() * RANDOM_SPACE_FACTS.length))
        }
      />

      {/* Phase 1: Celestial Palace Opening Overlay */}
      <AnimatePresence>
        {phase === 'palace' && sceneReady && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.55 }}
            className="fixed bottom-10 left-0 right-0 z-20 flex flex-col items-center text-center px-6 pointer-events-none"
          >
            <div className="pointer-events-auto max-w-xl px-8 py-6 bg-[#070914]/86 border border-[#e5b869]/35 rounded-lg shadow-2xl">
              <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-[0.18em] text-[#f4f1ea] mb-2">
                LOST IN BRAHMAAND
              </h1>
              <p className="text-sm sm:text-base text-[#cbd5e1] tracking-wide mb-6">
                Your journey beyond Earth begins here.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={handleStartJourney}
                  className="inline-flex items-center gap-2.5 px-7 py-3 text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase text-[#05070e] bg-[#e5b869] hover:bg-[#ffd27d] rounded shadow-[0_0_28px_rgba(229,184,105,0.45)] transition-all cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Journey</span>
                </button>

                <button
                  onClick={() => handleNavigate('solar_system')}
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-xs font-medium tracking-wider uppercase text-[#cbd5e1] hover:text-[#e5b869] border border-white/15 hover:border-[#e5b869]/40 rounded transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Solar System</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Doors Opening Narrative Caption */}
      <AnimatePresence>
        {phase === 'doors_opening' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center px-6"
          >
            <div className="px-6 py-3 bg-[#070914]/88 border border-[#e5b869]/30 rounded-lg">
              <div className="font-display text-sm sm:text-base tracking-[0.18em] text-[#e5b869]">
                ENTERING THE CELESTIAL SANCTUARY
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 3: Spaceship Boarding Scene */}
      <AnimatePresence>
        {phase === 'hangar' && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.45 }}
            className="fixed bottom-9 left-0 right-0 z-20 flex flex-col items-center text-center px-6 pointer-events-none"
          >
            <div className="pointer-events-auto max-w-lg px-8 py-6 bg-[#070914]/88 border border-[#e5b869]/35 rounded-lg shadow-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-wider text-[#f4f1ea] mb-2">
                Welcome, Explorer.
              </h2>
              <p className="text-sm text-[#cbd5e1] mb-5">
                Your spacecraft is ready. Destination: The Solar System.
              </p>
              <button
                onClick={handleEnterSpaceship}
                className="inline-flex items-center gap-2.5 px-7 py-3 text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase text-[#05070e] bg-[#e5b869] hover:bg-[#ffd27d] rounded shadow-[0_0_26px_rgba(229,184,105,0.45)] transition-all cursor-pointer whitespace-nowrap"
              >
                <Rocket className="w-4 h-4" />
                <span>Enter Spaceship</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 4: Cockpit Boarding & Launch Countdown */}
      <AnimatePresence>
        {(phase === 'boarding' || phase === 'launching') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 pointer-events-none flex flex-col items-center justify-between py-20 px-6"
          >
            <div className="px-5 py-2 bg-[#070914]/85 border border-[#5eead4]/35 rounded text-xs font-mono-tabular tracking-[0.2em] uppercase text-[#5eead4]">
              {phase === 'boarding'
                ? 'Flight Deck Sealing · Initializing Plasma Thrusters'
                : launchCountdown !== null && launchCountdown > 0
                ? 'Launch Sequence Active'
                : 'Warp Ascent · Entering Solar System'}
            </div>

            {phase === 'launching' && launchCountdown !== null && (
              <motion.div
                key={launchCountdown}
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.25, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                {launchCountdown > 0 ? (
                  <div className="font-display text-7xl sm:text-8xl font-bold text-[#e5b869] drop-shadow-[0_0_32px_rgba(229,184,105,0.65)]">
                    {launchCountdown}
                  </div>
                ) : (
                  <div className="font-display text-3xl sm:text-5xl font-semibold tracking-[0.22em] text-[#f4f1ea] drop-shadow-[0_0_24px_rgba(94,234,212,0.75)]">
                    IGNITION
                  </div>
                )}
              </motion.div>
            )}

            <div className="text-[11px] font-mono-tabular tracking-widest uppercase text-[#94a3b8]">
              Odyssey-IX · Lost in Brahmaand
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guided Tour Banner */}
      {guidedTourActive && phase === 'planet_explore' && selectedPlanet && (
        <div className="fixed top-[72px] left-4 sm:left-8 z-30 flex items-center gap-3 px-4 py-2 bg-[#080b18]/92 border border-[#e5b869]/40 rounded-lg shadow-xl">
          <Compass className="w-4 h-4 text-[#e5b869]" />
          <span className="text-xs text-[#f4f1ea] whitespace-nowrap">
            Guided Tour · Viewing <strong className="text-[#e5b869]">{selectedPlanet.name}</strong>
          </span>
          <button
            onClick={() => setGuidedTourActive(false)}
            className="text-xs text-[#94a3b8] hover:text-white underline cursor-pointer whitespace-nowrap"
          >
            Exit Tour
          </button>
        </div>
      )}

      {/* Subtle Solar System Exploration Prompt */}
      {phase === 'solar_system' && (
        <div className="fixed top-[72px] left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 text-center">
          <div className="px-4 py-1.5 bg-[#070914]/82 border border-white/10 rounded text-[11px] sm:text-xs text-[#cbd5e1] whitespace-nowrap">
            Drag to orbit · Scroll to zoom · Click any planet, moon, comet, or the Sun to explore
          </div>
        </div>
      )}

      {/* Phase 5: Planet Exploration Dossier Panel */}
      {phase === 'planet_explore' && selectedPlanet && (
        <PlanetInspectorPanel
          planet={selectedPlanet}
          explore3DMode={explore3DMode}
          onToggleExplore3D={setExplore3DMode}
          onBackToSolarSystem={() => {
            setGuidedTourActive(false);
            setExplore3DMode(false);
            setPhase('solar_system');
          }}
          onSelectPlanet={handleSelectPlanet}
        />
      )}

      {/* Phase 6: Astronaut Creator Studio */}
      {phase === 'astronaut_studio' && (
        <AstronautStudio
          studioPlanetId={studioPlanetId}
          onSelectStudioPlanet={setStudioPlanetId}
          onBackToSolarSystem={() => handleNavigate('solar_system')}
        />
      )}

      {/* Phase 7: Missions & Progress View */}
      {phase === 'missions' && (
        <MissionsView
          visitedIds={visitedIds}
          onSelectTarget={handleSelectPlanet}
          onOpenAstronautStudio={() => handleNavigate('astronaut_studio')}
          onBackToSolarSystem={() => handleNavigate('solar_system')}
        />
      )}

      {/* Modals: Star Map & Did You Know? */}
      <StarMapModal
        isOpen={starMapOpen}
        visitedIds={visitedIds}
        selectedPlanetId={selectedPlanetId}
        onSelectPlanet={handleSelectPlanet}
        onClose={() => setStarMapOpen(false)}
      />

      <FactModal
        factIndex={factModalIndex}
        onNextFact={() =>
          setFactModalIndex((prev) =>
            prev === null ? 0 : (prev + 1) % RANDOM_SPACE_FACTS.length
          )
        }
        onClose={() => setFactModalIndex(null)}
      />
    </div>
  );
}
