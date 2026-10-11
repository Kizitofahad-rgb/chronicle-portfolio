import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CosmicCanvasProps {
  isPlaying?: boolean;
  audioFrequency?: number;
}

export function CosmicCanvas({ isPlaying = false, audioFrequency = 0 }: CosmicCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const audioFreqRef = useRef(audioFrequency);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    audioFreqRef.current = audioFrequency;
  }, [isPlaying, audioFrequency]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060914, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 85;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. STARFIELD / COSMIC PARTICLES
    const particleCount = 1100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color('#e7b73d'); // Gold
    const color2 = new THREE.Color('#00f0ff'); // Cyan
    const color3 = new THREE.Color('#8b5cf6'); // Violet

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 320;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 320;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 260;

      const mixed = Math.random() < 0.4 ? color1 : Math.random() < 0.7 ? color2 : color3;
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMaterial = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, pMaterial);
    scene.add(particles);

    // 2. CENTRAL FLOATING HOLOGRAPHIC GEOMETRY
    const coreGroup = new THREE.Group();
    coreGroup.position.set(24, 8, -10);

    // Outer wireframe icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(18, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    coreGroup.add(icoMesh);

    // Inner wireframe sphere
    const innerGeo = new THREE.SphereGeometry(10, 16, 12);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xe7b73d,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // Orbiting rings
    const ringGeo1 = new THREE.TorusGeometry(26, 0.25, 8, 80);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.3,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(32, 0.2, 8, 80);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xe7b73d,
      transparent: true,
      opacity: 0.22,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring2);

    scene.add(coreGroup);

    // Mouse movement reactivity
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse parallax
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      camera.position.x = targetX * 12;
      camera.position.y = -targetY * 10;
      camera.lookAt(scene.position);

      // Rotate particle cloud gently
      particles.rotation.y = time * 0.035;
      particles.rotation.x = Math.sin(time * 0.02) * 0.05;

      // Audio beat pulsing calculation
      const freqNorm = Math.min(1, Math.max(0, audioFreqRef.current / 255));
      const audioPulse = isPlayingRef.current ? 1 + freqNorm * 0.45 : 1;

      // Rotate holographic core
      coreGroup.rotation.y = time * 0.14;
      coreGroup.rotation.x = time * 0.08;
      ring1.rotation.z = time * 0.25;
      ring2.rotation.x = time * -0.18;

      // Scale dynamically with beat
      icoMesh.scale.setScalar(audioPulse);
      innerMesh.scale.setScalar(1 + (audioPulse - 1) * 0.6);
      icoMat.opacity = 0.22 + freqNorm * 0.35;
      innerMat.opacity = 0.3 + freqNorm * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      pMaterial.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
