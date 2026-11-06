"""
Unit tests for the Fluidisation Core Engineering Engine.
Tests Ergun equation, Archimedes number, Reynolds number, Wen-Yu correlation,
terminal velocity, bed expansion, Geldart classification, and pressure drop curves.
"""

import unittest
import math
import sys
import os

# Ensure backend app is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.fluidisation import (
    FluidisationInput,
    FluidisationResult,
    calculate_archimedes,
    calculate_reynolds,
    calculate_u_mf_wen_yu,
    calculate_u_mf_ergun,
    calculate_terminal_velocity,
    calculate_richardson_zaki_exponent,
    classify_geldart,
    simulate_fluidisation,
    generate_fluidisation_curves,
)


class TestFluidisationCore(unittest.TestCase):
    def setUp(self):
        # Benchmark system: Air at 20°C and spherical glass beads
        # dp = 500 µm = 0.0005 m, rho_p = 2500 kg/m^3
        # rho_g = 1.205 kg/m^3, mu = 1.82e-5 Pa.s
        self.benchmark_input = FluidisationInput(
            gas_velocity_m_s=0.25,
            particle_diameter_m=0.0005,
            particle_density_kg_m3=2500.0,
            gas_density_kg_m3=1.205,
            gas_viscosity_Pa_s=1.82e-5,
            initial_bed_height_m=0.40,
            column_diameter_m=0.10,
            initial_voidage=0.40,
            sphericity=1.0,
        )

    def test_archimedes_number(self):
        """Verify Archimedes number calculation."""
        # Ar = (dp^3 * rho_g * (rho_p - rho_g) * g) / mu^2
        # (0.0005^3 * 1.205 * (2500 - 1.205) * 9.80665) / (1.82e-5)^2
        # = (1.25e-10 * 1.205 * 2498.795 * 9.80665) / 3.3124e-10 ≈ 11140
        Ar = calculate_archimedes(
            dp=0.0005,
            rho_p=2500.0,
            rho_g=1.205,
            mu=1.82e-5,
        )
        self.assertGreater(Ar, 10000.0)
        self.assertLess(Ar, 12000.0)

    def test_reynolds_number(self):
        """Verify particle Reynolds number Re_p = rho_g * u * dp / mu."""
        re = calculate_reynolds(
            u=0.20,
            dp=0.0005,
            rho_g=1.205,
            mu=1.82e-5,
        )
        # 1.205 * 0.20 * 0.0005 / 1.82e-5 = 6.6208
        self.assertAlmostEqual(re, 6.6208, places=2)

    def test_u_mf_wen_yu(self):
        """Verify Wen & Yu correlation."""
        Ar = 11140.0
        u_mf, re_mf = calculate_u_mf_wen_yu(
            Ar=Ar,
            dp=0.0005,
            rho_g=1.205,
            mu=1.82e-5,
        )
        self.assertGreater(u_mf, 0.10)
        self.assertLess(u_mf, 0.35)
        self.assertGreater(re_mf, 3.0)
        self.assertLess(re_mf, 10.0)

    def test_u_mf_ergun_quadratic(self):
        """Verify Ergun equation solution at incipient fluidisation."""
        Ar = 11140.0
        u_mf, re_mf = calculate_u_mf_ergun(
            Ar=Ar,
            dp=0.0005,
            rho_g=1.205,
            mu=1.82e-5,
            eps_mf=0.40,
            phi_s=1.0,
        )
        self.assertGreater(u_mf, 0.10)
        self.assertLess(u_mf, 0.35)
        self.assertGreater(re_mf, 3.0)
        self.assertLess(re_mf, 10.0)

    def test_terminal_velocity(self):
        """Verify single particle terminal velocity calculation."""
        Ar = calculate_archimedes(0.0005, 2500.0, 1.205, 1.82e-5)
        u_t, re_t = calculate_terminal_velocity(
            Ar=Ar,
            dp=0.0005,
            rho_p=2500.0,
            rho_g=1.205,
            mu=1.82e-5,
        )
        # For 0.5 mm glass beads falling in air, terminal velocity is typically ~ 3.5 to 4.5 m/s
        self.assertGreater(u_t, 2.5)
        self.assertLess(u_t, 5.5)
        self.assertGreater(re_t, 50.0)

    def test_geldart_classification(self):
        """Verify Geldart powder groups classification."""
        # 10 µm FCC fines -> Group C
        group_c, _ = classify_geldart(dp=10e-6, rho_p=1500.0, rho_g=1.2)
        self.assertEqual(group_c, 'C')

        # 60 µm catalyst -> Group A
        group_a, _ = classify_geldart(dp=60e-6, rho_p=1000.0, rho_g=1.2)
        self.assertEqual(group_a, 'A')

        # 500 µm sand -> Group B
        group_b, _ = classify_geldart(dp=500e-6, rho_p=2500.0, rho_g=1.2)
        self.assertEqual(group_b, 'B')

        # 3 mm coarse beans -> Group D
        group_d, _ = classify_geldart(dp=3000e-6, rho_p=1200.0, rho_g=1.2)
        self.assertEqual(group_d, 'D')

    def test_packed_bed_vs_fluidised_pressure_drop(self):
        """Verify pressure drop physics: increases below u_mf, plateaus above u_mf."""
        # Run at 0.05 m/s (Packed bed)
        packed_inp = FluidisationInput(
            gas_velocity_m_s=0.05,
            particle_diameter_m=0.0005,
            particle_density_kg_m3=2500.0,
            gas_density_kg_m3=1.205,
            gas_viscosity_Pa_s=1.82e-5,
            initial_bed_height_m=0.40,
            initial_voidage=0.40,
        )
        res_packed = simulate_fluidisation(packed_inp)
        self.assertFalse(res_packed.is_fluidised)
        self.assertEqual(res_packed.regime, "Packed Bed")
        self.assertEqual(res_packed.expanded_bed_height_m, 0.40)

        # Run at 0.45 m/s (Bubbling fluidised bed)
        fluid_inp = FluidisationInput(
            gas_velocity_m_s=0.45,
            particle_diameter_m=0.0005,
            particle_density_kg_m3=2500.0,
            gas_density_kg_m3=1.205,
            gas_viscosity_Pa_s=1.82e-5,
            initial_bed_height_m=0.40,
            initial_voidage=0.40,
        )
        res_fluid = simulate_fluidisation(fluid_inp)
        self.assertTrue(res_fluid.is_fluidised)
        self.assertIn("Fluidisation", res_fluid.regime)
        # Bed height must expand
        self.assertGreater(res_fluid.expanded_bed_height_m, 0.40)
        # Bed pressure drop must equal buoyant weight
        expected_max_dp = (1.0 - 0.40) * (2500.0 - 1.205) * 9.80665 * 0.40
        self.assertAlmostEqual(res_fluid.bed_pressure_drop_Pa, expected_max_dp, delta=50.0)

    def test_curve_generation(self):
        """Verify characteristic curve generation produces monotonic and valid values."""
        curves = generate_fluidisation_curves(self.benchmark_input, n_points=30)
        self.assertGreater(len(curves), 20)
        
        # Check first point at zero velocity
        self.assertEqual(curves[0]["gas_velocity_m_s"], 0.0)
        self.assertEqual(curves[0]["bed_pressure_drop_Pa"], 0.0)
        
        # Check velocities are strictly non-decreasing
        for i in range(1, len(curves)):
            self.assertGreaterEqual(curves[i]["gas_velocity_m_s"], curves[i - 1]["gas_velocity_m_s"])


if __name__ == "__main__":
    unittest.main()

