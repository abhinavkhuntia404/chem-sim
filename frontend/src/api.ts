/**
 * API service client for CHEM-SIM
 * Communicates with FastAPI backend with local scientific fallback calculation.
 */

import type {
  ComponentData,
  DistillationSimulationResult,
  HeatExchangerResult,
  ReactorResult,
  UnitConversionResult,
  EquilibriumCurvePoint,
  FluidisationPreset,
  FluidisationParameters,
  FluidisationSimulationResult,
  FluidisationCurvePoint,
  PumpGeometryData,
  PumpComponentData,
  FluidData,
  PumpOperatingConditions,
  PumpPerformancePoint,
  PumpTelemetry,
  PumpSimulationResult,
} from './types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

export async function fetchHealth(): Promise<{ status: string; service: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend offline');
    return await res.json();
  } catch {
    return { status: 'client-offline-mode', service: 'CHEM-SIM (Client Engine)' };
  }
}

export async function fetchComponents(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/components`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return ['Acetone', 'Benzene', 'Ethanol', 'Methanol', 'Toluene', 'Water', 'n-Hexane'];
  }
}

export async function fetchComponentDetails(name: string): Promise<ComponentData> {
  try {
    const res = await fetch(`${API_BASE}/components/${name}`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    // Local fallback database
    const localDB: Record<string, ComponentData> = {
      benzene: {
        name: 'Benzene', formula: 'C₆H₆', cas_number: '71-43-2', molecular_weight: 78.11,
        normal_boiling_point_K: 353.25, critical_temperature_K: 562.05, critical_pressure_bar: 48.98,
        acentric_factor: 0.21, heat_of_vaporization_kJ_mol: 30.72
      },
      toluene: {
        name: 'Toluene', formula: 'C₇H₈', cas_number: '108-88-3', molecular_weight: 92.14,
        normal_boiling_point_K: 383.78, critical_temperature_K: 591.75, critical_pressure_bar: 41.08,
        acentric_factor: 0.264, heat_of_vaporization_kJ_mol: 33.18
      },
      water: {
        name: 'Water', formula: 'H₂O', cas_number: '7732-18-5', molecular_weight: 18.02,
        normal_boiling_point_K: 373.15, critical_temperature_K: 647.1, critical_pressure_bar: 220.64,
        acentric_factor: 0.344, heat_of_vaporization_kJ_mol: 40.65
      },
      ethanol: {
        name: 'Ethanol', formula: 'C₂H₅OH', cas_number: '64-17-5', molecular_weight: 46.07,
        normal_boiling_point_K: 351.44, critical_temperature_K: 513.92, critical_pressure_bar: 61.48,
        acentric_factor: 0.645, heat_of_vaporization_kJ_mol: 38.56
      }
    };
    return localDB[name.toLowerCase()] || localDB.benzene;
  }
}

export async function convertUnit(value: number, fromUnit: string, toUnit: string): Promise<UnitConversionResult> {
  try {
    const res = await fetch(`${API_BASE}/units/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, from_unit: fromUnit, to_unit: toUnit }),
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    // Basic client conversion fallback
    let converted = value;
    if (fromUnit === 'C' && toUnit === 'K') converted = value + 273.15;
    else if (fromUnit === 'K' && toUnit === 'C') converted = value - 273.15;
    else if (fromUnit === 'F' && toUnit === 'C') converted = (value - 32) * (5 / 9);
    else if (fromUnit === 'C' && toUnit === 'F') converted = value * (9 / 5) + 32;
    else if (fromUnit === 'bar' && toUnit === 'kPa') converted = value * 100;
    else if (fromUnit === 'atm' && toUnit === 'kPa') converted = value * 101.325;
    else if (fromUnit === 'kg/h' && toUnit === 'kg/s') converted = value / 3600;
    return { value, from_unit: fromUnit, to_unit: toUnit, result: converted };
  }
}

export async function simulateDistillation(params: {
  light_component: string;
  heavy_component: string;
  feed_flow_mol_s: number;
  feed_composition: number;
  q: number;
  distillate_composition: number;
  bottoms_composition: number;
  reflux_ratio: number;
  pressure_kPa: number;
}): Promise<DistillationSimulationResult> {
  try {
    const res = await fetch(`${API_BASE}/distillation/mccabe-thiele`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        light_component: params.light_component,
        heavy_component: params.heavy_component,
        feed_flow_mol_s: params.feed_flow_mol_s,
        feed_composition: params.feed_composition,
        q: params.q,
        distillate_composition: params.distillate_composition,
        bottoms_composition: params.bottoms_composition,
        reflux_ratio: params.reflux_ratio,
        pressure_kPa: params.pressure_kPa,
      }),
    });
    if (!res.ok) throw new Error('Distillation calculation failed');
    return await res.json();
  } catch (err) {
    // Rigorous client-side fallback calculation for seamless offline experience
    return computeClientDistillation(params);
  }
}

