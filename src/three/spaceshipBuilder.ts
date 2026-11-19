import * as THREE from 'three';
import { createCockpitHudTexture } from './proceduralTextures';

export interface SpaceshipRig {
  group: THREE.Group;
  cockpitCameraAnchor: THREE.Vector3;
  cockpitLookTarget: THREE.Vector3;
  update: (elapsed: number, thrustPower: number) => void;
  dispose: () => void;
}

export function buildSpaceship(maxAnisotropy: number, isSoftwareGl: boolean): SpaceshipRig {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const hullMat = new THREE.MeshPhysicalMaterial({
    color: 0xd8dee9,
    metalness: 0.86,
    roughness: 0.24,
    clearcoat: 0.55,
    clearcoatRoughness: 0.18,
  });

  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x161b2e,
    metalness: 0.65,
    roughness: 0.48,
  });

  const goldAccentMat = new THREE.MeshPhysicalMaterial({
    color: 0xe5b869,
    metalness: 0.95,
    roughness: 0.16,
    anisotropy: 0.75,
  });

  const engineGlowMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x22d3ee,
    emissiveIntensity: 2.5,
    roughness: 0.15,
    metalness: 0.1,
  });

  const plumeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x99d9ff,
    metalness: 0.05,
    roughness: 0.06,
    transmission: isSoftwareGl ? 0 : 0.86,
    transparent: true,
    opacity: isSoftwareGl ? 0.32 : 1,
    ior: 1.52,
    thickness: 0.35,
    clearcoat: 1.0,
    depthWrite: false,
  });

  const hudTex = createCockpitHudTexture(maxAnisotropy);
  const hudMat = new THREE.MeshBasicMaterial({
    map: hudTex,
    toneMapped: false,
  });

  disposables.push(hullMat, darkTrimMat, goldAccentMat, engineGlowMat, plumeMat, glassMat, hudTex, hudMat);

  // 1. Primary Aerodynamic Fuselage (LatheGeometry along Z-axis)
  // Ship faces -Z (nose toward -Z, engines toward +Z)
  const hullPoints = [
    new THREE.Vector2(0.0, 5.2),   // Sharp nose tip (rotated -Z)
    new THREE.Vector2(0.45, 4.1),
    new THREE.Vector2(0.95, 2.5),
    new THREE.Vector2(1.22, 0.8),
    new THREE.Vector2(1.32, -1.2),
    new THREE.Vector2(1.18, -3.2),
    new THREE.Vector2(0.85, -4.1),
    new THREE.Vector2(0.0, -4.1),
  ];
  const hullGeo = new THREE.LatheGeometry(hullPoints, 28);
  hullGeo.rotateX(-Math.PI / 2);
  hullGeo.scale(1.15, 0.72, 1.0);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.set(0, 1.6, 0);
  hull.castShadow = true;
  hull.receiveShadow = true;
  group.add(hull);
  disposables.push(hullGeo);

  // 2. Dorsal Spine & Tail Stabilizer Fin
  const spineShape = new THREE.Shape();
  spineShape.moveTo(-1.2, 0);
  spineShape.lineTo(-3.9, 0);
  spineShape.lineTo(-4.4, 1.65);
  spineShape.lineTo(-3.4, 1.65);
  spineShape.lineTo(-1.2, 0.35);
  spineShape.closePath();

  const spineGeo = new THREE.ExtrudeGeometry(spineShape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 2,
  });
  spineGeo.rotateY(Math.PI / 2);
  const spine = new THREE.Mesh(spineGeo, darkTrimMat);
  spine.position.set(-0.11, 2.25, 0);
  group.add(spine);
  disposables.push(spineGeo);

  // 3. Swept Delta Wings (ExtrudeGeometry with gold leading-edge trim)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0.8, 1.0);
  wingShape.lineTo(5.6, -2.1);
  wingShape.lineTo(5.4, -3.4);
  wingShape.lineTo(0.9, -3.0);
  wingShape.closePath();

  const wingGeo = new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 2,
  });
  wingGeo.rotateX(Math.PI / 2);

  const rightWing = new THREE.Mesh(wingGeo, hullMat);
  rightWing.position.set(0, 1.48, 0);
  rightWing.castShadow = true;
  group.add(rightWing);

  const leftWing = new THREE.Mesh(wingGeo, hullMat);
  leftWing.scale.x = -1;
  leftWing.position.set(0, 1.48, 0);
  leftWing.castShadow = true;
  group.add(leftWing);

  // Golden Wing Tip Rails
  const tipGeo = new THREE.BoxGeometry(0.16, 0.2, 1.8);
  [-5.52, 5.52].forEach((wx) => {
    const tip = new THREE.Mesh(tipGeo, goldAccentMat);
    tip.position.set(wx, 1.42, 2.75);
    group.add(tip);
  });
  disposables.push(wingGeo, tipGeo);

  // 4. Twin Outboard Plasma Engine Nacelles + Pylons + Animated Thruster Plumes
  const nacelleGeo = new THREE.CylinderGeometry(0.46, 0.56, 3.8, 20);
  nacelleGeo.rotateX(Math.PI / 2);
  const nozzleRingGeo = new THREE.TorusGeometry(0.42, 0.08, 12, 24);
  const coreDiskGeo = new THREE.CircleGeometry(0.38, 24);
  const plumeGeo = new THREE.ConeGeometry(0.42, 3.2, 20, 1, true);
  plumeGeo.rotateX(Math.PI / 2);
  plumeGeo.translate(0, 0, 1.6);

  const plumes: THREE.Mesh[] = [];
  const enginePositions = [
    new THREE.Vector3(-2.45, 1.52, 2.2),
    new THREE.Vector3(2.45, 1.52, 2.2),
    new THREE.Vector3(0, 1.6, 4.15), // Center main thruster
  ];

  enginePositions.forEach((pos, idx) => {
    const isMain = idx === 2;
    if (!isMain) {
      const nac = new THREE.Mesh(nacelleGeo, darkTrimMat);
      nac.position.copy(pos);
      nac.castShadow = true;
      group.add(nac);

      const collar = new THREE.Mesh(nozzleRingGeo, goldAccentMat);
      collar.position.set(pos.x, pos.y, pos.z + 1.9);
      group.add(collar);
    } else {
      const collar = new THREE.Mesh(nozzleRingGeo, goldAccentMat);
      collar.scale.setScalar(1.35);
      collar.position.copy(pos);
      group.add(collar);
    }

    const core = new THREE.Mesh(coreDiskGeo, engineGlowMat);
    core.scale.setScalar(isMain ? 1.3 : 1.0);
    core.position.set(pos.x, pos.y, isMain ? pos.z + 0.02 : pos.z + 1.92);
    group.add(core);

    const plume = new THREE.Mesh(plumeGeo, plumeMat);
    plume.scale.setScalar(isMain ? 1.35 : 0.95);
    plume.position.set(pos.x, pos.y, isMain ? pos.z : pos.z + 1.9);
    group.add(plume);
    plumes.push(plume);
  });

  disposables.push(nacelleGeo, nozzleRingGeo, coreDiskGeo, plumeGeo);

  // 5. Interior Cockpit Bay (Seats + Holographic Dashboard + Yoke)
  const cockpitDeckGeo = new THREE.BoxGeometry(1.4, 0.14, 2.3);
  const cockpitDeck = new THREE.Mesh(cockpitDeckGeo, darkTrimMat);
  cockpitDeck.position.set(0, 1.85, -1.5);
  group.add(cockpitDeck);

  // Pilot Seat
  const seatBackGeo = new THREE.BoxGeometry(0.46, 0.72, 0.14);
  const seat = new THREE.Mesh(seatBackGeo, darkTrimMat);
  seat.position.set(0, 2.24, -1.15);
  seat.rotation.x = 0.14;
  group.add(seat);

  // Illuminated Flight Dashboard Screen
  const dashBaseGeo = new THREE.BoxGeometry(1.18, 0.36, 0.38);
  const dashBase = new THREE.Mesh(dashBaseGeo, darkTrimMat);
  dashBase.position.set(0, 2.15, -2.35);
  group.add(dashBase);

  const screenGeo = new THREE.PlaneGeometry(1.06, 0.42);
  const screen = new THREE.Mesh(screenGeo, hudMat);
  screen.position.set(0, 2.34, -2.26);
  screen.rotation.x = -0.45;
  group.add(screen);

  // Golden Steering Yoke
  const yokeGeo = new THREE.TorusGeometry(0.14, 0.022, 8, 20, Math.PI * 1.4);
  const yoke = new THREE.Mesh(yokeGeo, goldAccentMat);
  yoke.position.set(0, 2.22, -1.96);
  yoke.rotation.z = -Math.PI * 0.2;
  group.add(yoke);

  disposables.push(cockpitDeckGeo, seatBackGeo, dashBaseGeo, screenGeo, yokeGeo);

  // 6. Panoramic Glass Cockpit Canopy (renderOrder 2 + depthWrite false)
  const canopyGeo = new THREE.SphereGeometry(0.84, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.55);
  canopyGeo.scale(0.92, 0.78, 2.05);
  const canopy = new THREE.Mesh(canopyGeo, glassMat);
  canopy.position.set(0, 2.18, -1.65);
  canopy.renderOrder = 2;
  group.add(canopy);

  // Canopy Frame Rib
  const ribGeo = new THREE.TorusGeometry(0.76, 0.035, 8, 28, Math.PI);
  const rib = new THREE.Mesh(ribGeo, goldAccentMat);
  rib.position.set(0, 2.18, -1.65);
  rib.scale.set(0.95, 0.82, 1);
  group.add(rib);

  disposables.push(canopyGeo, ribGeo);

  // 7. Grounding Landing Struts (flush with y = 0 hangar deck)
  const strutGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.35, 10);
  const footGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.1, 12);
  const strutCoords = [
    new THREE.Vector3(0, 0.68, -2.8),
    new THREE.Vector3(-1.35, 0.68, 1.6),
    new THREE.Vector3(1.35, 0.68, 1.6),
  ];
  strutCoords.forEach((sc) => {
    const strut = new THREE.Mesh(strutGeo, goldAccentMat);
    strut.position.copy(sc);
    group.add(strut);

    const foot = new THREE.Mesh(footGeo, darkTrimMat);
    foot.position.set(sc.x, 0.05, sc.z);
    group.add(foot);
  });
  disposables.push(strutGeo, footGeo);

  const engineLight = new THREE.PointLight(0x38bdf8, 2.2, 16, 1.6);
  engineLight.position.set(0, 1.5, 4.8);
  group.add(engineLight);

  const cockpitCameraAnchor = new THREE.Vector3(0, 2.48, -1.35);
  const cockpitLookTarget = new THREE.Vector3(0, 2.25, -8.5);

  const update = (elapsed: number, thrustPower: number) => {
    const flicker = 0.92 + Math.sin(elapsed * 28) * 0.08;
    const scaleZ = (0.35 + thrustPower * 2.1) * flicker;
    plumes.forEach((p, i) => {
      const baseScale = i === 2 ? 1.35 : 0.95;
      p.scale.set(baseScale * (0.9 + thrustPower * 0.45), baseScale * (0.9 + thrustPower * 0.45), scaleZ);
    });
    plumeMat.opacity = 0.22 + thrustPower * 0.68;
    engineGlowMat.emissiveIntensity = 1.6 + thrustPower * 3.8;
    engineLight.intensity = 1.5 + thrustPower * 12.0;
  };

  const dispose = () => {
    disposables.forEach((d) => d.dispose());
  };

  return {
    group,
    cockpitCameraAnchor,
    cockpitLookTarget,
    update,
    dispose,
  };
}
