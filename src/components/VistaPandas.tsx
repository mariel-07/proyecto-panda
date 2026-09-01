
import React, { useState } from "react";
import "./Estilos/VistaPandas.css";

type Valor = string | number;
type Fila = Record<string, Valor>;

interface ColumnaNumerica {
  nombre: string;
  indice: number;
}

const VistaPandas: React.FC = () => {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [datos, setDatos] = useState<Fila[]>([]);
  const [encabezados, setEncabezados] = useState<string[]>([]);
  const [datosOriginales, setDatosOriginales] = useState<Fila[]>([]);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // ========================================
  // DETECTAR SEPARADOR
  // ========================================

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
      setError(
        "Selecciona un archivo CSV válido."
      );
      return;
    }

    setArchivo(file);
    setError("");
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
  // ORDENAR
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
  // ESTADÍSTICAS
  // ========================================

  const obtenerEstadisticas = (
    columna: string
  ) => {
    const valores =
      datosOriginales
        .map(
          (fila) =>
            fila[columna]
        )
        .filter(
          (valor) =>
            typeof valor ===
            "number"
        ) as number[];

    if (valores.length === 0) {
      return null;
    }

    const total =
      valores.reduce(
        (suma, valor) =>
          suma + valor,
        0
      );

    const promedio =
      total / valores.length;

    const maximo =
      Math.max(...valores);

    const minimo =
      Math.min(...valores);

    return {
      total,
      promedio,
      maximo,
      minimo,
    };
  };

  // ========================================
  // LIMPIAR
  // ========================================

  const limpiar = () => {
    setArchivo(null);
    setDatos([]);
    setDatosOriginales([]);
    setEncabezados([]);
    setError("");
    setBusqueda("");
  };

  // ========================================
  // INTERFAZ
  // ========================================

  return (
    <div className="pandas-container">

      {/* ENCABEZADO */}

      <div className="pandas-header">
        <h1>
          Análisis con Pandas
        </h1>

        <p>
          Carga cualquier archivo CSV
          para explorar y analizar
          sus datos.
        </p>
      </div>

      {/* CONTENIDO PRINCIPAL */}

      <div className="pandas-layout">

        {/* ==================================
            COLUMNA PRINCIPAL
        ================================== */}

        <main className="pandas-main">

          {/* ARCHIVO */}

          <div className="pandas-card">

            <label className="numpy-upload">
              Seleccionar archivo
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
              <p className="mensaje-error">
                {error}
              </p>
            )}

          </div>

          {/* INFORMACIÓN */}

          {datosOriginales.length > 0 && (
            <div className="pandas-card">


              <div className="info-grid">

                <div className="info-item">
                  <span>Registros</span>
                  <strong>
                    {datosOriginales.length}
                  </strong>
                </div>

                <div className="info-item">
                  <span>Columnas</span>
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

          {/* TABLA */}

          {datosOriginales.length > 0 && (
            <div className="pandas-card">

              <div className="table-container">

                <table>

                  <thead>
                    <tr>
                      {encabezados.map(
                        (encabezado) => (
                          <th
                            key={encabezado}
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

        </main>

        {/* ==================================
            BARRA LATERAL
        ================================== */}

        {datosOriginales.length > 0 && (
          <aside className="pandas-sidebar">

            {/* BÚSQUEDA */}

            <div className="pandas-card">


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

              <p className="resultado-contador">
                Mostrando{" "}
                <strong>
                  {datosFiltrados.length}
                </strong>{" "}
                de{" "}
                <strong>
                  {datos.length}
                </strong>{" "}
                registros
              </p>

            </div>

            {/* OPERACIONES */}

            <div className="pandas-card">


              <div className="operaciones">

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

            {/* ESTADÍSTICAS */}

            {columnasNumericas.length > 0 && (
              <div className="pandas-card">

                {columnasNumericas.map(
                  (columna) => {

                    const estadisticas =
                      obtenerEstadisticas(
                        columna.nombre
                      );

                    if (!estadisticas) {
                      return null;
                    }

                    return (
                      <div
                        className="estadistica"
                        key={
                          columna.nombre
                        }
                      >

                        <h3>
                          {
                            columna.nombre
                          }
                        </h3>

                        <div>
                          <span>Total</span>
                          <strong>
                            {estadisticas.total.toFixed(
                              2
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Promedio</span>
                          <strong>
                            {estadisticas.promedio.toFixed(
                              2
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Máximo</span>
                          <strong>
                            {estadisticas.maximo.toFixed(
                              2
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Mínimo</span>
                          <strong>
                            {estadisticas.minimo.toFixed(
                              2
                            )}
                          </strong>
                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </aside>
        )}

      </div>

    </div>
  );
};

export default VistaPandas;

