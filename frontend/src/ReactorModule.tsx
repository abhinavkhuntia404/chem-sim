import React, { useState, useEffect } from 'react';
import { Atom, Play, Sliders, TrendingUp } from 'lucide-react';
import type { ReactorResult } from './types';
import { solveReactor } from './api';
import { DataExport } from './DataExport';

export const ReactorModule: React.FC = () => {
  const [reactorType, setReactorType] = useState<'cstr' | 'pfr' | 'batch'>('cstr');
  const [cA0, setCA0] = useState<number>(1.5); // mol/L
  const [k, setK] = useState<number>(0.05); // 1/s
  const [tau, setTau] = useState<number>(20.0); // s
  const [flowRate, setFlowRate] = useState<number>(0.01); // m3/s

  const [cstrResult, setCstrResult] = useState<ReactorResult | null>(null);
  const [pfrResult, setPfrResult] = useState<ReactorResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    runSim();
  }, []);

  const runSim = async () => {
    setLoading(true);
    try {
      const vol = tau * flowRate;
      const resCstr = await solveReactor({
        reactor_type: 'cstr',
        C_A0: cA0,
        k: k,
        tau_s: tau,
        volume_m3: vol,
        volumetric_flow_m3_s: flowRate,
      });
      const resPfr = await solveReactor({
        reactor_type: 'pfr',
        C_A0: cA0,
        k: k,
        tau_s: tau,
        volume_m3: vol,
        volumetric_flow_m3_s: flowRate,
      });
      setCstrResult(resCstr);
      setPfrResult(resPfr);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentResult = reactorType === 'cstr' ? cstrResult : pfrResult;

  // Comparison curve points for Da = k * tau from 0 to 5
  const daPoints: { da: number; cstrX: number; pfrX: number }[] = [];
  for (let i = 0; i <= 20; i++) {
    const da = (i / 20) * 5;
    daPoints.push({
      da,
      cstrX: da / (1 + da),
      pfrX: 1 - Math.exp(-da),
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            Chemical Reactor Engineering (CSTR vs PFR)
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Continuous Stirred Tank (CSTR) and Plug Flow (PFR) performance, Damköhler analysis, and conversion.
          </p>
        </div>
        {currentResult && (
          <DataExport
            data={{
              Reactor: reactorType.toUpperCase(),
              Conversion: (currentResult.conversion * 100).toFixed(2) + '%',
              Exit_CA: currentResult.exit_concentrations.A?.toFixed(4),
              Residence_Time_s: tau,
              Rate_Constant: k,
              Volume_m3: currentResult.volume_m3?.toFixed(3),
            }}
            filename={`reactor_${reactorType}`}
          />
        )}
      </div>

      <div className="eng-grid">
        {/* Specification Panel */}
        <div className="eng-card">
          <div className="card-header">
            <span className="card-title">
              <Sliders size={16} /> Kinetics & Reactor Specs
            </span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Active Reactor Model</label>
              <select
                className="select-field"
                value={reactorType}
                onChange={(e) => setReactorType(e.target.value as any)}
              >
                <option value="cstr">Continuous Stirred-Tank (CSTR)</option>
                <option value="pfr">Plug Flow Reactor (PFR)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Feed Concentration (C_A0)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={cA0}
                  onChange={(e) => setCA0(parseFloat(e.target.value) || 0)}
                  step={0.5}
                />
                <span className="unit-addon">mol/L</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Rate Constant (k, 1st order)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={k}
                  onChange={(e) => setK(parseFloat(e.target.value) || 0)}
                  step={0.01}
                />
                <span className="unit-addon">1/s</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Space Time / Residence Time (τ)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={tau}
                  onChange={(e) => setTau(parseFloat(e.target.value) || 0)}
                  step={5}
                />
                <span className="unit-addon">seconds</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Volumetric Flow Rate (v_0)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={flowRate}
                  onChange={(e) => setFlowRate(parseFloat(e.target.value) || 0)}
                  step={0.005}
                />
                <span className="unit-addon">m³/s</span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={runSim}
              disabled={loading}
              style={{ marginTop: 10 }}
            >
              <Play size={16} /> {loading ? 'Simulating...' : 'Solve Kinetics'}
            </button>
          </div>
        </div>

        {/* Output & Comparison Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cstrResult && pfrResult && (
            <div className="kpi-row">
              <div className="kpi-card">
                <div className="kpi-label">CSTR Conversion (X)</div>
                <div className="kpi-value" style={{ color: '#2563eb' }}>
                  {(cstrResult.conversion * 100).toFixed(1)}
                  <span className="kpi-unit">%</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">PFR Conversion (X)</div>
                <div className="kpi-value" style={{ color: '#059669' }}>
                  {(pfrResult.conversion * 100).toFixed(1)}
                  <span className="kpi-unit">%</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Damköhler Number (Da)</div>
                <div className="kpi-value" style={{ color: '#d97706' }}>
                  {(k * tau).toFixed(2)}
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Reactor Volume (V)</div>
                <div className="kpi-value">
                  {(tau * flowRate * 1000).toFixed(1)}
                  <span className="kpi-unit">L</span>
                </div>
              </div>
            </div>
          )}

          <div className="eng-card">
            <div className="card-header">
              <span className="card-title">
                <TrendingUp size={16} /> Performance Comparison: Conversion vs Damköhler (Da = k·τ)
              </span>
            </div>
            <div className="card-body">
              {/* SVG Curve Plot */}
              <svg width="100%" height="260" viewBox="0 0 600 260" style={{ background: '#ffffff' }}>
                {/* Axis lines */}
                <line x1="60" y1="210" x2="560" y2="210" stroke="#475569" strokeWidth="1.5" />
                <line x1="60" y1="20" x2="60" y2="210" stroke="#475569" strokeWidth="1.5" />

                {/* Grid */}
                <line x1="60" y1="115" x2="560" y2="115" stroke="#f1f5f9" />
                <line x1="60" y1="20" x2="560" y2="20" stroke="#f1f5f9" />

                {/* PFR Curve */}
                <path
                  d={daPoints
                    .map(
                      (p, i) =>
                        `${i === 0 ? 'M' : 'L'} ${60 + (p.da / 5) * 500} ${210 - p.pfrX * 190}`
                    )
                    .join(' ')}
                  stroke="#059669"
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* CSTR Curve */}
                <path
                  d={daPoints
                    .map(
                      (p, i) =>
                        `${i === 0 ? 'M' : 'L'} ${60 + (p.da / 5) * 500} ${210 - p.cstrX * 190}`
                    )
                    .join(' ')}
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* Current Operating Point Marker */}
                {(() => {
                  const currDa = Math.min(5, k * tau);
                  const xPos = 60 + (currDa / 5) * 500;
                  const cstrY = 210 - (cstrResult?.conversion ?? 0) * 190;
                  const pfrY = 210 - (pfrResult?.conversion ?? 0) * 190;
                  return (
                    <g>
                      <line x1={xPos} y1="20" x2={xPos} y2="210" stroke="#cbd5e1" strokeDasharray="3 3" />
                      <circle cx={xPos} cy={cstrY} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                      <circle cx={xPos} cy={pfrY} r="5" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                    </g>
                  );
                })()}

                {/* Legend */}
                <text x="75" y="45" fill="#059669" fontSize="11" fontWeight="600">
                  — PFR: X = 1 - e^(-k·τ) (Higher conversion, no backmixing)
                </text>
                <text x="75" y="65" fill="#2563eb" fontSize="11" fontWeight="600">
                  — CSTR: X = k·τ / (1 + k·τ) (Backmixed, lower exit rate)
                </text>

                <text x="310" y="240" fill="#64748b" fontSize="11" textAnchor="middle">
                  Damköhler Number, Da = k·τ
                </text>
                <text x="25" y="115" fill="#64748b" fontSize="11" transform="rotate(-90 25 115)" textAnchor="middle">
                  Fractional Conversion (X)
                </text>
              </svg>

              <div className="callout callout-info" style={{ marginTop: 14 }}>
                <Atom size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Reactor Selection Rationale:</strong> For positive-order irreversible kinetics, a PFR always requires less volume than a CSTR for the same conversion, because the concentration of reactant remains higher throughout the length of the plug-flow reactor.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
