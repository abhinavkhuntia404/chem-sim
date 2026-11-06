# CHEM-SIM — Chemical Engineering Simulation & Analysis Suite

**CHEM-SIM** is a modular, scientifically grounded Chemical Engineering simulation and process analysis platform built with Python (FastAPI, NumPy, SciPy) and modern React (TypeScript, Vite).

Designed following the MANAS engineering design principles: transparent assumptions, strict dimensional safety, rigorous thermodynamic models, and high-density technical interfaces.

---

## 🌟 Modules & Features

### 1. Binary Distillation (McCabe–Thiele)
- **Constant Molar Overflow (CMO)** stage-by-stage equilibrium solver.
- **Interactive McCabe–Thiele Diagram**:
  - Live $45^\circ$ line, equilibrium curve, rectifying operating line, stripping operating line, and $q$-line.
  - Automatic stage stepping from distillate ($x_D$) to bottoms ($x_B$).
  - Optimal feed stage determination and pinch point detection.
  - Minimum reflux ratio ($R_{min}$) analytical evaluation.
- **Full Column Profiles**: Tray-by-tray liquid/vapor mole fractions and equilibrium bubble-point temperatures.
- **Energy Balance Estimates**: Condenser duty ($Q_C$) and reboiler duty ($Q_R$).

### 2. Heat Exchanger Thermal Rating & Design
- **Log Mean Temperature Difference (LMTD)** method.
- **Flow Configurations**: Countercurrent vs. Cocurrent (parallel) flow analysis.
- **Thermal Sizing**: Calculation of overall duty ($Q$), required heat transfer area ($A$), and minimum approach temperature ($\Delta T_{min}$).
- **Temperature Profiles**: Interactive axial temperature gradient plots for hot and cold streams.
- **Temperature Cross Detection**: Flags thermodynamically infeasible specifications.

### 3. Chemical Reactor Engineering
- **Continuous Stirred-Tank Reactor (CSTR)** and **Plug Flow Reactor (PFR)** models.
- **Damköhler Number Scaling ($Da = k \cdot \tau$)**: Comparative conversion analysis across reactor configurations.
- **Kinetic Solvers**: First-order irreversible reaction networks ($A \to B$) with Arrhenius temperature dependence.

### 4. Thermodynamics & VLE Database
- **NIST Pure Component Database**: Benzene, Toluene, Water, Ethanol, Methanol, Acetone, and n-Hexane.
- **Antoine Vapor Pressure**: Evaluates saturation pressure $P_{sat}(T)$ over validated ranges.
- **Vapor–Liquid Equilibrium (VLE)**: Ideal binary mixture flash, bubble-point, dew-point, and relative volatility ($\alpha$).

### 5. Mechanical Operations: Fluidisation & Packed Bed Dynamics
- **Photorealistic & Schematic Fluidised Bed Apparatus**:
  - Transparent cylindrical column with visual lighting, metric graduations, and metal support frame.
  - Perforated gas distributor plate with jetting orifices.
  - Particle emulsion phase with live physics response across all hydrodynamic regimes.
  - Visible rising and coalescing gas bubbles with wakes, bursting at the bed surface with splash.
  - Dynamic bed height indicator with optical cursor tracking expanded bed level ($H$).
  - Pressure taps ($P_1, P_2, P_3, P_4$) and digital differential manometer readout.
  - Interactive clickable hotspots for teaching apparatus components and governing theory.
- **Scientific Calculations & Correlations**:
  - **Ergun Equation**: Viscous (Kozeny-Carman) vs inertial (Burke-Plummer) pressure drop decomposition.
  - **Minimum Fluidisation Velocity ($u_{mf}$)**: Exact Ergun quadratic solution and Wen–Yu (1966) correlation.
  - **Terminal Settling Velocity ($u_t$)**: Haider & Levenspiel (1989) correlation for single particle free fall.
  - **Bed Expansion ($H$) & Voidage ($\epsilon$)**: Richardson–Zaki (1954) expansion index and Kunii–Levenspiel bubbling model.
  - **Geldart Particle Classification**: Automatic determination of Groups A, B, C, and D.
  - **Hydrodynamic Regimes**: Fixed packed bed, incipient fluidisation, bubbling fluidisation, turbulent churn, and pneumatic transport / entrainment.
