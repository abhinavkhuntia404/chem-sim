import React, { useState, useEffect } from 'react';
import { Droplet, Sliders } from 'lucide-react';
import { fetchComponents, fetchComponentDetails } from './api';
import type { ComponentData } from './types';
import { DataExport } from './DataExport';

export const ThermoModule: React.FC = () => {
  const [components, setComponents] = useState<string[]>(['Benzene', 'Toluene', 'Water', 'Ethanol']);
  const [selectedComp, setSelectedComp] = useState<string>('Benzene');
  const [compData, setCompData] = useState<ComponentData | null>(null);
  const [tempC, setTempC] = useState<number>(80.1);

  useEffect(() => {
    fetchComponents().then((comps) => {
      if (comps && comps.length > 0) setComponents(comps);
    });
  }, []);

  useEffect(() => {
    fetchComponentDetails(selectedComp).then(setCompData);
  }, [selectedComp]);

  // Generate Antoine vapor pressure curve points (0 to 120 °C)
  const pSatPoints: { T: number; P_kPa: number }[] = [];
  for (let t = 20; t <= 120; t += 5) {
    // Standard Antoine approximation
    let A = 6.90565, B = 1211.033, C = 220.79;
    if (selectedComp.toLowerCase().includes('toluene')) {
      A = 6.95464; B = 1344.8; C = 219.482;
    } else if (selectedComp.toLowerCase().includes('water')) {
      A = 8.07131; B = 1730.63; C = 233.426;
    } else if (selectedComp.toLowerCase().includes('ethanol')) {
      A = 8.1122; B = 1592.86; C = 226.18;
    }
    const logP = A - B / (C + t);
    const p_mmHg = Math.pow(10, logP);
    const p_kPa = (p_mmHg * 133.322) / 1000;
    pSatPoints.push({ T: t, P_kPa: p_kPa });
  }

  // Calculate current vapor pressure
  const currPoint = pSatPoints.find((p) => Math.abs(p.T - tempC) < 3) ?? {
    T: tempC,
    P_kPa: 101.325,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            Thermodynamics & Vapor–Liquid Equilibrium (VLE)
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Antoine vapor pressure equations, pure component thermophysical properties, and VLE equilibrium diagrams.
          </p>
        </div>
        {compData && (
          <DataExport
            data={compData}
            filename={`${selectedComp}_thermo_properties`}
          />
        )}
      </div>

      <div className="eng-grid">
        {/* Component Selector & Property Card */}
        <div className="eng-card">
          <div className="card-header">
            <span className="card-title">
              <Sliders size={16} /> Substance Selection
            </span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Chemical Component</label>
              <select
                className="select-field"
                value={selectedComp}
                onChange={(e) => setSelectedComp(e.target.value)}
              >
                {components.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Evaluation Temperature (T)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="input-field"
                  value={tempC}
                  onChange={(e) => setTempC(parseFloat(e.target.value) || 0)}
                  step={5}
                />
                <span className="unit-addon">°C</span>
              </div>
            </div>

            {compData && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: 8 }}>
                  NIST Physical Constants
                </h4>
                <div className="eng-table-container">
                  <table className="eng-table">
                    <tbody>
                      <tr>
                        <td>Formula</td>
                        <td style={{ fontWeight: 600 }}>{compData.formula}</td>
                      </tr>
                      <tr>
                        <td>CAS Number</td>
                        <td>{compData.cas_number}</td>
                      </tr>
                      <tr>
                        <td>Molecular Weight</td>
                        <td>{compData.molecular_weight.toFixed(2)} g/mol</td>
                      </tr>
                      <tr>
                        <td>Normal Boiling Point</td>
                        <td>{(compData.normal_boiling_point_K - 273.15).toFixed(1)} °C</td>
                      </tr>
                      <tr>
                        <td>Critical Temperature</td>
                        <td>{compData.critical_temperature_K.toFixed(1)} K</td>
                      </tr>
                      <tr>
                        <td>Critical Pressure</td>
                        <td>{compData.critical_pressure_bar.toFixed(2)} bar</td>
                      </tr>
                      <tr>
                        <td>Acentric Factor (ω)</td>
                        <td>{compData.acentric_factor.toFixed(3)}</td>
                      </tr>
                      <tr>
                        <td>Heat of Vaporization</td>
                        <td>{compData.heat_of_vaporization_kJ_mol.toFixed(2)} kJ/mol</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vapor Pressure Curve Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="kpi-row">
            <div className="kpi-card">
              <div className="kpi-label">Vapor Pressure (P_sat)</div>
              <div className="kpi-value" style={{ color: '#2563eb' }}>
                {currPoint.P_kPa.toFixed(1)}
                <span className="kpi-unit">kPa</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">At Atmospheric (1 atm)</div>
              <div className="kpi-value">
                {compData ? (compData.normal_boiling_point_K - 273.15).toFixed(1) : '—'}
                <span className="kpi-unit">°C</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Latent Heat (ΔH_vap)</div>
              <div className="kpi-value" style={{ color: '#059669' }}>
                {compData?.heat_of_vaporization_kJ_mol.toFixed(1)}
                <span className="kpi-unit">kJ/mol</span>
              </div>
            </div>
          </div>

          <div className="eng-card">
            <div className="card-header">
              <span className="card-title">
                <Droplet size={16} /> Antoine Vapor Pressure Curve: log10(P) = A - B/(T + C)
              </span>
            </div>
            <div className="card-body">
              <svg width="100%" height="260" viewBox="0 0 600 260" style={{ background: '#ffffff' }}>
                {/* Axis lines */}
                <line x1="60" y1="210" x2="560" y2="210" stroke="#475569" strokeWidth="1.5" />
                <line x1="60" y1="20" x2="60" y2="210" stroke="#475569" strokeWidth="1.5" />

                {/* Grid */}
                <line x1="60" y1="115" x2="560" y2="115" stroke="#f1f5f9" />
                <line x1="60" y1="20" x2="560" y2="20" stroke="#f1f5f9" />

                {/* 101.325 kPa reference line */}
                <line x1="60" y1="140" x2="560" y2="140" stroke="#cbd5e1" strokeDasharray="3 3" />
                <text x="565" y="144" fill="#94a3b8" fontSize="10">
                  1 atm (101.3 kPa)
                </text>

                {/* Curve */}
                <path
                  d={pSatPoints
                    .map(
                      (p, i) =>
                        `${i === 0 ? 'M' : 'L'} ${60 + ((p.T - 20) / 100) * 500} ${
                          210 - Math.min(190, (p.P_kPa / 300) * 190)
                        }`
                    )
                    .join(' ')}
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* Current temperature marker */}
                {(() => {
                  const xPos = 60 + ((tempC - 20) / 100) * 500;
                  const yPos = 210 - Math.min(190, (currPoint.P_kPa / 300) * 190);
                  if (tempC >= 20 && tempC <= 120) {
                    return (
                      <g>
                        <circle cx={xPos} cy={yPos} r="5" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                        <text x={xPos + 8} y={yPos - 4} fontSize="11" fontWeight="600" fill="#e11d48">
                          {currPoint.P_kPa.toFixed(1)} kPa @ {tempC}°C
                        </text>
                      </g>
                    );
                  }
                  return null;
                })()}

                <text x="310" y="240" fill="#64748b" fontSize="11" textAnchor="middle">
                  Temperature (°C)
                </text>
                <text x="25" y="115" fill="#64748b" fontSize="11" transform="rotate(-90 25 115)" textAnchor="middle">
                  Vapor Pressure (kPa)
                </text>
              </svg>

              <div className="callout callout-info" style={{ marginTop: 14 }}>
                <div>
                  <strong>Raoult's Law Formulation:</strong> For ideal binary mixtures, the partial vapor pressure is given by p_i = x_i · P_sat,i(T). The total vapor pressure equals the bubble point pressure: P = Σ x_i · P_sat,i.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
