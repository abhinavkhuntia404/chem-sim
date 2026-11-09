import { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Layers,
  Scissors,
  Play,
  Pause,
  AlertTriangle,
  Info,
  Wrench,
} from 'lucide-react';
import type { PumpGeometryData, PumpTelemetry } from '../types';
import { PUMP_COMPONENTS_CLIENT } from '../api';

interface Pump3DViewerProps {
  pump: PumpGeometryData;
  telemetry: PumpTelemetry;
  isRunning: boolean;
  speedRpm: number;
  onToggleRunning?: () => void;
}

export function Pump3DViewer({
  pump,
  telemetry,
  isRunning,
  speedRpm,
  onToggleRunning,
}: Pump3DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<'assembly' | 'exploded' | 'cutaway' | 'flow'>('assembly');
  const [explodePct, setExplodePct] = useState<number>(0);
  const [selectedCompId, setSelectedCompId] = useState<string | null>('impeller');
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1.0);

  // 3D camera angles (in radians)
  const [rotX, setRotX] = useState<number>(0.45); // Pitch
  const [rotY, setRotY] = useState<number>(-0.75); // Yaw
  const isDragging = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Animation state
  const animFrameRef = useRef<number | null>(null);
  const impellerAngleRef = useRef<number>(0);
  const particlesRef = useRef<Array<{ x: number; y: number; z: number; progress: number; speed: number; phase: number }>>([]);

  // Initialize stream particles
  useEffect(() => {
    const pts: Array<{ x: number; y: number; z: number; progress: number; speed: number; phase: number }> = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      pts.push({
        x: 0,
        y: 0,
        z: 0,
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.008,
        phase: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = pts;
  }, []);

  // Mouse interaction for orbit
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => prev + dx * 0.008);
    setRotX((prev) => Math.max(-1.1, Math.min(1.1, prev + dy * 0.008)));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.5, Math.min(2.5, prev - e.deltaY * 0.0015)));
  };

  const handleResetCamera = () => {
    setRotX(0.45);
    setRotY(-0.75);
    setZoom(1.0);
    setExplodePct(0);
    setViewMode('assembly');
  };

  // Rendering loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Background technical grid
    ctx.strokeStyle = '#1e293b22';
    ctx.lineWidth = 1;
    const gridSize = 32;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Advance impeller rotation if running
    if (isRunning) {
      const rotSpeed = (speedRpm / 60) * 0.04;
      impellerAngleRef.current += rotSpeed;
    }
    if (autoRotate) {
      setRotY((prev) => prev + 0.005);
    }

    // 3D Projection parameters
    const cx = width / 2;
    const cy = height / 2 + 10;
    const scale = 2.1 * zoom;

    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    const project = (x: number, y: number, z: number): [number, number, number] => {
      // Rotate around Y axis (Yaw)
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      // Rotate around X axis (Pitch)
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const px = cx + x1 * scale;
      const py = cy + y2 * scale;
      return [px, py, z2]; // z2 is depth for sorting
    };

    // Calculate effective explosion offset for components
    const expFactor = viewMode === 'exploded' ? explodePct / 100 : 0;

    // Draw coordinate baseplate / shadow
    const bW = 140;
    const bL = 200;
    const bY = 95;
    const p1 = project(-bW, bY, -bL);
    const p2 = project(bW, bY, -bL);
    const p3 = project(bW, bY, bL);
    const p4 = project(-bW, bY, bL);

    ctx.fillStyle = '#0f172a88';
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(p3[0], p3[1]);
    ctx.lineTo(p4[0], p4[1]);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw Baseplate Bolts
    const boltCorners = [
      [-bW + 20, bY, -bL + 25],
      [bW - 20, bY, -bL + 25],
      [bW - 20, bY, bL - 25],
      [-bW + 20, bY, bL - 25],
    ];
    boltCorners.forEach(([bx, by, bz]) => {
      const bp = project(bx, by, bz);
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(bp[0], bp[1], 3.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.stroke();
    });

    // Component drawing functions with exploded offsets
    const getCompOffset = (id: string): [number, number, number] => {
      const comp = PUMP_COMPONENTS_CLIENT.find((c) => c.id === id);
      if (!comp) return [0, 0, 0];
      return [
        comp.exploded_offset[0] * expFactor,
        comp.exploded_offset[1] * expFactor,
        comp.exploded_offset[2] * expFactor,
      ];
    };

    // Draw Electric Motor
    const drawMotor = () => {
      const isSel = selectedCompId === 'motor_coupling';
      const [ox, oy, oz] = getCompOffset('motor_coupling');
      const mZ = 160 + oz;
      const mR = 48;
      const mLen = 120;

      // Motor body cylinder
      const steps = 16;
      ctx.fillStyle = isSel ? '#0284c7' : '#1e293b';
      ctx.strokeStyle = isSel ? '#38bdf8' : '#334155';
      ctx.lineWidth = 1.5;

      const frontPts: [number, number, number][] = [];
      const backPts: [number, number, number][] = [];
      for (let i = 0; i < steps; i++) {
        const th = (i / steps) * Math.PI * 2;
        const x = ox + Math.cos(th) * mR;
        const y = oy + Math.sin(th) * mR + 10;
        frontPts.push(project(x, y, mZ));
        backPts.push(project(x, y, mZ + mLen));
      }

      // Draw motor fins & body
      ctx.beginPath();
      frontPts.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      backPts.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Connect cylinder sides
      for (let i = 0; i < steps; i += 2) {
        ctx.beginPath();
        ctx.moveTo(frontPts[i][0], frontPts[i][1]);
        ctx.lineTo(backPts[i][0], backPts[i][1]);
        ctx.stroke();
      }

      // Motor fan cowl at back
      const fanP = project(ox, oy + 10, mZ + mLen + 15);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(fanP[0], fanP[1], (mR - 5) * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Motor terminal box
      const tb1 = project(ox - 20, oy - mR - 15 + 10, mZ + 30);
      const tb2 = project(ox + 20, oy - mR - 15 + 10, mZ + 70);
      ctx.fillStyle = isSel ? '#38bdf8' : '#475569';
      ctx.fillRect(Math.min(tb1[0], tb2[0]), Math.min(tb1[1], tb2[1]), 35 * zoom, 22 * zoom);
      ctx.strokeRect(Math.min(tb1[0], tb2[0]), Math.min(tb1[1], tb2[1]), 35 * zoom, 22 * zoom);
    };

    // Draw Bearing Housing & Sump
    const drawBearingHousing = () => {
      const isSel = selectedCompId === 'bearing_housing' || selectedCompId === 'bearings';
      const [ox, oy, oz] = getCompOffset('bearing_housing');
      const bZ = 75 + oz;
      const bR = 34;
      const bLen = 65;

      ctx.fillStyle = isSel ? '#0284c7' : '#334155';
      ctx.strokeStyle = isSel ? '#38bdf8' : '#475569';
      ctx.lineWidth = 1.5;

      const pFront = project(ox, oy + 25, bZ);
      const pBack = project(ox, oy + 25, bZ + bLen);

      // Housing body
      ctx.beginPath();
      ctx.ellipse(pFront[0], pFront[1], bR * scale, (bR * 0.85) * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(pBack[0], pBack[1], bR * scale, (bR * 0.85) * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Oil Level Sight Glass
      const sg = project(ox + bR - 2, oy + 28, bZ + bLen / 2);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(sg[0], sg[1], 4.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    };

    // Draw Drive Shaft & Sleeve
    const drawShaft = () => {
      const isSel = selectedCompId === 'shaft' || selectedCompId === 'shaft_sleeve';
      const [ox, oy, oz] = getCompOffset('shaft');
      const sRadius = 9;

      ctx.strokeStyle = isSel ? '#38bdf8' : '#94a3b8';
      ctx.lineWidth = sRadius * 2 * scale;
      ctx.lineCap = 'round';

      const sStart = project(ox, oy + 25, -60 + oz);
      const sEnd = project(ox, oy + 25, 160 + oz);

      ctx.beginPath();
      ctx.moveTo(sStart[0], sStart[1]);
      ctx.lineTo(sEnd[0], sEnd[1]);
      ctx.stroke();

      // Shaft keyway markings
      if (isRunning) {
        ctx.fillStyle = '#f8fafc';
        const keyP = project(ox + Math.cos(impellerAngleRef.current) * 8, oy + 25 + Math.sin(impellerAngleRef.current) * 8, 40 + oz);
        ctx.beginPath();
        ctx.arc(keyP[0], keyP[1], 2.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Draw Mechanical Seal
    const drawMechanicalSeal = () => {
      const isSel = selectedCompId === 'mechanical_seal';
      const [ox, oy, oz] = getCompOffset('mechanical_seal');
      const sealZ = 20 + oz;
      const sealR = 24;

      ctx.fillStyle = isSel ? '#0284c7' : '#64748b';
      ctx.strokeStyle = isSel ? '#38bdf8' : '#cbd5e1';
      ctx.lineWidth = 1.5;

      const pSeal = project(ox, oy + 25, sealZ);
      ctx.beginPath();
      ctx.ellipse(pSeal[0], pSeal[1], sealR * scale, (sealR * 0.8) * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Flush line connection port
      const pFlush = project(ox, oy + 25 - sealR, sealZ);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(pFlush[0], pFlush[1], 3.0 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Seal leakage drip animation if faulty
      if (telemetry.seal_leakage_rate_ml_min > 5.0) {
        ctx.fillStyle = '#06b6d4';
        const dripY = pSeal[1] + ((Date.now() / 25) % 35);
        ctx.beginPath();
        ctx.arc(pSeal[0], dripY, 3.0 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Draw Volute Casing & Cutwater
    const drawVolute = () => {
      const isSel = selectedCompId === 'volute_casing' || selectedCompId === 'suction_nozzle' || selectedCompId === 'discharge_nozzle';
      const isCutaway = viewMode === 'cutaway';
      const [ox, oy, oz] = getCompOffset('volute_casing');

      // Spiral volute outer boundary
      const steps = 36;
      const pts: [number, number, number][] = [];
      const baseR = 52;
      const spiralK = 18; // Expanding volute cross section

      for (let i = 0; i < steps; i++) {
        // If 180° cutaway, omit bottom/front half
        if (isCutaway && i > 18) continue;

        const th = (i / steps) * Math.PI * 2;
        const r = baseR + (th / (Math.PI * 2)) * spiralK;
        const x = ox + Math.cos(th) * r;
        const y = oy + 25 + Math.sin(th) * r;
        pts.push(project(x, y, -45 + oz));
      }

      ctx.fillStyle = isSel ? 'rgba(14, 165, 233, 0.28)' : isCutaway ? 'rgba(30, 41, 59, 0.45)' : 'rgba(30, 41, 59, 0.82)';
      ctx.strokeStyle = isSel ? '#38bdf8' : '#475569';
      ctx.lineWidth = 2.0;

      if (pts.length > 2) {
        ctx.beginPath();
        pts.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
        if (!isCutaway) ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Cutwater Tongue
      const pCut = project(ox + baseR * 0.95, oy + 25, -45 + oz);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(pCut[0], pCut[1], 4.0 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Suction Nozzle (Axial inlet at Z = -130)
      const suctOffset = getCompOffset('suction_nozzle');
      const pSuctCenter = project(ox + suctOffset[0], oy + 25 + suctOffset[1], -115 + oz + suctOffset[2]);
      const suctR = 26;
      ctx.strokeStyle = selectedCompId === 'suction_nozzle' ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 2;
      ctx.fillStyle = selectedCompId === 'suction_nozzle' ? 'rgba(56, 189, 248, 0.3)' : '#1e293b';
      ctx.beginPath();
      ctx.ellipse(pSuctCenter[0], pSuctCenter[1], suctR * scale, (suctR * 0.75) * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Suction Flange Bolt Circle
      for (let b = 0; b < 6; b++) {
        const bTh = (b / 6) * Math.PI * 2;
        const bX = ox + Math.cos(bTh) * (suctR + 6);
        const bY = oy + 25 + Math.sin(bTh) * (suctR + 6);
        const bP = project(bX, bY, -115 + oz + suctOffset[2]);
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(bP[0], bP[1], 2.2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Discharge Nozzle (Vertical radial outlet at top)
      const discOffset = getCompOffset('discharge_nozzle');
      const pDiscCenter = project(ox + discOffset[0], oy + 25 - baseR - 35 + discOffset[1], -45 + oz + discOffset[2]);
      const discR = 20;
      ctx.strokeStyle = selectedCompId === 'discharge_nozzle' ? '#38bdf8' : '#64748b';
      ctx.fillStyle = selectedCompId === 'discharge_nozzle' ? 'rgba(56, 189, 248, 0.3)' : '#1e293b';
      ctx.beginPath();
      ctx.ellipse(pDiscCenter[0], pDiscCenter[1], discR * scale, (discR * 0.6) * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    };

    // Draw Impeller, Backward Curved Blades, and Eye
    const drawImpeller = () => {
      const isSel = selectedCompId === 'impeller' || selectedCompId === 'impeller_eye';
      const [ox, oy, oz] = getCompOffset('impeller');
      const impZ = -45 + oz;
      const d2Scale = (pump.impeller_diameter_m / 0.165) * 44;
      const eyeR = 18;
      const bladeCount = pump.blade_count;
      const rotAngle = impellerAngleRef.current;

      const pCenter = project(ox, oy + 25, impZ);

      // Back shroud disc
      ctx.fillStyle = isSel ? '#0284c7' : '#475569';
      ctx.strokeStyle = isSel ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(pCenter[0], pCenter[1], d2Scale * scale, (d2Scale * 0.85) * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Impeller Eye Throat (Inlet)
      ctx.fillStyle = selectedCompId === 'impeller_eye' ? '#38bdf8' : '#0f172a';
      ctx.beginPath();
      ctx.ellipse(pCenter[0], pCenter[1], eyeR * scale, (eyeR * 0.85) * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Impeller Nut
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(pCenter[0], pCenter[1], 4.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Backward-curved blades (Logarithmic spiral arcs)
      ctx.strokeStyle = isSel ? '#ffffff' : '#94a3b8';
      ctx.lineWidth = 2.5 * zoom;
      ctx.lineCap = 'round';

      for (let b = 0; b < bladeCount; b++) {
        const bladeTheta = rotAngle + (b / bladeCount) * Math.PI * 2;
        ctx.beginPath();

        const numPts = 12;
        for (let j = 0; j <= numPts; j++) {
          const frac = j / numPts;
          const r = eyeR + frac * (d2Scale - eyeR);
          // Backward curvature: angle lags as radius expands
          const thetaCurved = bladeTheta - frac * 0.65;
          const bx = ox + Math.cos(thetaCurved) * r;
          const by = oy + 25 + Math.sin(thetaCurved) * r;
          const bp = project(bx, by, impZ - 2);

          if (j === 0) ctx.moveTo(bp[0], bp[1]);
          else ctx.lineTo(bp[0], bp[1]);
        }
        ctx.stroke();
      }

      // Wear Ring Clearance Gap Highlight
      const wearOffset = getCompOffset('wear_rings');
      const pWear = project(ox + wearOffset[0], oy + 25 + wearOffset[1], impZ - 10 + wearOffset[2]);
      ctx.strokeStyle = selectedCompId === 'wear_rings' ? '#38bdf8' : '#e2e8f033';
      ctx.lineWidth = selectedCompId === 'wear_rings' ? 3.0 : 1.0;
      ctx.beginPath();
      ctx.ellipse(pWear[0], pWear[1], (eyeR + 4) * scale, ((eyeR + 4) * 0.85) * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    };

    // Draw Streamline Particles & Cavitation Bubbles
    const drawStreamParticles = () => {
      if (!showParticles || !isRunning) return;

      const [ox, oy, oz] = getCompOffset('impeller');
      const impZ = -45 + oz;
      const d2Scale = (pump.impeller_diameter_m / 0.165) * 44;
      const eyeR = 18;

      particlesRef.current.forEach((pt) => {
        // Advance particle along streamline trajectory
        pt.progress += pt.speed;
        if (pt.progress > 1.0) pt.progress = 0;

        let px3 = 0;
        let py3 = 0;
        let pz3 = 0;
        let pColor = '#38bdf8';
        let pSize = 3.0;

        if (pt.progress < 0.3) {
          // Zone 1: Axial suction entering throat
          const prog = pt.progress / 0.3;
          pz3 = -115 + prog * (impZ - (-115));
          const r = (1.0 - prog * 0.3) * (eyeR * 0.8);
          px3 = ox + Math.cos(pt.phase) * r;
          py3 = oy + 25 + Math.sin(pt.phase) * r;
          pColor = '#38bdf8'; // Low velocity ~ 1.5 m/s
        } else if (pt.progress < 0.75) {
          // Zone 2: Centrifugal radial blade acceleration
          const prog = (pt.progress - 0.3) / 0.45;
          const r = eyeR + prog * (d2Scale - eyeR);
          const th = impellerAngleRef.current + pt.phase + prog * 1.8;
          px3 = ox + Math.cos(th) * r;
          py3 = oy + 25 + Math.sin(th) * r;
          pz3 = impZ;
          // Velocity increases towards tip: blue -> yellow -> red
          pColor = prog < 0.5 ? '#22c55e' : prog < 0.8 ? '#eab308' : '#ef4444';
          pSize = 3.5;
        } else {
          // Zone 3: Spiral volute collecting & discharge nozzle exit
          const prog = (pt.progress - 0.75) / 0.25;
          px3 = ox + (1.0 - prog) * (d2Scale * 0.8);
          py3 = oy + 25 - (d2Scale * 0.8) - prog * 45;
          pz3 = impZ;
          pColor = '#f97316'; // Pressure recovery zone
        }

        const screenPos = project(px3, py3, pz3);
        ctx.fillStyle = pColor;
        ctx.beginPath();
        ctx.arc(screenPos[0], screenPos[1], pSize * zoom, 0, Math.PI * 2);
        ctx.fill();

        // Draw cavitation bubbles if cavitating
        if (telemetry.is_cavitating && pt.progress > 0.25 && pt.progress < 0.55) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          const bubblePos = project(
            px3 + (Math.random() - 0.5) * 8,
            py3 + (Math.random() - 0.5) * 8,
            pz3 - 2
          );
          ctx.beginPath();
          ctx.arc(bubblePos[0], bubblePos[1], (2.0 + Math.random() * 2.5) * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    // Draw scene according to view mode
    drawMotor();
    drawBearingHousing();
    drawShaft();
    drawMechanicalSeal();
    drawImpeller();
    drawVolute();
    drawStreamParticles();

    // Render Exploded Guide Lines if in exploded view
    if (viewMode === 'exploded' && explodePct > 5) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;

      PUMP_COMPONENTS_CLIENT.forEach((comp) => {
        const [ox, oy, oz] = getCompOffset(comp.id);
        const pAssembled = project(0, 25, comp.exploded_offset[2] * 0.1);
        const pExploded = project(ox, 25 + oy, oz);

        ctx.beginPath();
        ctx.moveTo(pAssembled[0], pAssembled[1]);
        ctx.lineTo(pExploded[0], pExploded[1]);
        ctx.stroke();

        // Component Tag
        ctx.fillStyle = '#38bdf8';
        ctx.font = `${Math.round(10 * zoom)}px Inter, sans-serif`;
        ctx.fillText(comp.name.split(' ')[0], pExploded[0] + 8, pExploded[1]);
      });
      ctx.setLineDash([]);
    }

    // Schedule next frame
    animFrameRef.current = requestAnimationFrame(render);
  }, [
    rotX,
    rotY,
    zoom,
    viewMode,
    explodePct,
    selectedCompId,
    showParticles,
    isRunning,
    autoRotate,
    speedRpm,
    pump,
    telemetry,
  ]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [render]);

  const selectedComp = PUMP_COMPONENTS_CLIENT.find((c) => c.id === selectedCompId);

  return (
    <div className="pump-3d-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      {/* 3D Viewport Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '10px 16px', borderRadius: 8, border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={16} color="#38bdf8" />
            3D PUMP DIGITAL TWIN
          </span>
          <span style={{ fontSize: '0.75rem', background: isRunning ? '#065f46' : '#374151', color: isRunning ? '#34d399' : '#9ca3af', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
            {isRunning ? `${Math.round(speedRpm)} RPM • RUNNING` : 'STOPPED'}
          </span>
          {telemetry.is_cavitating && (
            <span style={{ fontSize: '0.75rem', background: '#7f1d1d', color: '#fca5a5', padding: '2px 8px', borderRadius: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={13} /> CAVITATING ({telemetry.cavitation_severity_pct}%)
            </span>
          )}
        </div>

        {/* View Mode Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            className={`btn-tag ${viewMode === 'assembly' ? 'active' : ''}`}
            onClick={() => setViewMode('assembly')}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            Assembly
          </button>
          <button
            className={`btn-tag ${viewMode === 'exploded' ? 'active' : ''}`}
            onClick={() => setViewMode('exploded')}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            Exploded View
          </button>
          <button
            className={`btn-tag ${viewMode === 'cutaway' ? 'active' : ''}`}
            onClick={() => setViewMode('cutaway')}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            <Scissors size={13} style={{ marginRight: 4 }} /> Cutaway
          </button>

          <button
            className={`btn-tag ${showParticles ? 'active' : ''}`}
            onClick={() => setShowParticles(!showParticles)}
            title="Toggle Streamline Flow Particles"
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            Flow Paths
          </button>

          <button
            className={`btn-tag ${autoRotate ? 'active' : ''}`}
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle 360° Auto-Rotation"
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            Auto-Rotate
          </button>

          <button
            className="btn-icon"
            onClick={onToggleRunning}
            title={isRunning ? 'Stop Pump' : 'Start Pump'}
            style={{ background: isRunning ? '#dc2626' : '#16a34a', color: '#fff', border: 'none', borderRadius: 4, padding: 6, cursor: 'pointer' }}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <button
            className="btn-icon"
            onClick={handleResetCamera}
            title="Reset Camera View"
            style={{ background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: 4, padding: 6, cursor: 'pointer' }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Main View Area with Canvas & Component Inspection Drawer */}
      <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 460 }}>
        {/* Canvas 3D viewport */}
        <div style={{ flex: 1, position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #1e293b', background: '#090d16' }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
          />

          {/* Overlay Navigation Hint */}
          <div style={{ position: 'absolute', bottom: 12, left: 14, fontSize: '0.72rem', color: '#64748b', pointerEvents: 'none', display: 'flex', gap: 14 }}>
            <span>• Left Click + Drag: Orbit 3D</span>
            <span>• Scroll Wheel: Zoom</span>
            <span>• Tip Speed u₂: {telemetry.impeller_tip_speed_m_s} m/s</span>
            <span>• Slip Factor: {telemetry.slip_factor}</span>
          </div>

          {/* Exploded slider if in exploded mode */}
          {viewMode === 'exploded' && (
            <div style={{ position: 'absolute', top: 14, left: 14, background: '#0f172aee', padding: '8px 14px', borderRadius: 6, border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Explode: {explodePct}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={explodePct}
                onChange={(e) => setExplodePct(Number(e.target.value))}
                style={{ width: 140, accentColor: '#38bdf8' }}
              />
            </div>
          )}
        </div>

        {/* Right Component Explorer Sidebar */}
        <div style={{ width: 330, background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Info size={14} color="#38bdf8" />
              Component Anatomy Explorer
            </span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{PUMP_COMPONENTS_CLIENT.length} Parts</span>
          </div>

          {/* Component Quick Selector list */}
          <div style={{ display: 'flex', gap: 4, padding: '8px 10px', overflowX: 'auto', background: '#0b1120', borderBottom: '1px solid #1e293b' }}>
            {PUMP_COMPONENTS_CLIENT.map((comp) => (
              <button
                key={comp.id}
                onClick={() => setSelectedCompId(comp.id)}
                style={{
                  fontSize: '0.7rem',
                  padding: '3px 8px',
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                  background: selectedCompId === comp.id ? '#0284c7' : '#1e293b',
                  color: selectedCompId === comp.id ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {comp.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Detailed Component Inspector */}
          {selectedComp && (
            <div style={{ padding: 14, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, color: '#38bdf8', fontWeight: 600 }}>
                  {selectedComp.category}
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                  {selectedComp.name}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 4 }}>
                  <strong style={{ color: '#cbd5e1' }}>Material:</strong> {selectedComp.material}
                </div>
              </div>

              <div style={{ background: '#1e293b55', padding: 10, borderRadius: 6, border: '1px solid #334155' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8', marginBottom: 4 }}>Engineering Function</div>
                <div style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.45 }}>{selectedComp.function}</div>
              </div>

              <div style={{ background: '#1e293b55', padding: 10, borderRadius: 6, border: '1px solid #334155' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8', marginBottom: 4 }}>Working Principle</div>
                <div style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.45 }}>{selectedComp.working_principle}</div>
              </div>

              <div style={{ background: '#1e293b55', padding: 10, borderRadius: 6, border: '1px solid #334155' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <AlertTriangle size={13} /> Common Failure Modes
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.73rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {selectedComp.failure_modes.map((fm, idx) => (
                    <li key={idx}>{fm}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: '#064e3b33', padding: 10, borderRadius: 6, border: '1px solid #065f46' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Wrench size={13} /> Maintenance & Overhaul
                </div>
                <div style={{ fontSize: '0.73rem', color: '#a7f3d0', lineHeight: 1.45 }}>
                  {selectedComp.maintenance_procedure}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
