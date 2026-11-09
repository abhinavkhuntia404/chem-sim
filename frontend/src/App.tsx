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
  LayoutDashboard,
  Cpu,
  TrendingUp,
  Briefcase,
  FolderGit2,
  Users,
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

// Master Workspaces (PRD Workspaces 1 through 9)
import { HomeWorkspace } from './workspaces/HomeWorkspace';
import { AcademicWorkspace } from './workspaces/AcademicWorkspace';
import { ToolboxWorkspace } from './workspaces/ToolboxWorkspace';
import { DesignWorkspace } from './workspaces/DesignWorkspace';
import { DigitalTwinWorkspace } from './workspaces/DigitalTwinWorkspace';
import { CareerWorkspace } from './workspaces/CareerWorkspace';
import { PortfolioWorkspace } from './workspaces/PortfolioWorkspace';
import { FacultyWorkspace } from './workspaces/FacultyWorkspace';

import { fetchHealth } from './api';

export function App() {
  const [activeModule, setActiveModule] = useState<string>('home');
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
  };

  const isProtectedSimulation = activeModule === 'centrifugal-pump' || activeModule === 'fluidisation';

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-badge">
            <Beaker size={22} color="#38bdf8" />
            <span>CHEM-SIM</span>
            <span className="brand-tag">v2.0</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
            Chemical Engineering Master Suite
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* Foundation & Learning */}
          <div className="nav-section-title">Foundation & Learning</div>

          <div
            className={`nav-item ${activeModule === 'home' ? 'active' : ''}`}
            onClick={() => setActiveModule('home')}
          >
            <Compass size={17} />
            <span>Platform Home</span>
          </div>

          <div
            className={`nav-item ${activeModule === 'academic' ? 'active' : ''}`}
            onClick={() => setActiveModule('academic')}
          >
            <GraduationCap size={17} />
            <span>Academic Curriculum</span>
          </div>

          <div
            className={`nav-item ${activeModule === 'toolbox' ? 'active' : ''}`}
            onClick={() => setActiveModule('toolbox')}
          >
            <Sliders size={17} />
            <span>Engineering Toolbox</span>
          </div>

          {/* Flagship Digital Twins & Simulations */}
          <div className="nav-section-title">Flagship Virtual Labs</div>

          <div
            className={`nav-item ${activeModule === 'centrifugal-pump' ? 'active' : ''}`}
            onClick={() => setActiveModule('centrifugal-pump')}
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
            onClick={() => setActiveModule('fluidisation')}
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
            onClick={() => setActiveModule('distillation')}
          >
            <Layers size={17} />
            <span>Binary Distillation</span>
          </div>

          <div
            className={`nav-item ${activeModule === 'heat-exchanger' ? 'active' : ''}`}
            onClick={() => setActiveModule('heat-exchanger')}
          >
            <Flame size={17} />
            <span>Heat Exchangers</span>
          </div>

          <div
            className={`nav-item ${activeModule === 'reactor' ? 'active' : ''}`}
            onClick={() => setActiveModule('reactor')}
          >
            <Atom size={17} />
            <span>Reaction Kinetics</span>
          </div>

          <div
            className={`nav-item ${activeModule === 'thermo' ? 'active' : ''}`}
            onClick={() => setActiveModule('thermo')}
          >
            <Droplet size={17} />
            <span>Thermodynamics</span>
          </div>

          <div
            className={`nav-item ${activeModule === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveModule('overview')}
          >
            <LayoutDashboard size={17} />
            <span>Sim Overview & Bench</span>
          </div>

          {/* Process Design & Industrial Twins */}
          <div className="nav-section-title">Design & Automation</div>

          <div
            className={`nav-item ${activeModule === 'design' ? 'active' : ''}`}
            onClick={() => setActiveModule('design')}
          >
            <Cpu size={17} />
            <span>Process Design Studio</span>
          </div>

          <div
            className={`nav-item ${activeModule === 'industry' ? 'active' : ''}`}
            onClick={() => setActiveModule('industry')}
          >
            <TrendingUp size={17} />
            <span>Industrial Digital Twin</span>
          </div>

          {/* Career & Institutional */}
          <div className="nav-section-title">Career & Institutional</div>

          <div
            className={`nav-item ${activeModule === 'career' ? 'active' : ''}`}
            onClick={() => setActiveModule('career')}
          >
            <Briefcase size={17} />
            <span>Career & Placements</span>
          </div>

          <div
            className={`nav-item ${activeModule === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveModule('portfolio')}
          >
            <FolderGit2 size={17} />
            <span>Engineering Portfolio</span>
          </div>

          <div
            className={`nav-item ${activeModule === 'faculty' ? 'active' : ''}`}
            onClick={() => setActiveModule('faculty')}
          >
            <Users size={17} />
            <span>Faculty & Department</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div>
            <div style={{ color: '#94a3b8', fontWeight: 600 }}>CHEM-SIM Platform</div>
            <div style={{ fontSize: '0.68rem' }}>MANAS Sci-Eng Solvers</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isProtectedSimulation && (
              <button
                type="button"
                onClick={() => setActiveModule('home')}
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
                ← Back to Workspaces
              </button>
            )}
            <div className="page-title" style={{ fontSize: '0.95rem', fontWeight: 800 }}>
              {activeModule === 'home' && 'CHEM-SIM — The Chemical Engineering Learning, Simulation & Digital Twin Platform'}
              {activeModule === 'academic' && 'Academic Curriculum Engine (VTU & Autonomous 2026–27 Scheme)'}
              {activeModule === 'toolbox' && 'Curriculum-Independent Engineering Calculation Toolbox (30+ Engines)'}
              {activeModule === 'centrifugal-pump' && 'Momentum Transfer: Centrifugal Pump Digital Twin & Virtual Laboratory'}
              {activeModule === 'fluidisation' && 'Mechanical Operations: Fluidisation & Packed Bed Dynamics'}
              {activeModule === 'distillation' && 'Binary Distillation Simulation (McCabe–Thiele Stage Stepping)'}
              {activeModule === 'heat-exchanger' && 'Heat Exchanger Rating & LMTD Counter-Current Design'}
              {activeModule === 'reactor' && 'Chemical Reaction Kinetics (CSTR vs PFR Performance)'}
              {activeModule === 'thermo' && 'Thermodynamic Property Database & Phase Envelopes (VLE Antoine)'}
              {activeModule === 'overview' && 'Simulation Overview & Utilities Bench'}
              {activeModule === 'design' && 'Process Design Studio (PFD / P&ID Flowsheets & Equipment Datasheets)'}
              {activeModule === 'industry' && 'Industrial Digital Twin Centre (SCADA Trends, PID Tuning, HAZOP)'}
              {activeModule === 'career' && 'Career & Placement Readiness Centre (8 Pathways, 100+ Q&As, Plant Incidents)'}
              {activeModule === 'portfolio' && 'Engineering Project Portfolio & Evidence Studio'}
              {activeModule === 'faculty' && 'Faculty & Departmental Management Portal (NBA / ABET OBE Matrices)'}
            </div>
          </div>

          <div className="top-actions">
            <span className="status-indicator status-online">
              <span className="status-dot" />
              {engineStatus}
            </span>
          </div>
        </header>

        <main className="content-scroll" style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          {activeModule === 'home' && <HomeWorkspace onNavigate={handleNavigate} />}
          {activeModule === 'academic' && <AcademicWorkspace onLaunchSimulation={setActiveModule} />}
          {activeModule === 'toolbox' && <ToolboxWorkspace />}
          {activeModule === 'design' && <DesignWorkspace onLaunchSimulation={setActiveModule} />}
          {activeModule === 'industry' && <DigitalTwinWorkspace onLaunchSimulation={setActiveModule} />}
          {activeModule === 'career' && <CareerWorkspace onLaunchSimulation={setActiveModule} />}
          {activeModule === 'portfolio' && <PortfolioWorkspace onLaunchSimulation={setActiveModule} />}
          {activeModule === 'faculty' && <FacultyWorkspace onLaunchSimulation={setActiveModule} />}

          {/* Protected Digital Twin Flagships */}
          {activeModule === 'centrifugal-pump' && <CentrifugalPumpModule />}
          {activeModule === 'fluidisation' && <FluidisationModule />}

          {/* Legacy & Supplemental Simulations */}
          {activeModule === 'overview' && <OverviewModule onSelectModule={setActiveModule} />}
          {activeModule === 'distillation' && <DistillationModule />}
          {activeModule === 'heat-exchanger' && <HeatExchangerModule />}
          {activeModule === 'reactor' && <ReactorModule />}
          {activeModule === 'thermo' && <ThermoModule />}
        </main>
      </div>
    </div>
  );
}

export default App;
