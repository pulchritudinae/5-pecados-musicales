/**
 * 5PM - Cinco Pecados Musicales
 * Production-Ready Modular Architecture
 * 
 * Pillars:
 * 1. Modular WebGL Engine (Three.js)
 * 2. Cinematographic State Machine (GSAP + Interaction)
 * 3. Dynamic Interactive Audio Engine (Howler.js)
 * 4. Brutalist/Luxury Typography & Timelines (CSS + GSAP)
 */

import * as THREE from 'three';
import gsap from 'gsap';
import Lenis from 'lenis';
import { Howl, Howler } from 'howler';

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const CHARACTERS = {
  ander: {
    id: 'ander',
    name: 'Ander Popu',
    accentHex: 0x00a875,
    accentRGB: 'rgba(0, 168, 117, 0.56)',
    audioProfile: 'pop',
    description: 'La necesidad de pertenecer'
  },
  asher: {
    id: 'asher',
    name: 'Asher Coda',
    accentHex: 0xd8d2c4,
    accentRGB: 'rgba(216, 210, 196, 0.5)',
    audioProfile: 'classical',
    description: 'La belleza del silencio'
  },
  leo: {
    id: 'leo',
    name: 'Leo Feelow',
    accentHex: 0xa7a7a2,
    accentRGB: 'rgba(167, 167, 162, 0.48)',
    audioProfile: 'urban',
    description: 'El cuerpo como respuesta'
  },
  kim: {
    id: 'kim',
    name: 'Kim Thek',
    accentHex: 0x5e7180,
    accentRGB: 'rgba(94, 113, 128, 0.5)',
    audioProfile: 'industrial',
    description: 'El alma oscura'
  },
  bodhi: {
    id: 'bodhi',
    name: 'Bodhi Folk',
    accentHex: 0xc70f18,
    accentRGB: 'rgba(199, 15, 24, 0.58)',
    audioProfile: 'folk',
    description: 'Mercenario a sueldo'
  }
};

const CONFIG = {
  maxDPR: 2,
  particleCount: 2000,
  fogNear: 5,
  fogFar: 50,
  baseFogDensity: 0.02,
  transitionDuration: 2.5,
  audioCrossfadeDuration: 2,
  cameraZ: 12
};

// ============================================================================
// AUDIO MANAGER (HOWLER.JS)
// ============================================================================

class AudioManager {
  constructor() {
    this.isInitialized = false;
    this.currentTrack = null;
    this.ambientDrone = null;
    this.characterSounds = {};
    this.uiSounds = {};
    this.masterVolume = 0.7;
    
    // Initialize Howler global settings
    Howler.volume(this.masterVolume);
    Howler.autoUnlock = true;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    // Create procedural ambient drone using Web Audio API + Howler
    this.ambientDrone = new Howl({
      src: ['data:audio/wav;base64,UklGigAAABXRAQAAAAEAACABAAAgAQAAABAAEAABAAEAAAABAAEA'], // Silent placeholder
      loop: true,
      volume: 0,
      html5: true
    });
    
    // Character-specific audio textures (simulated with procedural sounds)
    // In production, replace with actual audio files
    this.characterSounds = {
      ander: new Howl({
        src: ['/assets/audio/ander-ambient.mp3'],
        loop: true,
        volume: 0,
        html5: true
      }),
      asher: new Howl({
        src: ['/assets/audio/asher-ambient.mp3'],
        loop: true,
        volume: 0,
        html5: true
      }),
      leo: new Howl({
        src: ['/assets/audio/leo-ambient.mp3'],
        loop: true,
        volume: 0,
        html5: true
      }),
      kim: new Howl({
        src: ['/assets/audio/kim-ambient.mp3'],
        loop: true,
        volume: 0,
        html5: true
      }),
      bodhi: new Howl({
        src: ['/assets/audio/bodhi-ambient.mp3'],
        loop: true,
        volume: 0,
        html5: true
      })
    };
    
    // UI Micro-sounds (subtle luxury clicks)
    this.uiSounds = {
      hover: new Howl({
        src: ['/assets/audio/ui-hover.mp3'],
        volume: 0.15,
        html5: true
      }),
      click: new Howl({
        src: ['/assets/audio/ui-click.mp3'],
        volume: 0.25,
        html5: true
      })
    };
    
    this.isInitialized = true;
  }

