import * as THREE from 'three';
import { CELESTIAL_BODIES, CelestialBodyData } from '../data/celestialData';
import {
  createPlanetTextures,
  createRadialGlowTexture,
} from './proceduralTextures';

export interface PlanetNode {
  data: CelestialBodyData;
  orbitPivot: THREE.Group;
  bodyGroup: THREE.Group;
  spinMesh: THREE.Mesh;
  cloudMesh?: THREE.Mesh;
  orbitLine?: THREE.LineLoop;
  orbitMat?: THREE.LineBasicMaterial;
  proxyMesh: THREE.Mesh;
  angle: number;
  subMoons?: Array<{ pivot: THREE.Group; speed: number }>;
}

export interface SolarSystemRig {
  group: THREE.Group;
  planets: Map<string, PlanetNode>;
  clickableMeshes: THREE.Object3D[];
  starField: THREE.Points;
  asteroidBelt: THREE.InstancedMesh;
  sunLight: THREE.PointLight;
  setHoveredId: (id: string | null) => void;
  setSelectedId: (id: string | null) => void;
  getWorldPosition: (id: string, out: THREE.Vector3) => boolean;
  update: (elapsed: number, dt: number, orbitSpeedMultiplier: number) => void;
  dispose: () => void;
}

const _scratchVec = new THREE.Vector3();
const _sunPos = new THREE.Vector3(0, 0, 0);

function fixRingUVs(geo: THREE.RingGeometry, innerR: number, outerR: number): void {
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const dist = Math.sqrt(x * x + y * y);
    const u = (dist - innerR) / Math.max(0.0001, outerR - innerR);
    uv.setXY(i, THREE.MathUtils.clamp(u, 0, 1), 0.5);
  }
  uv.needsUpdate = true;
}

function createAtmosphereMaterial(hexColor: string, intensity = 0.85): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(hexColor) },
      uIntensity: { value: intensity },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vec3 viewDir = normalize(vViewPos);
        float rim = 1.0 - max(0.0, dot(viewDir, vNormal));
        float glow = pow(rim, 3.2) * uIntensity;
        gl_FragColor = vec4(uColor, glow);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
  });
}

function createSolarPhotosphereMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPos;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vPos = position;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vPos;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      float hash(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      float noise(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
          f.z
        );
      }

      float fbm(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p = p * 2.05 + vec3(0.3, -0.2, 0.4);
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec3 samplePos = normalize(vPos) * 3.4 + vec3(uTime * 0.08, -uTime * 0.05, uTime * 0.06);
        float n1 = fbm(samplePos);
        float n2 = fbm(samplePos * 2.2 - vec3(uTime * 0.12));
        float heat = clamp(n1 * 0.65 + n2 * 0.45, 0.0, 1.0);

        vec3 darkSpot = vec3(0.72, 0.18, 0.02);
        vec3 midOrange = vec3(1.0, 0.52, 0.08);
        vec3 brightGold = vec3(1.0, 0.86, 0.42);
        vec3 coreWhite = vec3(1.0, 0.98, 0.88);

        vec3 col = mix(darkSpot, midOrange, smoothstep(0.18, 0.48, heat));
        col = mix(col, brightGold, smoothstep(0.45, 0.78, heat));
        col = mix(col, coreWhite, smoothstep(0.78, 0.98, heat));

        // Solar limb glow
        float rim = 1.0 - max(0.0, dot(vViewDir, vNormal));
        col += vec3(1.0, 0.45, 0.1) * pow(rim, 2.4) * 0.55;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

function createCosmicSkyDome(): { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; geo: THREE.SphereGeometry } {
  const geo = new THREE.SphereGeometry(850, 48, 32);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vDir;

      float hash(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      float noise(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
          f.z
        );
      }

      float fbm(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p *= 2.1;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec3 d = normalize(vDir);
        float band = exp(-abs(d.y + d.x * 0.25) * 4.2);
        float n1 = fbm(d * 2.8 + vec3(0.1, 0.4, -0.2));
        float n2 = fbm(d * 5.2 - vec3(0.5, 0.2, 0.7));

        vec3 spaceVoid = vec3(0.015, 0.020, 0.048);
        vec3 cosmicViolet = vec3(0.12, 0.06, 0.24);
        vec3 nebulaBlue = vec3(0.05, 0.14, 0.30);
        vec3 galacticGold = vec3(0.28, 0.18, 0.08);

        vec3 col = spaceVoid;
        col += cosmicViolet * smoothstep(0.35, 0.82, n1) * (0.45 + band * 0.7);
        col += nebulaBlue * smoothstep(0.42, 0.85, n2) * 0.55;
        col += galacticGold * band * smoothstep(0.45, 0.88, n1 * n2 * 2.2) * 0.65;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  return { mesh, mat, geo };
}

export function buildSolarSystem(maxAnisotropy: number): SolarSystemRig {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];
  const planets = new Map<string, PlanetNode>();
  const clickableMeshes: THREE.Object3D[] = [];

  // 1. Deep Space Nebula Sky Dome
  const sky = createCosmicSkyDome();
  group.add(sky.mesh);
  disposables.push(sky.geo, sky.mat);

  // 2. 3,800 Distant Multi-Tinted Stars
  const starCount = 3800;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  const palette = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xcbdcff),
    new THREE.Color(0xffe7ba),
    new THREE.Color(0xd8b4fe),
  ];

  for (let i = 0; i < starCount; i++) {
    const r = 240 + Math.random() * 540;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi);

    const c = palette[i % palette.length];
    const brightness = 0.55 + Math.random() * 0.45;
    starColors[i * 3] = c.r * brightness;
    starColors[i * 3 + 1] = c.g * brightness;
    starColors[i * 3 + 2] = c.b * brightness;
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const glowSpriteTex = createRadialGlowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)');
  const starMat = new THREE.PointsMaterial({
    size: 1.5,
    map: glowSpriteTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const starField = new THREE.Points(starGeo, starMat);
  group.add(starField);
  disposables.push(starGeo, starMat, glowSpriteTex);

  // 3. Solar System Point Light (illuminates planets from center)
  const sunLight = new THREE.PointLight(0xfff1d6, 3.2, 650, 0.28);
  sunLight.position.set(0, 0, 0);
  group.add(sunLight);

  // Shared sphere geometry for planets & proxies
  const unitSphereGeo = new THREE.SphereGeometry(1, 48, 36);
  const proxyGeo = new THREE.SphereGeometry(1, 16, 12);
  const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
  disposables.push(unitSphereGeo, proxyGeo, proxyMat);

  let sunPhotosphereMat: THREE.ShaderMaterial | null = null;
  let cometTailGroup: THREE.Group | null = null;

  // 4. Build All Celestial Bodies
  CELESTIAL_BODIES.forEach((body) => {
    const orbitPivot = new THREE.Group();
    orbitPivot.rotation.z = THREE.MathUtils.degToRad(body.orbitInclinationDeg);

    // Attach Moon to Earth's bodyGroup later; others attach to solar system root
    if (!body.parentId) {
      group.add(orbitPivot);
    }

    // Orbit path hairline ring
    let orbitLine: THREE.LineLoop | undefined;
    let orbitMat: THREE.LineBasicMaterial | undefined;
    if (body.orbitRadius > 0) {
      const segs = body.parentId ? 64 : 180;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * body.orbitRadius, 0, Math.sin(a) * body.orbitRadius));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      orbitMat = new THREE.LineBasicMaterial({
        color: body.id === 'comet' ? 0x38bdf8 : 0x6366f1,
        transparent: true,
        opacity: body.id === 'comet' ? 0.28 : 0.22,
      });
      orbitLine = new THREE.LineLoop(lineGeo, orbitMat);
      orbitPivot.add(orbitLine);
      disposables.push(lineGeo, orbitMat);
    }

    const bodyGroup = new THREE.Group();
    const angle = body.initialAngle;
    bodyGroup.position.set(
      Math.cos(angle) * body.orbitRadius,
      0,
      Math.sin(angle) * body.orbitRadius
    );
    orbitPivot.add(bodyGroup);

    // Axial tilt container
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = THREE.MathUtils.degToRad(body.axialTiltDeg);
    bodyGroup.add(tiltGroup);

    let spinMesh: THREE.Mesh;
    let cloudMesh: THREE.Mesh | undefined;

    if (body.id === 'sun') {
      sunPhotosphereMat = createSolarPhotosphereMaterial();
      spinMesh = new THREE.Mesh(unitSphereGeo, sunPhotosphereMat);
      spinMesh.scale.setScalar(body.visualRadius);
      tiltGroup.add(spinMesh);
      disposables.push(sunPhotosphereMat);

      // Corona Rim Halo
      const coronaMat = createAtmosphereMaterial('#ff9e2c', 1.35);
      const coronaMesh = new THREE.Mesh(unitSphereGeo, coronaMat);
      coronaMesh.scale.setScalar(body.visualRadius * 1.18);
      tiltGroup.add(coronaMesh);
      disposables.push(coronaMat);

      // Soft Solar Glow Sprite
      const spriteMat = new THREE.SpriteMaterial({
        map: glowSpriteTex,
        color: 0xffb347,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glowSprite = new THREE.Sprite(spriteMat);
      glowSprite.scale.setScalar(body.visualRadius * 4.4);
      bodyGroup.add(glowSprite);
      disposables.push(spriteMat);
    } else {
      const texSet = createPlanetTextures(body.id, maxAnisotropy);
      disposables.push(texSet.map);
      if (texSet.bumpMap) disposables.push(texSet.bumpMap);
      if (texSet.cloudMap) disposables.push(texSet.cloudMap);
      if (texSet.ringMap) disposables.push(texSet.ringMap);

      const planetMat = new THREE.MeshStandardMaterial({
        map: texSet.map,
        bumpMap: texSet.bumpMap,
        bumpScale: body.id === 'mars' || body.id === 'moon' || body.id === 'mercury' ? 0.045 : 0.02,
        roughness: body.id === 'earth' ? 0.55 : body.id === 'jupiter' || body.id === 'saturn' ? 0.68 : 0.82,
        metalness: 0.06,
      });
      spinMesh = new THREE.Mesh(unitSphereGeo, planetMat);
      spinMesh.scale.setScalar(body.visualRadius);
      spinMesh.castShadow = true;
      spinMesh.receiveShadow = true;
      tiltGroup.add(spinMesh);
      disposables.push(planetMat);

      // Earth cloud layer
      if (texSet.cloudMap) {
        const cloudMat = new THREE.MeshStandardMaterial({
          map: texSet.cloudMap,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
          roughness: 0.9,
        });
        cloudMesh = new THREE.Mesh(unitSphereGeo, cloudMat);
        cloudMesh.scale.setScalar(body.visualRadius * 1.022);
        tiltGroup.add(cloudMesh);
        disposables.push(cloudMat);
      }

      // Atmospheric Fresnel Rim Glow
      if (body.atmosphereColor) {
        const atmoMat = createAtmosphereMaterial(body.atmosphereColor, 0.72);
        const atmoMesh = new THREE.Mesh(unitSphereGeo, atmoMat);
        atmoMesh.scale.setScalar(body.visualRadius * 1.065);
        tiltGroup.add(atmoMesh);
        disposables.push(atmoMat);
      }

      // Rings for Saturn & Uranus
      if (body.hasRings && texSet.ringMap) {
        const innerR = body.id === 'saturn' ? body.visualRadius * 1.32 : body.visualRadius * 1.45;
        const outerR = body.id === 'saturn' ? body.visualRadius * 2.48 : body.visualRadius * 1.98;
        const ringGeo = new THREE.RingGeometry(innerR, outerR, 96, 2);
        fixRingUVs(ringGeo, innerR, outerR);
        const ringMat = new THREE.MeshStandardMaterial({
          map: texSet.ringMap,
          transparent: true,
          opacity: body.id === 'saturn' ? 0.96 : 0.45,
          side: THREE.DoubleSide,
          roughness: 0.72,
          depthWrite: false,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        tiltGroup.add(ringMesh);
        disposables.push(ringGeo, ringMat);
      }

      // Halley's Comet glowing coma & solar-wind tail
      if (body.id === 'comet') {
        const comaMat = new THREE.SpriteMaterial({
          map: glowSpriteTex,
          color: 0x7dd3fc,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const coma = new THREE.Sprite(comaMat);
        coma.scale.setScalar(body.visualRadius * 4.5);
        bodyGroup.add(coma);

        cometTailGroup = new THREE.Group();
        const tailGeo = new THREE.ConeGeometry(body.visualRadius * 1.25, 11, 20, 1, true);
        tailGeo.rotateX(-Math.PI / 2);
        tailGeo.translate(0, 0, 5.5);
        const tailMat = new THREE.MeshBasicMaterial({
          color: 0x60a5fa,
          transparent: true,
          opacity: 0.34,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const tailMesh = new THREE.Mesh(tailGeo, tailMat);
        cometTailGroup.add(tailMesh);
        bodyGroup.add(cometTailGroup);
        disposables.push(comaMat, tailGeo, tailMat);
      }
    }

    // Sub-moons for Jupiter (4 Galilean) and Saturn (Titan)
    const subMoons: Array<{ pivot: THREE.Group; speed: number }> = [];
    if (body.id === 'jupiter' || body.id === 'saturn') {
      const count = body.id === 'jupiter' ? 4 : 2;
      const moonGeo = new THREE.SphereGeometry(0.14, 12, 10);
      const moonMat = new THREE.MeshStandardMaterial({ color: 0xd6d3cd, roughness: 0.85 });
      disposables.push(moonGeo, moonMat);
      for (let m = 0; m < count; m++) {
        const mPivot = new THREE.Group();
        const mDist = body.visualRadius * (1.75 + m * 0.55) + (body.id === 'saturn' ? 2.4 : 0);
        const mMesh = new THREE.Mesh(moonGeo, moonMat);
        mMesh.position.set(mDist, (m - 1) * 0.12, 0);
        mMesh.scale.setScalar(0.8 + m * 0.25);
        mPivot.add(mMesh);
        mPivot.rotation.y = m * 1.6;
        bodyGroup.add(mPivot);
        subMoons.push({ pivot: mPivot, speed: 0.75 / (m + 1) });
      }
    }

    // Invisible Raycast Proxy Sphere (easy clicking & hovering!)
    const proxyMesh = new THREE.Mesh(proxyGeo, proxyMat);
    const hitScale = body.id === 'sun' ? body.visualRadius * 1.15 : Math.max(body.visualRadius * 1.55, 1.5);
    proxyMesh.scale.setScalar(hitScale);
    proxyMesh.userData.celestialId = body.id;
    bodyGroup.add(proxyMesh);
    clickableMeshes.push(proxyMesh);

    planets.set(body.id, {
      data: body,
      orbitPivot,
      bodyGroup,
      spinMesh,
      cloudMesh,
      orbitLine,
      orbitMat,
      proxyMesh,
      angle,
      subMoons,
    });
  });

  // Parent the Moon's orbitPivot to Earth's bodyGroup!
  const earthNode = planets.get('earth');
  const moonNode = planets.get('moon');
  if (earthNode && moonNode) {
    earthNode.bodyGroup.add(moonNode.orbitPivot);
  }

  // 5. Asteroid Belt (InstancedMesh of 650 rocky asteroids between Mars & Jupiter)
  const asteroidCount = 650;
  const asteroidGeo = new THREE.IcosahedronGeometry(0.22, 0);
  const asteroidMat = new THREE.MeshStandardMaterial({
    color: 0xa8a29e,
    roughness: 0.9,
    metalness: 0.15,
  });
  const asteroidBelt = new THREE.InstancedMesh(asteroidGeo, asteroidMat, asteroidCount);
  const dummy = new THREE.Object3D();
  const astColor = new THREE.Color();

  for (let i = 0; i < asteroidCount; i++) {
    const a = (i / asteroidCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
    const rad = 37.5 + Math.random() * 6.5;
    const y = (Math.random() - 0.5) * 2.1;
    dummy.position.set(Math.cos(a) * rad, y, Math.sin(a) * rad);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    const sx = 0.45 + Math.random() * 1.35;
    const sy = 0.45 + Math.random() * 1.1;
    const sz = 0.45 + Math.random() * 1.35;
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();
    asteroidBelt.setMatrixAt(i, dummy.matrix);

    const shade = 0.55 + Math.random() * 0.4;
    astColor.setRGB(shade, shade * 0.94, shade * 0.88);
    asteroidBelt.setColorAt(i, astColor);
  }
  asteroidBelt.instanceMatrix.needsUpdate = true;
  if (asteroidBelt.instanceColor) asteroidBelt.instanceColor.needsUpdate = true;
  asteroidBelt.frustumCulled = false;
  group.add(asteroidBelt);
  disposables.push(asteroidGeo, asteroidMat);

  let hoveredId: string | null = null;
  let selectedId: string | null = null;

  const updateOrbitHighlight = () => {
    planets.forEach((node, id) => {
      if (!node.orbitMat) return;
      if (id === selectedId) {
        node.orbitMat.color.setHex(0xe5b869);
        node.orbitMat.opacity = 0.78;
      } else if (id === hoveredId) {
        node.orbitMat.color.setHex(0x93c5fd);
        node.orbitMat.opacity = 0.58;
      } else {
        node.orbitMat.color.setHex(id === 'comet' ? 0x38bdf8 : 0x6366f1);
        node.orbitMat.opacity = id === 'comet' ? 0.28 : 0.2;
      }
    });
  };

  const setHoveredId = (id: string | null) => {
    if (hoveredId === id) return;
    hoveredId = id;
    updateOrbitHighlight();
  };

  const setSelectedId = (id: string | null) => {
    if (selectedId === id) return;
    selectedId = id;
    updateOrbitHighlight();
  };

  const getWorldPosition = (id: string, out: THREE.Vector3): boolean => {
    const node = planets.get(id);
    if (!node) return false;
    node.bodyGroup.getWorldPosition(out);
    return true;
  };

  const update = (elapsed: number, dt: number, orbitSpeedMultiplier: number) => {
    sky.mat.uniforms.uTime.value = elapsed;
    if (sunPhotosphereMat) {
      sunPhotosphereMat.uniforms.uTime.value = elapsed;
    }

    // Rotate asteroid belt slowly
    asteroidBelt.rotation.y += dt * 0.025 * orbitSpeedMultiplier;

    planets.forEach((node) => {
      const { data } = node;
      // Orbital advance
      if (data.orbitRadius > 0) {
        node.angle += dt * data.orbitSpeed * orbitSpeedMultiplier;
        node.bodyGroup.position.set(
          Math.cos(node.angle) * data.orbitRadius,
          0,
          Math.sin(node.angle) * data.orbitRadius
        );
      }

      // Axial spin
      node.spinMesh.rotation.y += dt * data.rotationSpeed;
      if (node.cloudMesh) {
        node.cloudMesh.rotation.y += dt * (data.rotationSpeed * 1.18);
      }

      // Sub-moons
      node.subMoons?.forEach((sm) => {
        sm.pivot.rotation.y += dt * sm.speed * Math.max(0.2, orbitSpeedMultiplier);
      });

      // Halley's Comet tail always points away from Sun
      if (data.id === 'comet' && cometTailGroup) {
        node.bodyGroup.getWorldPosition(_scratchVec);
        // Point tail away from origin (Sun)
        _scratchVec.sub(_sunPos).normalize().multiplyScalar(10).add(node.bodyGroup.position);
        cometTailGroup.lookAt(_scratchVec);
      }
    });
  };

  const dispose = () => {
    disposables.forEach((d) => d.dispose());
  };

  return {
    group,
    planets,
    clickableMeshes,
    starField,
    asteroidBelt,
    sunLight,
    setHoveredId,
    setSelectedId,
    getWorldPosition,
    update,
    dispose,
  };
}
