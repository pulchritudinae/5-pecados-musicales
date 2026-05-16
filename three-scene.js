import * as THREE from 'https://unpkg.com/three@0.163.0/build/three.module.js';

const canvas = document.querySelector('#hero-canvas');
if (!canvas) {
  throw new Error('Hero canvas not found');
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
camera.position.set(0, 0, 14);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
const pointLight = new THREE.PointLight(0xffffff, 1.5, 40, 2);
pointLight.position.set(8, 10, 10);
const softLight = new THREE.PointLight(0xffffff, 0.6, 40, 2);
softLight.position.set(-10, -4, 6);
scene.add(ambientLight, pointLight, softLight);

const palette = [
  { color: 0x00a875, radius: 1.2, x: -2.7, y: 1.4, z: -0.5 },
  { color: 0xd8d2c4, radius: 1.0, x: 2.2, y: 1.2, z: -1.1 },
  { color: 0xa7a7a2, radius: 1.1, x: 1.8, y: -1.7, z: -0.3 },
  { color: 0x5e7180, radius: 1.0, x: -1.3, y: -1.6, z: 0.7 },
  { color: 0xc70f18, radius: 0.9, x: 0.2, y: 2.0, z: 0.8 }
];

const shardGroup = new THREE.Group();
scene.add(shardGroup);

const baseGeometry = new THREE.OctahedronGeometry(1, 0);

palette.forEach((item) => {
  const material = new THREE.MeshStandardMaterial({
    color: item.color,
    metalness: 0.23,
    roughness: 0.35,
    transparent: true,
    opacity: 0.94,
    emissive: item.color,
    emissiveIntensity: 0.08
  });

  const shard = new THREE.Mesh(baseGeometry, material);
  shard.position.set(item.x, item.y, item.z);
  shard.scale.setScalar(item.radius * 0.9 + 0.4);
  shard.rotation.set(Math.random() * 1.4, Math.random() * 1.4, Math.random() * 1.4);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(baseGeometry, 10),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 })
  );
  shard.add(edges);
  shardGroup.add(shard);
});

const coreGeometry = new THREE.TorusKnotGeometry(1.4, 0.35, 128, 18, 2.4, 3.4);
const coreMaterial = new THREE.MeshStandardMaterial({
  color: 0xd8d2c4,
  metalness: 0.1,
  roughness: 0.2,
  emissive: 0x887552,
  emissiveIntensity: 0.1,
  transparent: true,
  opacity: 0.85
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
core.position.set(0, 0.2, 0);
shardGroup.add(core);

const grid = new THREE.GridHelper(16, 16, 0x444444, 0x0a0a0a);
grid.material.opacity = 0.08;
grid.material.transparent = true;
grid.position.set(0, -3.5, 0);

scene.add(grid);

const pointer = { x: 0, y: 0 };
window.addEventListener('pointermove', (event) => {
  pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
  pointer.y = -(event.clientY / window.innerHeight - 0.5) * 2;
});

const resizeRenderer = () => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;

  if (needResize) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
};

const clock = new THREE.Clock();

const animate = () => {
  resizeRenderer();

  const time = clock.getElapsedTime();
  shardGroup.rotation.y = time * 0.18;
  shardGroup.rotation.x = Math.sin(time * 0.25) * 0.09;

  shardGroup.children.forEach((child, index) => {
    if (index < palette.length) {
      child.rotation.y += 0.0025 * (index + 1);
      child.rotation.x += 0.0019 * (index + 1);
    }
  });

  camera.position.x += (pointer.x * 2.5 - camera.position.x) * 0.07;
  camera.position.y += (pointer.y * 1.5 - camera.position.y) * 0.05;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
