"""
Unit conversion system for chemical engineering calculations.

Supports common SI and engineering units with dimensional safety.
Rejects incompatible conversions and prevents silent unit mismatches.
"""

from __future__ import annotations
from enum import Enum
from typing import Dict, Tuple, Optional
import math


class Dimension(Enum):
    """Physical dimensions for unit compatibility checking."""
    TEMPERATURE = "temperature"
    PRESSURE = "pressure"
    MASS = "mass"
    MOLES = "moles"
    MASS_FLOW = "mass_flow"
    MOLAR_FLOW = "molar_flow"
    VOLUME = "volume"
    VOLUMETRIC_FLOW = "volumetric_flow"
    ENERGY = "energy"
    POWER = "power"
    LENGTH = "length"
    AREA = "area"
    TIME = "time"
    DENSITY = "density"
    SPECIFIC_HEAT_MASS = "specific_heat_mass"
    SPECIFIC_HEAT_MOLAR = "specific_heat_molar"
    HEAT_TRANSFER_COEFF = "heat_transfer_coeff"
    ENTHALPY_MASS = "enthalpy_mass"
    ENTHALPY_MOLAR = "enthalpy_molar"
    DIMENSIONLESS = "dimensionless"
    DYNAMIC_VISCOSITY = "dynamic_viscosity"
    THERMAL_CONDUCTIVITY = "thermal_conductivity"


class UnitError(Exception):
    """Raised for incompatible unit operations."""
    pass


# ---------------------------------------------------------------------------
# Unit Registry
#
# Each unit is mapped to (dimension, factor, offset) where:
#   value_in_base = value * factor + offset
#   value_in_unit = (value_in_base - offset) / factor
#
# Base units: K, Pa, kg, mol, m³, J, W, m, m², s, kg/m³
# Temperature uses affine transforms; all others are linear (offset=0).
# ---------------------------------------------------------------------------

