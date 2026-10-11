import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GotAstrolabeCanvasProps {
  isPlaying?: boolean;
}

export function GotAstrolabeCanvas({ isPlaying = false }: GotAstrolabeCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene & Fog - Deep obsidian-bronze atmospheric fog like GoT intro
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06080f, 0.0022);

    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      1200,
    );
    camera.position.set(0, 14, 90);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Master World Group
    const astrolabeGroup = new THREE.Group();
    scene.add(astrolabeGroup);

    // ==========================================
    // 1. THE CENTRAL BURNING SOLAR CORE (GoT Sun)
    // ==========================================
    const sunGroup = new THREE.Group();
    astrolabeGroup.add(sunGroup);

    // Inner glowing sphere
    const sunGeo = new THREE.SphereGeometry(6.5, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffcc33,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    // Sun corona flare rings (rays)
    const coronaGeo = new THREE.RingGeometry(7, 13, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    sunGroup.add(coronaMesh);

    // Point lights for brass reflections
    const sunLight = new THREE.PointLight(0xffb733, 4, 300);
    sunGroup.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x2a2215, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffdd88, 1.8);
    dirLight.position.set(50, 80, 40);
    scene.add(dirLight);

    // ==========================================
    // 2. CONCENTRIC ENGRAVED ASTROLABE RINGS
    // ==========================================
    // Ring 1 (Inner Astrolabe Band)
    const ring1Group = new THREE.Group();
    const ring1Geo = new THREE.TorusGeometry(18, 0.7, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xd4a742,
      roughness: 0.3,
      metalness: 0.85,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Group.add(ring1Mesh);

    // Add gear teeth to Ring 1
    const toothGeo = new THREE.BoxGeometry(0.8, 1.2, 0.6);
    const toothMat = new THREE.MeshStandardMaterial({ color: 0x9c7a23, metalness: 0.8, roughness: 0.4 });
    const toothCount = 36;
    for (let i = 0; i < toothCount; i++) {
      const angle = (i / toothCount) * Math.PI * 2;
      const tooth = new THREE.Mesh(toothGeo, toothMat);
      tooth.position.set(Math.cos(angle) * 18, Math.sin(angle) * 18, 0);
      tooth.rotation.z = angle;
      ring1Group.add(tooth);
    }
    astrolabeGroup.add(ring1Group);

    // Ring 2 (Middle Gyroscope Band)
    const ring2Group = new THREE.Group();
    const ring2Geo = new THREE.TorusGeometry(26, 0.85, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xb38628,
      roughness: 0.35,
      metalness: 0.88,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Group.add(ring2Mesh);

    // Relief notches on Ring 2
    for (let i = 0; i < 48; i++) {
      const angle = (i / 48) * Math.PI * 2;
      const notch = new THREE.Mesh(toothGeo, toothMat);
      notch.position.set(Math.cos(angle) * 26, Math.sin(angle) * 26, 0);
      notch.rotation.z = angle;
      ring2Group.add(notch);
    }
    astrolabeGroup.add(ring2Group);

    // Ring 3 (Outer Great Realm Band - Armillary Equator)
    const ring3Group = new THREE.Group();
    const ring3Geo = new THREE.TorusGeometry(36, 1.1, 16, 120);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0x8f6a1e,
      roughness: 0.4,
      metalness: 0.9,
    });
    const ring3Mesh = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3Group.add(ring3Mesh);
    astrolabeGroup.add(ring3Group);

    // Ring 4 (Ecliptic Ring - Massive Celestial Meridian)
    const ring4Group = new THREE.Group();
    const ring4Geo = new THREE.TorusGeometry(48, 0.9, 16, 120);
    const ring4Mat = new THREE.MeshStandardMaterial({
      color: 0xd4a742,
      roughness: 0.25,
      metalness: 0.9,
    });
    const ring4Mesh = new THREE.Mesh(ring4Geo, ring4Mat);
    ring4Group.add(ring4Mesh);
    astrolabeGroup.add(ring4Group);

    // ==========================================
    // 3. MECHANICAL RISING CLOCKWORK TOWERS (GoT Castle Keeps)
    // ==========================================
    // 4 mechanical keeps situated around the periphery that rise like in the GoT intro
    const towersGroup = new THREE.Group();
    astrolabeGroup.add(towersGroup);

    interface CastleTower {
      base: THREE.Mesh;
      middle: THREE.Mesh;
      spire: THREE.Mesh;
      cogs: THREE.Mesh;
      targetY: number;
      speed: number;
    }
    const castleTowers: CastleTower[] = [];

    const castleCoords = [
      { x: 38, z: -15, scale: 1.1 },
      { x: -36, z: 12, scale: 0.95 },
      { x: 18, z: 32, scale: 0.85 },
      { x: -22, z: -32, scale: 1.05 },
    ];

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x3d352a,
      roughness: 0.7,
      metalness: 0.2,
    });
    const goldCapMat = new THREE.MeshStandardMaterial({
      color: 0xe7b73d,
      roughness: 0.2,
      metalness: 0.9,
    });
    const cogMat = new THREE.MeshStandardMaterial({
      color: 0x73551d,
      roughness: 0.4,
      metalness: 0.85,
    });

    castleCoords.forEach((coord, idx) => {
      const keep = new THREE.Group();
      keep.position.set(coord.x, -16, coord.z);
      keep.scale.setScalar(coord.scale);

      // Rotating gear base
      const cogGeo = new THREE.CylinderGeometry(5.5, 5.5, 0.8, 24);
      const cog = new THREE.Mesh(cogGeo, cogMat);
      cog.position.y = 0;
      keep.add(cog);

      // Lower cylinder tower base
      const baseGeo = new THREE.CylinderGeometry(3.5, 4, 8, 12);
      const base = new THREE.Mesh(baseGeo, stoneMat);
      base.position.y = 4;
      keep.add(base);

      // Middle telescoping tower
      const midGeo = new THREE.CylinderGeometry(2.4, 2.8, 8, 10);
      const middle = new THREE.Mesh(midGeo, stoneMat);
      middle.position.y = 11;
      keep.add(middle);

      // Golden spire / battlement
      const spireGeo = new THREE.ConeGeometry(2, 6, 8);
      const spire = new THREE.Mesh(spireGeo, goldCapMat);
      spire.position.y = 17;
      keep.add(spire);

      towersGroup.add(keep);

      castleTowers.push({
        base,
        middle,
        spire,
        cogs: cog,
        targetY: 0,
        speed: 0.8 + idx * 0.2,
      });
    });

    // ==========================================
    // 4. FLOATING GOLDEN EMBERS & ASH
    // ==========================================
    const emberCount = 850;
    const emberGeo = new THREE.BufferGeometry();
    const emberPos = new Float32Array(emberCount * 3);
    const emberColor = new Float32Array(emberCount * 3);

    const cGold = new THREE.Color(0xffcc44);
    const cAmber = new THREE.Color(0xff7722);
    const cSpark = new THREE.Color(0xffeebb);

    for (let i = 0; i < emberCount; i++) {
      emberPos[i * 3] = (Math.random() - 0.5) * 280;
      emberPos[i * 3 + 1] = (Math.random() - 0.5) * 220;
      emberPos[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const pick = Math.random();
      const col = pick < 0.5 ? cGold : pick < 0.8 ? cAmber : cSpark;
      emberColor[i * 3] = col.r;
      emberColor[i * 3 + 1] = col.g;
      emberColor[i * 3 + 2] = col.b;
    }

    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    emberGeo.setAttribute('color', new THREE.BufferAttribute(emberColor, 3));

    const emberMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // ==========================================
    // 5. INTERACTION & CAMERA SMOOTH CHOREOGRAPHY
    // ==========================================
    let mouseX = 0;
    let mouseY = 0;
    let targetCamX = 0;
    let targetCamY = 14;
    let scrollY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onScroll = () => {
      scrollY = window.scrollY || document.documentElement.scrollTop;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const speedMult = isPlayingRef.current ? 1.35 : 1.0;

      // Rotate Astrolabe rings along varying gyroscopic axes
      ring1Group.rotation.x = time * 0.18 * speedMult;
      ring1Group.rotation.y = time * 0.25 * speedMult;

      ring2Group.rotation.y = time * -0.15 * speedMult;
      ring2Group.rotation.z = time * 0.22 * speedMult;

      ring3Group.rotation.x = Math.PI / 4 + Math.sin(time * 0.12 * speedMult) * 0.4;
      ring3Group.rotation.z = time * -0.1 * speedMult;

      ring4Group.rotation.y = Math.PI / 3 + time * 0.08 * speedMult;
      ring4Group.rotation.x = time * 0.06 * speedMult;

      // Pulsing solar flare
      const sunPulse = 1 + Math.sin(time * 2.5) * 0.07;
      sunMesh.scale.setScalar(sunPulse);
      coronaMesh.rotation.z = time * 0.35;
      coronaMesh.scale.setScalar(1 + Math.sin(time * 1.8) * 0.12);

      // Telescoping Castle Keeps & Rotating Gears
      castleTowers.forEach((tower, idx) => {
        tower.cogs.rotation.y += 0.015 * tower.speed * speedMult;
        // Mechanical rising motion synchronized to rhythm
        const wave = (Math.sin(time * 0.9 * tower.speed + idx * 1.5) + 1) * 0.5;
        tower.middle.position.y = 8 + wave * 4;
        tower.spire.position.y = 13 + wave * 5.5;
        tower.middle.rotation.y = time * 0.1 * tower.speed;
      });

      // Drifting embers rising upward
      const positions = emberGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < emberCount; i++) {
        positions[i * 3 + 1] += 0.16 * speedMult; // Rise upwards
        positions[i * 3] += Math.sin(time + i) * 0.04;
        if (positions[i * 3 + 1] > 110) {
          positions[i * 3 + 1] = -110;
        }
      }
      emberGeo.attributes.position.needsUpdate = true;

      // Cinematic Eye-Lock Camera Swoop (combining scroll + mouse + GoT tilt)
      const scrollFactor = Math.min(scrollY / 1200, 2.5);
      targetCamX += (mouseX * 18 - targetCamX) * 0.04;
      targetCamY += (14 - mouseY * 12 - scrollFactor * 8 - targetCamY) * 0.04;

      camera.position.x = targetCamX;
      camera.position.y = targetCamY;
      camera.position.z = 90 - scrollFactor * 10;
      camera.lookAt(0, -scrollFactor * 4, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
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
