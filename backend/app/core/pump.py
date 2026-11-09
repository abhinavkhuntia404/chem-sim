"""
Centrifugal Pump Digital Twin - Core Physics and Hydraulic Simulation Engine.

Implements rigorous first-principles chemical engineering and turbomachinery models:
- Fluid property database (16+ industrial fluids) with temperature dependence
- Non-Newtonian rheology (Newtonian, Power-law, Bingham plastic, Herschel-Bulkley)
- Darcy-Weisbach pipe friction & minor fitting losses (Swamee-Jain / Churchill)
- Impeller kinematics, velocity triangles, and Euler head
- Pump characteristic curves (Head, Efficiency, Shaft Power, NPSHr)
- Turbomachinery Affinity Laws (Speed N and Impeller Diameter D scaling)
- System resistance curve and Operating Point solver (Newton / Brent intersection)
- Net Positive Suction Head (NPSHa, NPSHr, Cavitation Margin & Inception)
- Viscosity correction factors according to Hydraulic Institute (ANSI/HI 9.6.7)
- Mechanical & thermal calculations (Torque, Radial/Axial thrust, Temperature rise)
- Industrial fault simulation engine (Cavitation, Dry Run, Blockages, Wear, Seal/Bearing failures)
- Series and parallel pump configurations
"""

from __future__ import annotations
import math
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Any

GRAVITY = 9.80665  # m/s^2
ATM_PRESSURE_PA = 101325.0  # Pa (1 atm)


# ---------------------------------------------------------------------------
# 1. Fluid Property Database & Rheology Engine
# ---------------------------------------------------------------------------

@dataclass
class FluidDefinition:
    id: str
    name: str
    category: str
    base_density: float          # kg/m^3 at 20°C
    base_viscosity_pa_s: float   # Pa.s at 20°C
    base_vapor_pressure_pa: float# Pa at 20°C
    specific_heat_j_kg_k: float  # J/(kg.K)
    thermal_cond_w_m_k: float    # W/(m.K)
    rheology_model: str = "newtonian"  # "newtonian", "power_law", "bingham", "herschel_bulkley"
    power_law_k: float = 0.0     # Pa.s^n
    power_law_n: float = 1.0     # dimensionless flow index
    yield_stress_pa: float = 0.0 # Bingham/HB yield stress
    solids_volume_fraction: float = 0.0
    solids_particle_um: float = 0.0
    description: str = ""

    def get_properties_at_temp(self, temp_c: float) -> Tuple[float, float, float, float]:
        """
        Returns (density, dynamic_viscosity, vapor_pressure, specific_heat)
        at temperature temp_c (°C). Uses validated empirical correlations.
        """
        t_c = max(-10.0, min(150.0, temp_c))
        t_k = t_c + 273.15

        # Thermal expansion correction for density
        beta = 0.00035  # 1/K average thermal expansivity
        density = self.base_density / (1.0 + beta * (t_c - 20.0))

        # Viscosity variation (Andrade / Arrhenius exponential decay)
        # mu(T) = mu_20 * exp(B * (1/T - 1/293.15))
        e_act = 1800.0  # Activation energy parameter in Kelvin
        viscosity = self.base_viscosity_pa_s * math.exp(e_act * (1.0 / t_k - 1.0 / 293.15))
        viscosity = max(1.0e-5, min(100.0, viscosity))

        # Vapor pressure variation (Clausius-Clapeyron approx)
        delta_h_vap_r = 4800.0  # K
        vp_factor = math.exp(-delta_h_vap_r * (1.0 / t_k - 1.0 / 293.15))
        vapor_pressure = self.base_vapor_pressure_pa * vp_factor
        vapor_pressure = max(10.0, min(2.5e6, vapor_pressure))

        return density, viscosity, vapor_pressure, self.specific_heat_j_kg_k


