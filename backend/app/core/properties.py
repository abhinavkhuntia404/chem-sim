"""
Component property database for chemical engineering calculations.

Contains thermophysical properties for common chemicals used in
distillation and process engineering.

Data sources:
  - Antoine coefficients: Dean, J.A., Lange's Handbook of Chemistry, 15th ed.
    Form: log10(P_sat/mmHg) = A - B / (C + T/°C)
  - Heat capacities (ideal gas): Smith, Van Ness, Abbott,
    Introduction to Chemical Engineering Thermodynamics, 8th ed.
    Form: Cp/(J/(mol·K)) = a + b·T + c·T² + d·T³, T in K
  - Heat of vaporization: Perry's Chemical Engineers' Handbook, 9th ed.
  - Critical properties: Reid, Prausnitz, Poling,
    The Properties of Gases and Liquids, 5th ed.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional, Dict
import math


@dataclass(frozen=True)
class AntoineCoefficients:
    """
    Antoine equation coefficients.

    log10(P_sat / mmHg) = A - B / (C + T)
    where T is in °C.

    Attributes
    ----------
    A, B, C : float
        Antoine constants.
    T_min_C : float
        Lower validity bound (°C).
    T_max_C : float
        Upper validity bound (°C).
    source : str
        Literature reference.
    """
    A: float
    B: float
    C: float
    T_min_C: float
    T_max_C: float
    source: str = "Lange's Handbook of Chemistry, 15th ed."


@dataclass(frozen=True)
class IdealGasCpCoefficients:
    """
    Ideal gas heat capacity polynomial coefficients.

    Cp / (J/(mol·K)) = a + b·T + c·T² + d·T³
    where T is in K.
    """
    a: float
    b: float
    c: float
    d: float
    T_min_K: float
    T_max_K: float
    source: str = "Smith, Van Ness, Abbott, 8th ed."


@dataclass(frozen=True)
class Component:
    """
    Chemical component with thermophysical properties.

    All properties are at standard conditions unless noted.
    """
    name: str
    formula: str
    cas_number: str
    molecular_weight: float          # g/mol
    normal_boiling_point_K: float    # K at 1 atm
    critical_temperature_K: float    # K
    critical_pressure_bar: float     # bar
    acentric_factor: float           # dimensionless
    heat_of_vaporization_kJ_mol: float  # kJ/mol at normal boiling point
    liquid_density_kg_m3: float      # kg/m³ at 20°C, 1 atm
    liquid_Cp_J_mol_K: float         # J/(mol·K) at 25°C (approximate)
    antoine: AntoineCoefficients
    ideal_gas_Cp: IdealGasCpCoefficients

    @property
    def normal_boiling_point_C(self) -> float:
        """Normal boiling point in degrees Celsius."""
        return self.normal_boiling_point_K - 273.15

    def saturation_pressure_mmHg(self, T_C: float) -> float:
        """
        Calculate saturation vapor pressure using the Antoine equation.

        Parameters
        ----------
        T_C : float
            Temperature in °C.

        Returns
        -------
        float
            Saturation pressure in mmHg.

        Raises
        ------
        ValueError
            If temperature is outside the validity range.
        """
        if T_C + self.antoine.C <= 0.1:
            raise ValueError(
                f"Temperature {T_C:.1f}°C is below Antoine singularity {-self.antoine.C}°C for {self.name}."
            )
        log_p = self.antoine.A - self.antoine.B / (self.antoine.C + T_C)
        return 10.0 ** log_p

    def saturation_pressure_Pa(self, T_C: float) -> float:
        """Saturation pressure in Pa."""
        return self.saturation_pressure_mmHg(T_C) * 133.322

    def saturation_pressure_kPa(self, T_C: float) -> float:
        """Saturation pressure in kPa."""
        return self.saturation_pressure_Pa(T_C) / 1000.0

    def ideal_gas_Cp_J_mol_K(self, T_K: float) -> float:
        """
        Ideal gas heat capacity at temperature T.

        Parameters
        ----------
        T_K : float
            Temperature in K.

        Returns
        -------
        float
            Cp in J/(mol·K).
        """
        c = self.ideal_gas_Cp
        return c.a + c.b * T_K + c.c * T_K**2 + c.d * T_K**3

    def is_antoine_valid(self, T_C: float) -> bool:
        """Check if temperature is within Antoine validity range."""
        return self.antoine.T_min_C <= T_C <= self.antoine.T_max_C


# ============================================================================
# Component Database
# ============================================================================

BENZENE = Component(
    name="Benzene",
    formula="C₆H₆",
    cas_number="71-43-2",
    molecular_weight=78.114,
    normal_boiling_point_K=353.24,
    critical_temperature_K=562.05,
    critical_pressure_bar=48.98,
    acentric_factor=0.210,
    heat_of_vaporization_kJ_mol=30.72,
    liquid_density_kg_m3=879.0,
    liquid_Cp_J_mol_K=135.7,
    antoine=AntoineCoefficients(
        A=6.90565,
        B=1211.033,
        C=220.790,
        T_min_C=8.0,
        T_max_C=130.0,
    ),
    ideal_gas_Cp=IdealGasCpCoefficients(
        a=-33.917,
        b=0.47436,
        c=-3.0170e-4,
        d=7.130e-8,
        T_min_K=298.0,
        T_max_K=1500.0,
    ),
)

TOLUENE = Component(
    name="Toluene",
    formula="C₇H₈",
    cas_number="108-88-3",
    molecular_weight=92.141,
    normal_boiling_point_K=383.78,
    critical_temperature_K=591.75,
    critical_pressure_bar=41.08,
    acentric_factor=0.264,
    heat_of_vaporization_kJ_mol=33.18,
    liquid_density_kg_m3=867.0,
    liquid_Cp_J_mol_K=157.3,
    antoine=AntoineCoefficients(
        A=6.95464,
        B=1344.800,
        C=219.482,
        T_min_C=6.0,
        T_max_C=137.0,
    ),
    ideal_gas_Cp=IdealGasCpCoefficients(
        a=-24.352,
        b=0.51238,
        c=-2.7650e-4,
        d=4.911e-8,
        T_min_K=298.0,
        T_max_K=1500.0,
    ),
)

WATER = Component(
    name="Water",
    formula="H₂O",
    cas_number="7732-18-5",
    molecular_weight=18.015,
    normal_boiling_point_K=373.15,
    critical_temperature_K=647.10,
    critical_pressure_bar=220.64,
    acentric_factor=0.344,
    heat_of_vaporization_kJ_mol=40.65,
    liquid_density_kg_m3=998.0,
    liquid_Cp_J_mol_K=75.38,
    antoine=AntoineCoefficients(
        A=8.07131,
        B=1730.63,
        C=233.426,
        T_min_C=1.0,
        T_max_C=100.0,
    ),
    ideal_gas_Cp=IdealGasCpCoefficients(
        a=32.218,
        b=0.19225e-2,
        c=1.0548e-5,
        d=-3.5950e-9,
        T_min_K=273.0,
        T_max_K=1800.0,
    ),
)

ETHANOL = Component(
    name="Ethanol",
    formula="C₂H₅OH",
    cas_number="64-17-5",
    molecular_weight=46.069,
    normal_boiling_point_K=351.44,
    critical_temperature_K=513.92,
    critical_pressure_bar=61.48,
    acentric_factor=0.645,
    heat_of_vaporization_kJ_mol=38.56,
    liquid_density_kg_m3=789.0,
    liquid_Cp_J_mol_K=112.4,
    antoine=AntoineCoefficients(
        A=8.11220,
        B=1592.864,
        C=226.184,
        T_min_C=20.0,
        T_max_C=93.0,
    ),
    ideal_gas_Cp=IdealGasCpCoefficients(
        a=9.014,
        b=0.21399,
        c=-1.0145e-4,
        d=2.006e-8,
        T_min_K=273.0,
        T_max_K=1500.0,
    ),
)

METHANOL = Component(
    name="Methanol",
    formula="CH₃OH",
    cas_number="67-56-1",
    molecular_weight=32.042,
    normal_boiling_point_K=337.69,
    critical_temperature_K=512.64,
    critical_pressure_bar=80.97,
    acentric_factor=0.566,
    heat_of_vaporization_kJ_mol=35.21,
    liquid_density_kg_m3=791.0,
    liquid_Cp_J_mol_K=81.1,
    antoine=AntoineCoefficients(
        A=7.87863,
        B=1473.11,
        C=230.0,
        T_min_C=15.0,
        T_max_C=84.0,
    ),
    ideal_gas_Cp=IdealGasCpCoefficients(
        a=21.152,
        b=0.07092,
        c=2.587e-5,
        d=-2.852e-8,
        T_min_K=273.0,
        T_max_K=1000.0,
    ),
)

N_HEXANE = Component(
    name="n-Hexane",
    formula="C₆H₁₄",
    cas_number="110-54-3",
    molecular_weight=86.178,
    normal_boiling_point_K=341.88,
    critical_temperature_K=507.60,
    critical_pressure_bar=30.25,
    acentric_factor=0.301,
    heat_of_vaporization_kJ_mol=28.85,
    liquid_density_kg_m3=659.0,
    liquid_Cp_J_mol_K=195.6,
    antoine=AntoineCoefficients(
        A=6.87776,
        B=1171.53,
        C=224.366,
        T_min_C=-25.0,
        T_max_C=92.0,
    ),
    ideal_gas_Cp=IdealGasCpCoefficients(
        a=-4.413,
        b=0.58197,
        c=-3.119e-4,
        d=6.494e-8,
        T_min_K=298.0,
        T_max_K=1500.0,
    ),
)

ACETONE = Component(
    name="Acetone",
    formula="(CH₃)₂CO",
    cas_number="67-64-1",
    molecular_weight=58.080,
    normal_boiling_point_K=329.20,
    critical_temperature_K=508.20,
    critical_pressure_bar=47.01,
    acentric_factor=0.307,
    heat_of_vaporization_kJ_mol=29.10,
    liquid_density_kg_m3=790.0,
    liquid_Cp_J_mol_K=125.5,
    antoine=AntoineCoefficients(
        A=7.02447,
        B=1161.0,
        C=224.0,
        T_min_C=-20.0,
        T_max_C=77.0,
    ),
    ideal_gas_Cp=IdealGasCpCoefficients(
        a=6.301,
        b=0.26107,
        c=-1.253e-4,
        d=2.038e-8,
        T_min_K=273.0,
        T_max_K=1000.0,
    ),
)


# Registry for lookup by name
COMPONENT_DB: Dict[str, Component] = {
    "benzene": BENZENE,
    "toluene": TOLUENE,
    "water": WATER,
    "ethanol": ETHANOL,
    "methanol": METHANOL,
    "n-hexane": N_HEXANE,
    "hexane": N_HEXANE,
    "acetone": ACETONE,
}


def get_component(name: str) -> Component:
    """
    Look up a component by name (case-insensitive).

    Raises
    ------
    KeyError
        If the component is not in the database.
    """
    key = name.lower().strip()
    if key not in COMPONENT_DB:
        available = ", ".join(sorted(COMPONENT_DB.keys()))
        raise KeyError(
            f"Component '{name}' not found. Available: {available}"
        )
    return COMPONENT_DB[key]


def list_components() -> list[str]:
    """Return sorted list of available component names."""
    return sorted(set(c.name for c in COMPONENT_DB.values()))
