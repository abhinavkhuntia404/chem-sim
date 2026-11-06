"""
Fluidisation Engineering Simulation Module.

Implements rigorous first-principles fluidisation models:
- Ergun packed bed pressure drop equation (viscous + inertial terms)
- Archimedes number (Ar)
- Particle Reynolds number (Re_p)
- Minimum fluidisation velocity (u_mf) via Ergun quadratic and Wen-Yu correlation
- Terminal settling velocity (u_t) via Haider-Levenspiel correlation
- Bed voidage and height expansion via Richardson-Zaki and Kunii-Levenspiel models
- Geldart particle classification (Groups A, B, C, D)
- Hydrodynamic regime identification (Packed, Incipient, Bubbling, Turbulent, Entrainment)
- Perforated distributor plate pressure drop
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Tuple
import math

# Standard gravitational acceleration (m/s^2)
GRAVITY = 9.80665


@dataclass
class FluidisationInput:
    """Operating specifications for a gas-solid fluidised bed."""
    gas_velocity_m_s: float            # Superficial gas velocity u0 (m/s)
    particle_diameter_m: float         # Mean particle diameter dp (m)
    particle_density_kg_m3: float      # Solid particle density rho_p (kg/m^3)
    gas_density_kg_m3: float = 1.205   # Gas density rho_g (kg/m^3) [default: air @ 20°C]
    gas_viscosity_Pa_s: float = 1.82e-5# Gas dynamic viscosity mu (Pa.s) [default: air @ 20°C]
    initial_bed_height_m: float = 0.40 # Initial settled/packed bed height H0 (m)
    column_diameter_m: float = 0.10    # Column internal diameter Dc (m)
    initial_voidage: float = 0.40      # Initial packed bed void fraction eps0 (dim-less)
    sphericity: float = 1.0            # Particle sphericity phi_s (1.0 = sphere)
    distributor_open_ratio: float = 0.04 # Ratio of hole area to total plate area
    distributor_Cd: float = 0.62       # Orifice discharge coefficient


@dataclass
class FluidisationResult:
    """Scientific simulation results for the fluidised bed."""
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
    geldart_group: str                 # 'A', 'B', 'C', or 'D'
    geldart_description: str
    regime: str                        # 'Packed Bed', 'Minimum Fluidisation', 'Bubbling', 'Turbulent', 'Entrainment'
    regime_description: str
    is_fluidised: bool
    is_entrained: bool
    
    # Operational metrics
    velocity_ratio: float              # u0 / u_mf
    dimensionless_velocity: float      # u* = u0 / (g * mu / rho_g^2)^(1/3)
    richardson_zaki_index: float
    warnings: List[str] = field(default_factory=list)


def calculate_archimedes(
    dp: float,
    rho_p: float,
    rho_g: float,
    mu: float,
    g: float = GRAVITY,
) -> float:
    """Calculate Archimedes number: Ar = dp^3 * rho_g * (rho_p - rho_g) * g / mu^2."""
    density_diff = max(1e-6, rho_p - rho_g)
    return (dp ** 3) * rho_g * density_diff * g / (mu ** 2)


def calculate_reynolds(
    u: float,
    dp: float,
    rho_g: float,
    mu: float,
) -> float:
    """Calculate particle Reynolds number: Re_p = rho_g * u * dp / mu."""
    return (rho_g * max(0.0, u) * dp) / max(1e-9, mu)


def calculate_u_mf_wen_yu(
    Ar: float,
    dp: float,
    rho_g: float,
    mu: float,
) -> Tuple[float, float]:
    """
    Wen & Yu (1966) correlation for minimum fluidisation velocity.
    Re_p,mf = sqrt(C1^2 + C2 * Ar) - C1
    with C1 = 33.7, C2 = 0.0408.
    Returns (u_mf, Re_p_mf).
    """
    C1 = 33.7
    C2 = 0.0408
    disc = (C1 ** 2) + C2 * Ar
    re_mf = math.sqrt(max(0.0, disc)) - C1
    re_mf = max(1e-6, re_mf)
    u_mf = (re_mf * mu) / (rho_g * dp)
    return u_mf, re_mf


def calculate_u_mf_ergun(
    Ar: float,
    dp: float,
    rho_g: float,
    mu: float,
    eps_mf: float = 0.40,
    phi_s: float = 1.0,
) -> Tuple[float, float]:
    """
    Solve for minimum fluidisation velocity directly from the Ergun equation
    equated to net buoyant bed weight per unit area.
    (1.75 / (phi_s * eps_mf^3)) * Re_mf^2 + (150 * (1 - eps_mf) / (phi_s^2 * eps_mf^3)) * Re_mf = Ar
    Returns (u_mf, Re_p_mf).
    """
    phi_s = max(0.1, min(1.0, phi_s))
    eps_mf = max(0.2, min(0.9, eps_mf))

    A = 1.75 / (phi_s * (eps_mf ** 3))
    B = 150.0 * (1.0 - eps_mf) / ((phi_s ** 2) * (eps_mf ** 3))
    
    # Quadratic: A * Re^2 + B * Re - Ar = 0
    disc = (B ** 2) + 4.0 * A * Ar
    re_mf = (-B + math.sqrt(max(0.0, disc))) / (2.0 * A)
    re_mf = max(1e-6, re_mf)
    u_mf = (re_mf * mu) / (rho_g * dp)
    return u_mf, re_mf


def calculate_terminal_velocity(
    Ar: float,
    dp: float,
    rho_p: float,
    rho_g: float,
    mu: float,
    phi_s: float = 1.0,
    g: float = GRAVITY,
) -> Tuple[float, float]:
    """
    Calculate single particle terminal falling velocity u_t using
    Haider & Levenspiel (1989) correlation for spherical / non-spherical particles.
    d_* = Ar^(1/3)
    u_* = [18 / d_*^2 + (2.335 - 1.744 * phi_s) / d_*^0.5]^(-1)
    u_t = u_* * [mu * (rho_p - rho_g) * g / rho_g^2]^(1/3)
    Returns (u_t, Re_t).
    """
    d_star = Ar ** (1.0 / 3.0)
    density_diff = max(1e-6, rho_p - rho_g)
    
    # Haider & Levenspiel formula
    phi_s = max(0.5, min(1.0, phi_s))
    term1 = 18.0 / (d_star ** 2)
    term2 = (2.335 - 1.744 * phi_s) / math.sqrt(max(1e-6, d_star))
    u_star = 1.0 / (term1 + term2)
    
    scale_factor = (mu * density_diff * g / (rho_g ** 2)) ** (1.0 / 3.0)
    u_t = u_star * scale_factor
    re_t = (rho_g * u_t * dp) / mu
    return u_t, re_t


def calculate_richardson_zaki_exponent(re_t: float) -> float:
    """
    Richardson-Zaki (1954) expansion exponent n based on terminal Reynolds number.
    """
    if re_t < 0.2:
        return 4.65
    elif re_t < 1.0:
        return 4.40 * (re_t ** -0.03)
    elif re_t < 500.0:
        return 4.40 * (re_t ** -0.10)
    else:
        return 2.40


def classify_geldart(dp: float, rho_p: float, rho_g: float) -> Tuple[str, str]:
    """
    Classify particles according to Geldart (1973) powder classification.
    dp in meters, densities in kg/m^3.
    """
    dp_um = dp * 1e6  # micrometres
    density_diff = max(1.0, rho_p - rho_g)
    
    if dp_um < 30.0:
        return (
            'C',
            'Geldart Group C: Cohesive, very fine powders (dp < 30 µm). '
            'Interparticle van der Waals forces dominate. Prone to channeling, cracking, and plug flow; difficult to fluidise without mechanical agitation.'
        )
    elif dp_um < 100.0 and density_diff < 1500.0:
        return (
            'A',
            'Geldart Group A: Aeratable powders (dp ~ 30-100 µm, low density). '
            'Demonstrates considerable stable bed expansion (u_mb > u_mf) before bubbling starts. Slow de-aeration rate.'
        )
    elif dp_um <= 1000.0:
        return (
            'B',
            'Geldart Group B: Sand-like bubbling particles (dp ~ 100-1000 µm, density 1400-4000 kg/m^3). '
            'Bubbles appear as soon as the gas velocity exceeds minimum fluidisation (u_mb ≈ u_mf). Bubble size grows with height.'
        )
    else:
        return (
            'D',
            'Geldart Group D: Coarse, spoutable particles (dp > 1000 µm). '
            'High gas velocities required. Large bubbling or spouting behaviour; shallow beds can exhibit slugging.'
        )


def simulate_fluidisation(inp: FluidisationInput) -> FluidisationResult:
    """
    Run complete hydrodynamic simulation of a fluidised bed.
    """
    warnings: List[str] = []
    
    # Basic property validation
    dp = max(1e-6, inp.particle_diameter_m)
    rho_p = max(100.0, inp.particle_density_kg_m3)
    rho_g = max(0.01, inp.gas_density_kg_m3)
    mu = max(1e-7, inp.gas_viscosity_Pa_s)
    u0 = max(0.0, inp.gas_velocity_m_s)
    H0 = max(0.01, inp.initial_bed_height_m)
    eps0 = max(0.20, min(0.70, inp.initial_voidage))
    phi_s = max(0.40, min(1.0, inp.sphericity))
    Dc = max(0.02, inp.column_diameter_m)
    
    if rho_p <= rho_g:
        warnings.append("Particle density must be greater than gas density for downward settled bed.")
    
    # 1. Fundamental dimensionless groups
    Ar = calculate_archimedes(dp, rho_p, rho_g, mu)
    Re_p = calculate_reynolds(u0, dp, rho_g, mu)
    
    # 2. Minimum fluidisation velocities
    u_mf_wy, re_mf_wy = calculate_u_mf_wen_yu(Ar, dp, rho_g, mu)
    u_mf_erg, re_mf_erg = calculate_u_mf_ergun(Ar, dp, rho_g, mu, eps_mf=eps0, phi_s=phi_s)
    
    # Selected design u_mf (Ergun direct with actual voidage/sphericity)
    u_mf = u_mf_erg
    re_mf = re_mf_erg
    
    # 3. Terminal settling velocity & Richardson-Zaki index
    u_t, re_t = calculate_terminal_velocity(Ar, dp, rho_p, rho_g, mu, phi_s=phi_s)
    n_rz = calculate_richardson_zaki_exponent(re_t)
    
    # 4. Theoretical maximum bed pressure drop (buoyant weight per unit area)
    # ΔP_bed,max = (1 - eps0) * (rho_p - rho_g) * g * H0
    delta_p_bed_max = (1.0 - eps0) * max(0.0, rho_p - rho_g) * GRAVITY * H0
    
    # 5. Pressure drops across bed and distributor plate
    # Ergun components evaluated at superficial velocity u0 across initial height H0
    term_visc = 150.0 * ((1.0 - eps0) ** 2) * mu * u0 / ((phi_s ** 2) * (eps0 ** 3) * (dp ** 2))
    term_inert = 1.75 * (1.0 - eps0) * rho_g * (u0 ** 2) / (phi_s * (eps0 ** 3) * dp)
    ergun_viscous_Pa = term_visc * H0
    ergun_inertial_Pa = term_inert * H0
    ergun_total_Pa = ergun_viscous_Pa + ergun_inertial_Pa
    
    is_fluidised = u0 >= u_mf
    is_entrained = u0 >= u_t
    
    if not is_fluidised:
        # Packed Bed: pressure drop rises with velocity according to Ergun
        bed_dp = ergun_total_Pa
        # Ensure it doesn't artificially exceed buoyant weight if close to u_mf
        if bed_dp > delta_p_bed_max * 1.08:
            bed_dp = delta_p_bed_max * 1.08  # small incipient peak
        expanded_voidage = eps0
        expanded_height = H0
        bubble_fraction = 0.0
        bubble_diameter = 0.0
    else:
        # Fluidised Bed: pressure drop is constant, balancing the buoyant weight of solids
        # In turbulent / entrainment regime, slight mass loss reduces bed dp slightly
        if is_entrained:
            entrainment_factor = math.exp(-0.8 * (u0 - u_t) / max(1e-4, u_t))
            bed_dp = delta_p_bed_max * max(0.2, entrainment_factor)
        else:
            bed_dp = delta_p_bed_max
        
        # Bed expansion calculation
        # Richardson-Zaki: u0 / u_t = eps^n => eps = (u0 / u_t)^(1/n)
        eps_rz = (min(0.999, u0 / max(1e-4, u_t))) ** (1.0 / n_rz)
        expanded_voidage = max(eps0, min(0.95, eps_rz))
        
        # Solid mass balance: (1 - eps0) * H0 = (1 - eps) * H
        expanded_height = H0 * (1.0 - eps0) / max(0.05, 1.0 - expanded_voidage)
        
        # Bubbling parameters (Kunii-Levenspiel model)
        if u0 > u_mf:
            # Estimate mean bubble diameter (Darton et al. 1977 approximation)
            db_calc = 0.54 * ((u0 - u_mf) ** 0.4) * (max(0.01, H0 * 0.5) ** 0.8) / (GRAVITY ** 0.2)
            bubble_diameter = max(0.005, min(Dc * 0.6, db_calc))
            # Bubble rise velocity: ub = u0 - u_mf + 0.711 * sqrt(g * db)
            u_b = (u0 - u_mf) + 0.711 * math.sqrt(GRAVITY * bubble_diameter)
            bubble_fraction = max(0.0, min(0.65, (u0 - u_mf) / max(1e-3, u_b)))
        else:
            bubble_fraction = 0.0
            bubble_diameter = 0.0
            
    # Distributor plate pressure drop: ΔP_d = 0.5 * rho_g * (u0 / (Cd * sigma))^2
    sigma = max(0.005, inp.distributor_open_ratio)
    Cd = max(0.2, inp.distributor_Cd)
    v_orifice = u0 / (Cd * sigma)
    distributor_dp = 0.5 * rho_g * (v_orifice ** 2)
    total_dp = bed_dp + distributor_dp
    
    # 6. Geldart classification
    geldart_group, geldart_desc = classify_geldart(dp, rho_p, rho_g)
    
    # 7. Regime identification
    u_turbulent_trans = 0.45 * u_t  # Approximate transition to turbulent fluidisation
    
    if u0 < 0.95 * u_mf:
        regime = 'Packed Bed'
        regime_desc = (
            f"Superficial velocity ({u0:.4f} m/s) is below minimum fluidisation velocity ({u_mf:.4f} m/s). "
            f"Particles remain stationary in a fixed bed. Pressure drop increases with velocity following Ergun equation."
        )
    elif u0 <= 1.08 * u_mf:
        regime = 'Minimum Fluidisation'
        regime_desc = (
            f"Operating right at the incipient fluidisation point (u0 ≈ u_mf = {u_mf:.4f} m/s). "
            f"The drag force fully counterbalances net buoyant weight of solid particles. Bed particles unlock and become mobile."
        )
    elif u0 < u_turbulent_trans:
        regime = 'Bubbling Fluidisation'
        regime_desc = (
            f"Superficial velocity ({u0:.4f} m/s) exceeds u_mf ({u_mf:.4f} m/s). "
            f"Excess gas passes as visible voids (bubbles) rising through the dense emulsion phase, inducing bed expansion and solid circulation."
        )
    elif u0 < u_t:
        regime = 'Turbulent Fluidisation'
        regime_desc = (
            f"High gas velocity ({u0:.4f} m/s) causes bubbles to coalesce and break down into a turbulent churn-flow regime. "
            f"Intense solid mixing with high freeboard splashing and fluctuating bed surface."
        )
    else:
        regime = 'Entrainment (Fast Fluidisation)'
        regime_desc = (
            f"Superficial gas velocity ({u0:.4f} m/s) exceeds particle terminal velocity ({u_t:.4f} m/s). "
            f"Particles are continuously elutriated and carried out through the gas outlet (pneumatic transport regime)."
        )
        warnings.append(f"Gas velocity ({u0:.3f} m/s) exceeds terminal velocity ({u_t:.3f} m/s); solid elutriation occurring.")

    expansion_ratio = expanded_height / H0
    velocity_ratio = u0 / max(1e-6, u_mf)
    dimless_velocity = u0 / ((GRAVITY * mu / (rho_g ** 2)) ** (1.0 / 3.0))
    
    return FluidisationResult(
        archimedes_number=Ar,
        reynolds_number=Re_p,
        reynolds_number_mf=re_mf,
        u_mf_wen_yu_m_s=u_mf_wy,
        u_mf_ergun_m_s=u_mf_erg,
        u_mf_design_m_s=u_mf,
        terminal_velocity_m_s=u_t,
        reynolds_terminal=re_t,
        bed_pressure_drop_Pa=bed_dp,
        distributor_pressure_drop_Pa=distributor_dp,
        total_pressure_drop_Pa=total_dp,
        ergun_viscous_Pa=ergun_viscous_Pa,
        ergun_inertial_Pa=ergun_inertial_Pa,
        theoretical_max_bed_dp_Pa=delta_p_bed_max,
        expanded_bed_height_m=expanded_height,
        expanded_voidage=expanded_voidage,
        bed_expansion_ratio=expansion_ratio,
        bubble_fraction=bubble_fraction,
        estimated_bubble_diameter_m=bubble_diameter,
        geldart_group=geldart_group,
        geldart_description=geldart_desc,
        regime=regime,
        regime_description=regime_desc,
        is_fluidised=is_fluidised,
        is_entrained=is_entrained,
        velocity_ratio=velocity_ratio,
        dimensionless_velocity=dimless_velocity,
        richardson_zaki_index=n_rz,
        warnings=warnings,
    )


def generate_fluidisation_curves(
    inp: FluidisationInput,
    n_points: int = 60,
    max_velocity_factor: float = 3.5,
) -> List[Dict[str, float]]:
    """
    Generate complete characteristic curve dataset (Pressure Drop vs u0, Bed Height vs u0)
    for interactive plotting across the entire operational envelope.
    """
    # First compute reference points
    base_res = simulate_fluidisation(inp)
    u_mf = base_res.u_mf_design_m_s
    u_t = base_res.terminal_velocity_m_s
    
    u_max = max(u_t * 1.25, u_mf * max_velocity_factor, 0.5)
    
    points: List[Dict[str, float]] = []
    
    # We create dense sampling around u_mf to clearly capture the slope change
    velocities: List[float] = [0.0]
    
    # 1. Packed bed region (0 to u_mf)
    n_packed = n_points // 3
    for i in range(1, n_packed):
        velocities.append((i / n_packed) * u_mf)
        
    # Near u_mf transition
    velocities.extend([u_mf * 0.96, u_mf * 0.99, u_mf, u_mf * 1.02, u_mf * 1.05])
    
    # 2. Fluidised region (u_mf to u_max)
    n_fluid = n_points - len(velocities)
    for i in range(1, n_fluid + 1):
        v = u_mf * 1.05 + (i / n_fluid) * (u_max - u_mf * 1.05)
        velocities.append(v)
        
    velocities.sort()
    
    # Remove duplicates
    clean_v: List[float] = []
    for v in velocities:
        if not clean_v or abs(v - clean_v[-1]) > 1e-5:
            clean_v.append(v)
            
    for v in clean_v:
        step_inp = FluidisationInput(
            gas_velocity_m_s=v,
            particle_diameter_m=inp.particle_diameter_m,
            particle_density_kg_m3=inp.particle_density_kg_m3,
            gas_density_kg_m3=inp.gas_density_kg_m3,
            gas_viscosity_Pa_s=inp.gas_viscosity_Pa_s,
            initial_bed_height_m=inp.initial_bed_height_m,
            column_diameter_m=inp.column_diameter_m,
            initial_voidage=inp.initial_voidage,
            sphericity=inp.sphericity,
            distributor_open_ratio=inp.distributor_open_ratio,
            distributor_Cd=inp.distributor_Cd,
        )
        res = simulate_fluidisation(step_inp)
        points.append({
            "gas_velocity_m_s": round(v, 5),
            "bed_pressure_drop_Pa": round(res.bed_pressure_drop_Pa, 2),
            "total_pressure_drop_Pa": round(res.total_pressure_drop_Pa, 2),
            "distributor_pressure_drop_Pa": round(res.distributor_pressure_drop_Pa, 2),
            "ergun_theoretical_Pa": round(res.ergun_viscous_Pa + res.ergun_inertial_Pa, 2),
            "expanded_bed_height_m": round(res.expanded_bed_height_m, 4),
            "expanded_voidage": round(res.expanded_voidage, 4),
            "bubble_fraction": round(res.bubble_fraction, 4),
            "is_fluidised": 1.0 if res.is_fluidised else 0.0,
            "reynolds_number": round(res.reynolds_number, 3),
        })
        
    return points

