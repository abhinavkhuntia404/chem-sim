import React, { useState } from 'react';
import type { FluidisationSimulationResult } from './types';

interface ChartProps {
  result: FluidisationSimulationResult;
  currentVelocity: number;
  width?: number;
  height?: number;
}

export const FluidisationChart: React.FC<ChartProps> = ({
  result,
  currentVelocity,
  width = 620,
  height = 420,
}) => {
  const [activeTab, setActiveTab] = useState<'pressure' | 'height'>('pressure');

  const curves = result.characteristic_curves ?? [];
  const u_mf = result.u_mf_design_m_s;
  const u_t = result.terminal_velocity_m_s;

  const margin = { top: 35, right: 35, bottom: 50, left: 65 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Max X (superficial velocity)
  const maxV = Math.max(
    ...curves.map((c) => c.gas_velocity_m_s),
    u_t * 1.05,
    currentVelocity * 1.15,
    0.5
  );

  // Scales
  const scaleX = (v: number) => margin.left + (v / maxV) * plotWidth;

  // Pressure scale
  const maxBedDP = Math.max(
    ...curves.map((c) => c.bed_pressure_drop_Pa),
    result.theoretical_max_bed_dp_Pa * 1.15,
    100
  );
  const scaleYPressure = (p: number) => margin.top + (1 - p / maxBedDP) * plotHeight;

  // Bed Height scale
  const maxHeight = Math.max(
    ...curves.map((c) => c.expanded_bed_height_m),
    result.expanded_bed_height_m * 1.2,
    0.8
  );
  const scaleYHeight = (h: number) => margin.top + (1 - h / maxHeight) * plotHeight;

  // Paths for Pressure Drop
  const bedDpPath = curves
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.gas_velocity_m_s)} ${scaleYPressure(pt.bed_pressure_drop_Pa)}`)
    .join(' ');

  const ergunTheoreticalPath = curves
    .filter((pt) => pt.gas_velocity_m_s <= u_mf * 1.5)
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.gas_velocity_m_s)} ${scaleYPressure(Math.min(maxBedDP, pt.ergun_theoretical_Pa))}`)
    .join(' ');

  // Paths for Bed Height
  const bedHeightPath = curves
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.gas_velocity_m_s)} ${scaleYHeight(pt.expanded_bed_height_m)}`)
    .join(' ');

  // Ticks
  const xTicks = [0, maxV * 0.25, maxV * 0.5, maxV * 0.75, maxV];
  const pTicks = [0, maxBedDP * 0.25, maxBedDP * 0.5, maxBedDP * 0.75, maxBedDP];
  const hTicks = [0, maxHeight * 0.25, maxHeight * 0.5, maxHeight * 0.75, maxHeight];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Chart Selector Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 3, borderRadius: 6 }}>
          <button
            style={{
              padding: '4px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              background: activeTab === 'pressure' ? '#ffffff' : 'transparent',
              color: activeTab === 'pressure' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'pressure' ? 'var(--shadow-sm)' : 'none',
            }}
            onClick={() => setActiveTab('pressure')}
          >
            ΔP vs Velocity (Ergun & Fluidisation)
          </button>
          <button
            style={{
              padding: '4px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              background: activeTab === 'height' ? '#ffffff' : 'transparent',
              color: activeTab === 'height' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'height' ? 'var(--shadow-sm)' : 'none',
            }}
            onClick={() => setActiveTab('height')}
          >
            Bed Height vs Velocity (Expansion)
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.74rem', color: '#475569' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 2.5, background: activeTab === 'pressure' ? '#0284c7' : '#dc2626', display: 'inline-block' }} />
            {activeTab === 'pressure' ? 'Bed ΔP (Experimental)' : 'Expanded Bed Height (H)'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 1.5, background: '#9333ea', borderTop: '1px dashed #9333ea', display: 'inline-block' }} />
            u_mf ({u_mf.toFixed(3)} m/s)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            Operating Point
          </span>
        </div>
      </div>

      {/* SVG Canvas Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto', background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <svg width={width} height={height} style={{ display: 'block' }}>
          {/* Background Grid */}
          {xTicks.map((vt, i) => (
            <g key={`x-grid-${i}`}>
              <line
                x1={scaleX(vt)}
                y1={margin.top}
                x2={scaleX(vt)}
                y2={margin.top + plotHeight}
                stroke="#f1f5f9"
                strokeWidth={1}
              />
              <text
                x={scaleX(vt)}
                y={margin.top + plotHeight + 18}
                textAnchor="middle"
                fontSize={10}
                fontFamily="JetBrains Mono, monospace"
                fill="#64748b"
              >
                {vt.toFixed(2)}
              </text>
            </g>
          ))}

          {activeTab === 'pressure'
            ? pTicks.map((pt, i) => (
                <g key={`p-grid-${i}`}>
                  <line
                    x1={margin.left}
                    y1={scaleYPressure(pt)}
                    x2={margin.left + plotWidth}
                    y2={scaleYPressure(pt)}
                    stroke="#f1f5f9"
                    strokeWidth={1}
                  />
                  <text
                    x={margin.left - 8}
                    y={scaleYPressure(pt) + 3}
                    textAnchor="end"
                    fontSize={10}
                    fontFamily="JetBrains Mono, monospace"
                    fill="#64748b"
                  >
                    {pt.toFixed(0)}
                  </text>
                </g>
              ))
            : hTicks.map((ht, i) => (
                <g key={`h-grid-${i}`}>
                  <line
                    x1={margin.left}
                    y1={scaleYHeight(ht)}
                    x2={margin.left + plotWidth}
                    y2={scaleYHeight(ht)}
                    stroke="#f1f5f9"
                    strokeWidth={1}
                  />
                  <text
                    x={margin.left - 8}
                    y={scaleYHeight(ht) + 3}
                    textAnchor="end"
                    fontSize={10}
                    fontFamily="JetBrains Mono, monospace"
                    fill="#64748b"
                  >
                    {(ht * 100).toFixed(0)} cm
                  </text>
                </g>
              ))}

          {/* Shaded Packed Bed Regime Area */}
          <rect
            x={margin.left}
            y={margin.top}
            width={Math.max(0, scaleX(u_mf) - margin.left)}
            height={plotHeight}
            fill="rgba(241, 245, 249, 0.55)"
          />
          <text
            x={margin.left + (scaleX(u_mf) - margin.left) / 2}
            y={margin.top + 20}
            textAnchor="middle"
            fontSize={9}
            fontWeight={600}
            fill="#94a3b8"
            letterSpacing={0.5}
          >
            FIXED BED REGIME
          </text>

          {/* Shaded Fluidised Bed Area */}
          <text
            x={scaleX(u_mf) + (margin.left + plotWidth - scaleX(u_mf)) / 2}
            y={margin.top + 20}
            textAnchor="middle"
            fontSize={9}
            fontWeight={600}
            fill="#38bdf8"
            letterSpacing={0.5}
          >
            FLUIDISED BED REGIME
          </text>

          {/* Reference Line: Minimum Fluidisation Velocity u_mf */}
          <line
            x1={scaleX(u_mf)}
            y1={margin.top}
            x2={scaleX(u_mf)}
            y2={margin.top + plotHeight}
            stroke="#9333ea"
            strokeWidth={1.8}
            strokeDasharray="4,3"
          />
          <text
            x={scaleX(u_mf) + 5}
            y={margin.top + plotHeight - 12}
            fontSize={10}
            fontFamily="JetBrains Mono, monospace"
            fontWeight={700}
            fill="#9333ea"
          >
            u_mf = {u_mf.toFixed(3)} m/s
          </text>

          {/* Plot Data Lines */}
          {activeTab === 'pressure' ? (
            <>
              {/* Unbound Ergun extrapolation in dotted gray */}
              {ergunTheoreticalPath && (
                <path
                  d={ergunTheoreticalPath}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth={1.5}
                  strokeDasharray="3,3"
                />
              )}

              {/* Theoretical Buoyant Weight Plateau Line */}
              <line
                x1={scaleX(u_mf)}
                y1={scaleYPressure(result.theoretical_max_bed_dp_Pa)}
                x2={margin.left + plotWidth}
                y2={scaleYPressure(result.theoretical_max_bed_dp_Pa)}
                stroke="#60a5fa"
                strokeWidth={1.5}
                strokeDasharray="5,3"
              />
              <text
                x={margin.left + plotWidth - 6}
                y={scaleYPressure(result.theoretical_max_bed_dp_Pa) - 6}
                textAnchor="end"
                fontSize={9}
                fontFamily="JetBrains Mono, monospace"
                fill="#3b82f6"
              >
                ΔP_buoyant = {result.theoretical_max_bed_dp_Pa.toFixed(0)} Pa
              </text>

              {/* Bed Pressure Drop Line */}
              <path
                d={bedDpPath}
                fill="none"
                stroke="#0284c7"
                strokeWidth={2.8}
                strokeLinecap="round"
              />

              {/* Operating Point Indicator */}
              <circle
                cx={scaleX(currentVelocity)}
                cy={scaleYPressure(result.bed_pressure_drop_Pa)}
                r={6}
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth={2}
              />
              <circle
                cx={scaleX(currentVelocity)}
                cy={scaleYPressure(result.bed_pressure_drop_Pa)}
                r={10}
                fill="rgba(245, 158, 11, 0.25)"
              />
            </>
          ) : (
            <>
              {/* Bed Height Curve */}
              <path
                d={bedHeightPath}
                fill="none"
                stroke="#dc2626"
                strokeWidth={2.8}
                strokeLinecap="round"
              />

              {/* Initial Bed Height H0 line */}
              <line
                x1={margin.left}
                y1={scaleYHeight(curves[0]?.expanded_bed_height_m ?? 0.4)}
                x2={margin.left + plotWidth}
                y2={scaleYHeight(curves[0]?.expanded_bed_height_m ?? 0.4)}
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4,3"
              />
              <text
                x={margin.left + plotWidth - 6}
                y={scaleYHeight(curves[0]?.expanded_bed_height_m ?? 0.4) - 6}
                textAnchor="end"
                fontSize={9}
                fontFamily="JetBrains Mono, monospace"
                fill="#64748b"
              >
                H₀ = {((curves[0]?.expanded_bed_height_m ?? 0.4) * 100).toFixed(1)} cm
              </text>

              {/* Operating Point Indicator */}
              <circle
                cx={scaleX(currentVelocity)}
                cy={scaleYHeight(result.expanded_bed_height_m)}
                r={6}
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth={2}
              />
              <circle
                cx={scaleX(currentVelocity)}
                cy={scaleYHeight(result.expanded_bed_height_m)}
                r={10}
                fill="rgba(245, 158, 11, 0.25)"
              />
            </>
          )}

          {/* Axes Lines */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={margin.top + plotHeight}
            stroke="#94a3b8"
            strokeWidth={1.5}
          />
          <line
            x1={margin.left}
            y1={margin.top + plotHeight}
            x2={margin.left + plotWidth}
            y2={margin.top + plotHeight}
            stroke="#94a3b8"
            strokeWidth={1.5}
          />

          {/* Axis Titles */}
          <text
            x={margin.left + plotWidth / 2}
            y={height - 12}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill="#334155"
          >
            Gas Superficial Velocity, u₀ (m/s)
          </text>
          <text
            x={-height / 2}
            y={18}
            transform="rotate(-90)"
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill="#334155"
          >
            {activeTab === 'pressure' ? 'Bed Pressure Drop, ΔP (Pa)' : 'Bed Height, H (m)'}
          </text>
        </svg>
      </div>
    </div>
  );
};
