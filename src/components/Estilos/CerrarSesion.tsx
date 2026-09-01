
import { useNavigate } from "react-router-dom";

const CerrarSesion = () => {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem("panda_autenticado");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <button
      type="button"
      onClick={cerrarSesion}
      className="btn-cerrar-sesion"
    >
      Cerrar sesión
    </button>
  );
};

export default CerrarSesion;
