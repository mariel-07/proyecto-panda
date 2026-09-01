
import { useEffect, useState } from "react";
import "./Estilos/VistaDocumentos.css";

interface Documento {
  id: number;
  nombre: string;
  tipo: string;
  tamaño: number;
  archivo: File;
}

const DB_NAME = "PandaDocumentos";
const STORE_NAME = "documentos";

const VistaDocumentos = () => {
  const [documentos, setDocumentos] =
    useState<Documento[]>([]);

  const [documentoSeleccionado, setDocumentoSeleccionado] =
    useState<Documento | null>(null);

  const [cargando, setCargando] =
    useState(true);

  // =====================================================
  // ABRIR / CREAR BASE DE DATOS
  // =====================================================

  const abrirBaseDatos = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const solicitud =
        indexedDB.open(DB_NAME, 1);

      solicitud.onupgradeneeded = () => {
        const db = solicitud.result;

        if (
          !db.objectStoreNames.contains(
            STORE_NAME
          )
        ) {
          db.createObjectStore(
            STORE_NAME,
            {
              keyPath: "id",
            }
          );
        }
      };

      solicitud.onsuccess = () => {
        resolve(solicitud.result);
      };

      solicitud.onerror = () => {
        reject(solicitud.error);
      };
    });
  };

  // =====================================================
  // OBTENER TODOS LOS DOCUMENTOS
  // =====================================================

  const obtenerDocumentos =
    async (): Promise<Documento[]> => {
      const db =
        await abrirBaseDatos();

      return new Promise(
        (resolve, reject) => {
          const transaccion =
            db.transaction(
              STORE_NAME,
              "readonly"
            );

          const almacen =
            transaccion.objectStore(
              STORE_NAME
            );

          const solicitud =
            almacen.getAll();

          solicitud.onsuccess = () => {
            resolve(
              solicitud.result
            );
          };

          solicitud.onerror = () => {
            reject(
              solicitud.error
            );
          };
        }
      );
    };

  // =====================================================
  // GUARDAR DOCUMENTO
  // =====================================================

  const guardarDocumento = async (
    documento: Documento
  ) => {
    const db =
      await abrirBaseDatos();

    return new Promise<void>(
      (resolve, reject) => {
        const transaccion =
          db.transaction(
            STORE_NAME,
            "readwrite"
          );

        const almacen =
          transaccion.objectStore(
            STORE_NAME
          );

        almacen.put(documento);

        transaccion.oncomplete = () => {
          resolve();
        };

        transaccion.onerror = () => {
          reject(
            transaccion.error
          );
        };
      }
    );
  };

  // =====================================================
  // ELIMINAR DOCUMENTO
  // =====================================================

  const eliminarDocumentoBD =
    async (id: number) => {
      const db =
        await abrirBaseDatos();

      return new Promise<void>(
        (resolve, reject) => {
          const transaccion =
            db.transaction(
              STORE_NAME,
              "readwrite"
            );

          const almacen =
            transaccion.objectStore(
              STORE_NAME
            );

          almacen.delete(id);

          transaccion.oncomplete = () => {
            resolve();
          };

          transaccion.onerror = () => {
            reject(
              transaccion.error
            );
          };
        }
      );
    };

  // =====================================================
  // CARGAR DOCUMENTOS
  // =====================================================

  useEffect(() => {
    const cargarDocumentos =
      async () => {
        try {
          const documentosGuardados =
            await obtenerDocumentos();

          setDocumentos(
            documentosGuardados
          );
        } catch (error) {
          console.error(
            "Error al cargar documentos:",
            error
          );
        } finally {
          setCargando(false);
        }
      };

    cargarDocumentos();
  }, []);

  // =====================================================
  // SELECCIONAR ARCHIVOS
  // =====================================================

  const seleccionarArchivos =
    async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const archivos =
        event.target.files;

      if (!archivos) {
        return;
      }

      try {
        const nuevosDocumentos:
          Documento[] = [];

        for (
          const archivo of Array.from(
            archivos
          )
        ) {
          const documento:
            Documento = {
              id:
                Date.now() +
                Math.floor(
                  Math.random() *
                  100000
                ),

              nombre:
                archivo.name,

              tipo:
                archivo.type ||
                "Tipo de archivo desconocido",

              tamaño:
                archivo.size,

              archivo:
                archivo,
            };

          await guardarDocumento(
            documento
          );

          nuevosDocumentos.push(
            documento
          );
        }

        setDocumentos(
          (anteriores) => [
            ...anteriores,
            ...nuevosDocumentos,
          ]
        );
      } catch (error) {
        console.error(
          "Error al guardar archivos:",
          error
        );
      }

      event.target.value = "";
    };

  // =====================================================
  // ELIMINAR DOCUMENTO
  // =====================================================

  const eliminarDocumento =
    async (id: number) => {
      try {
        await eliminarDocumentoBD(
          id
        );

        setDocumentos(
          (anteriores) =>
            anteriores.filter(
              (documento) =>
                documento.id !== id
            )
        );

        if (
          documentoSeleccionado &&
          documentoSeleccionado.id === id
        ) {
          setDocumentoSeleccionado(
            null
          );
        }
      } catch (error) {
        console.error(
          "Error al eliminar documento:",
          error
        );
      }
    };

  // =====================================================
  // DESCARGAR DOCUMENTO
  // =====================================================

  const descargarDocumento = (
    documento: Documento
  ) => {
    const url =
      URL.createObjectURL(
        documento.archivo
      );

    const enlace =
      document.createElement(
        "a"
      );

    enlace.href = url;
    enlace.download =
      documento.nombre;

    document.body.appendChild(
      enlace
    );

    enlace.click();

    document.body.removeChild(
      enlace
    );

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // FORMATEAR TAMAÑO
  // =====================================================

  const mostrarTamaño = (
    bytes: number
  ) => {
    if (bytes < 1024) {
      return `${bytes} Bytes`;
    }

    if (
      bytes <
      1024 * 1024
    ) {
      return `${(
        bytes / 1024
      ).toFixed(2)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  };

  // =====================================================
  // COMPROBAR TIPOS
  // =====================================================

  const esImagen = (
    documento: Documento
  ) => {
    return documento.tipo.startsWith(
      "image/"
    );
  };

  const esPDF = (
    documento: Documento
  ) => {
    return (
      documento.tipo ===
      "application/pdf"
    );
  };

  const esTexto = (
    documento: Documento
  ) => {
    return (
      documento.tipo.startsWith(
        "text/"
      ) ||
      documento.tipo ===
        "application/json"
    );
  };

  const esVideo = (
    documento: Documento
  ) => {
    return documento.tipo.startsWith(
      "video/"
    );
  };

  const esAudio = (
    documento: Documento
  ) => {
    return documento.tipo.startsWith(
      "audio/"
    );
  };

  // =====================================================
  // VISUALIZAR DOCUMENTO
  // =====================================================

  const visualizarDocumento = (
    documento: Documento
  ) => {
    setDocumentoSeleccionado(
      documento
    );
  };

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <section className="doc-page">

      {/* ================================================
          ENCABEZADO
      ================================================= */}

      <header className="doc-header">

        <h1 className="doc-title">
          Documentos
        </h1>

        <p className="doc-description">
          Sube, almacena y visualiza
          tus archivos.
        </p>

      </header>


      {/* ================================================
          SUBIR ARCHIVOS
      ================================================= */}

      <section className="doc-upload-card">

        <h2 className="doc-section-title">
          Subir archivos
        </h2>

        <p className="doc-upload-description">
          Puedes seleccionar uno o
          varios archivos.
        </p>

        <label className="doc-file-label">

          <span className="doc-file-icon">
            📁
          </span>

          <span className="doc-file-text">
            Seleccionar archivos
          </span>

          <input
            className="doc-file-input"
            type="file"
            multiple
            onChange={
              seleccionarArchivos
            }
          />

        </label>

      </section>


      {/* ================================================
          LISTA DE DOCUMENTOS
      ================================================= */}

      <section className="doc-list-card">

        <h2 className="doc-section-title">
          Mis documentos
        </h2>

        {cargando ? (

          <div className="doc-empty">
            Cargando documentos...
          </div>

        ) : documentos.length === 0 ? (

          <div className="doc-empty">
            No hay documentos
            almacenados.
          </div>

        ) : (

          <div className="doc-list">

            {documentos.map(
              (documento) => (

                <article
                  className="doc-item"
                  key={documento.id}
                >

                  {/* INFORMACIÓN */}

                  <div className="doc-info">

                    <strong className="doc-name">
                      {documento.nombre}
                    </strong>

                    <p className="doc-meta">
                      {documento.tipo}
                      {" · "}
                      {mostrarTamaño(
                        documento.tamaño
                      )}
                    </p>

                  </div>


                  {/* BOTONES */}

                  <div className="doc-actions">

                    <button
                      className="doc-view-button"
                      type="button"
                      onClick={() =>
                        visualizarDocumento(
                          documento
                        )
                      }
                    >
                      👁 Visualizar
                    </button>

                    <button
                      className="doc-download-button"
                      type="button"
                      onClick={() =>
                        descargarDocumento(
                          documento
                        )
                      }
                    >
                      ⬇ Descargar
                    </button>

                    <button
                      className="doc-delete-button"
                      type="button"
                      onClick={() =>
                        eliminarDocumento(
                          documento.id
                        )
                      }
                    >
                      🗑 Eliminar
                    </button>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </section>


      {/* ================================================
          VISUALIZADOR
      ================================================= */}

      {documentoSeleccionado && (

        <section className="doc-viewer-card">

          <header className="doc-viewer-header">

            <h2 className="doc-viewer-title">
              {documentoSeleccionado.nombre}
            </h2>

            <button
              className="doc-close-button"
              type="button"
              onClick={() =>
                setDocumentoSeleccionado(
                  null
                )
              }
            >
              ✕ Cerrar
            </button>

          </header>


          {/* IMAGEN */}

          {esImagen(
            documentoSeleccionado
          ) && (

            <div className="doc-image-container">

              <img
                className="doc-image-preview"
                src={URL.createObjectURL(
                  documentoSeleccionado.archivo
                )}
                alt={
                  documentoSeleccionado.nombre
                }
              />

            </div>

          )}


          {/* PDF */}

          {esPDF(
            documentoSeleccionado
          ) && (

            <iframe
              className="doc-pdf-preview"
              src={URL.createObjectURL(
                documentoSeleccionado.archivo
              )}
              title={
                documentoSeleccionado.nombre
              }
            />

          )}


          {/* TEXTO */}

          {esTexto(
            documentoSeleccionado
          ) && (

            <iframe
              className="doc-text-preview"
              src={URL.createObjectURL(
                documentoSeleccionado.archivo
              )}
              title={
                documentoSeleccionado.nombre
              }
            />

          )}


          {/* VIDEO */}

          {esVideo(
            documentoSeleccionado
          ) && (

            <video
              className="doc-video-preview"
              controls
              src={URL.createObjectURL(
                documentoSeleccionado.archivo
              )}
            />

          )}


          {/* AUDIO */}

          {esAudio(
            documentoSeleccionado
          ) && (

            <audio
              className="doc-audio-preview"
              controls
              src={URL.createObjectURL(
                documentoSeleccionado.archivo
              )}
            />

          )}


          {/* OTROS ARCHIVOS */}

          {!esImagen(
            documentoSeleccionado
          ) &&
            !esPDF(
              documentoSeleccionado
            ) &&
            !esTexto(
              documentoSeleccionado
            ) &&
            !esVideo(
              documentoSeleccionado
            ) &&
            !esAudio(
              documentoSeleccionado
            ) && (

              <div className="doc-unsupported">

                <p className="doc-unsupported-text">
                  Este tipo de archivo
                  no puede visualizarse
                  directamente en el
                  navegador.
                </p>

                <button
                  className="doc-download-file-button"
                  type="button"
                  onClick={() =>
                    descargarDocumento(
                      documentoSeleccionado
                    )
                  }
                >
                  Descargar archivo
                </button>

              </div>

            )}

        </section>

      )}

    </section>
  );
};

export default VistaDocumentos;