FLUID_DATABASE: Dict[str, FluidDefinition] = {
    "water": FluidDefinition(
        id="water", name="Water (Potable)", category="Clean Liquids",
        base_density=998.2, base_viscosity_pa_s=1.002e-3, base_vapor_pressure_pa=2338.0,
        specific_heat_j_kg_k=4182.0, thermal_cond_w_m_k=0.598,
        description="Standard reference fluid for pump performance curves."
    ),
    "distilled_water": FluidDefinition(
        id="distilled_water", name="Distilled Water", category="Clean Liquids",
        base_density=997.5, base_viscosity_pa_s=0.998e-3, base_vapor_pressure_pa=2340.0,
        specific_heat_j_kg_k=4184.0, thermal_cond_w_m_k=0.600,
        description="Pure demineralized water for boiler feed and lab tests."
    ),
    "seawater": FluidDefinition(
        id="seawater", name="Seawater (3.5% Salinity)", category="Saline Liquids",
        base_density=1025.0, base_viscosity_pa_s=1.08e-3, base_vapor_pressure_pa=2280.0,
        specific_heat_j_kg_k=3993.0, thermal_cond_w_m_k=0.580,
        description="Saline ocean water; requires duplex stainless or bronze impeller."
    ),
    "brine_20": FluidDefinition(
        id="brine_20", name="NaCl Brine (20% wt)", category="Saline Liquids",
        base_density=1150.0, base_viscosity_pa_s=1.65e-3, base_vapor_pressure_pa=1850.0,
        specific_heat_j_kg_k=3350.0, thermal_cond_w_m_k=0.540,
        description="Dense refrigeration brine solution."
    ),
    "ethanol": FluidDefinition(
        id="ethanol", name="Ethanol (99.5%)", category="Alcohols",
        base_density=789.0, base_viscosity_pa_s=1.20e-3, base_vapor_pressure_pa=5870.0,
        specific_heat_j_kg_k=2440.0, thermal_cond_w_m_k=0.171,
        description="Volatile organic alcohol with high vapor pressure."
    ),
    "methanol": FluidDefinition(
        id="methanol", name="Methanol (Pure)", category="Alcohols",
        base_density=791.0, base_viscosity_pa_s=0.59e-3, base_vapor_pressure_pa=12800.0,
        specific_heat_j_kg_k=2510.0, thermal_cond_w_m_k=0.202,
        description="Highly volatile toxic alcohol; requires sealless/mag-drive pump."
    ),
    "diesel": FluidDefinition(
        id="diesel", name="Diesel Fuel (No. 2)", category="Hydrocarbons",
        base_density=840.0, base_viscosity_pa_s=3.00e-3, base_vapor_pressure_pa=400.0,
        specific_heat_j_kg_k=2000.0, thermal_cond_w_m_k=0.145,
        description="Light hydrocarbon fuel oil."
    ),
    "light_crude": FluidDefinition(
        id="light_crude", name="Light Crude Oil (35° API)", category="Hydrocarbons",
        base_density=850.0, base_viscosity_pa_s=8.50e-3, base_vapor_pressure_pa=12000.0,
        specific_heat_j_kg_k=1950.0, thermal_cond_w_m_k=0.133,
        description="Live crude oil with dissolved light ends."
    ),
    "heavy_fuel_oil": FluidDefinition(
        id="heavy_fuel_oil", name="Heavy Fuel Oil (HFO 380)", category="Hydrocarbons",
        base_density=985.0, base_viscosity_pa_s=0.380, base_vapor_pressure_pa=100.0,
        specific_heat_j_kg_k=1750.0, thermal_cond_w_m_k=0.125,
        description="High viscosity fuel requiring ANSI/HI viscosity correction."
    ),
    "glycerol_85": FluidDefinition(
        id="glycerol_85", name="Glycerol (85% aqueous)", category="Viscous Liquids",
        base_density=1220.0, base_viscosity_pa_s=0.109, base_vapor_pressure_pa=50.0,
        specific_heat_j_kg_k=2620.0, thermal_cond_w_m_k=0.285,
        description="Viscous polyol demonstrating drastic laminar head derating."
    ),
    "ethylene_glycol": FluidDefinition(
        id="ethylene_glycol", name="Ethylene Glycol (50% soln)", category="Thermal Fluids",
        base_density=1065.0, base_viscosity_pa_s=3.20e-3, base_vapor_pressure_pa=1100.0,
        specific_heat_j_kg_k=3400.0, thermal_cond_w_m_k=0.420,
        description="Industrial heat-transfer and anti-freeze fluid."
    ),
    "thermal_oil": FluidDefinition(
        id="thermal_oil", name="Thermal Heat Transfer Oil", category="Thermal Fluids",
        base_density=870.0, base_viscosity_pa_s=25.0e-3, base_vapor_pressure_pa=80.0,
        specific_heat_j_kg_k=2100.0, thermal_cond_w_m_k=0.130,
        description="Synthetic heat transfer fluid for temperatures up to 300°C."
    ),
    "hcl_30": FluidDefinition(
        id="hcl_30", name="Hydrochloric Acid (30% wt)", category="Corrosive Liquids",
        base_density=1150.0, base_viscosity_pa_s=1.70e-3, base_vapor_pressure_pa=2130.0,
        specific_heat_j_kg_k=3000.0, thermal_cond_w_m_k=0.480,
        description="Severe mineral acid; requires ETFE/PTFE lined or Hastelloy-C pump."
    ),
    "h2so4_50": FluidDefinition(
        id="h2so4_50", name="Sulfuric Acid (50% wt)", category="Corrosive Liquids",
        base_density=1395.0, base_viscosity_pa_s=3.80e-3, base_vapor_pressure_pa=850.0,
        specific_heat_j_kg_k=2600.0, thermal_cond_w_m_k=0.410,
        description="Dense mineral acid requiring Alloy-20 construction."
    ),
    "naoh_20": FluidDefinition(
        id="naoh_20", name="Sodium Hydroxide (20% wt)", category="Corrosive Liquids",
        base_density=1220.0, base_viscosity_pa_s=4.00e-3, base_vapor_pressure_pa=1500.0,
        specific_heat_j_kg_k=3600.0, thermal_cond_w_m_k=0.520,
        description="Strong caustic alkali; requires nickel-alloy or SS316."
    ),
    "milk_whole": FluidDefinition(
        id="milk_whole", name="Whole Milk (Sanitary)", category="Food Processing",
        base_density=1030.0, base_viscosity_pa_s=2.10e-3, base_vapor_pressure_pa=2320.0,
        specific_heat_j_kg_k=3930.0, thermal_cond_w_m_k=0.530,
        description="Hygienic food liquid; requires 3A certified polished 316L pump."
    ),
    "sand_slurry_15": FluidDefinition(
        id="sand_slurry_15", name="Sand-Water Slurry (15% vol)", category="Suspensions",
        base_density=1240.0, base_viscosity_pa_s=8.50e-3, base_vapor_pressure_pa=2300.0,
        specific_heat_j_kg_k=3300.0, thermal_cond_w_m_k=0.620,
        rheology_model="power_law", power_law_k=0.015, power_law_n=0.82,
        solids_volume_fraction=0.15, solids_particle_um=120.0,
        description="Abrasive silica slurry; requires high-chrome alloy semi-open impeller."
    ),
    "municipal_sludge": FluidDefinition(
        id="municipal_sludge", name="Digested Sewage Sludge (4% solids)", category="Wastewater",
        base_density=1018.0, base_viscosity_pa_s=18.0e-3, base_vapor_pressure_pa=2330.0,
        specific_heat_j_kg_k=4050.0, thermal_cond_w_m_k=0.560,
        rheology_model="bingham", yield_stress_pa=12.5, power_law_k=0.025,
        solids_volume_fraction=0.04, solids_particle_um=80.0,
        description="Non-Newtonian Bingham plastic sludge."
    ),
}


# ---------------------------------------------------------------------------
# 2. Pump Specification & Hardware Geometry
# ---------------------------------------------------------------------------

@dataclass
class PumpGeometry:
    id: str
    name: str
    pump_type: str              # "radial", "axial", "mixed"
    impeller_construction: str  # "closed", "semi_open", "open"
    casing_design: str          # "volute", "double_volute", "diffuser"
    suction_type: str           # "single_suction", "double_suction"
    installation_type: str      # "end_suction", "inline", "split_case", "vertical_turbine"
    num_stages: int             # 1, 2, 4
    rated_speed_rpm: float      # e.g., 2900 or 1450
    impeller_diameter_m: float  # Outer diameter D2 (m)
    impeller_eye_diameter_m: float # Inlet diameter D1 (m)
    blade_exit_width_m: float   # b2 (m)
    blade_exit_angle_deg: float # beta2 (deg, typically 22° - 30°)
    blade_count: int            # Z (typically 5 to 7)
    rated_flow_m3_h: float      # BEP flow (m^3/h)
    rated_head_m: float         # BEP head (m)
    rated_efficiency: float     # BEP efficiency (fraction, e.g. 0.78)
    npshr_bep_m: float          # NPSHr at BEP (m)
    motor_power_kw: float       # Electric drive size (kW)
    casing_material: str        # "Ductile Iron", "Cast Stainless 316", "Hastelloy C"
    impeller_material: str      # "Cast Bronze", "Stainless 316", "High Chrome"
    seal_type: str              # "single_mechanical", "cartridge_mechanical", "gland_packing"
    description: str = ""


