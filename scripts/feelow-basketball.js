/* =========================================================
   FEELOW HOOPERS — Balón de hormigón 3D (fondo del Hero)
   ---------------------------------------------------------
   Extraído del Asset Pack 3D del universo 5PM y adaptado
   para renderizar como fondo absoluto (z-index: 0, opacidad
   sutil) dentro de .feelow-hero.

   Sin OrbitControls: el balón flota y se auto-rota a un ritmo
   lento para no entorpecer el scroll ni capturar el puntero.
   ========================================================= */

import * as THREE from 'three';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Normal map procedural de hormigón poroso ---------- */
function generateNoiseNormalMap(size, scale, octaves, strength) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(size, size);
    const d = img.data;

    /* Hash determinista */
    function hash(x, y) {
        let h = (x | 0) * 374761393 + (y | 0) * 668265263;
        h = (h ^ (h >> 13)) * 1274126177;
        return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff;
    }

    /* Value noise suavizado */
    function vnoise(x, y) {
        const ix = Math.floor(x), iy = Math.floor(y);
        const fx = x - ix, fy = y - iy;
        const sx = fx * fx * (3 - 2 * fx);
        const sy = fy * fy * (3 - 2 * fy);
        const a = hash(ix, iy), b = hash(ix + 1, iy);
        const c = hash(ix, iy + 1), dd = hash(ix + 1, iy + 1);
        return (a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + dd * sx) * sy;
    }

    /* Fractal Brownian Motion */
    function fbm(x, y) {
        let v = 0, amp = 0.5, freq = 1;
        for (let i = 0; i < octaves; i++) {
            v += amp * vnoise(x * freq, y * freq);
            amp *= 0.5;
            freq *= 2.17;
        }
        return v;
    }

    for (let py = 0; py < size; py++) {
        for (let px = 0; px < size; px++) {
            const idx = (py * size + px) * 4;
            const nx = px / size * scale, ny = py / size * scale;
            const nC = fbm(nx, ny);
            const nR = fbm(nx + 1 / size * scale, ny);
            const nD = fbm(nx, ny + 1 / size * scale);

            d[idx]     = Math.max(0, Math.min(255, ((nC - nR) * strength * 0.5 + 0.5) * 255 | 0));
            d[idx + 1] = Math.max(0, Math.min(255, ((nC - nD) * strength * 0.5 + 0.5) * 255 | 0));
            d[idx + 2] = 255;
            d[idx + 3] = 255;
        }
    }

    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

/* ---------- Environment map procedural con luces frías ---------- */
function createEnvMap(renderer) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x060606);

    const positions = [
        [5, 5, 5, 0x8899aa, 10],
        [-6, -2, -4, 0x556677, 6],
        [0, 6, -3, 0x445566, 4],
        [-3, 0, 6, 0x334455, 3],
        [4, -4, -2, 0x222233, 2],
    ];
    positions.forEach(([x, y, z, color, intensity]) => {
        const l = new THREE.PointLight(color, intensity, 25);
        l.position.set(x, y, z);
        envScene.add(l);
    });

    const envMap = pmrem.fromScene(envScene, 0, 0.1, 100).texture;
    pmrem.dispose();
    return envMap;
}

/* ===========================================================
   CONCRETE BASKETBALL — versión fondo de Hero
   =========================================================== */

export class ConcreteBasketball {
    constructor(containerSelector) {
        this.el = document.querySelector(containerSelector);
        if (!this.el) return;

        // Esperar a que el contenedor tenga dimensiones reales.
        if (this.el.clientWidth === 0 || this.el.clientHeight === 0) {
            this._deferred = true;
            requestAnimationFrame(() => {
                this._deferred = false;
                this._init();
            });
        } else {
            this._init();
        }
    }

    _init() {
        const w = Math.max(1, this.el.clientWidth);
        const h = Math.max(1, this.el.clientHeight);

        /* Escena, cámara, renderer */
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 50);
        this.camera.position.set(0, 0.3, 3.6);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        // Canvas transparente: deja ver los gradientes del hero y NO bloquea scroll.
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        // Exposición más alta para que el hormigón gris sea visible (no negro plano).
        this.renderer.toneMappingExposure = 1.35;
        this.renderer.domElement.setAttribute('aria-hidden', 'true');
        this.renderer.domElement.style.pointerEvents = 'none';
        this.el.appendChild(this.renderer.domElement);

        /* Environment map para reflejos PBR sobre el acero de las canaletas */
        this.scene.environment = createEnvMap(this.renderer);

        /* Key light frontal fría — revela los poros del hormigón */
        const key = new THREE.DirectionalLight(0xccccdd, 3.2);
        key.position.set(3, 4, 5);
        this.scene.add(key);

        /* 3 Rim lights frías (ambiente nocturno) — esculpen el volumen */
        const rim1 = new THREE.DirectionalLight(0x8899bb, 5.5);
        rim1.position.set(-4, 1, -2);
        this.scene.add(rim1);

        const rim2 = new THREE.DirectionalLight(0x667799, 3.5);
        rim2.position.set(1, -4, -1);
        this.scene.add(rim2);

        const rim3 = new THREE.DirectionalLight(0x7788aa, 3);
        rim3.position.set(-1, 2, -4);
        this.scene.add(rim3);

        this.scene.add(new THREE.AmbientLight(0x1a1a22, 0.45));

        this._buildBall();

        /* Auto-rotación: el puntero NO captura eventos (los deja
           pasar al scroll y al contenido del hero). */
        this.autoRotateSpeed = REDUCED_MOTION ? 0 : 0.9;