  async startAmbientDrone() {
    if (!this.isInitialized) await this.initialize();
    
    // Fade in ambient drone over 3 seconds
    gsap.to(this.ambientDrone, {
      volume: 0.4,
      duration: 3,
      ease: 'power2.inOut',
      onStart: () => this.ambientDrone.play()
    });
  }

  async crossfadeToCharacter(characterId) {
    if (!this.isInitialized) return;
    
    const targetSound = this.characterSounds[characterId];
    if (!targetSound) return;
    
    // Fade out current track
    if (this.currentTrack && this.currentTrack !== targetSound) {
      gsap.to(this.currentTrack, {
        volume: 0,
        duration: CONFIG.audioCrossfadeDuration,
        ease: 'power2.inOut',
        onComplete: () => this.currentTrack?.stop()
      });
    }
    
    // Fade in new character track
    gsap.to(targetSound, {
      volume: 0.5,
      duration: CONFIG.audioCrossfadeDuration,
      ease: 'power2.inOut',
      onStart: () => targetSound.play()
    });
    
    this.currentTrack = targetSound;
  }

  playUISound(type) {
    if (!this.isInitialized) return;
    const sound = this.uiSounds[type];
    if (sound) {
      sound.stop();
      sound.play();
    }
  }
}

// ============================================================================
// WEBGL ENGINE (THREE.JS)
// ============================================================================

class WebGLRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.hazePlanes = [];
    this.lights = {};
    this.currentCharacter = null;
    this.animationId = null;
    this.resizeTimeout = null;
    
    this.init();
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.FogExp2(0x000000, CONFIG.baseFogDensity);
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0, CONFIG.cameraZ);
    
    // Renderer setup with performance optimizations
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.maxDPR));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1);
    
    // Initialize systems
    this.createParticleSystem();
    this.createHazeSystem();
    this.setupLighting();
    
    // Event listeners
    this.bindEvents();
    
    // Start animation loop
    this.animate();
  }

  createParticleSystem() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(CONFIG.particleCount * 3);
    const colors = new Float32Array(CONFIG.particleCount * 3);
    const sizes = new Float32Array(CONFIG.particleCount);
    const velocities = new Float32Array(CONFIG.particleCount * 3);
    
    for (let i = 0; i < CONFIG.particleCount; i++) {
      const i3 = i * 3;
      
      // Position: distributed in a sphere
      const radius = 15 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Colors: subtle white/grey variations
      const brightness = 0.3 + Math.random() * 0.4;
      colors[i3] = brightness;
      colors[i3 + 1] = brightness;
      colors[i3 + 2] = brightness;
      
      // Sizes: varied particle sizes
      sizes[i] = Math.random() * 0.15 + 0.05;
      
      // Velocities: slow drift
      velocities[i3] = (Math.random() - 0.5) * 0.002;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.002;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Store velocities in userData for animation
    geometry.userData.velocities = velocities;
    
    // Custom shader material for particles
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: Math.min(window.devicePixelRatio, CONFIG.maxDPR) }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform float pixelRatio;
        
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += sin(time * 0.5 + position.x) * 0.5;
          pos.x += cos(time * 0.3 + position.y) * 0.3;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float r = distance(gl_PointCoord, vec2(0.5));
          if (r > 0.5) discard;
          
          float glow = 1.0 - (r * 2.0);
          glow = pow(glow, 1.5);
          
          gl_FragColor = vec4(vColor, glow * 0.6);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  createHazeSystem() {
    // Create layered haze/smoke planes for atmospheric depth
    const hazeGeometry = new THREE.PlaneGeometry(40, 40);
    
    for (let i = 0; i < 5; i++) {
      const hazeMaterial = new THREE.MeshBasicMaterial({
        color: 0x111111,
        transparent: true,
        opacity: 0.03 + Math.random() * 0.03,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      
      const haze = new THREE.Mesh(hazeGeometry, hazeMaterial);
      haze.position.z = -5 - i * 3;
      haze.rotation.z = Math.random() * Math.PI;
      haze.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.001,
        floatSpeed: 0.002 + Math.random() * 0.003,
        floatOffset: Math.random() * Math.PI * 2
      };
      
      this.hazePlanes.push(haze);
      this.scene.add(haze);
    }
  }

  setupLighting() {
    // 4-point lighting system for cinematic character illumination
    
    // Key Light (main directional)
    this.lights.key = new THREE.DirectionalLight(0xffffff, 0.8);
    this.lights.key.position.set(5, 5, 5);
    this.scene.add(this.lights.key);
    
    // Fill Light (softer, opposite side)
    this.lights.fill = new THREE.DirectionalLight(0x444444, 0.3);
    this.lights.fill.position.set(-3, 2, 3);
    this.scene.add(this.lights.fill);
    
    // Rim Light (backlight for edge definition)
    this.lights.rim = new THREE.DirectionalLight(0x666666, 0.4);
    this.lights.rim.position.set(0, 3, -5);
    this.scene.add(this.lights.rim);
    
    // Under Light (subtle fill from below)
    this.lights.under = new THREE.DirectionalLight(0x333333, 0.2);
    this.lights.under.position.set(0, -3, 2);
    this.scene.add(this.lights.under);
    
    // Ambient light for base illumination
    const ambient = new THREE.AmbientLight(0x222222, 0.5);
    this.scene.add(ambient);
  }

  bindEvents() {
    // Debounced resize handler
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => this.handleResize(), 250);
    });
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.maxDPR));
    
    // Update particle shader uniform
    if (this.particles?.material.uniforms) {
      this.particles.material.uniforms.pixelRatio.value = Math.min(window.devicePixelRatio, CONFIG.maxDPR);
    }
  }

  updateParticles(time) {
    if (!this.particles) return;
    
    const geometry = this.particles.geometry;
    const positions = geometry.attributes.position.array;
    const velocities = geometry.userData.velocities;
    
    for (let i = 0; i < CONFIG.particleCount; i++) {
      const i3 = i * 3;
      
      // Apply velocity
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      
      // Wrap around bounds
      const bound = 25;
      if (Math.abs(positions[i3]) > bound) velocities[i3] *= -1;
      if (Math.abs(positions[i3 + 1]) > bound) velocities[i3 + 1] *= -1;
      if (Math.abs(positions[i3 + 2]) > bound) velocities[i3 + 2] *= -1;
    }
    
    geometry.attributes.position.needsUpdate = true;
    this.particles.material.uniforms.time.value = time;
  }

  updateHaze(time) {
    this.hazePlanes.forEach((haze, index) => {
      haze.rotation.z += haze.userData.rotationSpeed;
      haze.position.y = Math.sin(time * haze.userData.floatSpeed + haze.userData.floatOffset) * 0.5;
    });
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    const time = performance.now() * 0.001;
    
    this.updateParticles(time);
    this.updateHaze(time);
    
    this.renderer.render(this.scene, this.camera);
  }

  async transitionToCharacter(characterKey) {
    const character = CHARACTERS[characterKey];
    if (!character || this.currentCharacter === characterKey) return;
    
    const tl = gsap.timeline();
    
    // Animate fog density and color
    tl.to(this.scene.fog, {
      density: CONFIG.baseFogDensity * 1.5,
      duration: CONFIG.transitionDuration * 0.4,
      ease: 'power2.in'
    }, 0);
    
    tl.to(this.scene.fog.color, {
      r: new THREE.Color(character.accentHex).r * 0.15,
      g: new THREE.Color(character.accentHex).g * 0.15,
      b: new THREE.Color(character.accentHex).b * 0.15,
      duration: CONFIG.transitionDuration,
      ease: 'power4.inOut'
    }, 0);
    
    // Morph lighting to character accent color
    tl.to(this.lights.key.color, {
      r: new THREE.Color(character.accentHex).r,
      g: new THREE.Color(character.accentHex).g,
      b: new THREE.Color(character.accentHex).b,
      duration: CONFIG.transitionDuration,
      ease: 'power4.inOut'
    }, 0);
    
    tl.to(this.lights.key, {
      intensity: 1.2,
      duration: CONFIG.transitionDuration,
      ease: 'power4.inOut'
    }, 0);
    
    tl.to(this.lights.fill.color, {
      r: new THREE.Color(character.accentHex).r * 0.3,
      g: new THREE.Color(character.accentHex).g * 0.3,
      b: new THREE.Color(character.accentHex).b * 0.3,
      duration: CONFIG.transitionDuration,
      ease: 'power4.inOut'
    }, 0);
    
    tl.to(this.lights.rim.color, {
      r: new THREE.Color(character.accentHex).r * 0.6,
      g: new THREE.Color(character.accentHex).g * 0.6,
      b: new THREE.Color(character.accentHex).b * 0.6,
      duration: CONFIG.transitionDuration,
      ease: 'power4.inOut'
    }, 0);
    
    // Camera lens focus pull effect
    tl.to(this.camera.position, {
      z: CONFIG.cameraZ - 1,
      duration: CONFIG.transitionDuration * 0.5,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1
    }, 0);
    
    // CSS blur overlay for cinematic focus effect
    const blurOverlay = document.querySelector('.cinematic-blur-overlay');
    if (blurOverlay) {
      tl.to(blurOverlay, {
        backdropFilter: 'blur(8px)',
        filter: 'blur(8px)',
        duration: CONFIG.transitionDuration * 0.3,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1
      }, 0);
    }
    
    // Return fog to normal
    tl.to(this.scene.fog, {
      density: CONFIG.baseFogDensity,
      duration: CONFIG.transitionDuration * 0.6,
      ease: 'power2.out'
    }, CONFIG.transitionDuration * 0.4);
    
    this.currentCharacter = characterKey;
    
    return tl;
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.renderer.dispose();
    this.particles?.geometry.dispose();
    this.particles?.material.dispose();
    
    this.hazePlanes.forEach(plane => {
      plane.geometry.dispose();
      plane.material.dispose();
    });
  }
}

