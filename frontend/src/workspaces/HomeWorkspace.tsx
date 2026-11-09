import {
  Compass,
  BookOpen,
  Sliders,
  TrendingUp,
  Layers,
  Wind,
  Activity,
  ArrowRight,
  Flame,
  Atom,
  Droplet,
  Briefcase,
  PenTool,
} from 'lucide-react';

interface HomeWorkspaceProps {
  onNavigate: (workspace: string, subModule?: string) => void;
}

export function HomeWorkspace({ onNavigate }: HomeWorkspaceProps) {
  return (
    <div className="home-workspace" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #091322 0%, #0f2744 50%, #0c3559 100%)',
          borderRadius: 10,
          padding: '30px 36px',
          color: '#ffffff',
          border: '1px solid #1e3a5f',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: 720 }}>
            <span
              style={{
                background: 'rgba(56, 189, 248, 0.18)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: 10,
              }}
            >
              Chemical Engineering Unified Platform
            </span>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 10px 0' }}>
              Welcome to CHEM-SIM
            </h1>
            <p style={{ fontSize: '0.94rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              The unified chemical engineering learning, simulation, industrial digital twin, and career readiness platform. Designed to bridge foundational university coursework with industrial process operations, rigorous transport phenomena, and verified professional competencies.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#064e3b55',
                color: '#34d399',
                border: '1px solid #059669',
                padding: '5px 12px',
                borderRadius: 9999,
                fontSize: '0.76rem',
                fontWeight: 600,
              }}
            >
              Deterministic Sci-Eng Solvers Active
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Curriculum Engine: VTU / Autonomous 2026–27
            </span>
          </div>
        </div>

        {/* 5 Core Orientation Answers Ribbon */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>1. Current Scope</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>Transport & Unit Ops</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>2. Academic Pathway</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginTop: 2 }}>Sem III & IV Core Syllabi</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>3. Active Digital Twins</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', marginTop: 2 }}>Pump & Fluidised Bed</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>4. Engineering Portfolio</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginTop: 2 }}>Verified Lab Case Studies</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>5. Career Readiness</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginTop: 2 }}>8 Technical ChE Tracks</div>
          </div>
        </div>
      </div>

      {/* Featured Primary Workspaces Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Compass size={18} color="#38bdf8" /> Primary Engineering Workspaces
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Select a workspace to begin</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* Workspace 1: Learn */}
          <div
            className="eng-card"
            onClick={() => onNavigate('learn')}
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: 18,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'border-color 0.15s ease, transform 0.15s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ padding: 8, background: '#0284c722', borderRadius: 6, color: '#38bdf8' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Academic Curriculum</h3>
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>SEMESTER III & IV</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Configurable course curriculum covering Momentum Transfer, Process Calculations, Mechanical Operations, Technical Chemistry, Reaction Engineering, Heat Transfer, and Thermodynamics.
              </p>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: '#38bdf8' }}>
              Explore Courses & Syllabi <ArrowRight size={14} />
            </div>
          </div>

          {/* Workspace 2: Simulate (Virtual Labs & Digital Twins) */}
          <div
            className="eng-card"
            onClick={() => onNavigate('simulate')}
            style={{
              background: '#0f172a',
              border: '1.5px solid #0284c7',
              borderRadius: 8,
              padding: 18,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 16px rgba(2, 132, 199, 0.15)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ padding: 8, background: '#0284c7', borderRadius: 6, color: '#ffffff' }}>
                  <Activity size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Virtual Laboratory & Twins</h3>
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>FLAGSHIP SIMULATORS</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                High-fidelity digital twin apparatus: Centrifugal Pump (3D anatomy, Euler head, cavitation diagnostics), Fluidised Bed Dynamics (Ergun packed bed, minimum fluidisation, bubbles), Distillation, and Reactors.
              </p>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8' }}>
              Launch Virtual Experiments <ArrowRight size={14} />
            </div>
          </div>

          {/* Workspace 3: Engineering Toolbox */}
          <div
            className="eng-card"
            onClick={() => onNavigate('tools')}
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: 18,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ padding: 8, background: '#10b98122', borderRadius: 6, color: '#34d399' }}>
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Engineering Toolbox</h3>
                  <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>30+ VERIFIED CALCULATORS</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Curriculum-independent calculation suite: Mass and energy balances, pipe friction losses, LMTD heat exchangers, CSTR/PFR sizing, psychrometry, and engineering economics (CAPEX, OPEX, NPV).
              </p>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: '#34d399' }}>
              Open Engineering Calculators <ArrowRight size={14} />
            </div>
          </div>

          {/* Workspace 4: Process Design Studio */}
          <div
            className="eng-card"
            onClick={() => onNavigate('design')}
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: 18,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ padding: 8, background: '#f59e0b22', borderRadius: 6, color: '#fbbf24' }}>
                  <PenTool size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Process Design Studio</h3>
                  <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 600 }}>FLOWSHEET & P&ID CANVAS</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Interactive flowsheet canvas: connect unit operations, specify process streams, switch between PFD and P&ID modes with ISA instrumentation symbols, and generate equipment engineering datasheets.
              </p>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: '#fbbf24' }}>
              Open Design Studio <ArrowRight size={14} />
            </div>
          </div>

          {/* Workspace 5: Industrial Digital Twin Centre */}
          <div
            className="eng-card"
            onClick={() => onNavigate('industry')}
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: 18,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ padding: 8, background: '#a855f722', borderRadius: 6, color: '#c084fc' }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Industrial Twin Centre</h3>
                  <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 600 }}>SCADA, PID & HAZOP SAFETY</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                SCADA-style process historian trends, live PID controller tuning loops, predictive maintenance FMEA, and process safety HAZOP risk matrices.
              </p>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: '#c084fc' }}>
              Open Industrial Centre <ArrowRight size={14} />
            </div>
          </div>

          {/* Workspace 6: Career & Placement Readiness */}
          <div
            className="eng-card"
            onClick={() => onNavigate('career')}
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: 18,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ padding: 8, background: '#ec489922', borderRadius: 6, color: '#f472b6' }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Career & Placement Readiness</h3>
                  <span style={{ fontSize: '0.7rem', color: '#f472b6', fontWeight: 600 }}>8 PATHWAYS & INTERVIEWS</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                8 specialized chemical engineering pathways, 120+ technical interview questions with complete solutions, practical plant troubleshooting scenarios, and aptitude challenges.
              </p>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: '#f472b6' }}>
              Prepare for Technical Careers <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Direct Quick Launch into Protected Virtual Laboratory Apparatuses */}
      <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Direct Launch: Protected Virtual Equipment & Laboratory Digital Twins
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Rigorous, first-principles chemical engineering simulators with interactive visual apparatuses
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {/* Centrifugal Pump Digital Twin */}
          <div
            onClick={() => onNavigate('simulate', 'centrifugal-pump')}
            style={{
              background: '#0a1628',
              border: '1.5px solid #0284c7',
              borderRadius: 6,
              padding: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ padding: 10, background: '#0284c7', borderRadius: 6, color: '#fff' }}>
              <Activity size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>Centrifugal Pump Digital Twin</div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>3D Anatomy • Euler Head • Faults • EXP-01..15</div>
            </div>
          </div>

          {/* Fluidisation Bed Unit */}
          <div
            onClick={() => onNavigate('simulate', 'fluidisation')}
            style={{
              background: '#0a1628',
              border: '1.5px solid #0284c7',
              borderRadius: 6,
              padding: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ padding: 10, background: '#0284c7', borderRadius: 6, color: '#fff' }}>
              <Wind size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>Fluidisation & Packed Bed Dynamics</div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>Ergun ΔP • Wen–Yu u_mf • Bubbles • Entrainment</div>
            </div>
          </div>

          {/* Binary Distillation Column */}
          <div
            onClick={() => onNavigate('simulate', 'distillation')}
            style={{
              background: '#1e293b55',
              border: '1px solid #334155',
              borderRadius: 6,
              padding: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ padding: 10, background: '#1e3a8a', borderRadius: 6, color: '#93c5fd' }}>
              <Layers size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>Binary Distillation Column</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>McCabe–Thiele Stepping • Reflux Ratio • Duties</div>
            </div>
          </div>

          {/* Heat Exchanger Rating */}
          <div
            onClick={() => onNavigate('simulate', 'heat-exchanger')}
            style={{
              background: '#1e293b55',
              border: '1px solid #334155',
              borderRadius: 6,
              padding: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ padding: 10, background: '#7f1d1d', borderRadius: 6, color: '#fca5a5' }}>
              <Flame size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>Heat Exchangers & LMTD Design</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Countercurrent • Cocurrent • Temperature Cross</div>
            </div>
          </div>

          {/* Chemical Reactors */}
          <div
            onClick={() => onNavigate('simulate', 'reactor')}
            style={{
              background: '#1e293b55',
              border: '1px solid #334155',
              borderRadius: 6,
              padding: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ padding: 10, background: '#064e3b', borderRadius: 6, color: '#6ee7b7' }}>
              <Atom size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>Chemical Reaction Kinetics</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>CSTR • PFR • Batch • Arrhenius Kinetics</div>
            </div>
          </div>

          {/* Thermodynamics VLE */}
          <div
            onClick={() => onNavigate('simulate', 'thermo')}
            style={{
              background: '#1e293b55',
              border: '1px solid #334155',
              borderRadius: 6,
              padding: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ padding: 10, background: '#115e59', borderRadius: 6, color: '#5eead4' }}>
              <Droplet size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>Thermodynamics & Phase Envelopes</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Antoine Equations • Critical Data • Binary VLE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
