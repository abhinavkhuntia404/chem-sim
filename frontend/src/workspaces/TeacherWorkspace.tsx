import { useState } from 'react';
import {
  Presentation,
  Share2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Send,
} from 'lucide-react';

interface TeacherWorkspaceProps {
  onLaunchSimulation?: (moduleId: string) => void;
}

interface StudentSubmissionItem {
  id: string;
  studentName: string;
  usn: string;
  assignment: string;
  submissionDate: string;
  simAccuracyScore: number; // /30
  vivaScore: number; // /20
  totalScore: number; // /100
  feedback: string;
  status: 'Reviewed' | 'Pending Review';
}

export function TeacherWorkspace({ onLaunchSimulation }: TeacherWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'presentation' | 'shared' | 'assignments' | 'resources'>('presentation');

  // --- Presentation Mode State ---
  const [highlightedComponent, setHighlightedComponent] = useState<string>('impeller');
  const [showChalkboard, setShowChalkboard] = useState<boolean>(true);

  // Scenario A vs Scenario B Comparison
  const [scenarioASpeed, setScenarioASpeed] = useState<number>(2950);
  const [scenarioAFlow, setScenarioAFlow] = useState<number>(25.0);
  const [scenarioBSpeed, setScenarioBSpeed] = useState<number>(2400);
  const [scenarioBFlow, setScenarioBFlow] = useState<number>(20.3);

  // Scenario A outputs
  const speedRatioA = scenarioASpeed / 2950;
  const headA = Math.max(5, 55.0 * (speedRatioA ** 2) - 0.045 * ((scenarioAFlow / speedRatioA) ** 2));
  const powerA = (scenarioAFlow * headA * 9.80665 * 1000) / (3600 * 1000 * 0.72);

  // Scenario B outputs
  const speedRatioB = scenarioBSpeed / 2950;
  const headB = Math.max(5, 55.0 * (speedRatioB ** 2) - 0.045 * ((scenarioBFlow / speedRatioB) ** 2));
  const powerB = (scenarioBFlow * headB * 9.80665 * 1000) / (3600 * 1000 * 0.72);

  // --- Shared Learning Scenario State ---
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);

  // --- Student Submissions State ---
  const [submissions, setSubmissions] = useState<StudentSubmissionItem[]>([
    {
      id: 'SUB-101',
      studentName: 'Aakash Sharma',
      usn: '1MS22CH001',
      assignment: 'EXP-01: Centrifugal Pump Characteristic Curves',
      submissionDate: '2026-11-06',
      simAccuracyScore: 28,
      vivaScore: 18,
      totalScore: 92,
      feedback: 'Excellent observation logging. Thorough derivation of Euler turbomachinery work.',
      status: 'Reviewed',
    },
    {
      id: 'SUB-102',
      studentName: 'Divya Nair',
      usn: '1MS22CH014',
      assignment: 'EXP-01: Centrifugal Pump Characteristic Curves',
      submissionDate: '2026-11-07',
      simAccuracyScore: 29,
      vivaScore: 19,
      totalScore: 96,
      feedback: 'Outstanding explanation of backward-curved impeller pressure development and NPSHa safety margins.',
      status: 'Reviewed',
    },
    {
      id: 'SUB-103',
      studentName: 'Karthik Rao',
      usn: '1MS22CH027',
      assignment: 'EXP-02: Fluidised Bed Pressure Drop & u_mf',
      submissionDate: '2026-11-08',
      simAccuracyScore: 25,
      vivaScore: 16,
      totalScore: 82,
      feedback: 'Re-verify Ergun equation inertial term calculation at superficial velocity above 0.8 m/s.',
      status: 'Pending Review',
    },
    {
      id: 'SUB-104',
      studentName: 'Abhinav Khuntia',
      usn: '1MS22CH042',
      assignment: 'EXP-03: Shell & Tube Exchanger LMTD Rating',
      submissionDate: '2026-11-09',
      simAccuracyScore: 30,
      vivaScore: 20,
      totalScore: 99,
      feedback: 'Flawless thermal rating. Clear evaluation of asymptotic fouling resistance on U-value.',
      status: 'Reviewed',
    },
  ]);

  const [activeReviewSubId, setActiveReviewSubId] = useState<string>('SUB-103');
  const [newFeedbackText, setNewFeedbackText] = useState<string>('');

  const currentReviewSub = submissions.find((s) => s.id === activeReviewSubId) || submissions[0];

  const handleSaveFeedback = () => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === currentReviewSub.id ? { ...s, feedback: newFeedbackText || s.feedback, status: 'Reviewed' } : s))
    );
    setNewFeedbackText('');
  };

  const handleBroadcast = (scenarioName: string) => {
    setBroadcastMessage(`Live classroom activity "${scenarioName}" broadcast to 64 connected student devices.`);
    setTimeout(() => {
      setBroadcastMessage(null);
    }, 4000);
  };

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
                Teacher Workspace
              </span>
              <span style={{ color: '#93c5fd', fontSize: '0.82rem', fontWeight: 600 }}>
                Live Classroom Presentation · Scenario Comparison · Class Activities · Student Report Review
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Faculty Classroom & Teaching Studio
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '8px 0 0', maxWidth: 840, lineHeight: 1.5 }}>
              Dedicated teaching environment built for chemical engineering faculty and laboratory instructors.
              Deliver interactive projector presentations, demonstrate live parameter changes, broadcast shared class
              activities, and provide qualitative feedback on student virtual laboratory reports.
            </p>
          </div>

          <div style={{ display: 'inline-flex', background: '#0f172a', padding: 3, borderRadius: 8, border: '1px solid #334155' }}>
            <button
              type="button"
              onClick={() => setActiveTab('presentation')}
              style={{
                background: activeTab === 'presentation' ? '#0284c7' : 'transparent',
                color: activeTab === 'presentation' ? '#ffffff' : '#94a3b8',
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
              <Presentation size={14} /> Presentation Mode
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shared')}
              style={{
                background: activeTab === 'shared' ? '#0284c7' : 'transparent',
                color: activeTab === 'shared' ? '#ffffff' : '#94a3b8',
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
              <Share2 size={14} /> Shared Class Activities
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('assignments')}
              style={{
                background: activeTab === 'assignments' ? '#0284c7' : 'transparent',
                color: activeTab === 'assignments' ? '#ffffff' : '#94a3b8',
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
              <Calendar size={14} /> Student Submissions ({submissions.filter((s) => s.status === 'Pending Review').length} Pending)
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: PRESENTATION MODE (CLASSROOM STAGE)                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'presentation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Top Control Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '12px 18px', borderRadius: 8, border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>
                Component Highlighter:
              </span>
              {[
                { id: 'impeller', label: 'Impeller & Blades' },
                { id: 'volute', label: 'Volute Casing' },
                { id: 'seal', label: 'Mechanical Seal' },
                { id: 'wear', label: 'Wear Rings' },
                { id: 'shaft', label: 'Shaft & Bearings' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setHighlightedComponent(btn.id)}
                  style={{
                    background: highlightedComponent === btn.id ? '#0284c7' : '#1e293b',
                    color: highlightedComponent === btn.id ? '#ffffff' : '#94a3b8',
                    border: '1px solid #334155',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowChalkboard(!showChalkboard)}
                style={{
                  background: showChalkboard ? '#047857' : '#1e293b',
                  color: '#ffffff',
                  border: '1px solid #334155',
                  padding: '5px 12px',
                  borderRadius: 4,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {showChalkboard ? 'Hide Chalkboard' : 'Show Chalkboard Derivation'}
              </button>

              {onLaunchSimulation && (
                <button
                  type="button"
                  onClick={() => onLaunchSimulation('centrifugal-pump')}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: 4,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <ExternalLink size={12} /> Launch 3D Apparatus
                </button>
              )}
            </div>
          </div>

          {/* Side-by-Side Dual Scenario Comparison (Scenario A vs Scenario B) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            {/* Scenario A Card */}
            <div style={{ background: '#090d16', borderRadius: 10, border: '1px solid #1e3a8a', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                  SCENARIO A (Baseline)
                </span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Water @ 20°C (ρ = 1000 kg/m³)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#0f172a', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>SPEED (RPM)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>{scenarioASpeed} RPM</div>
                  <input
                    type="range"
                    min={1800}
                    max={3200}
                    step={50}
                    value={scenarioASpeed}
                    onChange={(e) => setScenarioASpeed(Number(e.target.value))}
                    style={{ width: '100%', marginTop: 6 }}
                  />
                </div>

                <div style={{ background: '#0f172a', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>FLOW CAPACITY (Q)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>{scenarioAFlow.toFixed(1)} m³/h</div>
                  <input
                    type="range"
                    min={5.0}
                    max={35.0}
                    step={1.0}
                    value={scenarioAFlow}
                    onChange={(e) => setScenarioAFlow(Number(e.target.value))}
                    style={{ width: '100%', marginTop: 6 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#0f172a', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>DEVELOPED HEAD (H)</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>{headA.toFixed(1)} m</div>
                </div>
                <div style={{ background: '#0f172a', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>BRAKE POWER (P)</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b' }}>{powerA.toFixed(2)} kW</div>
                </div>
              </div>
            </div>

            {/* Scenario B Card */}
            <div style={{ background: '#090d16', borderRadius: 10, border: '1px solid #d97706', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ background: '#d97706', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                  SCENARIO B (VFD Speed Throttled)
                </span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Water @ 20°C (ρ = 1000 kg/m³)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#0f172a', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>SPEED (RPM)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>{scenarioBSpeed} RPM</div>
                  <input
                    type="range"
                    min={1800}
                    max={3200}
                    step={50}
                    value={scenarioBSpeed}
                    onChange={(e) => setScenarioBSpeed(Number(e.target.value))}
                    style={{ width: '100%', marginTop: 6 }}
                  />
                </div>

                <div style={{ background: '#0f172a', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>FLOW CAPACITY (Q)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>{scenarioBFlow.toFixed(1)} m³/h</div>
                  <input
                    type="range"
                    min={5.0}
                    max={35.0}
                    step={1.0}
                    value={scenarioBFlow}
                    onChange={(e) => setScenarioBFlow(Number(e.target.value))}
                    style={{ width: '100%', marginTop: 6 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#0f172a', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>DEVELOPED HEAD (H)</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>{headB.toFixed(1)} m</div>
                </div>
                <div style={{ background: '#0f172a', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>BRAKE POWER (P)</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>{powerB.toFixed(2)} kW</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chalkboard Derivation Sheet */}
          {showChalkboard && (
            <div style={{ background: '#031713', border: '1px solid #064e3b', borderRadius: 10, padding: 20, color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34d399' }}>
                LECTURE CHALKBOARD · AFFINITY LAWS DERIVATION
              </div>
              <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#a7f3d0', lineHeight: 1.6 }}>
                1. Capacity Ratio: Q_B / Q_A = N_B / N_A = {scenarioBSpeed} / {scenarioASpeed} = {(scenarioBSpeed / scenarioASpeed).toFixed(3)}
                <br />
                2. Head Ratio: H_B / H_A = (N_B / N_A)² = {(scenarioBSpeed / scenarioASpeed).toFixed(3)}² = {((scenarioBSpeed / scenarioASpeed) ** 2).toFixed(3)}
                <br />
                3. Power Ratio: P_B / P_A = (N_B / N_A)³ = {(scenarioBSpeed / scenarioASpeed).toFixed(3)}³ = {((scenarioBSpeed / scenarioASpeed) ** 3).toFixed(3)}
                <br />
                <strong>Energy Savings:</strong> {(100 - (powerB / Math.max(0.1, powerA)) * 100).toFixed(1)}% continuous electrical power reduction achieved via speed modulation rather than discharge valve throttling.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: SHARED CLASS ACTIVITIES                                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'shared' && (
        <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800 }}>COLLABORATIVE LEARNING</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0 0' }}>
              Shared Classroom Simulation Activities
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0' }}>
              Broadcast simulation scenarios directly to students' laptops and mobile devices for interactive classroom problem-solving.
            </p>
          </div>

          {broadcastMessage && (
            <div style={{ background: '#064e3b', color: '#a7f3d0', border: '1px solid #10b981', padding: '10px 14px', borderRadius: 6, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={16} /> {broadcastMessage}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              {
                title: 'Activity 1: CSTR Thermal Runaway Hazard & Cooling Limit',
                module: 'reactor',
                description: 'Students modify cooling water flow to an exothermic CSTR to find the critical bifurcation ignition temperature and recommend emergency inhibitor quench setpoints.',
                questions: ['At what cooling water temperature does runaway trigger?', 'How does reactant inlet concentration affect stability?'],
              },
              {
                title: 'Activity 2: Heat Exchanger Fouling vs. Pumping Cost Trade-off',
                module: 'heat-exchanger',
                description: 'Students analyze scale buildup inside tube bundles, calculate the drop in overall heat transfer coefficient (U), and determine when online cleaning becomes economically imperative.',
                questions: ['What is the drop in LMTD?', 'How much extra steam is consumed as U falls by 40%?'],
              },
            ].map((act, i) => (
              <div key={i} style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 8, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>{act.title}</div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.5 }}>{act.description}</div>

                <div style={{ background: '#0f172a', padding: 10, borderRadius: 6, fontSize: '0.72rem', color: '#cbd5e1' }}>
                  <strong>Student Discussion Prompts:</strong>
                  {act.questions.map((q, idx) => (
                    <div key={idx} style={{ marginTop: 2 }}>• {q}</div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleBroadcast(act.title)}
                  style={{
                    marginTop: 'auto',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: 6,
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Send size={14} /> Broadcast to Student Devices
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: STUDENT SUBMISSIONS & FEEDBACK                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'assignments' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18 }}>
          {/* Left Table: Submissions List */}
          <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
              CLASS SUBMISSIONS & VIVA SCORES
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.74rem', borderCollapse: 'collapse', color: '#cbd5e1' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '6px 8px' }}>USN</th>
                    <th style={{ padding: '6px 8px' }}>NAME</th>
                    <th style={{ padding: '6px 8px' }}>ASSIGNMENT</th>
                    <th style={{ padding: '6px 8px' }}>SCORE</th>
                    <th style={{ padding: '6px 8px' }}>STATUS</th>
                    <th style={{ padding: '6px 8px' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr
                      key={sub.id}
                      style={{
                        borderBottom: '1px solid #1e293b',
                        background: activeReviewSubId === sub.id ? '#1e3a8a33' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '8px 8px', fontWeight: 700, color: '#38bdf8' }}>{sub.usn}</td>
                      <td style={{ padding: '8px 8px', color: '#f8fafc' }}>{sub.studentName}</td>
                      <td style={{ padding: '8px 8px' }}>{sub.assignment}</td>
                      <td style={{ padding: '8px 8px', fontWeight: 800, color: '#34d399' }}>{sub.totalScore}/100</td>
                      <td style={{ padding: '8px 8px' }}>
                        <span style={{ background: sub.status === 'Reviewed' ? '#064e3b' : '#7f1d1d', color: sub.status === 'Reviewed' ? '#a7f3d0' : '#fecaca', padding: '1px 6px', borderRadius: 4, fontSize: '0.66rem', fontWeight: 700 }}>
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ padding: '8px 8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReviewSubId(sub.id);
                            setNewFeedbackText(sub.feedback);
                          }}
                          style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '3px 8px', borderRadius: 4, fontSize: '0.68rem', cursor: 'pointer' }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Review & Teacher Feedback Form */}
          <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800 }}>SUBMISSION REVIEW & GRADING</div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                {currentReviewSub.studentName} ({currentReviewSub.usn})
              </h3>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
                {currentReviewSub.assignment}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: '#1e293b', padding: 10, borderRadius: 6 }}>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>SIMULATION PRECISION</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>{currentReviewSub.simAccuracyScore} / 30</div>
              </div>
              <div style={{ background: '#1e293b', padding: 10, borderRadius: 6 }}>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>VIVA VOCE SCORE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>{currentReviewSub.vivaScore} / 20</div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                INSTRUCTOR COMMENTS & ACADEMIC FEEDBACK:
              </label>
              <textarea
                rows={4}
                value={newFeedbackText || currentReviewSub.feedback}
                onChange={(e) => setNewFeedbackText(e.target.value)}
                style={{ width: '100%', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 6, padding: '8px 10px', fontSize: '0.76rem', lineHeight: 1.5 }}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveFeedback}
              style={{
                background: '#047857',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <CheckCircle2 size={14} /> Submit Feedback & Complete Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherWorkspace;
