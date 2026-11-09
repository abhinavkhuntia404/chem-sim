# CHEM-SIM — The Chemical Engineering Learning, Simulation, Digital Twin & Career Readiness Platform

**CHEM-SIM** is a comprehensive, scientifically grounded Chemical Engineering simulation, digital twin, full degree curriculum, teaching companion, and career-readiness platform built with Python (FastAPI, NumPy, SciPy) and modern React (TypeScript, Vite, Tailwind CSS, Lucide icons).

Designed following MANAS scientific engineering design principles: transparent assumptions, strict dimensional safety, rigorous first-principles physics models, zero administrative bloat, and high-density technical interfaces.

---

## 🏛️ Master Platform Architecture

CHEM-SIM is structured into **integrated, curriculum-independent workspaces** connecting academic learning, practical engineering, industrial digital twins, and career readiness:

### 1. Product Landing Page & Process Visualizer (`HomeWorkspace.tsx`)
- Headline: *"Understand Engineering. Simulate Reality."*
- Interactive live chemical process simulation loop connecting a Surge Tank $\to$ Centrifugal Pump (API 610) $\to$ Shell & Tube Preheater $\to$ CSTR Reactor $\to$ Distillation Column with dynamic speed, flow, temperature, and conversion controls.
- 6 Engineering Discipline Exploration Cards (Fluid Mechanics, Mechanical Operations, Heat Transfer, Mass Transfer, Chemical Reaction Engineering, Thermodynamics).
- Real previews of flagship digital twins and supplemental simulations.
- Visual Concept learning showcase, industrial digital twin three-tier roadmap, Student & Faculty workspace overviews, engineering toolbox highlights, and corporate footer.

### 2. Full Degree Curriculum Explorer (`AcademicWorkspace.tsx`)
- Complete degree pathway supporting students from the 2nd year through graduation:
  - **Semester III (Foundations)**: Integral Transforms, Complex Analysis & PDE; Momentum Transfer; Chemical Process Calculations; Mechanical Operations; Technical Chemistry.
  - **Semester IV (Core Principles)**: Numerical Methods & Statistics; Heat Transfer; Chemical Engineering Thermodynamics; Materials Science & Corrosion; Environmental Engineering.
  - **Semester V (Core Chemical Engineering & Elective I)**: Mass Transfer I; Chemical Reaction Engineering I; Process Instrumentation & Dynamics; Process Utilities & Safety; + **Configurable Elective I** (*Petroleum Refining, Material Science & Engineering, Non-Conventional Energy Sources, Interfacial Science, Polymer Processing*).
  - **Semester VI (Advanced Separation & Elective II)**: Mass Transfer II; Chemical Reaction Engineering II; Transport Phenomena; Industrial Pollution Control; + **Configurable Elective II** (*Process Safety & HAZOP, Operations Research, Industrial Wastewater Treatment, Process Modeling & Simulation, Biochemical Engineering*).
  - **Semester VII (Plant Design, Economics & Elective III)**: Chemical Equipment Design & Drawing; Plant Design & Process Economics; Safety, Health & Loss Prevention in Chemical Plants; + **Configurable Elective III** (*Drug Delivery Systems, Natural Gas Engineering, Advanced Separation Technologies, Pinch Analysis & Heat Integration, Solid Waste Management*).
  - **Semester VIII (Capstone & Industrial Transition)**: Major Engineering Capstone Project; Industrial Internship & In-Plant Training; Professional Ethics & Entrepreneurship; Technical Seminar & Research Paper.
- **Structured 8-Stage Learning Pathway** for every subject:
  $$\text{Concept} \to \text{Visual Explanation} \to \text{Mathematical Derivation} \to \text{Worked Example} \to \text{Interactive Simulation} \to \text{Engineering Application} \to \text{Assessment} \to \text{Industry Connection}$$
- Unit-wise syllabi, lecture hours, Course Outcomes (CO-PO mapping), worked analytical engineering problems, laboratory catalogs, and placement skill connections.
- Configurable Program Elective filter allowing students to customize their individual elective tracks without curriculum clutter.

