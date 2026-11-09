import { useState } from 'react';
import {
  BookOpen,
  FileText,
  HelpCircle,
  FlaskConical,
  Activity,
  Search,
  ArrowRight,
  Compass,
} from 'lucide-react';

interface AcademicWorkspaceProps {
  onLaunchSimulation: (moduleId: string) => void;
}

export interface CourseUnit {
  unitNumber: number;
  title: string;
  topics: string[];
  hours: number;
}

export interface CourseOutcome {
  coNumber: string;
  statement: string;
  poMapping: string;
}

export interface LabExperiment {
  expNumber: number;
  title: string;
  objective: string;
  apparatus: string;
  procedureSummary: string;
  linkedModule?: string;
}

export interface LearningPathwayStep {
  stepName: 'Concept' | 'Visual Explanation' | 'Mathematical Derivation' | 'Worked Example' | 'Interactive Simulation' | 'Engineering Application' | 'Assessment' | 'Industry Connection';
  title: string;
  summary: string;
  details?: string;
  actionLabel?: string;
  linkedModule?: string;
}

export interface CourseDefinition {
  code: string;
  title: string;
  semester: 3 | 4 | 5 | 6 | 7 | 8;
  credits: string;
  category: 'Core Chemical Engineering' | 'Program Elective' | 'Laboratory Course' | 'Basic Sciences & Math' | 'Project / Internship' | 'Open Elective' | 'Humanities & Management';
  isElective?: boolean;
  electiveGroup?: string;
  description: string;
  outcomes: CourseOutcome[];
  units: CourseUnit[];
  labs?: LabExperiment[];
  pathway: LearningPathwayStep[];
  workedProblems?: { title: string; problem: string; solution: string }[];
  vivaQuestions?: { q: string; a: string }[];
  softwareTools?: string[];
  industrialApplications?: string[];
  placementSkills?: string[];
  linkedModule?: string;
}

