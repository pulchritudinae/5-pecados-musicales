import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
const canvas = document.getElementById("hero-canvas");

if (!canvas) {
  throw new Error("No hero canvas found in the document.");
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.3);
const pointLight = new THREE.PointLight(0xd8d8bd, 0.42, 26, 1.8);

directionalLight.position.set(5, 8, 5);
directionalLight.castShadow = true;
pointLight.position.set(-2.5, 4.5, 3.5);

scene.add(ambientLight, directionalLight, pointLight);

const createShard = (size, color, emissive) => {
  const geometry = new THREE.IcosahedronGeometry(size, 1);
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive,
    metalness: 0.3,
    roughness: 0.42,
    transparent: true,
    opacity: 0.95,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    THREE.MathUtils.randFloatSpread(22),
    THREE.MathUtils.randFloatSpread(10),
    THREE.MathUtils.randFloatSpread(18)
  );

  mesh.rotation.set(
    THREE.MathUtils.randFloat(0, Math.PI),
    THREE.MathUtils.randFloat(0, Math.PI),
    THREE.MathUtils.randFloat(0, Math.PI)
  );

  mesh.scale.setScalar(THREE.MathUtils.randFloat(0.65, 1.4));
  return mesh;
};

const shards = new THREE.Group();
[0.9, 1.25, 1.75, 2.35, 3.1, 3.8].forEach((size, index) => {
  const shard = createShard(size, 0xe4d2b6, 0x312108);
  shard.position.z = -index * 0.7;
  shards.add(shard);
});

const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.95, 0.45, 150, 16, 2.25, 3.5),
  new THREE.MeshPhysicalMaterial({
    color: 0xe4d2b6,
    emissive: 0x220f03,
    roughness: 0.23,
    metalness: 0.82,
    clearcoat: 0.8,
    transmission: 0.22,
    reflectivity: 0.95,
    thickness: 1.6,
  })
);

knot.position.set(0, -0.3, 0);
shards.add(knot);
scene.add(shards);

const fogColor = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(fogColor, 0.025);

camera.position.set(0, 0.8, 7.4);
const target = new THREE.Vector3(0, 0.1, 0);

const pointer = { x: 0.5, y: 0.5 };

const resizeScene = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener("resize", resizeScene);

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX / window.innerWidth;
  pointer.y = event.clientY / window.innerHeight;
});

const animate = () => {
  requestAnimationFrame(animate);

  shards.rotation.x += 0.003;
  shards.rotation.y += 0.006;
  shards.rotation.z += 0.0025;

  const dx = (pointer.x - 0.5) * 0.9;
  const dy = (pointer.y - 0.5) * 0.7;
  const easing = 0.045;

  target.x += (dx - target.x) * easing;
  target.y += (-dy - target.y) * easing;
  camera.position.x += (target.x - camera.position.x) * 0.08;
  camera.position.y += (target.y - camera.position.y) * 0.08;
  camera.lookAt(0, 0.1, 0);

  pointLight.position.x = Math.sin(Date.now() / 1250) * 3;
  pointLight.position.z = Math.cos(Date.now() / 860) * 2.4;
  pointLight.position.y = 3 + Math.sin(Date.now() / 1850) * 1.2;

  renderer.render(scene, camera);
};

animate();
