# CHEM-SIM — The Chemical Engineering Learning, Simulation, Digital Twin & Career Readiness Platform

**CHEM-SIM** is a comprehensive, scientifically grounded Chemical Engineering simulation, digital twin, and career readiness platform built with Python (FastAPI, NumPy, SciPy) and modern React (TypeScript, Vite).

Designed following MANAS scientific engineering design principles: transparent assumptions, strict dimensional safety, rigorous first-principles physics models, and high-density technical interfaces.

---

## 🏛️ Master Platform Architecture

CHEM-SIM is structured into **9 integrated, curriculum-independent workspaces** connecting university education, practical engineering, industrial workflows, and career readiness:

### 1. Product Landing Page & Process Visualizer (`HomeWorkspace.tsx`)
- Headline: *"Understand Engineering. Simulate Reality."*
- Interactive live chemical process simulation loop connecting a Surge Tank $\to$ Centrifugal Pump (API 610) $\to$ Shell & Tube Preheater $\to$ CSTR Reactor $\to$ Distillation Column with dynamic speed, flow, temperature, and conversion controls.
- 6 Engineering Discipline Exploration Cards (Fluid Mechanics, Mechanical Operations, Heat Transfer, Mass Transfer, Chemical Reaction Engineering, Thermodynamics).
- Real previews of flagship digital twins and supplemental simulations.
- Visual Concept learning showcase, industrial digital twin three-tier roadmap, Student & Faculty workspace overviews, engineering toolbox highlights, and corporate footer.

### 2. Visual Concept Studio (`VisualConceptExplorer.tsx`)
- Interactive 2D physics diagrams & derivations:
  - **Fluid Mechanics**: Laminar parabolic velocity profile vs. turbulent 1/7th power-law profile with dynamic Reynolds slider ($Re = 500 \to 10,000$).
  - **Heat Transfer**: Co-current vs. counter-current temperature gradients ($T(x)$) and LMTD calculation.
  - **Reaction Engineering**: CSTR well-mixed exit concentration vs. PFR spatial exponential decay with Damköhler scaling.
  - **Mass Transfer**: Binary VLE equilibrium curve $y(x)$ with dynamic relative volatility ($\alpha$), reflux ratio ($R$), and McCabe-Thiele stage stepping.
  - **Thermodynamics**: Binary $T-x-y$ phase envelope with bubble/dew point curves and tie-line lever arm rule.

### 3. Student Virtual Laboratory Experiment Mode (`ExperimentWorkspace.tsx`)
- Guided 7-stage university laboratory workflow:
  1. Experiment Objective & Scope
  2. Governing Principles & Analytical Formulas
  3. Interactive Virtual Apparatus Controls
  4. Live Observation Table with one-click "Record Data Point" and CSV export
  5. Real-time Characteristic Performance Curves ($H-Q$, $\eta-Q$, $P-Q$)
  6. Oral Viva Voce Quiz Bank with hints & model answers
  7. Formal Printable Laboratory Report Generator with automated verification seal

### 4. Teacher & Faculty Presentation Workspace (`TeacherWorkspace.tsx`)
- Designed specifically for university faculty and classroom demonstration:
  - **Clean Classroom Presentation Stage**: Fullscreen mode, laser pointer component highlighter (impeller, volute casing, mechanical seal, bearing housing).
  - **Side-by-Side Scenario Comparison**: Real-time dual simulation (Scenario A: Baseline 2950 RPM vs. Scenario B: Speed Throttling 2400 RPM).
  - **Step-by-Step Mathematical Derivations**: Transparent Euler turbomachinery equation chalkboard derivations.
  - **Broadcast Classroom Activity**: Share live operating conditions with students.
  - **Assignment & Submission Grading**: Review student virtual lab reports and award marks with rubrics.

### 5. Curriculum-Independent Engineering Toolbox (`ToolboxWorkspace.tsx`)
- **30+ interactive engineering calculation engines** with transparent mathematical formulas and SI unit enforcement:
  - **Fluid Mechanics**: Reynolds number, Darcy-Weisbach friction factor (Colebrook-White equation), pipe pressure drop, equivalent lengths.
  - **Heat Transfer**: Log Mean Temperature Difference (LMTD), heat exchanger thermal duty, overall heat transfer coefficient ($U$), required surface area.
  - **Reaction Engineering**: CSTR vs. PFR volume comparison, space time ($\tau$), Damköhler number ($Da$), fractional conversion.
  - **Process Stoichiometry**: Methane combustion air requirements, excess air calculations, flue gas Orsat analysis (dry/wet basis).
  - **Mass Transfer**: Fuller-Schettler-Giddings binary gas diffusivity ($D_{AB}$), Schmidt number.
  - **Engineering Economics**: Net Present Value (NPV), discounted cash flow, simple and discounted payback periods.

