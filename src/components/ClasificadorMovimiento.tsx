
import { useEffect, useRef, useState } from "react";
import "./Estilos/ClasificadorMovimiento.css";

interface Prediccion {
  clase: string;
  porcentaje: number;
}

declare global {
  interface Window {
    tmPose: any;
  }
}

const ClasificadorMovimiento = () => {
  const modelRef = useRef<any>(null);
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const [iniciado, setIniciado] = useState(false);
  const [predicciones, setPredicciones] =
    useState<Prediccion[]>([]);
  const [error, setError] = useState("");

  const iniciar = async () => {
    try {
      setError("");

      if (!window.tmPose) {
        throw new Error(
          "Teachable Machine Pose no está cargado."
        );
      }

      const modelURL =
        `${window.location.origin}/Movimiento/model.json`;

      const metadataURL =
        `${window.location.origin}/Movimiento/metadata.json`;

      console.log("Modelo:", modelURL);
      console.log("Metadata:", metadataURL);

      const model = await window.tmPose.load(
        modelURL,
        metadataURL
      );

      modelRef.current = model;

      console.log(
        "Modelo de movimiento cargado correctamente."
      );

      const size = 400;
      const flip = true;

      const webcam =
        new window.tmPose.Webcam(
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

      const iniciales: Prediccion[] = [];

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

      setPredicciones(iniciales);
      setIniciado(true);

      animationRef.current =
        requestAnimationFrame(loop);

    } catch (err) {
      console.error(
        "Error al iniciar:",
        err
      );

      setError(
        "No se pudo iniciar el reconocimiento de movimiento."
      );

      if (webcamRef.current) {
        webcamRef.current.stop();
        webcamRef.current = null;
      }
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
        requestAnimationFrame(loop);
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
      const resultado =
        await model.estimatePose(
          webcam.canvas
        );

      const prediction =
        await model.predict(
          resultado.posenetOutput
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

      setPredicciones(resultados);

      dibujarPose(
        resultado.pose
      );

    } catch (err) {
      console.error(
        "Error en predicción:",
        err
      );
    }
  };

  const dibujarPose = (
    pose: any
  ) => {
    const webcam =
      webcamRef.current;

    const canvas =
      canvasRef.current;

    if (!webcam || !canvas) {
      return;
    }

    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.drawImage(
      webcam.canvas,
      0,
      0
    );

    if (pose) {
      const minPartConfidence = 0.5;

      window.tmPose.drawKeypoints(
        pose.keypoints,
        minPartConfidence,
        ctx
      );

      window.tmPose.drawSkeleton(
        pose.keypoints,
        minPartConfidence,
        ctx
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
    <section className="mov-page">

      <div className="mov-header">
        <h2 className="mov-title">
          Reconocimiento de Movimiento
        </h2>
      </div>

      <div className="mov-controls">

        {!iniciado ? (
          <button
            className="mov-start-button"
            type="button"
            onClick={iniciar}
          >
            Iniciar
          </button>
        ) : (
          <button
            className="mov-stop-button"
            type="button"
            onClick={detener}
          >
            Detener
          </button>
        )}

      </div>

      {error && (
        <div className="mov-error">
          {error}
        </div>
      )}

      <div className="mov-camera-card">

        <canvas
          ref={canvasRef}
          className="mov-camera-canvas"
        />

      </div>

      <div className="mov-results-card">

        <div className="mov-results-list">

          {predicciones.map(
            (prediccion) => (
              <div
                className="mov-prediction"
                key={prediccion.clase}
              >
                <strong className="mov-prediction-class">
                  {prediccion.clase}
                </strong>

                <span className="mov-prediction-percent">
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

    </section>
  );
};

export default ClasificadorMovimiento;

