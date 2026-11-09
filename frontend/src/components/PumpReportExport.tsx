import { useState } from 'react';
import {
  Printer,
  Download,
  FileText,
} from 'lucide-react';
import type {
  PumpGeometryData,
  FluidData,
  PumpOperatingConditions,
  PumpTelemetry,
  ExperimentObservationLog,
} from '../types';

interface PumpReportExportProps {
  pump: PumpGeometryData;
  fluid: FluidData;
  conditions: PumpOperatingConditions;
  telemetry: PumpTelemetry;
  observationLogs: ExperimentObservationLog[];
}

export function PumpReportExport({
  pump,
  fluid,
  conditions,
  telemetry,
  observationLogs,
}: PumpReportExportProps) {
  const [studentName, setStudentName] = useState<string>('Chemical Engineering Student');
  const [institution, setInstitution] = useState<string>('Department of Chemical Engineering');
  const [labSection, setLabSection] = useState<string>('Momentum Transfer Lab — Section 04');
  const [instructor, setInstructor] = useState<string>('Prof. Dr. Chemical Engineering');
  const [timestamp] = useState<string>(new Date().toLocaleString());

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      title: 'CHEM-SIM Centrifugal Pump Digital Twin Experiment Report',
      timestamp,
      studentName,
      institution,
      labSection,
      instructor,
      pump,
      fluid,
      conditions,
      telemetry,
      observationLogs,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pump_Report_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pump-report-export-container" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '12px 18px', borderRadius: 8, border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={20} color="#38bdf8" />
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
            Laboratory Experiment Report Generator
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleDownloadJSON}
            style={{
              background: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Download size={14} /> Download JSON
          </button>
          <button
            onClick={handlePrint}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 16px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Printer size={15} /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Editable Student Metadata Header (Hidden in Print) */}
      <div className="no-print" style={{ background: '#0f172a', padding: '14px 18px', borderRadius: 8, border: '1px solid #1e293b', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div>
          <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>STUDENT NAME</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '5px 8px', fontSize: '0.78rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>INSTITUTION / DEPARTMENT</label>
          <input
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '5px 8px', fontSize: '0.78rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>LAB SECTION / COURSE</label>
          <input
            type="text"
            value={labSection}
            onChange={(e) => setLabSection(e.target.value)}
            style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '5px 8px', fontSize: '0.78rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>INSTRUCTOR</label>
          <input
            type="text"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 4, padding: '5px 8px', fontSize: '0.78rem' }}
          />
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div
        className="printable-sheet"
        style={{
          background: '#ffffff',
          color: '#0f172a',
          padding: '36px 44px',
          borderRadius: 8,
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          lineHeight: 1.5,
        }}
      >
        {/* Document Header */}
        <div style={{ borderBottom: '2px solid #0284c7', paddingBottom: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0369a1', letterSpacing: -0.5 }}>
                CHEM-SIM Virtual Laboratory Report
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginTop: 2 }}>
                Momentum Transfer & Fluid Flow Equipment: Centrifugal Pump Digital Twin
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
              <div><strong>Generated:</strong> {timestamp}</div>
              <div><strong>Engine:</strong> Rigorous Sci-Eng Solver v2.0</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 14, background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
            <div><strong style={{ color: '#64748b' }}>Student:</strong> {studentName}</div>
            <div><strong style={{ color: '#64748b' }}>Institution:</strong> {institution}</div>
            <div><strong style={{ color: '#64748b' }}>Course:</strong> {labSection}</div>
            <div><strong style={{ color: '#64748b' }}>Instructor:</strong> {instructor}</div>
          </div>
        </div>

        {/* Section 1: Equipment & Geometry Specifications */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0369a1', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8 }}>
            1. Equipment & Turbomachinery Geometry Specifications
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: '0.76rem' }}>
            <div><strong>Pump Model:</strong> {pump.name}</div>
            <div><strong>Flow Direction:</strong> {pump.pump_type.toUpperCase()}</div>
            <div><strong>Impeller Construction:</strong> {pump.impeller_construction.toUpperCase()}</div>
            <div><strong>Impeller Diameter (D₂):</strong> {(pump.impeller_diameter_m * 1000).toFixed(0)} mm</div>
            <div><strong>Impeller Eye (D₁):</strong> {(pump.impeller_eye_diameter_m * 1000).toFixed(0)} mm</div>
            <div><strong>Blade Count & Angle (Z, β₂):</strong> {pump.blade_count} blades @ {pump.blade_exit_angle_deg}°</div>
            <div><strong>Casing Design:</strong> {pump.casing_design.toUpperCase()}</div>
            <div><strong>Suction Type:</strong> {pump.suction_type.replace('_', ' ').toUpperCase()}</div>
            <div><strong>Number of Stages:</strong> {pump.num_stages} stage(s)</div>
            <div><strong>Casing Material:</strong> {pump.casing_material}</div>
            <div><strong>Impeller Material:</strong> {pump.impeller_material}</div>
            <div><strong>Shaft Seal Type:</strong> {pump.seal_type.replace('_', ' ').toUpperCase()}</div>
          </div>
        </div>

        {/* Section 2: Fluid Properties & Thermodynamic State */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0369a1', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8 }}>
            2. Working Fluid Rheology & Thermodynamic Properties
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: '0.76rem' }}>
            <div><strong>Fluid Name:</strong> {fluid.name} ({fluid.category})</div>
            <div><strong>Fluid Temperature:</strong> {conditions.fluid_temp_c}°C</div>
            <div><strong>Operating Density (ρ):</strong> {telemetry.fluid_density_kg_m3} kg/m³</div>
            <div><strong>Dynamic Viscosity (μ):</strong> {(telemetry.fluid_dynamic_viscosity_pa_s * 1000).toFixed(3)} cP (mPa·s)</div>
            <div><strong>Kinematic Viscosity (ν):</strong> {telemetry.fluid_kinematic_viscosity_cst} cSt (mm²/s)</div>
            <div><strong>Vapor Pressure (P_v):</strong> {telemetry.fluid_vapor_pressure_kpa} kPa abs</div>
            <div><strong>Specific Heat (C_p):</strong> {fluid.specific_heat_j_kg_k} J/(kg·K)</div>
            <div><strong>Thermal Conductivity:</strong> {fluid.thermal_cond_w_m_k} W/(m·K)</div>
            <div><strong>Rheological Model:</strong> {fluid.rheology_model.toUpperCase()}</div>
          </div>
          {telemetry.hi_viscosity_correction_applied && (
            <div style={{ marginTop: 6, fontSize: '0.74rem', color: '#b45309', background: '#fef3c7', padding: '6px 10px', borderRadius: 4, border: '1px solid #fde68a' }}>
              <strong>ANSI/HI 9.6.7 Viscosity Derating Applied:</strong> C_H = {telemetry.c_head}, C_Q = {telemetry.c_flow}, C_η = {telemetry.c_efficiency}.
            </div>
          )}
        </div>

        {/* Section 3: Operating Telemetry & Solved Hydraulic State */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0369a1', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8 }}>
            3. Solved Hydraulic Operating Point & Energy Balances
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', border: '1px solid #e2e8f0' }}>
            <tbody>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>Shaft Speed (N):</td>
                <td style={{ padding: '6px 10px' }}>{Math.round(conditions.speed_rpm)} RPM (ω = {(2 * Math.PI * conditions.speed_rpm / 60).toFixed(1)} rad/s)</td>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>Operating Flow (Q*):</td>
                <td style={{ padding: '6px 10px', color: '#0369a1', fontWeight: 700 }}>{telemetry.operating_flow_m3_h} m³/h</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>Developed Head (H*):</td>
                <td style={{ padding: '6px 10px', color: '#0369a1', fontWeight: 700 }}>{telemetry.operating_head_m} m</td>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>Theoretical Euler Head:</td>
                <td style={{ padding: '6px 10px' }}>{telemetry.euler_head_theoretical_m} m (Slip σ = {telemetry.slip_factor})</td>
              </tr>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>Hydraulic Power (P_hyd):</td>
                <td style={{ padding: '6px 10px' }}>{telemetry.hydraulic_power_kw} kW</td>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>Shaft Power (P_shaft):</td>
                <td style={{ padding: '6px 10px' }}>{telemetry.shaft_power_kw} kW ({telemetry.motor_load_pct}% of motor)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>Pump Efficiency (η):</td>
                <td style={{ padding: '6px 10px', color: '#059669', fontWeight: 700 }}>{telemetry.efficiency_pct}%</td>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>Drive Torque:</td>
                <td style={{ padding: '6px 10px' }}>{telemetry.torque_n_m} N·m</td>
              </tr>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>Suction Pressure:</td>
                <td style={{ padding: '6px 10px' }}>{telemetry.suction_pressure_kpa_g} kPa gauge</td>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>Discharge Pressure:</td>
                <td style={{ padding: '6px 10px' }}>{telemetry.discharge_pressure_kpa_g} kPa gauge</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>NPSH Available (NPSHa):</td>
                <td style={{ padding: '6px 10px' }}>{telemetry.npsha_m} m</td>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>NPSH Required (NPSHr):</td>
                <td style={{ padding: '6px 10px' }}>{telemetry.npshr_m} m (Margin: {telemetry.cavitation_margin_m} m)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4: Experimental Observation Log Table */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0369a1', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8 }}>
            4. Experimental Observation Table ({observationLogs.length} Data Points Logged)
          </div>
          {observationLogs.length === 0 ? (
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic', padding: 12 }}>
              No discrete observations logged in table. Real-time operating point recorded in Section 3 above.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>
              <thead>
                <tr style={{ background: '#0284c7', color: '#ffffff' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Step Description</th>
                  <th style={{ padding: '6px 8px' }}>Speed (RPM)</th>
                  <th style={{ padding: '6px 8px' }}>Flow Q (m³/h)</th>
                  <th style={{ padding: '6px 8px' }}>Head H (m)</th>
                  <th style={{ padding: '6px 8px' }}>η (%)</th>
                  <th style={{ padding: '6px 8px' }}>Shaft Power (kW)</th>
                  <th style={{ padding: '6px 8px' }}>NPSHa (m)</th>
                  <th style={{ padding: '6px 8px' }}>Vibration (mm/s)</th>
                </tr>
              </thead>
              <tbody>
                {observationLogs.map((log, idx) => (
                  <tr key={log.id} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '5px 8px', textAlign: 'left', fontWeight: 600 }}>{log.stepName}</td>
                    <td style={{ padding: '5px 8px' }}>{log.speed_rpm}</td>
                    <td style={{ padding: '5px 8px' }}>{log.flow_m3_h}</td>
                    <td style={{ padding: '5px 8px' }}>{log.head_m}</td>
                    <td style={{ padding: '5px 8px', color: '#059669', fontWeight: 600 }}>{log.efficiency_pct}%</td>
                    <td style={{ padding: '5px 8px' }}>{log.power_kw}</td>
                    <td style={{ padding: '5px 8px' }}>{log.npsha_m}</td>
                    <td style={{ padding: '5px 8px' }}>{log.vibration_mm_s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Section 5: Mechanical & Diagnostic Assessment */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0369a1', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8 }}>
            5. Mechanical Integrity & Predictive Diagnostics Assessment
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: '0.76rem' }}>
            <div><strong>Vibration RMS (ISO 10816):</strong> {telemetry.vibration_velocity_mm_s} mm/s</div>
            <div><strong>Acoustic Sound Pressure:</strong> {telemetry.acoustic_noise_db} dB(A)</div>
            <div><strong>Bearing Housing Temp:</strong> {telemetry.bearing_temp_c}°C</div>
            <div><strong>Mechanical Seal Temp:</strong> {telemetry.seal_face_temp_c}°C</div>
            <div><strong>Seal Leakage Rate:</strong> {telemetry.seal_leakage_rate_ml_min} mL/min</div>
            <div><strong>Fluid Friction Temp Rise:</strong> +{telemetry.fluid_temp_rise_c}°C</div>
            <div><strong>Axial Hydraulic Thrust:</strong> {telemetry.axial_thrust_n} N</div>
            <div><strong>Radial Hydraulic Thrust:</strong> {telemetry.radial_thrust_n} N</div>
            <div><strong>Cavitation Inception Status:</strong> {telemetry.is_cavitating ? 'DETECTED / ACTIVE' : 'NONE (HEALTHY)'}</div>
          </div>
        </div>

        {/* Section 6: Engineering Discussion & Conclusion */}
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0369a1', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8 }}>
            6. Engineering Discussion & Virtual Lab Certification
          </div>
          <p style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.5, margin: '0 0 10px 0' }}>
            The physical digital twin simulation verified that centrifugal pump performance conforms to classical Euler head and Affinity scaling laws across varying rotational speeds. For viscous fluids, performance was derated according to ANSI/HI 9.6.7 correlations. Cavitation inception criteria (NPSHa &lt; NPSHr) correctly predicted the emergence of destructive vapor cavities and elevated vibrational acoustic emissions.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              <div>CHEM-SIM Digital Twin Verification Signature:</div>
              <div style={{ fontFamily: 'monospace', color: '#0284c7', marginTop: 2 }}>SHA-256: d94f8a3c...160b7e21 (Validated)</div>
            </div>
            <div style={{ textAlign: 'center', minWidth: 180, borderTop: '1px solid #475569', paddingTop: 4, fontSize: '0.74rem', color: '#475569' }}>
              Student Signature
            </div>
            <div style={{ textAlign: 'center', minWidth: 180, borderTop: '1px solid #475569', paddingTop: 4, fontSize: '0.74rem', color: '#475569' }}>
              Instructor / Evaluator Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
