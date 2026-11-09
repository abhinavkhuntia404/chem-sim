/**
 * TypeScript type definitions for CHEM-SIM
 */

export interface ComponentData {
  name: string;
  formula: string;
  cas_number: string;
  molecular_weight: number;
  normal_boiling_point_K: number;
  critical_temperature_K: number;
  critical_pressure_bar: number;
  acentric_factor: number;
  heat_of_vaporization_kJ_mol: number;
}

export interface UnitConversionResult {
  value: number;
  from_unit: string;
  to_unit: string;
  result: number;
}

export interface EquilibriumCurvePoint {
  x: number;
  y: number;
  T_C: number;
  alpha: number;
}

export interface StageData {
  stage_number: number;
  x: number;
  y: number;
  T_C: number;
  section: string;
}

export interface OperatingLine {
  slope: number;
  intercept: number;
  x_range: [number, number];
}

export interface DistillationSimulationResult {
  num_theoretical_stages: number;
  feed_stage: number;
  min_reflux_ratio?: number;
  reflux_ratio: number;
  distillate_flow: number;
  bottoms_flow: number;
  rectifying_liquid: number;
  rectifying_vapor: number;
  stripping_liquid: number;
  stripping_vapor: number;
  condenser_duty_kW?: number;
  reboiler_duty_kW?: number;
  feed_balance_residual: number;
  component_balance_residual: number;
  converged: boolean;
  warnings: string[];
  assumptions: string[];
  rectifying_line: OperatingLine;
  stripping_line: OperatingLine;
  q_line_slope?: number;
  q_line_intercept?: number;
  intersection_x: number;
  intersection_y: number;
  equilibrium_curve: EquilibriumCurvePoint[];
  stages: StageData[];
}

export interface HeatExchangerResult {
  hot_inlet_T_C: number;
  hot_outlet_T_C: number;
  cold_inlet_T_C: number;
  cold_outlet_T_C: number;
  duty_W: number;
  hot_duty_W: number;
  cold_duty_W: number;
  energy_balance_residual_W: number;
  delta_T_1: number;
  delta_T_2: number;
  LMTD_C: number;
  flow_arrangement: string;
  UA_W_K?: number;
  U_W_m2K?: number;
  area_m2?: number;
  min_approach_C: number;
  feasible: boolean;
  calc_type: string;
  warnings: string[];
  assumptions: string[];
  hot_profile: [number, number][];
  cold_profile: [number, number][];
}

export interface ReactorResult {
  reactor_type: string;
  conversion: number;
  exit_concentrations: Record<string, number>;
  volume_m3?: number;
  residence_time_s?: number;
  rate_at_exit?: number;
  rate_constant: number;
  warnings: string[];
  assumptions: string[];
}

// ---------------------------------------------------------------------------
// Fluidisation Module & Mechanical Operations Types
// ---------------------------------------------------------------------------

export interface FluidisationPreset {
  id: string;
  name: string;
  particle_name: string;
  gas_name: string;
  particle_diameter_mm: number;
  particle_density_kg_m3: number;
  gas_density_kg_m3: number;
  gas_viscosity_Pa_s: number;
  initial_bed_height_m: number;
  initial_voidage: number;
  sphericity: number;
  nominal_velocity_m_s: number;
  description: string;
}

export interface FluidisationParameters {
  gas_velocity_m_s: number;
  particle_diameter_m: number;
  particle_density_kg_m3: number;
  gas_density_kg_m3: number;
  gas_viscosity_Pa_s: number;
  initial_bed_height_m: number;
  column_diameter_m?: number;
  initial_voidage?: number;
  sphericity?: number;
  distributor_open_ratio?: number;
  distributor_Cd?: number;
  include_curves?: boolean;
  curve_points?: number;
}

export interface FluidisationCurvePoint {
  gas_velocity_m_s: number;
  bed_pressure_drop_Pa: number;
  total_pressure_drop_Pa: number;
  distributor_pressure_drop_Pa: number;
  ergun_theoretical_Pa: number;
  expanded_bed_height_m: number;
  expanded_voidage: number;
  bubble_fraction: number;
  is_fluidised: number;
  reynolds_number: number;
}

export interface FluidisationSimulationResult {
  archimedes_number: number;
  reynolds_number: number;
  reynolds_number_mf: number;
  u_mf_wen_yu_m_s: number;
  u_mf_ergun_m_s: number;
  u_mf_design_m_s: number;
  terminal_velocity_m_s: number;
  reynolds_terminal: number;

  // Pressure drops (Pa)
  bed_pressure_drop_Pa: number;
  distributor_pressure_drop_Pa: number;
  total_pressure_drop_Pa: number;
  ergun_viscous_Pa: number;
  ergun_inertial_Pa: number;
  theoretical_max_bed_dp_Pa: number;

  // Bed hydrodynamics
  expanded_bed_height_m: number;
  expanded_voidage: number;
  bed_expansion_ratio: number;
  bubble_fraction: number;
  estimated_bubble_diameter_m: number;

  // Classification & Regimes
  geldart_group: string;
  geldart_description: string;
  regime: string;
  regime_description: string;
  is_fluidised: boolean;
  is_entrained: boolean;

  // Operational metrics
  velocity_ratio: number;
  dimensionless_velocity: number;
  richardson_zaki_index: number;
  warnings: string[];
  characteristic_curves?: FluidisationCurvePoint[];
}

