import { useState } from 'react';
import type { PumpPerformancePoint, PumpTelemetry, PumpGeometryData } from '../types';
import { Activity } from 'lucide-react';

interface PumpPerformanceChartProps {
  curves: PumpPerformancePoint[];
  telemetry: PumpTelemetry;
  pump: PumpGeometryData;
}

export function PumpPerformanceChart({
  curves,
  telemetry,
  pump,
}: PumpPerformanceChartProps) {
  const [activeTab, setActiveTab] = useState<'head_sys' | 'efficiency' | 'power' | 'npsh'>('head_sys');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!curves || curves.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
        No performance curve data available.
      </div>
    );
  }

  // Find max bounds for SVG plotting
  const maxFlow = Math.max(...curves.map((p) => p.flow_m3_h), 1.0);
  const maxHead = Math.max(...curves.map((p) => Math.max(p.head_m, p.system_head_m)), 1.0) * 1.15;
  const maxPower = Math.max(...curves.map((p) => p.shaft_power_kw), pump.motor_power_kw) * 1.15;
  const maxNpsh = Math.max(...curves.map((p) => p.npshr_m), telemetry.npsha_m) * 1.25;

  // Chart dimensions
  const svgWidth = 650;
  const svgHeight = 310;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 45;

  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const scaleX = (flow: number) => padLeft + (flow / maxFlow) * plotW;
  const scaleYHead = (head: number) => padTop + plotH - (head / maxHead) * plotH;
  const scaleYEff = (eff: number) => padTop + plotH - (eff / 100.0) * plotH;
  const scaleYPower = (power: number) => padTop + plotH - (power / maxPower) * plotH;
  const scaleYNpsh = (npsh: number) => padTop + plotH - (npsh / maxNpsh) * plotH;

  // Generate SVG path strings
  const pumpHeadPath = curves
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.flow_m3_h)} ${scaleYHead(p.head_m)}`)
    .join(' ');

  const sysHeadPath = curves
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.flow_m3_h)} ${scaleYHead(p.system_head_m)}`)
    .join(' ');

  const effPath = curves
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.flow_m3_h)} ${scaleYEff(p.efficiency_pct)}`)
    .join(' ');

  const shaftPowerPath = curves
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.flow_m3_h)} ${scaleYPower(p.shaft_power_kw)}`)
    .join(' ');

  const hydPowerPath = curves
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.flow_m3_h)} ${scaleYPower(p.hydraulic_power_kw)}`)
    .join(' ');

  const npshrPath = curves
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.flow_m3_h)} ${scaleYNpsh(p.npshr_m)}`)
    .join(' ');

  const operPt = {
    x: scaleX(telemetry.operating_flow_m3_h),
    yHead: scaleYHead(telemetry.operating_head_m),
    yEff: scaleYEff(telemetry.efficiency_pct),
    yPower: scaleYPower(telemetry.shaft_power_kw),
    yNpsh: scaleYNpsh(telemetry.npshr_m),
  };

  const bepPt = {
    x: scaleX(telemetry.bep_flow_m3_h),
    yHead: scaleYHead(telemetry.bep_head_m),
    yEff: scaleYEff(telemetry.bep_efficiency_pct),
  };

  const hoveredPoint = hoverIndex !== null ? curves[hoverIndex] : null;

  return (
    <div className="pump-performance-dashboard" style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 14 }}>
      {/* Top Header & Chart Selection Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={18} color="#38bdf8" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
            Pump Performance Curves & System Characteristics
          </span>
          {telemetry.hi_viscosity_correction_applied && (
            <span style={{ fontSize: '0.7rem', background: '#451a03', color: '#f59e0b', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
              ANSI/HI 9.6.7 Derated
            </span>
          )}
        </div>

        {/* Tab switch buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className={`btn-tag ${activeTab === 'head_sys' ? 'active' : ''}`}
            onClick={() => setActiveTab('head_sys')}
            style={{ fontSize: '0.74rem', padding: '4px 10px' }}
          >
            H vs Q (Operating Point)
          </button>
          <button
            className={`btn-tag ${activeTab === 'efficiency' ? 'active' : ''}`}
            onClick={() => setActiveTab('efficiency')}
            style={{ fontSize: '0.74rem', padding: '4px 10px' }}
          >
            Efficiency (η vs Q)
          </button>
          <button
            className={`btn-tag ${activeTab === 'power' ? 'active' : ''}`}
            onClick={() => setActiveTab('power')}
            style={{ fontSize: '0.74rem', padding: '4px 10px' }}
          >
            Power (P vs Q)
          </button>
          <button
            className={`btn-tag ${activeTab === 'npsh' ? 'active' : ''}`}
            onClick={() => setActiveTab('npsh')}
            style={{ fontSize: '0.74rem', padding: '4px 10px' }}
          >
            NPSH & Cavitation
          </button>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', background: '#090d16', borderRadius: 6, border: '1px solid #1e293b' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
            const y = padTop + frac * plotH;
            return (
              <line
                key={`hgrid-${idx}`}
                x1={padLeft}
                y1={y}
                x2={padLeft + plotW}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="3 3"
              />
            );
          })}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
            const x = padLeft + frac * plotW;
            return (
              <line
                key={`vgrid-${idx}`}
                x1={x}
                y1={padTop}
                x2={x}
                y2={padTop + plotH}
                stroke="#1e293b"
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Coordinate axes */}
          <line x1={padLeft} y1={padTop + plotH} x2={padLeft + plotW} y2={padTop + plotH} stroke="#475569" strokeWidth="1.5" />
          <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#475569" strokeWidth="1.5" />

          {/* X-axis Ticks & Labels (Flow Rate) */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
            const flowVal = frac * maxFlow;
            const x = padLeft + frac * plotW;
            return (
              <g key={`xtick-${idx}`}>
                <line x1={x} y1={padTop + plotH} x2={x} y2={padTop + plotH + 5} stroke="#64748b" />
                <text x={x} y={padTop + plotH + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">
                  {flowVal.toFixed(0)}
                </text>
              </g>
            );
          })}
          <text x={padLeft + plotW / 2} y={svgHeight - 8} fill="#cbd5e1" fontSize="11" textAnchor="middle" fontWeight="600">
            Flow Rate Q (m³/h)
          </text>

          {/* 1. Tab: Head & System Resistance Curve */}
          {activeTab === 'head_sys' && (
            <>
              {/* Y-axis Ticks (Head in m) */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                const headVal = (1.0 - frac) * maxHead;
                const y = padTop + frac * plotH;
                return (
                  <text key={`ytick-head-${idx}`} x={padLeft - 8} y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
                    {headVal.toFixed(0)}
                  </text>
                );
              })}
              <text x={18} y={padTop + plotH / 2} fill="#38bdf8" fontSize="11" textAnchor="middle" transform={`rotate(-90 18 ${padTop + plotH / 2})`} fontWeight="600">
                Developed Head H (m)
              </text>

              {/* Pump Curve */}
              <path d={pumpHeadPath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

              {/* System Curve */}
              <path d={sysHeadPath} fill="none" stroke="#f59e0b" strokeWidth="2.0" strokeDasharray="5 3" />

              {/* BEP Marker */}
              <circle cx={bepPt.x} cy={bepPt.yHead} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              <text x={bepPt.x + 8} y={bepPt.yHead - 6} fill="#10b981" fontSize="10" fontWeight="bold">
                BEP ({telemetry.bep_flow_m3_h} m³/h, {telemetry.bep_head_m}m)
              </text>

              {/* Operating Point Intersection */}
              <circle cx={operPt.x} cy={operPt.yHead} r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
              <text x={operPt.x + 10} y={operPt.yHead + 14} fill="#ef4444" fontSize="11" fontWeight="bold">
                Operating Point: {telemetry.operating_flow_m3_h} m³/h @ {telemetry.operating_head_m}m
              </text>
            </>
          )}

          {/* 2. Tab: Efficiency Curve */}
          {activeTab === 'efficiency' && (
            <>
              {[0, 25, 50, 75, 100].map((effVal, idx) => {
                const y = padTop + plotH - (effVal / 100.0) * plotH;
                return (
                  <text key={`ytick-eff-${idx}`} x={padLeft - 8} y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
                    {effVal}%
                  </text>
                );
              })}
              <text x={18} y={padTop + plotH / 2} fill="#10b981" fontSize="11" textAnchor="middle" transform={`rotate(-90 18 ${padTop + plotH / 2})`} fontWeight="600">
                Pump Efficiency η (%)
              </text>

              <path d={effPath} fill="none" stroke="#10b981" strokeWidth="2.5" />

              {/* Operating Point on Efficiency */}
              <circle cx={operPt.x} cy={operPt.yEff} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <text x={operPt.x + 10} y={operPt.yEff - 6} fill="#10b981" fontSize="11" fontWeight="bold">
                Operating η: {telemetry.efficiency_pct}%
              </text>
            </>
          )}

          {/* 3. Tab: Power Curve */}
          {activeTab === 'power' && (
            <>
              {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                const pVal = (1.0 - frac) * maxPower;
                const y = padTop + frac * plotH;
                return (
                  <text key={`ytick-p-${idx}`} x={padLeft - 8} y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
                    {pVal.toFixed(1)}
                  </text>
                );
              })}
              <text x={18} y={padTop + plotH / 2} fill="#f43f5e" fontSize="11" textAnchor="middle" transform={`rotate(-90 18 ${padTop + plotH / 2})`} fontWeight="600">
                Power (kW)
              </text>

              {/* Motor Rating Limit Line */}
              <line
                x1={padLeft}
                y1={scaleYPower(pump.motor_power_kw)}
                x2={padLeft + plotW}
                y2={scaleYPower(pump.motor_power_kw)}
                stroke="#e11d48"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text x={padLeft + plotW - 6} y={scaleYPower(pump.motor_power_kw) - 4} fill="#e11d48" fontSize="10" textAnchor="end">
                Motor Rating: {pump.motor_power_kw} kW
              </text>

              {/* Shaft Power & Hydraulic Power */}
              <path d={shaftPowerPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" />
              <path d={hydPowerPath} fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 2" />

              <circle cx={operPt.x} cy={operPt.yPower} r="6" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
              <text x={operPt.x + 10} y={operPt.yPower - 6} fill="#f43f5e" fontSize="11" fontWeight="bold">
                Shaft: {telemetry.shaft_power_kw} kW (Hyd: {telemetry.hydraulic_power_kw} kW)
              </text>
            </>
          )}

          {/* 4. Tab: NPSH & Cavitation Curve */}
          {activeTab === 'npsh' && (
            <>
              {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                const npshVal = (1.0 - frac) * maxNpsh;
                const y = padTop + frac * plotH;
                return (
                  <text key={`ytick-npsh-${idx}`} x={padLeft - 8} y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
                    {npshVal.toFixed(1)}
                  </text>
                );
              })}
              <text x={18} y={padTop + plotH / 2} fill="#a855f7" fontSize="11" textAnchor="middle" transform={`rotate(-90 18 ${padTop + plotH / 2})`} fontWeight="600">
                NPSH (m)
              </text>

              {/* Available NPSHa horizontal line */}
              <line
                x1={padLeft}
                y1={scaleYNpsh(telemetry.npsha_m)}
                x2={padLeft + plotW}
                y2={scaleYNpsh(telemetry.npsha_m)}
                stroke="#10b981"
                strokeWidth="2.0"
              />
              <text x={padLeft + 10} y={scaleYNpsh(telemetry.npsha_m) - 6} fill="#10b981" fontSize="10" fontWeight="bold">
                NPSHa (Available) = {telemetry.npsha_m} m
              </text>

              {/* NPSHr curve */}
              <path d={npshrPath} fill="none" stroke="#a855f7" strokeWidth="2.5" />

              {/* Current operating NPSHr */}
              <circle cx={operPt.x} cy={operPt.yNpsh} r="6" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
              <text x={operPt.x + 10} y={operPt.yNpsh + 14} fill="#a855f7" fontSize="10" fontWeight="bold">
                NPSHr = {telemetry.npshr_m} m (Margin: {telemetry.cavitation_margin_m} m)
              </text>
            </>
          )}

          {/* Hover tracker invisible bars */}
          {curves.map((_, idx) => {
            const barW = plotW / curves.length;
            const x = padLeft + idx * barW;
            return (
              <rect
                key={`hoverbar-${idx}`}
                x={x}
                y={padTop}
                width={barW}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(idx)}
                style={{ cursor: 'crosshair' }}
              />
            );
          })}

          {/* Hover Crosshair */}
          {hoveredPoint && (
            <g>
              <line
                x1={scaleX(hoveredPoint.flow_m3_h)}
                y1={padTop}
                x2={scaleX(hoveredPoint.flow_m3_h)}
                y2={padTop + plotH}
                stroke="#94a3b8"
                strokeDasharray="2 2"
              />
            </g>
          )}
        </svg>

        {/* Hover Inspector Tooltip */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 14,
              background: '#0f172aee',
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #334155',
              fontSize: '0.74rem',
              color: '#e2e8f0',
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            <div><strong>Q:</strong> {hoveredPoint.flow_m3_h} m³/h</div>
            <div><strong>H_pump:</strong> {hoveredPoint.head_m} m | <strong>H_sys:</strong> {hoveredPoint.system_head_m} m</div>
            <div><strong>Efficiency:</strong> {hoveredPoint.efficiency_pct}%</div>
            <div><strong>Shaft Power:</strong> {hoveredPoint.shaft_power_kw} kW</div>
            <div><strong>NPSHr:</strong> {hoveredPoint.npshr_m} m</div>
          </div>
        )}
      </div>

      {/* Bottom Performance Metrics Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginTop: 12 }}>
        <div style={{ background: '#1e293b55', padding: '8px 12px', borderRadius: 6, border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>OPERATING FLOW</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8' }}>{telemetry.operating_flow_m3_h} <span style={{ fontSize: '0.7rem' }}>m³/h</span></div>
        </div>

        <div style={{ background: '#1e293b55', padding: '8px 12px', borderRadius: 6, border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>DEVELOPED HEAD</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8' }}>{telemetry.operating_head_m} <span style={{ fontSize: '0.7rem' }}>m</span></div>
        </div>

        <div style={{ background: '#1e293b55', padding: '8px 12px', borderRadius: 6, border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>EFFICIENCY η</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981' }}>{telemetry.efficiency_pct}%</div>
        </div>

        <div style={{ background: '#1e293b55', padding: '8px 12px', borderRadius: 6, border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>SHAFT POWER</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f43f5e' }}>{telemetry.shaft_power_kw} <span style={{ fontSize: '0.7rem' }}>kW</span></div>
        </div>

        <div style={{ background: '#1e293b55', padding: '8px 12px', borderRadius: 6, border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>CAVITATION MARGIN</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: telemetry.is_cavitating ? '#ef4444' : '#34d399' }}>
            {telemetry.cavitation_margin_m > 0 ? `+${telemetry.cavitation_margin_m}` : telemetry.cavitation_margin_m} <span style={{ fontSize: '0.7rem' }}>m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