        this.clock = new THREE.Clock();
        this._running = true;
        this._animate();
    }

    /** SDF de las canaletas del balón */
    _grooveDist(nx, ny, nz) {
        const PI = Math.PI, TWO_PI = 2 * PI, INF = 99;
        const theta = Math.atan2(nz, nx);
        const phi = Math.acos(Math.max(-1, Math.min(1, ny)));

        const angDist = (a, b) => {
            let d = Math.abs(a - b);
            return Math.min(d, TWO_PI - d);
        };

        const d1 = Math.abs(phi - PI * 0.5);
        const d2 = angDist(theta, 0);
        const d3 = phi < 0.87 * PI ? angDist(theta, 65 * PI / 180) : INF;
        const d4 = phi < 0.87 * PI ? angDist(theta, -65 * PI / 180) : INF;

        return Math.min(d1, d2, d3, d4);
    }

    _buildBall() {
        const RADIUS = 1;
        // Mayor densidad de vértices → poros y canaletas mejor esculpidos.
        const SEGMENTS = 220;
        const GROOVE_W = 0.055;
        const GROOVE_D = 0.052;
        const PORE_AMP = 0.012;   // micro-relieve del hormigón poroso

        const geo = new THREE.SphereGeometry(RADIUS, SEGMENTS, SEGMENTS);
        const pos = geo.attributes.position;
        const maskArr = new Float32Array(pos.count);

        // RNG determinista para los poros (sin parpadeo entre frames).
        const poreHash = (i) => {
            let h = (i * 374761393 + 0x9e3779b9) >>> 0;
            h = (h ^ (h >> 13)) >>> 0;
            h = (h * 1274126177) >>> 0;
            return ((h ^ (h >> 16)) & 0xffffff) / 0xffffff;
        };

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
            const len = Math.max(1e-6, Math.sqrt(x * x + y * y + z * z));
            const nx = x / len, ny = y / len, nz = z / len;

            const dist = this._grooveDist(nx, ny, nz);
            let disp = 0, mask = 0;

            if (dist < GROOVE_W) {
                // Canaleta con borde afilado: cae rápido y rebota (acero hundido).
                const t = 1 - dist / GROOVE_W;
                disp = -GROOVE_D * (t * t * (3 - 2 * t));
                mask = t;
            } else if (dist < GROOVE_W * 1.6) {
                // Reborde levantado junto a cada canaleta (cantos metálicos).
                const t = 1 - (dist - GROOVE_W) / (GROOVE_W * 0.6);
                disp = PORE_AMP * 0.8 * t * t;
            }

            // Poros del hormigón: ruido sutil por vértice (donde no hay canaleta).
            if (mask === 0) {
                disp += (poreHash(i) - 0.5) * 2 * PORE_AMP;
            }

            const newR = Math.max(0.01, RADIUS + disp);
            pos.setXYZ(i, nx * newR, ny * newR, nz * newR);
            maskArr[i] = mask;
        }

        geo.setAttribute('aGrooveMask', new THREE.BufferAttribute(maskArr, 1));
        geo.computeVertexNormals();

        // Normal map FBM de mayor resolución → rugosidad del hormigón gris.
        const concreteNM = generateNoiseNormalMap(720, 11, 7, 3.2);

        const mat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0.34, 0.335, 0.33),   // gris asfalto más claro y visible
            roughness: 0.92,
            metalness: 0.06,
            normalMap: concreteNM,
            normalScale: new THREE.Vector2(0.55, 0.55),
            envMapIntensity: 0.7,
            clearcoat: 0.0,
        });

        mat.onBeforeCompile = (shader) => {
            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `#include <common>
                 attribute float aGrooveMask;
                 varying float vGrooveMask;`
            );
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `#include <begin_vertex>
                 vGrooveMask = aGrooveMask;`
            );
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <common>',
                `#include <common>
                 varying float vGrooveMask;`
            );
            // Hormigón gris rugoso vs. acero oscuro pulido en las canaletas.
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <color_fragment>',
                `#include <color_fragment>
                 vec3 concreteCol = vec3(0.34, 0.335, 0.33);
                 vec3 steelCol    = vec3(0.085, 0.085, 0.10);
                 diffuseColor.rgb = mix(concreteCol, steelCol, vGrooveMask);`
            );
            // Acero más liso y reflectante que el hormigón poroso.
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <roughnessmap_fragment>',
                `#include <roughnessmap_fragment>
                 roughnessFactor = mix(0.92, 0.28, vGrooveMask);`
            );
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <metalnessmap_fragment>',
                `#include <metalnessmap_fragment>
                 metalnessFactor = mix(0.06, 0.92, vGrooveMask);`
            );
        };

        this.ball = new THREE.Mesh(geo, mat);
        this.scene.add(this.ball);
    }

    _animate() {
        if (!this._running) return;
        requestAnimationFrame(() => this._animate());
        const t = this.clock.getElapsedTime();

        if (this.ball) {
            if (!REDUCED_MOTION) {
                this.ball.position.y = Math.sin(t * 0.7) * 0.04;
                this.ball.rotation.y += 0.0035 * this.autoRotateSpeed;
                this.ball.rotation.x = Math.sin(t * 0.2) * 0.08;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        if (!this.el || !this.renderer) return;
        const w = Math.max(1, this.el.clientWidth);
        const h = Math.max(1, this.el.clientHeight);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    /** Pausa el render cuando el hero sale del viewport (ahorro de GPU). */
    setVisible(visible) {
        if (!this.renderer) return;
        if (visible && !this._running) {
            this._running = true;
            this.clock.getDelta();
            this._animate();
        } else if (!visible && this._running) {
            this._running = false;
        }
    }
}