_UNIT_REGISTRY: Dict[str, Tuple[Dimension, float, float]] = {
    # --- Temperature (base: K) ---
    "K":    (Dimension.TEMPERATURE, 1.0,       0.0),
    "°C":   (Dimension.TEMPERATURE, 1.0,     273.15),
    "C":    (Dimension.TEMPERATURE, 1.0,     273.15),
    "°F":   (Dimension.TEMPERATURE, 5.0/9.0, 255.3722222),  # (°F + 459.67) * 5/9
    "F":    (Dimension.TEMPERATURE, 5.0/9.0, 255.3722222),
    "°R":   (Dimension.TEMPERATURE, 5.0/9.0,   0.0),
    "R":    (Dimension.TEMPERATURE, 5.0/9.0,   0.0),

    # --- Pressure (base: Pa) ---
    "Pa":   (Dimension.PRESSURE, 1.0, 0.0),
    "kPa":  (Dimension.PRESSURE, 1.0e3, 0.0),
    "MPa":  (Dimension.PRESSURE, 1.0e6, 0.0),
    "bar":  (Dimension.PRESSURE, 1.0e5, 0.0),
    "atm":  (Dimension.PRESSURE, 101325.0, 0.0),
    "mmHg": (Dimension.PRESSURE, 133.322, 0.0),
    "torr": (Dimension.PRESSURE, 133.322, 0.0),
    "psi":  (Dimension.PRESSURE, 6894.757, 0.0),

    # --- Mass (base: kg) ---
    "kg":   (Dimension.MASS, 1.0, 0.0),
    "g":    (Dimension.MASS, 1.0e-3, 0.0),
    "mg":   (Dimension.MASS, 1.0e-6, 0.0),
    "lb":   (Dimension.MASS, 0.453592, 0.0),
    "oz":   (Dimension.MASS, 0.0283495, 0.0),
    "tonne": (Dimension.MASS, 1000.0, 0.0),

    # --- Moles (base: mol) ---
    "mol":   (Dimension.MOLES, 1.0, 0.0),
    "kmol":  (Dimension.MOLES, 1000.0, 0.0),
    "mmol":  (Dimension.MOLES, 1.0e-3, 0.0),
    "lbmol": (Dimension.MOLES, 453.592, 0.0),

    # --- Mass flow (base: kg/s) ---
    "kg/s":   (Dimension.MASS_FLOW, 1.0, 0.0),
    "kg/h":   (Dimension.MASS_FLOW, 1.0/3600.0, 0.0),
    "kg/min": (Dimension.MASS_FLOW, 1.0/60.0, 0.0),
    "g/s":    (Dimension.MASS_FLOW, 1.0e-3, 0.0),
    "lb/h":   (Dimension.MASS_FLOW, 0.453592/3600.0, 0.0),
    "tonne/h": (Dimension.MASS_FLOW, 1000.0/3600.0, 0.0),

    # --- Molar flow (base: mol/s) ---
    "mol/s":   (Dimension.MOLAR_FLOW, 1.0, 0.0),
    "mol/h":   (Dimension.MOLAR_FLOW, 1.0/3600.0, 0.0),
    "mol/min": (Dimension.MOLAR_FLOW, 1.0/60.0, 0.0),
    "kmol/s":  (Dimension.MOLAR_FLOW, 1000.0, 0.0),
    "kmol/h":  (Dimension.MOLAR_FLOW, 1000.0/3600.0, 0.0),

    # --- Volume (base: m³) ---
    "m3":   (Dimension.VOLUME, 1.0, 0.0),
    "m³":   (Dimension.VOLUME, 1.0, 0.0),
    "L":    (Dimension.VOLUME, 1.0e-3, 0.0),
    "mL":   (Dimension.VOLUME, 1.0e-6, 0.0),
    "cm3":  (Dimension.VOLUME, 1.0e-6, 0.0),
    "cm³":  (Dimension.VOLUME, 1.0e-6, 0.0),
    "ft3":  (Dimension.VOLUME, 0.0283168, 0.0),
    "ft³":  (Dimension.VOLUME, 0.0283168, 0.0),
    "gal":  (Dimension.VOLUME, 3.78541e-3, 0.0),

    # --- Volumetric flow (base: m³/s) ---
    "m3/s":  (Dimension.VOLUMETRIC_FLOW, 1.0, 0.0),
    "m³/s":  (Dimension.VOLUMETRIC_FLOW, 1.0, 0.0),
    "m3/h":  (Dimension.VOLUMETRIC_FLOW, 1.0/3600.0, 0.0),
    "L/s":   (Dimension.VOLUMETRIC_FLOW, 1.0e-3, 0.0),
    "L/min": (Dimension.VOLUMETRIC_FLOW, 1.0e-3/60.0, 0.0),
    "L/h":   (Dimension.VOLUMETRIC_FLOW, 1.0e-3/3600.0, 0.0),

    # --- Energy (base: J) ---
    "J":    (Dimension.ENERGY, 1.0, 0.0),
    "kJ":   (Dimension.ENERGY, 1.0e3, 0.0),
    "MJ":   (Dimension.ENERGY, 1.0e6, 0.0),
    "cal":  (Dimension.ENERGY, 4.184, 0.0),
    "kcal": (Dimension.ENERGY, 4184.0, 0.0),
    "BTU":  (Dimension.ENERGY, 1055.06, 0.0),
    "Wh":   (Dimension.ENERGY, 3600.0, 0.0),
    "kWh":  (Dimension.ENERGY, 3.6e6, 0.0),

    # --- Power (base: W) ---
    "W":    (Dimension.POWER, 1.0, 0.0),
    "kW":   (Dimension.POWER, 1.0e3, 0.0),
    "MW":   (Dimension.POWER, 1.0e6, 0.0),
    "hp":   (Dimension.POWER, 745.7, 0.0),
    "BTU/h": (Dimension.POWER, 0.29307, 0.0),
    "kcal/h": (Dimension.POWER, 1.163, 0.0),

    # --- Length (base: m) ---
    "m":    (Dimension.LENGTH, 1.0, 0.0),
    "cm":   (Dimension.LENGTH, 0.01, 0.0),
    "mm":   (Dimension.LENGTH, 0.001, 0.0),
    "in":   (Dimension.LENGTH, 0.0254, 0.0),
    "ft":   (Dimension.LENGTH, 0.3048, 0.0),
    "yd":   (Dimension.LENGTH, 0.9144, 0.0),
    "km":   (Dimension.LENGTH, 1000.0, 0.0),
    "mi":   (Dimension.LENGTH, 1609.34, 0.0),

    # --- Area (base: m²) ---
    "m2":   (Dimension.AREA, 1.0, 0.0),
    "m²":   (Dimension.AREA, 1.0, 0.0),
    "cm2":  (Dimension.AREA, 1.0e-4, 0.0),
    "cm²":  (Dimension.AREA, 1.0e-4, 0.0),
    "mm2":  (Dimension.AREA, 1.0e-6, 0.0),
    "ft2":  (Dimension.AREA, 0.092903, 0.0),
    "ft²":  (Dimension.AREA, 0.092903, 0.0),
    "in2":  (Dimension.AREA, 6.4516e-4, 0.0),

    # --- Time (base: s) ---
    "s":    (Dimension.TIME, 1.0, 0.0),
    "min":  (Dimension.TIME, 60.0, 0.0),
    "h":    (Dimension.TIME, 3600.0, 0.0),
    "hr":   (Dimension.TIME, 3600.0, 0.0),
    "day":  (Dimension.TIME, 86400.0, 0.0),

    # --- Density (base: kg/m³) ---
    "kg/m3":  (Dimension.DENSITY, 1.0, 0.0),
    "kg/m³":  (Dimension.DENSITY, 1.0, 0.0),
    "g/mL":   (Dimension.DENSITY, 1000.0, 0.0),
    "g/cm3":  (Dimension.DENSITY, 1000.0, 0.0),
    "g/L":    (Dimension.DENSITY, 1.0, 0.0),
    "lb/ft3":  (Dimension.DENSITY, 16.0185, 0.0),

    # --- Specific heat, mass basis (base: J/(kg·K)) ---
    "J/(kg·K)":   (Dimension.SPECIFIC_HEAT_MASS, 1.0, 0.0),
    "J/(kg*K)":   (Dimension.SPECIFIC_HEAT_MASS, 1.0, 0.0),
    "kJ/(kg·K)":  (Dimension.SPECIFIC_HEAT_MASS, 1000.0, 0.0),
    "kJ/(kg*K)":  (Dimension.SPECIFIC_HEAT_MASS, 1000.0, 0.0),
    "cal/(g·°C)": (Dimension.SPECIFIC_HEAT_MASS, 4184.0, 0.0),
    "BTU/(lb·°F)": (Dimension.SPECIFIC_HEAT_MASS, 4186.8, 0.0),

    # --- Specific heat, molar basis (base: J/(mol·K)) ---
    "J/(mol·K)":  (Dimension.SPECIFIC_HEAT_MOLAR, 1.0, 0.0),
    "J/(mol*K)":  (Dimension.SPECIFIC_HEAT_MOLAR, 1.0, 0.0),
    "kJ/(mol·K)": (Dimension.SPECIFIC_HEAT_MOLAR, 1000.0, 0.0),
    "kJ/(kmol·K)": (Dimension.SPECIFIC_HEAT_MOLAR, 1.0, 0.0),
    "cal/(mol·K)": (Dimension.SPECIFIC_HEAT_MOLAR, 4.184, 0.0),

    # --- Heat transfer coefficient (base: W/(m²·K)) ---
    "W/(m2·K)":  (Dimension.HEAT_TRANSFER_COEFF, 1.0, 0.0),
    "W/(m²·K)":  (Dimension.HEAT_TRANSFER_COEFF, 1.0, 0.0),
    "W/(m2*K)":  (Dimension.HEAT_TRANSFER_COEFF, 1.0, 0.0),
    "kW/(m2·K)": (Dimension.HEAT_TRANSFER_COEFF, 1000.0, 0.0),

    # --- Enthalpy, mass basis (base: J/kg) ---
    "J/kg":   (Dimension.ENTHALPY_MASS, 1.0, 0.0),
    "kJ/kg":  (Dimension.ENTHALPY_MASS, 1000.0, 0.0),
    "BTU/lb": (Dimension.ENTHALPY_MASS, 2326.0, 0.0),

    # --- Enthalpy, molar basis (base: J/mol) ---
    "J/mol":   (Dimension.ENTHALPY_MOLAR, 1.0, 0.0),
    "kJ/mol":  (Dimension.ENTHALPY_MOLAR, 1000.0, 0.0),
    "kJ/kmol": (Dimension.ENTHALPY_MOLAR, 1.0, 0.0),
    "cal/mol": (Dimension.ENTHALPY_MOLAR, 4.184, 0.0),
    "kcal/mol": (Dimension.ENTHALPY_MOLAR, 4184.0, 0.0),
}


