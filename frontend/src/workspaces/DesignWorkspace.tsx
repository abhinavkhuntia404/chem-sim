import { useState } from 'react';
import {
  Compass,
  FileSpreadsheet,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Copy,
  AlertTriangle,
} from 'lucide-react';

interface DesignWorkspaceProps {
  onLaunchSimulation?: (moduleId: string) => void;
}

interface ProcessNode {
  id: string;
  tag: string;
  name: string;
  type: 'feed' | 'pump' | 'exchanger' | 'reactor' | 'column' | 'valve' | 'tank' | 'separator';
  x: number;
  y: number;
  inletStreams: number[];
  outletStreams: number[];
  specs: Record<string, string | number>;
  instrumentation: string[];
}

interface ProcessStream {
  id: number;
  name: string;
  fromTag: string;
  toTag: string;
  flowKgH: number;
  tempC: number;
  pressBar: number;
  vaporFrac: number;
  enthalpyKjKg: number;
  phase: 'Liquid' | 'Vapor' | 'Two-Phase';
}

export function DesignWorkspace({ onLaunchSimulation }: DesignWorkspaceProps) {
  const [viewMode, setViewMode] = useState<'pfd' | 'pid' | 'datasheet'>('pfd');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('P-101');
  const [selectedDatasheetEq, setSelectedDatasheetEq] = useState<string>('P-101');
  const [feedFlowKgH, setFeedFlowKgH] = useState<number>(5000);
  const [feedTempC, setFeedTempC] = useState<number>(25);
  const [pumpDischargePBar, setPumpDischargePBar] = useState<number>(6.5);
  const [copiedNote, setCopiedNote] = useState<string | null>(null);

  // Dynamic calculations based on feed rate and temperatures
  const pumpFlowM3H = feedFlowKgH / 1000.0;
  const pumpDeltaPBar = Math.max(0.5, pumpDischargePBar - 1.0);
  const pumpHeadM = (pumpDeltaPBar * 1e5) / (1000 * 9.81);
  const pumpHydraulicKw = (pumpFlowM3H * pumpHeadM * 9.81 * 1000) / (3600 * 1000);
  const pumpBrakeKw = pumpHydraulicKw / 0.72;

  // Heat Exchanger duty (heat from 25°C to 85°C with steam)
  const targetExchangerTempC = 85;
  const cpFluid = 3.85; // kJ/kg.K
  const exchangerDutyKw = (feedFlowKgH / 3600) * cpFluid * (targetExchangerTempC - feedTempC);
  const steamLatentHeat = 2100; // kJ/kg
  const steamReqKgH = (exchangerDutyKw * 3600) / steamLatentHeat;

  // Reactor (CSTR) conversion ~ 82%
  const reactorConversionPct = 82.5;
  const productFlowKgH = feedFlowKgH * (reactorConversionPct / 100.0);

  // Process Nodes
  const nodes: ProcessNode[] = [
    {
      id: 'TK-101',
      tag: 'TK-101',
      name: 'Feed Storage Tank',
      type: 'tank',
      x: 60,
      y: 180,
      inletStreams: [],
      outletStreams: [1],
      specs: {
        'Nominal Volume': '50 m³',
        'Material of Construction': 'SS-304',
        'Design Pressure': 'Atmospheric (1.013 bar)',
        'Design Temperature': '50 °C',
      },
      instrumentation: ['LT-101 (Radar Level)', 'LAL-101 (Low Alarm)', 'LAH-101 (High Alarm)'],
    },
    {
      id: 'P-101',
      tag: 'P-101A/B',
      name: 'Centrifugal Feed Pump',
      type: 'pump',
      x: 230,
      y: 180,
      inletStreams: [1],
      outletStreams: [2],
      specs: {
        'Standard': 'API 610 12th Ed / OH2',
        'Capacity': `${pumpFlowM3H.toFixed(1)} m³/h`,
        'Differential Head': `${pumpHeadM.toFixed(1)} m`,
        'Discharge Pressure': `${pumpDischargePBar.toFixed(1)} bar(g)`,
        'Hydraulic Power': `${pumpHydraulicKw.toFixed(2)} kW`,
        'Brake Horsepower': `${pumpBrakeKw.toFixed(2)} kW (motor rated ${Math.ceil(pumpBrakeKw * 1.25)} kW)`,
        'Efficiency': '72.0%',
        'NPSHa / NPSHr': '4.8 m / 2.2 m (Adequate margin)',
      },
      instrumentation: ['PI-101 (Suction Press)', 'PT-102 (Discharge Press)', 'VT-101 (Vibration Sensor)', 'TT-101 (Bearing Temp)'],
    },
    {
      id: 'E-101',
      tag: 'E-101',
      name: 'Shell & Tube Preheater',
      type: 'exchanger',
      x: 420,
      y: 180,
      inletStreams: [2],
      outletStreams: [3],
      specs: {
        'TEMA Type': 'AES (Split-ring floating head)',
        'Heat Duty': `${exchangerDutyKw.toFixed(1)} kW (${(exchangerDutyKw * 0.86).toFixed(0)} Mcal/h)`,
        'Tube Side': `Process fluid (in ${feedTempC} °C, out ${targetExchangerTempC} °C)`,
        'Shell Side': `Low Pressure Steam (150 °C, ${steamReqKgH.toFixed(0)} kg/h)`,
        'Area': '24.5 m²',
        'U-Value': '620 W/(m²·K)',
      },
      instrumentation: ['TIC-102 (Cascade Temp Control)', 'TT-103 (Tube Outlet Temp)', 'TCV-101 (Steam Control Valve)'],
    },
    {
      id: 'R-101',
      tag: 'R-101',
      name: 'CSTR Exothermic Reactor',
      type: 'reactor',
      x: 620,
      y: 180,
      inletStreams: [3],
      outletStreams: [4],
      specs: {
        'Reactor Type': 'Continuous Stirred Tank with Cooling Jacket',
        'Working Volume': '8.2 m³',
        'Operating Temp': '92 °C',
        'Conversion': `${reactorConversionPct}%`,
        'Agitator Type': 'Pitched Blade Turbine (45°)',
        'Motor Power': '7.5 kW with VFD',
        'Safety Valve Setpoint': '10.5 bar(g)',
      },
      instrumentation: ['TIC-104 (Jacket Temp Control)', 'PIC-105 (Reactor Top Press)', 'PSV-101 (Safety Relief Valve)', 'ZT-101 (Agitator Speed)'],
    },
    {
      id: 'V-101',
      tag: 'V-101',
      name: 'Flash Separator Drum',
      type: 'separator',
      x: 820,
      y: 180,
      inletStreams: [4],
      outletStreams: [5, 6],
      specs: {
        'Orientation': 'Vertical with Wire Mesh Demister Pad',
        'Vessel Diameter': '1.2 m',
        'Tan-to-Tan Height': '3.6 m',
        'Liquid Holdup Time': '5.0 min',
        'Top Vapor Offtake': 'Overhead Light Product',
        'Bottom Liquid Offtake': 'Degassed Product to Storage',
      },
      instrumentation: ['LIC-106 (Liquid Level Control)', 'PIC-107 (Overhead Offgas Backpressure)', 'LCV-102 (Bottom Drain Valve)'],
    },
  ];

  const streams: ProcessStream[] = [
    {
      id: 1,
      name: 'Raw Chemical Feed',
      fromTag: 'TK-101',
      toTag: 'P-101',
      flowKgH: feedFlowKgH,
      tempC: feedTempC,
      pressBar: 1.013,
      vaporFrac: 0.0,
      enthalpyKjKg: 104.2,
      phase: 'Liquid',
    },
    {
      id: 2,
      name: 'Pump High-Pressure Discharge',
      fromTag: 'P-101',
      toTag: 'E-101',
      flowKgH: feedFlowKgH,
      tempC: Number((feedTempC + 0.4).toFixed(1)), // minor pump friction dissipation
      pressBar: pumpDischargePBar,
      vaporFrac: 0.0,
      enthalpyKjKg: 106.1,
      phase: 'Liquid',
    },
    {
      id: 3,
      name: 'Preheated Reactor Feed',
      fromTag: 'E-101',
      toTag: 'R-101',
      flowKgH: feedFlowKgH,
      tempC: targetExchangerTempC,
      pressBar: pumpDischargePBar - 0.4, // piping friction loss
      vaporFrac: 0.0,
      enthalpyKjKg: 335.8,
      phase: 'Liquid',
    },
    {
      id: 4,
      name: 'Reactor Reaction Effluent',
      fromTag: 'R-101',
      toTag: 'V-101',
      flowKgH: feedFlowKgH,
      tempC: 92.0,
      pressBar: pumpDischargePBar - 0.8,
      vaporFrac: 0.12,
      enthalpyKjKg: 421.5,
      phase: 'Two-Phase',
    },
    {
      id: 5,
      name: 'Flash Vapor Overhead Light Ends',
      fromTag: 'V-101',
      toTag: 'Flare / Condenser',
      flowKgH: Math.round(feedFlowKgH * 0.12),
      tempC: 91.5,
      pressBar: 2.5,
      vaporFrac: 1.0,
      enthalpyKjKg: 780.2,
      phase: 'Vapor',
    },
    {
      id: 6,
      name: 'Final Product to Storage',
      fromTag: 'V-101',
      toTag: 'TK-201',
      flowKgH: Math.round(productFlowKgH),
      tempC: 90.0,
      pressBar: 2.5,
      vaporFrac: 0.0,
      enthalpyKjKg: 382.4,
      phase: 'Liquid',
    },
  ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[1];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNote('Copied to clipboard');
    setTimeout(() => setCopiedNote(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner & Control Deck */}
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
                Workspace 5 · Process Engineering
              </span>
              <span style={{ color: '#93c5fd', fontSize: '0.82rem', fontWeight: 600 }}>
                PFD · P&ID · Heat & Material Balances · API / TEMA Datasheets
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Process Design Studio & Flowsheeting Canvas
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '8px 0 0', maxWidth: 840, lineHeight: 1.5 }}>
              Interactive chemical engineering flowsheet modeler. Switch seamlessly between Process Flow Diagram (PFD)
              for mass and energy balance exploration, Piping & Instrumentation Diagram (P&ID) for industrial ISA S5.1
              automation and control loops, and generate procurement-ready engineering equipment datasheets.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                background: '#0f172a',
                padding: 3,
                borderRadius: 8,
                border: '1px solid #334155',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('pfd')}
                style={{
                  background: viewMode === 'pfd' ? '#0284c7' : 'transparent',
                  color: viewMode === 'pfd' ? '#ffffff' : '#94a3b8',
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
                <Compass size={14} /> PFD Mode
              </button>
              <button
                type="button"
                onClick={() => setViewMode('pid')}
                style={{
                  background: viewMode === 'pid' ? '#0284c7' : 'transparent',
                  color: viewMode === 'pid' ? '#ffffff' : '#94a3b8',
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
                <Cpu size={14} /> P&ID Mode (ISA S5.1)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('datasheet')}
                style={{
                  background: viewMode === 'datasheet' ? '#0284c7' : 'transparent',
                  color: viewMode === 'datasheet' ? '#ffffff' : '#94a3b8',
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
                <FileSpreadsheet size={14} /> Equipment Datasheets
              </button>
            </div>
          </div>
        </div>

        {/* Global Live Operating Sliders */}
        <div
          style={{
            marginTop: 18,
            padding: '12px 16px',
            background: '#0b1329',
            borderRadius: 8,
            border: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700 }}>
            <Sliders size={16} /> Live Process Controls:
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Plant Feed Flow:</span>
            <input
              type="range"
              min={1000}
              max={15000}
              step={250}
              value={feedFlowKgH}
              onChange={(e) => setFeedFlowKgH(Number(e.target.value))}
              style={{ width: 130 }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', minWidth: 70 }}>
              {feedFlowKgH} kg/h
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Inlet Temperature:</span>
            <input
              type="range"
              min={10}
              max={50}
              step={1}
              value={feedTempC}
              onChange={(e) => setFeedTempC(Number(e.target.value))}
              style={{ width: 100 }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', minWidth: 50 }}>
              {feedTempC} °C
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Pump Target Discharge:</span>
            <input
              type="range"
              min={3.0}
              max={12.0}
              step={0.5}
              value={pumpDischargePBar}
              onChange={(e) => setPumpDischargePBar(Number(e.target.value))}
              style={{ width: 100 }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', minWidth: 60 }}>
              {pumpDischargePBar.toFixed(1)} bar
            </span>
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '0.74rem', color: '#64748b' }}>
            Updated dynamically via First-Principles Balances
          </div>
        </div>
      </div>

      {/* Main Flowsheet Canvas & Inspector Layout */}
      {viewMode !== 'datasheet' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
          {/* Left Canvas: Process Flow / P&ID Diagram */}
          <div
            style={{
              background: '#090d16',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                  {viewMode === 'pfd' ? 'PROCESS FLOW DIAGRAM (PFD) · Continuous Reaction & Separation' : 'PIPING & INSTRUMENTATION DIAGRAM (P&ID) · ISA S5.1 Standard'}
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Click any equipment unit to open engineering specifications
              </span>
            </div>

            {/* SVG Flowsheet Diagram */}
            <div
              style={{
                width: '100%',
                height: 380,
                background: '#050811',
                borderRadius: 8,
                border: '1px solid #1e293b',
                position: 'relative',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 960 380" style={{ display: 'block' }}>
                {/* Background Grid */}
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#131c31" strokeWidth="0.8" />
                  </pattern>
                  <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
                  </marker>
                </defs>
                <rect width="960" height="380" fill="url(#grid)" />

                {/* Connecting Process Pipe Lines with Arrows */}
                {/* Stream 1: TK-101 to P-101 */}
                <path d="M 120 180 L 230 180" stroke="#38bdf8" strokeWidth="3" fill="none" markerEnd="url(#arrow)" />
                <text x="165" y="170" fill="#93c5fd" fontSize="11" fontWeight="700" textAnchor="middle">[1] 5000 kg/h</text>

                {/* Stream 2: P-101 to E-101 */}
                <path d="M 290 180 L 420 180" stroke="#38bdf8" strokeWidth="3" fill="none" markerEnd="url(#arrow)" />
                <text x="350" y="170" fill="#93c5fd" fontSize="11" fontWeight="700" textAnchor="middle">[2] {pumpDischargePBar.toFixed(1)} bar</text>

                {/* Stream 3: E-101 to R-101 */}
                <path d="M 480 180 L 620 180" stroke="#38bdf8" strokeWidth="3" fill="none" markerEnd="url(#arrow)" />
                <text x="550" y="170" fill="#f59e0b" fontSize="11" fontWeight="700" textAnchor="middle">[3] 85 °C</text>

                {/* Stream 4: R-101 to V-101 */}
                <path d="M 680 180 L 820 180" stroke="#38bdf8" strokeWidth="3" fill="none" markerEnd="url(#arrow)" />
                <text x="750" y="170" fill="#93c5fd" fontSize="11" fontWeight="700" textAnchor="middle">[4] 92 °C</text>

                {/* Stream 5: V-101 Overhead */}
                <path d="M 850 140 L 850 60 L 930 60" stroke="#a78bfa" strokeWidth="2.5" fill="none" markerEnd="url(#arrow)" />
                <text x="890" y="50" fill="#c4b5fd" fontSize="11" fontWeight="700">[5] Offgas Vapor</text>

                {/* Stream 6: V-101 Bottoms */}
                <path d="M 850 220 L 850 300 L 930 300" stroke="#34d399" strokeWidth="2.5" fill="none" markerEnd="url(#arrow)" />
                <text x="890" y="290" fill="#6ee7b7" fontSize="11" fontWeight="700">[6] Product</text>

                {/* Equipment 1: TK-101 Feed Tank */}
                <g
                  onClick={() => setSelectedNodeId('TK-101')}
                  style={{ cursor: 'pointer' }}
                  transform="translate(60, 130)"
                >
                  <rect
                    width="60"
                    height="100"
                    rx="12"
                    fill={selectedNodeId === 'TK-101' ? '#1e3a8a' : '#0f172a'}
                    stroke={selectedNodeId === 'TK-101' ? '#60a5fa' : '#334155'}
                    strokeWidth={selectedNodeId === 'TK-101' ? '2.5' : '1.5'}
                  />
                  <line x1="60" y1="35" x2="120" y2="35" stroke="#334155" strokeDasharray="3,3" />
                  <text x="30" y="45" fill="#f8fafc" fontSize="11" fontWeight="800" textAnchor="middle">TK-101</text>
                  <text x="30" y="65" fill="#94a3b8" fontSize="9" textAnchor="middle">Feed Surge</text>
                  <text x="30" y="85" fill="#38bdf8" fontSize="8" textAnchor="middle">50 m³</text>
                  {/* P&ID Instrument: LT-101 */}
                  {viewMode === 'pid' && (
                    <g transform="translate(30, -25)">
                      <circle cx="0" cy="0" r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="-14" y1="0" x2="14" y2="0" stroke="#ffffff" strokeWidth="0.8" />
                      <text x="0" y="-2" fill="#ffffff" fontSize="8" fontWeight="800" textAnchor="middle">LT</text>
                      <text x="0" y="8" fill="#ffffff" fontSize="7" textAnchor="middle">101</text>
                    </g>
                  )}
                </g>

                {/* Equipment 2: P-101 Centrifugal Pump */}
                <g
                  onClick={() => setSelectedNodeId('P-101')}
                  style={{ cursor: 'pointer' }}
                  transform="translate(230, 150)"
                >
                  <circle
                    cx="30"
                    cy="30"
                    r="28"
                    fill={selectedNodeId === 'P-101' ? '#1e3a8a' : '#0f172a'}
                    stroke={selectedNodeId === 'P-101' ? '#60a5fa' : '#334155'}
                    strokeWidth={selectedNodeId === 'P-101' ? '2.5' : '1.5'}
                  />
                  {/* Impeller Blades Representation */}
                  <line x1="30" y1="12" x2="30" y2="48" stroke="#38bdf8" strokeWidth="2" />
                  <line x1="12" y1="30" x2="48" y2="30" stroke="#38bdf8" strokeWidth="2" />
                  <polygon points="30,8 36,2 24,2" fill="#38bdf8" />
                  {/* Tangential discharge nozzle */}
                  <rect x="25" y="0" width="10" height="8" fill="#38bdf8" />
                  <text x="30" y="70" fill="#f8fafc" fontSize="11" fontWeight="800" textAnchor="middle">P-101A/B</text>
                  <text x="30" y="83" fill="#38bdf8" fontSize="8.5" textAnchor="middle">API 610</text>
                  {/* P&ID Instrument: PT-102 */}
                  {viewMode === 'pid' && (
                    <g transform="translate(65, 0)">
                      <circle cx="0" cy="0" r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="-14" y1="0" x2="14" y2="0" stroke="#ffffff" strokeWidth="0.8" />
                      <text x="0" y="-2" fill="#ffffff" fontSize="8" fontWeight="800" textAnchor="middle">PT</text>
                      <text x="0" y="8" fill="#ffffff" fontSize="7" textAnchor="middle">102</text>
                    </g>
                  )}
                </g>

                {/* Equipment 3: E-101 Heat Exchanger */}
                <g
                  onClick={() => setSelectedNodeId('E-101')}
                  style={{ cursor: 'pointer' }}
                  transform="translate(420, 145)"
                >
                  <circle
                    cx="35"
                    cy="35"
                    r="32"
                    fill={selectedNodeId === 'E-101' ? '#1e3a8a' : '#0f172a'}
                    stroke={selectedNodeId === 'E-101' ? '#60a5fa' : '#334155'}
                    strokeWidth={selectedNodeId === 'E-101' ? '2.5' : '1.5'}
                  />
                  {/* Heat Exchanger Baffle / Tube Coil lines */}
                  <path d="M 15 35 Q 25 15, 35 35 T 55 35" stroke="#f59e0b" strokeWidth="2" fill="none" />
                  <text x="35" y="80" fill="#f8fafc" fontSize="11" fontWeight="800" textAnchor="middle">E-101</text>
                  <text x="35" y="93" fill="#f59e0b" fontSize="8.5" textAnchor="middle">Preheater</text>
                  {/* Steam Inflow Pipe */}
                  <path d="M 35 70 L 35 110" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,2" />
                  <text x="35" y="122" fill="#ef4444" fontSize="8" textAnchor="middle">LP Steam</text>
                  {/* P&ID TIC Loop */}
                  {viewMode === 'pid' && (
                    <g transform="translate(35, -20)">
                      <circle cx="0" cy="0" r="14" fill="#d97706" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="-14" y1="0" x2="14" y2="0" stroke="#ffffff" strokeWidth="0.8" />
                      <text x="0" y="-2" fill="#ffffff" fontSize="8" fontWeight="800" textAnchor="middle">TIC</text>
                      <text x="0" y="8" fill="#ffffff" fontSize="7" textAnchor="middle">102</text>
                    </g>
                  )}
                </g>

                {/* Equipment 4: R-101 CSTR Reactor */}
                <g
                  onClick={() => setSelectedNodeId('R-101')}
                  style={{ cursor: 'pointer' }}
                  transform="translate(620, 130)"
                >
                  <rect
                    width="60"
                    height="90"
                    rx="16"
                    fill={selectedNodeId === 'R-101' ? '#1e3a8a' : '#0f172a'}
                    stroke={selectedNodeId === 'R-101' ? '#60a5fa' : '#334155'}
                    strokeWidth={selectedNodeId === 'R-101' ? '2.5' : '1.5'}
                  />
                  {/* Cooling Jacket Outline */}
                  <path d="M -5 15 L -5 80 L 65 80 L 65 15" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,2" fill="none" />
                  {/* Agitator shaft and impeller */}
                  <line x1="30" y1="0" x2="30" y2="65" stroke="#e2e8f0" strokeWidth="2" />
                  <path d="M 18 65 L 42 65" stroke="#e2e8f0" strokeWidth="3" />
                  <circle cx="30" cy="-6" r="6" fill="#334155" />
                  <text x="30" y="40" fill="#f8fafc" fontSize="11" fontWeight="800" textAnchor="middle">R-101</text>
                  <text x="30" y="55" fill="#34d399" fontSize="8.5" textAnchor="middle">CSTR (8.2 m³)</text>
                  {/* P&ID Safety Valve & Temp Control */}
                  {viewMode === 'pid' && (
                    <g transform="translate(65, -15)">
                      <circle cx="0" cy="0" r="14" fill="#dc2626" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="-14" y1="0" x2="14" y2="0" stroke="#ffffff" strokeWidth="0.8" />
                      <text x="0" y="-2" fill="#ffffff" fontSize="7" fontWeight="800" textAnchor="middle">PSV</text>
                      <text x="0" y="8" fill="#ffffff" fontSize="7" textAnchor="middle">101</text>
                    </g>
                  )}
                </g>

                {/* Equipment 5: V-101 Flash Separator */}
                <g
                  onClick={() => setSelectedNodeId('V-101')}
                  style={{ cursor: 'pointer' }}
                  transform="translate(820, 130)"
                >
                  <rect
                    width="55"
                    height="95"
                    rx="14"
                    fill={selectedNodeId === 'V-101' ? '#1e3a8a' : '#0f172a'}
                    stroke={selectedNodeId === 'V-101' ? '#60a5fa' : '#334155'}
                    strokeWidth={selectedNodeId === 'V-101' ? '2.5' : '1.5'}
                  />
                  {/* Demister Pad */}
                  <line x1="5" y1="20" x2="50" y2="20" stroke="#94a3b8" strokeWidth="3" strokeDasharray="2,2" />
                  {/* Liquid Level Line */}
                  <line x1="5" y1="65" x2="50" y2="65" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,3" />
                  <text x="27" y="42" fill="#f8fafc" fontSize="11" fontWeight="800" textAnchor="middle">V-101</text>
                  <text x="27" y="56" fill="#94a3b8" fontSize="8" textAnchor="middle">Flash Drum</text>
                  {/* P&ID Level Control LIC-106 */}
                  {viewMode === 'pid' && (
                    <g transform="translate(27, -25)">
                      <circle cx="0" cy="0" r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="-14" y1="0" x2="14" y2="0" stroke="#ffffff" strokeWidth="0.8" />
                      <text x="0" y="-2" fill="#ffffff" fontSize="8" fontWeight="800" textAnchor="middle">LIC</text>
                      <text x="0" y="8" fill="#ffffff" fontSize="7" textAnchor="middle">106</text>
                    </g>
                  )}
                </g>
              </svg>
            </div>

            {/* Bottom Stream Summary Table */}
            <div style={{ background: '#0b1329', padding: 14, borderRadius: 8, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>HEAT & MATERIAL BALANCES (STREAM TABLE)</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>SI Units · Basis: Continuous 1 hr operation</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.74rem', borderCollapse: 'collapse', color: '#cbd5e1' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                      <th style={{ padding: '6px 8px' }}>STREAM</th>
                      <th style={{ padding: '6px 8px' }}>NAME</th>
                      <th style={{ padding: '6px 8px' }}>FROM → TO</th>
                      <th style={{ padding: '6px 8px' }}>FLOW (kg/h)</th>
                      <th style={{ padding: '6px 8px' }}>TEMP (°C)</th>
                      <th style={{ padding: '6px 8px' }}>PRESS (bar)</th>
                      <th style={{ padding: '6px 8px' }}>VAPOR FRAC</th>
                      <th style={{ padding: '6px 8px' }}>PHASE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {streams.map((st) => (
                      <tr key={st.id} style={{ borderBottom: '1px solid #1e293b77' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 700, color: '#38bdf8' }}>[{st.id}]</td>
                        <td style={{ padding: '6px 8px' }}>{st.name}</td>
                        <td style={{ padding: '6px 8px', color: '#94a3b8' }}>{st.fromTag} → {st.toTag}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{st.flowKgH.toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', color: st.tempC > 50 ? '#f59e0b' : '#38bdf8' }}>{st.tempC}</td>
                        <td style={{ padding: '6px 8px' }}>{st.pressBar.toFixed(2)}</td>
                        <td style={{ padding: '6px 8px' }}>{st.vaporFrac.toFixed(2)}</td>
                        <td style={{ padding: '6px 8px' }}>
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontSize: '0.66rem',
                              background: st.phase === 'Vapor' ? '#7c3aed33' : st.phase === 'Two-Phase' ? '#d9770633' : '#0284c733',
                              color: st.phase === 'Vapor' ? '#c4b5fd' : st.phase === 'Two-Phase' ? '#fcd34d' : '#7dd3fc',
                            }}
                          >
                            {st.phase}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Equipment Property Inspector */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: 10,
              border: '1px solid #1e293b',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  {selectedNode.tag}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>SELECTED EQUIPMENT</span>
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                {selectedNode.name}
              </h2>
            </div>

            {/* Quick Digital Twin Link if Centrifugal Pump */}
            {selectedNode.id === 'P-101' && onLaunchSimulation && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #0c4a6e 0%, #075985 100%)',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #0284c7',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: '#e0f2fe' }}>
                  <ExternalLink size={14} /> Connected Flagship Digital Twin
                </div>
                <div style={{ fontSize: '0.72rem', color: '#bae6fd', lineHeight: 1.4 }}>
                  Launch the interactive 3D centrifugal pump digital twin with impeller anatomy, affinity laws, and cavitation physics.
                </div>
                <button
                  type="button"
                  onClick={() => onLaunchSimulation('centrifugal-pump')}
                  style={{
                    background: '#ffffff',
                    color: '#0369a1',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  Open 3D Digital Twin <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Equipment Mechanical & Process Specs */}
            <div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, marginBottom: 8 }}>
                PROCESS DESIGN SPECIFICATIONS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(selectedNode.specs).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      background: '#1e293b',
                      padding: '8px 10px',
                      borderRadius: 6,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.74rem',
                    }}
                  >
                    <span style={{ color: '#94a3b8' }}>{key}</span>
                    <span style={{ fontWeight: 700, color: '#f8fafc' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instrumentation & Control Loops */}
            <div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, marginBottom: 8 }}>
                P&ID INSTRUMENTATION & INTERLOCKS (ISA S5.1)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedNode.instrumentation.map((inst, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#131c31',
                      border: '1px solid #1e293b',
                      padding: '6px 10px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      color: '#38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8' }} />
                    {inst}
                  </div>
                ))}
              </div>
            </div>

            {/* Switch to Procurement Datasheet */}
            <button
              type="button"
              onClick={() => {
                setSelectedDatasheetEq(selectedNode.id);
                setViewMode('datasheet');
              }}
              style={{
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginTop: 'auto',
              }}
            >
              <FileSpreadsheet size={14} /> Open Full Procurement Datasheet
            </button>
          </div>
        </div>
      ) : (
        /* Procurement Engineering Datasheets View */
        <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
                API 610 / TEMA / ASME SEC VIII PROCUREMENT ENGINEERING SPECIFICATION
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 0' }}>
                Engineering Equipment Datasheet: {selectedDatasheetEq}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {nodes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSelectedDatasheetEq(n.id)}
                  style={{
                    background: selectedDatasheetEq === n.id ? '#0284c7' : '#1e293b',
                    color: selectedDatasheetEq === n.id ? '#ffffff' : '#94a3b8',
                    border: '1px solid #334155',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {n.tag}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleCopy(`API 610 / TEMA Datasheet Specification for ${selectedDatasheetEq}\nGenerated by CHEM-SIM Process Design Studio\nOperating Flow: ${feedFlowKgH} kg/h\nTemperature: ${feedTempC} °C\nHead: ${pumpHeadM.toFixed(1)} m\nPower: ${pumpBrakeKw.toFixed(2)} kW`)}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {copiedNote ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copiedNote || 'Copy Spec Sheet'}
              </button>
            </div>
          </div>

          {/* Formal Printable Datasheet Table */}
          <div
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 6,
              padding: 24,
              fontFamily: 'Inter, system-ui, sans-serif',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header Block */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>CHEM-SIM CHEMICAL ENGINEERING CORP.</div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>Process Design & Equipment Engineering Division</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>EQUIPMENT DATASHEET</div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>TAG: {selectedDatasheetEq} · REV: 0 (Approved for Construction)</div>
              </div>
            </div>

            {/* General Information Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, borderBottom: '1px solid #cbd5e1', paddingBottom: 14, marginBottom: 14, fontSize: '0.78rem' }}>
              <div><strong>Plant Location:</strong> Unit 100 - Petrochemical Complex</div>
              <div><strong>Service:</strong> Chemical Process Stream Feed</div>
              <div><strong>Design Standard:</strong> {selectedDatasheetEq.startsWith('P') ? 'API 610 (OH2 Single Stage)' : selectedDatasheetEq.startsWith('E') ? 'TEMA Class R (Refinery)' : 'ASME Sec VIII Div 1'}</div>
              <div><strong>Applicable Fluid:</strong> Process Hydrocarbon / Water Mix</div>
            </div>

            {/* Operating Data Section */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ background: '#f1f5f9', padding: '4px 8px', fontWeight: 800, fontSize: '0.8rem', borderLeft: '4px solid #0284c7', marginBottom: 8 }}>
                1. OPERATING CONDITIONS & PERFORMANCE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: '0.76rem' }}>
                <div><strong>Operating Flow:</strong> {feedFlowKgH} kg/h ({pumpFlowM3H.toFixed(2)} m³/h)</div>
                <div><strong>Inlet Temperature:</strong> {feedTempC} °C</div>
                <div><strong>Discharge / Outlet Temp:</strong> {selectedDatasheetEq === 'E-101' ? '85.0 °C' : `${feedTempC + 1.2} °C`}</div>
                <div><strong>Suction Pressure:</strong> 1.013 bar(a)</div>
                <div><strong>Discharge Pressure:</strong> {pumpDischargePBar.toFixed(2)} bar(g)</div>
                <div><strong>Total Developed Head:</strong> {pumpHeadM.toFixed(1)} m</div>
                <div><strong>Fluid Density:</strong> 1000 kg/m³</div>
                <div><strong>Fluid Viscosity:</strong> 1.00 cP (0.001 Pa·s)</div>
                <div><strong>Hydraulic Power:</strong> {pumpHydraulicKw.toFixed(2)} kW</div>
              </div>
            </div>

            {/* Mechanical Construction Section */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ background: '#f1f5f9', padding: '4px 8px', fontWeight: 800, fontSize: '0.8rem', borderLeft: '4px solid #0284c7', marginBottom: 8 }}>
                2. MECHANICAL CONSTRUCTION & MATERIALS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: '0.76rem' }}>
                <div><strong>Casing Material:</strong> ASTM A351 CF8M (316 SS)</div>
                <div><strong>Impeller / Rotor Material:</strong> ASTM A351 CF8M (Precision Cast)</div>
                <div><strong>Shaft Material:</strong> AISI 4140 High Tensile Steel</div>
                <div><strong>Shaft Sealing:</strong> API 682 Plan 11 Dual Mechanical Seal</div>
                <div><strong>Bearing Type:</strong> Heavy Duty Radial Ball / Angular Contact Thrust</div>
                <div><strong>Lubrication:</strong> Synthetic Oil Bath with Constant Level Oiler</div>
              </div>
            </div>

            {/* Motor & Driver Data */}
            <div>
              <div style={{ background: '#f1f5f9', padding: '4px 8px', fontWeight: 800, fontSize: '0.8rem', borderLeft: '4px solid #0284c7', marginBottom: 8 }}>
                3. DRIVER & ELECTRICAL SPECIFICATIONS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: '0.76rem' }}>
                <div><strong>Driver Type:</strong> Squirrel Cage Induction Motor (TEFC)</div>
                <div><strong>Rated Motor Power:</strong> {Math.ceil(pumpBrakeKw * 1.25)} kW (25% safety margin)</div>
                <div><strong>Electrical Supply:</strong> 415 V, 3-Phase, 50 Hz</div>
                <div><strong>Synchronous Speed:</strong> 2950 RPM (2 Pole)</div>
                <div><strong>Hazardous Area Rating:</strong> Zone 1, Ex d IIB T4 Gb</div>
                <div><strong>VFD Compatibility:</strong> Fully Rated for Inverter Duty (PWM)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Engineering Design Standards Reference Note */}
      <div
        style={{
          background: '#0b1329',
          padding: '12px 18px',
          borderRadius: 8,
          border: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: '0.74rem',
          color: '#94a3b8',
        }}
      >
        <AlertTriangle size={16} color="#38bdf8" />
        <span>
          <strong>Engineering Design Standards Compliance:</strong> All equipment tags, symbols, line designations, and
          control loops adhere to <em>ANSI/ISA-5.1-2009</em> (Instrumentation Symbols and Identification), <em>API 610 12th Ed.</em> (Centrifugal Pumps for Petroleum, Petrochemical and Natural Gas Industries), and <em>TEMA Standard 10th Ed.</em> (Tubular Exchanger Manufacturers Association).
        </span>
      </div>
    </div>
  );
}

export default DesignWorkspace;

