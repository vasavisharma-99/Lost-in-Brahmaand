import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { AppPhase, CELESTIAL_BODIES, CelestialBodyData } from '../data/celestialData';
import { buildCelestialPalace, PalaceRig } from '../three/palaceBuilder';
import { buildSpaceship, SpaceshipRig } from '../three/spaceshipBuilder';
import { buildSolarSystem, SolarSystemRig } from '../three/solarSystemBuilder';
import { cosmicAudio } from '../audio/cosmicAudio';

interface CosmicViewportProps {
  phase: AppPhase;
  selectedPlanetId: string | null;
  studioPlanetId: string;
  explore3DMode: boolean;
  orbitSpeedMultiplier: number;
  launchCountdown: number | null;
  onSelectPlanet: (id: string) => void;
  onPhaseAutoAdvance: (nextPhase: AppPhase) => void;
  onCountdownTick: (val: number | null) => void;
  onSceneReady: () => void;
}

// Pre-allocated scratch math objects (zero GC in animation loop)
const _camTargetPos = new THREE.Vector3();
const _lookTargetPos = new THREE.Vector3();
const _planetWorldPos = new THREE.Vector3();
const _prevPlanetWorldPos = new THREE.Vector3();
const _planetDelta = new THREE.Vector3();
const _projVec = new THREE.Vector3();
const _pointerVec = new THREE.Vector2();

function detectSoftwareWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const CosmicViewport: React.FC<CosmicViewportProps> = ({
  phase,
  selectedPlanetId,
  studioPlanetId,
  explore3DMode,
  orbitSpeedMultiplier,
  onSelectPlanet,
  onPhaseAutoAdvance,
  onCountdownTick,
  onSceneReady,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{
    id: string;
    name: string;
    category: string;
    x: number;
    y: number;
  } | null>(null);

  // Latest React state mirrored into refs so the WebGL loop never tears down
  const stateRef = useRef({
    phase,
    selectedPlanetId,
    studioPlanetId,
    explore3DMode,
    orbitSpeedMultiplier,
  });
  stateRef.current = {
    phase,
    selectedPlanetId,
    studioPlanetId,
    explore3DMode,
    orbitSpeedMultiplier,
  };

  const callbacksRef = useRef({
    onSelectPlanet,
    onPhaseAutoAdvance,
    onCountdownTick,
    onSceneReady,
  });
  callbacksRef.current = {
    onSelectPlanet,
    onPhaseAutoAdvance,
    onCountdownTick,
    onSceneReady,
  };

  // Phase transition tracking inside WebGL loop
  const animStateRef = useRef({
    lastPhase: phase,
    phaseTimer: 0,
    cameraFlying: false,
    lastSelectedId: selectedPlanetId,
    lastStudioId: studioPlanetId,
    lastExplore3D: explore3DMode,
    trackingPlanetId: null as string | null,
    hasPrevPlanetPos: false,
    countdownStage: -1,
  });

  useEffect(() => {
    const prev = animStateRef.current.lastPhase;
    if (prev !== phase) {
      animStateRef.current.lastPhase = phase;
      animStateRef.current.phaseTimer = 0;
      animStateRef.current.cameraFlying = true;
      animStateRef.current.countdownStage = -1;
      if (phase !== 'planet_explore' && phase !== 'astronaut_studio') {
        animStateRef.current.trackingPlanetId = null;
        animStateRef.current.hasPrevPlanetPos = false;
      }
    }
    if (animStateRef.current.lastSelectedId !== selectedPlanetId) {
      animStateRef.current.lastSelectedId = selectedPlanetId;
      animStateRef.current.cameraFlying = true;
      animStateRef.current.trackingPlanetId = selectedPlanetId;
      animStateRef.current.hasPrevPlanetPos = false;
    }
    if (animStateRef.current.lastStudioId !== studioPlanetId) {
      animStateRef.current.lastStudioId = studioPlanetId;
      if (phase === 'astronaut_studio') {
        animStateRef.current.cameraFlying = true;
        animStateRef.current.trackingPlanetId = studioPlanetId;
        animStateRef.current.hasPrevPlanetPos = false;
      }
    }
    if (animStateRef.current.lastExplore3D !== explore3DMode) {
      animStateRef.current.lastExplore3D = explore3DMode;
      animStateRef.current.cameraFlying = true;
    }
  }, [phase, selectedPlanetId, studioPlanetId, explore3DMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError('WebGL rendering is unavailable in this browser environment.');
      callbacksRef.current.onSceneReady();
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError('3D graphics context was interrupted. Attempting recovery...');
    };
    const onContextRestored = () => {
      setWebglError(null);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04060d);
    scene.fog = new THREE.FogExp2(0x04060d, 0.00085);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1400);
    camera.position.set(0, 6.8, 22);

    // Mandatory RoomEnvironment + PMREMGenerator for PBR metallic/glass reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Warm Key + Cool Hemisphere Fill + Rim Light
    const hemiLight = new THREE.HemisphereLight(0x8fa8ff, 0x1e1326, 0.55);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe6ba, 1.35);
    keyLight.position.set(16, 26, 18);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 2;
      keyLight.shadow.camera.far = 70;
      const d = 22;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // Build Modular 3D Worlds
    // 1. Palace + Spaceship located in an elevated Sanctuary Sector at (0, 260, 0)
    //    so it never collides with the Solar System at (0, 0, 0), while sharing stars & nebula dome!
    const sanctuaryGroup = new THREE.Group();
    sanctuaryGroup.position.set(0, 260, 0);
    scene.add(sanctuaryGroup);

    const palace: PalaceRig = buildCelestialPalace(maxAnisotropy);
    sanctuaryGroup.add(palace.group);

    const spaceship: SpaceshipRig = buildSpaceship(maxAnisotropy, isSoftwareGl);
    spaceship.group.position.set(0, 0, -14.5);
    sanctuaryGroup.add(spaceship.group);

    // 2. Solar System centered at (0, 0, 0)
    const solarSystem: SolarSystemRig = buildSolarSystem(maxAnisotropy);
    scene.add(solarSystem.group);

    // 3. Warp Star Streaks (InstancedMesh visible during launch & warp transition)
    const streakCount = 160;
    const streakGeo = new THREE.CylinderGeometry(0.025, 0.025, 4.5, 6);
    streakGeo.rotateX(Math.PI / 2);
    const streakMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const warpStreaks = new THREE.InstancedMesh(streakGeo, streakMat, streakCount);
    const streakDummy = new THREE.Object3D();
    const streakSeeds: Array<{ x: number; y: number; z: number; speed: number }> = [];
    for (let i = 0; i < streakCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 2.5 + Math.random() * 16;
      const z = -60 + Math.random() * 80;
      streakSeeds.push({
        x: Math.cos(ang) * rad,
        y: Math.sin(ang) * rad,
        z,
        speed: 55 + Math.random() * 45,
      });
      streakDummy.position.set(Math.cos(ang) * rad, Math.sin(ang) * rad, z);
      streakDummy.updateMatrix();
      warpStreaks.setMatrixAt(i, streakDummy.matrix);
    }
    warpStreaks.instanceMatrix.needsUpdate = true;
    warpStreaks.frustumCulled = false;
    camera.add(warpStreaks);
    scene.add(camera);

    // OrbitControls setup
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.0;
    controls.maxDistance = 280;
    controls.target.set(0, 267.2, 0);

    controls.addEventListener('start', () => {
      // Cancel scripted fly-in when user manually orbits so controls never fight user input
      const ph = stateRef.current.phase;
      if (ph === 'solar_system' || ph === 'planet_explore' || ph === 'hangar') {
        animStateRef.current.cameraFlying = false;
      }
    });

    // Initial camera pose for Palace
    camera.position.set(0, 266.8, 22);
    controls.target.set(0, 267.2, 0);
    controls.update();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    callbacksRef.current.onSceneReady();

    // Raycasting for Planet Hover & Selection
    const raycaster = new THREE.Raycaster();
    let lastMoveCheck = 0;
    let pointerDownPos = { x: 0, y: 0 };
    let hoveredBodyId: string | null = null;

    const updatePointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      _pointerVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _pointerVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (e: PointerEvent) => {
      const ph = stateRef.current.phase;
      if (ph !== 'solar_system' && ph !== 'planet_explore') {
        if (hoveredBodyId !== null) {
          hoveredBodyId = null;
          solarSystem.setHoveredId(null);
          setHoverInfo(null);
          canvas.style.cursor = 'default';
        }
        return;
      }

      const now = performance.now();
      if (now - lastMoveCheck < 45) return;
      lastMoveCheck = now;

      updatePointer(e);
      raycaster.setFromCamera(_pointerVec, camera);
      const hits = raycaster.intersectObjects(solarSystem.clickableMeshes, false);

      if (hits.length > 0) {
        const hitId = hits[0].object.userData.celestialId as string;
        const body = CELESTIAL_BODIES.find((b) => b.id === hitId);
        if (body) {
          hoveredBodyId = hitId;
          solarSystem.setHoveredId(hitId);
          canvas.style.cursor = 'pointer';

          solarSystem.getWorldPosition(hitId, _projVec);
          _projVec.project(camera);
          const rect = canvas.getBoundingClientRect();
          const sx = ((_projVec.x + 1) / 2) * rect.width;
          const sy = ((-_projVec.y + 1) / 2) * rect.height;
          setHoverInfo({
            id: body.id,
            name: body.name,
            category: body.category,
            x: sx,
            y: sy,
          });
          return;
        }
      }

      if (hoveredBodyId !== null) {
        hoveredBodyId = null;
        solarSystem.setHoveredId(null);
        setHoverInfo(null);
        canvas.style.cursor = 'grab';
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (dx * dx + dy * dy > 36) return; // Dragged camera, not a click

      const ph = stateRef.current.phase;
      if (ph !== 'solar_system' && ph !== 'planet_explore') return;

      updatePointer(e);
      raycaster.setFromCamera(_pointerVec, camera);
      const hits = raycaster.intersectObjects(solarSystem.clickableMeshes, false);
      if (hits.length > 0) {
        const hitId = hits[0].object.userData.celestialId as string;
        cosmicAudio.playChime(659.25, 0.35);
        callbacksRef.current.onSelectPlanet(hitId);
      }
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop with Software-WebGL Pacing
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const getBodyData = (id: string | null): CelestialBodyData | undefined =>
      id ? CELESTIAL_BODIES.find((b) => b.id === id) : undefined;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || !gl.fenceSync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.08);
      const elapsed = clock.getElapsedTime();

      const {
        phase: curPhase,
        selectedPlanetId: curSelectedId,
        studioPlanetId: curStudioId,
        explore3DMode: curExplore3D,
        orbitSpeedMultiplier: curSpeed,
      } = stateRef.current;

      const anim = animStateRef.current;
      anim.phaseTimer += dt;

      // Update 3D Worlds
      palace.update(elapsed);
      solarSystem.setSelectedId(curSelectedId);
      solarSystem.update(elapsed, dt, curPhase === 'planet_explore' ? curSpeed * 0.25 : curSpeed);

      // Update Sanctuary vs Solar visibility / position
      const inSanctuary =
        curPhase === 'palace' ||
        curPhase === 'doors_opening' ||
        curPhase === 'hangar' ||
        curPhase === 'boarding' ||
        curPhase === 'launching';
      sanctuaryGroup.visible = inSanctuary;

      // Keep sky dome & starfield centered near camera during sanctuary phases so stars surround palace too
      if (inSanctuary) {
        solarSystem.starField.position.y = 260;
      } else {
        solarSystem.starField.position.y = 0;
      }

      // Reset spaceship base position unless launching
      let thrustPower = 0.25;
      let targetFov = 50;
      let streakOpacity = 0;

      if (curPhase === 'palace') {
        controls.enabled = false;
        palace.setDoorOpenAmount(0);
        spaceship.group.position.set(0, 0, -14.5);
        spaceship.group.rotation.set(0, 0, 0);

        const swayX = Math.sin(elapsed * 0.35) * 0.65;
        const swayY = Math.cos(elapsed * 0.28) * 0.25;
        _camTargetPos.set(swayX, 266.8 + swayY, 22.5);
        _lookTargetPos.set(0, 267.4, 0);
        camera.position.lerp(_camTargetPos, 1 - Math.exp(-3.5 * dt));
        controls.target.lerp(_lookTargetPos, 1 - Math.exp(-3.5 * dt));
        camera.lookAt(controls.target);
      } else if (curPhase === 'doors_opening') {
        controls.enabled = false;
        spaceship.group.position.set(0, 0, -14.5);
        const t = THREE.MathUtils.clamp(anim.phaseTimer / 3.2, 0, 1);
        palace.setDoorOpenAmount(THREE.MathUtils.clamp(t * 1.25, 0, 1));

        // Glide camera smoothly through the parted golden doors into the sanctuary
        const camMove = THREE.MathUtils.smoothstep(t, 0.25, 1.0);
        _camTargetPos.set(
          THREE.MathUtils.lerp(0, 5.4, camMove),
          THREE.MathUtils.lerp(266.8, 264.4, camMove),
          THREE.MathUtils.lerp(22.5, -4.5, camMove)
        );
        _lookTargetPos.set(0, THREE.MathUtils.lerp(267.4, 262.1, camMove), THREE.MathUtils.lerp(0, -14.5, camMove));
        camera.position.lerp(_camTargetPos, 1 - Math.exp(-3.5 * dt));
        controls.target.lerp(_lookTargetPos, 1 - Math.exp(-3.5 * dt));
        camera.lookAt(controls.target);

        if (t >= 1) {
          callbacksRef.current.onPhaseAutoAdvance('hangar');
        }
      } else if (curPhase === 'hangar') {
        controls.enabled = true;
        controls.minDistance = 6;
        controls.maxDistance = 24;
        palace.setDoorOpenAmount(1);
        spaceship.group.position.set(0, Math.sin(elapsed * 1.4) * 0.08, -14.5);

        if (anim.cameraFlying) {
          _camTargetPos.set(6.2, 264.6, -4.8);
          _lookTargetPos.set(0, 262.1, -14.5);
          const alpha = 1 - Math.exp(-3.8 * dt);
          camera.position.lerp(_camTargetPos, alpha);
          controls.target.lerp(_lookTargetPos, alpha);
          if (camera.position.distanceTo(_camTargetPos) < 0.08) {
            anim.cameraFlying = false;
          }
        }
        controls.update();
      } else if (curPhase === 'boarding') {
        controls.enabled = false;
        palace.setDoorOpenAmount(1);
        spaceship.group.position.set(0, 0, -14.5);

        // Fly into the cockpit interior seat looking through the glass canopy & dashboard
        const t = THREE.MathUtils.clamp(anim.phaseTimer / 1.9, 0, 1);
        _camTargetPos.set(
          0,
          260 + spaceship.cockpitCameraAnchor.y,
          -14.5 + spaceship.cockpitCameraAnchor.z
        );
        _lookTargetPos.set(
          0,
          260 + spaceship.cockpitLookTarget.y,
          -14.5 + spaceship.cockpitLookTarget.z
        );
        const alpha = 1 - Math.exp(-4.2 * dt);
        camera.position.lerp(_camTargetPos, alpha);
        controls.target.lerp(_lookTargetPos, alpha);
        camera.lookAt(controls.target);

        if (t >= 1) {
          callbacksRef.current.onPhaseAutoAdvance('launching');
        }
      } else if (curPhase === 'launching') {
        controls.enabled = false;
        palace.setDoorOpenAmount(1);
        const t = anim.phaseTimer;

        if (t < 3.0) {
          // 3..2..1 Launch Countdown inside cockpit
          const count = 3 - Math.floor(t);
          if (anim.countdownStage !== count) {
            anim.countdownStage = count;
            callbacksRef.current.onCountdownTick(count);
            cosmicAudio.playCountdownBeep(count);
          }
          thrustPower = 0.4 + (t / 3.0) * 0.9;
          const shake = Math.max(0, (t - 1.5) * 0.015);
          camera.position.set(
            (Math.random() - 0.5) * shake,
            260 + spaceship.cockpitCameraAnchor.y + (Math.random() - 0.5) * shake,
            -14.5 + spaceship.cockpitCameraAnchor.z
          );
          controls.target.set(0, 260 + spaceship.cockpitLookTarget.y, -14.5 + spaceship.cockpitLookTarget.z);
          camera.lookAt(controls.target);
        } else if (t < 6.4) {
          // Ignition & Hyper-Warp Ascent!
          if (anim.countdownStage !== 0) {
            anim.countdownStage = 0;
            callbacksRef.current.onCountdownTick(0);
            cosmicAudio.playCountdownBeep(0);
            cosmicAudio.playLaunchThrusters();
          }
          const flightT = THREE.MathUtils.clamp((t - 3.0) / 3.4, 0, 1);
          thrustPower = 2.6;
          targetFov = 50 + Math.sin(flightT * Math.PI) * 24;
          streakOpacity = Math.sin(flightT * Math.PI) * 0.85;

          // Ship blasts forward (-Z) and banks slightly out into space
          const shipZ = -14.5 - Math.pow(flightT, 2.1) * 140;
          const shipY = Math.pow(flightT, 1.8) * 18;
          spaceship.group.position.set(0, shipY, shipZ);

          // Chase cam pulls just behind the ship as it surges into the cosmos
          const chasePull = THREE.MathUtils.smoothstep(flightT, 0.0, 0.45);
          _camTargetPos.set(
            chasePull * 1.4,
            260 + shipY + THREE.MathUtils.lerp(spaceship.cockpitCameraAnchor.y, 4.2, chasePull),
            shipZ + THREE.MathUtils.lerp(spaceship.cockpitCameraAnchor.z, 11.5, chasePull)
          );
          _lookTargetPos.set(0, 260 + shipY + 1.8, shipZ - 14);
          camera.position.copy(_camTargetPos);
          controls.target.copy(_lookTargetPos);
          camera.lookAt(controls.target);
        } else {
          callbacksRef.current.onCountdownTick(null);
          // Snap initial Solar System entry vista smoothly
          camera.position.set(0, 74, 145);
          controls.target.set(0, 0, 0);
          callbacksRef.current.onPhaseAutoAdvance('solar_system');
        }
      } else if (curPhase === 'solar_system' || curPhase === 'missions') {
        controls.enabled = curPhase === 'solar_system';
        controls.minDistance = 12;
        controls.maxDistance = 260;
        if (anim.cameraFlying) {
          _camTargetPos.set(0, 56, 118);
          _lookTargetPos.set(0, 0, 0);
          const alpha = 1 - Math.exp(-3.6 * dt);
          camera.position.lerp(_camTargetPos, alpha);
          controls.target.lerp(_lookTargetPos, alpha);
          if (camera.position.distanceTo(_camTargetPos) < 0.25 && controls.target.length() < 0.25) {
            anim.cameraFlying = false;
          }
        }
        controls.update();
      } else if (curPhase === 'planet_explore' || curPhase === 'astronaut_studio') {
        const activeId = curPhase === 'astronaut_studio' ? curStudioId : curSelectedId;
        controls.enabled = curPhase === 'planet_explore';
        const body = getBodyData(activeId);

        if (activeId && body && solarSystem.getWorldPosition(activeId, _planetWorldPos)) {
          // Move camera & controls.target along with the orbiting planet's frame delta
          if (anim.trackingPlanetId === activeId && anim.hasPrevPlanetPos) {
            _planetDelta.subVectors(_planetWorldPos, _prevPlanetWorldPos);
            camera.position.add(_planetDelta);
            controls.target.add(_planetDelta);
          }
          _prevPlanetWorldPos.copy(_planetWorldPos);
          anim.trackingPlanetId = activeId;
          anim.hasPrevPlanetPos = true;

          const baseDist =
            curPhase === 'astronaut_studio'
              ? Math.max(body.visualRadius * 3.1, 3.2)
              : curExplore3D
              ? Math.max(body.visualRadius * 2.55, 2.4)
              : Math.max(body.visualRadius * 4.4, 4.2);

          controls.minDistance = Math.max(body.visualRadius * 1.65, 1.5);
          controls.maxDistance = Math.max(body.visualRadius * 14, 40);

          if (anim.cameraFlying) {
            // Offset planet slightly left when inspector panel is open on desktop (unless Explore 3D or Studio)
            const offsetX =
              curPhase === 'planet_explore' && !curExplore3D ? baseDist * 0.35 : 0;
            _lookTargetPos.set(
              _planetWorldPos.x + offsetX,
              _planetWorldPos.y,
              _planetWorldPos.z
            );
            _camTargetPos.set(
              _planetWorldPos.x + baseDist * 0.72,
              _planetWorldPos.y + baseDist * 0.34,
              _planetWorldPos.z + baseDist * 0.92
            );
            const alpha = 1 - Math.exp(-4.2 * dt);
            camera.position.lerp(_camTargetPos, alpha);
            controls.target.lerp(_lookTargetPos, alpha);
            if (
              camera.position.distanceTo(_camTargetPos) < 0.08 &&
              controls.target.distanceTo(_lookTargetPos) < 0.08
            ) {
              anim.cameraFlying = false;
            }
          }
          if (curPhase === 'astronaut_studio') {
            controls.target.copy(_planetWorldPos);
            // Gently orbit camera around the backdrop planet
            const orbitA = elapsed * 0.16;
            camera.position.set(
              _planetWorldPos.x + Math.cos(orbitA) * baseDist,
              _planetWorldPos.y + baseDist * 0.28,
              _planetWorldPos.z + Math.sin(orbitA) * baseDist
            );
            camera.lookAt(controls.target);
          } else {
            controls.update();
          }
        }
      }

      // Smooth FOV & Warp Streak updates
      if (Math.abs(camera.fov - targetFov) > 0.05) {
        camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 5, dt);
        camera.updateProjectionMatrix();
      }
      spaceship.update(elapsed, thrustPower);

      streakMat.opacity = streakOpacity;
      warpStreaks.visible = streakOpacity > 0.01;
      if (warpStreaks.visible) {
        for (let i = 0; i < streakCount; i++) {
          const s = streakSeeds[i];
          s.z += s.speed * dt;
          if (s.z > 15) s.z = -65;
          streakDummy.position.set(s.x, s.y, s.z);
          streakDummy.updateMatrix();
          warpStreaks.setMatrixAt(i, streakDummy.matrix);
        }
        warpStreaks.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };

    if (isSoftwareGl) {
      renderer.render(scene, camera);
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      controls.dispose();
      palace.dispose();
      spaceship.dispose();
      solarSystem.dispose();
      streakGeo.dispose();
      streakMat.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#04060d]">
      {/* Isolated stable WebGL mount container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Graceful fallback if WebGL is unavailable */}
      {webglError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#060814] p-8 text-center z-20">
          <div className="max-w-md border border-[#e5b869]/30 bg-[#0b0e1d] p-8 rounded-lg">
            <h2 className="font-display text-2xl text-[#e5b869] mb-3">
              Lost in Brahmaand
            </h2>
            <p className="text-sm text-[#cbd5e1] leading-relaxed mb-4">
              {webglError}
            </p>
            <p className="text-xs text-[#94a3b8]">
              You can still explore planet dossiers, missions, and the Astronaut Identity Studio using the navigation bar above.
            </p>
          </div>
        </div>
      )}

      {/* Hover planet label (screen-projected, pointer-events-none) */}
      {hoverInfo && (phase === 'solar_system' || phase === 'planet_explore') && (
        <div
          className="pointer-events-none fixed z-20 -translate-x-1/2 -translate-y-full pb-4 transition-opacity duration-150"
          style={{ left: `${hoverInfo.x}px`, top: `${hoverInfo.y}px` }}
        >
          <div className="px-3 py-1.5 rounded border border-[#e5b869]/45 bg-[#080b18]/92 shadow-lg whitespace-nowrap">
            <div className="font-display text-xs tracking-wider text-[#f4f1ea]">
              {hoverInfo.name}
            </div>
            <div className="text-[10px] text-[#e5b869]/85 tracking-wide">
              {hoverInfo.category} · Click to explore
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