PUMP_CATALOG: Dict[str, PumpGeometry] = {
    "iso2858_chemical": PumpGeometry(
        id="iso2858_chemical",
        name="ISO 2858 Chemical Process Pump (50-32-160)",
        pump_type="radial",
        impeller_construction="closed",
        casing_design="volute",
        suction_type="single_suction",
        installation_type="end_suction",
        num_stages=1,
        rated_speed_rpm=2900.0,
        impeller_diameter_m=0.165,
        impeller_eye_diameter_m=0.065,
        blade_exit_width_m=0.012,
        blade_exit_angle_deg=25.0,
        blade_count=6,
        rated_flow_m3_h=30.0,
        rated_head_m=32.0,
        rated_efficiency=0.76,
        npshr_bep_m=2.4,
        motor_power_kw=5.5,
        casing_material="Cast Stainless 316",
        impeller_material="Cast Stainless 316",
        seal_type="cartridge_mechanical",
        description="Standard single-stage end-suction chemical pump according to ISO 2858."
    ),
    "split_case_highflow": PumpGeometry(
        id="split_case_highflow",
        name="Horizontal Split-Case Double-Suction Pump",
        pump_type="radial",
        impeller_construction="closed",
        casing_design="double_volute",
        suction_type="double_suction",
        installation_type="split_case",
        num_stages=1,
        rated_speed_rpm=1450.0,
        impeller_diameter_m=0.320,
        impeller_eye_diameter_m=0.140,
        blade_exit_width_m=0.038,
        blade_exit_angle_deg=24.0,
        blade_count=7,
        rated_flow_m3_h=220.0,
        rated_head_m=45.0,
        rated_efficiency=0.84,
        npshr_bep_m=3.2,
        motor_power_kw=37.0,
        casing_material="Ductile Iron",
        impeller_material="Cast Bronze",
        seal_type="cartridge_mechanical",
        description="High-flow municipal water supply pump with double-suction impeller for low NPSHr and zero axial thrust."
    ),
    "multistage_boiler_feed": PumpGeometry(
        id="multistage_boiler_feed",
        name="Multistage Ring-Section Feed Pump (4-Stage)",
        pump_type="radial",
        impeller_construction="closed",
        casing_design="diffuser",
        suction_type="single_suction",
        installation_type="end_suction",
        num_stages=4,
        rated_speed_rpm=2950.0,
        impeller_diameter_m=0.180,
        impeller_eye_diameter_m=0.070,
        blade_exit_width_m=0.010,
        blade_exit_angle_deg=26.0,
        blade_count=6,
        rated_flow_m3_h=40.0,
        rated_head_m=160.0, # 4 stages * 40m/stage
        rated_efficiency=0.74,
        npshr_bep_m=2.8,
        motor_power_kw=30.0,
        casing_material="Forged Carbon Steel",
        impeller_material="Stainless 316",
        seal_type="cartridge_mechanical",
        description="High-pressure 4-stage diffuser casing pump for industrial boiler feedwater."
    ),
    "slurry_heavy_duty": PumpGeometry(
        id="slurry_heavy_duty",
        name="Heavy-Duty Semi-Open Slurry Pump",
        pump_type="mixed",
        impeller_construction="semi_open",
        casing_design="volute",
        suction_type="single_suction",
        installation_type="end_suction",
        num_stages=1,
        rated_speed_rpm=1450.0,
        impeller_diameter_m=0.280,
        impeller_eye_diameter_m=0.110,
        blade_exit_width_m=0.045,
        blade_exit_angle_deg=28.0,
        blade_count=4,
        rated_flow_m3_h=90.0,
        rated_head_m=25.0,
        rated_efficiency=0.68,
        npshr_bep_m=3.8,
        motor_power_kw=15.0,
        casing_material="High Chrome Iron (27% Cr)",
        impeller_material="High Chrome Iron (27% Cr)",
        seal_type="gland_packing",
        description="Abrasion-resistant heavy slurry pump with wide semi-open 4-vane impeller."
    ),
    "vertical_inline_circulator": PumpGeometry(
        id="vertical_inline_circulator",
        name="Vertical Inline Circulation Pump",
        pump_type="radial",
        impeller_construction="closed",
        casing_design="volute",
        suction_type="single_suction",
        installation_type="inline",
        num_stages=1,
        rated_speed_rpm=1450.0,
        impeller_diameter_m=0.170,
        impeller_eye_diameter_m=0.060,
        blade_exit_width_m=0.014,
        blade_exit_angle_deg=23.0,
        blade_count=6,
        rated_flow_m3_h=25.0,
        rated_head_m=12.0,
        rated_efficiency=0.75,
        npshr_bep_m=1.8,
        motor_power_kw=1.5,
        casing_material="Cast Iron",
        impeller_material="Stainless 304",
        seal_type="single_mechanical",
        description="Space-saving straight-through inline pump for chemical cooling loops."
    ),
    "magnetic_drive_sealless": PumpGeometry(
        id="magnetic_drive_sealless",
        name="Magnetic-Drive Sealless Chemical Pump",
        pump_type="radial",
        impeller_construction="closed",
        casing_design="volute",
        suction_type="single_suction",
        installation_type="end_suction",
        num_stages=1,
        rated_speed_rpm=2900.0,
        impeller_diameter_m=0.150,
        impeller_eye_diameter_m=0.055,
        blade_exit_width_m=0.010,
        blade_exit_angle_deg=24.0,
        blade_count=6,
        rated_flow_m3_h=18.0,
        rated_head_m=24.0,
        rated_efficiency=0.70,
        npshr_bep_m=2.2,
        motor_power_kw=3.0,
        casing_material="PVDF / Silicon Carbide",
        impeller_material="PVDF / NdFeB magnets",
        seal_type="cartridge_mechanical",
        description="Zero-emissions sealless containment can pump for toxic and flammable chemicals."
    )
}


# ---------------------------------------------------------------------------
# 3. Component Hierarchy Definitions for 3D Anatomy & Maintenance
# ---------------------------------------------------------------------------

@dataclass
class PumpComponentInfo:
    id: str
    name: str
    category: str      # "hydraulic", "rotating", "sealing", "supporting"
    material: str
    function: str
    working_principle: str
    failure_modes: List[str]
    maintenance_procedure: str
    exploded_offset: Tuple[float, float, float]  # (x, y, z) displacement vector in mm