### 3. Faculty Teaching Studio (`TeacherWorkspace.tsx`)
- Dedicated teaching companion for classroom lectures, visual demonstration, and assignment management:
  - **Interactive Whiteboard**: Process block diagramming with SVG equipment nodes (Pumps, Exchangers, Reactors, Columns, Tanks), stream connections, and equation overlays.
  - **Live Classroom Presentation Stage**: Fullscreen mode, laser pointer component highlighter (impeller, volute casing, mechanical seal, bearing housing), freeze-frame pause/resume, and beginner mode toggle.
  - **Side-by-Side Comparative Simulation**: Real-time dual simulation (Scenario A: 2950 RPM direct throttling vs. Scenario B: 2400 RPM VFD speed reduction) illustrating energy conservation and pump characteristic shifts.
  - **Step-by-Step Derivation Mode**: 9 foundational engineering derivations with reveal controls:
    1. Bernoulli Equation with Friction Loss
    2. Hagen-Poiseuille Velocity & Flow Formula
    3. Shell Momentum Balance for Falling Film
    4. Fourier's 1D Radial Heat Conduction in Cylinders
    5. Fick's Steady-State Diffusion in Stagnant Film
    6. Overall Material Balance with Recycle & Purge
    7. McCabe-Thiele $q$-Line Equation
    8. CSTR Performance Equation from Mole Balance
    9. First-Order PID Closed-Loop Transfer Function
  - **Classroom Interaction**: Live numerical polls and concept check quizzes.
  - **Faculty Scenario Builder** & **Student Submission Reviewer**: Grade virtual laboratory reports with structured rubrics and verifiable feedback.