### 6. Flagship Digital Twins & Virtual Laboratories
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

### 7. Process Design Studio (`DesignWorkspace.tsx`)
- Dual-mode flowsheet canvas:
  - **PFD Mode** (Process Flow Diagram): Equipment tags (P-101, E-101, R-101, V-101), mass/energy stream flows, temperatures, pressures.
  - **P&ID Mode** (Piping & Instrumentation Diagram): ANSI/ISA-5.1-2009 standard instrumentation loops (FT, FIC, PT, PIC, TT, TIC, LT, LIC), safety relief valves (PSV), and fail-safe actuators.
- Dynamic Heat & Material Balance (H&MB) stream table updated via first-principles equations.
- Procurement-ready Engineering Equipment Datasheet Generator (API 610 12th Ed for centrifugal pumps, TEMA Class R for shell-and-tube heat exchangers, ASME Section VIII for pressure vessels).

### 8. Industrial Digital Twin Centre & Plant Automation (`DigitalTwinWorkspace.tsx`)
- **SCADA Historian Trends Monitor**: Real-time multi-pen trend chart (Process Variable PV, Setpoint SP, Controller Output OP) with live disturbance injections.
- **PID Controller Tuning Workbench**: Proportional gain ($K_p$), integral reset time ($\tau_i$), derivative rate ($\tau_d$) with closed-loop step response simulation.
- **Process Safety & HAZOP Studio**: IEC 61882 HAZOP worksheet, guide word deviations, and $5 \times 5$ Risk Assessment Matrix with Safety Integrity Level (SIL 1 to 4) allocation per IEC 61511.

### 9. Career Readiness & Capstone Portfolio (`CareerWorkspace.tsx` & `PortfolioWorkspace.tsx`)
- **8 Industrial Career Pathways**: Process Engineering, Plant Operations, Simulation, Control, Safety, R&D, Energy Transition, Data Science.
- **100+ Vetted Technical Interview Questions** with engineering rationale.
- **6 Interactive Troubleshooting Scenarios**: Field alarms, DCS telemetry logs, root-cause diagnostic quizzes.
- **Student Capstone Project Dossier Builder**: With SHA-256 digital verification stamps.

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
│   │   │   ├── VisualConceptExplorer.tsx  # Interactive 2D physics diagrams & profiles
│   │   │   ├── ExperimentWorkspace.tsx    # 7-stage university laboratory workflow
│   │   │   ├── TeacherWorkspace.tsx       # Classroom presentation & grading studio
│   │   │   ├── ToolboxWorkspace.tsx       # 30+ engineering calculators
│   │   │   ├── DesignWorkspace.tsx        # PFD/P&ID flowsheet studio
│   │   │   ├── DigitalTwinWorkspace.tsx   # SCADA historian & PID tuner
│   │   │   ├── CareerWorkspace.tsx        # 8 pathways & interview bank
│   │   │   ├── PortfolioWorkspace.tsx     # Verified capstone builder
│   │   │   └── AcademicWorkspace.tsx      # VTU curriculum & course outcomes
│   │   ├── components/          # Flagship UI Components
│   │   │   ├── ChemSimLogo.tsx            # Brand crest & corporate wordmark
│   │   │   ├── Pump3DViewer.tsx           # Interactive 3D pump anatomy
│   │   │   ├── PumpPerformanceChart.tsx   # H-Q, Efficiency, Power, NPSH curves
│   │   │   ├── PumpVirtualExperiments.tsx # Guided EXP-01 to 15 workbench
│   │   │   ├── PumpFaultDiagnostics.tsx   # Real-time fault simulation
│   │   │   └── PumpReportExport.tsx       # Laboratory report generator
│   │   ├── CentrifugalPumpModule.tsx    # Flagship 1 (PROTECTED)
│   │   ├── FluidisationModule.tsx       # Flagship 2 (PROTECTED)
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
│   ├── CENTRIFUGAL_PUMP_THEORY.md # Pump turbomachinery derivations
│   └── MASTER_PRD.md            # Complete Product Requirements Document
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

## 🧪 Running Automated Tests

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
*Compiles all 9 workspaces and 7 simulation engines with strict TypeScript type-checking into the optimized `dist/` bundle.*

---

## 📄 License
MIT License. Created for Chemical Engineering education, research, process simulation, and institutional excellence.
