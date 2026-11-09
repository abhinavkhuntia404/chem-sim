import { useState, useEffect } from 'react';
import {
  Activity,
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface DigitalTwinWorkspaceProps {
  onLaunchSimulation?: (moduleId: string) => void;
}

interface ScadaPoint {
  timeSec: number;
  pv: number;
  sp: number;
  op: number;
}

export function DigitalTwinWorkspace({ onLaunchSimulation }: DigitalTwinWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'scada' | 'pid' | 'hazop' | 'hierarchy'>('scada');

  // --- SCADA Historian States ---
  const [scadaRunning, setScadaRunning] = useState<boolean>(true);
  const [scadaScenario, setScadaScenario] = useState<
    'normal' | 'pump_cavitation' | 'exchanger_fouling' | 'cstr_runaway' | 'column_flooding'
  >('normal');
  const [history, setHistory] = useState<ScadaPoint[]>([]);
  const [currentPv, setCurrentPv] = useState<number>(75.0);
  const [currentSp, setCurrentSp] = useState<number>(75.0);
  const [currentOp, setCurrentOp] = useState<number>(50.0);
  const [alarmActive, setAlarmActive] = useState<boolean>(false);
  const [alarmMessage, setAlarmMessage] = useState<string>('Normal Operation - All Loops Within Envelope');

  // --- PID Tuning States ---
  const [pidKp, setPidKp] = useState<number>(2.4);
  const [pidTi, setPidTi] = useState<number>(35.0); // seconds
  const [pidTd, setPidTd] = useState<number>(4.5); // seconds
  const [pidStepMagnitude, setPidStepMagnitude] = useState<number>(10.0); // +10 °C step
  const [pidTuningPreset, setPidTuningPreset] = useState<'zn' | 'cc' | 'imc' | 'custom'>('custom');

  // --- HAZOP Matrix State ---
  const [selectedHazopRow, setSelectedHazopRow] = useState<number>(0);

  // Initialize SCADA stream
  useEffect(() => {
    const initial: ScadaPoint[] = [];
    for (let i = 0; i < 30; i++) {
      initial.push({
        timeSec: i,
        pv: 75.0 + (Math.random() - 0.5) * 0.4,
        sp: 75.0,
        op: 50.0 + (Math.random() - 0.5) * 0.8,
      });
    }
    setHistory(initial);
  }, []);

  // SCADA Live Trend Generator
  useEffect(() => {
    if (!scadaRunning) return;
    const interval = setInterval(() => {
      setHistory((prev) => {
        const last = prev[prev.length - 1] || { timeSec: 0, pv: 75, sp: 75, op: 50 };
        const nextTime = last.timeSec + 1;
        let nextPv = last.pv;
        let nextOp = last.op;
        let alarm = false;
        let msg = 'Normal Operation - All Loops Within Envelope';

        if (scadaScenario === 'normal') {
          nextPv = 75.0 + (Math.random() - 0.5) * 0.6;
          nextOp = 50.0 + (75.0 - nextPv) * 1.5;
        } else if (scadaScenario === 'pump_cavitation') {
          // Pump cavitation: discharge pressure drops, high frequency noise & vibration
          nextPv = Math.max(30.0, last.pv - 1.2 + (Math.random() - 0.5) * 4.0);
          nextOp = 100.0; // Valve opens trying to recover flow
          alarm = true;
          msg = 'CRITICAL ALARM: Pump P-101 Cavitation & Suction Head Collapse (NPSHa < NPSHr)';
        } else if (scadaScenario === 'exchanger_fouling') {
          // Heat exchanger: tube wall fouling resistance causes progressive drop in temperature
          nextPv = Math.max(52.0, last.pv - 0.4);
          nextOp = Math.min(100.0, last.op + 1.2); // Steam valve forced wide open
          if (nextPv < 65) {
            alarm = true;
            msg = 'PROCESS WARNING: Exchanger E-101 Severe Scale Deposition - U-Value Fallen by 45%';
          }
        } else if (scadaScenario === 'cstr_runaway') {
          // Exothermic reaction thermal runaway: exponential temperature rise
          nextPv = Math.min(135.0, last.pv + (last.pv > 85 ? 2.5 : 1.1) + (Math.random() - 0.5) * 0.5);
          nextOp = 100.0; // Emergency cooling open
          if (nextPv > 88) {
            alarm = true;
            msg = 'EMERGENCY SHUTDOWN: Reactor R-101 Exothermic Thermal Runaway - T > Safety Limit (92 °C)';
          }
        } else if (scadaScenario === 'column_flooding') {
          // Distillation column flooding: differential pressure climbs rapidly
          nextPv = Math.min(98.0, last.pv + 1.5);
          nextOp = Math.max(10.0, last.op - 2.0); // Boilup throttle
          alarm = true;
          msg = 'OPERATIONAL HAZARD: Column T-101 Differential Pressure Surge - Liquid Carryover / Flooding';
        }

        setCurrentPv(nextPv);
        setCurrentSp(75.0);
        setCurrentOp(nextOp);
        setAlarmActive(alarm);
        setAlarmMessage(msg);

        const updated = [...prev.slice(1), { timeSec: nextTime, pv: nextPv, sp: 75.0, op: nextOp }];
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [scadaRunning, scadaScenario]);

  // Handle Preset PID Tuning selection
  const applyPidPreset = (type: 'zn' | 'cc' | 'imc') => {
    setPidTuningPreset(type);
    if (type === 'zn') {
      // Ziegler-Nichols standard PID
      setPidKp(3.8);
      setPidTi(22.0);
      setPidTd(5.5);
    } else if (type === 'cc') {
      // Cohen-Coon PID
      setPidKp(4.2);
      setPidTi(18.5);
      setPidTd(4.2);
    } else if (type === 'imc') {
      // Internal Model Control (smoother, minimal overshoot)
      setPidKp(1.9);
      setPidTi(42.0);
      setPidTd(2.8);
    }
  };

  // PID Simulated Step Response Metrics
  const simulatedRiseTime = (12.0 / Math.max(0.2, pidKp)).toFixed(1);
  const simulatedOvershoot = Math.max(0, Math.min(65, (pidKp * 8.5) - (pidTi * 0.2) + (pidTd * 1.5))).toFixed(1);
  const simulatedSettlingTime = Math.max(5, (pidTi * 1.8) / Math.max(0.5, pidKp)).toFixed(1);
  const simulatedIae = (Number(simulatedOvershoot) * 12.4 + Number(simulatedSettlingTime) * 3.2).toFixed(0);

  // HAZOP Worksheet items
  const hazopItems = [
    {
      id: 1,
      node: 'Node 1: Suction line to Centrifugal Pump P-101',
      parameter: 'Flow',
      guideWord: 'NO / LESS',
      deviation: 'No flow or low flow to pump suction',
      cause: 'Suction block valve inadvertently closed, suction strainer blinded with debris, feed tank TK-101 empty.',
      consequence: 'Pump runs dry, catastrophic mechanical seal failure, impeller overheating, cavitation and seizure.',
      safeguards: 'Low suction pressure interlock (PSLL-101) to trip pump; min-flow bypass line back to TK-101; level switch low (LALL-101).',
      severity: 4,
      likelihood: 2,
      sil: 'SIL 2',
      recommendations: 'Install high-integrity automated minimum flow recirculation valve and differential pressure alarm across suction strainer.',
    },
    {
      id: 2,
      node: 'Node 2: Tube side of Shell & Tube Preheater E-101',
      parameter: 'Temperature',
      guideWord: 'MORE',
      deviation: 'High fluid discharge temperature (> 95 °C)',
      cause: 'Steam control valve TCV-101 failed open, temperature transmitter TT-103 drifted low, tube rupture leaking HP steam into process.',
      consequence: 'Premature vaporization in liquid line, vapor lock in downstream CSTR feed nozzle, accelerated scaling/coking.',
      safeguards: 'High temperature alarm (TAH-103), steam fail-closed emergency trip valve (XV-101).',
      severity: 3,
      likelihood: 3,
      sil: 'SIL 1',
      recommendations: 'Implement cascade TIC-102 to steam flow controller FIC-102 to eliminate steam supply pressure fluctuations.',
    },
    {
      id: 3,
      node: 'Node 3: CSTR Exothermic Reaction Core R-101',
      parameter: 'Pressure',
      guideWord: 'MORE',
      deviation: 'High internal vessel pressure (> 10.5 bar)',
      cause: 'Cooling jacket supply water valve failure, excessive initiator injection rate, runaway exothermic polymerization reaction.',
      consequence: 'Vessel catastrophic rupture, toxic/flammable atmospheric release, structural damage.',
      safeguards: 'Dual certified ASME Sec VIII pressure safety valves (PSV-101A/B) routed to flare; emergency inhibitor quench injection system.',
      severity: 5,
      likelihood: 1,
      sil: 'SIL 3',
      recommendations: 'Ensure safety relief valve discharge sizing is verified for DIERS two-phase bubbly runaway flow conditions.',
    },
    {
      id: 4,
      node: 'Node 4: Flash Separator Drum V-101',
      parameter: 'Level',
      guideWord: 'MORE',
      deviation: 'High liquid level in flash drum',
      cause: 'Bottom level control valve LCV-102 jammed shut, product discharge pump tripped, sudden feed surge.',
      consequence: 'Liquid carryover into overhead gas line, flare header flooding, destruction of downstream gas compressor.',
      safeguards: 'Independent high-high radar level switch (LAHH-106) with automated feed emergency shutdown interlock (ESD).',
      severity: 4,
      likelihood: 2,
      sil: 'SIL 2',
      recommendations: 'Provide dual diverse level measurement technologies (Guided Wave Radar + Differential Pressure cell) for voting logic.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #091e3a 0%, #0f172a 100%)',
          padding: '24px 28px',
          borderRadius: 12,
          border: '1px solid #1e3a8a',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  padding: '3px 8px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                }}
              >
                Workspace 6 · Industrial Automation
              </span>
              <span style={{ color: '#93c5fd', fontSize: '0.82rem', fontWeight: 600 }}>
                SCADA Historian · PID Loop Tuning · HAZOP & Risk Studio · Digital Twin Hierarchy
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Industrial Digital Twin Centre & Plant Automation
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '8px 0 0', maxWidth: 840, lineHeight: 1.5 }}>
              Bridging academic physics with industrial process control and plant operations. Explore real-time SCADA
              telemetry, dynamic fault injections, feedback PID controller tuning (Ziegler-Nichols & Cohen-Coon), and
              conduct rigorous Process Hazard Analysis (HAZOP) and SIL safety allocations.
            </p>
          </div>

          <div style={{ display: 'inline-flex', background: '#0f172a', padding: 3, borderRadius: 8, border: '1px solid #334155' }}>
            <button
              type="button"
              onClick={() => setActiveTab('scada')}
              style={{
                background: activeTab === 'scada' ? '#0284c7' : 'transparent',
                color: activeTab === 'scada' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Activity size={14} /> SCADA Historian
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pid')}
              style={{
                background: activeTab === 'pid' ? '#0284c7' : 'transparent',
                color: activeTab === 'pid' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Sliders size={14} /> PID Tuning Workbench
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hazop')}
              style={{
                background: activeTab === 'hazop' ? '#0284c7' : 'transparent',
                color: activeTab === 'hazop' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ShieldAlert size={14} /> HAZOP & Safety Studio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hierarchy')}
              style={{
                background: activeTab === 'hierarchy' ? '#0284c7' : 'transparent',
                color: activeTab === 'hierarchy' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ChevronRight size={14} /> Digital Twin Hierarchy
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: SCADA HISTORIAN TREND MONITOR                          */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'scada' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
          {/* Main SCADA Multi-Pen Chart Canvas */}
          <div
            style={{
              background: '#090d16',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                  REAL-TIME SCADA HISTORIAN TREND · LOOP TIC-102 (FEED PREHEATER)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Sampling Rate: 1.0 s · Blue Pen: Process Variable (PV) · Red Pen: Setpoint (SP) · Green Pen: Controller Output % (OP)
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setScadaRunning(!scadaRunning)}
                  style={{
                    background: scadaRunning ? '#d97706' : '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {scadaRunning ? <Pause size={12} /> : <Play size={12} />}
                  {scadaRunning ? 'Pause Stream' : 'Resume'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScadaScenario('normal');
                    setAlarmActive(false);
                    setAlarmMessage('Normal Operation - All Loops Within Envelope');
                  }}
                  style={{
                    background: '#1e293b',
                    color: '#94a3b8',
                    border: '1px solid #334155',
                    padding: '5px 10px',
                    borderRadius: 6,
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>
            </div>

            {/* Industrial Alarm Banner */}
            <div
              style={{
                background: alarmActive ? '#7f1d1d' : '#064e3b',
                color: alarmActive ? '#fecaca' : '#a7f3d0',
                border: alarmActive ? '1px solid #ef4444' : '1px solid #10b981',
                padding: '10px 14px',
                borderRadius: 6,
                fontSize: '0.76rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={16} />
              <span>{alarmMessage}</span>
            </div>

            {/* SVG Multi-Pen Trend Graph */}
            <div
              style={{
                width: '100%',
                height: 280,
                background: '#040711',
                borderRadius: 8,
                border: '1px solid #1e293b',
                position: 'relative',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 700 280">
                {/* Horizontal Grid lines */}
                {[0, 25, 50, 75, 100, 125].map((val) => {
                  const y = 250 - (val / 130) * 220;
                  return (
                    <g key={val}>
                      <line x1="40" y1={y} x2="680" y2={y} stroke="#1e293b" strokeWidth="0.8" />
                      <text x="32" y={y + 3} fill="#64748b" fontSize="9" textAnchor="end">{val}</text>
                    </g>
                  );
                })}

                {/* SP Line (Red dashed line at 75°C) */}
                <line
                  x1="40"
                  y1={250 - (75 / 130) * 220}
                  x2="680"
                  y2={250 - (75 / 130) * 220}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                />

                {/* PV Polyline (Cyan) */}
                {history.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    points={history
                      .map((pt, idx) => {
                        const x = 40 + (idx / (history.length - 1)) * 640;
                        const y = 250 - (Math.min(130, Math.max(0, pt.pv)) / 130) * 220;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                )}

                {/* OP Polyline (Green) */}
                {history.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                    points={history
                      .map((pt, idx) => {
                        const x = 40 + (idx / (history.length - 1)) * 640;
                        const y = 250 - (Math.min(100, Math.max(0, pt.op)) / 130) * 220;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                )}
              </svg>
            </div>

            {/* Live SCADA Telemetry Pill Readouts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div style={{ background: '#0f172a', padding: 12, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>PROCESS VARIABLE (PV)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                  {currentPv.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>°C</span>
                </div>
                <div style={{ fontSize: '0.66rem', color: '#64748b' }}>TIC-102 Process Temperature</div>
              </div>

              <div style={{ background: '#0f172a', padding: 12, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>SETPOINT (SP)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>
                  {currentSp.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>°C</span>
                </div>
                <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Target Recipe Temperature</div>
              </div>

              <div style={{ background: '#0f172a', padding: 12, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>CONTROLLER OUTPUT (OP)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                  {currentOp.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>%</span>
                </div>
                <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Steam Valve Position</div>
              </div>

              <div style={{ background: '#0f172a', padding: 12, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>CONTROL ERROR (e)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: Math.abs(currentSp - currentPv) > 3 ? '#f59e0b' : '#f8fafc' }}>
                  {(currentSp - currentPv).toFixed(2)} <span style={{ fontSize: '0.75rem' }}>°C</span>
                </div>
                <div style={{ fontSize: '0.66rem', color: '#64748b' }}>e(t) = SP - PV</div>
              </div>
            </div>
          </div>

          {/* Right Column: Fault Injection Scenarios */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div>
              <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700 }}>
                INDUSTRIAL PLANT DISTURBANCE SIMULATOR
              </div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 0' }}>
                Inject Operating Faults
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={() => setScadaScenario('normal')}
                style={{
                  background: scadaScenario === 'normal' ? '#0284c7' : '#1e293b',
                  color: '#ffffff',
                  border: '1px solid #334155',
                  padding: '10px 12px',
                  borderRadius: 6,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ fontWeight: 700 }}>Normal Steady State Operation</div>
                <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: 2 }}>
                  Stable closed-loop control under routine process noise.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScadaScenario('pump_cavitation')}
                style={{
                  background: scadaScenario === 'pump_cavitation' ? '#dc2626' : '#1e293b',
                  color: '#ffffff',
                  border: '1px solid #334155',
                  padding: '10px 12px',
                  borderRadius: 6,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} /> Pump Cavitation & Head Loss
                </div>
                <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: 2 }}>
                  Suction pressure collapses below vapor pressure. Severe impeller vibration.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScadaScenario('exchanger_fouling')}
                style={{
                  background: scadaScenario === 'exchanger_fouling' ? '#d97706' : '#1e293b',
                  color: '#ffffff',
                  border: '1px solid #334155',
                  padding: '10px 12px',
                  borderRadius: 6,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ fontWeight: 700 }}>Exchanger Severe Tube Fouling</div>
                <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: 2 }}>
                  Thermal resistance increases, causing steam valve saturation at 100%.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScadaScenario('cstr_runaway')}
                style={{
                  background: scadaScenario === 'cstr_runaway' ? '#dc2626' : '#1e293b',
                  color: '#ffffff',
                  border: '1px solid #334155',
                  padding: '10px 12px',
                  borderRadius: 6,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} /> CSTR Exothermic Thermal Runaway
                </div>
                <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: 2 }}>
                  Cooling jacket failure causes auto-acceleration of reaction rate.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScadaScenario('column_flooding')}
                style={{
                  background: scadaScenario === 'column_flooding' ? '#7c3aed' : '#1e293b',
                  color: '#ffffff',
                  border: '1px solid #334155',
                  padding: '10px 12px',
                  borderRadius: 6,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ fontWeight: 700 }}>Distillation Column Flooding</div>
                <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: 2 }}>
                  Vapor velocity exceeds terminal entrainment limit. DP spikes.
                </div>
              </button>
            </div>

            {/* Link to Protected Modules */}
            {onLaunchSimulation && (
              <div style={{ marginTop: 'auto', background: '#1e293b', padding: 12, borderRadius: 6, fontSize: '0.72rem' }}>
                <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>Physical Twin Integration</div>
                <button
                  type="button"
                  onClick={() => onLaunchSimulation('centrifugal-pump')}
                  style={{
                    width: '100%',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 8px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <ExternalLink size={12} /> Launch 3D Pump Virtual Lab
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: PID CONTROLLER TUNING WORKBENCH                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'pid' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {/* Left Column: Interactive PID Tuning Knobs & Presets */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700 }}>
                FIRST-PRINCIPLES CLOSED-LOOP DYNAMICS
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 0' }}>
                PID Controller Tuning & Step-Response Studio
              </h2>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 4 }}>
                Standard ISA Parallel PID Algorithm: u(t) = K_p · [e(t) + (1/τ_i) ∫ e(t)dt + τ_d · de/dt]
              </div>
            </div>

            {/* Preset Tuning Buttons */}
            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                APPLY CLASSICAL TUNING METHOD:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => applyPidPreset('zn')}
                  style={{
                    background: pidTuningPreset === 'zn' ? '#0284c7' : '#1e293b',
                    color: pidTuningPreset === 'zn' ? '#ffffff' : '#94a3b8',
                    border: '1px solid #334155',
                    padding: '8px 10px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Ziegler-Nichols
                </button>
                <button
                  type="button"
                  onClick={() => applyPidPreset('cc')}
                  style={{
                    background: pidTuningPreset === 'cc' ? '#0284c7' : '#1e293b',
                    color: pidTuningPreset === 'cc' ? '#ffffff' : '#94a3b8',
                    border: '1px solid #334155',
                    padding: '8px 10px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cohen-Coon
                </button>
                <button
                  type="button"
                  onClick={() => applyPidPreset('imc')}
                  style={{
                    background: pidTuningPreset === 'imc' ? '#0284c7' : '#1e293b',
                    color: pidTuningPreset === 'imc' ? '#ffffff' : '#94a3b8',
                    border: '1px solid #334155',
                    padding: '8px 10px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  IMC (Lambda)
                </button>
              </div>
            </div>

            {/* Slider 1: Kp */}
            <div style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                  PROPORTIONAL GAIN (K_p)
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8' }}>{pidKp.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={10.0}
                step={0.1}
                value={pidKp}
                onChange={(e) => {
                  setPidKp(Number(e.target.value));
                  setPidTuningPreset('custom');
                }}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 4 }}>
                Determines raw controller sensitivity. Excessive K_p leads to underdamped oscillations.
              </div>
            </div>

            {/* Slider 2: Ti */}
            <div style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                  INTEGRAL RESET TIME (τ_i)
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34d399' }}>{pidTi.toFixed(1)} s</span>
              </div>
              <input
                type="range"
                min={5.0}
                max={120.0}
                step={2.0}
                value={pidTi}
                onChange={(e) => {
                  setPidTi(Number(e.target.value));
                  setPidTuningPreset('custom');
                }}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 4 }}>
                Eliminates steady-state offset error. Shorter τ_i increases reset speed but risks windup.
              </div>
            </div>

            {/* Slider 3: Td */}
            <div style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                  DERIVATIVE RATE TIME (τ_d)
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b' }}>{pidTd.toFixed(1)} s</span>
              </div>
              <input
                type="range"
                min={0.0}
                max={25.0}
                step={0.5}
                value={pidTd}
                onChange={(e) => {
                  setPidTd(Number(e.target.value));
                  setPidTuningPreset('custom');
                }}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 4 }}>
                Anticipates rate of change; adds artificial damping to suppress excessive overshoot.
              </div>
            </div>

            {/* Step magnitude */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Setpoint Step Magnitude:</span>
              <input
                type="number"
                value={pidStepMagnitude}
                onChange={(e) => setPidStepMagnitude(Number(e.target.value))}
                style={{
                  width: 80,
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: '0.76rem',
                }}
              />
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>°C</span>
            </div>
          </div>

          {/* Right Column: Step-Response Visualization & Key Metrics */}
          <div
            style={{
              background: '#090d16',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                CLOSED-LOOP STEP-RESPONSE DYNAMICS
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Simulated response of FOPTD (First Order Plus Time Delay) thermal process to +{pidStepMagnitude} °C disturbance
              </div>
            </div>

            {/* Step Response SVG */}
            <div
              style={{
                width: '100%',
                height: 240,
                background: '#050811',
                borderRadius: 8,
                border: '1px solid #1e293b',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 500 240">
                {/* Horizontal reference lines */}
                <line x1="40" y1="200" x2="480" y2="200" stroke="#334155" strokeWidth="1" />
                <line x1="40" y1="60" x2="480" y2="60" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3,3" />
                <text x="35" y="64" fill="#ef4444" fontSize="9" textAnchor="end">SP (+{pidStepMagnitude}°)</text>
                <text x="35" y="204" fill="#94a3b8" fontSize="9" textAnchor="end">0°</text>

                {/* S-shaped Step Response Curve with Peak Overshoot */}
                {(() => {
                  const pts: string[] = [];
                  const overshootFraction = Number(simulatedOvershoot) / 100.0;
                  const peakY = 60 - overshootFraction * 70;
                  const tRise = Number(simulatedRiseTime) * 3;
                  for (let t = 0; t <= 100; t += 2) {
                    const x = 40 + t * 4.3;
                    let y = 200;
                    if (t < 10) {
                      y = 200;
                    } else if (t < 10 + tRise) {
                      const fraction = (t - 10) / tRise;
                      y = 200 - fraction * 140;
                    } else if (t < 10 + tRise * 1.8) {
                      const fraction = (t - (10 + tRise)) / (tRise * 0.8);
                      y = 60 - Math.sin(fraction * Math.PI) * (overshootFraction * 70);
                    } else {
                      const decay = Math.exp(-(t - (10 + tRise * 1.8)) / 20);
                      y = 60 - decay * Math.sin((t / 5)) * 10;
                    }
                    pts.push(`${x},${y}`);
                  }
                  return (
                    <>
                      <polyline fill="none" stroke="#38bdf8" strokeWidth="3" points={pts.join(' ')} />
                      {/* Peak marker */}
                      <circle cx={40 + (10 + tRise * 1.4) * 4.3} cy={peakY} r="4" fill="#f59e0b" />
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Control Stability Performance Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <div style={{ background: '#0f172a', padding: 12, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>RISE TIME (t_r)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                  {simulatedRiseTime} <span style={{ fontSize: '0.72rem' }}>s</span>
                </div>
                <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Time to first cross setpoint</div>
              </div>

              <div style={{ background: '#0f172a', padding: 12, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>PERCENT OVERSHOOT (M_p)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: Number(simulatedOvershoot) > 20 ? '#ef4444' : '#10b981' }}>
                  {simulatedOvershoot} <span style={{ fontSize: '0.72rem' }}>%</span>
                </div>
                <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Max transient peak above SP</div>
              </div>

              <div style={{ background: '#0f172a', padding: 12, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>SETTLING TIME (t_s)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
                  {simulatedSettlingTime} <span style={{ fontSize: '0.72rem' }}>s</span>
                </div>
                <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Band tolerance ±2% of SP</div>
              </div>

              <div style={{ background: '#0f172a', padding: 12, borderRadius: 6, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>INTEGRAL OF ABS ERROR (IAE)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a78bfa' }}>
                  {simulatedIae}
                </div>
                <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Cumulative error penalty</div>
              </div>
            </div>

            {/* Practical Tuning Recommendation */}
            <div style={{ background: '#1e293b', padding: 12, borderRadius: 6, fontSize: '0.74rem', color: '#cbd5e1' }}>
              <strong>Engineering Practice Note:</strong> Ziegler-Nichols tuning targets a decay ratio of 1/4 (quarter-wave damping), which produces relatively aggressive overshoot (~25%). In chemical plants, Cohen-Coon or IMC tuning is preferred to minimize thermal cycling and thermal stress on heat exchanger tubes and reactor liners.
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: HAZOP & PROCESS SAFETY STUDIO                          */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'hazop' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
          {/* Main HAZOP Worksheet Table */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700 }}>
                PROCESS HAZARD ANALYSIS (PHA) · IEC 61882 STANDARD
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 0' }}>
                Hazard and Operability (HAZOP) Study Worksheet
              </h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.74rem', borderCollapse: 'collapse', color: '#cbd5e1' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>NODE & PARAMETER</th>
                    <th style={{ padding: '8px 10px' }}>GUIDE WORD</th>
                    <th style={{ padding: '8px 10px' }}>DEVIATION</th>
                    <th style={{ padding: '8px 10px' }}>SEV</th>
                    <th style={{ padding: '8px 10px' }}>LIK</th>
                    <th style={{ padding: '8px 10px' }}>SIL TARGET</th>
                    <th style={{ padding: '8px 10px' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {hazopItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedHazopRow(idx)}
                      style={{
                        borderBottom: '1px solid #1e293b',
                        background: selectedHazopRow === idx ? '#1e3a8a33' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#f8fafc' }}>
                        <div>{item.node}</div>
                        <div style={{ fontSize: '0.68rem', color: '#38bdf8' }}>{item.parameter}</div>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#f59e0b', fontWeight: 800 }}>{item.guideWord}</td>
                      <td style={{ padding: '8px 10px' }}>{item.deviation}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 800, color: '#ef4444' }}>{item.severity}</td>
                      <td style={{ padding: '8px 10px' }}>{item.likelihood}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            background: item.sil === 'SIL 3' ? '#7f1d1d' : '#0284c733',
                            color: item.sil === 'SIL 3' ? '#fca5a5' : '#7dd3fc',
                          }}
                        >
                          {item.sil}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <button
                          type="button"
                          style={{
                            background: '#1e293b',
                            color: '#38bdf8',
                            border: '1px solid #334155',
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontSize: '0.68rem',
                            cursor: 'pointer',
                          }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selected HAZOP Item Details */}
            {(() => {
              const row = hazopItems[selectedHazopRow] || hazopItems[0];
              return (
                <div style={{ background: '#0b1329', padding: 16, borderRadius: 8, border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>
                    DETAILED CAUSE, CONSEQUENCE & SAFEGUARDS BREAKDOWN
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#f8fafc' }}>
                    <strong>Potential Causes:</strong> {row.cause}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#fca5a5' }}>
                    <strong>Process Safety Consequences:</strong> {row.consequence}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#6ee7b7' }}>
                    <strong>Existing Safeguards & Interlocks:</strong> {row.safeguards}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#fed7aa' }}>
                    <strong>HAZOP Team Recommendations:</strong> {row.recommendations}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right Column: 5x5 Risk Matrix & SIL Allocation */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div>
              <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700 }}>
                IEC 61511 FUNCTIONAL SAFETY
              </div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 0' }}>
                5 × 5 Risk Assessment Matrix
              </h2>
            </div>

            {/* 5x5 Risk Grid Visual */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, textAlign: 'center' }}>
              {[
                // S5 row
                { s: 5, l: 1, c: '#d97706', t: 'SIL 2' },
                { s: 5, l: 2, c: '#dc2626', t: 'SIL 3' },
                { s: 5, l: 3, c: '#991b1b', t: 'SIL 3' },
                { s: 5, l: 4, c: '#7f1d1d', t: 'SIL 4' },
                { s: 5, l: 5, c: '#7f1d1d', t: 'SIL 4' },
                // S4 row
                { s: 4, l: 1, c: '#10b981', t: 'SIL 1' },
                { s: 4, l: 2, c: '#d97706', t: 'SIL 2' },
                { s: 4, l: 3, c: '#dc2626', t: 'SIL 3' },
                { s: 4, l: 4, c: '#dc2626', t: 'SIL 3' },
                { s: 4, l: 5, c: '#991b1b', t: 'SIL 4' },
                // S3 row
                { s: 3, l: 1, c: '#10b981', t: 'Low' },
                { s: 3, l: 2, c: '#10b981', t: 'SIL 1' },
                { s: 3, l: 3, c: '#d97706', t: 'SIL 2' },
                { s: 3, l: 4, c: '#d97706', t: 'SIL 2' },
                { s: 3, l: 5, c: '#dc2626', t: 'SIL 3' },
                // S2 row
                { s: 2, l: 1, c: '#059669', t: 'Low' },
                { s: 2, l: 2, c: '#10b981', t: 'Low' },
                { s: 2, l: 3, c: '#10b981', t: 'SIL 1' },
                { s: 2, l: 4, c: '#d97706', t: 'SIL 2' },
                { s: 2, l: 5, c: '#d97706', t: 'SIL 2' },
                // S1 row
                { s: 1, l: 1, c: '#059669', t: 'Low' },
                { s: 1, l: 2, c: '#059669', t: 'Low' },
                { s: 1, l: 3, c: '#10b981', t: 'Low' },
                { s: 1, l: 4, c: '#10b981', t: 'SIL 1' },
                { s: 1, l: 5, c: '#d97706', t: 'SIL 2' },
              ].map((cell, i) => {
                const currentRow = hazopItems[selectedHazopRow] || hazopItems[0];
                const isSelected = currentRow.severity === cell.s && currentRow.likelihood === cell.l;
                return (
                  <div
                    key={i}
                    style={{
                      background: cell.c,
                      color: '#ffffff',
                      padding: '8px 2px',
                      borderRadius: 4,
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      border: isSelected ? '2px solid #ffffff' : 'none',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                      boxShadow: isSelected ? '0 0 10px #ffffff' : 'none',
                    }}
                  >
                    {cell.t}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: '#94a3b8' }}>
              <span>← Likelihood L1 to L5 →</span>
              <span>↑ Severity S1 to S5 ↑</span>
            </div>

            <div style={{ background: '#1e293b', padding: 12, borderRadius: 6, fontSize: '0.72rem', color: '#cbd5e1' }}>
              <strong>Safety Integrity Levels (SIL):</strong>
              <div style={{ marginTop: 4 }}>• <strong>SIL 1:</strong> Risk Reduction Factor 10 – 100</div>
              <div>• <strong>SIL 2:</strong> Risk Reduction Factor 100 – 1,000</div>
              <div>• <strong>SIL 3:</strong> Risk Reduction Factor 1,000 – 10,000</div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: DIGITAL TWIN HIERARCHY MAP                             */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'hierarchy' && (
        <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700 }}>
              INDUSTRIAL 4.0 ARCHITECTURE SPECIFICATION
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 0' }}>
              CHEM-SIM Three-Tier Digital Twin Hierarchy
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: '6px 0 0', maxWidth: 840 }}>
              How micro-physics components interconnect into full plant digital twin simulations.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {/* Level 1: Component Twin */}
            <div style={{ background: '#090d16', borderRadius: 8, border: '1px solid #1e3a8a', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                  LEVEL 1
                </span>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>Component Physics Twins</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Detailed 3D CFD, finite element, and micro-scale physical interactions.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.74rem' }}>
                <div style={{ background: '#1e293b', padding: '6px 10px', borderRadius: 4, color: '#38bdf8' }}>
                  • <strong>Centrifugal Pump Impeller & Volute:</strong> 3D geometry, Euler head, blade curvature, cavitation vapor bubbles.
                </div>
                <div style={{ background: '#1e293b', padding: '6px 10px', borderRadius: 4, color: '#34d399' }}>
                  • <strong>Fluidised Bed Distributor:</strong> Ergun pressure drop, minimum fluidisation velocity, particle bed voidage.
                </div>
              </div>
              {onLaunchSimulation && (
                <button
                  type="button"
                  onClick={() => onLaunchSimulation('centrifugal-pump')}
                  style={{
                    marginTop: 'auto',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <ExternalLink size={14} /> Open Flagship Twin
                </button>
              )}
            </div>

            {/* Level 2: Unit Operation Twin */}
            <div style={{ background: '#090d16', borderRadius: 8, border: '1px solid #1e3a8a', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#2563eb', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                  LEVEL 2
                </span>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>Unit Operation Twins</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Lumped parameter dynamics, phase equilibria, and thermal mass balances.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.74rem' }}>
                <div style={{ background: '#1e293b', padding: '6px 10px', borderRadius: 4, color: '#f59e0b' }}>
                  • <strong>Shell & Tube Exchanger:</strong> Dynamic fouling resistance, LMTD rating, shell-side baffle crossflow.
                </div>
                <div style={{ background: '#1e293b', padding: '6px 10px', borderRadius: 4, color: '#ec4899' }}>
                  • <strong>CSTR & PFR Reactors:</strong> Arrhenius temperature sensitivity, cooling jacket heat dissipation, runaway boundary.
                </div>
                <div style={{ background: '#1e293b', padding: '6px 10px', borderRadius: 4, color: '#a78bfa' }}>
                  • <strong>Distillation Column:</strong> McCabe-Thiele stage-by-stage hydraulic rating, weeping and flooding envelope.
                </div>
              </div>
            </div>

            {/* Level 3: Integrated Plant Twin */}
            <div style={{ background: '#090d16', borderRadius: 8, border: '1px solid #1e3a8a', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#7c3aed', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                  LEVEL 3
                </span>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>Plant Digital Twin</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Plant-wide recycle loops, SCADA historians, emergency shutdown interlocks, and DCS supervisory control.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.74rem' }}>
                <div style={{ background: '#1e293b', padding: '6px 10px', borderRadius: 4, color: '#38bdf8' }}>
                  • <strong>Reaction-Separation-Recycle Complex:</strong> Material recycle snow-ball effect, purge control, plant-wide energy integration.
                </div>
                <div style={{ background: '#1e293b', padding: '6px 10px', borderRadius: 4, color: '#34d399' }}>
                  • <strong>Safety Instrumented Systems (SIS):</strong> 2oo3 voting logic, SIL 2/3 interlocks, automated flare relief routing.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DigitalTwinWorkspace;
