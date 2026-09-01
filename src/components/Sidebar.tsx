
import {
  Table,
  Binary,
  Combine,
  Image,
  Mic,
  PersonStanding,
  FolderOpen,
  BarChart3,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import "./Estilos/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const menu = [
    {
      nombre: "Pandas",
      ruta: "/pandas",
      icono: Table,
    },
    {
      nombre: "Numpy",
      ruta: "/numpy",
      icono: Binary,
    },
    {
      nombre: "Pandas + Numpy",
      ruta: "/pandas-numpy",
      icono: Combine,
    },
    {
      nombre: "Reportes",
      ruta: "/reportes",
      icono: BarChart3,
    },
    {
      nombre: "Reconocimiento de Imagen",
      ruta: "/reconocimiento-imagen",
      icono: Image,
    },
    {
      nombre: "Reconocimiento de Voz",
      ruta: "/reconocimiento-voz",
      icono: Mic,
    },
    {
      nombre: "Reconocimiento de Movimiento",
      ruta: "/reconocimiento-movimiento",
      icono: PersonStanding,
    },
    {
      nombre: "Documentos",
      ruta: "/documentos",
      icono: FolderOpen,
    },
    
  ];

  const cerrarSesion = () => {
    localStorage.removeItem("panda_autenticado");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">

      </div>


      {/* MENÚ */}
      <nav className="sidebar-menu">

        <span className="menu-title">
          MENÚ PRINCIPAL
        </span>

        {menu.map((item) => {

          const Icon = item.icono;

          return (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
            >

              <Icon size={19} />

              <span>
                {item.nombre}
              </span>

            </NavLink>
          );

        })}

      </nav>


      {/* CERRAR SESIÓN */}
      <div className="sidebar-footer">

        <button
          type="button"
          className="logout-button"
          onClick={cerrarSesion}
        >

          <LogOut size={19} />

          <span>
            Cerrar sesión
          </span>

        </button>

      </div>

    </aside>
  );
};

export default Sidebar;

