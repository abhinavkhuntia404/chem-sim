import React, { useState, useEffect } from 'react';
import {
  Sliders,
  BookOpen,
  Table,
  FileText,
  Activity,
  CheckCircle2,
  Info,
  Download,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import type {
  FluidisationParameters,
  FluidisationSimulationResult,
  FluidisationPreset,
  ObservationPoint,
} from './types';
import { fetchFluidisationPresets, simulateFluidisation } from './api';
import { FluidisedBedApparatus } from './FluidisedBedApparatus';
import { FluidisationChart } from './FluidisationChart';
import { DataExport } from './DataExport';

export const FluidisationModule: React.FC = () => {
  // Presets and loading
  const [presets, setPresets] = useState<FluidisationPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('glass_beads_air');

  // Operating parameters
  const [gasVelocity, setGasVelocity] = useState<number>(0.28);
  const [particleDiameterMm, setParticleDiameterMm] = useState<number>(0.50);
  const [particleDensity, setParticleDensity] = useState<number>(2500.0);
  const [gasDensity, setGasDensity] = useState<number>(1.205);
  const [gasViscosityMicroPaS, setGasViscosityMicroPaS] = useState<number>(18.2); // µPa.s
  const [initialBedHeightCm, setInitialBedHeightCm] = useState<number>(40.0);
  const [initialVoidage, setInitialVoidage] = useState<number>(0.40);
  const [sphericity, setSphericity] = useState<number>(1.0);
  const [columnDiameterCm, setColumnDiameterCm] = useState<number>(10.0);

  // Simulation result
  const [result, setResult] = useState<FluidisationSimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Active module tab
  const [activeTab, setActiveTab] = useState<'simulation' | 'calculations' | 'teaching' | 'observations'>('simulation');

  // Observation table
  const [observations, setObservations] = useState<ObservationPoint[]>([]);

  // Guided virtual experiment steps
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  // Load presets on mount
  useEffect(() => {
    fetchFluidisationPresets().then((pList) => {
      setPresets(pList);
    });
  }, []);

  // Run simulation whenever parameters change
  useEffect(() => {
    runSim();
  }, [
    gasVelocity,
    particleDiameterMm,
    particleDensity,
    gasDensity,
    gasViscosityMicroPaS,
    initialBedHeightCm,
    initialVoidage,
    sphericity,
    columnDiameterCm,
  ]);

  const runSim = async () => {
    setLoading(true);
    try {
      const params: FluidisationParameters = {
        gas_velocity_m_s: gasVelocity,
        particle_diameter_m: particleDiameterMm * 1e-3,
        particle_density_kg_m3: particleDensity,
        gas_density_kg_m3: gasDensity,
        gas_viscosity_Pa_s: gasViscosityMicroPaS * 1e-6,
        initial_bed_height_m: initialBedHeightCm * 1e-2,
        column_diameter_m: columnDiameterCm * 1e-2,
        initial_voidage: initialVoidage,
        sphericity: sphericity,
        include_curves: true,
        curve_points: 60,
      };
      const res = await simulateFluidisation(params);
      setResult(res);

      // Automatic guided experiment step checks
      if (res) {
        if (gasVelocity < res.u_mf_design_m_s * 0.8) {
          setCompletedSteps((prev) => ({ ...prev, 1: true }));
        }
        if (Math.abs(gasVelocity - res.u_mf_design_m_s) < 0.04) {
          setCompletedSteps((prev) => ({ ...prev, 2: true }));
        }
        if (gasVelocity > res.u_mf_design_m_s * 1.5 && gasVelocity < res.terminal_velocity_m_s * 0.8) {
          setCompletedSteps((prev) => ({ ...prev, 3: true }));
        }
        if (gasVelocity >= res.terminal_velocity_m_s * 0.95) {
          setCompletedSteps((prev) => ({ ...prev, 4: true }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = presets.find((item) => item.id === presetId);
    if (!p) return;
    setParticleDiameterMm(p.particle_diameter_mm);
    setParticleDensity(p.particle_density_kg_m3);
    setGasDensity(p.gas_density_kg_m3);
    setGasViscosityMicroPaS(p.gas_viscosity_Pa_s * 1e6);
    setInitialBedHeightCm(p.initial_bed_height_m * 100);
    setInitialVoidage(p.initial_voidage);
    setSphericity(p.sphericity);
    setGasVelocity(p.nominal_velocity_m_s);
  };

  const handleRecordObservation = () => {
    if (!result) return;
    const newPoint: ObservationPoint = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      velocity_m_s: gasVelocity,
      bed_pressure_drop_Pa: Math.round(result.bed_pressure_drop_Pa),
      total_pressure_drop_Pa: Math.round(result.total_pressure_drop_Pa),
      bed_height_m: Number(result.expanded_bed_height_m.toFixed(4)),
      voidage: Number(result.expanded_voidage.toFixed(3)),
      regime: result.regime,
      reynolds_number: Number(result.reynolds_number.toFixed(2)),
    };
    setObservations((prev) => [newPoint, ...prev]);
  };

  const currentParams: FluidisationParameters = {
    gas_velocity_m_s: gasVelocity,
    particle_diameter_m: particleDiameterMm * 1e-3,
    particle_density_kg_m3: particleDensity,
    gas_density_kg_m3: gasDensity,
    gas_viscosity_Pa_s: gasViscosityMicroPaS * 1e-6,
    initial_bed_height_m: initialBedHeightCm * 1e-2,
    column_diameter_m: columnDiameterCm * 1e-2,
    initial_voidage: initialVoidage,
    sphericity: sphericity,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header & Presets */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                background: '#e0f2fe',
                color: '#0369a1',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Mechanical Operations
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Gas-Solid Particle Dynamics</span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
            Fluidisation Unit & Packed Bed Apparatus
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: 720, marginTop: 2 }}>
            Simulate Ergun flow through packed beds, minimum fluidisation velocity (Wen–Yu correlation),
            bubbling expansion, and particle entrainment with interactive laboratory apparatus.
          </p>
        </div>

        {/* Preset Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Standard System:</span>
          <select
            className="select-field"
            style={{ width: 'auto', fontSize: '0.82rem', padding: '4px 10px' }}
            value={selectedPresetId}
            onChange={(e) => handleApplyPreset(e.target.value)}
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Engineering Quality Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          padding: '8px 14px',
          fontSize: '0.76rem',
          color: '#475569',
        }}
      >
        <Info size={16} color="#0284c7" />
        <span>
          <strong>Scientific Rigour Note:</strong> Physical outputs (Archimedes number, Ergun pressure drop, Wen–Yu u_mf,
          terminal velocity, and Richardson-Zaki bed expansion) are strictly calculated via first-principles chemical engineering equations.
          The visual apparatus renders particles and bubbles driven directly by these validated hydrodynamics.
        </span>
      </div>

      {/* Main KPI Badges Row */}
      {result && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 12,
          }}
        >
          <div className="eng-card" style={{ padding: '10px 14px' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>ARCHIMEDES (Ar)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', fontFamily: 'JetBrains Mono, monospace' }}>
              {result.archimedes_number > 1e4 ? result.archimedes_number.toExponential(2) : result.archimedes_number.toFixed(0)}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Dimensionless</div>
          </div>

          <div className="eng-card" style={{ padding: '10px 14px' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>PARTICLE REYNOLDS (Re_p)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7', fontFamily: 'JetBrains Mono, monospace' }}>
              {result.reynolds_number.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Re_mf = {result.reynolds_number_mf.toFixed(2)}</div>
          </div>

          <div className="eng-card" style={{ padding: '10px 14px' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>MIN. FLUIDISATION (u_mf)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#9333ea', fontFamily: 'JetBrains Mono, monospace' }}>
              {result.u_mf_design_m_s.toFixed(3)} <span style={{ fontSize: '0.72rem' }}>m/s</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Wen-Yu: {result.u_mf_wen_yu_m_s.toFixed(3)} m/s</div>
          </div>

          <div className="eng-card" style={{ padding: '10px 14px' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>TERMINAL VELOCITY (u_t)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>
              {result.terminal_velocity_m_s.toFixed(2)} <span style={{ fontSize: '0.72rem' }}>m/s</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Haider-Levenspiel</div>
          </div>

          <div className="eng-card" style={{ padding: '10px 14px' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>BED PRESSURE DROP (ΔP)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', fontFamily: 'JetBrains Mono, monospace' }}>
              {result.bed_pressure_drop_Pa.toFixed(0)} <span style={{ fontSize: '0.72rem' }}>Pa</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Max: {result.theoretical_max_bed_dp_Pa.toFixed(0)} Pa</div>
          </div>

          <div className="eng-card" style={{ padding: '10px 14px' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>EXPANDED HEIGHT (H)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', fontFamily: 'JetBrains Mono, monospace' }}>
              {(result.expanded_bed_height_m * 100).toFixed(1)} <span style={{ fontSize: '0.72rem' }}>cm</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>H₀ = {initialBedHeightCm.toFixed(1)} cm</div>
          </div>

          <div className="eng-card" style={{ padding: '10px 14px' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>GELDART GROUP</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#d97706', fontFamily: 'JetBrains Mono, monospace' }}>
              Group {result.geldart_group}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Voidage ε = {result.expanded_voidage.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #e2e8f0', paddingBottom: 2 }}>
        <button
          className={`tab-btn ${activeTab === 'simulation' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulation')}
        >
          <Activity size={16} /> Live Simulation & Curves
        </button>
        <button
          className={`tab-btn ${activeTab === 'calculations' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculations')}
        >
          <TrendingUp size={16} /> Engineering Calculations
        </button>
        <button
          className={`tab-btn ${activeTab === 'teaching' ? 'active' : ''}`}
          onClick={() => setActiveTab('teaching')}
        >
          <BookOpen size={16} /> Teaching Mode & Virtual Lab
        </button>
        <button
          className={`tab-btn ${activeTab === 'observations' ? 'active' : ''}`}
          onClick={() => setActiveTab('observations')}
        >
          <Table size={16} /> Observation Table & Report ({observations.length})
        </button>
      </div>

      {/* Main Grid: Controls + Content */}
      <div className="eng-grid">
        {/* Left Column: Interactive Operating Controls */}
        <div className="eng-card" style={{ height: 'fit-content' }}>
          <div className="card-header">
            <span className="card-title">
              <Sliders size={16} /> Operating Controls
            </span>
          </div>
          <div className="card-body">
            {/* 1. Superficial Gas Velocity */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#0284c7' }}>
                  Gas Velocity, u₀ (m/s)
                </label>
                <span style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                  {gasVelocity.toFixed(3)} m/s
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={result ? Math.max(1.0, result.terminal_velocity_m_s * 1.1) : 2.0}
                step={0.005}
                value={gasVelocity}
                onChange={(e) => setGasVelocity(parseFloat(e.target.value))}
                style={{ width: '100%', marginTop: 4 }}
              />
              <input
                type="number"
                step="0.005"
                min="0"
                className="input-field"
                style={{ marginTop: 6 }}
                value={gasVelocity}
                onChange={(e) => setGasVelocity(Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>

            {/* 2. Particle Diameter */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Particle Diameter, d_p</label>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{(particleDiameterMm * 1000).toFixed(0)} µm</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="number"
                  step="0.01"
                  min="0.02"
                  max="10.0"
                  className="input-field"
                  value={particleDiameterMm}
                  onChange={(e) => setParticleDiameterMm(Math.max(0.01, parseFloat(e.target.value) || 0.1))}
                />
                <span className="unit-addon">mm</span>
              </div>
            </div>

            {/* 3. Particle Density */}
            <div className="form-group">
              <label className="form-label">Particle Density, ρ_p</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="number"
                  step="50"
                  min="200"
                  max="8000"
                  className="input-field"
                  value={particleDensity}
                  onChange={(e) => setParticleDensity(Math.max(100, parseFloat(e.target.value) || 2500))}
                />
                <span className="unit-addon">kg/m³</span>
              </div>
            </div>

            {/* 4. Gas Density */}
            <div className="form-group">
              <label className="form-label">Gas Density, ρ_g</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="50.0"
                  className="input-field"
                  value={gasDensity}
                  onChange={(e) => setGasDensity(Math.max(0.01, parseFloat(e.target.value) || 1.2))}
                />
                <span className="unit-addon">kg/m³</span>
              </div>
            </div>

            {/* 5. Gas Dynamic Viscosity */}
            <div className="form-group">
              <label className="form-label">Gas Dynamic Viscosity, µ</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="100"
                  className="input-field"
                  value={gasViscosityMicroPaS}
                  onChange={(e) => setGasViscosityMicroPaS(Math.max(1, parseFloat(e.target.value) || 18.2))}
                />
                <span className="unit-addon">µPa·s</span>
              </div>
            </div>

            {/* 6. Initial Packed Bed Height */}
            <div className="form-group">
              <label className="form-label">Initial Settled Bed Height, H₀</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="number"
                  step="1"
                  min="5"
                  max="100"
                  className="input-field"
                  value={initialBedHeightCm}
                  onChange={(e) => setInitialBedHeightCm(Math.max(5, parseFloat(e.target.value) || 40))}
                />
                <span className="unit-addon">cm</span>
              </div>
            </div>

            {/* 7. Initial Voidage & Sphericity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div className="form-group">
                <label className="form-label">Voidage, ε₀</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.2"
                  max="0.7"
                  className="input-field"
                  value={initialVoidage}
                  onChange={(e) => setInitialVoidage(Math.min(0.7, Math.max(0.2, parseFloat(e.target.value) || 0.4)))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sphericity, φ_s</label>
                <input
                  type="number"
                  step="0.02"
                  min="0.3"
                  max="1.0"
                  className="input-field"
                  value={sphericity}
                  onChange={(e) => setSphericity(Math.min(1.0, Math.max(0.3, parseFloat(e.target.value) || 1.0)))}
                />
              </div>
            </div>

            {/* Column Diameter */}
            <div className="form-group">
              <label className="form-label">Column Internal Diameter, D_c</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="50"
                  className="input-field"
                  value={columnDiameterCm}
                  onChange={(e) => setColumnDiameterCm(Math.max(2, parseFloat(e.target.value) || 10))}
                />
                <span className="unit-addon">cm</span>
              </div>
            </div>

            {/* Record Observation Button */}
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
              disabled={loading}
              onClick={handleRecordObservation}
            >
              <Table size={15} /> {loading ? 'Computing...' : 'Record Current Reading'}
            </button>
          </div>
        </div>

        {/* Right Content Area: Tab views */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* TAB 1: Live Simulation & Curves */}
          {activeTab === 'simulation' && result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Interactive Apparatus */}
              <FluidisedBedApparatus
                parameters={currentParams}
                result={result}
                onVelocityChange={(v) => setGasVelocity(v)}
              />

              {/* Live Graphs */}
              <div className="eng-card">
                <div className="card-header">
                  <span className="card-title">
                    <TrendingUp size={16} /> Characteristic Performance Curves
                  </span>
                </div>
                <div className="card-body">
                  <FluidisationChart
                    result={result}
                    currentVelocity={gasVelocity}
                    width={640}
                    height={400}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Engineering Calculations & Detailed Breakdown */}
          {activeTab === 'calculations' && result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="eng-card">
                <div className="card-header">
                  <span className="card-title">
                    <Activity size={16} /> First-Principles Equation Breakdown
                  </span>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Ergun equation terms */}
                  <div style={{ background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                      1. Ergun Equation Pressure Drop Decomposition
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                      Evaluates viscous (Kozeny-Carman laminar) versus inertial (Burke-Plummer turbulent) losses across the bed height H₀.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
                      <div style={{ background: '#ffffff', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Viscous Term (Laminar)</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
                          {result.ergun_viscous_Pa.toFixed(1)} Pa
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          {((result.ergun_viscous_Pa / Math.max(1e-3, result.ergun_viscous_Pa + result.ergun_inertial_Pa)) * 100).toFixed(1)}% of Ergun
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Inertial Term (Turbulent)</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#d97706', fontFamily: 'monospace' }}>
                          {result.ergun_inertial_Pa.toFixed(1)} Pa
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          {((result.ergun_inertial_Pa / Math.max(1e-3, result.ergun_viscous_Pa + result.ergun_inertial_Pa)) * 100).toFixed(1)}% of Ergun
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Total Ergun ΔP</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                          {(result.ergun_viscous_Pa + result.ergun_inertial_Pa).toFixed(1)} Pa
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Packed bed prediction</div>
                      </div>
                    </div>
                  </div>

                  {/* Correlations comparison */}
                  <div style={{ background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                      2. Minimum Fluidisation Velocity Comparison
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                      <div style={{ background: '#ffffff', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>Ergun Direct Solution</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#9333ea', fontFamily: 'monospace', marginTop: 4 }}>
                          {result.u_mf_ergun_m_s.toFixed(4)} m/s
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                          Solves quadratic: A·Re² + B·Re - Ar = 0 incorporating specific sphericity ({sphericity}) and voidage ({initialVoidage}).
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>Wen–Yu Correlation (1966)</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace', marginTop: 4 }}>
                          {result.u_mf_wen_yu_m_s.toFixed(4)} m/s
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                          Standard correlation: Re_mf = √(33.7² + 0.0408 Ar) - 33.7. Discrepancy: {Math.abs(((result.u_mf_ergun_m_s - result.u_mf_wen_yu_m_s) / result.u_mf_ergun_m_s) * 100).toFixed(1)}%.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bed Expansion parameters */}
                  <div style={{ background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                      3. Richardson–Zaki & Kunii–Levenspiel Bed Hydrodynamics
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 10 }}>
                      <div style={{ background: '#ffffff', padding: 8, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>R-Z Exponent (n)</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace' }}>
                          {result.richardson_zaki_index.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ background: '#ffffff', padding: 8, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Expanded Voidage (ε)</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace' }}>
                          {result.expanded_voidage.toFixed(3)}
                        </div>
                      </div>
                      <div style={{ background: '#ffffff', padding: 8, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Bubble Fraction (δ_b)</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace' }}>
                          {(result.bubble_fraction * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div style={{ background: '#ffffff', padding: 8, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Est. Bubble Diam.</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace' }}>
                          {(result.estimated_bubble_diameter_m * 1000).toFixed(1)} mm
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Teaching Mode & Guided Virtual Lab */}
          {activeTab === 'teaching' && result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Guided Experiment Steps */}
              <div className="eng-card">
                <div className="card-header">
                  <span className="card-title">
                    <BookOpen size={16} /> Guided Virtual Laboratory Protocol
                  </span>
                </div>
                <div className="card-body">
                  <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: 12 }}>
                    Follow this chemical engineering experimental procedure to determine u_mf experimentally and analyze bed expansion:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: 12,
                        borderRadius: 6,
                        background: completedSteps[1] ? '#f0fdf4' : '#f8fafc',
                        border: `1px solid ${completedSteps[1] ? '#86efac' : '#e2e8f0'}`,
                      }}
                    >
                      <CheckCircle2 size={18} color={completedSteps[1] ? '#16a34a' : '#94a3b8'} style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                          Step 1: Packed Bed Regime (u₀ &lt; u_mf)
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: 2 }}>
                          Set gas superficial velocity between 0.02 and {((result.u_mf_design_m_s * 0.7)).toFixed(3)} m/s.
                          Observe that solid particles remain stationary and bed height H equals H₀. Note that pressure drop increases quadratically with velocity following Ergun equation.
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: 12,
                        borderRadius: 6,
                        background: completedSteps[2] ? '#f0fdf4' : '#f8fafc',
                        border: `1px solid ${completedSteps[2] ? '#86efac' : '#e2e8f0'}`,
                      }}
                    >
                      <CheckCircle2 size={18} color={completedSteps[2] ? '#16a34a' : '#94a3b8'} style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                          Step 2: Incipient Fluidisation Detection (u₀ ≈ u_mf)
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: 2 }}>
                          Slowly raise velocity towards {result.u_mf_design_m_s.toFixed(3)} m/s. Identify the point where bed particles unlock and suspend.
                          Observe that ΔP reaches its maximum plateau value: ΔP = (1 - ε₀)(ρ_p - ρ_g)g H₀.
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: 12,
                        borderRadius: 6,
                        background: completedSteps[3] ? '#f0fdf4' : '#f8fafc',
                        border: `1px solid ${completedSteps[3] ? '#86efac' : '#e2e8f0'}`,
                      }}
                    >
                      <CheckCircle2 size={18} color={completedSteps[3] ? '#16a34a' : '#94a3b8'} style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                          Step 3: Bubbling Regime & Bed Expansion (u_mf &lt; u₀ &lt; u_t)
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: 2 }}>
                          Increase velocity to {((result.u_mf_design_m_s * 1.8)).toFixed(3)} m/s. Watch distinct gas bubbles rise and burst at the bed surface.
                          Record how the bed height indicator expands dynamically while ΔP remains constant.
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: 12,
                        borderRadius: 6,
                        background: completedSteps[4] ? '#f0fdf4' : '#f8fafc',
                        border: `1px solid ${completedSteps[4] ? '#86efac' : '#e2e8f0'}`,
                      }}
                    >
                      <CheckCircle2 size={18} color={completedSteps[4] ? '#16a34a' : '#94a3b8'} style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                          Step 4: Terminal Velocity & Elutriation (u₀ ≥ u_t)
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: 2 }}>
                          Increase velocity above {result.terminal_velocity_m_s.toFixed(2)} m/s. Observe pneumatic transport where upward drag exceeds gravity and particles are elutriated into the gas outlet.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Governing Equations Summary */}
              <div className="eng-card">
                <div className="card-header">
                  <span className="card-title">
                    <FileText size={16} /> Governing Equations & Variable Definitions
                  </span>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.82rem' }}>
                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <strong>Ergun Equation (Packed Bed):</strong>
                    <div style={{ fontFamily: 'monospace', margin: '4px 0', color: '#0f172a' }}>
                      ΔP / H₀ = 150 · [(1 - ε₀)² / (φ_s² ε₀³)] · (µ u₀ / d_p²) + 1.75 · [(1 - ε₀) / (φ_s ε₀³)] · (ρ_g u₀² / d_p)
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Balances laminar viscous shear loss and turbulent kinetic energy loss through particle pores.
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <strong>Wen–Yu Correlation (1966) for Minimum Fluidisation:</strong>
                    <div style={{ fontFamily: 'monospace', margin: '4px 0', color: '#0f172a' }}>
                      Re_p,mf = √(33.7² + 0.0408 · Ar) - 33.7 &nbsp;|&nbsp; u_mf = Re_p,mf · µ / (ρ_g · d_p)
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <strong>Archimedes Number (Ar):</strong>
                    <div style={{ fontFamily: 'monospace', margin: '4px 0', color: '#0f172a' }}>
                      Ar = [d_p³ · ρ_g · (ρ_p - ρ_g) · g] / µ²
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Ratio of gravitational buoyant forces to viscous drag forces on individual particles.
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <strong>Richardson–Zaki Bed Expansion:</strong>
                    <div style={{ fontFamily: 'monospace', margin: '4px 0', color: '#0f172a' }}>
                      u₀ / u_t = ε^n &nbsp;⇒&nbsp; H = H₀ · (1 - ε₀) / (1 - ε)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Observation Table & Report */}
          {activeTab === 'observations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="eng-card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="card-title">
                    <Table size={16} /> Laboratory Observation Table ({observations.length} Readings)
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      onClick={() => setReportModalOpen(true)}
                    >
                      <FileText size={14} /> View Experiment Report
                    </button>
                    {observations.length > 0 && (
                      <DataExport
                        data={observations}
                        filename={`fluidisation_observations_${selectedPresetId}`}
                        label="Export CSV"
                      />
                    )}
                    {observations.length > 0 && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', color: '#ef4444' }}
                        onClick={() => setObservations([])}
                        title="Clear Table"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  {observations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px 20px', color: '#94a3b8' }}>
                      <Table size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                      <p style={{ fontSize: '0.88rem' }}>No observations recorded yet.</p>
                      <p style={{ fontSize: '0.78rem', marginTop: 4 }}>
                        Adjust gas velocity u₀ and click <strong>"Record Current Reading"</strong> to populate the experimental log.
                      </p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="eng-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Time</th>
                            <th>u₀ (m/s)</th>
                            <th>Bed ΔP (Pa)</th>
                            <th>Total ΔP (Pa)</th>
                            <th>Bed H (cm)</th>
                            <th>Voidage ε</th>
                            <th>Re_p</th>
                            <th>Regime</th>
                          </tr>
                        </thead>
                        <tbody>
                          {observations.map((obs, idx) => (
                            <tr key={obs.id}>
                              <td style={{ fontWeight: 700 }}>{observations.length - idx}</td>
                              <td>{obs.timestamp}</td>
                              <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{obs.velocity_m_s.toFixed(3)}</td>
                              <td style={{ fontFamily: 'monospace' }}>{obs.bed_pressure_drop_Pa}</td>
                              <td style={{ fontFamily: 'monospace' }}>{obs.total_pressure_drop_Pa}</td>
                              <td style={{ fontFamily: 'monospace' }}>{(obs.bed_height_m * 100).toFixed(1)}</td>
                              <td style={{ fontFamily: 'monospace' }}>{obs.voidage.toFixed(3)}</td>
                              <td style={{ fontFamily: 'monospace' }}>{obs.reynolds_number.toFixed(2)}</td>
                              <td>
                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    background: obs.regime.includes('Packed') ? '#f1f5f9' : '#dcfce7',
                                    color: obs.regime.includes('Packed') ? '#475569' : '#15803d',
                                  }}
                                >
                                  {obs.regime}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Experiment Report Modal */}
      {reportModalOpen && result && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 8,
              maxWidth: 720,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 28,
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  LABORATORY EXPERIMENT REPORT
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Fluidisation Dynamics & Minimum Fluidisation Velocity Determination
                </div>
              </div>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 10px' }}
                onClick={() => setReportModalOpen(false)}
              >
                Close
              </button>
            </div>

            <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6 }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                1. System Specifications
              </h4>
              <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
                <li>Particle Material: {presets.find((p) => p.id === selectedPresetId)?.particle_name ?? 'Glass beads'} (d_p = {particleDiameterMm} mm, ρ_p = {particleDensity} kg/m³)</li>
                <li>Fluidizing Gas: Air (ρ_g = {gasDensity} kg/m³, µ = {gasViscosityMicroPaS} µPa·s)</li>
                <li>Bed Geometry: Column D_c = {columnDiameterCm} cm, Settled Height H₀ = {initialBedHeightCm} cm, Settled Voidage ε₀ = {initialVoidage}</li>
              </ul>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                2. Theoretical Calculations
              </h4>
              <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
                <li>Archimedes Number (Ar): {result.archimedes_number.toFixed(1)}</li>
                <li>Theoretical Wen–Yu u_mf: {result.u_mf_wen_yu_m_s.toFixed(4)} m/s</li>
                <li>Theoretical Ergun u_mf: {result.u_mf_ergun_m_s.toFixed(4)} m/s</li>
                <li>Single Particle Terminal Velocity (u_t): {result.terminal_velocity_m_s.toFixed(3)} m/s</li>
                <li>Maximum Bed Pressure Drop (Buoyant Weight): {result.theoretical_max_bed_dp_Pa.toFixed(0)} Pa</li>
                <li>Geldart Powder Classification: Group {result.geldart_group}</li>
              </ul>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                3. Experimental Observations Summary
              </h4>
              <p>Total recorded data points: {observations.length}</p>
              {observations.length > 0 && (
                <div style={{ marginTop: 8, overflowX: 'auto' }}>
                  <table className="eng-table" style={{ fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>u₀ (m/s)</th>
                        <th>Bed ΔP (Pa)</th>
                        <th>H (cm)</th>
                        <th>Voidage</th>
                        <th>Regime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {observations.slice(0, 8).map((obs, i) => (
                        <tr key={obs.id}>
                          <td>{i + 1}</td>
                          <td>{obs.velocity_m_s.toFixed(3)}</td>
                          <td>{obs.bed_pressure_drop_Pa}</td>
                          <td>{(obs.bed_height_m * 100).toFixed(1)}</td>
                          <td>{obs.voidage.toFixed(3)}</td>
                          <td>{obs.regime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  window.print();
                }}
              >
                <Download size={14} /> Print / Save Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
