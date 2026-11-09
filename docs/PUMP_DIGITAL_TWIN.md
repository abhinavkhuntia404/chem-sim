# CHEM-SIM — Centrifugal Pump Digital Twin
## Complete Technical Specification & Scientific Manual

**Product Hierarchy:**  
`CHEM-SIM` → `Engineering Subjects` → `Momentum Transfer` → `Fluid Flow Equipment` → `Centrifugal Pump Digital Twin`

---

## 1. Overview & Vision
The **Centrifugal Pump Digital Twin** is an interactive, physics-driven engineering simulation and virtual laboratory integrated into the CHEM-SIM suite. It connects theoretical fluid dynamics and turbomachinery principles with real equipment operation, 3D component exploration, failure diagnostics, and formal virtual laboratory experiments.

---

## 2. Mathematical Models & Governing Equations

### 2.1 Euler Turbomachine Equation & Theoretical Head
Fluid enters axially into the impeller eye and is accelerated radially outward by backward-curved vanes. The angular momentum transfer from the rotating impeller to the fluid is given by Euler’s pump equation:

$$H_E = \frac{u_2 v_{\theta 2} - u_1 v_{\theta 1}}{g}$$

Where:
- $u_2 = \frac{\pi D_2 N}{60}$ : Impeller peripheral blade tip speed ($\text{m/s}$)
- $u_1 = \frac{\pi D_1 N}{60}$ : Impeller eye inlet speed ($\text{m/s}$)
- $v_{\theta 2}$ : Tangential component of absolute fluid discharge velocity ($\text{m/s}$)
- $v_{\theta 1}$ : Tangential component of inlet velocity ($\text{m/s}$)
- $g = 9.80665 \text{ m/s}^2$ : Acceleration due to gravity

Assuming ideal radial entry without pre-rotation ($v_{\theta 1} = 0$), the equation simplifies to:
$$H_E = \frac{\sigma \cdot u_2^2}{g}$$

Where $\sigma$ is the **Stodola Slip Factor** representing finite blade count deviation from ideal guidance:
$$\sigma \approx 1 - \frac{\pi \sin \beta_2}{Z}$$
- $\beta_2$ : Blade discharge angle (typically $22^\circ - 30^\circ$ backward-curved)
- $Z$ : Number of impeller blades (typically 5 to 7)

---

### 2.2 Pump Characteristic & Developed Head Curve
The actual head delivered across the suction and discharge flanges accounts for hydraulic friction, incidence/shock losses, and volute diffusion:

$$H_{\text{pump}}(Q) = H_0 - B \cdot Q^2$$

Where:
- $H_0 \approx 1.22 \cdot H_{\text{BEP}}$ : Shutoff head ($\text{m}$) at zero flow
- $B = \frac{H_0 - H_{\text{BEP}}}{Q_{\text{BEP}}^2}$ : Quadratic curvature coefficient
- Developed Total Head across flanges:
$$H = \frac{P_2 - P_1}{\rho g} + \frac{v_2^2 - v_1^2}{2g} + (z_2 - z_1)$$

---

### 2.3 Turbomachinery Affinity Laws
For geometrically similar operating conditions with changing rotational speed ($N$) or trimmed impeller outer diameter ($D$):

1. **Volumetric Flow Rate:**
   $$\frac{Q_2}{Q_1} = \left(\frac{N_2}{N_1}\right) \cdot \left(\frac{D_2}{D_1}\right)$$
2. **Developed Head:**
   $$\frac{H_2}{H_1} = \left(\frac{N_2}{N_1}\right)^2 \cdot \left(\frac{D_2}{D_1}\right)^2$$
3. **Shaft Power:**
   $$\frac{P_2}{P_1} = \left(\frac{N_2}{N_1}\right)^3 \cdot \left(\frac{D_2}{D_1}\right)^5$$

---

### 2.4 Hydraulic Power, Shaft Power & Efficiency
- **Hydraulic Power Output:**
  $$P_{\text{hyd}} = \rho \cdot g \cdot Q \cdot H \quad (\text{W})$$
- **Pump Total Efficiency:**
  $$\eta(Q) = \eta_{\text{hyd}} \cdot \eta_{\text{vol}} \cdot \eta_{\text{mech}} = \frac{P_{\text{hyd}}}{P_{\text{shaft}}}$$
- **Shaft Power Input:**
  $$P_{\text{shaft}} = \frac{P_{\text{hyd}}}{\eta(Q)} + P_{\text{mech,loss}}$$
