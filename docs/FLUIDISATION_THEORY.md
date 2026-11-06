# Fluidisation & Packed Bed Hydrodynamics — Technical Reference & Theory Manual

## 1. Introduction

Fluidisation is a unit operation in chemical engineering where solid particulate beds are transformed into a fluid-like state through the upward flow of a gas or liquid. 

When upward drag exerted by fluid flow balances the gravitational buoyant weight of the solid particles, the bed exhibits fluid-like properties:
- Hydrostatic head behavior ($P = \rho_{bed} g h$)
- Liquid-like surface leveling and floating objects of lower bulk density
- Vigorous convective solid mixing and high heat/mass transfer rates

This manual outlines the governing equations, empirical correlations, and numerical algorithms implemented in **CHEM-SIM**.

---

## 2. Fixed Bed Flow & The Ergun Equation

Prior to incipient fluidisation ($u_0 < u_{mf}$), solid particles remain stationary in contact with adjacent particles forming a packed porous matrix.

The total pressure drop across a settled bed of height $H_0$ is evaluated by the **Ergun (1952) equation**, which accounts for both laminar viscous dissipation and turbulent kinetic losses:

$$\frac{\Delta P}{H_0} = 150 \frac{(1 - \epsilon_0)^2}{\phi_s^2 \epsilon_0^3} \frac{\mu \, u_0}{d_p^2} + 1.75 \frac{1 - \epsilon_0}{\phi_s \epsilon_0^3} \frac{\rho_g \, u_0^2}{d_p}$$

Where:
- $\Delta P$: Pressure drop across the bed ($\text{Pa}$)
- $H_0$: Settled / packed bed height ($\text{m}$)
- $\epsilon_0$: Settled bed void fraction / porosity (typically $0.38 - 0.45$)
- $\phi_s$: Particle sphericity ($\phi_s = 1.0$ for perfect spheres, $0.80 - 0.86$ for silica sand)
- $\mu$: Gas dynamic viscosity ($\text{Pa}\cdot\text{s}$)
- $\rho_g$: Gas density ($\text{kg/m}^3$)
- $d_p$: Mean surface-volume particle diameter ($\text{m}$)
- $u_0$: Superficial gas velocity ($\text{m/s}$), defined as superficial volumetric flow rate divided by column cross-sectional area: $u_0 = Q_{gas} / A_c$.

### Viscous vs. Inertial Breakdown
1. **Kozeny–Carman Viscous Term**:
   $$\Delta P_{visc} = 150 \frac{(1 - \epsilon_0)^2}{\phi_s^2 \epsilon_0^3} \frac{\mu \, u_0}{d_p^2} H_0 \propto u_0$$
   Dominates at low particle Reynolds numbers ($Re_p < 20$).
2. **Burke–Plummer Inertial Term**:
   $$\Delta P_{inert} = 1.75 \frac{1 - \epsilon_0}{\phi_s \epsilon_0^3} \frac{\rho_g \, u_0^2}{d_p} H_0 \propto u_0^2$$
   Dominates at high particle Reynolds numbers ($Re_p > 1000$).

---

## 3. Dimensionless Numbers

### 3.1. Archimedes Number ($Ar$)
The Archimedes number represents the ratio of gravitational buoyant forces to viscous drag forces on individual particles:

$$Ar = \frac{d_p^3 \, \rho_g \, (\rho_p - \rho_g) \, g}{\mu^2}$$

### 3.2. Particle Reynolds Number ($Re_p$)
$$Re_p = \frac{\rho_g \, u_0 \, d_p}{\mu}$$

---

## 4. Minimum Fluidisation Velocity ($u_{mf}$)

At incipient fluidisation, the superficial gas velocity reaches $u_{mf}$. At this state, the pressure drop across the bed exactly balances the buoyant weight of the bed solids per unit cross-sectional area:

$$\frac{\Delta P_{bed}}{H_0} = (1 - \epsilon_{mf})(\rho_p - \rho_g) g$$

### 4.1. Analytical Ergun Quadratic Solution
Equating the Ergun equation directly to the buoyant weight:

$$150 \frac{(1 - \epsilon_{mf})^2}{\phi_s^2 \epsilon_{mf}^3} \frac{\mu \, u_{mf}}{d_p^2} + 1.75 \frac{1 - \epsilon_{mf}}{\phi_s \epsilon_{mf}^3} \frac{\rho_g \, u_{mf}^2}{d_p} = (1 - \epsilon_{mf})(\rho_p - \rho_g) g$$

