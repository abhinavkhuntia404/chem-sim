"""
Energy balance calculations for process engineering.

Implements:
  - Steady-state energy balances.
  - Sensible heat calculations.
  - Latent heat calculations.
  - Phase-change energy.
  - Heat exchanger duty.
  - Condenser and reboiler duty.
  - Enthalpy-based stream calculations.

Fundamental steady-state energy balance:
  0 = Σ Ḣ_in - Σ Ḣ_out + Q̇ - Ẇ

Sign convention:
  - Q̇ > 0: heat added to the system.
  - Ẇ > 0: work done by the system.
  - Ḣ_in, Ḣ_out: enthalpy flow rates (mol/s × J/mol or kg/s × J/kg).

Reference state: liquid at 25°C (298.15 K) unless otherwise specified.

Limitations:
  - Kinetic and potential energy terms are neglected.
  - Ideal gas Cp polynomials are used for vapor enthalpy.
  - Liquid Cp is taken as constant (value at 25°C) — adequate for
    narrow temperature ranges typical of distillation.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional, List
import math

from .properties import Component


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class StreamEnthalpy:
    """Enthalpy calculation result for a process stream."""
    component: str
    flow_mol_s: float
    T_C: float
    phase: str  # "liquid" or "vapor"
    h_J_mol: float  # specific molar enthalpy relative to reference
    H_dot_W: float  # enthalpy flow rate: flow × h (Watts)
    reference: str = "Liquid at 25°C"


@dataclass
class EnergyBalanceResult:
    """Result of an energy balance calculation."""
    unit_name: str
    H_in_W: float           # Total inlet enthalpy flow (W)
    H_out_W: float          # Total outlet enthalpy flow (W)
    Q_dot_W: float           # Heat duty (W); >0 = heat added
    W_dot_W: float           # Work (W); >0 = work done by system
    residual_W: float        # |H_in - H_out + Q - W|
    relative_closure: float
    inlet_enthalpies: List[StreamEnthalpy]
    outlet_enthalpies: List[StreamEnthalpy]
    solved: bool
    assumptions: List[str]
    warnings: List[str]


# ---------------------------------------------------------------------------
# Enthalpy calculations
# ---------------------------------------------------------------------------

def liquid_enthalpy(
    component: Component,
    T_C: float,
    T_ref_C: float = 25.0,
) -> float:
    """
    Molar enthalpy of a liquid relative to reference state.

    h_liquid = Cp_liquid × (T - T_ref)

    Uses constant liquid Cp at 25°C.

    Returns
    -------
    float
        Enthalpy in J/mol.
    """
    return component.liquid_Cp_J_mol_K * (T_C - T_ref_C)


def vapor_enthalpy(
    component: Component,
    T_C: float,
    T_ref_C: float = 25.0,
) -> float:
    """
    Molar enthalpy of an ideal gas relative to liquid reference state.

    h_vapor = ∫[T_ref to T_bp] Cp_liquid dT
              + ΔH_vap(T_bp)
              + ∫[T_bp to T] Cp_gas dT

    For T > T_bp:
      Uses constant liquid Cp for liquid range and polynomial for gas range.

    For T ≤ T_bp:
      Returns liquid enthalpy (component is not vapor at this T under
      simplifying assumptions).

    Returns
    -------
    float
        Enthalpy in J/mol.
    """
    T_K = T_C + 273.15
    T_ref_K = T_ref_C + 273.15
    T_bp_K = component.normal_boiling_point_K
    T_bp_C = T_bp_K - 273.15

    # Liquid heating: reference to boiling point
    h_liquid_heating = component.liquid_Cp_J_mol_K * (T_bp_C - T_ref_C)

    # Vaporization at boiling point
    h_vap = component.heat_of_vaporization_kJ_mol * 1000.0  # J/mol

    # Vapor superheating: boiling point to T
    h_vapor_heating = _integrate_Cp_gas(component, T_bp_K, T_K)

    return h_liquid_heating + h_vap + h_vapor_heating


def _integrate_Cp_gas(component: Component, T1_K: float, T2_K: float) -> float:
    """
    Integrate ideal gas Cp from T1 to T2.

    ∫ Cp dT = a(T2-T1) + b/2(T2²-T1²) + c/3(T2³-T1³) + d/4(T2⁴-T1⁴)

    Returns J/mol.
    """
    c = component.ideal_gas_Cp
    dT = T2_K - T1_K
    if abs(dT) < 1e-10:
        return 0.0

    return (c.a * (T2_K - T1_K)
            + c.b / 2 * (T2_K**2 - T1_K**2)
            + c.c / 3 * (T2_K**3 - T1_K**3)
            + c.d / 4 * (T2_K**4 - T1_K**4))


def stream_enthalpy(
    component: Component,
    flow_mol_s: float,
    T_C: float,
    phase: str,
    T_ref_C: float = 25.0,
) -> StreamEnthalpy:
    """
    Calculate enthalpy flow rate for a single-component stream.

    Parameters
    ----------
    component : Component
    flow_mol_s : float
        Molar flow rate in mol/s.
    T_C : float
        Stream temperature in °C.
    phase : str
        "liquid" or "vapor".
    T_ref_C : float
        Reference temperature in °C.

    Returns
    -------
    StreamEnthalpy
    """
    if phase == "liquid":
        h = liquid_enthalpy(component, T_C, T_ref_C)
    elif phase == "vapor":
        h = vapor_enthalpy(component, T_C, T_ref_C)
    else:
        raise ValueError(f"Unknown phase: '{phase}'. Use 'liquid' or 'vapor'.")

    H_dot = flow_mol_s * h  # W (J/s)

    return StreamEnthalpy(
        component=component.name,
        flow_mol_s=flow_mol_s,
        T_C=T_C,
        phase=phase,
        h_J_mol=h,
        H_dot_W=H_dot,
        reference=f"Liquid at {T_ref_C}°C",
    )


# ---------------------------------------------------------------------------
# Energy balance for a unit
# ---------------------------------------------------------------------------

def energy_balance(
    unit_name: str,
    inlet_components: List[Component],
    inlet_flows: List[float],
    inlet_T_C: List[float],
    inlet_phases: List[str],
    outlet_components: List[Component],
    outlet_flows: List[float],
    outlet_T_C: List[float],
    outlet_phases: List[str],
    W_dot_W: float = 0.0,
    T_ref_C: float = 25.0,
) -> EnergyBalanceResult:
    """
    Compute steady-state energy balance for a process unit.

    Q̇ = Σ Ḣ_out - Σ Ḣ_in + Ẇ

    A positive Q̇ means heat must be added to the system.
    """
    assumptions = [
        f"Reference state: liquid at {T_ref_C}°C.",
        "Constant liquid Cp (value at 25°C).",
        "Ideal gas Cp polynomial for vapor phase.",
        "Kinetic and potential energy neglected.",
    ]
    warnings = []

    # Compute inlet enthalpies
    inlet_h = []
    H_in = 0.0
    for comp, flow, T, phase in zip(inlet_components, inlet_flows, inlet_T_C, inlet_phases):
        sh = stream_enthalpy(comp, flow, T, phase, T_ref_C)
        inlet_h.append(sh)
        H_in += sh.H_dot_W

    # Compute outlet enthalpies
    outlet_h = []
    H_out = 0.0
    for comp, flow, T, phase in zip(outlet_components, outlet_flows, outlet_T_C, outlet_phases):
        sh = stream_enthalpy(comp, flow, T, phase, T_ref_C)
        outlet_h.append(sh)
        H_out += sh.H_dot_W

    # Energy balance: Q = H_out - H_in + W
    Q = H_out - H_in + W_dot_W
    residual = abs(H_in + Q - H_out - W_dot_W)
    relative = residual / max(abs(H_in), abs(H_out), 1e-15)

    return EnergyBalanceResult(
        unit_name=unit_name,
        H_in_W=H_in,
        H_out_W=H_out,
        Q_dot_W=Q,
        W_dot_W=W_dot_W,
        residual_W=residual,
        relative_closure=relative,
        inlet_enthalpies=inlet_h,
        outlet_enthalpies=outlet_h,
        solved=True,
        assumptions=assumptions,
        warnings=warnings,
    )


# ---------------------------------------------------------------------------
# Condenser and reboiler duties (for distillation)
# ---------------------------------------------------------------------------

def condenser_duty(
    vapor_flow_mol_s: float,
    components: List[Component],
    vapor_composition: List[float],
    T_condenser_C: float,
    condenser_type: str = "total",
) -> float:
    """
    Estimate condenser duty for a distillation column.

    For a total condenser: Q_c = -V · Σ(y_i · ΔH_vap_i)
    (negative because heat is removed).

    Returns duty in Watts. Negative = heat removed.
    """
    duty = 0.0
    for comp, yi in zip(components, vapor_composition):
        h_vap = comp.heat_of_vaporization_kJ_mol * 1000.0  # J/mol
        duty -= vapor_flow_mol_s * yi * h_vap

    return duty  # W (negative)


def reboiler_duty(
    vapor_flow_mol_s: float,
    components: List[Component],
    liquid_composition: List[float],
    T_reboiler_C: float,
) -> float:
    """
    Estimate reboiler duty for a distillation column.

    Q_r = V' · Σ(x_i · ΔH_vap_i)
    (positive because heat is added).

    Returns duty in Watts. Positive = heat added.
    """
    duty = 0.0
    for comp, xi in zip(components, liquid_composition):
        h_vap = comp.heat_of_vaporization_kJ_mol * 1000.0  # J/mol
        duty += vapor_flow_mol_s * xi * h_vap

    return duty  # W (positive)