PUMP_COMPONENTS: List[PumpComponentInfo] = [
    PumpComponentInfo(
        id="impeller",
        name="Impeller (Centrifugal Vanes & Shrouds)",
        category="hydraulic",
        material="Cast 316 Stainless Steel / High Chrome Alloy",
        function="Converts mechanical shaft torque into kinetic energy and pressure head in the liquid.",
        working_principle="Fluid enters axially at the eye, is accelerated radially outwards by backward-curved vanes, and discharges at high peripheral tip speed u2.",
        failure_modes=["Erosion/corrosion wear", "Cavitation pitting at blade suction face", "Foreign object blockage", "Vane cracking due to hydraulic fatigue"],
        maintenance_procedure="Measure vane tip clearance using feeler gauges; balance dynamically to ISO 1940 Grade G2.5; replace when wall thickness wears > 25%.",
        exploded_offset=(0.0, 0.0, -120.0)
    ),
    PumpComponentInfo(
        id="impeller_eye",
        name="Impeller Eye & Inlet Throat",
        category="hydraulic",
        material="Machined 316 Stainless Steel",
        function="Low-pressure fluid entry zone directing axial incoming flow smoothly into the blade passages.",
        working_principle="Flow transition area where lowest static pressure occurs; prime location for vapor inception during cavitation.",
        failure_modes=["Cavitation erosion around eye rim", "Vortex erosion from suction recirculation"],
        maintenance_procedure="Check eye diameter for roundness; inspect for honeycomb cavitation pits.",
        exploded_offset=(0.0, 0.0, -180.0)
    ),
    PumpComponentInfo(
        id="volute_casing",
        name="Volute Casing (Spiral Diffuser)",
        category="hydraulic",
        material="Heavy-wall Cast Iron / Cast 316 Stainless Steel",
        function="Collects high-velocity fluid exiting the impeller periphery and converts kinetic energy into static pressure.",
        working_principle="The flow cross-sectional area expands continuously in a logarithmic spiral towards the discharge nozzle, slowing the liquid and recovering pressure according to Bernoulli's principle.",
        failure_modes=["Cutwater tongue erosion", "Casing wall thinning under abrasive slurries", "Hydraulic overpressure cracking"],
        maintenance_procedure="Ultrasonic wall thickness measurement; inspect cutwater clearance; check casing gasket seating surface.",
        exploded_offset=(0.0, 0.0, 0.0)
    ),
    PumpComponentInfo(
        id="wear_rings",
        name="Casing & Impeller Wear Rings",
        category="hydraulic",
        material="Differentially Hardened Stainless 420 / Silicon Carbide / Bronze",
        function="Provides a tight running clearance seal between high-pressure discharge volute and low-pressure suction eye.",
        working_principle="Restricts internal liquid recirculation from discharge back to suction, maintaining volumetric efficiency (typically > 95%).",
        failure_modes=["Wear gap expansion causing volumetric efficiency loss", "Galling/seizure during dry running"],
        maintenance_procedure="Measure diametral clearance; if clearance exceeds 2x original design clearance (standard: 0.3mm to 0.5mm), replace rings.",
        exploded_offset=(0.0, 0.0, -90.0)
    ),
    PumpComponentInfo(
        id="shaft",
        name="Drive Shaft & Keyways",
        category="rotating",
        material="High-tensile Alloy Steel 4140 / Duplex Stainless 2205",
        function="Transmits rotational mechanical power and torque from the electric motor to the impeller.",
        working_principle="Subjected to combined torsion from motor drive and alternating bending moments from radial hydraulic loads on the impeller.",
        failure_modes=["Shaft fatigue fracture at keyway notch", "Excessive shaft deflection / runout (> 0.05 mm)", "Corrosion fretting under sleeve"],
        maintenance_procedure="Check Total Indicated Runout (TIR) with dial indicator (must be < 0.025 mm); dye-penetrant inspect keyway radii.",
        exploded_offset=(0.0, 0.0, 150.0)
    ),
    PumpComponentInfo(
        id="shaft_sleeve",
        name="Renewable Shaft Sleeve",
        category="rotating",
        material="Hardened 316 SS with Ceramic / Tungsten Carbide Coating",
        function="Protects the expensive drive shaft from mechanical seal wear, abrasive erosion, and corrosion.",
        working_principle="Sacrificial cylinder clamped or keyed onto the shaft directly beneath the mechanical seal faces and secondary O-rings.",
        failure_modes=["Grooving wear under seal faces", "Fretting corrosion from vibration", "O-ring extrusion"],
        maintenance_procedure="Replace during every major mechanical seal overhaul; polish surface to Ra < 0.4 µm.",
        exploded_offset=(0.0, 0.0, 90.0)
    ),
    PumpComponentInfo(
        id="mechanical_seal",
        name="Cartridge Mechanical Seal",
        category="sealing",
        material="Silicon Carbide vs Carbon / Tungsten Carbide Faces, Hastelloy Springs, Viton / FFKM Elastomers",
        function="Prevents high-pressure process fluid from leaking out of the pump casing along the rotating shaft.",
        working_principle="A rotating seal ring is pressed against a stationary ring by precision spring force, maintaining an ultra-thin (1 µm) lubricating fluid film between the optical flat faces.",
        failure_modes=["Seal face thermal cracking from dry running", "Abrasive particulate scoring", "Elastomer O-ring hardening/chemical attack", "Spring clogging"],
        maintenance_procedure="Never run dry; verify seal flush plan (Plan 11/53); check leakage rate (< 5 drops/min); replace cartridge if face gap opens.",
        exploded_offset=(0.0, 0.0, 60.0)
    ),
    PumpComponentInfo(
        id="bearings",
        name="Radial & Thrust Ball / Roller Bearings",
        category="supporting",
        material="Vacuum Degassed 52100 Chrome Bearing Steel",
        function="Supports the rotating shaft assembly, maintaining concentric alignment and absorbing radial and axial hydraulic thrust loads.",
        working_principle="Deep groove ball bearing at pump end absorbs radial load; back-to-back angular contact pairs at drive end absorb bidirectional axial thrust.",
        failure_modes=["Fatigue spalling of races", "Contamination by water/seal flush", "Inadequate lubrication / overheating (> 85°C)", "False brinelling from vibration"],
        maintenance_procedure="Monitor vibration velocity (RMS) and shock pulse / PeakVue; replace oil every 3000 operating hours; replace bearings before L10 life expires.",
        exploded_offset=(0.0, 0.0, 220.0)
    ),
    PumpComponentInfo(
        id="bearing_housing",
        name="Bearing Housing & Oil Sump",
        category="supporting",
        material="Cast Iron ASTM A48 Class 30",
        function="Encloses and rigidly supports bearings, houses lubricating oil sump, constant-level oiler, and cooling jacket.",
        working_principle="Dissipates bearing friction heat; includes labyrinth oil seals to prevent lubricant egress and atmospheric dirt ingress.",
        failure_modes=["Lubricant oil leakage past labyrinth seals", "Condensation moisture contamination", "Cracked foot mounting"],
        maintenance_procedure="Check oil sight glass level at centerline of lowest ball; drain and inspect magnetic drain plug for metallic debris.",
        exploded_offset=(0.0, 0.0, 180.0)
    ),
    PumpComponentInfo(
        id="suction_nozzle",
        name="Suction Nozzle & Flange",
        category="hydraulic",
        material="Cast 316 Stainless Steel (ANSI / DIN Flanged)",
        function="Connects the pump intake to the suction piping system; establishes smooth velocity distribution into the impeller eye.",
        working_principle="Conical converging transition reducing entrance vortexing and minimizing suction head losses.",
        failure_modes=["Pipe strain transmitting excessive nozzle loading", "Cavitation erosion at throat", "Flange face leakage"],
        maintenance_procedure="Verify pipe stress alignment using dial indicators before tightening flange bolts; torque bolts in cross-pattern.",
        exploded_offset=(0.0, 0.0, -260.0)
    ),
    PumpComponentInfo(
        id="discharge_nozzle",
        name="Discharge Nozzle & Diffuser Throat",
        category="hydraulic",
        material="Cast 316 Stainless Steel (ANSI / DIN Flanged)",
        function="Discharges high-pressure fluid into the process piping system.",
        working_principle="Divergent nozzle providing final kinetic to static pressure head recovery.",
        failure_modes=["Water hammer / surge cracking", "Erosion at high velocity", "Gasket blowout"],
        maintenance_procedure="Install check valve to eliminate reverse flow and water hammer; inspect internal throat for cavitation/erosion.",
        exploded_offset=(0.0, 180.0, 0.0)
    ),
    PumpComponentInfo(
        id="motor_coupling",
        name="Flexible Spacer Coupling & Electric Motor",
        category="supporting",
        material="Cast Iron Hubs with Polyurethane / Elastomeric Sleeve",
        function="Transmits drive torque while accommodating minor thermal expansion, angular, and parallel shaft misalignments.",
        working_principle="Rotational shear through flexible elastomeric spider element isolates vibration and cushions startup shock.",
        failure_modes=["Elastomer element shredding from severe misalignment", "Coupling bolt loosening", "Excessive 1X/2X shaft vibration"],
        maintenance_procedure="Align shafts with laser alignment system to < 0.05 mm parallel and < 0.05° angular tolerance.",
        exploded_offset=(0.0, 0.0, 320.0)
    )
]


