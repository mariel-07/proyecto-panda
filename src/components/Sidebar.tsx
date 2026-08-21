import React from 'react';
import { NavLink } from 'react-router-dom';
import { Table, Binary, BarChart3, Layers, LogOut, FileSpreadsheet } from 'lucide-react';
import '../Dashboard.css';

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar-left">
      <div className="brand-header">
        <FileSpreadsheet size={20} className="brand-icon" />
        <span>Control Center</span>
      </div>

      <h3>Navegación</h3>
      <nav className="sidebar-nav">
        <NavLink to="/operacion1" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
          <Table size={16} />
          <span>Pandas</span>
        </NavLink>
        <NavLink to="/operacion2" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
          <Binary size={16} />
          <span>NumPy</span>
        </NavLink>
        <NavLink to="/operacion3" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
          <BarChart3 size={16} />
          <span>Reportes</span>
        </NavLink>
        <NavLink to="/operacion4" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
          <Layers size={16} />
          <span>Pandas & NumPy</span>
        </NavLink>
        <NavLink to="/logout" className="tab-btn btn-logout">
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </NavLink>
      </nav>
    </aside>
  );
};