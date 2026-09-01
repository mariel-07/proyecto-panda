
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

import "./Estilos/Layout.css";

const Layout = () => {
  return (
    <div className="app-layout">

      {/* NAVBAR */}
      <header className="app-navbar">
        <Navbar />
      </header>

      {/* CUERPO PRINCIPAL */}
      <div className="app-body">

        {/* SIDEBAR */}
        <aside className="app-sidebar">
          <Sidebar />
        </aside>

        {/* CONTENIDO */}
        <main className="app-content">

          <div className="app-content-inner">
            <Outlet />
          </div>

          {/* FOOTER */}
          <footer className="app-footer">
            <Footer />
          </footer>

        </main>

      </div>

    </div>
  );
};

export default Layout;

