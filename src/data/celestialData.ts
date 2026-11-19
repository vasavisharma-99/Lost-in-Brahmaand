export type AppPhase =
  | 'palace'
  | 'doors_opening'
  | 'hangar'
  | 'boarding'
  | 'launching'
  | 'solar_system'
  | 'planet_explore'
  | 'astronaut_studio'
  | 'missions';

export interface CelestialBodyData {
  id: string;
  name: string;
  title: string;
  category: string;
  distanceFromSun: string;
  distanceAU: string;
  diameter: string;
  diameterKm: number;
  moonsCount: number;
  moonsNote?: string;
  orbitalPeriod: string;
  rotationPeriod: string;
  avgTemp: string;
  gravity: string;
  overview: string;
  whatMakesUnique: string;
  deepDive: string;
  didYouKnow: string[];
  // 3D layout properties (visually readable educational scale)
  orbitRadius: number;
  visualRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  axialTiltDeg: number;
  orbitInclinationDeg: number;
  initialAngle: number;
  colorHex: string;
  accentHex: string;
  hasRings?: boolean;
  atmosphereColor?: string;
  parentId?: string; // e.g., 'earth' for Moon
}

export const CELESTIAL_BODIES: CelestialBodyData[] = [
  {
    id: 'sun',
    name: 'The Sun',
    title: 'The Golden Heart',
    category: 'G-Type Main Sequence Star',
    distanceFromSun: '0 km (System Center)',
    distanceAU: '0.00 AU',
    diameter: '1,392,700 km',
    diameterKm: 1392700,
    moonsCount: 0,
    moonsNote: '8 Planets & 5+ Dwarf Planets',
    orbitalPeriod: '230M Earth years (Galactic)',
    rotationPeriod: '25.4 Earth days (equator)',
    avgTemp: '5,500 °C (photosphere)',
    gravity: '274.0 m/s²',
    overview:
      'Containing 99.86% of the entire mass of our solar system, the Sun is a blazing magnetic sphere of hydrogen and helium plasma whose nuclear fusion powers every world in its orbit.',
    whatMakesUnique:
      'Every second, the solar core fuses 600 million metric tons of hydrogen into helium, releasing radiant energy that takes 8 minutes and 20 seconds to reach Earth.',
    deepDive:
      'Differential rotation causes the Sun’s equator to spin faster than its poles, twisting magnetic field lines into solar prominences, sunspots, and colossal coronal mass ejections.',
    didYouKnow: [
      'Roughly 1.3 million Earths could fit inside the volume of the Sun.',
      'Light generated in the Sun’s core takes up to 170,000 years to random-walk to the surface before escaping into space.',
      'The solar corona is mysteriously hundreds of times hotter than the visible photosphere beneath it, reaching over 1 million °C.',
    ],
    orbitRadius: 0,
    visualRadius: 6.2,
    orbitSpeed: 0,
    rotationSpeed: 0.08,
    axialTiltDeg: 7.25,
    orbitInclinationDeg: 0,
    initialAngle: 0,
    colorHex: '#ffb84d',
    accentHex: '#ff6b1a',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    title: 'The Swift Messenger',
    category: 'Terrestrial Planet',
    distanceFromSun: '57.9 million km',
    distanceAU: '0.39 AU',
    diameter: '4,879 km',
    diameterKm: 4879,
    moonsCount: 0,
    orbitalPeriod: '88 Earth days',
    rotationPeriod: '58.6 Earth days',
    avgTemp: '167 °C (-180° to 430°C)',
    gravity: '3.70 m/s²',
    overview:
      'The smallest and innermost planet races around the Sun at 47 km/s across a heavily cratered silicate crust scarred by ancient impacts and towering tectonic cliffs.',
    whatMakesUnique:
      'Mercury possesses an enormous iron core spanning nearly 85% of its radius—proportionally far larger than Earth’s—resulting in extreme density for its modest size.',
    deepDive:
      'Locked in a 3:2 spin-orbit resonance, Mercury rotates three times on its axis for every two orbits around the Sun, creating a solar day that lasts 176 Earth days.',
    didYouKnow: [
      'Despite being closest to the Sun, shadowed polar craters on Mercury preserve ancient water ice.',
      'Standing on Mercury, the Sun would appear more than three times larger than it does from Earth.',
      'Mercury has shrunk by about 7 km in radius as its massive iron core cooled and contracted.',
    ],
    orbitRadius: 12,
    visualRadius: 0.85,
    orbitSpeed: 0.38,
    rotationSpeed: 0.06,
    axialTiltDeg: 0.03,
    orbitInclinationDeg: 3.4,
    initialAngle: 0.9,
    colorHex: '#b4afa8',
    accentHex: '#8d877f',
  },
  {
    id: 'venus',
    name: 'Venus',
    title: 'The Veiled Furnace',
    category: 'Terrestrial Planet',
    distanceFromSun: '108.2 million km',
    distanceAU: '0.72 AU',
    diameter: '12,104 km',
    diameterKm: 12104,
    moonsCount: 0,
    orbitalPeriod: '224.7 Earth days',
    rotationPeriod: '243 Earth days (Retrograde)',
    avgTemp: '464 °C',
    gravity: '8.87 m/s²',
    overview:
      'Shrouded in golden clouds of sulfuric acid and crushed under a carbon dioxide atmosphere 92 times denser than Earth’s, Venus is the hottest planet in the solar system.',
    whatMakesUnique:
      'Venus spins backward relative to almost every other planet, meaning the Sun rises in the west and sets in the east—and one Venusian day is longer than its year.',
    deepDive:
      'Its runaway greenhouse effect traps thermal radiation beneath thick cloud decks, while volcanic plains and pancake domes cover more than 80% of the surface.',
    didYouKnow: [
      'At roughly 50 km above the scorching Venusian surface, temperatures and air pressures closely match Earth’s sea level.',
      'Venus is the brightest natural object in Earth’s night sky after the Moon, often casting faint shadows.',
      'A day from sunrise to sunrise on Venus takes 116.75 Earth days due to its backward rotation.',
    ],
    orbitRadius: 17.5,
    visualRadius: 1.38,
    orbitSpeed: 0.27,
    rotationSpeed: -0.04,
    axialTiltDeg: 177.3,
    orbitInclinationDeg: 1.8,
    initialAngle: 2.4,
    colorHex: '#e6be7e',
    accentHex: '#c98a3b',
    atmosphereColor: '#ffd79a',
  },
  {
    id: 'earth',
    name: 'Earth',
    title: 'The Pale Blue Oasis',
    category: 'Terrestrial Planet',
    distanceFromSun: '149.6 million km',
    distanceAU: '1.00 AU',
    diameter: '12,742 km',
    diameterKm: 12742,
    moonsCount: 1,
    orbitalPeriod: '365.25 days',
    rotationPeriod: '23h 56m 4s',
    avgTemp: '15 °C',
    gravity: '9.81 m/s²',
    overview:
      'Our home world is the only known harbor of life in the cosmos, balancing liquid surface oceans, active plate tectonics, and a protective nitrogen-oxygen magnetosphere.',
    whatMakesUnique:
      'Earth sits squarely inside the Sun’s habitable zone while its unusually large Moon stabilizes our 23.4° axial tilt, keeping global climates steady over geological eons.',
    deepDive:
      '71% of Earth’s crust is blanketed by liquid water oceans that regulate planetary temperature, while molten iron convection generates a magnetic shield against solar wind.',
    didYouKnow: [
      'Earth travels through space at 107,000 km/h around the Sun while spinning at 1,670 km/h at the equator.',
      'Our atmosphere scatters short blue wavelengths of sunlight via Rayleigh scattering, giving Earth its cobalt glow.',
      'More than 80% of Earth’s ocean floor remains mapped in less detail than the surface of Mars.',
    ],
    orbitRadius: 24.5,
    visualRadius: 1.5,
    orbitSpeed: 0.21,
    rotationSpeed: 0.45,
    axialTiltDeg: 23.44,
    orbitInclinationDeg: 0,
    initialAngle: 4.1,
    colorHex: '#3b82f6',
    accentHex: '#34d399',
    atmosphereColor: '#60a5fa',
  },
  {
    id: 'moon',
    name: 'The Moon',
    title: 'Luna, Earth’s Sentinel',
    category: 'Natural Satellite',
    distanceFromSun: '149.6M km (384,400 km from Earth)',
    distanceAU: '1.00 AU',
    diameter: '3,474 km',
    diameterKm: 3474,
    moonsCount: 0,
    orbitalPeriod: '27.3 Earth days (around Earth)',
    rotationPeriod: '27.3 Earth days (Tidally locked)',
    avgTemp: '-23 °C (-173° to 127°C)',
    gravity: '1.62 m/s²',
    overview:
      'Born from a colossal ancient collision between proto-Earth and a Mars-sized body, Luna illuminates our nights and sculpts Earth’s ocean tides through gravitational pull.',
    whatMakesUnique:
      'The Moon’s dark basaltic plains (maria) and bright highlands preserve an unbroken 4.5-billion-year archive of early solar system bombardment.',
    deepDive:
      'Because its rotation period matches its orbital period around Earth, we always observe the near side, while laser reflectors left by Apollo missions reveal it drifts away by 3.8 cm every year.',
    didYouKnow: [
      'The Moon is the fifth-largest natural satellite in the solar system and the largest relative to its host planet.',
      'Footprints left in lunar regolith could endure for millions of years because there is no wind or rain.',
      'The Moon’s south pole contains permanently shadowed craters holding rich reserves of water ice.',
    ],
    orbitRadius: 3.1,
    visualRadius: 0.42,
    orbitSpeed: 1.25,
    rotationSpeed: 0.12,
    axialTiltDeg: 6.68,
    orbitInclinationDeg: 5.1,
    initialAngle: 0.5,
    colorHex: '#cbd5e1',
    accentHex: '#94a3b8',
    parentId: 'earth',
  },
  {
    id: 'mars',
    name: 'Mars',
    title: 'The Red Frontier',
    category: 'Terrestrial Planet',
    distanceFromSun: '227.9 million km',
    distanceAU: '1.52 AU',
    diameter: '6,779 km',
    diameterKm: 6779,
    moonsCount: 2,
    moonsNote: 'Phobos & Deimos',
    orbitalPeriod: '687 Earth days',
    rotationPeriod: '24h 37m',
    avgTemp: '-65 °C',
    gravity: '3.72 m/s²',
    overview:
      'Rust-red iron oxide dust blankets a cold desert world crowned by the solar system’s tallest volcano, deepest canyon system, and ancient river deltas that once flowed with liquid water.',
    whatMakesUnique:
      'Olympus Mons rises nearly 22 km high—almost three times taller than Mount Everest—while Valles Marineris stretches over 4,000 km across the Martian equator.',
    deepDive:
      'With a day length almost identical to Earth’s and seasonal polar ice caps of frozen water and carbon dioxide, Mars remains humanity’s foremost candidate for off-world exploration.',
    didYouKnow: [
      'Sunsets on Mars appear cool blue rather than red because fine Martian dust scatters red light at wide angles.',
      'Phobos orbits Mars so closely that it rises in the west and sets in the east twice every Martian day.',
      'On Mars, you could jump nearly three times higher than on Earth thanks to 38% surface gravity.',
    ],
    orbitRadius: 32,
    visualRadius: 1.12,
    orbitSpeed: 0.16,
    rotationSpeed: 0.42,
    axialTiltDeg: 25.19,
    orbitInclinationDeg: 1.85,
    initialAngle: 5.4,
    colorHex: '#d96b43',
    accentHex: '#a83c1c',
    atmosphereColor: '#f59e7a',
  },
  {
    id: 'ceres',
    name: 'Ceres & Asteroid Belt',
    title: 'Queen of the Asteroid Belt',
    category: 'Dwarf Planet · Main Belt',
    distanceFromSun: '414 million km',
    distanceAU: '2.77 AU',
    diameter: '939 km (Ceres)',
    diameterKm: 939,
    moonsCount: 0,
    orbitalPeriod: '4.6 Earth years',
    rotationPeriod: '9h 4m',
    avgTemp: '-105 °C',
    gravity: '0.28 m/s²',
    overview:
      'Orbiting between Mars and Jupiter, the Main Asteroid Belt holds over a million rocky and metallic remnants from the birth of the solar system, anchored by the dwarf planet Ceres.',
    whatMakesUnique:
      'Ceres holds roughly one-third of the entire mass of the Asteroid Belt and features bright sodium carbonate salt deposits left behind by subsurface briny cryo-volcanism.',
    deepDive:
      'Contrary to sci-fi depictions, asteroids in the belt are spaced hundreds of thousands of kilometers apart—spacecraft pass through routinely without collision.',
    didYouKnow: [
      'Ceres was the very first object discovered in the Asteroid Belt, spotted in 1801 by Giuseppe Piazzi.',
      'Despite containing millions of objects, the total mass of the entire Asteroid Belt is only about 3% of Earth’s Moon.',
      'Metallic asteroids like 16 Psyche may be the exposed iron-nickel cores of shattered protoplanets.',
    ],
    orbitRadius: 40,
    visualRadius: 0.62,
    orbitSpeed: 0.11,
    rotationSpeed: 0.55,
    axialTiltDeg: 4.0,
    orbitInclinationDeg: 10.6,
    initialAngle: 1.7,
    colorHex: '#94a3b8',
    accentHex: '#cbd5e1',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    title: 'King of the Worlds',
    category: 'Gas Giant',
    distanceFromSun: '778.5 million km',
    distanceAU: '5.20 AU',
    diameter: '139,820 km',
    diameterKm: 139820,
    moonsCount: 95,
    moonsNote: '95 confirmed (Io, Europa, Ganymede, Callisto...)',
    orbitalPeriod: '11.86 Earth years',
    rotationPeriod: '9h 55m',
    avgTemp: '-110 °C (cloud tops)',
    gravity: '24.79 m/s²',
    overview:
      'More massive than all other planets combined by a factor of two and a half, Jupiter is a colossal swirling tempest of hydrogen and helium sculpted by supersonic jet streams.',
    whatMakesUnique:
      'The Great Red Spot is a high-pressure anticyclonic storm wider than Earth that has raged continuously for more than 300 years, alongside a vast ocean of liquid metallic hydrogen deep inside.',
    deepDive:
      'Jupiter’s rapid 10-hour spin flattens its poles and drives alternating white ammonia zones and rust-colored belts, while its Galilean moons form a miniature planetary system.',
    didYouKnow: [
      'Jupiter’s moon Ganymede is larger than the planet Mercury and is the only moon with its own magnetic field.',
      'Beneath Europa’s fractured ice shell lies a global salty ocean containing twice as much water as all of Earth’s oceans.',
      'Jupiter acts as a cosmic shield, deflecting or capturing comets that might otherwise strike the inner planets.',
    ],
    orbitRadius: 52,
    visualRadius: 3.35,
    orbitSpeed: 0.082,
    rotationSpeed: 0.78,
    axialTiltDeg: 3.13,
    orbitInclinationDeg: 1.3,
    initialAngle: 0.4,
    colorHex: '#d8b384',
    accentHex: '#c45b3b',
    atmosphereColor: '#f3cfa4',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    title: 'The Ringed Giant',
    category: 'Gas Giant',
    distanceFromSun: '1.43 billion km',
    distanceAU: '9.58 AU',
    diameter: '116,460 km',
    diameterKm: 116460,
    moonsCount: 146,
    moonsNote: '146 confirmed (Titan, Enceladus, Rhea...)',
    orbitalPeriod: '29.45 Earth years',
    rotationPeriod: '10h 33m',
    avgTemp: '-140 °C',
    gravity: '10.44 m/s²',
    overview:
      'Adorned by the most dazzling ring architecture in the solar system, Saturn is a golden gas giant whose icy rings span over 282,000 kilometers yet average mere tens of meters thick.',
    whatMakesUnique:
      'Saturn is the only planet less dense than liquid water (0.687 g/cm³), and its north pole hosts a bizarre, persistent 30,000 km hexagonal jet-stream vortex.',
    deepDive:
      'Its rings consist of billions of gleaming water-ice and dust fragments sculpted into crisp concentric bands and the sweeping Cassini Division by shepherd moons.',
    didYouKnow: [
      'Saturn currently holds the solar system record with 146 confirmed moons, including Titan with its liquid methane lakes.',
      'Enceladus vents towering geysers of water vapor from a warm subsurface ocean directly into Saturn’s E ring.',
      'Saturn’s rings are geologically young—likely only 100 to 400 million years old—and are slowly raining into the planet.',
    ],
    orbitRadius: 68,
    visualRadius: 2.8,
    orbitSpeed: 0.058,
    rotationSpeed: 0.72,
    axialTiltDeg: 26.73,
    orbitInclinationDeg: 2.48,
    initialAngle: 2.85,
    colorHex: '#e6cc8f',
    accentHex: '#b89452',
    hasRings: true,
    atmosphereColor: '#fde6b4',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    title: 'The Tilted Ice Giant',
    category: 'Ice Giant',
    distanceFromSun: '2.87 billion km',
    distanceAU: '19.20 AU',
    diameter: '50,724 km',
    diameterKm: 50724,
    moonsCount: 28,
    moonsNote: '28 confirmed (Miranda, Ariel, Titania...)',
    orbitalPeriod: '84 Earth years',
    rotationPeriod: '17h 14m (Retrograde)',
    avgTemp: '-195 °C',
    gravity: '8.69 m/s²',
    overview:
      'Glowing a serene pale aquamarine due to atmospheric methane absorbing red sunlight, Uranus rolls along its orbital path on its side with an extreme 98-degree axial tilt.',
    whatMakesUnique:
      'Likely knocked sideways by a protoplanetary collision early in its history, Uranus experiences 42-year-long polar summers followed by 42 years of polar winter darkness.',
    deepDive:
      'Beneath its frigid hydrogen-helium outer haze lies a supercritical mantle of hot, dense water, ammonia, and methane “ices,” encircled by 13 narrow dark rings.',
    didYouKnow: [
      'Uranus holds the coldest minimum planetary temperature recorded in the solar system: -224 °C.',
      'All of Uranus’s moons are named after characters from William Shakespeare and Alexander Pope.',
      'Because of its extreme tilt, Uranus’s faint rings appear nearly vertical from Earth.',
    ],
    orbitRadius: 83,
    visualRadius: 1.95,
    orbitSpeed: 0.04,
    rotationSpeed: -0.5,
    axialTiltDeg: 97.77,
    orbitInclinationDeg: 0.77,
    initialAngle: 4.9,
    colorHex: '#7dd3fc',
    accentHex: '#38bdf8',
    hasRings: true,
    atmosphereColor: '#a5f3fc',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    title: 'The Supersonic Deep',
    category: 'Ice Giant',
    distanceFromSun: '4.50 billion km',
    distanceAU: '30.05 AU',
    diameter: '49,244 km',
    diameterKm: 49244,
    moonsCount: 16,
    moonsNote: '16 confirmed (Triton, Proteus...)',
    orbitalPeriod: '164.8 Earth years',
    rotationPeriod: '16h 6m',
    avgTemp: '-200 °C',
    gravity: '11.15 m/s²',
    overview:
      'The outermost major planet is a cobalt-blue ice giant swept by the fastest supersonic winds in the solar system, howling up to 2,100 kilometers per hour.',
    whatMakesUnique:
      'Neptune was the first planet discovered through pure mathematics rather than sky-sweeping—predicted from gravitational tugs on Uranus before ever being seen in a telescope.',
    deepDive:
      'Driven by internal heat radiating 2.6 times more energy than it receives from the distant Sun, Neptune churns bright white methane cirrus clouds above deep azure storms.',
    didYouKnow: [
      'Neptune completed its very first full orbit since its 1846 discovery in July 2011.',
      'Its largest moon Triton orbits backward and erupts nitrogen-ice geysers 8 km high.',
      'Deep inside Neptune and Uranus, extreme pressures may compress carbon into sparkling diamond rain.',
    ],
    orbitRadius: 96,
    visualRadius: 1.9,
    orbitSpeed: 0.028,
    rotationSpeed: 0.52,
    axialTiltDeg: 28.32,
    orbitInclinationDeg: 1.77,
    initialAngle: 1.15,
    colorHex: '#3b66f5',
    accentHex: '#60a5fa',
    atmosphereColor: '#638cff',
  },
  {
    id: 'pluto',
    name: 'Pluto',
    title: 'Heart of the Kuiper Belt',
    category: 'Dwarf Planet',
    distanceFromSun: '5.91 billion km (avg)',
    distanceAU: '39.48 AU',
    diameter: '2,377 km',
    diameterKm: 2377,
    moonsCount: 5,
    moonsNote: '5 moons (Charon, Styx, Nix, Kerberos, Hydra)',
    orbitalPeriod: '248 Earth years',
    rotationPeriod: '6.39 Earth days (Retrograde)',
    avgTemp: '-229 °C',
    gravity: '0.62 m/s²',
    overview:
      'Far out in the icy Kuiper Belt, Pluto is a geologically active dwarf planet marked by towering water-ice mountains and a vast heart-shaped nitrogen glacier named Tombaugh Regio.',
    whatMakesUnique:
      'Pluto and its largest moon Charon are so close in size that they orbit a shared center of gravity in empty space between them, locked face-to-face forever.',
    deepDive:
      'Its elongated, 17-degree tilted orbit periodically brings Pluto slightly closer to the Sun than Neptune, briefly vaporizing surface ices into a delicate hazy blue atmosphere.',
    didYouKnow: [
      'Pluto’s surface area is slightly smaller than Russia, and its iconic glacier "Heart" spans over 1,600 km.',
      'From Pluto, the Sun appears as an intensely bright star—about 1,500 times dimmer than on Earth.',
      'New Horizons revealed crisp nitrogen ice convection polygons renewing Pluto’s surface right now.',
    ],
    orbitRadius: 110,
    visualRadius: 0.72,
    orbitSpeed: 0.019,
    rotationSpeed: -0.18,
    axialTiltDeg: 122.5,
    orbitInclinationDeg: 11.5,
    initialAngle: 3.6,
    colorHex: '#d4b89c',
    accentHex: '#9c785c',
    atmosphereColor: '#bae6fd',
  },
  {
    id: 'comet',
    name: "Halley's Comet",
    title: 'Wanderer of the Deep',
    category: 'Periodic Comet',
    distanceFromSun: '88M – 5.2B km (Elliptical)',
    distanceAU: '0.59 – 35.1 AU',
    diameter: '11 km nucleus (100,000+ km coma)',
    diameterKm: 11,
    moonsCount: 0,
    orbitalPeriod: '75–76 Earth years',
    rotationPeriod: '2.2 Earth days',
    avgTemp: '-200 °C to +80 °C near Sun',
    gravity: '0.0005 m/s²',
    overview:
      'A primordial time capsule of frozen water, carbon monoxide, and cosmic dust that awakens whenever its elongated orbit sweeps near the Sun, unfurling twin tails of gas and gleaming dust.',
    whatMakesUnique:
      'A comet’s tail never trails behind its direction of motion—instead, solar radiation pressure and solar wind always sweep its glowing tail directly away from the Sun.',
    deepDive:
      'Recorded by astronomers since 240 BCE, Halley’s Comet loses several meters of ice every inner-system pass and produces Earth’s annual Orionid and Eta Aquariid meteor showers.',
    didYouKnow: [
      'Halley’s Comet is expected to return to the inner solar system and shine brightly in Earth’s sky in July 2061.',
      'Its solid nucleus is darker than coal, reflecting only 4% of the sunlight that hits it.',
      'The Giotto spacecraft photographed dark organic jets erupting from Halley’s sunlit side in 1986.',
    ],
    orbitRadius: 75,
    visualRadius: 0.58,
    orbitSpeed: 0.095,
    rotationSpeed: 0.4,
    axialTiltDeg: 18,
    orbitInclinationDeg: 16,
    initialAngle: 5.1,
    colorHex: '#93c5fd',
    accentHex: '#38bdf8',
  },
];

