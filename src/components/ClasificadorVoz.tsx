
import { useEffect, useRef, useState } from "react";
import "./Estilos/ClasificadorVoz.css";

interface Prediccion {
  clase: string;
  porcentaje: number;
}

declare global {
  interface Window {
    speechCommands: any;
  }
}

const ClasificadorVoz = () => {
  const recognizerRef = useRef<any>(null);

  const [predicciones, setPredicciones] =
    useState<Prediccion[]>([]);

  const [iniciado, setIniciado] =
    useState(false);

  const [error, setError] =
    useState("");

  const iniciar = async () => {
    try {
      setError("");

      if (!window.speechCommands) {
        throw new Error(
          "Speech Commands no está cargado."
        );
      }

      const baseURL =
        `${window.location.origin}/Voz/`;

      const checkpointURL =
        `${baseURL}model.json`;

      const metadataURL =
        `${baseURL}metadata.json`;

      console.log(
        "Modelo:",
        checkpointURL
      );

      console.log(
        "Metadata:",
        metadataURL
      );

      const recognizer =
        window.speechCommands.create(
          "BROWSER_FFT",
          undefined,
          checkpointURL,
          metadataURL
        );

      await recognizer.ensureModelLoaded();

      console.log(
        "Modelo de voz cargado correctamente."
      );

      recognizerRef.current =
        recognizer;

      const classLabels =
        recognizer.wordLabels();

      setPredicciones(
        classLabels.map(
          (clase: string) => ({
            clase,
            porcentaje: 0,
          })
        )
      );

      setIniciado(true);

      recognizer.listen(
        (result: any) => {
          const scores =
            result.scores;

          const resultados =
            classLabels.map(
              (
                clase: string,
                index: number
              ) => ({
                clase,
                porcentaje:
                  Number(
                    scores[index]
                  ) * 100,
              })
            );

          setPredicciones(
            resultados
          );
        },
        {
          includeSpectrogram: true,
          probabilityThreshold: 0.75,
          invokeCallbackOnNoiseAndUnknown: true,
          overlapFactor: 0.5,
        }
      );

      console.log(
        "Reconocimiento de voz iniciado."
      );

    } catch (err) {
      console.error(
        "Error al iniciar el reconocimiento de voz:",
        err
      );

      setError(
        "No se pudo iniciar el reconocimiento de voz."
      );

      setIniciado(false);
      recognizerRef.current = null;
    }
  };

  const detener = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stopListening();
      recognizerRef.current = null;
    }

    setIniciado(false);
  };

  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stopListening();
        recognizerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="voz-contenedor-principal">

      <h2 className="voz-titulo">
        Reconocimiento De Voz
      </h2>

      {!iniciado ? (
        <button
          className="voz-boton-iniciar"
          type="button"
          onClick={iniciar}
        >
          Iniciar
        </button>
      ) : (
        <button
          className="voz-boton-detener"
          type="button"
          onClick={detener}
        >
          Detener
        </button>
      )}

      {error && (
        <p className="voz-mensaje-error">
          {error}
        </p>
      )}

      <div className="voz-predicciones-container">


        {predicciones.map(
          (prediccion) => (
            <div
              className="voz-prediccion"
              key={prediccion.clase}
            >
              <strong className="voz-clase">
                {prediccion.clase}
              </strong>

              <span className="voz-porcentaje">
                {prediccion.porcentaje.toFixed(
                  2
                )}
                %
              </span>
            </div>
          )
        )}

      </div>

    </div>
  );
};

export default ClasificadorVoz;