### 4. Student Understanding Engine (`VisualConceptExplorer.tsx`)
- High-density conceptual learning and physics intuition engine:
  - **Interactive Physics Diagrams**:
    - *Fluid Mechanics*: Laminar parabolic velocity profile vs. turbulent 1/7th power-law profile with dynamic Reynolds slider ($Re = 500 \to 10,000$).
    - *Heat Transfer*: Co-current vs. counter-current temperature gradients ($T(x)$) and LMTD calculation.
    - *Reaction Engineering*: CSTR well-mixed exit concentration vs. PFR spatial exponential decay with Damköhler scaling.
    - *Mass Transfer*: Binary VLE equilibrium curve $y(x)$ with dynamic relative volatility ($\alpha$), reflux ratio ($R$), and McCabe-Thiele stage stepping.
    - *Thermodynamics*: Binary $T-x-y$ phase envelope with bubble/dew point curves and tie-line lever arm rule.
  - **Equation Explorer**: Inspect foundational equations (Darcy-Weisbach, Ergun, LMTD, CSTR Design, Arrhenius, Fick's 1st Law) by clicking any variable to reveal its physical meaning, SI units, dimensions, sensitivity, and industrial examples.
  - **Guided 8-Step Engineering Problem Solver**: Universal problem-solving framework:
    $$\text{Knowns} \to \text{Unknowns} \to \text{Governing Equation} \to \text{Unit Check} \to \text{Substitution} \to \text{Calculation} \to \text{Physical Meaning} \to \text{Sanity Check}$$
  - **Misconception Detector**: 8 diagnostic conceptual traps with interactive multiple-choice testing and rigorous explanations (e.g., pump head vs fluid density, fluidisation pressure drop plateau, counter-current heat transfer thermodynamic limits).
  - **Degree Knowledge Graph**: Interactive curriculum node network showing prerequisites, flows, and placement applications across all 4 years.

### 5. Career & Placement Readiness Centre (`CareerWorkspace.tsx`)
- Bridging the gap between university coursework and industrial recruitment:
  - **10 Industrial Placement Tracks**:
    1. Process Design Engineering
    2. Plant Operations & Commissioning
    3. Process Modeling & Simulation
    4. Process Control & Instrumentation
    5. Equipment Design & Rating
    6. Quality, HSE & Continuous Improvement
    7. Environmental & Water Treatment Engineering
    8. Research & Development / Technology Development
    9. Pharmaceutical & Biochemical Process Engineering
    10. Energy, Oil & Gas / Petrochemicals
  - **10 Industrial Plant Troubleshooting Scenarios** with a 6-stage investigation methodology (*Telemetry Logs $\to$ Symptoms $\to$ Triage $\to$ Corrective Action $\to$ Predicted Response $\to$ Safety Implications*):
    - Pump Cavitation & Impeller Degradation
    - Shell & Tube Exchanger Heavy Asphaltene Fouling
    - Piping Network Sudden Differential Pressure Surge
    - Distillation Column Jet Flooding & Downcomer Choking
    - Exothermic CSTR Runaway & Cooling Loss
    - Subsea Pipeline Paraffin Wax Choking
    - Baghouse Dust Filter Fabric Blinding
    - Feed Effluent Heat Exchanger (FEHE) Thermal Pinch Violation
    - Centrifugal Compressor Surge & Anti-Surge Failure
    - Boiler Feedwater Deaerator Dissolved Oxygen Carryover
  - **Software Learning Paths**: Aspen Plus / HYSYS, DWSIM, Python for Process Engineers, and AutoCAD P&ID.
  - **Technical Interview Simulator**: 100+ vetted technical interview questions across core disciplines.
  - **STAR Resume Builder**: Situation, Task, Action, Result bullet-point generator for campus placements.

### 6. Student Virtual Laboratory Experiment Mode (`ExperimentWorkspace.tsx`)
- Guided 7-stage university laboratory workflow:
  1. Experiment Objective & Scope
  2. Governing Principles & Analytical Formulas
  3. Interactive Virtual Apparatus Controls
  4. Live Observation Table with one-click "Record Data Point" and CSV export
  5. Real-time Characteristic Performance Curves ($H-Q$, $\eta-Q$, $P-Q$)
  6. Oral Viva Voce Quiz Bank with hints & model answers
  7. Formal Printable Laboratory Report Generator with automated verification seal

### 7. Flagship Digital Twins & Virtual Laboratories
- **Flagship 1: Centrifugal Pump Digital Twin** (`CentrifugalPumpModule.tsx` — PROTECTED):
  - Interactive 3D pump anatomical inspection (impeller, volute casing, wear rings, shaft, mechanical seal, bearing housing).
  - Euler turbomachinery equation: developed head ($H$), hydraulic power ($P_{hyd}$), brake power ($P_{brake}$), and affinity laws.
  - Comprehensive fluid database (Water, Heavy Crude, Gasoline, Slurry, Ethylene Glycol).
  - 15 Guided Virtual Experiments (EXP-01 to EXP-15) with live observation tables and automated compliance checks.
  - Real-time Fault Diagnostics: Cavitation ($NPSH_a < NPSH_r$), mechanical seal leakage, dry run overheating, bearing failure, impeller erosion.
  - Printable engineering laboratory report generator with verification stamping.
- **Flagship 2: Fluidisation & Packed Bed Dynamics** (`FluidisationModule.tsx` — PROTECTED):
  - Transparent physical column simulation with live particle emulsion, bubble coalescence, and bed expansion.
  - Ergun equation pressure drop decomposition (viscous Kozeny-Carman vs. inertial Burke-Plummer).
  - Minimum fluidisation velocity ($u_{mf}$), terminal velocity ($u_t$), Richardson-Zaki voidage index, and Geldart particle classification (Groups A, B, C, D).
  - Dual live interactive curves: Bed $\Delta P$ vs. superficial velocity ($u_0$) and expanded bed height ($H$) vs. $u_0$.
- **Binary Distillation Simulation** (`DistillationModule.tsx`): McCabe-Thiele stage stepping, $q$-line feed condition, minimum reflux ($R_{min}$), optimal feed tray, reboiler/condenser duties.
- **Heat Exchanger Rating** (`HeatExchangerModule.tsx`): Counter-current vs. co-current LMTD, thermal pinch warnings, temperature gradient plots.
- **Chemical Reactor Kinetics** (`ReactorModule.tsx`): CSTR and PFR comparative conversions with Arrhenius temperature dependence.
- **Thermodynamic Property Database** (`ThermoModule.tsx`): NIST component library, Antoine vapor pressure, binary VLE bubble/dew point phase envelopes.

### 8. Curriculum-Independent Engineering Toolbox (`ToolboxWorkspace.tsx`)
- **30+ interactive engineering calculation engines** with transparent mathematical formulas and SI unit enforcement:
  - **Fluid Mechanics**: Reynolds number, Darcy-Weisbach friction factor (Colebrook-White equation), pipe pressure drop, equivalent lengths.
  - **Heat Transfer**: Log Mean Temperature Difference (LMTD), heat exchanger thermal duty, overall heat transfer coefficient ($U$), required surface area.
  - **Reaction Engineering**: CSTR vs. PFR volume comparison, space time ($\tau$), Damköhler number ($Da$), fractional conversion.
  - **Process Stoichiometry**: Methane combustion air requirements, excess air calculations, flue gas Orsat analysis (dry/wet basis).
  - **Mass Transfer**: Fuller-Schettler-Giddings binary gas diffusivity ($D_{AB}$), Schmidt number.
  - **Engineering Economics**: Net Present Value (NPV), discounted cash flow, simple and discounted payback periods.

### 9. Process Design Studio (`DesignWorkspace.tsx`)
- Dual-mode flowsheet canvas:
  - **PFD Mode** (Process Flow Diagram): Equipment tags (P-101, E-101, R-101, V-101), mass/energy stream flows, temperatures, pressures.
  - **P&ID Mode** (Piping & Instrumentation Diagram): ANSI/ISA-5.1-2009 standard instrumentation loops (FT, FIC, PT, PIC, TT, TIC, LT, LIC), safety relief valves (PSV), and fail-safe actuators.
- Dynamic Heat & Material Balance (H&MB) stream table updated via first-principles equations.
- Procurement-ready Engineering Equipment Datasheet Generator (API 610 12th Ed for centrifugal pumps, TEMA Class R for shell-and-tube heat exchangers, ASME Section VIII for pressure vessels).

### 10. Industrial Digital Twin Centre & Plant Automation (`DigitalTwinWorkspace.tsx`)
- **SCADA Historian Trends Monitor**: Real-time multi-pen trend chart (Process Variable PV, Setpoint SP, Controller Output OP) with live disturbance injections.
- **PID Controller Tuning Workbench**: Proportional gain ($K_p$), integral reset time ($\tau_i$), derivative rate ($\tau_d$) with closed-loop step response simulation.
- **Process Safety & HAZOP Studio**: IEC 61882 HAZOP worksheet, guide word deviations, and $5 \times 5$ Risk Assessment Matrix with Safety Integrity Level (SIL 1 to 4) allocation per IEC 61511.

---

## 🏗️ Technical Architecture

```
chem-sim/
├── backend/                      # Python + FastAPI Backend
│   ├── app/
│   │   ├── main.py              # FastAPI entry point & CORS
│   │   ├── api/                 # REST endpoints (/api/v1/pump, /api/v1/fluidisation)
│   │   ├── core/                # Deterministic physics engines
│   │   │   ├── pump.py          # Centrifugal pump hydraulics, Euler head, affinity, NPSH
│   │   │   ├── fluidisation.py  # Ergun equation, Wen-Yu, Ar, Richardson-Zaki, Geldart
│   │   │   ├── distillation.py  # McCabe-Thiele & CMO column solver
│   │   │   ├── heat_exchanger.py# LMTD & thermal exchanger rating
│   │   │   ├── reactor.py       # CSTR / PFR kinetics
│   │   │   ├── thermo.py        # VLE, bubble/dew points, Raoult
│   │   │   ├── properties.py    # NIST physical properties & Antoine
│   │   │   ├── units.py         # Unit conversion registry
│   │   │   ├── material_balance.py # Stream balances
│   │   │   └── energy_balance.py   # Enthalpy & sensible/latent duties
│   │   └── models/              # Pydantic schemas
│   ├── tests/                   # Backend unit tests (16 tests passing)
│   │   ├── test_pump.py         # Centrifugal pump hydraulics & fault tests
│   │   ├── test_fluidisation.py # Ergun hydrodynamics validation
│   │   └── test_core.py         # Suite integration tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                    # Vite + React + TypeScript
│   ├── src/
│   │   ├── workspaces/          # Master Platform Workspaces
│   │   │   ├── HomeWorkspace.tsx          # Premium landing page & hero process loop
│   │   │   ├── AcademicWorkspace.tsx      # Full degree curriculum (Sem III - VIII) & electives
│   │   │   ├── TeacherWorkspace.tsx       # Faculty teaching studio & interactive whiteboard
│   │   │   ├── VisualConceptExplorer.tsx  # Concept diagrams, equation explorer & problem solver
│   │   │   ├── CareerWorkspace.tsx        # 10 placement tracks & 10 plant troubleshooting incidents
│   │   │   ├── ExperimentWorkspace.tsx    # 7-stage university laboratory workflow
│   │   │   ├── ToolboxWorkspace.tsx       # 30+ engineering calculators
│   │   │   ├── DesignWorkspace.tsx        # PFD/P&ID flowsheet studio
│   │   │   ├── DigitalTwinWorkspace.tsx   # SCADA historian & PID tuner
│   │   │   └── PortfolioWorkspace.tsx     # Verified capstone builder
│   │   ├── components/          # Flagship UI Components
│   │   │   ├── ChemSimLogo.tsx            # Brand crest & corporate wordmark
│   │   │   ├── Pump3DViewer.tsx           # Interactive 3D pump anatomy
│   │   │   ├── PumpPerformanceChart.tsx   # H-Q, Efficiency, Power, NPSH curves
│   │   │   ├── PumpVirtualExperiments.tsx # Guided EXP-01 to 15 workbench
│   │   │   ├── PumpFaultDiagnostics.tsx   # Real-time fault simulation
│   │   │   └── PumpReportExport.tsx       # Laboratory report generator
│   │   ├── CentrifugalPumpModule.tsx    # Flagship 1 (PROTECTED - IMMUTABLE)
│   │   ├── FluidisationModule.tsx       # Flagship 2 (PROTECTED - IMMUTABLE)
│   │   ├── FluidisedBedApparatus.tsx    # Physical fluidisation column
│   │   ├── FluidisationChart.tsx        # Hydrodynamic dual curves
│   │   ├── DistillationModule.tsx       # Binary distillation
│   │   ├── HeatExchangerModule.tsx      # LMTD exchanger rating
│   │   ├── ReactorModule.tsx            # Reaction kinetics
│   │   ├── ThermoModule.tsx             # VLE & Antoine
│   │   ├── OverviewModule.tsx           # Sci-Eng bench overview
│   │   ├── App.tsx                      # Master application orchestrator
│   │   ├── index.css                    # MANAS scientific design system
│   │   └── api.ts                       # API client with fallback offline engine
│   ├── package.json
│   └── vite.config.ts
├── docs/                        # Complete Engineering Documentation
│   ├── FLUIDISATION_THEORY.md   # Fluidised bed mathematical models
│   ├── PUMP_DIGITAL_TWIN.md     # Pump turbomachinery derivations & PRD
│   └── CURRICULUM_EXPANSION.md  # Full degree curriculum & teaching studio PRD
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
FastAPI Swagger documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Automated Tests & Verification

### Backend Unit Tests
```bash
cd backend
set PYTHONPATH=.
python -m unittest tests/test_pump.py tests/test_fluidisation.py
```
*16 unit tests covering pump hydraulics, Euler head, affinity laws, cavitation margins, fault states, and Ergun fluidisation dynamics pass in < 0.005s.*

### Frontend Production Build
```bash
cd frontend
npm run build
```
*Compiles all workspaces and simulation engines with strict TypeScript type-checking into the optimized `dist/` bundle.*

---

## 📄 License
MIT License. Created for Chemical Engineering education, research, process simulation, and institutional excellence.
