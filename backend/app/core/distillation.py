"""
Distillation column simulation.

Implements:
  - McCabe-Thiele graphical analysis for binary distillation.
  - Equilibrium-stage solver under constant molar overflow (CMO).
  - Stage profiles (temperature, composition).
  - Condenser and reboiler duty estimation.
  - Feed-stage identification.
  - Minimum reflux analysis.

Assumptions documented:
  - Constant molar overflow (CMO): liquid and vapor flow rates are constant
    in each section. This requires roughly equal molar heats of vaporization
    and negligible sensible heat effects. Valid for benzene-toluene.
  - Total condenser unless otherwise specified.
  - Partial reboiler counts as one equilibrium stage.
  - Raoult's law VLE (see thermo.py for details).

This is NOT a rigorous MESH (Material balance, Equilibrium, Summation,
enthalpy) solver. It is a CMO-based educational model.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional, List, Tuple
import math

from .properties import Component, BENZENE, TOLUENE
from .thermo import (
    bubble_temperature, dew_temperature, raoults_law_y,
    equilibrium_curve, relative_volatility, VLEResult,
    EquilibriumCurvePoint,
)


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class FeedCondition:
    """Feed thermal condition."""
    q: float               # q = fraction of feed that is liquid
                           # q=1: saturated liquid, q=0: saturated vapor
                           # q>1: subcooled liquid, 0<q<1: two-phase
                           # q<0: superheated vapor
    description: str = ""

    @staticmethod
    def saturated_liquid() -> "FeedCondition":
        return FeedCondition(q=1.0, description="Saturated liquid feed")

    @staticmethod
    def saturated_vapor() -> "FeedCondition":
        return FeedCondition(q=0.0, description="Saturated vapor feed")

    @staticmethod
    def subcooled(Cp_over_Hvap: float, delta_T: float) -> "FeedCondition":
        """q = 1 + Cp·ΔT / ΔHvap for subcooled liquid."""
        q = 1.0 + Cp_over_Hvap * delta_T
        return FeedCondition(q=q, description=f"Subcooled liquid (q={q:.3f})")

    @staticmethod
    def two_phase(vapor_fraction: float) -> "FeedCondition":
        """q = 1 - vapor_fraction."""
        q = 1.0 - vapor_fraction
        return FeedCondition(q=q, description=f"Two-phase feed (q={q:.3f})")


@dataclass
class ColumnConfig:
    """Distillation column configuration."""
    components: List[Component]          # [more volatile, less volatile]
    feed_flow_mol_s: float               # F, total feed molar flow rate
    feed_composition: float              # z_F, mole fraction of more volatile component
    feed_condition: FeedCondition        # Feed thermal condition
    pressure_kPa: float                  # Operating pressure
    distillate_composition: float        # x_D
    bottoms_composition: float           # x_B
    reflux_ratio: float                  # R = L/D
    condenser_type: str = "total"        # "total" or "partial"
    reboiler_type: str = "partial"       # "partial" (counts as a stage)


@dataclass
class StageData:
    """Data for a single theoretical stage."""
    stage_number: int
    x: float              # Liquid composition leaving stage
    y: float              # Vapor composition leaving stage
    T_C: float            # Stage temperature
    section: str          # "rectifying" or "stripping"


@dataclass
class OperatingLine:
    """Operating line parameters: y = slope * x + intercept."""
    slope: float
    intercept: float
    x_range: Tuple[float, float]

    def y_at(self, x: float) -> float:
        return self.slope * x + self.intercept


@dataclass
class McCabeThieleResult:
    """Complete McCabe-Thiele analysis result."""
    # Configuration
    config: ColumnConfig

    # Operating lines
    rectifying_line: OperatingLine
    stripping_line: OperatingLine
    q_line_slope: Optional[float]
    q_line_intercept: Optional[float]

    # Intersection point of operating lines
    intersection_x: float
    intersection_y: float

    # Equilibrium curve
    equilibrium_curve: List[EquilibriumCurvePoint]

    # Stages
    stages: List[StageData]
    num_theoretical_stages: int  # includes reboiler if partial
    feed_stage: int              # optimal feed-stage location (from top)

    # Flow rates (CMO basis)
    distillate_flow: float       # D, mol/s
    bottoms_flow: float          # B, mol/s
    rectifying_liquid: float     # L, mol/s
    rectifying_vapor: float      # V, mol/s
    stripping_liquid: float      # L', mol/s
    stripping_vapor: float       # V', mol/s

    # Energy
    condenser_duty_kW: Optional[float] = None
    reboiler_duty_kW: Optional[float] = None

    # Material balance check
    feed_balance_residual: float = 0.0
    component_balance_residual: float = 0.0

    # Diagnostics
    converged: bool = True
    warnings: List[str] = field(default_factory=list)
    assumptions: List[str] = field(default_factory=list)

    # Minimum reflux
    min_reflux_ratio: Optional[float] = None


@dataclass
class DistillationResult:
    """Full distillation simulation result."""
    mccabe_thiele: McCabeThieleResult
    stage_profiles: List[StageData]
    temperature_profile: List[Tuple[int, float]]  # (stage, T_C)
    composition_profile: List[Tuple[int, float, float]]  # (stage, x, y)

    # Energy
    condenser_duty_kW: Optional[float]
    reboiler_duty_kW: Optional[float]

    # Summary
    distillate_purity: float
    bottoms_purity: float
    recovery: float  # fraction of light component recovered in distillate

    # Convergence
    converged: bool
    solver_messages: List[str]


# ---------------------------------------------------------------------------
# McCabe-Thiele Analysis
# ---------------------------------------------------------------------------

def mccabe_thiele(config: ColumnConfig) -> McCabeThieleResult:
    """
    Perform McCabe-Thiele analysis for binary distillation.

    Parameters
    ----------
    config : ColumnConfig
        Column configuration.

    Returns
    -------
    McCabeThieleResult
    """
    warnings = []
    assumptions = [
        "Constant molar overflow (CMO) assumed.",
        "Raoult's law VLE (ideal liquid and vapor phases).",
        f"Operating pressure: {config.pressure_kPa:.1f} kPa.",
        f"Condenser: {config.condenser_type}.",
        f"Reboiler: {config.reboiler_type} (counts as one equilibrium stage).",
    ]

    # --- Validate inputs ---
    if config.distillate_composition <= config.feed_composition:
        warnings.append("Warning: x_D ≤ z_F. Distillate purity is below feed composition.")
    if config.bottoms_composition >= config.feed_composition:
        warnings.append("Warning: x_B ≥ z_F. Bottoms composition is above feed composition.")
    if config.reflux_ratio <= 0:
        warnings.append("Error: Reflux ratio must be positive.")
        return _empty_result(config, warnings, assumptions)

    F = config.feed_flow_mol_s
    z_F = config.feed_composition
    x_D = config.distillate_composition
    x_B = config.bottoms_composition
    R = config.reflux_ratio
    q = config.feed_condition.q

    # --- Overall and component material balances ---
    # F = D + B
    # F * z_F = D * x_D + B * x_B
    if abs(x_D - x_B) < 1e-12:
        warnings.append("Error: x_D ≈ x_B. No separation is specified.")
        return _empty_result(config, warnings, assumptions)

    D = F * (z_F - x_B) / (x_D - x_B)
    B = F - D

    if D < 0 or B < 0:
        warnings.append(
            f"Infeasible specification: D={D:.4f}, B={B:.4f}. "
            "Check that x_B < z_F < x_D."
        )
        return _empty_result(config, warnings, assumptions)

    # --- Flow rates in each section (CMO) ---
    L = R * D                    # Rectifying liquid
    V = L + D                    # Rectifying vapor (from total condenser)
    L_prime = L + q * F          # Stripping liquid
    V_prime = V - (1 - q) * F    # Stripping vapor

    if V <= 0 or V_prime <= 0:
        warnings.append("Infeasible: vapor flow is non-positive. Increase reflux ratio.")
        return _empty_result(config, warnings, assumptions)

    # --- Operating lines ---
    # Rectifying: y = (R/(R+1)) * x + x_D/(R+1)
    rect_slope = R / (R + 1)
    rect_intercept = x_D / (R + 1)
    rectifying_line = OperatingLine(
        slope=rect_slope,
        intercept=rect_intercept,
        x_range=(0.0, x_D),
    )

    # Stripping: y = (L'/V') * x - (B * x_B) / V'
    strip_slope = L_prime / V_prime
    strip_intercept = -B * x_B / V_prime
    stripping_line = OperatingLine(
        slope=strip_slope,
        intercept=strip_intercept,
        x_range=(x_B, x_D),
    )

    # --- q-line ---
    if abs(q - 1.0) < 1e-10:
        # Saturated liquid: vertical line at x = z_F
        q_slope = None
        q_intercept = None
    else:
        q_slope = q / (q - 1.0)
        q_intercept = -z_F / (q - 1.0)

    # --- Intersection of operating lines ---
    # Rectifying meets stripping at the q-line
    if q_slope is not None:
        # Solve: rect_slope * x + rect_intercept = q_slope * x + q_intercept
        if abs(rect_slope - q_slope) < 1e-12:
            ix = z_F
            iy = rectifying_line.y_at(ix)
        else:
            ix = (q_intercept - rect_intercept) / (rect_slope - q_slope)
            iy = rectifying_line.y_at(ix)
    else:
        ix = z_F
        iy = rectifying_line.y_at(ix)

    # --- Minimum reflux ---
    # At minimum reflux, the operating line passes through the intersection
    # of the q-line with the equilibrium curve.
    min_R = _compute_minimum_reflux(config, ix, iy, x_D, warnings)

    if min_R is not None and R < min_R:
        warnings.append(
            f"Reflux ratio R={R:.3f} is below minimum reflux R_min={min_R:.3f}. "
            "Infinite stages would be needed."
        )

    # --- Equilibrium curve ---
    eq_curve = equilibrium_curve(config.components, config.pressure_kPa, n_points=201)

    # --- Stage stepping (McCabe-Thiele) ---
    stages, feed_stage = _step_stages(
        eq_curve, rectifying_line, stripping_line,
        x_D, x_B, z_F, ix, config.components, config.pressure_kPa,
    )

    num_stages = len(stages)

    # --- Material balance residuals ---
    feed_residual = abs(F - D - B) / max(F, 1e-15)
    comp_residual = abs(F * z_F - D * x_D - B * x_B) / max(F * z_F, 1e-15)

    # --- Energy estimates ---
    condenser_duty_kW = None
    reboiler_duty_kW = None
    try:
        # ΔH_vap at average top temperature
        avg_Hvap = sum(c.heat_of_vaporization_kJ_mol for c in config.components) / 2
        condenser_duty_kW = V * avg_Hvap  # kW = mol/s * kJ/mol
        reboiler_duty_kW = V_prime * avg_Hvap
    except Exception:
        warnings.append("Could not estimate condenser/reboiler duties.")

    return McCabeThieleResult(
        config=config,
        rectifying_line=rectifying_line,
        stripping_line=stripping_line,
        q_line_slope=q_slope,
        q_line_intercept=q_intercept,
        intersection_x=ix,
        intersection_y=iy,
        equilibrium_curve=eq_curve,
        stages=stages,
        num_theoretical_stages=num_stages,
        feed_stage=feed_stage,
        distillate_flow=D,
        bottoms_flow=B,
        rectifying_liquid=L,
        rectifying_vapor=V,
        stripping_liquid=L_prime,
        stripping_vapor=V_prime,
        condenser_duty_kW=condenser_duty_kW,
        reboiler_duty_kW=reboiler_duty_kW,
        feed_balance_residual=feed_residual,
        component_balance_residual=comp_residual,
        converged=True,
        warnings=warnings,
        assumptions=assumptions,
        min_reflux_ratio=min_R,
    )


def _interp_x_from_y(y: float, curve: list[EquilibriumCurvePoint]) -> float:
    """Linearly interpolate x from the equilibrium curve for a given y."""
    if y <= 0:
        return 0.0
    if y >= 1.0:
        return 1.0
    for i in range(len(curve) - 1):
        y_low, y_high = curve[i].y, curve[i + 1].y
        if y_low <= y <= y_high:
            if abs(y_high - y_low) < 1e-15:
                return curve[i].x
            frac = (y - y_low) / (y_high - y_low)
            return curve[i].x + frac * (curve[i + 1].x - curve[i].x)
    closest = min(curve, key=lambda p: abs(p.y - y))
    return closest.x


def _step_stages(
    eq_curve: list[EquilibriumCurvePoint],
    rect_line: OperatingLine,
    strip_line: OperatingLine,
    x_D: float,
    x_B: float,
    z_F: float,
    ix: float,
    components: list[Component],
    P_kPa: float,
) -> Tuple[list[StageData], int]:
    """
    Step off theoretical stages on the McCabe-Thiele diagram.

    Starts at y = x_D (distillate) and steps down to x <= x_B (bottoms).
    """
    stages: list[StageData] = []
    y_current = x_D
    section = "rectifying"
    feed_stage = 1
    switched = False
    max_stages = 100

    for n in range(1, max_stages + 1):
        # 1. Given vapor y_current, find liquid x_n in equilibrium
        x_n = _interp_x_from_y(y_current, eq_curve)

        vle = bubble_temperature([x_n, 1.0 - x_n], components, P_kPa, T_guess_C=80.0)
        T_C = vle.temperature_C if vle.converged else float('nan')

        stages.append(StageData(
            stage_number=n,
            x=x_n,
            y=y_current,
            T_C=T_C,
            section=section,
        ))

        # Check if bottoms purity reached
        if x_n <= x_B:
            break

        # Check if we should switch to stripping section
        # We switch when liquid composition drops below the operating lines intersection
        if not switched and x_n <= ix:
            section = "stripping"
            feed_stage = n
            switched = True

        # 2. Find vapor rising from stage below via operating line
        if section == "rectifying":
            y_next = rect_line.y_at(x_n)
        else:
            y_next = strip_line.y_at(x_n)

        # Safeguard: y must decrease as we step down
        if y_next >= y_current or y_next < 0:
            break

        y_current = y_next

    if not switched:
        feed_stage = len(stages)

    return stages, feed_stage


def _interp_equilibrium(x: float, curve: list[EquilibriumCurvePoint]) -> float:
    """Linearly interpolate y from the equilibrium curve at given x."""
    if x <= 0:
        return 0.0
    if x >= 1:
        return 1.0

    for i in range(len(curve) - 1):
        if curve[i].x <= x <= curve[i + 1].x:
            frac = (x - curve[i].x) / (curve[i + 1].x - curve[i].x)
            return curve[i].y + frac * (curve[i + 1].y - curve[i].y)

    closest = min(curve, key=lambda p: abs(p.x - x))
    return closest.y


def _compute_minimum_reflux(
    config: ColumnConfig,
    ix: float, iy: float,
    x_D: float,
    warnings: list[str],
) -> Optional[float]:
    """
    Estimate minimum reflux ratio.

    For a binary system with a single feed, R_min can be estimated from
    the intersection of the q-line with the equilibrium curve.

    The operating line at minimum reflux passes through (x_D, x_D) and
    the pinch point (x_q, y_q):
        R_min = (x_D - y_q) / (y_q - x_q)
    """
    try:
        q = config.feed_condition.q
        z_F = config.feed_composition
        components = config.components
        P_kPa = config.pressure_kPa

        # Find where q-line intersects equilibrium curve
        eq = equilibrium_curve(components, P_kPa, n_points=501)

        if abs(q - 1.0) < 1e-10:
            # Saturated liquid: q-line is vertical at x = z_F
            y_eq_at_zF = _interp_equilibrium(z_F, eq)
            x_q, y_q = z_F, y_eq_at_zF
        else:
            q_slope = q / (q - 1.0)
            q_intercept = -z_F / (q - 1.0)

            # Find intersection numerically
            best_x, best_y = z_F, _interp_equilibrium(z_F, eq)
            best_diff = float('inf')
            for pt in eq:
                y_qline = q_slope * pt.x + q_intercept
                diff = abs(pt.y - y_qline)
                if diff < best_diff:
                    best_diff = diff
                    best_x, best_y = pt.x, pt.y
            x_q, y_q = best_x, best_y

        denom = y_q - x_q
        if abs(denom) < 1e-12:
            return None

        R_min = (x_D - y_q) / denom
        return max(R_min, 0.0)

    except Exception as e:
        warnings.append(f"Could not compute minimum reflux: {e}")
        return None


def _empty_result(
    config: ColumnConfig,
    warnings: list[str],
    assumptions: list[str],
) -> McCabeThieleResult:
    """Return an empty result for infeasible configurations."""
    return McCabeThieleResult(
        config=config,
        rectifying_line=OperatingLine(0, 0, (0, 0)),
        stripping_line=OperatingLine(0, 0, (0, 0)),
        q_line_slope=None, q_line_intercept=None,
        intersection_x=0, intersection_y=0,
        equilibrium_curve=[],
        stages=[], num_theoretical_stages=0, feed_stage=0,
        distillate_flow=0, bottoms_flow=0,
        rectifying_liquid=0, rectifying_vapor=0,
        stripping_liquid=0, stripping_vapor=0,
        feed_balance_residual=0, component_balance_residual=0,
        converged=False, warnings=warnings, assumptions=assumptions,
    )


# ---------------------------------------------------------------------------
# Full distillation simulation
# ---------------------------------------------------------------------------

def simulate_distillation(config: ColumnConfig) -> DistillationResult:
    """
    Run a complete distillation simulation.

    Performs McCabe-Thiele analysis, generates stage profiles, and
    computes energy estimates.
    """
    mt = mccabe_thiele(config)

    # Build profiles
    temp_profile = [(s.stage_number, s.T_C) for s in mt.stages]
    comp_profile = [(s.stage_number, s.x, s.y) for s in mt.stages]

    # Recovery of light component in distillate
    F = config.feed_flow_mol_s
    z_F = config.feed_composition
    D = mt.distillate_flow
    x_D = config.distillate_composition
    recovery = (D * x_D) / (F * z_F) if F * z_F > 0 else 0.0

    return DistillationResult(
        mccabe_thiele=mt,
        stage_profiles=mt.stages,
        temperature_profile=temp_profile,
        composition_profile=comp_profile,
        condenser_duty_kW=mt.condenser_duty_kW,
        reboiler_duty_kW=mt.reboiler_duty_kW,
        distillate_purity=config.distillate_composition,
        bottoms_purity=1.0 - config.bottoms_composition,
        recovery=recovery,
        converged=mt.converged,
        solver_messages=mt.warnings,
    )
