
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Login from "./components/Login";

import Dashboard from "./pages/Dashboard";
import Pandas from "./pages/Pandas";
import Numpy from "./pages/Numpy";
import PandasNumpy from "./pages/PandasNumpy";
import RecoImagen from "./pages/RecoImagen";
import RecoVoz from "./pages/RecoVoz";
import RecoMovimiento from "./pages/RecoMovimiento";
import Documentos from "./pages/Documentos";
import Reportes from "./pages/Reportes";

import "./App.css";

// =====================================================
// PROTECCIÓN DE RUTAS
// =====================================================

interface RutaProtegidaProps {
  children: React.ReactNode;
}

const RutaProtegida = ({
  children,
}: RutaProtegidaProps) => {

  const autenticado =
    localStorage.getItem("panda_autenticado") === "true";

  if (!autenticado) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// =====================================================
// APP
// =====================================================

const App = () => {

  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/"
          element={<Login />}
        />


        {/* =================================================
            SISTEMA PROTEGIDO
        ================================================= */}

        <Route
          element={
            <RutaProtegida>
              <Layout />
            </RutaProtegida>
          }
        >

          {/* DASHBOARD */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* PANDAS */}

          <Route
            path="/pandas"
            element={<Pandas />}
          />


          {/* NUMPY */}

          <Route
            path="/numpy"
            element={<Numpy />}
          />


          {/* PANDAS + NUMPY */}

          <Route
            path="/pandas-numpy"
            element={<PandasNumpy />}
          />


          {/* RECONOCIMIENTO DE IMAGEN */}

          <Route
            path="/reconocimiento-imagen"
            element={<RecoImagen />}
          />


          {/* RECONOCIMIENTO DE VOZ */}

          <Route
            path="/reconocimiento-voz"
            element={<RecoVoz />}
          />


          {/* RECONOCIMIENTO DE MOVIMIENTO */}

          <Route
            path="/reconocimiento-movimiento"
            element={<RecoMovimiento />}
          />


          {/* DOCUMENTOS */}

          <Route
            path="/documentos"
            element={<Documentos />}
          />


          {/* REPORTES */}

          <Route
            path="/reportes"
            element={<Reportes />}
          />

        </Route>


        {/* =================================================
            RUTA NO EXISTENTE
        ================================================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
};

export default App;