Dividing by $(1 - \epsilon_{mf})$ and rewriting in dimensionless form yields a quadratic in $Re_{p,mf}$:

$$A \, Re_{p,mf}^2 + B \, Re_{p,mf} - Ar = 0$$

Where:
$$A = \frac{1.75}{\phi_s \epsilon_{mf}^3}$$
$$B = \frac{150(1 - \epsilon_{mf})}{\phi_s^2 \epsilon_{mf}^3}$$

Solving for $Re_{p,mf}$:
$$Re_{p,mf} = \frac{-B + \sqrt{B^2 + 4 A \, Ar}}{2 A}$$
$$u_{mf} = \frac{Re_{p,mf} \, \mu}{\rho_g \, d_p}$$

### 4.2. Wen & Yu (1966) Correlation
For typical rounded particles where $\frac{1}{\phi_s \epsilon_{mf}^3} \approx 14$ and $\frac{1 - \epsilon_{mf}}{\phi_s^2 \epsilon_{mf}^3} \approx 11$:

$$Re_{p,mf} = \sqrt{33.7^2 + 0.0408 \, Ar} - 33.7$$
$$u_{mf,Wen-Yu} = \frac{Re_{p,mf} \, \mu}{\rho_g \, d_p}$$

---

## 5. Single Particle Terminal Falling Velocity ($u_t$)

The terminal velocity represents the free-fall velocity of an isolated particle in stagnant fluid. When superficial velocity reaches $u_t$, particles are elutriated and pneumatic conveying begins.

**CHEM-SIM** calculates $u_t$ using the **Haider & Levenspiel (1989)** correlation:

1. Dimensionless particle size:
   $$d_* = Ar^{1/3}$$
2. Dimensionless terminal velocity:
   $$u_* = \left[ \frac{18}{d_*^2} + \frac{2.335 - 1.744 \phi_s}{d_*^{0.5}} \right]^{-1}$$
3. Dimensional terminal settling velocity:
   $$u_t = u_* \left[ \frac{\mu \, (\rho_p - \rho_g) \, g}{\rho_g^2} \right]^{1/3}$$
4. Terminal Reynolds number:
   $$Re_t = \frac{\rho_g \, u_t \, d_p}{\mu}$$

---

## 6. Bed Expansion & Voidage Hydrodynamics

### 6.1. Richardson–Zaki (1954) Correlation
For fluidised suspensions, the superficial velocity relates to bed voidage $\epsilon$ via:

$$\frac{u_0}{u_t} = \epsilon^n \implies \epsilon = \left( \frac{u_0}{u_t} \right)^{1/n}$$

The index $n$ is evaluated from $Re_t$:
- $n = 4.65$ for $Re_t < 0.2$
- $n = 4.40 \, Re_t^{-0.03}$ for $0.2 \le Re_t < 1.0$
- $n = 4.40 \, Re_t^{-0.10}$ for $1.0 \le Re_t < 500$
- $n = 2.40$ for $Re_t \ge 500$

### 6.2. Conservation of Solid Mass
Since solid inventory is conserved:
$$(1 - \epsilon_0) H_0 = (1 - \epsilon) H \implies H = H_0 \frac{1 - \epsilon_0}{1 - \epsilon}$$

### 6.3. Bubbling Bed Model (Kunii & Levenspiel 1991)
For gas-solid beds, excess gas $(u_0 - u_{mf})$ forms bubbles.
- Mean bubble diameter (Darton et al. 1977 approximation):
  $$d_b = \frac{0.54 (u_0 - u_{mf})^{0.4} (H_0/2)^{0.8}}{g^{0.2}}$$
- Bubble rise velocity:
  $$u_b = (u_0 - u_{mf}) + 0.711 \sqrt{g \, d_b}$$
- Visible bubble fraction:
  $$\delta_b = \frac{u_0 - u_{mf}}{u_b}$$
- Expanded bed height:
  $$H = \frac{H_{mf}}{1 - \delta_b}$$

---

## 7. Geldart (1973) Powder Classification

Particles behave differently in gas fluidisation based on the density difference $(\rho_p - \rho_g)$ and mean diameter $d_p$:

