import * as THREE from 'three';
import {
  createPalaceAstrolabeTexture,
  createPalaceMarbleTexture,
} from './proceduralTextures';

export interface PalaceRig {
  group: THREE.Group;
  leftDoorPivot: THREE.Group;
  rightDoorPivot: THREE.Group;
  sanctuaryLight: THREE.PointLight;
  lightBeams: THREE.Mesh[];
  armillaryRings: THREE.Mesh[];
  setDoorOpenAmount: (t: number) => void;
  update: (elapsed: number) => void;
  dispose: () => void;
}

export function buildCelestialPalace(maxAnisotropy: number): PalaceRig {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const marbleTex = createPalaceMarbleTexture(maxAnisotropy);
  const astrolabeTex = createPalaceAstrolabeTexture(maxAnisotropy);
  disposables.push(marbleTex, astrolabeTex);

  const obsidianMat = new THREE.MeshStandardMaterial({
    map: marbleTex,
    color: 0x161a2e,
    roughness: 0.35,
    metalness: 0.25,
  });

  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xe5b869,
    metalness: 0.94,
    roughness: 0.18,
    clearcoat: 0.6,
    clearcoatRoughness: 0.15,
    emissive: 0x3b2608,
    emissiveIntensity: 0.28,
  });

  const glowingGoldMat = new THREE.MeshStandardMaterial({
    color: 0xffdf94,
    emissive: 0xffb84d,
    emissiveIntensity: 1.8,
    roughness: 0.2,
    metalness: 0.5,
  });

  const astrolabeMat = new THREE.MeshStandardMaterial({
    map: astrolabeTex,
    emissiveMap: astrolabeTex,
    emissive: new THREE.Color(0xe5b869),
    emissiveIntensity: 0.55,
    roughness: 0.28,
    metalness: 0.72,
  });

  disposables.push(obsidianMat, goldMat, glowingGoldMat, astrolabeMat);

  // 1. Stepped Celestial Dais Floor (y = 0 is platform deck)
  const lowerStepGeo = new THREE.CylinderGeometry(16, 17.5, 1.2, 48);
  const lowerStep = new THREE.Mesh(lowerStepGeo, obsidianMat);
  lowerStep.position.set(0, -1.1, -6);
  lowerStep.receiveShadow = true;
  group.add(lowerStep);

  const upperDeckGeo = new THREE.CylinderGeometry(13.5, 14.2, 0.7, 48);
  const upperDeck = new THREE.Mesh(upperDeckGeo, obsidianMat);
  upperDeck.position.set(0, -0.35, -6);
  upperDeck.receiveShadow = true;
  group.add(upperDeck);

  // Inlaid Floor Astrolabe Medallion (slightly offset +0.02 to avoid Z-fighting)
  const floorInlayGeo = new THREE.CircleGeometry(6.8, 48);
  const floorInlay = new THREE.Mesh(floorInlayGeo, astrolabeMat);
  floorInlay.rotation.x = -Math.PI / 2;
  floorInlay.position.set(0, 0.02, 4.2);
  group.add(floorInlay);

  // Walkway border rails
  const railGeo = new THREE.BoxGeometry(0.28, 0.16, 11.5);
  [-4.6, 4.6].forEach((x) => {
    const rail = new THREE.Mesh(railGeo, goldMat);
    rail.position.set(x, 0.08, 4.2);
    group.add(rail);
  });

  disposables.push(lowerStepGeo, upperDeckGeo, floorInlayGeo, railGeo);

  // 2. Monumental Twin Flanking Columns + Armillary Spheres
  const colShaftGeo = new THREE.CylinderGeometry(0.88, 1.08, 12.2, 16);
  const colBaseGeo = new THREE.CylinderGeometry(1.35, 1.55, 0.9, 16);
  const colCapGeo = new THREE.CylinderGeometry(1.45, 0.95, 0.85, 16);
  const armillaryGeo = new THREE.TorusGeometry(1.15, 0.06, 12, 40);
  const armillaryRings: THREE.Mesh[] = [];

  [-5.2, 5.2].forEach((x, idx) => {
    const colGroup = new THREE.Group();
    colGroup.position.set(x, 0, 0);

    const base = new THREE.Mesh(colBaseGeo, goldMat);
    base.position.y = 0.45;
    colGroup.add(base);

    const shaft = new THREE.Mesh(colShaftGeo, obsidianMat);
    shaft.position.y = 6.95;
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    colGroup.add(shaft);

    // Glowing gold vertical flute accents
    const fluteGeo = new THREE.BoxGeometry(0.1, 11.4, 0.1);
    disposables.push(fluteGeo);
    for (let f = 0; f < 4; f++) {
      const angle = (f * Math.PI) / 2;
      const flute = new THREE.Mesh(fluteGeo, glowingGoldMat);
      flute.position.set(Math.cos(angle) * 0.96, 6.95, Math.sin(angle) * 0.96);
      colGroup.add(flute);
    }

    const cap = new THREE.Mesh(colCapGeo, goldMat);
    cap.position.y = 13.4;
    colGroup.add(cap);

    // Orbiting Armillary Ring atop each pillar
    const armOuter = new THREE.Mesh(armillaryGeo, goldMat);
    armOuter.position.y = 15.2;
    armOuter.rotation.x = idx === 0 ? 0.5 : -0.5;
    colGroup.add(armOuter);
    armillaryRings.push(armOuter);

    const armInner = new THREE.Mesh(armillaryGeo, glowingGoldMat);
    armInner.scale.setScalar(0.72);
    armInner.position.y = 15.2;
    armInner.rotation.y = 0.8;
    colGroup.add(armInner);
    armillaryRings.push(armInner);

    group.add(colGroup);
  });

  disposables.push(colShaftGeo, colBaseGeo, colCapGeo, armillaryGeo);

  // 3. Grand Arched Pediment & Celestial Crown
  const lintelGeo = new THREE.BoxGeometry(13.6, 1.35, 2.3);
  const lintel = new THREE.Mesh(lintelGeo, obsidianMat);
  lintel.position.set(0, 14.3, 0);
  group.add(lintel);

  const trimBarGeo = new THREE.BoxGeometry(14.0, 0.24, 2.5);
  const trimBottom = new THREE.Mesh(trimBarGeo, goldMat);
  trimBottom.position.set(0, 13.55, 0);
  group.add(trimBottom);

  const trimTop = new THREE.Mesh(trimBarGeo, goldMat);
  trimTop.position.set(0, 15.02, 0);
  group.add(trimTop);

  // Extruded Arch Crest above Lintel
  const archShape = new THREE.Shape();
  archShape.absarc(0, 0, 4.6, 0, Math.PI, false);
  archShape.absarc(0, 0, 3.6, Math.PI, 0, true);
  const archGeo = new THREE.ExtrudeGeometry(archShape, {
    depth: 0.7,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.1,
    bevelSegments: 2,
  });
  archGeo.center();
  const archMesh = new THREE.Mesh(archGeo, goldMat);
  archMesh.position.set(0, 16.5, 0);
  group.add(archMesh);

  // Glowing Constellation Star Nodes along the arch
  const nodeGeo = new THREE.OctahedronGeometry(0.24, 0);
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * Math.PI;
    const node = new THREE.Mesh(nodeGeo, glowingGoldMat);
    node.position.set(Math.cos(a) * 4.1, 14.9 + Math.sin(a) * 4.1, 0.5);
    group.add(node);
  }
  disposables.push(lintelGeo, trimBarGeo, archGeo, nodeGeo);

  // 4. Enormous Twin Palace Doors (split cleanly down center x=0)
  // Door opening spans x: -4.2 to +4.2 (each leaf width = 4.2, height = 13.0)
  const doorWidth = 4.2;
  const doorHeight = 13.0;

  const leftDoorPivot = new THREE.Group();
  leftDoorPivot.position.set(-doorWidth, 0, 0);
  group.add(leftDoorPivot);

  const rightDoorPivot = new THREE.Group();
  rightDoorPivot.position.set(doorWidth, 0, 0);
  group.add(rightDoorPivot);

  const slabGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.65);
  const frameVertGeo = new THREE.BoxGeometry(0.32, doorHeight, 0.82);
  const frameHorizGeo = new THREE.BoxGeometry(doorWidth, 0.36, 0.82);
  const halfMedallionGeo = new THREE.CylinderGeometry(
    2.4,
    2.4,
    0.16,
    32,
    1,
    false,
    0,
    Math.PI
  );
  const runeStripGeo = new THREE.BoxGeometry(0.09, doorHeight - 1.2, 0.72);

  disposables.push(slabGeo, frameVertGeo, frameHorizGeo, halfMedallionGeo, runeStripGeo);

  // Build Left Door Leaf (extends +doorWidth from left hinge)
  {
    const slab = new THREE.Mesh(slabGeo, obsidianMat);
    slab.position.set(doorWidth / 2, doorHeight / 2, 0);
    slab.castShadow = true;
    slab.receiveShadow = true;
    leftDoorPivot.add(slab);

    const outerFrame = new THREE.Mesh(frameVertGeo, goldMat);
    outerFrame.position.set(0.16, doorHeight / 2, 0);
    leftDoorPivot.add(outerFrame);

    const innerFrame = new THREE.Mesh(frameVertGeo, goldMat);
    innerFrame.position.set(doorWidth - 0.16, doorHeight / 2, 0);
    leftDoorPivot.add(innerFrame);

    const topFrame = new THREE.Mesh(frameHorizGeo, goldMat);
    topFrame.position.set(doorWidth / 2, doorHeight - 0.18, 0);
    leftDoorPivot.add(topFrame);

    const botFrame = new THREE.Mesh(frameHorizGeo, goldMat);
    botFrame.position.set(doorWidth / 2, 0.18, 0);
    leftDoorPivot.add(botFrame);

    const rune = new THREE.Mesh(runeStripGeo, glowingGoldMat);
    rune.position.set(doorWidth - 0.5, doorHeight / 2, 0.04);
    leftDoorPivot.add(rune);

    // Left half of central astrolabe disc at seam (x = doorWidth)
    const halfDisc = new THREE.Mesh(halfMedallionGeo, astrolabeMat);
    halfDisc.rotation.z = Math.PI / 2;
    halfDisc.rotation.x = Math.PI / 2;
    halfDisc.position.set(doorWidth, doorHeight * 0.48, 0.36);
    leftDoorPivot.add(halfDisc);
  }

  // Build Right Door Leaf (extends -doorWidth from right hinge)
  {
    const slab = new THREE.Mesh(slabGeo, obsidianMat);
    slab.position.set(-doorWidth / 2, doorHeight / 2, 0);
    slab.castShadow = true;
    slab.receiveShadow = true;
    rightDoorPivot.add(slab);

    const outerFrame = new THREE.Mesh(frameVertGeo, goldMat);
    outerFrame.position.set(-0.16, doorHeight / 2, 0);
    rightDoorPivot.add(outerFrame);

    const innerFrame = new THREE.Mesh(frameVertGeo, goldMat);
    innerFrame.position.set(-doorWidth + 0.16, doorHeight / 2, 0);
    rightDoorPivot.add(innerFrame);

    const topFrame = new THREE.Mesh(frameHorizGeo, goldMat);
    topFrame.position.set(-doorWidth / 2, doorHeight - 0.18, 0);
    rightDoorPivot.add(topFrame);

    const botFrame = new THREE.Mesh(frameHorizGeo, goldMat);
    botFrame.position.set(-doorWidth / 2, 0.18, 0);
    rightDoorPivot.add(botFrame);

    const rune = new THREE.Mesh(runeStripGeo, glowingGoldMat);
    rune.position.set(-doorWidth + 0.5, doorHeight / 2, 0.04);
    rightDoorPivot.add(rune);

    // Right half of central astrolabe disc at seam (x = -doorWidth)
    const halfDisc = new THREE.Mesh(halfMedallionGeo, astrolabeMat);
    halfDisc.rotation.z = -Math.PI / 2;
    halfDisc.rotation.x = Math.PI / 2;
    halfDisc.position.set(-doorWidth, doorHeight * 0.48, 0.36);
    rightDoorPivot.add(halfDisc);
  }

  // 5. Sanctuary Golden Light & Emerging Light Beams behind doors
  const sanctuaryLight = new THREE.PointLight(0xffcb70, 0.5, 45, 1.5);
  sanctuaryLight.position.set(0, 7.5, -5.5);
  group.add(sanctuaryLight);

  const beamGeo = new THREE.ConeGeometry(5.5, 22, 24, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xffd27d,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  disposables.push(beamGeo, beamMat);

  const lightBeams: THREE.Mesh[] = [];
  [-1.2, 0, 1.2].forEach((ox, i) => {
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(ox, 6.2 + i * 0.3, 4.5);
    beam.rotation.x = Math.PI / 2;
    group.add(beam);
    lightBeams.push(beam);
  });

  // 6. Side Sanctuary Walls framing the hangar chamber behind the doors
  const wallGeo = new THREE.BoxGeometry(0.8, 14, 24);
  const leftWall = new THREE.Mesh(wallGeo, obsidianMat);
  leftWall.position.set(-10.5, 6.8, -12.5);
  group.add(leftWall);

  const rightWall = new THREE.Mesh(wallGeo, obsidianMat);
  rightWall.position.set(10.5, 6.8, -12.5);
  group.add(rightWall);

  // Interior Hangar Floor extension
  const hangarFloorGeo = new THREE.BoxGeometry(22, 0.6, 28);
  const hangarFloor = new THREE.Mesh(hangarFloorGeo, obsidianMat);
  hangarFloor.position.set(0, -0.32, -14);
  hangarFloor.receiveShadow = true;
  group.add(hangarFloor);

  // Glowing golden hangar floor guide strips leading toward spaceship
  const guideGeo = new THREE.BoxGeometry(0.18, 0.04, 20);
  [-2.8, 2.8].forEach((gx) => {
    const guide = new THREE.Mesh(guideGeo, glowingGoldMat);
    guide.position.set(gx, 0.02, -12);
    group.add(guide);
  });

  disposables.push(wallGeo, hangarFloorGeo, guideGeo);

  const setDoorOpenAmount = (t: number) => {
    const clamped = THREE.MathUtils.clamp(t, 0, 1);
    // Smooth cubic easing for majestic heavy celestial doors
    const eased = clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
    const angle = eased * (Math.PI * 0.54);
    leftDoorPivot.rotation.y = angle;
    rightDoorPivot.rotation.y = -angle;

    // Golden light emerges from inside as doors part
    sanctuaryLight.intensity = 0.8 + eased * 18.0;
    beamMat.opacity = eased * 0.14;
  };

  const update = (elapsed: number) => {
    armillaryRings.forEach((ring, i) => {
      ring.rotation.y = elapsed * (i % 2 === 0 ? 0.32 : -0.48);
      ring.rotation.z = Math.sin(elapsed * 0.4 + i) * 0.25;
    });
  };

  const dispose = () => {
    disposables.forEach((d) => d.dispose());
  };

  return {
    group,
    leftDoorPivot,
    rightDoorPivot,
    sanctuaryLight,
    lightBeams,
    armillaryRings,
    setDoorOpenAmount,
    update,
    dispose,
  };
}
