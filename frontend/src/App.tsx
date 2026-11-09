import { useState, useEffect } from 'react';
import {
  Compass,
  Sliders,
  Activity,
  Wind,
  Layers,
  Flame,
  Atom,
  Droplet,
  FlaskConical,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';

import { ChemSimLogo } from './components/ChemSimLogo';

// Protected flagships (DO NOT MODIFY INTERNAL FILES)
import { CentrifugalPumpModule } from './CentrifugalPumpModule';
import { FluidisationModule } from './FluidisationModule';

// Supplemental simulations
import { DistillationModule } from './DistillationModule';
import { HeatExchangerModule } from './HeatExchangerModule';
import { ReactorModule } from './ReactorModule';
import { ThermoModule } from './ThermoModule';
import { OverviewModule } from './OverviewModule';

// Workspaces
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
  const [simMenuOpen, setSimMenuOpen] = useState<boolean>(false);
  const [engineStatus, setEngineStatus] = useState<string>('Connecting...');

  useEffect(() => {
    fetchHealth()
      .then((h) => {
        setEngineStatus(h.status === 'ok' ? 'FastAPI Connected' : 'Engine Active');
      })
      .catch(() => {
        setEngineStatus('Engine Active');
      });
  }, []);

  const handleNavigate = (workspaceId: string, subModule?: string) => {
    if (subModule) {
      setActiveModule(subModule);
    } else {
      setActiveModule(workspaceId);
    }
    setMobileMenuOpen(false);
    setSimMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSimulationPage =
    activeModule === 'centrifugal-pump' ||
    activeModule === 'fluidisation' ||
    activeModule === 'distillation' ||
    activeModule === 'heat-exchanger' ||
    activeModule === 'reactor' ||
    activeModule === 'thermo' ||
    activeModule === 'overview';

  return (
    <div className="website-root" style={{ minHeight: '100vh', background: '#070b14', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* ================================================================= */}
      {/* 1. CORPORATE HEADER NAVIGATION (STICKY TOP BAR)                   */}
      {/* ================================================================= */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(7, 11, 20, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1e293b',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
        }}
      >
        {/* Left: Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div onClick={() => handleNavigate('home')} style={{ cursor: 'pointer' }}>
            <ChemSimLogo size={32} showWordmark={true} />
          </div>

          {/* Desktop Top Nav Links */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              className={`top-nav-link ${activeModule === 'home' ? 'active' : ''}`}
              onClick={() => handleNavigate('home')}
            >
              Home
            </button>

            <button
              type="button"
              className={`top-nav-link ${activeModule === 'learn' ? 'active' : ''}`}
              onClick={() => handleNavigate('learn')}
            >
              Learn
            </button>

            {/* Simulations Dropdown Link */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={`top-nav-link ${isSimulationPage ? 'active' : ''}`}
                onClick={() => setSimMenuOpen(!simMenuOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Simulations <ChevronDown size={14} />
              </button>

              {simMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 8,
                    width: 250,
                    background: '#0f172a',
                    border: '1px solid #1e3a8a',
                    borderRadius: 8,
                    padding: 8,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    zIndex: 110,
                  }}
                >
                  <div
                    className="sim-dropdown-item"
                    onClick={() => handleNavigate('centrifugal-pump')}
                    style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8' }}
                  >
                    <Activity size={16} /> Centrifugal Pump 3D Twin
                  </div>
                  <div
                    className="sim-dropdown-item"
                    onClick={() => handleNavigate('fluidisation')}
                    style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', fontWeight: 700, color: '#34d399' }}
                  >
                    <Wind size={16} /> Fluidisation Column
                  </div>
                  <div
                    className="sim-dropdown-item"
                    onClick={() => handleNavigate('distillation')}
                    style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#cbd5e1' }}
                  >
                    <Layers size={16} /> Binary Distillation
                  </div>
                  <div
                    className="sim-dropdown-item"
                    onClick={() => handleNavigate('heat-exchanger')}
                    style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#cbd5e1' }}
                  >
                    <Flame size={16} /> Heat Exchanger Rating
                  </div>
                  <div
                    className="sim-dropdown-item"
                    onClick={() => handleNavigate('reactor')}
                    style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#cbd5e1' }}
                  >
                    <Atom size={16} /> Reaction Kinetics
                  </div>
                  <div
                    className="sim-dropdown-item"
                    onClick={() => handleNavigate('thermo')}
                    style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#cbd5e1' }}
                  >
                    <Droplet size={16} /> Thermodynamics & VLE
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className={`top-nav-link ${activeModule === 'lab' ? 'active' : ''}`}
              onClick={() => handleNavigate('lab')}
            >
              Virtual Labs
            </button>

            <button
              type="button"
              className={`top-nav-link ${activeModule === 'design' ? 'active' : ''}`}
              onClick={() => handleNavigate('design')}
            >
              Process Design
            </button>

            <button
              type="button"
              className={`top-nav-link ${activeModule === 'industry' ? 'active' : ''}`}
              onClick={() => handleNavigate('industry')}
            >
              Digital Twins
            </button>

            <button
              type="button"
              className={`top-nav-link ${activeModule === 'toolbox' ? 'active' : ''}`}
              onClick={() => handleNavigate('toolbox')}
            >
              Tools
            </button>

            <button
              type="button"
              className={`top-nav-link ${activeModule === 'career' ? 'active' : ''}`}
              onClick={() => handleNavigate('career')}
            >
              Career
            </button>
          </nav>
        </div>

        {/* Right: Role Switcher & Action CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Segmented Student / Faculty Toggle */}
          <div className="role-badge-toggle" style={{ display: 'inline-flex', background: '#0f172a', padding: 2, borderRadius: 6, border: '1px solid #1e293b' }}>
            <button
              type="button"
              className={`role-btn ${userRole === 'student' ? 'active' : ''}`}
              onClick={() => {
                setUserRole('student');
                if (activeModule === 'teacher-home') setActiveModule('home');
              }}
              style={{ padding: '4px 10px', fontSize: '0.74rem', fontWeight: 700, borderRadius: 4, border: 'none', cursor: 'pointer', background: userRole === 'student' ? '#0284c7' : 'transparent', color: userRole === 'student' ? '#ffffff' : '#94a3b8' }}
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
              style={{ padding: '4px 10px', fontSize: '0.74rem', fontWeight: 700, borderRadius: 4, border: 'none', cursor: 'pointer', background: userRole === 'teacher' ? '#0284c7' : 'transparent', color: userRole === 'teacher' ? '#ffffff' : '#94a3b8' }}
            >
              Faculty
            </button>
          </div>

          {/* Engine Status Dot */}
          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
            <span className="desktop-only-text">{engineStatus}</span>
          </span>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => handleNavigate('centrifugal-pump')}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 10px rgba(2, 132, 199, 0.3)',
            }}
          >
            Launch Twin <ArrowRight size={14} />
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer', padding: 4 }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ================================================================= */}
      {/* 2. SUB-SIMULATION BREADCRUMB / SWITCHER BAR (WHEN IN SIMULATION) */}
      {/* ================================================================= */}
      {isSimulationPage && (
        <div
          style={{
            background: '#0b1329',
            borderBottom: '1px solid #1e293b',
            padding: '8px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.76rem' }}>
            <button
              type="button"
              onClick={() => handleNavigate('home')}
              style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              ← Back to Overview
            </button>
            <span style={{ color: '#475569' }}>/</span>
            <span style={{ color: '#94a3b8' }}>Simulation Laboratory</span>
            <span style={{ color: '#475569' }}>/</span>
            <span style={{ color: '#f8fafc', fontWeight: 800 }}>
              {activeModule === 'centrifugal-pump' && 'Centrifugal Pump Digital Twin (API 610)'}
              {activeModule === 'fluidisation' && 'Fluidisation & Packed Bed Dynamics'}
              {activeModule === 'distillation' && 'Binary Distillation (McCabe-Thiele)'}
              {activeModule === 'heat-exchanger' && 'Shell & Tube Exchanger Rating'}
              {activeModule === 'reactor' && 'CSTR vs PFR Reaction Kinetics'}
              {activeModule === 'thermo' && 'VLE Phase Envelopes & Antoine'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'centrifugal-pump', label: 'Pump 3D Twin' },
              { id: 'fluidisation', label: 'Fluidisation' },
              { id: 'distillation', label: 'Distillation' },
              { id: 'heat-exchanger', label: 'Exchanger' },
              { id: 'reactor', label: 'Reactors' },
              { id: 'thermo', label: 'Thermo' },
            ].map((sim) => (
              <button
                key={sim.id}
                type="button"
                onClick={() => handleNavigate(sim.id)}
                style={{
                  background: activeModule === sim.id ? '#0284c7' : '#1e293b',
                  color: activeModule === sim.id ? '#ffffff' : '#94a3b8',
                  border: '1px solid #334155',
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {sim.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. MOBILE OFFCANVAS DRAWER                                       */}
      {/* ================================================================= */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 90,
            background: 'rgba(4, 7, 17, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            padding: '80px 24px 24px',
            gap: 16,
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
            Navigation Menu
          </div>

          {[
            { id: 'home', label: 'Home Landing Page' },
            { id: 'learn', label: 'Visual Concept Studio' },
            { id: 'centrifugal-pump', label: 'Centrifugal Pump Digital Twin' },
            { id: 'fluidisation', label: 'Fluidisation Unit' },
            { id: 'lab', label: 'Virtual Experiments' },
            { id: 'design', label: 'Process Design Studio' },
            { id: 'industry', label: 'Digital Twin Centre' },
            { id: 'toolbox', label: 'Engineering Calculators' },
            { id: 'career', label: 'Career Preparation' },
            { id: 'portfolio', label: 'Engineering Portfolio' },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              style={{
                padding: '12px 14px',
                background: activeModule === item.id ? '#1e3a8a' : '#0f172a',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: 700,
                color: activeModule === item.id ? '#38bdf8' : '#f8fafc',
                cursor: 'pointer',
              }}
            >
              {item.label}
            </div>
          ))}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            style={{ marginTop: 'auto', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: 12, borderRadius: 8, fontSize: '0.84rem', cursor: 'pointer' }}
          >
            Close Menu
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. MAIN CONTENT VIEWPORT                                         */}
      {/* ================================================================= */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 1360,
          margin: '0 auto',
          padding: activeModule === 'home' ? '28px 24px 60px' : '24px 24px 60px',
        }}
      >
        {activeModule === 'home' && <HomeWorkspace onNavigate={handleNavigate} />}
        {activeModule === 'learn' && <VisualConceptExplorer onLaunchSimulation={setActiveModule} />}
        {activeModule === 'lab' && <ExperimentWorkspace onLaunchSimulation={setActiveModule} />}
        {activeModule === 'teacher-home' && <TeacherWorkspace onLaunchSimulation={setActiveModule} />}
        {activeModule === 'academic' && <AcademicWorkspace onLaunchSimulation={setActiveModule} />}
        {activeModule === 'toolbox' && <ToolboxWorkspace />}
        {activeModule === 'design' && <DesignWorkspace onLaunchSimulation={setActiveModule} />}
        {activeModule === 'industry' && <DigitalTwinWorkspace onLaunchSimulation={setActiveModule} />}
        {activeModule === 'career' && <CareerWorkspace onLaunchSimulation={setActiveModule} />}
        {activeModule === 'portfolio' && <PortfolioWorkspace onLaunchSimulation={setActiveModule} />}

        {/* Protected Flagships (IMMUTABLE) */}
        {activeModule === 'centrifugal-pump' && <CentrifugalPumpModule />}
        {activeModule === 'fluidisation' && <FluidisationModule />}

        {/* Supplemental Simulations */}
        {activeModule === 'distillation' && <DistillationModule />}
        {activeModule === 'heat-exchanger' && <HeatExchangerModule />}
        {activeModule === 'reactor' && <ReactorModule />}
        {activeModule === 'thermo' && <ThermoModule />}
        {activeModule === 'overview' && <OverviewModule onSelectModule={setActiveModule} />}
      </main>

      {/* ================================================================= */}
      {/* 5. MOBILE BOTTOM NAVIGATION (TOUCH-FRIENDLY QUICK SHORTCUTS)      */}
      {/* ================================================================= */}
      <nav
        className="mobile-bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 56,
          background: '#090d16',
          borderTop: '1px solid #1e293b',
          zIndex: 80,
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 4px',
        }}
      >
        <button
          type="button"
          onClick={() => handleNavigate('home')}
          style={{ background: 'transparent', border: 'none', color: activeModule === 'home' ? '#38bdf8' : '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: '0.64rem', fontWeight: 700, cursor: 'pointer' }}
        >
          <Compass size={18} />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('learn')}
          style={{ background: 'transparent', border: 'none', color: activeModule === 'learn' ? '#38bdf8' : '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: '0.64rem', fontWeight: 700, cursor: 'pointer' }}
        >
          <Activity size={18} />
          <span>Learn</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('centrifugal-pump')}
          style={{ background: 'transparent', border: 'none', color: activeModule === 'centrifugal-pump' ? '#38bdf8' : '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: '0.64rem', fontWeight: 700, cursor: 'pointer' }}
        >
          <Wind size={18} />
          <span>Pump Twin</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('lab')}
          style={{ background: 'transparent', border: 'none', color: activeModule === 'lab' ? '#38bdf8' : '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: '0.64rem', fontWeight: 700, cursor: 'pointer' }}
        >
          <FlaskConical size={18} />
          <span>Lab SOPs</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('toolbox')}
          style={{ background: 'transparent', border: 'none', color: activeModule === 'toolbox' ? '#38bdf8' : '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: '0.64rem', fontWeight: 700, cursor: 'pointer' }}
        >
          <Sliders size={18} />
          <span>Tools</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