- **Specific Speed ($N_s$):**
  $$N_s = \frac{N \sqrt{Q}}{H^{3/4}}$$

---

### 2.5 Darcy-Weisbach System Resistance Curve
The system head required to move fluid through suction and discharge piping is:

$$H_{\text{sys}}(Q) = \Delta z_{\text{static}} + \frac{P_{\text{surface,d}} - P_{\text{surface,s}}}{\rho g} + h_{L,\text{suction}} + h_{L,\text{discharge}}$$

Friction head loss in straight pipe:
$$h_f = f \cdot \left(\frac{L}{D}\right) \cdot \frac{v^2}{2g}$$

Friction factor $f$:
- **Laminar Flow ($Re < 2300$):**
  $$f = \frac{64}{Re}$$
- **Turbulent Flow ($Re \ge 2300$, Swamee-Jain explicit equation):**
  $$f = \frac{0.25}{\left[\log_{10}\left(\frac{\varepsilon / D}{3.7} + \frac{5.74}{Re^{0.9}}\right)\right]^2}$$

Minor fitting & valve losses:
$$h_m = \sum K_L \frac{v^2}{2g}$$

---

### 2.6 Operating Point Solver
The real-time operating point $(Q^*, H^*)$ is calculated at every time-step by solving the nonlinear equilibrium equation:
$$H_{\text{pump}}(Q^*) = H_{\text{sys}}(Q^*)$$
Using bounded bisection and root-finding algorithms.

---

### 2.7 Net Positive Suction Head (NPSH) & Cavitation Inception
- **Available NPSH ($NPSH_a$):**
  $$NPSH_a = \frac{P_{\text{suction,abs}} - P_v(T)}{\rho g} + \frac{v_s^2}{2g} = \frac{P_{\text{atm}} - P_v(T)}{\rho g} + z_s - h_{L,\text{suction}}$$
- **Required NPSH ($NPSH_r$):**
  $$NPSH_r(Q) = NPSH_{r,\text{BEP}} \left(\frac{N}{N_0}\right)^{1.8} \left[1 + 0.85 \left(\frac{Q - Q_{\text{BEP}}}{Q_{\text{BEP}}}\right)^2\right]$$
- **Cavitation Margin:**
  $$\text{Margin} = NPSH_a - NPSH_r$$
- **Inception Rule:** If $NPSH_a < NPSH_r$, cavitation inception triggers vapor bubble formation at the blade suction rim, acoustic noise, high vibration, and head drop.

---

### 2.8 ANSI/HI 9.6.7 Viscosity Correction
For kinematic viscosities $\nu > 1.5 \text{ cSt}$, the Hydraulic Institute correction procedure applies:
$$B = 16.5 \cdot \frac{\sqrt{\nu} \cdot H_{\text{BEP}}^{0.25}}{\sqrt{Q_{\text{BEP}}} \cdot N^{0.25}}$$
Correction derating factors:
- $C_H = 1.0 - 0.08 (B - 1.0)^{0.85}$
- $C_Q = 1.0 - 0.12 (B - 1.0)^{0.80}$
- $C_\eta = 1.0 - 0.25 (B - 1.0)^{0.75}$

---

## 3. Subsystem Architecture

### 3.1 Fluid Library & Rheological Models
Includes 16+ predefined industrial liquids with temperature correlations $T \in [-10^\circ\text{C}, 150^\circ\text{C}]$:
- Clean liquids: Potable Water, Distilled Water
- Saline: Seawater (3.5%), NaCl Brine (20%)
- Alcohols: Ethanol, Methanol
- Hydrocarbons: Diesel Fuel, Light Crude Oil, Heavy Fuel Oil (HFO 380)
- Viscous & Thermal: Glycerol (85%), Ethylene Glycol (50%), Thermal Oil
- Corrosives: 30% HCl, 50% H₂SO₄, 20% NaOH
- Sanitary/Food: Whole Milk
- Suspensions & Slurries: Sand-Water Slurry (15% vol), Digested Municipal Sludge
- Rheology models: Newtonian, Power-law ($\tau = K \dot{\gamma}^n$), Bingham plastic ($\tau = \tau_y + \mu_p \dot{\gamma}$), Herschel-Bulkley.

