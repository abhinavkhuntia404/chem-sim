"""
Pydantic models for API request/response validation.
"""

from __future__ import annotations
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any


# ---------------------------------------------------------------------------
# Unit Conversion
# ---------------------------------------------------------------------------

class UnitConversionRequest(BaseModel):
    value: float
    from_unit: str
    to_unit: str


class UnitConversionResponse(BaseModel):
    value: float
    from_unit: str
    to_unit: str
    result: float


# ---------------------------------------------------------------------------
# Component Properties
# ---------------------------------------------------------------------------

class ComponentInfo(BaseModel):
    name: str
    formula: str
    cas_number: str
    molecular_weight: float
    normal_boiling_point_K: float
    critical_temperature_K: float
    critical_pressure_bar: float
    acentric_factor: float
    heat_of_vaporization_kJ_mol: float


class SaturationPressureRequest(BaseModel):
    component: str
    temperature_C: float


class SaturationPressureResponse(BaseModel):
    component: str
    temperature_C: float
    pressure_mmHg: float
    pressure_kPa: float
    antoine_valid: bool


# ---------------------------------------------------------------------------
# VLE / Thermodynamics
# ---------------------------------------------------------------------------

class BubblePointRequest(BaseModel):
    components: List[str] = Field(min_length=2, max_length=2)
    liquid_composition: List[float] = Field(min_length=2, max_length=2)
    pressure_kPa: float = Field(gt=0)

    @field_validator("liquid_composition")
    @classmethod
    def validate_composition(cls, v):
        if abs(sum(v) - 1.0) > 0.01:
            raise ValueError(f"Compositions must sum to 1.0, got {sum(v):.4f}")
        return v


class DewPointRequest(BaseModel):
    components: List[str] = Field(min_length=2, max_length=2)
    vapor_composition: List[float] = Field(min_length=2, max_length=2)
    pressure_kPa: float = Field(gt=0)

    @field_validator("vapor_composition")
    @classmethod
    def validate_composition(cls, v):
        if abs(sum(v) - 1.0) > 0.01:
            raise ValueError(f"Compositions must sum to 1.0, got {sum(v):.4f}")
        return v


class VLEResponse(BaseModel):
    temperature_C: float
    pressure_kPa: float
    x: List[float]
    y: List[float]
    K: List[float]
    alpha: float
    P_sat_kPa: List[float]
    converged: bool
    message: str


class EquilibriumCurveResponse(BaseModel):
    components: List[str]
    pressure_kPa: float
    points: List[Dict[str, float]]  # [{x, y, T_C, alpha}, ...]


# ---------------------------------------------------------------------------
# Distillation
# ---------------------------------------------------------------------------

class DistillationRequest(BaseModel):
    light_component: str = "benzene"
    heavy_component: str = "toluene"
    feed_flow_mol_s: float = Field(gt=0, default=100.0)
    feed_composition: float = Field(gt=0, lt=1, default=0.5)
    feed_q: float = Field(default=1.0)
    pressure_kPa: float = Field(gt=0, default=101.325)
    distillate_composition: float = Field(gt=0, lt=1, default=0.95)
    bottoms_composition: float = Field(gt=0, lt=1, default=0.05)
    reflux_ratio: float = Field(gt=0, default=2.0)
    condenser_type: str = "total"
    reboiler_type: str = "partial"


class StageDataResponse(BaseModel):
    stage_number: int
    x: float
    y: float
    T_C: float
    section: str


class OperatingLineResponse(BaseModel):
    slope: float
    intercept: float
    x_range: List[float]


