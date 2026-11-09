import { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  FileText,
  HelpCircle,
  ExternalLink,
  FlaskConical,
  Award,
  Activity,
} from 'lucide-react';

interface AcademicWorkspaceProps {
  onLaunchSimulation: (moduleId: string) => void;
}

interface CourseUnit {
  unitNumber: number;
  title: string;
  topics: string[];
  hours: number;
}

interface CourseOutcome {
  coNumber: string;
  statement: string;
  poMapping: string;
}

interface LabExperiment {
  expNumber: number;
  title: string;
  objective: string;
  apparatus: string;
  procedureSummary: string;
  linkedModule?: string;
}

interface CourseDefinition {
  code: string;
  title: string;
  semester: 3 | 4;
  credits: string;
  category: string;
  description: string;
  outcomes: CourseOutcome[];
  units: CourseUnit[];
  labs?: LabExperiment[];
  workedProblems?: { title: string; problem: string; solution: string }[];
  vivaQuestions?: { q: string; a: string }[];
  linkedModule?: string;
}

const ACADEMIC_COURSES: CourseDefinition[] = [
  // =========================================================================
  // SEMESTER III COURSES
  // =========================================================================
  {
    code: 'CH31',
    title: 'Integral Transforms, Complex Analysis and PDE',
    semester: 3,
    credits: '3:0:0 (3 Credits)',
    category: 'Basic Engineering Sciences (Math)',
    description: 'Foundational mathematical methods for chemical engineering modeling, transport partial differential equations, and frequency-domain transforms.',
    outcomes: [
      { coNumber: 'CO1', statement: 'Apply Laplace transforms to solve chemical process differential equations.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO2', statement: 'Analyze analytic complex functions and evaluate contour residues.', poMapping: 'PO1' },
      { coNumber: 'CO3', statement: 'Formulate and solve 1D heat and wave partial differential equations.', poMapping: 'PO1, PO2, PO3' },
      { coNumber: 'CO4', statement: 'Apply numerical finite-difference schemes for 2D Laplace transport equations.', poMapping: 'PO1, PO5' },
    ],
    units: [
      { unitNumber: 1, title: 'Laplace Transforms & Inversion', topics: ['Definitions and properties', 'Transforms of derivatives and integrals', 'Heaviside unit step and Dirac delta functions', 'Convolution theorem and inverse Laplace'], hours: 8 },
      { unitNumber: 2, title: 'Complex Variables & Analytic Functions', topics: ['Cauchy-Riemann equations in Cartesian and polar coordinates', 'Harmonic conjugate functions', 'Conformal mapping and bilinear transformations'], hours: 8 },
      { unitNumber: 3, title: 'Complex Integration & Residue Calculus', topics: ['Line integrals in complex plane', 'Cauchy-Goursat integral theorem', 'Taylor and Laurent series expansions', 'Residue theorem and contour integration along real axis'], hours: 8 },
      { unitNumber: 4, title: 'Partial Differential Equations (PDE)', topics: ['Classification of 2nd order linear PDEs', 'Method of separation of variables', '1D transient heat conduction equation', '1D acoustic and wave equations'], hours: 8 },
      { unitNumber: 5, title: 'Finite-Difference Approximations', topics: ['Explicit and implicit Crank-Nicolson schemes', '2D Laplace steady-state temperature distribution', 'Boundary condition discretizations'], hours: 8 },
    ],
    workedProblems: [
      {
        title: 'Laplace Solution for CSTR Dynamic Concentration Step Response',
        problem: 'A CSTR with residence time τ = 10 min experiences a sudden step change in inlet concentration C_in(t) = C_0 * u(t). Find C(t) assuming initial concentration C(0) = 0.',
        solution: 'Governing equation: dC/dt + (1/τ) C = (1/τ) C_in. Taking Laplace transform: s C(s) - C(0) + (1/τ) C(s) = (C_0/τ) * (1/s). Rearranging: C(s) = C_0 / [s (τ s + 1)] = C_0 [1/s - τ/(τ s + 1)]. Taking inverse Laplace: C(t) = C_0 [1 - exp(-t/τ)]. At t = 10 min, C(10) = 0.632 C_0 (63.2% completion).',
      },
    ],
    vivaQuestions: [
      { q: 'What is the physical meaning of the Cauchy-Riemann equations?', a: 'They guarantee that the directional derivative of a complex function f(z) = u(x,y) + i v(x,y) is independent of the path of approach, ensuring local isotropy and orthogonality of potential and stream functions.' },
    ],
  },
  {
    code: 'CH32',
    title: 'Momentum Transfer (Fluid Flow Operations)',
    semester: 3,
    credits: '3:1:0 (4 Credits)',
    category: 'Core Chemical Engineering',
    description: 'Fundamental fluid statics, kinematics, Navier-Stokes equations, pipe friction losses, boundary layer theory, flow measurement, and turbomachinery.',
    linkedModule: 'centrifugal-pump',
    outcomes: [
      { coNumber: 'CO1', statement: 'Calculate hydrostatic pressures and manometer fluid column readings.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO2', statement: 'Apply continuity and mechanical energy Bernoulli balance to piping networks.', poMapping: 'PO1, PO2, PO3' },
      { coNumber: 'CO3', statement: 'Evaluate friction factor and Darcy-Weisbach head losses in laminar and turbulent flows.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO4', statement: 'Analyze flow measurement devices (venturi, orifice, rotameter) and centrifugal pump operating points.', poMapping: 'PO1, PO3, PO4' },
    ],
    units: [
      { unitNumber: 1, title: 'Fluid Statics & Properties', topics: ['Hydrostatic equilibrium', 'U-tube and differential manometers', 'Rheology of Newtonian and non-Newtonian fluids', 'Dynamic and kinematic viscosity'], hours: 10 },
      { unitNumber: 2, title: 'Fluid Dynamics & Energy Balances', topics: ['Continuity equation in differential and integral forms', 'Bernoulli equation with pump head and friction losses', 'Momentum balance for fluid jets and pipe bends'], hours: 10 },
      { unitNumber: 3, title: 'Flow Through Conduits & Pipe Friction', topics: ['Laminar flow in circular conduits (Hagen-Poiseuille equation)', 'Turbulent flow, Reynolds stresses, and Moody diagram', 'Darcy-Weisbach friction factor correlations', 'Minor losses across valves and fittings'], hours: 10 },
      { unitNumber: 4, title: 'Flow Past Immersed Bodies & Fluidisation', topics: ['Boundary layer development and skin friction', 'Form drag and drag coefficient vs Reynolds number', 'Ergun equation for flow through packed beds', 'Mechanisms of gas-solid fluidisation'], hours: 10 },
      { unitNumber: 5, title: 'Flow Measurement & Centrifugal Pumping', topics: ['Orifice meters, Venturi meters, and Pitot tubes', 'Centrifugal pump construction, Euler equation, and slip factor', 'Pump characteristic curves and system curve intersection', 'NPSH and prevention of cavitation'], hours: 10 },
    ],
    workedProblems: [
      {
        title: 'Darcy-Weisbach Head Loss in Commercial Steel Pipe',
        problem: 'Water (ρ = 1000 kg/m³, μ = 0.001 Pa·s) flows through a 50 mm ID commercial steel pipe (ε = 0.045 mm) of length 60 m at 20 m³/h. Calculate pressure drop.',
        solution: 'Area A = π(0.05)²/4 = 0.001963 m². Velocity v = (20/3600)/0.001963 = 2.83 m/s. Reynolds number Re = (1000 * 2.83 * 0.05) / 0.001 = 141,500 (Turbulent). Relative roughness ε/D = 0.045/50 = 0.0009. Using Swamee-Jain equation: f = 0.0212. Friction head loss h_f = 0.0212 * (60/0.05) * (2.83)² / (2 * 9.81) = 10.38 m. Pressure drop ΔP = ρ g h_f = 1000 * 9.81 * 10.38 = 101.8 kPa (1.018 bar).',
      },
    ],
    vivaQuestions: [
      { q: 'What is the physical meaning of NPSHa and how does it prevent pump cavitation?', a: 'Net Positive Suction Head Available (NPSHa) is the total absolute stagnation head at the pump suction nozzle above liquid vapor pressure. If NPSHa exceeds Required NPSH (NPSHr), local static pressure remains safely above vapor pressure, preventing vapor bubble inception.' },
    ],
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
      { coNumber: 'CO4', statement: 'Evaluate constant pressure and constant rate filtration equations and minimum fluidisation velocity.', poMapping: 'PO1, PO2, PO3' },
    ],
    units: [
      { unitNumber: 1, title: 'Particle Characterization & Sieve Screening', topics: ['Sphericity and equivalent particle diameters', 'Tyler standard sieve series', 'Differential and cumulative particle size analysis', 'Screen effectiveness and industrial vibrating screens'], hours: 8 },
      { unitNumber: 2, title: 'Size Reduction & Crushing Laws', topics: ['Mechanisms of crushing, impact, and attrition', 'Rittingers law, Kicks law, and Bonds work index law', 'Jaw crushers, gyratory crushers, and ball mill critical speed'], hours: 8 },
      { unitNumber: 3, title: 'Sedimentation, Settling & Thickening', topics: ['Drag coefficients and Stokes settling regime', 'Hindered settling and Richardson-Zaki correlation', 'Kynch batch sedimentation theory', 'Continuous gravity thickener design (Coe-Clevenger method)'], hours: 8 },
      { unitNumber: 4, title: 'Solid-Liquid Filtration Operations', topics: ['Kozeny-Carman cake filtration equation', 'Specific cake resistance and filter medium resistance', 'Plate-and-frame filter press and rotary drum vacuum filters', 'Washing and cycle time optimization'], hours: 8 },
      { unitNumber: 5, title: 'Agitation, Mixing & Fluidisation Dynamics', topics: ['Impeller types (marine propeller, flat blade turbine, anchor)', 'Power number vs Reynolds number agitation correlations', 'Mechanisms of packed bed pressure drop (Ergun equation)', 'Minimum fluidisation velocity and Geldart classification'], hours: 8 },
    ],
  },
  {
    code: 'CH35',
    title: 'Technical Chemistry for Process Engineering',
    semester: 3,
    credits: '3:0:0 (3 Credits)',
    category: 'Basic Sciences (Chemistry)',
    description: 'Physical and organic chemical foundations for process engineers: reaction kinetics, Langmuir adsorption isotherms, homogeneous catalysis, and industrial polymers.',
    outcomes: [
      { coNumber: 'CO1', statement: 'Interpret chemical reaction rate laws and activation energies.', poMapping: 'PO1' },
      { coNumber: 'CO2', statement: 'Model physical and chemical adsorption using Langmuir and Freundlich isotherms.', poMapping: 'PO1, PO2' },
    ],
    units: [
      { unitNumber: 1, title: 'Chemical Kinetics & Catalysis', topics: ['Order and molecularity of reactions', 'Arrhenius temperature dependence and collision theory', 'Homogeneous and heterogeneous catalytic mechanisms'], hours: 8 },
      { unitNumber: 2, title: 'Surface Chemistry & Adsorption', topics: ['Physisorption vs chemisorption', 'Freundlich and Langmuir adsorption isotherms', 'BET surface area determination'], hours: 8 },
      { unitNumber: 3, title: 'Electrochemistry & Corrosion Engineering', topics: ['Nernst equation and galvanic cells', 'Electrochemical corrosion mechanisms and Pourbaix diagrams', 'Cathodic and anodic protection methods'], hours: 8 },
      { unitNumber: 4, title: 'Colligative Properties & Phase Rule', topics: ['Gibbs phase rule for single and multi-component systems', 'Raoults law and boiling point elevation', 'Colloidal systems and zeta potential'], hours: 8 },
      { unitNumber: 5, title: 'Industrial Organic Synthesis', topics: ['Petrochemical feedstocks and cracking', 'Polymerization mechanisms (addition vs condensation)', 'Green chemistry principles'], hours: 8 },
    ],
  },
  {
    code: 'CHL39',
    title: 'Mechanical Operations Laboratory',
    semester: 3,
    credits: '0:0:1.5 (1.5 Credits)',
    category: 'Laboratory Course',
    description: 'Hands-on laboratory verification of particle sizing, crushing energy laws, settling dynamics, filtration resistance, and fluidisation bed characteristics.',
    linkedModule: 'fluidisation',
    outcomes: [
      { coNumber: 'CO1', statement: 'Conduct sieve screen analysis and determine particle size distribution parameters.', poMapping: 'PO1, PO4' },
      { coNumber: 'CO2', statement: 'Verify Bond work index and crushing energy in laboratory ball mills and jaw crushers.', poMapping: 'PO1, PO2, PO4' },
      { coNumber: 'CO3', statement: 'Measure minimum fluidisation velocity and bed pressure drop in a gas-solid fluidised bed.', poMapping: 'PO1, PO2, PO4' },
    ],
    units: [],
    labs: [
      { expNumber: 1, title: 'Sieve Analysis of Granular Solids', objective: 'Determine mean particle size and screen effectiveness using Tyler standard sieves.', apparatus: 'Ro-Tap sieve shaker, Tyler sieve stack, analytical balance.', procedureSummary: 'Weigh 500g sand sample; place in top sieve; shake for 15 min; weigh mass retained on each sieve; plot cumulative frequency.' },
      { expNumber: 2, title: 'Jaw Crusher Size Reduction', objective: 'Verify Rittinger and Kick crushing laws by crushing coarse gravel.', apparatus: 'Blake-type jaw crusher, electric motor, caliper.', procedureSummary: 'Measure initial rock dimensions; feed into jaw crusher; screen crushed product; calculate reduction ratio and energy input.' },
      { expNumber: 3, title: 'Ball Mill Critical Speed and Grinding', objective: 'Determine the critical speed of rotation and grinding efficiency.', apparatus: 'Laboratory cylindrical ball mill, steel balls, tachometer.', procedureSummary: 'Charge mill with 20% ball volume; operate at varying RPM (30%, 75%, 110% of critical speed); observe cascading vs centrifuging.' },
      { expNumber: 4, title: 'Drop Weight Crusher Work Index', objective: 'Calculate the impact energy required to produce new surface area.', apparatus: 'Drop-weight crusher tower with guide tube and anvil.', procedureSummary: 'Drop calibrated steel weight from measured heights onto rock specimen; determine new surface area created.' },
      { expNumber: 5, title: 'Batch Sedimentation of Calcium Carbonate', objective: 'Determine settling velocity and construct Kynch interface height curves.', apparatus: '1000 mL graduated glass cylinder, stop watch, CaCO3 slurry.', procedureSummary: 'Prepare 5%, 10%, and 15% CaCO3 slurry; invert cylinder to homogenize; record mudline interface height vs time.' },
      { expNumber: 6, title: 'Leaf Filter Constant Pressure Filtration', objective: 'Calculate specific cake resistance and filter cloth resistance.', apparatus: 'Vacuum leaf filter unit, vacuum pump, slurry vessel, filtrate receiver.', procedureSummary: 'Immerse filter leaf in slurry under constant vacuum; record filtrate volume vs time; plot t/V versus V.' },
      { expNumber: 7, title: 'Plate and Frame Filter Press', objective: 'Study the filtration of slurry through a multi-chamber filter press.', apparatus: 'Plate and frame press, feed pump, pressure gauges.', procedureSummary: 'Assemble plates and frames with filter cloths; pump slurry at constant pressure; record filtrate collection rate; cake washing.' },
      { expNumber: 8, title: 'Rotary Vacuum Drum Filter', objective: 'Evaluate continuous vacuum filtration of compressible slurries.', apparatus: 'Pilot-scale rotary vacuum drum filter, variable speed drive.', procedureSummary: 'Set drum submergence to 30%; rotate drum through slurry trough; record cake pickup, washing, dewatering, and knife discharge.' },
      { expNumber: 9, title: 'Cyclone Separator Dust Collection Efficiency', objective: 'Determine overall separation efficiency and pressure drop of gas-solid cyclone.', apparatus: 'Transparent acrylic cyclone separator, blower, dust feeder, manometer.', procedureSummary: 'Inject dust particles into air stream; measure inlet velocity and pressure drop across cyclone; weigh collected solids in dust hopper.' },
      { expNumber: 10, title: 'Air Elutriation of Fine Powders', objective: 'Separate fine particles using upward air velocity.', apparatus: 'Vertical elutriator tube, calibrated rotameter, dust trap.', procedureSummary: 'Introduce powder mixture; adjust upward air velocity equal to terminal velocity of cut size; collect elutriated fines.' },
      { expNumber: 11, title: 'Gas-Solid Fluidisation Dynamics', objective: 'Measure bed pressure drop, minimum fluidisation velocity (u_mf), and bed expansion ratio.', apparatus: 'Transparent acrylic vertical fluidised bed column, porous distributor, manometer.', procedureSummary: 'Load silica sand bed; increase superficial air velocity; record bed pressure drop and bed height; identify bubbling regime.', linkedModule: 'fluidisation' },
      { expNumber: 12, title: 'Agitated Vessel Power Consumption', objective: 'Determine Power Number vs Reynolds Number curve for turbine impellers.', apparatus: 'Baffled cylindrical mixing tank, marine propeller, Rushton turbine, torque sensor.', procedureSummary: 'Fill tank with water/glycerol; measure motor torque and shaft RPM for unbaffled and baffled vessels; plot N_p vs Re.' },
      { expNumber: 13, title: 'Tray Dryer Drying Kinetics', objective: 'Construct drying rate curve and determine critical moisture content.', apparatus: 'Heated air tray dryer, load cell, hygrometer, anemometer.', procedureSummary: 'Spread wet solid on drying tray; blow heated air at constant velocity and temperature; record sample mass every 5 min.' },
      { expNumber: 14, title: 'Froth Flotation of Mineral Ore', objective: 'Demonstrate froth separation of mineral particles using surfactants.', apparatus: 'Sub-aeration flotation cell, impeller aerator, skimmer.', procedureSummary: 'Condition mineral pulp with frother and collector; bubble air through cell; skim mineralized froth; calculate recovery percentage.' },
    ],
  },

  // =========================================================================
  // SEMESTER IV COURSES
  // =========================================================================
  {
    code: 'CH41',
    title: 'Chemical Reaction Engineering I (CRE-I)',
    semester: 4,
    credits: '3:1:0 (4 Credits)',
    category: 'Core Chemical Engineering',
    description: 'Kinetics of homogeneous reactions, interpretation of batch reactor data, design of ideal isothermal Batch, CSTR, and PFR reactors, and multiple reactor configurations.',
    linkedModule: 'reactor',
    outcomes: [
      { coNumber: 'CO1', statement: 'Deduce rate laws and reaction mechanisms from experimental kinetic data.', poMapping: 'PO1, PO2' },
      { coNumber: 'CO2', statement: 'Design isothermal Batch, CSTR, and PFR reactors for single homogeneous reactions.', poMapping: 'PO1, PO2, PO3' },
      { coNumber: 'CO3', statement: 'Size multiple reactor configurations (reactors in series and parallel) for maximum conversion.', poMapping: 'PO1, PO3, PO5' },
      { coNumber: 'CO4', statement: 'Analyze yield and selectivity for parallel, series, and complex reaction networks.', poMapping: 'PO1, PO2, PO3' },
    ],
    units: [
      { unitNumber: 1, title: 'Homogeneous Reaction Kinetics', topics: ['Rate of reaction and variables affecting rate', 'Temperature-dependent term (Arrhenius equation and transition state theory)', 'Elementary vs non-elementary reaction mechanisms', 'Differential and integral methods of kinetic analysis'], hours: 10 },
      { unitNumber: 2, title: 'Ideal Batch Reactor Design', topics: ['Constant-volume and variable-volume batch reactor design equations', 'Reaction time calculation for zero, first, and second order reactions', 'Autocatalytic reactions'], hours: 10 },
      { unitNumber: 3, title: 'Continuous Stirred Tank Reactor (CSTR)', topics: ['Design equation for steady-state CSTR', 'Space time (τ) and space velocity', 'Damköhler number (Da) scaling', 'Graphical sizing using Levenspiel plots'], hours: 10 },
      { unitNumber: 4, title: 'Plug Flow Reactor (PFR) & Reactor Comparison', topics: ['Design equation for ideal plug flow reactor', 'Comparison of PFR vs CSTR volumes for same conversion', 'CSTRs in series and equal vs unequal volume optimization'], hours: 10 },
      { unitNumber: 5, title: 'Multiple Reactions & Yield/Selectivity', topics: ['Parallel competing reactions (A -> R desired, A -> S undesired)', 'Instantaneous and overall fractional yield', 'Series consecutive reactions (A -> R -> S) and maximum intermediate concentration'], hours: 10 },
    ],
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
  },
  {
    code: 'CHL47',
    title: 'Pollution Control & Environmental Analysis Laboratory',
    semester: 4,
    credits: '0:0:1.5 (1.5 Credits)',
    category: 'Laboratory Course',
    description: 'Prescribed laboratory experiments for testing wastewater quality, organic load (BOD/COD), dissolved solids, jar test coagulation, and atmospheric emission pollutants.',
    outcomes: [
      { coNumber: 'CO1', statement: 'Determine chemical oxygen demand (COD) and 5-day biochemical oxygen demand (BOD) of industrial wastewater.', poMapping: 'PO1, PO4, PO7' },
      { coNumber: 'CO2', statement: 'Measure suspended, dissolved, and volatile solids and optimize coagulation via jar testing.', poMapping: 'PO1, PO4, PO7' },
    ],
    units: [],
    labs: [
      { expNumber: 1, title: 'pH and Electrical Conductivity of Industrial Effluents', objective: 'Measure pH and conductivity of wastewater samples.', apparatus: 'Digital pH meter, conductivity bridge, standard buffer solutions.', procedureSummary: 'Calibrate pH probe with pH 4.0, 7.0, and 9.2 buffers; immerse in effluent; record pH and specific conductance (μS/cm).' },
      { expNumber: 2, title: 'Alkalinity and Acidity Titration', objective: 'Determine phenolphthalein and total methyl orange alkalinity in water.', apparatus: 'Burette, conical flasks, 0.02 N H2SO4, 0.02 N NaOH.', procedureSummary: 'Titrate 100 mL sample with standard sulfuric acid using phenolphthalein (pH 8.3) and methyl orange (pH 4.5) indicators.' },
      { expNumber: 3, title: 'Turbidity Measurement Using Nephelometer', objective: 'Measure colloidal turbidity of water samples.', apparatus: 'Nephelometric turbidity meter, Formazin standard suspension.', procedureSummary: 'Calibrate nephelometer with 40 NTU standard; measure sample scattering at 90 degrees; report turbidity in NTU.' },
      { expNumber: 4, title: 'Total, Dissolved, and Suspended Solids (TDS/TSS)', objective: 'Quantify solid impurities in industrial wastewater.', apparatus: 'Gooch crucibles, Whatman glass fiber filters, drying oven (105°C), muffle furnace (550°C).', procedureSummary: 'Filter sample through pre-weighed filter; dry residue at 105°C for TSS; evaporate filtrate for TDS; ignite at 550°C for volatile solids.' },
      { expNumber: 5, title: 'Jar Test for Optimum Coagulant Dosage', objective: 'Determine optimum alum dosage for coagulation and flocculation.', apparatus: 'Six-paddle gang jar tester, alum solution, turbidity meter.', procedureSummary: 'Dose six 1000 mL beakers with 10, 20, 30, 40, 50, 60 mg/L alum; rapid mix at 100 RPM for 1 min; slow flocculate at 30 RPM for 20 min; settle for 30 min; measure residual turbidity.' },
      { expNumber: 6, title: 'Dissolved Oxygen (DO) by Winkler Azide Method', objective: 'Measure dissolved oxygen concentration in surface water.', apparatus: '300 mL BOD bottles, MnSO4, alkali-iodide-azide, 0.025 N sodium thiosulfate.', procedureSummary: 'Collect sample without air entrainment; add MnSO4 and alkali-iodide-azide; acidify with H2SO4; titrate liberated iodine with thiosulfate.' },
      { expNumber: 7, title: '5-Day Biochemical Oxygen Demand (BOD_5)', objective: 'Determine biodegradable organic pollution in wastewater.', apparatus: 'BOD incubator (20°C), aeration glassware, dilution water.', procedureSummary: 'Prepare suitable dilution of sample with aerated nutrient water; measure initial DO; incubate for 5 days at 20°C; measure final DO; calculate BOD.' },
      { expNumber: 8, title: 'Chemical Oxygen Demand (COD) Closed Reflux Method', objective: 'Measure total oxidizable organic and inorganic matter.', apparatus: 'COD digester block, reflux tubes, K2Cr2O7 digestion solution, ferrous ammonium sulfate (FAS).', procedureSummary: 'Digest sample with potassium dichromate and sulfuric acid at 150°C for 2 hours; titrate unreacted dichromate with FAS using ferroin indicator.' },
      { expNumber: 9, title: 'Viscosity Measurement Using Brookfield Viscometer', objective: 'Measure apparent viscosity of polymer solutions and industrial slurries.', apparatus: 'Brookfield rotational viscometer, spindle set, temperature bath.', procedureSummary: 'Select appropriate spindle and rotational speed; immerse spindle in sample; record torque percentage and calculate viscosity in cP.' },
      { expNumber: 10, title: 'Heavy Metal Analysis (Hexavalent Chromium) by UV-Vis', objective: 'Quantify Cr(VI) in electroplating wastewater using spectrophotometry.', apparatus: 'UV-Visible spectrophotometer, 1,5-diphenylcarbazide reagent, quartz cuvettes.', procedureSummary: 'React sample with diphenylcarbazide at pH 1.0 to develop red-violet complex; measure absorbance at 540 nm; determine concentration from calibration curve.' },
    ],
  },
];