- **Live Interactive Dual Charts**:
  - Bed Pressure Drop ($\Delta P$) vs Superficial Gas Velocity ($u_0$) with $u_{mf}$ marker, Ergun curve, and buoyant weight plateau.
  - Expanded Bed Height ($H$) vs Gas Velocity ($u_0$).
  - Moving operating point tracking user velocity changes.
- **Teaching Mode & Virtual Laboratory**:
  - Theory, definitions, and LaTeX-rendered governing equations.
  - Step-by-step guided virtual experiment with real-time condition verification.
  - Live Observation Table with recording, CSV export, and complete printable Laboratory Experiment Report generator.

### 6. Dimensional Safety & Unit Conversion
- Integrated unit conversion system enforcing strict dimensional compatibility (Temperature, Pressure, Mass/Molar flow, Heat capacity, Energy, Power).
- Rejects incompatible conversions at runtime.

### 7. Data Reporting & Export
- Instant export of tray data, stream specifications, thermal ratings, and fluidisation observation tables to **CSV** and **JSON**.

---

## 🏗️ Architecture

```
chem-sim/
├── backend/                    # Python + FastAPI Backend
│   ├── app/
│   │   ├── main.py            # FastAPI entry point & CORS
│   │   ├── api/               # API routes (/api/v1)
│   │   ├── core/              # First-principles engineering engines
│   │   │   ├── fluidisation.py    # Ergun, Wen-Yu, Ar, R-Z bed expansion, Geldart
│   │   │   ├── distillation.py    # McCabe-Thiele & CMO column solver
│   │   │   ├── heat_exchanger.py  # LMTD & thermal exchanger rating
│   │   │   ├── reactor.py         # CSTR / PFR kinetics
│   │   │   ├── thermo.py          # VLE, bubble/dew points, Raoult
│   │   │   ├── properties.py      # NIST physical properties & Antoine
│   │   │   ├── units.py           # Unit conversion registry
│   │   │   ├── material_balance.py# Degrees-of-freedom & stream balances
│   │   │   └── energy_balance.py  # Enthalpy & sensible/latent duties
│   │   └── models/            # Pydantic validation schemas
│   ├── tests/                 # Unit & integration test suite
│   │   ├── test_fluidisation.py # Hydrodynamics & Ergun validation
│   │   └── test_core.py       # Full suite integration tests
│   ├── Dockerfile             # Production backend container
│   └── requirements.txt
├── frontend/                  # Vite + React + TypeScript
│   ├── src/
│   │   ├── FluidisedBedApparatus.tsx # Visual transparent column, particles & bubbles
│   │   ├── FluidisationChart.tsx  # Live ΔP & bed height curves with u_mf marker
│   │   ├── FluidisationModule.tsx # Interactive fluidisation workbench & virtual lab
│   │   ├── DistillationModule.tsx # Binary McCabe-Thiele simulation
│   │   ├── HeatExchangerModule.tsx# LMTD rating and exchanger sizing
│   │   ├── ReactorModule.tsx      # CSTR/PFR kinetics
│   │   ├── ThermoModule.tsx       # Phase envelopes & Antoine VLE
│   │   ├── OverviewModule.tsx     # Engineering utilities & module navigation
│   │   ├── api.ts                 # API client with offline engineering engine
│   │   ├── types.ts               # Shared TypeScript scientific definitions
│   │   └── index.css              # MANAS scientific design system styling
│   ├── Dockerfile             # Production Nginx frontend container
│   ├── nginx.conf             # Reverse proxy configuration
│   └── package.json
├── docker-compose.yml         # Multi-container local orchestration
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
API Documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Automated Tests

### Backend Unit & Integration Tests
```bash
cd backend
pytest tests/test_core.py -v
```

### Frontend Typecheck & Build
```bash
cd frontend
npm run build
```

---

## 🐳 Docker Deployment

To spin up both backend and frontend in production containers with Docker Compose:

```bash
docker-compose up --build -d
```
- Web Application: [http://localhost:80](http://localhost:80)
- API Service: [http://localhost:8000](http://localhost:8000)

---

## ☁️ Cloud Deployment Options

### Backend (Render / Railway / Fly.io / GCP Cloud Run)
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment: Set `PORT` (default 8000)

### Frontend (Vercel / Netlify / Cloudflare Pages)
- Framework Preset: `Vite`
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`

---

## 📄 License
MIT License. Created for Chemical Engineering education, research, and process design analysis.
