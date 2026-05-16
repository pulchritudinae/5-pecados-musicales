import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js";

const canvas = document.querySelector("#hero-canvas");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas) {
  const isMobile = window.matchMedia("(max-width: 680px)").matches;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, isMobile ? 0.035 : 0.026);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
  camera.position.set(0, 0.4, isMobile ? 12 : 10);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: "high-performance"
  });

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const ambientLight = new THREE.AmbientLight(0xd8d2c4, 0.34);
  const keyLight = new THREE.PointLight(0xc28a35, 1.8, 32, 2.1);
  const anderLight = new THREE.PointLight(0x00a875, 0.95, 34, 2.4);
  const bodhiLight = new THREE.PointLight(0xc70f18, 0.75, 30, 2.2);
  const kimLight = new THREE.PointLight(0x5e7180, 0.55, 26, 2.5);

  keyLight.position.set(0, 4.6, 7);
  anderLight.position.set(-6, 1.8, 1.5);
  bodhiLight.position.set(5.8, -2, 2);
  kimLight.position.set(1.5, -3.2, 4.5);
  scene.add(ambientLight, keyLight, anderLight, bodhiLight, kimLight);

  const particleCount = prefersReducedMotion ? 80 : isMobile ? 180 : 360;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSeeds = [];

  for (let index = 0; index < particleCount; index += 1) {
    const stride = index * 3;
    particlePositions[stride] = THREE.MathUtils.randFloatSpread(isMobile ? 14 : 20);
    particlePositions[stride + 1] = THREE.MathUtils.randFloatSpread(isMobile ? 9 : 12);
    particlePositions[stride + 2] = THREE.MathUtils.randFloat(-26, 8);
    particleSeeds.push({
      drift: THREE.MathUtils.randFloat(0.08, 0.34),
      offset: THREE.MathUtils.randFloat(0, Math.PI * 2)
    });
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: 0xf4eee3,
      size: isMobile ? 0.022 : 0.032,
      transparent: true,
      opacity: isMobile ? 0.34 : 0.42,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(particles);

  const hazeGroup = new THREE.Group();
  const hazePalette = [0x00a875, 0xd8d2c4, 0xa7a7a2, 0x5e7180, 0xc70f18];
  const hazeGeometry = new THREE.PlaneGeometry(4.8, 4.8, 1, 1);

  hazePalette.forEach((color, index) => {
    const haze = new THREE.Mesh(
      hazeGeometry,
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: isMobile ? 0.035 : 0.052,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      })
    );

    haze.position.set((index - 2) * 3.4, Math.sin(index) * 1.5, -7 - index * 2.6);
    haze.rotation.set(THREE.MathUtils.degToRad(68), 0, THREE.MathUtils.degToRad(index * 21));
    haze.scale.setScalar(1.1 + index * 0.22);
    hazeGroup.add(haze);
  });

  scene.add(hazeGroup);

  const pointer = { x: 0, y: 0 };
  const cameraTarget = new THREE.Vector3();
  const clock = new THREE.Clock();

  const resizeRenderer = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    if (canvas.width !== Math.floor(width * renderer.getPixelRatio()) || canvas.height !== Math.floor(height * renderer.getPixelRatio())) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  };

  window.addEventListener("pointermove", (event) => {
    if (prefersReducedMotion || isMobile) {
      return;
    }

    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = -(event.clientY / window.innerHeight - 0.5) * 2;
  });

  const animate = () => {
    resizeRenderer();

    const elapsed = clock.getElapsedTime();
    const positions = particleGeometry.attributes.position.array;

    if (!prefersReducedMotion) {
      for (let index = 0; index < particleCount; index += 1) {
        const stride = index * 3;
        const seed = particleSeeds[index];
        positions[stride + 1] += Math.sin(elapsed * seed.drift + seed.offset) * 0.0009;
        positions[stride] += Math.cos(elapsed * seed.drift * 0.7 + seed.offset) * 0.0007;
      }

      particleGeometry.attributes.position.needsUpdate = true;
      particles.rotation.y = elapsed * 0.018;
      hazeGroup.rotation.z = Math.sin(elapsed * 0.12) * 0.035;
      hazeGroup.children.forEach((haze, index) => {
        haze.rotation.z += 0.00045 * (index + 1);
        haze.position.y += Math.sin(elapsed * 0.22 + index) * 0.0009;
      });
    }

    keyLight.intensity = 1.55 + Math.sin(elapsed * 0.42) * 0.18;
    anderLight.position.x = -6 + Math.sin(elapsed * 0.18) * 1.2;
    bodhiLight.position.y = -2 + Math.cos(elapsed * 0.16) * 0.7;

    cameraTarget.set(pointer.x * 0.55, pointer.y * 0.34, isMobile ? 12 : 10);
    camera.position.lerp(cameraTarget, 0.045);
    camera.lookAt(0, 0, -8);

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();
}
