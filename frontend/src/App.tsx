import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Layers,
  Flame,
  Atom,
  Droplet,
  Beaker,
} from 'lucide-react';
import { DistillationModule } from './DistillationModule';
import { HeatExchangerModule } from './HeatExchangerModule';
import { ReactorModule } from './ReactorModule';
import { ThermoModule } from './ThermoModule';
import { OverviewModule } from './OverviewModule';
import { fetchHealth } from './api';

export function App() {
  const [activeModule, setActiveModule] = useState<string>('distillation');
  const [engineStatus, setEngineStatus] = useState<string>('Connecting...');

  useEffect(() => {
    fetchHealth().then((h) => {
      setEngineStatus(h.status === 'ok' ? 'FastAPI Backend Connected' : 'Client Engineering Engine Active');
    });
  }, []);

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
            Chemical Engineering Suite
          </div>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeModule === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveModule('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Overview & Tools</span>
          </div>

          <div
            className={`nav-item ${activeModule === 'distillation' ? 'active' : ''}`}
            onClick={() => setActiveModule('distillation')}
          >
            <Layers size={18} />
            <span>Binary Distillation</span>
          </div>

          <div
            className={`nav-item ${activeModule === 'heat-exchanger' ? 'active' : ''}`}
            onClick={() => setActiveModule('heat-exchanger')}
          >
            <Flame size={18} />
            <span>Heat Exchangers</span>
          </div>

          <div
            className={`nav-item ${activeModule === 'reactor' ? 'active' : ''}`}
            onClick={() => setActiveModule('reactor')}
          >
            <Atom size={18} />
            <span>Reaction Kinetics</span>
          </div>

          <div
            className={`nav-item ${activeModule === 'thermo' ? 'active' : ''}`}
            onClick={() => setActiveModule('thermo')}
          >
            <Droplet size={18} />
            <span>Thermodynamics</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div>
            <div style={{ color: '#94a3b8', fontWeight: 600 }}>MANAS Design</div>
            <div style={{ fontSize: '0.68rem' }}>Rigorous Sci-Eng Solvers</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="top-bar">
          <div className="page-title">
            {activeModule === 'overview' && 'Simulation Overview & Utilities'}
            {activeModule === 'distillation' && 'Binary Distillation Simulation (McCabe–Thiele)'}
            {activeModule === 'heat-exchanger' && 'Heat Exchanger Rating & LMTD Design'}
            {activeModule === 'reactor' && 'Chemical Reaction Engineering & Kinetics'}
            {activeModule === 'thermo' && 'Thermodynamic Property Database & Phase Envelopes'}
          </div>

          <div className="top-actions">
            <span className="status-indicator status-online">
              <span className="status-dot" />
              {engineStatus}
            </span>
          </div>
        </header>

        <main className="content-scroll">
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