def get_dimension(unit: str) -> Dimension:
    """Return the physical dimension of a unit string."""
    if unit not in _UNIT_REGISTRY:
        raise UnitError(f"Unknown unit: '{unit}'")
    return _UNIT_REGISTRY[unit][0]


def convert(value: float, from_unit: str, to_unit: str) -> float:
    """
    Convert a scalar value between compatible units.

    Parameters
    ----------
    value : float
        Numeric value in `from_unit`.
    from_unit : str
        Source unit string (must be in the registry).
    to_unit : str
        Target unit string (must be in the registry).

    Returns
    -------
    float
        The converted value in `to_unit`.

    Raises
    ------
    UnitError
        If either unit is unknown or the units have incompatible dimensions.
    """
    if from_unit == to_unit:
        return value

    if from_unit not in _UNIT_REGISTRY:
        raise UnitError(f"Unknown source unit: '{from_unit}'")
    if to_unit not in _UNIT_REGISTRY:
        raise UnitError(f"Unknown target unit: '{to_unit}'")

    dim_from, factor_from, offset_from = _UNIT_REGISTRY[from_unit]
    dim_to, factor_to, offset_to = _UNIT_REGISTRY[to_unit]

    if dim_from != dim_to:
        raise UnitError(
            f"Incompatible dimensions: '{from_unit}' ({dim_from.value}) "
            f"→ '{to_unit}' ({dim_to.value})"
        )

    # Convert to base: base = value * factor + offset
    base_value = value * factor_from + offset_from
    # Convert from base: result = (base - offset) / factor
    result = (base_value - offset_to) / factor_to
    return result


