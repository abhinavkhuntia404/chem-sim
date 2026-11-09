import { useState } from 'react';
import {
  BookOpen,
  FlaskConical,
  Play,
  Plus,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  FileText,
} from 'lucide-react';
import type {
  PumpExperimentDefinition,
  ExperimentObservationLog,
  PumpTelemetry,
  PumpOperatingConditions,
} from '../types';

interface PumpVirtualExperimentsProps {
  telemetry: PumpTelemetry;
  conditions: PumpOperatingConditions;
  onApplyConditions: (conds: Partial<PumpOperatingConditions>) => void;
  observationLogs: ExperimentObservationLog[];
  onAddObservationLog: (log: ExperimentObservationLog) => void;
  onClearObservationLogs: () => void;
  onGoToReport: () => void;
}

export const EXPERIMENT_CATALOG: PumpExperimentDefinition[] = [
  {
    id: 'exp01',
    code: 'EXP-01',
    title: 'Effect of Rotational Speed on Pump Head (Affinity Laws)',
    objective: 'Investigate the relationship between pump rotational speed N (RPM) and developed head H, verifying turbomachinery Affinity Laws (H ∝ N², Q ∝ N).',
    theory: 'According to turbomachinery Affinity Laws for geometrically similar flow conditions, volumetric flow rate scales linearly with impeller speed (Q₂/Q₁ = N₂/N₁), while developed head scales with the square of speed (H₂/H₁ = (N₂/N₁)²). Shaft power scales with the cube of speed (P₂/P₁ = (N₂/N₁)³).',
    apparatus: 'ISO 2858 Centrifugal Chemical Pump (50-32-160), Variable Frequency Drive (500–3000 RPM), calibrated pressure transmitters, magnetic flowmeter.',
    procedureSteps: [
      'Select Water at 20°C with discharge valve set to 80% open.',
      'Set rotational speed to 1450 RPM and allow system to stabilize; record Q, H, and Power.',
      'Increase speed in increments: 1800, 2200, 2600, and 2900 RPM.',
      'For each step, click "Record Data Point" into the Observation Table.',
      'Plot Head H versus Speed N on log-log scales to verify the quadratic slope m = 2.0.',
    ],
    discussionQuestions: [
      {
        q: 'Why does developed head scale with N² rather than N?',
        a: 'Euler head depends directly on blade peripheral tip velocity squared (u₂² = (π D₂ N / 60)²). Kinetic energy imparted to fluid particles is 0.5 * m * u₂², hence head scales quadratically with speed.',
      },
      {
        q: 'Does pump efficiency remain constant when speed changes?',
        a: 'At homologous points on the affinity parabola, hydraulic efficiency remains nearly constant, though minor Reynolds number scaling effects cause slight efficiency gains at higher speeds.',
      },
    ],
    defaultConditions: { pump_id: 'iso2858_chemical', fluid_id: 'water', speed_rpm: 1450.0, discharge_valve_opening_pct: 80.0 },
    variations: [
      { label: 'Step 1: 1450 RPM', conditions: { speed_rpm: 1450.0 } },
      { label: 'Step 2: 1800 RPM', conditions: { speed_rpm: 1800.0 } },
      { label: 'Step 3: 2200 RPM', conditions: { speed_rpm: 2200.0 } },
      { label: 'Step 4: 2600 RPM', conditions: { speed_rpm: 2600.0 } },
      { label: 'Step 5: 2900 RPM', conditions: { speed_rpm: 2900.0 } },
    ],
  },
  {
    id: 'exp02',
    code: 'EXP-02',
    title: 'Effect of Flow Rate on Pump Efficiency (Determination of BEP)',
    objective: 'Measure pump efficiency across the entire flow range from shutoff to runout to pinpoint the Best Efficiency Point (BEP).',
    theory: 'Pump total efficiency η = (P_hyd / P_shaft) * 100%. At shutoff (Q=0), efficiency is 0% because no useful hydraulic work is done. As flow increases, blade incident shock losses decrease until optimal incidence is reached at BEP. Beyond BEP, friction and diffusion losses dominate, causing efficiency to drop.',
    apparatus: 'Variable discharge throttle control valve, digital torque sensor, electrical power analyzer, calibrated differential pressure cell.',
    procedureSteps: [
      'Operate pump at rated speed of 2900 RPM with clean water.',
      'Throttle discharge valve to 10% (near shutoff) and log observation.',
      'Incrementally open discharge valve: 25%, 50%, 70%, 85%, and 100% (runout).',
      'Observe the peak in efficiency curve η(Q) and note corresponding BEP flow and head.',
    ],
    discussionQuestions: [
      {
        q: 'What hydrodynamic mechanisms cause efficiency to drop below BEP?',
        a: 'At low flow rates, liquid entry angle diverges from blade inlet angle, causing suction recirculation, stalling, and eddy turbulence inside blade channels.',
      },
      {
        q: 'Why should continuous operation be restricted to the Preferred Operating Range (70% - 120% BEP)?',
        a: 'Operating outside this range dramatically increases radial and axial hydraulic thrust, elevating shaft deflection, accelerating bearing wear, and inducing seal leakage.',
      },
    ],
    defaultConditions: { pump_id: 'iso2858_chemical', fluid_id: 'water', speed_rpm: 2900.0, discharge_valve_opening_pct: 10.0 },
    variations: [
      { label: 'Step 1: 10% Valve (Shutoff)', conditions: { discharge_valve_opening_pct: 10.0 } },
      { label: 'Step 2: 30% Valve', conditions: { discharge_valve_opening_pct: 30.0 } },
      { label: 'Step 3: 50% Valve', conditions: { discharge_valve_opening_pct: 50.0 } },
      { label: 'Step 4: 75% Valve (Near BEP)', conditions: { discharge_valve_opening_pct: 75.0 } },
      { label: 'Step 5: 100% Valve (Runout)', conditions: { discharge_valve_opening_pct: 100.0 } },
    ],
  },
  {
    id: 'exp03',
    code: 'EXP-03',
    title: 'Complete Centrifugal Pump Characteristic Curve',
    objective: 'Generate and analyze the full suite of pump performance curves: H-Q, η-Q, P_shaft-Q, and NPSHr-Q under standard conditions.',
    theory: 'A complete manufacturer performance curve communicates the full operational envelope of the pump. Head continuously declines with flow (drooping or steep characteristic), shaft power continuously climbs (non-overloading design), and NPSHr rises steeply near runout.',
    apparatus: 'Standard closed-loop testing facility according to ISO 9906 Grade 1 / ANSI HI 14.6.',
    procedureSteps: [
      'Maintain constant 2900 RPM throughout test.',
      'Record 6 operating points spanning Q = 0 to Q = 40 m³/h.',
      'Verify that shutoff head matches theoretical value H₀ ≈ 1.2 * H_BEP.',
      'Record shaft power and observe margin to nameplate motor rating (5.5 kW).',
    ],
    discussionQuestions: [
      {
        q: 'What is a "non-overloading" power characteristic?',
        a: 'A characteristic where maximum shaft power does not exceed motor nameplate rating even at maximum runout flow, preventing electric motor burnout if downstream pipe breaks.',
      },
    ],
    defaultConditions: { pump_id: 'iso2858_chemical', fluid_id: 'water', speed_rpm: 2900.0, discharge_valve_opening_pct: 60.0 },
    variations: [
      { label: 'Point 1: Q ≈ 0 m³/h', conditions: { discharge_valve_opening_pct: 5.0 } },
      { label: 'Point 2: Q ≈ 15 m³/h', conditions: { discharge_valve_opening_pct: 35.0 } },
      { label: 'Point 3: Q ≈ 25 m³/h', conditions: { discharge_valve_opening_pct: 60.0 } },
      { label: 'Point 4: Q ≈ 30 m³/h (BEP)', conditions: { discharge_valve_opening_pct: 80.0 } },
      { label: 'Point 5: Q ≈ 38 m³/h', conditions: { discharge_valve_opening_pct: 100.0 } },
    ],
  },
  {
    id: 'exp04',
    code: 'EXP-04',
    title: 'Effect of Fluid Viscosity (ANSI/HI 9.6.7 Derating)',
    objective: 'Quantify the dramatic degradation of pump head, flow capacity, and efficiency when handling highly viscous fluids compared to water.',
    theory: 'Pumping viscous liquids causes severe boundary layer drag along impeller shrouds and volute walls (disk friction losses). According to ANSI/HI 9.6.7, correction factors C_H, C_Q, and C_eta must be applied to water curves.',
    apparatus: 'Controlled temperature fluid jacket, variable viscous fluid test reservoir with Water, Diesel, Heavy Fuel Oil, and Glycerol 85%.',
    procedureSteps: [
      'First run baseline test with Water (1 cSt) at 2900 RPM.',
      'Switch fluid to Diesel (3.5 cSt) and record operating metrics.',
      'Switch fluid to Heavy Fuel Oil (380 cSt) and observe head drop and high shaft power.',
      'Switch fluid to Glycerol 85% (89 cSt) and calculate viscosity correction factors.',
    ],
    discussionQuestions: [
      {
        q: 'Why does viscous pumping dramatically increase motor power even though flow is lower?',
        a: 'Disk friction on the outside of rotating impeller shrouds scales with fluid viscosity and speed cubed, transferring large amounts of mechanical power directly into fluid friction heating.',
      },
    ],
    defaultConditions: { pump_id: 'iso2858_chemical', fluid_id: 'water', speed_rpm: 2900.0, discharge_valve_opening_pct: 80.0 },
    variations: [
      { label: 'Water (1.0 cSt)', conditions: { fluid_id: 'water' } },
      { label: 'Diesel Fuel (3.5 cSt)', conditions: { fluid_id: 'diesel' } },
      { label: 'Ethylene Glycol (3.2 cSt)', conditions: { fluid_id: 'ethylene_glycol' } },
      { label: 'Glycerol 85% (89 cSt)', conditions: { fluid_id: 'glycerol_85' } },
      { label: 'Heavy Fuel Oil (380 cSt)', conditions: { fluid_id: 'heavy_fuel_oil' } },
    ],
  },
  {
    id: 'exp05',
    code: 'EXP-05',
    title: 'Suction Head & Inception of Cavitation (NPSHa vs NPSHr)',
    objective: 'Observe the inception and physical consequences of cavitation as Net Positive Suction Head Available (NPSHa) drops below Required NPSH.',
    theory: 'Cavitation occurs when local static pressure at the impeller eye falls below liquid vapor pressure P_v(T). Vapor cavities form and are swept into high pressure zones where they violently implode (up to 10,000 bar microjets), causing pitting, noise, and head collapse.',
    apparatus: 'Vacuum suction chamber, acrylic transparent suction pipe, strobe illuminator, high-frequency piezoelectric accelerometer.',
    procedureSteps: [
      'Set fluid to Water at 20°C with suction static head at +2.0m (flooded suction).',
      'Observe healthy baseline: high cavitation margin (> 5m), low vibration (< 1.5 mm/s).',
      'Lower suction static head to -1.0m (suction lift) and record symptoms.',
      'Increase fluid temperature to 85°C (vapor pressure surges to 58 kPa).',
      'Observe cavitation inception when NPSHa < NPSHr: vibration spikes and head drops.',
    ],
    discussionQuestions: [
      {
        q: 'How does fluid temperature influence cavitation risk?',
        a: 'Higher temperature exponentially increases vapor pressure P_v according to Clausius-Clapeyron, directly reducing available NPSHa = (P_atm - P_v)/(ρg) + z_s - h_losses.',
      },
    ],
    defaultConditions: { pump_id: 'iso2858_chemical', fluid_id: 'water', fluid_temp_c: 20.0, suction_static_head_m: 2.0, speed_rpm: 2900.0 },
    variations: [
      { label: 'Flooded Suction (+3m, 20°C)', conditions: { suction_static_head_m: 3.0, fluid_temp_c: 20.0 } },
      { label: 'Neutral Suction (0m, 20°C)', conditions: { suction_static_head_m: 0.0, fluid_temp_c: 20.0 } },
      { label: 'Suction Lift (-2.5m, 20°C)', conditions: { suction_static_head_m: -2.5, fluid_temp_c: 20.0 } },
      { label: 'Warm Water (60°C, 0m)', conditions: { suction_static_head_m: 0.0, fluid_temp_c: 60.0 } },
      { label: 'Boiling Hot Water (95°C, Severe Cavitation)', conditions: { suction_static_head_m: 1.0, fluid_temp_c: 95.0 } },
    ],
  },
  {
    id: 'exp06',
    code: 'EXP-06',
    title: 'Effect of Impeller Diameter Trimming',
    objective: 'Evaluate the effect of reducing impeller outer diameter D₂ on pump head and flow according to machining trimming laws.',
    theory: 'Trimming impeller diameter is a permanent method to tailor pump performance to exact system requirements. For moderate trims (< 15%), Q₂/Q₁ ≈ D₂/D₁, and H₂/H₁ ≈ (D₂/D₁)², reducing power consumption.',
    apparatus: 'Lathe-machined impellers of diameters 165mm, 155mm, 145mm, and 135mm.',
    procedureSteps: [
      'Test full size 165mm impeller at 2900 RPM.',
      'Install 155mm trimmed impeller and record new operating point.',
      'Install 145mm trimmed impeller and record savings in shaft power.',
    ],
    discussionQuestions: [
      {
        q: 'Why should impeller trimming be limited to at most 15-20%?',
        a: 'Excessive trimming enlarges the gap between blade tips and the volute cutwater tongue, increasing recirculation losses and causing steep efficiency drop.',
      },
    ],
    defaultConditions: { pump_id: 'iso2858_chemical', fluid_id: 'water', impeller_diameter_m: 0.165, speed_rpm: 2900.0 },
    variations: [
      { label: 'Original D = 165 mm (100%)', conditions: { impeller_diameter_m: 0.165 } },
      { label: 'Trim 1: D = 155 mm (94%)', conditions: { impeller_diameter_m: 0.155 } },
      { label: 'Trim 2: D = 145 mm (88%)', conditions: { impeller_diameter_m: 0.145 } },
      { label: 'Trim 3: D = 135 mm (82%)', conditions: { impeller_diameter_m: 0.135 } },
    ],
  },
  {
    id: 'exp07',
    code: 'EXP-07',
    title: 'Effect of Pipe Diameter on System Resistance',
    objective: 'Demonstrate how discharge piping diameter influences Darcy-Weisbach friction loss and shifts the system operating point.',
    theory: 'Pipe friction head loss h_f = f * (L/D) * (v² / 2g). Because velocity v = Q / (π D² / 4), friction head scales with 1/D⁵! Doubling pipe diameter reduces friction loss by a factor of 32 for the same flow rate.',
    apparatus: 'Switchable piping loop with 1.5-inch, 2-inch, 3-inch, and 4-inch discharge headers.',
    procedureSteps: [
      'Select small 1.5-inch discharge pipe (0.038m) and observe steep system curve.',
      'Switch to standard 2-inch pipe (0.050m) and log operating flow.',
      'Switch to 3-inch pipe (0.080m) and observe operating point shift to higher flow and lower head.',
    ],
    discussionQuestions: [
      {
        q: 'What is the trade-off between pipe diameter and pump operating cost?',
        a: 'Larger pipe diameter has higher initial capital cost but drastically lowers friction head loss, yielding huge electrical energy savings over the pump lifecycle.',
      },
    ],
    defaultConditions: { pump_id: 'iso2858_chemical', discharge_pipe_dia_m: 0.05, discharge_pipe_length_m: 50.0 },
    variations: [
      { label: 'Narrow Pipe (1.5" / 38 mm)', conditions: { discharge_pipe_dia_m: 0.038 } },
      { label: 'Standard Pipe (2.0" / 50 mm)', conditions: { discharge_pipe_dia_m: 0.050 } },
      { label: 'Large Pipe (3.0" / 80 mm)', conditions: { discharge_pipe_dia_m: 0.080 } },
      { label: 'Low Friction Header (4.0" / 100 mm)', conditions: { discharge_pipe_dia_m: 0.100 } },
    ],
  },
  {
    id: 'exp08',
    code: 'EXP-08',
    title: 'Pumps in Series (High Head Operation)',
    objective: 'Demonstrate head addition when identical centrifugal pumps operate in series connection.',
    theory: 'When pumps operate in series, the same volumetric flow Q passes through each pump in succession. The total developed head is the sum of individual heads: H_total(Q) = H₁(Q) + H₂(Q). Used for high-head requirements such as boiler feedwater and mine dewatering.',
    apparatus: 'Two identical ISO 2858 chemical pumps configured in series piping arrangement.',
    procedureSteps: [
      'Operate single pump at 2900 RPM and measure head at 25 m³/h.',
      'Switch to Multistage 4-stage pump (equivalent to 4 pumps in series).',
      'Verify that developed head multiplies by the number of stages (approx 4x).',
    ],
    discussionQuestions: [
      {
        q: 'Why must casing wall thickness increase for second and third stage pumps in series?',
        a: 'Suction pressure of second stage equals discharge pressure of first stage; casing must withstand cumulative static pressure without bursting.',
      },
    ],
    defaultConditions: { pump_id: 'iso2858_chemical', discharge_static_head_m: 20.0 },
    variations: [
      { label: 'Single Stage Pump (1x Head)', conditions: { pump_id: 'iso2858_chemical', discharge_static_head_m: 20.0 } },
      { label: 'Multistage 4-Stage Feed Pump (4x Head)', conditions: { pump_id: 'multistage_boiler_feed', discharge_static_head_m: 120.0 } },
    ],
  },
  {
    id: 'exp09',
    code: 'EXP-09',
    title: 'Pumps in Parallel (High Flow Operation)',
    objective: 'Analyze flow addition when centrifugal pumps operate in parallel and the effect of system curve steepness on delivered capacity.',
    theory: 'In parallel operation, both pumps discharge into a common header against the same developed head: Q_total(H) = Q₁(H) + Q₂(H). Total delivered flow is less than 2x single pump flow due to increasing system friction head.',
    apparatus: 'Dual parallel split-case centrifugal pumps discharging into common manifold.',
    procedureSteps: [
      'Operate single split-case pump and note flow delivery.',
      'Simulate dual parallel operation into flat system curve vs steep system curve.',
      'Observe why steep system curves negate benefits of parallel pumping.',
    ],
    discussionQuestions: [
      {
        q: 'Why does parallel pumping deliver significantly less than double the flow in high-friction piping?',
        a: 'Because friction loss scales with Q². Doubling flow quadruples pipe friction head, moving operating point back up the pump curve to lower capacity per pump.',
      },
    ],
    defaultConditions: { pump_id: 'split_case_highflow', speed_rpm: 1450.0 },
    variations: [
      { label: 'Single Split-Case Pump', conditions: { pump_id: 'split_case_highflow', discharge_pipe_dia_m: 0.15 } },
      { label: 'Dual Flow Capacity Manifold', conditions: { pump_id: 'split_case_highflow', discharge_pipe_dia_m: 0.25 } },
    ],
  },
  {
    id: 'exp10',
    code: 'EXP-10',
    title: 'Valve Throttling vs Variable Speed Drive (VFD Energy Analysis)',
    objective: 'Compare lifecycle energy consumption between mechanical valve throttling and VFD speed control to achieve lower process flow demand.',
    theory: 'Controlling flow by closing a discharge valve artificially introduces massive parasitic friction loss ΔH_valve, wasting power as heat. Controlling flow via VFD reduces speed N, reducing power with N³ according to affinity laws.',
    apparatus: 'Automated globe control valve with positioner and ABB variable frequency drive.',
    procedureSteps: [
      'Target reduced flow demand of 18 m³/h (60% of rated flow).',
      'Method A: Keep speed at 2900 RPM and throttle discharge valve to 40%. Log shaft power.',
      'Method B: Open valve to 100% and reduce speed with VFD to 1800 RPM. Log shaft power.',
      'Compare shaft power: VFD typically consumes 50–65% less electrical power!',
    ],
    discussionQuestions: [
      {
        q: 'Calculate the annual electricity cost savings of VFD over valve throttling for 8000 operating hours at $0.12/kWh.',
        a: 'Power difference is approx 2.2 kW. Annual savings = 2.2 kW * 8000 h * $0.12/kWh = $2,112 per pump per year, easily paying back VFD cost within 12–18 months.',
      },
    ],
    defaultConditions: { pump_id: 'iso2858_chemical', speed_rpm: 2900.0, discharge_valve_opening_pct: 80.0 },
    variations: [
      { label: 'Baseline: Full Flow (2900 RPM, 80% Valve)', conditions: { speed_rpm: 2900.0, discharge_valve_opening_pct: 80.0 } },
      { label: 'Method A: Valve Throttling to 18 m³/h (2900 RPM, 40% Valve)', conditions: { speed_rpm: 2900.0, discharge_valve_opening_pct: 40.0 } },
      { label: 'Method B: VFD Speed Reduction to 18 m³/h (1800 RPM, 100% Valve)', conditions: { speed_rpm: 1800.0, discharge_valve_opening_pct: 100.0 } },
    ],
  },
  {
    id: 'exp11',
    code: 'EXP-11',
    title: 'Slurry Pumping & Solids Handling',
    objective: 'Investigate the behavior of heavy abrasive sand slurries in semi-open impeller pumps.',
    theory: 'Solid particles travel slower than fluid carrier, reducing impeller energy transfer. High density slurries increase required shaft power (P ∝ ρ_mixture), while abrasive silica particles erode cutwater and vanes.',
    apparatus: 'Heavy-duty semi-open high-chrome alloy slurry pump with slurry recirculating tank.',
    procedureSteps: [
      'Test Clean Water in Slurry pump at 1450 RPM.',
      'Switch fluid to Sand-Water Slurry (15% vol) and observe power increase due to slurry density (1240 kg/m³).',
      'Introduce simulated impeller wear fault to represent 500 hours of slurry erosion.',
    ],
    discussionQuestions: [
      {
        q: 'Why are semi-open impellers preferred over closed impellers for slurry pumping?',
        a: 'Semi-open impellers lack front shrouds, preventing solids from wedging between casing and impeller, and allow easy axial clearance adjustment to compensate for wear.',
      },
    ],
    defaultConditions: { pump_id: 'slurry_heavy_duty', fluid_id: 'water', speed_rpm: 1450.0 },
    variations: [
      { label: 'Clean Water Reference', conditions: { fluid_id: 'water', fault_impeller_wear: 0.0 } },
      { label: 'Sand Slurry 15% (Healthy)', conditions: { fluid_id: 'sand_slurry_15', fault_impeller_wear: 0.0 } },
      { label: 'Sand Slurry with 40% Vane Wear', conditions: { fluid_id: 'sand_slurry_15', fault_impeller_wear: 0.4 } },
      { label: 'Sand Slurry with 80% Severe Erosion', conditions: { fluid_id: 'sand_slurry_15', fault_impeller_wear: 0.8 } },
    ],
  },
  {
    id: 'exp12',
    code: 'EXP-12',
    title: 'Multistage Pump Interstage Pressure Build',
    objective: 'Measure stage-by-stage pressure rise across a 4-stage ring-section diffuser boiler feed pump.',
    theory: 'In multistage ring-section pumps, diffuser vanes guide high-velocity fluid leaving each impeller into return channels that feed the eye of the subsequent stage, accumulating head.',
    apparatus: '4-stage forged steel boiler feed pump with interstage pressure taps.',
    procedureSteps: [
      'Operate at 2950 RPM with demineralized boiler feedwater at 80°C.',
      'Measure discharge pressure: approximately 160 meters developed head.',
      'Observe diffuser pressure recovery efficiency compared to standard volute.',
    ],
    discussionQuestions: [
      {
        q: 'Why are radial diffusers used in multistage pumps instead of volutes?',
        a: 'Diffusers provide symmetrical radial pressure distribution around the impeller circumference, eliminating radial shaft bending loads across multiple stages.',
      },
    ],
    defaultConditions: { pump_id: 'multistage_boiler_feed', fluid_id: 'distilled_water', fluid_temp_c: 80.0, speed_rpm: 2950.0 },
    variations: [
      { label: 'Low Flow Throttled (15 m³/h)', conditions: { discharge_valve_opening_pct: 35.0 } },
      { label: 'Rated Design Flow (40 m³/h)', conditions: { discharge_valve_opening_pct: 75.0 } },
      { label: 'Maximum Capacity (55 m³/h)', conditions: { discharge_valve_opening_pct: 100.0 } },
    ],
  },
  {
    id: 'exp13',
    code: 'EXP-13',
    title: 'Abnormal Operation & Emergency Trip Diagnostics',
    objective: 'Simulate severe operational faults (dry running, discharge shutoff, bearing failure) and verify protective trip interlocks.',
    theory: 'Pumps require automated monitoring of vibration, temperature, and differential pressure to initiate protective trip shutdowns before catastrophic mechanical destruction.',
    apparatus: 'Digital Twin with programmable fault injector and trip threshold relays.',
    procedureSteps: [
      'Run healthy pump at 2900 RPM.',
      'Inject Dry-Running condition: observe immediate seal face overheating.',
      'Inject Bearing Race Defect: observe vibration exceed ISO 10816 Zone D trip threshold (> 7.1 mm/s).',
      'Execute Emergency Stop and verify maintenance restoration procedures.',
    ],
    discussionQuestions: [
      {
        q: 'What is the consequence of allowing a pump to run dry for more than 60 seconds?',
        a: 'Silicon carbide mechanical seal faces lose their lubricating fluid film, generating extreme frictional temperatures (> 250°C), causing thermal shock shattering and elastomeric O-ring melting.',
      },
    ],
    defaultConditions: { pump_id: 'iso2858_chemical', fault_dry_run: 0.0, fault_bearing_defect: 0.0 },
    variations: [
      { label: 'Condition 1: Normal Operation', conditions: { fault_dry_run: 0.0, fault_bearing_defect: 0.0 } },
      { label: 'Condition 2: Dry Run Fault (Zero Fluid)', conditions: { fault_dry_run: 1.0 } },
      { label: 'Condition 3: Bearing Breakdown (Vibration Trip)', conditions: { fault_bearing_defect: 0.85, fault_dry_run: 0.0 } },
    ],
  },
  {
    id: 'exp14',
    code: 'EXP-14',
    title: 'Comparative Performance Across 5 Diverse Fluid Classes',
    objective: 'Compare hydraulic performance and power requirements when the same pump handles clean water, alcohol, viscous oil, heavy acid, and brine.',
    theory: 'Liquid density directly determines discharge pressure and shaft power (P ∝ ρ), while vapor pressure determines cavitation margin, and viscosity alters the friction loss curve.',
    apparatus: 'Multi-fluid test circuit with automatic density and viscosity instrumentation.',
    procedureSteps: [
      'Run Water reference (ρ = 998 kg/m³, μ = 1.0 cP).',
      'Run Ethanol (low density 789 kg/m³, high vapor pressure 5.8 kPa).',
      'Run Sulfuric Acid 50% (dense fluid 1395 kg/m³: high power draw).',
      'Run Thermal Oil (viscous 25 cP).',
      'Record all metrics into the observation table for multi-fluid comparison.',
    ],
    discussionQuestions: [
      {
        q: 'Why does 50% Sulfuric Acid require almost 40% more motor power than water at the same head and flow?',
        a: 'Hydraulic power P_hyd = ρ * g * Q * H. Head H is in meters of liquid column. Since acid density is 1395 kg/m³ (1.4x water), mass flow rate is 40% higher, demanding 40% more shaft power.',
      },
    ],
    defaultConditions: { pump_id: 'iso2858_chemical', speed_rpm: 2900.0 },
    variations: [
      { label: 'Fluid 1: Water (998 kg/m³)', conditions: { fluid_id: 'water' } },
      { label: 'Fluid 2: Ethanol (789 kg/m³)', conditions: { fluid_id: 'ethanol' } },
      { label: 'Fluid 3: Seawater (1025 kg/m³)', conditions: { fluid_id: 'seawater' } },
      { label: 'Fluid 4: Sulfuric Acid 50% (1395 kg/m³)', conditions: { fluid_id: 'h2so4_50' } },
      { label: 'Fluid 5: Thermal Oil (25 cP)', conditions: { fluid_id: 'thermal_oil' } },
    ],
  },
  {
    id: 'exp15',
    code: 'EXP-15',
    title: 'Pump Energy Efficiency & Life Cycle Costing (LCC)',
    objective: 'Calculate 15-year Life Cycle Cost (LCC) according to ISO 14414 pump system energy assessments.',
    theory: 'In industrial pumping, initial equipment purchase represents only 5–10% of total lifecycle cost, while electrical energy represents 85–90%! Operating even 5% closer to BEP saves tens of thousands of dollars.',
    apparatus: 'Life Cycle Cost modeler with electrical kWh tariff input ($0.12/kWh).',
    procedureSteps: [
      'Operate pump at off-design point (low efficiency 45%). Note shaft power.',
      'Optimize system: tune speed and valves to reach BEP (efficiency 76%).',
      'Calculate annual electrical energy savings and total 15-year LCC impact.',
    ],
    discussionQuestions: [
      {
        q: 'What is the dominant cost element in pump life cycle costing (LCC = C_ic + C_in + C_e + C_o + C_m + C_s + C_env + C_d)?',
        a: 'Energy cost C_e is overwhelmingly dominant (typically 80–90%). Maintenance C_m is second. Purchase cost C_ic is negligible over a 15-year lifespan.',
      },
    ],
    defaultConditions: { pump_id: 'iso2858_chemical', speed_rpm: 2900.0, discharge_valve_opening_pct: 30.0 },
    variations: [
      { label: 'Inefficient Operating Point (η = 45%)', conditions: { discharge_valve_opening_pct: 25.0 } },
      { label: 'BEP Optimal Energy Operation (η = 76%)', conditions: { discharge_valve_opening_pct: 80.0 } },
    ],
  },
];

