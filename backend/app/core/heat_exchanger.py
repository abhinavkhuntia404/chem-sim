"""
Heat exchanger analysis tool.

Implements:
  - Countercurrent and cocurrent LMTD calculations.
  - Energy balance for hot and cold streams.
  - Overall heat transfer coefficient × area (UA) estimation.
  - Temperature profiles.
  - Pinch and minimum-approach diagnostics.
  - Rating vs. design calculation distinction.

LMTD for countercurrent flow:
  ΔT_lm = (ΔT_1 - ΔT_2) / ln(ΔT_1 / ΔT_2)

where:
  ΔT_1 = T_hot_in - T_cold_out
  ΔT_2 = T_hot_out - T_cold_in

For cocurrent flow:
  ΔT_1 = T_hot_in - T_cold_in
  ΔT_2 = T_hot_out - T_cold_out
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional, List, Tuple
import math


@dataclass
class HeatExchangerInput:
    """Input specification for heat exchanger analysis."""
    # Temperatures
    hot_inlet_T_C: float
    cold_inlet_T_C: float
    hot_outlet_T_C: Optional[float] = None
    hot_flow_kg_s: Optional[float] = None
    hot_Cp_J_kgK: Optional[float] = None  # mass-specific heat capacity

    # Cold stream
    cold_outlet_T_C: Optional[float] = None
    cold_flow_kg_s: Optional[float] = None
    cold_Cp_J_kgK: Optional[float] = None

    # Configuration
    flow_arrangement: str = "countercurrent"  # "countercurrent" or "cocurrent"

    # Optional: overall heat transfer coefficient
    U_W_m2K: Optional[float] = None
    area_m2: Optional[float] = None

    # Duty (if directly specified)
    duty_W: Optional[float] = None


@dataclass
class HeatExchangerResult:
    """Result of heat exchanger analysis."""
    # Temperatures
    hot_inlet_T_C: float
    hot_outlet_T_C: float
    cold_inlet_T_C: float
    cold_outlet_T_C: float

    # Energy
    duty_W: float             # Q > 0, heat transferred from hot to cold
    hot_duty_W: float         # Q = m_h * Cp_h * (T_h_in - T_h_out)
    cold_duty_W: float        # Q = m_c * Cp_c * (T_c_out - T_c_in)
    energy_balance_residual_W: float

    # LMTD
    delta_T_1: float
    delta_T_2: float
    LMTD_C: float
    flow_arrangement: str

    # UA
    UA_W_K: Optional[float] = None
    U_W_m2K: Optional[float] = None
    area_m2: Optional[float] = None

    # Diagnostics
    min_approach_C: float = 0.0
    feasible: bool = True
    calc_type: str = "rating"  # "rating" or "design"
    warnings: List[str] = field(default_factory=list)
    assumptions: List[str] = field(default_factory=list)

    # Temperature profile (for plotting)
    hot_profile: List[Tuple[float, float]] = field(default_factory=list)
    cold_profile: List[Tuple[float, float]] = field(default_factory=list)


def calculate_LMTD(
    T_hot_in: float,
    T_hot_out: float,
    T_cold_in: float,
    T_cold_out: float,
    arrangement: str = "countercurrent",
) -> Tuple[float, float, float]:
    """
    Calculate log mean temperature difference.

    Returns
    -------
    (LMTD, delta_T_1, delta_T_2)
    """
    if arrangement == "countercurrent":
        dT1 = T_hot_in - T_cold_out
        dT2 = T_hot_out - T_cold_in
    elif arrangement == "cocurrent":
        dT1 = T_hot_in - T_cold_in
        dT2 = T_hot_out - T_cold_out
    else:
        raise ValueError(f"Unknown arrangement: {arrangement}")

    if dT1 <= 0 or dT2 <= 0:
        # Temperature cross: infeasible
        return 0.0, dT1, dT2

    if abs(dT1 - dT2) < 1e-6:
        # Special case: dT1 ≈ dT2
        return dT1, dT1, dT2

    LMTD = (dT1 - dT2) / math.log(dT1 / dT2)
    return LMTD, dT1, dT2


def analyze_heat_exchanger(inp: HeatExchangerInput) -> HeatExchangerResult:
    """
    Perform heat exchanger analysis.

    Supports:
      1. Rating: Given all temperatures and flows, compute duty and LMTD.
      2. Design: Given duty and U, compute required area.

    Returns
    -------
    HeatExchangerResult
    """
    warnings = []
    assumptions = [
        "Steady-state operation.",
        "Constant heat capacities.",
        "No heat losses to surroundings.",
        "No phase change (sensible heat only).",
    ]
    calc_type = "rating"

    # --- Determine unknown temperatures from energy balance ---
    T_hi = inp.hot_inlet_T_C
    T_ho = inp.hot_outlet_T_C
    T_ci = inp.cold_inlet_T_C
    T_co = inp.cold_outlet_T_C

    m_h_Cp_h = None
    m_c_Cp_c = None

    if inp.hot_flow_kg_s is not None and inp.hot_Cp_J_kgK is not None:
        m_h_Cp_h = inp.hot_flow_kg_s * inp.hot_Cp_J_kgK
    if inp.cold_flow_kg_s is not None and inp.cold_Cp_J_kgK is not None:
        m_c_Cp_c = inp.cold_flow_kg_s * inp.cold_Cp_J_kgK

    # Case: duty specified directly
    if inp.duty_W is not None:
        Q = inp.duty_W
        if T_ho is None and m_h_Cp_h is not None:
            T_ho = T_hi - Q / m_h_Cp_h
        if T_co is None and m_c_Cp_c is not None:
            T_co = T_ci + Q / m_c_Cp_c

    # Case: compute duty from hot side
    elif T_ho is not None and m_h_Cp_h is not None:
        Q = m_h_Cp_h * (T_hi - T_ho)
        if T_co is None and m_c_Cp_c is not None:
            T_co = T_ci + Q / m_c_Cp_c

    # Case: compute duty from cold side
    elif T_co is not None and m_c_Cp_c is not None:
        Q = m_c_Cp_c * (T_co - T_ci)
        if T_ho is None and m_h_Cp_h is not None:
            T_ho = T_hi - Q / m_h_Cp_h

    else:
        warnings.append(
            "Insufficient specifications. Need either duty, or enough "
            "temperatures and flow-Cp data to compute duty."
        )
        return HeatExchangerResult(
            hot_inlet_T_C=T_hi, hot_outlet_T_C=T_ho or 0,
            cold_inlet_T_C=T_ci, cold_outlet_T_C=T_co or 0,
            duty_W=0, hot_duty_W=0, cold_duty_W=0,
            energy_balance_residual_W=0,
            delta_T_1=0, delta_T_2=0, LMTD_C=0,
            flow_arrangement=inp.flow_arrangement,
            feasible=False, calc_type=calc_type,
            warnings=warnings, assumptions=assumptions,
        )

    # Compute duties from both sides
    hot_duty = m_h_Cp_h * (T_hi - T_ho) if m_h_Cp_h and T_ho is not None else Q
    cold_duty = m_c_Cp_c * (T_co - T_ci) if m_c_Cp_c and T_co is not None else Q

    energy_residual = abs(hot_duty - cold_duty)

    # Feasibility checks
    feasible = True
    if T_ho is not None and T_ho > T_hi:
        warnings.append("Hot outlet is hotter than hot inlet. Infeasible.")
        feasible = False
    if T_co is not None and T_co < T_ci:
        warnings.append("Cold outlet is colder than cold inlet. Infeasible.")
        feasible = False

    # LMTD
    LMTD, dT1, dT2 = calculate_LMTD(
        T_hi, T_ho or T_hi, T_ci, T_co or T_ci,
        inp.flow_arrangement,
    )

    if LMTD <= 0:
        warnings.append("LMTD ≤ 0: temperature cross detected. Configuration infeasible.")
        feasible = False

    # Minimum approach temperature
    if inp.flow_arrangement == "countercurrent":
        min_approach = min(abs(dT1), abs(dT2))
    else:
        min_approach = min(abs(T_hi - T_ci), abs((T_ho or T_hi) - (T_co or T_ci)))

    if min_approach < 5.0:
        warnings.append(f"Minimum approach temperature is {min_approach:.1f}°C (< 5°C). "
                        "May require very large heat transfer area.")

    # UA calculation
    UA = None
    U = inp.U_W_m2K
    A = inp.area_m2

    if LMTD > 0:
        UA = Q / LMTD
        if U is not None and A is None:
            A = UA / U
            calc_type = "design"
        elif A is not None and U is None:
            U = UA / A

    # Temperature profile (linear for constant Cp)
    n_points = 50
    hot_profile = []
    cold_profile = []
    for i in range(n_points + 1):
        frac = i / n_points
        T_h = T_hi - frac * (T_hi - (T_ho or T_hi))
        hot_profile.append((frac, T_h))

        if inp.flow_arrangement == "countercurrent":
            T_c = T_ci + frac * ((T_co or T_ci) - T_ci)
        else:
            T_c = T_ci + frac * ((T_co or T_ci) - T_ci)
        cold_profile.append((frac, T_c))

    return HeatExchangerResult(
        hot_inlet_T_C=T_hi,
        hot_outlet_T_C=T_ho or 0,
        cold_inlet_T_C=T_ci,
        cold_outlet_T_C=T_co or 0,
        duty_W=Q,
        hot_duty_W=hot_duty,
        cold_duty_W=cold_duty,
        energy_balance_residual_W=energy_residual,
        delta_T_1=dT1,
        delta_T_2=dT2,
        LMTD_C=LMTD,
        flow_arrangement=inp.flow_arrangement,
        UA_W_K=UA,
        U_W_m2K=U,
        area_m2=A,
        min_approach_C=min_approach,
        feasible=feasible,
        calc_type=calc_type,
        warnings=warnings,
        assumptions=assumptions,
        hot_profile=hot_profile,
        cold_profile=cold_profile,
    )