class DistillationResponse(BaseModel):
    # Configuration echo
    light_component: str
    heavy_component: str

    # Operating lines
    rectifying_line: OperatingLineResponse
    stripping_line: OperatingLineResponse
    q_line_slope: Optional[float]
    q_line_intercept: Optional[float]
    intersection_x: float
    intersection_y: float

    # Equilibrium curve
    equilibrium_curve: List[Dict[str, float]]

    # Stages
    stages: List[StageDataResponse]
    num_theoretical_stages: int
    feed_stage: int

    # Flows
    feed_flow: float
    distillate_flow: float
    bottoms_flow: float
    reflux_ratio: float
    min_reflux_ratio: Optional[float]

    # Energy
    condenser_duty_kW: Optional[float]
    reboiler_duty_kW: Optional[float]

    # Balance
    feed_balance_residual: float
    component_balance_residual: float

    # Recovery
    recovery: float
    distillate_purity: float
    bottoms_purity: float

    # Diagnostics
    converged: bool
    warnings: List[str]
    assumptions: List[str]


# ---------------------------------------------------------------------------
# Material Balance
# ---------------------------------------------------------------------------

class StreamInput(BaseModel):
    name: str
    components: List[str]
    flow: Optional[float] = None
    composition: Optional[List[Optional[float]]] = None
    temperature_C: Optional[float] = None
    pressure_kPa: Optional[float] = None
    phase: Optional[str] = None
    basis: str = "molar"


class ReactionInput(BaseModel):
    stoichiometry: Dict[str, float]
    extent: Optional[float] = None
    conversion: Optional[float] = None
    limiting_reactant: Optional[str] = None


class MaterialBalanceRequest(BaseModel):
    unit_name: str = "Unit-1"
    unit_type: str = "generic"
    inlets: List[StreamInput]
    outlets: List[StreamInput]
    reactions: List[ReactionInput] = []
    basis: str = "molar"


class MaterialBalanceResponse(BaseModel):
    unit_name: str
    solved: bool
    streams: Dict[str, StreamInput]
    dof_unknowns: int
    dof_equations: int
    dof: int
    dof_status: str
    overall_residual: float
    component_residuals: Dict[str, float]
    relative_closure: float
    equations_used: List[str]
    warnings: List[str]


# ---------------------------------------------------------------------------
# Energy Balance
# ---------------------------------------------------------------------------

class EnergyBalanceRequest(BaseModel):
    unit_name: str = "Unit-1"
    inlet_components: List[str]
    inlet_flows_mol_s: List[float]
    inlet_temperatures_C: List[float]
    inlet_phases: List[str]
    outlet_components: List[str]
    outlet_flows_mol_s: List[float]
    outlet_temperatures_C: List[float]
    outlet_phases: List[str]
    work_W: float = 0.0


class StreamEnthalpyResponse(BaseModel):
    component: str
    flow_mol_s: float
    T_C: float
    phase: str
    h_J_mol: float
    H_dot_W: float


class EnergyBalanceResponse(BaseModel):
    unit_name: str
    H_in_W: float
    H_out_W: float
    Q_dot_W: float
    W_dot_W: float
    residual_W: float
    relative_closure: float
    inlet_enthalpies: List[StreamEnthalpyResponse]
    outlet_enthalpies: List[StreamEnthalpyResponse]
    solved: bool
    assumptions: List[str]
    warnings: List[str]


# ---------------------------------------------------------------------------
# Heat Exchanger
# ---------------------------------------------------------------------------

class HeatExchangerRequest(BaseModel):
    hot_inlet_T_C: float
    hot_outlet_T_C: Optional[float] = None
    hot_flow_kg_s: Optional[float] = None
    hot_Cp_J_kgK: Optional[float] = None
    cold_inlet_T_C: float
    cold_outlet_T_C: Optional[float] = None
    cold_flow_kg_s: Optional[float] = None
    cold_Cp_J_kgK: Optional[float] = None
    flow_arrangement: str = "countercurrent"
    U_W_m2K: Optional[float] = None
    area_m2: Optional[float] = None
    duty_W: Optional[float] = None


class HeatExchangerResponse(BaseModel):
    hot_inlet_T_C: float
    hot_outlet_T_C: float
    cold_inlet_T_C: float
    cold_outlet_T_C: float
    duty_W: float
    hot_duty_W: float
    cold_duty_W: float
    energy_balance_residual_W: float
    delta_T_1: float
    delta_T_2: float
    LMTD_C: float
    flow_arrangement: str
    UA_W_K: Optional[float]
    U_W_m2K: Optional[float]
    area_m2: Optional[float]
    min_approach_C: float
    feasible: bool
    calc_type: str
    warnings: List[str]
    assumptions: List[str]
    hot_profile: List[List[float]]
    cold_profile: List[List[float]]


