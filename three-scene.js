import * as THREE from 'https://unpkg.com/three@0.163.0/build/three.module.js';

const canvas = document.querySelector('#hero-canvas');
if (!canvas) throw new Error('Hero canvas not found');

// ── Renderer ──────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

// ── Scene & Camera ────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020202, 0.038);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
camera.position.set(0, 0, 16);

// ── Lights ────────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

const charLights = [
  { color: 0x00a875, x:  5,  y:  4, z:  6, intensity: 2.2 },
  { color: 0xd8d2c4, x: -4,  y:  3, z:  4, intensity: 1.4 },
  { color: 0xa7a7a2, x:  3,  y: -4, z:  5, intensity: 1.2 },
  { color: 0x5e7180, x: -3,  y: -3, z:  3, intensity: 1.6 },
  { color: 0xc70f18, x:  0,  y:  5, z:  2, intensity: 1.8 },
  { color: 0xc28a35, x:  0,  y:  0, z: 10, intensity: 0.8 },
];

const lights = charLights.map(({ color, x, y, z, intensity }) => {
  const light = new THREE.PointLight(color, intensity, 32, 2);
  light.position.set(x, y, z);
  scene.add(light);
  return light;
});

// ── Groups ────────────────────────────────────────────────────────────────────
const rootGroup = new THREE.Group();
scene.add(rootGroup);

// ── Core: Torus knot ─────────────────────────────────────────────────────────
const coreGeo = new THREE.TorusKnotGeometry(1.6, 0.38, 180, 22, 2, 3);
const coreMat = new THREE.MeshStandardMaterial({
  color: 0x111111,
  metalness: 0.72,
  roughness: 0.18,
  emissive: 0xc28a35,
  emissiveIntensity: 0.06,
});
const core = new THREE.Mesh(coreGeo, coreMat);
rootGroup.add(core);
core.add(new THREE.LineSegments(
  new THREE.EdgesGeometry(coreGeo, 18),
  new THREE.LineBasicMaterial({ color: 0xd4a348, transparent: true, opacity: 0.14 })
));

// ── Character shards ──────────────────────────────────────────────────────────
const shardData = [
  { color: 0x00a875, emissive: 0x003d2c, x: -3.2, y:  1.8, z: -0.8, r: 1.18 },
  { color: 0xd8d2c4, emissive: 0x4a4640, x:  2.8, y:  1.4, z: -1.4, r: 0.96 },
  { color: 0xa7a7a2, emissive: 0x2d2d2b, x:  2.2, y: -2.0, z:  0.2, r: 1.06 },
  { color: 0x5e7180, emissive: 0x151c21, x: -1.6, y: -2.1, z:  1.0, r: 0.92 },
  { color: 0xc70f18, emissive: 0x3d0408, x:  0.4, y:  2.4, z:  1.2, r: 0.88 },
];

const shardGroup = new THREE.Group();
rootGroup.add(shardGroup);
const shardGeo = new THREE.OctahedronGeometry(1, 1);

const shards = shardData.map((d, i) => {
  const mat = new THREE.MeshStandardMaterial({
    color: d.color, emissive: d.emissive, emissiveIntensity: 0.22,
    metalness: 0.38, roughness: 0.28, transparent: true, opacity: 0.88,
  });
  const mesh = new THREE.Mesh(shardGeo, mat);
  mesh.position.set(d.x, d.y, d.z);
  mesh.scale.setScalar(d.r * 0.84 + 0.36);
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  mesh.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(shardGeo, 8),
    new THREE.LineBasicMaterial({ color: d.color, transparent: true, opacity: 0.32 })
  ));
  shardGroup.add(mesh);
  return { mesh, speed: 0.0016 + i * 0.0008, floatOffset: i * 1.24 };
});

// ── Particles ─────────────────────────────────────────────────────────────────
const PARTICLE_COUNT = 520;
const positions   = new Float32Array(PARTICLE_COUNT * 3);
const pSpeeds     = new Float32Array(PARTICLE_COUNT);
const pPhases     = new Float32Array(PARTICLE_COUNT);

for (let i = 0; i < PARTICLE_COUNT; i++) {
  positions[i * 3]     = (Math.random() - 0.5) * 22;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
  pSpeeds[i] = 0.12 + Math.random() * 0.22;
  pPhases[i] = Math.random() * Math.PI * 2;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
  color: 0xd8cfc0, size: 0.045, transparent: true, opacity: 0.36,
  sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
}));
scene.add(particles);

// ── Atmospheric rings ─────────────────────────────────────────────────────────
const ringGeo = new THREE.TorusGeometry(4.8, 0.012, 8, 180);
const ringMat = new THREE.MeshBasicMaterial({ color: 0xc28a35, transparent: true, opacity: 0.22 });
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI / 2.4;
scene.add(ring);

const ring2 = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xc28a35, transparent: true, opacity: 0.1 }));
ring2.scale.setScalar(1.42);
ring2.rotation.x = Math.PI / 1.8;
ring2.rotation.z = Math.PI / 6;
scene.add(ring2);

// ── Mouse ─────────────────────────────────────────────────────────────────────
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
window.addEventListener('pointermove', (e) => {
  pointer.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
  pointer.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
});

// ── Resize ────────────────────────────────────────────────────────────────────
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== w || canvas.height !== h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}

// ── Loop ──────────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

(function animate() {
  requestAnimationFrame(animate);
  resize();

  const t = clock.getElapsedTime();

  pointer.x += (pointer.tx - pointer.x) * 0.06;
  pointer.y += (pointer.ty - pointer.y) * 0.04;

  core.rotation.x = t * 0.14;
  core.rotation.y = t * 0.09;
  core.rotation.z = Math.sin(t * 0.18) * 0.12;

  rootGroup.rotation.y = t * 0.06 + pointer.x * 0.22;
  rootGroup.rotation.x = Math.sin(t * 0.14) * 0.06 + pointer.y * 0.14;

  shards.forEach(({ mesh, speed, floatOffset }, i) => {
    mesh.rotation.y += speed * (i % 2 === 0 ? 1 : -1);
    mesh.rotation.x += speed * 0.62;
    mesh.position.y += Math.sin(t * 0.7 + floatOffset) * 0.004;
  });

  const pos = particleGeo.attributes.position.array;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pos[i * 3 + 1] += pSpeeds[i] * 0.004;
    pos[i * 3]     += Math.sin(t * 0.3 + pPhases[i]) * 0.003;
    if (pos[i * 3 + 1] > 8) pos[i * 3 + 1] = -8;
  }
  particleGeo.attributes.position.needsUpdate = true;

  ring.rotation.z  = t * 0.04;
  ring2.rotation.y = t * 0.022;

  lights.forEach((light, i) => {
    light.intensity = charLights[i].intensity * (0.82 + Math.sin(t * 0.6 + i * 1.1) * 0.18);
  });

  camera.position.x += (pointer.x * 2.8 - camera.position.x) * 0.055;
  camera.position.y += (pointer.y * 1.6 - camera.position.y) * 0.04;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
})();
