"""
Pydantic models for API request/response validation.
"""

from __future__ import annotations
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict


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
