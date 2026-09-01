
import React, { useState } from "react";
import "./Estilos/VistasNumpy.css";

type Valor = string | number;

type Fila = Record<string, Valor>;

interface ResultadoNumpy {
  dimensiones: number[];
  cantidad_elementos: number;
  tipo_dato: string;
  media: number;
  mediana: number;
  maximo: number;
  minimo: number;
  suma: number;
  desviacion_estandar: number;
  normalizado: number[];
  ordenado: number[];
}

const VistaNumpy: React.FC = () => {
  const [archivo, setArchivo] = useState<File | null>(null);

  const [datos, setDatos] = useState<Fila[]>([]);
  const [datosOriginales, setDatosOriginales] = useState<Fila[]>([]);
  const [encabezados, setEncabezados] = useState<string[]>([]);

  const [columnaSeleccionada, setColumnaSeleccionada] =
    useState<string>("");

  const [resultado, setResultado] =
    useState<ResultadoNumpy | null>(null);

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // =====================================================
  // DETECTAR SEPARADOR
  // =====================================================

  const detectarSeparador = (linea: string): string => {
    const separadores = [",", ";", "\t", "|"];

    let mejorSeparador = ",";
    let mayorCantidad = 0;

    separadores.forEach((separador) => {
      const cantidad = linea.split(separador).length;

      if (cantidad > mayorCantidad) {
        mayorCantidad = cantidad;
        mejorSeparador = separador;
      }
    });

    return mejorSeparador;
  };

  // =====================================================
  // SEPARAR CSV RESPETANDO COMILLAS
  // =====================================================

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

  // =====================================================
  // CONVERTIR VALORES
  // =====================================================

  const convertirValor = (valor: string): Valor => {
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

  // =====================================================
  // CARGAR CSV
  // =====================================================

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
    setColumnaSeleccionada("");

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

        // Detectar separador
        const separador =
          detectarSeparador(lineas[0]);

        // =================================================
        // ENCABEZADOS
        // =================================================

        let headers = separarCSV(
          lineas[0],
          separador
        );

        const usados =
          new Map<string, number>();

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

        // =================================================
        // DATOS
        // =================================================

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

        // Seleccionar automáticamente
        // la primera columna numérica
        const primeraNumerica =
          headers.find((header) =>
            filas.some(
              (fila) =>
                typeof fila[header] ===
                "number"
            )
          );

        if (primeraNumerica) {
          setColumnaSeleccionada(
            primeraNumerica
          );
        }
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

  // =====================================================
  // COLUMNAS NUMÉRICAS
  // =====================================================

  const columnasNumericas =
    encabezados.filter((columna) => {
      const valores =
        datosOriginales
          .map(
            (fila) =>
              fila[columna]
          )
          .filter(
            (valor) =>
              valor !== ""
          );

      return valores.some(
        (valor) =>
          typeof valor === "number"
      );
    });

  // =====================================================
  // DATOS FILTRADOS
  // =====================================================

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

  // =====================================================
  // OBTENER DATOS NUMÉRICOS
  // =====================================================

  const obtenerValoresNumericos = (
    columna: string
  ): number[] => {
    return datosOriginales
      .map(
        (fila) =>
          fila[columna]
      )
      .filter(
        (valor): valor is number =>
          typeof valor === "number"
      );
  };

  // =====================================================
  // ANALIZAR CON NUMPY
  // =====================================================

  const analizarArchivo = async () => {
    if (!archivo) {
      setError(
        "Primero selecciona un archivo CSV."
      );

      return;
    }

    if (!columnaSeleccionada) {
      setError(
        "Selecciona una columna numérica."
      );

      return;
    }

    setCargando(true);
    setError("");

    const valores =
      obtenerValoresNumericos(
        columnaSeleccionada
      );

    if (valores.length === 0) {
      setError(
        "La columna seleccionada no contiene datos numéricos."
      );

      setCargando(false);

      return;
    }

    const formData = new FormData();

    formData.append(
      "archivo",
      archivo
    );

    formData.append(
      "columna",
      columnaSeleccionada
    );

    try {
      const respuesta = await fetch(
        "http://localhost:8000/analizar-numpy",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!respuesta.ok) {
        throw new Error(
          "Error del servidor."
        );
      }

      const datosResultado =
        await respuesta.json();

      setResultado(
        datosResultado
      );
    } catch (error) {
      console.error(error);

      // ================================================
      // ANÁLISIS LOCAL COMO RESPALDO
      // ================================================

      const suma =
        valores.reduce(
          (a, b) => a + b,
          0
        );

      const promedio =
        suma / valores.length;

      const ordenado =
        [...valores].sort(
          (a, b) => a - b
        );

      const mitad =
        Math.floor(
          ordenado.length / 2
        );

      const mediana =
        ordenado.length % 2 === 0
          ? (ordenado[mitad - 1] +
              ordenado[mitad]) /
            2
          : ordenado[mitad];

      const maximo =
        Math.max(...valores);

      const minimo =
        Math.min(...valores);

      const varianza =
        valores.reduce(
          (suma, valor) =>
            suma +
            Math.pow(
              valor - promedio,
              2
            ),
          0
        ) / valores.length;

      const desviacion =
        Math.sqrt(varianza);

      const rango =
        maximo - minimo;

      const normalizado =
        rango === 0
          ? valores.map(() => 0)
          : valores.map(
              (valor) =>
                (valor - minimo) /
                rango
            );

      setResultado({
        dimensiones: [
          valores.length,
        ],
        cantidad_elementos:
          valores.length,
        tipo_dato: "float64",
        media: promedio,
        mediana,
        maximo,
        minimo,
        suma,
        desviacion_estandar:
          desviacion,
        normalizado,
        ordenado,
      });
    } finally {
      setCargando(false);
    }
  };

  // =====================================================
  // MOSTRAR PRIMERAS 5
  // =====================================================

  const mostrarPrimeras5 = () => {
    setDatos(
      datosOriginales.slice(0, 5)
    );
  };

  // =====================================================
  // ORDENAR
  // =====================================================

  const ordenarDatos = () => {
    if (!columnaSeleccionada) {
      return;
    }

    const ordenados =
      [...datos].sort(
        (a, b) =>
          Number(
            b[columnaSeleccionada]
          ) -
          Number(
            a[columnaSeleccionada]
          )
      );

    setDatos(ordenados);
  };

  // =====================================================
  // RESTABLECER
  // =====================================================

  const restablecer = () => {
    setDatos(
      datosOriginales
    );

    setBusqueda("");
  };

  // =====================================================
  // LIMPIAR
  // =====================================================

  const limpiar = () => {
    setArchivo(null);
    setDatos([]);
    setDatosOriginales([]);
    setEncabezados([]);
    setResultado(null);
    setError("");
    setBusqueda("");
    setColumnaSeleccionada("");
  };

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <div className="vista-numpy">

      {/* ENCABEZADO */}

      <div className="numpy-header">

        <h1>
          Análisis con NumPy
        </h1>

        <p>
          Carga cualquier archivo CSV
          para analizar sus datos
          numéricos con NumPy.
        </p>

      </div>

      {/* CONTENIDO */}

      <div className="numpy-layout">

        {/* ============================================
            CONTENIDO PRINCIPAL
        ============================================ */}

        <main className="numpy-main">

          {/* ARCHIVO */}

          <div className="numpy-card">

            <label className="numpy-upload">

              Elegir archivo

              <input
                type="file"
                accept=".csv"
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
              <p className="numpy-error">
                {error}
              </p>
            )}

          </div>

          {/* INFORMACIÓN */}

          {datosOriginales.length > 0 && (
            <div className="numpy-card">

              <div className="numpy-info-grid">

                <div className="numpy-info-item">
                  <span>
                    Registros
                  </span>

                  <strong>
                    {datosOriginales.length}
                  </strong>
                </div>

                <div className="numpy-info-item">
                  <span>
                    Columnas
                  </span>

                  <strong>
                    {encabezados.length}
                  </strong>
                </div>

                <div className="numpy-info-item">
                  <span>
                    Numéricas
                  </span>

                  <strong>
                    {columnasNumericas.length}
                  </strong>
                </div>

              </div>

            </div>
          )}

          {/* TABLA */}

          {datosOriginales.length > 0 && (
            <div className="numpy-card">

              <div className="numpy-table-container">

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
                            {
                              encabezado
                            }
                          </th>
                        )
                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {datosFiltrados.map(
                      (
                        fila,
                        indice
                      ) => (
                        <tr
                          key={
                            indice
                          }
                        >

                          {encabezados.map(
                            (
                              encabezado
                            ) => (
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

        </main>

        {/* ============================================
            BARRA LATERAL
        ============================================ */}

        {datosOriginales.length > 0 && (
          <aside className="numpy-sidebar">

            {/* BÚSQUEDA */}

            <div className="numpy-card">

              <input
                type="text"
                placeholder="Buscar en el CSV..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
              />

              <p className="numpy-counter">

                Mostrando{" "}

                <strong>
                  {
                    datosFiltrados.length
                  }
                </strong>{" "}

                de{" "}

                <strong>
                  {datos.length}
                </strong>{" "}

                registros

              </p>

            </div>

            {/* COLUMNA */}

            <div className="numpy-card">

              <label className="numpy-label">

                Columna numérica

              </label>

              <select
                value={
                  columnaSeleccionada
                }
                onChange={(e) =>
                  setColumnaSeleccionada(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Seleccionar columna
                </option>

                {columnasNumericas.map(
                  (columna) => (
                    <option
                      key={
                        columna
                      }
                      value={
                        columna
                      }
                    >
                      {columna}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* OPERACIONES */}

            <div className="numpy-card">

              <div className="numpy-operaciones">

                <button
                  type="button"
                  onClick={
                    analizarArchivo
                  }
                  disabled={
                    !columnaSeleccionada ||
                    cargando
                  }
                >
                  {cargando
                    ? "Analizando..."
                    : "Analizar con NumPy"}
                </button>

                <button
                  type="button"
                  onClick={
                    mostrarPrimeras5
                  }
                >
                  Ver primeras 5
                </button>

                <button
                  type="button"
                  onClick={
                    ordenarDatos
                  }
                >
                  Ordenar datos
                </button>

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
                  onClick={
                    limpiar
                  }
                >
                  Limpiar archivo
                </button>

              </div>

            </div>

            {/* RESULTADOS NUMPY */}

            {resultado && (
              <div className="numpy-card">

                <div className="numpy-resultados">

                  <h2>
                    Resultados NumPy
                  </h2>

                  <div className="numpy-stat">

                    <span>
                      Shape
                    </span>

                    <strong>
                      (
                      {
                        resultado
                          .dimensiones
                          .join(", ")
                      }
                      )
                    </strong>

                  </div>

                  <div className="numpy-stat">

                    <span>
                      Size
                    </span>

                    <strong>
                      {
                        resultado
                          .cantidad_elementos
                      }
                    </strong>

                  </div>

                  <div className="numpy-stat">

                    <span>
                      Dtype
                    </span>

                    <strong>
                      {
                        resultado
                          .tipo_dato
                      }
                    </strong>

                  </div>

                  <div className="numpy-stat">

                    <span>
                      Suma
                    </span>

                    <strong>
                      {
                        resultado.suma.toFixed(
                          2
                        )
                      }
                    </strong>

                  </div>

                  <div className="numpy-stat">

                    <span>
                      Media
                    </span>

                    <strong>
                      {
                        resultado.media.toFixed(
                          2
                        )
                      }
                    </strong>

                  </div>

                  <div className="numpy-stat">

                    <span>
                      Mediana
                    </span>

                    <strong>
                      {
                        resultado.mediana.toFixed(
                          2
                        )
                      }
                    </strong>

                  </div>

                  <div className="numpy-stat">

                    <span>
                      Máximo
                    </span>

                    <strong>
                      {
                        resultado.maximo.toFixed(
                          2
                        )
                      }
                    </strong>

                  </div>

                  <div className="numpy-stat">

                    <span>
                      Mínimo
                    </span>

                    <strong>
                      {
                        resultado.minimo.toFixed(
                          2
                        )
                      }
                    </strong>

                  </div>

                  <div className="numpy-stat">

                    <span>
                      Desv. estándar
                    </span>

                    <strong>
                      {
                        resultado
                          .desviacion_estandar
                          .toFixed(2)
                      }
                    </strong>

                  </div>

                </div>

              </div>
            )}

          </aside>
        )}

      </div>

    </div>
  );
};

export default VistaNumpy;