export function AcademicWorkspace({ onLaunchSimulation }: AcademicWorkspaceProps) {
  const [selectedSemester, setSelectedSemester] = useState<3 | 4>(3);
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('CH32');
  const [activeCourseTab, setActiveCourseTab] = useState<'syllabus' | 'worked' | 'labs' | 'viva'>('syllabus');

  const filteredCourses = ACADEMIC_COURSES.filter((c) => c.semester === selectedSemester);
  const currentCourse = ACADEMIC_COURSES.find((c) => c.code === selectedCourseCode) || filteredCourses[0];

  return (
    <div className="academic-workspace" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Top Academic Header with Curriculum Engine Configuration */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#0f172a',
          padding: '16px 22px',
          borderRadius: 8,
          border: '1px solid #1e293b',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 10, background: '#0284c7', borderRadius: 8, color: '#ffffff' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              Academic Learning Workspace & Curriculum Engine
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              VTU / Autonomous Chemical Engineering Curriculum (2026–27 Scheme) • Outcome-Based Education (OBE)
            </div>
          </div>
        </div>

        {/* Semester & Curriculum Version Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
            <span style={{ color: '#94a3b8', marginRight: 4 }}>Scheme:</span>
            <strong>2026–27 v1.2</strong>
          </div>

          <div style={{ display: 'flex', background: '#1e293b', borderRadius: 6, padding: 3 }}>
            <button
              onClick={() => {
                setSelectedSemester(3);
                setSelectedCourseCode('CH32');
              }}
              style={{
                background: selectedSemester === 3 ? '#0284c7' : 'transparent',
                color: selectedSemester === 3 ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: 4,
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Semester III
            </button>
            <button
              onClick={() => {
                setSelectedSemester(4);
                setSelectedCourseCode('CH41');
              }}
              style={{
                background: selectedSemester === 4 ? '#0284c7' : 'transparent',
                color: selectedSemester === 4 ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: 4,
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Semester IV
            </button>
          </div>
        </div>
      </div>

      {/* Course List & Course Detail Container (2 Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
        {/* Left Column: Course Directory for Selected Semester */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '4px 6px' }}>
            Semester {selectedSemester} Prescribed Courses ({filteredCourses.length})
          </div>

          {filteredCourses.map((course) => {
            const isSelected = course.code === currentCourse.code;
            return (
              <div
                key={course.code}
                onClick={() => {
                  setSelectedCourseCode(course.code);
                  setActiveCourseTab('syllabus');
                }}
                style={{
                  background: isSelected ? '#0f2942' : '#0f172a',
                  border: isSelected ? '1.5px solid #0284c7' : '1px solid #1e293b',
                  borderRadius: 8,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>{course.code}</span>
                  <span style={{ fontSize: '0.66rem', background: '#1e293b', color: '#94a3b8', padding: '1px 6px', borderRadius: 4 }}>
                    {course.credits.split(' ')[0]}
                  </span>
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 }}>
                  {course.title}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{course.category}</div>

                {course.linkedModule && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '0.68rem', color: '#34d399', fontWeight: 600 }}>
                    <Activity size={12} /> Connected Digital Twin Simulator
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Course Workstation */}
        <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Course Top Title & Linked Digital Twin Pill */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.8rem', background: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                  {currentCourse.code}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{currentCourse.credits} • {currentCourse.category}</span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginTop: 6, margin: 0 }}>
                {currentCourse.title}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: 6, lineHeight: 1.5, margin: 0 }}>
                {currentCourse.description}
              </p>
            </div>

            {/* Launch simulation button if linked */}
            {currentCourse.linkedModule && (
              <button
                onClick={() => onLaunchSimulation(currentCourse.linkedModule!)}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                }}
              >
                <ExternalLink size={14} /> Launch Linked Equipment Twin
              </button>
            )}
          </div>

          {/* Course Navigation Subtabs */}
          <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #1e293b', paddingBottom: 8 }}>
            <button
              className={`btn-tag ${activeCourseTab === 'syllabus' ? 'active' : ''}`}
              onClick={() => setActiveCourseTab('syllabus')}
              style={{ fontSize: '0.76rem', padding: '6px 12px' }}
            >
              <BookOpen size={14} style={{ marginRight: 4 }} /> Syllabus & Units ({currentCourse.units.length})
            </button>
            {currentCourse.workedProblems && (
              <button
                className={`btn-tag ${activeCourseTab === 'worked' ? 'active' : ''}`}
                onClick={() => setActiveCourseTab('worked')}
                style={{ fontSize: '0.76rem', padding: '6px 12px' }}
              >
                <FileText size={14} style={{ marginRight: 4 }} /> Worked Engineering Problems
              </button>
            )}
            {currentCourse.labs && currentCourse.labs.length > 0 && (
              <button
                className={`btn-tag ${activeCourseTab === 'labs' ? 'active' : ''}`}
                onClick={() => setActiveCourseTab('labs')}
                style={{ fontSize: '0.76rem', padding: '6px 12px' }}
              >
                <FlaskConical size={14} style={{ marginRight: 4 }} /> Laboratory Practicals ({currentCourse.labs.length})
              </button>
            )}
            {currentCourse.vivaQuestions && (
              <button
                className={`btn-tag ${activeCourseTab === 'viva' ? 'active' : ''}`}
                onClick={() => setActiveCourseTab('viva')}
                style={{ fontSize: '0.76rem', padding: '6px 12px' }}
              >
                <HelpCircle size={14} style={{ marginRight: 4 }} /> Viva Questions & Answers
              </button>
            )}
          </div>

          {/* Subtab 1: Syllabus Units & Learning Outcomes */}
          {activeCourseTab === 'syllabus' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Course Outcomes (CO) Box */}
              <div style={{ background: '#1e293b44', padding: 14, borderRadius: 6, border: '1px solid #334155' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Award size={15} /> Prescribed Course Learning Outcomes (OBE)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {currentCourse.outcomes.map((co) => (
                    <div key={co.coNumber} style={{ display: 'flex', gap: 10, fontSize: '0.75rem', color: '#cbd5e1' }}>
                      <strong style={{ color: '#f8fafc', minWidth: 35 }}>{co.coNumber}:</strong>
                      <span style={{ flex: 1 }}>{co.statement}</span>
                      <span style={{ color: '#64748b', fontSize: '0.68rem' }}>[{co.poMapping}]</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Syllabus Units Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentCourse.units.map((unit) => (
                  <div key={unit.unitNumber} style={{ background: '#1e293b33', padding: 14, borderRadius: 6, border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                        Unit {unit.unitNumber}: {unit.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{unit.hours} Lecture Hours</span>
                    </div>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: 18, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                      {unit.topics.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab 2: Worked Engineering Problems */}
          {activeCourseTab === 'worked' && currentCourse.workedProblems && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentCourse.workedProblems.map((prob, idx) => (
                <div key={idx} style={{ background: '#1e293b44', padding: 16, borderRadius: 6, border: '1px solid #334155' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8' }}>{prob.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#f8fafc', background: '#090d16', padding: 12, borderRadius: 4, margin: '8px 0', border: '1px solid #1e293b', lineHeight: 1.5 }}>
                    <strong>Problem Statement:</strong> {prob.problem}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#a7f3d0', background: '#064e3b22', padding: 12, borderRadius: 4, border: '1px solid #059669', lineHeight: 1.5 }}>
                    <strong style={{ color: '#34d399' }}>Detailed Step-by-Step Solution:</strong>
                    <br />
                    {prob.solution}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subtab 3: Laboratory Experiments Directory */}
          {activeCourseTab === 'labs' && currentCourse.labs && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginBottom: 4 }}>
                Prescribed laboratory experiments from the curriculum syllabus with objectives, experimental apparatus, and step-by-step procedures:
              </div>
              {currentCourse.labs.map((lab) => (
                <div key={lab.expNumber} style={{ background: '#1e293b33', padding: 14, borderRadius: 6, border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                      Experiment {lab.expNumber}: {lab.title}
                    </span>
                    {lab.linkedModule && (
                      <button
                        onClick={() => onLaunchSimulation(lab.linkedModule!)}
                        style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <ExternalLink size={11} /> Open Simulator
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: 4 }}>
                    <strong>Objective:</strong> {lab.objective}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: 4 }}>
                    <strong>Apparatus:</strong> {lab.apparatus}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: 4, lineHeight: 1.45 }}>
                    <strong>Procedure:</strong> {lab.procedureSummary}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subtab 4: Viva Voce Questions */}
          {activeCourseTab === 'viva' && currentCourse.vivaQuestions && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentCourse.vivaQuestions.map((viva, idx) => (
                <div key={idx} style={{ background: '#1e293b44', padding: 14, borderRadius: 6, border: '1px solid #334155' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8' }}>Q: {viva.q}</div>
                  <div style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: 4, lineHeight: 1.45 }}>
                    <strong style={{ color: '#10b981' }}>Answer:</strong> {viva.a}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
