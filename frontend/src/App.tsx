import { useState, useEffect } from 'react';
import {
  Compass,
  GraduationCap,
  Sliders,
  Activity,
  Wind,
  Layers,
  Flame,
  Atom,
  Droplet,
  Beaker,
  Cpu,
  TrendingUp,
  Briefcase,
  FolderGit2,
  Presentation,
  FlaskConical,
  Menu,
  X,
} from 'lucide-react';

// Protected flagships (DO NOT MODIFY INTERNAL FILES)
import { CentrifugalPumpModule } from './CentrifugalPumpModule';
import { FluidisationModule } from './FluidisationModule';

// Other simulations
import { DistillationModule } from './DistillationModule';
import { HeatExchangerModule } from './HeatExchangerModule';
import { ReactorModule } from './ReactorModule';
import { ThermoModule } from './ThermoModule';
import { OverviewModule } from './OverviewModule';

// Workspaces (Revised Student & Teacher First Architecture)
import { HomeWorkspace } from './workspaces/HomeWorkspace';
import { AcademicWorkspace } from './workspaces/AcademicWorkspace';
import { ToolboxWorkspace } from './workspaces/ToolboxWorkspace';
import { DesignWorkspace } from './workspaces/DesignWorkspace';
import { DigitalTwinWorkspace } from './workspaces/DigitalTwinWorkspace';
import { CareerWorkspace } from './workspaces/CareerWorkspace';
import { PortfolioWorkspace } from './workspaces/PortfolioWorkspace';
import { VisualConceptExplorer } from './workspaces/VisualConceptExplorer';
import { ExperimentWorkspace } from './workspaces/ExperimentWorkspace';
import { TeacherWorkspace } from './workspaces/TeacherWorkspace';

import { fetchHealth } from './api';

