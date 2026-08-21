import React, { useState } from 'react';
import { Bell, User, LogOut, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onLogout: () => void;
}

export function Navbar({ onLogout }: NavbarProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirmLogout = () => {
    localStorage.removeItem("isAuthenticated");
    onLogout();
  };

  return (
    <>
      <header className="top-navbar">
        <div className="navbar-left">
          <div className="badge-status">
            <ShieldCheck size={14} className="status-icon" />
            <span>Empresarial V2.4</span>
          </div>
          <h1 className="navbar-title">Panel de Control & Analytics</h1>
        </div>

        <div className="navbar-right">
          <button className="icon-btn" title="Notificaciones">
            <Bell size={18} />
          </button>
          
          <div className="user-profile">
            <div className="avatar">
              <User size={16} />
            </div>
            <div className="user-info">
              <span className="user-name">Administrador</span>
              <span className="user-role">Sistemas & Datos</span>
            </div>
          </div>
        </div>
      </header>

      {/* Modal Modal de Cierre de Sesión Profesional */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>¿Cerrar Sesión?</h3>
            <p>Se finalizará su sesión actual de trabajo y volverá al login.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={handleConfirmLogout}>
                Sí, Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
