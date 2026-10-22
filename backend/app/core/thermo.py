"""
Thermodynamics and vapor-liquid equilibrium calculations.

Implements:
  - Raoult's law VLE for ideal mixtures.
  - Bubble-point temperature calculation.
  - Dew-point temperature calculation.
  - Relative volatility.
  - Equilibrium curve generation.
  - Phase identification (subcooled, saturated, superheated).

Assumptions:
  - Ideal liquid mixture (activity coefficients = 1).
  - Ideal gas phase (fugacity coefficients = 1).
  - These assumptions are valid for similar, nonpolar molecules at low
    to moderate pressures (e.g., benzene–toluene at ~1 atm).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional, Tuple, List
import math

from .properties import Component, BENZENE, TOLUENE


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class VLEResult:
    """Result of a VLE flash calculation."""
    temperature_C: float
    pressure_kPa: float
    x: list[float]         # liquid mole fractions
    y: list[float]         # vapor mole fractions
    K: list[float]         # K-values (y_i/x_i)
    alpha: float           # relative volatility (K_1 / K_2)
    P_sat: list[float]     # saturation pressures in kPa
    converged: bool = True
    message: str = ""


@dataclass
class EquilibriumCurvePoint:
    """A single point on the x-y equilibrium curve."""
    x: float
    y: float
    T_C: float
    alpha: float


@dataclass
class PhaseInfo:
    """Phase identification result."""
    phase: str             # "subcooled_liquid", "bubble_point", "two_phase", "dew_point", "superheated_vapor"
    T_bubble_C: float
    T_dew_C: float
    message: str


# ---------------------------------------------------------------------------
# Core VLE: Raoult's Law
# ---------------------------------------------------------------------------

def raoults_law_y(
    x: list[float],
    P_sat: list[float],
    P_total: float,
) -> list[float]:
    """
    Calculate vapor-phase mole fractions from Raoult's law.

    y_i = x_i * P_sat_i / P_total

    Parameters
    ----------
    x : list[float]
        Liquid mole fractions.
    P_sat : list[float]
        Saturation pressures (same units as P_total).
    P_total : float
        Total system pressure.

    Returns
    -------
    list[float]
        Vapor mole fractions.
    """
    return [xi * pi / P_total for xi, pi in zip(x, P_sat)]


def bubble_pressure(
    x: list[float],
    components: list[Component],
    T_C: float,
) -> Tuple[float, list[float]]:
    """
    Calculate bubble-point pressure at given T and liquid composition.

    P_bubble = Σ x_i * P_sat_i(T)
    y_i = x_i * P_sat_i / P_bubble

    Returns
    -------
    (P_bubble_kPa, y_list)
    """
    P_sat = [c.saturation_pressure_kPa(T_C) for c in components]
    P_bub = sum(xi * pi for xi, pi in zip(x, P_sat))
    y = [xi * pi / P_bub for xi, pi in zip(x, P_sat)]
    return P_bub, y


def dew_pressure(
    y: list[float],
    components: list[Component],
    T_C: float,
) -> Tuple[float, list[float]]:
    """
    Calculate dew-point pressure at given T and vapor composition.

    1/P_dew = Σ y_i / P_sat_i(T)
    x_i = y_i * P_dew / P_sat_i

    Returns
    -------
    (P_dew_kPa, x_list)
    """
    P_sat = [c.saturation_pressure_kPa(T_C) for c in components]
    inv_P = sum(yi / pi for yi, pi in zip(y, P_sat))
    P_dew = 1.0 / inv_P
    x = [yi * P_dew / pi for yi, pi in zip(y, P_sat)]
    return P_dew, x


def bubble_temperature(
    x: list[float],
    components: list[Component],
    P_kPa: float,
    T_guess_C: float = 80.0,
    tol: float = 1e-6,
    max_iter: int = 200,
) -> VLEResult:
    """
    Calculate bubble-point temperature by iterative solution.

    At the bubble point: Σ x_i * P_sat_i(T) = P_total.

    Uses Newton-Raphson iteration.

    Parameters
    ----------
    x : list[float]
        Liquid mole fractions.
    components : list[Component]
        Component objects (same order as x).
    P_kPa : float
        Total system pressure in kPa.
    T_guess_C : float
        Initial temperature guess in °C.
    tol : float
        Convergence tolerance on Σ(x_i P_sat_i) / P - 1.
    max_iter : int
        Maximum iterations.

    Returns
    -------
    VLEResult
    """
    T = T_guess_C

    for iteration in range(max_iter):
        P_sat = [c.saturation_pressure_kPa(T) for c in components]
        f = sum(xi * pi for xi, pi in zip(x, P_sat)) - P_kPa

        # Numerical derivative dF/dT
        dT = 0.01
        P_sat_plus = [c.saturation_pressure_kPa(T + dT) for c in components]
        f_plus = sum(xi * pi for xi, pi in zip(x, P_sat_plus)) - P_kPa
        dfdt = (f_plus - f) / dT

        if abs(dfdt) < 1e-15:
            return VLEResult(
                temperature_C=T, pressure_kPa=P_kPa, x=x,
                y=[0.0] * len(x), K=[0.0] * len(x), alpha=0.0,
                P_sat=[p for p in P_sat], converged=False,
                message="Derivative near zero; solver stalled.",
            )

        T_new = T - f / dfdt
        if abs(T_new - T) < tol:
            P_sat_final = [c.saturation_pressure_kPa(T_new) for c in components]
            y = raoults_law_y(x, P_sat_final, P_kPa)
            K = [pi / P_kPa for pi in P_sat_final]
            alpha = K[0] / K[1] if len(K) >= 2 and K[1] > 0 else float('inf')
            return VLEResult(
                temperature_C=T_new, pressure_kPa=P_kPa, x=x, y=y,
                K=K, alpha=alpha, P_sat=P_sat_final,
                converged=True, message=f"Converged in {iteration+1} iterations.",
            )
        T = T_new

    P_sat = [c.saturation_pressure_kPa(T) for c in components]
    y = raoults_law_y(x, P_sat, P_kPa)
    K = [pi / P_kPa for pi in P_sat]
    alpha = K[0] / K[1] if len(K) >= 2 and K[1] > 0 else float('inf')
    return VLEResult(
        temperature_C=T, pressure_kPa=P_kPa, x=x, y=y,
        K=K, alpha=alpha, P_sat=P_sat,
        converged=False, message=f"Did not converge in {max_iter} iterations.",
    )


def dew_temperature(
    y: list[float],
    components: list[Component],
    P_kPa: float,
    T_guess_C: float = 90.0,
    tol: float = 1e-6,
    max_iter: int = 200,
) -> VLEResult:
    """
    Calculate dew-point temperature by iterative solution.

    At the dew point: Σ y_i / (P_sat_i(T) / P_total) = 1
    i.e., Σ y_i * P_total / P_sat_i(T) = 1.

    Parameters
    ----------
    y : list[float]
        Vapor mole fractions.
    components : list[Component]
        Component objects.
    P_kPa : float
        Total system pressure in kPa.
    T_guess_C : float
        Initial temperature guess in °C.

    Returns
    -------
    VLEResult
    """
    T = T_guess_C

    for iteration in range(max_iter):
        P_sat = [c.saturation_pressure_kPa(T) for c in components]
        f = sum(yi * P_kPa / pi for yi, pi in zip(y, P_sat)) - 1.0

        dT = 0.01
        P_sat_plus = [c.saturation_pressure_kPa(T + dT) for c in components]
        f_plus = sum(yi * P_kPa / pi for yi, pi in zip(y, P_sat_plus)) - 1.0
        dfdt = (f_plus - f) / dT

        if abs(dfdt) < 1e-15:
            return VLEResult(
                temperature_C=T, pressure_kPa=P_kPa,
                x=[0.0] * len(y), y=y,
                K=[0.0] * len(y), alpha=0.0,
                P_sat=P_sat, converged=False,
                message="Derivative near zero; solver stalled.",
            )

        T_new = T - f / dfdt
        if abs(T_new - T) < tol:
            P_sat_final = [c.saturation_pressure_kPa(T_new) for c in components]
            x = [yi * P_kPa / pi for yi, pi in zip(y, P_sat_final)]
            K = [pi / P_kPa for pi in P_sat_final]
            alpha = K[0] / K[1] if len(K) >= 2 and K[1] > 0 else float('inf')
            return VLEResult(
                temperature_C=T_new, pressure_kPa=P_kPa,
                x=x, y=y, K=K, alpha=alpha,
                P_sat=P_sat_final, converged=True,
                message=f"Converged in {iteration+1} iterations.",
            )
        T = T_new

    P_sat = [c.saturation_pressure_kPa(T) for c in components]
    x = [yi * P_kPa / pi for yi, pi in zip(y, P_sat)]
    K = [pi / P_kPa for pi in P_sat]
    alpha = K[0] / K[1] if len(K) >= 2 and K[1] > 0 else float('inf')
    return VLEResult(
        temperature_C=T, pressure_kPa=P_kPa, x=x, y=y,
        K=K, alpha=alpha, P_sat=P_sat,
        converged=False, message=f"Did not converge in {max_iter} iterations.",
    )


def relative_volatility(
    components: list[Component],
    T_C: float,
) -> float:
    """
    Calculate relative volatility α = P_sat_1 / P_sat_2 at temperature T.

    Component 1 is the more volatile (lower boiling point).
    """
    P1 = components[0].saturation_pressure_kPa(T_C)
    P2 = components[1].saturation_pressure_kPa(T_C)
    if P2 < 1e-15:
        return float('inf')
    return P1 / P2


def equilibrium_curve(
    components: list[Component],
    P_kPa: float,
    n_points: int = 101,
) -> list[EquilibriumCurvePoint]:
    """
    Generate the x-y equilibrium diagram for a binary system.

    Computes bubble-point temperature at each x to find y.

    Parameters
    ----------
    components : list[Component]
        Exactly two components, more-volatile first.
    P_kPa : float
        System pressure in kPa.
    n_points : int
        Number of points from x=0 to x=1.

    Returns
    -------
    list[EquilibriumCurvePoint]
    """
    if len(components) != 2:
        raise ValueError("Equilibrium curve requires exactly 2 components.")

    curve = []
    T_guess = (components[0].normal_boiling_point_K +
               components[1].normal_boiling_point_K) / 2.0 - 273.15

    for i in range(n_points):
        x1 = i / (n_points - 1)
        x = [x1, 1.0 - x1]
        result = bubble_temperature(x, components, P_kPa, T_guess_C=T_guess)
        if result.converged:
            T_guess = result.temperature_C  # warm start
            alpha = relative_volatility(components, result.temperature_C)
            curve.append(EquilibriumCurvePoint(
                x=x1, y=result.y[0], T_C=result.temperature_C, alpha=alpha
            ))
        else:
            # Fallback: use constant relative volatility approximation
            alpha_avg = relative_volatility(components, T_guess)
            y_approx = alpha_avg * x1 / (1 + (alpha_avg - 1) * x1)
            curve.append(EquilibriumCurvePoint(
                x=x1, y=y_approx, T_C=T_guess, alpha=alpha_avg
            ))

    return curve


def identify_phase(
    z: list[float],
    components: list[Component],
    T_C: float,
    P_kPa: float,
) -> PhaseInfo:
    """
    Identify the phase state of a mixture at given T, P, z.

    Returns the phase classification and bubble/dew temperatures.
    """
    bub = bubble_temperature(z, components, P_kPa, T_guess_C=T_C)
    dew = dew_temperature(z, components, P_kPa, T_guess_C=T_C)

    T_bub = bub.temperature_C if bub.converged else float('nan')
    T_dew = dew.temperature_C if dew.converged else float('nan')

    tol = 0.1  # °C

    if math.isnan(T_bub) or math.isnan(T_dew):
        return PhaseInfo(
            phase="unknown", T_bubble_C=T_bub, T_dew_C=T_dew,
            message="Could not determine bubble and/or dew point."
        )

    if T_C < T_bub - tol:
        phase = "subcooled_liquid"
        msg = f"T = {T_C:.1f}°C < T_bubble = {T_bub:.1f}°C → subcooled liquid."
    elif abs(T_C - T_bub) <= tol:
        phase = "bubble_point"
        msg = f"T ≈ T_bubble = {T_bub:.1f}°C → bubble point (saturated liquid)."
    elif T_bub < T_C < T_dew:
        phase = "two_phase"
        msg = f"T_bubble = {T_bub:.1f}°C < T = {T_C:.1f}°C < T_dew = {T_dew:.1f}°C → two-phase."
    elif abs(T_C - T_dew) <= tol:
        phase = "dew_point"
        msg = f"T ≈ T_dew = {T_dew:.1f}°C → dew point (saturated vapor)."
    else:
        phase = "superheated_vapor"
        msg = f"T = {T_C:.1f}°C > T_dew = {T_dew:.1f}°C → superheated vapor."

    return PhaseInfo(
        phase=phase, T_bubble_C=T_bub, T_dew_C=T_dew, message=msg
    )


# ---------------------------------------------------------------------------
# Binary VLE convenience (for distillation module)
# ---------------------------------------------------------------------------

def binary_vle_at_x(
    x1: float,
    components: list[Component],
    P_kPa: float,
) -> VLEResult:
    """Convenience: compute VLE for a binary at given x_1."""
    x = [x1, 1.0 - x1]
    T_guess = (components[0].normal_boiling_point_K * (1 - x1)
               + components[1].normal_boiling_point_K * x1) / 1.0 - 273.15
    # Better guess: weighted average of boiling points
    T_guess = (components[0].normal_boiling_point_K * x1
               + components[1].normal_boiling_point_K * (1 - x1)) - 273.15
    return bubble_temperature(x, components, P_kPa, T_guess_C=T_guess)
