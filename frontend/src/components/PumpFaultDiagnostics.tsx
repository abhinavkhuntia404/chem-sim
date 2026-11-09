import { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  Wrench,
  CheckCircle2,
  Activity,
  Volume2,
  Thermometer,
  Droplets,
  RotateCcw,
} from 'lucide-react';
import type { PumpTelemetry, PumpOperatingConditions } from '../types';

interface PumpFaultDiagnosticsProps {
  telemetry: PumpTelemetry;
  conditions: PumpOperatingConditions;
  onUpdateConditions: (newConds: Partial<PumpOperatingConditions>) => void;
}

export function PumpFaultDiagnostics({
  telemetry,
  conditions,
  onUpdateConditions,
}: PumpFaultDiagnosticsProps) {
  const [selectedFaultId, setSelectedFaultId] = useState<string>('cavitation');
  const [maintenanceSuccessMsg, setMaintenanceSuccessMsg] = useState<string | null>(null);

  const faultCatalog = [
    {
      id: 'cavitation',
      title: 'Cavitation & Vapor Inception',
      paramKey: 'fault_cavitation_override',
      currentVal: conditions.fault_cavitation_override || 0,
      description: 'NPSHa drops below NPSHr due to low suction head, elevated liquid temperature, or high flow.',
      symptoms: 'Gravel-rattling noise, cavitation pitting at vane tips, high-frequency vibration, sudden loss of head.',
      rootCause: 'Inadequate Net Positive Suction Head Margin (NPSHa < NPSHr). Fluid vaporizes at blade suction eye.',
      maintenanceAction: 'Increase suction vessel liquid level, cool fluid below boiling point, or open suction throttle valve.',
    },
    {
      id: 'dry_run',
      title: 'Dry Running (Zero Liquid)',
      paramKey: 'fault_dry_run',
      currentVal: conditions.fault_dry_run || 0,
      description: 'Pump energized with no liquid in casing or suction pipe.',
      symptoms: 'Zero flow, rapid overheating of mechanical seal faces (> 180°C), wear ring thermal seizure.',
      rootCause: 'Failure to prime casing before startup, or empty suction vessel.',
      maintenanceAction: 'Perform Emergency Stop; prime casing; inspect and replace scorched silicon carbide seal faces.',
    },
    {
      id: 'suction_clog',
      title: 'Suction Strainer Blockage',
      paramKey: 'fault_suction_clog',
      currentVal: conditions.fault_suction_clog || 0,
      description: 'Foreign debris or scale accumulates on suction basket strainer.',
      symptoms: 'Deep vacuum at suction gauge, massive suction head loss, triggering severe cavitation.',
      rootCause: 'Particulate debris fouling the suction intake screen.',
      maintenanceAction: 'Isolate pump; backflush or manually clean suction basket strainer.',
    },
    {
      id: 'discharge_clog',
      title: 'Discharge Valve Throttled / Shutoff',
      paramKey: 'fault_discharge_clog',
      currentVal: conditions.fault_discharge_clog || 0,
      description: 'Discharge valve fully closed or downstream piping blocked.',
      symptoms: 'Flow drops to zero; pump operates at shutoff head; fluid churns and boils from hydraulic friction.',
      rootCause: 'Discharge isolation valve closed during operation with minimum-flow bypass closed.',
      maintenanceAction: 'Throttle open discharge valve or unblock discharge piping to re-establish flow above minimum thermal flow.',
    },
    {
      id: 'impeller_wear',
      title: 'Impeller Vane Erosion & Wear',
      paramKey: 'fault_impeller_wear',
      currentVal: conditions.fault_impeller_wear || 0,
      description: 'Abrasive slurry particles or cavitation erode impeller vane tips and shrouds.',
      symptoms: 'Progressive loss of developed head (20-35% drop), reduced efficiency, higher motor power required.',
      rootCause: 'Erosive slurry wear or long-term cavitation damage expanding clearances.',
      maintenanceAction: 'Dismantle pump casing; measure tip clearance; dynamically balance and install new impeller.',
    },
    {
      id: 'bearing_defect',
      title: 'Bearing Race Fatigue & Spalling',
      paramKey: 'fault_bearing_defect',
      currentVal: conditions.fault_bearing_defect || 0,
      description: 'L10 fatigue spalling on bearing inner/outer race or lubricant contamination.',
      symptoms: 'Pronounced bearing vibration (> 7.5 mm/s RMS), bearing housing overheating (> 85°C), acoustic screech.',
      rootCause: 'Moisture ingress into oil sump or radial bearing overloading beyond L10 life.',
      maintenanceAction: 'Pull old bearings with bearing puller; flush oil sump; press-fit new 52100 chrome steel bearings.',
    },
    {
      id: 'seal_leakage',
      title: 'Mechanical Seal Face Leakage',
      paramKey: 'fault_seal_leakage',
      currentVal: conditions.fault_seal_leakage || 0,
      description: 'Seal face thermal shock, scoring, or elastomer O-ring chemical hardening.',
      symptoms: 'Visible process liquid dripping or streaming from bearing bracket drain (up to 220 mL/min).',
      rootCause: 'Loss of liquid lubricating film, particulate abrasive scoring, or incompatible elastomer.',
      maintenanceAction: 'Isolate and drain pump; replace mechanical seal cartridge; inspect shaft sleeve for grooving.',
    },
    {
      id: 'misalignment',
      title: 'Shaft Coupling Misalignment',
      paramKey: 'fault_misalignment',
      currentVal: conditions.fault_misalignment || 0,
      description: 'Angular or parallel misalignment between pump shaft and electric motor drive.',
      symptoms: 'Elevated 1X and 2X radial vibration, premature coupling elastomer failure, excessive bearing load.',
      rootCause: 'Thermal pipe strain or poor installation alignment during commissioning.',
      maintenanceAction: 'Use laser alignment tool to adjust motor shims to within 0.05 mm parallel / 0.05° angular tolerance.',
    },
    {
      id: 'gas_entrainment',
      title: 'Gas Entrainment / Air Binding',
      paramKey: 'gas_entrainment_pct',
      currentVal: (conditions.gas_entrainment_pct || 0) / 10.0, // Scale 0-10% to 0-1
      description: 'Air vortexes at suction sump or dissolved gases creating vapor pockets inside impeller eye.',
      symptoms: 'Drastic drop in developed head, erratic flow fluctuations, surging sound.',
      rootCause: 'Low sump submergence depth creating intake surface vortices.',
      maintenanceAction: 'Install anti-vortex baffles in suction tank; vent pump casing air vent valve before startup.',
    },
  ];

  const activeFault = faultCatalog.find((f) => f.id === selectedFaultId) || faultCatalog[0];

  const handleSliderChange = (val: number) => {
    if (activeFault.paramKey === 'gas_entrainment_pct') {
      onUpdateConditions({ gas_entrainment_pct: val * 10.0 });
    } else {
      onUpdateConditions({ [activeFault.paramKey]: val } as any);
    }
  };

  const handleExecuteMaintenance = (actionText: string) => {
    // Reset the specific fault to 0
    if (activeFault.paramKey === 'gas_entrainment_pct') {
      onUpdateConditions({ gas_entrainment_pct: 0.0 });
    } else {
      onUpdateConditions({ [activeFault.paramKey]: 0.0 } as any);
    }
    setMaintenanceSuccessMsg(`Procedure Completed: "${actionText}". Component restored to healthy baseline.`);
    setTimeout(() => setMaintenanceSuccessMsg(null), 4000);
  };

  const handleResetAllFaults = () => {
    onUpdateConditions({
      fault_cavitation_override: 0.0,
      fault_dry_run: 0.0,
      fault_suction_clog: 0.0,
      fault_discharge_clog: 0.0,
      fault_impeller_wear: 0.0,
      fault_bearing_defect: 0.0,
      fault_seal_leakage: 0.0,
      fault_misalignment: 0.0,
      gas_entrainment_pct: 0.0,
      suction_valve_opening_pct: 100.0,
      discharge_valve_opening_pct: 80.0,
    });
    setMaintenanceSuccessMsg('All fault overrides cleared. Pump restored to pristine condition.');
    setTimeout(() => setMaintenanceSuccessMsg(null), 3500);
  };

  // Determine ISO 10816-3 Vibration Severity Zone
  const vibe = telemetry.vibration_velocity_mm_s;
  let vibeZone = 'Zone A (Good)';
  let vibeColor = '#10b981';
  if (vibe >= 7.1) {
    vibeZone = 'Zone D (Trip Danger)';
    vibeColor = '#ef4444';
  } else if (vibe >= 4.5) {
    vibeZone = 'Zone C (Alert)';
    vibeColor = '#f59e0b';
  } else if (vibe >= 2.8) {
    vibeZone = 'Zone B (Acceptable)';
    vibeColor = '#38bdf8';
  }

  return (
    <div className="pump-fault-diagnostics" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header with Global Reset */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '10px 16px', borderRadius: 8, border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={18} color="#f59e0b" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
            Industrial Pump Fault Injection & Predictive Diagnostics
          </span>
        </div>

        <button
          className="btn-tag"
          onClick={handleResetAllFaults}
          style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', padding: '4px 12px' }}
        >
          <RotateCcw size={13} /> Reset All Faults to Healthy
        </button>
      </div>

      {/* Success Notification Banner */}
      {maintenanceSuccessMsg && (
        <div style={{ background: '#064e3b', color: '#a7f3d0', padding: '10px 16px', borderRadius: 6, border: '1px solid #059669', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} />
          {maintenanceSuccessMsg}
        </div>
      )}

      {/* Real-time Diagnostic Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
        {/* Gauge 1: Vibration (ISO 10816-3) */}
        <div style={{ background: '#0f172a', padding: 12, borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>VIBRATION RMS</span>
            <Activity size={15} color={vibeColor} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: vibeColor, marginTop: 4 }}>
            {telemetry.vibration_velocity_mm_s} <span style={{ fontSize: '0.75rem' }}>mm/s</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: vibeColor, fontWeight: 600, marginTop: 2 }}>{vibeZone}</div>
        </div>

        {/* Gauge 2: Acoustic Noise dB(A) */}
        <div style={{ background: '#0f172a', padding: 12, borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ACOUSTIC NOISE</span>
            <Volume2 size={15} color={telemetry.acoustic_noise_db > 85 ? '#ef4444' : '#38bdf8'} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: telemetry.acoustic_noise_db > 85 ? '#ef4444' : '#f8fafc', marginTop: 4 }}>
            {telemetry.acoustic_noise_db} <span style={{ fontSize: '0.75rem' }}>dB(A)</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>
            {telemetry.acoustic_noise_db > 85 ? 'Hearing Protection Req.' : 'Standard Industrial'}
          </div>
        </div>

        {/* Gauge 3: Bearing Housing Temp */}
        <div style={{ background: '#0f172a', padding: 12, borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>BEARING HOUSING</span>
            <Thermometer size={15} color={telemetry.bearing_temp_c > 80 ? '#ef4444' : '#f59e0b'} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: telemetry.bearing_temp_c > 80 ? '#ef4444' : '#f8fafc', marginTop: 4 }}>
            {telemetry.bearing_temp_c} <span style={{ fontSize: '0.75rem' }}>°C</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>Limit: 85°C (L10 Life Guard)</div>
        </div>

        {/* Gauge 4: Seal Face Temp & Leakage */}
        <div style={{ background: '#0f172a', padding: 12, borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>SEAL LEAKAGE</span>
            <Droplets size={15} color={telemetry.seal_leakage_rate_ml_min > 5 ? '#ef4444' : '#10b981'} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: telemetry.seal_leakage_rate_ml_min > 5 ? '#ef4444' : '#f8fafc', marginTop: 4 }}>
            {telemetry.seal_leakage_rate_ml_min} <span style={{ fontSize: '0.75rem' }}>mL/min</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>Face: {telemetry.seal_face_temp_c}°C</div>
        </div>

        {/* Gauge 5: Thermal Rise */}
        <div style={{ background: '#0f172a', padding: 12, borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>FLUID ΔT RISE</span>
            <Flame size={15} color={telemetry.fluid_temp_rise_c > 5 ? '#ef4444' : '#38bdf8'} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: telemetry.fluid_temp_rise_c > 5 ? '#ef4444' : '#f8fafc', marginTop: 4 }}>
            +{telemetry.fluid_temp_rise_c} <span style={{ fontSize: '0.75rem' }}>°C</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>Low-Flow Heating Risk</div>
        </div>
      </div>

      {/* Main Fault Selection & Severity Control Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 14 }}>
        {/* Left Fault Scenarios List */}
        <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', padding: '6px 8px', textTransform: 'uppercase' }}>
            Select Fault Mode
          </div>
          {faultCatalog.map((f) => {
            const isFaulty = f.currentVal > 0.05;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFaultId(f.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: selectedFaultId === f.id ? '#0284c7' : '#1e293b',
                  color: selectedFaultId === f.id ? '#ffffff' : '#cbd5e1',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                }}
              >
                <span>{f.title}</span>
                {isFaulty && (
                  <span style={{ fontSize: '0.68rem', background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Fault Analysis & Severity Slider */}
        <div style={{ background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>{activeFault.title}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>{activeFault.description}</div>
          </div>

          {/* Interactive Severity Slider */}
          <div style={{ background: '#1e293b', padding: '12px 16px', borderRadius: 8, border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>Fault Severity Degree:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: activeFault.currentVal > 0 ? '#ef4444' : '#10b981' }}>
                {Math.round(activeFault.currentVal * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={activeFault.currentVal}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: activeFault.currentVal > 0 ? '#ef4444' : '#38bdf8' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: 4 }}>
              <span>0% (Healthy)</span>
              <span>25% (Incipient)</span>
              <span>50% (Moderate)</span>
              <span>75% (Severe)</span>
              <span>100% (Critical)</span>
            </div>
          </div>

          {/* Root Cause & Diagnostic Analysis */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#1e293b44', padding: 12, borderRadius: 6, border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', marginBottom: 4 }}>Observed Physical Symptoms</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.45 }}>{activeFault.symptoms}</div>
            </div>

            <div style={{ background: '#1e293b44', padding: 12, borderRadius: 6, border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8', marginBottom: 4 }}>Underlying Engineering Cause</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.45 }}>{activeFault.rootCause}</div>
            </div>
          </div>

          {/* Virtual Maintenance Simulator Action */}
          <div style={{ background: '#064e3b22', padding: 14, borderRadius: 8, border: '1px solid #059669', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wrench size={15} /> Corrective Maintenance Action
              </div>
              <div style={{ fontSize: '0.75rem', color: '#a7f3d0', marginTop: 2 }}>{activeFault.maintenanceAction}</div>
            </div>

            <button
              onClick={() => handleExecuteMaintenance(activeFault.maintenanceAction)}
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Execute Repair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