// ============================================================================
// CINEMATOGRAPHIC STATE MACHINE
// ============================================================================

class StateMachine {
  constructor(webglRenderer, audioManager) {
    this.webgl = webglRenderer;
    this.audio = audioManager;
    this.currentState = 'entry';
    this.activeCharacter = null;
    this.isTransitioning = false;
    
    this.init();
  }

  init() {
    // Setup character section observers
    this.setupIntersectionObserver();
    
    // Setup navigation interactions
    this.setupNavigation();
    
    // Setup interactive elements
    this.setupInteractions();
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.3
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isTransitioning) {
          const characterId = entry.target.id;
          if (CHARACTERS[characterId]) {
            this.transitionToState('character', characterId);
          }
        }
      });
    }, options);
    
    // Observe character sections
    Object.keys(CHARACTERS).forEach(key => {
      const section = document.getElementById(key);
      if (section) {
        this.observer.observe(section);
      }
    });
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        this.audio.playUISound('hover');
      });
      
      link.addEventListener('click', (e) => {
        this.audio.playUISound('click');
        // Smooth scroll handled by Lenis
      });
    });
  }

  setupInteractions() {
    // Palette chips interaction
    document.querySelectorAll('.palette-chip').forEach(chip => {
      chip.addEventListener('mouseenter', () => {
        this.audio.playUISound('hover');
        const characterId = chip.textContent.toLowerCase();
        if (CHARACTERS[characterId] && !this.isTransitioning) {
          this.previewCharacter(characterId);
        }
      });
    });
    
    // Avatar feature cards
    document.querySelectorAll('.avatar-feature').forEach(feature => {
      feature.addEventListener('mouseenter', () => {
        this.audio.playUISound('hover');
      });
    });
  }

  async transitionToState(newState, characterId = null) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    const previousState = this.currentState;
    this.currentState = newState;
    
    if (newState === 'character' && characterId) {
      // Trigger WebGL transition
      await this.webgl.transitionToCharacter(characterId);
      
      // Trigger audio crossfade
      await this.audio.crossfadeToCharacter(characterId);
      
      // Trigger typography reveal
      this.revealTypography(characterId);
      
      this.activeCharacter = characterId;
    }
    
    // Small delay before allowing next transition
    setTimeout(() => {
      this.isTransitioning = false;
    }, CONFIG.transitionDuration * 1000);
  }

  async previewCharacter(characterId) {
    if (this.isTransitioning) return;
    
    // Quick preview without full transition
    const character = CHARACTERS[characterId];
    if (!character) return;
    
    gsap.to(this.webgl.scene.fog.color, {
      r: new THREE.Color(character.accentHex).r * 0.1,
      g: new THREE.Color(character.accentHex).g * 0.1,
      b: new THREE.Color(character.accentHex).b * 0.1,
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  revealTypography(characterId) {
    const section = document.getElementById(characterId);
    if (!section) return;
    
    const heading = section.querySelector('.avatar-copy h3');
    if (!heading) return;
    
    // Split text into letters if not already done
    if (!heading.querySelector('.letter')) {
      const letters = [...heading.textContent];
      heading.textContent = '';
      letters.forEach((letter, index) => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.style.setProperty('--letter-index', index);
        span.textContent = letter === ' ' ? '\u00a0' : letter;
        heading.appendChild(span);
      });
    }
    
    // Staggered reveal animation
    const letterElements = heading.querySelectorAll('.letter');
    
    gsap.fromTo(letterElements,
      {
        opacity: 0,
        filter: 'blur(8px)',
        y: 20
      },
      {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 0.8,
        stagger: 0.03,
        ease: 'power3.out',
        delay: 0.2
      }
    );
    
    // Reveal other text elements
    gsap.fromTo(
      section.querySelectorAll('.avatar-role, .avatar-copy p, .concept-tags'),
      {
        opacity: 0,
        y: 30,
        filter: 'blur(4px)'
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.5
      }
    );
  }
}

// ============================================================================
// SMOOTH SCROLL (LENIS)
// ============================================================================

class ScrollManager {
  constructor() {
    this.lenis = null;
    this.init();
  }

  init() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false
    });
    
    // Sync Lenis with requestAnimationFrame
    const raf = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    
    requestAnimationFrame(raf);
    
    // Integrate with Three.js camera on scroll
    if (window.webglRenderer) {
      this.lenis.on('scroll', ({ scroll, progress }) => {
        // Subtle camera movement based on scroll
        const normalizedScroll = scroll / (document.body.scrollHeight - window.innerHeight);
        window.webglRenderer.camera.position.y = -normalizedScroll * 2;
      });
    }
  }

  scrollTo(target, options = {}) {
    this.lenis.scrollTo(target, {
      offset: options.offset || 0,
      duration: options.duration || 1.5,
      easing: options.easing
    });
  }
}