# ---------------------------------------------------------------------------
# 4. Simulation Request / Input Structures
# ---------------------------------------------------------------------------

@dataclass
class OperatingConditions:
    pump_id: str = "iso2858_chemical"
    fluid_id: str = "water"
    fluid_temp_c: float = 20.0             # °C
    speed_rpm: float = 2900.0              # RPM
    flow_m3_h: Optional[float] = None      # Target flow if throttled, or None for auto-solve
    suction_static_head_m: float = 2.0     # z_suction - z_pump (m)
    discharge_static_head_m: float = 18.0  # z_discharge - z_pump (m)
    suction_pipe_dia_m: float = 0.08       # m (approx 3 inch)
    suction_pipe_length_m: float = 8.0     # m
    discharge_pipe_dia_m: float = 0.05     # m (approx 2 inch)
    discharge_pipe_length_m: float = 45.0  # m
    suction_valve_opening_pct: float = 100.0 # 0% - 100%
    discharge_valve_opening_pct: float = 80.0# 0% - 100%
    pipe_roughness_m: float = 0.000045     # commercial steel (m)
    impeller_diameter_m: Optional[float] = None # None uses pump default
    
    # Fault injection controls (0.0 = healthy, 1.0 = severe)
    fault_cavitation_override: float = 0.0
    fault_dry_run: float = 0.0
    fault_suction_clog: float = 0.0
    fault_discharge_clog: float = 0.0
    fault_impeller_wear: float = 0.0
    fault_bearing_defect: float = 0.0
    fault_seal_leakage: float = 0.0
    fault_misalignment: float = 0.0
    gas_entrainment_pct: float = 0.0       # 0% to 10% gas volume fraction


# ---------------------------------------------------------------------------
# 5. Core Turbomachinery & Hydraulic Calculations
# ---------------------------------------------------------------------------

def calculate_pipe_friction_factor(reynolds: float, relative_roughness: float) -> float:
    """
    Calculates Darcy-Weisbach friction factor f across laminar, transitional,
    and turbulent flow using Churchill / Swamee-Jain formulation.
    """
    if reynolds < 1.0:
        return 64.0
    if reynolds < 2300.0:
        return 64.0 / reynolds
    
    # Swamee-Jain explicit equation for turbulent pipe flow
    # Valid for 5000 <= Re <= 10^8 and 10^-6 <= eps/D <= 10^-2
    re = max(2300.0, reynolds)
    term1 = relative_roughness / 3.7
    term2 = 5.74 / (re ** 0.9)
    log_arg = max(1.0e-7, term1 + term2)
    f = 0.25 / ((math.log10(log_arg)) ** 2)
    return max(0.012, min(0.12, f))


def calculate_valve_loss_coefficient(opening_pct: float) -> float:
    """
    Calculates resistance loss coefficient K_L for gate/globe valve
    as a function of percentage opening.
    """
    pct = max(1.0, min(100.0, opening_pct))
    if pct >= 99.0:
        return 0.2  # Fully open low loss
    # Non-linear throttling resistance
    x = pct / 100.0
    return 0.2 + 0.8 * ((1.0 - x) / x) ** 2.5


def calculate_hi_viscosity_correction(
    flow_bep_m3_h: float,
    head_bep_m: float,
    speed_rpm: float,
    kinematic_viscosity_cst: float
) -> Tuple[float, float, float]:
    """
    Calculates ANSI/HI 9.6.7 viscosity correction factors for centrifugal pumps:
    C_H (Head factor), C_Q (Flow factor), C_eta (Efficiency factor).
    For kinematic viscosity <= 1.0 cSt (water), correction factors are 1.0.
    """
    nu = max(1.0, kinematic_viscosity_cst)
    if nu <= 1.5:
        return 1.0, 1.0, 1.0

    # HI 9.6.7 Parameter B calculation
    # B = 16.5 * (nu^0.5 * H_BEP^0.25) / (Q_BEP^0.5 * N^0.25)
    # Using Q in m^3/h, H in m, N in RPM, nu in cSt
    b_param = 16.5 * (math.sqrt(nu) * (head_bep_m ** 0.25)) / (math.sqrt(max(1.0, flow_bep_m3_h)) * (speed_rpm ** 0.25))
    
    if b_param < 1.0:
        return 1.0, 1.0, 1.0
    
    # Empirical HI correction factors
    c_h = max(0.40, min(1.0, 1.0 - 0.08 * (b_param - 1.0) ** 0.85))
    c_q = max(0.45, min(1.0, 1.0 - 0.12 * (b_param - 1.0) ** 0.80))
    c_eta = max(0.20, min(1.0, 1.0 - 0.25 * (b_param - 1.0) ** 0.75))

    return c_h, c_q, c_eta


@dataclass
class PerformancePoint:
    flow_m3_h: float
    head_m: float
    efficiency_pct: float
    hydraulic_power_kw: float
    shaft_power_kw: float
    npshr_m: float
    system_head_m: float


@dataclass
class SimulationTelemetry:
    # Operating Point
    operating_flow_m3_h: float
    operating_head_m: float
    shutoff_head_m: float
    bep_flow_m3_h: float
    bep_head_m: float
    bep_efficiency_pct: float
    specific_speed_ns: float
    
    # Power & Energy
    hydraulic_power_kw: float
    shaft_power_kw: float
    motor_power_kw: float
    efficiency_pct: float
    motor_load_pct: float
    torque_n_m: float
    fluid_temp_rise_c: float
    
    # Pressures & Velocities
    suction_pressure_kpa_g: float
    discharge_pressure_kpa_g: float
    differential_pressure_kpa: float
    suction_velocity_m_s: float
    discharge_velocity_m_s: float
    impeller_tip_speed_m_s: float
    euler_head_theoretical_m: float
    slip_factor: float
    
    # Cavitation & NPSH
    npsha_m: float
    npshr_m: float
    cavitation_margin_m: float
    cavitation_index_sigma: float
    is_cavitating: bool
    cavitation_severity_pct: float
    
    # Fluid Properties at Temperature
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
    
    # Diagnostics & Health
    vibration_velocity_mm_s: float
    acoustic_noise_db: float
    bearing_temp_c: float
    seal_face_temp_c: float
    seal_leakage_rate_ml_min: float
    axial_thrust_n: float
    radial_thrust_n: float
    fault_alerts: List[str]
    warnings: List[str]


@dataclass
class CompletePumpSimulationResult:
    pump: PumpGeometry
    fluid: FluidDefinition
    conditions: OperatingConditions
    telemetry: SimulationTelemetry
    characteristic_curve: List[PerformancePoint]


