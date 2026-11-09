import { useState } from 'react';
import {
  Presentation,
  CheckCircle2,
  PenTool,
  Layers,
  HelpCircle,
  Play,
  Pause,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Activity,
} from 'lucide-react';

interface TeacherWorkspaceProps {
  onLaunchSimulation?: (moduleId: string) => void;
}

interface StudentSubmissionItem {
  id: string;
  studentName: string;
  usn: string;
  assignment: string;
  submissionDate: string;
  simAccuracyScore: number;
  vivaScore: number;
  totalScore: number;
  feedback: string;
  status: 'Reviewed' | 'Pending Review';
}

interface WhiteboardElement {
  id: string;
  type: 'pump' | 'exchanger' | 'reactor' | 'column' | 'tank' | 'valve' | 'text' | 'stream';
  x: number;
  y: number;
  label: string;
  annotation?: string;
}

interface DerivationStep {
  stepNumber: number;
  title: string;
  math: string;
  explanation: string;
  assumption: string;
}

interface DerivationTopic {
  id: string;
  title: string;
  subject: string;
  finalEquation: string;
  steps: DerivationStep[];
}

export function TeacherWorkspace({ onLaunchSimulation }: TeacherWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<
    'presentation' | 'whiteboard' | 'explainer' | 'derivations' | 'interaction' | 'scenarios' | 'grading'
  >('presentation');

  // --- 1. Presentation Mode State ---
  const [highlightedComponent, setHighlightedComponent] = useState<string>('impeller');
  const [isAnimationPaused, setIsAnimationPaused] = useState<boolean>(false);
  const [hideAdvancedControls, setHideAdvancedControls] = useState<boolean>(false);
  const [showChalkboard, setShowChalkboard] = useState<boolean>(true);

  // Scenario A vs Scenario B Comparison
  const [scenarioASpeed, setScenarioASpeed] = useState<number>(2950);
  const [scenarioAFlow, setScenarioAFlow] = useState<number>(25.0);
  const [scenarioBSpeed, setScenarioBSpeed] = useState<number>(2400);
  const [scenarioBFlow, setScenarioBFlow] = useState<number>(20.3);

  // Calculations
  const speedRatioA = scenarioASpeed / 2950;
  const headA = Math.max(5, 55.0 * (speedRatioA ** 2) - 0.045 * ((scenarioAFlow / speedRatioA) ** 2));
  const powerA = (scenarioAFlow * headA * 9.80665 * 1000) / (3600 * 1000 * 0.72);

  const speedRatioB = scenarioBSpeed / 2950;
  const headB = Math.max(5, 55.0 * (speedRatioB ** 2) - 0.045 * ((scenarioBFlow / speedRatioB) ** 2));
  const powerB = (scenarioBFlow * headB * 9.80665 * 1000) / (3600 * 1000 * 0.72);

  // --- 2. Interactive Whiteboard State ---
  const [wbElements, setWbElements] = useState<WhiteboardElement[]>([
    { id: 'wb-1', type: 'tank', x: 80, y: 140, label: 'TK-101 Feed Tank', annotation: 'Liquid level 3.2m, P=1 atm' },
    { id: 'wb-2', type: 'pump', x: 260, y: 155, label: 'P-101 Centrifugal Pump', annotation: 'API 610, N=2950 RPM' },
    { id: 'wb-3', type: 'exchanger', x: 440, y: 135, label: 'E-101 Preheater', annotation: 'Shell & Tube, U=450 W/m2K' },
    { id: 'wb-4', type: 'reactor', x: 620, y: 110, label: 'R-101 CSTR Reactor', annotation: 'V=2.5 m3, Isothermal 85°C' },
  ]);
  const activeAnnotationText = 'q = U * A * ΔT_lm';

  // --- 3. Step-by-Step Derivation Mode State ---
  const [selectedDerivationIndex, setSelectedDerivationIndex] = useState<number>(0);
  const [revealedStepCount, setRevealedStepCount] = useState<number>(1);

  const DERIVATIONS: DerivationTopic[] = [
    {
      id: 'bernoulli',
      title: 'Bernoulli Equation along a Streamline',
      subject: 'Momentum Transfer (Fluid Flow)',
      finalEquation: 'P1/ρg + v1²/(2g) + z1 = P2/ρg + v2²/(2g) + z2 + h_f - h_pump',
      steps: [
        {
          stepNumber: 1,
          title: 'Euler Momentum Equation along Streamline s',
          math: 'ρ v (dv/ds) = - (dP/ds) - ρ g (dz/ds)',
          explanation: 'Net force on a differential fluid element of volume dA ds equates to mass times acceleration.',
          assumption: 'Steady flow, inviscid fluid (frictionless), streamline coordinate s.',
        },
        {
          stepNumber: 2,
          title: 'Rearranging into Exact Differential Form',
          math: 'v dv + (1/ρ) dP + g dz = 0',
          explanation: 'Dividing throughout by fluid density ρ and multiplying by differential length ds.',
          assumption: 'Incompressible fluid where density ρ is constant.',
        },
        {
          stepNumber: 3,
          title: 'Definite Integration Between Points 1 and 2',
          math: '∫ v dv + (1/ρ) ∫ dP + g ∫ dz = 0  =>  (v2² - v1²)/2 + (P2 - P1)/ρ + g(z2 - z1) = 0',
          explanation: 'Integrating each term from suction nozzle (1) to discharge nozzle (2).',
          assumption: 'No shaft work or viscous shear dissipation in ideal Euler formulation.',
        },
        {
          stepNumber: 4,
          title: 'Dividing by Acceleration due to Gravity g (Head Form)',
          math: 'P1/(ρ g) + v1²/(2 g) + z1 = P2/(ρ g) + v2²/(2 g) + z2',
          explanation: 'Expressing every energy term in units of length (meters of liquid head: static + velocity + elevation).',
          assumption: 'Dimensional consistency: [N/m2] / [N/m3] = meters [m].',
        },
        {
          stepNumber: 5,
          title: 'Engineering Mechanical Energy Balance (with Pump Head & Friction Loss)',
          math: 'P1/(ρ g) + v1²/(2 g) + z1 + H_pump = P2/(ρ g) + v2²/(2 g) + z2 + h_friction',
          explanation: 'Adding shaft energy delivered by impeller (+H_pump) and subtracting irreversible viscous pipe losses (h_f).',
          assumption: 'Valid for real piping systems containing pumps, valves, and elbows.',
        },
      ],
    },
    {
      id: 'hagen-poiseuille',
      title: 'Hagen-Poiseuille Equation for Laminar Pipe Flow',
      subject: 'Momentum Transfer (Fluid Flow)',
      finalEquation: 'ΔP = (32 μ v_avg L) / D²',
      steps: [
        {
          stepNumber: 1,
          title: 'Cylindrical Shell Force Balance',
          math: 'Σ F_z = (P0 - PL) π r² - 2 π r L τ_rz = 0',
          explanation: 'Equating net pressure force driving the cylindrical liquid core against viscous shear force at radius r.',
          assumption: 'Steady, fully developed laminar flow; negligible entrance effects.',
        },
        {
          stepNumber: 2,
          title: 'Linear Shear Stress Distribution Across Radius',
          math: 'τ_rz = (ΔP / 2 L) r',
          explanation: 'Shear stress is identically zero at pipe center (r=0) and reaches maximum at wall (r=R).',
          assumption: 'Axisymmetric cylindrical geometry.',
        },
        {
          stepNumber: 3,
          title: 'Substituting Newton’s Law of Viscosity',
          math: '- μ (dv_z / dr) = (ΔP / 2 L) r  =>  dv_z / dr = - (ΔP / 2 μ L) r',
          explanation: 'For Newtonian fluid, momentum flux is proportional to negative velocity gradient.',
          assumption: 'Newtonian rheology (constant dynamic viscosity μ).',
        },
        {
          stepNumber: 4,
          title: 'Integration with No-Slip Boundary Condition at Wall (v_z(R) = 0)',
          math: 'v_z(r) = (ΔP R² / 4 μ L) [1 - (r/R)²]  =  v_max [1 - (r/R)²]',
          explanation: 'The resulting velocity profile is a classical parabola with maximum velocity v_max at centerline.',
          assumption: 'No-slip condition at solid tube wall.',
        },
        {
          stepNumber: 5,
          title: 'Volumetric Flow Rate Q & Average Velocity v_avg',
          math: 'Q = ∫ v_z 2 π r dr = (π ΔP R⁴) / (8 μ L)  =>  v_avg = v_max / 2 = (ΔP D²) / (32 μ L)',
          explanation: 'Integrating velocity across annular rings gives Hagen-Poiseuille law; rearranging yields ΔP = 32 μ v L / D².',
          assumption: 'Re < 2100 (strictly laminar flow).',
        },
      ],
    },
    {
      id: 'mccabe-thiele',
      title: 'McCabe-Thiele q-Line Equation for Distillation Feed',
      subject: 'Mass Transfer Operations II',
      finalEquation: 'y = [q / (q - 1)] x - [x_F / (q - 1)]',
      steps: [
        {
          stepNumber: 1,
          title: 'Feed Section Enthalpy & Mass Balances',
          math: 'L_bar = L + q F   and   V = V_bar + (1 - q) F',
          explanation: 'q is defined as the heat required to vaporize 1 mole of feed divided by the molar latent heat.',
          assumption: 'Constant Molal Overflow (CMO): equal molar heats of vaporization across trays.',
        },
        {
          stepNumber: 2,
          title: 'Rectifying Section Operating Line (ROL)',
          math: 'y V = x L + x_D D  =>  y = (L/V) x + (D/V) x_D',
          explanation: 'Material balance envelope enclosing top of column above feed stage.',
          assumption: 'Total condenser, liquid reflux returned at bubble point.',
        },
        {
          stepNumber: 3,
          title: 'Stripping Section Operating Line (SOL)',
          math: 'y V_bar = x L_bar - x_B B  =>  y = (L_bar/V_bar) x - (B/V_bar) x_B',
          explanation: 'Material balance envelope enclosing bottom of column below feed stage.',
          assumption: 'Partial reboiler generating equilibrium vapor.',
        },
        {
          stepNumber: 4,
          title: 'Subtracting SOL from ROL at Feed Intersection Point',
          math: 'y (V - V_bar) = x (L - L_bar) + (x_D D + x_B B)',
          explanation: 'Recognizing overall component balance: x_D D + x_B B = x_F F.',
          assumption: 'Feed stage is the exact point of intersection between ROL and SOL.',
        },
        {
          stepNumber: 5,
          title: 'Substituting Feed Fraction Relations (L - L_bar = -q F)',
          math: 'y (1 - q) F = x (-q F) + x_F F  =>  y = [q / (q - 1)] x - [x_F / (q - 1)]',
          explanation: 'The slope of the q-line is m = q / (q - 1); q=1 for bubble-point liquid (vertical), q=0 for dew-point vapor (horizontal).',
          assumption: 'Thermal condition of feed dictates slope and optimal feed tray location.',
        },
      ],
    },
    {
      id: 'cstr-design',
      title: 'CSTR Design Performance Equation from General Mole Balance',
      subject: 'Chemical Reaction Engineering I',
      finalEquation: 'V = (F_A0 * X_A) / (-r_A)_exit',
      steps: [
        {
          stepNumber: 1,
          title: 'General Conservation of Moles for Species A',
          math: 'IN - OUT + GENERATION = ACCUMULATION  =>  F_A0 - F_A + ∫ r_A dV = dN_A/dt',
          explanation: 'Macroscopic molar balance across continuous reaction control volume.',
          assumption: 'Uniform system boundary enclosing reactor liquid contents.',
        },
        {
          stepNumber: 2,
          title: 'Steady-State Assumption (dN_A/dt = 0)',
          math: 'F_A0 - F_A + ∫ r_A dV = 0',
          explanation: 'At steady-state operation, concentrations and temperatures do not vary with time.',
          assumption: 'Transient startup completed; steady feed flow rate.',
        },
        {
          stepNumber: 3,
          title: 'Perfect Mixing Condition (Spatial Uniformity)',
          math: '∫ r_A dV = r_A * V  =>  F_A0 - F_A + r_A V = 0',
          explanation: 'In an ideal CSTR, vigorous agitation eliminates all spatial concentration and temperature gradients.',
          assumption: 'Rate of reaction r_A throughout entire volume equals the exit rate r_A_exit.',
        },
        {
          stepNumber: 4,
          title: 'Relating Exit Molar Flow F_A to Fractional Conversion X_A',
          math: 'F_A = F_A0 (1 - X_A)  =>  F_A0 - F_A = F_A0 X_A',
          explanation: 'Fractional conversion X_A is moles of A reacted per mole of A fed.',
          assumption: 'Constant or variable volume; valid for liquid and gas systems.',
        },
        {
          stepNumber: 5,
          title: 'Final CSTR Design Equation',
          math: 'V_CSTR = (F_A0 X_A) / (-r_A)_exit',
          explanation: 'Reactor volume is directly proportional to required conversion and inversely proportional to exit rate.',
          assumption: 'Isothermal operation with no spatial dead zones or bypassing.',
        },
      ],
    },
  ];

  const currentDerivation = DERIVATIONS[selectedDerivationIndex];

  // --- 4. Classroom Interaction / Numerical Polls State ---
  const pollQuestion =
    'If the pump speed N is increased by 20% (N2 = 1.20 N1), by what percentage does the developed head H increase?';
  const [pollOptions, setPollOptions] = useState<{ id: string; text: string; votes: number; correct: boolean }[]>([
    { id: 'opt-1', text: '+20% (Linear scaling)', votes: 3, correct: false },
    { id: 'opt-2', text: '+44% (Affinity law quadratic: 1.2² = 1.44)', votes: 24, correct: true },
    { id: 'opt-3', text: '+72.8% (Cubic scaling: 1.2³ = 1.728)', votes: 4, correct: false },
    { id: 'opt-4', text: 'No change (Head depends only on impeller diameter)', votes: 1, correct: false },
  ]);

  // --- 5. Student Submissions & Grading State ---
  const [submissions] = useState<StudentSubmissionItem[]>([
    {
      id: 'SUB-101',
      studentName: 'Aakash Sharma',
      usn: '1MS22CH001',
      assignment: 'EXP-01: Centrifugal Pump Characteristic Curves',
      submissionDate: '2026-11-06',
      simAccuracyScore: 28,
      vivaScore: 18,
      totalScore: 92,
      feedback: 'Excellent observation logging. Thorough derivation of Euler turbomachinery work.',
      status: 'Reviewed',
    },
    {
      id: 'SUB-102',
      studentName: 'Divya Nair',
      usn: '1MS22CH014',
      assignment: 'EXP-01: Centrifugal Pump Characteristic Curves',
      submissionDate: '2026-11-07',
      simAccuracyScore: 29,
      vivaScore: 19,
      totalScore: 96,
      feedback: 'Outstanding explanation of backward-curved impeller pressure development and NPSHa safety margins.',
      status: 'Reviewed',
    },
    {
      id: 'SUB-103',
      studentName: 'Karthik Rao',
      usn: '1MS22CH027',
      assignment: 'EXP-02: Fluidised Bed Pressure Drop & u_mf',
      submissionDate: '2026-11-08',
      simAccuracyScore: 25,
      vivaScore: 16,
      totalScore: 82,
      feedback: 'Re-verify Ergun equation inertial term calculation at superficial velocity above 0.8 m/s.',
      status: 'Pending Review',
    },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
          padding: '24px 28px',
          borderRadius: 12,
          border: '1px solid #4338ca',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  background: '#4f46e5',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  padding: '3px 8px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                }}
              >
                Faculty Teaching Studio · Presentation & Pedagogy
              </span>
              <span style={{ color: '#a5b4fc', fontSize: '0.82rem', fontWeight: 600 }}>
                Interactive Whiteboard · Live Teaching Stage · Step Derivations · Classroom Polls
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', fontWeight: 800, margin: '0 0 8px', color: '#ffffff' }}>
              Faculty Classroom Teaching & Demonstration Studio
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0, maxWidth: 840, lineHeight: 1.5 }}>
              Designed specifically for engineering teachers: conduct fullscreen interactive demonstrations, reveal step-by-step mathematical derivations on the virtual chalkboard, draw equipment flowsheets on the whiteboard, and broadcast live numerical polls.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {onLaunchSimulation && (
              <button
                type="button"
                onClick={() => onLaunchSimulation('centrifugal-pump')}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: 6,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Activity size={16} /> Open Pump Twin
              </button>
            )}
          </div>
        </div>

        {/* Studio Navigation Tabs */}
        <div style={{ display: 'flex', gap: 6, marginTop: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'presentation', label: 'Classroom Presentation Mode', icon: Presentation },
            { id: 'whiteboard', label: 'Interactive Whiteboard', icon: PenTool },
            { id: 'derivations', label: 'Step-by-Step Derivations (9 Topics)', icon: Layers },
            { id: 'interaction', label: 'Classroom Polls & Quizzes', icon: HelpCircle },
            { id: 'scenarios', label: 'Faculty Scenario Builder', icon: Sliders },
            { id: 'grading', label: `Student Submissions (${submissions.length})`, icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: isActive ? '#4f46e5' : '#1e293b',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  border: isActive ? '1px solid #818cf8' : '1px solid #334155',
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
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. PRESENTATION MODE: CLEAN FULLSCREEN LIVE SIMULATION              */}
      {/* =================================================================== */}
      {activeTab === 'presentation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top Control Bar */}
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsAnimationPaused(!isAnimationPaused)}
                style={{
                  background: isAnimationPaused ? '#10b981' : '#f59e0b',
                  color: '#000',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {isAnimationPaused ? <Play size={14} /> : <Pause size={14} />}
                {isAnimationPaused ? 'Resume Simulation' : 'Freeze Frame (Pause)'}
              </button>

              <button
                type="button"
                onClick={() => setHideAdvancedControls(!hideAdvancedControls)}
                style={{
                  background: '#1e293b',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {hideAdvancedControls ? <Eye size={14} /> : <EyeOff size={14} />}
                {hideAdvancedControls ? 'Show Advanced Controls' : 'Hide Controls (Beginners)'}
              </button>
            </div>

            {/* Laser Pointer Component Highlighting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>Laser Focus:</span>
              {[
                { id: 'impeller', label: 'Impeller Vanes' },
                { id: 'volute', label: 'Volute Casing' },
                { id: 'seal', label: 'Mechanical Seal' },
                { id: 'bearings', label: 'Bearing Housing' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setHighlightedComponent(c.id)}
                  style={{
                    background: highlightedComponent === c.id ? '#ef4444' : '#1e293b',
                    color: highlightedComponent === c.id ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Side-by-Side Comparative Stage */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Scenario A: Baseline */}
            <div
              style={{
                background: '#090d16',
                border: '1px solid #1e3a8a',
                borderRadius: 12,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ background: '#1e3a8a', color: '#60a5fa', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>
                  Scenario A · Baseline Operating State
                </span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>API 610 Single Stage</span>
              </div>

              {/* Readouts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div style={{ background: '#0f172a', padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>SPEED (N)</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#60a5fa' }}>{scenarioASpeed} RPM</div>
                </div>
                <div style={{ background: '#0f172a', padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>HEAD (H)</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>{headA.toFixed(1)} m</div>
                </div>
                <div style={{ background: '#0f172a', padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>BRAKE POWER</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b' }}>{powerA.toFixed(2)} kW</div>
                </div>
              </div>

              {!hideAdvancedControls && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#0c1424', padding: 12, borderRadius: 8 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                      <span>Pump Speed Slider</span>
                      <span>{scenarioASpeed} RPM</span>
                    </div>
                    <input
                      type="range"
                      min={1450}
                      max={3500}
                      step={50}
                      value={scenarioASpeed}
                      onChange={(e) => setScenarioASpeed(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                      <span>Flow Rate (Q)</span>
                      <span>{scenarioAFlow.toFixed(1)} m³/h</span>
                    </div>
                    <input
                      type="range"
                      min={5.0}
                      max={45.0}
                      step={1.0}
                      value={scenarioAFlow}
                      onChange={(e) => setScenarioAFlow(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Scenario B: Throttled / Modified */}
            <div
              style={{
                background: '#090d16',
                border: '1px solid #065f46',
                borderRadius: 12,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ background: '#065f46', color: '#34d399', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>
                  Scenario B · Modified Operating State
                </span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Variable Speed VFD Throttling</span>
              </div>

              {/* Readouts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div style={{ background: '#0f172a', padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>SPEED (N)</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>{scenarioBSpeed} RPM</div>
                </div>
                <div style={{ background: '#0f172a', padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>HEAD (H)</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>{headB.toFixed(1)} m</div>
                </div>
                <div style={{ background: '#0f172a', padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>BRAKE POWER</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b' }}>{powerB.toFixed(2)} kW</div>
                </div>
              </div>

              {!hideAdvancedControls && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#082f25', padding: 12, borderRadius: 8 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                      <span>Pump Speed Slider</span>
                      <span>{scenarioBSpeed} RPM</span>
                    </div>
                    <input
                      type="range"
                      min={1450}
                      max={3500}
                      step={50}
                      value={scenarioBSpeed}
                      onChange={(e) => setScenarioBSpeed(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                      <span>Flow Rate (Q)</span>
                      <span>{scenarioBFlow.toFixed(1)} m³/h</span>
                    </div>
                    <input
                      type="range"
                      min={5.0}
                      max={45.0}
                      step={1.0}
                      value={scenarioBFlow}
                      onChange={(e) => setScenarioBFlow(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chalkboard Derivations Bar */}
          {showChalkboard && (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                  Live Chalkboard Mathematical Derivation
                </span>
                <button
                  type="button"
                  onClick={() => setShowChalkboard(false)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.74rem', cursor: 'pointer' }}
                >
                  Collapse Chalkboard
                </button>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.6, background: '#090d16', padding: 14, borderRadius: 6 }}>
                <div><strong>Affinity Law Scaling:</strong> H2 / H1 = (N2 / N1)² * (D2 / D1)²</div>
                <div><strong>Power Reduction Ratio:</strong> P_B / P_A = ({powerB.toFixed(2)} kW) / ({powerA.toFixed(2)} kW) = {((powerB / powerA) * 100).toFixed(1)}% of baseline power</div>
                <div style={{ color: '#10b981', marginTop: 4 }}>
                  Energy savings by speed throttling: {(100 - (powerB / powerA) * 100).toFixed(1)}% energy reduction compared to valve throttling!
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. INTERACTIVE WHITEBOARD                                           */}
      {/* =================================================================== */}
      {activeTab === 'whiteboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Add equipment blocks, draw process streams, write governing equations, and annotate boundary conditions.
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { type: 'pump', label: '+ Pump' },
                { type: 'exchanger', label: '+ Exchanger' },
                { type: 'reactor', label: '+ Reactor' },
                { type: 'column', label: '+ Column' },
                { type: 'tank', label: '+ Tank' },
              ].map((btn) => (
                <button
                  key={btn.type}
                  type="button"
                  onClick={() => {
                    const newId = `wb-${Date.now()}`;
                    setWbElements([
                      ...wbElements,
                      {
                        id: newId,
                        type: btn.type as any,
                        x: 100 + Math.random() * 400,
                        y: 100 + Math.random() * 200,
                        label: `New ${btn.label.replace('+', '').trim()}`,
                        annotation: 'Annotate boundary condition',
                      },
                    ]);
                  }}
                  style={{
                    background: '#1e293b',
                    color: '#38bdf8',
                    border: '1px solid #334155',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {btn.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setWbElements([])}
                style={{ background: '#7f1d1d', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, fontSize: '0.74rem', cursor: 'pointer' }}
              >
                Clear Board
              </button>
            </div>
          </div>

          {/* SVG Whiteboard Stage */}
          <div
            style={{
              background: '#090d16',
              border: '2px dashed #1e293b',
              borderRadius: 12,
              height: 440,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Grid Pattern */}
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#172033" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Connected Process Stream Lines */}
              <path d="M 120 180 L 260 180" stroke="#38bdf8" strokeWidth="3" fill="none" markerEnd="url(#arrow)" />
              <path d="M 300 180 L 440 180" stroke="#38bdf8" strokeWidth="3" fill="none" />
              <path d="M 500 180 L 620 180" stroke="#38bdf8" strokeWidth="3" fill="none" />
              <text x="180" y="170" fill="#38bdf8" fontSize="10" fontWeight="700">Stream 101 (25 m³/h)</text>
              <text x="360" y="170" fill="#38bdf8" fontSize="10" fontWeight="700">Stream 102 (H=25m)</text>
              <text x="550" y="170" fill="#f59e0b" fontSize="10" fontWeight="700">T=85°C</text>
            </svg>

            {/* Draggable Equipment Cards */}
            {wbElements.map((el) => (
              <div
                key={el.id}
                style={{
                  position: 'absolute',
                  left: el.x,
                  top: el.y,
                  background: '#0f172a',
                  border: '1px solid #38bdf8',
                  borderRadius: 8,
                  padding: '10px 14px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                  cursor: 'move',
                  userSelect: 'none',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginBottom: 2 }}>
                  {el.label}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {el.annotation}
                </div>
              </div>
            ))}

            {/* Floating Equation Banner */}
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid #334155',
                borderRadius: 6,
                padding: '8px 14px',
                fontSize: '0.8rem',
                color: '#34d399',
                fontFamily: 'monospace',
              }}
            >
              Active Annotation: {activeAnnotationText}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. STEP-BY-STEP DERIVATION MODE (REVEAL ONE LINE AT A TIME)          */}
      {/* =================================================================== */}
      {activeTab === 'derivations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Derivation Topic Selector */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {DERIVATIONS.map((d, idx) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setSelectedDerivationIndex(idx);
                  setRevealedStepCount(1);
                }}
                style={{
                  background: selectedDerivationIndex === idx ? '#4f46e5' : '#0f172a',
                  color: selectedDerivationIndex === idx ? '#ffffff' : '#94a3b8',
                  border: '1px solid #334155',
                  padding: '8px 14px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {d.title}
              </button>
            ))}
          </div>

          {/* Derivation Stage */}
          <div
            style={{
              background: '#090d16',
              border: '1px solid #1e3a8a',
              borderRadius: 12,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>
                  {currentDerivation.subject}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                  {currentDerivation.title}
                </h2>
                <div style={{ fontFamily: 'monospace', fontSize: '0.92rem', color: '#34d399', marginTop: 4 }}>
                  Final Target: {currentDerivation.finalEquation}
                </div>
              </div>

              {/* Reveal Controls */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  disabled={revealedStepCount <= 1}
                  onClick={() => setRevealedStepCount(Math.max(1, revealedStepCount - 1))}
                  style={{
                    background: '#1e293b',
                    color: revealedStepCount <= 1 ? '#475569' : '#f8fafc',
                    border: '1px solid #334155',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: revealedStepCount <= 1 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <ChevronLeft size={14} /> Previous Step
                </button>

                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>
                  Step {revealedStepCount} of {currentDerivation.steps.length}
                </span>

                <button
                  type="button"
                  disabled={revealedStepCount >= currentDerivation.steps.length}
                  onClick={() => setRevealedStepCount(Math.min(currentDerivation.steps.length, revealedStepCount + 1))}
                  style={{
                    background: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: revealedStepCount >= currentDerivation.steps.length ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Next Step <ChevronRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setRevealedStepCount(currentDerivation.steps.length)}
                  style={{
                    background: '#1e293b',
                    color: '#38bdf8',
                    border: '1px solid #334155',
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                  }}
                >
                  Show All
                </button>
              </div>
            </div>

            {/* Steps Revealed on Chalkboard */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentDerivation.steps.slice(0, revealedStepCount).map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#0c1424',
                    border: '1px solid #1e293b',
                    borderRadius: 8,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    animation: 'fadeIn 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                      Step {step.stepNumber}: {step.title}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Assumptions: {step.assumption}</span>
                  </div>

                  <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: '#ffffff', fontWeight: 700, padding: '6px 0' }}>
                    {step.math}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {step.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. CLASSROOM POLLS & QUIZZES                                        */}
      {/* =================================================================== */}
      {activeTab === 'interaction' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              background: '#090d16',
              border: '1px solid #1e3a8a',
              borderRadius: 12,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ background: '#10b981', color: '#000', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>
                LIVE CLASSROOM NUMERICAL POLL
              </span>
              <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>32 Students Connected</span>
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.4 }}>
              {pollQuestion}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pollOptions.map((opt) => {
                const totalVotes = pollOptions.reduce((acc, o) => acc + o.votes, 0);
                const pct = totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(0) : '0';
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setPollOptions(
                        pollOptions.map((o) => (o.id === opt.id ? { ...o, votes: o.votes + 1 } : o))
                      );
                    }}
                    style={{
                      background: '#0f172a',
                      border: opt.correct ? '1px solid #10b981' : '1px solid #1e293b',
                      borderRadius: 8,
                      padding: '12px 16px',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${pct}%`,
                        background: opt.correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.08)',
                        zIndex: 0,
                      }}
                    />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f8fafc' }}>{opt.text}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: opt.correct ? '#34d399' : '#94a3b8' }}>
                        {opt.votes} votes ({pct}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. FACULTY SCENARIO BUILDER                                         */}
      {/* =================================================================== */}
      {activeTab === 'scenarios' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Create Custom Classroom Laboratory Challenge
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Target Apparatus / Digital Twin
                </label>
                <select style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: 8, borderRadius: 6, marginTop: 4 }}>
                  <option>Centrifugal Pump Digital Twin (API 610)</option>
                  <option>Fluidised Bed Dynamics Column</option>
                  <option>McCabe-Thiele Distillation Column</option>
                  <option>Shell & Tube Exchanger Rating</option>
                  <option>CSTR Exothermic Reactor</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Learning Objective
                </label>
                <input
                  type="text"
                  defaultValue="Diagnose cavitation onset when liquid vapor pressure increases to 45 kPa"
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: 8, borderRadius: 6, marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Initial Constraints
                </label>
                <input
                  type="text"
                  defaultValue="N = 2950 RPM, Static Suction Head = 2.0 m, Min NPSH margin = 1.0 m"
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: 8, borderRadius: 6, marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Evaluation Rubric
                </label>
                <input
                  type="text"
                  defaultValue="Simulation Accuracy (50 pts), Data Points Logged (25 pts), Viva Rationale (25 pts)"
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: 8, borderRadius: 6, marginTop: 4 }}
                />
              </div>
            </div>

            <button
              type="button"
              style={{
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                alignSelf: 'flex-start',
              }}
            >
              Broadcast Scenario to Students
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. STUDENT SUBMISSIONS & GRADING                                    */}
      {/* =================================================================== */}
      {activeTab === 'grading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Review student experimental data tables, verification stamps, and oral viva submissions.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {submissions.map((sub) => (
              <div
                key={sub.id}
                style={{
                  background: '#090d16',
                  border: '1px solid #1e293b',
                  borderRadius: 8,
                  padding: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>{sub.studentName}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>({sub.usn})</span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        background: sub.status === 'Reviewed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: sub.status === 'Reviewed' ? '#34d399' : '#fbbf24',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#38bdf8' }}>{sub.assignment}</div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 4 }}>{sub.feedback}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>{sub.totalScore}/100</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Sim: {sub.simAccuracyScore} | Viva: {sub.vivaScore}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
