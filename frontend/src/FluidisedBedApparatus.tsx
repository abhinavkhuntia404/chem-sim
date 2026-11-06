import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Activity,
  X,
} from 'lucide-react';
import type { FluidisationSimulationResult, FluidisationParameters } from './types';

interface ApparatusProps {
  parameters: FluidisationParameters;
  result: FluidisationSimulationResult;
  onVelocityChange?: (v: number) => void;
}

interface Particle {
  x: number;          // normalized column x [-1, 1]
  y: number;          // height in meters [0, columnHeight]
  vx: number;
  vy: number;
  radius: number;     // render radius
  color: string;
  seed: number;
  packedBaseX: number;
  packedBaseY: number;
}

interface Bubble {
  id: number;
  x: number;          // [-0.7, 0.7]
  y: number;          // height in meters
  radius: number;     // meters
  vy: number;
  opacity: number;
}

interface Hotspot {
  id: string;
  name: string;
  tag: string;
  summary: string;
  theory: string;
  governingEq?: string;
  xPct: number;
  yPct: number;
}

export const FluidisedBedApparatus: React.FC<ApparatusProps> = ({
  parameters,
  result,
  onVelocityChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation & View Controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [showTrajectories, setShowTrajectories] = useState<boolean>(false);
  const [showBubbles, setShowBubbles] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'apparatus' | 'schematic'>('apparatus');
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  // Canvas geometry constants
  const columnTotalHeightM = 1.20; // 1.2 meters physical modeled height
  const columnPhysicalDiameterM = parameters.column_diameter_m ?? 0.10;

  // Particle colors based on density / material
  const particleVisualColor = useMemo(() => {
    if (parameters.particle_density_kg_m3 < 1200) return '#38bdf8'; // light polymer / catalyst
    if (parameters.particle_density_kg_m3 < 2000) return '#94a3b8'; // FCC catalyst gray
    if (parameters.particle_diameter_m < 0.0003) return '#eab308'; // fine sand amber
    return '#f59e0b'; // glass beads golden amber
  }, [parameters.particle_density_kg_m3, parameters.particle_diameter_m]);

  // Particle instances
  const particlesRef = useRef<Particle[]>([]);
  const bubblesRef = useRef<Bubble[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const bubbleCounterRef = useRef<number>(0);

  // Initialize particles in a realistic packed bed packing
  const initParticles = useCallback(() => {
    const H0 = parameters.initial_bed_height_m;
    const count = 420; // good balance of visual density & 60fps performance
    const newParticles: Particle[] = [];

    // Lattice generation with slight random noise
    const rows = 35;
    const cols = 12;

    for (let r = 0; r < rows; r++) {
      const rowY = (r / rows) * H0 * 0.98;
      const stagger = (r % 2) * 0.04;
      for (let c = 0; c < cols; c++) {
        if (newParticles.length >= count) break;
        const normX = -0.85 + (c / (cols - 1)) * 1.7 + stagger + (Math.random() - 0.5) * 0.04;
        const clampedX = Math.max(-0.88, Math.min(0.88, normX));
        const pY = Math.max(0.005, Math.min(H0 * 0.99, rowY + (Math.random() - 0.5) * 0.01));

        newParticles.push({
          x: clampedX,
          y: pY,
          vx: 0,
          vy: 0,
          radius: 2.2 + Math.random() * 0.8,
          color: particleVisualColor,
          seed: Math.random() * 1000,
          packedBaseX: clampedX,
          packedBaseY: pY,
        });
      }
    }
    particlesRef.current = newParticles;
    bubblesRef.current = [];
  }, [parameters.initial_bed_height_m, particleVisualColor]);

  useEffect(() => {
    initParticles();
  }, [initParticles]);

  // Teaching Hotspots definitions
  const hotspots: Hotspot[] = useMemo(() => [
    {
      id: 'gas_inlet',
      name: 'Gas Inlet & Plenum Chamber',
      tag: 'Plenum & Calming Section',
      summary: 'Distributes gas uniformly across the bottom of the distributor plate.',
      theory: 'The plenum chamber dampens incoming turbulent flow pulses from the blower/compressor, establishing a uniform pressure boundary beneath the distributor plate.',
      governingEq: 'u_0 = Q_{gas} / A_{column} = 4 Q / (\\pi D_c^2)',
      xPct: 50,
      yPct: 94,
    },
    {
      id: 'distributor_plate',
      name: 'Gas Distributor Plate',
      tag: 'Perforated Plate / Tuyeres',
      summary: 'Crucial for uniform gas distribution and preventing solid weepage.',
      theory: 'A properly designed distributor plate creates sufficient pressure drop (ΔP_d ≥ 0.2 to 0.4 ΔP_bed) to force gas uniformly across all orifices and eliminate channeling or stagnant dead zones.',
      governingEq: '\\Delta P_d = \\frac{1}{2 C_d^2} \\rho_g \\left(\\frac{u_0}{\\sigma}\\right)^2',
      xPct: 50,
      yPct: 83,
    },
    {
      id: 'fluidised_bed',
      name: 'Fluidised Bed (Dense Phase)',
      tag: 'Emulsion & Bubble Phase',
      summary: 'Dynamic suspended solid-gas mixture exhibiting liquid-like behaviour.',
      theory: 'When superficial velocity exceeds u_mf, upward gas drag counterbalances the net gravitational buoyant weight of the bed. The bed exhibits hydrostatic pressure, boiling appearance, and rapid solids turnover.',
      governingEq: '\\Delta P_{bed} = (1 - \\epsilon_0) (\\rho_p - \\rho_g) g H_0',
      xPct: 50,
      yPct: 62,
    },
    {
      id: 'pressure_taps',
      name: 'Differential Pressure Taps',
      tag: 'Instrumentation & Diagnostics',
      summary: 'Monitors pressure drops across the distributor and fluidized bed.',
      theory: 'Pressure taps are connected to differential manometers or pressure transducers. The plateau in ΔP_bed vs u_0 curve provides the definitive experimental determination of u_mf.',
      governingEq: '\\Delta P_{measured} = P_{tap,1} - P_{tap,2} = \\rho_{man} g \\Delta h',
      xPct: 18,
      yPct: 73,
    },
    {
      id: 'bed_height_cursor',
      name: 'Dynamic Bed Height Indicator',
      tag: 'Bed Expansion & Voidage',
      summary: 'Measures expanded bed surface height and voidage expansion.',
      theory: 'As velocity increases above u_mf, the bed expands to accommodate rising bubbles and increased interstitial voidage, following the Richardson-Zaki and Kunii-Levenspiel expansion correlations.',
      governingEq: 'H = H_0 \\frac{1 - \\epsilon_0}{1 - \\epsilon} = \\frac{H_{mf}}{1 - \\delta_b}',
      xPct: 84,
      yPct: 52,
    },
    {
      id: 'freeboard_outlet',
      name: 'Freeboard & Gas Disengagement Outlet',
      tag: 'TDH & Elutriation Zone',
      summary: 'Allows particle disengagement before gas exhausts through the outlet.',
      theory: 'The freeboard height must exceed the Transport Disengagement Height (TDH) so splashing particle clusters fall back under gravity rather than being elutriated into the cyclone or exhaust duct.',
      governingEq: 'u_0 < u_t = \\sqrt{\\frac{4 g d_p (\\rho_p - \\rho_g)}{3 \\rho_g C_D}}',
      xPct: 50,
      yPct: 12,
    },
  ], []);

  // Main Animation Physics & Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const renderLoop = (timestamp: number) => {
      if (!isRunning) return;

      const dtRaw = (timestamp - lastTimeRef.current) / 1000.0;
      lastTimeRef.current = timestamp;
      // Clamp dt to prevent jumping during tab switches
      const dt = isPlaying ? Math.min(0.05, Math.max(0.001, dtRaw)) * speedMultiplier : 0;

      // Handle retina / high DPI scaling
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Physics variables
      const u0 = parameters.gas_velocity_m_s;
      const u_mf = result.u_mf_design_m_s;
      const u_t = result.terminal_velocity_m_s;
      const H0 = parameters.initial_bed_height_m;
      const H_exp = result.expanded_bed_height_m;
      const isFluidised = result.is_fluidised;
      const isEntrained = result.is_entrained;
      const regime = result.regime;

      // Column coordinate mapping
      // Column sits in the center: x from colLeft to colRight, y from colBottom to colTop
      const colWidth = Math.min(width * 0.44, 220);
      const colLeft = (width - colWidth) / 2;
      const colRight = colLeft + colWidth;
      const colBottom = height - 70; // 70px for distributor and plenum at bottom
      const colTop = 70;            // 70px for disengagement head at top
      const colPixelHeight = colBottom - colTop;
      const pixelsPerMeter = colPixelHeight / columnTotalHeightM;

      // Helper converters
      const meterToPixelY = (m: number) => colBottom - m * pixelsPerMeter;
      const normToPixelX = (nx: number) => colLeft + ((nx + 1) / 2) * colWidth;

      // Bed surface in pixels
      const currentBedSurfaceY = meterToPixelY(H_exp);

      // --- BUBBLE GENERATION & UPDATE ---
      if (dt > 0 && isFluidised && showBubbles) {
        // Spawn rate proportional to excess gas (u0 - u_mf)
        const excessV = Math.max(0, u0 - u_mf);
        const spawnProb = Math.min(0.85, excessV * 2.2 * dt * 60);

        if (Math.random() < spawnProb && bubblesRef.current.length < 18) {
          bubbleCounterRef.current++;
          const bubbleDiamM = Math.max(0.015, Math.min(columnPhysicalDiameterM * 0.45, result.estimated_bubble_diameter_m));
          const bubbleRiseV = (u0 - u_mf) + 0.711 * Math.sqrt(9.80665 * bubbleDiamM);

          bubblesRef.current.push({
            id: bubbleCounterRef.current,
            x: (Math.random() - 0.5) * 1.3, // [-0.65, 0.65]
            y: 0.02,                         // just above distributor
            radius: bubbleDiamM / 2.0,
            vy: Math.max(0.15, bubbleRiseV),
            opacity: 0.85,
          });
        }

        // Move bubbles
        for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
          const b = bubblesRef.current[i];
          b.y += b.vy * dt;
          // Coalescence / growth with height
          b.radius *= (1 + 0.12 * dt);
          // Lateral slight drift
          b.x += (Math.random() - 0.5) * 0.2 * dt;
          b.x = Math.max(-0.7, Math.min(0.7, b.x));

          // Burst at bed surface
          if (b.y >= H_exp) {
            b.opacity -= dt * 3.5;
            if (b.opacity <= 0) {
              bubblesRef.current.splice(i, 1);
            }
          }
        }
      } else if (!isFluidised) {
        bubblesRef.current = [];
      }

      // --- PARTICLE PHYSICS UPDATE ---
      const particles = particlesRef.current;
      const excessVelocityRatio = u0 / Math.max(1e-4, u_mf);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (dt > 0) {
          if (!isFluidised) {
            // Packed bed: relax back to rigid lattice with subtle acoustic micro-jitter
            const jitterMag = Math.min(0.0008, (u0 / u_mf) * 0.0006);
            p.x += (p.packedBaseX - p.x) * 0.15 + (Math.random() - 0.5) * jitterMag;
            p.y += (p.packedBaseY - p.y) * 0.15 + (Math.random() - 0.5) * jitterMag;
            p.vx = 0;
            p.vy = 0;
          } else if (!isEntrained) {
            // Fluidised Bed (Bubbling / Incipient / Turbulent)
            // 1. Upward drag from gas + bubble wakes
            let netFy = 0;

            // Center circulation upwards, wall circulation downwards
            const centerFactor = 1.0 - Math.abs(p.x); // higher near center
            const wallFactor = Math.abs(p.x);       // higher near wall

            // Baseline fluidisation suspension: drag balances gravity
            const dragForce = (u0 / u_mf) * 0.25;
            const gravityForce = 0.25;
            netFy += (dragForce - gravityForce) * (0.8 + centerFactor * 0.6);

            // Pull downwards along walls (circulation loop)
            if (wallFactor > 0.65) {
              netFy -= 0.18 * (excessVelocityRatio - 1.0);
            }

            // Bubble wake entrainment
            if (showBubbles) {
              for (const b of bubblesRef.current) {
                const dx = p.x - b.x;
                const dy = p.y - b.y;
                const distM = Math.hypot(dx * (columnPhysicalDiameterM / 2), dy);
                if (distM < b.radius * 2.2) {
                  // Entrained into wake: kick upward and inward
                  p.vy += 0.8 * dt * (b.vy);
                  p.vx -= dx * 1.5 * dt;
                }
              }
            }

            // Turbulent churn at high velocity
            if (u0 > 0.45 * u_t) {
              netFy += (Math.random() - 0.5) * (u0 / u_t) * 1.2;
              p.vx += (Math.random() - 0.5) * 1.5 * dt;
            }

            // Random brownian-like particle collisions
            p.vx += (Math.random() - 0.5) * 0.35 * Math.sqrt(excessVelocityRatio);
            p.vy += netFy * dt + (Math.random() - 0.5) * 0.35;

            // Damping (interparticle drag and friction)
            p.vx *= 0.92;
            p.vy *= 0.92;

            // Integrate
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Wall collisions (reflective bounce with loss)
            if (p.x < -0.86) {
              p.x = -0.86;
              p.vx = Math.abs(p.vx) * 0.4;
            } else if (p.x > 0.86) {
              p.x = 0.86;
              p.vx = -Math.abs(p.vx) * 0.4;
            }

            // Bottom distributor plate boundary
            if (p.y < 0.008) {
              p.y = 0.008;
              p.vy = Math.abs(p.vy) * 0.35;
            }

            // Top bed surface boundary (splashing vs fall back)
            if (p.y > H_exp * 1.06) {
              // Splash deceleration
              p.vy -= 1.8 * dt;
              if (p.y > H_exp * 1.35) {
                p.y = H_exp * 1.35;
                p.vy = -Math.abs(p.vy) * 0.5;
              }
            }
          } else {
            // Pneumatic transport / Entrainment regime (u0 >= u_t)
            // Gas velocity exceeds terminal velocity: continuous upward elutriation
            p.vy += (u0 - u_t + 0.4) * 1.2 * dt;
            p.vx += (Math.random() - 0.5) * 0.6 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (p.x < -0.86) p.x = -0.86;
            if (p.x > 0.86) p.x = 0.86;

            // Recycle elutriated particles entering feed continuously for endless visualization
            if (p.y > columnTotalHeightM * 1.05) {
              p.y = 0.01;
              p.x = (Math.random() - 0.5) * 1.6;
              p.vy = 0.1;
            }
          }
        }
      }

      // ==========================================
      // RENDERING CANVAS (Laboratory Rig Visuals)
      // ==========================================
      ctx.clearRect(0, 0, width, height);

      // --- 1. Background Bench & Structure ---
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, width, height);

      // Lab Rig Backboard (soft engineering grid)
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      const gridSize = 24;
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

      // Aluminum Support Frame Struts
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(colLeft - 32, 20, 8, height - 40);
      ctx.fillRect(colRight + 24, 20, 8, height - 40);
      // Support clamps
      ctx.fillStyle = '#64748b';
      ctx.fillRect(colLeft - 36, colTop + 20, 36, 12);
      ctx.fillRect(colRight, colTop + 20, 36, 12);
      ctx.fillRect(colLeft - 36, colBottom - 30, 36, 12);
      ctx.fillRect(colRight, colBottom - 30, 36, 12);

      // --- 2. Gas Inlet Pipe & Bottom Plenum ---
      const plenumTop = colBottom;
      const plenumBottom = colBottom + 35;
      const plenumWidth = colWidth * 0.9;
      const plenumLeft = (width - plenumWidth) / 2;

      // Inlet bottom pipe
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(width / 2 - 14, plenumBottom, 28, height - plenumBottom);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(width / 2 - 14, plenumBottom, 28, height - plenumBottom);

      // Animated gas flow arrows in inlet
      if (isPlaying && u0 > 0.001) {
        ctx.fillStyle = '#0284c7';
        const flowPhase = (timestamp * 0.002 * (u0 + 0.2)) % 18;
        for (let fy = height - 10; fy > plenumBottom; fy -= 16) {
          const cy = fy - flowPhase;
          if (cy > plenumBottom && cy < height - 5) {
            ctx.beginPath();
            ctx.moveTo(width / 2 - 4, cy + 4);
            ctx.lineTo(width / 2, cy - 4);
            ctx.lineTo(width / 2 + 4, cy + 4);
            ctx.fill();
          }
        }
      }

      // Plenum Chamber (Expansion cone/cylinder)
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(plenumLeft, plenumTop);
      ctx.lineTo(plenumLeft + plenumWidth, plenumTop);
      ctx.lineTo(width / 2 + 14, plenumBottom);
      ctx.lineTo(width / 2 - 14, plenumBottom);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // --- 3. Perforated Gas Distributor Plate ---
      ctx.fillStyle = '#475569';
      ctx.fillRect(colLeft - 6, colBottom - 5, colWidth + 12, 10);
      // Flange bolts
      ctx.fillStyle = '#cbd5e1';
      for (let bx = colLeft - 2; bx <= colRight + 2; bx += 14) {
        ctx.beginPath();
        ctx.arc(bx, colBottom, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      // Orifices in distributor plate
      const nOrifices = 10;
      ctx.fillStyle = '#0ea5e9';
      for (let oi = 1; oi < nOrifices; oi++) {
        const ox = colLeft + (oi / nOrifices) * colWidth;
        ctx.beginPath();
        ctx.arc(ox, colBottom - 3, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Tiny gas jets if running
        if (isPlaying && isFluidised) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ox, colBottom - 3);
          ctx.lineTo(ox + (Math.random() - 0.5) * 3, colBottom - 12 - Math.random() * 8);
          ctx.stroke();
        }
      }

      // --- 4. Transparent Glass Cylindrical Column Interior ---
      // Inner column glass background
      const glassGradient = ctx.createLinearGradient(colLeft, 0, colRight, 0);
      glassGradient.addColorStop(0, 'rgba(224, 242, 254, 0.45)');
      glassGradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.65)');
      glassGradient.addColorStop(0.5, 'rgba(240, 249, 255, 0.25)');
      glassGradient.addColorStop(0.8, 'rgba(224, 242, 254, 0.55)');
      glassGradient.addColorStop(1, 'rgba(186, 230, 253, 0.45)');

      ctx.fillStyle = glassGradient;
      ctx.fillRect(colLeft, colTop, colWidth, colPixelHeight);

      // --- 5. Bed Phase Dense Emulsion Tint ---
      if (currentBedSurfaceY < colBottom) {
        const emulsionGrad = ctx.createLinearGradient(colLeft, currentBedSurfaceY, colLeft, colBottom);
        const bedAlpha = Math.max(0.08, 0.28 * (1.0 - result.expanded_voidage));
        emulsionGrad.addColorStop(0, `rgba(245, 158, 11, ${bedAlpha * 0.4})`);
        emulsionGrad.addColorStop(1, `rgba(217, 119, 6, ${bedAlpha})`);
        ctx.fillStyle = emulsionGrad;
        ctx.fillRect(colLeft, currentBedSurfaceY, colWidth, colBottom - currentBedSurfaceY);
      }

      // --- 6. Bubbles Rendering ---
      if (showBubbles && bubblesRef.current.length > 0) {
        for (const b of bubblesRef.current) {
          const bx = normToPixelX(b.x);
          const by = meterToPixelY(b.y);
          const bRadiusPx = b.radius * pixelsPerMeter;

          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(0.9, b.opacity));

          // Bubble void with glass shine
          const bGrad = ctx.createRadialGradient(
            bx - bRadiusPx * 0.3,
            by - bRadiusPx * 0.3,
            bRadiusPx * 0.1,
            bx,
            by,
            bRadiusPx
          );
          bGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          bGrad.addColorStop(0.5, 'rgba(224, 242, 254, 0.8)');
          bGrad.addColorStop(0.9, 'rgba(125, 211, 252, 0.6)');
          bGrad.addColorStop(1, 'rgba(2, 132, 199, 0.7)');

          ctx.fillStyle = bGrad;
          ctx.beginPath();
          // Slightly flattened oblate spheroid bubble shape
          ctx.ellipse(bx, by, bRadiusPx, bRadiusPx * 0.85, 0, 0, Math.PI * 2);
          ctx.fill();

          // Bubble rim outline
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Bubble wake particle particles
          ctx.restore();
        }
      }

      // --- 7. Particles Rendering ---
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const px = normToPixelX(p.x);
        const py = meterToPixelY(p.y);

        // Particle shadow / 3D highlight
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // High resolution 3D glint
        ctx.beginPath();
        ctx.arc(px - p.radius * 0.35, py - p.radius * 0.35, p.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fill();

        // Trajectories / velocity vectors if enabled
        if (showTrajectories && (Math.abs(p.vx) > 0.02 || Math.abs(p.vy) > 0.02)) {
          ctx.strokeStyle = 'rgba(2, 132, 199, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + p.vx * 18, py - p.vy * 18);
          ctx.stroke();
        }
      }

      // --- 8. Glass Wall Highlights, Reflections & Cylinder Shading ---
      // Left glass reflection stripe
      const leftReflect = ctx.createLinearGradient(colLeft, 0, colLeft + 18, 0);
      leftReflect.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      leftReflect.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = leftReflect;
      ctx.fillRect(colLeft + 2, colTop, 16, colPixelHeight);

      // Right glass specular reflection
      const rightReflect = ctx.createLinearGradient(colRight - 16, 0, colRight, 0);
      rightReflect.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
      rightReflect.addColorStop(1, 'rgba(255, 255, 255, 0.6)');
      ctx.fillStyle = rightReflect;
      ctx.fillRect(colRight - 16, colTop, 16, colPixelHeight);

      // Glass Outer Column Borders
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3.0;
      ctx.strokeRect(colLeft, colTop, colWidth, colPixelHeight);

      // Column top flange & Disengagement head
      ctx.fillStyle = '#475569';
      ctx.fillRect(colLeft - 8, colTop - 10, colWidth + 16, 12);
      ctx.fillStyle = '#cbd5e1';
      for (let bx = colLeft - 4; bx <= colRight + 4; bx += 14) {
        ctx.beginPath();
        ctx.arc(bx, colTop - 4, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Top Exhaust Head & Outlet Pipe
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(colLeft - 4, colTop - 10);
      ctx.lineTo(colRight + 4, colTop - 10);
      ctx.lineTo(width / 2 + 18, 25);
      ctx.lineTo(width / 2 - 18, 25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Horizontal gas outlet pipe to exhaust
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(width / 2 + 18, 25, 75, 18);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(width / 2 + 18, 25, 75, 18);

      // Outlet gas arrow
      if (isPlaying && u0 > 0.001) {
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(width / 2 + 75, 34);
        ctx.lineTo(width / 2 + 62, 28);
        ctx.lineTo(width / 2 + 62, 40);
        ctx.fill();
      }

      // --- 9. Metric Height Scale & Graduations along the Column ---
      ctx.fillStyle = '#475569';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';

      const majorTickStepM = 0.10; // every 10 cm
      for (let hm = 0; hm <= columnTotalHeightM; hm += majorTickStepM) {
        const tickY = meterToPixelY(hm);
        if (tickY >= colTop && tickY <= colBottom) {
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(colLeft, tickY);
          ctx.lineTo(colLeft + 10, tickY);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(colRight, tickY);
          ctx.lineTo(colRight - 10, tickY);
          ctx.stroke();

          // Minor ticks (5 cm)
          const minorY = meterToPixelY(hm + majorTickStepM / 2);
          if (minorY >= colTop && minorY <= colBottom) {
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(colLeft, minorY);
            ctx.lineTo(colLeft + 5, minorY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(colRight, minorY);
            ctx.lineTo(colRight - 5, minorY);
            ctx.stroke();
          }

          // Label
          ctx.fillText(`${(hm * 100).toFixed(0)} cm`, colRight + 8, tickY + 3);
        }
      }

      // --- 10. Dynamic Bed Height Measurement Cursor ---
      // Expanded Bed Height Indicator line & cursor
      const cursorY = currentBedSurfaceY;
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(colLeft - 18, cursorY);
      ctx.lineTo(colRight + 18, cursorY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Cursor flag on the right
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(colRight + 18, cursorY);
      ctx.lineTo(colRight + 28, cursorY - 8);
      ctx.lineTo(colRight + 88, cursorY - 8);
      ctx.lineTo(colRight + 88, cursorY + 8);
      ctx.lineTo(colRight + 28, cursorY + 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`H = ${(H_exp * 100).toFixed(1)} cm`, colRight + 56, cursorY + 3);

      // Settled Bed Height H0 baseline reference line
      const h0Y = meterToPixelY(H0);
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(colLeft - 12, h0Y);
      ctx.lineTo(colRight + 12, h0Y);
      ctx.stroke();
      ctx.setLineDash([]);

      // H0 label
      ctx.fillStyle = '#1e40af';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`H₀ = ${(H0 * 100).toFixed(1)} cm`, colLeft - 14, h0Y + 3);

      // --- 11. Pressure Taps & U-Tube Manometer Visualisation ---
      // Taps on the left side of the column
      const tap1Y = colBottom + 18;        // P1: below distributor (plenum)
      const tap2Y = colBottom - 10;        // P2: immediately above distributor
      const tap3Y = meterToPixelY(H0 * 0.5); // P3: mid bed
      const tap4Y = colTop + 20;           // P4: freeboard

      const drawPressureTap = (y: number, label: string) => {
        ctx.fillStyle = '#475569';
        ctx.fillRect(colLeft - 14, y - 3, 14, 6);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(label, colLeft - 18, y + 3);
      };

      drawPressureTap(tap1Y, 'P₁');
      drawPressureTap(tap2Y, 'P₂');
      drawPressureTap(tap3Y, 'P₃');
      drawPressureTap(tap4Y, 'P₄');

      // Differential Pressure Digital Manometer Box on bottom left
      const manoBoxX = 14;
      const manoBoxY = colBottom - 85;
      const manoBoxW = 100;
      const manoBoxH = 75;

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(manoBoxX, manoBoxY, manoBoxW, manoBoxH, 6);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Connecting impulse lines from taps to manometer
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(colLeft - 14, tap2Y);
      ctx.lineTo(manoBoxX + manoBoxW - 10, tap2Y);
      ctx.lineTo(manoBoxX + manoBoxW - 10, manoBoxY);
      ctx.stroke();

      // Manometer LCD screen
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(manoBoxX + 6, manoBoxY + 6, manoBoxW - 12, 38);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${result.bed_pressure_drop_Pa.toFixed(0)} Pa`, manoBoxX + manoBoxW / 2, manoBoxY + 24);
      ctx.font = '8px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('BED ΔP (P₂ - P₄)', manoBoxX + manoBoxW / 2, manoBoxY + 36);

      // Secondary readout: Distributor ΔP
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillText(`Dist ΔP: ${result.distributor_pressure_drop_Pa.toFixed(0)} Pa`, manoBoxX + manoBoxW / 2, manoBoxY + 54);
      ctx.fillText(`Total ΔP: ${result.total_pressure_drop_Pa.toFixed(0)} Pa`, manoBoxX + manoBoxW / 2, manoBoxY + 66);

      // --- 12. Top Status HUD Badge (Regime & Velocities) ---
      const hudW = 280;
      const hudH = 46;
      const hudX = (width - hudW) / 2;
      const hudY = 14;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.roundRect(hudX, hudY, hudW, hudH, 6);
      ctx.fill();
      ctx.strokeStyle = isFluidised ? (isEntrained ? '#ef4444' : '#10b981') : '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Regime text
      ctx.fillStyle = isFluidised ? (isEntrained ? '#fca5a5' : '#6ee7b7') : '#93c5fd';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(regime.toUpperCase(), hudX + hudW / 2, hudY + 16);

      // Live u0 vs u_mf comparison
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(
        `u₀: ${u0.toFixed(4)} m/s  |  u_mf: ${u_mf.toFixed(4)} m/s  |  Ratio: ${(u0 / Math.max(1e-4, u_mf)).toFixed(2)}x`,
        hudX + hudW / 2,
        hudY + 34
      );

      // Next frame
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    lastTimeRef.current = performance.now();
    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [
    isPlaying,
    speedMultiplier,
    showTrajectories,
    showBubbles,
    parameters,
    result,
    particleVisualColor,
  ]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: '#ffffff',
        borderRadius: 8,
        border: '1px solid var(--border-light)',
        padding: 16,
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
      }}
    >
      {/* Top Controls Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={16} color="#0284c7" />
            Interactive Fluidised Bed Apparatus
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 4,
              background: result.is_fluidised ? (result.is_entrained ? '#fee2e2' : '#dcfce7') : '#f1f5f9',
              color: result.is_fluidised ? (result.is_entrained ? '#b91c1c' : '#15803d') : '#475569',
              border: `1px solid ${result.is_fluidised ? (result.is_entrained ? '#fca5a5' : '#86efac') : '#cbd5e1'}`,
            }}
          >
            {result.regime}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Play/Pause */}
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? 'Pause' : 'Resume'}
          </button>

          {/* Reset */}
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            onClick={() => initParticles()}
            title="Reset Bed Particles"
          >
            <RotateCcw size={14} />
            Reset
          </button>

          {/* Speed selector */}
          <select
            className="select-field"
            style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto' }}
            value={speedMultiplier}
            onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
            title="Simulation Speed"
          >
            <option value={0.5}>0.5x Slow-mo</option>
            <option value={1.0}>1.0x Real-time</option>
            <option value={2.0}>2.0x Fast</option>
          </select>

          {/* View Mode Toggle */}
          <div style={{ display: 'inline-flex', borderRadius: 4, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            <button
              style={{
                padding: '4px 8px',
                fontSize: '0.75rem',
                border: 'none',
                background: viewMode === 'apparatus' ? '#0284c7' : '#ffffff',
                color: viewMode === 'apparatus' ? '#ffffff' : '#475569',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={() => setViewMode('apparatus')}
            >
              Apparatus View
            </button>
            <button
              style={{
                padding: '4px 8px',
                fontSize: '0.75rem',
                border: 'none',
                background: viewMode === 'schematic' ? '#0284c7' : '#ffffff',
                color: viewMode === 'schematic' ? '#ffffff' : '#475569',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={() => setViewMode('schematic')}
            >
              P&ID Schematic
            </button>
          </div>
        </div>
      </div>

      {/* Visual Canvas Area with Hotspot Annotations Overlay */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 520,
          background: '#f8fafc',
          borderRadius: 6,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {viewMode === 'apparatus' ? (
          <>
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
              }}
            />

            {/* Clickable Teaching Hotspots Overlaid */}
            {hotspots.map((hs) => (
              <button
                key={hs.id}
                onClick={() => setActiveHotspot(hs)}
                style={{
                  position: 'absolute',
                  left: `${hs.xPct}%`,
                  top: `${hs.yPct}%`,
                  transform: 'translate(-50%, -50%)',
                  background: activeHotspot?.id === hs.id ? '#0284c7' : 'rgba(15, 23, 42, 0.75)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  borderRadius: '50%',
                  width: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  transition: 'all 0.15s ease',
                  zIndex: 10,
                }}
                title={`Click to learn about ${hs.name}`}
              >
                ?
              </button>
            ))}
          </>
        ) : (
          /* Schematic Engineering View (P&ID Flowsheet) */
          <div style={{ width: '100%', height: '100%', padding: 20, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg width="580" height="460" viewBox="0 0 580 460" style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              {/* Column vessel */}
              <rect x="220" y="80" width="140" height="280" rx="8" fill="#f8fafc" stroke="#0284c7" strokeWidth="2.5" />
              
              {/* Fluidised Bed Level */}
              {result.expanded_bed_height_m > 0 && (
                <rect
                  x="222"
                  y={360 - (result.expanded_bed_height_m / 1.2) * 280}
                  width="136"
                  height={(result.expanded_bed_height_m / 1.2) * 280}
                  fill="rgba(245, 158, 11, 0.25)"
                  stroke="none"
                />
              )}

              {/* Distributor plate */}
              <line x1="220" y1="340" x2="360" y2="340" stroke="#475569" strokeWidth="4" strokeDasharray="6,4" />
              <text x="290" y="348" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="600">DISTRIBUTOR PLATE</text>

              {/* Gas Inlet Pipe */}
              <path d="M 290 420 L 290 360" stroke="#0284c7" strokeWidth="2" fill="none" />
              <polygon points="286,375 290,362 294,375" fill="#0284c7" />
              <text x="290" y="440" textAnchor="middle" fontSize="11" fill="#0f172a" fontWeight="700">GAS INLET (u₀ = {parameters.gas_velocity_m_s.toFixed(3)} m/s)</text>

              {/* Gas Outlet Pipe */}
              <path d="M 290 80 L 290 40 L 450 40" stroke="#0284c7" strokeWidth="2" fill="none" />
              <polygon points="435,36 448,40 435,44" fill="#0284c7" />
              <text x="460" y="44" textAnchor="start" fontSize="11" fill="#0f172a" fontWeight="700">GAS OUTLET (Exhaust)</text>

              {/* Bed Height Annotation */}
              <line x1="375" y1={340} x2="375" y2={360 - (result.expanded_bed_height_m / 1.2) * 280} stroke="#dc2626" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <text x="385" y={340 - ((result.expanded_bed_height_m / 1.2) * 280) / 2} fontSize="11" fill="#dc2626" fontWeight="700">
                H = {(result.expanded_bed_height_m * 100).toFixed(1)} cm
              </text>

              {/* Differential Pressure Transmitter (DPT) */}
              <circle cx="140" cy="240" r="24" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
              <text x="140" y="238" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1e293b">PDT</text>
              <text x="140" y="250" textAnchor="middle" fontSize="9" fontWeight="600" fill="#0284c7">101</text>
              <line x1="164" y1="240" x2="220" y2="240" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,2" />
              <line x1="140" y1="264" x2="140" y2="350" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,2" />
              <line x1="140" y1="350" x2="220" y2="350" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,2" />
              <text x="140" y="280" textAnchor="middle" fontSize="10" fill="#0284c7" fontWeight="700">
                ΔP = {result.bed_pressure_drop_Pa.toFixed(0)} Pa
              </text>

              {/* Tags & Data */}
              <text x="290" y="210" textAnchor="middle" fontSize="12" fill="#0f172a" fontWeight="700">
                {result.regime}
              </text>
              <text x="290" y="228" textAnchor="middle" fontSize="10" fill="#64748b">
                Voidage ε = {result.expanded_voidage.toFixed(3)} | Geldart: {result.geldart_group}
              </text>
            </svg>
          </div>
        )}

        {/* Hotspot Educational Modal Card */}
        {activeHotspot && (
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              maxWidth: 480,
              background: '#ffffff',
              borderRadius: 8,
              border: '1px solid #bfdbfe',
              boxShadow: 'var(--shadow-lg)',
              padding: 16,
              zIndex: 20,
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#0284c7' }}>
                  {activeHotspot.tag}
                </span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  {activeHotspot.name}
                </h4>
              </div>
              <button
                onClick={() => setActiveHotspot(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.45, marginBottom: 8 }}>
              {activeHotspot.theory}
            </p>
            {activeHotspot.governingEq && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 4,
                  padding: '6px 10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.78rem',
                  color: '#0f172a',
                }}
              >
                {activeHotspot.governingEq}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual Toggles & Sliders Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '10px 12px',
          background: '#f8fafc',
          borderRadius: 6,
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Visual Layer Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showBubbles}
              onChange={(e) => setShowBubbles(e.target.checked)}
            />
            Show Gas Bubbles
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showTrajectories}
              onChange={(e) => setShowTrajectories(e.target.checked)}
            />
            Show Particle Vectors
          </label>
        </div>

        {/* Quick Gas Velocity Slider */}
        {onVelocityChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 260 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
              Gas Velocity (u₀):
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(1.0, result.terminal_velocity_m_s * 1.15)}
              step={0.005}
              value={parameters.gas_velocity_m_s}
              onChange={(e) => onVelocityChange(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700, color: '#0284c7', width: 65, textAlign: 'right' }}>
              {parameters.gas_velocity_m_s.toFixed(3)} m/s
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
