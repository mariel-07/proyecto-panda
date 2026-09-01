
import React, { useState } from "react";
import "./Estilos/VistasPandasNumpy.css";

type Valor = string | number;

type Fila = Record<string, Valor>;

interface ColumnaNumerica {
  nombre: string;
  indice: number;
}

interface Estadisticas {
  columna: string;
  media: number;
  mediana: number;
  desviacion_estandar: number;
  minimo: number;
  maximo: number;
}

interface ResultadoPandasNumpy {
  filas: number;
  columnas: number;
  nombres_columnas: string[];
  tipos_datos: {
    columna: string;
    tipo: string;
  }[];
  estadisticas: Estadisticas[];
  valores_atipicos: {
    columna: string;
    cantidad: number;
    valores: number[];
  }[];
  correlaciones: {
    columna_1: string;
    columna_2: string;
    valor: number;
  }[];
}

const VistaPandasNumpy: React.FC = () => {
  const [archivo, setArchivo] = useState<File | null>(null);

  const [datos, setDatos] = useState<Fila[]>([]);

  const [datosOriginales, setDatosOriginales] =
    useState<Fila[]>([]);

  const [encabezados, setEncabezados] =
    useState<string[]>([]);

  const [resultado, setResultado] =
    useState<ResultadoPandasNumpy | null>(null);

  const [busqueda, setBusqueda] = useState("");

  const [error, setError] = useState("");

  const [cargando, setCargando] = useState(false);

  // ========================================
  // DETECTAR SEPARADOR
  // ========================================

  const detectarSeparador = (linea: string): string => {
    const separadores = [",", ";", "\t", "|"];

    let mejorSeparador = ",";

    let mayorCantidad = 0;

    separadores.forEach((separador) => {
      const cantidad =
        linea.split(separador).length;

      if (cantidad > mayorCantidad) {
        mayorCantidad = cantidad;
        mejorSeparador = separador;
      }
    });

    return mejorSeparador;
  };

  // ========================================
  // SEPARAR CSV
  // ========================================

  const separarCSV = (
    linea: string,
    separador: string
  ): string[] => {
    const resultado: string[] = [];

    let valor = "";

    let dentroDeComillas = false;

    for (let i = 0; i < linea.length; i++) {
      const caracter = linea[i];

      if (caracter === '"') {
        dentroDeComillas = !dentroDeComillas;
        continue;
      }

      if (
        caracter === separador &&
        !dentroDeComillas
      ) {
        resultado.push(valor.trim());

        valor = "";
      } else {
        valor += caracter;
      }
    }

    resultado.push(valor.trim());

    return resultado;
  };

  // ========================================
  // CONVERTIR VALORES
  // ========================================

  const convertirValor = (
    valor: string
  ): Valor => {
    const limpio = valor
      .trim()
      .replace(/^"|"$/g, "");

    if (limpio === "") {
      return "";
    }

    let numeroTexto = limpio.replace(/\s/g, "");

    if (
      numeroTexto.includes(",") &&
      numeroTexto.includes(".")
    ) {
      const ultimaComa =
        numeroTexto.lastIndexOf(",");

      const ultimoPunto =
        numeroTexto.lastIndexOf(".");

      if (ultimaComa > ultimoPunto) {
        numeroTexto = numeroTexto
          .replace(/\./g, "")
          .replace(",", ".");
      } else {
        numeroTexto =
          numeroTexto.replace(/,/g, "");
      }
    } else if (numeroTexto.includes(",")) {
      numeroTexto =
        numeroTexto.replace(",", ".");
    }

    const numero = Number(numeroTexto);

    if (!Number.isNaN(numero)) {
      return numero;
    }

    return limpio;
  };

  // ========================================
  // CARGAR CSV
  // ========================================

  const cargarCSV = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setArchivo(null);

      setResultado(null);

      setError(
        "Selecciona un archivo CSV válido."
      );

      return;
    }

    setArchivo(file);

    setError("");

    setResultado(null);

    setDatos([]);

    setDatosOriginales([]);

    setEncabezados([]);

    setBusqueda("");

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const texto =
          e.target?.result as string;

        if (!texto) {
          throw new Error(
            "El archivo está vacío."
          );
        }

        const lineas = texto
          .replace(/^\uFEFF/, "")
          .split(/\r?\n/)
          .filter(
            (linea) =>
              linea.trim() !== ""
          );

        if (lineas.length < 2) {
          throw new Error(
            "El CSV no contiene suficientes datos."
          );
        }

        const separador =
          detectarSeparador(lineas[0]);

        // ========================================
        // ENCABEZADOS
        // ========================================

        let headers = separarCSV(
          lineas[0],
          separador
        );

        const usados = new Map<
          string,
          number
        >();

        headers = headers.map(
          (header, index) => {
            let nombre =
              header.trim();

            if (!nombre) {
              nombre =
                `Columna ${index + 1}`;
            }

            const cantidad =
              usados.get(nombre) || 0;

            usados.set(
              nombre,
              cantidad + 1
            );

            if (cantidad > 0) {
              return `${nombre}_${cantidad + 1}`;
            }

            return nombre;
          }
        );

        // ========================================
        // DATOS
        // ========================================

        const filas: Fila[] = [];

        for (
          let i = 1;
          i < lineas.length;
          i++
        ) {
          const valores =
            separarCSV(
              lineas[i],
              separador
            );

          const fila: Fila = {};

          headers.forEach(
            (header, index) => {
              fila[header] =
                convertirValor(
                  valores[index] ?? ""
                );
            }
          );

          filas.push(fila);
        }

        setEncabezados(headers);

        setDatos(filas);

        setDatosOriginales(filas);
      } catch (error) {
        console.error(error);

        setError(
          "No se pudo leer el archivo CSV."
        );
      }
    };

    reader.onerror = () => {
      setError(
        "No se pudo abrir el archivo."
      );
    };

    reader.readAsText(file);
  };

  // ========================================
  // COLUMNAS NUMÉRICAS
  // ========================================

  const columnasNumericas: ColumnaNumerica[] =
    encabezados
      .map((nombre, indice) => ({
        nombre,
        indice,
      }))
      .filter((columna) => {
        const valores =
          datosOriginales
            .map(
              (fila) =>
                fila[columna.nombre]
            )
            .filter(
              (valor) =>
                valor !== ""
            );

        if (valores.length === 0) {
          return false;
        }

        return valores.some(
          (valor) =>
            typeof valor ===
            "number"
        );
      });

  // ========================================
  // BÚSQUEDA
  // ========================================

  const datosFiltrados =
    datos.filter((fila) =>
      Object.values(fila).some(
        (valor) =>
          String(valor)
            .toLowerCase()
            .includes(
              busqueda.toLowerCase()
            )
      )
    );

  // ========================================
  // ORDENAR COLUMNA
  // ========================================

  const ordenarColumna = (
    columna: string
  ) => {
    const ordenados = [
      ...datos,
    ].sort((a, b) => {
      const valorA =
        a[columna];

      const valorB =
        b[columna];

      if (
        typeof valorA ===
          "number" &&
        typeof valorB ===
          "number"
      ) {
        return valorB - valorA;
      }

      return String(
        valorB
      ).localeCompare(
        String(valorA)
      );
    });

    setDatos(ordenados);
  };

  // ========================================
  // PRIMERAS 5
  // ========================================

  const mostrarPrimeras5 = () => {
    setDatos(
      datosOriginales.slice(0, 5)
    );
  };

  // ========================================
  // RESTABLECER
  // ========================================

  const restablecer = () => {
    setDatos(
      datosOriginales
    );

    setBusqueda("");
  };

  // ========================================
  // ANALIZAR CON PANDAS + NUMPY
  // ========================================

  const analizarArchivo = async () => {
    if (!archivo) {
      setError(
        "Primero selecciona un archivo CSV."
      );

      return;
    }

    setCargando(true);

    setError("");

    const datosForm = new FormData();

    datosForm.append(
      "archivo",
      archivo
    );

    try {
      const respuesta = await fetch(
        "http://localhost:8000/analizar-pandas-numpy",
        {
          method: "POST",
          body: datosForm,
        }
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudo analizar el archivo."
        );
      }

      const resultadoServidor =
        await respuesta.json();

      setResultado(
        resultadoServidor
      );
    } catch (error) {
      console.error(error);

      setError(
        "No se pudo conectar con el servidor de Python."
      );
    } finally {
      setCargando(false);
    }
  };

  // ========================================
  // LIMPIAR
  // ========================================

  const limpiar = () => {
    setArchivo(null);

    setDatos([]);

    setDatosOriginales([]);

    setEncabezados([]);

    setResultado(null);

    setBusqueda("");

    setError("");
  };

  // ========================================
  // INTERFAZ
  // ========================================

  return (
    <div className="pandas-numpy-container">

      {/* ==================================
          ENCABEZADO
      ================================== */}

      <div className="pandas-numpy-header">

        <h1>
          Análisis con Pandas + NumPy
        </h1>

        <p>
          Carga cualquier archivo CSV
          para explorar y analizar
          sus datos.
        </p>

      </div>

      {/* ==================================
          CONTENIDO
      ================================== */}

      <div className="pandas-numpy-layout">

        {/* ==================================
            CONTENIDO PRINCIPAL
        ================================== */}

        <main className="pandas-numpy-main">

          {/* ARCHIVO */}

          <div className="pandas-numpy-card">

            <label className="pandas-numpy-upload">

              Elegir archivo

              <input
                type="file"
                accept=".csv,text/csv"
                onChange={cargarCSV}
              />

            </label>

            {archivo && (
              <p>
                Archivo seleccionado:{" "}

                <strong>
                  {archivo.name}
                </strong>
              </p>
            )}

            {error && (
              <p className="mensaje-error">
                {error}
              </p>
            )}

          </div>

          {/* ==================================
              INFORMACIÓN DEL CSV
          ================================== */}

          {datosOriginales.length > 0 && (
            <div className="pandas-numpy-card">

              <div className="info-grid">

                <div className="info-item">
                  <span>
                    Registros
                  </span>

                  <strong>
                    {datosOriginales.length}
                  </strong>
                </div>

                <div className="info-item">
                  <span>
                    Columnas
                  </span>

                  <strong>
                    {encabezados.length}
                  </strong>
                </div>

                <div className="info-item">
                  <span>
                    Columnas numéricas
                  </span>

                  <strong>
                    {columnasNumericas.length}
                  </strong>
                </div>

              </div>

            </div>
          )}

          {/* ==================================
              TABLA
          ================================== */}

          {datosOriginales.length > 0 && (
            <div className="pandas-numpy-card">

              <div className="table-container">

                <table>

                  <thead>

                    <tr>

                      {encabezados.map(
                        (encabezado) => (
                          <th
                            key={
                              encabezado
                            }
                          >
                            {encabezado}
                          </th>
                        )
                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {datosFiltrados.map(
                      (fila, indice) => (
                        <tr
                          key={indice}
                        >

                          {encabezados.map(
                            (encabezado) => (
                              <td
                                key={
                                  encabezado
                                }
                              >
                                {
                                  fila[
                                    encabezado
                                  ]
                                }
                              </td>
                            )
                          )}

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

          {/* ==================================
              RESULTADOS DEL ANÁLISIS
          ================================== */}

          {resultado && (
            <div className="pandas-numpy-card">

              <h2>
                📊 Resultados del análisis
              </h2>

              {/* ESTADÍSTICAS */}

              {resultado.estadisticas.length > 0 && (
                <div className="resultados-seccion">

                  <h4>
                    Estadísticas numéricas
                  </h4>

                  <div className="estadisticas-grid">

                    {resultado.estadisticas.map(
                      (estadistica, index) => (
                        <div
                          className="estadistica"
                          key={index}
                        >

                          <h4>
                            {
                              estadistica.columna
                            }
                          </h4>

                          <div>
                            <span>
                              Media
                            </span>

                            <strong>
                              {estadistica.media.toFixed(
                                2
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Mediana
                            </span>

                            <strong>
                              {estadistica.mediana.toFixed(
                                2
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Desviación estándar
                            </span>

                            <strong>
                              {estadistica.desviacion_estandar.toFixed(
                                2
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Mínimo
                            </span>

                            <strong>
                              {estadistica.minimo.toFixed(
                                2
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Máximo
                            </span>

                            <strong>
                              {estadistica.maximo.toFixed(
                                2
                              )}
                            </strong>
                          </div>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

              {/* VALORES ATÍPICOS */}

              {resultado.valores_atipicos.length > 0 && (
                <div className="resultados-seccion">

                  <h4>
                    ⚠️ Valores atípicos
                  </h4>

                  {resultado.valores_atipicos.map(
                    (dato, index) => (
                      <div
                        className="atipico"
                        key={index}
                      >

                        <h4>
                          {dato.columna}
                        </h4>

                        <p>
                          Cantidad:
                          {" "}
                          <strong>
                            {dato.cantidad}
                          </strong>
                        </p>

                        {dato.valores.length > 0 && (
                          <p>
                            Valores:
                            {" "}
                            {dato.valores.join(
                              ", "
                            )}
                          </p>
                        )}

                      </div>
                    )
                  )}

                </div>
              )}

              {/* CORRELACIONES */}

              {resultado.correlaciones.length > 0 && (
                <div className="resultados-seccion">

                  <h4>
                    🔗 Correlaciones
                  </h4>

                  <div className="correlaciones">

                    {resultado.correlaciones.map(
                      (
                        correlacion,
                        index
                      ) => (
                        <div
                          className="correlacion-item"
                          key={index}
                        >

                          <span>
                            {
                              correlacion.columna_1
                            }
                          </span>

                          <strong>
                            ↔
                          </strong>

                          <span>
                            {
                              correlacion.columna_2
                            }
                          </span>

                          <strong>
                            {correlacion.valor.toFixed(
                              2
                            )}
                          </strong>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>
          )}

        </main>

        {/* ==================================
            BARRA LATERAL
        ================================== */}

        {datosOriginales.length > 0 && (
          <aside className="pandas-numpy-sidebar">

            {/* BÚSQUEDA */}

            <div className="pandas-numpy-card">

              <input
                type="text"
                className="buscador"
                placeholder="Buscar en el CSV..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
              />

              <p className="resultado-contador">

                Mostrando{" "}

                <strong>
                  {datosFiltrados.length}
                </strong>

                {" "}de{" "}

                <strong>
                  {datos.length}
                </strong>

                {" "}registros

              </p>

            </div>

            {/* OPERACIONES */}

            <div className="pandas-numpy-card">

              <div className="operaciones">

                <button
                  type="button"
                  onClick={
                    analizarArchivo
                  }
                  disabled={cargando}
                >
                  {cargando
                    ? "Analizando..."
                    : "Analizar con Pandas + NumPy"}
                </button>

                <button
                  type="button"
                  onClick={
                    mostrarPrimeras5
                  }
                >
                  Ver primeras 5
                </button>

                {columnasNumericas.map(
                  (columna) => (
                    <button
                      type="button"
                      key={
                        columna.nombre
                      }
                      onClick={() =>
                        ordenarColumna(
                          columna.nombre
                        )
                      }
                    >
                      Ordenar{" "}
                      {columna.nombre}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={
                    restablecer
                  }
                >
                  Restablecer
                </button>

                <button
                  type="button"
                  className="btn-limpiar"
                  onClick={limpiar}
                >
                  Limpiar archivo
                </button>

              </div>

            </div>

            {/* INFORMACIÓN */}

            <div className="pandas-numpy-card">

              <h3 className="sidebar-title">
                📋 Información
              </h3>

              <div className="sidebar-info">

                <div>
                  <span>
                    Filas
                  </span>

                  <strong>
                    {datosOriginales.length}
                  </strong>
                </div>

                <div>
                  <span>
                    Columnas
                  </span>

                  <strong>
                    {encabezados.length}
                  </strong>
                </div>

                <div>
                  <span>
                    Numéricas
                  </span>

                  <strong>
                    {columnasNumericas.length}
                  </strong>
                </div>

              </div>

            </div>

          </aside>
        )}

      </div>

    </div>
  );
};

export default VistaPandasNumpy;

