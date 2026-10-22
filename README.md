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

### 5. Dimensional Safety & Unit Conversion
- Integrated unit conversion system enforcing strict dimensional compatibility (Temperature, Pressure, Mass/Molar flow, Heat capacity, Energy, Power).
- Rejects incompatible conversions at runtime.

### 6. Data Reporting & Export
- Instant export of tray data, stream specifications, and thermal ratings to **CSV** and **JSON**.

---

## 🏗️ Architecture

```
chem-sim/
├── backend/                    # Python + FastAPI Backend
│   ├── app/
│   │   ├── main.py            # FastAPI entry point & CORS
│   │   ├── api/               # API routes (/api/v1)
│   │   ├── core/              # First-principles engineering engines
│   │   │   ├── distillation.py    # McCabe-Thiele & CMO column solver
│   │   │   ├── heat_exchanger.py  # LMTD & thermal exchanger rating
│   │   │   ├── reactor.py         # CSTR / PFR kinetics
│   │   │   ├── thermo.py          # VLE, bubble/dew points, Raoult
│   │   │   ├── properties.py      # NIST physical properties & Antoine
│   │   │   ├── units.py           # Unit conversion registry
│   │   │   ├── material_balance.py# Degrees-of-freedom & stream balances
│   │   │   └── energy_balance.py  # Enthalpy & sensible/latent duties
│   │   └── models/            # Pydantic validation schemas
│   ├── tests/                 # Pytest test suite
│   ├── Dockerfile             # Production backend container
│   └── requirements.txt
├── frontend/                  # Vite + React + TypeScript
│   ├── src/
│   │   ├── components/        # Data export, charts, badges
│   │   ├── modules/           # Distillation, HX, Reactor, Thermo, Overview
│   │   ├── services/          # API client with offline calculation engine
│   │   ├── styles/            # MANAS scientific design system CSS
│   │   └── types/             # Shared TypeScript definitions
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
