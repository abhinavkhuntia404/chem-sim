"""
FastAPI route handlers for CHEM-SIM API.
"""

from __future__ import annotations
from fastapi import APIRouter, HTTPException

from ..models.schemas import (
    UnitConversionRequest, UnitConversionResponse,
    ComponentInfo, SaturationPressureRequest, SaturationPressureResponse,
    BubblePointRequest, DewPointRequest, VLEResponse, EquilibriumCurveResponse,
    DistillationRequest, DistillationResponse, StageDataResponse, OperatingLineResponse,
    MaterialBalanceRequest, MaterialBalanceResponse, StreamInput,
    EnergyBalanceRequest, EnergyBalanceResponse, StreamEnthalpyResponse,
    HeatExchangerRequest, HeatExchangerResponse,
    StoichiometryRequest, StoichiometryResponse,
    ReactorRequest, ReactorResponse,
)
from ..core.units import convert, UnitError, Dimension, list_units
from ..core.properties import get_component, list_components, COMPONENT_DB
from ..core.thermo import (
    bubble_temperature, dew_temperature, equilibrium_curve as eq_curve_fn,
)
from ..core.distillation import (
    ColumnConfig, FeedCondition, simulate_distillation, mccabe_thiele,
)
from ..core.material_balance import (
    ProcessUnit, Stream, Basis, UnitType, solve_material_balance, degrees_of_freedom,
)
from ..core.energy_balance import (
    energy_balance as compute_energy_balance,
    stream_enthalpy,
)
from ..core.heat_exchanger import (
    HeatExchangerInput, analyze_heat_exchanger,
)
from ..core.reactor import (
    ReactionSpec, analyze_stoichiometry,
    batch_reactor, cstr, pfr,
)


router = APIRouter()


# ===== Health =====

@router.get("/health")
def health():
    return {"status": "ok", "service": "CHEM-SIM"}


# ===== Unit Conversion =====

@router.post("/units/convert", response_model=UnitConversionResponse)
def convert_units(req: UnitConversionRequest):
    try:
        result = convert(req.value, req.from_unit, req.to_unit)
        return UnitConversionResponse(
            value=req.value, from_unit=req.from_unit,
            to_unit=req.to_unit, result=result,
        )
    except UnitError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/units/list")
def get_units(dimension: str = None):
    if dimension:
        try:
            dim = Dimension(dimension)
            return list_units(dim)
        except ValueError:
            raise HTTPException(400, f"Unknown dimension: {dimension}")
    return list_units()


# ===== Components =====

@router.get("/components", response_model=list[str])
def get_components():
    return list_components()


@router.get("/components/{name}", response_model=ComponentInfo)
def get_component_info(name: str):
    try:
        c = get_component(name)
        return ComponentInfo(
            name=c.name, formula=c.formula, cas_number=c.cas_number,
            molecular_weight=c.molecular_weight,
            normal_boiling_point_K=c.normal_boiling_point_K,
            critical_temperature_K=c.critical_temperature_K,
            critical_pressure_bar=c.critical_pressure_bar,
            acentric_factor=c.acentric_factor,
            heat_of_vaporization_kJ_mol=c.heat_of_vaporization_kJ_mol,
        )
    except KeyError as e:
        raise HTTPException(404, str(e))


@router.post("/components/saturation-pressure", response_model=SaturationPressureResponse)
def saturation_pressure(req: SaturationPressureRequest):
    try:
        c = get_component(req.component)
        p_mmHg = c.saturation_pressure_mmHg(req.temperature_C)
        p_kPa = c.saturation_pressure_kPa(req.temperature_C)
        return SaturationPressureResponse(
            component=c.name, temperature_C=req.temperature_C,
            pressure_mmHg=p_mmHg, pressure_kPa=p_kPa,
            antoine_valid=c.is_antoine_valid(req.temperature_C),
        )
    except (KeyError, ValueError) as e:
        raise HTTPException(400, str(e))


# ===== Thermodynamics / VLE =====

@router.post("/thermo/bubble-point", response_model=VLEResponse)
def calc_bubble_point(req: BubblePointRequest):
    try:
        comps = [get_component(n) for n in req.components]
        result = bubble_temperature(req.liquid_composition, comps, req.pressure_kPa)
        return VLEResponse(
            temperature_C=result.temperature_C,
            pressure_kPa=result.pressure_kPa,
            x=result.x, y=result.y, K=result.K, alpha=result.alpha,
            P_sat_kPa=result.P_sat,
            converged=result.converged, message=result.message,
        )
    except (KeyError, ValueError) as e:
        raise HTTPException(400, str(e))