export interface SpaceMission {
  id: string;
  name: string;
  targetId: string;
  targetName: string;
  agency: string;
  year: string;
  objective: string;
  milestone: string;
}

export const SPACE_MISSIONS: SpaceMission[] = [
  {
    id: 'parker',
    name: 'Parker Solar Probe',
    targetId: 'sun',
    targetName: 'The Sun',
    agency: 'NASA',
    year: '2018 – Active',
    objective: 'Touch the solar corona to trace how heat and solar wind accelerate.',
    milestone: 'Fastest human-made object in history at 692,000 km/h.',
  },
  {
    id: 'messenger',
    name: 'BepiColombo',
    targetId: 'mercury',
    targetName: 'Mercury',
    agency: 'ESA / JAXA',
    year: '2018 – 2026',
    objective: 'Map Mercury’s iron-rich interior, exosphere, and polar water ice.',
    milestone: 'Dual-orbiter mission completing six gravity-assist flybys.',
  },
  {
    id: 'apollo11',
    name: 'Artemis & Apollo Legacy',
    targetId: 'moon',
    targetName: 'The Moon',
    agency: 'NASA & International Partners',
    year: '1969 – Ongoing',
    objective: 'Establish sustainable lunar south-pole exploration near ice reserves.',
    milestone: 'First human footprints beyond Earth and lunar laser ranging.',
  },
  {
    id: 'perseverance',
    name: 'Mars Perseverance',
    targetId: 'mars',
    targetName: 'Mars',
    agency: 'NASA / JPL',
    year: '2021 – Active',
    objective: 'Explore Jezero Crater’s ancient river delta for biosignatures.',
    milestone: 'Achieved first powered flight on another planet with Ingenuity.',
  },
  {
    id: 'europa-clipper',
    name: 'Europa Clipper',
    targetId: 'jupiter',
    targetName: 'Jupiter',
    agency: 'NASA',
    year: '2024 – En Route',
    objective: 'Survey Europa’s global subsurface ocean beneath its icy crust.',
    milestone: '49 close flybys using ice-penetrating radar and magnetometers.',
  },
  {
    id: 'cassini',
    name: 'Cassini-Huygens',
    targetId: 'saturn',
    targetName: 'Saturn',
    agency: 'NASA / ESA / ASI',
    year: '1997 – 2017',
    objective: 'Study Saturn’s rings, magnetosphere, Titan, and Enceladus plumes.',
    milestone: 'Delivered the Huygens lander onto Titan’s methane-rich surface.',
  },
  {
    id: 'voyager2',
    name: 'Voyager 2 Grand Tour',
    targetId: 'neptune',
    targetName: 'Neptune & Uranus',
    agency: 'NASA / JPL',
    year: '1977 – Interstellar',
    objective: 'Only spacecraft in history to visit both ice giants up close.',
    milestone: 'Discovered Triton’s active nitrogen geysers and Uranus’s rings.',
  },
  {
    id: 'newhorizons',
    name: 'New Horizons',
    targetId: 'pluto',
    targetName: 'Pluto',
    agency: 'NASA / JHUAPL',
    year: '2006 – Kuiper Belt',
    objective: 'Reveal the geology and atmosphere of Pluto and Kuiper objects.',
    milestone: 'Captured the iconic nitrogen-ice Heart of Pluto in 2015.',
  },
];

