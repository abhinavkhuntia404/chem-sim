import { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Settings,
  Droplet,
  Sliders,
  TrendingUp,
  AlertTriangle,
  FlaskConical,
  FileText,
  RotateCcw,
  HelpCircle,
  Plus,
} from 'lucide-react';
import type {
  PumpGeometryData,
  FluidData,
  PumpOperatingConditions,
  PumpTelemetry,
  PumpPerformancePoint,
  ExperimentObservationLog,
} from './types';
import {
  PUMP_CATALOG_CLIENT,
  FLUID_DATABASE_CLIENT,
  simulatePump,
} from './api';
import { Pump3DViewer } from './components/Pump3DViewer';
import { PumpPerformanceChart } from './components/PumpPerformanceChart';
import { PumpFaultDiagnostics } from './components/PumpFaultDiagnostics';
import { PumpVirtualExperiments } from './components/PumpVirtualExperiments';
import { PumpReportExport } from './components/PumpReportExport';

export function CentrifugalPumpModule() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'anatomy' | 'configurations' | 'fluids' | 'operating_lab' | 'performance' | 'faults' | 'experiments' | 'report'
  >('operating_lab');

  // Simulation State
  const [conditions, setConditions] = useState<PumpOperatingConditions>({
    pump_id: 'iso2858_chemical',
    fluid_id: 'water',
    fluid_temp_c: 20.0,
    speed_rpm: 2900.0,
    suction_static_head_m: 2.0,
    discharge_static_head_m: 18.0,
    suction_pipe_dia_m: 0.08,
    suction_pipe_length_m: 8.0,
    discharge_pipe_dia_m: 0.05,
    discharge_pipe_length_m: 45.0,
    suction_valve_opening_pct: 100.0,
    discharge_valve_opening_pct: 80.0,
    pipe_roughness_m: 0.000045,
    fault_cavitation_override: 0.0,
    fault_dry_run: 0.0,
    fault_suction_clog: 0.0,
    fault_discharge_clog: 0.0,
    fault_impeller_wear: 0.0,
    fault_bearing_defect: 0.0,
    fault_seal_leakage: 0.0,
    fault_misalignment: 0.0,
    gas_entrainment_pct: 0.0,
  });

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [currentPump, setCurrentPump] = useState<PumpGeometryData>(PUMP_CATALOG_CLIENT['iso2858_chemical']);
  const [currentFluid, setCurrentFluid] = useState<FluidData>(FLUID_DATABASE_CLIENT['water']);
  const [telemetry, setTelemetry] = useState<PumpTelemetry | null>(null);
  const [curves, setCurves] = useState<PumpPerformancePoint[]>([]);
  const [observationLogs, setObservationLogs] = useState<ExperimentObservationLog[]>([]);

  // Custom fluid form state
  const [customFluidName, setCustomFluidName] = useState<string>('');
  const [customDensity, setCustomDensity] = useState<number>(1000);
  const [customViscosity, setCustomViscosity] = useState<number>(1.0); // cP
  const [customVaporPress, setCustomVaporPress] = useState<number>(2.3); // kPa

  // Run simulation solver
  const runSimulation = useCallback(async (conds: PumpOperatingConditions) => {
    try {
      const res = await simulatePump(conds);
      setCurrentPump(res.pump);
      setCurrentFluid(res.fluid);
      setTelemetry(res.telemetry);
      setCurves(res.characteristic_curve);
    } catch (err) {
      console.error('Simulation error:', err);
    }
  }, []);

  useEffect(() => {
    runSimulation(conditions);
  }, [conditions, runSimulation]);

  const updateConditions = (patch: Partial<PumpOperatingConditions>) => {
    setConditions((prev) => ({ ...prev, ...patch }));
  };

  const handleAddObservationLog = (log: ExperimentObservationLog) => {
    setObservationLogs((prev) => [log, ...prev]);
  };

  const handleClearObservationLogs = () => {
    setObservationLogs([]);
  };

  const handleCreateCustomFluid = () => {
    if (!customFluidName.trim()) return;
    const newId = `custom_${Date.now()}`;
    const newFluid: FluidData = {
      id: newId,
      name: customFluidName,
      category: 'User Custom Fluid',
      base_density: customDensity,
      base_viscosity_pa_s: customViscosity * 0.001,
      base_vapor_pressure_pa: customVaporPress * 1000,
      specific_heat_j_kg_k: 3500,
      thermal_cond_w_m_k: 0.45,
      rheology_model: 'newtonian',
      power_law_k: 0,
      power_law_n: 1,
      yield_stress_pa: 0,
      solids_volume_fraction: 0,
      solids_particle_um: 0,
      description: 'Custom user-specified chemical process fluid.',
    };
    FLUID_DATABASE_CLIENT[newId] = newFluid;
    updateConditions({ fluid_id: newId });
    setCustomFluidName('');
  };

  return (
    <div className="centrifugal-pump-module" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Module Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          background: '#0f172a',
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #1e293b',
          overflowX: 'auto',
          alignItems: 'center',
        }}
      >
        <button
          className={`btn-tag ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <HelpCircle size={14} /> Overview & Theory
        </button>
        <button
          className={`btn-tag ${activeTab === 'anatomy' ? 'active' : ''}`}
          onClick={() => setActiveTab('anatomy')}
          style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Layers size={14} /> 3D Anatomy
        </button>
        <button
          className={`btn-tag ${activeTab === 'configurations' ? 'active' : ''}`}
          onClick={() => setActiveTab('configurations')}
          style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Settings size={14} /> Configurations
        </button>
        <button
          className={`btn-tag ${activeTab === 'fluids' ? 'active' : ''}`}
          onClick={() => setActiveTab('fluids')}
          style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Droplet size={14} /> Fluid Library
        </button>
        <button
          className={`btn-tag ${activeTab === 'operating_lab' ? 'active' : ''}`}
          onClick={() => setActiveTab('operating_lab')}
          style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Sliders size={14} /> Operating Lab
        </button>
        <button
          className={`btn-tag ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
          style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <TrendingUp size={14} /> Performance Curves
        </button>
        <button
          className={`btn-tag ${activeTab === 'faults' ? 'active' : ''}`}
          onClick={() => setActiveTab('faults')}
          style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <AlertTriangle size={14} /> Fault Diagnostics
        </button>
        <button
          className={`btn-tag ${activeTab === 'experiments' ? 'active' : ''}`}
          onClick={() => setActiveTab('experiments')}
          style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <FlaskConical size={14} /> Virtual Experiments (EXP-01..15)
        </button>
        <button
          className={`btn-tag ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
          style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <FileText size={14} /> Report Export
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. OVERVIEW & THEORY TAB                                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#0f172a', padding: 20, borderRadius: 8, border: '1px solid #1e293b' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0' }}>
              Centrifugal Pump Engineering Fundamentals & Turbomachinery Principles
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Centrifugal pumps are the most widely used fluid kinetic machines in the chemical, petrochemical, pharmaceutical, and water treatment industries. They operate on hydrodynamic principles, using backward-curved impeller vanes to convert rotational mechanical energy into dynamic kinetic energy, which is subsequently converted into static pressure head within a spiral volute diffuser casing according to Bernoulli's principle.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 14 }}>
            {/* Box 1: Euler Turbomachine Equation */}
            <div style={{ background: '#0f172a', padding: 16, borderRadius: 8, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>
                1. Euler Turbomachine Equation
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                <p style={{ margin: '0 0 6px 0' }}>
                  The theoretical head imparted to the fluid is given by Euler's head equation:
                </p>
                <div style={{ background: '#1e293b', padding: '8px 12px', borderRadius: 4, fontFamily: 'monospace', color: '#f8fafc', margin: '6px 0' }}>
                  H_E = (u₂ · v_θ₂ - u₁ · v_θ₁) / g
                </div>
                <p style={{ margin: '6px 0 0 0' }}>
                  Assuming radial inlet flow (no pre-whirl, v_θ₁ = 0), this simplifies to:
                  <br />
                  <strong style={{ color: '#38bdf8' }}>H_E = (σ · u₂²) / g</strong>
                  <br />
                  where σ is the Stodola slip factor (typically 0.85 - 0.90) and u₂ = π D₂ N / 60 is the impeller blade tip velocity.
                </p>
              </div>
            </div>

            {/* Box 2: Turbomachinery Affinity Laws */}
            <div style={{ background: '#0f172a', padding: 16, borderRadius: 8, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>
                2. Turbomachinery Affinity Laws
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                <p style={{ margin: '0 0 6px 0' }}>
                  Predicts performance changes when speed (N) or impeller diameter (D) varies:
                </p>
                <div style={{ background: '#1e293b', padding: '8px 12px', borderRadius: 4, fontFamily: 'monospace', color: '#f8fafc', margin: '6px 0' }}>
                  Flow: Q₂/Q₁ = (N₂/N₁) · (D₂/D₁)
                  <br />
                  Head: H₂/H₁ = (N₂/N₁)² · (D₂/D₁)²
                  <br />
                  Power: P₂/P₁ = (N₂/N₁)³ · (D₂/D₁)⁵
                </div>
                <p style={{ margin: '6px 0 0 0' }}>
                  Affinity laws explain why VFD speed reduction yields massive cubic power savings compared to valve throttling.
                </p>
              </div>
            </div>

            {/* Box 3: NPSH & Cavitation Inception */}
            <div style={{ background: '#0f172a', padding: 16, borderRadius: 8, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>
                3. Net Positive Suction Head & Cavitation
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                <p style={{ margin: '0 0 6px 0' }}>
                  To prevent vapor bubble inception and destructive cavitation:
                </p>
                <div style={{ background: '#1e293b', padding: '8px 12px', borderRadius: 4, fontFamily: 'monospace', color: '#f8fafc', margin: '6px 0' }}>
                  NPSHa = (P_suct - P_v) / (ρ·g) + v_s² / (2g)
                  <br />
                  Margin = NPSHa - NPSHr &gt; 1.0 m
                </div>
                <p style={{ margin: '6px 0 0 0' }}>
                  If NPSHa &lt; NPSHr, vapor bubbles nucleate at the eye rim and implode in the volute with acoustic cracking and rapid metal pitting.
                </p>
              </div>
            </div>

            {/* Box 4: Darcy-Weisbach System Curve */}
            <div style={{ background: '#0f172a', padding: 16, borderRadius: 8, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>
                4. System Resistance & Operating Point
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                <p style={{ margin: '0 0 6px 0' }}>
                  The operating point occurs at the intersection H_pump(Q*) = H_sys(Q*):
                </p>
                <div style={{ background: '#1e293b', padding: '8px 12px', borderRadius: 4, fontFamily: 'monospace', color: '#f8fafc', margin: '6px 0' }}>
                  H_sys = Δz_static + [f · (L/D) + ΣK_L] · v² / (2g)
                </div>
                <p style={{ margin: '6px 0 0 0' }}>
                  Pipe friction factor f is determined via Colebrook-White / Swamee-Jain equations spanning laminar and turbulent regimes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. 3D ANATOMY TAB                                             */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'anatomy' && telemetry && (
        <div style={{ height: 620 }}>
          <Pump3DViewer
            pump={currentPump}
            telemetry={telemetry}
            isRunning={isRunning}
            speedRpm={conditions.speed_rpm}
            onToggleRunning={() => setIsRunning(!isRunning)}
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. PUMP CONFIGURATIONS TAB                                   */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'configurations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#0f172a', padding: 16, borderRadius: 8, border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Centrifugal Pump Classification Database
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>
              Select an industrial pump configuration to load its specific geometry, impeller construction, and operating limits.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            {Object.values(PUMP_CATALOG_CLIENT).map((p) => {
              const isSelected = conditions.pump_id === p.id;
              return (
                <div
                  key={p.id}
                  style={{
                    background: isSelected ? '#0f2942' : '#0f172a',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #1e293b',
                    borderRadius: 8,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.7rem', background: '#1e293b', color: '#38bdf8', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                        {p.pump_type.toUpperCase()} • {p.num_stages} STAGE(S)
                      </span>
                      {isSelected && (
                        <span style={{ fontSize: '0.68rem', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                          ACTIVE MODEL
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', marginTop: 6 }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 6, lineHeight: 1.45 }}>
                      {p.description}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, fontSize: '0.74rem', background: '#1e293b44', padding: 10, borderRadius: 6 }}>
                      <div><strong style={{ color: '#cbd5e1' }}>Impeller:</strong> {p.impeller_construction}</div>
                      <div><strong style={{ color: '#cbd5e1' }}>Casing:</strong> {p.casing_design}</div>
                      <div><strong style={{ color: '#cbd5e1' }}>Rated Speed:</strong> {p.rated_speed_rpm} RPM</div>
                      <div><strong style={{ color: '#cbd5e1' }}>Rated BEP Q:</strong> {p.rated_flow_m3_h} m³/h</div>
                      <div><strong style={{ color: '#cbd5e1' }}>Rated BEP H:</strong> {p.rated_head_m} m</div>
                      <div><strong style={{ color: '#cbd5e1' }}>Motor Drive:</strong> {p.motor_power_kw} kW</div>
                    </div>
                  </div>

                  <button
                    onClick={() => updateConditions({ pump_id: p.id, speed_rpm: p.rated_speed_rpm })}
                    style={{
                      background: isSelected ? '#0284c7' : '#1e293b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 14px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {isSelected ? 'Currently Loaded' : 'Load Configuration'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. FLUID LIBRARY & RHEOLOGY TAB                              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'fluids' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Header */}
          <div style={{ background: '#0f172a', padding: 16, borderRadius: 8, border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Chemical Process Fluid Library & Rheological Models
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>
              16+ predefined chemical process fluids spanning clean liquids, alcohols, hydrocarbons, slurries, and viscous media.
            </div>
          </div>

          {/* Fluid Catalog Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 12 }}>
            {Object.values(FLUID_DATABASE_CLIENT).map((f) => {
              const isSelected = conditions.fluid_id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => updateConditions({ fluid_id: f.id })}
                  style={{
                    background: isSelected ? '#0f2942' : '#0f172a',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #1e293b',
                    borderRadius: 8,
                    padding: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 600 }}>{f.category}</span>
                      {isSelected && (
                        <span style={{ fontSize: '0.65rem', background: '#0284c7', color: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                          SELECTED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
                      {f.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 4 }}>
                      {f.description}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10, fontSize: '0.72rem', color: '#cbd5e1' }}>
                      <div>ρ = {f.base_density} kg/m³</div>
                      <div>μ = {(f.base_viscosity_pa_s * 1000).toFixed(2)} cP</div>
                      <div>P_v = {(f.base_vapor_pressure_pa / 1000).toFixed(2)} kPa</div>
                      <div>Model: {f.rheology_model}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Fluid Builder Form */}
          <div style={{ background: '#0f172a', padding: 18, borderRadius: 8, border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} color="#38bdf8" /> Create Custom Fluid Specification
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>FLUID NAME</label>
                <input
                  type="text"
                  placeholder="e.g., Polymer Resin 30%"
                  value={customFluidName}
                  onChange={(e) => setCustomFluidName(e.target.value)}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.78rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>DENSITY (kg/m³)</label>
                <input
                  type="number"
                  value={customDensity}
                  onChange={(e) => setCustomDensity(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.78rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>VISCOSITY (cP / mPa·s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={customViscosity}
                  onChange={(e) => setCustomViscosity(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.78rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>VAPOR PRESSURE (kPa)</label>
                <input
                  type="number"
                  step="0.1"
                  value={customVaporPress}
                  onChange={(e) => setCustomVaporPress(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.78rem' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={handleCreateCustomFluid}
                  style={{
                    width: '100%',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 4,
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Register Custom Fluid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. MAIN OPERATING LABORATORY TAB                              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'operating_lab' && telemetry && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Top 3D Digital Twin Viewer */}
          <div style={{ height: 500 }}>
            <Pump3DViewer
              pump={currentPump}
              telemetry={telemetry}
              isRunning={isRunning}
              speedRpm={conditions.speed_rpm}
              onToggleRunning={() => setIsRunning(!isRunning)}
            />
          </div>

          {/* Operational Controls & Live Telemetry Panel (2 Columns) */}
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 14 }}>
            {/* Left Column: Real-Time Operating Controls */}
            <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sliders size={16} color="#38bdf8" /> Real-Time Operating Controls
              </div>

              {/* Control 1: Speed RPM Slider */}
              <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Shaft Speed (N):</span>
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>{Math.round(conditions.speed_rpm)} RPM</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="3600"
                  step="25"
                  value={conditions.speed_rpm}
                  onChange={(e) => updateConditions({ speed_rpm: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#38bdf8' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>
                  <span>500 RPM</span>
                  <span>Rated: {currentPump.rated_speed_rpm} RPM</span>
                  <span>3600 RPM</span>
                </div>
              </div>

              {/* Control 2: Discharge Throttle Valve */}
              <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Discharge Valve Opening:</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{conditions.discharge_valve_opening_pct}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="100"
                  step="1"
                  value={conditions.discharge_valve_opening_pct}
                  onChange={(e) => updateConditions({ discharge_valve_opening_pct: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>
                  <span>Closed (Shutoff)</span>
                  <span>Throttled</span>
                  <span>100% (Full Bore)</span>
                </div>
              </div>

              {/* Control 3: Suction Static Head */}
              <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Suction Static Head (z_s):</span>
                  <span style={{ color: conditions.suction_static_head_m < 0 ? '#ef4444' : '#38bdf8', fontWeight: 700 }}>
                    {conditions.suction_static_head_m > 0 ? `+${conditions.suction_static_head_m}` : conditions.suction_static_head_m} m
                  </span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="8"
                  step="0.5"
                  value={conditions.suction_static_head_m}
                  onChange={(e) => updateConditions({ suction_static_head_m: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: conditions.suction_static_head_m < 0 ? '#ef4444' : '#38bdf8' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>
                  <span>-4m (Suction Lift)</span>
                  <span>0m</span>
                  <span>+8m (Flooded)</span>
                </div>
              </div>

              {/* Control 4: Fluid Temperature */}
              <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Fluid Temperature (T):</span>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>{conditions.fluid_temp_c}°C</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="110"
                  step="1"
                  value={conditions.fluid_temp_c}
                  onChange={(e) => updateConditions({ fluid_temp_c: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#f59e0b' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>
                  <span>5°C (Cold)</span>
                  <span>20°C (Standard)</span>
                  <span>110°C (Hot Boiler)</span>
                </div>
              </div>

              {/* Quick Reset Button */}
              <button
                onClick={() =>
                  updateConditions({
                    speed_rpm: currentPump.rated_speed_rpm,
                    discharge_valve_opening_pct: 80.0,
                    suction_valve_opening_pct: 100.0,
                    suction_static_head_m: 2.0,
                    fluid_temp_c: 20.0,
                  })
                }
                style={{
                  background: '#1e293b',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <RotateCcw size={14} /> Reset Controls to Rated BEP
              </button>
            </div>

            {/* Right Column: Live Telemetry Gauges & Alerts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Telemetry Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                <div style={{ background: '#0f172a', padding: 12, borderRadius: 8, border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>FLOW RATE Q</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#38bdf8', marginTop: 2 }}>
                    {telemetry.operating_flow_m3_h} <span style={{ fontSize: '0.75rem' }}>m³/h</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>BEP: {telemetry.bep_flow_m3_h} m³/h</div>
                </div>

                <div style={{ background: '#0f172a', padding: 12, borderRadius: 8, border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>DEVELOPED HEAD H</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#38bdf8', marginTop: 2 }}>
                    {telemetry.operating_head_m} <span style={{ fontSize: '0.75rem' }}>m</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>Shutoff H₀: {telemetry.shutoff_head_m} m</div>
                </div>

                <div style={{ background: '#0f172a', padding: 12, borderRadius: 8, border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PUMP EFFICIENCY η</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#10b981', marginTop: 2 }}>
                    {telemetry.efficiency_pct}%
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>Peak η: {telemetry.bep_efficiency_pct}%</div>
                </div>

                <div style={{ background: '#0f172a', padding: 12, borderRadius: 8, border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>SHAFT POWER P</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f43f5e', marginTop: 2 }}>
                    {telemetry.shaft_power_kw} <span style={{ fontSize: '0.75rem' }}>kW</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>Motor Load: {telemetry.motor_load_pct}%</div>
                </div>

                <div style={{ background: '#0f172a', padding: 12, borderRadius: 8, border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>NPSH MARGIN</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: telemetry.is_cavitating ? '#ef4444' : '#34d399', marginTop: 2 }}>
                    {telemetry.cavitation_margin_m > 0 ? `+${telemetry.cavitation_margin_m}` : telemetry.cavitation_margin_m} <span style={{ fontSize: '0.75rem' }}>m</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>NPSHa: {telemetry.npsha_m}m | Req: {telemetry.npshr_m}m</div>
                </div>

                <div style={{ background: '#0f172a', padding: 12, borderRadius: 8, border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>DIFF PRESSURE ΔP</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                    {telemetry.differential_pressure_kpa} <span style={{ fontSize: '0.75rem' }}>kPa</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>Discharge: {telemetry.discharge_pressure_kpa_g} kPa(g)</div>
                </div>
              </div>

              {/* Fault & Safety Warning Alarms */}
              {telemetry.fault_alerts.length > 0 && (
                <div style={{ background: '#450a0a', border: '1px solid #b91c1c', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {telemetry.fault_alerts.map((alert, idx) => (
                    <div key={idx} style={{ fontSize: '0.76rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={15} color="#ef4444" />
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Performance Curve Widget */}
              <PumpPerformanceChart
                curves={curves}
                telemetry={telemetry}
                pump={currentPump}
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. PERFORMANCE CURVES TAB                                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'performance' && telemetry && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <PumpPerformanceChart
            curves={curves}
            telemetry={telemetry}
            pump={currentPump}
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. FAULT SIMULATION & DIAGNOSTICS TAB                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'faults' && telemetry && (
        <PumpFaultDiagnostics
          telemetry={telemetry}
          conditions={conditions}
          onUpdateConditions={updateConditions}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. VIRTUAL EXPERIMENTS TAB (EXP-01 .. EXP-15)                 */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'experiments' && telemetry && (
        <PumpVirtualExperiments
          telemetry={telemetry}
          conditions={conditions}
          onApplyConditions={updateConditions}
          observationLogs={observationLogs}
          onAddObservationLog={handleAddObservationLog}
          onClearObservationLogs={handleClearObservationLogs}
          onGoToReport={() => setActiveTab('report')}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 9. LAB REPORT EXPORT TAB                                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'report' && telemetry && (
        <PumpReportExport
          pump={currentPump}
          fluid={currentFluid}
          conditions={conditions}
          telemetry={telemetry}
          observationLogs={observationLogs}
        />
      )}
    </div>
  );
}