export interface ObservationPoint {
  id: string;
  timestamp: string;
  velocity_m_s: number;
  bed_pressure_drop_Pa: number;
  total_pressure_drop_Pa: number;
  bed_height_m: number;
  voidage: number;
  regime: string;
  reynolds_number: number;
}

// ---------------------------------------------------------------------------
// Centrifugal Pump Digital Twin Types
// ---------------------------------------------------------------------------

export interface PumpGeometryData {
  id: string;
  name: string;
  pump_type: string;
  impeller_construction: string;
  casing_design: string;
  suction_type: string;
  installation_type: string;
  num_stages: number;
  rated_speed_rpm: number;
  impeller_diameter_m: number;
  impeller_eye_diameter_m: number;
  blade_exit_width_m: number;
  blade_exit_angle_deg: number;
  blade_count: number;
  rated_flow_m3_h: number;
  rated_head_m: number;
  rated_efficiency: number;
  npshr_bep_m: number;
  motor_power_kw: number;
  casing_material: string;
  impeller_material: string;
  seal_type: string;
  description: string;
}

export interface PumpComponentData {
  id: string;
  name: string;
  category: string;
  material: string;
  function: string;
  working_principle: string;
  failure_modes: string[];
  maintenance_procedure: string;
  exploded_offset: [number, number, number];
}

export interface FluidData {
  id: string;
  name: string;
  category: string;
  base_density: number;
  base_viscosity_pa_s: number;
  base_vapor_pressure_pa: number;
  specific_heat_j_kg_k: number;
  thermal_cond_w_m_k: number;
  rheology_model: string;
  power_law_k: number;
  power_law_n: number;
  yield_stress_pa: number;
  solids_volume_fraction: number;
  solids_particle_um: number;
  description: string;
}

export interface PumpOperatingConditions {
  pump_id: string;
  fluid_id: string;
  fluid_temp_c: number;
  speed_rpm: number;
  flow_m3_h?: number;
  suction_static_head_m: number;
  discharge_static_head_m: number;
  suction_pipe_dia_m: number;
  suction_pipe_length_m: number;
  discharge_pipe_dia_m: number;
  discharge_pipe_length_m: number;
  suction_valve_opening_pct: number;
  discharge_valve_opening_pct: number;
  pipe_roughness_m: number;
  impeller_diameter_m?: number;
  fault_cavitation_override?: number;
  fault_dry_run?: number;
  fault_suction_clog?: number;
  fault_discharge_clog?: number;
  fault_impeller_wear?: number;
  fault_bearing_defect?: number;
  fault_seal_leakage?: number;
  fault_misalignment?: number;
  gas_entrainment_pct?: number;
}

export interface PumpPerformancePoint {
  flow_m3_h: number;
  head_m: number;
  efficiency_pct: number;
  hydraulic_power_kw: number;
  shaft_power_kw: number;
  npshr_m: number;
  system_head_m: number;
}

export interface PumpTelemetry {
  operating_flow_m3_h: number;
  operating_head_m: number;
  shutoff_head_m: number;
  bep_flow_m3_h: number;
  bep_head_m: number;
  bep_efficiency_pct: number;
  specific_speed_ns: number;
  hydraulic_power_kw: number;
  shaft_power_kw: number;
  motor_power_kw: number;
  efficiency_pct: number;
  motor_load_pct: number;
  torque_n_m: number;
  fluid_temp_rise_c: number;
  suction_pressure_kpa_g: number;
  discharge_pressure_kpa_g: number;
  differential_pressure_kpa: number;
  suction_velocity_m_s: number;
  discharge_velocity_m_s: number;
  impeller_tip_speed_m_s: number;
  euler_head_theoretical_m: number;
  slip_factor: number;
  npsha_m: number;
  npshr_m: number;
  cavitation_margin_m: number;
  cavitation_index_sigma: number;
  is_cavitating: boolean;
  cavitation_severity_pct: number;
  fluid_density_kg_m3: number;
  fluid_dynamic_viscosity_pa_s: number;
  fluid_kinematic_viscosity_cst: number;
  fluid_vapor_pressure_kpa: number;
  reynolds_suction_pipe: number;
  reynolds_discharge_pipe: number;
  hi_viscosity_correction_applied: boolean;
  c_head: number;
  c_flow: number;
  c_efficiency: number;
  vibration_velocity_mm_s: number;
  acoustic_noise_db: number;
  bearing_temp_c: number;
  seal_face_temp_c: number;
  seal_leakage_rate_ml_min: number;
  axial_thrust_n: number;
  radial_thrust_n: number;
  fault_alerts: string[];
  warnings: string[];
}

export interface PumpSimulationResult {
  pump: PumpGeometryData;
  fluid: FluidData;
  conditions: PumpOperatingConditions;
  telemetry: PumpTelemetry;
  characteristic_curve: PumpPerformancePoint[];
}

export interface ExperimentObservationLog {
  id: string;
  stepName: string;
  timestamp: string;
  speed_rpm: number;
  flow_m3_h: number;
  head_m: number;
  efficiency_pct: number;
  power_kw: number;
  npsha_m: number;
  npshr_m: number;
  cavitating: boolean;
  vibration_mm_s: number;
  notes: string;
}

export interface PumpExperimentDefinition {
  id: string;
  code: string; // e.g. "EXP-01"
  title: string;
  objective: string;
  theory: string;
  apparatus: string;
  procedureSteps: string[];
  discussionQuestions: { q: string; a: string }[];
  defaultConditions: Partial<PumpOperatingConditions>;
  variations: { label: string; conditions: Partial<PumpOperatingConditions> }[];
}