```
Density Difference (kg/m^3)
   ▲
   │        Group A            Group B             Group D
4000 ────── Aeratable ─────── Bubbling ────────── Spoutable
   │       (dp 30-100 µm)    (dp 100-1000 µm)     (dp > 1000 µm)
   │
1500 ───┬──────────────────────────────────────────────────────
   │    │
   │    │ Group C: Cohesive, ultrafine (dp < 30 µm)
   │    │ Interparticle forces dominate, channeling
   └────┴──────────────────────────────────────────────────────►
   0   30                100                1000              dp (µm)
```

1. **Group C (Cohesive)**: $d_p < 30\,\mu\text{m}$. Interparticle van der Waals forces exceed hydrodynamic forces; prone to fissures, gas channeling, and lifting as a solid plug.
2. **Group A (Aeratable)**: $d_p \sim 30 - 100\,\mu\text{m}$, $\rho_p < 1400\,\text{kg/m}^3$. Significant homogenous bed expansion occurs prior to bubbling onset ($u_{mb} > u_{mf}$). Slow de-aeration rate.
3. **Group B (Sand-like Bubbling)**: $d_p \sim 100 - 1000\,\mu\text{m}$, $\rho_p \sim 1400 - 4000\,\text{kg/m}^3$. Bubbles appear as soon as $u_0 \ge u_{mf}$ ($u_{mb} \approx u_{mf}$).
4. **Group D (Coarse / Spoutable)**: $d_p > 1000\,\mu\text{m}$. High gas flows required. Shallow beds form spouts or exploding slugs.

---

## 8. Hydrodynamic Regimes Summary

| Regime | Velocity Envelope | Visual & Hydrodynamic Behavior |
|---|---|---|
| **Packed Bed** | $0 \le u_0 < 0.95 \, u_{mf}$ | Stationary particles, constant height $H_0$, $\Delta P \propto u_0 + u_0^2$ (Ergun) |
| **Incipient Fluidisation** | $0.95 \, u_{mf} \le u_0 \le 1.08 \, u_{mf}$ | Drag balances buoyant weight, particles unlock and begin floating |
| **Bubbling Fluidisation** | $u_0 > u_{mf}$, $u_0 < 0.45 \, u_t$ | Distinct bubbles form, solid circulation, bed expands, $\Delta P \approx \text{const}$ |
| **Turbulent Fluidisation** | $0.45 \, u_t \le u_0 < u_t$ | Bubble breakdown into churning voids, vigorous freeboard splashing |
| **Entrainment / Elutriation** | $u_0 \ge u_t$ | Pneumatic conveying; particle terminal velocity exceeded, solids carryover |

---

## 9. API Reference

### `POST /api/v1/fluidisation/simulate`
Executes full hydrodynamic simulation and generates characteristic curves.

#### Request Payload
```json
{
  "gas_velocity_m_s": 0.28,
  "particle_diameter_m": 0.0005,
  "particle_density_kg_m3": 2500.0,
  "gas_density_kg_m3": 1.205,
  "gas_viscosity_Pa_s": 1.82e-5,
  "initial_bed_height_m": 0.40,
  "column_diameter_m": 0.10,
  "initial_voidage": 0.40,
  "sphericity": 1.0,
  "include_curves": true,
  "curve_points": 50
}
```

#### Response Payload
```json
{
  "archimedes_number": 11140.2,
  "reynolds_number": 9.27,
  "reynolds_number_mf": 6.84,
  "u_mf_wen_yu_m_s": 0.208,
  "u_mf_ergun_m_s": 0.207,
  "u_mf_design_m_s": 0.207,
  "terminal_velocity_m_s": 3.84,
  "reynolds_terminal": 127.1,
  "bed_pressure_drop_Pa": 5880.0,
  "distributor_pressure_drop_Pa": 142.5,
  "total_pressure_drop_Pa": 6022.5,
  "expanded_bed_height_m": 0.448,
  "expanded_voidage": 0.464,
  "bubble_fraction": 0.108,
  "geldart_group": "B",
  "regime": "Bubbling Fluidisation",
  "is_fluidised": true,
  "is_entrained": false,
  "characteristic_curves": [...]
}
```

### `GET /api/v1/fluidisation/presets`
Returns predefined benchmark systems (Glass Beads / Air, Silica Sand / Air, FCC Catalyst / Air, Polyethylene / Nitrogen).
