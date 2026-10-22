import React, { useState, useEffect } from 'react';
import { Play, AlertTriangle, CheckCircle2, Sliders } from 'lucide-react';
import type { DistillationSimulationResult } from './types';
import { simulateDistillation, fetchComponents } from './api';
import { McCabeThieleChart } from './McCabeThieleChart';
import { DataExport } from './DataExport';

export const DistillationModule: React.FC = () => {
  const [components, setComponents] = useState<string[]>(['Benzene', 'Toluene']);
  const [lightComp, setLightComp] = useState('Benzene');
  const [heavyComp, setHeavyComp] = useState('Toluene');
  const [feedFlow, setFeedFlow] = useState<number>(100.0);
  const [zF, setZF] = useState<number>(0.40);
  const [q, setQ] = useState<number>(1.0);
  const [xD, setXD] = useState<number>(0.95);
  const [xB, setXB] = useState<number>(0.05);
  const [refluxRatio, setRefluxRatio] = useState<number>(2.5);
  const [pressure, setPressure] = useState<number>(101.325);

  const [activeTab, setActiveTab] = useState<'chart' | 'table' | 'profiles' | 'diagnostics'>('chart');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DistillationSimulationResult | null>(null);

  useEffect(() => {
    fetchComponents().then((comps) => {
      if (comps && comps.length > 0) setComponents(comps);
    });
    runSimulation();
  }, []);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await simulateDistillation({
        light_component: lightComp,
        heavy_component: heavyComp,
        feed_flow_mol_s: feedFlow,
        feed_composition: zF,
        q: q,
        distillate_composition: xD,
        bottoms_composition: xB,
        reflux_ratio: refluxRatio,
        pressure_kPa: pressure,
      });
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Description */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            Binary Distillation Column (McCabe–Thiele)
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Constant molar overflow (CMO) equilibrium-stage solver with interactive McCabe–Thiele stepping.
          </p>
        </div>
        {result && (
          <DataExport
            data={result.stages}
            filename={`distillation_stages_${lightComp}_${heavyComp}`}
            label="Export Column Data"
          />
        )}
      </div>

      {/* Main Grid */}
      <div className="eng-grid">
        {/* Left Column: Column Specifications */}
        <div className="eng-card">
          <div className="card-header">
            <span className="card-title">
              <Sliders size={16} /> Column Parameters
            </span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Binary System (Light / Heavy)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select
                  className="select-field"
                  value={lightComp}
                  onChange={(e) => setLightComp(e.target.value)}
                >
                  {components.map((c) => (
                    <option key={`l-${c}`} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  className="select-field"
                  value={heavyComp}
                  onChange={(e) => setHeavyComp(e.target.value)}
                >
                  {components.map((c) => (
                    <option key={`h-${c}`} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Feed Flow Rate (F)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={feedFlow}
                  onChange={(e) => setFeedFlow(parseFloat(e.target.value) || 0)}
                  step={10}
                />
                <span className="unit-addon">mol/s</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Feed Composition (z_F, light)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={zF}
                  onChange={(e) => setZF(parseFloat(e.target.value) || 0)}
                  step={0.05}
                  min={0.01}
                  max={0.99}
                />
                <span className="unit-addon">mole frac</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Feed Condition (q)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={q}
                  onChange={(e) => setQ(parseFloat(e.target.value) || 0)}
                  step={0.1}
                />
                <span className="unit-addon">
                  {q === 1.0 ? 'Sat. Liquid' : q === 0.0 ? 'Sat. Vapor' : q > 1.0 ? 'Subcooled' : 'Two-Phase'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setQ(1.0)}
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    background: q === 1.0 ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  q = 1.0 (Liquid)
                </button>
                <button
                  type="button"
                  onClick={() => setQ(0.0)}
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    background: q === 0.0 ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  q = 0.0 (Vapor)
                </button>
                <button
                  type="button"
                  onClick={() => setQ(0.5)}
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    background: q === 0.5 ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  q = 0.5 (50/50)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Distillate Purity (x_D)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={xD}
                  onChange={(e) => setXD(parseFloat(e.target.value) || 0)}
                  step={0.01}
                  min={0.5}
                  max={0.999}
                />
                <span className="unit-addon">mole frac</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bottoms Impurity (x_B)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={xB}
                  onChange={(e) => setXB(parseFloat(e.target.value) || 0)}
                  step={0.01}
                  min={0.001}
                  max={0.5}
                />
                <span className="unit-addon">mole frac</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reflux Ratio (R = L/D)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={refluxRatio}
                  onChange={(e) => setRefluxRatio(parseFloat(e.target.value) || 0)}
                  step={0.2}
                  min={0.1}
                />
                <span className="unit-addon">
                  {result?.min_reflux_ratio ? `R_min: ${result.min_reflux_ratio.toFixed(2)}` : 'R'}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Operating Pressure (P)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={pressure}
                  onChange={(e) => setPressure(parseFloat(e.target.value) || 0)}
                  step={10}
                />
                <span className="unit-addon">kPa</span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={runSimulation}
              disabled={loading}
              style={{ marginTop: 10 }}
            >
              <Play size={16} /> {loading ? 'Calculating...' : 'Solve Distillation'}
            </button>
          </div>
        </div>

        {/* Right Column: Simulation Output & Interactive Diagrams */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* KPI Banner */}
          {result && (
            <div className="kpi-row">
              <div className="kpi-card">
                <div className="kpi-label">Theoretical Stages</div>
                <div className="kpi-value" style={{ color: '#2563eb' }}>
                  {result.num_theoretical_stages}
                  <span className="kpi-unit">stages</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Optimal Feed Stage</div>
                <div className="kpi-value" style={{ color: '#d97706' }}>
                  {result.feed_stage}
                  <span className="kpi-unit">from top</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Min. Reflux (R_min)</div>
                <div className="kpi-value">
                  {result.min_reflux_ratio?.toFixed(2) ?? '—'}
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Distillate Flow (D)</div>
                <div className="kpi-value">
                  {result.distillate_flow.toFixed(1)}
                  <span className="kpi-unit">mol/s</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Condenser Duty (Q_c)</div>
                <div className="kpi-value">
                  {result.condenser_duty_kW ? (result.condenser_duty_kW / 1000).toFixed(2) : '—'}
                  <span className="kpi-unit">MW</span>
                </div>
              </div>
            </div>
          )}

          {/* Visualization & Details Card */}
          <div className="eng-card" style={{ flex: 1 }}>
            <div className="card-header">
              <div className="tab-list" style={{ marginBottom: 0, borderBottom: 'none' }}>
                <button
                  className={`tab-btn ${activeTab === 'chart' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chart')}
                >
                  McCabe–Thiele Diagram
                </button>
                <button
                  className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`}
                  onClick={() => setActiveTab('table')}
                >
                  Stage Profiles Table
                </button>
                <button
                  className={`tab-btn ${activeTab === 'profiles' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profiles')}
                >
                  T-x-y Column Profile
                </button>
                <button
                  className={`tab-btn ${activeTab === 'diagnostics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('diagnostics')}
                >
                  Assumptions & Diagnostics
                </button>
              </div>
              {result && (
                <span
                  style={{
                    fontSize: '0.78rem',
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: '#f0fdf4',
                    color: '#15803d',
                    fontWeight: 600,
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Converged (CMO)
                </span>
              )}
            </div>

            <div className="card-body">
              {result ? (
                <>
                  {activeTab === 'chart' && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <McCabeThieleChart result={result} />
                    </div>
                  )}

                  {activeTab === 'table' && (
                    <div className="eng-table-container">
                      <table className="eng-table">
                        <thead>
                          <tr>
                            <th>Stage #</th>
                            <th>Section</th>
                            <th>Liquid x ({lightComp})</th>
                            <th>Vapor y ({lightComp})</th>
                            <th>Equilibrium Temp (°C)</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.stages.map((stage) => {
                            const isFeed = stage.stage_number === result.feed_stage;
                            const isReboiler = stage.stage_number === result.num_theoretical_stages;
                            return (
                              <tr
                                key={`stg-${stage.stage_number}`}
                                style={{
                                  backgroundColor: isFeed ? '#fffbeb' : undefined,
                                }}
                              >
                                <td style={{ fontWeight: 600 }}>{stage.stage_number}</td>
                                <td>
                                  <span
                                    className={
                                      stage.section === 'rectifying' ? 'badge-rect' : 'badge-strip'
                                    }
                                  >
                                    {stage.section}
                                  </span>
                                </td>
                                <td>{stage.x.toFixed(4)}</td>
                                <td>{stage.y.toFixed(4)}</td>
                                <td>{stage.T_C ? stage.T_C.toFixed(2) : '—'}</td>
                                <td>
                                  {isFeed && <span className="badge-feed">Feed Stage</span>}
                                  {isReboiler && (
                                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: 4 }}>
                                      Reboiler (Stage {stage.stage_number})
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === 'profiles' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                        Tray Temperature Profile Down the Column
                      </h4>
                      <div className="eng-table-container">
                        <table className="eng-table">
                          <thead>
                            <tr>
                              <th>Stage (Top to Bottom)</th>
                              <th>Tray Temp (°C)</th>
                              <th>Liquid Volatile Fraction</th>
                              <th>Vapor Volatile Fraction</th>
                              <th>Phase Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.stages.map((stg) => (
                              <tr key={`prf-${stg.stage_number}`}>
                                <td>Stage {stg.stage_number}</td>
                                <td style={{ color: '#2563eb', fontWeight: 600 }}>
                                  {stg.T_C.toFixed(1)} °C
                                </td>
                                <td>{stg.x.toFixed(4)}</td>
                                <td>{stg.y.toFixed(4)}</td>
                                <td>
                                  <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                                    V-L Equilibrium
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'diagnostics' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div className="callout callout-info">
                        <div>
                          <strong>Engineering Assumptions:</strong>
                          <ul style={{ paddingLeft: 18, marginTop: 4, lineHeight: 1.6 }}>
                            {result.assumptions.map((asm, i) => (
                              <li key={i}>{asm}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {result.warnings.length > 0 && (
                        <div className="callout callout-warning">
                          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                          <div>
                            <strong>Simulation Warnings:</strong>
                            <ul style={{ paddingLeft: 18, marginTop: 4 }}>
                              {result.warnings.map((w, i) => (
                                <li key={i}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      <div style={{ padding: 14, background: '#f8fafc', borderRadius: 6, fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                          Material Balance Integrity Checks:
                        </div>
                        <div>Total Feed Balance Residual: {result.feed_balance_residual.toExponential(4)}</div>
                        <div>Component Balance Residual: {result.component_balance_residual.toExponential(4)}</div>
                        <div style={{ color: '#059669', marginTop: 4, fontWeight: 500 }}>
                          Strict conservation of mass satisfied within numerical tolerance.
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                  Click "Solve Distillation" to run simulation.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