export function PumpVirtualExperiments({
  telemetry,
  conditions,
  onApplyConditions,
  observationLogs,
  onAddObservationLog,
  onClearObservationLogs,
  onGoToReport,
}: PumpVirtualExperimentsProps) {
  const [selectedExpId, setSelectedExpId] = useState<string>('exp01');
  const [activeStepTab, setActiveStepTab] = useState<'procedure' | 'theory' | 'discussion'>('procedure');

  const currentExp = EXPERIMENT_CATALOG.find((e) => e.id === selectedExpId) || EXPERIMENT_CATALOG[0];

  const handleRecordDataPoint = (stepLabel: string) => {
    const newLog: ExperimentObservationLog = {
      id: `log-${Date.now()}`,
      stepName: `${currentExp.code}: ${stepLabel}`,
      timestamp: new Date().toLocaleTimeString(),
      speed_rpm: Math.round(conditions.speed_rpm),
      flow_m3_h: telemetry.operating_flow_m3_h,
      head_m: telemetry.operating_head_m,
      efficiency_pct: telemetry.efficiency_pct,
      power_kw: telemetry.shaft_power_kw,
      npsha_m: telemetry.npsha_m,
      npshr_m: telemetry.npshr_m,
      cavitating: telemetry.is_cavitating,
      vibration_mm_s: telemetry.vibration_velocity_mm_s,
      notes: telemetry.is_cavitating ? 'Cavitation Inception Alert' : 'Stable Regime',
    };
    onAddObservationLog(newLog);
  };

  const handleExportCSV = () => {
    if (observationLogs.length === 0) return;
    const headers = ['Step', 'Time', 'RPM', 'Flow (m3/h)', 'Head (m)', 'Efficiency (%)', 'Power (kW)', 'NPSHa (m)', 'NPSHr (m)', 'Cavitating', 'Vibration (mm/s)', 'Notes'];
    const rows = observationLogs.map((l) => [
      `"${l.stepName}"`,
      `"${l.timestamp}"`,
      l.speed_rpm,
      l.flow_m3_h,
      l.head_m,
      l.efficiency_pct,
      l.power_kw,
      l.npsha_m,
      l.npshr_m,
      l.cavitating ? 'YES' : 'NO',
      l.vibration_mm_s,
      `"${l.notes}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pump_Experiment_${currentExp.code}_Data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pump-virtual-experiments" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Top Header with Experiment Selector Dropdown */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '12px 16px', borderRadius: 8, border: '1px solid #1e293b', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FlaskConical size={20} color="#38bdf8" />
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
              Virtual Laboratory Experiment Suite (EXP-01 to EXP-15)
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Guided experiments with scientific observations, telemetry logging, and report generation
            </div>
          </div>
        </div>

        {/* Experiment Selector */}
        <select
          value={selectedExpId}
          onChange={(e) => {
            const exp = EXPERIMENT_CATALOG.find((x) => x.id === e.target.value);
            if (exp) {
              setSelectedExpId(exp.id);
              onApplyConditions(exp.defaultConditions);
            }
          }}
          style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 6, padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
        >
          {EXPERIMENT_CATALOG.map((exp) => (
            <option key={exp.id} value={exp.id}>
              {exp.code}: {exp.title}
            </option>
          ))}
        </select>
      </div>

      {/* Main Experiment Container (2 Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Left Column: Experiment Details & Variations */}
        <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <span style={{ fontSize: '0.72rem', background: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
              {currentExp.code}
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>{currentExp.title}</div>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: 6, lineHeight: 1.45, background: '#1e293b44', padding: 10, borderRadius: 6, border: '1px solid #334155' }}>
              <strong>Objective:</strong> {currentExp.objective}
            </div>
          </div>

          {/* Subtabs: Procedure / Theory / Discussion */}
          <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #1e293b', paddingBottom: 6 }}>
            <button
              className={`btn-tag ${activeStepTab === 'procedure' ? 'active' : ''}`}
              onClick={() => setActiveStepTab('procedure')}
              style={{ fontSize: '0.74rem', padding: '4px 10px' }}
            >
              <Play size={13} style={{ marginRight: 4 }} /> Procedure & Steps
            </button>
            <button
              className={`btn-tag ${activeStepTab === 'theory' ? 'active' : ''}`}
              onClick={() => setActiveStepTab('theory')}
              style={{ fontSize: '0.74rem', padding: '4px 10px' }}
            >
              <BookOpen size={13} style={{ marginRight: 4 }} /> Governing Theory
            </button>
            <button
              className={`btn-tag ${activeStepTab === 'discussion' ? 'active' : ''}`}
              onClick={() => setActiveStepTab('discussion')}
              style={{ fontSize: '0.74rem', padding: '4px 10px' }}
            >
              <HelpCircle size={13} style={{ marginRight: 4 }} /> Discussion Q&A
            </button>
          </div>

          {/* Content Area for Active Tab */}
          <div style={{ flex: 1, minHeight: 180 }}>
            {activeStepTab === 'procedure' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ol style={{ margin: 0, paddingLeft: 18, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  {currentExp.procedureSteps.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>{step}</li>
                  ))}
                </ol>

                {/* Preconfigured Step Buttons */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 6 }}>
                    Quick Step Controls (Click to Apply & Log)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {currentExp.variations.map((v, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onApplyConditions(v.conditions);
                          handleRecordDataPoint(v.label);
                        }}
                        style={{
                          background: '#1e293b',
                          color: '#38bdf8',
                          border: '1px solid #334155',
                          borderRadius: 6,
                          padding: '6px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Play size={11} /> {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeStepTab === 'theory' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  {currentExp.theory}
                </div>
                <div style={{ background: '#1e293b55', padding: 10, borderRadius: 6, border: '1px solid #334155' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Virtual Apparatus Specifications</div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: 4 }}>{currentExp.apparatus}</div>
                </div>
              </div>
            )}

            {activeStepTab === 'discussion' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {currentExp.discussionQuestions.map((qa, idx) => (
                  <div key={idx} style={{ background: '#1e293b55', padding: 10, borderRadius: 6, border: '1px solid #334155' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#38bdf8' }}>Q: {qa.q}</div>
                    <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: 4, lineHeight: 1.45 }}>A: {qa.a}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Observation Table & Data Logging */}
        <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileSpreadsheet size={16} color="#10b981" />
              Experiment Observation Log ({observationLogs.length} Points)
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => handleRecordDataPoint('Manual Log')}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Plus size={13} /> Log Current State
              </button>
              {observationLogs.length > 0 && (
                <>
                  <button
                    onClick={handleExportCSV}
                    style={{ background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: 4, padding: '4px 8px', fontSize: '0.72rem', cursor: 'pointer' }}
                    title="Export CSV"
                  >
                    CSV
                  </button>
                  <button
                    onClick={onClearObservationLogs}
                    style={{ background: '#1e293b', color: '#f87171', border: '1px solid #334155', borderRadius: 4, padding: '4px 8px', fontSize: '0.72rem', cursor: 'pointer' }}
                    title="Clear Log"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Observation Data Table */}
          <div style={{ flex: 1, minHeight: 220, maxHeight: 300, overflowY: 'auto', background: '#090d16', borderRadius: 6, border: '1px solid #1e293b' }}>
            {observationLogs.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#64748b', fontSize: '0.76rem' }}>
                No observation data logged yet. Click the step buttons or "Log Current State" to populate the experimental record.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '6px 8px' }}>Step Name</th>
                    <th style={{ padding: '6px 8px' }}>N (RPM)</th>
                    <th style={{ padding: '6px 8px' }}>Q (m³/h)</th>
                    <th style={{ padding: '6px 8px' }}>H (m)</th>
                    <th style={{ padding: '6px 8px' }}>η (%)</th>
                    <th style={{ padding: '6px 8px' }}>P (kW)</th>
                    <th style={{ padding: '6px 8px' }}>NPSHa</th>
                  </tr>
                </thead>
                <tbody>
                  {observationLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #1e293b77', color: '#e2e8f0' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 600, color: '#38bdf8' }}>{log.stepName}</td>
                      <td style={{ padding: '6px 8px' }}>{log.speed_rpm}</td>
                      <td style={{ padding: '6px 8px' }}>{log.flow_m3_h}</td>
                      <td style={{ padding: '6px 8px' }}>{log.head_m}</td>
                      <td style={{ padding: '6px 8px', color: '#10b981' }}>{log.efficiency_pct}%</td>
                      <td style={{ padding: '6px 8px', color: '#f43f5e' }}>{log.power_kw}</td>
                      <td style={{ padding: '6px 8px' }}>{log.npsha_m}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Report Generation Call-to-Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#064e3b22', padding: '10px 14px', borderRadius: 6, border: '1px solid #065f46' }}>
            <div style={{ fontSize: '0.74rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color="#34d399" />
              <span>Experiment data synchronized and ready for formal report compilation.</span>
            </div>
            <button
              onClick={onGoToReport}
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: 4,
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <FileText size={14} /> Open Full Lab Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