@router.post("/thermo/dew-point", response_model=VLEResponse)
def calc_dew_point(req: DewPointRequest):
    try:
        comps = [get_component(n) for n in req.components]
        result = dew_temperature(req.vapor_composition, comps, req.pressure_kPa)
        return VLEResponse(
            temperature_C=result.temperature_C,
            pressure_kPa=result.pressure_kPa,
            x=result.x, y=result.y, K=result.K, alpha=result.alpha,
            P_sat_kPa=result.P_sat,
            converged=result.converged, message=result.message,
        )
    except (KeyError, ValueError) as e:
        raise HTTPException(400, str(e))


@router.post("/thermo/equilibrium-curve", response_model=EquilibriumCurveResponse)
def calc_equilibrium_curve(req: BubblePointRequest):
    try:
        comps = [get_component(n) for n in req.components]
        curve = eq_curve_fn(comps, req.pressure_kPa)
        points = [{"x": p.x, "y": p.y, "T_C": p.T_C, "alpha": p.alpha} for p in curve]
        return EquilibriumCurveResponse(
            components=req.components,
            pressure_kPa=req.pressure_kPa,
            points=points,
        )
    except (KeyError, ValueError) as e:
        raise HTTPException(400, str(e))


# ===== Distillation =====

@router.post("/distillation/simulate", response_model=DistillationResponse)
def run_distillation(req: DistillationRequest):
    try:
        comps = [get_component(req.light_component), get_component(req.heavy_component)]
        config = ColumnConfig(
            components=comps,
            feed_flow_mol_s=req.feed_flow_mol_s,
            feed_composition=req.feed_composition,
            feed_condition=FeedCondition(q=req.feed_q),
            pressure_kPa=req.pressure_kPa,
            distillate_composition=req.distillate_composition,
            bottoms_composition=req.bottoms_composition,
            reflux_ratio=req.reflux_ratio,
            condenser_type=req.condenser_type,
            reboiler_type=req.reboiler_type,
        )
        result = simulate_distillation(config)
        mt = result.mccabe_thiele

        return DistillationResponse(
            light_component=req.light_component,
            heavy_component=req.heavy_component,
            rectifying_line=OperatingLineResponse(
                slope=mt.rectifying_line.slope,
                intercept=mt.rectifying_line.intercept,
                x_range=list(mt.rectifying_line.x_range),
            ),
            stripping_line=OperatingLineResponse(
                slope=mt.stripping_line.slope,
                intercept=mt.stripping_line.intercept,
                x_range=list(mt.stripping_line.x_range),
            ),
            q_line_slope=mt.q_line_slope,
            q_line_intercept=mt.q_line_intercept,
            intersection_x=mt.intersection_x,
            intersection_y=mt.intersection_y,
            equilibrium_curve=[
                {"x": p.x, "y": p.y, "T_C": p.T_C, "alpha": p.alpha}
                for p in mt.equilibrium_curve
            ],
            stages=[
                StageDataResponse(
                    stage_number=s.stage_number, x=s.x, y=s.y,
                    T_C=s.T_C, section=s.section,
                )
                for s in mt.stages
            ],
            num_theoretical_stages=mt.num_theoretical_stages,
            feed_stage=mt.feed_stage,
            feed_flow=config.feed_flow_mol_s,
            distillate_flow=mt.distillate_flow,
            bottoms_flow=mt.bottoms_flow,
            reflux_ratio=config.reflux_ratio,
            min_reflux_ratio=mt.min_reflux_ratio,
            condenser_duty_kW=mt.condenser_duty_kW,
            reboiler_duty_kW=mt.reboiler_duty_kW,
            feed_balance_residual=mt.feed_balance_residual,
            component_balance_residual=mt.component_balance_residual,
            recovery=result.recovery,
            distillate_purity=result.distillate_purity,
            bottoms_purity=result.bottoms_purity,
            converged=result.converged,
            warnings=mt.warnings,
            assumptions=mt.assumptions,
        )
    except (KeyError, ValueError) as e:
        raise HTTPException(400, str(e))