// ============================================================================
// ENTRY GATE CONTROLLER
// ============================================================================

class EntryGateController {
  constructor(audioManager, stateMachine) {
    this.gate = document.querySelector('.entry-gate');
    this.button = document.querySelector('.gate-button');
    this.audio = audioManager;
    this.stateMachine = stateMachine;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.init();
  }

  init() {
    // Check for skip parameters
    const urlParams = new URLSearchParams(window.location.search);
    const skipIntro = urlParams.get('skipIntro') === '1' || window.location.hash === '#manifiesto';
    
    if (skipIntro) {
      this.skipGate();
      return;
    }
    
    // Bind entry button
    if (this.button && this.gate) {
      this.button.addEventListener('click', () => this.openGate());
    }
    
    // Add hover sound to button
    this.button?.addEventListener('mouseenter', () => {
      this.audio.playUISound('hover');
    });
  }

  async openGate() {
    if (!this.gate) return;
    
    // Play UI click
    this.audio.playUISound('click');
    
    // Animate gate opening
    this.gate.classList.add('is-opening');
    
    // Wait for animation
    await new Promise(resolve => {
      setTimeout(resolve, this.prefersReducedMotion ? 120 : 820);
    });
    
    // Hide gate
    this.gate.classList.add('is-hidden');
    
    // Start ambient audio
    await this.audio.startAmbientDrone();
    
    // Scroll to main content
    document.querySelector('#inicio')?.scrollIntoView({ 
      behavior: this.prefersReducedMotion ? 'auto' : 'smooth' 
    });
    
    // Trigger hero reveal
    this.revealHero();
  }

