"""
Unit tests for Centrifugal Pump Digital Twin Physics Engine.
Tests:
- Fluid properties and temperature correlations
- Affinity laws (speed & diameter scaling)
- Operating point solver (pump head vs system head)
- Darcy-Weisbach pipe friction
- NPSHa, NPSHr and cavitation detection
- ANSI/HI 9.6.7 viscosity correction
- Fault scenarios (dry run, cavitation, blockages, bearing defects)
"""

import unittest
import math
from app.core.pump import (
    simulate_centrifugal_pump,
    OperatingConditions,
    FLUID_DATABASE,
    PUMP_CATALOG,
    PUMP_COMPONENTS,
    calculate_pipe_friction_factor,
    calculate_hi_viscosity_correction,
    calculate_valve_loss_coefficient
)


class TestPumpPhysicsEngine(unittest.TestCase):

    def test_water_baseline_simulation(self):
        """Verify baseline pump simulation under clean water at rated conditions."""
        cond = OperatingConditions(
            pump_id="iso2858_chemical",
            fluid_id="water",
            speed_rpm=2900.0,
            suction_valve_opening_pct=100.0,
            discharge_valve_opening_pct=80.0
        )
        res = simulate_centrifugal_pump(cond)
        t = res.telemetry

        # Verify operating point is positive and reasonable for 50-32-160 pump
        self.assertGreater(t.operating_flow_m3_h, 10.0)
        self.assertLess(t.operating_flow_m3_h, 45.0)
        self.assertGreater(t.operating_head_m, 20.0)
        self.assertLess(t.operating_head_m, 45.0)
        self.assertGreater(t.efficiency_pct, 50.0)
        self.assertGreater(t.shaft_power_kw, 1.0)
        self.assertLess(t.shaft_power_kw, 7.0)
        self.assertGreater(t.npsha_m, 5.0)
        self.assertFalse(t.is_cavitating)

    def test_affinity_laws_speed_scaling(self):
        """Verify Affinity laws: H2/H1 = (N2/N1)^2, Q2/Q1 = N2/N1."""
        cond_base = OperatingConditions(
            pump_id="iso2858_chemical",
            speed_rpm=2900.0
        )
        cond_half = OperatingConditions(
            pump_id="iso2858_chemical",
            speed_rpm=1450.0  # 50% speed
        )

        res_base = simulate_centrifugal_pump(cond_base)
        res_half = simulate_centrifugal_pump(cond_half)

        # BEP flow scales linearly with speed: Q_bep ~ N
        ratio_q = res_half.telemetry.bep_flow_m3_h / res_base.telemetry.bep_flow_m3_h
        self.assertAlmostEqual(ratio_q, 0.5, places=2)

        # Shutoff head scales quadratic with speed: H_0 ~ N^2
        ratio_h0 = res_half.telemetry.shutoff_head_m / res_base.telemetry.shutoff_head_m
        self.assertAlmostEqual(ratio_h0, 0.25, places=2)

    def test_viscosity_correction_hi(self):
        """Verify that high viscosity liquids (Glycerol 85%) trigger ANSI/HI 9.6.7 derating."""
        c_h, c_q, c_eta = calculate_hi_viscosity_correction(
            flow_bep_m3_h=30.0,
            head_bep_m=32.0,
            speed_rpm=2900.0,
            kinematic_viscosity_cst=89.0  # Viscous
        )
        self.assertLess(c_h, 1.0)
        self.assertLess(c_q, 1.0)
        self.assertLess(c_eta, 1.0)
        self.assertGreater(c_h, 0.5)

        cond_visc = OperatingConditions(
            pump_id="iso2858_chemical",
            fluid_id="glycerol_85"
        )
        res_visc = simulate_centrifugal_pump(cond_visc)
        self.assertTrue(res_visc.telemetry.hi_viscosity_correction_applied)
        self.assertLess(res_visc.telemetry.bep_head_m, 32.0)

    def test_pipe_friction_laminar_and_turbulent(self):
        """Test Darcy friction factor for laminar (64/Re) and Swamee-Jain turbulent flow."""
        f_lam = calculate_pipe_friction_factor(reynolds=1000.0, relative_roughness=0.001)
        self.assertAlmostEqual(f_lam, 64.0 / 1000.0, places=4)

        f_turb = calculate_pipe_friction_factor(reynolds=100000.0, relative_roughness=0.0005)
        self.assertGreater(f_turb, 0.015)
        self.assertLess(f_turb, 0.035)

    def test_cavitation_detection(self):
        """Verify cavitation triggered when suction head is lowered or fluid is boiling hot."""
        cond_hot = OperatingConditions(
            pump_id="iso2858_chemical",
            fluid_id="water",
            fluid_temp_c=95.0,  # Hot water has high vapor pressure (84 kPa)
            suction_static_head_m=-2.0 # Suction lift
        )
        res = simulate_centrifugal_pump(cond_hot)
        t = res.telemetry
        self.assertTrue(t.is_cavitating)
        self.assertLess(t.cavitation_margin_m, 0.0)
        self.assertGreater(t.vibration_velocity_mm_s, 3.0)  # Elevated vibration

    def test_fault_dry_running(self):
        """Verify dry running fault reduces flow to 0 and raises seal temperature alarm."""
        cond_dry = OperatingConditions(
            fault_dry_run=1.0
        )
        res = simulate_centrifugal_pump(cond_dry)
        t = res.telemetry
        self.assertEqual(t.operating_flow_m3_h, 0.0)
        self.assertGreater(t.seal_face_temp_c, 100.0)
        self.assertTrue(any("DRY" in a for a in t.fault_alerts))

    def test_fault_bearing_defect(self):
        """Verify bearing fault elevates vibration and bearing housing temperature."""
        cond_brg = OperatingConditions(
            fault_bearing_defect=0.8
        )
        res = simulate_centrifugal_pump(cond_brg)
        t = res.telemetry
        self.assertGreater(t.vibration_velocity_mm_s, 6.0)
        self.assertGreater(t.bearing_temp_c, 65.0)
        self.assertTrue(any("BEARING" in a for a in t.fault_alerts))

    def test_catalog_and_components(self):
        """Verify component hierarchy and catalog completeness."""
        self.assertGreaterEqual(len(PUMP_CATALOG), 6)
        self.assertGreaterEqual(len(FLUID_DATABASE), 16)
        self.assertGreaterEqual(len(PUMP_COMPONENTS), 10)


if __name__ == "__main__":
    unittest.main()