export const RANDOM_SPACE_FACTS: string[] = [
  'One full day on Venus (243 Earth days) takes longer than a full Venusian year (225 Earth days).',
  'Saturn has a lower average density than liquid water—just 0.687 grams per cubic centimeter.',
  'Neutron stars can spin up to 716 times per second while packing more mass than the Sun into a city-sized sphere.',
  'Sunlight takes 8 minutes and 20 seconds to reach Earth, and over 5.5 hours to reach Pluto.',
  'Jupiter’s magnetic field is nearly 20,000 times stronger than Earth’s, generating auroras larger than our entire planet.',
  'On Mars, Olympus Mons stands 21.9 km high—nearly three times the altitude of Mount Everest.',
  'Earth’s Moon is drifting away from us at roughly 3.8 centimeters per year—about the rate fingernails grow.',
  'If you could drive a car straight up to Neptune at 100 km/h, the trip would take more than 5,100 years.',
  'Enceladus, a small icy moon of Saturn, jets plumes of warm liquid water 250 km into space.',
  'The Kuiper Belt beyond Neptune contains trillions of icy remnants dating back 4.6 billion years.',
];

export interface SuitStyleOption {
  id: 'aegis-gold' | 'vanguard-obsidian' | 'nebula-cobalt' | 'solaris-ivory';
  name: string;
  primary: string;
  secondary: string;
  trim: string;
  visorTint: string;
}