export function App() {
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');
  const [activeModule, setActiveModule] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [engineStatus, setEngineStatus] = useState<string>('Connecting...');

  useEffect(() => {
    fetchHealth()
      .then((h) => {
        setEngineStatus(h.status === 'ok' ? 'FastAPI Backend Connected' : 'Client Engineering Engine Active');
      })
      .catch(() => {
        setEngineStatus('Client Engineering Engine Active');
      });
  }, []);

  const handleNavigate = (workspaceId: string, subModule?: string) => {
    if (subModule) {
      setActiveModule(subModule);
    } else {
      setActiveModule(workspaceId);
    }
    setMobileMenuOpen(false);
  };

  const isProtectedSimulation = activeModule === 'centrifugal-pump' || activeModule === 'fluidisation';

  return (
    <div className="app-container">
      {/* Mobile Sticky Top Header */}
      <header className="mobile-top-bar">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer', padding: 4 }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
          <Beaker size={18} color="#38bdf8" />
          <span>CHEM-SIM</span>
        </div>

        {/* Role Toggle on Mobile */}
        <div className="role-badge-toggle">
          <button
            type="button"
            className={`role-btn ${userRole === 'student' ? 'active' : ''}`}
            onClick={() => {
              setUserRole('student');
              setActiveModule('home');
            }}
          >
            Student
          </button>
          <button
            type="button"
            className={`role-btn ${userRole === 'teacher' ? 'active' : ''}`}
            onClick={() => {
              setUserRole('teacher');
              setActiveModule('teacher-home');
            }}
          >
            Teacher
          </button>
        </div>
      </header>

      {/* Sidebar Navigation (Desktop Fixed, Mobile Drawer) */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="brand-badge">
              <Beaker size={22} color="#38bdf8" />
              <span>CHEM-SIM</span>
              <span className="brand-tag">v2.0</span>
            </div>
            {mobileMenuOpen && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
            Visual Chemical Engineering Suite
          </div>

          {/* Desktop Role Switcher Segmented Control */}
          <div style={{ marginTop: 12 }}>
            <div className="role-badge-toggle" style={{ width: '100%', display: 'flex' }}>
              <button
                type="button"
                className={`role-btn ${userRole === 'student' ? 'active' : ''}`}
                style={{ flex: 1, textAlign: 'center' }}
                onClick={() => {
                  setUserRole('student');
                  setActiveModule('home');
                }}
              >
                🎓 Student
              </button>
              <button
                type="button"
                className={`role-btn ${userRole === 'teacher' ? 'active' : ''}`}
                style={{ flex: 1, textAlign: 'center' }}
                onClick={() => {
                  setUserRole('teacher');
                  setActiveModule('teacher-home');
                }}
              >
                👨‍🏫 Teacher
              </button>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* ========================================================= */}
          {/* STUDENT ROLE NAVIGATION                                   */}
          {/* ========================================================= */}
          {userRole === 'student' && (
            <>
              <div className="nav-section-title">My Learning</div>

              <div
                className={`nav-item ${activeModule === 'home' ? 'active' : ''}`}
                onClick={() => handleNavigate('home')}
              >
                <Compass size={17} />
                <span>Home & My Learning</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'learn' ? 'active' : ''}`}
                onClick={() => handleNavigate('learn')}
              >
                <Activity size={17} color="#38bdf8" />
                <span>Visual Concept Studio</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'lab' ? 'active' : ''}`}
                onClick={() => handleNavigate('lab')}
              >
                <FlaskConical size={17} color="#34d399" />
                <span>Virtual Experiments</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'academic' ? 'active' : ''}`}
                onClick={() => handleNavigate('academic')}
              >
                <GraduationCap size={17} />
                <span>Curriculum & Topics</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'toolbox' ? 'active' : ''}`}
                onClick={() => handleNavigate('toolbox')}
              >
                <Sliders size={17} />
                <span>Engineering Calculators</span>
              </div>

              <div className="nav-section-title">Flagship Simulations</div>

              <div
                className={`nav-item ${activeModule === 'centrifugal-pump' ? 'active' : ''}`}
                onClick={() => handleNavigate('centrifugal-pump')}
                style={{
                  background: activeModule === 'centrifugal-pump' ? 'rgba(56, 189, 248, 0.15)' : undefined,
                  borderColor: activeModule === 'centrifugal-pump' ? '#38bdf8' : undefined,
                }}
              >
                <Activity size={17} color="#38bdf8" />
                <span style={{ fontWeight: 600, color: activeModule === 'centrifugal-pump' ? '#38bdf8' : '#e0f2fe' }}>
                  Centrifugal Pump Twin
                </span>
              </div>

              <div
                className={`nav-item ${activeModule === 'fluidisation' ? 'active' : ''}`}
                onClick={() => handleNavigate('fluidisation')}
                style={{
                  background: activeModule === 'fluidisation' ? 'rgba(52, 211, 153, 0.15)' : undefined,
                  borderColor: activeModule === 'fluidisation' ? '#34d399' : undefined,
                }}
              >
                <Wind size={17} color="#34d399" />
                <span style={{ fontWeight: 600, color: activeModule === 'fluidisation' ? '#34d399' : '#e0f2fe' }}>
                  Fluidisation Unit
                </span>
              </div>

              <div
                className={`nav-item ${activeModule === 'distillation' ? 'active' : ''}`}
                onClick={() => handleNavigate('distillation')}
              >
                <Layers size={17} />
                <span>Binary Distillation</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'heat-exchanger' ? 'active' : ''}`}
                onClick={() => handleNavigate('heat-exchanger')}
              >
                <Flame size={17} />
                <span>Heat Exchangers</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'reactor' ? 'active' : ''}`}
                onClick={() => handleNavigate('reactor')}
              >
                <Atom size={17} />
                <span>Reaction Kinetics</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'thermo' ? 'active' : ''}`}
                onClick={() => handleNavigate('thermo')}
              >
                <Droplet size={17} />
                <span>Thermodynamics</span>
              </div>

              <div className="nav-section-title">Design, Plant & Career</div>

              <div
                className={`nav-item ${activeModule === 'design' ? 'active' : ''}`}
                onClick={() => handleNavigate('design')}
              >
                <Cpu size={17} />
                <span>Process Design Studio</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'industry' ? 'active' : ''}`}
                onClick={() => handleNavigate('industry')}
              >
                <TrendingUp size={17} />
                <span>Digital Twin Centre</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'career' ? 'active' : ''}`}
                onClick={() => handleNavigate('career')}
              >
                <Briefcase size={17} />
                <span>Career Preparation</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'portfolio' ? 'active' : ''}`}
                onClick={() => handleNavigate('portfolio')}
              >
                <FolderGit2 size={17} />
                <span>Engineering Portfolio</span>
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* TEACHER ROLE NAVIGATION                                   */}
          {/* ========================================================= */}
          {userRole === 'teacher' && (
            <>
              <div className="nav-section-title">Teaching Workspace</div>

              <div
                className={`nav-item ${activeModule === 'teacher-home' ? 'active' : ''}`}
                onClick={() => handleNavigate('teacher-home')}
              >
                <Presentation size={17} color="#38bdf8" />
                <span>Classroom Presentation</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'academic' ? 'active' : ''}`}
                onClick={() => handleNavigate('academic')}
              >
                <GraduationCap size={17} />
                <span>Courses & Syllabus</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'learn' ? 'active' : ''}`}
                onClick={() => handleNavigate('learn')}
              >
                <Activity size={17} />
                <span>Interactive Concept Chalkboard</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'lab' ? 'active' : ''}`}
                onClick={() => handleNavigate('lab')}
              >
                <FlaskConical size={17} color="#34d399" />
                <span>Virtual Experiments</span>
              </div>

              <div className="nav-section-title">Class Demonstration Twins</div>

              <div
                className={`nav-item ${activeModule === 'centrifugal-pump' ? 'active' : ''}`}
                onClick={() => handleNavigate('centrifugal-pump')}
              >
                <Activity size={17} color="#38bdf8" />
                <span>Pump 3D Anatomy Lab</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'fluidisation' ? 'active' : ''}`}
                onClick={() => handleNavigate('fluidisation')}
              >
                <Wind size={17} color="#34d399" />
                <span>Fluidised Bed Column</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'heat-exchanger' ? 'active' : ''}`}
                onClick={() => handleNavigate('heat-exchanger')}
              >
                <Flame size={17} />
                <span>Exchanger LMTD Rating</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'reactor' ? 'active' : ''}`}
                onClick={() => handleNavigate('reactor')}
              >
                <Atom size={17} />
                <span>CSTR / PFR Kinetics</span>
              </div>

              <div className="nav-section-title">Collaboration & Review</div>

              <div
                className={`nav-item ${activeModule === 'industry' ? 'active' : ''}`}
                onClick={() => handleNavigate('industry')}
              >
                <TrendingUp size={17} />
                <span>SCADA & PID Demonstration</span>
              </div>

              <div
                className={`nav-item ${activeModule === 'design' ? 'active' : ''}`}
                onClick={() => handleNavigate('design')}
              >
                <Cpu size={17} />
                <span>P&ID Flowsheet Demonstrator</span>
              </div>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div>
            <div style={{ color: '#94a3b8', fontWeight: 600 }}>CHEM-SIM Suite</div>
            <div style={{ fontSize: '0.68rem' }}>{userRole === 'student' ? 'Student Workspace' : 'Teacher Workspace'}</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Desktop Top Bar */}
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isProtectedSimulation && (
              <button
                type="button"
                onClick={() => setActiveModule(userRole === 'student' ? 'home' : 'teacher-home')}
                style={{
                  background: '#1e293b',
                  color: '#38bdf8',
                  border: '1px solid #334155',
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                ← Back to Workspace
              </button>
            )}

            <div className="page-title" style={{ fontSize: '0.92rem', fontWeight: 800 }}>
              {activeModule === 'home' && 'Student Home — Visual Engineering Learning & Problem Solving'}
              {activeModule === 'teacher-home' && 'Faculty Classroom Presentation & Student Submission Review'}
              {activeModule === 'learn' && 'Visual Concept Studio — Animated Engineering Physics & Profiles'}
              {activeModule === 'lab' && 'Virtual Experiment Mode — Guided Laboratory Workflows & Reports'}
              {activeModule === 'academic' && 'Academic Curriculum Engine (VTU & Autonomous 2026–27 Scheme)'}
              {activeModule === 'toolbox' && 'Curriculum-Independent Engineering Calculators (30+ Solvers)'}
              {activeModule === 'centrifugal-pump' && 'Centrifugal Pump Digital Twin & Virtual Laboratory'}
              {activeModule === 'fluidisation' && 'Fluidisation & Packed Bed Dynamics Simulator'}
              {activeModule === 'distillation' && 'Binary Distillation Simulation (McCabe–Thiele Stage Stepping)'}
              {activeModule === 'heat-exchanger' && 'Heat Exchanger Rating & LMTD Counter-Current Design'}
              {activeModule === 'reactor' && 'Chemical Reaction Kinetics (CSTR vs PFR Performance)'}
              {activeModule === 'thermo' && 'Thermodynamic Property Database & Phase Envelopes'}
              {activeModule === 'overview' && 'Simulation Overview & Sci-Eng Bench'}
              {activeModule === 'design' && 'Process Design Studio (PFD / P&ID Flowsheets & Equipment Datasheets)'}
              {activeModule === 'industry' && 'Industrial Digital Twin Centre (SCADA Trends, PID Tuning, HAZOP)'}
              {activeModule === 'career' && 'Career & Placement Readiness (8 Pathways, 100+ Q&As, Plant Incidents)'}
              {activeModule === 'portfolio' && 'Engineering Project Portfolio & Verified Capstone Studio'}
            </div>
          </div>

          <div className="top-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="status-indicator status-online">
              <span className="status-dot" />
              {engineStatus}
            </span>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="content-scroll" style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          {/* Student Specific Views */}
          {activeModule === 'home' && <HomeWorkspace onNavigate={handleNavigate} />}
          {activeModule === 'learn' && <VisualConceptExplorer onLaunchSimulation={setActiveModule} />}
          {activeModule === 'lab' && <ExperimentWorkspace onLaunchSimulation={setActiveModule} />}

          {/* Teacher Specific Views */}
          {activeModule === 'teacher-home' && <TeacherWorkspace onLaunchSimulation={setActiveModule} />}

          {/* Shared Workspaces */}
          {activeModule === 'academic' && <AcademicWorkspace onLaunchSimulation={setActiveModule} />}
          {activeModule === 'toolbox' && <ToolboxWorkspace />}
          {activeModule === 'design' && <DesignWorkspace onLaunchSimulation={setActiveModule} />}
          {activeModule === 'industry' && <DigitalTwinWorkspace onLaunchSimulation={setActiveModule} />}
          {activeModule === 'career' && <CareerWorkspace onLaunchSimulation={setActiveModule} />}
          {activeModule === 'portfolio' && <PortfolioWorkspace onLaunchSimulation={setActiveModule} />}

          {/* Protected Digital Twin Flagships */}
          {activeModule === 'centrifugal-pump' && <CentrifugalPumpModule />}
          {activeModule === 'fluidisation' && <FluidisationModule />}

          {/* Supplemental Simulations */}
          {activeModule === 'overview' && <OverviewModule onSelectModule={setActiveModule} />}
          {activeModule === 'distillation' && <DistillationModule />}
          {activeModule === 'heat-exchanger' && <HeatExchangerModule />}
          {activeModule === 'reactor' && <ReactorModule />}
          {activeModule === 'thermo' && <ThermoModule />}
        </main>

        {/* Mobile Bottom Navigation Bar (< 900px screens) */}
        <nav className="mobile-bottom-nav">
          <button
            type="button"
            className={`mobile-nav-item ${activeModule === (userRole === 'student' ? 'home' : 'teacher-home') ? 'active' : ''}`}
            onClick={() => setActiveModule(userRole === 'student' ? 'home' : 'teacher-home')}
          >
            {userRole === 'student' ? <Compass size={18} /> : <Presentation size={18} />}
            <span>Home</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${activeModule === 'learn' ? 'active' : ''}`}
            onClick={() => setActiveModule('learn')}
          >
            <Activity size={18} />
            <span>Learn</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${activeModule === 'lab' ? 'active' : ''}`}
            onClick={() => setActiveModule('lab')}
          >
            <FlaskConical size={18} />
            <span>Lab</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${activeModule === 'centrifugal-pump' ? 'active' : ''}`}
            onClick={() => setActiveModule('centrifugal-pump')}
          >
            <Wind size={18} />
            <span>Pump Twin</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${activeModule === 'toolbox' ? 'active' : ''}`}
            onClick={() => setActiveModule('toolbox')}
          >
            <Sliders size={18} />
            <span>Tools</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default App;