# ---------------------------------------------------------------------------
# Reactor
# ---------------------------------------------------------------------------

class StoichiometryRequest(BaseModel):
    reaction_name: str = "Reaction-1"
    stoichiometry: Dict[str, float]
    feed_moles: Dict[str, float]
    conversion: Optional[float] = None


class StoichiometryResponse(BaseModel):
    limiting_reactant: str
    excess_reactants: Dict[str, float]
    max_extent: float
    theoretical_yield: Dict[str, float]
    conversion: float
    actual_product_moles: Optional[Dict[str, float]]
    warnings: List[str]


class ReactorRequest(BaseModel):
    reactor_type: str = "CSTR"  # "batch", "CSTR", "PFR"
    C_A0: float = Field(gt=0)
    k: float = Field(gt=0)
    tau_s: Optional[float] = None
    target_conversion: Optional[float] = None
    volume_m3: Optional[float] = None
    volumetric_flow_m3_s: Optional[float] = None
    order: int = 1


class ReactorResponse(BaseModel):
    reactor_type: str
    conversion: float
    exit_concentrations: Dict[str, float]
    volume_m3: Optional[float]
    residence_time_s: Optional[float]
    rate_at_exit: Optional[float]
    rate_constant: float
    warnings: List[str]
    assumptions: List[str]


# ---------------------------------------------------------------------------
# Fluidisation & Mechanical Operations
# ---------------------------------------------------------------------------

class FluidisationRequest(BaseModel):
    gas_velocity_m_s: float = Field(ge=0.0, default=0.25)
    particle_diameter_m: float = Field(gt=0.0, default=0.0005)
    particle_density_kg_m3: float = Field(gt=0.0, default=2500.0)
    gas_density_kg_m3: float = Field(gt=0.0, default=1.205)
    gas_viscosity_Pa_s: float = Field(gt=0.0, default=1.82e-5)
    initial_bed_height_m: float = Field(gt=0.0, default=0.40)
    column_diameter_m: float = Field(gt=0.0, default=0.10)
    initial_voidage: float = Field(ge=0.20, le=0.85, default=0.40)
    sphericity: float = Field(ge=0.20, le=1.0, default=1.0)
    distributor_open_ratio: float = Field(ge=0.005, le=0.5, default=0.04)
    distributor_Cd: float = Field(ge=0.2, le=1.0, default=0.62)
    include_curves: bool = True
    curve_points: int = 50


class FluidisationCurvePoint(BaseModel):
    gas_velocity_m_s: float
    bed_pressure_drop_Pa: float
    total_pressure_drop_Pa: float
    distributor_pressure_drop_Pa: float
    ergun_theoretical_Pa: float
    expanded_bed_height_m: float
    expanded_voidage: float
    bubble_fraction: float
    is_fluidised: float
    reynolds_number: float


class FluidisationResponse(BaseModel):
    archimedes_number: float
    reynolds_number: float
    reynolds_number_mf: float
    u_mf_wen_yu_m_s: float
    u_mf_ergun_m_s: float
    u_mf_design_m_s: float
    terminal_velocity_m_s: float
    reynolds_terminal: float

    # Pressure drops (Pa)
    bed_pressure_drop_Pa: float
    distributor_pressure_drop_Pa: float
    total_pressure_drop_Pa: float
    ergun_viscous_Pa: float
    ergun_inertial_Pa: float
    theoretical_max_bed_dp_Pa: float

    # Bed hydrodynamics
    expanded_bed_height_m: float
    expanded_voidage: float
    bed_expansion_ratio: float
    bubble_fraction: float
    estimated_bubble_diameter_m: float

    # Classification & Regimes
    geldart_group: str
    geldart_description: str
    regime: str
    regime_description: str
    is_fluidised: bool
    is_entrained: bool

    # Operational metrics
    velocity_ratio: float
    dimensionless_velocity: float
    richardson_zaki_index: float
    warnings: List[str]
    characteristic_curves: Optional[List[FluidisationCurvePoint]] = None


