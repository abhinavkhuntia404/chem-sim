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