# ===== Material Balance =====

@router.post("/material-balance/solve", response_model=MaterialBalanceResponse)
def solve_balance(req: MaterialBalanceRequest):
    try:
        basis = Basis.MOLAR if req.basis == "molar" else Basis.MASS
        unit_type_map = {
            "mixer": UnitType.MIXER, "splitter": UnitType.SPLITTER,
            "separator": UnitType.SEPARATOR, "reactor": UnitType.REACTOR,
            "generic": UnitType.GENERIC,
        }
        ut = unit_type_map.get(req.unit_type, UnitType.GENERIC)

        inlets = [
            Stream(
                name=s.name, components=s.components, flow=s.flow,
                composition=s.composition, temperature_C=s.temperature_C,
                pressure_kPa=s.pressure_kPa, phase=s.phase, basis=basis,
            )
            for s in req.inlets
        ]
        outlets = [
            Stream(
                name=s.name, components=s.components, flow=s.flow,
                composition=s.composition, temperature_C=s.temperature_C,
                pressure_kPa=s.pressure_kPa, phase=s.phase, basis=basis,
            )
            for s in req.outlets
        ]

        unit = ProcessUnit(
            name=req.unit_name, unit_type=ut,
            inlets=inlets, outlets=outlets, basis=basis,
        )

        result = solve_material_balance(unit)

        # Convert streams back to StreamInput
        stream_dict = {}
        for name, s in result.streams.items():
            stream_dict[name] = StreamInput(
                name=s.name, components=s.components, flow=s.flow,
                composition=s.composition, temperature_C=s.temperature_C,
                pressure_kPa=s.pressure_kPa, phase=s.phase,
                basis=s.basis.value,
            )

        return MaterialBalanceResponse(
            unit_name=result.unit_name,
            solved=result.solved,
            streams=stream_dict,
            dof_unknowns=result.dof.num_unknowns,
            dof_equations=result.dof.num_equations,
            dof=result.dof.dof,
            dof_status=result.dof.status,
            overall_residual=result.overall_residual,
            component_residuals=result.component_residuals,
            relative_closure=result.relative_closure,
            equations_used=result.equations_used,
            warnings=result.warnings,
        )
    except Exception as e:
        raise HTTPException(400, str(e))


# ===== Energy Balance =====

@router.post("/energy-balance/calculate", response_model=EnergyBalanceResponse)
def calc_energy_balance(req: EnergyBalanceRequest):
    try:
        inlet_comps = [get_component(n) for n in req.inlet_components]
        outlet_comps = [get_component(n) for n in req.outlet_components]

        result = compute_energy_balance(
            unit_name=req.unit_name,
            inlet_components=inlet_comps,
            inlet_flows=req.inlet_flows_mol_s,
            inlet_T_C=req.inlet_temperatures_C,
            inlet_phases=req.inlet_phases,
            outlet_components=outlet_comps,
            outlet_flows=req.outlet_flows_mol_s,
            outlet_T_C=req.outlet_temperatures_C,
            outlet_phases=req.outlet_phases,
            W_dot_W=req.work_W,
        )

        return EnergyBalanceResponse(
            unit_name=result.unit_name,
            H_in_W=result.H_in_W, H_out_W=result.H_out_W,
            Q_dot_W=result.Q_dot_W, W_dot_W=result.W_dot_W,
            residual_W=result.residual_W,
            relative_closure=result.relative_closure,
            inlet_enthalpies=[
                StreamEnthalpyResponse(
                    component=h.component, flow_mol_s=h.flow_mol_s,
                    T_C=h.T_C, phase=h.phase, h_J_mol=h.h_J_mol,
                    H_dot_W=h.H_dot_W,
                )
                for h in result.inlet_enthalpies
            ],
            outlet_enthalpies=[
                StreamEnthalpyResponse(
                    component=h.component, flow_mol_s=h.flow_mol_s,
                    T_C=h.T_C, phase=h.phase, h_J_mol=h.h_J_mol,
                    H_dot_W=h.H_dot_W,
                )
                for h in result.outlet_enthalpies
            ],
            solved=result.solved,
            assumptions=result.assumptions,
            warnings=result.warnings,
        )
    except (KeyError, ValueError) as e:
        raise HTTPException(400, str(e))


# ===== Heat Exchanger =====

