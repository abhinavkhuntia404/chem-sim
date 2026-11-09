import { useState } from 'react';
import {
  Sliders,
  Calculator,
  Flame,
  Wind,
  Atom,
  Layers,
  DollarSign,
  CheckCircle2,
  Copy,
} from 'lucide-react';

export function ToolboxWorkspace() {
  const [activeCategory, setActiveCategory] = useState<
    'fluid' | 'heat' | 'mass' | 'reaction' | 'process' | 'economics' | 'general'
  >('fluid');

  const [copiedMsg, setCopiedMsg] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsg('Copied to clipboard');
    setTimeout(() => setCopiedMsg(null), 2500);
  };

  // --- Calculator States ---
  // 1. Reynolds & Friction Factor
  const [reVelocity, setReVelocity] = useState<number>(2.5); // m/s
  const [reDiameter, setReDiameter] = useState<number>(0.05); // m
  const [reDensity, setReDensity] = useState<number>(1000); // kg/m^3
  const [reViscosity, setReViscosity] = useState<number>(0.001); // Pa.s
  const [reRoughness, setReRoughness] = useState<number>(0.000045); // m

  // 2. LMTD & Exchanger Heat Duty
  const [lmtdThIn, setLmtdThIn] = useState<number>(90); // °C
  const [lmtdThOut, setLmtdThOut] = useState<number>(55); // °C
  const [lmtdTcIn, setLmtdTcIn] = useState<number>(20); // °C
  const [lmtdTcOut, setLmtdTcOut] = useState<number>(45); // °C
  const [lmtdFlowHot, setLmtdFlowHot] = useState<number>(2.0); // kg/s
  const [lmtdCpHot, setLmtdCpHot] = useState<number>(4184); // J/(kg.K)

  // 3. CSTR / PFR Reactor Sizing
  const [creFlowRate, setCreFlowRate] = useState<number>(0.005); // m^3/s
  const [creCa0, setCreCa0] = useState<number>(2.0); // mol/L
  const [creConversion, setCreConversion] = useState<number>(0.80); // 80%
  const [creRateConstant, setCreRateConstant] = useState<number>(0.015); // 1/s

  // 4. Stoichiometry & Combustion Excess Air
  const [combustionMethane, setCombustionMethane] = useState<number>(100); // mol/h
  const [combustionExcessPct, setCombustionExcessPct] = useState<number>(20); // 20% excess air

  // 5. Engineering Economics: Net Present Value (NPV) & Payback
  const [econCapex, setEconCapex] = useState<number>(250000); // $ initial capital
  const [econAnnualSavings, setEconAnnualSavings] = useState<number>(65000); // $ / year net cash flow
  const [econYears, setEconYears] = useState<number>(8); // lifespan years
  const [econDiscountRate, setEconDiscountRate] = useState<number>(0.08); // 8% discount rate

  // 6. Binary Gas Diffusivity (Fuller correlation)
  const [diffTempC, setDiffTempC] = useState<number>(25); // °C
  const [diffPressureAtm, setDiffPressureAtm] = useState<number>(1.0); // atm
  const [diffMa, setDiffMa] = useState<number>(28.97); // Air MW
  const [diffMb, setDiffMb] = useState<number>(18.02); // Water MW
  const diffVa = 20.1; // Air sum v
  const diffVb = 12.7; // Water sum v

  // --- Computations ---
  // 1. Reynolds & Friction Factor
  const calcReynolds = (reDensity * reVelocity * reDiameter) / Math.max(1e-7, reViscosity);
  const isLaminar = calcReynolds < 2300;
  let calcFriction = 0.02;
  if (isLaminar) {
    calcFriction = 64.0 / Math.max(1, calcReynolds);
  } else {
    const relRough = reRoughness / reDiameter;
    calcFriction = 0.25 / Math.pow(Math.log10(relRough / 3.7 + 5.74 / Math.pow(calcReynolds, 0.9)), 2);
  }
  const calcHeadLossPerMeter = (calcFriction / reDiameter) * (reVelocity * reVelocity) / (2 * 9.80665);
  const calcPressureDropPerMeter = calcHeadLossPerMeter * reDensity * 9.80665; // Pa/m

  // 2. LMTD
  const deltaT1 = lmtdThIn - lmtdTcOut; // Countercurrent
  const deltaT2 = lmtdThOut - lmtdTcIn;
  let calcLmtd = 0;
  if (deltaT1 > 0 && deltaT2 > 0) {
    if (Math.abs(deltaT1 - deltaT2) < 0.001) calcLmtd = deltaT1;
    else calcLmtd = (deltaT1 - deltaT2) / Math.log(deltaT1 / deltaT2);
  }
  const calcDutyW = lmtdFlowHot * lmtdCpHot * (lmtdThIn - lmtdThOut);
  const calcDutyKW = calcDutyW / 1000.0;

  // 3. CSTR vs PFR Volumes
  const caExit = creCa0 * (1.0 - creConversion);
  const rateExit = creRateConstant * caExit; // 1st order
  const volCstrM3 = (creFlowRate * creCa0 * creConversion) / Math.max(1e-7, rateExit);
  const volPfrM3 = (creFlowRate / creRateConstant) * Math.log(1.0 / (1.0 - creConversion));
  const tauCstrS = volCstrM3 / creFlowRate;
  const tauPfrS = volPfrM3 / creFlowRate;

  // 4. Combustion Stoichiometry (CH4 + 2 O2 -> CO2 + 2 H2O)
  const theoO2 = combustionMethane * 2.0;
  const actualO2 = theoO2 * (1.0 + combustionExcessPct / 100.0);
  const actualAir = actualO2 / 0.21;
  const flueN2 = actualAir * 0.79;
  const flueCO2 = combustionMethane;
  const flueH2O = combustionMethane * 2.0;
  const flueExcessO2 = actualO2 - theoO2;
  const totalFlueWet = flueN2 + flueCO2 + flueH2O + flueExcessO2;

  // 5. Economics NPV & Payback
  let calcNpv = -econCapex;
  for (let yr = 1; yr <= econYears; yr++) {
    calcNpv += econAnnualSavings / Math.pow(1 + econDiscountRate, yr);
  }
  const simplePaybackYears = econCapex / Math.max(1, econAnnualSavings);

  // 6. Fuller Diffusivity
  const tkDiff = diffTempC + 273.15;
  const mwFactor = Math.sqrt(1.0 / diffMa + 1.0 / diffMb);
  const volTerm = Math.pow(Math.pow(diffVa, 1.0 / 3.0) + Math.pow(diffVb, 1.0 / 3.0), 2);
  const dabM2S = (1.0e-7 * Math.pow(tkDiff, 1.75) * mwFactor) / (diffPressureAtm * volTerm);
  const dabCm2S = dabM2S * 1.0e4;

  return (
    <div className="toolbox-workspace" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Top Toolbox Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#0f172a',
          padding: '16px 22px',
          borderRadius: 8,
          border: '1px solid #1e293b',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 10, background: '#10b981', borderRadius: 8, color: '#ffffff' }}>
            <Calculator size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              Curriculum-Independent Engineering Toolbox
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Rigorous, first-principles chemical engineering calculators with documented formulas, SI units, and step-by-step solutions
            </div>
          </div>
        </div>

        {copiedMsg && (
          <span style={{ fontSize: '0.75rem', background: '#064e3b', color: '#a7f3d0', padding: '4px 10px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={13} /> {copiedMsg}
          </span>
        )}
      </div>

      {/* Discipline Category Tabs */}
      <div style={{ display: 'flex', gap: 6, background: '#0f172a', padding: '8px 12px', borderRadius: 8, border: '1px solid #1e293b', overflowX: 'auto' }}>
        <button
          className={`btn-tag ${activeCategory === 'fluid' ? 'active' : ''}`}
          onClick={() => setActiveCategory('fluid')}
          style={{ fontSize: '0.76rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Wind size={14} /> Fluid Mechanics & Piping
        </button>
        <button
          className={`btn-tag ${activeCategory === 'heat' ? 'active' : ''}`}
          onClick={() => setActiveCategory('heat')}
          style={{ fontSize: '0.76rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Flame size={14} /> Process Heat Transfer
        </button>
        <button
          className={`btn-tag ${activeCategory === 'reaction' ? 'active' : ''}`}
          onClick={() => setActiveCategory('reaction')}
          style={{ fontSize: '0.76rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Atom size={14} /> Chemical Reaction Engineering
        </button>
        <button
          className={`btn-tag ${activeCategory === 'process' ? 'active' : ''}`}
          onClick={() => setActiveCategory('process')}
          style={{ fontSize: '0.76rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Sliders size={14} /> Process Stoichiometry & Combustion
        </button>
        <button
          className={`btn-tag ${activeCategory === 'mass' ? 'active' : ''}`}
          onClick={() => setActiveCategory('mass')}
          style={{ fontSize: '0.76rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Layers size={14} /> Mass Transfer & Diffusion
        </button>
        <button
          className={`btn-tag ${activeCategory === 'economics' ? 'active' : ''}`}
          onClick={() => setActiveCategory('economics')}
          style={{ fontSize: '0.76rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <DollarSign size={14} /> Engineering Economics
        </button>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 1. FLUID MECHANICS: Reynolds & Friction Loss Calculator           */}
      {/* ---------------------------------------------------------------- */}
      {activeCategory === 'fluid' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Inputs Panel */}
          <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
              Pipe Flow, Reynolds Number & Darcy Friction Factor
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>FLUID VELOCITY (v)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    step="0.1"
                    value={reVelocity}
                    onChange={(e) => setReVelocity(Number(e.target.value))}
                    style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>m/s</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>PIPE INNER DIAMETER (D)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    step="0.005"
                    value={reDiameter}
                    onChange={(e) => setReDiameter(Number(e.target.value))}
                    style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>m</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>FLUID DENSITY (ρ)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    value={reDensity}
                    onChange={(e) => setReDensity(Number(e.target.value))}
                    style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>kg/m³</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>DYNAMIC VISCOSITY (μ)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    step="0.0001"
                    value={reViscosity}
                    onChange={(e) => setReViscosity(Number(e.target.value))}
                    style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Pa·s</span>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>PIPE ABSOLUTE ROUGHNESS (ε)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    step="0.000005"
                    value={reRoughness}
                    onChange={(e) => setReRoughness(Number(e.target.value))}
                    style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>m (Commercial Steel: 4.5e-5)</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#1e293b44', padding: 12, borderRadius: 6, border: '1px solid #334155', fontSize: '0.74rem', color: '#cbd5e1' }}>
              <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: 4 }}>Governing Equations:</div>
              <div>• Re = (ρ · v · D) / μ</div>
              <div>• Laminar (Re &lt; 2300): f = 64 / Re</div>
              <div>• Turbulent (Swamee-Jain): f = 0.25 / [log₁₀(ε/3.7D + 5.74/Re⁰·⁹)]²</div>
              <div>• Darcy Head Loss: h_f/L = f · (v² / 2gD)</div>
            </div>
          </div>

          {/* Solved Results Panel */}
          <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>Solved Hydrodynamic Outputs</span>
                <button
                  onClick={() => copyToClipboard(`Re=${calcReynolds.toFixed(0)}, f=${calcFriction.toFixed(4)}, dp/L=${(calcPressureDropPerMeter/1000).toFixed(2)} kPa/m`)}
                  style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: 4, padding: '3px 8px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Copy size={12} /> Copy
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>REYNOLDS NUMBER</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>{calcReynolds.toFixed(0)}</div>
                  <div style={{ fontSize: '0.68rem', color: isLaminar ? '#34d399' : '#f59e0b', fontWeight: 600 }}>
                    {isLaminar ? 'Laminar Regime (Re < 2300)' : 'Turbulent Regime (Re ≥ 2300)'}
                  </div>
                </div>

                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>DARCY FRICTION FACTOR (f)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>{calcFriction.toFixed(4)}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Fanning f_F = {(calcFriction / 4).toFixed(4)}</div>
                </div>

                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>HEAD LOSS GRADIENT</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                    {calcHeadLossPerMeter.toFixed(3)} <span style={{ fontSize: '0.75rem' }}>m/m</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{(calcHeadLossPerMeter * 100).toFixed(1)} m per 100m pipe</div>
                </div>

                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PRESSURE DROP GRADIENT</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f43f5e' }}>
                    {(calcPressureDropPerMeter / 1000).toFixed(2)} <span style={{ fontSize: '0.75rem' }}>kPa/m</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{(calcPressureDropPerMeter / 100000).toFixed(4)} bar/m</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#064e3b22', padding: 12, borderRadius: 6, border: '1px solid #059669', fontSize: '0.74rem', color: '#a7f3d0', marginTop: 14 }}>
              <strong>Engineering Sizing Rule of Thumb:</strong> For liquid process lines, economic velocities typically range between 1.5 m/s and 3.0 m/s with frictional pressure drops &lt; 0.5 bar / 100 m.
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 2. HEAT TRANSFER: LMTD & Heat Duty Calculator                     */}
      {/* ---------------------------------------------------------------- */}
      {activeCategory === 'heat' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
              Countercurrent Heat Exchanger LMTD & Duty Rating
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>HOT STREAM INLET (T_h1)</label>
                <input
                  type="number"
                  value={lmtdThIn}
                  onChange={(e) => setLmtdThIn(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>HOT STREAM OUTLET (T_h2)</label>
                <input
                  type="number"
                  value={lmtdThOut}
                  onChange={(e) => setLmtdThOut(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>COLD STREAM INLET (T_c1)</label>
                <input
                  type="number"
                  value={lmtdTcIn}
                  onChange={(e) => setLmtdTcIn(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>COLD STREAM OUTLET (T_c2)</label>
                <input
                  type="number"
                  value={lmtdTcOut}
                  onChange={(e) => setLmtdTcOut(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>HOT MASS FLOW (m_h)</label>
                <input
                  type="number"
                  step="0.1"
                  value={lmtdFlowHot}
                  onChange={(e) => setLmtdFlowHot(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>SPECIFIC HEAT (C_p,h)</label>
                <input
                  type="number"
                  value={lmtdCpHot}
                  onChange={(e) => setLmtdCpHot(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div style={{ background: '#1e293b44', padding: 12, borderRadius: 6, border: '1px solid #334155', fontSize: '0.74rem', color: '#cbd5e1' }}>
              <div>• ΔT₁ = T_h1 - T_c2 = {deltaT1.toFixed(1)} °C</div>
              <div>• ΔT₂ = T_h2 - T_c1 = {deltaT2.toFixed(1)} °C</div>
              <div>• Countercurrent LMTD = (ΔT₁ - ΔT₂) / ln(ΔT₁ / ΔT₂)</div>
            </div>
          </div>

          <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>Thermal Rating Results</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>LOG MEAN TEMP DIFF (LMTD)</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#38bdf8' }}>
                    {calcLmtd.toFixed(2)} <span style={{ fontSize: '0.75rem' }}>°C</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Mean thermal driving force</div>
                </div>

                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>HEAT EXCHANGER DUTY (Q)</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f43f5e' }}>
                    {calcDutyKW.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>kW</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{(calcDutyKW / 1000).toFixed(3)} MW thermal</div>
                </div>

                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ESTIMATED AREA (U=800 W/m²K)</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#10b981' }}>
                    {calcLmtd > 0 ? ((calcDutyW / (800 * calcLmtd))).toFixed(2) : 'N/A'} <span style={{ fontSize: '0.75rem' }}>m²</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Area = Q / (U · LMTD)</div>
                </div>

                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>TEMPERATURE CROSS CHECK</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: deltaT1 > 0 && deltaT2 > 0 ? '#34d399' : '#ef4444' }}>
                    {deltaT1 > 0 && deltaT2 > 0 ? 'Feasible (No Cross)' : 'Thermal Cross Detected'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Min approach = {Math.min(deltaT1, deltaT2).toFixed(1)} °C</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#064e3b22', padding: 12, borderRadius: 6, border: '1px solid #059669', fontSize: '0.74rem', color: '#a7f3d0', marginTop: 14 }}>
              <strong>Second Law Verification:</strong> In countercurrent flow, the outlet temperature of the cold stream can exceed the outlet temperature of the hot stream without violating the Second Law of Thermodynamics.
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 3. REACTION ENGINEERING: CSTR vs PFR Sizing                       */}
      {/* ---------------------------------------------------------------- */}
      {activeCategory === 'reaction' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
              Isothermal Reactor Sizing: CSTR vs Plug Flow Reactor (PFR)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>VOLUMETRIC FLOW RATE (v₀)</label>
                <input
                  type="number"
                  step="0.001"
                  value={creFlowRate}
                  onChange={(e) => setCreFlowRate(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>INLET CONCENTRATION (C_A0)</label>
                <input
                  type="number"
                  step="0.1"
                  value={creCa0}
                  onChange={(e) => setCreCa0(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>FRACTIONAL CONVERSION (X_A)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  max="0.99"
                  value={creConversion}
                  onChange={(e) => setCreConversion(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>RATE CONSTANT (k, 1st order)</label>
                <input
                  type="number"
                  step="0.005"
                  value={creRateConstant}
                  onChange={(e) => setCreRateConstant(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div style={{ background: '#1e293b44', padding: 12, borderRadius: 6, border: '1px solid #334155', fontSize: '0.74rem', color: '#cbd5e1' }}>
              <div>• First Order Kinetic Rate Law: -r_A = k · C_A</div>
              <div>• CSTR Design Equation: V_CSTR = (v₀ · C_A0 · X_A) / (-r_A,exit)</div>
              <div>• PFR Design Equation: V_PFR = v₀ · ∫ (dX_A / -r_A) = (v₀/k) · ln[1 / (1 - X_A)]</div>
            </div>
          </div>

          <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>Reactor Volume Comparison</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>REQUIRED CSTR VOLUME</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f43f5e' }}>
                    {volCstrM3.toFixed(2)} <span style={{ fontSize: '0.75rem' }}>m³</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Space time τ = {tauCstrS.toFixed(1)} s</div>
                </div>

                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>REQUIRED PFR VOLUME</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#10b981' }}>
                    {volPfrM3.toFixed(2)} <span style={{ fontSize: '0.75rem' }}>m³</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Space time τ = {tauPfrS.toFixed(1)} s</div>
                </div>

                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6, gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>VOLUME RATIO (V_CSTR / V_PFR)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8' }}>
                    {(volCstrM3 / Math.max(1e-7, volPfrM3)).toFixed(2)}x
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: 2 }}>
                    For 80% conversion, CSTR requires {(volCstrM3 / Math.max(1e-7, volPfrM3)).toFixed(1)} times the volume of a PFR due to immediate backmixing dilution of reactant concentration.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 4. PROCESS STOICHIOMETRY: Combustion Calculator                   */}
      {/* ---------------------------------------------------------------- */}
      {activeCategory === 'process' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
              Methane Fuel Combustion & Flue Gas Orsat Stoichiometry
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>METHANE FUEL (CH₄)</label>
                <input
                  type="number"
                  value={combustionMethane}
                  onChange={(e) => setCombustionMethane(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>mol/h</span>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>EXCESS AIR PERCENTAGE</label>
                <input
                  type="number"
                  value={combustionExcessPct}
                  onChange={(e) => setCombustionExcessPct(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>% excess O₂</span>
              </div>
            </div>

            <div style={{ background: '#1e293b44', padding: 12, borderRadius: 6, border: '1px solid #334155', fontSize: '0.74rem', color: '#cbd5e1' }}>
              <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: 4 }}>Reaction Stoichiometry:</div>
              <div>CH₄ + 2 O₂ ➔ CO₂ + 2 H₂O</div>
              <div>• Theoretical O₂ = 2.0 × CH₄ = {theoO2} mol/h</div>
              <div>• Actual Air = (Theoretical O₂ × (1 + Excess%)) / 0.21</div>
            </div>
          </div>

          <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>Flue Gas Exit Stream Analysis</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 14 }}>
                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>TOTAL AIR SUPPLY</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>
                    {actualAir.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>mol/h</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>O₂: {actualO2.toFixed(1)} | N₂: {flueN2.toFixed(1)}</div>
                </div>

                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>TOTAL FLUE GAS (WET)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                    {totalFlueWet.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>mol/h</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>H₂O in stack: {flueH2O.toFixed(1)} mol/h</div>
                </div>

                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6, gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4 }}>ORSAT ANALYSIS (DRY BASIS MOLE FRACTIONS)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: '0.78rem' }}>
                    <div><strong>CO₂:</strong> {((flueCO2 / (totalFlueWet - flueH2O)) * 100).toFixed(2)}%</div>
                    <div><strong>O₂:</strong> {((flueExcessO2 / (totalFlueWet - flueH2O)) * 100).toFixed(2)}%</div>
                    <div><strong>N₂:</strong> {((flueN2 / (totalFlueWet - flueH2O)) * 100).toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 5. MASS TRANSFER: Fuller Binary Gas Diffusivity                   */}
      {/* ---------------------------------------------------------------- */}
      {activeCategory === 'mass' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
              Binary Gas Diffusivity (Fuller-Schettler-Giddings Method)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>TEMPERATURE (°C)</label>
                <input
                  type="number"
                  value={diffTempC}
                  onChange={(e) => setDiffTempC(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>PRESSURE (atm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={diffPressureAtm}
                  onChange={(e) => setDiffPressureAtm(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>MW SPECIES A (Air)</label>
                <input
                  type="number"
                  value={diffMa}
                  onChange={(e) => setDiffMa(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>MW SPECIES B (Water Vapor)</label>
                <input
                  type="number"
                  value={diffMb}
                  onChange={(e) => setDiffMb(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div style={{ background: '#1e293b44', padding: 12, borderRadius: 6, border: '1px solid #334155', fontSize: '0.74rem', color: '#cbd5e1' }}>
              <div>• Fuller Empirical Correlation:</div>
              <div style={{ fontFamily: 'monospace', color: '#38bdf8', marginTop: 2 }}>
                D_AB = (1.0e-7 · T^1.75 · √(1/M_A + 1/M_B)) / (P · [Σv_A^(1/3) + Σv_B^(1/3)]²)
              </div>
            </div>
          </div>

          <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>Calculated Binary Diffusivity</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 14 }}>
                <div style={{ background: '#1e293b', padding: 14, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>DIFFUSION COEFFICIENT (D_AB)</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>
                    {dabCm2S.toFixed(4)} <span style={{ fontSize: '0.85rem' }}>cm²/s</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: 4 }}>
                    {dabM2S.toExponential(4)} m²/s
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: '#064e3b22', padding: 12, borderRadius: 6, border: '1px solid #059669', fontSize: '0.74rem', color: '#a7f3d0' }}>
              Typical binary gas diffusivities at standard ambient temperature and pressure range from 0.1 to 0.3 cm²/s, which is ~10,000 times faster than liquid phase diffusion (~1.0e-5 cm²/s).
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 6. ENGINEERING ECONOMICS: NPV & Payback Period                   */}
      {/* ---------------------------------------------------------------- */}
      {activeCategory === 'economics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
              Process Capital Investment & Net Present Value (NPV)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>CAPITAL EXPENDITURE (CAPEX)</label>
                <input
                  type="number"
                  step="10000"
                  value={econCapex}
                  onChange={(e) => setEconCapex(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>USD ($)</span>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>ANNUAL NET CASH FLOW</label>
                <input
                  type="number"
                  step="5000"
                  value={econAnnualSavings}
                  onChange={(e) => setEconAnnualSavings(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>USD ($/year)</span>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>PROJECT LIFESPAN (Years)</label>
                <input
                  type="number"
                  value={econYears}
                  onChange={(e) => setEconYears(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>DISCOUNT RATE (r)</label>
                <input
                  type="number"
                  step="0.01"
                  value={econDiscountRate}
                  onChange={(e) => setEconDiscountRate(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '6px 8px', fontSize: '0.8rem' }}
                />
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{(econDiscountRate * 100).toFixed(1)}% Weighted Cost of Capital</span>
              </div>
            </div>

            <div style={{ background: '#1e293b44', padding: 12, borderRadius: 6, border: '1px solid #334155', fontSize: '0.74rem', color: '#cbd5e1' }}>
              <div>• Net Present Value: NPV = -CAPEX + Σ [CF_t / (1 + r)^t]</div>
              <div>• Simple Payback Period: T_payback = CAPEX / Annual Cash Flow</div>
            </div>
          </div>

          <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>Economic Feasibility Verdict</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>NET PRESENT VALUE (NPV)</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: calcNpv > 0 ? '#34d399' : '#ef4444' }}>
                    ${Math.round(calcNpv).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: calcNpv > 0 ? '#34d399' : '#ef4444', fontWeight: 600 }}>
                    {calcNpv > 0 ? 'Economically Feasible (NPV > 0)' : 'Unfavorable Project (NPV < 0)'}
                  </div>
                </div>

                <div style={{ background: '#1e293b', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>SIMPLE PAYBACK PERIOD</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#38bdf8' }}>
                    {simplePaybackYears.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>Years</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Break-even capital recovery</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#064e3b22', padding: 12, borderRadius: 6, border: '1px solid #059669', fontSize: '0.74rem', color: '#a7f3d0', marginTop: 14 }}>
              <strong>Investment Decision Rule:</strong> In process plant design, projects are typically authorized only if the internal rate of return (IRR) exceeds the corporate hurdle rate (usually 12–15%) and the simple payback period is under 3 to 4 years.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
