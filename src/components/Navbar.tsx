import {
  Bell,
  Search,
  UserCircle,
} from "lucide-react";

import "./Estilos/Narbar.css";

const Navbar = () => {
  return (
    <header className="navbar">

      <div className="navbar-search">
        <h1>PANDAS</h1>

        <Search size={18} />

        <input
          type="text"
          placeholder="Buscar..."
        />

      </div>


      <div className="navbar-actions">

        <button className="navbar-icon">
          <Bell size={19} />
        </button>

        <div className="navbar-user">

          <UserCircle size={34} />

          <div>
            <strong>
              Usuario
            </strong>

            <span>
              Administrador
            </span>
          </div>

        </div>

      </div>

    </header>
  );
};

export default Navbar;