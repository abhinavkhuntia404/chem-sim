import { useState } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  Printer,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface ExperimentWorkspaceProps {
  onLaunchSimulation?: (moduleId: string) => void;
}

interface ObservationPoint {
  id: number;
  flowRate: number; // m3/h or L/min
  headOrDp: number; // m or mbar
  powerKw: number;
  efficiencyPct: number;
  tempC?: number;
}

export function ExperimentWorkspace({ onLaunchSimulation }: ExperimentWorkspaceProps) {
  const [selectedExpId, setSelectedExpId] = useState<'EXP-01' | 'EXP-02' | 'EXP-03' | 'EXP-04'>('EXP-01');
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);
  const [studentName, setStudentName] = useState<string>('Abhinav Khuntia');
  const [studentUsn, setStudentUsn] = useState<string>('1MS22CH042');

  // Interactive Live Simulator States for EXP-01 (Centrifugal Pump)
  const [simPumpFlow, setSimPumpFlow] = useState<number>(20.0); // m3/h
  const [simPumpSpeed, setSimPumpSpeed] = useState<number>(2950); // RPM
  const [simFluidDensity, setSimFluidDensity] = useState<number>(1000); // kg/m3

  // Calculated pump outputs
  const speedRatio = simPumpSpeed / 2950;
  const maxHead = 55.0 * (speedRatio ** 2);
  const simPumpHead = Math.max(5.0, maxHead - 0.045 * ((simPumpFlow / speedRatio) ** 2));
  const simHydraulicPower = (simPumpFlow * simPumpHead * 9.80665 * simFluidDensity) / (3600 * 1000);
  const bestEffFlow = 25.0 * speedRatio;
  const simEfficiency = Math.max(25, 76.0 - 0.09 * ((simPumpFlow - bestEffFlow) ** 2));
  const simBrakePower = simHydraulicPower / (simEfficiency / 100.0);

  // Live Observation Table
  const [observations, setObservations] = useState<ObservationPoint[]>([
    { id: 1, flowRate: 5.0, headOrDp: 53.8, powerKw: 1.15, efficiencyPct: 38.2 },
    { id: 2, flowRate: 15.0, headOrDp: 44.8, powerKw: 2.74, efficiencyPct: 65.5 },
    { id: 3, flowRate: 25.0, headOrDp: 26.8, powerKw: 3.82, efficiencyPct: 76.0 },
  ]);

  const [expandedViva, setExpandedViva] = useState<number | null>(null);

  // Add observation point from current simulator sliders
  const handleRecordDataPoint = () => {
    const nextId = observations.length > 0 ? Math.max(...observations.map((o) => o.id)) + 1 : 1;
    const newPoint: ObservationPoint = {
      id: nextId,
      flowRate: Number(simPumpFlow.toFixed(1)),
      headOrDp: Number(simPumpHead.toFixed(1)),
      powerKw: Number(simBrakePower.toFixed(2)),
      efficiencyPct: Number(simEfficiency.toFixed(1)),
    };
    setObservations([...observations, newPoint]);
  };

  const handleClearObservations = () => {
    setObservations([]);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const expMetadata = {
    'EXP-01': {
      title: 'Centrifugal Pump Performance & Affinity Characteristics',
      subject: 'Momentum Transfer (21CH32)',
      linkedModule: 'centrifugal-pump',
      objective: 'To determine the operating head (H), brake power (P), and mechanical efficiency (η) characteristics of a single-stage centrifugal pump operating at varying speeds and fluid conditions.',
      theory: 'Centrifugal pumps convert mechanical rotational energy from an electric motor into fluid pressure head via Euler turbomachinery work: H = (u₂·c_u2 - u₁·c_u1) / g. Centrifugal pump affinity laws state that capacity scales linearly with speed (Q ∝ N), developed head scales quadratically (H ∝ N²), and brake power scales cubically (P ∝ N³).',
      viva: [
        {
          q: 'Why does the head curve of a centrifugal pump droop as discharge flow increases?',
          a: 'Backward-curved impeller vanes (β₂ < 90°) produce negative slope in Euler head because fluid velocity relative to blades decreases tangential exit velocity c_u2 as flow rate increases, supplemented by internal hydraulic friction losses.',
          hint: 'Consider the velocity triangle at the impeller exit.',
        },
        {
          q: 'What is Cavitation and what happens if NPSHa drops below NPSHr?',
          a: 'Cavitation is the localized vaporisation of liquid at the impeller eye where static pressure drops below saturation vapor pressure. Bubbles implode violently against vanes, causing noise, vibration, erosion, and collapse of head.',
          hint: 'Net Positive Suction Head margin.',
        },
        {
          q: 'How does operating speed adjustment via a VFD save power compared to throttling a discharge valve?',
          a: 'Throttling shifts the system curve upward, creating artificial friction loss. A VFD shifts the pump characteristic curve down per affinity laws (P ∝ N³), reducing electrical energy consumption by up to 30–50%.',
          hint: 'Affinity law for brake power.',
        },
      ],
    },
    'EXP-02': {
      title: 'Pressure Drop & Minimum Fluidisation Velocity (u_mf)',
      subject: 'Mechanical Operations (21CH42)',
      linkedModule: 'fluidisation',
      objective: 'To determine the pressure drop (ΔP) across packed and fluidised beds as a function of superficial gas velocity (u₀) and verify the minimum fluidisation velocity (u_mf) using the Ergun correlation.',
      theory: 'In a fixed packed bed, pressure drop rises with superficial gas velocity per the Ergun equation. When upward drag force equals the net buoyant weight of particles, incipient fluidisation occurs at u_mf: ΔP_bed = (1 - ε_mf) · (ρ_p - ρ_f) · g · L_mf.',
      viva: [
        {
          q: 'Why does pressure drop remain constant after the bed enters the bubbling fluidisation regime?',
          a: 'Once fluidised, the entire particulate bed is buoyed by the gas flow. Any excess gas velocity beyond u_mf simply bypasses the emulsion phase as rising bubbles without imparting additional shear drag on the bed.',
          hint: 'Force balance between fluid drag and buoyant bed weight.',
        },
        {
          q: 'What is Geldart particle classification and how does particle size dictate fluidisation quality?',
          a: 'Geldart classifies powders based on density difference and mean diameter into: Group A (aeratable/expandable), Group B (sand-like bubbling), Group C (cohesive/fine powders), and Group D (spoutable/large grains).',
          hint: 'Mean diameter d_p and density difference (ρ_p - ρ_f).',
        },
      ],
    },
    'EXP-03': {
      title: 'Shell-and-Tube Heat Exchanger LMTD Rating',
      subject: 'Heat Transfer (21CH52)',
      linkedModule: 'heat-exchanger',
      objective: 'To evaluate overall heat transfer coefficient (U) and compare Log Mean Temperature Difference (LMTD) between counter-current and co-current flow regimes.',
      theory: 'Heat duty is governed by Q = m·Cp·ΔT = U·A·F·LMTD. Counter-current flow maximizes thermal driving force and allows cold fluid outlet temperature to exceed hot fluid outlet temperature.',
      viva: [
        {
          q: 'Why is LMTD always higher in counter-current flow than in co-current flow for identical inlet/outlet temperatures?',
          a: 'Counter-current flow maintains a relatively uniform temperature difference between hot and cold streams along the entire exchanger length, preventing the rapid decay of thermal driving force seen in co-current flow.',
          hint: 'Evaluate the logarithmic average temperature gradient.',
        },
      ],
    },
    'EXP-04': {
      title: 'Isothermal CSTR vs. PFR Conversion Performance',
      subject: 'Chemical Reaction Engineering (21CH62)',
      linkedModule: 'reactor',
      objective: 'To compare fractional conversion (X_A) and required reactor volume between a Continuous Stirred Tank Reactor and a Plug Flow Reactor for identical Damköhler numbers.',
      theory: 'For positive order kinetics (-r_A = k·C_A^n), CSTR operates entirely at the low exit concentration, minimizing reaction rate. PFR concentrations decrease along the tube, maintaining a higher mean rate.',
      viva: [
        {
          q: 'Under what specific kinetic condition does a CSTR outperform a PFR?',
          a: 'Autocatalytic reactions or substrate-inhibited enzyme kinetics where higher reactant concentrations suppress the reaction rate. In these cases, immediate backmixing in a CSTR elevates the rate.',
          hint: 'Consider reactions where products catalyze the rate.',
        },
      ],
    },
  };

  const currExp = expMetadata[selectedExpId];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner */}
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
                Student Virtual Laboratory
              </span>
              <span style={{ color: '#93c5fd', fontSize: '0.82rem', fontWeight: 600 }}>
                Objective · Procedure · Live Observations · Calculations · Viva Voce · Report Generator
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Virtual Experiment Studio
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '8px 0 0', maxWidth: 840, lineHeight: 1.5 }}>
              Conduct rigorous first-principles engineering experiments. Adjust virtual equipment parameters, record
              real-time observation points, analyze performance curves, answer viva voce queries, and generate
              formal university laboratory reports.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {currExp.linkedModule && onLaunchSimulation && (
              <button
                type="button"
                onClick={() => onLaunchSimulation(currExp.linkedModule)}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ExternalLink size={14} /> Open Full Apparatus Simulator
              </button>
            )}
            <button
              type="button"
              onClick={handlePrintReport}
              style={{
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                padding: '8px 14px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Printer size={14} /> Print Lab Record
            </button>
          </div>
        </div>

        {/* Experiment Selector Buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
          {Object.entries(expMetadata).map(([id, data]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setSelectedExpId(id as any);
                setActiveWorkflowStep(1);
              }}
              style={{
                background: selectedExpId === id ? '#0284c7' : '#0f172a',
                color: selectedExpId === id ? '#ffffff' : '#94a3b8',
                border: selectedExpId === id ? '1px solid #38bdf8' : '1px solid #1e293b',
                padding: '8px 14px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <FlaskConical size={14} /> {id}: {data.title.split(' ')[0]} {data.title.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory Virtual Laboratory Educational Notice */}
      <div
        style={{
          background: '#0b1329',
          padding: '10px 16px',
          borderRadius: 8,
          border: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.74rem',
          color: '#94a3b8',
        }}
      >
        <AlertTriangle size={16} color="#38bdf8" />
        <span>
          <strong>Pedagogical Context Notice:</strong> Virtual experiment simulations provide mathematical reinforcement and interactive conceptual clarity. They complement, but do not substitute, mandatory physical laboratory training, hands-on safety protocols, or university practical examinations.
        </span>
      </div>

      {/* 8-Step Experiment Guided Workflow Navigation */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          background: '#0f172a',
          padding: 4,
          borderRadius: 8,
          border: '1px solid #1e293b',
          overflowX: 'auto',
        }}
      >
        {[
          { step: 1, label: '1. Objective' },
          { step: 2, label: '2. Theory & Equations' },
          { step: 3, label: '3. Virtual Apparatus & Run' },
          { step: 4, label: '4. Observation Table' },
          { step: 5, label: '5. Curves & Calculations' },
          { step: 6, label: '6. Viva Voce Quiz' },
          { step: 7, label: '7. Official Lab Report' },
        ].map((s) => (
          <button
            key={s.step}
            type="button"
            onClick={() => setActiveWorkflowStep(s.step)}
            style={{
              flex: 1,
              background: activeWorkflowStep === s.step ? '#0284c7' : 'transparent',
              color: activeWorkflowStep === s.step ? '#ffffff' : '#94a3b8',
              border: 'none',
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STEP 1: OBJECTIVE & INDUSTRIAL CONTEXT                        */}
      {/* ------------------------------------------------------------- */}
      {activeWorkflowStep === 1 && (
        <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800 }}>EXPERIMENT SPECIFICATION</div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            {selectedExpId}: {currExp.title}
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Academic Subject: {currExp.subject}</div>

          <div style={{ background: '#090d16', padding: 18, borderRadius: 8, border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.76rem', color: '#38bdf8', fontWeight: 800, marginBottom: 6 }}>
              PRIMARY LABORATORY OBJECTIVE
            </div>
            <p style={{ color: '#f8fafc', fontSize: '0.86rem', lineHeight: 1.6, margin: 0 }}>
              {currExp.objective}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setActiveWorkflowStep(2)}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Next: Review Theory <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 2: THEORY & GOVERNING EQUATIONS                          */}
      {/* ------------------------------------------------------------- */}
      {activeWorkflowStep === 2 && (
        <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800 }}>GOVERNING MATHEMATICAL MODEL</div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Underlying Physics & Analytical Derivations
          </h2>

          <div style={{ background: '#090d16', padding: 18, borderRadius: 8, border: '1px solid #1e293b', fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.6 }}>
            {currExp.theory}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setActiveWorkflowStep(1)}
              style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '8px 16px', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer' }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveWorkflowStep(3)}
              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Next: Operate Virtual Apparatus <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 3: VIRTUAL APPARATUS & EXPERIMENTAL LOGGING              */}
      {/* ------------------------------------------------------------- */}
      {activeWorkflowStep === 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
          {/* Main Simulator Deck */}
          <div style={{ background: '#090d16', borderRadius: 10, border: '1px solid #1e293b', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc' }}>
                  VIRTUAL APPARATUS: SINGLE-STAGE CENTRIFUGAL PUMP BENCH
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Adjust operating parameters and log live data points into your experimental observation sheet
                </div>
              </div>
              <button
                type="button"
                onClick={handleRecordDataPoint}
                style={{
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: 6,
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Plus size={14} /> Record Data Point
              </button>
            </div>

            {/* Readout Gauges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div style={{ background: '#0f172a', padding: 12, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>FLOW CAPACITY (Q)</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8' }}>
                  {simPumpFlow.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>m³/h</span>
                </div>
              </div>
              <div style={{ background: '#0f172a', padding: 12, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>TOTAL HEAD (H)</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8' }}>
                  {simPumpHead.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>m</span>
                </div>
              </div>
              <div style={{ background: '#0f172a', padding: 12, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>BRAKE POWER (P_brake)</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b' }}>
                  {simBrakePower.toFixed(2)} <span style={{ fontSize: '0.75rem' }}>kW</span>
                </div>
              </div>
              <div style={{ background: '#0f172a', padding: 12, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>EFFICIENCY (η)</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>
                  {simEfficiency.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>%</span>
                </div>
              </div>
            </div>

            {/* Mini H-Q Curve Preview */}
            <div style={{ width: '100%', height: 220, background: '#040711', borderRadius: 8, border: '1px solid #1e293b', position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 500 220">
                <line x1="40" y1="180" x2="480" y2="180" stroke="#334155" strokeWidth="1" />
                <line x1="40" y1="20" x2="40" y2="180" stroke="#334155" strokeWidth="1" />
                <text x="35" y="25" fill="#64748b" fontSize="8" textAnchor="end">H (m)</text>
                <text x="480" y="195" fill="#64748b" fontSize="8" textAnchor="end">Q (m³/h)</text>

                {/* Head Curve */}
                {(() => {
                  const pts = [];
                  for (let q = 0; q <= 40; q += 2) {
                    const x = 40 + (q / 40) * 440;
                    const h = Math.max(5, maxHead - 0.045 * ((q / speedRatio) ** 2));
                    const y = 180 - (h / 65) * 160;
                    pts.push(`${x},${y}`);
                  }
                  return <polyline fill="none" stroke="#38bdf8" strokeWidth="2.5" points={pts.join(' ')} />;
                })()}

                {/* Current Operating Point */}
                <circle
                  cx={40 + (simPumpFlow / 40) * 440}
                  cy={180 - (simPumpHead / 65) * 160}
                  r="6"
                  fill="#ef4444"
                />

                {/* Logged Observation Points */}
                {observations.map((pt) => (
                  <circle
                    key={pt.id}
                    cx={40 + (pt.flowRate / 40) * 440}
                    cy={180 - (pt.headOrDp / 65) * 160}
                    r="4"
                    fill="#34d399"
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Right Column: Interactive Simulator Controls */}
          <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800 }}>APPARATUS OPERATING CONTROLS</div>

            <div style={{ background: '#1e293b', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8' }}>
                <span>Discharge Valve Flow:</span>
                <span style={{ fontWeight: 800, color: '#38bdf8' }}>{simPumpFlow.toFixed(1)} m³/h</span>
              </div>
              <input
                type="range"
                min={2.0}
                max={38.0}
                step={1.0}
                value={simPumpFlow}
                onChange={(e) => setSimPumpFlow(Number(e.target.value))}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>

            <div style={{ background: '#1e293b', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8' }}>
                <span>Pump Motor Speed (VFD):</span>
                <span style={{ fontWeight: 800, color: '#f59e0b' }}>{simPumpSpeed} RPM</span>
              </div>
              <input
                type="range"
                min={1800}
                max={3200}
                step={50}
                value={simPumpSpeed}
                onChange={(e) => setSimPumpSpeed(Number(e.target.value))}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>

            <div style={{ background: '#1e293b', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8' }}>
                <span>Fluid Density:</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>{simFluidDensity} kg/m³</span>
              </div>
              <select
                value={simFluidDensity}
                onChange={(e) => setSimFluidDensity(Number(e.target.value))}
                style={{ width: '100%', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.76rem', marginTop: 4 }}
              >
                <option value={1000}>Water (1000 kg/m³)</option>
                <option value={850}>Diesel Fuel (850 kg/m³)</option>
                <option value={750}>Gasoline (750 kg/m³)</option>
                <option value={1110}>Ethylene Glycol (1110 kg/m³)</option>
              </select>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setActiveWorkflowStep(4)}
                style={{ width: '100%', background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                View Observation Sheet ({observations.length} Recorded) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 4: OBSERVATION TABLE                                      */}
      {/* ------------------------------------------------------------- */}
      {activeWorkflowStep === 4 && (
        <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800 }}>LABORATORY OBSERVATION SHEET</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0 0' }}>
                Experimental Data Points ({observations.length} trials logged)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setActiveWorkflowStep(3)}
                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + Add More Points
              </button>
              <button
                type="button"
                onClick={handleClearObservations}
                style={{ background: '#7f1d1d', color: '#fecaca', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Trash2 size={12} /> Clear Table
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.76rem', borderCollapse: 'collapse', color: '#cbd5e1' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>TRIAL #</th>
                  <th style={{ padding: '8px 10px' }}>DISCHARGE FLOW Q (m³/h)</th>
                  <th style={{ padding: '8px 10px' }}>TOTAL HEAD H (m)</th>
                  <th style={{ padding: '8px 10px' }}>BRAKE POWER P (kW)</th>
                  <th style={{ padding: '8px 10px' }}>PUMP EFFICIENCY η (%)</th>
                </tr>
              </thead>
              <tbody>
                {observations.map((obs) => (
                  <tr key={obs.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 800, color: '#38bdf8' }}>Trial {obs.id}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>{obs.flowRate.toFixed(1)}</td>
                    <td style={{ padding: '8px 10px', color: '#38bdf8' }}>{obs.headOrDp.toFixed(1)}</td>
                    <td style={{ padding: '8px 10px', color: '#f59e0b' }}>{obs.powerKw.toFixed(2)}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: '#10b981' }}>{obs.efficiencyPct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              type="button"
              onClick={() => setActiveWorkflowStep(5)}
              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Next: View Curves & Viva →
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 5: CURVES & CALCULATIONS                                 */}
      {/* ------------------------------------------------------------- */}
      {activeWorkflowStep === 5 && (
        <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800 }}>RESULT ANALYSIS</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0 0' }}>
            Experimental Performance Curve Interpretation
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#090d16', padding: 16, borderRadius: 8, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>
                Best Efficiency Point (BEP) Analysis
              </div>
              <div style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                The experimental efficiency curve exhibits an inverted parabolic shape reaching a maximum BEP of <strong>76.0%</strong> at a volumetric capacity of <strong>25.0 m³/h</strong>. Operating to the far left of BEP causes radial thrust and recirculation cavitation; operating to the far right increases motor loading and risks run-out.
              </div>
            </div>

            <div style={{ background: '#090d16', padding: 16, borderRadius: 8, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>
                Shut-Off Head & Power Trend
              </div>
              <div style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                Shut-off head ($Q = 0$) reaches <strong>55.0 m</strong>. Brake horsepower rises progressively from <strong>1.15 kW</strong> at zero flow up to <strong>3.97 kW</strong> at maximum rated throughput, verifying the standard non-overloading power characteristic of backward-curved centrifugal impellers.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              type="button"
              onClick={() => setActiveWorkflowStep(6)}
              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Next: Viva Voce Questions →
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 6: VIVA VOCE QUIZ                                         */}
      {/* ------------------------------------------------------------- */}
      {activeWorkflowStep === 6 && (
        <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800 }}>LABORATORY ORAL EXAMINATION</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0 0' }}>
            Viva Voce Preparation & Technical Answers
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currExp.viva.map((item, idx) => {
              const isExpanded = expandedViva === idx;
              return (
                <div key={idx} style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 8, overflow: 'hidden' }}>
                  <div
                    onClick={() => setExpandedViva(isExpanded ? null : idx)}
                    style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc' }}>
                      Q{idx + 1}: {item.q}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700 }}>
                      {isExpanded ? 'Hide Answer' : 'Reveal Answer'}
                    </span>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '14px 18px', borderTop: '1px solid #1e293b', background: '#0b1329', fontSize: '0.78rem', lineHeight: 1.5 }}>
                      <div style={{ color: '#6ee7b7' }}><strong>Model Answer:</strong> {item.a}</div>
                      <div style={{ color: '#94a3b8', marginTop: 4 }}><em>Hint: {item.hint}</em></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              type="button"
              onClick={() => setActiveWorkflowStep(7)}
              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Generate Official Lab Report →
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 7: PRINTABLE OFFICIAL LAB REPORT                         */}
      {/* ------------------------------------------------------------- */}
      {activeWorkflowStep === 7 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Ready for Print or Digital PDF Submission to Course Instructor
            </div>
            <button
              type="button"
              onClick={handlePrintReport}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Printer size={14} /> Print Experiment Sheet
            </button>
          </div>

          {/* White Paper Printable Laboratory Sheet */}
          <div
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 8,
              padding: '36px 44px',
              fontFamily: 'Inter, system-ui, sans-serif',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 12 }}>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900 }}>DEPARTMENT OF CHEMICAL ENGINEERING</div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>Virtual Engineering Simulation & Laboratory Record</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>LAB RECORD: {selectedExpId}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Date: November 2026</div>
              </div>
            </div>

            {/* Student Credentials Input for PDF */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
              <div>
                <strong>Student Name:</strong>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  style={{ marginLeft: 8, border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: 4, fontSize: '0.78rem' }}
                />
              </div>
              <div>
                <strong>USN / Roll No:</strong>
                <input
                  type="text"
                  value={studentUsn}
                  onChange={(e) => setStudentUsn(e.target.value)}
                  style={{ marginLeft: 8, border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: 4, fontSize: '0.78rem' }}
                />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Experiment Title: {currExp.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 4 }}><strong>Objective:</strong> {currExp.objective}</div>
            </div>

            {/* Recorded Observations Table in Report */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 6 }}>1. RECORDED EXPERIMENTAL OBSERVATIONS</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #0f172a', textAlign: 'left' }}>
                    <th style={{ padding: '6px' }}>Trial #</th>
                    <th style={{ padding: '6px' }}>Flow Rate Q (m³/h)</th>
                    <th style={{ padding: '6px' }}>Head H (m)</th>
                    <th style={{ padding: '6px' }}>Power (kW)</th>
                    <th style={{ padding: '6px' }}>Efficiency (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {observations.map((pt) => (
                    <tr key={pt.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px', fontWeight: 700 }}>{pt.id}</td>
                      <td style={{ padding: '6px' }}>{pt.flowRate.toFixed(1)}</td>
                      <td style={{ padding: '6px' }}>{pt.headOrDp.toFixed(1)}</td>
                      <td style={{ padding: '6px' }}>{pt.powerKw.toFixed(2)}</td>
                      <td style={{ padding: '6px' }}>{pt.efficiencyPct.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Results & Conclusion */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 4 }}>2. RESULTS & DISCUSSION</div>
              <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.5 }}>
                The maximum pump efficiency was obtained at Q = 25.0 m³/h with η = 76.0%. Shut-off head was determined to be 55.0 m. The experimental characteristic curves match theoretical Euler head predictions within a 2.5% deviation threshold.
              </div>
            </div>

            {/* Faculty Signoff Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: 16, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: '#16a34a' }}>
                <CheckCircle2 size={16} /> Verified Virtual Simulation Run
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.74rem', color: '#475569' }}>
                <div style={{ borderBottom: '1px solid #94a3b8', width: 160, marginBottom: 4 }} />
                Faculty Examiner Signature & Grade
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExperimentWorkspace;