export const ACADEMIC_COURSES: CourseDefinition[] = [
  // =========================================================================
  // SEMESTER III
  // =========================================================================
  {
    code: 'CH31',
    title: 'Integral Transforms, Complex Analysis and PDE',
    semester: 3,
    credits: '3:0:0 (3 Credits)',
    category: 'Basic Sciences & Math',
    description: 'Foundational mathematical methods for chemical engineering transport equations, Laplace transforms, and boundary value problems.',
    outcomes: [
      { coNumber: 'CO1', statement: 'Apply Laplace transforms to solve first and second order process dynamic equations.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO2', statement: 'Evaluate complex contour integrals and analytic functions using residue calculus.', poMapping: 'PO1' },
      { coNumber: 'CO3', statement: 'Solve 1D transient heat conduction and wave partial differential equations.', poMapping: 'PO1, PO2, PO3' },
    ],
    units: [
      { unitNumber: 1, title: 'Laplace Transforms & Inversion', topics: ['Transforms of standard functions', 'Heaviside unit step and Dirac delta functions', 'Convolution theorem and inverse Laplace transforms'], hours: 8 },
      { unitNumber: 2, title: 'Complex Variables & Analytic Functions', topics: ['Cauchy-Riemann equations', 'Conformal mapping', 'Residue theorem and contour integration'], hours: 8 },
      { unitNumber: 3, title: 'Partial Differential Equations in Transport', topics: ['Separation of variables for 1D transient conduction', '1D wave equation in fluid acoustic pulses', 'Fourier series orthogonality'], hours: 8 },
      { unitNumber: 4, title: 'Numerical Finite-Difference PDE Approximations', topics: ['Crank-Nicolson scheme', '2D Laplace steady-state temperature field', 'Boundary condition discretization'], hours: 8 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Dynamic Process Modeling in Frequency Domain', summary: 'Transferring continuous time differential equations into algebraic s-domain polynomials to evaluate system response.' },
      { stepName: 'Visual Explanation', title: 'Complex s-Plane Pole-Zero Mapping', summary: 'Visualizing stability: poles in left-half s-plane indicate decaying stable transients, right-half indicates runaway.' },
      { stepName: 'Mathematical Derivation', title: 'Laplace Transform of First-Order Lag (τ ds/dt + y = K x)', summary: 'Deriving y(t) = K A (1 - exp(-t/τ)) for a unit step input of magnitude A.' },
      { stepName: 'Worked Example', title: 'Step Response of a Liquid Surge Tank', summary: 'Level tank with area A=2 m2, resistance R=1.5 min/m2 responding to a 0.5 m3/min inlet step change.' },
      { stepName: 'Interactive Simulation', title: 'Process Control Transfer Function Response', summary: 'Explore first and second order step responses in the Process Control workbench.', linkedModule: 'industry' },
      { stepName: 'Engineering Application', title: 'Refinery Surge Drum Dynamics', summary: 'Sizing liquid surge capacities to damp out feed pipeline pressure surges before entering distillation towers.' },
      { stepName: 'Assessment', title: 'Laplace Inversion & Final Value Theorem Viva', summary: 'Evaluate steady-state gain using lim(s->0) s Y(s) and compute decay time constants.' },
      { stepName: 'Industry Connection', title: 'Advanced Process Control & DCS Tuning', summary: 'Process control specialists at Emerson, Yokogawa, and Honeywell apply Laplace transforms for loop tuning.' },
    ],
    workedProblems: [
      {
        title: 'Dynamic Response of CSTR Concentration Step',
        problem: 'A CSTR with residence time τ = 10 min experiences a sudden step change in inlet concentration C_in = 2.0 kmol/m3. Initial concentration is 0. Find C(t) at t = 10 min.',
        solution: 'Governing equation: dC/dt + (1/τ) C = (1/τ) C_in. Laplace transform: s C(s) + (1/τ) C(s) = C_in / (τ s). C(s) = C_in / [s(τ s + 1)]. Inverting: C(t) = C_in [1 - exp(-t/τ)]. At t = 10 min: C(10) = 2.0 * [1 - exp(-1)] = 2.0 * 0.6321 = 1.264 kmol/m3.',
      },
    ],
    vivaQuestions: [
      { q: 'What is the significance of the Final Value Theorem in process dynamics?', a: 'It allows finding the new steady-state value of a process variable directly from its Laplace transform without computing the complete time-domain inverse.' },
    ],
    softwareTools: ['Python (scipy.signal)', 'MATLAB / GNU Octave', 'Scilab'],
    industrialApplications: ['DCS surge drum damping', 'Process furnace temperature control', 'Piping acoustic hammer damping'],
    placementSkills: ['Process dynamic modeling', 'Differential equation numerical solution', 'Laplace transform analysis'],
  },
  {
    code: 'CH32',
    title: 'Momentum Transfer (Fluid Flow Operations)',
    semester: 3,
    credits: '3:1:0 (4 Credits)',
    category: 'Core Chemical Engineering',
    description: 'Fluid statics, Bernoulli energy balance, pipe friction losses, boundary layer development, turbomachinery Euler equations, and cavitation.',
    linkedModule: 'centrifugal-pump',
    outcomes: [
      { coNumber: 'CO1', statement: 'Calculate hydrostatic pressures and manometer fluid column readings in process vessels.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO2', statement: 'Apply mechanical energy balance (Bernoulli equation) to design complex process piping networks.', poMapping: 'PO1, PO2, PO3' },
      { coNumber: 'CO3', statement: 'Determine Darcy friction factors and head losses across pipes, valves, and fittings.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO4', statement: 'Size centrifugal pumps, evaluate NPSHa margins, and prevent impeller cavitation.', poMapping: 'PO1, PO3, PO4' },
    ],
    units: [
      { unitNumber: 1, title: 'Fluid Statics & Pressure Measurement', topics: ['Hydrostatic equilibrium', 'U-tube, inclined, and differential manometers', 'Rheology of Newtonian vs non-Newtonian fluids'], hours: 10 },
      { unitNumber: 2, title: 'Fluid Kinematics & Bernoulli Energy Balance', topics: ['Continuity equation', 'Navier-Stokes equation in cylindrical coordinates', 'Mechanical energy balance with pump head and friction losses'], hours: 10 },
      { unitNumber: 3, title: 'Flow Through Conduits & Friction Losses', topics: ['Hagen-Poiseuille equation for laminar flow', 'Turbulent boundary layers and Moody chart', 'Darcy-Weisbach friction factor correlations (Colebrook-White)', 'Equivalent length of valves and fittings'], hours: 10 },
      { unitNumber: 4, title: 'Flow Past Immersed Bodies & Fluidisation', topics: ['Form drag and skin friction', 'Terminal settling velocity and Stokes law', 'Ergun equation for packed beds', 'Mechanisms of gas-solid fluidisation'], hours: 10 },
      { unitNumber: 5, title: 'Flow Measurement & Centrifugal Pumping', topics: ['Venturi, orifice, and rotameters', 'Centrifugal pump construction and Euler turbomachinery equation', 'Affinity laws, pump characteristic curves, and system head intersection', 'NPSH calculation and cavitation diagnostics'], hours: 10 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'First Principles of Fluid Energy Transfer', summary: 'Pressure, kinetic, and potential energy interconversion along a streamline with viscous dissipation.' },
      { stepName: 'Visual Explanation', title: 'Hagen-Poiseuille Velocity Profiles', summary: 'Inspect parabolic laminar vs 1/7th turbulent velocity profiles in our Visual Concept Studio.', linkedModule: 'learn' },
      { stepName: 'Mathematical Derivation', title: 'Euler Turbomachinery Equation', summary: 'Deriving theoretical head H_Euler = (u2 v_t2 - u1 v_t1) / g from angular momentum conservation.' },
      { stepName: 'Worked Example', title: 'Centrifugal Pump Operating Point & Head Loss', summary: 'Water delivery across 120 m of 75 mm commercial steel pipe with 8 elbows and a gate valve.' },
      { stepName: 'Interactive Simulation', title: 'Centrifugal Pump Digital Twin', summary: 'Operate the interactive 3D pump twin, adjust speed and flow, and run 15 guided lab experiments.', linkedModule: 'centrifugal-pump' },
      { stepName: 'Engineering Application', title: 'API 610 Refinery Hydrocarbon Transfer', summary: 'Designing suction piping elevation and minimum NPSHa margins to prevent flashing of volatile hydrocarbons.' },
      { stepName: 'Assessment', title: 'Hydraulic Calculations & Cavitation Viva', summary: 'Calculate pipe pressure drops, pump brake power, and interpret pump performance curves.' },
      { stepName: 'Industry Connection', title: 'Process Hydraulics & Line Sizing (EPC)', summary: 'Process engineering teams at Bechtel, Technip, and L&T Hydrocarbon size pumps and line diameters daily.' },
    ],
    workedProblems: [
      {
        title: 'Darcy-Weisbach Head Loss and Pump Brake Power',
        problem: 'Water (ρ = 1000 kg/m3, μ = 0.001 Pa·s) is pumped through a 50 mm ID commercial steel pipe (ε = 0.045 mm) of length 60 m at 20 m3/h. If static lift is 15 m and pump efficiency is 72%, find the required motor power.',
        solution: 'Velocity v = (20/3600) / [π(0.05)2 / 4] = 2.83 m/s. Re = (1000 * 2.83 * 0.05) / 0.001 = 141,500. Relative roughness = 0.045/50 = 0.0009. From Colebrook-White / Swamee-Jain: f = 0.0212. Friction head h_f = f (L/D) (v2 / 2g) = 0.0212 * (60/0.05) * (2.83)2 / (2 * 9.81) = 10.38 m. Total dynamic head H = 15 + 10.38 = 25.38 m. Hydraulic power P_hyd = (1000 * 9.81 * (20/3600) * 25.38) / 1000 = 1.38 kW. Motor brake power P_brake = 1.38 / 0.72 = 1.92 kW.',
      },
    ],
    vivaQuestions: [
      { q: 'Why does a centrifugal pump develop less head as liquid flow rate increases?', a: 'As flow rate increases, radial velocity through impeller channels increases, causing the fluid exit angle to become more tangential and reducing tangential velocity (v_t2), which directly decreases Euler head.' },
    ],
    softwareTools: ['Python (CoolProp)', 'AFT Fathom', 'Pipenet', 'DWSIM Hydraulics'],
    industrialApplications: ['Refinery crude booster pumps', 'Cooling water recirculation networks', 'Slurry transport pipelines'],
    placementSkills: ['Hydraulic network calculation', 'Pump selection per API 610', 'NPSH evaluation', 'Pipe sizing criteria'],
  },
  {
    code: 'CH33',
    title: 'Chemical Process Calculations (Stoichiometry)',
    semester: 3,
    credits: '3:1:0 (4 Credits)',
    category: 'Core Chemical Engineering',
    description: 'Material and energy balance fundamentals, degrees of freedom analysis, bypass, recycle, purge, combustion, psychrometry, and industrial flowsheet stoichiometry.',
    linkedModule: 'distillation',
    outcomes: [
      { coNumber: 'CO1', statement: 'Perform unit conversions and solve multi-phase composition relations.', poMapping: 'PO1' },
      { coNumber: 'CO2', statement: 'Formulate and solve steady-state material balances without chemical reactions.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO3', statement: 'Solve material balances involving single and multiple chemical reactions with limiting reactants.', poMapping: 'PO1, PO2, PO3' },
      { coNumber: 'CO4', statement: 'Compute balances for recycle, purge, bypass streams and industrial combustion systems.', poMapping: 'PO1, PO2, PO3' },
    ],
    units: [
      { unitNumber: 1, title: 'Units, Dimensions & Fluid Compositions', topics: ['SI and engineering unit conversions', 'Molar and mass fractions', 'Average molecular weight and density of mixtures', 'Ideal gas law and Amagat/Dalton partial pressures'], hours: 10 },
      { unitNumber: 2, title: 'Material Balances Without Reaction', topics: ['System boundaries and degrees of freedom analysis', 'Mixers, splitters, flash evaporators, and crystallizers', 'Multi-unit process material balances'], hours: 10 },
      { unitNumber: 3, title: 'Material Balances With Chemical Reaction', topics: ['Stoichiometric coefficients and limiting vs excess reactants', 'Fractional conversion, selectivity, and yield', 'Extent of reaction formulation'], hours: 10 },
      { unitNumber: 4, title: 'Recycle, Purge & Bypass Operations', topics: ['Recycle ratio and single-pass vs overall conversion', 'Inert accumulation and purge stream sizing', 'Bypass streams for product control'], hours: 10 },
      { unitNumber: 5, title: 'Combustion Stoichiometry & Energy Balances', topics: ['Theoretical air and percentage excess oxygen', 'Orsat flue gas analysis on dry vs wet basis', 'Standard heat of reaction, formation, and Hess law', 'Sensible and latent enthalpy balances'], hours: 10 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Conservation of Mass & Atomic Species', summary: 'Formulating independent component and elemental balances across open and closed systems.' },
      { stepName: 'Visual Explanation', title: 'Flowsheet Mass Balance Boundaries', summary: 'Draw process boundaries around individual unit operations and overall plant envelopes.' },
      { stepName: 'Mathematical Derivation', title: 'Recycle and Purge Inert Accumulation', summary: 'Deriving overall conversion X_overall = X_single / [1 - R(1 - X_single)] and purge ratio.' },
      { stepName: 'Worked Example', title: 'Ammonia Synthesis Loop Material Balance', summary: 'Haber-Bosch reactor with 20% single-pass conversion, methane inert purge, and 98% overall yield.' },
      { stepName: 'Interactive Simulation', title: 'Process Flowsheet Studio', summary: 'Build PFD streams, calculate heat and material balances, and generate stream tables.', linkedModule: 'design' },
      { stepName: 'Engineering Application', title: 'Refinery Hydrogen Network Management', summary: 'Balancing catalytic reformer hydrogen production against hydrotreater and hydrocracker consumptions.' },
      { stepName: 'Assessment', title: 'Degrees of Freedom Analysis & Orsat Viva', summary: 'Determine problem solvability: N_DOF = N_variables - N_independent_equations.' },
      { stepName: 'Industry Connection', title: 'Process Flowsheeting & FEED Engineering', summary: 'Core responsibility of Process Engineers developing Heat and Material Balance (H&MB) tables.' },
    ],
    softwareTools: ['Excel (Solver)', 'Python (NumPy)', 'Aspen Plus', 'DWSIM'],
    industrialApplications: ['Fertilizer ammonia plants', 'Ethylene cracking units', 'Sulfuric acid contact plants'],
    placementSkills: ['Degrees of freedom analysis', 'Heat and Material Balance (H&MB)', 'Combustion air optimization'],
  },
  {
    code: 'CH34',
    title: 'Mechanical Operations & Particle Technology',
    semester: 3,
    credits: '3:0:0 (3 Credits)',
    category: 'Core Chemical Engineering',
    description: 'Particulate characterization, screening effectiveness, crushing energy laws, sedimentation, solid-liquid filtration, drying, agitation, and fluidisation.',
    linkedModule: 'fluidisation',
    outcomes: [
      { coNumber: 'CO1', statement: 'Analyze particle size distributions using differential and cumulative sieve data.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO2', statement: 'Calculate mechanical power requirements using Rittinger, Kick, and Bond crushing laws.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO3', statement: 'Design batch sedimentation thickeners and calculate terminal settling velocities.', poMapping: 'PO1, PO3' },
      { coNumber: 'CO4', statement: 'Evaluate constant pressure filtration equations and minimum fluidisation velocity.', poMapping: 'PO1, PO2, PO3' },
    ],
    units: [
      { unitNumber: 1, title: 'Particle Characterization & Sieve Screening', topics: ['Sphericity and equivalent particle diameters', 'Tyler standard sieve series', 'Differential and cumulative particle size analysis', 'Screen effectiveness and industrial vibrating screens'], hours: 8 },
      { unitNumber: 2, title: 'Size Reduction & Crushing Laws', topics: ['Mechanisms of crushing, impact, and attrition', 'Rittingers law, Kicks law, and Bonds work index law', 'Jaw crushers, gyratory crushers, and ball mill critical speed'], hours: 8 },
      { unitNumber: 3, title: 'Sedimentation, Settling & Thickening', topics: ['Drag coefficients and Stokes settling regime', 'Hindered settling and Richardson-Zaki correlation', 'Kynch batch sedimentation theory', 'Continuous gravity thickener design (Coe-Clevenger method)'], hours: 8 },
      { unitNumber: 4, title: 'Solid-Liquid Filtration Operations', topics: ['Kozeny-Carman cake filtration equation', 'Specific cake resistance and filter medium resistance', 'Plate-and-frame filter press and rotary drum vacuum filters', 'Washing and cycle time optimization'], hours: 8 },
      { unitNumber: 5, title: 'Agitation, Mixing & Fluidisation Dynamics', topics: ['Impeller types (marine propeller, flat blade turbine, anchor)', 'Power number vs Reynolds number agitation correlations', 'Mechanisms of packed bed pressure drop (Ergun equation)', 'Minimum fluidisation velocity and Geldart classification'], hours: 8 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Particulate Two-Phase Hydrodynamics', summary: 'Solid particle interaction with fluid streams, form drag, and collective bed dynamics.' },
      { stepName: 'Visual Explanation', title: 'Packed Bed to Fluidised Bed Transition', summary: 'Live dynamic bed expansion and particle bubbling regimes in the Fluidisation Module.', linkedModule: 'fluidisation' },
      { stepName: 'Mathematical Derivation', title: 'Ergun Equation & Minimum Fluidisation', summary: 'Decomposing pressure drop into viscous Kozeny-Carman and inertial Burke-Plummer components.' },
      { stepName: 'Worked Example', title: 'Bond Work Index Ball Mill Sizing', summary: 'Calculating shaft power to grind 50 tonnes/h of limestone from 80% passing 25 mm to 80% passing 150 μm.' },
      { stepName: 'Interactive Simulation', title: 'Fluidised Bed Apparatus Digital Twin', summary: 'Inspect bed pressure drop, voidage, and Geldart particle classification.', linkedModule: 'fluidisation' },
      { stepName: 'Engineering Application', title: 'Fluidised Catalytic Cracking (FCC) Regeneration', summary: 'Circulating 40 tons/min of zeolite catalyst between riser reactor and regenerator.' },
      { stepName: 'Assessment', title: 'Filtration Resistance & Stokes Law Viva', summary: 'Calculate cake compressibility index and determine thickener area requirements.' },
      { stepName: 'Industry Connection', title: 'Mineral Processing, Cement & Pharmaceutical Solid Ops', summary: 'Solid processing engineers design crushers, cyclones, and spray dryers.' },
    ],
    softwareTools: ['Python', 'Excel', 'ImageJ (Particle sizing)'],
    industrialApplications: ['Cement clinker grinding', 'Refinery FCC units', 'Pharma tablet granulators', 'Wastewater sludge dewatering'],
    placementSkills: ['Particle size analysis', 'Filtration cycle design', 'Fluidisation regime mapping'],
  },
  {
    code: 'CHL39',
    title: 'Mechanical Operations Laboratory',
    semester: 3,
    credits: '0:0:1.5 (1.5 Credits)',
    category: 'Laboratory Course',
    description: 'Hands-on laboratory experiments verifying particle size distribution, crushing laws, sedimentation, and fluidisation dynamics.',
    linkedModule: 'fluidisation',
    outcomes: [
      { coNumber: 'CO1', statement: 'Conduct sieve screen analysis and determine particle size distribution parameters.', poMapping: 'PO1, PO4' },
      { coNumber: 'CO2', statement: 'Measure minimum fluidisation velocity and bed pressure drop in a gas-solid fluidised bed.', poMapping: 'PO1, PO2, PO4' },
    ],
    units: [],
    labs: [
      { expNumber: 1, title: 'Sieve Analysis of Granular Solids', objective: 'Determine mean particle size and screen effectiveness using Tyler standard sieves.', apparatus: 'Ro-Tap sieve shaker, Tyler sieve stack, analytical balance.', procedureSummary: 'Weigh 500g sand sample; place in top sieve; shake for 15 min; weigh mass retained on each sieve; plot cumulative frequency.' },
      { expNumber: 2, title: 'Jaw Crusher Size Reduction', objective: 'Verify Rittinger and Kick crushing laws by crushing coarse gravel.', apparatus: 'Blake-type jaw crusher, electric motor, caliper.', procedureSummary: 'Measure initial rock dimensions; feed into jaw crusher; screen crushed product; calculate reduction ratio and energy input.' },
      { expNumber: 3, title: 'Gas-Solid Fluidisation Dynamics', objective: 'Measure bed pressure drop, minimum fluidisation velocity (u_mf), and bed expansion ratio.', apparatus: 'Transparent acrylic vertical fluidised bed column, porous distributor, manometer.', procedureSummary: 'Load silica sand bed; increase superficial air velocity; record bed pressure drop and bed height; identify bubbling regime.', linkedModule: 'fluidisation' },
      { expNumber: 4, title: 'Batch Sedimentation of Calcium Carbonate', objective: 'Determine settling velocity and construct Kynch interface height curves.', apparatus: '1000 mL graduated glass cylinder, stop watch, CaCO3 slurry.', procedureSummary: 'Prepare 5%, 10%, and 15% CaCO3 slurry; invert cylinder to homogenize; record mudline interface height vs time.' },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Hands-on Experimental Verification', summary: 'Validating theoretical mechanics of particulate operations through measured laboratory data.' },
      { stepName: 'Visual Explanation', title: 'Apparatus Schematic & Manometer Hookups', summary: 'Inspect fluidised bed column pressure taps, rotameter calibration, and cyclone dust collection.' },
      { stepName: 'Mathematical Derivation', title: 'Kynch Batch Sedimentation Theory', summary: 'Deriving propagation velocity of solid concentration waves from interface settling rates.' },
      { stepName: 'Worked Example', title: 'Calculation of Specific Cake Resistance', summary: 'Plotting t/V vs V from batch leaf filtration data to determine slope K_p and intercept B.' },
      { stepName: 'Interactive Simulation', title: 'Virtual Laboratory Experiment Workbench', summary: 'Record live observation tables, compute standard deviations, and generate printable lab reports.', linkedModule: 'lab' },
      { stepName: 'Engineering Application', title: 'Gravity Thickener Sizing in Effluent Plants', summary: 'Translating batch cylinder settling velocities to continuous industrial thickener diameter.' },
      { stepName: 'Assessment', title: 'Laboratory Viva Voce & Error Analysis', summary: 'Identify sources of parallax in manometer readings and non-spherical shape factors.' },
      { stepName: 'Industry Connection', title: 'Plant Commissioning & QA/QC Analysis', summary: 'Operations and quality engineers calibrate rotameters and verify filter cake moisture.' },
    ],
  },

  // =========================================================================
  // SEMESTER IV
  // =========================================================================
  {
    code: 'CH41',
    title: 'Chemical Reaction Engineering I (CRE-I)',
    semester: 4,
    credits: '3:1:0 (4 Credits)',
    category: 'Core Chemical Engineering',
    description: 'Homogeneous kinetics, batch reactors, isothermal CSTR and PFR design equations, reactors in series and parallel, yield, and selectivity.',
    linkedModule: 'reactor',
    outcomes: [
      { coNumber: 'CO1', statement: 'Determine rate laws and activation energies from differential and integral kinetic data.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO2', statement: 'Design isothermal Batch, CSTR, and PFR reactors for liquid and gas phase reactions.', poMapping: 'PO1, PO2, PO3' },
      { coNumber: 'CO3', statement: 'Size multiple reactor networks (reactors in series and parallel) for maximum conversion.', poMapping: 'PO1, PO3, PO5' },
      { coNumber: 'CO4', statement: 'Optimize yield and selectivity for parallel and series complex reaction networks.', poMapping: 'PO1, PO2, PO3' },
    ],
    units: [
      { unitNumber: 1, title: 'Homogeneous Reaction Kinetics', topics: ['Rate of reaction and temperature dependence (Arrhenius equation)', 'Elementary vs non-elementary reaction mechanisms', 'Differential and integral methods of kinetic analysis'], hours: 10 },
      { unitNumber: 2, title: 'Ideal Batch Reactor Design', topics: ['Constant-volume and variable-volume batch reactor equations', 'Reaction time for 0th, 1st, and 2nd order kinetics', 'Autocatalytic reactions'], hours: 10 },
      { unitNumber: 3, title: 'Continuous Stirred Tank Reactor (CSTR)', topics: ['Steady-state CSTR design equation', 'Space time (τ) and space velocity', 'Damköhler number (Da) scaling', 'Graphical sizing using Levenspiel plots'], hours: 10 },
      { unitNumber: 4, title: 'Plug Flow Reactor (PFR) & Reactor Comparison', topics: ['Ideal PFR design equation', 'PFR vs CSTR volume comparison for same conversion', 'CSTRs in series and equal vs unequal volume optimization'], hours: 10 },
      { unitNumber: 5, title: 'Multiple Reactions & Yield/Selectivity', topics: ['Parallel competing reactions (A -> R desired, A -> S undesired)', 'Instantaneous and overall fractional yield', 'Series consecutive reactions (A -> R -> S) and maximum intermediate concentration'], hours: 10 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Chemical Transformation & Conservation of Moles', summary: 'Rate of generation of species per unit volume governed by Arrhenius kinetics and mixing.' },
      { stepName: 'Visual Explanation', title: 'CSTR vs PFR Concentration Profiles', summary: 'Observe well-mixed exit concentration in CSTR vs spatial exponential decay in PFR in Visual Concept Studio.', linkedModule: 'learn' },
      { stepName: 'Mathematical Derivation', title: 'Design Equations from Mole Balance', summary: 'Deriving V_CSTR = F_A0 X / (-r_A) and V_PFR = F_A0 ∫ (dX / -r_A).' },
      { stepName: 'Worked Example', title: 'Sizing an Isothermal CSTR for 85% Conversion', summary: 'Liquid phase saponification with k = 0.05 m3/(kmol·s) and feed rate 100 L/min.' },
      { stepName: 'Interactive Simulation', title: 'Chemical Reactor Simulation Module', summary: 'Compare CSTR vs PFR volume ratios as Damköhler number scales from 0.1 to 10.', linkedModule: 'reactor' },
      { stepName: 'Engineering Application', title: 'Polymerization Autoclaves & Petrochemical Tubular Loops', summary: 'Designing LDPE high-pressure tubular reactors vs stirred slurry polymerizers.' },
      { stepName: 'Assessment', title: 'Levenspiel Plot Interpretation & Yield Optimization', summary: 'Identify whether high or low reactant concentration favors desired product selectivity.' },
      { stepName: 'Industry Connection', title: 'Reaction Engineering & Pilot Plant Scale-up', summary: 'Process R&D chemists and scale-up engineers at Dow, BASF, and Reliance.' },
    ],
    workedProblems: [
      {
        title: 'CSTR vs PFR Volume Comparison for 1st Order Kinetics',
        problem: 'A liquid reaction A -> B (k = 0.2 min-1) is to achieve 90% conversion (X = 0.90) at volumetric flow rate v0 = 50 L/min. Compare required volumes of CSTR and PFR.',
        solution: 'For CSTR: V_CSTR = v0 * X / [k (1 - X)] = 50 * 0.90 / [0.2 * (1 - 0.90)] = 45 / [0.2 * 0.10] = 2250 Liters (2.25 m3). For PFR: V_PFR = (v0 / k) * ln(1 / (1 - X)) = (50 / 0.2) * ln(1 / 0.10) = 250 * 2.3026 = 575.6 Liters (0.576 m3). Volume ratio V_CSTR / V_PFR = 2250 / 575.6 = 3.91. A CSTR requires nearly 4 times the volume of a PFR due to operating at the lowest reactant concentration.',
      },
    ],
    vivaQuestions: [
      { q: 'Why is a PFR always smaller than a CSTR for positive-order reactions achieving the same conversion?', a: 'In a PFR, reactant concentration starts high at the inlet and decreases along the tube, keeping the average reaction rate high. A CSTR operates throughout its entire volume at the lowest (exit) reactant concentration, yielding a lower rate and requiring a larger volume.' },
    ],
    softwareTools: ['Python (scipy.integrate.solve_ivp)', 'Aspen Plus (RCSTR, RPLUG)', 'DWSIM'],
    industrialApplications: ['Polyethylene tubular reactors', 'Benzene alkylation CSTRs', 'Pharmaceutical active synthesis'],
    placementSkills: ['Reactor design equations', 'Levenspiel graphical integration', 'Damköhler scaling', 'Selectivity optimization'],
  },
  {
    code: 'CH42',
    title: 'Process Heat Transfer',
    semester: 4,
    credits: '3:1:0 (4 Credits)',
    category: 'Core Chemical Engineering',
    description: 'Conduction, convection, radiation, LMTD, overall heat transfer coefficients, shell-and-tube heat exchangers, condensers, evaporators, and fouling.',
    linkedModule: 'heat-exchanger',
    outcomes: [
      { coNumber: 'CO1', statement: 'Formulate 1D and radial steady-state conduction through multi-layer composite walls.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO2', statement: 'Calculate convective heat transfer coefficients using empirical dimensionless correlations.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO3', statement: 'Design countercurrent shell-and-tube heat exchangers using LMTD and ε-NTU methods.', poMapping: 'PO1, PO3' },
      { coNumber: 'CO4', statement: 'Analyze radiation heat exchange, boiling regimes, and multiple-effect evaporators.', poMapping: 'PO1, PO2, PO3' },
    ],
    units: [
      { unitNumber: 1, title: 'Conduction Heat Transfer', topics: ['Fouriers law and thermal conductivity of solids, liquids, gases', 'Steady-state 1D conduction through plane walls, cylinders, spheres', 'Critical insulation thickness for cylindrical pipes', 'Extended surfaces (long and short fins)'], hours: 10 },
      { unitNumber: 2, title: 'Forced & Natural Convection', topics: ['Thermal boundary layer and Prandtl number (Pr)', 'Forced convection inside tubes (Dittus-Boelter and Sieder-Tate equations)', 'Natural convection over vertical plates (Grashof and Rayleigh numbers)'], hours: 10 },
      { unitNumber: 3, title: 'Heat Exchanger Design & LMTD Rating', topics: ['Double-pipe and shell-and-tube heat exchanger construction', 'Log Mean Temperature Difference (LMTD) and crossflow F-factor', 'Overall heat transfer coefficient U and fouling factors', 'Effectiveness-NTU (Number of Transfer Units) method'], hours: 10 },
      { unitNumber: 4, title: 'Condensation, Boiling & Evaporation', topics: ['Dropwise vs filmwise condensation on vertical tubes (Nusselt theory)', 'Pool boiling curve (nucleate boiling, critical heat flux, film boiling)', 'Single and multiple-effect evaporators with boiling point elevation'], hours: 10 },
      { unitNumber: 5, title: 'Thermal Radiation & Furnaces', topics: ['Stefan-Boltzmann law, Plancks law, and Wiens displacement law', 'Emissivity and view factor determination between surfaces', 'Radiation shields and industrial furnace heat transfer'], hours: 10 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Thermal Driving Force & Resistance Networks', summary: 'Heat flux proportional to temperature gradient with conductive, convective, and fouling resistances.' },
      { stepName: 'Visual Explanation', title: 'Counter-Current vs Co-Current Temperature Gradients', summary: 'Observe approach temperatures and thermal pinch in Visual Concept Studio.', linkedModule: 'learn' },
      { stepName: 'Mathematical Derivation', title: 'Log Mean Temperature Difference (LMTD)', summary: 'Deriving ΔT_lm = (ΔT1 - ΔT2) / ln(ΔT1 / ΔT2) from differential enthalpy balances.' },
      { stepName: 'Worked Example', title: 'Shell-and-Tube Exchanger Thermal Sizing', summary: 'Rating a 1-2 shell and tube exchanger heating 10,000 kg/h of kerosene using hot gas oil.' },
      { stepName: 'Interactive Simulation', title: 'Heat Exchanger Simulation Module', summary: 'Explore overall U, tube counts, baffle cut percentages, and tube-side pressure drops.', linkedModule: 'heat-exchanger' },
      { stepName: 'Engineering Application', title: 'Crude Distillation Pre-Heat Train', summary: 'Recovering waste heat from hot petroleum distillation side-draws into cold crude oil.' },
      { stepName: 'Assessment', title: 'TEMA Classifications & Fouling Factor Viva', summary: 'Explain why countercurrent flow achieves a higher LMTD than cocurrent flow.' },
      { stepName: 'Industry Connection', title: 'Thermal Design & Rating (HTRI / TEMA)', summary: 'Thermal engineers design shell & tube, plate-and-frame, and air-cooled exchangers.' },
    ],
    softwareTools: ['HTRI Xchanger Suite', 'Aspen EDR', 'Python (CoolProp)', 'Excel'],
    industrialApplications: ['Refinery preheat trains', 'Reboilers and condensers', 'LNG cryogenic cold boxes'],
    placementSkills: ['TEMA standards', 'LMTD and ε-NTU rating', 'Baffle cut optimization', 'Fouling factor allowances'],
  },
  {
    code: 'CH43',
    title: 'Mass Transfer Operations I',
    semester: 4,
    credits: '3:0:0 (3 Credits)',
    category: 'Core Chemical Engineering',
    description: 'Molecular diffusion in gases and liquids, mass transfer coefficients, interphase mass transfer, two-film theory, humidification, cooling towers, and drying.',
    linkedModule: 'distillation',
    outcomes: [
      { coNumber: 'CO1', statement: 'Calculate steady-state molecular diffusion fluxes in binary gas and liquid mixtures.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO2', statement: 'Evaluate mass transfer coefficients using film, penetration, and surface renewal theories.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO3', statement: 'Determine operating lines and interphase mass transfer rates in packed towers.', poMapping: 'PO1, PO3' },
      { coNumber: 'CO4', statement: 'Design industrial cooling towers and calculate drying times for moist solids.', poMapping: 'PO1, PO3' },
    ],
    units: [
      { unitNumber: 1, title: 'Molecular Diffusion & Ficks Law', topics: ['Ficks first law of diffusion in stationary and moving media', 'Equimolar counterdiffusion (EMD) in binary gases', 'Unimolecular diffusion through stagnant gas (Stefan tube)', 'Diffusivity estimation (Fuller correlation)'], hours: 8 },
      { unitNumber: 2, title: 'Mass Transfer Coefficients', topics: ['Individual and overall mass transfer coefficients (k_c, k_y, K_y)', 'Dimensionless numbers: Schmidt (Sc), Sherwood (Sh), Peclet (Pe)', 'Film theory, Higbie penetration theory, and Danckwerts surface renewal theory'], hours: 8 },
      { unitNumber: 3, title: 'Interphase Mass Transfer & Two-Film Theory', topics: ['Lewis-Whitman two-film model and equilibrium interface conditions', 'Henry law and gas-liquid solubility equilibria', 'Gas-film vs liquid-film controlled processes'], hours: 8 },
      { unitNumber: 4, title: 'Humidification Operations & Cooling Towers', topics: ['Absolute humidity, relative humidity, dry-bulb and wet-bulb temperatures', 'Psychrometric chart and adiabatic saturation lines', 'Induced-draft and forced-draft cooling tower design (Merkel equation)'], hours: 8 },
      { unitNumber: 5, title: 'Drying Operations of Wet Solids', topics: ['Equilibrium moisture content and free vs bound moisture', 'Constant-rate drying period and critical moisture content', 'Falling-rate drying period and internal moisture diffusion', 'Industrial dryers (rotary, spray, fluidized bed, vacuum)'], hours: 8 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Chemical Potential & Concentration Driving Forces', summary: 'Molecular transport driven by chemical potential gradients across interfacial boundaries.' },
      { stepName: 'Visual Explanation', title: 'Two-Film Model Interfacial Gradient', summary: 'Visualizing gas and liquid boundary layers and equilibrium partition at the phase interface.' },
      { stepName: 'Mathematical Derivation', title: 'Equimolar Counterdiffusion vs Stagnant Gas', summary: 'Deriving N_A = (D_AB P / R T z) ln[(P - p_A2)/(P - p_A1)] for diffusion through stagnant B.' },
      { stepName: 'Worked Example', title: 'Stefan Tube Evaporation Rate of Acetone', summary: 'Calculating daily evaporation loss of acetone liquid in an open cylindrical vessel.' },
      { stepName: 'Interactive Simulation', title: 'Binary Separation Simulation', summary: 'Explore equilibrium curves, relative volatility, and mass transfer stage stepping.', linkedModule: 'distillation' },
      { stepName: 'Engineering Application', title: 'Natural Draft Cooling Towers in Power Plants', summary: 'Evaporative cooling of condenser circulation water using psychrometric wet-bulb approach.' },
      { stepName: 'Assessment', title: 'Sherwood-Schmidt Dimensionless Group Viva', summary: 'Explain the physical significance of Schmidt number Sc = μ / (ρ D_AB).' },
      { stepName: 'Industry Connection', title: 'Separation Systems Engineering', summary: 'Process engineers design absorption scrubbers, cooling towers, and industrial dryers.' },
    ],
    softwareTools: ['Python', 'Excel', 'Aspen Plus (RadFrac / Sep)'],
    industrialApplications: ['Flue gas desulfurization scrubbers', 'Plant cooling water systems', 'Spray dryers for milk and detergent powder'],
    placementSkills: ['Psychrometric chart analysis', 'Diffusion flux calculations', 'Cooling tower sizing (Merkel method)'],
  },
  {
    code: 'CH44',
    title: 'Chemical Engineering Thermodynamics (CET-I)',
    semester: 4,
    credits: '3:1:0 (4 Credits)',
    category: 'Core Chemical Engineering',
    description: 'First and second laws of thermodynamics, PVT equations of state, fugacity, activity coefficients, vapor-liquid equilibria (VLE), and phase rule.',
    linkedModule: 'thermo',
    outcomes: [
      { coNumber: 'CO1', statement: 'Apply first and second laws of thermodynamics to open and closed process systems.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO2', statement: 'Calculate non-ideal gas compressibility using cubic equations of state (Van der Waals, Peng-Robinson).', poMapping: 'PO1, PO2' },
      { coNumber: 'CO3', statement: 'Evaluate residual properties, fugacity coefficients, and chemical potentials.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO4', statement: 'Construct binary vapor-liquid equilibrium (T-x-y and P-x-y) phase diagrams.', poMapping: 'PO1, PO2, PO3' },
    ],
    units: [
      { unitNumber: 1, title: 'First & Second Laws for Process Systems', topics: ['First law for steady-state flow systems (shaft work and enthalpy)', 'Carnot cycle, entropy generation, and second law limitations', 'Exergy and thermodynamic efficiency of process plants'], hours: 10 },
      { unitNumber: 2, title: 'PVT Behavior & Cubic Equations of State', topics: ['Critical state, theorem of corresponding states, and acentric factor ω', 'Van der Waals, Redlich-Kwong, Soave-Redlich-Kwong, and Peng-Robinson EOS', 'Virial equation of state and compressibility factor Z'], hours: 10 },
      { unitNumber: 3, title: 'Thermodynamic Properties of Pure Fluids', topics: ['Fundamental property relations and Maxwell equations', 'Residual enthalpy and residual entropy calculations', 'Clapeyron and Clausius-Clapeyron equations for vapor pressure'], hours: 10 },
      { unitNumber: 4, title: 'Solution Thermodynamics & Fugacity', topics: ['Chemical potential and partial molar properties', 'Fugacity and fugacity coefficient of pure gases and gas mixtures', 'Ideal solutions and Lewis-Randall rule'], hours: 10 },
      { unitNumber: 5, title: 'Vapor-Liquid Equilibrium (VLE)', topics: ['Raoults law and modified Raoults law with activity coefficients', 'Margules, Van Laar, and Wilson activity coefficient models', 'Azeotropic behavior and thermodynamic consistency (Gibbs-Duhem equation)'], hours: 10 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Equilibrium & Maximum Entropy', summary: 'Thermodynamic equilibrium condition: equal temperature, pressure, and chemical potential across phases.' },
      { stepName: 'Visual Explanation', title: 'Binary T-x-y Phase Envelopes & Tie Lines', summary: 'Observe bubble-point and dew-point curves with lever-arm rule in Visual Concept Studio.', linkedModule: 'learn' },
      { stepName: 'Mathematical Derivation', title: 'Fugacity & Modified Raoults Law', summary: 'Deriving y_i P = x_i γ_i P_i_sat with Poynting correction factor.' },
      { stepName: 'Worked Example', title: 'Bubble Point Temperature of Benzene-Toluene', summary: 'Calculating boiling temperature and vapor composition at 101.325 kPa using Antoine equations.' },
      { stepName: 'Interactive Simulation', title: 'Thermodynamic Properties & VLE Module', summary: 'Compute Antoine vapor pressures, enthalpy deviations, and phase envelopes.', linkedModule: 'thermo' },
      { stepName: 'Engineering Application', title: 'Flash Vessel Design in Gas Processing', summary: 'Sizing high-pressure separator flash drums separating methane gas from condensate liquids.' },
      { stepName: 'Assessment', title: 'Gibbs-Duhem Thermodynamic Consistency Viva', summary: 'Test whether experimental activity coefficient data satisfy Σ x_i d(ln γ_i) = 0.' },
      { stepName: 'Industry Connection', title: 'Thermodynamic Property Method Selection', summary: 'Process simulation specialists select Peng-Robinson, NRTL, or UNIQUAC in AspenTech / AVEVA.' },
    ],
    softwareTools: ['DWSIM', 'Python (thermopack)', 'Aspen Plus (Properties)', 'Excel'],
    industrialApplications: ['Natural gas dew-point control', 'Refrigeration cycle design', 'Azeotropic distillation'],
    placementSkills: ['Property method selection (Equation of State vs Activity Coefficient)', 'Flash calculations', 'Thermodynamic consistency testing'],
  },

  // =========================================================================
  // SEMESTER V
  // =========================================================================
  {
    code: 'CH51',
    title: 'Chemical Reaction Engineering II (CRE-II)',
    semester: 5,
    credits: '3:1:0 (4 Credits)',
    category: 'Core Chemical Engineering',
    description: 'Heterogeneous reaction kinetics, fluid-particle shrinking core model, catalytic mechanisms (Langmuir-Hinshelwood), BET surface area, pore diffusion, and catalyst deactivation.',
    linkedModule: 'reactor',
    outcomes: [
      { coNumber: 'CO1', statement: 'Model non-catalytic fluid-solid reacting systems using progressive conversion and shrinking core models.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO2', statement: 'Derive catalytic rate expressions using Langmuir-Hinshelwood and Eley-Rideal mechanisms.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO3', statement: 'Evaluate internal pore diffusion limitations, Thiele modulus, and catalyst effectiveness factors.', poMapping: 'PO1, PO2, PO3' },
      { coNumber: 'CO4', statement: 'Design industrial packed-bed, fluidized-bed, and slurry catalytic reactors.', poMapping: 'PO1, PO3, PO5' },
    ],
    units: [
      { unitNumber: 1, title: 'Non-Catalytic Heterogeneous Fluid-Solid Systems', topics: ['Progressive conversion vs shrinking unreacted core model', 'Gas film diffusion control, ash layer diffusion control, and chemical reaction control', 'Time required for complete conversion of constant and shrinking size particles'], hours: 10 },
      { unitNumber: 2, title: 'Solid Catalysts & Surface Adsorption', topics: ['Physical properties of catalysts (surface area, pore volume, tortuosity)', 'BET adsorption isotherm and surface area measurement', 'Langmuir-Hinshelwood and Eley-Rideal rate mechanisms with surface reaction rate control'], hours: 10 },
      { unitNumber: 3, title: 'Internal Transport in Porous Catalysts', topics: ['Knudsen diffusion and molecular diffusion inside pores', 'Thiele modulus (Φ) and internal effectiveness factor (η)', 'Weisz-Prater criterion for internal diffusion limitations', 'Mears criterion for external mass and heat transfer resistance'], hours: 10 },
      { unitNumber: 4, title: 'Catalyst Deactivation Mechanisms', topics: ['Types of deactivation: coking, poisoning, sintering, and attrition', 'Kinetics of deactivation and time-dependent conversion', 'Catalyst regeneration protocols in moving and fluidised beds'], hours: 10 },
      { unitNumber: 5, title: 'Industrial Heterogeneous Reactor Design', topics: ['Packed bed fixed reactors and axial/radial temperature gradients', 'Fluidised catalytic cracking reactors and riser design', 'Three-phase trickle-bed and slurry reactors (hydrotreating, Fischer-Tropsch)'], hours: 10 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Heterogeneous Transport-Reaction Couplings', summary: 'Reactions involving solid interfaces where diffusion through boundary films and porous ash layers couples with intrinsic surface kinetics.' },
      { stepName: 'Visual Explanation', title: 'Shrinking Core Progression & Pore Diffusion', summary: 'Visualizing concentration drop across external film, ash layer, and unreacted core boundary.' },
      { stepName: 'Mathematical Derivation', title: 'Thiele Modulus & Effectiveness Factor', summary: 'Deriving η = (3 / Φ) [Φ coth(Φ) - 1] for spherical catalyst pellets.' },
      { stepName: 'Worked Example', title: 'Shrinking Core Iron Ore Reduction', summary: 'Calculating time to achieve 90% reduction of Fe2O3 pellets under ash diffusion control.' },
      { stepName: 'Interactive Simulation', title: 'Heterogeneous Catalytic Bed Simulation', summary: 'Vary Thiele modulus and observe effectiveness factor drop from 1.0 down to diffusion-limited 0.15.', linkedModule: 'reactor' },
      { stepName: 'Engineering Application', title: 'Hydrodesulfurization (HDS) Trickle Bed Reactors', summary: 'Removing sulfur from diesel over Co-Mo/Al2O3 catalyst pellets in high-pressure hydrogen.' },
      { stepName: 'Assessment', title: 'Weisz-Prater & Mears Criteria Viva', summary: 'Diagnose whether an industrial catalytic reactor is chemically controlled or mass-transfer controlled.' },
      { stepName: 'Industry Connection', title: 'Refinery Catalysis & Petrochemical R&D', summary: 'Catalysis engineers at Haldor Topsoe, UOP Honeywell, and Johnson Matthey.' },
    ],
    softwareTools: ['Python (NumPy / SciPy)', 'Aspen Plus (RBed)', 'COMSOL Multiphysics'],
    industrialApplications: ['FCC riser regenerators', 'Diesel hydrotreating reactors', 'Steam methane reforming furnaces'],
    placementSkills: ['Thiele modulus & effectiveness factor', 'Shrinking core sizing', 'Catalyst deactivation kinetics'],
  },
  {
    code: 'CH52',
    title: 'Process Equipment Design & Mechanical Sizing',
    semester: 5,
    credits: '3:1:0 (4 Credits)',
    category: 'Core Chemical Engineering',
    description: 'ASME Section VIII pressure vessel design, internal and external pressure heads, jacketed stirred vessels, TEMA shell & tube heat exchangers, and column tray sizing.',
    linkedModule: 'design',
    outcomes: [
      { coNumber: 'CO1', statement: 'Calculate minimum shell and head wall thicknesses for internal pressure vessels per ASME Sec VIII Div 1.', poMapping: 'PO1, PO2, PO3' },
      { coNumber: 'CO2', statement: 'Design standard dished heads (torispherical, ellipsoidal, hemispherical) and nozzle reinforcement pads.', poMapping: 'PO1, PO3' },
      { coNumber: 'CO3', statement: 'Design jacketed reactor vessels, support skirts, and saddle supports for horizontal drums.', poMapping: 'PO1, PO3, PO5' },
      { coNumber: 'CO4', statement: 'Generate mechanical datasheets and engineering fabrication specifications.', poMapping: 'PO1, PO3, PO10' },
    ],
    units: [
      { unitNumber: 1, title: 'Pressure Vessel Mechanics & Codes', topics: ['ASME Boiler and Pressure Vessel Code (Section VIII Div 1)', 'Design pressure, design temperature, and maximum allowable working pressure (MAWP)', 'Corrosion allowance and joint efficiency factors'], hours: 10 },
      { unitNumber: 2, title: 'Shells, Heads & Closures', topics: ['Cylindrical and spherical shells under internal pressure', 'Formed heads: 2:1 Ellipsoidal, Torispherical (Klopper/Korbbogen), Hemispherical, Conical', 'Area replacement method for nozzle opening reinforcement'], hours: 10 },
      { unitNumber: 3, title: 'External Pressure & Jacketed Vessels', topics: ['Buckling of cylindrical shells under external vacuum', 'Stiffening ring design and spacing', 'Dimpled and limpet coil jackets for stirred chemical reactors'], hours: 10 },
      { unitNumber: 4, title: 'TEMA Heat Exchanger Mechanical Design', topics: ['TEMA Class R, B, and C standards', 'Tubesheet thickness calculation and tube-to-tubesheet joint methods', 'Channel covers, floating head backing rings, and longitudinal baffles'], hours: 10 },
      { unitNumber: 5, title: 'Supports & Tall Vertical Columns', topics: ['Skirt supports, base rings, and anchor bolts for vertical distillation columns', 'Wind load and seismic vibration bending moments', 'Saddle supports for horizontal storage drums (Zick analysis)'], hours: 10 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Mechanical Integrity & Pressure Containment', summary: 'Sizing wall thicknesses, welds, and nozzle reinforcements to prevent burst, fatigue, or elastic buckling.' },
      { stepName: 'Visual Explanation', title: 'ASME Vessel Cross-Sections & Nozzle Pads', summary: 'Inspect nozzle reinforcement area replacement and head geometry in Process Design Studio.', linkedModule: 'design' },
      { stepName: 'Mathematical Derivation', title: 'Circumferential & Longitudinal Membrane Stresses', summary: 'Deriving t = (P R) / (S E - 0.6 P) + C_A from thin cylinder hoop stress.' },
      { stepName: 'Worked Example', title: 'ASME Sizing of an LPG Storage Bullet', summary: 'Designing a 3.0 m diameter horizontal LPG bullet operating at 1.8 MPa with ellipsoidal heads.' },
      { stepName: 'Interactive Simulation', title: 'Engineering Equipment Datasheet Generator', summary: 'Generate procurement-ready API 610 and ASME Sec VIII equipment datasheets.', linkedModule: 'design' },
      { stepName: 'Engineering Application', title: 'Offshore Separator Vessel Fabrication', summary: 'Designing high-pressure gas-oil-water separators with NACE sour service material metallurgy.' },
      { stepName: 'Assessment', title: 'Area Replacement Method & Joint Efficiency Viva', summary: 'Calculate required reinforcing ring area A_req = d * t_r * F for an 8-inch vessel nozzle.' },
      { stepName: 'Industry Connection', title: 'Static Equipment Design & Pressure Vessel EPC', summary: 'Equipment design engineers at L&T Heavy Engineering, Godrej, Fluor, and Technip.' },
    ],
    softwareTools: ['PV Elite', 'AutoCAD Plant 3D', 'Python (ASME Calc)', 'Excel'],
    industrialApplications: ['Refinery fractionator vessels', 'LPG bullet storage mounded tanks', 'Ammonia converter shells'],
    placementSkills: ['ASME Section VIII Div 1 code calculations', 'TEMA mechanical design', 'Nozzle reinforcement analysis'],
  },
  {
    code: 'CH53',
    title: 'Chemical Process Industries (CPI)',
    semester: 5,
    credits: '3:0:0 (3 Credits)',
    category: 'Core Chemical Engineering',
    description: 'Industrial manufacturing flowsheets, reaction chemistry, raw material purification, environmental controls, and unit operations for sulfur, fertilizer, chlor-alkali, petroleum, and polymer industries.',
    outcomes: [
      { coNumber: 'CO1', statement: 'Describe manufacturing flowsheets, raw materials, and reactions for major inorganic chemicals.', poMapping: 'PO1, PO7' },
      { coNumber: 'CO2', statement: 'Analyze fertilizer manufacturing processes (ammonia, urea, phosphoric acid, NPK).', poMapping: 'PO1, PO2' },
      { coNumber: 'CO3', statement: 'Examine petroleum refining processes: atmospheric distillation, catalytic cracking, and reforming.', poMapping: 'PO1, PO7' },
      { coNumber: 'CO4', statement: 'Evaluate environmental emissions, energy recovery, and waste valorization in process industries.', poMapping: 'PO1, PO6, PO7' },
    ],
    units: [
      { unitNumber: 1, title: 'Sulfur, Industrial Gases & Mineral Acids', topics: ['Frasch process and Claus sulfur recovery from sour gas', 'Contact process for Sulfuric acid manufacturing (DCDA technology)', 'Haber-Bosch process for Ammonia and Nitric acid manufacturing (Ostwald process)'], hours: 8 },
      { unitNumber: 2, title: 'Chlor-Alkali & Fertilizer Industries', topics: ['Electrochemical chlor-alkali: diaphragm, mercury, and modern membrane cells', 'Urea manufacturing (Stamicarbon vs Snamprogetti stripping processes)', 'Phosphatic fertilizers: Wet process phosphoric acid and diammonium phosphate (DAP)'], hours: 8 },
      { unitNumber: 3, title: 'Petroleum Refining & Petrochemicals', topics: ['Crude oil desalting and Atmospheric/Vacuum Distillation Units (ADU/VDU)', 'Fluidized Catalytic Cracking (FCC) and Hydrocracking', 'Steam cracking of naphtha for ethylene, propylene, and BTX aromatics'], hours: 8 },
      { unitNumber: 4, title: 'Polymers, Elastomers & Fermentation Industries', topics: ['Polyethylene (LDPE, LLDPE, HDPE) and Polypropylene manufacturing', 'Bioethanol fermentation and distillation', 'Pulp and paper manufacturing (Kraft sulfate process) and sugar industry'], hours: 8 },
      { unitNumber: 5, title: 'Paints, Pigments, Soaps & Cement', topics: ['Titanium dioxide pigment manufacturing (chloride vs sulfate routes)', 'Continuous saponification of fats and synthetic detergent alkylation', 'Portland cement manufacturing (dry rotary kiln process)'], hours: 8 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Integrated Industrial Process Flowsheets', summary: 'How laboratory chemical reactions scale into multi-thousand metric ton commercial continuous plants.' },
      { stepName: 'Visual Explanation', title: 'Haber-Bosch & Urea Synthesis Loop Flowsheet', summary: 'Visualizing synthesis gas compression, high-pressure carbamate reaction, and prilling.' },
      { stepName: 'Mathematical Derivation', title: 'DCDA Contact Process Conversion Thermodynamics', summary: 'Equilibrium conversion of SO2 to SO3 across 4-pass adiabatic catalyst beds.' },
      { stepName: 'Worked Example', title: 'Sulfur Burning Air and Energy Balance', summary: 'Calculating steam generation from waste heat boilers cooling 11% SO2 burner gas from 1050°C to 420°C.' },
      { stepName: 'Interactive Simulation', title: 'Process Flowsheet Canvas', summary: 'Build and trace streams through chemical production loops in Process Design Studio.', linkedModule: 'design' },
      { stepName: 'Engineering Application', title: 'Modern Membrane Chlor-Alkali Operations', summary: 'Preventing brine impurities (Ca2+, Mg2+) from fouling perfluorosulfonic ion-exchange membranes.' },
      { stepName: 'Assessment', title: 'Unit Operations & Troubleshooting in CPI Viva', summary: 'Explain how DCDA (Double Contact Double Absorption) achieves 99.7% SO2 conversion.' },
      { stepName: 'Industry Connection', title: 'Plant Operations & Production Engineering', summary: 'Shift production engineers at Reliance, IFFCO, Tata Chemicals, and Grasim Industries.' },
    ],
    softwareTools: ['Process Flow Diagram Tools', 'Excel Material Balance Models'],
    industrialApplications: ['Mega fertilizer complexes', 'Integrated petrochemical refineries', 'Chlor-alkali plants'],
    placementSkills: ['Industrial flowsheet reading', 'Raw material stoichiometry', 'Byproduct recovery & energy pinch'],
  },
  {
    code: 'CH54',
    title: 'Mass Transfer Operations II',
    semester: 5,
    credits: '3:1:0 (4 Credits)',
    category: 'Core Chemical Engineering',
    description: 'Vapor-liquid distillation, McCabe-Thiele and Ponchon-Savarit methods, packed column absorption, HTU/NTU, liquid-liquid extraction, leaching, and membrane separations.',
    linkedModule: 'distillation',
    outcomes: [
      { coNumber: 'CO1', statement: 'Determine theoretical stages and reflux ratios for binary distillation using McCabe-Thiele method.', poMapping: 'PO1, PO2, PO3' },
      { coNumber: 'CO2', statement: 'Calculate packed column height for gas absorption using Number of Transfer Units (NTU) and Height of Transfer Unit (HTU).', poMapping: 'PO1, PO2, PO3' },
      { coNumber: 'CO3', statement: 'Design liquid-liquid extraction cascades using triangular ternary phase equilibrium diagrams.', poMapping: 'PO1, PO2, PO3' },
      { coNumber: 'CO4', statement: 'Evaluate solid-liquid leaching, crystallization, and membrane separation processes.', poMapping: 'PO1, PO3' },
    ],
    units: [
      { unitNumber: 1, title: 'Distillation Principles & McCabe-Thiele Method', topics: ['Vapor-liquid equilibrium, relative volatility, and Raoults law', 'Fractionating column construction: rectifying, stripping, and feed sections', 'q-line derivation for various thermal feed conditions', 'McCabe-Thiele graphical stepping, minimum reflux (R_min), and Underwood equations'], hours: 10 },
      { unitNumber: 2, title: 'Enthalpy-Concentration & Multicomponent Distillation', topics: ['Ponchon-Savarit method for unequal molal heats of vaporization', 'Fenske-Underwood-Gilliland shortcut method for multicomponent distillation', 'Azeotropic and extractive distillation methods', 'Tray efficiency: point, Murphree, and overall column efficiency'], hours: 10 },
      { unitNumber: 3, title: 'Gas Absorption & Stripping in Packed Towers', topics: ['Equilibrium curve and operating lines for dilute and concentrated absorbers', 'Random and structured packings: pressure drop, flooding, and loading velocity', 'Number of Transfer Units (NTU_OG) and Height of a Transfer Unit (HTU_OG)', 'Height Equivalent to a Theoretical Plate (HETP)'], hours: 10 },
      { unitNumber: 4, title: 'Liquid-Liquid Extraction Operations', topics: ['Ternary liquid equilibrium and equilateral/right-angled triangular diagrams', 'Immiscible and partially miscible solvent systems and plait point', 'Single-stage and crosscurrent/countercurrent multistage extraction', 'Industrial extractors: mixer-settlers, perforated plate columns, and pulsed columns'], hours: 10 },
      { unitNumber: 5, title: 'Leaching, Crystallization & Membrane Separations', topics: ['Solid-liquid extraction mechanisms and crosscurrent/countercurrent leaching', 'Super-saturation, Miers supersaturation theory, and draft-tube baffle crystallizers', 'Reverse osmosis, ultrafiltration, pervaporation, and gas separation membranes'], hours: 10 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Equilibrium-Driven Separation Stages', summary: 'Exploiting differences in volatility and solubility to achieve high-purity product separation.' },
      { stepName: 'Visual Explanation', title: 'McCabe-Thiele Stage Stepping Animation', summary: 'Step through rectifying and stripping operating lines with live q-line slope in Visual Concept Studio.', linkedModule: 'learn' },
      { stepName: 'Mathematical Derivation', title: 'q-Line Equation & Slope Formulation', summary: 'Deriving y = (q / (q - 1)) x - (x_F / (q - 1)) from feed enthalpy flash balance.' },
      { stepName: 'Worked Example', title: 'Ethanol-Water Distillation Column Sizing', summary: 'Determining theoretical trays, minimum reflux, and optimal feed tray location for 90 mol% distillate.' },
      { stepName: 'Interactive Simulation', title: 'Binary Distillation Simulation Module', summary: 'Adjust reflux ratio, feed quality q, and relative volatility to observe stage counts.', linkedModule: 'distillation' },
      { stepName: 'Engineering Application', title: 'Petroleum Naphtha Stabilizer Operation', summary: 'Stripping out light LPG fractions from heavy naphtha reformer feed.' },
      { stepName: 'Assessment', title: 'Column Flooding & Weeping Diagnostics Viva', summary: 'Distinguish between entrainment flooding at high vapor rates vs liquid weeping at low vapor rates.' },
      { stepName: 'Industry Connection', title: 'Separations Specialist & Tower Revamp EPC', summary: 'Distillation engineers at Sulzer Chemtech, Koch-Glitsch, and UOP Honeywell.' },
    ],
    softwareTools: ['Aspen Plus (RadFrac)', 'DWSIM', 'Python (McCabe-Thiele script)', 'Excel'],
    industrialApplications: ['Crude vacuum fractionators', 'Ethylene/ethane splitters', 'CO2 amine absorption columns'],
    placementSkills: ['McCabe-Thiele stage stepping', 'Packed column NTU/HTU sizing', 'Flooding limit calculation'],
  },
  {
    code: 'CHE552',
    title: 'Petroleum Refining Technology',
    semester: 5,
    credits: '3:0:0 (3 Credits)',
    category: 'Program Elective',
    isElective: true,
    electiveGroup: 'CHE55X',
    description: 'Crude assay characterization, desalting, ADU/VDU fractionator design, fluidized catalytic cracking, catalytic reforming, hydrotreating, and delayed coking.',
    outcomes: [
      { coNumber: 'CO1', statement: 'Evaluate crude petroleum assays, TBP distillation curves, and API gravity classifications.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO2', statement: 'Analyze Atmospheric and Vacuum Distillation Units (ADU/VDU) with side-strippers.', poMapping: 'PO1, PO3' },
      { coNumber: 'CO3', statement: 'Examine catalytic cracking, reforming, isomerization, and alkylation unit operations.', poMapping: 'PO1, PO7' },
    ],
    units: [
      { unitNumber: 1, title: 'Crude Oil Origin, Assay & Pretreatment', topics: ['True Boiling Point (TBP) and ASTM D86 distillation curves', 'API gravity, sulfur content, UOP characterization factor K', 'Two-stage electrostatic desalting of crude oil'], hours: 8 },
      { unitNumber: 2, title: 'Atmospheric & Vacuum Distillation Units', topics: ['ADU furnace, flash zone, and side-stream strippers (naphtha, kerosene, diesel)', 'Pump-around cooling reflux and heat recovery trains', 'VDU operation under 20-40 mmHg vacuum with wet vs dry systems'], hours: 8 },
      { unitNumber: 3, title: 'Catalytic Cracking & Coking Operations', topics: ['Fluidized Catalytic Cracking (FCC) riser kinetics and catalyst regeneration', 'Delayed coking of vacuum residue for fuel-grade and needle coke', 'Visbreaking and thermal residue reduction'], hours: 8 },
      { unitNumber: 4, title: 'Hydrotreating & Catalytic Reforming', topics: ['Hydrodesulfurization (HDS) of diesel to meet Euro-VI / BS-VI standards', 'Catalytic reforming (CCR) for high-octane gasoline aromatics', 'Isomerization and sulfuric/HF acid alkylation'], hours: 8 },
      { unitNumber: 5, title: 'Refinery Hydrogen & Environmental Management', topics: ['Hydrogen network integration across hydrotreaters and reformers', 'Sulfur recovery units (Claus process) and tail gas treatment', 'Refinery effluent wastewater treatment and VOC flare gas recovery'], hours: 8 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Refinery Value Chain & Molecular Upgrading', summary: 'Separating crude oil by boiling points and chemically converting heavy residues into high-octane clean fuels.' },
      { stepName: 'Visual Explanation', title: 'ADU Column Side-Draw Reflux Schematic', summary: 'Inspect side-stripper steam injection and pump-around heat duties in Process Design Studio.', linkedModule: 'design' },
      { stepName: 'Mathematical Derivation', title: 'Packie Correlation for Refinery Fractionators', summary: 'Estimating gap and overlap temperatures between adjacent petroleum product side-draws.' },
      { stepName: 'Worked Example', title: 'ASTM to TBP Conversion & Crude Yield Estimation', summary: 'Determining yields of light naphtha, kerosene, and gas oil from crude TBP curve.' },
      { stepName: 'Interactive Simulation', title: 'Process Flowsheet Studio', summary: 'Trace crude preheat trains and flash fractionators in Process Design Studio.', linkedModule: 'design' },
      { stepName: 'Engineering Application', title: 'BS-VI Ultra-Low Sulfur Diesel (ULSD) Production', summary: 'Reducing sulfur in gas oil from 5000 ppm down to below 10 ppm in high-pressure hydrotreaters.' },
      { stepName: 'Assessment', title: 'Refinery Octane Number & Cetane Index Viva', summary: 'Explain how catalytic reforming converts low-octane naphthenes into high-octane aromatics.' },
      { stepName: 'Industry Connection', title: 'Refinery Process Engineering & Technical Services', summary: 'Operations and process engineers at IOCL, BPCL, HPCL, Reliance Jamnagar, and Shell.' },
    ],
    softwareTools: ['Aspen HYSYS Petroleum RefSys', 'Petro-SIM', 'Excel'],
    industrialApplications: ['Integrated oil refineries', 'FCC and hydrocracker units', 'Crude blending terminals'],
    placementSkills: ['Crude assay interpretation', 'ADU/VDU operational troubleshooting', 'Catalytic cracking kinetics'],
  },

  // =========================================================================
  // SEMESTER VI
  // =========================================================================
  {
    code: 'CH62',
    title: 'Process Dynamics and Control',
    semester: 6,
    credits: '3:1:0 (4 Credits)',
    category: 'Core Chemical Engineering',
    description: 'First and second order process dynamics, transfer functions, feedback control loops, PID tuning (Ziegler-Nichols, Cohen-Coon), frequency response (Bode, Nyquist), and loop stability.',
    linkedModule: 'industry',
    outcomes: [
      { coNumber: 'CO1', statement: 'Formulate transfer functions for first-order, second-order, and interacting tank systems.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO2', statement: 'Analyze closed-loop responses with P, PI, and PID controllers to setpoint and load changes.', poMapping: 'PO1, PO2, PO3' },
      { coNumber: 'CO3', statement: 'Evaluate feedback loop stability using Routh-Hurwitz criterion, root locus, and Bode margins.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO4', statement: 'Tune industrial PID controllers and design feedforward, cascade, and ratio control schemes.', poMapping: 'PO1, PO3, PO5' },
    ],
    units: [
      { unitNumber: 1, title: 'Process Dynamic Modeling & First-Order Systems', topics: ['Laplace transform of process deviations', 'First-order systems: liquid surge tank, stirred heated tank, thermometer bulb', 'Time constant (τ), process gain (K_p), and time-delay dead-time (θ)'], hours: 10 },
      { unitNumber: 2, title: 'Second-Order & Higher-Order Systems', topics: ['Interacting vs non-interacting liquid tanks in series', 'Damped second-order systems: damping coefficient (ζ) and natural frequency (ω_n)', 'Underdamped step response: overshoot, decay ratio, rise time, settling time'], hours: 10 },
      { unitNumber: 3, title: 'Feedback Controllers & Final Control Elements', topics: ['Proportional (P), Integral (I), and Derivative (D) control action modes', 'Offset elimination by integral action and anticipatory derivative action', 'Control valves: air-to-open (fail-close) vs air-to-close (fail-open), valve sizing (Cv)'], hours: 10 },
      { unitNumber: 4, title: 'Closed-Loop Stability & Frequency Response', topics: ['Closed-loop characteristic equation and Routh-Hurwitz stability criterion', 'Frequency response: amplitude ratio (AR) and phase lag (φ)', 'Bode and Nyquist stability criteria, Gain Margin (GM), and Phase Margin (PM)'], hours: 10 },
      { unitNumber: 5, title: 'Controller Tuning & Advanced Control Strategies', topics: ['Ziegler-Nichols continuous cycling and process reaction curve tuning methods', 'Cohen-Coon and Internal Model Control (IMC) tuning rules', 'Cascade control, feedforward control, ratio control, and override selective control'], hours: 10 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Dynamic Feedback & Disturbance Rejection', summary: 'Continuous sensor telemetry feedback to final control element to maintain process variable at setpoint.' },
      { stepName: 'Visual Explanation', title: 'Bode Stability Margins & Nyquist Encirclements', summary: 'Inspect amplitude ratio and phase lag crossovers determining feedback loop oscillation.' },
      { stepName: 'Mathematical Derivation', title: 'Closed-Loop Transfer Function with PID', summary: 'Deriving Y(s) / Y_sp(s) = (G_c G_v G_p) / (1 + G_c G_v G_p G_m).' },
      { stepName: 'Worked Example', title: 'Ziegler-Nichols Ultimate Gain Tuning of a CSTR', summary: 'Determining ultimate gain K_u = 4.2 and ultimate period P_u = 3.6 min to set PID parameters.' },
      { stepName: 'Interactive Simulation', title: 'PID Tuning & SCADA Historian Workbench', summary: 'Tune K_p, τ_i, and τ_d live and observe real-time process variable response to load steps.', linkedModule: 'industry' },
      { stepName: 'Engineering Application', title: 'Distillation Column Dual-Composition Control', summary: 'Controlling reflux rate for distillate purity and reboiler duty for bottoms purity.' },
      { stepName: 'Assessment', title: 'Controller Action & Fail-Safe Valve Sizing Viva', summary: 'Choose whether a fuel gas valve to a process furnace must be fail-closed or fail-open.' },
      { stepName: 'Industry Connection', title: 'Process Control & Industrial Automation (DCS)', summary: 'Automation engineers at Emerson, Honeywell, Rockwell, ABB, and Yokogawa.' },
    ],
    softwareTools: ['MATLAB / Simulink', 'Python (control package)', 'DWSIM Dynamics'],
    industrialApplications: ['Furnace combustion air-fuel ratio control', 'Exothermic reactor temperature runaway prevention', 'Compressor anti-surge control'],
    placementSkills: ['PID controller tuning (Ziegler-Nichols / IMC)', 'Transfer function derivation', 'Bode stability evaluation', 'Control valve sizing'],
  },
  {
    code: 'CHL65',
    title: 'Process Simulation Laboratory I',
    semester: 6,
    credits: '0:0:1.5 (1.5 Credits)',
    category: 'Laboratory Course',
    description: 'Steady-state process flowsheet simulation using DWSIM, Aspen Plus, and Python: unit operations, thermodynamic property selection, recycle convergence, and sensitivity analysis.',
    linkedModule: 'design',
    outcomes: [
      { coNumber: 'CO1', statement: 'Set up chemical process flowsheets with appropriate thermodynamic property packages.', poMapping: 'PO1, PO5' },
      { coNumber: 'CO2', statement: 'Simulate pumps, compressors, heat exchangers, reactors, and distillation towers.', poMapping: 'PO1, PO3, PO5' },
    ],
    units: [],
    labs: [
      { expNumber: 1, title: 'Thermodynamic Property Method Selection', objective: 'Compare Peng-Robinson, SRK, and NRTL for non-ideal ethanol-water VLE.', apparatus: 'Process simulation workstation (DWSIM / Aspen).', procedureSummary: 'Select chemical components; generate binary T-x-y envelope; compare with experimental NIST data.' },
      { expNumber: 2, title: 'Centrifugal Pump & Piping Network Simulation', objective: 'Model piping hydraulics and calculate required pump power and NPSHa.', apparatus: 'DWSIM / Aspen flowsheeting suite.', procedureSummary: 'Input fluid stream flow, pipe roughness, equivalent lengths; calculate pressure drop and motor power.' },
      { expNumber: 3, title: 'Heat Exchanger Rating & Pinch Optimization', objective: 'Simulate countercurrent shell & tube exchanger and check for temperature crosses.', apparatus: 'Process simulation workstation.', procedureSummary: 'Specify hot and cold stream conditions; calculate required heat transfer area and LMTD.' },
      { expNumber: 4, title: 'Flash Vaporization & Phase Separation', objective: 'Model high-pressure flash drum separation of light hydrocarbons.', apparatus: 'Process simulation workstation.', procedureSummary: 'Specify inlet stream T, P, and composition; perform adiabatic flash; analyze vapor and liquid compositions.' },
      { expNumber: 5, title: 'Chemical Reactor Simulation (CSTR & PFR)', objective: 'Simulate exothermic reaction in CSTR and PFR with cooling jackets.', apparatus: 'Process simulation workstation.', procedureSummary: 'Input reaction stoichiometry, Arrhenius kinetics; calculate conversion and heat generation duties.' },
      { expNumber: 6, title: 'Rigorous Binary Distillation Column Modeling', objective: 'Simulate multi-stage fractionator to meet product purity specifications.', apparatus: 'DWSIM / Aspen RadFrac.', procedureSummary: 'Specify number of trays, feed tray location, reflux ratio; converge rigorous vapor-liquid equilibrium.' },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Flowsheeting Mathematics & Convergence', summary: 'Solving simultaneous non-linear algebraic material and energy equations across connected process units.' },
      { stepName: 'Visual Explanation', title: 'Flowsheet PFD Mode vs P&ID Mode', summary: 'Inspect stream compositions and instrumentation tag loops in Process Design Studio.', linkedModule: 'design' },
      { stepName: 'Mathematical Derivation', title: 'Wegstein Acceleration for Recycle Loops', summary: 'Numerical acceleration methods ensuring fast convergence of recycle tear streams.' },
      { stepName: 'Worked Example', title: 'Simulation of an Acetone Absorption Column', summary: 'Modeling packed absorption of acetone vapor into water with 99% recovery.' },
      { stepName: 'Interactive Simulation', title: 'Process Design Studio', summary: 'Build flowsheet blocks, connect streams, and generate stream tables.', linkedModule: 'design' },
      { stepName: 'Engineering Application', title: 'Debottlenecking Industrial Distillation Trains', summary: 'Using simulation sensitivity analysis to find the limiting condenser or reboiler duty.' },
      { stepName: 'Assessment', title: 'Simulation Convergence Troubleshooting Viva', summary: 'Identify causes of failure to converge in distillation column inner and outer loops.' },
      { stepName: 'Industry Connection', title: 'Process Modeling & Simulation Engineer', summary: 'Simulation specialists at AspenTech, AVEVA, Honeywell, and engineering design houses.' },
    ],
  },
  {
    code: 'CHE643',
    title: 'Hazard Analysis and Risk Management (HAZOP)',
    semester: 6,
    credits: '3:0:0 (3 Credits)',
    category: 'Program Elective',
    isElective: true,
    electiveGroup: 'CHE64X',
    description: 'Process Safety Management (PSM), IEC 61882 HAZOP study methodology, Layer of Protection Analysis (LOPA), Safety Integrity Level (SIL) allocation, and consequence modeling.',
    linkedModule: 'industry',
    outcomes: [
      { coNumber: 'CO1', statement: 'Apply IEC 61882 HAZOP guide words to identify process safety deviations and consequences.', poMapping: 'PO1, PO6, PO8' },
      { coNumber: 'CO2', statement: 'Conduct Layer of Protection Analysis (LOPA) to determine required Safety Instrumented Functions (SIF).', poMapping: 'PO1, PO3, PO6' },
      { coNumber: 'CO3', statement: 'Determine Safety Integrity Levels (SIL 1 to SIL 4) using risk graphs and matrices per IEC 61511.', poMapping: 'PO1, PO6, PO8' },
    ],
    units: [
      { unitNumber: 1, title: 'Process Safety Management (PSM) Foundations', topics: ['OSHA 14 elements of Process Safety Management', 'Inherently safer design principles (intensification, substitution, attenuation, limitation)', 'Historical major chemical incidents: Bhopal, Flixborough, Texas City, Piper Alpha'], hours: 8 },
      { unitNumber: 2, title: 'HAZOP Study Methodology & Execution', topics: ['IEC 61882 standard HAZOP nodes, design intents, and process parameters', 'Standard guide words: NO, MORE, LESS, AS WELL AS, PART OF, REVERSE, OTHER THAN', 'Identifying plausible root causes, severe consequences, and existing safeguards'], hours: 8 },
      { unitNumber: 3, title: 'Quantitative Risk Assessment & Fault Tree Analysis', topics: ['Event Tree Analysis (ETA) and Fault Tree Analysis (FTA)', 'Boolean logic reduction and minimal cut sets', 'Individual Risk Per Annum (IRPA) and Societal Risk F-N curves'], hours: 8 },
      { unitNumber: 4, title: 'Layer of Protection Analysis (LOPA) & SIL', topics: ['Independent Protection Layers (IPL) criteria per CCPS', 'Probability of Failure on Demand (PFD_avg) and Risk Reduction Factor (RRF)', 'Safety Integrity Level (SIL 1 to SIL 4) allocation per IEC 61508 / 61511'], hours: 8 },
      { unitNumber: 5, title: 'Emergency Relief Sizing & Consequence Modeling', topics: ['Pressure Safety Valve (PSV) sizing per API 520 / 521 for fire and runaway cases', 'Atmospheric toxic gas dispersion (Gaussian plume model)', 'Vapor Cloud Explosions (VCE) and BLEVE consequence modeling'], hours: 8 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Systematic Hazard Identification & Risk Reduction', summary: 'Structured deviation analysis to ensure multiple independent safeguards prevent catastrophic chemical loss.' },
      { stepName: 'Visual Explanation', title: '5x5 Risk Assessment Matrix & SIL Allocation', summary: 'Inspect risk frequency vs severity rankings and SIL tiers in Digital Twin Centre.', linkedModule: 'industry' },
      { stepName: 'Mathematical Derivation', title: 'Safety Instrumented System PFD_avg Formulation', summary: 'Deriving PFD_avg = λ_DU * (TI / 2) for 1oo1 voter architectures.' },
      { stepName: 'Worked Example', title: 'HAZOP Worksheet for Centrifugal Pump Discharge', summary: 'Deviation: MORE FLOW. Causes: Control valve fails wide open. Consequence: Vessel overfill.' },
      { stepName: 'Interactive Simulation', title: 'Process Safety & HAZOP Studio', summary: 'Explore interactive HAZOP worksheets and risk matrices in the Digital Twin Centre.', linkedModule: 'industry' },
      { stepName: 'Engineering Application', title: 'Exothermic CSTR Runaway Emergency Interlocks', summary: 'Implementing high-pressure trip interlocks that inject chemical inhibitor to stop runaway.' },
      { stepName: 'Assessment', title: 'IPL Criteria & Failure on Demand Viva', summary: 'Explain why a standard DCS operator alarm is not an Independent Protection Layer (IPL).' },
      { stepName: 'Industry Connection', title: 'Process Safety Engineering & HSE Consultancy', summary: 'Process safety specialists at Shell, ExxonMobil, DNV, ERM, and Bureau Veritas.' },
    ],
    softwareTools: ['PHA-Pro', 'PHAST (Consequence modeling)', 'BowTie Pro'],
    industrialApplications: ['Refinery unit HAZOP reviews', 'Offshore platform safety case dossiers', 'Toxic gas relief systems'],
    placementSkills: ['HAZOP study facilitation', 'LOPA & SIL determination', 'API 520/521 relief valve sizing'],
  },

  // =========================================================================
  // SEMESTER VII
  // =========================================================================
  {
    code: 'CH71',
    title: 'Chemical Engineering Plant Design and Economics',
    semester: 7,
    credits: '3:1:0 (4 Credits)',
    category: 'Core Chemical Engineering',
    description: 'Process design workflow, PFD & P&ID development, capital cost estimation (CAPEX/OPEX), profitability criteria (NPV, DCFROR, Payback), depreciation, and plant layout optimization.',
    linkedModule: 'design',
    outcomes: [
      { coNumber: 'CO1', statement: 'Develop process flowsheets, PFDs, and Piping & Instrumentation Diagrams (P&ID) per ISA 5.1.', poMapping: 'PO1, PO3' },
      { coNumber: 'CO2', statement: 'Estimate fixed capital investment and total plant capital using factored cost methods (Guthrie / Lang).', poMapping: 'PO1, PO11' },
      { coNumber: 'CO3', statement: 'Evaluate project profitability using Net Present Value (NPV), Payback Period, and Internal Rate of Return (IRR).', poMapping: 'PO1, PO11' },
      { coNumber: 'CO4', statement: 'Conduct techno-economic feasibility studies for greenfield chemical plant installations.', poMapping: 'PO1, PO11, PO12' },
    ],
    units: [
      { unitNumber: 1, title: 'Process Synthesis & Flowsheet Development', topics: ['Stages of process design: conceptual, FEED, and detailed engineering', 'Development of Process Flow Diagrams (PFD) with mass/energy stream tables', 'Piping and Instrumentation Diagram (P&ID) symbology per ANSI/ISA-5.1-2009'], hours: 10 },
      { unitNumber: 2, title: 'Capital Cost Estimation & Equipment Costing', topics: ['Fixed Capital Investment (FCI) and Working Capital (WC)', 'Order of magnitude, preliminary, and definitive cost estimates', 'Equipment capacity power law: C_B = C_A (S_B / S_A)^0.6', 'Bare module cost factors and chemical engineering plant cost indices (CEPCI)'], hours: 10 },
      { unitNumber: 3, title: 'Operating Costs, Depreciation & Taxes', topics: ['Direct manufacturing costs, fixed charges, and general plant overheads', 'Depreciation methods: Straight Line, Declining Balance, Modified ACRS', 'Corporate taxation, net cash flows, and cumulative cash flow diagrams'], hours: 10 },
      { unitNumber: 4, title: 'Profitability Analysis & Investment Evaluation', topics: ['Time value of money and compound interest formulas', 'Net Present Value (NPV) and Discounted Cash Flow Rate of Return (DCFROR / IRR)', 'Simple and discounted payback periods and break-even analysis'], hours: 10 },
      { unitNumber: 5, title: 'Plant Location, Layout & Utilities', topics: ['Factors governing chemical plant site selection', 'Equipment layout guidelines, pipe rack sizing, and battery limit boundaries', 'Process utility systems: steam networks, cooling towers, compressed air, nitrogen blankets'], hours: 10 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Techno-Economic Viability & Project Lifecycles', summary: 'Synthesizing technical unit operations with financial capital return metrics over a 20-year plant life.' },
      { stepName: 'Visual Explanation', title: 'PFD to P&ID Instrument Tag Transformation', summary: 'Inspect flow loops, level alarms, and relief valve headers in Process Design Studio.', linkedModule: 'design' },
      { stepName: 'Mathematical Derivation', title: 'Net Present Value Discounting Equation', summary: 'Deriving NPV = Σ [CF_t / (1 + r)^t] - FCI_0 and finding internal rate of return.' },
      { stepName: 'Worked Example', title: 'Guthrie Factored Cost Estimation for an Exchanger', summary: 'Calculating bare module cost C_BM of a stainless steel TEMA exchanger with design pressure 25 bar.' },
      { stepName: 'Interactive Simulation', title: 'Engineering Economics Calculator', summary: 'Compute NPV, payback period, and discounted cash flows in the Engineering Toolbox.', linkedModule: 'toolbox' },
      { stepName: 'Engineering Application', title: 'Greenfield Hydrogen Plant Feasibility Study', summary: 'Comparing 20-year levelized cost of hydrogen (LCOH) between SMR and water electrolysis.' },
      { stepName: 'Assessment', title: 'Capital Cost Indices & Break-Even Analysis Viva', summary: 'Explain how the six-tenths factor rule accounts for economies of scale in process equipment.' },
      { stepName: 'Industry Connection', title: 'EPC Project Engineering & Techno-Commercial Feasibility', summary: 'Project engineers and proposal estimators at Bechtel, Technip, Fluor, and L&T.' },
    ],
    softwareTools: ['Aspen Capital Cost Estimator (ACCE)', 'Excel Financial Models', 'AutoCAD Plant 3D'],
    industrialApplications: ['New chemical plant proposals', 'Refinery expansion feasibility reports', 'Decarbonization capital budgeting'],
    placementSkills: ['P&ID development per ISA 5.1', 'CAPEX/OPEX estimation (Guthrie method)', 'NPV & IRR financial modeling'],
  },
  {
    code: 'CH72',
    title: 'Transport Phenomena',
    semester: 7,
    credits: '3:1:0 (4 Credits)',
    category: 'Core Chemical Engineering',
    description: 'Unified momentum, energy, and mass transport: shell balances, Navier-Stokes equations, non-Newtonian fluid mechanics, equation of energy, and boundary layer analogies.',
    outcomes: [
      { coNumber: 'CO1', statement: 'Formulate shell momentum, energy, and mass balances for 1D and 2D transport geometries.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO2', statement: 'Apply Navier-Stokes and continuity equations to solve laminar fluid flow problems.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO3', statement: 'Solve multi-dimensional heat conduction and convective energy transport equations.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO4', statement: 'Evaluate simultaneous mass transfer with homogeneous and heterogeneous chemical reactions.', poMapping: 'PO1, PO2, PO3' },
    ],
    units: [
      { unitNumber: 1, title: 'Molecular Transport Mechanisms & Shell Balances', topics: ['Newtons law of viscosity, Fouriers law of conduction, Ficks law of diffusion', 'Velocity, temperature, and concentration boundary layers', 'Shell momentum balance for laminar falling film on an inclined plane'], hours: 10 },
      { unitNumber: 2, title: 'Differential Momentum Balance & Navier-Stokes', topics: ['Continuity equation in Cartesian, cylindrical, and spherical coordinates', 'Navier-Stokes equation derivation for incompressible Newtonian fluids', 'Exact solutions: flow through circular tube (Hagen-Poiseuille), flow between concentric cylinders'], hours: 10 },
      { unitNumber: 3, title: 'Non-Newtonian Fluid Mechanics', topics: ['Time-independent non-Newtonian fluids (Power-law, Bingham plastic, Herschel-Bulkley)', 'Viscoelastic fluids and normal stress differences', 'Laminar flow of power-law fluid in a circular conduit'], hours: 10 },
      { unitNumber: 4, title: 'Energy Transport & Equation of Thermal Energy', topics: ['Differential energy equation for flowing fluids', 'Heat conduction with nuclear/viscous dissipation heat source', 'Forced convection heat transfer across boundary layers'], hours: 10 },
      { unitNumber: 5, title: 'Mass Transport with Chemical Reactions & Analogies', topics: ['Differential equation of mass transfer with bulk convection', 'Diffusion into falling liquid film with homogeneous chemical reaction', 'Transport analogies: Reynolds, Prandtl, and Chilton-Colburn analogies'], hours: 10 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Unified Transport Mechanisms', summary: 'Molecular momentum, thermal, and mass fluxes as proportional gradients of velocity, temperature, and concentration.' },
      { stepName: 'Visual Explanation', title: 'Velocity Boundary Layer & Shear Stress Gradients', summary: 'Inspect parabolic velocity and linear shear stress profiles across fluid layers in Visual Concept Studio.', linkedModule: 'learn' },
      { stepName: 'Mathematical Derivation', title: 'Navier-Stokes to Hagen-Poiseuille Reduction', summary: 'Deriving v_z(r) = (ΔP R2 / 4 μ L) [1 - (r/R)2] by reducing cylindrical Navier-Stokes equations.' },
      { stepName: 'Worked Example', title: 'Laminar Falling Film on an Inclined Plate', summary: 'Determining maximum velocity, average velocity, and film thickness for oil on a 45° incline.' },
      { stepName: 'Interactive Simulation', title: 'Visual Concept Studio', summary: 'Explore laminar and turbulent velocity profiles with dynamic Reynolds number scaling.', linkedModule: 'learn' },
      { stepName: 'Engineering Application', title: 'Polymer Melt Extrusion Die Flow', summary: 'Predicting die swell and shear thinning in non-Newtonian polymer melt extruders.' },
      { stepName: 'Assessment', title: 'Chilton-Colburn j-Factor Analogy Viva', summary: 'Demonstrate how j_H = j_D allows predicting mass transfer coefficients directly from heat transfer data.' },
      { stepName: 'Industry Connection', title: 'Computational Fluid Dynamics (CFD) & Advanced R&D', summary: 'CFD specialists and transport modelers at ANSYS, Siemens Digital Industries, and national labs.' },
    ],
    softwareTools: ['Python (SymPy / NumPy)', 'ANSYS Fluent / OpenFOAM', 'COMSOL'],
    industrialApplications: ['Polymer extrusion dies', 'Microfluidic lab-on-a-chip channels', 'Combustion chamber boundary layers'],
    placementSkills: ['Shell balance formulation', 'Navier-Stokes reduction', 'Boundary layer analogy application'],
  },
  {
    code: 'CHL75',
    title: 'Software for Chemical Engineers (Excel, Python, LINGO)',
    semester: 7,
    credits: '0:0:1.5 (1.5 Credits)',
    category: 'Laboratory Course',
    description: 'Engineering computation using Excel, Python (NumPy, Pandas, SciPy, Matplotlib), and LINGO: thermodynamic modeling, reactor kinetics integration, flowsheet optimization, and heat exchanger rating.',
    linkedModule: 'career',
    outcomes: [
      { coNumber: 'CO1', statement: 'Develop automated Excel calculation spreadsheets for heat and material balances.', poMapping: 'PO1, PO5' },
      { coNumber: 'CO2', statement: 'Write Python engineering scripts to solve non-linear equations, ODEs, and process data regression.', poMapping: 'PO1, PO5' },
    ],
    units: [],
    labs: [
      { expNumber: 1, title: 'Excel Solver for Multi-Component Flash Equilibrium', objective: 'Implement Rachford-Rice equation using Excel Goal Seek and Solver.', apparatus: 'Computer workstation with Microsoft Excel.', procedureSummary: 'Input feed compositions and K-values; minimize sum of vapor-liquid residuals; calculate flash vapor fraction.' },
      { expNumber: 2, title: 'Python Numerical Integration of Non-Isothermal CSTR', objective: 'Solve coupled species and energy ODEs using scipy.integrate.solve_ivp.', apparatus: 'Python 3 Jupyter Notebook environment.', procedureSummary: 'Code transient differential equations; integrate over time; detect thermal runaway conditions.' },
      { expNumber: 3, title: 'Non-Linear Curve Fitting of Kinetic Data in Python', objective: 'Determine Arrhenius activation energy and rate constant using scipy.optimize.curve_fit.', apparatus: 'Python workstation.', procedureSummary: 'Load experimental rate vs temperature data; fit Arrhenius model; plot confidence intervals.' },
      { expNumber: 4, title: 'LINGO Optimization of Refinery Production Scheduling', objective: 'Formulate linear programming model to maximize gross margin under crude capacity constraints.', apparatus: 'LINGO optimization suite.', procedureSummary: 'Define decision variables (feed rates), objective function (margin), and constraints (sulfur limits, octane).' },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Computational Tools in Modern Engineering', summary: 'Automating complex scientific calculations using scripting, matrix solvers, and mathematical optimizers.' },
      { stepName: 'Visual Explanation', title: 'Jupyter Scripting & Data Visualizations', summary: 'Inspect production-ready Python engineering scripts in the Career & Software Hub.', linkedModule: 'career' },
      { stepName: 'Mathematical Derivation', title: 'Rachford-Rice Flash Vaporization Formulation', summary: 'Deriving Σ [z_i (K_i - 1) / (1 + V/F (K_i - 1))] = 0 for multi-component flash.' },
      { stepName: 'Worked Example', title: 'Colebrook-White Friction Factor Python Solver', summary: 'Solving implicit Colebrook equation using Newton-Raphson method in 5 iterations.' },
      { stepName: 'Interactive Simulation', title: 'Chemical Engineering Python Hub', summary: 'Copy and test production Python scripts for hydraulics, distillation, and reactors.', linkedModule: 'career' },
      { stepName: 'Engineering Application', title: 'Refinery Crude Blending Linear Programming', summary: 'Maximizing refinery profit while meeting sulfur, flash point, and viscosity product limits.' },
      { stepName: 'Assessment', title: 'NumPy Vectorization & Optimization Viva', summary: 'Explain why vectorizing calculations in NumPy achieves 50x speedups over Python loops.' },
      { stepName: 'Industry Connection', title: 'Data-Driven Process Optimization & Digital Twins', summary: 'Process data scientists and systems engineers at Shell, Reliance, and AspenTech.' },
    ],
  },

  // =========================================================================
  // SEMESTER VIII
  // =========================================================================
  {
    code: 'CHP81',
    title: 'Final Year Capstone Project Work',
    semester: 8,
    credits: '0:0:10 (10 Credits)',
    category: 'Project / Internship',
    description: 'Comprehensive independent or team-based chemical engineering project: problem definition, literature review, experimental / simulation methodology, design of experiments, sustainability analysis, and formal defense.',
    linkedModule: 'portfolio',
    outcomes: [
      { coNumber: 'CO1', statement: 'Identify engineering problem statements and formulate research methodologies based on literature gaps.', poMapping: 'PO1, PO2, PO4' },
      { coNumber: 'CO2', statement: 'Execute experimental or rigorous simulation investigations using modern engineering tools.', poMapping: 'PO1, PO3, PO5' },
      { coNumber: 'CO3', statement: 'Evaluate environmental sustainability, economic viability, and process safety implications.', poMapping: 'PO6, PO7, PO8, PO11' },
      { coNumber: 'CO4', statement: 'Compile a comprehensive technical dissertation and defend engineering findings in viva voce.', poMapping: 'PO9, PO10, PO12' },
    ],
    units: [
      { unitNumber: 1, title: 'Phase 1: Problem Definition & Literature Review', topics: ['Formulating clear, measurable problem statements', 'Systematic literature gap analysis using peer-reviewed journals', 'Project scope definition, deliverables, and Gantt milestone chart'], hours: 20 },
      { unitNumber: 2, title: 'Phase 2: Methodology & Design of Experiments (DOE)', topics: ['Experimental bench setup or rigorous simulation modeling strategy', 'Design of Experiments (DOE) using factorial / response surface methodology', 'Safety risk assessments and chemical hazard mitigation'], hours: 30 },
      { unitNumber: 3, title: 'Phase 3: Execution, Data Collection & Analysis', topics: ['Rigorous experimental data generation or Aspen/DWSIM simulation', 'Uncertainty analysis, standard deviations, and statistical validation', 'Benchmarking against industrial standards and published literature'], hours: 50 },
      { unitNumber: 4, title: 'Phase 4: Sustainability & Techno-Economics', topics: ['Life Cycle Assessment (LCA) environmental impact metrics (carbon footprint)', 'Fixed capital and operating cost estimation for commercial scale', 'Process safety, HAZOP identification, and waste management'], hours: 30 },
      { unitNumber: 5, title: 'Phase 5: Technical Dissertation & Defense', topics: ['Drafting formal engineering project report with transparent references', 'Executive summary, conclusions, and recommendations for future work', 'Technical presentation slides and formal oral viva defense'], hours: 20 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Capstone Synthesis of 4-Year Competencies', summary: 'Integrating transport, thermodynamics, reaction kinetics, and plant design into an original engineering solution.' },
      { stepName: 'Visual Explanation', title: 'Project Verification Dossier Builder', summary: 'Document your capstone project credentials and generate SHA-256 stamped reports.', linkedModule: 'portfolio' },
      { stepName: 'Mathematical Derivation', title: 'Response Surface Methodology (RSM) Optimization', summary: 'Fitting second-order polynomial response models to find optimum operating conditions.' },
      { stepName: 'Worked Example', title: 'Carbon Capture Absorption Pilot Plant Design', summary: 'Complete design of a 50 kg/day CO2 capture unit using monoethanolamine (MEA) solvent.' },
      { stepName: 'Interactive Simulation', title: 'Engineering Portfolio Workspace', summary: 'Publish your capstone report, graphs, and simulation models directly into your portfolio.', linkedModule: 'portfolio' },
      { stepName: 'Engineering Application', title: 'Decarbonization & Green Ammonia Synthesis', summary: 'Designing renewable hydrogen-based Haber-Bosch units powered by solar electrolysis.' },
      { stepName: 'Assessment', title: 'Final Project Evaluation & Viva Voce Rubric', summary: 'Evaluated on technical depth, simulation rigor, experimental validation, and presentation clarity.' },
      { stepName: 'Industry Connection', title: 'Graduate Engineer Trainee & R&D Entry Roles', summary: 'Demonstrable capstone project work is the primary technical evaluation criterion in core campus interviews.' },
    ],
    softwareTools: ['Aspen Plus / DWSIM', 'Python (DOE / Pandas)', 'AutoCAD', 'Minitab'],
    industrialApplications: ['Industrial pilot scaleup', 'Commercial plant retrofitting', 'Green hydrogen & decarbonization'],
    placementSkills: ['Independent engineering research', 'Technical report writing', 'Viva defense communication'],
  },
  {
    code: 'INT82',
    title: 'Research / Industrial Internship Workspace',
    semester: 8,
    credits: '0:0:4 (4 Credits)',
    category: 'Project / Internship',
    description: '6–8 week immersive research or industrial plant internship: plant orientation, DCS operations, unit troubleshooting, weekly work logs, supervisor evaluations, and formal internship presentation.',
    linkedModule: 'career',
    outcomes: [
      { coNumber: 'CO1', statement: 'Demonstrate professional engineering practice and safety adherence in industrial or research environments.', poMapping: 'PO6, PO8, PO9' },
      { coNumber: 'CO2', statement: 'Analyze industrial chemical unit operations, DCS control telemetry, and maintenance workflows.', poMapping: 'PO1, PO2, PO5' },
      { coNumber: 'CO3', statement: 'Document daily engineering activities, author formal technical internship reports, and present findings.', poMapping: 'PO10, PO12' },
    ],
    units: [
      { unitNumber: 1, title: 'Week 1–2: Site Safety Induction & Plant Orientation', topics: ['Plant safety induction (PPE, permit to work, evacuation alarms)', 'Process overview, raw material supplies, and battery limits', 'P&ID walkthrough and tracing field piping lines'], hours: 20 },
      { unitNumber: 2, title: 'Week 3–4: Unit Operations & Field Monitoring', topics: ['Monitoring pumps, heat exchangers, and distillation columns', 'Logging process parameters: temperatures, pressures, flow rates, liquid levels', 'Sampling protocols and analytical quality control laboratory visits'], hours: 30 },
      { unitNumber: 3, title: 'Week 5–6: Technical Problem Solving & Assignment', topics: ['Assigned engineering assignment (heat exchanger fouling, pump cavitation, yield loss)', 'Data collection from plant DCS historians', 'Formulating root cause diagnoses and corrective recommendations'], hours: 30 },
      { unitNumber: 4, title: 'Week 7–8: Report Compilation & Exit Presentation', topics: ['Compiling formal internship technical report verified by company mentor', 'Supervisor performance feedback and evaluation rubric sign-off', 'Exit presentation to plant engineering management and university viva'], hours: 20 },
    ],
    pathway: [
      { stepName: 'Concept', title: 'Immersion in Real-World Industrial Practice', summary: 'Translating theoretical university equations into operational plant telemetry, safety culture, and troubleshooting.' },
      { stepName: 'Visual Explanation', title: 'Industrial Troubleshooting Simulator', summary: 'Practice diagnosing simulated refinery alarms and DCS excursions before your field internship.', linkedModule: 'career' },
      { stepName: 'Mathematical Derivation', title: 'Field Heat Exchanger Cleanliness Factor Sizing', summary: 'Calculating real-time U_actual vs U_clean to quantify fouling accumulation in operating reboilers.' },
      { stepName: 'Worked Example', title: 'Logging Pump Cavitation Telemetry on Shift', summary: 'Diagnosing suction strainer plugging from differential pressure rise and suction head loss.' },
      { stepName: 'Interactive Simulation', title: 'Career & Placement Hub', summary: 'Review industry software paths, troubleshooting scenarios, and technical interview question banks.', linkedModule: 'career' },
      { stepName: 'Engineering Application', title: 'Refinery ADU Pre-Commissioning Walkthrough', summary: 'Verifying valve lineups, orifice plate orientations, and spring hanger positions before startup.' },
      { stepName: 'Assessment', title: 'Supervisor Mentorship Rubric & Viva Voce', summary: 'Evaluated on technical curiosity, safety compliance, daily work log completeness, and report quality.' },
      { stepName: 'Industry Connection', title: 'Pre-Placement Offers (PPOs) & Trainee Hiring', summary: 'Outstanding internship performance directly converts into full-time Graduate Engineer Trainee (GET) offers.' },
    ],
    softwareTools: ['DCS Historian (Yokogawa / Honeywell)', 'Excel', 'Field P&IDs'],
    industrialApplications: ['Refinery operations shifts', 'Petrochemical plant maintenance', 'EPC engineering offices'],
    placementSkills: ['Field line tracing', 'DCS telemetry interpretation', 'Plant safety protocols', 'Technical documentation'],
  },
];

export function AcademicWorkspace({ onLaunchSimulation }: AcademicWorkspaceProps) {
  const [selectedSemester, setSelectedSemester] = useState<3 | 4 | 5 | 6 | 7 | 8>(3);
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('CH32');
  const [activeCourseTab, setActiveCourseTab] = useState<'pathway' | 'syllabus' | 'worked' | 'labs' | 'viva'>('pathway');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Configurable Electives State
  const [selectedElectiveSem5, setSelectedElectiveSem5] = useState<string>('CHE552');
  const [selectedElectiveSem6, setSelectedElectiveSem6] = useState<string>('CHE643');

  // Filter courses by semester
  const semesterCourses = ACADEMIC_COURSES.filter((c) => {
    if (c.semester !== selectedSemester) return false;
    // If it's an elective, show if it's the chosen one or let user select
    if (c.isElective) {
      if (c.semester === 5 && c.code !== selectedElectiveSem5) return false;
      if (c.semester === 6 && c.code !== selectedElectiveSem6) return false;
    }
    return true;
  });

  // Search filtered courses
  const filteredCourses = searchQuery.trim() === ''
    ? semesterCourses
    : ACADEMIC_COURSES.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const currentCourse = ACADEMIC_COURSES.find((c) => c.code === selectedCourseCode) || filteredCourses[0] || ACADEMIC_COURSES[0];

  return (
    <div className="academic-workspace" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Academic Header */}
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
                Degree Curriculum Engine · Semesters III – VIII
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
                Outcome-Based Education (OBE) • Configurable Pathways • 8-Stage Learning
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', fontWeight: 800, margin: '0 0 8px', color: '#ffffff' }}>
              Chemical Engineering Curriculum & Learning Pathways
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0, maxWidth: 840, lineHeight: 1.5 }}>
              Explore semester syllabi, Course Outcomes (CO-PO mapping), transparent mathematical derivations, worked engineering examples, linked first-principles simulations, and direct placement skill connections.
            </p>
          </div>

          {/* Quick Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#090d16', padding: '6px 12px', borderRadius: 8, border: '1px solid #334155' }}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search subjects, codes, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '0.82rem', outline: 'none', width: 200 }}
            />
          </div>
        </div>

        {/* Semester Selection Bar */}
        <div style={{ display: 'flex', gap: 8, marginTop: 22, overflowX: 'auto', paddingBottom: 4 }}>
          {([3, 4, 5, 6, 7, 8] as const).map((sem) => (
            <button
              key={sem}
              type="button"
              onClick={() => {
                setSelectedSemester(sem);
                // Select first course of that semester
                const first = ACADEMIC_COURSES.find((c) => c.semester === sem);
                if (first) setSelectedCourseCode(first.code);
              }}
              style={{
                background: selectedSemester === sem ? '#0284c7' : '#1e293b',
                color: selectedSemester === sem ? '#ffffff' : '#94a3b8',
                border: selectedSemester === sem ? '1px solid #38bdf8' : '1px solid #334155',
                padding: '8px 18px',
                borderRadius: 6,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              Semester {sem === 3 ? 'III' : sem === 4 ? 'IV' : sem === 5 ? 'V' : sem === 6 ? 'VI' : sem === 7 ? 'VII' : 'VIII'}
            </button>
          ))}
        </div>

        {/* Configurable Elective Bar for Sem V & Sem VI */}
        {selectedSemester === 5 && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(2, 132, 199, 0.12)', borderRadius: 6, border: '1px solid #0284c7', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>Configure Registered Elective (CHE55X):</span>
            {[
              { code: 'CHE552', label: 'CHE552: Petroleum Refining Technology' },
              { code: 'CHE551', label: 'CHE551: Material Science' },
              { code: 'CHE553', label: 'CHE553: Non-Conventional Energy' },
              { code: 'CHE554', label: 'CHE554: Interfacial Phenomenon' },
              { code: 'CHE555', label: 'CHE555: Polymer Processing' },
            ].map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setSelectedElectiveSem5(opt.code);
                  setSelectedCourseCode(opt.code);
                }}
                style={{
                  background: selectedElectiveSem5 === opt.code ? '#0284c7' : '#0f172a',
                  color: selectedElectiveSem5 === opt.code ? '#ffffff' : '#94a3b8',
                  border: '1px solid #334155',
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {selectedSemester === 6 && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(16, 185, 129, 0.12)', borderRadius: 6, border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>Configure Registered Elective (CHE64X):</span>
            {[
              { code: 'CHE643', label: 'CHE643: Hazard Analysis & Risk (HAZOP)' },
              { code: 'CHE641', label: 'CHE641: Operations Research' },
              { code: 'CHE642', label: 'CHE642: Industrial Wastewater Treatment' },
              { code: 'CHE644', label: 'CHE644: Chemical Process Modelling' },
              { code: 'CHE645', label: 'CHE645: Biochemical Engineering' },
            ].map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setSelectedElectiveSem6(opt.code);
                  setSelectedCourseCode(opt.code);
                }}
                style={{
                  background: selectedElectiveSem6 === opt.code ? '#10b981' : '#0f172a',
                  color: selectedElectiveSem6 === opt.code ? '#ffffff' : '#94a3b8',
                  border: '1px solid #334155',
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Subject Sidebar + Course Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: 20 }}>
        {/* Left Column: Subject List for Selected Semester */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: 4 }}>
            Semester {selectedSemester} Subjects ({filteredCourses.length})
          </div>

          {filteredCourses.map((course) => {
            const isSelected = course.code === currentCourse.code;
            return (
              <div
                key={course.code}
                onClick={() => setSelectedCourseCode(course.code)}
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #1e3a8a 0%, #0f2752 100%)' : '#0f172a',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid #1e293b',
                  borderRadius: 8,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 2px 10px rgba(56, 189, 248, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isSelected ? '#38bdf8' : '#94a3b8' }}>
                    {course.code}
                  </span>
                  <span style={{ fontSize: '0.64rem', color: '#64748b', background: '#090d16', padding: '2px 6px', borderRadius: 4 }}>
                    {course.credits}
                  </span>
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: isSelected ? '#ffffff' : '#cbd5e1', lineHeight: 1.3 }}>
                  {course.title}
                </div>
                {course.linkedModule && (
                  <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.66rem', color: '#38bdf8' }}>
                    <Activity size={12} /> Interactive Twin Available
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Subject Explorer */}
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 12,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* Active Course Banner */}
          <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                    {currentCourse.code}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                    {currentCourse.category} • Semester {currentCourse.semester} • {currentCourse.credits}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 8px' }}>
                  {currentCourse.title}
                </h2>
                <p style={{ fontSize: '0.86rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                  {currentCourse.description}
                </p>
              </div>

              {currentCourse.linkedModule && (
                <button
                  type="button"
                  onClick={() => onLaunchSimulation(currentCourse.linkedModule!)}
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
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                  }}
                >
                  <Activity size={16} /> Launch Interactive Twin
                </button>
              )}
            </div>

            {/* Course Navigation Tabs */}
            <div style={{ display: 'flex', gap: 6, marginTop: 18, borderTop: '1px solid #1e293b', paddingTop: 12, overflowX: 'auto' }}>
              {[
                { id: 'pathway', label: '8-Stage Learning Pathway', icon: Compass },
                { id: 'syllabus', label: 'Unit-Wise Syllabus & COs', icon: BookOpen },
                { id: 'worked', label: 'Worked Numerical Problem', icon: FileText },
                { id: 'labs', label: `Lab Experiments (${currentCourse.labs?.length || 0})`, icon: FlaskConical },
                { id: 'viva', label: 'Oral Viva Voce & Industry Skills', icon: HelpCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeCourseTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCourseTab(tab.id as any)}
                    style={{
                      background: isActive ? '#1e3a8a' : 'transparent',
                      color: isActive ? '#38bdf8' : '#94a3b8',
                      border: isActive ? '1px solid #2563eb' : '1px solid transparent',
                      padding: '6px 14px',
                      borderRadius: 6,
                      fontSize: '0.78rem',
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

          {/* TAB 1: 8-STAGE LEARNING PATHWAY */}
          {activeCourseTab === 'pathway' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>
                Structured pedagogical sequence: Concept → Visual Explanation → Mathematical Derivation → Worked Example → Interactive Simulation → Engineering Application → Assessment → Industry Connection.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                {currentCourse.pathway.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#090d16',
                      border: '1px solid #1e293b',
                      borderRadius: 8,
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.64rem',
                          fontWeight: 800,
                          color: '#38bdf8',
                          background: 'rgba(56, 189, 248, 0.1)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                        }}
                      >
                        Step {idx + 1}: {p.stepName}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>
                      {p.title}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4, flex: 1 }}>
                      {p.summary}
                    </div>

                    {p.linkedModule && (
                      <button
                        type="button"
                        onClick={() => onLaunchSimulation(p.linkedModule!)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #0284c7',
                          color: '#38bdf8',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          marginTop: 6,
                          alignSelf: 'flex-start',
                        }}
                      >
                        Open Linked Tool <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: UNIT-WISE SYLLABUS & OUTCOMES */}
          {activeCourseTab === 'syllabus' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Course Outcomes */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 8 }}>
                  Course Outcomes (CO) & Program Outcome (PO) Articulation
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {currentCourse.outcomes.map((co) => (
                    <div key={co.coNumber} style={{ background: '#090d16', padding: '10px 14px', borderRadius: 6, border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.8rem' }}>{co.coNumber}</span>
                        <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{co.statement}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {co.poMapping}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Units */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 8 }}>
                  Unit-Wise Syllabus Breakdown ({currentCourse.units.reduce((acc, u) => acc + u.hours, 0)} Total Lecture Hours)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {currentCourse.units.map((unit) => (
                    <div key={unit.unitNumber} style={{ background: '#090d16', padding: 14, borderRadius: 8, border: '1px solid #1e293b' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                          Unit {unit.unitNumber}: {unit.title}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: '#1e293b', padding: '2px 8px', borderRadius: 4 }}>
                          {unit.hours} Hours
                        </span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.6 }}>
                        {unit.topics.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORKED NUMERICAL PROBLEM */}
          {activeCourseTab === 'worked' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {currentCourse.workedProblems && currentCourse.workedProblems.length > 0 ? (
                currentCourse.workedProblems.map((wp, idx) => (
                  <div key={idx} style={{ background: '#090d16', border: '1px solid #1e3a8a', borderRadius: 8, padding: 18 }}>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#38bdf8', marginBottom: 8 }}>
                      Worked Problem {idx + 1}: {wp.title}
                    </div>
                    <div style={{ background: '#0c1424', padding: 12, borderRadius: 6, marginBottom: 12, borderLeft: '3px solid #38bdf8' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                        Problem Statement
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#f8fafc', lineHeight: 1.5 }}>
                        {wp.problem}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                        Analytical Derivation & Solution
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6, fontFamily: 'monospace' }}>
                        {wp.solution}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
                  Comprehensive worked engineering derivations available in the Visual Concept Studio.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LAB EXPERIMENTS */}
          {activeCourseTab === 'labs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentCourse.labs && currentCourse.labs.length > 0 ? (
                currentCourse.labs.map((lab) => (
                  <div key={lab.expNumber} style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 8, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                        Exp #{lab.expNumber}: {lab.title}
                      </span>
                      {lab.linkedModule && (
                        <button
                          type="button"
                          onClick={() => onLaunchSimulation(lab.linkedModule!)}
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: 4,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Virtual Twin
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>
                      <strong style={{ color: '#cbd5e1' }}>Aim:</strong> {lab.objective}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>
                      <strong style={{ color: '#cbd5e1' }}>Apparatus:</strong> {lab.apparatus}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                      <strong style={{ color: '#94a3b8' }}>Procedure:</strong> {lab.procedureSummary}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
                  Laboratory practicals for this subject are covered in the connected Virtual Laboratory sessions.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: VIVA VOCE & INDUSTRY SKILLS */}
          {activeCourseTab === 'viva' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Viva Questions */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 8 }}>
                  Oral Viva Voce & Conceptual Understanding Questions
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {currentCourse.vivaQuestions && currentCourse.vivaQuestions.map((viva, idx) => (
                    <div key={idx} style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                        Q{idx + 1}: {viva.q}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, background: '#0f172a', padding: 10, borderRadius: 6 }}>
                        <strong style={{ color: '#10b981' }}>Model Technical Answer:</strong> {viva.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Placement & Industry Connections */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 8 }}>
                <div style={{ background: '#090d16', padding: 14, borderRadius: 8, border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                    Industry Software Tools
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', color: '#cbd5e1' }}>
                    {(currentCourse.softwareTools || ['Python', 'Excel', 'DWSIM']).map((tool, i) => (
                      <li key={i}>{tool}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: '#090d16', padding: 14, borderRadius: 8, border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                    Real Industrial Applications
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', color: '#cbd5e1' }}>
                    {(currentCourse.industrialApplications || ['Refinery operations', 'Continuous plants']).map((app, i) => (
                      <li key={i}>{app}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: '#090d16', padding: 14, borderRadius: 8, border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                    Campus Placement Skills
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', color: '#cbd5e1' }}>
                    {(currentCourse.placementSkills || ['Mass & energy balance', 'Equipment sizing']).map((skill, i) => (
                      <li key={i}>{skill}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