def list_units(dimension: Optional[Dimension] = None) -> Dict[str, Dimension]:
    """
    List available units, optionally filtered by dimension.

    Returns
    -------
    dict
        Mapping of unit string → dimension.
    """
    if dimension is None:
        return {k: v[0] for k, v in _UNIT_REGISTRY.items()}
    return {k: v[0] for k, v in _UNIT_REGISTRY.items() if v[0] == dimension}


def list_compatible(unit: str) -> list[str]:
    """
    List all units that share the same dimension as the given unit.
    """
    dim = get_dimension(unit)
    return [u for u, (d, _, _) in _UNIT_REGISTRY.items() if d == dim]


def validate_unit(unit: str, expected_dimension: Dimension) -> None:
    """
    Validate that a unit string matches an expected dimension.

    Raises
    ------
    UnitError
        If the unit is unknown or has the wrong dimension.
    """
    dim = get_dimension(unit)
    if dim != expected_dimension:
        raise UnitError(
            f"Unit '{unit}' has dimension '{dim.value}', "
            f"expected '{expected_dimension.value}'"
        )


# ---------------------------------------------------------------------------
# Composition utilities
# ---------------------------------------------------------------------------

def mole_to_mass_fraction(
    mole_fractions: list[float],
    molecular_weights: list[float],
) -> list[float]:
    """
    Convert mole fractions to mass fractions.

    Parameters
    ----------
    mole_fractions : list[float]
        Mole fractions (must sum to ~1.0).
    molecular_weights : list[float]
        Molecular weights in g/mol for each component.

    Returns
    -------
    list[float]
        Mass fractions.
    """
    if len(mole_fractions) != len(molecular_weights):
        raise ValueError("Mole fractions and molecular weights must have the same length.")

    total = sum(x * mw for x, mw in zip(mole_fractions, molecular_weights))
    if total <= 0:
        raise ValueError("Total weighted molecular weight must be positive.")

    return [(x * mw) / total for x, mw in zip(mole_fractions, molecular_weights)]


def mass_to_mole_fraction(
    mass_fractions: list[float],
    molecular_weights: list[float],
) -> list[float]:
    """
    Convert mass fractions to mole fractions.

    Parameters
    ----------
    mass_fractions : list[float]
        Mass fractions (must sum to ~1.0).
    molecular_weights : list[float]
        Molecular weights in g/mol for each component.

    Returns
    -------
    list[float]
        Mole fractions.
    """
    if len(mass_fractions) != len(molecular_weights):
        raise ValueError("Mass fractions and molecular weights must have the same length.")

    total = sum(w / mw for w, mw in zip(mass_fractions, molecular_weights))
    if total <= 0:
        raise ValueError("Total weighted inverse molecular weight must be positive.")

    return [(w / mw) / total for w, mw in zip(mass_fractions, molecular_weights)]


def normalize_fractions(fractions: list[float], tol: float = 1e-6) -> list[float]:
    """
    Normalize a list of fractions to sum to exactly 1.0.

    Raises ValueError if any fraction is negative or the sum deviates
    from 1.0 by more than `tol` before normalization, unless the sum is
    very close to 1.0.
    """
    if any(f < -tol for f in fractions):
        raise ValueError(f"Negative fraction detected: {fractions}")

    total = sum(fractions)
    if abs(total) < 1e-15:
        raise ValueError("Sum of fractions is effectively zero.")

    if abs(total - 1.0) > tol:
        raise ValueError(
            f"Fractions sum to {total:.6f}, which deviates from 1.0 "
            f"by more than tolerance {tol}."
        )

    return [f / total for f in fractions]
