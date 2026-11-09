import { useState } from 'react';
import {
  GraduationCap,
  Users,
  Award,
  CheckCircle2,
  Download,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface FacultyWorkspaceProps {
  onLaunchSimulation?: (moduleId: string) => void;
}

interface CoMapping {
  coNumber: string;
  statement: string;
  bloomLevel: 'L2 (Understand)' | 'L3 (Apply)' | 'L4 (Analyze)' | 'L5 (Evaluate)';
  mappedPos: string[];
  targetAttainmentPct: number;
  actualAttainmentPct: number;
}

interface StudentSubmission {
  id: string;
  usn: string;
  name: string;
  assignment: string;
  submissionDate: string;
  status: 'Graded' | 'Pending Review' | 'Submitted';
  vivaScore: number; // out of 20
  simAccuracyScore: number; // out of 30
  reportScore: number; // out of 50
  totalScore: number; // out of 100
}

export function FacultyWorkspace({ onLaunchSimulation }: FacultyWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'obe-matrix' | 'cohorts' | 'assignments' | 'analytics'>('obe-matrix');
  const [selectedCourse, setSelectedCourse] = useState<string>('21CH32');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // NBA CO-PO Mapping Matrix
  const coMappings: CoMapping[] = [
    {
      coNumber: 'CO1',
      statement: 'Understand the fundamental principles of fluid statics, kinematics, and Bernoulli energy conservation in piping networks.',
      bloomLevel: 'L2 (Understand)',
      mappedPos: ['PO1', 'PO2'],
      targetAttainmentPct: 75,
      actualAttainmentPct: 82,
    },
    {
      coNumber: 'CO2',
      statement: 'Apply Euler turbomachinery equation and affinity laws to size industrial centrifugal pumps and determine NPSHa margins.',
      bloomLevel: 'L3 (Apply)',
      mappedPos: ['PO1', 'PO2', 'PO3', 'PSO1'],
      targetAttainmentPct: 70,
      actualAttainmentPct: 78,
    },
    {
      coNumber: 'CO3',
      statement: 'Analyze minimum fluidisation velocity and pressure drop across packed and fluidised beds using Ergun correlation.',
      bloomLevel: 'L4 (Analyze)',
      mappedPos: ['PO2', 'PO4', 'PSO1'],
      targetAttainmentPct: 70,
      actualAttainmentPct: 74,
    },
    {
      coNumber: 'CO4',
      statement: 'Evaluate heat exchanger rating, LMTD correction factors, and overall heat transfer coefficients under tube fouling conditions.',
      bloomLevel: 'L5 (Evaluate)',
      mappedPos: ['PO3', 'PO4', 'PO5'],
      targetAttainmentPct: 65,
      actualAttainmentPct: 71,
    },
    {
      coNumber: 'CO5',
      statement: 'Formulate HAZOP risk matrices and assign Safety Integrity Levels (SIL) to hazardous chemical process units.',
      bloomLevel: 'L4 (Analyze)',
      mappedPos: ['PO6', 'PO8', 'PSO2'],
      targetAttainmentPct: 75,
      actualAttainmentPct: 86,
    },
  ];

  // Student Submissions Dataset
  const submissions: StudentSubmission[] = [
    {
      id: 'SUB-101',
      usn: '1MS22CH001',
      name: 'Aakash Sharma',
      assignment: 'LAB-EXP 01: Centrifugal Pump Characteristic Curves',
      submissionDate: '2026-11-04',
      status: 'Graded',
      vivaScore: 18,
      simAccuracyScore: 28,
      reportScore: 46,
      totalScore: 92,
    },
    {
      id: 'SUB-102',
      usn: '1MS22CH014',
      name: 'Divya Nair',
      assignment: 'LAB-EXP 01: Centrifugal Pump Characteristic Curves',
      submissionDate: '2026-11-05',
      status: 'Graded',
      vivaScore: 19,
      simAccuracyScore: 29,
      reportScore: 48,
      totalScore: 96,
    },
    {
      id: 'SUB-103',
      usn: '1MS22CH027',
      name: 'Karthik Rao',
      assignment: 'LAB-EXP 02: Fluidised Bed Pressure Drop & U_mf',
      submissionDate: '2026-11-07',
      status: 'Pending Review',
      vivaScore: 16,
      simAccuracyScore: 26,
      reportScore: 42,
      totalScore: 84,
    },
    {
      id: 'SUB-104',
      usn: '1MS22CH038',
      name: 'Neha Kulkarni',
      assignment: 'LAB-EXP 01: Centrifugal Pump Characteristic Curves',
      submissionDate: '2026-11-08',
      status: 'Graded',
      vivaScore: 17,
      simAccuracyScore: 27,
      reportScore: 45,
      totalScore: 89,
    },
    {
      id: 'SUB-105',
      usn: '1MS22CH042',
      name: 'Abhinav Khuntia',
      assignment: 'LAB-EXP 03: Heat Exchanger LMTD & Fouling Analysis',
      submissionDate: '2026-11-09',
      status: 'Graded',
      vivaScore: 20,
      simAccuracyScore: 30,
      reportScore: 49,
      totalScore: 99,
    },
  ];

  const handleExportNbaReport = () => {
    setDownloadSuccess('NBA Accreditation Evidence Dossier Generated (CSV/PDF Ready)');
    setTimeout(() => setDownloadSuccess(null), 3000);
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
                Workspace 9 · Institutional & Faculty
              </span>
              <span style={{ color: '#93c5fd', fontSize: '0.82rem', fontWeight: 600 }}>
                NBA / ABET OBE Accreditation · CO-PO Mapping · Cohort Manager · Viva Evaluation
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Faculty & Departmental Management Portal
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '8px 0 0', maxWidth: 840, lineHeight: 1.5 }}>
              Institutional control deck for chemical engineering professors, HODs, and laboratory instructors. Manage
              accreditation matrices (NBA Criteria 2 & 3), assign virtual laboratory experiments, grade student simulation
              telemetry, and track departmental attainment metrics.
            </p>
          </div>

          <div style={{ display: 'inline-flex', background: '#0f172a', padding: 3, borderRadius: 8, border: '1px solid #334155' }}>
            <button
              type="button"
              onClick={() => setActiveTab('obe-matrix')}
              style={{
                background: activeTab === 'obe-matrix' ? '#0284c7' : 'transparent',
                color: activeTab === 'obe-matrix' ? '#ffffff' : '#94a3b8',
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
              <Award size={14} /> NBA CO-PO Matrix
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cohorts')}
              style={{
                background: activeTab === 'cohorts' ? '#0284c7' : 'transparent',
                color: activeTab === 'cohorts' ? '#ffffff' : '#94a3b8',
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
              <Users size={14} /> Student Cohorts
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
              <Calendar size={14} /> Lab Assignments & Viva
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              style={{
                background: activeTab === 'analytics' ? '#0284c7' : 'transparent',
                color: activeTab === 'analytics' ? '#ffffff' : '#94a3b8',
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
              <GraduationCap size={14} /> Department OBE Analytics
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: NBA / ABET CO-PO ATTAINMENT MATRIX                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'obe-matrix' && (
        <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700 }}>
                OUTCOME-BASED EDUCATION (OBE) · NBA CRITERIA 2 & 3 COMPLIANCE
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 0' }}>
                Course Outcome (CO) to Program Outcome (PO) Articulation Matrix
              </h2>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                <option value="21CH32">21CH32: Momentum Transfer & Fluid Flow</option>
                <option value="21CH42">21CH42: Mechanical Operations & Particle Dynamics</option>
                <option value="21CH52">21CH52: Heat Transfer & Exchanger Network Design</option>
                <option value="21CH62">21CH62: Mass Transfer Operations & Distillation</option>
              </select>

              <button
                type="button"
                onClick={handleExportNbaReport}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Download size={14} /> Export NBA Dossier
              </button>
            </div>
          </div>

          {downloadSuccess && (
            <div style={{ background: '#064e3b', color: '#a7f3d0', border: '1px solid #10b981', padding: '8px 12px', borderRadius: 6, fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={14} /> {downloadSuccess}
            </div>
          )}

          {/* Matrix Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.76rem', borderCollapse: 'collapse', color: '#cbd5e1' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>CO ID</th>
                  <th style={{ padding: '8px 10px', minWidth: 280 }}>COURSE OUTCOME STATEMENT</th>
                  <th style={{ padding: '8px 10px' }}>BLOOM TAXONOMY</th>
                  <th style={{ padding: '8px 10px' }}>MAPPED POs / PSOs</th>
                  <th style={{ padding: '8px 10px' }}>TARGET %</th>
                  <th style={{ padding: '8px 10px' }}>ACTUAL %</th>
                  <th style={{ padding: '8px 10px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {coMappings.map((co) => (
                  <tr key={co.coNumber} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '10px 10px', fontWeight: 800, color: '#38bdf8' }}>{co.coNumber}</td>
                    <td style={{ padding: '10px 10px', lineHeight: 1.4 }}>{co.statement}</td>
                    <td style={{ padding: '10px 10px' }}>
                      <span style={{ background: '#1e293b', color: '#f59e0b', padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700 }}>
                        {co.bloomLevel}
                      </span>
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {co.mappedPos.map((po) => (
                          <span key={po} style={{ background: '#0284c722', color: '#38bdf8', padding: '1px 6px', borderRadius: 3, fontSize: '0.68rem', fontWeight: 700 }}>
                            {po}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '10px 10px', fontWeight: 700 }}>{co.targetAttainmentPct}%</td>
                    <td style={{ padding: '10px 10px', fontWeight: 800, color: co.actualAttainmentPct >= co.targetAttainmentPct ? '#34d399' : '#ef4444' }}>
                      {co.actualAttainmentPct}%
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <span
                        style={{
                          background: co.actualAttainmentPct >= co.targetAttainmentPct ? '#064e3b' : '#7f1d1d',
                          color: co.actualAttainmentPct >= co.targetAttainmentPct ? '#6ee7b7' : '#fca5a5',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                        }}
                      >
                        {co.actualAttainmentPct >= co.targetAttainmentPct ? 'Attained' : 'Deficit'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: '#0b1329', padding: 14, borderRadius: 8, border: '1px solid #1e293b', fontSize: '0.74rem', color: '#94a3b8' }}>
            <strong>NBA Self-Assessment Report (SAR) Criterion 3.1:</strong> Program Outcomes PO1 (Engineering Knowledge), PO2 (Problem Analysis), PO3 (Design/Development of Solutions), and PO4 (Conduct Investigations of Complex Problems) are actively fulfilled by CHEM-SIM physical digital twin modules.
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: STUDENT COHORTS & PROGRESS                             */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'cohorts' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { id: 'SEC-A', name: 'Batch 2023–27 · Section A', count: '64 Students', avgScore: '88.4%' },
              { id: 'SEC-B', name: 'Batch 2023–27 · Section B', count: '62 Students', avgScore: '86.1%' },
              { id: 'HONORS', name: 'Honors in Process Automation', count: '24 Students', avgScore: '94.2%' },
            ].map((cohort, idx) => (
              <div
                key={idx}
                style={{
                  background: idx === 0 ? 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)' : '#0f172a',
                  border: idx === 0 ? '1px solid #60a5fa' : '1px solid #1e293b',
                  borderRadius: 8,
                  padding: 14,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>{cohort.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.72rem', color: '#94a3b8' }}>
                  <span>{cohort.count}</span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>Avg: {cohort.avgScore}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
                STUDENT SIMULATION ATTEMPTS & VIVA SUBMISSIONS
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Showing 5 recent submissions</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.74rem', borderCollapse: 'collapse', color: '#cbd5e1' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '6px 8px' }}>USN</th>
                    <th style={{ padding: '6px 8px' }}>STUDENT NAME</th>
                    <th style={{ padding: '6px 8px' }}>ASSIGNMENT</th>
                    <th style={{ padding: '6px 8px' }}>VIVA (/20)</th>
                    <th style={{ padding: '6px 8px' }}>SIM ACCURACY (/30)</th>
                    <th style={{ padding: '6px 8px' }}>TOTAL (/100)</th>
                    <th style={{ padding: '6px 8px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '8px 8px', fontWeight: 700, color: '#38bdf8' }}>{sub.usn}</td>
                      <td style={{ padding: '8px 8px', color: '#f8fafc' }}>{sub.name}</td>
                      <td style={{ padding: '8px 8px' }}>{sub.assignment}</td>
                      <td style={{ padding: '8px 8px' }}>{sub.vivaScore}</td>
                      <td style={{ padding: '8px 8px' }}>{sub.simAccuracyScore}</td>
                      <td style={{ padding: '8px 8px', fontWeight: 800, color: '#34d399' }}>{sub.totalScore}</td>
                      <td style={{ padding: '8px 8px' }}>
                        <span
                          style={{
                            background: sub.status === 'Graded' ? '#064e3b' : '#d9770633',
                            color: sub.status === 'Graded' ? '#6ee7b7' : '#fcd34d',
                            padding: '1px 6px',
                            borderRadius: 4,
                            fontSize: '0.66rem',
                            fontWeight: 700,
                          }}
                        >
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: ASSIGNMENTS & VIVA RUBRIC CONFIGURATOR                 */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'assignments' && (
        <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700 }}>
                CONTINUOUS INTERNAL EVALUATION (CIE) RUBRICS
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 0' }}>
                Virtual Laboratory Assignment Management
              </h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              {
                title: 'EXP-01: Centrifugal Pump Head vs Flow & Efficiency Curve',
                module: 'centrifugal-pump',
                weightage: '25 Marks',
                rubric: '10 Marks: Simulation Data Precision, 5 Marks: Affinity Law Validation, 10 Marks: Viva Voce',
              },
              {
                title: 'EXP-02: Fluidised Bed Pressure Drop & Minimum Fluidisation',
                module: 'fluidisation',
                weightage: '25 Marks',
                rubric: '10 Marks: Voidage & Delta P graph, 5 Marks: Ergun Equation Match, 10 Marks: Viva Voce',
              },
              {
                title: 'EXP-03: Shell & Tube Exchanger LMTD & Heat Transfer Area',
                module: 'heat-exchanger',
                weightage: '25 Marks',
                rubric: '10 Marks: Thermal Balance, 5 Marks: Fouling Factor Assessment, 10 Marks: Viva Voce',
              },
            ].map((asg, idx) => (
              <div key={idx} style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>{asg.title}</div>
                <div style={{ fontSize: '0.74rem', color: '#38bdf8' }}>Weightage: {asg.weightage}</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  <strong>Grading Rubric:</strong> {asg.rubric}
                </div>
                {onLaunchSimulation && (
                  <button
                    type="button"
                    onClick={() => onLaunchSimulation(asg.module)}
                    style={{
                      marginTop: 'auto',
                      background: '#1e293b',
                      color: '#38bdf8',
                      border: '1px solid #334155',
                      padding: '6px 10px',
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
                    <ExternalLink size={12} /> Launch Assignment Environment
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: DEPARTMENT OBE ANALYTICS & BAR CHARTS                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
              COURSE OUTCOME ATTAINMENT PERCENTAGES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {coMappings.map((co) => (
                <div key={co.coNumber}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{co.coNumber}</span>
                    <span style={{ color: '#34d399', fontWeight: 800 }}>{co.actualAttainmentPct}% (Target: {co.targetAttainmentPct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${co.actualAttainmentPct}%`, height: '100%', background: '#0284c7', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
              PROGRAM OUTCOME (PO1 – PO12) FULFILLMENT AUDIT
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {['PO1: 88%', 'PO2: 82%', 'PO3: 79%', 'PO4: 76%', 'PO5: 91%', 'PO6: 84%', 'PO7: 78%', 'PO8: 85%', 'PO9: 89%', 'PO10: 92%', 'PO11: 74%', 'PO12: 87%'].map((po, idx) => (
                <div key={idx} style={{ background: '#090d16', border: '1px solid #1e293b', padding: 8, borderRadius: 4, textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8' }}>
                  {po}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 'auto', background: '#0b1329', padding: 10, borderRadius: 6, fontSize: '0.7rem', color: '#64748b' }}>
              Complies with Washington Accord Graduate Attributes criteria for professional engineering programs.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyWorkspace;
