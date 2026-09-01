import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Estilos/Login.css";

const Login = () => {

  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const iniciarSesion = (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    setError("");

    const usuarioCorrecto = "admin";
    const passwordCorrecta = "123456";

    if (
      usuario === usuarioCorrecto &&
      password === passwordCorrecta
    ) {

      localStorage.setItem(
        "panda_autenticado",
        "true"
      );

      navigate("/dashboard");

    } else {

      setError(
        "Usuario o contraseña incorrectos."
      );

    }
  };

  return (
    <div className="login-container">

      <div className="login-card">

        <div className="login-header">

          <div className="login-logo">
            🐼
          </div>

          <h1>PANDA</h1>

          <p>
            Sistema de Control
          </p>

        </div>

        <form
          className="login-form"
          onSubmit={iniciarSesion}
        >

          <div className="form-group">

            <label htmlFor="usuario">
              Usuario
            </label>

            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) =>
                setUsuario(e.target.value)
              }
              placeholder="Ingresa tu usuario"
              autoComplete="username"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              required
            />

          </div>

          {error && (
            <div className="login-error">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
          >
            Iniciar sesión
          </button>

        </form>

      </div>

    </div>
  );
};

export default Login;