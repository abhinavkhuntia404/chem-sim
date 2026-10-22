import React, { useState } from 'react';
import { Layers, Flame, Atom, Droplet, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { convertUnit } from './api';

interface Props {
  onSelectModule: (module: string) => void;
}

export const OverviewModule: React.FC<Props> = ({ onSelectModule }) => {
  // Unit converter state
  const [val, setVal] = useState<number>(100.0);
  const [fromU, setFromU] = useState<string>('C');
  const [toU, setToU] = useState<string>('K');
  const [converted, setConverted] = useState<number>(373.15);
  const [convLoading, setConvLoading] = useState<boolean>(false);

  const handleConvert = async () => {
    setConvLoading(true);
    try {
      const res = await convertUnit(val, fromU, toU);
      setConverted(res.result);
    } finally {
      setConvLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero Welcome */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          borderRadius: 8,
          padding: '28px 32px',
          color: '#ffffff',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span
              style={{
                background: 'rgba(59, 130, 246, 0.25)',
                color: '#93c5fd',
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Chemical Engineering Simulation Suite
            </span>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: 10, letterSpacing: '-0.02em' }}>
              CHEM-SIM Engineering Workbench
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', maxWidth: 640, marginTop: 6, lineHeight: 1.5 }}>
              Scientifically grounded simulation platform designed for process design, unit operations analysis, and transport phenomena calculations.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#6ee7b7',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '4px 10px',
                borderRadius: 9999,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={12} /> Numerical Solvers Active
            </span>
          </div>
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div>
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>
          Core Unit Operations & Analysis Modules
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* Distillation Card */}
          <div
            className="eng-card"
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
            onClick={() => onSelectModule('distillation')}
          >
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ padding: 8, background: '#eff6ff', borderRadius: 6, color: '#2563eb' }}>
                  <Layers size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Binary Distillation</h4>
                  <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>FLAGSHIP MODULE</span>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                McCabe–Thiele graphical stepping, constant molar overflow (CMO), stage temperatures, reflux optimization, and reboiler duty.
              </p>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: '#2563eb' }}>
                Open Simulator <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* Heat Exchanger Card */}
          <div
            className="eng-card"
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
            onClick={() => onSelectModule('heat-exchanger')}
          >
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ padding: 8, background: '#fef2f2', borderRadius: 6, color: '#dc2626' }}>
                  <Flame size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Heat Exchangers</h4>
                  <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 600 }}>THERMAL DESIGN</span>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Log mean temperature difference (LMTD) rating, countercurrent vs cocurrent flow, temperature cross checks, and area sizing.
              </p>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: '#dc2626' }}>
                Open Exchanger Tool <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* Reactor Card */}
          <div
            className="eng-card"
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
            onClick={() => onSelectModule('reactor')}
          >
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ padding: 8, background: '#ecfdf5', borderRadius: 6, color: '#059669' }}>
                  <Atom size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Reaction Kinetics</h4>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>REACTOR ENGINEERING</span>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                CSTR vs PFR conversion comparisons, residence time distributions, Damköhler scaling, and rate constant kinetics.
              </p>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: '#059669' }}>
                Open Reactor Tool <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* Thermo Card */}
          <div
            className="eng-card"
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
            onClick={() => onSelectModule('thermo')}
          >
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ padding: 8, background: '#f0fdfa', borderRadius: 6, color: '#0d9488' }}>
                  <Droplet size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Thermodynamics & VLE</h4>
                  <span style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 600 }}>NIST PHYSICAL DATA</span>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Antoine vapor pressure calculations, critical constants, acentric factors, and binary vapor-liquid phase diagrams.
              </p>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: '#0d9488' }}>
                Open Thermo Database <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Unit Converter Workbench */}
      <div className="eng-card">
        <div className="card-header">
          <span className="card-title">
            <RefreshCw size={16} /> Dimensional Safety & Unit Converter
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Strict dimensional validation prevents conversion between mismatched dimensions.
          </span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px auto', gap: 12, alignItems: 'flex-end' }}>
            <div>
              <label className="form-label">Numerical Quantity</label>
              <input
                type="number"
                className="input-field"
                style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 12px', width: '100%' }}
                value={val}
                onChange={(e) => setVal(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="form-label">From Unit</label>
              <select
                className="select-field"
                value={fromU}
                onChange={(e) => setFromU(e.target.value)}
              >
                <optgroup label="Temperature">
                  <option value="C">°C (Celsius)</option>
                  <option value="K">K (Kelvin)</option>
                  <option value="F">°F (Fahrenheit)</option>
                </optgroup>
                <optgroup label="Pressure">
                  <option value="kPa">kPa (Kilopascal)</option>
                  <option value="bar">bar</option>
                  <option value="atm">atm (Atmosphere)</option>
                </optgroup>
                <optgroup label="Flow Rate">
                  <option value="kg/s">kg/s</option>
                  <option value="kg/h">kg/h</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="form-label">To Unit</label>
              <select
                className="select-field"
                value={toU}
                onChange={(e) => setToU(e.target.value)}
              >
                <optgroup label="Temperature">
                  <option value="K">K (Kelvin)</option>
                  <option value="C">°C (Celsius)</option>
                  <option value="F">°F (Fahrenheit)</option>
                </optgroup>
                <optgroup label="Pressure">
                  <option value="kPa">kPa (Kilopascal)</option>
                  <option value="bar">bar</option>
                  <option value="atm">atm (Atmosphere)</option>
                </optgroup>
                <optgroup label="Flow Rate">
                  <option value="kg/s">kg/s</option>
                  <option value="kg/h">kg/h</option>
                </optgroup>
              </select>
            </div>
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '9px 20px' }}
              onClick={handleConvert}
              disabled={convLoading}
            >
              Convert
            </button>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: 14,
              background: '#f8fafc',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.86rem', color: '#475569' }}>
              Converted Value:
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#1d4ed8' }}>
              {val} {fromU} = {converted.toFixed(4)} {toU}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
