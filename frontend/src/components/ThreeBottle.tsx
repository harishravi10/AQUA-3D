import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { BottleStyle } from '../types';
import { Sparkles, RotateCw, Zap, Volume2, ShieldCheck } from 'lucide-react';

interface ThreeBottleProps {
  currentMl: number;
  targetMl: number;
  bottleCapacity: number;
  bottleStyle: BottleStyle;
  lowPowerMode: boolean;
  onStyleChange?: (style: BottleStyle) => void;
}

export const ThreeBottle: React.FC<ThreeBottleProps> = ({
  currentMl,
  targetMl,
  bottleCapacity,
  bottleStyle,
  lowPowerMode,
  onStyleChange,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [useFallback, setUseFallback] = useState<boolean>(false);
  const [rippling, setRippling] = useState<boolean>(false);
  const prevPercentageRef = useRef<number>(0);

  // Clamped ratio for visual liquid fill (0.0 to 1.0)
  const fillRatio = Math.max(0, Math.min(1.0, targetMl > 0 ? currentMl / targetMl : 0));
  const completionPercentage = targetMl > 0 ? Math.round((currentMl / targetMl) * 100) : 0;
  const remainingMl = Math.max(0, targetMl - currentMl);

  // Check milestone celebration
  useEffect(() => {
    if (completionPercentage >= 100 && prevPercentageRef.current < 100) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#38bdf8', '#0284c7', '#34d399', '#ffffff'],
        });
      } catch (e) {
        // ignore
      }
    }
    prevPercentageRef.current = completionPercentage;
  }, [completionPercentage]);

  // WebGL 3D Scene Effect
  useEffect(() => {
    // Detect WebGL
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    if (useFallback || (lowPowerMode && !webglSupported)) return;

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 420;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 4.8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !lowPowerMode,
      alpha: true,
      powerPreference: lowPowerMode ? 'low-power' : 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPowerMode ? 1 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight.position.set(3, 4, 3);
    scene.add(dirLight);

    const cyanPoint = new THREE.PointLight(0x06b6d4, 3.0, 10);
    cyanPoint.position.set(-2, 1, 2);
    scene.add(cyanPoint);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.8);
    rimLight.position.set(0, -3, -3);
    scene.add(rimLight);

    // Root Bottle Group for interactive rotation
    const bottleGroup = new THREE.Group();
    scene.add(bottleGroup);

    // Glass Material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 0.35,
      transparent: true,
      roughness: 0.08,
      ior: 1.48,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    // Metallic Cap Material
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25,
    });

    // Accent Ring Material
    const neonRingMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
    });

    // Liquid Material
    const liquidMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transmission: 0.5,
      opacity: 0.82,
      transparent: true,
      roughness: 0.15,
      ior: 1.33,
      emissive: 0x083344,
      emissiveIntensity: 0.3,
    });

    // BOTTLE GEOMETRY CONFIGURATION
    const bottleHeight = 2.4;
    const bottleRadius = bottleStyle === 'crystal_decanter' ? 0.75 : 0.65;
    const radialSegments = lowPowerMode ? 24 : 48;

    // 1. Outer Glass Cylinder
    let glassGeo: THREE.BufferGeometry;
    if (bottleStyle === 'crystal_decanter') {
      glassGeo = new THREE.CylinderGeometry(bottleRadius * 0.9, bottleRadius * 1.1, bottleHeight, 8);
    } else if (bottleStyle === 'smart_tumbler') {
      glassGeo = new THREE.CylinderGeometry(bottleRadius * 1.05, bottleRadius * 0.85, bottleHeight, radialSegments);
    } else {
      glassGeo = new THREE.CylinderGeometry(bottleRadius, bottleRadius, bottleHeight, radialSegments);
    }

    const glassMesh = new THREE.Mesh(glassGeo, glassMaterial);
    glassMesh.position.y = 0;
    bottleGroup.add(glassMesh);

    // 2. Bottle Neck & Cap
    const neckGeo = new THREE.CylinderGeometry(0.32, 0.35, 0.4, radialSegments);
    const neckMesh = new THREE.Mesh(neckGeo, glassMaterial);
    neckMesh.position.y = bottleHeight / 2 + 0.2;
    bottleGroup.add(neckMesh);

    const capGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.3, radialSegments);
    const capMesh = new THREE.Mesh(capGeo, capMaterial);
    capMesh.position.y = bottleHeight / 2 + 0.45;
    bottleGroup.add(capMesh);

    // Smart LED indicator ring on cap
    const ringGeo = new THREE.TorusGeometry(0.345, 0.02, 16, radialSegments);
    ringGeo.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, neonRingMaterial);
    ringMesh.position.y = bottleHeight / 2 + 0.35;
    bottleGroup.add(ringMesh);

    // 3. Liquid Cylinder (Height dynamically scaled based on fillRatio)
    const liquidMaxHeight = bottleHeight * 0.94;
    const liquidGeo = new THREE.CylinderGeometry(
      bottleRadius * 0.96,
      bottleRadius * 0.96,
      liquidMaxHeight,
      radialSegments
    );
    // Shift geometry origin to base so scaleY expands upwards
    liquidGeo.translate(0, liquidMaxHeight / 2, 0);

    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMaterial);
    liquidMesh.position.y = -bottleHeight / 2 + 0.04;
    // Initial scale
    liquidMesh.scale.set(1, Math.max(0.001, fillRatio), 1);
    bottleGroup.add(liquidMesh);

    // 4. Liquid Surface Disc
    const discGeo = new THREE.CircleGeometry(bottleRadius * 0.95, radialSegments);
    discGeo.rotateX(-Math.PI / 2);
    const discMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1,
    });
    const surfaceDisc = new THREE.Mesh(discGeo, discMaterial);
    surfaceDisc.position.y = -bottleHeight / 2 + 0.04 + liquidMaxHeight * fillRatio;
    surfaceDisc.visible = fillRatio > 0.01;
    bottleGroup.add(surfaceDisc);

    // 5. Rising Bubbles inside liquid
    const bubbleCount = lowPowerMode ? 10 : 22;
    const bubbleGroup = new THREE.Group();
    bottleGroup.add(bubbleGroup);

    const bubbles: { mesh: THREE.Mesh; speed: number; startY: number; maxY: number; phase: number }[] = [];
    const bubbleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      transmission: 0.95,
      opacity: 0.7,
      transparent: true,
      roughness: 0.05,
    });

    for (let i = 0; i < bubbleCount; i++) {
      const radius = 0.02 + Math.random() * 0.035;
      const bGeo = new THREE.SphereGeometry(radius, 8, 8);
      const bMesh = new THREE.Mesh(bGeo, bubbleMaterial);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (bottleRadius * 0.7);
      bMesh.position.x = Math.cos(angle) * dist;
      bMesh.position.z = Math.sin(angle) * dist;
      const startY = -bottleHeight / 2 + 0.1 + Math.random() * (liquidMaxHeight * Math.max(0.1, fillRatio));
      bMesh.position.y = startY;

      bubbleGroup.add(bMesh);
      bubbles.push({
        mesh: bMesh,
        speed: 0.006 + Math.random() * 0.008,
        startY: -bottleHeight / 2 + 0.1,
        maxY: -bottleHeight / 2 + liquidMaxHeight * Math.max(0.05, fillRatio),
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Interactive Drag to Rotate
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.004;
      targetRotationX = Math.max(-0.4, Math.min(0.4, targetRotationX));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support for mobile devices
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.004;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Click on bottle to trigger gentle ripple slosh
    const onClickBottle = () => {
      setRippling(true);
      targetRotationY += 0.25;
      setTimeout(() => setRippling(false), 800);
    };
    domElement.addEventListener('click', onClickBottle);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth rotation interpolation
      bottleGroup.rotation.y += (targetRotationY - bottleGroup.rotation.y) * 0.1;
      bottleGroup.rotation.x += (targetRotationX - bottleGroup.rotation.x) * 0.1;

      // Idle gentle floating and wave slosh
      bottleGroup.position.y = Math.sin(elapsed * 1.5) * 0.04;
      if (!isDragging) {
        targetRotationY += 0.003; // Gentle auto idle spin
      }

      // Animate Liquid Level Interpolation towards fillRatio
      const targetScaleY = Math.max(0.001, fillRatio);
      liquidMesh.scale.y += (targetScaleY - liquidMesh.scale.y) * 0.08;

      const currentLiquidTop = -bottleHeight / 2 + 0.04 + liquidMaxHeight * liquidMesh.scale.y;
      surfaceDisc.position.y = currentLiquidTop;
      surfaceDisc.visible = liquidMesh.scale.y > 0.02;

      // Animate Surface Ripple
      if (surfaceDisc.visible) {
        surfaceDisc.rotation.z = elapsed * 0.5;
        const waveAmp = rippling ? 0.02 : 0.006;
        surfaceDisc.position.y = currentLiquidTop + Math.sin(elapsed * 4) * waveAmp;
      }

      // Animate Rising Bubbles
      bubbleGroup.visible = liquidMesh.scale.y > 0.08;
      if (bubbleGroup.visible) {
        bubbles.forEach((b) => {
          b.mesh.position.y += b.speed;
          b.mesh.position.x += Math.sin(elapsed * 2 + b.phase) * 0.002;
          const maxAllowedY = -bottleHeight / 2 + liquidMaxHeight * liquidMesh.scale.y - 0.05;
          if (b.mesh.position.y > maxAllowedY) {
            b.mesh.position.y = b.startY;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      domElement.removeEventListener('click', onClickBottle);

      renderer.dispose();
      glassGeo.dispose();
      liquidGeo.dispose();
      discGeo.dispose();
      neckGeo.dispose();
      capGeo.dispose();
      ringGeo.dispose();
      glassMaterial.dispose();
      liquidMaterial.dispose();
      capMaterial.dispose();
      neonRingMaterial.dispose();
      discMaterial.dispose();
      bubbleMaterial.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [fillRatio, bottleStyle, lowPowerMode, useFallback, webglSupported]);

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* 3D Container or CSS Fallback */}
      <div
        className="relative w-full max-w-[360px] h-[390px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        title="Click to ripple, drag to rotate 3D bottle"
      >
        {!webglSupported || useFallback ? (
          /* High-Fidelity CSS/SVG Animated Liquid Fallback */
          <div className="relative w-48 h-80 rounded-3xl border-4 border-cyan-400/40 bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-2xl flex flex-col justify-end p-2">
            {/* Bottle neck & cap */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-6 bg-slate-700 rounded-t-lg border-2 border-cyan-400/50"></div>
            {/* Measurement Ticks */}
            <div className="absolute left-2 top-8 bottom-8 flex flex-col justify-between text-[10px] text-cyan-300/50 font-mono select-none">
              <span>{bottleCapacity} ml</span>
              <span>{Math.round(bottleCapacity * 0.75)} ml</span>
              <span>{Math.round(bottleCapacity * 0.5)} ml</span>
              <span>{Math.round(bottleCapacity * 0.25)} ml</span>
            </div>
            {/* Animated Liquid */}
            <div
              className="w-full bg-gradient-to-t from-cyan-600 to-sky-400 rounded-2xl relative transition-all duration-700 ease-out overflow-hidden"
              style={{ height: `${Math.max(4, fillRatio * 100)}%` }}
            >
              {/* Wave ripples */}
              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
              {/* Rising bubbles */}
              <div className="absolute bottom-2 left-1/4 w-2 h-2 rounded-full bg-white/50 animate-bubble-1"></div>
              <div className="absolute bottom-1 left-2/3 w-3 h-3 rounded-full bg-white/40 animate-bubble-2"></div>
            </div>
            {/* Glass shine reflection */}
            <div className="absolute top-0 right-4 w-4 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>
          </div>
        ) : (
          <div ref={mountRef} className="w-full h-full flex items-center justify-center" />
        )}

        {/* Milestone Badge Overlay */}
        {completionPercentage >= 100 && (
          <div className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-400/80 text-emerald-300 text-xs px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-lg animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-semibold">Goal Conquered!</span>
          </div>
        )}

        {/* Interactive Helper Overlay */}
        <div className="absolute bottom-2 text-[11px] text-cyan-300/60 flex items-center gap-1.5 bg-slate-900/40 px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none">
          <RotateCw className="w-3 h-3 animate-spin text-cyan-400" />
          <span>Drag to inspect 360° • Click to ripple</span>
        </div>
      </div>

      {/* Progress & Target Stats Row */}
      <div className="w-full max-w-sm mt-3 px-2 flex flex-col items-center">
        <div className="flex items-baseline justify-between w-full mb-1 text-sm">
          <span className="text-slate-400 font-medium">Daily Target</span>
          <span className="text-cyan-300 font-semibold">{targetMl.toLocaleString()} ml</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-cyan-500/20">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, completionPercentage)}%` }}
          />
        </div>

        {/* Key Metrics Footnote */}
        <div className="flex items-center justify-between w-full mt-2 text-xs text-slate-300">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-white glow-text-cyan">{currentMl.toLocaleString()}</span>
            <span className="text-cyan-400 font-medium">ml logged</span>
          </div>
          <div className="text-right">
            {remainingMl > 0 ? (
              <span className="text-slate-400">
                <strong className="text-sky-300">{remainingMl.toLocaleString()} ml</strong> remaining
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Target Achieved!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottle Styles Selector & Mode Controls */}
      <div className="w-full max-w-sm mt-4 flex items-center justify-between gap-2 border-t border-cyan-500/20 pt-3">
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => onStyleChange?.('futuristic_glass')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
              bottleStyle === 'futuristic_glass'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            Glass
          </button>
          <button
            onClick={() => onStyleChange?.('hydro_flask')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
              bottleStyle === 'hydro_flask'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            Flask
          </button>
          <button
            onClick={() => onStyleChange?.('smart_tumbler')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
              bottleStyle === 'smart_tumbler'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            Tumbler
          </button>
          <button
            onClick={() => onStyleChange?.('crystal_decanter')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
              bottleStyle === 'crystal_decanter'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            Decanter
          </button>
        </div>

        {/* Fallback Mode Toggle */}
        <button
          onClick={() => setUseFallback(!useFallback)}
          title={useFallback ? 'Switch to 3D WebGL Mode' : 'Switch to Lightweight CSS Fallback'}
          className="text-[11px] text-slate-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
        >
          {useFallback ? '3D View' : '2D Mode'}
        </button>
      </div>
    </div>
  );
};
