# CHEM-SIM — Frontend Application Architecture

The **CHEM-SIM** frontend is built with **React 19**, **TypeScript**, and **Vite** following the MANAS Scientific Design System.

---

## 🌟 Modules & Components

### 1. Mechanical Operations: Fluidisation Unit
- **`FluidisedBedApparatus.tsx`**:
  - High-performance Canvas particle and bubble animation engine.
  - Realistic transparent acrylic column with metric graduations, bottom gas inlet, perforated distributor plate, and freeboard outlet.
  - Dynamic bed height cursor ($H$) and differential pressure manometers ($P_1, P_2, P_3, P_4$).
  - Dual view modes: **Laboratory Apparatus View** and **P&ID Schematic View**.
  - Interactive clickable hotspots with chemical engineering teaching popups.
- **`FluidisationChart.tsx`**:
  - Responsive SVG charts rendering Pressure Drop ($\Delta P$) vs Velocity ($u_0$) and Bed Height ($H$) vs Velocity ($u_0$).
  - Automatic $u_{mf}$ threshold line marking and real-time operating point indicator.
- **`FluidisationModule.tsx`**:
  - Main workbench coordinating parameters, benchmark presets, virtual laboratory experiment steps, and observation logs.
  - Export data to CSV and generate formal printable Laboratory Experiment Reports.

### 2. Separation Processes: Binary Distillation
- **`DistillationModule.tsx`**: Constant molar overflow (CMO) McCabe–Thiele stage stepping.
- **`McCabeThieleChart.tsx`**: Interactive $45^\circ$ line, equilibrium curve, rectifying/stripping operating lines, and $q$-line.

### 3. Thermal Design: Heat Exchangers
- **`HeatExchangerModule.tsx`**: Log Mean Temperature Difference (LMTD) rating, countercurrent vs cocurrent flow, and temperature cross detection.

### 4. Reaction Engineering: Chemical Kinetics
- **`ReactorModule.tsx`**: CSTR vs PFR conversion calculations, Damköhler scaling, and Arrhenius kinetics.

### 5. Thermodynamics & VLE
- **`ThermoModule.tsx`**: Antoine vapor pressure equations, bubble/dew point calculations, and NIST pure-component physical database.

### 6. Core Engineering Infrastructure
- **`api.ts`**: Dual-mode execution engine that communicates with the FastAPI backend and includes a **100% offline first-principles fallback calculation engine** in TypeScript.
- **`types.ts`**: Shared TypeScript definitions for dimensional safety and engineering types.
- **`index.css`**: MANAS Scientific Design System styling tokens, grid system, cards, and technical badges.

---

## 🚀 Development & Build

### Development Server
```bash
npm install
npm run dev
```

### Production Build & Typecheck
```bash
npm run build
```
Generates production assets into `dist/`.