# ---------------------------------------------------------------------------
# Centrifugal Pump Digital Twin
# ---------------------------------------------------------------------------

class PumpOperatingConditionsRequest(BaseModel):
    pump_id: str = "iso2858_chemical"
    fluid_id: str = "water"
    fluid_temp_c: float = 20.0
    speed_rpm: float = 2900.0
    flow_m3_h: Optional[float] = None
    suction_static_head_m: float = 2.0
    discharge_static_head_m: float = 18.0
    suction_pipe_dia_m: float = 0.08
    suction_pipe_length_m: float = 8.0
    discharge_pipe_dia_m: float = 0.05
    discharge_pipe_length_m: float = 45.0
    suction_valve_opening_pct: float = 100.0
    discharge_valve_opening_pct: float = 80.0
    pipe_roughness_m: float = 0.000045
    impeller_diameter_m: Optional[float] = None
    fault_cavitation_override: float = 0.0
    fault_dry_run: float = 0.0
    fault_suction_clog: float = 0.0
    fault_discharge_clog: float = 0.0
    fault_impeller_wear: float = 0.0
    fault_bearing_defect: float = 0.0
    fault_seal_leakage: float = 0.0
    fault_misalignment: float = 0.0
    gas_entrainment_pct: float = 0.0


class PumpPerformancePointResponse(BaseModel):
    flow_m3_h: float
    head_m: float
    efficiency_pct: float
    hydraulic_power_kw: float
    shaft_power_kw: float
    npshr_m: float
    system_head_m: float


class PumpTelemetryResponse(BaseModel):
    operating_flow_m3_h: float
    operating_head_m: float
    shutoff_head_m: float
    bep_flow_m3_h: float
    bep_head_m: float
    bep_efficiency_pct: float
    specific_speed_ns: float
    hydraulic_power_kw: float
    shaft_power_kw: float
    motor_power_kw: float
    efficiency_pct: float
    motor_load_pct: float
    torque_n_m: float
    fluid_temp_rise_c: float
    suction_pressure_kpa_g: float
    discharge_pressure_kpa_g: float
    differential_pressure_kpa: float
    suction_velocity_m_s: float
    discharge_velocity_m_s: float
    impeller_tip_speed_m_s: float
    euler_head_theoretical_m: float
    slip_factor: float
    npsha_m: float
    npshr_m: float
    cavitation_margin_m: float
    cavitation_index_sigma: float
    is_cavitating: bool
    cavitation_severity_pct: float
    fluid_density_kg_m3: float
    fluid_dynamic_viscosity_pa_s: float
    fluid_kinematic_viscosity_cst: float
    fluid_vapor_pressure_kpa: float
    reynolds_suction_pipe: float
    reynolds_discharge_pipe: float
    hi_viscosity_correction_applied: bool
    c_head: float
    c_flow: float
    c_efficiency: float
    vibration_velocity_mm_s: float
    acoustic_noise_db: float
    bearing_temp_c: float
    seal_face_temp_c: float
    seal_leakage_rate_ml_min: float
    axial_thrust_n: float
    radial_thrust_n: float
    fault_alerts: List[str]
    warnings: List[str]


class PumpSimulationResponse(BaseModel):
    pump: Dict[str, Any]
    fluid: Dict[str, Any]
    conditions: Dict[str, Any]
    telemetry: PumpTelemetryResponse
    characteristic_curve: List[PumpPerformancePointResponse]


class CustomFluidRequest(BaseModel):
    id: str
    name: str
    category: str
    base_density: float
    base_viscosity_pa_s: float
    base_vapor_pressure_pa: float
    specific_heat_j_kg_k: float
    thermal_cond_w_m_k: float
    rheology_model: str = "newtonian"
    power_law_k: float = 0.0
    power_law_n: float = 1.0
    yield_stress_pa: float = 0.0
    solids_volume_fraction: float = 0.0
    solids_particle_um: float = 0.0
    description: str = ""


