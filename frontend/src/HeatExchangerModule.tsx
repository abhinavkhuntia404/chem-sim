import React, { useState, useEffect } from 'react';
import { Flame, Play, AlertTriangle, CheckCircle2, Sliders } from 'lucide-react';
import type { HeatExchangerResult } from './types';
import { analyzeHeatExchanger } from './api';
import { DataExport } from './DataExport';

export const HeatExchangerModule: React.FC = () => {
  const [arrangement, setArrangement] = useState<'countercurrent' | 'cocurrent'>('countercurrent');
  const [ThIn, setThIn] = useState<number>(120.0);
  const [ThOut, setThOut] = useState<number>(70.0);
  const [TcIn, setTcIn] = useState<number>(25.0);
  const [mHot, setMHot] = useState<number>(2.5);
  const [mCold, setMCold] = useState<number>(3.0);
  const CpHot = 4184.0; // J/(kg K)
  const CpCold = 4184.0;
  const [UCoeff, setUCoeff] = useState<number>(750.0); // W/(m2 K)

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<HeatExchangerResult | null>(null);

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await analyzeHeatExchanger({
        hot_inlet_T_C: ThIn,
        hot_outlet_T_C: ThOut,
        cold_inlet_T_C: TcIn,
        hot_flow_kg_s: mHot,
        cold_flow_kg_s: mCold,
        hot_Cp_J_kgK: CpHot,
        cold_Cp_J_kgK: CpCold,
        flow_arrangement: arrangement,
        U_W_m2K: UCoeff,
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            Heat Exchanger Analysis (LMTD Rating & Design)
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Log mean temperature difference (LMTD), thermal duty, area sizing, and temperature profile curves.
          </p>
        </div>
        {result && (
          <DataExport
            data={{
              Duty_kW: (result.duty_W / 1000).toFixed(2),
              LMTD_C: result.LMTD_C.toFixed(2),
              Area_m2: result.area_m2?.toFixed(2) ?? '—',
              Hot_Inlet_C: result.hot_inlet_T_C,
              Hot_Outlet_C: result.hot_outlet_T_C,
              Cold_Inlet_C: result.cold_inlet_T_C,
              Cold_Outlet_C: result.cold_outlet_T_C,
              Arrangement: result.flow_arrangement,
            }}
            filename="heat_exchanger_analysis"
          />
        )}
      </div>

      <div className="eng-grid">
        {/* Specification Panel */}
        <div className="eng-card">
          <div className="card-header">
            <span className="card-title">
              <Sliders size={16} /> Exchanger Specifications
            </span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Flow Configuration</label>
              <select
                className="select-field"
                value={arrangement}
                onChange={(e) => setArrangement(e.target.value as any)}
              >
                <option value="countercurrent">Countercurrent Flow (Higher Efficiency)</option>
                <option value="cocurrent">Cocurrent / Parallel Flow</option>
              </select>
            </div>

            <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', marginBottom: 12 }}>
              <strong style={{ fontSize: '0.78rem', color: '#e11d48', textTransform: 'uppercase' }}>
                Hot Stream (To Be Cooled)
              </strong>
            </div>

            <div className="form-group">
              <label className="form-label">Hot Inlet Temperature (T_h,in)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={ThIn}
                  onChange={(e) => setThIn(parseFloat(e.target.value) || 0)}
                  step={5}
                />
                <span className="unit-addon">°C</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Target Hot Outlet Temp (T_h,out)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={ThOut}
                  onChange={(e) => setThOut(parseFloat(e.target.value) || 0)}
                  step={5}
                />
                <span className="unit-addon">°C</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Hot Mass Flow Rate (m_h)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={mHot}
                  onChange={(e) => setMHot(parseFloat(e.target.value) || 0)}
                  step={0.5}
                />
                <span className="unit-addon">kg/s</span>
              </div>
            </div>

            <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', marginBottom: 12 }}>
              <strong style={{ fontSize: '0.78rem', color: '#0284c7', textTransform: 'uppercase' }}>
                Cold Stream (Coolant)
              </strong>
            </div>

            <div className="form-group">
              <label className="form-label">Cold Inlet Temperature (T_c,in)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={TcIn}
                  onChange={(e) => setTcIn(parseFloat(e.target.value) || 0)}
                  step={5}
                />
                <span className="unit-addon">°C</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Cold Mass Flow Rate (m_c)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={mCold}
                  onChange={(e) => setMCold(parseFloat(e.target.value) || 0)}
                  step={0.5}
                />
                <span className="unit-addon">kg/s</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Overall Heat Transfer Coeff (U)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={UCoeff}
                  onChange={(e) => setUCoeff(parseFloat(e.target.value) || 0)}
                  step={50}
                />
                <span className="unit-addon">W/(m²·K)</span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={runAnalysis}
              disabled={loading}
              style={{ marginTop: 10 }}
            >
              <Play size={16} /> {loading ? 'Analyzing...' : 'Run Thermal Analysis'}
            </button>
          </div>
        </div>

        {/* Results & Profiles Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result && (
            <div className="kpi-row">
              <div className="kpi-card">
                <div className="kpi-label">Thermal Duty (Q)</div>
                <div className="kpi-value" style={{ color: '#d97706' }}>
                  {(result.duty_W / 1000).toFixed(1)}
                  <span className="kpi-unit">kW</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">LMTD (ΔT_lm)</div>
                <div className="kpi-value" style={{ color: '#2563eb' }}>
                  {result.LMTD_C.toFixed(1)}
                  <span className="kpi-unit">°C</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Required Area (A)</div>
                <div className="kpi-value" style={{ color: '#059669' }}>
                  {result.area_m2?.toFixed(2) ?? '—'}
                  <span className="kpi-unit">m²</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Cold Outlet (T_c,out)</div>
                <div className="kpi-value">
                  {result.cold_outlet_T_C.toFixed(1)}
                  <span className="kpi-unit">°C</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Min Approach (ΔT_min)</div>
                <div className="kpi-value">
                  {result.min_approach_C.toFixed(1)}
                  <span className="kpi-unit">°C</span>
                </div>
              </div>
            </div>
          )}

          <div className="eng-card">
            <div className="card-header">
              <span className="card-title">
                <Flame size={16} /> Exchanger Temperature Profile
              </span>
              {result?.feasible ? (
                <span
                  style={{
                    fontSize: '0.78rem',
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: '#f0fdf4',
                    color: '#15803d',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Thermally Feasible
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '0.78rem',
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontWeight: 600,
                  }}
                >
                  Temperature Cross Infeasible
                </span>
              )}
            </div>
            <div className="card-body">
              {result && (
                <div>
                  {/* SVG Temperature Profile Chart */}
                  <svg width="100%" height="280" viewBox="0 0 600 280" style={{ background: '#ffffff' }}>
                    {/* Grid */}
                    <line x1="60" y1="30" x2="560" y2="30" stroke="#f1f5f9" />
                    <line x1="60" y1="120" x2="560" y2="120" stroke="#f1f5f9" />
                    <line x1="60" y1="210" x2="560" y2="210" stroke="#f1f5f9" />

                    {/* Hot curve */}
                    <path
                      d={result.hot_profile
                        .map(
                          (p, i) =>
                            `${i === 0 ? 'M' : 'L'} ${60 + p[0] * 500} ${
                              230 - ((p[1] - 0) / (result.hot_inlet_T_C + 20)) * 200
                            }`
                        )
                        .join(' ')}
                      stroke="#dc2626"
                      strokeWidth="2.5"
                      fill="none"
                    />

                    {/* Cold curve */}
                    <path
                      d={result.cold_profile
                        .map(
                          (p, i) =>
                            `${i === 0 ? 'M' : 'L'} ${60 + p[0] * 500} ${
                              230 - ((p[1] - 0) / (result.hot_inlet_T_C + 20)) * 200
                            }`
                        )
                        .join(' ')}
                      stroke="#0284c7"
                      strokeWidth="2.5"
                      fill="none"
                    />

                    {/* Labels */}
                    <text x="65" y="45" fill="#dc2626" fontSize="11" fontWeight="600">
                      Hot Inlet: {result.hot_inlet_T_C.toFixed(1)} °C
                    </text>
                    <text x="440" y="110" fill="#dc2626" fontSize="11" fontWeight="600">
                      Hot Outlet: {result.hot_outlet_T_C.toFixed(1)} °C
                    </text>

                    <text x="65" y="170" fill="#0284c7" fontSize="11" fontWeight="600">
                      {arrangement === 'countercurrent'
                        ? `Cold Outlet: ${result.cold_outlet_T_C.toFixed(1)} °C`
                        : `Cold Inlet: ${result.cold_inlet_T_C.toFixed(1)} °C`}
                    </text>
                    <text x="440" y="200" fill="#0284c7" fontSize="11" fontWeight="600">
                      {arrangement === 'countercurrent'
                        ? `Cold Inlet: ${result.cold_inlet_T_C.toFixed(1)} °C`
                        : `Cold Outlet: ${result.cold_outlet_T_C.toFixed(1)} °C`}
                    </text>

                    {/* Axis */}
                    <line x1="60" y1="230" x2="560" y2="230" stroke="#475569" strokeWidth="1.5" />
                    <line x1="60" y1="30" x2="60" y2="230" stroke="#475569" strokeWidth="1.5" />

                    <text x="310" y="255" fill="#64748b" fontSize="11" textAnchor="middle">
                      Normalized Exchanger Length / Area (0 to 1)
                    </text>
                    <text x="25" y="130" fill="#64748b" fontSize="11" transform="rotate(-90 25 130)" textAnchor="middle">
                      Temperature (°C)
                    </text>
                  </svg>

                  {/* Diagnostic warnings */}
                  {result.warnings.length > 0 && (
                    <div className="callout callout-warning">
                      <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                      <div>
                        {result.warnings.map((w, i) => (
                          <div key={i}>{w}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
