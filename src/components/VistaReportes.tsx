
import "./Estilos/VistaReportes.css";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const actividadData = [
  { dia: "Lun", actividad: 120 },
  { dia: "Mar", actividad: 180 },
  { dia: "Mié", actividad: 150 },
  { dia: "Jue", actividad: 220 },
  { dia: "Vie", actividad: 260 },
  { dia: "Sáb", actividad: 190 },
  { dia: "Dom", actividad: 145 },
];

const rendimientoData = [
  { modulo: "Pandas", rendimiento: 92 },
  { modulo: "NumPy", rendimiento: 95 },
  { modulo: "Voz", rendimiento: 88 },
  { modulo: "Imagen", rendimiento: 94 },
];

const modulosData = [
  { nombre: "Pandas / NumPy", valor: 45 },
  { nombre: "Reconocimiento Voz", valor: 30 },
  { nombre: "Procesamiento Imagen", valor: 25 },
];

const COLORES = ["#2563eb", "#10b981", "#f59e0b"];

const VistaReportes = () => {
  return (
    <div className="reportes-container">

      {/* ========================================
          ENCABEZADO
      ======================================== */}

      <div className="reportes-header">
        <div>
          <h1>Reporte General de Rendimiento</h1>

          <p>
            Análisis general del rendimiento de los
            módulos de PANDA.
          </p>
        </div>

        <button
          type="button"
          className="btn-exportar"
          onClick={() => window.print()}
        >
          Exportar Reporte
        </button>
      </div>

      {/* ========================================
          DISTRIBUCIÓN PRINCIPAL
      ======================================== */}

      <div className="reportes-layout">

        {/* ======================================
            CONTENIDO PRINCIPAL
        ====================================== */}

        <main className="reportes-main">

          {/* ====================================
              TARJETAS DE RESUMEN
          ==================================== */}

          <div className="resumen-grid">

            <div className="resumen-card">
              <span>Total de Registros</span>

              <strong className="valor-azul">
                1,245
              </strong>

              <small>
                Registros procesados
              </small>
            </div>

            <div className="resumen-card">
              <span>Precisión Promedio</span>

              <strong className="valor-verde">
                94.8%
              </strong>

              <small>
                Rendimiento general
              </small>
            </div>

            <div className="resumen-card">
              <span>Tiempo de Respuesta</span>

              <strong className="valor-naranja">
                0.42s
              </strong>

              <small>
                Tiempo promedio
              </small>
            </div>

            <div className="resumen-card">
              <span>Módulos Activos</span>

              <strong className="valor-morado">
                4
              </strong>

              <small>
                Módulos analizados
              </small>
            </div>

          </div>

          {/* ====================================
              GRÁFICO DE ACTIVIDAD
          ==================================== */}

          <section className="reporte-card grafico-grande">

            <div className="card-header">
              <div>
                <h4>
                  Tendencia de Actividad
                </h4>

                <p>
                  Cantidad de registros procesados
                  durante la semana.
                </p>
              </div>
            </div>

            <div className="grafico">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart data={actividadData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="dia" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="actividad"
                    name="Actividad"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />

                </LineChart>
              </ResponsiveContainer>

            </div>

          </section>

          {/* ====================================
              GRÁFICO DE RENDIMIENTO
          ==================================== */}

          <section className="reporte-card">

            <div className="card-header">

              <h4>
                Rendimiento por Módulo
              </h4>

              <p>
                Precisión promedio de cada módulo.
              </p>

            </div>

            <div className="grafico">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={rendimientoData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="modulo" />

                  <YAxis domain={[0, 100]} />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="rendimiento"
                    name="Precisión (%)"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>

          </section>

          {/* ====================================
              TABLA
          ==================================== */}

          <section className="reporte-card tabla-reporte">

            <div className="card-header">

              <h4>
                Detalle de Rendimiento
              </h4>

              <p>
                Resultados obtenidos por cada módulo.
              </p>

            </div>

            <div className="tabla-container">

              <table>

                <thead>
                  <tr>
                    <th>Módulo</th>
                    <th>Precisión</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>

                  {rendimientoData.map((modulo) => (

                    <tr key={modulo.modulo}>

                      <td>
                        <strong>
                          {modulo.modulo}
                        </strong>
                      </td>

                      <td>
                        {modulo.rendimiento}%
                      </td>

                      <td>

                        <span
                          className={
                            modulo.rendimiento >= 90
                              ? "estado-excelente"
                              : "estado-bueno"
                          }
                        >
                          {modulo.rendimiento >= 90
                            ? "Excelente"
                            : "Bueno"}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>

        </main>

        {/* ======================================
            BARRA LATERAL
        ====================================== */}

        <aside className="reportes-sidebar">

          {/* ====================================
              OPERACIONES
          ==================================== */}

          <div className="reporte-card">

            <div className="card-header">

              <p>
                Acciones disponibles.
              </p>

            </div>

            <div className="operaciones-reportes">

            </div>

          </div>

          {/* ====================================
              DISTRIBUCIÓN POR MÓDULOS
          ==================================== */}

          <div className="reporte-card">

            <div className="card-header">

              <h4>
                Distribución por Módulos
              </h4>

              <p>
                Utilización del sistema.
              </p>

            </div>

            <div className="grafico grafico-pie">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={modulosData}
                    dataKey="valor"
                    nameKey="nombre"
                    cx="50%"
                    cy="45%"
                    outerRadius={80}
                    label
                  >

                    {modulosData.map(
                      (_, index) => (
                        <Cell
                          key={index}
                          fill={COLORES[index]}
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>
              </ResponsiveContainer>

            </div>

          </div>

          {/* ====================================
              RESUMEN POR MÓDULOS
          ==================================== */}

          <div className="reporte-card">

            <div className="card-header">

              <h4>
                Resumen por Módulos
              </h4>

              <p>
                Distribución actual.
              </p>

            </div>

            <div className="modulos-lista">

              {modulosData.map(
                (modulo, index) => (

                  <div
                    className="modulo-item"
                    key={modulo.nombre}
                  >

                    <div className="modulo-info">

                      <span
                        className="modulo-indicador"
                        style={{
                          backgroundColor:
                            COLORES[index],
                        }}
                      />

                      <span>
                        {modulo.nombre}
                      </span>

                    </div>

                    <strong>
                      {modulo.valor}%
                    </strong>

                  </div>

                )
              )}

            </div>

            {/* BARRAS DE PROGRESO */}

            <div className="progreso-container">

              {modulosData.map(
                (modulo, index) => (

                  <div
                    className="progreso-item"
                    key={modulo.nombre}
                  >

                    <div className="progreso-titulo">

                      <span>
                        {modulo.nombre}
                      </span>

                      <strong>
                        {modulo.valor}%
                      </strong>

                    </div>

                    <div className="progreso-barra">

                      <div
                        className="progreso-valor"
                        style={{
                          width:
                            `${modulo.valor}%`,
                          backgroundColor:
                            COLORES[index],
                        }}
                      />

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

          {/* ====================================
              ESTADO DEL SISTEMA
          ==================================== */}

          <div className="reporte-card estado-sistema">

            <div className="card-header">

              <h4>
                Estado del Sistema
              </h4>

            </div>

            <div className="estado-item">

              <div>
                <strong>
                  Sistema operativo: 
                </strong>

                <small>
                  Todos los módulos funcionando.
                </small>
              </div>

            </div>

            <div className="estado-item">

              <div>
                <strong>
                  Procesamiento:   
                </strong>

                <small>
                  Rendimiento estable.
                </small>
              </div>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
};

export default VistaReportes;