### 3.2 Industrial Pump Catalog
1. **ISO 2858 Chemical Process Pump (50-32-160)**: Radial, single-stage, closed impeller, 2900 RPM.
2. **Horizontal Split-Case High-Flow Pump**: Double-suction radial impeller, 1450 RPM, 220 m³/h.
3. **Multistage Boiler Feed Pump**: 4-stage ring-section diffuser casing, 2950 RPM, 160 m head.
4. **Heavy-Duty Slurry Pump**: Semi-open 4-vane high-chrome iron impeller, 1450 RPM.
5. **Vertical Inline Circulation Pump**: Compact straight-through piping design, 1450 RPM.
6. **Magnetic-Drive Sealless Chemical Pump**: Zero-leakage containment can for toxic media.

### 3.3 Interactive 3D Digital Twin Viewer
- **Assembly View**: Realistic 3D rendering with orbit drag, zoom, and pitch.
- **Exploded View**: Continuous slider ($0\% - 100\%$) displaying component offsets along axial/radial vectors with dashed leader lines.
- **Cutaway / Section View**: 180° casing cutaway revealing the internal volute, cutwater tongue, backward-curved blades, and wear rings.
- **Flow Path Particle Visualization**: Animated streamline particles with dynamic velocity color gradient ($1.5 \text{ m/s} \to 25 \text{ m/s}$) and cavitation bubble nucleation.
- **Component Inspector**: Selectable parts with material specs, function, working principle, failure modes, and maintenance procedures.

### 3.4 Fault Simulation & Predictive Diagnostics
11 industrial fault scenarios with severity sliders ($0\% - 100\%$):
1. Cavitation & Vapor Inception
2. Dry Running
3. Suction Strainer Blockage
4. Discharge Valve Throttling / Shutoff
5. Impeller Vane Wear & Erosion
6. Bearing Race Fatigue Spalling
7. Mechanical Seal Face Leakage
8. Shaft Coupling Misalignment
9. Gas Entrainment / Air Binding
10. Slurry Abrasive Cutwater Wear
11. Foreign Object Impeller Clogging

Diagnostic gauges:
- Vibration Velocity RMS (ISO 10816-3 Severity Zones A, B, C, D)
- Acoustic Noise Level (dBA)
- Bearing Housing Temperature (°C)
- Mechanical Seal Face Temperature & Leakage (mL/min)
- Virtual Maintenance Execution (Repair/Overhaul Actions)

### 3.5 Virtual Experiment Laboratory (EXP-01 to EXP-15)
- **EXP-01**: Effect of Rotational Speed on Pump Head (Affinity Laws)
- **EXP-02**: Effect of Flow Rate on Efficiency (Determination of BEP)
- **EXP-03**: Complete Centrifugal Pump Characteristic Curve
- **EXP-04**: Effect of Fluid Viscosity (ANSI/HI 9.6.7 Derating)
- **EXP-05**: Suction Head & Cavitation Inception ($NPSH_a \le NPSH_r$)
- **EXP-06**: Effect of Impeller Diameter Trimming
- **EXP-07**: Effect of Pipe Diameter on System Resistance
- **EXP-08**: Pumps in Series (High Head Operation)
- **EXP-09**: Pumps in Parallel (High Flow Operation)
- **EXP-10**: Valve Throttling vs Variable Speed Drive (VFD Energy Analysis)
- **EXP-11**: Slurry Pumping & Solids Handling
- **EXP-12**: Multistage Pump Interstage Pressure Build
- **EXP-13**: Abnormal Operation & Emergency Trip Diagnostics
- **EXP-14**: Comparative Performance Across 5 Diverse Fluid Classes
- **EXP-15**: Pump Energy Efficiency & Life Cycle Costing (LCC)

### 3.6 Formal Laboratory Report Generation
Print-ready PDF / Printable Document complete with:
- Student Name, Institution, Lab Section, Date & Timestamp
- Equipment & Geometry Specifications
- Working Fluid Rheology & Thermodynamic State
- Solved Hydraulic Operating Point & Energy Balances
- Observation Table with logged experimental data
- Mechanical Integrity & Predictive Diagnostics Assessment
- Engineering Discussion & Verification Signature

---

## 4. Verification & Testing
- Backend unit test suite: `backend/tests/test_pump.py` (8 test classes covering water baseline, affinity scaling, ANSI/HI viscosity correction, pipe friction, cavitation detection, dry run fault, bearing defects, catalog completeness).
- Frontend production build: verified via `tsc -b && vite build` (zero TypeScript errors, clean bundle).
- Zero-latency client fallback engine guarantees 100% offline functionality.
