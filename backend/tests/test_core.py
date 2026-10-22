"""
Unit and integration tests for CHEM-SIM backend.
"""

import pytest
import numpy as np
from fastapi.testclient import TestClient

from app.core.units import convert, list_compatible
from app.core.properties import get_component, list_components
from app.core.thermo import (
    bubble_temperature,
    dew_temperature,
    equilibrium_curve,
    relative_volatility,
)
from app.core.distillation import (
    mccabe_thiele,
    ColumnConfig,
    FeedCondition,
)
from app.core.heat_exchanger import (
    calculate_LMTD,
    analyze_heat_exchanger,
    HeatExchangerInput,
)
from app.core.reactor import (
    cstr,
    pfr,
    batch_reactor,
)
from app.main import app

client = TestClient(app)


# 1. Units Tests
def test_unit_conversion():
    # Temperature
    assert pytest.approx(convert(100.0, "C", "K"), 0.01) == 373.15
    assert pytest.approx(convert(32.0, "F", "C"), abs=1e-5) == 0.0

    # Pressure
    assert pytest.approx(convert(1.0, "atm", "kPa"), 0.01) == 101.325
    assert pytest.approx(convert(1.0, "bar", "kPa"), 0.01) == 100.0

    # Flow rate
    assert pytest.approx(convert(3600.0, "kg/h", "kg/s"), 0.01) == 1.0


# 2. Component Properties
def test_component_properties():
    comps = list_components()
    assert "Benzene" in comps
    assert "Toluene" in comps

    b = get_component("benzene")
    assert pytest.approx(b.molecular_weight, 0.1) == 78.11
    assert pytest.approx(b.normal_boiling_point_C, 0.5) == 80.1


# 3. Thermodynamics
def test_thermodynamics():
    b = get_component("benzene")
    t = get_component("toluene")

    # Vapor pressure of benzene at 80.1 C should be close to 101.325 kPa (1 atm)
    pv = b.saturation_pressure_kPa(80.1)
    assert pytest.approx(pv, rel=0.05) == 101.325

    # Bubble point of equimolar mixture benzene-toluene at 101.325 kPa
    res_bub = bubble_temperature([0.5, 0.5], [b, t], P_kPa=101.325)
    assert res_bub.converged is True
    assert 80.1 < res_bub.temperature_C < 110.6

    # Dew point
    res_dew = dew_temperature([0.5, 0.5], [b, t], P_kPa=101.325)
    assert res_dew.converged is True
    assert 80.1 < res_dew.temperature_C < 110.6
    assert res_dew.temperature_C >= res_bub.temperature_C

    # VLE curve
    curve = equilibrium_curve([b, t], P_kPa=101.325, n_points=21)
    assert len(curve) == 21
    assert pytest.approx(curve[0].x, 1e-4) == 0.0
    assert pytest.approx(curve[-1].x, 1e-4) == 1.0


# 4. Distillation (McCabe-Thiele)
def test_mccabe_thiele():
    b = get_component("benzene")
    t = get_component("toluene")

    config = ColumnConfig(
        components=[b, t],
        feed_flow_mol_s=100.0,
        feed_composition=0.4,
        feed_condition=FeedCondition.saturated_liquid(),
        pressure_kPa=101.325,
        distillate_composition=0.95,
        bottoms_composition=0.05,
        reflux_ratio=2.5,
    )
    res = mccabe_thiele(config)
    assert res.converged is True
    assert res.num_theoretical_stages >= 4
    assert res.min_reflux_ratio is not None
    assert res.min_reflux_ratio < config.reflux_ratio
    assert res.feed_stage > 0


# 5. Heat Exchanger
def test_heat_exchanger():
    lmtd, dt1, dt2 = calculate_LMTD(100.0, 60.0, 20.0, 50.0, arrangement="countercurrent")
    assert lmtd > 0
    assert dt1 == 50.0
    assert dt2 == 40.0

    hx_inp = HeatExchangerInput(
        hot_inlet_T_C=100.0,
        cold_inlet_T_C=20.0,
        hot_flow_kg_s=2.0,
        hot_Cp_J_kgK=4184.0,
        cold_flow_kg_s=2.5,
        cold_Cp_J_kgK=4184.0,
        hot_outlet_T_C=60.0,
        U_W_m2K=800.0,
    )
    hx_res = analyze_heat_exchanger(hx_inp)
    assert hx_res.feasible is True
    assert hx_res.duty_W > 0
    assert hx_res.area_m2 is not None
    assert hx_res.area_m2 > 0


# 6. Reactor
def test_reactors():
    # CSTR: tau = 10s, k = 0.1 s^-1 -> X = 1.0 / (1 + 1.0) = 0.5
    rcstr = cstr(C_A0=1.0, k=0.1, tau_s=10.0)
    assert pytest.approx(rcstr.conversion, 0.01) == 0.5

    # PFR: X = 1 - exp(-k * tau) = 1 - exp(-1.0) ~= 0.632
    rpfr = pfr(C_A0=1.0, k=0.1, tau_s=10.0)
    assert rpfr.conversion > rcstr.conversion
    assert pytest.approx(rpfr.conversion, 0.01) == 1.0 - np.exp(-1.0)


# 7. FastAPI API Integration
def test_api_health_and_endpoints():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

    res_comps = client.get("/api/v1/components")
    assert res_comps.status_code == 200
    comps = res_comps.json()
    assert "Benzene" in comps

    res_unit = client.post("/api/v1/units/convert", json={
        "value": 100.0,
        "from_unit": "C",
        "to_unit": "K"
    })
    assert res_unit.status_code == 200
    assert pytest.approx(res_unit.json()["result"], 0.01) == 373.15
