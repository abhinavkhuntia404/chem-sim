import React, { useState } from 'react';
import type { DistillationSimulationResult } from './types';

interface Props {
  result: DistillationSimulationResult;
  width?: number;
  height?: number;
}

export const McCabeThieleChart: React.FC<Props> = ({
  result,
  width = 620,
  height = 540,
}) => {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  const margin = { top: 30, right: 30, bottom: 50, left: 55 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Scale functions (0 to 1 -> pixel coordinates)
  const scaleX = (x: number) => margin.left + x * plotWidth;
  const scaleY = (y: number) => margin.top + (1 - y) * plotHeight;

  // Equilibrium curve path
  const eqPath = result.equilibrium_curve
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.x)} ${scaleY(pt.y)}`)
    .join(' ');

  // 45 degree line
  const diagPath = `M ${scaleX(0)} ${scaleY(0)} L ${scaleX(1)} ${scaleY(1)}`;

  // Rectifying line
  const rect = result.rectifying_line;
  const rectX1 = result.intersection_x;
  const rectX2 = rect.x_range[1];
  const rectPath = `M ${scaleX(rectX1)} ${scaleY(rect.slope * rectX1 + rect.intercept)} L ${scaleX(rectX2)} ${scaleY(rect.slope * rectX2 + rect.intercept)}`;

  // Stripping line
  const strip = result.stripping_line;
  const stripX1 = strip.x_range[0];
  const stripX2 = result.intersection_x;
  const stripPath = `M ${scaleX(stripX1)} ${scaleY(strip.slope * stripX1 + strip.intercept)} L ${scaleX(stripX2)} ${scaleY(strip.slope * stripX2 + strip.intercept)}`;

  // Stages stairs path
  let stairsPath = '';
  if (result.stages.length > 0) {
    const s0 = result.stages[0];
    // Start at (xD, xD)
    stairsPath = `M ${scaleX(s0.y)} ${scaleY(s0.y)}`;
    for (let i = 0; i < result.stages.length; i++) {
      const stage = result.stages[i];
      // Step horizontally to equilibrium curve (x_n, y_n)
      stairsPath += ` L ${scaleX(stage.x)} ${scaleY(stage.y)}`;
      // Step vertically to operating line (x_n, y_{n+1})
      if (i < result.stages.length - 1) {
        const nextStage = result.stages[i + 1];
        stairsPath += ` L ${scaleX(stage.x)} ${scaleY(nextStage.y)}`;
      }
    }
  }

  // Ticks
  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <svg width={width} height={height} style={{ background: '#ffffff', borderRadius: 8 }}>
        {/* Gridlines */}
        {ticks.map((t) => (
          <g key={`grid-${t}`}>
            <line
              x1={scaleX(t)}
              y1={margin.top}
              x2={scaleX(t)}
              y2={margin.top + plotHeight}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
            <line
              x1={margin.left}
              y1={scaleY(t)}
              x2={margin.left + plotWidth}
              y2={scaleY(t)}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
          </g>
        ))}

        {/* 45° Diagonal */}
        <path d={diagPath} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />

        {/* Equilibrium curve */}
        <path d={eqPath} stroke="#2563eb" strokeWidth={2.5} fill="none" />

        {/* Stripping line */}
        <path d={stripPath} stroke="#e11d48" strokeWidth={2} fill="none" />

        {/* Rectifying line */}
        <path d={rectPath} stroke="#059669" strokeWidth={2} fill="none" />

        {/* q-line */}
        <line
          x1={scaleX(result.intersection_x)}
          y1={scaleY(result.intersection_y)}
          x2={scaleX(0.4)}
          y2={scaleY(0.4)}
          stroke="#d97706"
          strokeWidth={1.8}
          strokeDasharray="3 3"
        />

        {/* Feed / Operating line intersection point */}
        <circle
          cx={scaleX(result.intersection_x)}
          cy={scaleY(result.intersection_y)}
          r={4}
          fill="#d97706"
        />

        {/* Stages stepping line */}
        <path d={stairsPath} stroke="#0f172a" strokeWidth={1.8} fill="none" />

        {/* Stage points on equilibrium curve */}
        {result.stages.map((stage) => {
          const isFeed = stage.stage_number === result.feed_stage;
          const isHovered = hoveredStage === stage.stage_number;
          return (
            <g
              key={`stage-pt-${stage.stage_number}`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredStage(stage.stage_number)}
              onMouseLeave={() => setHoveredStage(null)}
            >
              <circle
                cx={scaleX(stage.x)}
                cy={scaleY(stage.y)}
                r={isHovered ? 6 : isFeed ? 5 : 3.5}
                fill={isFeed ? '#f59e0b' : '#0f172a'}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
              <text
                x={scaleX(stage.x) - 7}
                y={scaleY(stage.y) - 7}
                fontSize={10}
                fontWeight="600"
                fontFamily="var(--font-mono)"
                fill={isFeed ? '#b45309' : '#475569'}
              >
                {stage.stage_number}
              </text>
            </g>
          );
        })}

        {/* Axis borders */}
        <line
          x1={margin.left}
          y1={margin.top + plotHeight}
          x2={margin.left + plotWidth}
          y2={margin.top + plotHeight}
          stroke="#334155"
          strokeWidth={1.5}
        />
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + plotHeight}
          stroke="#334155"
          strokeWidth={1.5}
        />

        {/* Ticks and Labels */}
        {ticks.map((t) => (
          <g key={`tick-${t}`}>
            <line
              x1={scaleX(t)}
              y1={margin.top + plotHeight}
              x2={scaleX(t)}
              y2={margin.top + plotHeight + 5}
              stroke="#334155"
              strokeWidth={1}
            />
            <text
              x={scaleX(t)}
              y={margin.top + plotHeight + 18}
              fontSize={11}
              fontFamily="var(--font-mono)"
              fill="#64748b"
              textAnchor="middle"
            >
              {t.toFixed(1)}
            </text>

            <line
              x1={margin.left - 5}
              y1={scaleY(t)}
              x2={margin.left}
              y2={scaleY(t)}
              stroke="#334155"
              strokeWidth={1}
            />
            <text
              x={margin.left - 10}
              y={scaleY(t) + 4}
              fontSize={11}
              fontFamily="var(--font-mono)"
              fill="#64748b"
              textAnchor="end"
            >
              {t.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Axis Titles */}
        <text
          x={margin.left + plotWidth / 2}
          y={height - 12}
          fontSize={12}
          fontWeight="600"
          fill="#1e293b"
          textAnchor="middle"
        >
          Liquid Mole Fraction, x (Light Component)
        </text>

        <text
          x={16}
          y={margin.top + plotHeight / 2}
          fontSize={12}
          fontWeight="600"
          fill="#1e293b"
          textAnchor="middle"
          transform={`rotate(-90 16 ${margin.top + plotHeight / 2})`}
        >
          Vapor Mole Fraction, y (Light Component)
        </text>
      </svg>

      {/* Legend & Hover Card */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 10,
          fontSize: '0.78rem',
          color: '#475569',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 14, height: 3, background: '#2563eb', display: 'inline-block' }} />
          Equilibrium Curve
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 14, height: 2, background: '#059669', display: 'inline-block' }} />
          Rectifying OL
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 14, height: 2, background: '#e11d48', display: 'inline-block' }} />
          Stripping OL
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 14, height: 2, background: '#d97706', display: 'inline-block' }} />
          q-Line
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 14, height: 2, borderBottom: '2px dashed #94a3b8', display: 'inline-block' }} />
          y = x
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
          Feed Stage ({result.feed_stage})
        </span>
      </div>

      {hoveredStage !== null && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(15, 23, 42, 0.92)',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
          }}
        >
          {(() => {
            const s = result.stages.find((st) => st.stage_number === hoveredStage);
            if (!s) return null;
            return (
              <div>
                <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: 2 }}>
                  Stage {s.stage_number} ({s.section})
                </div>
                <div>x = {s.x.toFixed(4)}</div>
                <div>y = {s.y.toFixed(4)}</div>
                <div>T = {s.T_C.toFixed(1)} °C</div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
