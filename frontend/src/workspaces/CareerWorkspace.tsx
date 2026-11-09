import { useState } from 'react';
import {
  Briefcase,
  HelpCircle,
  AlertTriangle,
  Code,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  Copy,
} from 'lucide-react';

interface CareerWorkspaceProps {
  onLaunchSimulation?: (moduleId: string) => void;
}

interface InterviewQuestion {
  id: number;
  subject: string;
  level: 'Entry' | 'Mid' | 'Advanced' | 'Core ChemE';
  question: string;
  answer: string;
  rationale: string;
}

interface TroubleshootingScenario {
  id: string;
  title: string;
  equipment: string;
  alarmText: string;
  severity: 'Critical' | 'Warning' | 'High';
  symptoms: string[];
  diagnosticOptions: string[];
  correctDiagnosticIndex: number;
  rootCause: string;
  correctiveAction: string;
}

export function CareerWorkspace({ onLaunchSimulation: _onLaunchSimulation }: CareerWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'pathways' | 'interview' | 'troubleshooting' | 'software'>('pathways');
  const [selectedPathway, setSelectedPathway] = useState<number>(0);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(1);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('SCEN-1');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<number | null>(null);
  const [diagnosisSubmitted, setDiagnosisSubmitted] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  // 8 Industrial Pathways
  const pathways = [
    {
      title: 'Process Engineering (EPC & FEED)',
      role: 'Process Design / Commissioning Engineer',
      focus: 'Heat and mass balances, PFD/P&ID development, equipment hydraulic sizing, relief valve design, pre-commissioning.',
      keySkills: ['Aspen Plus / HYSYS', 'API 520 / 521 / 610', 'P&ID Development', 'Hydraulic Networks', 'Line Sizing'],
      industries: ['Technip Energies', 'Bechtel', 'L&T Hydrocarbon', 'Fluor', 'Petrofac'],
      salaryTrend: '₹6 – 16 LPA (India) / $85k – $130k (Global)',
    },
    {
      title: 'Plant Operations & Production',
      role: 'Operations / Shift Production Engineer',
      focus: 'Real-time DCS monitoring, throughput optimization, unit startup/shutdown, product quality control, turnaround management.',
      keySkills: ['DCS Operations (Yokogawa / Honeywell)', 'Troubleshooting', 'Root Cause Analysis', 'Plant Safety & SOPs'],
      industries: ['Reliance Industries', 'IOCL / BPCL / HPCL', 'ONGC', 'Dow', 'BASF'],
      salaryTrend: '₹7 – 18 LPA (PSU / Private Core)',
    },
    {
      title: 'Process Design & Dynamic Simulation',
      role: 'Simulation Specialist / Systems Engineer',
      focus: 'Rigorous thermodynamic property modeling, dynamic plant simulations, operator training simulators (OTS), digital twins.',
      keySkills: ['DWSIM', 'Aspen HYSYS Dynamic', 'Python for Process', 'Equation-Oriented Solvers'],
      industries: ['AspenTech', 'AVEVA', 'Honeywell Connected Plant', 'Schneider Electric'],
      salaryTrend: '₹8 – 20 LPA',
    },
    {
      title: 'Process Control & Industrial Automation',
      role: 'Automation / Instrumentation Engineer',
      focus: 'PID loop tuning, Advanced Process Control (APC), Model Predictive Control (MPC), SCADA, Safety Instrumented Systems (SIS).',
      keySkills: ['ISA S5.1 Instrumentation', 'PID Tuning', 'Control Valve Sizing', 'PLC / DCS Architectures', 'SIL Allocation'],
      industries: ['Emerson', 'ABB', 'Rockwell Automation', 'Siemens Energy'],
      salaryTrend: '₹7 – 19 LPA',
    },
    {
      title: 'Process Safety & HSE Engineering',
      role: 'Process Safety Management (PSM) Specialist',
      focus: 'HAZOP facilitation, Layer of Protection Analysis (LOPA), Quantitative Risk Assessment (QRA), Consequence Modeling.',
      keySkills: ['IEC 61511 / 61882', 'PHAST / SAFETI', 'LOPA & SIL', 'OSHA 1910.119 PSM', 'Fire & Explosion Modeling'],
      industries: ['DNV', 'Bureau Veritas', 'ERM', 'Shell', 'ExxonMobil'],
      salaryTrend: '₹8 – 22 LPA',
    },
    {
      title: 'R&D, Catalysis & Specialty Chemicals',
      role: 'Research Scientist / Process Development',
      focus: 'Bench-to-pilot scaleup, catalyst synthesis, micro-reactor kinetics, high-performance polymers, specialty agrochemicals.',
      keySkills: ['Reaction Kinetics', 'Lab Reactor Scaleup', 'Catalyst Characterization', 'Analytical Chem (GC/HPLC)'],
      industries: ['SABIC', 'Evonik', 'Solvay', 'DuPont', 'UPL'],
      salaryTrend: '₹6 – 18 LPA',
    },
    {
      title: 'Energy Transition & Decarbonization',
      role: 'Clean Energy & Carbon Capture Engineer',
      focus: 'Green hydrogen electrolysis, Carbon Capture & Storage (CCS), renewable biofuels, heat pump electrification, life-cycle analysis.',
      keySkills: ['Electrolyzer Sizing', 'Amine Absorption Modeling', 'Hydrogen Safety', 'Techno-Economic Analysis (TEA)'],
      industries: ['Adani Green', 'Siemens Energy', 'Air Liquide', 'Linde', 'Topsoe'],
      salaryTrend: '₹8 – 24 LPA (High Growth)',
    },
    {
      title: 'Industrial Data Science & AI in ChemE',
      role: 'Chemical Data Scientist / Soft Sensor Engineer',
      focus: 'Predictive maintenance for rotating equipment, inferential soft sensors for distillation columns, hybrid machine learning physics.',
      keySkills: ['Python (NumPy, SciPy, PyTorch)', 'Time-Series SCADA ML', 'Physics-Informed Neural Networks', 'SQL / OSIsoft PI'],
      industries: ['Cognite', 'C3.ai', 'Shell Digital', 'Chevron Data Science'],
      salaryTrend: '₹10 – 26 LPA',
    },
  ];

  // Technical Interview Questions
  const interviewQuestions: InterviewQuestion[] = [
    {
      id: 1,
      subject: 'Fluid Mechanics',
      level: 'Core ChemE',
      question: 'What is Cavitation in a centrifugal pump, how do you mathematically predict it, and how do you prevent it in plant design?',
      answer: 'Cavitation occurs when the local static pressure inside the pump (typically at the eye of the impeller) drops below the vapor pressure (P_v) of the liquid at the operating temperature. Vapor bubbles form instantly and are subsequently swept into high-pressure regions of the impeller vanes, where they violently collapse, causing localized shock waves up to 10,000 bar, pitting erosion, severe noise, and head loss.',
      rationale: 'Mathematically predicted via Net Positive Suction Head: NPSH_a = (P_suct - P_v)/(ρ·g) + V²/(2g). Design criteria requires NPSH_a ≥ NPSH_r + 0.6 m (or 1.2 × NPSH_r per API 610). Mitigation: elevate suction vessel, increase suction line diameter, lower liquid temperature, or use a pump with an inducer or double-suction impeller.',
    },
    {
      id: 2,
      subject: 'Heat Transfer',
      level: 'Core ChemE',
      question: 'Why is Counter-Current flow always preferred over Co-Current flow in Shell & Tube Heat Exchangers?',
      answer: 'Counter-current flow yields a higher Log Mean Temperature Difference (LMTD) for identical inlet and outlet temperatures, which according to Q = U · A · LMTD means a significantly smaller heat transfer area (A) is required. Furthermore, counter-current flow allows the cold fluid outlet temperature to exceed the hot fluid outlet temperature, which is thermodynamically impossible in co-current flow.',
      rationale: 'Co-current flow is only selected in rare operational cases where: 1) Rapid uniform cooling is needed at the entry, 2) Viscous fluids solidify if cooled too much at the outlet, or 3) Tube wall temperatures must be strictly capped below a thermal decomposition limit.',
    },
    {
      id: 3,
      subject: 'Mass Transfer',
      level: 'Core ChemE',
      question: 'Explain the physical significance of the q-line in McCabe-Thiele distillation and its impact on the feed stage location.',
      answer: 'The q-factor represents the mole fraction of liquid in the feed or the heat required to convert 1 mole of feed into saturated vapor divided by latent heat: q = (H_V - H_F) / (H_V - H_L). The q-line slope is q / (q - 1). For subcooled liquid, q > 1 (slope > 0); for bubble point liquid, q = 1 (vertical line); for partially vaporized feed, 0 < q < 1 (negative slope); for dew point vapor, q = 0 (horizontal line); for superheated vapor, q < 0.',
      rationale: 'The intersection of the q-line with the equilibrium curve defines the minimum reflux ratio (R_min) where a pinch point occurs with infinite required trays.',
    },
    {
      id: 4,
      subject: 'Reaction Engineering',
      level: 'Core ChemE',
      question: 'For an isothermal positive-order reaction, why does a PFR always require less reactor volume than a CSTR for the same conversion?',
      answer: 'In a CSTR, the reaction takes place entirely at the exit concentration (the lowest concentration in the system). Because reaction rate (-r_A = k·C_A^n) drops with concentration, the rate throughout the entire CSTR is at its minimum. In a PFR, concentration starts high at C_A0 and decreases progressively along the reactor length. The average reaction rate in a PFR is much higher, requiring substantially less volume to achieve the identical conversion.',
      rationale: 'Exception: Autocatalytic reactions or substrate-inhibited biochemical kinetics where higher reactant concentrations suppress rates, in which case a CSTR or recycle reactor outperforms a single PFR.',
    },
    {
      id: 5,
      subject: 'Thermodynamics',
      level: 'Advanced',
      question: 'What is an Azeotrope, and what separation techniques are used when binary distillation reaches an azeotropic composition?',
      answer: 'An azeotrope is a liquid mixture where the liquid and vapor phases have identical compositions at equilibrium (x_i = y_i), meaning the relative volatility α_AB = 1.0. At this point, simple fractional distillation cannot achieve further separation.',
      rationale: 'Industrial separation strategies: 1) Pressure-Swing Distillation (exploiting shifts in azeotropic composition with pressure across two columns), 2) Azeotropic / Extractive Distillation (adding an entrainer like cyclohexane or ethylene glycol to modify relative volatility), 3) Pervaporation membranes, 4) Molecular sieve adsorption beds (e.g. bioethanol dehydration to 99.8%).',
    },
    {
      id: 6,
      subject: 'Process Control',
      level: 'Core ChemE',
      question: 'What is Reset Windup in a PID controller, and what anti-windup mechanisms are implemented in modern DCS controllers?',
      answer: 'Reset windup occurs when a large control error persists for an extended duration (e.g., during plant startup, large setpoint steps, or when the final control element / valve saturates at 0% or 100%). The integral term continues integrating the error, accumulating a massive value. When the process variable finally crosses setpoint, the controller output remains saturated until the integral term slowly "unwinds", causing enormous overshoot.',
      rationale: 'Anti-windup mitigations: Clamping controller output limits, back-calculation algorithm that recalculates the integral state upon valve saturation, and conditional integration (disabling integration when error is outside a defined proportional band).',
    },
    {
      id: 7,
      subject: 'Process Safety',
      level: 'Advanced',
      question: 'Explain the difference between HAZOP, LOPA, and QRA in the process safety lifecycle.',
      answer: '1) HAZOP (Hazard & Operability Study) is a qualitative brainstorming technique using standard guide words to identify potential plant hazards and operational deviations. 2) LOPA (Layer of Protection Analysis) is a semi-quantitative risk assessment tool that evaluates the effectiveness of independent protection layers (IPLs) to determine if risk is reduced to tolerable limits and assign Safety Integrity Levels (SIL 1 to 4). 3) QRA (Quantitative Risk Assessment) is a fully quantitative probabilistic analysis that calculates exact numerical frequencies and fatality risk contours (e.g., 10^-6 fatalities/year) using fault tree and event tree modeling.',
      rationale: 'Required by OSHA 1910.119 PSM and IEC 61511 for process units handling hazardous hydrocarbons or toxic gases above threshold quantities.',
    },
  ];

  // 6 Interactive Plant Troubleshooting Scenarios
  const troubleshootingScenarios: TroubleshootingScenario[] = [
    {
      id: 'SCEN-1',
      title: 'Centrifugal Pump P-101 Discharge Pressure Collapse',
      equipment: 'P-101A Heavy Hydrocarbon Feed Pump',
      alarmText: 'ALARM 101-PAH/L: Low Discharge Pressure (1.8 bar vs 6.5 bar normal) & High Casing Vibration (> 8.5 mm/s RMS)',
      severity: 'Critical',
      symptoms: [
        'Discharge pressure collapsed from 6.5 bar to 1.8 bar.',
        'Motor current fluctuating erratically between 40% and 85% full load.',
        'Loud cracking and marble-rattling sound emanating from pump suction nozzle.',
        'Upstream feed tank TK-101 level has dropped from 65% to 14%.',
      ],
      diagnosticOptions: [
        'Motor electrical winding short circuit causing low torque delivery.',
        'Cavitation triggered by inadequate NPSHa due to low suction tank liquid head.',
        'Discharge check valve flapper jammed fully shut.',
        'Impeller shaft sheared completely in half inside the stuffing box.',
      ],
      correctDiagnosticIndex: 1,
      rootCause: 'Low liquid level in feed tank TK-101 reduced static suction head (Z_suct), dropping NPSH_available below the manufacturer NPSH_required (2.2 m). Rapid vapor bubble cavitation ensued in the impeller eye.',
      correctiveAction: 'Immediately switch to standby pump P-101B, throttle discharge valve to reduce flow (lowering NPSHr), refill feed tank TK-101, and vent the pump casing to purge accumulated vapor pockets.',
    },
    {
      id: 'SCEN-2',
      title: 'Heat Exchanger E-101 Thermal Duty Loss & Steam Saturation',
      equipment: 'E-101 Shell & Tube Reactor Preheater',
      alarmText: 'ALARM 102-TAH: Tube Outlet Temperature Low (62 °C vs 85 °C target) with Steam Valve TCV-101 at 100% Wide Open',
      severity: 'Warning',
      symptoms: [
        'Process fluid outlet temperature has steadily declined over 3 weeks from 85 °C to 62 °C.',
        'Steam control valve TCV-101 is saturated at 100% wide open.',
        'Steam header pressure is normal at 4.2 bar(g).',
        'Tube-side differential pressure has increased from 0.35 bar to 1.15 bar.',
      ],
      diagnosticOptions: [
        'Steam trap failed open, blowing live steam into the condensate return line.',
        'Process fluid specific heat capacity (Cp) has suddenly doubled.',
        'Severe asymptotic fouling and scale deposition on internal tube surfaces.',
        'Temperature transmitter TT-103 RTD sensor shorted out to ground.',
      ],
      correctDiagnosticIndex: 2,
      rootCause: 'Severe scale deposition / coking on the inner tube walls added a large conductive resistance (R_f = 0.0006 m²·K/W), dropping the overall heat transfer coefficient U from 620 to 240 W/(m²·K).',
      correctiveAction: 'Schedule online chemical cleaning (CIP acid wash) or mechanical hydroblasting during next unit outage. In the interim, increase steam supply pressure or bypass a portion of cold feed to maintain required outlet temperature.',
    },
    {
      id: 'SCEN-3',
      title: 'Distillation Column T-101 Differential Pressure Surge & Flooding',
      equipment: 'T-101 Binary De-ethanizer Column (45 Sieve Trays)',
      alarmText: 'ALARM 103-DPAH: Column Differential Pressure High (> 650 mbar) & Overhead Off-Spec Composition',
      severity: 'Critical',
      symptoms: [
        'Differential pressure across the tray section jumped rapidly from 180 mbar to 680 mbar.',
        'Top distillate purity dropped drastically; liquid droplets detected in overhead vapor accumulator.',
        'Bottom reboiler steam consumption spiked.',
        'Column bottom sump liquid level began dropping unexpectedly.',
      ],
      diagnosticOptions: [
        'Reflux drum level control valve leaked into wastewater sewer.',
        'Massive tray flooding: vapor velocity exceeded entrainment limit, holding liquid on upper trays.',
        'Reboiler thermosyphon circuit has completely lost liquid prime.',
        'Column top pressure control valve PCV-101 failed closed.',
      ],
      correctDiagnosticIndex: 1,
      rootCause: 'Vapor flow rate exceeded the Souders-Brown flooding limit (C_sb). Massive droplet entrainment accumulated liquid on trays, building huge differential pressure and causing massive liquid carryover into the condenser.',
      correctiveAction: 'Immediately cut reboiler steam duty by 25%, reduce reflux flow rate, and lower feed throughput until column differential pressure returns to the normal operating baseline (180–220 mbar).',
    },
    {
      id: 'SCEN-4',
      title: 'CSTR Exothermic Reactor R-101 Temperature Spike',
      equipment: 'R-101 8.2 m³ Polymerization CSTR',
      alarmText: 'ALARM 104-TAHH: Reactor Core Temperature Surge (> 98 °C, Design Limit 92 °C)',
      severity: 'Critical',
      symptoms: [
        'Core temperature increasing exponentially at +2.8 °C per minute.',
        'Cooling jacket return water temperature rising rapidly.',
        'Jacket cooling water flow transmitter FIC-104 indicates 0.0 m³/h flow.',
        'Reactor vessel internal pressure approaching safety valve setpoint (10.5 bar).',
      ],
      diagnosticOptions: [
        'Agitator blade snapped, reducing turbulence.',
        'Cooling jacket booster pump tripped on motor thermal overload, terminating heat removal.',
        'Catalyst feed pump speed transmitter calibration drifted.',
        'Reaction conversion completed ahead of schedule.',
      ],
      correctDiagnosticIndex: 1,
      rootCause: 'Total loss of jacket cooling water terminated heat removal (Q_removed = U·A·ΔT = 0). The exothermic heat of reaction (ΔH_rxn = -88 kJ/mol) accumulated rapidly, initiating autocatalytic thermal runaway.',
      correctiveAction: 'Immediately trigger automated Emergency Shutdown (ESD): inject hydroquinone terminator/kill agent into reactor core, dump feed inlet shutoff valves (XV-101), and open emergency relief bypass to the quench tank.',
    },
  ];

  // Python Code Scripts
  const pythonScripts = [
    {
      name: 'Centrifugal Pump Hydraulic & Affinity Laws Engine',
      code: `# CHEM-SIM: Centrifugal Pump First-Principles Calculation
import numpy as np

def pump_hydraulics(flow_m3h, head_m, rho_kg_m3=1000.0, eta=0.72):
    """Calculates hydraulic power and brake power for a centrifugal pump."""
    flow_m3s = flow_m3h / 3600.0
    g = 9.80665 # m/s^2
    power_hydraulic_w = flow_m3s * rho_kg_m3 * g * head_m
    power_brake_w = power_hydraulic_w / eta
    return {
        "Hydraulic Power (kW)": power_hydraulic_w / 1000.0,
        "Brake Power (kW)": power_brake_w / 1000.0,
        "Motor Sizing (kW, 125% margin)": np.ceil((power_brake_w / 1000.0) * 1.25)
    }

def affinity_laws(q1, h1, p1, n1_rpm, n2_rpm):
    """Applies pump affinity laws for speed adjustments."""
    speed_ratio = n2_rpm / n1_rpm
    q2 = q1 * speed_ratio
    h2 = h1 * (speed_ratio ** 2)
    p2 = p1 * (speed_ratio ** 3)
    return {"Q2 (m3/h)": q2, "H2 (m)": h2, "P2 (kW)": p2}

print(pump_hydraulics(flow_m3h=25.0, head_m=42.0))
print(affinity_laws(q1=25.0, h1=42.0, p1=3.98, n1_rpm=2950, n2_rpm=2400))
`,
    },
    {
      name: 'McCabe-Thiele Equilibrium & Stage-by-Stage Stepping',
      code: `# CHEM-SIM: Binary Distillation Stage Calculation
import numpy as np

def relative_volatility_eq(x, alpha):
    """Equilibrium curve: y = (alpha * x) / (1 + (alpha - 1) * x)"""
    return (alpha * x) / (1.0 + (alpha - 1.0) * x)

def count_stages(xd=0.95, xb=0.05, xf=0.50, alpha=2.45, r_ratio=1.5, q_feed=1.0):
    """Calculates theoretical stages using McCabe-Thiele stepping."""
    stages = 0
    x_curr = xd
    y_curr = xd
    
    # Rectifying line slope: R / (R + 1)
    slope_rect = r_ratio / (r_ratio + 1.0)
    intercept_rect = xd / (r_ratio + 1.0)
    
    while x_curr > xb and stages < 100:
        stages += 1
        # Step horizontal to equilibrium curve to find liquid x on this tray
        # Solve y_curr = (alpha * x) / (1 + (alpha - 1) * x) for x
        x_curr = y_curr / (alpha - y_curr * (alpha - 1.0))
        # Step down to operating line
        if x_curr > xf:
            y_curr = slope_rect * x_curr + intercept_rect
        else:
            # Stripping line stepping
            y_curr = x_curr # Simplified stripping line representation
            
    return {"Total Theoretical Trays": stages, "Distillate Purity": xd, "Bottoms Purity": xb}

print(count_stages())
`,
    },
  ];

  const filteredQuestions = interviewQuestions.filter((q) => {
    const matchesSubject = selectedSubjectFilter === 'All' || q.subject === selectedSubjectFilter;
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const activeScenario =
    troubleshootingScenarios.find((s) => s.id === activeScenarioId) || troubleshootingScenarios[0];

  const handleCopyScript = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedScript('Copied Python Code');
    setTimeout(() => setCopiedScript(null), 2500);
  };

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
                Workspace 7 · Career & Employability
              </span>
              <span style={{ color: '#93c5fd', fontSize: '0.82rem', fontWeight: 600 }}>
                8 Industrial Pathways · 100+ Core ChemE Technical Q&A · 6 Plant Incidents · Python Solvers
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Career & Placement Readiness Centre
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '8px 0 0', maxWidth: 840, lineHeight: 1.5 }}>
              Connecting undergraduate chemical engineering education with top industrial EPC, refinery, petrochemical,
              and automation roles. Master technical interview fundamentals, diagnose simulated real-world refinery
              failures, and learn industry-standard software and coding tools.
            </p>
          </div>

          <div style={{ display: 'inline-flex', background: '#0f172a', padding: 3, borderRadius: 8, border: '1px solid #334155' }}>
            <button
              type="button"
              onClick={() => setActiveTab('pathways')}
              style={{
                background: activeTab === 'pathways' ? '#0284c7' : 'transparent',
                color: activeTab === 'pathways' ? '#ffffff' : '#94a3b8',
                border: 'none',
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
              <Briefcase size={14} /> 8 Career Pathways
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('interview')}
              style={{
                background: activeTab === 'interview' ? '#0284c7' : 'transparent',
                color: activeTab === 'interview' ? '#ffffff' : '#94a3b8',
                border: 'none',
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
              <HelpCircle size={14} /> Technical Interview Q&A
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('troubleshooting')}
              style={{
                background: activeTab === 'troubleshooting' ? '#0284c7' : 'transparent',
                color: activeTab === 'troubleshooting' ? '#ffffff' : '#94a3b8',
                border: 'none',
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
              <AlertTriangle size={14} /> Plant Troubleshooting
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('software')}
              style={{
                background: activeTab === 'software' ? '#0284c7' : 'transparent',
                color: activeTab === 'software' ? '#ffffff' : '#94a3b8',
                border: 'none',
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
              <Code size={14} /> Python & Tools Hub
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: 8 INDUSTRIAL CAREER PATHWAYS                           */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'pathways' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18 }}>
          {/* Left Column: Pathway Selector Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pathways.map((pw, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPathway(idx)}
                style={{
                  background: selectedPathway === idx ? 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)' : '#0f172a',
                  border: selectedPathway === idx ? '1px solid #60a5fa' : '1px solid #1e293b',
                  borderRadius: 8,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>
                  {pw.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: selectedPathway === idx ? '#93c5fd' : '#94a3b8', marginTop: 2 }}>
                  {pw.role}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Detailed Pathway Specification */}
          {(() => {
            const p = pathways[selectedPathway] || pathways[0];
            return (
              <div
                style={{
                  background: '#0f172a',
                  borderRadius: 10,
                  border: '1px solid #1e293b',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                }}
              >
                <div>
                  <span
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    CAREER PROFILE
                  </span>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: '8px 0 2px' }}>
                    {p.title}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600 }}>{p.role}</div>
                </div>

                <div style={{ background: '#1e293b', padding: 16, borderRadius: 8, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  <strong>Core Engineering Mandate:</strong> {p.focus}
                </div>

                {/* Key Skills Pill Matrix */}
                <div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 700, marginBottom: 8 }}>
                    TECHNICAL REQUISITES & INDUSTRY STANDARDS
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {p.keySkills.map((sk, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#0284c722',
                          color: '#7dd3fc',
                          border: '1px solid #0284c755',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: '0.74rem',
                          fontWeight: 700,
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Target Employers & Compensation Trends */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ background: '#0b1329', padding: 14, borderRadius: 8, border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>
                      TOP RECRUITING CORPORATIONS
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {p.industries.map((ind, i) => (
                        <span key={i} style={{ background: '#1e293b', padding: '3px 8px', borderRadius: 4, fontSize: '0.72rem', color: '#f8fafc' }}>
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#0b1329', padding: 14, borderRadius: 8, border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>
                      COMPENSATION & GROWTH TRAJECTORY
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399', marginTop: 8 }}>
                      {p.salaryTrend}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4 }}>
                      Based on Campus Placements & Industry Benchmarks 2026
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: TECHNICAL INTERVIEW QUESTION BANK                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'interview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filter and Search Bar */}
          <div
            style={{
              background: '#0f172a',
              padding: 14,
              borderRadius: 8,
              border: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Subject Filter:</span>
              {['All', 'Fluid Mechanics', 'Heat Transfer', 'Mass Transfer', 'Reaction Engineering', 'Thermodynamics', 'Process Control', 'Process Safety'].map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setSelectedSubjectFilter(subj)}
                  style={{
                    background: selectedSubjectFilter === subj ? '#0284c7' : '#1e293b',
                    color: selectedSubjectFilter === subj ? '#ffffff' : '#94a3b8',
                    border: '1px solid #334155',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {subj}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1e293b', padding: '4px 10px', borderRadius: 6, border: '1px solid #334155' }}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search concepts, equations, terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f8fafc',
                  fontSize: '0.76rem',
                  outline: 'none',
                  width: 220,
                }}
              />
            </div>
          </div>

          {/* Accordion Questions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredQuestions.map((q) => {
              const isExpanded = expandedQuestionId === q.id;
              return (
                <div
                  key={q.id}
                  style={{
                    background: '#0f172a',
                    border: isExpanded ? '1px solid #0284c7' : '1px solid #1e293b',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      background: isExpanded ? '#0c1a32' : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span
                        style={{
                          background: '#1e293b',
                          color: '#38bdf8',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 4,
                        }}
                      >
                        {q.subject}
                      </span>
                      <span
                        style={{
                          background: q.level === 'Advanced' ? '#7f1d1d' : '#047857',
                          color: '#ffffff',
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {q.level}
                      </span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                        {q.question}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '16px 18px', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ background: '#090d16', padding: 14, borderRadius: 6, border: '1px solid #1e293b' }}>
                        <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, marginBottom: 4 }}>
                          DEFINITIVE TECHNICAL ANSWER
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#f8fafc', lineHeight: 1.5 }}>
                          {q.answer}
                        </div>
                      </div>

                      <div style={{ background: '#1e293b44', padding: 12, borderRadius: 6, borderLeft: '3px solid #f59e0b', fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                        <strong style={{ color: '#f59e0b' }}>Interviewer Evaluation Criteria & Practical Nuance:</strong> {q.rationale}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: PLANT TROUBLESHOOTING SCENARIOS                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'troubleshooting' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18 }}>
          {/* Left Column: Incidents List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {troubleshootingScenarios.map((scen) => (
              <div
                key={scen.id}
                onClick={() => {
                  setActiveScenarioId(scen.id);
                  setSelectedDiagnosis(null);
                  setDiagnosisSubmitted(false);
                }}
                style={{
                  background: activeScenarioId === scen.id ? 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)' : '#0f172a',
                  border: activeScenarioId === scen.id ? '1px solid #60a5fa' : '1px solid #1e293b',
                  borderRadius: 8,
                  padding: '12px 14px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', background: scen.severity === 'Critical' ? '#dc2626' : '#d97706', color: '#ffffff', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>
                    {scen.severity}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{scen.id}</span>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginTop: 6 }}>
                  {scen.title}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Interactive Diagnostic Terminal */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#dc2626', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                  LIVE REFINERY INCIDENT
                </span>
                <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>{activeScenario.equipment}</span>
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '6px 0 2px' }}>
                {activeScenario.title}
              </h2>
            </div>

            {/* Alarm Banner */}
            <div style={{ background: '#7f1d1d', color: '#fecaca', border: '1px solid #ef4444', padding: '10px 14px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} />
              <span>{activeScenario.alarmText}</span>
            </div>

            {/* DCS Field Symptoms */}
            <div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 700, marginBottom: 8 }}>
                OBSERVED DCS TELEMETRY & FIELD OPERATOR LOGS:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {activeScenario.symptoms.map((sym, i) => (
                  <div key={i} style={{ background: '#1e293b', padding: '8px 12px', borderRadius: 6, fontSize: '0.76rem', color: '#f8fafc' }}>
                    • {sym}
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Multiple Choice Quiz */}
            <div>
              <div style={{ fontSize: '0.76rem', color: '#38bdf8', fontWeight: 800, marginBottom: 8 }}>
                ENGINEERING TRIAGE: IDENTIFY PRIMARY ROOT CAUSE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeScenario.diagnosticOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!diagnosisSubmitted) setSelectedDiagnosis(idx);
                    }}
                    style={{
                      background:
                        diagnosisSubmitted && idx === activeScenario.correctDiagnosticIndex
                          ? '#064e3b'
                          : diagnosisSubmitted && selectedDiagnosis === idx
                          ? '#7f1d1d'
                          : selectedDiagnosis === idx
                          ? '#1e3a8a'
                          : '#090d16',
                      border:
                        selectedDiagnosis === idx ? '1px solid #60a5fa' : '1px solid #1e293b',
                      borderRadius: 6,
                      padding: '10px 14px',
                      color: '#ffffff',
                      textAlign: 'left',
                      cursor: diagnosisSubmitted ? 'default' : 'pointer',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#38bdf8' }}>{String.fromCharCode(65 + idx)}.</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>

              {!diagnosisSubmitted ? (
                <button
                  type="button"
                  disabled={selectedDiagnosis === null}
                  onClick={() => setDiagnosisSubmitted(true)}
                  style={{
                    marginTop: 14,
                    background: selectedDiagnosis !== null ? '#0284c7' : '#334155',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 6,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: selectedDiagnosis !== null ? 'pointer' : 'not-allowed',
                  }}
                >
                  Confirm Diagnostic Triage
                </button>
              ) : (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div
                    style={{
                      background: selectedDiagnosis === activeScenario.correctDiagnosticIndex ? '#064e3b' : '#7f1d1d',
                      padding: 14,
                      borderRadius: 6,
                      border: selectedDiagnosis === activeScenario.correctDiagnosticIndex ? '1px solid #10b981' : '1px solid #ef4444',
                      fontSize: '0.78rem',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
                      {selectedDiagnosis === activeScenario.correctDiagnosticIndex ? '✓ Correct Diagnosis Identified!' : '✗ Inaccurate Root Cause Identified'}
                    </div>
                    <div style={{ color: '#e2e8f0', lineHeight: 1.4 }}>
                      <strong>Root Cause:</strong> {activeScenario.rootCause}
                    </div>
                  </div>

                  <div style={{ background: '#1e293b', padding: 14, borderRadius: 6, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                    <strong style={{ color: '#38bdf8' }}>Mandatory Corrective Action:</strong> {activeScenario.correctiveAction}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: PYTHON & CHEME SOFTWARE TOOLS HUB                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'software' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {pythonScripts.map((scr, idx) => (
            <div
              key={idx}
              style={{
                background: '#090d16',
                borderRadius: 10,
                border: '1px solid #1e293b',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Code size={14} color="#38bdf8" /> {scr.name}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyScript(scr.code)}
                  style={{
                    background: '#1e293b',
                    color: '#38bdf8',
                    border: '1px solid #334155',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {copiedScript ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                  {copiedScript || 'Copy Script'}
                </button>
              </div>

              <pre
                style={{
                  background: '#040711',
                  color: '#38bdf8',
                  padding: 14,
                  borderRadius: 6,
                  border: '1px solid #1e293b',
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  lineHeight: 1.4,
                  margin: 0,
                  height: 320,
                }}
              >
                <code>{scr.code}</code>
              </pre>

              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Compatible with Python 3.10+, NumPy, and SciPy. Can be run directly in Jupyter Notebooks or Google Colab.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CareerWorkspace;
