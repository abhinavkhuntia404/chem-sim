"""
Reactor and reaction engineering calculations.

Implements:
  - Stoichiometric reaction balances.
  - Limiting reactant identification.
  - Excess reactant calculation.
  - Theoretical and actual yield.
  - Percentage conversion and selectivity.
  - First-order batch reactor model.
  - CSTR (continuous stirred-tank reactor) model.
  - PFR (plug-flow reactor) model for first-order kinetics.
  - Arrhenius temperature dependence.

This is an educational module. It supports simple kinetic models
and does not claim to be a general-purpose reaction simulator.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Tuple
import math
import numpy as np


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class ReactionSpec:
    """
    Specification for a chemical reaction.

    stoichiometry: {"A": -1, "B": -2, "C": 1, "D": 1}
        Negative = reactant, Positive = product.
    """
    name: str
    stoichiometry: Dict[str, float]
    rate_constant: Optional[float] = None  # k at reference T (1/s for first-order)
    activation_energy_J_mol: Optional[float] = None  # Ea
    reference_temperature_K: Optional[float] = None
    reaction_order: int = 1

    @property
    def reactants(self) -> Dict[str, float]:
        return {k: -v for k, v in self.stoichiometry.items() if v < 0}

    @property
    def products(self) -> Dict[str, float]:
        return {k: v for k, v in self.stoichiometry.items() if v > 0}


@dataclass
class StoichiometryResult:
    """Result of stoichiometric analysis."""
    reaction: ReactionSpec
    feed_moles: Dict[str, float]
    limiting_reactant: str
    excess_reactants: Dict[str, float]  # name → fractional excess
    max_extent: float
    product_moles_at_complete: Dict[str, float]
    theoretical_yield: Dict[str, float]  # product → max moles
    conversion: float  # of limiting reactant
    actual_product_moles: Optional[Dict[str, float]] = None
    actual_yield_fraction: Optional[Dict[str, float]] = None
    selectivity: Optional[Dict[str, float]] = None
    warnings: List[str] = field(default_factory=list)


@dataclass
class ReactorResult:
    """Result of a reactor design calculation."""
    reactor_type: str  # "batch", "CSTR", "PFR"
    conversion: float
    exit_concentrations: Dict[str, float]
    volume_m3: Optional[float] = None
    residence_time_s: Optional[float] = None
    rate_at_exit: Optional[float] = None
    temperature_K: float = 298.15
    rate_constant: float = 0.0
    warnings: List[str] = field(default_factory=list)
    assumptions: List[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Stoichiometry
# ---------------------------------------------------------------------------

def analyze_stoichiometry(
    reaction: ReactionSpec,
    feed_moles: Dict[str, float],
    actual_conversion: Optional[float] = None,
) -> StoichiometryResult:
    """
    Perform stoichiometric analysis of a reaction.

    Determines limiting reactant, excess, theoretical yield, and
    actual products if conversion is specified.
    """
    warnings = []
    reactants = reaction.reactants  # {name: |coeff|}

    if not reactants:
        warnings.append("No reactants defined in stoichiometry.")
        return StoichiometryResult(
            reaction=reaction, feed_moles=feed_moles,
            limiting_reactant="", excess_reactants={}, max_extent=0,
            product_moles_at_complete={}, theoretical_yield={},
            conversion=0, warnings=warnings,
        )

    # Check that all reactants have feed
    for r in reactants:
        if r not in feed_moles or feed_moles[r] <= 0:
            warnings.append(f"Reactant {r} has zero or missing feed.")

    # Find limiting reactant: min(n_i / |ν_i|)
    extent_limits = {}
    for name, coeff in reactants.items():
        n = feed_moles.get(name, 0)
        if coeff > 0:
            extent_limits[name] = n / coeff
        else:
            extent_limits[name] = float('inf')

    limiting = min(extent_limits, key=extent_limits.get)
    max_extent = extent_limits[limiting]

    # Excess reactants
    excess = {}
    for name, coeff in reactants.items():
        if name != limiting:
            n_needed = coeff * max_extent
            n_available = feed_moles.get(name, 0)
            if n_needed > 0:
                excess[name] = (n_available - n_needed) / n_needed
            else:
                excess[name] = float('inf')

    # Products at complete conversion
    product_moles = {}
    theoretical_yield = {}
    for name, coeff in reaction.products.items():
        product_moles[name] = coeff * max_extent
        theoretical_yield[name] = coeff * max_extent

    # Actual products if conversion specified
    actual_products = None
    actual_yield_frac = None
    conversion = actual_conversion if actual_conversion is not None else 1.0

    if actual_conversion is not None:
        if not (0 <= actual_conversion <= 1):
            warnings.append(f"Conversion {actual_conversion} is outside [0, 1].")

        actual_extent = max_extent * conversion
        actual_products = {}
        actual_yield_frac = {}

        for name, coeff in reaction.stoichiometry.items():
            n_feed = feed_moles.get(name, 0)
            n_final = n_feed + coeff * actual_extent
            actual_products[name] = max(n_final, 0)

            if name in reaction.products and theoretical_yield.get(name, 0) > 0:
                actual_yield_frac[name] = actual_products[name] / theoretical_yield[name]

    return StoichiometryResult(
        reaction=reaction,
        feed_moles=feed_moles,
        limiting_reactant=limiting,
        excess_reactants=excess,
        max_extent=max_extent,
        product_moles_at_complete=product_moles,
        theoretical_yield=theoretical_yield,
        conversion=conversion,
        actual_product_moles=actual_products,
        actual_yield_fraction=actual_yield_frac,
        warnings=warnings,
    )


# ---------------------------------------------------------------------------
# Arrhenius
# ---------------------------------------------------------------------------

def arrhenius_rate_constant(
    k_ref: float,
    T_ref_K: float,
    T_K: float,
    Ea_J_mol: float,
) -> float:
    """
    Calculate rate constant at temperature T using Arrhenius equation.

    k(T) = k_ref * exp(-Ea/R * (1/T - 1/T_ref))

    R = 8.314 J/(mol·K)
    """
    R = 8.314
    return k_ref * math.exp(-Ea_J_mol / R * (1.0 / T_K - 1.0 / T_ref_K))


# ---------------------------------------------------------------------------
# Reactor models (first-order kinetics: -r_A = k * C_A)
# ---------------------------------------------------------------------------

def batch_reactor(
    C_A0: float,
    k: float,
    time_s: float,
    order: int = 1,
) -> ReactorResult:
    """
    First-order batch reactor.

    C_A = C_A0 * exp(-k * t)
    X = 1 - exp(-k * t)
    """
    if order != 1:
        return ReactorResult(
            reactor_type="batch", conversion=0,
            exit_concentrations={"A": C_A0},
            warnings=[f"Only first-order kinetics supported. Order {order} requested."],
            assumptions=[],
        )

    C_A = C_A0 * math.exp(-k * time_s)
    X = 1 - C_A / C_A0

    return ReactorResult(
        reactor_type="batch",
        conversion=X,
        exit_concentrations={"A": C_A},
        residence_time_s=time_s,
        rate_at_exit=k * C_A,
        rate_constant=k,
        assumptions=[
            "First-order irreversible reaction: A → products.",
            "Isothermal, constant volume.",
            "Well-mixed batch reactor.",
        ],
    )


def cstr(
    C_A0: float,
    k: float,
    tau_s: Optional[float] = None,
    target_conversion: Optional[float] = None,
    volume_m3: Optional[float] = None,
    volumetric_flow_m3_s: Optional[float] = None,
    order: int = 1,
) -> ReactorResult:
    """
    Continuous stirred-tank reactor (CSTR) for first-order kinetics.

    Design equation: τ = C_A0 * X / (-r_A_exit)
    For first-order: τ = X / (k * (1 - X))
    Or: X = k*τ / (1 + k*τ)
    """
    if order != 1:
        return ReactorResult(
            reactor_type="CSTR", conversion=0,
            exit_concentrations={"A": C_A0},
            warnings=[f"Only first-order kinetics supported."],
            assumptions=[],
        )

    # Determine τ
    if tau_s is not None:
        pass
    elif volume_m3 is not None and volumetric_flow_m3_s is not None:
        tau_s = volume_m3 / volumetric_flow_m3_s
    elif target_conversion is not None:
        X = target_conversion
        if X >= 1.0:
            return ReactorResult(
                reactor_type="CSTR", conversion=X,
                exit_concentrations={"A": 0},
                warnings=["100% conversion requires infinite volume in a CSTR."],
                assumptions=[],
            )
        tau_s = X / (k * (1 - X))
    else:
        return ReactorResult(
            reactor_type="CSTR", conversion=0,
            exit_concentrations={"A": C_A0},
            warnings=["Insufficient specifications. Provide τ, V and Q, or target conversion."],
            assumptions=[],
        )

    X = k * tau_s / (1 + k * tau_s)
    C_A = C_A0 * (1 - X)
    V = None
    if volumetric_flow_m3_s is not None:
        V = tau_s * volumetric_flow_m3_s

    return ReactorResult(
        reactor_type="CSTR",
        conversion=X,
        exit_concentrations={"A": C_A},
        volume_m3=V,
        residence_time_s=tau_s,
        rate_at_exit=k * C_A,
        rate_constant=k,
        assumptions=[
            "First-order irreversible reaction: A → products.",
            "Isothermal, steady-state.",
            "Perfect mixing (exit composition = reactor composition).",
        ],
    )


def pfr(
    C_A0: float,
    k: float,
    tau_s: Optional[float] = None,
    target_conversion: Optional[float] = None,
    volume_m3: Optional[float] = None,
    volumetric_flow_m3_s: Optional[float] = None,
    order: int = 1,
) -> ReactorResult:
    """
    Plug-flow reactor (PFR) for first-order kinetics.

    Design equation: τ = (1/k) * ln(1/(1-X))
    Or: X = 1 - exp(-k*τ)
    """
    if order != 1:
        return ReactorResult(
            reactor_type="PFR", conversion=0,
            exit_concentrations={"A": C_A0},
            warnings=[f"Only first-order kinetics supported."],
            assumptions=[],
        )

    if tau_s is not None:
        pass
    elif volume_m3 is not None and volumetric_flow_m3_s is not None:
        tau_s = volume_m3 / volumetric_flow_m3_s
    elif target_conversion is not None:
        X = target_conversion
        if X >= 1.0:
            return ReactorResult(
                reactor_type="PFR", conversion=X,
                exit_concentrations={"A": 0},
                warnings=["100% conversion requires infinite length."],
                assumptions=[],
            )
        tau_s = -math.log(1 - X) / k
    else:
        return ReactorResult(
            reactor_type="PFR", conversion=0,
            exit_concentrations={"A": C_A0},
            warnings=["Insufficient specifications."],
            assumptions=[],
        )

    X = 1 - math.exp(-k * tau_s)
    C_A = C_A0 * (1 - X)
    V = None
    if volumetric_flow_m3_s is not None:
        V = tau_s * volumetric_flow_m3_s

    return ReactorResult(
        reactor_type="PFR",
        conversion=X,
        exit_concentrations={"A": C_A},
        volume_m3=V,
        residence_time_s=tau_s,
        rate_at_exit=k * C_A,
        rate_constant=k,
        assumptions=[
            "First-order irreversible reaction: A → products.",
            "Isothermal, steady-state.",
            "Plug flow (no axial mixing).",
            "Constant volumetric flow rate.",
        ],
    )
