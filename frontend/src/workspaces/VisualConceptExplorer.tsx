import { useState } from 'react';
import {
  Wind,
  Flame,
  Atom,
  Layers,
  Droplet,
  Play,
  Pause,
  BookOpen,
  FileText,
  Compass,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface VisualConceptExplorerProps {
  onLaunchSimulation?: (moduleId: string) => void;
}

export function VisualConceptExplorer({ onLaunchSimulation }: VisualConceptExplorerProps) {
  const [studioMode, setStudioMode] = useState<'diagrams' | 'equations' | 'solver' | 'misconceptions' | 'graph'>('diagrams');
  const [activeConcept, setActiveConcept] = useState<'fluid' | 'heat' | 'reaction' | 'vle' | 'thermo'>('fluid');
  const [animating, setAnimating] = useState<boolean>(true);

  // --- Equation Explorer State ---
  const [selectedEqIndex, setSelectedEqIndex] = useState<number>(0);
  const [selectedVariable, setSelectedVariable] = useState<string>('f');

  // --- Misconception Detector State ---
  const [selectedMisconceptionIndex, setSelectedMisconceptionIndex] = useState<number>(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // --- Knowledge Graph State ---
  const [selectedGraphNode, setSelectedGraphNode] = useState<string>('fluids');

  // --- Concept 1: Fluid Mechanics (Laminar vs Turbulent Pipe Flow) ---
  const [reynoldsNum, setReynoldsNum] = useState<number>(1800); // Laminar by default
  const isLaminar = reynoldsNum < 2300;
  const isTransition = reynoldsNum >= 2300 && reynoldsNum < 4000;
  const uMaxLaminar = 2.0; // m/s
  const uAvg = isLaminar ? uMaxLaminar / 2.0 : uMaxLaminar * 0.8;

  // --- Concept 2: Heat Transfer (Exchanger Temperature Profile) ---
  const [flowArrangement, setFlowArrangement] = useState<'counter' | 'cocurrent'>('counter');
  const [hotInletT, setHotInletT] = useState<number>(95);
  const hotOutletT = 55;
  const [coldInletT, setColdInletT] = useState<number>(20);
  const [coldOutletT, setColdOutletT] = useState<number>(flowArrangement === 'counter' ? 65 : 50);

  // LMTD calculation
  const deltaT1 = flowArrangement === 'counter' ? (hotInletT - coldOutletT) : (hotInletT - coldInletT);
  const deltaT2 = flowArrangement === 'counter' ? (hotOutletT - coldInletT) : (hotOutletT - coldOutletT);
  const calcLmtd = (deltaT1 - deltaT2) / Math.max(1e-4, Math.log(Math.max(1e-4, deltaT1) / Math.max(1e-4, deltaT2)));

  // --- Concept 3: Reaction Engineering (CSTR vs PFR Conversion Profiles) ---
  const [damkohlerDa, setDamkohlerDa] = useState<number>(2.0); // Da = k * tau
  const cstrConversion = damkohlerDa / (1.0 + damkohlerDa); // X_CSTR = Da / (1 + Da)
  const pfrConversion = 1.0 - Math.exp(-damkohlerDa); // X_PFR = 1 - exp(-Da)

  // --- Concept 4: Mass Transfer (VLE & Relative Volatility) ---
  const [relAlpha, setRelAlpha] = useState<number>(2.5); // relative volatility
  const [refluxR, setRefluxR] = useState<number>(1.8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header Deck */}
      <div
        style={{
          background: 'linear-gradient(135deg, #091e3a 0%, #0f172a 100%)',
          padding: '24px 28px',
          borderRadius: 12,
          border: '1px solid #1e3a8a',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  padding: '3px 8px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                }}
              >
                Visual Learning · Concept Explorer
              </span>
              <span style={{ color: '#93c5fd', fontSize: '0.82rem', fontWeight: 600 }}>
                Interactive Physics Diagrams · Live Vector Profiles · Governing Principles
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Visual Engineering Concept Studio
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '8px 0 0', maxWidth: 840, lineHeight: 1.5 }}>
              Explore core chemical engineering principles through dynamic, mathematically driven 2D animations.
              Observe how changing operating conditions alters velocity fields, temperature gradients, concentration
              profiles, and phase envelopes in real time.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {studioMode === 'diagrams' && (
              <button
                type="button"
                onClick={() => setAnimating(!animating)}
                style={{
                  background: animating ? '#0284c7' : '#1e293b',
                  color: '#ffffff',
                  border: '1px solid #334155',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {animating ? <Pause size={14} /> : <Play size={14} />}
                {animating ? 'Animations Active' : 'Animations Paused'}
              </button>
            )}
          </div>
        </div>

        {/* Primary Studio Navigation Bar */}
        <div style={{ display: 'flex', gap: 6, marginTop: 18, borderBottom: '1px solid #1e3a8a', paddingBottom: 12, overflowX: 'auto' }}>
          {[
            { id: 'diagrams', label: 'Interactive Physics Diagrams', icon: Compass },
            { id: 'equations', label: 'Equation Explorer & Variables', icon: BookOpen },
            { id: 'solver', label: '8-Step Engineering Problem Solver', icon: FileText },
            { id: 'misconceptions', label: 'Misconception Detector (8 Traps)', icon: AlertTriangle },
            { id: 'graph', label: 'Degree Knowledge Graph', icon: Layers },
          ].map((m) => {
            const Icon = m.icon;
            const isActive = studioMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setStudioMode(m.id as any)}
                style={{
                  background: isActive ? '#2563eb' : '#0f172a',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  border: isActive ? '1px solid #60a5fa' : '1px solid #1e293b',
                  padding: '8px 16px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={14} /> {m.label}
              </button>
            );
          })}
        </div>

        {/* Concept Selector Pill Buttons (Only in Diagrams Mode) */}
        {studioMode === 'diagrams' && (
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {[
              { id: 'fluid', label: '1. Velocity Profiles & Reynolds Number', icon: Wind },
              { id: 'heat', label: '2. Heat Exchanger Temperature Gradients', icon: Flame },
              { id: 'reaction', label: '3. CSTR vs. PFR Concentration Profiles', icon: Atom },
              { id: 'vle', label: '4. VLE Equilibrium & McCabe-Thiele', icon: Layers },
              { id: 'thermo', label: '5. Vapor-Liquid Phase Envelope (T-x-y)', icon: Droplet },
            ].map((c) => {
              const Icon = c.icon;
              const isSelected = activeConcept === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveConcept(c.id as any)}
                  style={{
                    background: isSelected ? '#0284c7' : '#0f172a',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid #1e293b',
                    padding: '8px 14px',
                    borderRadius: 6,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={14} /> {c.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. DIAGRAMS MODE WRAPPER                                      */}
      {/* ------------------------------------------------------------- */}
      {studioMode === 'diagrams' && (
        <>
          {/* CONCEPT 1: FLUID MECHANICS (VELOCITY PROFILES) */}
          {activeConcept === 'fluid' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
          {/* Main SVG Visualization Canvas */}
          <div
            style={{
              background: '#090d16',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc' }}>
                  PIPE FLOW VELOCITY PROFILE & HYDRODYNAMIC BOUNDARY LAYER
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Hagen-Poiseuille parabolic profile (Laminar) vs Prandtl 1/7th Power Law (Turbulent)
                </div>
              </div>
              <span
                style={{
                  background: isLaminar ? '#047857' : isTransition ? '#d97706' : '#7f1d1d',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 4,
                }}
              >
                {isLaminar ? 'LAMINAR FLOW' : isTransition ? 'TRANSITIONAL REGIME' : 'FULLY TURBULENT'}
              </span>
            </div>

            {/* SVG Interactive Pipe Velocity Profile */}
            <div
              style={{
                width: '100%',
                height: 300,
                background: '#040711',
                borderRadius: 8,
                border: '1px solid #1e293b',
                position: 'relative',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 680 300">
                {/* Pipe Top & Bottom Walls */}
                <rect x="40" y="40" width="600" height="12" fill="#334155" />
                <rect x="40" y="248" width="600" height="12" fill="#334155" />
                {/* Pipe Wall Hatching */}
                <line x1="40" y1="52" x2="640" y2="52" stroke="#64748b" strokeWidth="2" />
                <line x1="40" y1="248" x2="640" y2="248" stroke="#64748b" strokeWidth="2" />

                {/* Centerline */}
                <line x1="40" y1="150" x2="640" y2="150" stroke="#64748b" strokeWidth="1" strokeDasharray="6,4" />
                <text x="635" y="146" fill="#64748b" fontSize="8" textAnchor="end">Centerline (r = 0)</text>

                {/* Parabolic Velocity Profile Vector Field (Blue arrows) */}
                {(() => {
                  const arrows = [];
                  const nVectors = 15;
                  const pipeRadius = 98; // pixels from center (y = 150)
                  for (let i = 0; i <= nVectors; i++) {
                    const rNorm = -1 + (2 * i) / nVectors; // -1 to +1
                    const y = 150 + rNorm * pipeRadius;
                    // Velocity length
                    let uFraction = 0;
                    if (isLaminar) {
                      uFraction = Math.max(0, 1 - rNorm * rNorm); // Parabolic 1 - (r/R)^2
                    } else {
                      uFraction = Math.max(0, Math.pow(1 - Math.abs(rNorm), 1 / 7)); // 1/7th power law
                    }
                    const vecLength = uFraction * 200;
                    const startX = 220;
                    const endX = startX + vecLength;

                    arrows.push(
                      <g key={i}>
                        <line x1={startX} y1={y} x2={endX} y2={y} stroke={isLaminar ? '#38bdf8' : '#f59e0b'} strokeWidth="1.8" />
                        <polygon
                          points={`${endX},${y} ${endX - 5},${y - 3} ${endX - 5},${y + 3}`}
                          fill={isLaminar ? '#38bdf8' : '#f59e0b'}
                        />
                      </g>
                    );
                  }
                  return arrows;
                })()}

                {/* Fitted Curve Outline */}
                {(() => {
                  const pts = [];
                  const pipeRadius = 98;
                  for (let yOffset = -pipeRadius; yOffset <= pipeRadius; yOffset += 4) {
                    const rNorm = yOffset / pipeRadius;
                    const y = 150 + yOffset;
                    let uFraction = 0;
                    if (isLaminar) {
                      uFraction = Math.max(0, 1 - rNorm * rNorm);
                    } else {
                      uFraction = Math.max(0, Math.pow(1 - Math.abs(rNorm), 1 / 7));
                    }
                    const x = 220 + uFraction * 200;
                    pts.push(`${x},${y}`);
                  }
                  return (
                    <polyline
                      fill="none"
                      stroke={isLaminar ? '#38bdf8' : '#f59e0b'}
                      strokeWidth="2.5"
                      points={pts.join(' ')}
                    />
                  );
                })()}

                {/* Animated Streamline Streaks */}
                {animating && (
                  <>
                    <circle cx={(Date.now() / 8) % 600 + 40} cy="150" r="3" fill="#34d399" opacity="0.8" />
                    <circle cx={(Date.now() / 12) % 600 + 40} cy="100" r="2.5" fill="#38bdf8" opacity="0.6" />
                    <circle cx={(Date.now() / 12) % 600 + 40} cy="200" r="2.5" fill="#38bdf8" opacity="0.6" />
                    <circle cx={(Date.now() / 24) % 600 + 40} cy="65" r="2" fill="#94a3b8" opacity="0.4" />
                    <circle cx={(Date.now() / 24) % 600 + 40} cy="235" r="2" fill="#94a3b8" opacity="0.4" />
                  </>
                )}

                {/* Annotations */}
                <text x="220" y="30" fill="#94a3b8" fontSize="10" fontWeight="700">Inlet Plane</text>
                <text x="430" y="145" fill="#38bdf8" fontSize="11" fontWeight="800">u_max = {uMaxLaminar.toFixed(1)} m/s</text>
                <text x="220" y="280" fill="#64748b" fontSize="9">Wall boundary: u(R) = 0 (No-slip condition)</text>
              </svg>
            </div>

            {/* Quick Digital Twin Link to Centrifugal Pump */}
            {onLaunchSimulation && (
              <div style={{ background: '#0b1329', padding: 12, borderRadius: 8, border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                  Connected Flagship Digital Twin: Explore how piping Reynolds number impacts centrifugal pump suction friction & cavitation.
                </span>
                <button
                  type="button"
                  onClick={() => onLaunchSimulation('centrifugal-pump')}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Open 3D Pump Twin <ExternalLink size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Live Controls & Physics Principles */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800 }}>LIVE FLOW CONTROL</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0 0' }}>
                Reynolds Number ($Re$)
              </h3>
            </div>

            <div style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8' }}>REYNOLDS NUMBER:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isLaminar ? '#38bdf8' : '#f59e0b' }}>
                  {reynoldsNum}
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={10000}
                step={100}
                value={reynoldsNum}
                onChange={(e) => setReynoldsNum(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: '#64748b', marginTop: 4 }}>
                <span>500 (Creeping/Laminar)</span>
                <span>2300</span>
                <span>10,000 (Turbulent)</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: '#090d16', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>MEAN VELOCITY (u_avg)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>{uAvg.toFixed(2)} m/s</div>
              </div>
              <div style={{ background: '#090d16', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>VELOCITY RATIO (u_avg/u_max)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isLaminar ? '#38bdf8' : '#f59e0b' }}>
                  {isLaminar ? '0.50' : '0.80'}
                </div>
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: 12, borderRadius: 6, fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              <strong style={{ color: '#38bdf8' }}>Governing Physical Law:</strong>
              <div style={{ marginTop: 4 }}>
                • <strong>Laminar Flow ($Re &lt; 2100$):</strong> Viscous shear forces dominate inertial forces. Fluid moves in smooth concentric cylindrical laminae. Velocity is strictly parabolic:
                <div style={{ fontFamily: 'monospace', color: '#38bdf8', margin: '4px 0' }}>
                  u(r) = 2 · u_avg · [1 - (r/R)²]
                </div>
              </div>
              <div style={{ marginTop: 6 }}>
                • <strong>Turbulent Flow ($Re &gt; 4000$):</strong> Chaotic turbulent eddies promote momentum transfer across fluid layers, flattening the core velocity profile:
                <div style={{ fontFamily: 'monospace', color: '#f59e0b', margin: '4px 0' }}>
                  u(r) = u_max · (1 - r/R)^(1/7)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CONCEPT 2: HEAT TRANSFER (TEMPERATURE GRADIENTS)              */}
      {/* ------------------------------------------------------------- */}
      {activeConcept === 'heat' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
          <div
            style={{
              background: '#090d16',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc' }}>
                  HEAT EXCHANGER AXIAL TEMPERATURE PROFILES & THERMAL PINCH
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Hot Fluid (Red) vs Cold Fluid (Blue) along exchanger length (x = 0 to L)
                </div>
              </div>
              <div style={{ display: 'inline-flex', background: '#0f172a', padding: 2, borderRadius: 6, border: '1px solid #334155' }}>
                <button
                  type="button"
                  onClick={() => {
                    setFlowArrangement('counter');
                    setColdOutletT(65);
                  }}
                  style={{
                    background: flowArrangement === 'counter' ? '#0284c7' : 'transparent',
                    color: flowArrangement === 'counter' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Counter-Current
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFlowArrangement('cocurrent');
                    setColdOutletT(50);
                  }}
                  style={{
                    background: flowArrangement === 'cocurrent' ? '#0284c7' : 'transparent',
                    color: flowArrangement === 'cocurrent' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Co-Current
                </button>
              </div>
            </div>

            {/* SVG Temperature Profile Graph */}
            <div
              style={{
                width: '100%',
                height: 280,
                background: '#040711',
                borderRadius: 8,
                border: '1px solid #1e293b',
                position: 'relative',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 680 280">
                {/* Horizontal T Gridlines */}
                {[20, 40, 60, 80, 100].map((t) => {
                  const y = 240 - ((t - 10) / 95) * 200;
                  return (
                    <g key={t}>
                      <line x1="50" y1={y} x2="630" y2={y} stroke="#1e293b" strokeWidth="0.8" />
                      <text x="42" y={y + 3} fill="#64748b" fontSize="9" textAnchor="end">{t}°C</text>
                    </g>
                  );
                })}

                {/* Length Axis */}
                <line x1="50" y1="240" x2="630" y2="240" stroke="#334155" strokeWidth="1.2" />
                <text x="50" y="258" fill="#94a3b8" fontSize="9">x = 0 (Inlet)</text>
                <text x="630" y="258" fill="#94a3b8" fontSize="9" textAnchor="end">x = L (Outlet)</text>

                {/* Hot Fluid Curve (Red) */}
                {(() => {
                  const pts = [];
                  for (let i = 0; i <= 50; i++) {
                    const frac = i / 50.0;
                    const x = 50 + frac * 580;
                    // Exponential approach
                    const t = hotInletT - (hotInletT - hotOutletT) * (1 - Math.exp(-1.8 * frac)) / (1 - Math.exp(-1.8));
                    const y = 240 - ((t - 10) / 95) * 200;
                    pts.push(`${x},${y}`);
                  }
                  return (
                    <>
                      <polyline fill="none" stroke="#ef4444" strokeWidth="3" points={pts.join(' ')} />
                      <circle cx="50" cy={240 - ((hotInletT - 10) / 95) * 200} r="5" fill="#ef4444" />
                      <circle cx="630" cy={240 - ((hotOutletT - 10) / 95) * 200} r="5" fill="#ef4444" />
                      <text x="60" y={240 - ((hotInletT - 10) / 95) * 200 - 8} fill="#ef4444" fontSize="10" fontWeight="800">
                        Hot In: {hotInletT}°C
                      </text>
                      <text x="620" y={240 - ((hotOutletT - 10) / 95) * 200 - 8} fill="#ef4444" fontSize="10" fontWeight="800" textAnchor="end">
                        Hot Out: {hotOutletT}°C
                      </text>
                    </>
                  );
                })()}

                {/* Cold Fluid Curve (Blue) */}
                {(() => {
                  const pts = [];
                  for (let i = 0; i <= 50; i++) {
                    const frac = i / 50.0;
                    const x = 50 + frac * 580;
                    let t = 0;
                    if (flowArrangement === 'counter') {
                      // Cold enters at x=L (coldInletT) and exits at x=0 (coldOutletT)
                      t = coldOutletT - (coldOutletT - coldInletT) * (1 - Math.exp(-1.8 * frac)) / (1 - Math.exp(-1.8));
                    } else {
                      // Co-current: cold enters at x=0 and exits at x=L
                      t = coldInletT + (coldOutletT - coldInletT) * (1 - Math.exp(-1.8 * frac)) / (1 - Math.exp(-1.8));
                    }
                    const y = 240 - ((t - 10) / 95) * 200;
                    pts.push(`${x},${y}`);
                  }
                  return (
                    <>
                      <polyline fill="none" stroke="#38bdf8" strokeWidth="3" points={pts.join(' ')} />
                      <circle cx="50" cy={240 - (((flowArrangement === 'counter' ? coldOutletT : coldInletT) - 10) / 95) * 200} r="5" fill="#38bdf8" />
                      <circle cx="630" cy={240 - (((flowArrangement === 'counter' ? coldInletT : coldOutletT) - 10) / 95) * 200} r="5" fill="#38bdf8" />
                      <text x="60" y={240 - (((flowArrangement === 'counter' ? coldOutletT : coldInletT) - 10) / 95) * 200 + 16} fill="#38bdf8" fontSize="10" fontWeight="800">
                        {flowArrangement === 'counter' ? `Cold Out: ${coldOutletT}°C` : `Cold In: ${coldInletT}°C`}
                      </text>
                      <text x="620" y={240 - (((flowArrangement === 'counter' ? coldInletT : coldOutletT) - 10) / 95) * 200 + 16} fill="#38bdf8" fontSize="10" fontWeight="800" textAnchor="end">
                        {flowArrangement === 'counter' ? `Cold In: ${coldInletT}°C` : `Cold Out: ${coldOutletT}°C`}
                      </text>
                    </>
                  );
                })()}

                {/* Heat Flux Arrows (Vertical down from hot to cold) */}
                {[150, 340, 500].map((xPos) => (
                  <g key={xPos}>
                    <line x1={xPos} y1="110" x2={xPos} y2="160" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,2" />
                    <polygon points={`${xPos},165 ${xPos - 4},158 ${xPos + 4},158`} fill="#f59e0b" />
                    <text x={xPos + 8} y="140" fill="#f59e0b" fontSize="8" fontWeight="700">q = U·ΔT</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Right Column: Thermal Controls & LMTD Evaluation */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800 }}>THERMAL BOUNDARY CONTROLS</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0 0' }}>
                Approach & LMTD
              </h3>
            </div>

            <div style={{ background: '#1e293b', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#94a3b8' }}>
                <span>Hot Inlet Temp:</span>
                <span style={{ fontWeight: 800, color: '#ef4444' }}>{hotInletT}°C</span>
              </div>
              <input
                type="range"
                min={70}
                max={120}
                value={hotInletT}
                onChange={(e) => setHotInletT(Number(e.target.value))}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>

            <div style={{ background: '#1e293b', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#94a3b8' }}>
                <span>Cold Inlet Temp:</span>
                <span style={{ fontWeight: 800, color: '#38bdf8' }}>{coldInletT}°C</span>
              </div>
              <input
                type="range"
                min={10}
                max={40}
                value={coldInletT}
                onChange={(e) => setColdInletT(Number(e.target.value))}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>

            <div style={{ background: '#090d16', padding: 14, borderRadius: 8, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>LOG MEAN TEMP DIFFERENCE (LMTD)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                {calcLmtd.toFixed(1)} <span style={{ fontSize: '0.8rem' }}>°C</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>
                Counter-current flow yields {flowArrangement === 'counter' ? 'maximum thermal driving force' : 'reduced thermal driving force'}.
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: 12, borderRadius: 6, fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              <strong>Engineering Takeaway:</strong> In counter-current flow, the cold fluid outlet temperature ({coldOutletT}°C) can exceed the hot fluid outlet temperature ({hotOutletT}°C), which is thermodynamically impossible in co-current flow.
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CONCEPT 3: REACTION ENGINEERING (CONVERSION PROFILES)         */}
      {/* ------------------------------------------------------------- */}
      {activeConcept === 'reaction' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
          <div
            style={{
              background: '#090d16',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc' }}>
                CSTR VS. PFR CONCENTRATION & CONVERSION PROFILES
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Backmix dilution in CSTR vs spatial progressive conversion along tubular PFR length
              </div>
            </div>

            {/* SVG Reactor Visual Comparison */}
            <div
              style={{
                width: '100%',
                height: 280,
                background: '#040711',
                borderRadius: 8,
                border: '1px solid #1e293b',
                position: 'relative',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 680 280">
                {/* Left Side: CSTR Visual */}
                <g transform="translate(60, 40)">
                  <rect width="180" height="180" rx="14" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  {/* Agitator shaft & blades */}
                  <line x1="90" y1="0" x2="90" y2="120" stroke="#f8fafc" strokeWidth="3" />
                  <line x1="60" y1="120" x2="120" y2="120" stroke="#f8fafc" strokeWidth="4" />
                  {/* Liquid Fill with uniform color */}
                  <rect x="5" y="40" width="170" height="135" rx="10" fill="#38bdf8" opacity="0.25" />
                  <text x="90" y="25" fill="#f8fafc" fontSize="12" fontWeight="800" textAnchor="middle">CSTR (Well-Mixed)</text>
                  <text x="90" y="80" fill="#38bdf8" fontSize="11" fontWeight="700" textAnchor="middle">
                    C_A = {(1 - cstrConversion).toFixed(2)} C_A0
                  </text>
                  <text x="90" y="105" fill="#34d399" fontSize="12" fontWeight="800" textAnchor="middle">
                    X_A = {(cstrConversion * 100).toFixed(1)}%
                  </text>
                  <text x="90" y="160" fill="#94a3b8" fontSize="9" textAnchor="middle">Uniform composition throughout</text>
                </g>

                {/* Right Side: PFR Tubular Visual */}
                <g transform="translate(360, 40)">
                  <rect width="260" height="70" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                  {/* Gradient to show concentration decaying along length */}
                  <defs>
                    <linearGradient id="pfrGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
                      <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="256" height="66" rx="6" fill="url(#pfrGrad)" />
                  <text x="130" y="-12" fill="#f8fafc" fontSize="12" fontWeight="800" textAnchor="middle">PFR (Plug Flow Tubular)</text>
                  <text x="20" y="40" fill="#ffffff" fontSize="9" fontWeight="800">Inlet C_A0</text>
                  <text x="240" y="40" fill="#ffffff" fontSize="9" fontWeight="800" textAnchor="end">Exit C_A</text>

                  {/* PFR Conversion curve below tube */}
                  <g transform="translate(0, 95)">
                    <line x1="0" y1="80" x2="260" y2="80" stroke="#334155" strokeWidth="1" />
                    <line x1="0" y1="0" x2="260" y2="0" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                    <text x="0" y="94" fill="#64748b" fontSize="8">x = 0</text>
                    <text x="260" y="94" fill="#64748b" fontSize="8" textAnchor="end">x = L</text>
                    <text x="-10" y="4" fill="#10b981" fontSize="9" textAnchor="end">100%</text>

                    {/* Conversion plot line */}
                    {(() => {
                      const pts = [];
                      for (let i = 0; i <= 40; i++) {
                        const frac = i / 40.0;
                        const x = frac * 260;
                        const conv = 1 - Math.exp(-damkohlerDa * frac);
                        const y = 80 - conv * 76;
                        pts.push(`${x},${y}`);
                      }
                      return <polyline fill="none" stroke="#10b981" strokeWidth="2.5" points={pts.join(' ')} />;
                    })()}
                    <circle cx="260" cy={80 - pfrConversion * 76} r="4" fill="#10b981" />
                    <text x="250" y={80 - pfrConversion * 76 - 8} fill="#10b981" fontSize="11" fontWeight="800" textAnchor="end">
                      X_PFR = {(pfrConversion * 100).toFixed(1)}%
                    </text>
                  </g>
                </g>
              </svg>
            </div>
          </div>

          {/* Right Column: Damköhler Knobs & Kinetic Comparison */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800 }}>DIMENSIONLESS DAMKÖHLER NUMBER</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0 0' }}>
                $Da = k \cdot \tau$
              </h3>
            </div>

            <div style={{ background: '#1e293b', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#94a3b8' }}>
                <span>Damköhler Number (Da):</span>
                <span style={{ fontWeight: 800, color: '#38bdf8' }}>{damkohlerDa.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={8.0}
                step={0.1}
                value={damkohlerDa}
                onChange={(e) => setDamkohlerDa(Number(e.target.value))}
                style={{ width: '100%', marginTop: 4 }}
              />
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4 }}>
                Ratio of reaction rate to convective mass flow rate
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: '#090d16', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.66rem', color: '#38bdf8' }}>CSTR CONVERSION</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
                  {(cstrConversion * 100).toFixed(1)}%
                </div>
              </div>
              <div style={{ background: '#090d16', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.66rem', color: '#10b981' }}>PFR CONVERSION</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                  {(pfrConversion * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: 12, borderRadius: 6, fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              <strong style={{ color: '#10b981' }}>Why PFR Outperforms CSTR:</strong> In a positive-order reaction, rate decreases with reactant concentration. In CSTR, the entire tank operates at the low exit concentration C_A. In PFR, reaction starts at high C_A0, sustaining a much higher average rate throughout the tube.
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CONCEPT 4: VLE & MCCABE-THIELE DISTILLATION                   */}
      {/* ------------------------------------------------------------- */}
      {activeConcept === 'vle' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
          <div
            style={{
              background: '#090d16',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc' }}>
                BINARY EQUILIBRIUM CURVE & MCCABE-THIELE STAGE STEPPING
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Relative Volatility (α = {relAlpha.toFixed(2)}) · Operating lines and theoretical equilibrium stages
              </div>
            </div>

            {/* SVG McCabe Thiele Diagram */}
            <div
              style={{
                width: '100%',
                height: 280,
                background: '#040711',
                borderRadius: 8,
                border: '1px solid #1e293b',
                position: 'relative',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 320 280">
                <g transform="translate(40, 20)">
                  {/* Axis lines */}
                  <line x1="0" y1="220" x2="220" y2="220" stroke="#334155" strokeWidth="1.2" />
                  <line x1="0" y1="0" x2="0" y2="220" stroke="#334155" strokeWidth="1.2" />
                  {/* 45 Degree Line */}
                  <line x1="0" y1="220" x2="220" y2="0" stroke="#64748b" strokeWidth="1" strokeDasharray="4,4" />

                  {/* Equilibrium Curve: y = (alpha * x) / (1 + (alpha - 1) * x) */}
                  {(() => {
                    const pts = [];
                    for (let i = 0; i <= 40; i++) {
                      const xFrac = i / 40.0;
                      const yFrac = (relAlpha * xFrac) / (1.0 + (relAlpha - 1.0) * xFrac);
                      const x = xFrac * 220;
                      const y = 220 - yFrac * 220;
                      pts.push(`${x},${y}`);
                    }
                    return <polyline fill="none" stroke="#38bdf8" strokeWidth="2.5" points={pts.join(' ')} />;
                  })()}

                  {/* Rectifying Operating Line: y = (R/(R+1))*x + xD/(R+1) */}
                  {(() => {
                    const xD = 0.92;
                    const slope = refluxR / (refluxR + 1.0);
                    const intercept = xD / (refluxR + 1.0);
                    const xFeed = 0.45;
                    const yFeed = slope * xFeed + intercept;
                    return (
                      <line
                        x1={xFeed * 220}
                        y1={220 - yFeed * 220}
                        x2={xD * 220}
                        y2={220 - xD * 220}
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                    );
                  })()}

                  {/* Stage Stepping staircase (first 3 trays) */}
                  {(() => {
                    let currX = 0.92;
                    let currY = 0.92;
                    const stairs = [];
                    for (let s = 1; s <= 4; s++) {
                      // Horizontal step to eq curve: solve currY = alpha*x / (1 + (alpha-1)*x)
                      const nextX = currY / (relAlpha - currY * (relAlpha - 1.0));
                      // Vertical step to operating line
                      const nextY = (refluxR / (refluxR + 1.0)) * nextX + 0.92 / (refluxR + 1.0);

                      stairs.push(
                        <g key={s}>
                          {/* Horizontal */}
                          <line
                            x1={currX * 220}
                            y1={220 - currY * 220}
                            x2={nextX * 220}
                            y2={220 - currY * 220}
                            stroke="#ec4899"
                            strokeWidth="1.8"
                          />
                          {/* Vertical */}
                          <line
                            x1={nextX * 220}
                            y1={220 - currY * 220}
                            x2={nextX * 220}
                            y2={220 - Math.max(0.1, nextY) * 220}
                            stroke="#ec4899"
                            strokeWidth="1.8"
                          />
                          <text x={nextX * 220 - 4} y={220 - currY * 220 - 4} fill="#ec4899" fontSize="8" fontWeight="800">
                            {s}
                          </text>
                        </g>
                      );
                      currX = nextX;
                      currY = nextY;
                    }
                    return stairs;
                  })()}

                  <text x="110" y="240" fill="#94a3b8" fontSize="9" textAnchor="middle">Liquid Mole Fraction (x)</text>
                  <text x="-12" y="110" fill="#94a3b8" fontSize="9" textAnchor="middle" transform="rotate(-90, -12, 110)">
                    Vapor Mole Fraction (y)
                  </text>
                </g>
              </svg>
            </div>
          </div>

          <div
            style={{
              background: '#0f172a',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800 }}>VLE SEPARATION SELECTOR</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0 0' }}>
                Relative Volatility ($\alpha$)
              </h3>
            </div>

            <div style={{ background: '#1e293b', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#94a3b8' }}>
                <span>Relative Volatility (α):</span>
                <span style={{ fontWeight: 800, color: '#38bdf8' }}>{relAlpha.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={1.1}
                max={5.0}
                step={0.1}
                value={relAlpha}
                onChange={(e) => setRelAlpha(Number(e.target.value))}
                style={{ width: '100%', marginTop: 4 }}
              />
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4 }}>
                α = 1.0 represents an azeotrope (inseparable by simple distillation)
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#94a3b8' }}>
                <span>Reflux Ratio (R):</span>
                <span style={{ fontWeight: 800, color: '#f59e0b' }}>{refluxR.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0.8}
                max={4.0}
                step={0.1}
                value={refluxR}
                onChange={(e) => setRefluxR(Number(e.target.value))}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>

            <div style={{ background: '#1e293b', padding: 12, borderRadius: 6, fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              <strong>Stage Stepping Rule:</strong> As relative volatility increases, the equilibrium envelope expands upward, requiring fewer theoretical trays to reach the high-purity distillate specification ($x_D = 0.92$).
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CONCEPT 5: THERMODYNAMICS (T-x-y ENVELOPE)                    */}
      {/* ------------------------------------------------------------- */}
      {activeConcept === 'thermo' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
          <div
            style={{
              background: '#090d16',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc' }}>
                VAPOR-LIQUID EQUILIBRIUM PHASE ENVELOPE ($T-x-y$ DIAGRAM)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Benzene (Light Boiler, T_b = 80.1°C) – Toluene (Heavy Boiler, T_b = 110.6°C) at 1.013 bar
              </div>
            </div>

            <div
              style={{
                width: '100%',
                height: 280,
                background: '#040711',
                borderRadius: 8,
                border: '1px solid #1e293b',
                position: 'relative',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 680 280">
                {/* Horizontal T Grid */}
                {[80, 90, 100, 110].map((t) => {
                  const y = 240 - ((t - 75) / 40) * 200;
                  return (
                    <g key={t}>
                      <line x1="60" y1={y} x2="620" y2={y} stroke="#1e293b" strokeWidth="0.8" />
                      <text x="50" y={y + 3} fill="#64748b" fontSize="9" textAnchor="end">{t}°C</text>
                    </g>
                  );
                })}

                <line x1="60" y1="240" x2="620" y2="240" stroke="#334155" strokeWidth="1.2" />
                <text x="60" y="258" fill="#94a3b8" fontSize="9">x = 0 (Pure Toluene, 110.6°C)</text>
                <text x="620" y="258" fill="#94a3b8" fontSize="9" textAnchor="end">x = 1 (Pure Benzene, 80.1°C)</text>

                {/* Bubble Point Curve (Lower blue line) */}
                {(() => {
                  const pts = [];
                  for (let i = 0; i <= 40; i++) {
                    const xFrac = i / 40.0;
                    const x = 60 + xFrac * 560;
                    const t = 110.6 - xFrac * 27.5 - xFrac * (1 - xFrac) * 6.0;
                    const y = 240 - ((t - 75) / 40) * 200;
                    pts.push(`${x},${y}`);
                  }
                  return <polyline fill="none" stroke="#38bdf8" strokeWidth="2.5" points={pts.join(' ')} />;
                })()}

                {/* Dew Point Curve (Upper orange line) */}
                {(() => {
                  const pts = [];
                  for (let i = 0; i <= 40; i++) {
                    const yFrac = i / 40.0;
                    const x = 60 + yFrac * 560;
                    const t = 110.6 - yFrac * 27.5 + yFrac * (1 - yFrac) * 8.0;
                    const y = 240 - ((t - 75) / 40) * 200;
                    pts.push(`${x},${y}`);
                  }
                  return <polyline fill="none" stroke="#f59e0b" strokeWidth="2.5" points={pts.join(' ')} />;
                })()}

                {/* Tie-Line at T = 95°C */}
                {(() => {
                  const tieY = 240 - ((95 - 75) / 40) * 200;
                  return (
                    <g>
                      <line x1="220" y1={tieY} x2="480" y2={tieY} stroke="#10b981" strokeWidth="2" strokeDasharray="4,2" />
                      <circle cx="220" cy={tieY} r="5" fill="#38bdf8" />
                      <circle cx="480" cy={tieY} r="5" fill="#f59e0b" />
                      <text x="350" y={tieY - 8} fill="#10b981" fontSize="10" fontWeight="800" textAnchor="middle">
                        Tie-Line (T = 95°C) · Lever Rule
                      </text>
                      <text x="220" y={tieY + 16} fill="#38bdf8" fontSize="9" fontWeight="700">Liquid x = 0.28</text>
                      <text x="480" y={tieY + 16} fill="#f59e0b" fontSize="9" fontWeight="700">Vapor y = 0.58</text>
                    </g>
                  );
                })()}

                <text x="140" y="210" fill="#38bdf8" fontSize="11" fontWeight="800">Subcooled Liquid</text>
                <text x="350" y="70" fill="#f59e0b" fontSize="11" fontWeight="800" textAnchor="middle">Superheated Vapor</text>
                <text x="350" y="160" fill="#cbd5e1" fontSize="10" textAnchor="middle">Two-Phase Vapor + Liquid</text>
              </svg>
            </div>
          </div>

          <div
            style={{
              background: '#0f172a',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800 }}>PHASE EQUILIBRIUM RULE</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0 0' }}>
                Lever Arm Rule
              </h3>
            </div>

            <div style={{ background: '#1e293b', padding: 14, borderRadius: 8, fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              <div>• <strong>Bubble Point Curve (Blue):</strong> Saturated liquid boundary. Heating beyond this point produces the first bubble of vapor.</div>
              <div style={{ marginTop: 8 }}>• <strong>Dew Point Curve (Orange):</strong> Saturated vapor boundary. Cooling below this point produces the first drop of condensate.</div>
              <div style={{ marginTop: 8 }}>• <strong>Lever Arm Rule:</strong> Inside the two-phase envelope at temperature T:
                <div style={{ fontFamily: 'monospace', color: '#34d399', margin: '4px 0' }}>
                  V / L = (z - x) / (y - z)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* ============================================================= */}
      {/* 2. EQUATION EXPLORER & VARIABLE SENSITIVITY INSPECTOR         */}
      {/* ============================================================= */}
      {studioMode === 'equations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: 20 }}>
          {/* Equation Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
              Select Governing Equation
            </div>
            {[
              { id: 0, title: 'Darcy-Weisbach Pipe Head Loss', eq: 'ΔP = f * (L/D) * (ρ v² / 2)', subject: 'Fluid Mechanics' },
              { id: 1, title: 'Ergun Packed Bed Pressure Drop', eq: 'ΔP/L = 150(1-ε)²μ u0 / (ε³ dp²) + 1.75(1-ε)ρ u0² / (ε³ dp)', subject: 'Mechanical Operations' },
              { id: 2, title: 'Log Mean Temperature Difference (LMTD)', eq: 'ΔT_lm = (ΔT1 - ΔT2) / ln(ΔT1 / ΔT2)', subject: 'Process Heat Transfer' },
              { id: 3, title: 'CSTR Performance Design Equation', eq: 'V = (F_A0 * X_A) / (-r_A)', subject: 'Reaction Engineering' },
              { id: 4, title: 'Arrhenius Temperature Dependence', eq: 'k = A * exp(-E_a / (R * T))', subject: 'Reaction Kinetics' },
              { id: 5, title: 'Fick’s First Law of Molecular Diffusion', eq: 'J_A = - D_AB * (dC_A / dz)', subject: 'Mass Transfer Operations' },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedEqIndex(item.id);
                  if (item.id === 0) setSelectedVariable('f');
                  if (item.id === 1) setSelectedVariable('eps');
                  if (item.id === 2) setSelectedVariable('dT1');
                  if (item.id === 3) setSelectedVariable('V');
                  if (item.id === 4) setSelectedVariable('Ea');
                  if (item.id === 5) setSelectedVariable('DAB');
                }}
                style={{
                  background: selectedEqIndex === item.id ? '#1e3a8a' : '#0f172a',
                  border: selectedEqIndex === item.id ? '1px solid #38bdf8' : '1px solid #1e293b',
                  borderRadius: 8,
                  padding: 12,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 800 }}>{item.subject}</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', margin: '2px 0 4px' }}>{item.title}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.74rem', color: '#94a3b8' }}>{item.eq}</div>
              </div>
            ))}
          </div>

          {/* Equation Detailed Inspector */}
          <div style={{ background: '#090d16', border: '1px solid #1e3a8a', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selectedEqIndex === 0 && (
              <>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800 }}>MOMENTUM TRANSFER</span>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                    Darcy-Weisbach Pipe Friction Head Loss
                  </h2>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#34d399', background: '#0c1424', padding: 12, borderRadius: 6, margin: '8px 0' }}>
                    ΔP = f · (L / D) · (ρ · v² / 2)
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#cbd5e1', marginBottom: 8 }}>
                    Click Any Variable to Inspect Its Physics:
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      { key: 'dP', symbol: 'ΔP', label: 'Pressure Drop' },
                      { key: 'f', symbol: 'f', label: 'Darcy Friction Factor' },
                      { key: 'L', symbol: 'L', label: 'Pipe Length' },
                      { key: 'D', symbol: 'D', label: 'Pipe Internal Diameter' },
                      { key: 'rho', symbol: 'ρ', label: 'Fluid Density' },
                      { key: 'v', symbol: 'v', label: 'Flow Velocity' },
                    ].map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => setSelectedVariable(v.key)}
                        style={{
                          background: selectedVariable === v.key ? '#0284c7' : '#0f172a',
                          color: selectedVariable === v.key ? '#ffffff' : '#94a3b8',
                          border: selectedVariable === v.key ? '1px solid #38bdf8' : '1px solid #334155',
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {v.symbol} ({v.label})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Variable Breakdown */}
                <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 16 }}>
                  {selectedVariable === 'f' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem', color: '#cbd5e1' }}>
                      <div><strong style={{ color: '#38bdf8' }}>Variable:</strong> Darcy friction factor (f)</div>
                      <div><strong style={{ color: '#38bdf8' }}>SI Units:</strong> Dimensionless [1] (Note: f_Darcy = 4 * f_Fanning)</div>
                      <div><strong style={{ color: '#38bdf8' }}>Physical Meaning:</strong> Ratio of wall shear stress to kinetic energy per unit volume: f = 8 τ_w / (ρ v²).</div>
                      <div><strong style={{ color: '#38bdf8' }}>Sensitivity:</strong> For laminar flow (Re &lt; 2100), f = 64 / Re. For turbulent flow, governed by Colebrook-White equation depending on relative roughness ε/D.</div>
                      <div><strong style={{ color: '#38bdf8' }}>Industrial Example:</strong> Commercial clean carbon steel pipe (ε = 0.045 mm) at Re = 150,000 yields f ≈ 0.021.</div>
                    </div>
                  )}
                  {selectedVariable === 'D' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem', color: '#cbd5e1' }}>
                      <div><strong style={{ color: '#38bdf8' }}>Variable:</strong> Pipe Internal Diameter (D)</div>
                      <div><strong style={{ color: '#38bdf8' }}>SI Units:</strong> Meters [m]</div>
                      <div><strong style={{ color: '#38bdf8' }}>Extreme Sensitivity (D⁻⁵ Law):</strong> At constant volumetric flow rate Q, since v = 4Q/(π D²), pressure drop scales as ΔP ∝ 1 / D⁵! Halving pipe diameter increases pressure drop by 32 times!</div>
                      <div><strong style={{ color: '#38bdf8' }}>Industrial Practice:</strong> Never undersize process piping lines to save initial pipe cost; pumping operating power will quickly overwhelm capital savings.</div>
                    </div>
                  )}
                  {selectedVariable !== 'f' && selectedVariable !== 'D' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem', color: '#cbd5e1' }}>
                      <div><strong style={{ color: '#38bdf8' }}>Variable:</strong> Selected parameter in Darcy-Weisbach mechanical energy balance.</div>
                      <div><strong style={{ color: '#38bdf8' }}>Velocity Scaling:</strong> ΔP scales quadratically with flow velocity (v²). Operating at high velocities above 3 m/s causes excessive erosion and hydraulic water hammer.</div>
                    </div>
                  )}
                </div>
              </>
            )}

            {selectedEqIndex !== 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
                Inspect variable units, dimensions, sensitivities, and worked numerical examples for {selectedEqIndex === 1 ? 'Ergun packed bed equation' : selectedEqIndex === 2 ? 'LMTD heat exchanger rating' : selectedEqIndex === 3 ? 'CSTR mole balance' : selectedEqIndex === 4 ? 'Arrhenius rate constant' : 'Fick diffusion flux'}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 3. 8-STEP ENGINEERING PROBLEM SOLVER                          */}
      {/* ============================================================= */}
      {studioMode === 'solver' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ background: '#090d16', border: '1px solid #1e3a8a', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>
                8-STAGE FIRST-PRINCIPLES SOLVER
              </span>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Methodical Engineering Framework</span>
            </div>

            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              Problem: Head Loss & Pump Brake Power in Turbulent Steel Pipe
            </div>

            <div style={{ background: '#0c1424', borderLeft: '3px solid #38bdf8', padding: 12, borderRadius: 6, fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              Water at 20°C (ρ = 1000 kg/m³, μ = 0.001 Pa·s) is pumped through a 50 mm ID commercial steel pipe (roughness ε = 0.045 mm) of length 60 m at a flow rate of 20 m³/h. The discharge reservoir is elevated 15 m above the suction tank. The pump hydraulic efficiency is 72%. Calculate total pressure drop and required motor brake power.
            </div>

            {/* 8 Methodical Steps */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginTop: 6 }}>
              {[
                { step: 1, title: 'Identify Knowns', desc: 'Q = 20 m³/h = 0.00556 m³/s, D = 0.05 m, L = 60 m, ε = 0.045 mm, Δz = 15 m, η = 0.72, ρ = 1000 kg/m³, μ = 1e-3 Pa·s' },
                { step: 2, title: 'Identify Unknowns', desc: 'Target: Total dynamic head H [m], Pressure drop ΔP [kPa], Motor brake power P_brake [kW]' },
                { step: 3, title: 'Governing Equations', desc: 'Continuity: v = Q/A. Re = ρ v D / μ. Colebrook: 1/√f = -2 log(ε/3.7D + 2.51/Re√f). Darcy: h_f = f(L/D)(v²/2g). Power: P = ρ g Q H / η' },
                { step: 4, title: 'Unit Consistency Check', desc: 'Convert Q from m³/h to m³/s: 20 / 3600 = 0.00556 m³/s. Area A = π(0.05)²/4 = 0.001963 m²' },
                { step: 5, title: 'Numerical Substitution', desc: 'v = 0.00556 / 0.001963 = 2.83 m/s. Re = (1000 * 2.83 * 0.05) / 1e-3 = 141,500 (Turbulent). ε/D = 0.045/50 = 0.0009' },
                { step: 6, title: 'Compute Solution', desc: 'f = 0.0212. h_f = 0.0212 * (60/0.05) * (2.83)² / (2 * 9.81) = 10.38 m. H_total = 15 + 10.38 = 25.38 m. P_brake = (1000 * 9.81 * 0.00556 * 25.38) / (1000 * 0.72) = 1.92 kW' },
                { step: 7, title: 'Physical Meaning', desc: 'Friction in the 60m pipe consumes 10.38 m (41%) of total pump head. Static elevation accounts for the remaining 59% (15 m)' },
                { step: 8, title: 'Sanity Check / Rules of Thumb', desc: 'Velocity v = 2.83 m/s is within the acceptable industrial liquid discharge range (1.5 - 3.0 m/s). Motor power of 2.2 kW standard motor covers 1.92 kW with a 15% safety factor' },
              ].map((s) => (
                <div key={s.step} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 2 }}>
                    Step {s.step}: {s.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                    {s.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 4. MISCONCEPTION DETECTOR (8 CLASSIC TRAPS)                   */}
      {/* ============================================================= */}
      {studioMode === 'misconceptions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: 20 }}>
          {/* Trap Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
              8 Classic Conceptual Traps
            </div>
            {[
              { id: 0, title: '1. Pressure vs Developed Head' },
              { id: 1, title: '2. Mass Fraction vs Mole Fraction' },
              { id: 2, title: '3. Critical Reynolds Number in Beds' },
              { id: 3, title: '4. Equilibrium Line vs Operating Line' },
              { id: 4, title: '5. CSTR vs PFR Concentration Gradients' },
              { id: 5, title: '6. Misusing LMTD in Multi-Pass Exchangers' },
              { id: 6, title: '7. Steady-State vs Transient Response' },
              { id: 7, title: '8. Theoretical Stages vs Actual Trays' },
            ].map((trap) => (
              <button
                key={trap.id}
                type="button"
                onClick={() => {
                  setSelectedMisconceptionIndex(trap.id);
                  setSelectedQuizAnswer(null);
                  setQuizSubmitted(false);
                }}
                style={{
                  background: selectedMisconceptionIndex === trap.id ? '#1e3a8a' : '#0f172a',
                  color: selectedMisconceptionIndex === trap.id ? '#ffffff' : '#94a3b8',
                  border: selectedMisconceptionIndex === trap.id ? '1px solid #38bdf8' : '1px solid #1e293b',
                  padding: '10px 14px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {trap.title}
              </button>
            ))}
          </div>

          {/* Diagnostic Question & Analysis */}
          <div style={{ background: '#090d16', border: '1px solid #1e3a8a', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selectedMisconceptionIndex === 0 && (
              <>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 800 }}>CONCEPTUAL DIAGNOSTIC TRAP #1</span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                    Does a centrifugal pump generate the same pressure when pumping gasoline as when pumping water at the same RPM?
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { id: 0, text: 'Yes, because the impeller diameter and speed determine the output pressure.', isCorrect: false },
                    { id: 1, text: 'No, the pump generates constant head (meters of liquid column), but pressure P = ρ g H is 28% lower for gasoline due to lower density (720 vs 1000 kg/m³).', isCorrect: true },
                    { id: 2, text: 'Yes, but power consumption will be 50% higher.', isCorrect: false },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setSelectedQuizAnswer(opt.id);
                        setQuizSubmitted(true);
                      }}
                      style={{
                        background: selectedQuizAnswer === opt.id ? (opt.isCorrect ? '#064e3b' : '#7f1d1d') : '#0f172a',
                        border: selectedQuizAnswer === opt.id ? (opt.isCorrect ? '1px solid #10b981' : '1px solid #ef4444') : '1px solid #1e293b',
                        padding: 12,
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        color: '#f8fafc',
                        lineHeight: 1.4,
                      }}
                    >
                      {opt.text}
                    </div>
                  ))}
                </div>

                {quizSubmitted && (
                  <div style={{ background: '#0c1424', border: '1px solid #10b981', borderRadius: 8, padding: 14, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 800, color: '#10b981', marginBottom: 4 }}>
                      Engineering Physical Principle:
                    </div>
                    Centrifugal impellers impart velocity to fluid particles governed purely by geometry and angular velocity: u2 = ω r2. Therefore, developed head H = (u2 v_t2)/g is independent of fluid density. However, static pressure P = ρ g H depends directly on fluid density! A pump delivering 50 m of head will produce 490 kPa with water (1000 kg/m³), but only 353 kPa with gasoline (720 kg/m³).
                  </div>
                )}
              </>
            )}

            {selectedMisconceptionIndex !== 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: '0.86rem' }}>
                Select an answer to test your conceptual intuition and inspect the detailed first-principles breakdown.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 5. DEGREE KNOWLEDGE GRAPH & PREREQUISITES                     */}
      {/* ============================================================= */}
      {studioMode === 'graph' && (
        <div style={{ background: '#090d16', border: '1px solid #1e3a8a', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800 }}>CURRICULUM PREREQUISITE ARCHITECTURE</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
              Chemical Engineering Degree Knowledge Graph
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
              Visualizing how foundational 2nd-year physics flow into 3rd-year unit operations, 4th-year plant design, and industrial troubleshooting.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {[
              { id: 'fluids', title: 'Momentum Transfer (Sem III)', prereq: 'Integral Transforms (Math)', next: 'Process Equipment Design (Sem V)', career: 'Piping & Line Sizing' },
              { id: 'pumps', title: 'Centrifugal Turbomachinery', prereq: 'Bernoulli Balance (Sem III)', next: 'Process Control Loops (Sem VI)', career: 'API 610 Pump Sizing' },
              { id: 'heat', title: 'Process Heat Transfer (Sem IV)', prereq: 'Conduction & Convection', next: 'Pinch Heat Integration (Sem VII)', career: 'TEMA Exchanger Rating' },
              { id: 'thermo', title: 'Thermodynamics & VLE (Sem IV)', prereq: 'Physical Chemistry', next: 'Binary Distillation (Sem V)', career: 'Property Method Selection' },
              { id: 'cre', title: 'Reaction Engineering (Sem IV & V)', prereq: 'Chemical Kinetics', next: 'Reactor Runaway Control (Sem VI)', career: 'Scaleup & Kinetic Modeling' },
              { id: 'control', title: 'Process Dynamics & Control (Sem VI)', prereq: 'Laplace Transforms & Transfer Functions', next: 'DCS & SCADA Operations', career: 'PID Loop Tuning (Emerson/Honeywell)' },
              { id: 'design', title: 'Plant Design & Economics (Sem VII)', prereq: 'H&MB Stoichiometry + Equipment Sizing', next: 'Final Year Capstone Project (Sem VIII)', career: 'FEED Process Engineering' },
              { id: 'troubleshoot', title: 'Industrial Plant Troubleshooting', prereq: 'All Degree Engineering Competencies', next: 'Graduate Engineer Trainee Placement', career: 'Plant Operations & Turnarounds' },
            ].map((node) => (
              <div
                key={node.id}
                onClick={() => setSelectedGraphNode(node.id)}
                style={{
                  background: selectedGraphNode === node.id ? '#1e3a8a' : '#0f172a',
                  border: selectedGraphNode === node.id ? '1px solid #38bdf8' : '1px solid #1e293b',
                  borderRadius: 8,
                  padding: 14,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>
                  {node.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  <strong style={{ color: '#64748b' }}>Prerequisite:</strong> {node.prereq}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  <strong style={{ color: '#38bdf8' }}>Leads to:</strong> {node.next}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: 4 }}>
                  <strong>Placement:</strong> {node.career}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VisualConceptExplorer;