@router.post("/heat-exchanger/analyze", response_model=HeatExchangerResponse)
def calc_heat_exchanger(req: HeatExchangerRequest):
    try:
        inp = HeatExchangerInput(
            hot_inlet_T_C=req.hot_inlet_T_C,
            hot_outlet_T_C=req.hot_outlet_T_C,
            hot_flow_kg_s=req.hot_flow_kg_s,
            hot_Cp_J_kgK=req.hot_Cp_J_kgK,
            cold_inlet_T_C=req.cold_inlet_T_C,
            cold_outlet_T_C=req.cold_outlet_T_C,
            cold_flow_kg_s=req.cold_flow_kg_s,
            cold_Cp_J_kgK=req.cold_Cp_J_kgK,
            flow_arrangement=req.flow_arrangement,
            U_W_m2K=req.U_W_m2K,
            area_m2=req.area_m2,
            duty_W=req.duty_W,
        )
        result = analyze_heat_exchanger(inp)

        return HeatExchangerResponse(
            hot_inlet_T_C=result.hot_inlet_T_C,
            hot_outlet_T_C=result.hot_outlet_T_C,
            cold_inlet_T_C=result.cold_inlet_T_C,
            cold_outlet_T_C=result.cold_outlet_T_C,
            duty_W=result.duty_W,
            hot_duty_W=result.hot_duty_W,
            cold_duty_W=result.cold_duty_W,
            energy_balance_residual_W=result.energy_balance_residual_W,
            delta_T_1=result.delta_T_1,
            delta_T_2=result.delta_T_2,
            LMTD_C=result.LMTD_C,
            flow_arrangement=result.flow_arrangement,
            UA_W_K=result.UA_W_K,
            U_W_m2K=result.U_W_m2K,
            area_m2=result.area_m2,
            min_approach_C=result.min_approach_C,
            feasible=result.feasible,
            calc_type=result.calc_type,
            warnings=result.warnings,
            assumptions=result.assumptions,
            hot_profile=[[p[0], p[1]] for p in result.hot_profile],
            cold_profile=[[p[0], p[1]] for p in result.cold_profile],
        )
    except Exception as e:
        raise HTTPException(400, str(e))


# ===== Reactor =====

@router.post("/reactor/stoichiometry", response_model=StoichiometryResponse)
def calc_stoichiometry(req: StoichiometryRequest):
    try:
        rxn = ReactionSpec(name=req.reaction_name, stoichiometry=req.stoichiometry)
        result = analyze_stoichiometry(rxn, req.feed_moles, req.conversion)
        return StoichiometryResponse(
            limiting_reactant=result.limiting_reactant,
            excess_reactants=result.excess_reactants,
            max_extent=result.max_extent,
            theoretical_yield=result.theoretical_yield,
            conversion=result.conversion,
            actual_product_moles=result.actual_product_moles,
            warnings=result.warnings,
        )
    except Exception as e:
        raise HTTPException(400, str(e))


@router.post("/reactor/simulate", response_model=ReactorResponse)
def run_reactor(req: ReactorRequest):
    try:
        if req.reactor_type.lower() == "batch":
            if req.tau_s is None:
                raise ValueError("Batch reactor requires tau_s (reaction time).")
            result = batch_reactor(req.C_A0, req.k, req.tau_s, req.order)
        elif req.reactor_type.upper() == "CSTR":
            result = cstr(
                req.C_A0, req.k, req.tau_s, req.target_conversion,
                req.volume_m3, req.volumetric_flow_m3_s, req.order,
            )
        elif req.reactor_type.upper() == "PFR":
            result = pfr(
                req.C_A0, req.k, req.tau_s, req.target_conversion,
                req.volume_m3, req.volumetric_flow_m3_s, req.order,
            )
        else:
            raise ValueError(f"Unknown reactor type: {req.reactor_type}")

        return ReactorResponse(
            reactor_type=result.reactor_type,
            conversion=result.conversion,
            exit_concentrations=result.exit_concentrations,
            volume_m3=result.volume_m3,
            residence_time_s=result.residence_time_s,
            rate_at_exit=result.rate_at_exit,
            rate_constant=result.rate_constant,
            warnings=result.warnings,
            assumptions=result.assumptions,
        )
    except (ValueError, Exception) as e:
        raise HTTPException(400, str(e))