  skipGate() {
    if (this.gate) {
      this.gate.classList.add('is-hidden');
    }
    this.audio.startAmbientDrone();
    this.revealHero();
  }

  revealHero() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    hero.classList.remove('is-locking');
    hero.classList.add('is-unlocking');
    
    // Hero content reveal timeline
    const tl = gsap.timeline({
      delay: this.prefersReducedMotion ? 0 : 0.64
    });
    
    tl.fromTo(
      ['.hero-editorial-frame', '.hero-content .eyebrow', '.hero-content h1', '.hero-copy', '.hero-actions'],
      {
        autoAlpha: 0,
        y: 30,
        filter: 'blur(10px)'
      },
      {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.35,
        ease: 'power3.out',
        stagger: 0.08
      }
    );
    
    setTimeout(() => {
      hero.classList.remove('is-unlocking');
      hero.classList.add('is-unlocked');
    }, this.prefersReducedMotion ? 80 : 1300);
  }
}

// ============================================================================
// CAROUSEL CONTROLLER
// ============================================================================

class CarouselController {
  constructor() {
    this.carousels = document.querySelectorAll('[data-carousel]');
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.init();
  }

  init() {
    this.carousels.forEach(carousel => {
      this.setupCarousel(carousel);
    });
  }

  setupCarousel(carousel) {
    const panels = Number(carousel.dataset.panels || 5);
    const track = carousel.querySelector('.carousel-track');
    const frame = carousel.querySelector('.carousel-window');
    const previous = carousel.querySelector('.prev');
    const next = carousel.querySelector('.next');
    const dots = carousel.querySelector('.dots');
    let active = 0;
    
    carousel.tabIndex = 0;
    track.style.setProperty('--panels', panels);
    
    const render = () => {
      track.style.setProperty('--active', active);
      dots.querySelectorAll('.dot').forEach((dot, index) => {
        dot.setAttribute('aria-current', String(index === active));
      });
    };
    
    // Create dots
    for (let index = 0; index < panels; index += 1) {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ir al panel ${index + 1}`);
      dot.addEventListener('click', () => {
        active = index;
        render();
      });
      dots.appendChild(dot);
    }
    
    previous.addEventListener('click', () => {
      active = (active - 1 + panels) % panels;
      render();
    });
    
    next.addEventListener('click', () => {
      active = (active + 1) % panels;
      render();
    });
    
    // 3D tilt effect on mouse move
    if (!this.prefersReducedMotion) {
      frame.addEventListener('pointermove', (event) => {
        const rect = frame.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        
        frame.style.setProperty('--tilt-x', `${((x - 0.5) * 8).toFixed(2)}deg`);
        frame.style.setProperty('--tilt-y', `${((0.5 - y) * 7).toFixed(2)}deg`);
      });
      
      frame.addEventListener('pointerleave', () => {
        frame.style.setProperty('--tilt-x', '0deg');
        frame.style.setProperty('--tilt-y', '0deg');
      });
    }
    
    // Keyboard navigation
    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        active = (active - 1 + panels) % panels;
        render();
      }
      if (event.key === 'ArrowRight') {
        active = (active + 1) % panels;
        render();
      }
    });
    
    render();
  }
}

// ============================================================================
// STATS CONTROLLER (Admin Mode)
// ============================================================================

class StatsController {
  constructor() {
    this.controls = document.querySelectorAll('.stat-control');
    this.adminMode = new URLSearchParams(window.location.search).get('admin') === 'pulchro';
    
    this.init();
  }

  init() {
    this.controls.forEach((control, index) => {
      this.setupControl(control, index);
    });
  }

  setupControl(control, index) {
    const input = control.querySelector('input[type="range"]');
    const output = control.querySelector('output');
    
    if (!input || !output) return;
    
    const avatar = control.closest('.avatar-feature');
    const avatarName = avatar?.className.match(/\b(ander|asher|leo|kim|bodhi)\b/)?.[1] || 'avatar';
    const storageKey = `5pm-stat-${avatarName}-${index}`;
    
    input.disabled = !this.adminMode;
    
    // Load saved value
    if (this.adminMode) {
      try {
        const savedValue = localStorage.getItem(storageKey);
        if (savedValue !== null) {
          input.value = savedValue;
        }
      } catch (e) {
        // Privacy modes may block localStorage
      }
    }
    
    const updateStat = () => {
      const min = Number(input.min || 0);
      const max = Number(input.max || 100);
      const value = Number(input.value || 0);
      const percent = ((value - min) / (max - min)) * 100;
      
      output.value = value;
      output.textContent = value;
      control.style.setProperty('--stat-percent', `${percent}%`);
      
      if (this.adminMode) {
        try {
          localStorage.setItem(storageKey, String(value));
        } catch (e) {
          // Ignore storage errors
        }
      }
    };
    
    if (this.adminMode) {
      input.addEventListener('input', updateStat);
    }
    
    updateStat();
  }
}

// ============================================================================
// CURSOR CONTROLLER
// ============================================================================

class CursorController {
  constructor() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!this.prefersReducedMotion) {
      this.init();
    }
  }

  init() {
    const avatarLights = {
      ander: 'rgba(0, 168, 117, 0.56)',
      asher: 'rgba(216, 210, 196, 0.5)',
      leo: 'rgba(167, 167, 162, 0.48)',
      kim: 'rgba(94, 113, 128, 0.5)',
      bodhi: 'rgba(199, 15, 24, 0.58)'
    };
    
    // Parallax cursor movement
    document.addEventListener('pointermove', (event) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      const root = document.documentElement.style;
      
      root.setProperty('--cursor-x', `${event.clientX}px`);
      root.setProperty('--cursor-y', `${event.clientY}px`);
      root.setProperty('--hero-x', `${(x * 12).toFixed(2)}px`);
      root.setProperty('--hero-y', `${(y * 8).toFixed(2)}px`);
      root.setProperty('--hero-bg-x', `${(x * -18).toFixed(2)}px`);
      root.setProperty('--hero-bg-y', `${(y * -14).toFixed(2)}px`);
      root.setProperty('--hero-emblem-x', `${(x * 24).toFixed(2)}px`);
      root.setProperty('--hero-emblem-y', `${(y * 18).toFixed(2)}px`);
      root.setProperty('--slab-gold-x', `${(x * -22).toFixed(2)}px`);
      root.setProperty('--slab-gold-y', `${(y * -18).toFixed(2)}px`);
      root.setProperty('--slab-green-x', `${(x * -35).toFixed(2)}px`);
      root.setProperty('--slab-green-y', `${(y * 22).toFixed(2)}px`);
      root.setProperty('--slab-white-x', `${(x * 18).toFixed(2)}px`);
      root.setProperty('--slab-white-y', `${(y * -24).toFixed(2)}px`);
      root.setProperty('--slab-red-x', `${(x * 26).toFixed(2)}px`);
      root.setProperty('--slab-red-y', `${(y * 20).toFixed(2)}px`);
      root.setProperty('--slab-black-x', `${(x * -18).toFixed(2)}px`);
      root.setProperty('--slab-black-y', `${(y * 24).toFixed(2)}px`);
      root.setProperty('--slab-grey-x', `${(x * 30).toFixed(2)}px`);
      root.setProperty('--slab-grey-y', `${(y * -16).toFixed(2)}px`);
    });
    
    // Avatar hover effects
    document.querySelectorAll('.avatar-feature').forEach((feature) => {
      const lightKey = Object.keys(avatarLights).find((key) => feature.classList.contains(key));
      
      feature.addEventListener('pointerenter', () => {
        document.documentElement.style.setProperty('--cursor-color', avatarLights[lightKey]);
        document.documentElement.style.setProperty('--cursor-opacity', '1');
      });
      
      feature.addEventListener('pointerleave', () => {
        document.documentElement.style.setProperty('--cursor-opacity', '0');
      });
    });
    
    // Palette chip hover effects
    document.querySelectorAll('[data-cursor-color]').forEach((item) => {
      item.addEventListener('pointerenter', () => {
        document.documentElement.style.setProperty('--cursor-color', item.dataset.cursorColor);
        document.documentElement.style.setProperty('--cursor-opacity', '1');
      });
      
      item.addEventListener('pointerleave', () => {
        document.documentElement.style.setProperty('--cursor-opacity', '0');
      });
    });
  }
}

// ============================================================================
// REVEAL ANIMATIONS
// ============================================================================

class RevealController {
  constructor() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.revealTargets = document.querySelectorAll('.intro-grid, .avatar-feature, .workflow-grid article, .archive-layout');
    
    this.init();
  }

  init() {
    if (!this.prefersReducedMotion && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.16 }
      );
      
      this.revealTargets.forEach((target) => {
        target.dataset.reveal = '';
        observer.observe(target);
      });
    } else {
      this.revealTargets.forEach((target) => {
        target.classList.add('is-visible');
      });
    }
    
    // Name letter reveals
    this.setupNameReveals();
  }

  setupNameReveals() {
    // Split avatar names into letters
    document.querySelectorAll('.avatar-copy h3').forEach((heading) => {
      if (heading.querySelector('.letter')) return; // Already processed
      
      const letters = [...heading.textContent];
      heading.textContent = '';
      
      letters.forEach((letter, index) => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.style.setProperty('--letter-index', index);
        span.textContent = letter === ' ' ? '\u00a0' : letter;
        heading.appendChild(span);
      });
    });
    
    // Observe for reveal
    const nameTargets = document.querySelectorAll('.avatar-feature');
    
    if (!this.prefersReducedMotion && 'IntersectionObserver' in window) {
      const nameObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-name-visible');
              nameObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.28 }
      );
      
      nameTargets.forEach((target) => nameObserver.observe(target));
    } else {
      nameTargets.forEach((target) => target.classList.add('is-name-visible'));
    }
  }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

class Application {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.audioManager = null;
    this.webglRenderer = null;
    this.stateMachine = null;
    this.scrollManager = null;
    
    this.init();
  }

  async init() {
    console.log('🎵 5PM: Initializing application...');
    
    // Initialize Audio Manager first (needs user interaction)
    this.audioManager = new AudioManager();
    await this.audioManager.initialize();
    
    // Initialize WebGL Renderer
    if (this.canvas) {
      this.webglRenderer = new WebGLRenderer(this.canvas);
      window.webglRenderer = this.webglRenderer; // Expose for scroll integration
    }
    
    // Initialize State Machine
    this.stateMachine = new StateMachine(this.webglRenderer, this.audioManager);
    
    // Initialize Scroll Manager (Lenis)
    this.scrollManager = new ScrollManager();
    
    // Initialize Entry Gate Controller
    new EntryGateController(this.audioManager, this.stateMachine);
    
    // Initialize Carousel Controller
    new CarouselController();
    
    // Initialize Stats Controller
    new StatsController();
    
    // Initialize Cursor Controller
    new CursorController();
    
    // Initialize Reveal Animations
    new RevealController();
    
    console.log('🎵 5PM: Application initialized successfully.');
  }
}

// ============================================================================
// BOOTSTRAP
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  window.app = new Application();
});

// Export for potential module usage
export { Application, WebGLRenderer, AudioManager, StateMachine };