export const SUIT_STYLES: SuitStyleOption[] = [
  {
    id: 'aegis-gold',
    name: 'Aegis Gold',
    primary: '#e8e4da',
    secondary: '#262b3d',
    trim: '#e5b869',
    visorTint: 'rgba(229, 184, 105, 0.22)',
  },
  {
    id: 'vanguard-obsidian',
    name: 'Vanguard Obsidian',
    primary: '#181c2c',
    secondary: '#0d101b',
    trim: '#5eead4',
    visorTint: 'rgba(94, 234, 212, 0.2)',
  },
  {
    id: 'nebula-cobalt',
    name: 'Nebula Cobalt',
    primary: '#1e2f5c',
    secondary: '#121b38',
    trim: '#fbbf24',
    visorTint: 'rgba(96, 165, 250, 0.24)',
  },
  {
    id: 'solaris-ivory',
    name: 'Solaris Ivory',
    primary: '#f4efe6',
    secondary: '#3c2e28',
    trim: '#f97316',
    visorTint: 'rgba(249, 115, 22, 0.2)',
  },
];

export const CALLSIGN_PRESETS = [
  'ASTRA-07',
  'NOVA-IX',
  'ORION-V',
  'HELIO-12',
  'LYRA-04',
  'VEGA-88',
];

export const ASTRONAUT_MISSIONS = [
  'Saturn Ring Reconnaissance',
  'Europa Subsurface Survey',
  'Martian Meridian Expedition',
  'Kuiper Horizon Watch',
  'Solar Corona Telemetry',
  'Lunar South Pole Outpost',
];