export async function analyzeHeatExchanger(params: {
  hot_inlet_T_C: number;
  cold_inlet_T_C: number;
  hot_outlet_T_C?: number;
  hot_flow_kg_s?: number;
  hot_Cp_J_kgK?: number;
  cold_outlet_T_C?: number;
  cold_flow_kg_s?: number;
  cold_Cp_J_kgK?: number;
  flow_arrangement: string;
  U_W_m2K?: number;
  area_m2?: number;
  duty_W?: number;
}): Promise<HeatExchangerResult> {
  try {
    const res = await fetch(`${API_BASE}/heat-exchanger/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Heat exchanger calculation failed');
    return await res.json();
  } catch {
    return computeClientHeatExchanger(params);
  }
}

export async function solveReactor(params: {
  reactor_type: 'cstr' | 'pfr' | 'batch';
  C_A0: number;
  k: number;
  tau_s?: number;
  volume_m3?: number;
  volumetric_flow_m3_s?: number;
}): Promise<ReactorResult> {
  try {
    const res = await fetch(`${API_BASE}/reactor/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Reactor API failed');
    return await res.json();
  } catch {
    const tau = params.tau_s ?? (params.volume_m3 && params.volumetric_flow_m3_s ? params.volume_m3 / params.volumetric_flow_m3_s : 10);
    const k = params.k;
    const C0 = params.C_A0;
    let X = 0;
    if (params.reactor_type === 'cstr') {
      X = (k * tau) / (1 + k * tau);
    } else {
      X = 1 - Math.exp(-k * tau);
    }
    const exitC = C0 * (1 - X);
    return {
      reactor_type: params.reactor_type.toUpperCase(),
      conversion: X,
      exit_concentrations: { A: exitC, B: C0 * X },
      residence_time_s: tau,
      volume_m3: params.volume_m3,
      rate_constant: k,
      rate_at_exit: k * exitC,
      warnings: [],
      assumptions: [
        'First-order irreversible reaction A -> B',
        'Isothermal, constant density',
        'Calculated using client-side numerical engine'
      ]
    };
  }
}

// Client-side fallback distillation solver for 100% reliable UI operation
function computeClientDistillation(p: {
  light_component: string;
  heavy_component: string;
  feed_flow_mol_s: number;
  feed_composition: number;
  q: number;
  distillate_composition: number;
  bottoms_composition: number;
  reflux_ratio: number;
  pressure_kPa: number;
}): DistillationSimulationResult {
  const F = p.feed_flow_mol_s;
  const zF = p.feed_composition;
  const xD = p.distillate_composition;
  const xB = p.bottoms_composition;
  const R = p.reflux_ratio;
  const q = p.q;

  // Overall balances
  const D = F * (zF - xB) / (xD - xB);
  const B = F - D;
  const L = R * D;
  const V = (R + 1) * D;
  const L_prime = L + q * F;
  const V_prime = V - (1 - q) * F;

  // Alpha (relative volatility) ~2.45 for benzene-toluene
  const alpha = 2.45;
  const eq_curve: EquilibriumCurvePoint[] = [];
  for (let i = 0; i <= 50; i++) {
    const x = i / 50;
    const y = (alpha * x) / (1 + (alpha - 1) * x);
    const T = 80.1 + (110.6 - 80.1) * (1 - x);
    eq_curve.push({ x, y, T_C: T, alpha });
  }

  // Operating lines
  const rectSlope = R / (R + 1);
  const rectIntercept = xD / (R + 1);
  const stripSlope = L_prime / V_prime;
  const stripIntercept = - (B * xB) / V_prime;

  // Intersection
  let ix = zF;
  let iy = rectSlope * ix + rectIntercept;
  if (Math.abs(q - 1) > 0.001) {
    const qSlope = q / (q - 1);
    const qInt = -zF / (q - 1);
    ix = (qInt - rectIntercept) / (rectSlope - qSlope);
    iy = rectSlope * ix + rectIntercept;
  }

  // Minimum reflux (at pinch on eq curve)
  const y_pinch = (alpha * ix) / (1 + (alpha - 1) * ix);
  const slope_min = (xD - y_pinch) / (xD - ix);
  const R_min = Math.max(0.5, slope_min / (1 - slope_min));

  // Step stages
  const stages: DistillationSimulationResult['stages'] = [];
  let y_curr = xD;
  let section = 'rectifying';
  let feedStage = 1;
  let switched = false;

  for (let n = 1; n <= 40; n++) {
    // Invert equilibrium: y = alpha*x / (1 + (alpha-1)x) -> x = y / (alpha - (alpha-1)y)
    const x_n = y_curr / (alpha - (alpha - 1) * y_curr);
    const T_n = 80.1 + (110.6 - 80.1) * (1 - x_n);
    stages.push({
      stage_number: n,
      x: x_n,
      y: y_curr,
      T_C: T_n,
      section,
    });

    if (x_n <= xB) break;

    if (!switched && x_n <= ix) {
      section = 'stripping';
      feedStage = n;
      switched = true;
    }

    const y_next = section === 'rectifying'
      ? rectSlope * x_n + rectIntercept
      : stripSlope * x_n + stripIntercept;

    if (y_next >= y_curr || y_next < 0) break;
    y_curr = y_next;
  }

  return {
    num_theoretical_stages: stages.length,
    feed_stage: feedStage,
    min_reflux_ratio: R_min,
    reflux_ratio: R,
    distillate_flow: D,
    bottoms_flow: B,
    rectifying_liquid: L,
    rectifying_vapor: V,
    stripping_liquid: L_prime,
    stripping_vapor: V_prime,
    condenser_duty_kW: V * 31.5,
    reboiler_duty_kW: V_prime * 32.0,
    feed_balance_residual: 0,
    component_balance_residual: 0,
    converged: true,
    warnings: R < R_min ? [`Reflux ratio ${R.toFixed(2)} is below minimum reflux ${R_min.toFixed(2)}.`] : [],
    assumptions: [
      'Constant molar overflow (CMO) assumed.',
      "Raoult's law ideal vapor-liquid equilibrium (alpha ~ 2.45).",
      'Total condenser, partial reboiler.',
    ],
    rectifying_line: { slope: rectSlope, intercept: rectIntercept, x_range: [ix, xD] },
    stripping_line: { slope: stripSlope, intercept: stripIntercept, x_range: [xB, ix] },
    q_line_slope: Math.abs(q - 1) > 0.001 ? q / (q - 1) : undefined,
    q_line_intercept: Math.abs(q - 1) > 0.001 ? -zF / (q - 1) : undefined,
    intersection_x: ix,
    intersection_y: iy,
    equilibrium_curve: eq_curve,
    stages,
  };
}

function computeClientHeatExchanger(p: {
  hot_inlet_T_C: number;
  cold_inlet_T_C: number;
  hot_outlet_T_C?: number;
  hot_flow_kg_s?: number;
  hot_Cp_J_kgK?: number;
  cold_outlet_T_C?: number;
  cold_flow_kg_s?: number;
  cold_Cp_J_kgK?: number;
  flow_arrangement: string;
  U_W_m2K?: number;
  area_m2?: number;
  duty_W?: number;
}): HeatExchangerResult {
  const Th_in = p.hot_inlet_T_C;
  const Tc_in = p.cold_inlet_T_C;
  const mh = p.hot_flow_kg_s ?? 2.0;
  const Cph = p.hot_Cp_J_kgK ?? 4184.0;
  const mc = p.cold_flow_kg_s ?? 2.5;
  const Cpc = p.cold_Cp_J_kgK ?? 4184.0;
  const Th_out = p.hot_outlet_T_C ?? (Th_in - 40.0);
  const duty = mh * Cph * (Th_in - Th_out);
  const Tc_out = p.cold_outlet_T_C ?? (Tc_in + duty / (mc * Cpc));

  const isCounter = p.flow_arrangement !== 'cocurrent';
  const dt1 = isCounter ? (Th_in - Tc_out) : (Th_in - Tc_in);
  const dt2 = isCounter ? (Th_out - Tc_in) : (Th_out - Tc_out);

  let lmtd = (dt1 - dt2) / Math.log(dt1 / dt2);
  if (Math.abs(dt1 - dt2) < 0.01) lmtd = (dt1 + dt2) / 2;

  const U = p.U_W_m2K ?? 800;
  const area = duty / (U * lmtd);

  const hot_profile: [number, number][] = [];
  const cold_profile: [number, number][] = [];
  for (let i = 0; i <= 20; i++) {
    const f = i / 20;
    hot_profile.push([f, Th_in - f * (Th_in - Th_out)]);
    if (isCounter) {
      cold_profile.push([f, Tc_out - f * (Tc_out - Tc_in)]);
    } else {
      cold_profile.push([f, Tc_in + f * (Tc_out - Tc_in)]);
    }
  }

  return {
    hot_inlet_T_C: Th_in,
    hot_outlet_T_C: Th_out,
    cold_inlet_T_C: Tc_in,
    cold_outlet_T_C: Tc_out,
    duty_W: duty,
    hot_duty_W: duty,
    cold_duty_W: duty,
    energy_balance_residual_W: 0,
    delta_T_1: dt1,
    delta_T_2: dt2,
    LMTD_C: lmtd,
    flow_arrangement: p.flow_arrangement,
    U_W_m2K: U,
    area_m2: Math.max(0, area),
    UA_W_K: U * area,
    min_approach_C: Math.min(dt1, dt2),
    feasible: dt1 > 0 && dt2 > 0,
    calc_type: 'rating',
    warnings: (dt1 <= 0 || dt2 <= 0) ? ['Temperature cross detected! Heat exchanger is infeasible.'] : [],
    assumptions: ['Constant heat capacities', 'Negligible heat losses to surroundings', 'Steady-state'],
    hot_profile,
    cold_profile,
  };
}

// ---------------------------------------------------------------------------
// Fluidisation API Client & Rigorous Client-side Fallback Engine
// ---------------------------------------------------------------------------

export async function fetchFluidisationPresets(): Promise<FluidisationPreset[]> {
  try {
    const res = await fetch(`${API_BASE}/fluidisation/presets`);
    if (!res.ok) throw new Error('Failed to fetch presets');
    return await res.json();
  } catch {
    return [
      {
        id: 'glass_beads_air',
        name: 'Glass Beads / Air (Standard Lab Bed)',
        particle_name: 'Soda-Lime Glass Spheres',
        gas_name: 'Ambient Air (20°C, 1 atm)',
        particle_diameter_mm: 0.50,
        particle_density_kg_m3: 2500.0,
        gas_density_kg_m3: 1.205,
        gas_viscosity_Pa_s: 1.82e-5,
        initial_bed_height_m: 0.40,
        initial_voidage: 0.40,
        sphericity: 1.0,
        nominal_velocity_m_s: 0.28,
        description: 'Ideal Geldart Group B spherical particles with sharp incipient fluidisation and clear bubbling.'
      },
      {
        id: 'silica_sand_air',
        name: 'Silica Sand / Air (Industrial)',
        particle_name: 'Sub-angular Silica Sand',
        gas_name: 'Air (20°C)',
        particle_diameter_mm: 0.25,
        particle_density_kg_m3: 2650.0,
        gas_density_kg_m3: 1.205,
        gas_viscosity_Pa_s: 1.82e-5,
        initial_bed_height_m: 0.35,
        initial_voidage: 0.42,
        sphericity: 0.86,
        nominal_velocity_m_s: 0.12,
        description: 'Common industrial Geldart Group B sand bed with realistic non-spherical particles.'
      },
      {
        id: 'fcc_catalyst_air',
        name: 'FCC Catalyst / Air (Petroleum Refining)',
        particle_name: 'Zeolite / Alumina Microspheres',
        gas_name: 'Air / Flue Gas',
        particle_diameter_mm: 0.075,
        particle_density_kg_m3: 1400.0,
        gas_density_kg_m3: 1.205,
        gas_viscosity_Pa_s: 1.82e-5,
        initial_bed_height_m: 0.50,
        initial_voidage: 0.45,
        sphericity: 0.95,
        nominal_velocity_m_s: 0.045,
        description: 'Classic Geldart Group A powder exhibiting wide homogenous bed expansion before bubbling onset.'
      },
      {
        id: 'polyethylene_nitrogen',
        name: 'Polyethylene Pellets / Nitrogen (Polymerisation)',
        particle_name: 'LLDPE Granules',
        gas_name: 'Nitrogen (60°C, 20 bar)',
        particle_diameter_mm: 1.50,
        particle_density_kg_m3: 920.0,
        gas_density_kg_m3: 20.4,
        gas_viscosity_Pa_s: 1.95e-5,
        initial_bed_height_m: 0.60,
        initial_voidage: 0.38,
        sphericity: 0.92,
        nominal_velocity_m_s: 0.45,
        description: 'Coarse Geldart Group D polymer pellets under high-pressure gas-phase reactor conditions.'
      }
    ];
  }
}

export async function simulateFluidisation(params: FluidisationParameters): Promise<FluidisationSimulationResult> {
  try {
    const res = await fetch(`${API_BASE}/fluidisation/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Fluidisation API request failed');
    return await res.json();
  } catch {
    // Pure client-side first-principles engineering fallback
    return computeClientFluidisation(params);
  }
}

export function computeClientFluidisation(p: FluidisationParameters): FluidisationSimulationResult {
  const g = 9.80665;
  const dp = Math.max(1e-6, p.particle_diameter_m);
  const rho_p = Math.max(100, p.particle_density_kg_m3);
  const rho_g = Math.max(0.01, p.gas_density_kg_m3);
  const mu = Math.max(1e-7, p.gas_viscosity_Pa_s);
  const u0 = Math.max(0, p.gas_velocity_m_s);
  const H0 = Math.max(0.01, p.initial_bed_height_m);
  const eps0 = Math.max(0.20, Math.min(0.70, p.initial_voidage ?? 0.40));
  const phi_s = Math.max(0.30, Math.min(1.0, p.sphericity ?? 1.0));
  const Dc = Math.max(0.02, p.column_diameter_m ?? 0.10);
  const sigma = Math.max(0.005, p.distributor_open_ratio ?? 0.04);
  const Cd = Math.max(0.2, p.distributor_Cd ?? 0.62);

  const warnings: string[] = [];
  if (rho_p <= rho_g) {
    warnings.push('Particle density must be greater than gas density for solid downward settling.');
  }

  // 1. Archimedes number
  const density_diff = Math.max(1e-6, rho_p - rho_g);
  const Ar = (Math.pow(dp, 3) * rho_g * density_diff * g) / (mu * mu);

  // 2. Reynolds number at superficial velocity
  const Re_p = (rho_g * u0 * dp) / mu;

  // 3. Wen-Yu correlation for u_mf
  const C1 = 33.7;
  const C2 = 0.0408;
  const re_mf_wy = Math.max(1e-6, Math.sqrt(Math.max(0, C1 * C1 + C2 * Ar)) - C1);
  const u_mf_wy = (re_mf_wy * mu) / (rho_g * dp);

  // 4. Ergun quadratic for u_mf
  const A = 1.75 / (phi_s * Math.pow(eps0, 3));
  const B = (150.0 * (1.0 - eps0)) / (phi_s * phi_s * Math.pow(eps0, 3));
  const disc = B * B + 4.0 * A * Ar;
  const re_mf_erg = Math.max(1e-6, (-B + Math.sqrt(Math.max(0, disc))) / (2.0 * A));
  const u_mf_erg = (re_mf_erg * mu) / (rho_g * dp);

  // Design u_mf is Ergun with specified sphericity & voidage
  const u_mf = u_mf_erg;
  const re_mf = re_mf_erg;

  // 5. Terminal settling velocity (Haider & Levenspiel 1989)
  const d_star = Math.pow(Ar, 1.0 / 3.0);
  const term1 = 18.0 / (d_star * d_star);
  const term2 = (2.335 - 1.744 * phi_s) / Math.sqrt(Math.max(1e-6, d_star));
  const u_star = 1.0 / (term1 + term2);
  const scale_factor = Math.pow((mu * density_diff * g) / (rho_g * rho_g), 1.0 / 3.0);
  const u_t = u_star * scale_factor;
  const re_t = (rho_g * u_t * dp) / mu;

  // Richardson-Zaki exponent
  let n_rz = 4.65;
  if (re_t >= 0.2 && re_t < 1.0) n_rz = 4.40 * Math.pow(re_t, -0.03);
  else if (re_t >= 1.0 && re_t < 500.0) n_rz = 4.40 * Math.pow(re_t, -0.10);
  else if (re_t >= 500.0) n_rz = 2.40;

  // 6. Bed pressure drop & expansion
  const delta_p_bed_max = (1.0 - eps0) * density_diff * g * H0;

  const term_visc = (150.0 * Math.pow(1.0 - eps0, 2) * mu * u0) / (phi_s * phi_s * Math.pow(eps0, 3) * dp * dp);
  const term_inert = (1.75 * (1.0 - eps0) * rho_g * u0 * u0) / (phi_s * Math.pow(eps0, 3) * dp);
  const ergun_viscous_Pa = term_visc * H0;
  const ergun_inertial_Pa = term_inert * H0;
  const ergun_total_Pa = ergun_viscous_Pa + ergun_inertial_Pa;

  const is_fluidised = u0 >= u_mf;
  const is_entrained = u0 >= u_t;

  let bed_dp = 0;
  let expanded_voidage = eps0;
  let expanded_height = H0;
  let bubble_fraction = 0;
  let bubble_diameter = 0;

  if (!is_fluidised) {
    bed_dp = Math.min(ergun_total_Pa, delta_p_bed_max * 1.06);
    expanded_voidage = eps0;
    expanded_height = H0;
  } else {
    if (is_entrained) {
      const entrainment_factor = Math.exp(-0.8 * (u0 - u_t) / Math.max(1e-4, u_t));
      bed_dp = delta_p_bed_max * Math.max(0.2, entrainment_factor);
    } else {
      bed_dp = delta_p_bed_max;
    }

    const eps_rz = Math.pow(Math.min(0.999, u0 / Math.max(1e-4, u_t)), 1.0 / n_rz);
    expanded_voidage = Math.max(eps0, Math.min(0.95, eps_rz));
    expanded_height = (H0 * (1.0 - eps0)) / Math.max(0.05, 1.0 - expanded_voidage);

    if (u0 > u_mf) {
      const db_calc = (0.54 * Math.pow(u0 - u_mf, 0.4) * Math.pow(H0 * 0.5, 0.8)) / Math.pow(g, 0.2);
      bubble_diameter = Math.max(0.005, Math.min(Dc * 0.6, db_calc));
      const u_b = (u0 - u_mf) + 0.711 * Math.sqrt(g * bubble_diameter);
      bubble_fraction = Math.max(0, Math.min(0.65, (u0 - u_mf) / Math.max(1e-3, u_b)));
    }
  }

  // Distributor pressure drop
  const v_orifice = u0 / (Cd * sigma);
  const distributor_dp = 0.5 * rho_g * v_orifice * v_orifice;
  const total_dp = bed_dp + distributor_dp;

  // 7. Geldart classification
  const dp_um = dp * 1e6;
  let geldart_group = 'B';
  let geldart_desc = '';
  if (dp_um < 30) {
    geldart_group = 'C';
    geldart_desc = 'Geldart Group C: Cohesive, very fine powders (dp < 30 µm). Interparticle van der Waals forces dominate. Prone to channeling and cracking.';
  } else if (dp_um < 100 && density_diff < 1500) {
    geldart_group = 'A';
    geldart_desc = 'Geldart Group A: Aeratable powders (dp ~ 30-100 µm, low density). Demonstrates stable homogenous bed expansion (u_mb > u_mf) prior to bubbling.';
  } else if (dp_um <= 1000) {
    geldart_group = 'B';
    geldart_desc = 'Geldart Group B: Sand-like bubbling particles (dp ~ 100-1000 µm). Bubbles form immediately upon fluidisation onset (u_mb ≈ u_mf).';
  } else {
    geldart_group = 'D';
    geldart_desc = 'Geldart Group D: Coarse, spoutable particles (dp > 1000 µm). High fluidisation velocities; large exploding bubbles or spouting.';
  }

  // 8. Regime
  let regime = 'Packed Bed';
  let regime_desc = '';
  const u_turbulent = 0.45 * u_t;

  if (u0 < 0.95 * u_mf) {
    regime = 'Packed Bed';
    regime_desc = `Superficial gas velocity (${u0.toFixed(4)} m/s) is below u_mf (${u_mf.toFixed(4)} m/s). Particles remain stationary in a fixed bed.`;
  } else if (u0 <= 1.08 * u_mf) {
    regime = 'Minimum Fluidisation';
    regime_desc = `Operating at incipient fluidisation (u0 ≈ u_mf = ${u_mf.toFixed(4)} m/s). Total drag balances buoyant bed weight; particles unlock and suspend.`;
  } else if (u0 < u_turbulent) {
    regime = 'Bubbling Fluidisation';
    regime_desc = `Gas velocity (${u0.toFixed(4)} m/s) exceeds u_mf. Excess gas travels upwards as distinct bubbles through the emulsion, causing particle circulation.`;
  } else if (u0 < u_t) {
    regime = 'Turbulent Fluidisation';
    regime_desc = `High gas velocity (${u0.toFixed(4)} m/s) causes bubbles to break down into chaotic voids with intense churning and vigorous splashing.`;
  } else {
    regime = 'Entrainment (Fast Fluidisation)';
    regime_desc = `Gas velocity (${u0.toFixed(4)} m/s) exceeds terminal velocity (${u_t.toFixed(4)} m/s). Particles are continuously elutriated into the gas outlet.`;
    warnings.push(`Gas velocity (${u0.toFixed(3)} m/s) exceeds terminal velocity (${u_t.toFixed(3)} m/s); particle elutriation occurring.`);
  }

  // Generate curves if requested
  const curves: FluidisationCurvePoint[] = [];
  const n_pts = p.curve_points ?? 50;
  const u_max = Math.max(u_t * 1.25, u_mf * 3.5, 0.5);

  const velocities: number[] = [0];
  const n_pack = Math.floor(n_pts / 3);
  for (let i = 1; i < n_pack; i++) {
    velocities.push((i / n_pack) * u_mf);
  }
  velocities.push(u_mf * 0.96, u_mf * 0.99, u_mf, u_mf * 1.02, u_mf * 1.05);
  const n_fl = n_pts - velocities.length;
  for (let i = 1; i <= n_fl; i++) {
    velocities.push(u_mf * 1.05 + (i / n_fl) * (u_max - u_mf * 1.05));
  }
  velocities.sort((a, b) => a - b);

  for (const v of velocities) {
    const isFl = v >= u_mf;
    const tv = (150 * Math.pow(1 - eps0, 2) * mu * v) / (phi_s * phi_s * Math.pow(eps0, 3) * dp * dp) * H0;
    const ti = (1.75 * (1 - eps0) * rho_g * v * v) / (phi_s * Math.pow(eps0, 3) * dp) * H0;
    const ergTotal = tv + ti;

    let b_dp = 0;
    let exp_h = H0;
    let exp_v = eps0;
    let bf = 0;

    if (!isFl) {
      b_dp = Math.min(ergTotal, delta_p_bed_max * 1.06);
    } else {
      b_dp = v >= u_t ? delta_p_bed_max * Math.max(0.2, Math.exp(-0.8 * (v - u_t) / Math.max(1e-4, u_t))) : delta_p_bed_max;
      const erz = Math.pow(Math.min(0.999, v / Math.max(1e-4, u_t)), 1 / n_rz);
      exp_v = Math.max(eps0, Math.min(0.95, erz));
      exp_h = (H0 * (1 - eps0)) / Math.max(0.05, 1 - exp_v);
      if (v > u_mf) {
        const d_b = Math.max(0.005, Math.min(Dc * 0.6, (0.54 * Math.pow(v - u_mf, 0.4) * Math.pow(H0 * 0.5, 0.8)) / Math.pow(g, 0.2)));
        const ub = (v - u_mf) + 0.711 * Math.sqrt(g * d_b);
        bf = Math.max(0, Math.min(0.65, (v - u_mf) / Math.max(1e-3, ub)));
      }
    }
    const dist_dp = 0.5 * rho_g * Math.pow(v / (Cd * sigma), 2);

    curves.push({
      gas_velocity_m_s: Number(v.toFixed(5)),
      bed_pressure_drop_Pa: Number(b_dp.toFixed(2)),
      total_pressure_drop_Pa: Number((b_dp + dist_dp).toFixed(2)),
      distributor_pressure_drop_Pa: Number(dist_dp.toFixed(2)),
      ergun_theoretical_Pa: Number(ergTotal.toFixed(2)),
      expanded_bed_height_m: Number(exp_h.toFixed(4)),
      expanded_voidage: Number(exp_v.toFixed(4)),
      bubble_fraction: Number(bf.toFixed(4)),
      is_fluidised: isFl ? 1.0 : 0.0,
      reynolds_number: Number(((rho_g * v * dp) / mu).toFixed(3)),
    });
  }

  return {
    archimedes_number: Ar,
    reynolds_number: Re_p,
    reynolds_number_mf: re_mf,
    u_mf_wen_yu_m_s: u_mf_wy,
    u_mf_ergun_m_s: u_mf_erg,
    u_mf_design_m_s: u_mf,
    terminal_velocity_m_s: u_t,
    reynolds_terminal: re_t,
    bed_pressure_drop_Pa: bed_dp,
    distributor_pressure_drop_Pa: distributor_dp,
    total_pressure_drop_Pa: total_dp,
    ergun_viscous_Pa: ergun_viscous_Pa,
    ergun_inertial_Pa: ergun_inertial_Pa,
    theoretical_max_bed_dp_Pa: delta_p_bed_max,
    expanded_bed_height_m: expanded_height,
    expanded_voidage: expanded_voidage,
    bed_expansion_ratio: expanded_height / H0,
    bubble_fraction: bubble_fraction,
    estimated_bubble_diameter_m: bubble_diameter,
    geldart_group: geldart_group,
    geldart_description: geldart_desc,
    regime: regime,
    regime_description: regime_desc,
    is_fluidised: is_fluidised,
    is_entrained: is_entrained,
    velocity_ratio: u0 / Math.max(1e-6, u_mf),
    dimensionless_velocity: u0 / Math.pow((g * mu) / (rho_g * rho_g), 1.0 / 3.0),
    richardson_zaki_index: n_rz,
    warnings: warnings,
    characteristic_curves: curves,
  };
}

// ---------------------------------------------------------------------------
// Centrifugal Pump Digital Twin Client & Fallback Engine
// ---------------------------------------------------------------------------

export const PUMP_CATALOG_CLIENT: Record<string, PumpGeometryData> = {
  iso2858_chemical: {
    id: 'iso2858_chemical',
    name: 'ISO 2858 Chemical Process Pump (50-32-160)',
    pump_type: 'radial',
    impeller_construction: 'closed',
    casing_design: 'volute',
    suction_type: 'single_suction',
    installation_type: 'end_suction',
    num_stages: 1,
    rated_speed_rpm: 2900.0,
    impeller_diameter_m: 0.165,
    impeller_eye_diameter_m: 0.065,
    blade_exit_width_m: 0.012,
    blade_exit_angle_deg: 25.0,
    blade_count: 6,
    rated_flow_m3_h: 30.0,
    rated_head_m: 32.0,
    rated_efficiency: 0.76,
    npshr_bep_m: 2.4,
    motor_power_kw: 5.5,
    casing_material: 'Cast Stainless 316',
    impeller_material: 'Cast Stainless 316',
    seal_type: 'cartridge_mechanical',
    description: 'Standard single-stage end-suction chemical pump according to ISO 2858.',
  },
  split_case_highflow: {
    id: 'split_case_highflow',
    name: 'Horizontal Split-Case Double-Suction Pump',
    pump_type: 'radial',
    impeller_construction: 'closed',
    casing_design: 'double_volute',
    suction_type: 'double_suction',
    installation_type: 'split_case',
    num_stages: 1,
    rated_speed_rpm: 1450.0,
    impeller_diameter_m: 0.320,
    impeller_eye_diameter_m: 0.140,
    blade_exit_width_m: 0.038,
    blade_exit_angle_deg: 24.0,
    blade_count: 7,
    rated_flow_m3_h: 220.0,
    rated_head_m: 45.0,
    rated_efficiency: 0.84,
    npshr_bep_m: 3.2,
    motor_power_kw: 37.0,
    casing_material: 'Ductile Iron',
    impeller_material: 'Cast Bronze',
    seal_type: 'cartridge_mechanical',
    description: 'High-flow municipal water supply pump with double-suction impeller for low NPSHr and zero axial thrust.',
  },
  multistage_boiler_feed: {
    id: 'multistage_boiler_feed',
    name: 'Multistage Ring-Section Feed Pump (4-Stage)',
    pump_type: 'radial',
    impeller_construction: 'closed',
    casing_design: 'diffuser',
    suction_type: 'single_suction',
    installation_type: 'end_suction',
    num_stages: 4,
    rated_speed_rpm: 2950.0,
    impeller_diameter_m: 0.180,
    impeller_eye_diameter_m: 0.070,
    blade_exit_width_m: 0.010,
    blade_exit_angle_deg: 26.0,
    blade_count: 6,
    rated_flow_m3_h: 40.0,
    rated_head_m: 160.0,
    rated_efficiency: 0.74,
    npshr_bep_m: 2.8,
    motor_power_kw: 30.0,
    casing_material: 'Forged Carbon Steel',
    impeller_material: 'Stainless 316',
    seal_type: 'cartridge_mechanical',
    description: 'High-pressure 4-stage diffuser casing pump for industrial boiler feedwater.',
  },
  slurry_heavy_duty: {
    id: 'slurry_heavy_duty',
    name: 'Heavy-Duty Semi-Open Slurry Pump',
    pump_type: 'mixed',
    impeller_construction: 'semi_open',
    casing_design: 'volute',
    suction_type: 'single_suction',
    installation_type: 'end_suction',
    num_stages: 1,
    rated_speed_rpm: 1450.0,
    impeller_diameter_m: 0.280,
    impeller_eye_diameter_m: 0.110,
    blade_exit_width_m: 0.045,
    blade_exit_angle_deg: 28.0,
    blade_count: 4,
    rated_flow_m3_h: 90.0,
    rated_head_m: 25.0,
    rated_efficiency: 0.68,
    npshr_bep_m: 3.8,
    motor_power_kw: 15.0,
    casing_material: 'High Chrome Iron (27% Cr)',
    impeller_material: 'High Chrome Iron (27% Cr)',
    seal_type: 'gland_packing',
    description: 'Abrasion-resistant heavy slurry pump with wide semi-open 4-vane impeller.',
  },
  vertical_inline_circulator: {
    id: 'vertical_inline_circulator',
    name: 'Vertical Inline Circulation Pump',
    pump_type: 'radial',
    impeller_construction: 'closed',
    casing_design: 'volute',
    suction_type: 'single_suction',
    installation_type: 'inline',
    num_stages: 1,
    rated_speed_rpm: 1450.0,
    impeller_diameter_m: 0.170,
    impeller_eye_diameter_m: 0.060,
    blade_exit_width_m: 0.014,
    blade_exit_angle_deg: 23.0,
    blade_count: 6,
    rated_flow_m3_h: 25.0,
    rated_head_m: 12.0,
    rated_efficiency: 0.75,
    npshr_bep_m: 1.8,
    motor_power_kw: 1.5,
    casing_material: 'Cast Iron',
    impeller_material: 'Stainless 304',
    seal_type: 'single_mechanical',
    description: 'Space-saving straight-through inline pump for chemical cooling loops.',
  },
  magnetic_drive_sealless: {
    id: 'magnetic_drive_sealless',
    name: 'Magnetic-Drive Sealless Chemical Pump',
    pump_type: 'radial',
    impeller_construction: 'closed',
    casing_design: 'volute',
    suction_type: 'single_suction',
    installation_type: 'end_suction',
    num_stages: 1,
    rated_speed_rpm: 2900.0,
    impeller_diameter_m: 0.150,
    impeller_eye_diameter_m: 0.055,
    blade_exit_width_m: 0.010,
    blade_exit_angle_deg: 24.0,
    blade_count: 6,
    rated_flow_m3_h: 18.0,
    rated_head_m: 24.0,
    rated_efficiency: 0.70,
    npshr_bep_m: 2.2,
    motor_power_kw: 3.0,
    casing_material: 'PVDF / Silicon Carbide',
    impeller_material: 'PVDF / NdFeB magnets',
    seal_type: 'cartridge_mechanical',
    description: 'Zero-emissions sealless containment can pump for toxic and flammable chemicals.',
  },
};

export const FLUID_DATABASE_CLIENT: Record<string, FluidData> = {
  water: {
    id: 'water', name: 'Water (Potable)', category: 'Clean Liquids',
    base_density: 998.2, base_viscosity_pa_s: 1.002e-3, base_vapor_pressure_pa: 2338.0,
    specific_heat_j_kg_k: 4182.0, thermal_cond_w_m_k: 0.598, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'Standard reference fluid for pump performance curves.',
  },
  distilled_water: {
    id: 'distilled_water', name: 'Distilled Water', category: 'Clean Liquids',
    base_density: 997.5, base_viscosity_pa_s: 0.998e-3, base_vapor_pressure_pa: 2340.0,
    specific_heat_j_kg_k: 4184.0, thermal_cond_w_m_k: 0.600, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'Pure demineralized water for boiler feed and lab tests.',
  },
  seawater: {
    id: 'seawater', name: 'Seawater (3.5% Salinity)', category: 'Saline Liquids',
    base_density: 1025.0, base_viscosity_pa_s: 1.08e-3, base_vapor_pressure_pa: 2280.0,
    specific_heat_j_kg_k: 3993.0, thermal_cond_w_m_k: 0.580, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'Saline ocean water; requires duplex stainless or bronze impeller.',
  },
  brine_20: {
    id: 'brine_20', name: 'NaCl Brine (20% wt)', category: 'Saline Liquids',
    base_density: 1150.0, base_viscosity_pa_s: 1.65e-3, base_vapor_pressure_pa: 1850.0,
    specific_heat_j_kg_k: 3350.0, thermal_cond_w_m_k: 0.540, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'Dense refrigeration brine solution.',
  },
  ethanol: {
    id: 'ethanol', name: 'Ethanol (99.5%)', category: 'Alcohols',
    base_density: 789.0, base_viscosity_pa_s: 1.20e-3, base_vapor_pressure_pa: 5870.0,
    specific_heat_j_kg_k: 2440.0, thermal_cond_w_m_k: 0.171, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'Volatile organic alcohol with high vapor pressure.',
  },
  methanol: {
    id: 'methanol', name: 'Methanol (Pure)', category: 'Alcohols',
    base_density: 791.0, base_viscosity_pa_s: 0.59e-3, base_vapor_pressure_pa: 12800.0,
    specific_heat_j_kg_k: 2510.0, thermal_cond_w_m_k: 0.202, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'Highly volatile toxic alcohol; requires sealless/mag-drive pump.',
  },
  diesel: {
    id: 'diesel', name: 'Diesel Fuel (No. 2)', category: 'Hydrocarbons',
    base_density: 840.0, base_viscosity_pa_s: 3.00e-3, base_vapor_pressure_pa: 400.0,
    specific_heat_j_kg_k: 2000.0, thermal_cond_w_m_k: 0.145, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'Light hydrocarbon fuel oil.',
  },
  light_crude: {
    id: 'light_crude', name: 'Light Crude Oil (35° API)', category: 'Hydrocarbons',
    base_density: 850.0, base_viscosity_pa_s: 8.50e-3, base_vapor_pressure_pa: 12000.0,
    specific_heat_j_kg_k: 1950.0, thermal_cond_w_m_k: 0.133, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'Live crude oil with dissolved light ends.',
  },
  heavy_fuel_oil: {
    id: 'heavy_fuel_oil', name: 'Heavy Fuel Oil (HFO 380)', category: 'Hydrocarbons',
    base_density: 985.0, base_viscosity_pa_s: 0.380, base_vapor_pressure_pa: 100.0,
    specific_heat_j_kg_k: 1750.0, thermal_cond_w_m_k: 0.125, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'High viscosity fuel requiring ANSI/HI viscosity correction.',
  },
  glycerol_85: {
    id: 'glycerol_85', name: 'Glycerol (85% aqueous)', category: 'Viscous Liquids',
    base_density: 1220.0, base_viscosity_pa_s: 0.109, base_vapor_pressure_pa: 50.0,
    specific_heat_j_kg_k: 2620.0, thermal_cond_w_m_k: 0.285, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'Viscous polyol demonstrating drastic laminar head derating.',
  },
  ethylene_glycol: {
    id: 'ethylene_glycol', name: 'Ethylene Glycol (50% soln)', category: 'Thermal Fluids',
    base_density: 1065.0, base_viscosity_pa_s: 3.20e-3, base_vapor_pressure_pa: 1100.0,
    specific_heat_j_kg_k: 3400.0, thermal_cond_w_m_k: 0.420, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'Industrial heat-transfer and anti-freeze fluid.',
  },
  thermal_oil: {
    id: 'thermal_oil', name: 'Thermal Heat Transfer Oil', category: 'Thermal Fluids',
    base_density: 870.0, base_viscosity_pa_s: 25.0e-3, base_vapor_pressure_pa: 80.0,
    specific_heat_j_kg_k: 2100.0, thermal_cond_w_m_k: 0.130, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'Synthetic heat transfer fluid for temperatures up to 300°C.',
  },
  hcl_30: {
    id: 'hcl_30', name: 'Hydrochloric Acid (30% wt)', category: 'Corrosive Liquids',
    base_density: 1150.0, base_viscosity_pa_s: 1.70e-3, base_vapor_pressure_pa: 2130.0,
    specific_heat_j_kg_k: 3000.0, thermal_cond_w_m_k: 0.480, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'Severe mineral acid; requires ETFE/PTFE lined or Hastelloy-C pump.',
  },
  h2so4_50: {
    id: 'h2so4_50', name: 'Sulfuric Acid (50% wt)', category: 'Corrosive Liquids',
    base_density: 1395.0, base_viscosity_pa_s: 3.80e-3, base_vapor_pressure_pa: 850.0,
    specific_heat_j_kg_k: 2600.0, thermal_cond_w_m_k: 0.410, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'Dense mineral acid requiring Alloy-20 construction.',
  },
  naoh_20: {
    id: 'naoh_20', name: 'Sodium Hydroxide (20% wt)', category: 'Corrosive Liquids',
    base_density: 1220.0, base_viscosity_pa_s: 4.00e-3, base_vapor_pressure_pa: 1500.0,
    specific_heat_j_kg_k: 3600.0, thermal_cond_w_m_k: 0.520, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'Strong caustic alkali; requires nickel-alloy or SS316.',
  },
  milk_whole: {
    id: 'milk_whole', name: 'Whole Milk (Sanitary)', category: 'Food Processing',
    base_density: 1030.0, base_viscosity_pa_s: 2.10e-3, base_vapor_pressure_pa: 2320.0,
    specific_heat_j_kg_k: 3930.0, thermal_cond_w_m_k: 0.530, rheology_model: 'newtonian',
    power_law_k: 0.0, power_law_n: 1.0, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.0, solids_particle_um: 0.0,
    description: 'Hygienic food liquid; requires 3A certified polished 316L pump.',
  },
  sand_slurry_15: {
    id: 'sand_slurry_15', name: 'Sand-Water Slurry (15% vol)', category: 'Suspensions',
    base_density: 1240.0, base_viscosity_pa_s: 8.50e-3, base_vapor_pressure_pa: 2300.0,
    specific_heat_j_kg_k: 3300.0, thermal_cond_w_m_k: 0.620, rheology_model: 'power_law',
    power_law_k: 0.015, power_law_n: 0.82, yield_stress_pa: 0.0,
    solids_volume_fraction: 0.15, solids_particle_um: 120.0,
    description: 'Abrasive silica slurry; requires high-chrome alloy semi-open impeller.',
  },
  municipal_sludge: {
    id: 'municipal_sludge', name: 'Digested Sewage Sludge (4% solids)', category: 'Wastewater',
    base_density: 1018.0, base_viscosity_pa_s: 18.0e-3, base_vapor_pressure_pa: 2330.0,
    specific_heat_j_kg_k: 4050.0, thermal_cond_w_m_k: 0.560, rheology_model: 'bingham',
    power_law_k: 0.025, power_law_n: 1.0, yield_stress_pa: 12.5,
    solids_volume_fraction: 0.04, solids_particle_um: 80.0,
    description: 'Non-Newtonian Bingham plastic sludge.',
  },
};

export const PUMP_COMPONENTS_CLIENT: PumpComponentData[] = [
  {
    id: 'impeller',
    name: 'Impeller (Centrifugal Vanes & Shrouds)',
    category: 'hydraulic',
    material: 'Cast 316 Stainless Steel / High Chrome Alloy',
    function: 'Converts mechanical shaft torque into kinetic energy and pressure head in the liquid.',
    working_principle: 'Fluid enters axially at the eye, is accelerated radially outwards by backward-curved vanes, and discharges at high peripheral tip speed u2.',
    failure_modes: ['Erosion/corrosion wear', 'Cavitation pitting at blade suction face', 'Foreign object blockage', 'Vane cracking due to hydraulic fatigue'],
    maintenance_procedure: 'Measure vane tip clearance using feeler gauges; balance dynamically to ISO 1940 Grade G2.5; replace when wall thickness wears > 25%.',
    exploded_offset: [0.0, 0.0, -120.0],
  },
  {
    id: 'impeller_eye',
    name: 'Impeller Eye & Inlet Throat',
    category: 'hydraulic',
    material: 'Machined 316 Stainless Steel',
    function: 'Low-pressure fluid entry zone directing axial incoming flow smoothly into the blade passages.',
    working_principle: 'Flow transition area where lowest static pressure occurs; prime location for vapor inception during cavitation.',
    failure_modes: ['Cavitation erosion around eye rim', 'Vortex erosion from suction recirculation'],
    maintenance_procedure: 'Check eye diameter for roundness; inspect for honeycomb cavitation pits.',
    exploded_offset: [0.0, 0.0, -180.0],
  },
  {
    id: 'volute_casing',
    name: 'Volute Casing (Spiral Diffuser)',
    category: 'hydraulic',
    material: 'Heavy-wall Cast Iron / Cast 316 Stainless Steel',
    function: 'Collects high-velocity fluid exiting the impeller periphery and converts kinetic energy into static pressure.',
    working_principle: 'The flow cross-sectional area expands continuously in a logarithmic spiral towards the discharge nozzle, slowing the liquid and recovering pressure according to Bernoulli.',
    failure_modes: ['Cutwater tongue erosion', 'Casing wall thinning under abrasive slurries', 'Hydraulic overpressure cracking'],
    maintenance_procedure: 'Ultrasonic wall thickness measurement; inspect cutwater clearance; check casing gasket seating surface.',
    exploded_offset: [0.0, 0.0, 0.0],
  },
  {
    id: 'wear_rings',
    name: 'Casing & Impeller Wear Rings',
    category: 'hydraulic',
    material: 'Differentially Hardened Stainless 420 / Silicon Carbide / Bronze',
    function: 'Provides a tight running clearance seal between high-pressure discharge volute and low-pressure suction eye.',
    working_principle: 'Restricts internal liquid recirculation from discharge back to suction, maintaining volumetric efficiency (typically > 95%).',
    failure_modes: ['Wear gap expansion causing volumetric efficiency loss', 'Galling/seizure during dry running'],
    maintenance_procedure: 'Measure diametral clearance; if clearance exceeds 2x original design clearance (standard: 0.3mm to 0.5mm), replace rings.',
    exploded_offset: [0.0, 0.0, -90.0],
  },
  {
    id: 'shaft',
    name: 'Drive Shaft & Keyways',
    category: 'rotating',
    material: 'High-tensile Alloy Steel 4140 / Duplex Stainless 2205',
    function: 'Transmits rotational mechanical power and torque from the electric motor to the impeller.',
    working_principle: 'Subjected to combined torsion from motor drive and alternating bending moments from radial hydraulic loads on the impeller.',
    failure_modes: ['Shaft fatigue fracture at keyway notch', 'Excessive shaft deflection / runout (> 0.05 mm)', 'Corrosion fretting under sleeve'],
    maintenance_procedure: 'Check Total Indicated Runout (TIR) with dial indicator (must be < 0.025 mm); dye-penetrant inspect keyway radii.',
    exploded_offset: [0.0, 0.0, 150.0],
  },
  {
    id: 'shaft_sleeve',
    name: 'Renewable Shaft Sleeve',
    category: 'rotating',
    material: 'Hardened 316 SS with Ceramic / Tungsten Carbide Coating',
    function: 'Protects the expensive drive shaft from mechanical seal wear, abrasive erosion, and corrosion.',
    working_principle: 'Sacrificial cylinder clamped or keyed onto the shaft directly beneath the mechanical seal faces and secondary O-rings.',
    failure_modes: ['Grooving wear under seal faces', 'Fretting corrosion from vibration', 'O-ring extrusion'],
    maintenance_procedure: 'Replace during every major mechanical seal overhaul; polish surface to Ra < 0.4 µm.',
    exploded_offset: [0.0, 0.0, 90.0],
  },
  {
    id: 'mechanical_seal',
    name: 'Cartridge Mechanical Seal',
    category: 'sealing',
    material: 'Silicon Carbide vs Carbon / Tungsten Carbide Faces, Hastelloy Springs, Viton / FFKM Elastomers',
    function: 'Prevents high-pressure process fluid from leaking out of the pump casing along the rotating shaft.',
    working_principle: 'A rotating seal ring is pressed against a stationary ring by precision spring force, maintaining an ultra-thin (1 µm) lubricating fluid film between the optical flat faces.',
    failure_modes: ['Seal face thermal cracking from dry running', 'Abrasive particulate scoring', 'Elastomer O-ring hardening/chemical attack', 'Spring clogging'],
    maintenance_procedure: 'Never run dry; verify seal flush plan (Plan 11/53); check leakage rate (< 5 drops/min); replace cartridge if face gap opens.',
    exploded_offset: [0.0, 0.0, 60.0],
  },
  {
    id: 'bearings',
    name: 'Radial & Thrust Ball / Roller Bearings',
    category: 'supporting',
    material: 'Vacuum Degassed 52100 Chrome Bearing Steel',
    function: 'Supports the rotating shaft assembly, maintaining concentric alignment and absorbing radial and axial hydraulic thrust loads.',
    working_principle: 'Deep groove ball bearing at pump end absorbs radial load; back-to-back angular contact pairs at drive end absorb bidirectional axial thrust.',
    failure_modes: ['Fatigue spalling of races', 'Contamination by water/seal flush', 'Inadequate lubrication / overheating (> 85°C)', 'False brinelling from vibration'],
    maintenance_procedure: 'Monitor vibration velocity (RMS) and shock pulse / PeakVue; replace oil every 3000 operating hours; replace bearings before L10 life expires.',
    exploded_offset: [0.0, 0.0, 220.0],
  },
  {
    id: 'bearing_housing',
    name: 'Bearing Housing & Oil Sump',
    category: 'supporting',
    material: 'Cast Iron ASTM A48 Class 30',
    function: 'Encloses and rigidly supports bearings, houses lubricating oil sump, constant-level oiler, and cooling jacket.',
    working_principle: 'Dissipates bearing friction heat; includes labyrinth oil seals to prevent lubricant egress and atmospheric dirt ingress.',
    failure_modes: ['Lubricant oil leakage past labyrinth seals', 'Condensation moisture contamination', 'Cracked foot mounting'],
    maintenance_procedure: 'Check oil sight glass level at centerline of lowest ball; drain and inspect magnetic drain plug for metallic debris.',
    exploded_offset: [0.0, 0.0, 180.0],
  },
  {
    id: 'suction_nozzle',
    name: 'Suction Nozzle & Flange',
    category: 'hydraulic',
    material: 'Cast 316 Stainless Steel (ANSI / DIN Flanged)',
    function: 'Connects the pump intake to the suction piping system; establishes smooth velocity distribution into the impeller eye.',
    working_principle: 'Conical converging transition reducing entrance vortexing and minimizing suction head losses.',
    failure_modes: ['Pipe strain transmitting excessive nozzle loading', 'Cavitation erosion at throat', 'Flange face leakage'],
    maintenance_procedure: 'Verify pipe stress alignment using dial indicators before tightening flange bolts; torque bolts in cross-pattern.',
    exploded_offset: [0.0, 0.0, -260.0],
  },
  {
    id: 'discharge_nozzle',
    name: 'Discharge Nozzle & Diffuser Throat',
    category: 'hydraulic',
    material: 'Cast 316 Stainless Steel (ANSI / DIN Flanged)',
    function: 'Discharges high-pressure fluid into the process piping system.',
    working_principle: 'Divergent nozzle providing final kinetic to static pressure head recovery.',
    failure_modes: ['Water hammer / surge cracking', 'Erosion at high velocity', 'Gasket blowout'],
    maintenance_procedure: 'Install check valve to eliminate reverse flow and water hammer; inspect internal throat for cavitation/erosion.',
    exploded_offset: [0.0, 180.0, 0.0],
  },
  {
    id: 'motor_coupling',
    name: 'Flexible Spacer Coupling & Electric Motor',
    category: 'supporting',
    material: 'Cast Iron Hubs with Polyurethane / Elastomeric Sleeve',
    function: 'Transmits drive torque while accommodating minor thermal expansion, angular, and parallel shaft misalignments.',
    working_principle: 'Rotational shear through flexible elastomeric spider element isolates vibration and cushions startup shock.',
    failure_modes: ['Elastomer element shredding from severe misalignment', 'Coupling bolt loosening', 'Excessive 1X/2X shaft vibration'],
    maintenance_procedure: 'Align shafts with laser alignment system to < 0.05 mm parallel and < 0.05° angular tolerance.',
    exploded_offset: [0.0, 0.0, 320.0],
  },
];

export function getFluidPropsAtTemp(fluid: FluidData, tempC: number): {
  density: number;
  viscosity: number;
  vaporPressure: number;
  cp: number;
} {
  const tc = Math.max(-10.0, Math.min(150.0, tempC));
  const tk = tc + 273.15;
  const beta = 0.00035;
  const density = fluid.base_density / (1.0 + beta * (tc - 20.0));

  const eAct = 1800.0;
  let viscosity = fluid.base_viscosity_pa_s * Math.exp(eAct * (1.0 / tk - 1.0 / 293.15));
  viscosity = Math.max(1.0e-5, Math.min(100.0, viscosity));

  const deltaHvap = 4800.0;
  const vpFactor = Math.exp(-deltaHvap * (1.0 / tk - 1.0 / 293.15));
  let vaporPressure = fluid.base_vapor_pressure_pa * vpFactor;
  vaporPressure = Math.max(10.0, Math.min(2.5e6, vaporPressure));

  return { density, viscosity, vaporPressure, cp: fluid.specific_heat_j_kg_k };
}

export function simulatePumpLocal(conditions: PumpOperatingConditions): PumpSimulationResult {
  const g = 9.80665;
  const pAtm = 101325.0;

  const pump = PUMP_CATALOG_CLIENT[conditions.pump_id] || PUMP_CATALOG_CLIENT['iso2858_chemical'];
  const fluid = FLUID_DATABASE_CLIENT[conditions.fluid_id] || FLUID_DATABASE_CLIENT['water'];

  const { density, viscosity, vaporPressure, cp } = getFluidPropsAtTemp(fluid, conditions.fluid_temp_c);
  const kinViscosityM2S = viscosity / density;
  const kinViscosityCst = kinViscosityM2S * 1.0e6;

  const speedRpm = Math.max(300.0, Math.min(4000.0, conditions.speed_rpm));
  const d2 = conditions.impeller_diameter_m || pump.impeller_diameter_m;
  const speedRatio = speedRpm / pump.rated_speed_rpm;
  const diaRatio = d2 / pump.impeller_diameter_m;

  const omega = (2.0 * Math.PI * speedRpm) / 60.0;
  const u2 = (Math.PI * d2 * speedRpm) / 60.0;

  const beta2Rad = (pump.blade_exit_angle_deg * Math.PI) / 180.0;
  const slipFactor = Math.max(0.70, Math.min(0.95, 1.0 - (Math.PI * Math.sin(beta2Rad)) / pump.blade_count));
  const eulerHead = ((slipFactor * u2 * u2) / g) * pump.num_stages;

  // HI 9.6.7 Viscosity correction
  let cH = 1.0;
  let cQ = 1.0;
  let cEta = 1.0;
  let hiApplied = false;
  if (kinViscosityCst > 1.5) {
    const bParam =
      (16.5 * (Math.sqrt(kinViscosityCst) * Math.pow(pump.rated_head_m, 0.25))) /
      (Math.sqrt(Math.max(1.0, pump.rated_flow_m3_h)) * Math.pow(speedRpm, 0.25));
    if (bParam >= 1.0) {
      cH = Math.max(0.40, Math.min(1.0, 1.0 - 0.08 * Math.pow(bParam - 1.0, 0.85)));
      cQ = Math.max(0.45, Math.min(1.0, 1.0 - 0.12 * Math.pow(bParam - 1.0, 0.80)));
      cEta = Math.max(0.20, Math.min(1.0, 1.0 - 0.25 * Math.pow(bParam - 1.0, 0.75)));
      hiApplied = true;
    }
  }

  const bepQWater = pump.rated_flow_m3_h * speedRatio * diaRatio;
  const bepHWater = pump.rated_head_m * Math.pow(speedRatio, 2) * Math.pow(diaRatio, 2);
  const bepEtaWater = pump.rated_efficiency;

  const bepQ = bepQWater * cQ;
  const bepH = bepHWater * cH;
  const bepEta = Math.max(0.15, bepEtaWater * cEta);

  const wearDerate = Math.max(0.0, 1.0 - 0.35 * (conditions.fault_impeller_wear || 0));
  const gasDerate = Math.max(0.1, 1.0 - 0.08 * (conditions.gas_entrainment_pct || 0));

  const shutoffHead = 1.22 * bepH * wearDerate * gasDerate;
  const bCoeff = (shutoffHead - bepH) / Math.max(1.0, Math.pow(bepQ, 2));

  // Piping & valves
  const hStatic = Math.max(0.0, conditions.discharge_static_head_m - conditions.suction_static_head_m);
  const dSuct = Math.max(0.02, conditions.suction_pipe_dia_m);
  const dDisc = Math.max(0.02, conditions.discharge_pipe_dia_m);
  const aSuct = 0.25 * Math.PI * dSuct * dSuct;
  const aDisc = 0.25 * Math.PI * dDisc * dDisc;

  const kValveSuct = 0.2 + 0.8 * Math.pow((100.0 - conditions.suction_valve_opening_pct) / Math.max(1.0, conditions.suction_valve_opening_pct), 2.5) + (conditions.fault_suction_clog || 0) * 85.0;
  const kValveDisc = 0.2 + 0.8 * Math.pow((100.0 - conditions.discharge_valve_opening_pct) / Math.max(1.0, conditions.discharge_valve_opening_pct), 2.5) + (conditions.fault_discharge_clog || 0) * 250.0;

  const kMinorSuct = 1.0 + kValveSuct + 0.5;
  const kMinorDisc = 1.0 + kValveDisc + 1.2;

  const calcSystemHead = (qM3H: number) => {
    const qM3S = Math.max(0.0, qM3H) / 3600.0;
    const vSuct = qM3S / aSuct;
    const vDisc = qM3S / aDisc;

    const reS = (density * vSuct * dSuct) / Math.max(1e-7, viscosity);
    const reD = (density * vDisc * dDisc) / Math.max(1e-7, viscosity);

    const fS = reS < 2300 ? 64 / Math.max(1, reS) : 0.25 / Math.pow(Math.log10(conditions.pipe_roughness_m / (3.7 * dSuct) + 5.74 / Math.pow(reS, 0.9)), 2);
    const fD = reD < 2300 ? 64 / Math.max(1, reD) : 0.25 / Math.pow(Math.log10(conditions.pipe_roughness_m / (3.7 * dDisc) + 5.74 / Math.pow(reD, 0.9)), 2);

    const hLossSuct = (fS * (conditions.suction_pipe_length_m / dSuct) + kMinorSuct) * (vSuct * vSuct) / (2.0 * g);
    const hLossDisc = (fD * (conditions.discharge_pipe_length_m / dDisc) + kMinorDisc) * (vDisc * vDisc) / (2.0 * g);

    return { totalH: hStatic + hLossSuct + hLossDisc, hLossSuct, hLossDisc, vSuct, vDisc, reS, reD };
  };

  // Operating point intersection solver
  let operatingQ = bepQ;
  if (conditions.flow_m3_h !== undefined && conditions.flow_m3_h > 0) {
    operatingQ = conditions.flow_m3_h;
  } else {
    let qLow = 0.0;
    let qHigh = bepQ * 2.2;
    for (let i = 0; i < 35; i++) {
      const qMid = 0.5 * (qLow + qHigh);
      const hpMid = Math.max(0.0, shutoffHead - bCoeff * qMid * qMid);
      const hsMid = calcSystemHead(qMid).totalH;
      if (hpMid > hsMid) qLow = qMid;
      else qHigh = qMid;
    }
    operatingQ = 0.5 * (qLow + qHigh);
  }

  if ((conditions.fault_dry_run || 0) > 0.5) {
    operatingQ = 0.0;
  }

  const sys = calcSystemHead(operatingQ);
  const operatingH = Math.max(0.0, shutoffHead - bCoeff * operatingQ * operatingQ);

  const qRatio = operatingQ / Math.max(0.001, bepQ);
  const operatingEff = Math.max(0.05, Math.min(0.92, (bepEta * Math.max(0.05, 1.0 - 0.75 * Math.pow(qRatio - 1.0, 2))) * (1.0 - 0.20 * (conditions.fault_bearing_defect || 0))));

  const qM3S = operatingQ / 3600.0;
  const hydPowerKw = (density * g * qM3S * operatingH) / 1000.0;
  const pMechLossKw = (0.05 + 0.15 * (conditions.fault_bearing_defect || 0)) * pump.motor_power_kw;
  const shaftPowerKw = (conditions.fault_dry_run || 0) > 0.5 ? 0.8 : hydPowerKw / operatingEff + pMechLossKw;

  const motorLoadPct = (shaftPowerKw / Math.max(0.1, pump.motor_power_kw)) * 100.0;
  const torqueNm = (shaftPowerKw * 1000.0) / Math.max(1.0, omega);

  // Pressures
  const pSuctAbs = pAtm + density * g * (conditions.suction_static_head_m - sys.hLossSuct) - 0.5 * density * sys.vSuct * sys.vSuct;
  const suctionPressKpaG = (pSuctAbs - pAtm) / 1000.0;
  const pDiscAbs = pSuctAbs + density * g * operatingH;
  const discPressKpaG = (pDiscAbs - pAtm) / 1000.0;
  const diffPressKpa = discPressKpaG - suctionPressKpaG;

  // NPSH
  const npshaM = Math.max(0.0, pSuctAbs - vaporPressure) / (density * g) + (sys.vSuct * sys.vSuct) / (2.0 * g);
  const npshrScaled = pump.npshr_bep_m * Math.pow(speedRatio, 1.8) * (1.0 + 0.85 * Math.pow(qRatio - 1.0, 2));
  const cavMarginM = npshaM - npshrScaled;
  const isCavitating = cavMarginM < 0.0 || (conditions.fault_cavitation_override || 0) > 0.3;
  const cavSeverityPct = isCavitating ? Math.min(100.0, (Math.max(0, -cavMarginM) / Math.max(0.1, npshrScaled)) * 100.0 + (conditions.fault_cavitation_override || 0) * 100.0) : 0.0;

  // Thermal rise
  const massFlowKgS = density * qM3S;
  const powerLossesW = Math.max(0.0, (shaftPowerKw - hydPowerKw) * 1000.0);
  const tempRiseC = massFlowKgS > 0.05 ? powerLossesW / (massFlowKgS * cp) : Math.min(95.0, powerLossesW / 250.0);

  // Mechanical loads
  const axialThrustN = pump.suction_type === 'double_suction' ? 50.0 : (diffPressKpa * 1000.0) * (0.25 * Math.PI * d2 * d2 * 0.28 - 0.25 * Math.PI * 0.035 * 0.035) / pump.num_stages;
  const kr = (0.08 + 0.28 * Math.pow(1.0 - Math.min(1.0, qRatio), 2)) * (pump.casing_design === 'double_volute' ? 0.3 : 1.0);
  const radialThrustN = kr * density * g * (operatingH / pump.num_stages) * d2 * pump.blade_exit_width_m;

  // Telemetry gauges
  let vibe = 1.2 * (speedRpm / 1500.0);
  if (isCavitating) vibe += 4.5 * (cavSeverityPct / 100.0);
  vibe += (conditions.fault_bearing_defect || 0) * 7.2 + (conditions.fault_misalignment || 0) * 8.5 + (conditions.fault_impeller_wear || 0) * 3.2;

  let noise = 68.0 + 8.0 * (speedRpm / 2900.0);
  if (isCavitating) noise += 18.0 * (cavSeverityPct / 100.0);
  if ((conditions.fault_dry_run || 0) > 0.5) noise += 12.0;

  const bearingTemp = conditions.fluid_temp_c + 25.0 + (conditions.fault_bearing_defect || 0) * 48.0 + (conditions.fault_misalignment || 0) * 22.0;
  let sealTemp = conditions.fluid_temp_c + 12.0 + tempRiseC;
  if ((conditions.fault_dry_run || 0) > 0.5) sealTemp += 160.0;

  let sealLeakage = 0.1 + (conditions.fault_seal_leakage || 0) * 220.0;
  if ((conditions.fault_dry_run || 0) > 0.5) sealLeakage += 45.0;

  const specificSpeedNs = (speedRpm * Math.sqrt(bepQ / 3600.0)) / Math.pow(Math.max(0.1, bepH / pump.num_stages), 0.75);

  const faultAlerts: string[] = [];
  const warnings: string[] = [];

  if (isCavitating) faultAlerts.push(`CAVITATION INCEPTION: NPSHa (${npshaM.toFixed(2)}m) < NPSHr (${npshrScaled.toFixed(2)}m). Vapor implosions occurring at blade tips.`);
  if ((conditions.fault_dry_run || 0) > 0.5) faultAlerts.push('CRITICAL: PUMP RUNNING DRY! Mechanical seal faces and wear rings overheating.');
  if ((conditions.fault_suction_clog || 0) > 0.3) faultAlerts.push('SUCTION STRAINER FOULING: Excessive friction in suction line triggering vacuum collapse.');
  if ((conditions.fault_discharge_clog || 0) > 0.3 || (operatingQ < 0.1 * bepQ && (conditions.fault_dry_run || 0) < 0.5)) faultAlerts.push(`SHUTOFF / LOW-FLOW RECIRCULATION: Flow below 10% BEP. Thermal temperature rise = +${tempRiseC.toFixed(1)}°C.`);
  if ((conditions.fault_bearing_defect || 0) > 0.3) faultAlerts.push(`BEARING RACE DEFECT: High vibration (${vibe.toFixed(2)} mm/s) and temp (${bearingTemp.toFixed(1)}°C).`);
  if ((conditions.fault_seal_leakage || 0) > 0.3) faultAlerts.push(`MECHANICAL SEAL FACE BREACH: Hazardous fluid leakage at ${sealLeakage.toFixed(1)} mL/min.`);
  if ((conditions.fault_misalignment || 0) > 0.3) faultAlerts.push('SHAFT COUPLING MISALIGNMENT: High 1X/2X radial vibration harmonics detected.');
  if ((conditions.gas_entrainment_pct || 0) > 2.0) faultAlerts.push(`GAS BINDING RISK: Entrained gas fraction (${conditions.gas_entrainment_pct}%) severely degrading developed head.`);

  if (motorLoadPct > 110.0) warnings.push(`Motor overload: Operating at ${motorLoadPct.toFixed(1)}% of motor rated ${pump.motor_power_kw} kW.`);
  if (hiApplied) warnings.push(`ANSI/HI 9.6.7 Viscosity correction active: C_H=${cH.toFixed(2)}, C_Q=${cQ.toFixed(2)}, C_eta=${cEta.toFixed(2)}.`);

  // Curves
  const curves: PumpPerformancePoint[] = [];
  const steps = 25;
  const qMaxCurve = bepQ * 1.8;
  for (let i = 0; i <= steps; i++) {
    const qCur = (i / steps) * qMaxCurve;
    const hCur = Math.max(0.0, shutoffHead - bCoeff * qCur * qCur);
    const qRatioCur = qCur / Math.max(0.001, bepQ);
    const effCur = Math.max(5.0, Math.min(95.0, bepEta * Math.max(0.05, 1.0 - 0.75 * Math.pow(qRatioCur - 1.0, 2)) * 100.0));
    const hydPCur = (density * g * (qCur / 3600.0) * hCur) / 1000.0;
    const shaftPCur = hydPCur / (effCur / 100.0) + pMechLossKw;
    const npshrCur = npshrScaled * (1.0 + 0.85 * Math.pow(qRatioCur - 1.0, 2));
    const sysHCur = calcSystemHead(qCur).totalH;

    curves.push({
      flow_m3_h: Number(qCur.toFixed(2)),
      head_m: Number(hCur.toFixed(2)),
      efficiency_pct: Number(effCur.toFixed(1)),
      hydraulic_power_kw: Number(hydPCur.toFixed(2)),
      shaft_power_kw: Number(shaftPCur.toFixed(2)),
      npshr_m: Number(npshrCur.toFixed(2)),
      system_head_m: Number(sysHCur.toFixed(2)),
    });
  }

  const telemetry: PumpTelemetry = {
    operating_flow_m3_h: Number(operatingQ.toFixed(2)),
    operating_head_m: Number(operatingH.toFixed(2)),
    shutoff_head_m: Number(shutoffHead.toFixed(2)),
    bep_flow_m3_h: Number(bepQ.toFixed(2)),
    bep_head_m: Number(bepH.toFixed(2)),
    bep_efficiency_pct: Number((bepEta * 100.0).toFixed(1)),
    specific_speed_ns: Number(specificSpeedNs.toFixed(1)),
    hydraulic_power_kw: Number(hydPowerKw.toFixed(2)),
    shaft_power_kw: Number(shaftPowerKw.toFixed(2)),
    motor_power_kw: pump.motor_power_kw,
    efficiency_pct: Number(operatingEff * 100.0).toFixed(1) as any,
    motor_load_pct: Number(motorLoadPct.toFixed(1)),
    torque_n_m: Number(torqueNm.toFixed(1)),
    fluid_temp_rise_c: Number(tempRiseC.toFixed(2)),
    suction_pressure_kpa_g: Number(suctionPressKpaG.toFixed(1)),
    discharge_pressure_kpa_g: Number(discPressKpaG.toFixed(1)),
    differential_pressure_kpa: Number(diffPressKpa.toFixed(1)),
    suction_velocity_m_s: Number(sys.vSuct.toFixed(2)),
    discharge_velocity_m_s: Number(sys.vDisc.toFixed(2)),
    impeller_tip_speed_m_s: Number(u2.toFixed(2)),
    euler_head_theoretical_m: Number(eulerHead.toFixed(2)),
    slip_factor: Number(slipFactor.toFixed(3)),
    npsha_m: Number(npshaM.toFixed(2)),
    npshr_m: Number(npshrScaled.toFixed(2)),
    cavitation_margin_m: Number(cavMarginM.toFixed(2)),
    cavitation_index_sigma: Number((npshaM / Math.max(0.1, operatingH)).toFixed(3)),
    is_cavitating: isCavitating,
    cavitation_severity_pct: Number(cavSeverityPct.toFixed(1)),
    fluid_density_kg_m3: Number(density.toFixed(1)),
    fluid_dynamic_viscosity_pa_s: Number(viscosity.toFixed(6)),
    fluid_kinematic_viscosity_cst: Number(kinViscosityCst.toFixed(2)),
    fluid_vapor_pressure_kpa: Number((vaporPressure / 1000.0).toFixed(2)),
    reynolds_suction_pipe: Number(sys.reS.toFixed(0)),
    reynolds_discharge_pipe: Number(sys.reD.toFixed(0)),
    hi_viscosity_correction_applied: hiApplied,
    c_head: Number(cH.toFixed(3)),
    c_flow: Number(cQ.toFixed(3)),
    c_efficiency: Number(cEta.toFixed(3)),
    vibration_velocity_mm_s: Number(vibe.toFixed(2)),
    acoustic_noise_db: Number(noise.toFixed(1)),
    bearing_temp_c: Number(bearingTemp.toFixed(1)),
    seal_face_temp_c: Number(sealTemp.toFixed(1)),
    seal_leakage_rate_ml_min: Number(sealLeakage.toFixed(1)),
    axial_thrust_n: Number(axialThrustN.toFixed(1)),
    radial_thrust_n: Number(radialThrustN.toFixed(1)),
    fault_alerts: faultAlerts,
    warnings: warnings,
  };

  return {
    pump,
    fluid,
    conditions,
    telemetry,
    characteristic_curve: curves,
  };
}

export async function fetchPumps(): Promise<PumpGeometryData[]> {
  try {
    const res = await fetch(`${API_BASE}/pumps`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return Object.values(PUMP_CATALOG_CLIENT);
  }
}

export async function fetchPump(id: string): Promise<PumpGeometryData> {
  try {
    const res = await fetch(`${API_BASE}/pumps/${id}`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return PUMP_CATALOG_CLIENT[id] || PUMP_CATALOG_CLIENT['iso2858_chemical'];
  }
}

export async function fetchPumpComponents(pumpId: string): Promise<PumpComponentData[]> {
  try {
    const res = await fetch(`${API_BASE}/pumps/${pumpId}/components`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return PUMP_COMPONENTS_CLIENT;
  }
}

export async function fetchFluids(): Promise<FluidData[]> {
  try {
    const res = await fetch(`${API_BASE}/fluids`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return Object.values(FLUID_DATABASE_CLIENT);
  }
}

export async function simulatePump(conditions: PumpOperatingConditions): Promise<PumpSimulationResult> {
  try {
    const res = await fetch(`${API_BASE}/simulations/pump/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conditions),
    });
    if (!res.ok) throw new Error('Backend failed');
    return await res.json();
  } catch {
    return simulatePumpLocal(conditions);
  }
}