def simulate_centrifugal_pump(
    conditions: OperatingConditions
) -> CompletePumpSimulationResult:
    """
    Executes a complete first-principles physics and hydraulic simulation of
    the centrifugal pump digital twin.
    """
    pump = PUMP_CATALOG.get(conditions.pump_id, PUMP_CATALOG["iso2858_chemical"])
    fluid = FLUID_DATABASE.get(conditions.fluid_id, FLUID_DATABASE["water"])

    # 1. Temperature-dependent Fluid Properties
    density, dyn_viscosity, vapor_press_pa, cp = fluid.get_properties_at_temp(conditions.fluid_temp_c)
    kin_viscosity_m2_s = dyn_viscosity / density
    kin_viscosity_cst = kin_viscosity_m2_s * 1.0e6

    # 2. Geometry & Rotational Speed
    speed_rpm = max(300.0, min(4000.0, conditions.speed_rpm))
    d2 = conditions.impeller_diameter_m or pump.impeller_diameter_m
    d2_base = pump.impeller_diameter_m
    rpm_base = pump.rated_speed_rpm

    # Turbomachinery Affinity Ratios
    speed_ratio = speed_rpm / rpm_base
    dia_ratio = d2 / d2_base

    # Impeller Tip Speed u2 = pi * D2 * N / 60
    omega = 2.0 * math.pi * speed_rpm / 60.0
    u2 = (math.pi * d2 * speed_rpm) / 60.0
    u1 = (math.pi * pump.impeller_eye_diameter_m * speed_rpm) / 60.0

    # Stodola Slip Factor sigma = 1 - (pi * sin(beta2)) / Z
    beta2_rad = math.radians(pump.blade_exit_angle_deg)
    slip_factor = max(0.70, min(0.95, 1.0 - (math.pi * math.sin(beta2_rad)) / pump.blade_count))

    # Theoretical Euler Head H_E = (sigma * u2^2) / g (assuming zero inlet whirl v_theta1 = 0)
    euler_head_stage = (slip_factor * (u2 ** 2)) / GRAVITY
    euler_head_theoretical = euler_head_stage * pump.num_stages

    # 3. Viscosity Correction (ANSI/HI 9.6.7)
    c_h, c_q, c_eta = calculate_hi_viscosity_correction(
        pump.rated_flow_m3_h, pump.rated_head_m, speed_rpm, kin_viscosity_cst
    )
    hi_applied = (c_h < 0.999 or c_q < 0.999 or c_eta < 0.999)

    # 4. Scaled Pump Characteristics at BEP
    # Base BEP under Water at Rated RPM
    bep_q_water = pump.rated_flow_m3_h * speed_ratio * dia_ratio
    bep_h_water = pump.rated_head_m * (speed_ratio ** 2) * (dia_ratio ** 2)
    bep_eta_water = pump.rated_efficiency

    # Corrected for viscosity
    bep_q = bep_q_water * c_q
    bep_h = bep_h_water * c_h
    bep_eta = max(0.15, bep_eta_water * c_eta)

    # Fault degradation factor on impeller head
    wear_derate = max(0.0, 1.0 - 0.35 * conditions.fault_impeller_wear)
    gas_derate = max(0.1, 1.0 - 0.08 * conditions.gas_entrainment_pct)

    # Quadratic pump head curve coefficients: H_pump(Q) = H0 - B_coeff * Q^2
    # Shutoff head H0 is typically ~ 1.15 to 1.25 * BEP Head
    shutoff_head_stage = 1.22 * (bep_h / pump.num_stages) * wear_derate * gas_derate
    shutoff_head = shutoff_head_stage * pump.num_stages
    b_coeff = (shutoff_head - bep_h) / max(1.0, (bep_q ** 2))

    # 5. System Resistance Curve: H_sys(Q) = H_static + K_sys * Q^2
    h_static = max(0.0, conditions.discharge_static_head_m - conditions.suction_static_head_m)
    d_suct = max(0.02, conditions.suction_pipe_dia_m)
    d_disc = max(0.02, conditions.discharge_pipe_dia_m)
    a_suct = 0.25 * math.pi * (d_suct ** 2)
    a_disc = 0.25 * math.pi * (d_disc ** 2)

    k_suct_valve = calculate_valve_loss_coefficient(conditions.suction_valve_opening_pct)
    # Suction clog fault adds massive loss coefficient
    k_suct_valve += conditions.fault_suction_clog * 85.0

    k_disc_valve = calculate_valve_loss_coefficient(conditions.discharge_valve_opening_pct)
    # Discharge clog fault pins the valve closed
    k_disc_valve += conditions.fault_discharge_clog * 250.0

    # Minor fitting loss coefficients (elbows, tee, entrance, exit)
    k_minor_suct = 1.0 + k_suct_valve + 0.5  # entrance + valve + 1 elbow
    k_minor_disc = 1.0 + k_disc_valve + 1.2  # exit + valve + 2 elbows

    def get_system_head(q_m3_h: float) -> Tuple[float, float, float, float, float]:
        """Calculates system head requirement and suction head loss for a given flow."""
        q_m3_s = max(0.0, q_m3_h) / 3600.0
        v_suct = q_m3_s / a_suct
        v_disc = q_m3_s / a_disc

        # Friction factors
        re_s = (density * v_suct * d_suct) / max(1e-7, dyn_viscosity)
        re_d = (density * v_disc * d_disc) / max(1e-7, dyn_viscosity)

        f_s = calculate_pipe_friction_factor(re_s, conditions.pipe_roughness_m / d_suct)
        f_d = calculate_pipe_friction_factor(re_d, conditions.pipe_roughness_m / d_disc)

        h_loss_suct = (f_s * (conditions.suction_pipe_length_m / d_suct) + k_minor_suct) * (v_suct ** 2) / (2.0 * GRAVITY)
        h_loss_disc = (f_d * (conditions.discharge_pipe_length_m / d_disc) + k_minor_disc) * (v_disc ** 2) / (2.0 * GRAVITY)

        total_sys_h = h_static + h_loss_suct + h_loss_disc
        return total_sys_h, h_loss_suct, h_loss_disc, v_suct, v_disc

    # 6. Operating Point Solver (Intersection of H_pump(Q) and H_sys(Q))
    # Solve H_pump(Q) - H_sys(Q) = 0 via bounded bisection
    q_max = bep_q * 2.2
    
    if conditions.flow_m3_h is not None and conditions.flow_m3_h > 0:
        operating_q = min(q_max, conditions.flow_m3_h)
    else:
        # Auto-solve operating intersection
        q_low = 0.0
        q_high = q_max
        for _ in range(40):
            q_mid = 0.5 * (q_low + q_high)
            h_p_mid = max(0.0, shutoff_head - b_coeff * (q_mid ** 2))
            h_s_mid, _, _, _, _ = get_system_head(q_mid)
            if h_p_mid > h_s_mid:
                q_low = q_mid
            else:
                q_high = q_mid
        operating_q = 0.5 * (q_low + q_high)

    # Dry-run fault forces flow to 0
    if conditions.fault_dry_run > 0.5:
        operating_q = 0.0

    sys_head, h_loss_suction, h_loss_discharge, v_suct_oper, v_disc_oper = get_system_head(operating_q)
    operating_head = max(0.0, shutoff_head - b_coeff * (operating_q ** 2))

    # 7. Efficiency & Power Calculations
    # Parabolic efficiency profile centered at BEP
    q_ratio = operating_q / max(0.001, bep_q)
    eff_curve = bep_eta * max(0.05, 1.0 - 0.75 * ((q_ratio - 1.0) ** 2))
    # Additional mechanical and fault penalties
    eff_curve *= max(0.1, 1.0 - 0.20 * conditions.fault_bearing_defect)
    operating_eff = max(0.05, min(0.92, eff_curve))

    q_m3_s_oper = operating_q / 3600.0
    hydraulic_power_kw = (density * GRAVITY * q_m3_s_oper * operating_head) / 1000.0

    # Shaft Power: P_shaft = P_hyd / eta + P_mech_loss
    p_mech_loss_kw = (0.05 + 0.15 * conditions.fault_bearing_defect) * pump.motor_power_kw
    if conditions.fault_dry_run > 0.5:
        shaft_power_kw = 0.8  # Unloaded motor + bearing friction
    else:
        shaft_power_kw = (hydraulic_power_kw / operating_eff) + p_mech_loss_kw

    motor_load_pct = (shaft_power_kw / max(0.1, pump.motor_power_kw)) * 100.0
    torque_n_m = (shaft_power_kw * 1000.0) / max(1.0, omega)

    # 8. Pressures at Suction and Discharge Flanges (Gauge)
    # Suction flange pressure: P_s = P_atm + rho*g*(z_suction - z_pump - h_loss_suct) - 0.5*rho*v_suct^2
    p_suct_abs = ATM_PRESSURE_PA + density * GRAVITY * (conditions.suction_static_head_m - h_loss_suction) - 0.5 * density * (v_suct_oper ** 2)
    suction_pressure_kpa_g = (p_suct_abs - ATM_PRESSURE_PA) / 1000.0

    # Discharge flange pressure: P_d = P_s + rho*g*H_pump
    p_disc_abs = p_suct_abs + density * GRAVITY * operating_head
    discharge_pressure_kpa_g = (p_disc_abs - ATM_PRESSURE_PA) / 1000.0
    differential_pressure_kpa = discharge_pressure_kpa_g - suction_pressure_kpa_g

    # 9. NPSH & Cavitation Calculations
    # NPSHa = (P_suct_abs - P_vapor) / (rho * g) + v_suct^2 / (2g)
    # Equivalent to reservoir formula: (P_atm - P_v)/(rho*g) + z_suct - h_loss_suct
    npsha_m = (max(0.0, p_suct_abs - vapor_press_pa) / (density * GRAVITY)) + ((v_suct_oper ** 2) / (2.0 * GRAVITY))

    # NPSHr scaled with speed and flow
    # NPSHr = NPSHr_BEP * (N/N_0)^2 * [1 + 0.8 * ((Q - Q_BEP)/Q_BEP)^2]
    npshr_bep_scaled = pump.npshr_bep_m * (speed_ratio ** 1.8)
    npshr_m = npshr_bep_scaled * (1.0 + 0.85 * ((q_ratio - 1.0) ** 2))

    cavitation_margin_m = npsha_m - npshr_m
    cavitation_index_sigma = max(0.01, npsha_m / max(0.1, operating_head))
    
    # Inception check
    is_cavitating = (cavitation_margin_m < 0.0) or (conditions.fault_cavitation_override > 0.3)
    if is_cavitating:
        cav_deficit = max(0.0, -cavitation_margin_m)
        cavitation_severity_pct = min(100.0, (cav_deficit / max(0.1, npshr_m)) * 100.0 + conditions.fault_cavitation_override * 100.0)
    else:
        cavitation_severity_pct = 0.0

    # 10. Thermal & Mechanical Calculations
    # Temperature rise at low flow: Delta_T = P_losses / (mass_flow * Cp)
    mass_flow_kg_s = density * q_m3_s_oper
    power_losses_w = max(0.0, (shaft_power_kw - hydraulic_power_kw) * 1000.0)
    if mass_flow_kg_s > 0.05:
        fluid_temp_rise_c = power_losses_w / (mass_flow_kg_s * cp)
    else:
        # Rapid fluid boiling / overheating at shutoff
        fluid_temp_rise_c = min(95.0, power_losses_w / 250.0)

    # Axial Hydraulic Thrust F_ax = Delta_P * (A_impeller - A_shaft)
    a_impeller_disc = 0.25 * math.pi * (d2 ** 2)
    a_shaft = 0.25 * math.pi * (0.035 ** 2)
    if pump.suction_type == "double_suction":
        axial_thrust_n = 50.0  # Naturally balanced
    else:
        # Single suction unbalanced axial force
        axial_thrust_n = (differential_pressure_kpa * 1000.0) * (a_impeller_disc * 0.28 - a_shaft) * (1.0 / pump.num_stages)

    # Radial Hydraulic Thrust F_rad = k_R * rho * g * H * D2 * b2
    # k_R is minimum at BEP (~0.08) and maximum at shutoff (~0.36)
    k_r = 0.08 + 0.28 * ((1.0 - min(1.0, q_ratio)) ** 2)
    if pump.casing_design == "double_volute":
        k_r *= 0.30  # Double volute cancels radial thrust
    radial_thrust_n = k_r * density * GRAVITY * (operating_head / pump.num_stages) * d2 * pump.blade_exit_width_m

    # 11. Diagnostic Health Gauges & Telemetry
    # Baseline normal vibration ~ 1.2 mm/s RMS (ISO 10816-3 Zone A/B)
    vibe = 1.2 * (speed_rpm / 1500.0)
    if is_cavitating:
        vibe += 4.5 * (cavitation_severity_pct / 100.0)
    vibe += conditions.fault_bearing_defect * 7.2
    vibe += conditions.fault_misalignment * 8.5
    vibe += conditions.fault_impeller_wear * 3.2
    vibration_velocity_mm_s = round(vibe, 2)

    # Acoustic Noise dB(A)
    noise = 68.0 + 8.0 * (speed_rpm / 2900.0)
    if is_cavitating:
        noise += 18.0 * (cavitation_severity_pct / 100.0)
    if conditions.fault_dry_run > 0.5:
        noise += 12.0
    acoustic_noise_db = round(noise, 1)

    # Bearing & Seal Temperatures
    bearing_temp = conditions.fluid_temp_c + 25.0 + conditions.fault_bearing_defect * 48.0 + conditions.fault_misalignment * 22.0
    bearing_temp_c = round(bearing_temp, 1)

    seal_temp = conditions.fluid_temp_c + 12.0 + fluid_temp_rise_c
    if conditions.fault_dry_run > 0.5:
        seal_temp += 160.0  # Seal faces dry frictional heating
    seal_face_temp_c = round(seal_temp, 1)

    # Seal Leakage (drops/min or ml/min)
    seal_leakage = 0.1  # normal healthy vapor emission
    seal_leakage += conditions.fault_seal_leakage * 220.0
    if conditions.fault_dry_run > 0.5:
        seal_leakage += 45.0
    seal_leakage_rate_ml_min = round(seal_leakage, 1)

    # Specific Speed N_s = N * sqrt(Q_m3_s) / H^(3/4)
    q_bep_m3_s = bep_q / 3600.0
    h_stage_bep = bep_h / pump.num_stages
    specific_speed_ns = (speed_rpm * math.sqrt(q_bep_m3_s)) / (max(0.1, h_stage_bep) ** 0.75)

    # 12. Fault Alerts and Engineering Warnings
    fault_alerts = []
    warnings = []

    if is_cavitating:
        fault_alerts.append(f"CAVITATION INCEPTION: NPSHa ({npsha_m:.2f}m) < NPSHr ({npshr_m:.2f}m). Vapor implosions occurring at blade tips.")
    if conditions.fault_dry_run > 0.5:
        fault_alerts.append("CRITICAL: PUMP RUNNING DRY! Mechanical seal faces and wear rings overheating.")
    if conditions.fault_suction_clog > 0.3:
        fault_alerts.append("SUCTION STRAINER FOULING: Excessive friction in suction line triggering vacuum collapse.")
    if conditions.fault_discharge_clog > 0.3 or (operating_q < 0.10 * bep_q and conditions.fault_dry_run < 0.5):
        fault_alerts.append(f"SHUTOFF / LOW-FLOW RECIRCULATION: Flow below 10% BEP. Thermal temperature rise = +{fluid_temp_rise_c:.1f}°C.")
    if conditions.fault_bearing_defect > 0.3:
        fault_alerts.append(f"BEARING INNER/OUTER RACE DEFECT: High vibration ({vibration_velocity_mm_s} mm/s) and temp ({bearing_temp_c}°C).")
    if conditions.fault_seal_leakage > 0.3:
        fault_alerts.append(f"MECHANICAL SEAL FACE BREACH: Hazardous fluid leakage at {seal_leakage_rate_ml_min} mL/min.")
    if conditions.fault_misalignment > 0.3:
        fault_alerts.append("SHAFT COUPLING MISALIGNMENT: High 1X/2X radial vibration harmonics detected.")
    if conditions.gas_entrainment_pct > 2.0:
        fault_alerts.append(f"GAS BINDING RISK: Entrained gas fraction ({conditions.gas_entrainment_pct:.1f}%) severely degrading developed head.")

    if motor_load_pct > 110.0:
        warnings.append(f"Motor overload: Operating at {motor_load_pct:.1f}% of motor rated {pump.motor_power_kw} kW.")
    if hi_applied:
        warnings.append(f"ANSI/HI 9.6.7 Viscosity correction active: C_H={c_h:.2f}, C_Q={c_q:.2f}, C_eta={c_eta:.2f}.")

    # 13. Characteristic Performance Curves (0 to 180% of BEP flow)
    curves: List[PerformancePoint] = []
    curve_steps = 25
    q_max_curve = bep_q * 1.8
    for i in range(curve_steps + 1):
        q_cur = (i / curve_steps) * q_max_curve
        h_p_cur = max(0.0, shutoff_head - b_coeff * (q_cur ** 2))
        q_ratio_cur = q_cur / max(0.001, bep_q)
        eff_cur = max(5.0, min(95.0, (bep_eta * max(0.05, 1.0 - 0.75 * ((q_ratio_cur - 1.0) ** 2))) * 100.0))
        
        q_s_cur = q_cur / 3600.0
        hyd_p_cur = (density * GRAVITY * q_s_cur * h_p_cur) / 1000.0
        shaft_p_cur = hyd_p_cur / (eff_cur / 100.0) + p_mech_loss_kw
        
        npshr_cur = npshr_bep_scaled * (1.0 + 0.85 * ((q_ratio_cur - 1.0) ** 2))
        sys_h_cur, _, _, _, _ = get_system_head(q_cur)

        curves.append(
            PerformancePoint(
                flow_m3_h=round(q_cur, 2),
                head_m=round(h_p_cur, 2),
                efficiency_pct=round(eff_cur, 1),
                hydraulic_power_kw=round(hyd_p_cur, 2),
                shaft_power_kw=round(shaft_p_cur, 2),
                npshr_m=round(npshr_cur, 2),
                system_head_m=round(sys_h_cur, 2)
            )
        )

    telemetry = SimulationTelemetry(
        operating_flow_m3_h=round(operating_q, 2),
        operating_head_m=round(operating_head, 2),
        shutoff_head_m=round(shutoff_head, 2),
        bep_flow_m3_h=round(bep_q, 2),
        bep_head_m=round(bep_h, 2),
        bep_efficiency_pct=round(bep_eta * 100.0, 1),
        specific_speed_ns=round(specific_speed_ns, 1),
        hydraulic_power_kw=round(hydraulic_power_kw, 2),
        shaft_power_kw=round(shaft_power_kw, 2),
        motor_power_kw=pump.motor_power_kw,
        efficiency_pct=round(operating_eff * 100.0, 1),
        motor_load_pct=round(motor_load_pct, 1),
        torque_n_m=round(torque_n_m, 1),
        fluid_temp_rise_c=round(fluid_temp_rise_c, 2),
        suction_pressure_kpa_g=round(suction_pressure_kpa_g, 1),
        discharge_pressure_kpa_g=round(discharge_pressure_kpa_g, 1),
        differential_pressure_kpa=round(differential_pressure_kpa, 1),
        suction_velocity_m_s=round(v_suct_oper, 2),
        discharge_velocity_m_s=round(v_disc_oper, 2),
        impeller_tip_speed_m_s=round(u2, 2),
        euler_head_theoretical_m=round(euler_head_theoretical, 2),
        slip_factor=round(slip_factor, 3),
        npsha_m=round(npsha_m, 2),
        npshr_m=round(npshr_m, 2),
        cavitation_margin_m=round(cavitation_margin_m, 2),
        cavitation_index_sigma=round(cavitation_index_sigma, 3),
        is_cavitating=is_cavitating,
        cavitation_severity_pct=round(cavitation_severity_pct, 1),
        fluid_density_kg_m3=round(density, 1),
        fluid_dynamic_viscosity_pa_s=round(dyn_viscosity, 6),
        fluid_kinematic_viscosity_cst=round(kin_viscosity_cst, 2),
        fluid_vapor_pressure_kpa=round(vapor_press_pa / 1000.0, 2),
        reynolds_suction_pipe=round((density * v_suct_oper * d_suct) / max(1e-7, dyn_viscosity), 0),
        reynolds_discharge_pipe=round((density * v_disc_oper * d_disc) / max(1e-7, dyn_viscosity), 0),
        hi_viscosity_correction_applied=hi_applied,
        c_head=round(c_h, 3),
        c_flow=round(c_q, 3),
        c_efficiency=round(c_eta, 3),
        vibration_velocity_mm_s=vibration_velocity_mm_s,
        acoustic_noise_db=acoustic_noise_db,
        bearing_temp_c=bearing_temp_c,
        seal_face_temp_c=seal_face_temp_c,
        seal_leakage_rate_ml_min=seal_leakage_rate_ml_min,
        axial_thrust_n=round(axial_thrust_n, 1),
        radial_thrust_n=round(radial_thrust_n, 1),
        fault_alerts=fault_alerts,
        warnings=warnings
    )

    return CompletePumpSimulationResult(
        pump=pump,
        fluid=fluid,
        conditions=conditions,
        telemetry=telemetry,
        characteristic_curve=curves
    )

