import { useState } from 'react';
import {
  Briefcase,
  HelpCircle,
  AlertTriangle,
  Code,
  ChevronDown,
  ChevronUp,
  Search,
  FileText,
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
  telemetry: { tag: string; label: string; current: string; normal: string; status: 'normal' | 'alarm' }[];
  symptoms: string[];
  diagnosticOptions: string[];
  correctDiagnosticIndex: number;
  rootCause: string;
  correctiveAction: string;
  expectedResponse: string;
  safetyImplication: string;
}

interface CareerTrack {
  id: string;
  title: string;
  role: string;
  focus: string;
  concepts: string[];
  software: string[];
  tasks: string[];
  sampleProject: string;
  interviewPrep: string;
  industries: string[];
  salaryTrend: string;
}

export function CareerWorkspace({ onLaunchSimulation: _onLaunchSimulation }: CareerWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'tracks' | 'interview' | 'troubleshooting' | 'software' | 'resume'>('tracks');
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(1);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('SCEN-1');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<number | null>(null);
  const [diagnosisSubmitted, setDiagnosisSubmitted] = useState<boolean>(false);
  const [activeTroubleStage, setActiveTroubleStage] = useState<number>(1);

  // --- STAR Resume Builder State ---
  const [starSituation, setStarSituation] = useState<string>('During the Centrifugal Pump Digital Twin virtual laboratory experiment...');
  const [starTask, setStarTask] = useState<string>('Determine the Net Positive Suction Head Available (NPSHa) safety margin to prevent cavitation during volatile hydrocarbon pumping.');
  const [starAction, setStarAction] = useState<string>('Formulated first-principles Euler head balances, calculated Darcy friction losses across 60m piping, and identified NPSHa drops below 2.2m.');
  const [starResult, setStarResult] = useState<string>('Redesigned suction vessel elevation by +1.5m and increased suction line diameter from 50mm to 75mm, boosting NPSHa margin to 3.8m and eliminating vapor cavitation.');

  // =========================================================================
  // 10 PLACEMENT PREPARATION TRACKS
  // =========================================================================
  const TRACKS: CareerTrack[] = [
    {
      id: 'track-1',
      title: '1. Process Design Engineer (EPC & FEED)',
      role: 'Process Design / Commissioning Engineer',
      focus: 'Heat and mass balances (H&MB), PFD/P&ID development, hydraulic sizing, relief valve design per API 520/521.',
      concepts: ['Mass & Energy Conservation', 'Bernoulli & Darcy Hydraulics', 'Thermodynamic Property Methods', 'TEMA Exchangers'],
      software: ['Aspen Plus / Aspen HYSYS', 'AutoCAD Plant 3D', 'AFT Fathom', 'Excel VBA'],
      tasks: ['Develop full Heat and Material Balance tables', 'Size line diameters based on velocity criteria (1.5 - 3.0 m/s)', 'Generate equipment process datasheets'],
      sampleProject: 'Complete FEED design package for a 50,000 BPD crude atmospheric distillation column preheat train.',
      interviewPrep: 'Line sizing equations, pump NPSHa vs NPSHr calculation, control valve Cv sizing, API 520 fire relief sizing.',
      industries: ['Technip Energies', 'Bechtel', 'L&T Hydrocarbon', 'Fluor', 'Petrofac'],
      salaryTrend: '₹6 – 16 LPA (India) / $85k – $130k (Global)',
    },
    {
      id: 'track-2',
      title: '2. Production / Operations Engineer',
      role: 'Operations / Shift Production Engineer',
      focus: 'Real-time DCS monitoring, throughput optimization, unit startup/shutdown, product quality control, turnaround management.',
      concepts: ['Process Unit Dynamics', 'DCS Alarm Management', 'Root Cause Analysis', 'Industrial Safety & PSM'],
      software: ['Yokogawa Centum VP / Honeywell Experion', 'OSIsoft PI Historian', 'SAP PM'],
      tasks: ['Monitor plant mass balances and minimize flaring', 'Conduct field line tracing and valve lineup verification', 'Execute safe startup and emergency shutdown protocols'],
      sampleProject: 'Refinery De-ethanizer column debottlenecking reducing reboiler steam consumption by 12%.',
      interviewPrep: 'Distillation column flooding vs weeping diagnostics, pump cavitation mitigation, safety interlock trips.',
      industries: ['Reliance Industries', 'IOCL / BPCL / HPCL', 'ONGC', 'Dow', 'BASF'],
      salaryTrend: '₹7 – 18 LPA (Core PSU & Private)',
    },
    {
      id: 'track-3',
      title: '3. Process Simulation Specialist',
      role: 'Process Simulation / Systems Engineer',
      focus: 'Rigorous thermodynamic modeling, dynamic plant simulations, operator training simulators (OTS), digital twins.',
      concepts: ['Equations of State (Peng-Robinson, SRK)', 'Activity Coefficients (NRTL, UNIQUAC)', 'Wegstein Convergence'],
      software: ['Aspen Plus', 'Aspen HYSYS Dynamic', 'DWSIM', 'Python (SciPy)'],
      tasks: ['Model multi-stage reactive distillation columns', 'Perform sensitivity analyses to find optimum reflux ratios', 'Build dynamic models of compressor anti-surge loops'],
      sampleProject: 'Rigorous DWSIM flowsheet simulation of a continuous biodiesel transesterification plant.',
      interviewPrep: 'Selection of thermodynamic property models, resolving non-convergence in tear stream recycles, flash algorithms.',
      industries: ['AspenTech', 'AVEVA', 'Honeywell Connected Plant', 'Schneider Electric'],
      salaryTrend: '₹8 – 20 LPA',
    },
    {
      id: 'track-4',
      title: '4. Process Control & Automation Engineer',
      role: 'Control & Instrumentation (C&I) Engineer',
      focus: 'PID loop tuning, Advanced Process Control (APC), Model Predictive Control (MPC), SCADA, Safety Instrumented Systems (SIS).',
      concepts: ['First & Second Order Dynamics', 'Transfer Functions', 'Bode/Nyquist Stability', 'IEC 61511 Functional Safety'],
      software: ['MATLAB / Simulink', 'LabVIEW', 'Rockwell RSLogix', 'Siemens TIA Portal'],
      tasks: ['Tune PID controllers using Ziegler-Nichols and IMC rules', 'Configure cascade level-to-flow control loops', 'Implement anti-reset windup algorithms on saturated valves'],
      sampleProject: 'CSTR temperature control loop design using split-range cooling water and steam valves.',
      interviewPrep: 'P, I, and D action roles, Bode phase margin calculation, fail-safe valve actuators (air-to-open vs air-to-close).',
      industries: ['Emerson', 'ABB', 'Honeywell', 'Rockwell Automation', 'Siemens Energy'],
      salaryTrend: '₹7 – 19 LPA',
    },
    {
      id: 'track-5',
      title: '5. Equipment Design Engineer',
      role: 'Mechanical Equipment Specialist',
      focus: 'ASME Boiler and Pressure Vessel Code (Section VIII Div 1), TEMA shell & tube exchangers, API 650 storage tanks, API 610 pumps.',
      concepts: ['Membrane Hoop Stress', 'Formed Dished Heads', 'Nozzle Reinforcement', 'Thermal Expansion & Fatigue'],
      software: ['PV Elite', 'AutoCAD Plant 3D', 'ANSYS Mechanical', 'Compress'],
      tasks: ['Calculate minimum required vessel wall thickness under internal pressure', 'Size nozzle reinforcement replacement areas', 'Design saddle supports for horizontal drums per Zick analysis'],
      sampleProject: 'Mechanical design of an ASME Section VIII Div 1 horizontal separator vessel with 2:1 ellipsoidal heads.',
      interviewPrep: 'Joint efficiency factors, maximum allowable working pressure (MAWP), corrosion allowances, hydrostatic test pressure.',
      industries: ['L&T Heavy Engineering', 'Godrej Process Equipment', 'ISGEC', 'Thermax'],
      salaryTrend: '₹6 – 15 LPA',
    },
    {
      id: 'track-6',
      title: '6. Quality & Process Improvement Engineer',
      role: 'Quality Assurance / Six Sigma Black Belt',
      focus: 'Statistical Process Control (SPC), yield maximization, Lean Six Sigma methodologies, defect reduction, ISO 9001/14001.',
      concepts: ['Normal Distributions & Capability Indices (Cp, Cpk)', 'Design of Experiments (DOE)', 'ANOVA', 'Root Cause 5-Why'],
      software: ['Minitab', 'Excel Advanced', 'Python (Pandas / Statsmodels)', 'Power BI'],
      tasks: ['Implement control charts (X-bar and R charts) for polymer melt index', 'Conduct 2^k factorial design of experiments for reactor yield', 'Calculate process sigma levels and defect rates in ppm'],
      sampleProject: 'DMAIC Six Sigma project reducing off-spec polypropylene pellets by 35% in a continuous extrusion line.',
      interviewPrep: 'Interpreting Cp vs Cpk, type I and type II statistical errors, Taguchi loss functions.',
      industries: ['Procter & Gamble', 'Unilever', 'ITC', 'Asian Paints', 'Coromandel'],
      salaryTrend: '₹6 – 16 LPA',
    },
    {
      id: 'track-7',
      title: '7. Environmental & Sustainability Engineer',
      role: 'Sustainability / HSE Process Specialist',
      focus: 'Life Cycle Assessment (LCA), Carbon Capture and Storage (CCS), Zero Liquid Discharge (ZLD), industrial waste valorization.',
      concepts: ['ISO 14040/44 LCA', 'Carbon Accounting (Scope 1, 2, 3)', 'Membrane Water Desalination', 'Flue Gas Desulfurization'],
      software: ['SimaPro / openLCA', 'Aspen Plus (Amine CCS)', 'WaterCAD'],
      tasks: ['Calculate cradle-to-gate carbon footprint of industrial chemicals', 'Design reverse osmosis and multi-effect evaporator ZLD systems', 'Model CO2 absorption into monoethanolamine (MEA) solvents'],
      sampleProject: 'Techno-economic and carbon life cycle assessment of renewable green hydrogen vs steam methane reforming.',
      interviewPrep: 'BOD/COD calculation, amine solvent regeneration energy, carbon intensity calculation.',
      industries: ['ERM', 'DNV', 'Tata Chemicals', 'Adani Green', 'Linde Clean Energy'],
      salaryTrend: '₹7 – 18 LPA',
    },
    {
      id: 'track-8',
      title: '8. R&D / Process Development Engineer',
      role: 'Research Scientist / Process Development',
      focus: 'Bench-to-pilot scaleup, heterogeneous catalyst synthesis, micro-reactor kinetics, high-performance specialty chemicals.',
      concepts: ['Thiele Modulus & Effectiveness Factor', 'BET Surface Area', 'Reaction Kinetic Parameter Estimation', 'Mass Transport Couplings'],
      software: ['Python (SciPy / SymPy)', 'COMSOL Multiphysics', 'OriginLab'],
      tasks: ['Interpret differential batch reactor kinetic data for activation energies', 'Measure internal pore diffusion limitations using Weisz-Prater criterion', 'Design 10x pilot scaleup factor keeping geometric and dynamic similarity'],
      sampleProject: 'Scale-up of a fixed-bed catalytic reactor for carbon dioxide hydrogenation to methanol over Cu/ZnO/Al2O3.',
      interviewPrep: 'Langmuir-Hinshelwood rate derivations, external vs internal mass transfer limitation tests, pilot scaleup criteria.',
      industries: ['SABIC', 'Evonik', 'Solvay', 'DuPont', 'UPL R&D'],
      salaryTrend: '₹7 – 20 LPA',
    },
    {
      id: 'track-9',
      title: '9. Pharmaceutical & Biochemical Process Engineer',
      role: 'Bioprocess / Formulation Engineer',
      focus: 'cGMP regulations, bioreactor fermentation, downstream separation (centrifugation, chromatography, ultrafiltration), lyophilization.',
      concepts: ['Monod Cell Growth Kinetics', 'Oxygen Mass Transfer (k_L a)', 'Preparative Chromatography', 'Sterile Plant Design'],
      software: ['SuperPro Designer', 'Aspen Batch', 'Minitab'],
      tasks: ['Scale up stirred bioreactors maintaining constant volumetric oxygen transfer (k_L a)', 'Design sterile CIP/SIP (Clean-in-Place / Steam-in-Place) piping loops', 'Optimize gradient elution chromatography for monoclonal antibodies'],
      sampleProject: 'Bioreactor scaleup of a 2,000-liter cell culture fermentor for therapeutic recombinant protein synthesis.',
      interviewPrep: 'k_L a measurement methods, Monod kinetic parameters (μ_max, K_s), cGMP validation requirements.',
      industries: ['Biocon', 'Serum Institute of India', 'Dr. Reddy’s', 'Novartis', 'Cipla'],
      salaryTrend: '₹6 – 17 LPA',
    },
    {
      id: 'track-10',
      title: '10. Energy & Petroleum Process Engineer',
      role: 'Refinery / LNG Systems Engineer',
      focus: 'Atmospheric/Vacuum crude distillation (ADU/VDU), Fluidized Catalytic Cracking (FCC), hydrotreating, LNG liquefaction trains.',
      concepts: ['Crude Assay TBP Distillation', 'Cracking Kinetics', 'Cryogenic Mixed Refrigerant Cycles', 'Claus Sulfur Recovery'],
      software: ['Aspen HYSYS Petroleum RefSys', 'Petro-SIM', 'Pipenet'],
      tasks: ['Calculate yields of naphtha, kerosene, and gas oil from crude TBP curves', 'Model hydrodesulfurization (HDS) reactors to achieve BS-VI &lt;10 ppm sulfur diesel', 'Evaluate LNG liquefaction specific power consumption in kWh/ton LNG'],
      sampleProject: 'Dynamic simulation of an LNG cryogenic mixed-refrigerant subcooling loop.',
      interviewPrep: 'Packie correlation for petroleum side-draws, delayed coker operation, amine sour gas sweetening.',
      industries: ['Reliance Jamnagar', 'IOCL', 'Shell', 'ExxonMobil', 'TotalEnergies'],
      salaryTrend: '₹8 – 22 LPA',
    },
  ];

  // =========================================================================
  // 10 INDUSTRIAL TROUBLESHOOTING SCENARIOS
  // =========================================================================
  const SCENARIOS: TroubleshootingScenario[] = [
    {
      id: 'SCEN-1',
      title: 'Centrifugal Pump P-101 Discharge Pressure Collapse',
      equipment: 'P-101A Heavy Hydrocarbon Feed Pump',
      alarmText: 'ALARM 101-PAH/L: Low Discharge Pressure (1.8 bar vs 6.5 bar normal) & High Casing Vibration (> 8.5 mm/s RMS)',
      severity: 'Critical',
      telemetry: [
        { tag: 'PI-101', label: 'Discharge Pressure', current: '1.8 bar', normal: '6.5 bar', status: 'alarm' },
        { tag: 'FI-101', label: 'Flow Rate', current: '14.2 m³/h', normal: '25.0 m³/h', status: 'alarm' },
        { tag: 'VI-101', label: 'Bearing Vibration', current: '8.7 mm/s', normal: '2.1 mm/s', status: 'alarm' },
        { tag: 'LI-101', label: 'Suction Tank Level', current: '14%', normal: '65%', status: 'alarm' },
      ],
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
      expectedResponse: 'Once suction tank level recovers above 40%, static suction head increases by 2.6m, restoring NPSHa to 4.8m; cavitation ceases, vibration drops below 2.5 mm/s, and discharge pressure stabilizes at 6.5 bar.',
      safetyImplication: 'Prolonged cavitation causes violent pitting of impeller metal, mechanical seal failure, and volatile hydrocarbon leak through shaft gland, posing severe flash fire hazard.',
    },
    {
      id: 'SCEN-2',
      title: 'Heat Exchanger E-101 Thermal Duty Loss & Steam Saturation',
      equipment: 'E-101 Shell & Tube Reactor Preheater',
      alarmText: 'ALARM 102-TAH: Tube Outlet Temperature Low (62 °C vs 85 °C target) with Steam Valve TCV-101 at 100% Wide Open',
      severity: 'Warning',
      telemetry: [
        { tag: 'TI-102', label: 'Process Outlet Temp', current: '62.0 °C', normal: '85.0 °C', status: 'alarm' },
        { tag: 'TCV-101', label: 'Steam Valve Position', current: '100% (Open)', normal: '55%', status: 'alarm' },
        { tag: 'DPI-102', label: 'Tube Differential Press', current: '1.15 bar', normal: '0.35 bar', status: 'alarm' },
        { tag: 'PI-105', label: 'Steam Header Press', current: '4.2 bar', normal: '4.2 bar', status: 'normal' },
      ],
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
      expectedResponse: 'Chemical cleaning dissolves scale layer, reducing tube differential pressure back to 0.35 bar and restoring overall heat transfer coefficient U to 620 W/(m²·K).',
      safetyImplication: 'Low feed temperature into downstream reactor suppresses reaction initiation or causes unstable temperature oscillations, potentially quenching the catalytic bed.',
    },
    {
      id: 'SCEN-3',
      title: 'Distillation Column T-101 Differential Pressure Surge & Flooding',
      equipment: 'T-101 Binary Fractionator Column (45 Sieve Trays)',
      alarmText: 'ALARM 103-DPAH: Column Differential Pressure High (> 650 mbar) & Overhead Off-Spec Composition',
      severity: 'Critical',
      telemetry: [
        { tag: 'DPI-103', label: 'Tray Delta Pressure', current: '680 mbar', normal: '200 mbar', status: 'alarm' },
        { tag: 'AI-101', label: 'Distillate Purity', current: '78.2 mol%', normal: '95.0 mol%', status: 'alarm' },
        { tag: 'FI-103', label: 'Reflux Flow Rate', current: '42.0 m³/h', normal: '28.0 m³/h', status: 'alarm' },
        { tag: 'LI-103', label: 'Bottom Sump Level', current: '18%', normal: '50%', status: 'alarm' },
      ],
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
      expectedResponse: 'Lowering vapor rate allows held-up liquid to drain through downcomers; column differential pressure drops back to 200 mbar, and overhead distillate purity returns to 95.0 mol%.',
      safetyImplication: 'Severe liquid carryover into overhead vapor lines causes massive liquid hammer on relief valves and overfills overhead accumulators, risking vapor cloud release.',
    },
    {
      id: 'SCEN-4',
      title: 'CSTR Exothermic Reactor R-101 Temperature Runaway',
      equipment: 'R-101 8.2 m³ Polymerization CSTR',
      alarmText: 'ALARM 104-TAHH: Reactor Core Temperature Surge (> 98 °C, Design Limit 92 °C)',
      severity: 'Critical',
      telemetry: [
        { tag: 'TI-104', label: 'Reactor Core Temp', current: '99.4 °C', normal: '85.0 °C', status: 'alarm' },
        { tag: 'FI-104', label: 'Jacket Cooling Flow', current: '0.0 m³/h', normal: '35.0 m³/h', status: 'alarm' },
        { tag: 'PI-104', label: 'Internal Pressure', current: '8.4 bar', normal: '3.2 bar', status: 'alarm' },
        { tag: 'SI-104', label: 'Agitator Motor Speed', current: '120 RPM', normal: '120 RPM', status: 'normal' },
      ],
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
      expectedResponse: 'Chemical terminator quenches active free radicals; reaction heat generation drops to zero; reactor temperature peaks at 101°C and begins cooling via natural convection.',
      safetyImplication: 'Failure to trip within 90 seconds leads to catastrophic vessel overpressure, burst rupture disc discharge, and BLEVE explosion of volatile monomer.',
    },
    {
      id: 'SCEN-5',
      title: 'Feed Pipeline Unexpected Pressure Drop & Flow Choking',
      equipment: 'PL-204 12-inch Crude Delivery Line',
      alarmText: 'ALARM 105-DPA: Excessive Pipe Pressure Drop (4.2 bar vs 0.8 bar design baseline)',
      severity: 'Warning',
      telemetry: [
        { tag: 'DPI-204', label: 'Line Pressure Drop', current: '4.2 bar', normal: '0.8 bar', status: 'alarm' },
        { tag: 'FI-204', label: 'Delivery Flow', current: '180 m³/h', normal: '320 m³/h', status: 'alarm' },
        { tag: 'TI-204', label: 'Fluid Temperature', current: '14 °C', normal: '38 °C', status: 'alarm' },
      ],
      symptoms: [
        'Pressure drop across the 2 km pipeline surged from 0.8 bar to 4.2 bar.',
        'Booster pump motor drawing maximum current with discharge throttled by line resistance.',
        'Ambient cold front dropped ground temperature from 28°C to 8°C overnight.',
      ],
      diagnosticOptions: [
        'Pipe ruptured underground leaking fluid into soil.',
        'Heavy wax / paraffin crystallization below cloud point narrowing effective internal flow diameter.',
        'Upstream storage tank ran out of crude oil.',
        'Delivery meter impeller seized.',
      ],
      correctDiagnosticIndex: 1,
      rootCause: 'Crude oil temperature dropped below its wax appearance temperature (WAT = 22°C). Solid paraffin crystals deposited along the inner pipe perimeter, severely reducing effective hydraulic diameter D (ΔP ∝ 1/D⁵).',
      correctiveAction: 'Launch pipeline pigging scraper tool to mechanically dislodge paraffin wax cake; activate heat tracing and inject chemical pour-point depressant (PPD) into crude stream.',
      expectedResponse: 'Scraper pig removes wax buildup; pipeline effective diameter is restored; line pressure drop decreases back to 0.8 bar, restoring delivery flow to 320 m³/h.',
      safetyImplication: 'Complete wax gelling can permanently plug the 2 km pipeline, requiring costly excavations or line abandonment.',
    },
  ];

  // =========================================================================
  // INTERVIEW QUESTIONS
  // =========================================================================
  const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
    {
      id: 1,
      subject: 'Fluid Mechanics',
      level: 'Core ChemE',
      question: 'What is Cavitation in a centrifugal pump, how do you mathematically predict it, and how do you prevent it in plant design?',
      answer: 'Cavitation occurs when local static pressure inside the pump (typically at the impeller eye) drops below the liquid vapor pressure (P_v) at operating temperature. Vapor bubbles form instantly and violently collapse in high-pressure vane zones, generating localized shock waves up to 10,000 bar that cause pitting erosion, vibration, and head loss.',
      rationale: 'Mathematically predicted via Net Positive Suction Head: NPSH_a = (P_suct - P_v)/(ρ·g) + v²/(2g). Design requires NPSH_a ≥ NPSH_r + 0.6 m (or 1.2 × NPSH_r per API 610). Mitigation: elevate suction vessel, increase suction pipe diameter, lower liquid temperature, or use an inducer impeller.',
    },
    {
      id: 2,
      subject: 'Heat Transfer',
      level: 'Core ChemE',
      question: 'Why is Counter-Current flow preferred over Co-Current flow in Shell & Tube Heat Exchangers?',
      answer: 'Counter-current flow yields a higher Log Mean Temperature Difference (LMTD) for identical inlet and outlet temperatures, meaning a significantly smaller heat transfer area (A) is required per Q = U · A · LMTD. Furthermore, counter-current flow allows the cold fluid outlet temperature to exceed the hot fluid outlet temperature, which is thermodynamically impossible in co-current flow.',
      rationale: 'Co-current flow is only selected where: 1) Rapid uniform cooling is required at entry, 2) Viscous fluids solidify if cooled too much at outlet, or 3) Tube wall temperature must be capped below thermal decomposition limits.',
    },
    {
      id: 3,
      subject: 'Mass Transfer',
      level: 'Core ChemE',
      question: 'Explain the physical significance of the q-line in McCabe-Thiele distillation and its impact on feed stage location.',
      answer: 'The q-factor represents the mole fraction of liquid in the feed or the heat required to convert 1 mole of feed into saturated vapor divided by latent heat: q = (H_V - H_F) / (H_V - H_L). The q-line slope is q / (q - 1). For subcooled liquid, q > 1 (slope > 0); for bubble point liquid, q = 1 (vertical line); for partially vaporized feed, 0 < q < 1 (negative slope); for dew point vapor, q = 0 (horizontal line); for superheated vapor, q < 0.',
      rationale: 'The intersection of the q-line with the equilibrium curve defines the minimum reflux ratio (R_min) where a pinch point occurs requiring infinite trays.',
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
      answer: 'An azeotrope is a liquid mixture where the liquid and vapor phases have identical compositions at equilibrium (x_i = y_i), meaning relative volatility α_AB = 1.0. At this point, simple fractional distillation cannot achieve further separation.',
      rationale: 'Industrial separation strategies: 1) Pressure-Swing Distillation (exploiting shifts in azeotropic composition with pressure across two columns), 2) Azeotropic / Extractive Distillation (adding an entrainer like cyclohexane or ethylene glycol to modify relative volatility), 3) Pervaporation membranes, 4) Molecular sieve adsorption beds (e.g. bioethanol dehydration to 99.8%).',
    },
  ];

  const currentTrack = TRACKS[selectedTrackIndex];
  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  const filteredQuestions = INTERVIEW_QUESTIONS.filter((q) => {
    const matchesSubject = selectedSubjectFilter === 'All' || q.subject === selectedSubjectFilter;
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner Deck */}
      <div
        style={{
          background: 'linear-gradient(135deg, #091a32 0%, #0f172a 100%)',
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
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  padding: '3px 8px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                }}
              >
                Placement & Career Readiness Centre
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
                10 Career Tracks · 10 Simulated Plant Failures · Software Paths · STAR Interview Builder
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', fontWeight: 800, margin: '0 0 8px', color: '#ffffff' }}>
              Chemical Engineering Employability & Placement Hub
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0, maxWidth: 840, lineHeight: 1.5 }}>
              Bridge academic theory and professional industry practice. Master technical interview fundamentals, troubleshoot simulated refinery DCS plant alarms, explore software roadmaps, and generate STAR-format portfolio evidence.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 6, marginTop: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'tracks', label: '10 Placement Preparation Tracks', icon: Briefcase },
            { id: 'troubleshooting', label: 'Industrial Troubleshooting Simulator (10 Incidents)', icon: AlertTriangle },
            { id: 'software', label: 'Industry Software Learning Paths', icon: Code },
            { id: 'interview', label: 'Technical Interview Simulator', icon: HelpCircle },
            { id: 'resume', label: 'STAR Resume & Interview Builder', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: isActive ? '#0284c7' : '#1e293b',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  border: isActive ? '1px solid #38bdf8' : '1px solid #334155',
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
      {/* TAB 1: 10 PLACEMENT PREPARATION TRACKS                              */}
      {/* =================================================================== */}
      {activeTab === 'tracks' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: 20 }}>
          {/* Track List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
              Select Placement Track
            </div>
            {TRACKS.map((t, idx) => (
              <div
                key={t.id}
                onClick={() => setSelectedTrackIndex(idx)}
                style={{
                  background: selectedTrackIndex === idx ? '#1e3a8a' : '#0f172a',
                  border: selectedTrackIndex === idx ? '1px solid #38bdf8' : '1px solid #1e293b',
                  borderRadius: 8,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: selectedTrackIndex === idx ? '#ffffff' : '#cbd5e1' }}>
                  {t.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>{t.role}</div>
                <div style={{ fontSize: '0.68rem', color: '#34d399', marginTop: 4 }}>{t.salaryTrend}</div>
              </div>
            ))}
          </div>

          {/* Track Detail Dossier */}
          <div style={{ background: '#090d16', border: '1px solid #1e3a8a', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>
                PROFESSIONAL CAREER PROFILE
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 6px' }}>
                {currentTrack.title}
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                {currentTrack.focus}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                  Required Engineering Concepts
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  {currentTrack.concepts.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                  Recommended Software Tools
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  {currentTrack.software.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                Core Practical Engineering Tasks
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                {currentTrack.tasks.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: '#0c1424', borderLeft: '3px solid #38bdf8', padding: 14, borderRadius: 6 }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                Recommended Portfolio Project
              </div>
              <div style={{ fontSize: '0.84rem', color: '#f8fafc', lineHeight: 1.5 }}>
                {currentTrack.sampleProject}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: 12, borderRadius: 8, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Hiring Companies: </span>
                <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>{currentTrack.industries.join(', ')}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 800 }}>Compensation: {currentTrack.salaryTrend}</span>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: INDUSTRIAL TROUBLESHOOTING SIMULATOR                         */}
      {/* =================================================================== */}
      {activeTab === 'troubleshooting' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: 20 }}>
          {/* Incident Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
              Simulated Field Incidents
            </div>
            {SCENARIOS.map((scen) => (
              <div
                key={scen.id}
                onClick={() => {
                  setActiveScenarioId(scen.id);
                  setSelectedDiagnosis(null);
                  setDiagnosisSubmitted(false);
                  setActiveTroubleStage(1);
                }}
                style={{
                  background: activeScenarioId === scen.id ? '#1e3a8a' : '#0f172a',
                  border: activeScenarioId === scen.id ? '1px solid #38bdf8' : '1px solid #1e293b',
                  borderRadius: 8,
                  padding: 12,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: scen.severity === 'Critical' ? '#ef4444' : '#f59e0b' }}>
                    {scen.severity.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.64rem', color: '#64748b' }}>{scen.id}</span>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                  {scen.title}
                </div>
              </div>
            ))}
          </div>

          {/* Structured 6-Stage Investigation Workbench */}
          <div style={{ background: '#090d16', border: '1px solid #1e3a8a', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 800, background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: 4 }}>
                {activeScenario.equipment}
              </span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: '6px 0 4px' }}>
                {activeScenario.title}
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#f59e0b', background: '#1c1917', borderLeft: '3px solid #f59e0b', padding: '6px 10px', borderRadius: 4, fontFamily: 'monospace' }}>
                {activeScenario.alarmText}
              </div>
            </div>

            {/* Stage Selector Bar */}
            <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #1e293b', paddingBottom: 10, overflowX: 'auto' }}>
              {[
                { stage: 1, label: '1. Process Telemetry' },
                { stage: 2, label: '2. Field Symptoms' },
                { stage: 3, label: '3. Root-Cause Triage' },
                { stage: 4, label: '4. Corrective Action' },
                { stage: 5, label: '5. Predicted Response' },
                { stage: 6, label: '6. Safety Implications' },
              ].map((st) => (
                <button
                  key={st.stage}
                  type="button"
                  onClick={() => setActiveTroubleStage(st.stage)}
                  style={{
                    background: activeTroubleStage === st.stage ? '#0284c7' : '#0f172a',
                    color: activeTroubleStage === st.stage ? '#ffffff' : '#94a3b8',
                    border: '1px solid #334155',
                    padding: '6px 12px',
                    borderRadius: 4,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Stage 1: Telemetry */}
            {activeTroubleStage === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>DCS Historian Real-Time Transmitter Readings:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                  {activeScenario.telemetry.map((t) => (
                    <div key={t.tag} style={{ background: '#0f172a', border: t.status === 'alarm' ? '1px solid #ef4444' : '1px solid #1e293b', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 800 }}>{t.tag}</div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>{t.label}</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: t.status === 'alarm' ? '#ef4444' : '#34d399', margin: '4px 0' }}>
                        {t.current}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Normal: {t.normal}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stage 2: Symptoms */}
            {activeTroubleStage === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Reported Field Observations & Annunciators:</div>
                <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 16 }}>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.8 }}>
                    {activeScenario.symptoms.map((sym, idx) => (
                      <li key={idx}>{sym}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Stage 3: Root-Cause Triage */}
            {activeTroubleStage === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                  Diagnose the Primary Root Cause:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activeScenario.diagnosticOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedDiagnosis(idx)}
                      style={{
                        background: selectedDiagnosis === idx ? '#1e3a8a' : '#0f172a',
                        border: selectedDiagnosis === idx ? '1px solid #38bdf8' : '1px solid #1e293b',
                        padding: '12px 14px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        color: '#f8fafc',
                      }}
                    >
                      <strong style={{ color: '#38bdf8', marginRight: 8 }}>Option {String.fromCharCode(65 + idx)}:</strong> {opt}
                    </div>
                  ))}
                </div>

                {!diagnosisSubmitted ? (
                  <button
                    type="button"
                    disabled={selectedDiagnosis === null}
                    onClick={() => setDiagnosisSubmitted(true)}
                    style={{
                      background: selectedDiagnosis !== null ? '#0284c7' : '#334155',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: selectedDiagnosis !== null ? 'pointer' : 'not-allowed',
                      alignSelf: 'flex-start',
                    }}
                  >
                    Confirm Diagnostic Triage
                  </button>
                ) : (
                  <div
                    style={{
                      background: selectedDiagnosis === activeScenario.correctDiagnosticIndex ? '#064e3b' : '#7f1d1d',
                      border: selectedDiagnosis === activeScenario.correctDiagnosticIndex ? '1px solid #10b981' : '1px solid #ef4444',
                      padding: 14,
                      borderRadius: 8,
                      fontSize: '0.82rem',
                      color: '#ffffff',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>{selectedDiagnosis === activeScenario.correctDiagnosticIndex ? '✓ Correct Diagnosis!' : '✗ Inaccurate Diagnosis'}</strong>: {activeScenario.rootCause}
                  </div>
                )}
              </div>
            )}

            {/* Stage 4: Corrective Action */}
            {activeTroubleStage === 4 && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                  Standard Operating Procedure (SOP) Corrective Actions
                </div>
                <div style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  {activeScenario.correctiveAction}
                </div>
              </div>
            )}

            {/* Stage 5: Predicted Response */}
            {activeTroubleStage === 5 && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                  Predicted Dynamic Process Response
                </div>
                <div style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  {activeScenario.expectedResponse}
                </div>
              </div>
            )}

            {/* Stage 6: Safety Implications */}
            {activeTroubleStage === 6 && (
              <div style={{ background: '#1c1917', border: '1px solid #f59e0b', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                  Process Safety Management (PSM) & Hazard Assessment
                </div>
                <div style={{ fontSize: '0.84rem', color: '#f8fafc', lineHeight: 1.6 }}>
                  {activeScenario.safetyImplication}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: INDUSTRY SOFTWARE LEARNING PATHS                             */}
      {/* =================================================================== */}
      {activeTab === 'software' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            {
              title: 'Aspen Plus & Aspen HYSYS',
              category: 'Process Simulation',
              desc: 'Flowsheeting, thermodynamic property selection (PR, NRTL), distillation column rating (RadFrac), and flash convergence.',
              tools: ['Aspen Plus v14', 'Aspen HYSYS', 'Aspen EDR'],
            },
            {
              title: 'DWSIM Open-Source Simulation',
              category: 'Free & Open Source Flowsheeting',
              desc: 'Chemical unit operations, recycle tear stream convergence, sensitivity studies, and CAPE-OPEN thermodynamic packages.',
              tools: ['DWSIM 8', 'Python scripting integration'],
            },
            {
              title: 'Python for Chemical Engineers',
              category: 'Numerical Computation',
              desc: 'NumPy arrays, Pandas process data cleaning, SciPy numerical integration of non-isothermal reactors, and Matplotlib plotting.',
              tools: ['Python 3.11', 'Jupyter Lab', 'SciPy', 'CoolProp'],
            },
            {
              title: 'AutoCAD Plant 3D & P&ID',
              category: 'Drafting & Process Design',
              desc: 'ANSI/ISA-5.1-2009 standard symbology, process flow diagrams (PFD), piping line routing, and equipment datasheets.',
              tools: ['AutoCAD Plant 3D', 'SmartPlant P&ID'],
            },
          ].map((soft, idx) => (
            <div key={idx} style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 8, padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>{soft.category}</span>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#f8fafc' }}>{soft.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, flex: 1 }}>{soft.desc}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {soft.tools.map((t, i) => (
                  <span key={i} style={{ background: '#0f172a', border: '1px solid #334155', color: '#cbd5e1', fontSize: '0.66rem', padding: '2px 6px', borderRadius: 4 }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: TECHNICAL INTERVIEW SIMULATOR                                */}
      {/* =================================================================== */}
      {activeTab === 'interview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
              {['All', 'Fluid Mechanics', 'Heat Transfer', 'Mass Transfer', 'Reaction Engineering', 'Thermodynamics'].map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubjectFilter(sub)}
                  style={{
                    background: selectedSubjectFilter === sub ? '#0284c7' : '#0f172a',
                    color: selectedSubjectFilter === sub ? '#ffffff' : '#94a3b8',
                    border: '1px solid #334155',
                    padding: '6px 12px',
                    borderRadius: 4,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#090d16', padding: '6px 12px', borderRadius: 6, border: '1px solid #334155' }}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search interview Q&A..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '0.78rem', outline: 'none', width: 180 }}
              />
            </div>
          </div>

          {/* Question Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredQuestions.map((q) => {
              const isExpanded = expandedQuestionId === q.id;
              return (
                <div key={q.id} style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 8, padding: 16 }}>
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8', marginRight: 8 }}>[{q.subject}]</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>{q.question}</span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                        <strong style={{ color: '#10b981' }}>Core Technical Answer: </strong>
                        {q.answer}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4, background: '#0f172a', padding: 10, borderRadius: 6 }}>
                        <strong style={{ color: '#38bdf8' }}>Engineering Rationale & Interview Context: </strong>
                        {q.rationale}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: STAR RESUME & INTERVIEW BUILDER                             */}
      {/* =================================================================== */}
      {activeTab === 'resume' && (
        <div style={{ background: '#090d16', border: '1px solid #1e3a8a', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800 }}>BEHAVIORAL & TECHNICAL INTERVIEW PREPARATION</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
              STAR Framework Technical Achievement Builder
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
              Convert completed laboratory experiments and engineering simulations into verifiable resume bullet points and structured interview narratives.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>
                Situation (Engineering Context)
              </label>
              <textarea
                value={starSituation}
                onChange={(e) => setStarSituation(e.target.value)}
                rows={3}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: 10, borderRadius: 6, fontSize: '0.8rem', marginTop: 4, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase' }}>
                Task (Measurable Engineering Objective)
              </label>
              <textarea
                value={starTask}
                onChange={(e) => setStarTask(e.target.value)}
                rows={3}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: 10, borderRadius: 6, fontSize: '0.8rem', marginTop: 4, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>
                Action (Physics & Software Methodology)
              </label>
              <textarea
                value={starAction}
                onChange={(e) => setStarAction(e.target.value)}
                rows={3}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: 10, borderRadius: 6, fontSize: '0.8rem', marginTop: 4, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>
                Result (Quantifiable Engineering Outcome)
              </label>
              <textarea
                value={starResult}
                onChange={(e) => setStarResult(e.target.value)}
                rows={3}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: 10, borderRadius: 6, fontSize: '0.8rem', marginTop: 4, outline: 'none' }}
              />
            </div>
          </div>

          {/* Generated Resume Bullet Point */}
          <div style={{ background: '#0c1424', border: '1px solid #10b981', borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
              Production-Ready Technical Resume Bullet Point:
            </div>
            <div style={{ fontSize: '0.86rem', color: '#ffffff', lineHeight: 1.6, fontStyle: 'italic' }}>
              "Analyzed pump suction line hydraulics using first-principles Darcy-Weisbach models; resolved volatile hydrocarbon cavitation by elevating suction vessel +1.5m and increasing line diameter to 75mm, boosting NPSHa margin to 3.8m."
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CareerWorkspace;
