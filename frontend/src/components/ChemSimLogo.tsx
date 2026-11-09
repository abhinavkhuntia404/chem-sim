interface ChemSimLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export function ChemSimLogo({ size = 28, showWordmark = true, className = '' }: ChemSimLogoProps) {
  return (
    <div
      className={`chemsim-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none',
        userSelect: 'none',
        cursor: 'pointer',
      }}
    >
      {/* Precision Geometric Engineering Crest SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="crestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="streamGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>

        {/* Hexagonal Outer Chamber Outline */}
        <polygon
          points="22,2 40,12 40,32 22,42 4,32 4,12"
          fill="#091325"
          stroke="url(#crestGrad)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Technical Sub-Lattice Grid Lines */}
        <line x1="22" y1="2" x2="22" y2="42" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,2" />
        <line x1="4" y1="22" x2="40" y2="22" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,2" />

        {/* Central Dynamic Impeller / Fluid Vortex Curve */}
        <path
          d="M 12 28 C 16 14, 28 30, 32 16"
          stroke="url(#streamGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Molecular Nodes */}
        <circle cx="12" cy="28" r="3.2" fill="#38bdf8" />
        <circle cx="22" cy="22" r="3.8" fill="#ffffff" />
        <circle cx="32" cy="16" r="3.2" fill="#34d399" />
      </svg>

      {/* Corporate Wordmark Typography */}
      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: size * 0.65,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#f8fafc',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              CHEM<span style={{ color: '#38bdf8' }}>·</span>SIM
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                background: 'rgba(2, 132, 199, 0.2)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                padding: '1px 5px',
                borderRadius: 4,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              v2.0
            </span>
          </div>
          <span
            style={{
              fontSize: '0.64rem',
              fontWeight: 600,
              color: '#94a3b8',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Engineering Dynamics
          </span>
        </div>
      )}
    </div>
  );
}

export default ChemSimLogo;

