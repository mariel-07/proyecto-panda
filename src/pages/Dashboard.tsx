import React, { useState } from 'react';
import { Table, Binary, BarChart3, Layers, FileSpreadsheet, LogOut, User, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css';

import { Operacion1 } from './Operacion1';
import { Operacion2 } from './Operacion2';
import { Operacion3 } from './Operacion3';
import { Operacion4 } from './Operacion4';

export type RecordRow = Record<string, string | number>;

interface DashboardProps {
  onLogout?: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'pandas' | 'numpy' | 'reportes' | 'pn'>('pandas');
  const [data, setData] = useState<RecordRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleDataLoaded = (parsedData: RecordRow[], cleanHeaders: string[]) => {
    setData(parsedData);
    setHeaders(cleanHeaders);
  };

  const executeLogout = () => {
    localStorage.removeItem("isAuthenticated");
    if (onLogout) onLogout();
    navigate('/login', { replace: true });
  };

  const handleTabChange = (tab: 'pandas' | 'numpy' | 'reportes' | 'pn') => {
    setActiveTab(tab);
    setIsSidebarOpen(false); // Cierra el sidebar en móviles al seleccionar una opción
  };

  return (
    <div className="dashboard-container">
      {/* BOTÓN MÓVIL Y FONDO OSCURO (OVERLAY) */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR ADAPTABLE */}
      <aside className={`sidebar-left ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand-header">
            <div className="brand-logo-bg">
              <FileSpreadsheet size={20} className="brand-icon" />
            </div>
            <div className="brand-text">
              <span className="brand-title">Control Center</span>
              <span className="brand-subtitle">Business Intelligence</span>
            </div>
            {/* Botón para cerrar en pantallas pequeñas */}
            <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <span className="sidebar-section-label">Módulos Principales</span>

          <nav className="sidebar-nav">
            <button 
              className={`tab-btn ${activeTab === 'pandas' ? 'active' : ''}`} 
              onClick={() => handleTabChange('pandas')}
            >
              <Table size={18} /> <span>1. Pandas (CSV)</span>
            </button>

            <button 
              className={`tab-btn ${activeTab === 'numpy' ? 'active' : ''}`} 
              onClick={() => handleTabChange('numpy')}
            >
              <Binary size={18} /> <span>2. NumPy (Métricas)</span>
            </button>

            <button 
              className={`tab-btn ${activeTab === 'reportes' ? 'active' : ''}`} 
              onClick={() => handleTabChange('reportes')}
            >
              <BarChart3 size={18} /> <span>3. Reportes Gráficos</span>
            </button>

            <button 
              className={`tab-btn ${activeTab === 'pn' ? 'active' : ''}`} 
              onClick={() => handleTabChange('pn')}
            >
              <Layers size={18} /> <span>4. Pandas & NumPy</span>
            </button>
          </nav>
        </div>

        {/* PARTE INFERIOR DEL SIDEBAR (PERFIL + LOGOUT) */}
        <div className="sidebar-bottom">
          <div className="sidebar-user-card">
            <div className="user-avatar-small">
              <User size={14} />
            </div>
            <div className="user-details">
              <span className="user-name-small">Admin Usuario</span>
              <span className="user-status-online">En línea</span>
            </div>
          </div>

          <button className="tab-btn btn-logout-sidebar" onClick={() => setShowLogoutModal(true)}>
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL CON BOTÓN MENÚ MÓVIL */}
      <div className="content-wrapper">
        <header className="mobile-header">
          <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={22} />
          </button>
          <span className="mobile-header-title">Control Center</span>
        </header>

        <main className="main-viewport">
          {activeTab === 'pandas' && <Operacion1 data={data} headers={headers} onDataLoaded={handleDataLoaded} />}
          {activeTab === 'numpy' && <Operacion2 data={data} />}
          {activeTab === 'reportes' && <Operacion3 data={data} headers={headers} />}
          {activeTab === 'pn' && <Operacion4 data={data} headers={headers} />}
        </main>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {showLogoutModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-icon-warning">
              <LogOut size={24} />
            </div>
            <h3>Cerrar Sesión</h3>
            <p>¿Está seguro de que desea salir del sistema de control?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowLogoutModal(false)}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={executeLogout}>
                Sí, Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;