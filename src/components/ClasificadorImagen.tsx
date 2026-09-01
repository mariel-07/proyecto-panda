
import { useEffect, useRef, useState } from "react";
import "./Estilos/ClasificadorImagen.css";

interface Prediccion {
  clase: string;
  porcentaje: number;
}

declare global {
  interface Window {
    tmImage: any;
  }
}

const ClasificadorImagen = () => {
  const modelRef = useRef<any>(null);
  const webcamRef = useRef<any>(null);
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);
  const animationRef =
    useRef<number | null>(null);

  const [iniciado, setIniciado] =
    useState(false);

  const [predicciones, setPredicciones] =
    useState<Prediccion[]>([]);

  const [error, setError] =
    useState("");

  const iniciar = async () => {
    try {
      setError("");

      if (!window.tmImage) {
        throw new Error(
          "Teachable Machine Image no está cargado."
        );
      }

      const modelURL =
        `${window.location.origin}/imagenes/model.json`;

      const metadataURL =
        `${window.location.origin}/imagenes/metadata.json`;

      console.log(
        "Modelo:",
        modelURL
      );

      console.log(
        "Metadata:",
        metadataURL
      );

      const model =
        await window.tmImage.load(
          modelURL,
          metadataURL
        );

      modelRef.current = model;

      console.log(
        "Modelo de imagen cargado correctamente."
      );

      const size = 400;
      const flip = true;

      const webcam =
        new window.tmImage.Webcam(
          size,
          size,
          flip
        );

      webcamRef.current = webcam;

      await webcam.setup();
      await webcam.play();

      const canvas =
        canvasRef.current;

      if (!canvas) {
        throw new Error(
          "No se encontró el canvas."
        );
      }

      canvas.width = size;
      canvas.height = size;

      const totalClases =
        model.getTotalClasses();

      const iniciales: Prediccion[] =
        [];

      for (
        let i = 0;
        i < totalClases;
        i++
      ) {
        iniciales.push({
          clase: `Clase ${i + 1}`,
          porcentaje: 0,
        });
      }

      setPredicciones(
        iniciales
      );

      setIniciado(true);

      animationRef.current =
        requestAnimationFrame(
          loop
        );

    } catch (err) {
      console.error(
        "Error al iniciar Teachable Machine:",
        err
      );

      setError(
        "No se pudo iniciar el reconocimiento de imagen."
      );

      if (webcamRef.current) {
        webcamRef.current.stop();
        webcamRef.current = null;
      }

      modelRef.current = null;
    }
  };

  const loop = async () => {
    if (!webcamRef.current) {
      return;
    }

    webcamRef.current.update();

    await predecir();

    if (webcamRef.current) {
      animationRef.current =
        requestAnimationFrame(
          loop
        );
    }
  };

  const predecir = async () => {
    const model =
      modelRef.current;

    const webcam =
      webcamRef.current;

    if (!model || !webcam) {
      return;
    }

    try {
      const prediction =
        await model.predict(
          webcam.canvas
        );

      const resultados: Prediccion[] =
        prediction.map(
          (prediccion: any) => ({
            clase:
              prediccion.className,

            porcentaje:
              prediccion.probability *
              100,
          })
        );

      setPredicciones(
        resultados
      );

      const canvas =
        canvasRef.current;

      if (canvas) {
        const ctx =
          canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(
            webcam.canvas,
            0,
            0
          );
        }
      }

    } catch (err) {
      console.error(
        "Error en predicción:",
        err
      );
    }
  };

  const detener = () => {
    if (
      animationRef.current !== null
    ) {
      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current = null;
    }

    if (webcamRef.current) {
      webcamRef.current.stop();
      webcamRef.current = null;
    }

    modelRef.current = null;

    setIniciado(false);
    setPredicciones([]);
  };

  useEffect(() => {
    return () => {
      if (
        animationRef.current !== null
      ) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      if (webcamRef.current) {
        webcamRef.current.stop();
      }
    };
  }, []);

  return (
    <section className="img-page">

      {/* TÍTULO */}
      <header className="img-header">

        <h2 className="img-title">
          Reconocimiento de Imagen
        </h2>

      </header>


      {/* BOTÓN */}
      <div className="img-controls">

        {!iniciado ? (
          <button
            className="img-start-button"
            type="button"
            onClick={iniciar}
          >
            Iniciar cámara
          </button>
        ) : (
          <button
            className="img-stop-button"
            type="button"
            onClick={detener}
          >
            Detener cámara
          </button>
        )}

      </div>


      {/* MENSAJE DE ERROR */}
      {error && (
        <div className="img-error">
          {error}
        </div>
      )}


      {/* CÁMARA */}
      <section className="img-camera-card">

        <canvas
          ref={canvasRef}
          className="img-camera-canvas"
        />

      </section>


      {/* RESULTADOS */}
      <section className="img-results-card">


        <div className="img-results-list">

          {predicciones.map(
            (prediccion) => (
              <div
                className="img-prediction"
                key={prediccion.clase}
              >

                <strong className="img-prediction-class">
                  {prediccion.clase}
                </strong>

                <span className="img-prediction-percent">
                  {prediccion.porcentaje.toFixed(2)}%
                </span>

              </div>
            )
          )}

        </div>

      </section>

    </section>
  );
};

export default ClasificadorImagen;

