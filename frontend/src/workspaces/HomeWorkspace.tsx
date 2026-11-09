import { useState } from 'react';
import {
  Activity,
  Wind,
  Flame,
  Atom,
  Layers,
  Droplet,
  Compass,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { ChemSimLogo } from '../components/ChemSimLogo';

interface HomeWorkspaceProps {
  onNavigate: (workspace: string, subModule?: string) => void;
}

export function HomeWorkspace({ onNavigate }: HomeWorkspaceProps) {
  // Interactive Hero Simulation State
  const [heroPumpSpeed, setHeroPumpSpeed] = useState<number>(2950); // RPM
  const [heroFlowRate, setHeroFlowRate] = useState<number>(25.0); // m3/h
  const [heroHotTemp, setHeroHotTemp] = useState<number>(85.0); // °C

  // Dynamic calculations for hero process loop
  const speedRatio = heroPumpSpeed / 2950;
  const heroHead = Math.max(5, 55.0 * (speedRatio ** 2) - 0.045 * ((heroFlowRate / speedRatio) ** 2));
  const heroPower = (heroFlowRate * heroHead * 9.80665 * 1000) / (3600 * 1000 * 0.72);
  const heroConversion = (1.0 - Math.exp(-0.065 * (heroFlowRate > 0 ? 50 / heroFlowRate : 1.0))) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 64, color: '#f8fafc', paddingBottom: 48 }}>
      {/* ================================================================= */}
      {/* 1. HERO SECTION                                                   */}
      {/* ================================================================= */}
      <section
        style={{
          position: 'relative',
          padding: '60px 48px 68px',
          background: 'linear-gradient(135deg, #070d19 0%, #0c162c 60%, #0a1f3d 100%)',
          borderRadius: 16,
          border: '1px solid #1e3a8a',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Engineering Grid Backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.12,
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#38bdf8 1px, #070d19 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          {/* Brand Eyebrow Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(2, 132, 199, 0.18)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              padding: '5px 14px',
              borderRadius: 20,
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            <ChemSimLogo size={16} showWordmark={false} />
            <span>Chemical Engineering Simulation & Virtual Laboratory</span>
          </div>

          {/* Primary Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.12,
              margin: '0 0 18px',
              color: '#ffffff',
            }}
          >
            Understand Engineering.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Simulate Reality.
            </span>
          </h1>

          {/* Supporting Statement */}
          <p
            style={{
              fontSize: 'clamp(1.0rem, 2vw, 1.25rem)',
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: 780,
              margin: '0 auto 32px',
            }}
          >
            An interactive chemical engineering laboratory for learning, experimentation, process design, and
            industrial simulation. Explore physical components, run first-principles virtual experiments, and master
            practical plant workflows.
          </p>

          {/* Call to Actions (CTAs) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 44 }}>
            <button
              type="button"
              onClick={() => onNavigate('centrifugal-pump')}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '14px 28px',
                borderRadius: 8,
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(2, 132, 199, 0.4)',
                transition: 'all 0.15s ease',
              }}
            >
              Explore Simulations <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('learn')}
              style={{
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                padding: '14px 24px',
                borderRadius: 8,
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Activity size={18} color="#38bdf8" /> Explore Learning Modules
            </button>

            <button
              type="button"
              onClick={() => onNavigate('lab')}
              style={{
                background: '#064e3b',
                color: '#6ee7b7',
                border: '1px solid #10b981',
                padding: '14px 24px',
                borderRadius: 8,
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Compass size={18} /> Virtual Lab SOPs
            </button>
          </div>

          {/* Interactive Live Process Simulation Graphic (Hero Stage) */}
          <div
            style={{
              background: '#040711',
              borderRadius: 12,
              border: '1px solid #1e3a8a',
              padding: 24,
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.6)',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc' }}>
                  LIVE PROCESS CIRCUIT · CONTINUOUS REACTION & SEPARATION TRAIN
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Interactive First-Principles Simulation Loop
              </span>
            </div>

            {/* SVG Engineering Flow Diagram */}
            <div style={{ width: '100%', height: 260, position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 900 260">
                {/* Connecting Process Pipe Lines with Arrows */}
                <defs>
                  <marker id="heroArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
                  </marker>
                </defs>

                {/* Stream 1: Tank to Pump */}
                <path d="M 120 130 L 220 130" stroke="#38bdf8" strokeWidth="3" fill="none" markerEnd="url(#heroArrow)" />
                {/* Stream 2: Pump to Exchanger */}
                <path d="M 280 130 L 380 130" stroke="#38bdf8" strokeWidth="3" fill="none" markerEnd="url(#heroArrow)" />
                {/* Stream 3: Exchanger to Reactor */}
                <path d="M 440 130 L 560 130" stroke="#f59e0b" strokeWidth="3" fill="none" markerEnd="url(#heroArrow)" />
                {/* Stream 4: Reactor to Column */}
                <path d="M 640 130 L 760 130" stroke="#34d399" strokeWidth="3" fill="none" markerEnd="url(#heroArrow)" />

                {/* Node 1: Surge Tank TK-101 */}
                <g transform="translate(60, 80)">
                  <rect width="60" height="100" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                  <text x="30" y="45" fill="#f8fafc" fontSize="10" fontWeight="800" textAnchor="middle">TK-101</text>
                  <text x="30" y="65" fill="#94a3b8" fontSize="8" textAnchor="middle">Feed Tank</text>
                  <text x="30" y="85" fill="#38bdf8" fontSize="8" textAnchor="middle">50 m³</text>
                </g>

                {/* Node 2: Centrifugal Pump P-101 */}
                <g
                  transform="translate(220, 100)"
                  onClick={() => onNavigate('centrifugal-pump')}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx="30" cy="30" r="28" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
                  <line x1="30" y1="12" x2="30" y2="48" stroke="#38bdf8" strokeWidth="2" />
                  <line x1="12" y1="30" x2="48" y2="30" stroke="#38bdf8" strokeWidth="2" />
                  <text x="30" y="72" fill="#f8fafc" fontSize="10" fontWeight="800" textAnchor="middle">P-101</text>
                  <text x="30" y="84" fill="#38bdf8" fontSize="8" textAnchor="middle">API 610 Twin</text>
                </g>

                {/* Node 3: Shell & Tube Exchanger E-101 */}
                <g
                  transform="translate(380, 95)"
                  onClick={() => onNavigate('heat-exchanger')}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx="35" cy="35" r="30" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                  <path d="M 18 35 Q 26 18, 35 35 T 52 35" stroke="#f59e0b" strokeWidth="2" fill="none" />
                  <text x="35" y="78" fill="#f8fafc" fontSize="10" fontWeight="800" textAnchor="middle">E-101</text>
                  <text x="35" y="90" fill="#f59e0b" fontSize="8" textAnchor="middle">Preheater</text>
                </g>

                {/* Node 4: CSTR Reactor R-101 */}
                <g
                  transform="translate(560, 80)"
                  onClick={() => onNavigate('reactor')}
                  style={{ cursor: 'pointer' }}
                >
                  <rect width="60" height="95" rx="14" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                  <line x1="30" y1="0" x2="30" y2="65" stroke="#e2e8f0" strokeWidth="2" />
                  <line x1="18" y1="65" x2="42" y2="65" stroke="#e2e8f0" strokeWidth="3" />
                  <text x="30" y="45" fill="#f8fafc" fontSize="10" fontWeight="800" textAnchor="middle">R-101</text>
                  <text x="30" y="60" fill="#10b981" fontSize="8" textAnchor="middle">CSTR</text>
                </g>

                {/* Node 5: Distillation Column T-101 */}
                <g
                  transform="translate(760, 60)"
                  onClick={() => onNavigate('distillation')}
                  style={{ cursor: 'pointer' }}
                >
                  <rect width="55" height="135" rx="10" fill="#0f172a" stroke="#a78bfa" strokeWidth="2" />
                  <line x1="10" y1="35" x2="45" y2="35" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3,2" />
                  <line x1="10" y1="70" x2="45" y2="70" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3,2" />
                  <line x1="10" y1="105" x2="45" y2="105" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3,2" />
                  <text x="27" y="50" fill="#f8fafc" fontSize="10" fontWeight="800" textAnchor="middle">T-101</text>
                  <text x="27" y="64" fill="#a78bfa" fontSize="8" textAnchor="middle">Fractionator</text>
                </g>
              </svg>
            </div>

            {/* Interactive Hero Controls & Live Readouts */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid #1e293b',
              }}
            >
              <div style={{ background: '#0f172a', padding: 10, borderRadius: 6 }}>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>PUMP SPEED (N)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa' }}>
                  {heroPumpSpeed} <span style={{ fontSize: '0.72rem' }}>RPM</span>
                </div>
                <input
                  type="range"
                  min={1450}
                  max={3500}
                  step={50}
                  value={heroPumpSpeed}
                  onChange={(e) => setHeroPumpSpeed(Number(e.target.value))}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>

              <div style={{ background: '#0f172a', padding: 10, borderRadius: 6 }}>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>PUMP FLOW RATE (Q)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
                  {heroFlowRate.toFixed(1)} <span style={{ fontSize: '0.72rem' }}>m³/h</span>
                </div>
                <input
                  type="range"
                  min={5.0}
                  max={40.0}
                  step={1.0}
                  value={heroFlowRate}
                  onChange={(e) => setHeroFlowRate(Number(e.target.value))}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>

              <div style={{ background: '#0f172a', padding: 10, borderRadius: 6 }}>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>DEVELOPED HEAD (H)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
                  {heroHead.toFixed(1)} <span style={{ fontSize: '0.72rem' }}>m</span>
                </div>
                <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Brake Power: {heroPower.toFixed(2)} kW</div>
              </div>

              <div style={{ background: '#0f172a', padding: 10, borderRadius: 6 }}>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>EXCHANGER TEMP (T)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
                  {heroHotTemp.toFixed(1)} <span style={{ fontSize: '0.72rem' }}>°C</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={120}
                  step={2}
                  value={heroHotTemp}
                  onChange={(e) => setHeroHotTemp(Number(e.target.value))}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>

              <div style={{ background: '#0f172a', padding: 10, borderRadius: 6 }}>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>REACTOR CONVERSION</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                  {heroConversion.toFixed(1)} <span style={{ fontSize: '0.72rem' }}>%</span>
                </div>
                <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Damköhler Scaling</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. EXPLORE THE LABORATORY (THE 6 DISCIPLINES)                     */}
      {/* ================================================================= */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Foundational Engineering Curriculum
          </span>
          <h2 style={{ fontSize: '2.0rem', fontWeight: 900, color: '#f8fafc', margin: '4px 0 8px' }}>
            Explore the Laboratory Disciplines
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: 840, margin: 0, lineHeight: 1.5 }}>
            Every discipline is connected to deterministic mathematical engines, transparent SI unit frameworks,
            and interactive virtual equipment.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 18 }}>
          {[
            {
              title: 'Momentum Transfer & Fluid Machinery',
              code: '21CH32',
              desc: 'Euler turbomachinery, centrifugal pump 3D anatomy, Bernoulli energy conservation, pipe friction loss, and NPSHa cavitation prediction.',
              icon: Wind,
              accent: '#38bdf8',
              route: 'centrifugal-pump',
              eq: 'H = (u₂·c_u2 - u₁·c_u1) / g',
            },
            {
              title: 'Mechanical Operations & Particulate Dynamics',
              code: '21CH42',
              desc: 'Fixed packed and fluidised bed dynamics, Ergun equation pressure drop decomposition, minimum fluidisation velocity (u_mf), and Geldart classification.',
              icon: Compass,
              accent: '#34d399',
              route: 'fluidisation',
              eq: 'ΔP/L = 150·μ·u(1-ε)²/(d²·ε³) + 1.75·ρ·u²(1-ε)/(d·ε³)',
            },
            {
              title: 'Heat Transfer Operations',
              code: '21CH52',
              desc: 'Log Mean Temperature Difference (LMTD), shell-and-tube heat exchanger rating, thermal approach, and tube fouling resistance dynamics.',
              icon: Flame,
              accent: '#f59e0b',
              route: 'heat-exchanger',
              eq: 'Q = m·Cp·ΔT = U·A·F·LMTD',
            },
            {
              title: 'Mass Transfer & Separation Processes',
              code: '21CH62',
              desc: 'Binary distillation stage stepping via McCabe-Thiele, relative volatility (α), minimum reflux ratio (R_min), and vapor-liquid equilibrium.',
              icon: Layers,
              accent: '#a78bfa',
              route: 'distillation',
              eq: 'y = (α·x) / [1 + (α - 1)·x]',
            },
            {
              title: 'Chemical Reaction Engineering',
              code: '21CH53',
              desc: 'Continuous Stirred Tank Reactor (CSTR) vs Plug Flow Reactor (PFR) performance, space time (τ), Damköhler number, and Arrhenius kinetics.',
              icon: Atom,
              accent: '#10b981',
              route: 'reactor',
              eq: 'X_CSTR = Da / (1 + Da)  vs  X_PFR = 1 - exp(-Da)',
            },
            {
              title: 'Chemical Engineering Thermodynamics',
              code: '21CH33',
              desc: 'Pure component Antoine vapor pressure database, Raoult’s law binary phase envelopes (T-x-y), dew point, bubble point, and lever rule.',
              icon: Droplet,
              accent: '#38bdf8',
              route: 'thermo',
              eq: 'ln(P_sat) = A - B / (T + C)',
            },
          ].map((d, idx) => {
            const Icon = d.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate(d.route)}
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 10,
                  padding: 22,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.15s ease, transform 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ padding: 8, background: `${d.accent}22`, borderRadius: 6, color: d.accent }}>
                      <Icon size={20} />
                    </div>
                    <span style={{ fontSize: '0.68rem', background: '#1e293b', color: '#94a3b8', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                      {d.code}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px' }}>
                    {d.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 14px' }}>
                    {d.desc}
                  </p>
                </div>

                <div>
                  <div style={{ background: '#090d16', padding: '6px 10px', borderRadius: 4, border: '1px solid #1e293b', fontFamily: 'monospace', fontSize: '0.72rem', color: d.accent, marginBottom: 14 }}>
                    {d.eq}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', fontWeight: 700, color: d.accent }}>
                    Launch Laboratory Discipline <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. FEATURED REAL SIMULATIONS (FLAGSHIP PREVIEWS)                 */}
      {/* ================================================================= */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              High-Fidelity Virtual Apparatus
            </span>
            <h2 style={{ fontSize: '2.0rem', fontWeight: 900, color: '#f8fafc', margin: '4px 0 0' }}>
              Featured Digital Twin Simulators
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('centrifugal-pump')}
            style={{ background: 'transparent', border: '1px solid #334155', color: '#38bdf8', padding: '6px 14px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            View All Simulators <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
          {/* Flagship 1: Centrifugal Pump */}
          <div
            onClick={() => onNavigate('centrifugal-pump')}
            style={{
              background: 'linear-gradient(135deg, #091a32 0%, #0f172a 100%)',
              border: '1.5px solid #0284c7',
              borderRadius: 12,
              padding: 24,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 8px 30px rgba(2, 132, 199, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                FLAGSHIP DIGITAL TWIN
              </span>
              <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>API 610 12th Ed</span>
            </div>

            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px' }}>
                Centrifugal Pump Digital Twin
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Interactive 3D anatomical viewer with component breakdown (impeller, casing, wear rings, mechanical seal).
                Euler turbomachinery solver, affinity laws, and 15 guided virtual experiments with real-time fault simulation.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, background: '#040711', padding: 12, borderRadius: 6, border: '1px solid #1e3a8a' }}>
              <div>
                <div style={{ fontSize: '0.64rem', color: '#64748b' }}>ANATOMY</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>3D Interactive</div>
              </div>
              <div>
                <div style={{ fontSize: '0.64rem', color: '#64748b' }}>EXPERIMENTS</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399' }}>15 Protocols</div>
              </div>
              <div>
                <div style={{ fontSize: '0.64rem', color: '#64748b' }}>DIAGNOSTICS</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b' }}>Cavitation & Wear</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', marginTop: 'auto' }}>
              Launch 3D Pump Simulator <ArrowRight size={16} />
            </div>
          </div>

          {/* Flagship 2: Fluidised Bed Unit */}
          <div
            onClick={() => onNavigate('fluidisation')}
            style={{
              background: 'linear-gradient(135deg, #062622 0%, #0f172a 100%)',
              border: '1.5px solid #10b981',
              borderRadius: 12,
              padding: 24,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 8px 30px rgba(16, 185, 129, 0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ background: '#047857', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                FLAGSHIP VIRTUAL APPARATUS
              </span>
              <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>Ergun Hydrodynamics</span>
            </div>

            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px' }}>
                Fluidisation & Packed Bed Dynamics
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Transparent physical column with live particle emulsion, rising gas bubbles, and bed expansion cursor.
                Deconstructs pressure drop into viscous Kozeny-Carman and inertial Burke-Plummer terms with Geldart classification.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, background: '#040711', padding: 12, borderRadius: 6, border: '1px solid #064e3b' }}>
              <div>
                <div style={{ fontSize: '0.64rem', color: '#64748b' }}>BED EXPANSION</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399' }}>Live Physics</div>
              </div>
              <div>
                <div style={{ fontSize: '0.64rem', color: '#64748b' }}>REGIMES</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>Fixed to Bubbling</div>
              </div>
              <div>
                <div style={{ fontSize: '0.64rem', color: '#64748b' }}>SOLVER</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b' }}>Wen-Yu & Ergun</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 800, color: '#34d399', marginTop: 'auto' }}>
              Launch Fluidised Bed Apparatus <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. LEARN BY VISUALISING                                           */}
      {/* ================================================================= */}
      <section
        style={{
          background: '#090d16',
          borderRadius: 14,
          border: '1px solid #1e293b',
          padding: 36,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 32,
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pedagogical Philosophy
          </span>
          <h2 style={{ fontSize: '2.0rem', fontWeight: 900, color: '#f8fafc', margin: '6px 0 12px' }}>
            Learn by Visualising
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 16px' }}>
            Traditional chemical engineering education forces students to memorize complex equations without seeing
            how fluids behave inside equipment.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <CheckCircle2 size={16} color="#38bdf8" style={{ marginTop: 2, flexShrink: 0 }} />
              <span><strong>Dynamic Vector Fields:</strong> Watch laminar parabolic velocity profiles flatten into 1/7th power-law turbulent eddies as Reynolds number climbs past 4000.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <CheckCircle2 size={16} color="#34d399" style={{ marginTop: 2, flexShrink: 0 }} />
              <span><strong>Thermal Driving Force:</strong> Observe counter-current heat exchanger temperature curves cross and prove why cold fluid outlet can exceed hot fluid outlet.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <CheckCircle2 size={16} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
              <span><strong>Spatial vs. Backmix Kinetics:</strong> Compare how CSTR dilution lowers average reaction rate compared to continuous spatial conversion along a PFR.</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('learn')}
            style={{
              marginTop: 24,
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 6,
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Open Visual Concept Explorer <ArrowRight size={16} />
          </button>
        </div>

        {/* Visual Showcase Graphic */}
        <div style={{ background: '#040711', borderRadius: 10, border: '1px solid #1e293b', padding: 20 }}>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, marginBottom: 8 }}>
            SAMPLE LIVE VISUALIZATION · PIPE VELOCITY GRADIENT
          </div>
          <svg width="100%" height="200" viewBox="0 0 400 200">
            <rect x="20" y="20" width="360" height="10" fill="#334155" />
            <rect x="20" y="170" width="360" height="10" fill="#334155" />
            <line x1="20" y1="100" x2="380" y2="100" stroke="#64748b" strokeWidth="1" strokeDasharray="4,4" />

            {/* Parabolic Profile */}
            <path
              d="M 120 30 Q 280 100, 120 170"
              stroke="#38bdf8"
              strokeWidth="3"
              fill="none"
            />
            {[45, 70, 100, 130, 155].map((yVal, i) => (
              <g key={i}>
                <line x1="120" y1={yVal} x2={120 + (1 - Math.abs(yVal - 100) / 70) * 150} y2={yVal} stroke="#38bdf8" strokeWidth="1.5" />
                <polygon points={`${120 + (1 - Math.abs(yVal - 100) / 70) * 150},${yVal} ${120 + (1 - Math.abs(yVal - 100) / 70) * 150 - 5},${yVal - 3} ${120 + (1 - Math.abs(yVal - 100) / 70) * 150 - 5},${yVal + 3}`} fill="#38bdf8" />
              </g>
            ))}
            <text x="280" y="95" fill="#38bdf8" fontSize="10" fontWeight="800">u(r) = 2·u_avg·[1 - (r/R)²]</text>
          </svg>
          <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', marginTop: 4 }}>
            Zero-slip wall boundary condition ($u = 0$ at $r = R$) with parabolic laminar peak.
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 5. DIGITAL TWIN LABORATORY VISION (AVAILABLE VS PLANNED)         */}
      {/* ================================================================= */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Industry 4.0 Architecture
          </span>
          <h2 style={{ fontSize: '2.0rem', fontWeight: 900, color: '#f8fafc', margin: '4px 0 6px' }}>
            The Digital Twin Laboratory Vision
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', maxWidth: 840, margin: 0 }}>
            Bridging academic models with modern plant automation. Clearly distinguishing features operational today
            from our long-term multi-tier industrial digital twin roadmap.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Operational Today */}
          <div style={{ background: '#090d16', border: '1px solid #10b981', borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: '#064e3b', color: '#a7f3d0', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                AVAILABLE TODAY
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>Level 1 & Level 2 Digital Twins</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem', color: '#cbd5e1' }}>
              <div>• <strong>Centrifugal Pump Impeller Twin:</strong> 3D geometry, Euler head, affinity laws, and cavitation diagnostics.</div>
              <div>• <strong>Fluidised Bed Column Twin:</strong> Physical transparent column, Ergun equation, and bubbling dynamics.</div>
              <div>• <strong>SCADA Historian Trends:</strong> Multi-pen PV, SP, OP time-series monitoring with fault injections.</div>
              <div>• <strong>PID Loop Tuning Workbench:</strong> Ziegler-Nichols, Cohen-Coon, and IMC step-response simulation.</div>
              <div>• <strong>HAZOP & Risk Studio:</strong> IEC 61882 worksheet and 5×5 SIL safety matrix allocation.</div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('industry')}
              style={{ marginTop: 'auto', background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Launch Digital Twin Centre <ArrowRight size={14} />
            </button>
          </div>

          {/* Planned Roadmap */}
          <div style={{ background: '#090d16', border: '1px solid #334155', borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: '#1e293b', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                DEVELOPMENT ROADMAP
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>Level 3 Plant-Wide Integration</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem', color: '#94a3b8' }}>
              <div>• <strong>OPC-UA Live Ingestion:</strong> Hardware connectivity with physical laboratory PLC testbenches.</div>
              <div>• <strong>Plant-Wide Recycle Network:</strong> Multi-unit reaction-separation-recycle complex with recycle snowball analysis.</div>
              <div>• <strong>Hybrid Physics-ML Soft Sensors:</strong> Inferential machine learning models for unmeasured distillation compositions.</div>
              <div>• <strong>Operator Training Simulator (OTS):</strong> Full plant trip scenarios with DCS sequence of events (SOE) logs.</div>
            </div>
            <div style={{ marginTop: 'auto', fontSize: '0.72rem', color: '#64748b' }}>
              Roadmap releases actively developed for enterprise university departments.
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 6. FOR STUDENTS & FOR FACULTY (ROLE FOCUS)                        */}
      {/* ================================================================= */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* For Students Card */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
              FOR STUDENTS
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>Master Engineering Fundamentals</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
            Everything a chemical engineering student needs to bridge university textbooks with industrial practice:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem', color: '#cbd5e1' }}>
            <div>• <strong>Virtual Experiments:</strong> Step-by-step SOPs, observation tables, and viva answers.</div>
            <div>• <strong>Process Design Studio:</strong> Build PFDs and generate API 610/TEMA equipment datasheets.</div>
            <div>• <strong>Engineering Portfolio:</strong> Document capstone projects and export verified PDF dossiers.</div>
            <div>• <strong>Career Readiness:</strong> 8 industrial pathways, 100+ interview Q&As, and plant troubleshooting.</div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('lab')}
            style={{ marginTop: 'auto', background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '8px 14px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Start Virtual Laboratory <ChevronRight size={14} />
          </button>
        </div>

        {/* For Faculty Card */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: '#2563eb', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
              FOR FACULTY
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>Classroom Teaching & Demonstration</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
            Tools built specifically for professors and lab instructors to deliver engaging classroom lectures:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem', color: '#cbd5e1' }}>
            <div>• <strong>Classroom Presentation Mode:</strong> Fullscreen stage, component highlighter, and clean chalkboards.</div>
            <div>• <strong>Dual Scenario Comparison:</strong> Demonstrate speed throttling vs discharge throttling live in class.</div>
            <div>• <strong>Shared Classroom Activities:</strong> Broadcast reactor or heat exchanger challenges to student devices.</div>
            <div>• <strong>Student Submission Review:</strong> Grade virtual lab reports, assess simulation accuracy, and provide feedback.</div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('teacher-home')}
            style={{ marginTop: 'auto', background: '#1e293b', color: '#60a5fa', border: '1px solid #334155', padding: '8px 14px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Open Teacher Workspace <ChevronRight size={14} />
          </button>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 7. ENGINEERING TOOLBOX PREVIEW                                    */}
      {/* ================================================================= */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Everyday Computational Engines
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc', margin: '4px 0 0' }}>
              The Engineering Toolbox
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('toolbox')}
            style={{ background: 'transparent', border: '1px solid #334155', color: '#34d399', padding: '6px 14px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Launch All 30+ Solvers <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {[
            { name: 'Pipe Friction & Reynolds Number', cat: 'Fluid Flow', desc: 'Colebrook-White friction factor and pressure drop.' },
            { name: 'Counter-Current LMTD & Area', cat: 'Heat Transfer', desc: 'Exchanger duty, approach temperatures, and thermal sizing.' },
            { name: 'CSTR vs. PFR Sizing Comparison', cat: 'Reaction Kinetics', desc: 'Volume ratios and Damköhler number scaling for 80% conversion.' },
            { name: 'Fuller Binary Gas Diffusivity', cat: 'Mass Transfer', desc: 'Temperature and pressure-dependent molecular diffusion.' },
          ].map((t, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('toolbox')}
              style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 8, padding: 16, cursor: 'pointer' }}
            >
              <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 700 }}>{t.cat}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 4px' }}>{t.name}</div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 8. CALL TO ACTION (ENTER LABORATORY)                             */}
      {/* ================================================================= */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #1e40af 100%)',
          borderRadius: 14,
          padding: '48px 36px',
          textAlign: 'center',
          color: '#ffffff',
          boxShadow: '0 12px 40px rgba(2, 132, 199, 0.3)',
        }}
      >
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Ready to Enter the Laboratory?
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#e0f2fe', maxWidth: 640, margin: '0 auto 28px', lineHeight: 1.6 }}>
          Run real chemical simulations, observe process dynamics, design equipment, and build your engineering portfolio today.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onNavigate('centrifugal-pump')}
            style={{
              background: '#ffffff',
              color: '#0369a1',
              border: 'none',
              padding: '14px 28px',
              borderRadius: 8,
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Launch Centrifugal Pump Twin <ArrowRight size={18} />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('fluidisation')}
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              padding: '14px 28px',
              borderRadius: 8,
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Launch Fluidisation Apparatus <ExternalLink size={18} />
          </button>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 9. CORPORATE PRODUCT FOOTER                                       */}
      {/* ================================================================= */}
      <footer
        style={{
          borderTop: '1px solid #1e293b',
          paddingTop: 40,
          marginTop: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ maxWidth: 360 }}>
            <ChemSimLogo size={32} showWordmark={true} />
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 12, lineHeight: 1.6 }}>
              CHEM-SIM is an open, first-principles Chemical Engineering simulation, digital twin, and career readiness platform.
              Built for students and educators following scientific engineering design principles.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, fontSize: '0.78rem' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#f8fafc', marginBottom: 10 }}>SIMULATIONS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: '#94a3b8' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('centrifugal-pump')}>Centrifugal Pump</span>
                <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('fluidisation')}>Fluidised Bed Unit</span>
                <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('heat-exchanger')}>Heat Exchangers</span>
                <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('distillation')}>Binary Distillation</span>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 800, color: '#f8fafc', marginBottom: 10 }}>STUDENT LAB</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: '#94a3b8' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('lab')}>Virtual Experiments</span>
                <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('learn')}>Concept Studio</span>
                <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('toolbox')}>Engineering Tools</span>
                <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('career')}>Career Preparation</span>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 800, color: '#f8fafc', marginBottom: 10 }}>FACULTY & DESIGN</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: '#94a3b8' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('teacher-home')}>Teaching Mode</span>
                <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('design')}>Process Design</span>
                <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('industry')}>Digital Twins</span>
                <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('portfolio')}>Portfolio Studio</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #131c31', paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#64748b', flexWrap: 'wrap', gap: 12 }}>
          <div>© 2026 CHEM-SIM Engineering Dynamics. All rights reserved. MIT License.</div>
          <div>Complies with VTU & Autonomous Chemical Engineering Laboratory Curriculum Standards.</div>
        </div>
      </footer>
    </div>
  );
}

export default HomeWorkspace;
