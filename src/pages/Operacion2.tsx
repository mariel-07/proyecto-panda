import React, { useState } from 'react';

type RecordRow = Record<string, string | number>;

interface Props {
  data: RecordRow[];
}

export const Operacion2: React.FC<Props> = ({ data }) => {
  const [output, setOutput] = useState<string>('');

  const getSalesCol = () => {
    if (data.length === 0) return null;
    const numKey = Object.keys(data[0]).find((k) => typeof data[0][k] === 'number');
    if (!numKey) return null;
    return { name: numKey, values: data.map((d) => Number(d[numKey]) || 0) };
  };

  // 1. Total e Ingreso Promedio
  const opTotales = () => {
    const col = getSalesCol();
    if (!col) return setOutput('Cargue un CSV con montos de ventas desde Pandas.');
    const total = col.values.reduce((a, b) => a + b, 0);
    const promedio = total / col.values.length;
    setOutput(`=== RESUMEN FINANCIERO (${col.name}) ===\nTotal Facturado: S/ ${total.toFixed(2)}\nTicket Promedio por Venta: S/ ${promedio.toFixed(2)}\nCantidad de Transacciones: ${col.values.length}`);
  };

  // 2. Cálculo de IGV (18%)
  const opIGV = () => {
    const col = getSalesCol();
    if (!col) return setOutput('Cargue un CSV con valores numéricos.');
    const total = col.values.reduce((a, b) => a + b, 0);
    const igv = total * 0.18;
    const neto = total - igv;
    setOutput(`=== ANÁLISIS TRIBUTARIO (IGV 18%) ===\nTotal Bruto: S/ ${total.toFixed(2)}\nImpuesto Retenido (IGV): S/ ${igv.toFixed(2)}\nIngreso Neto Negocio: S/ ${neto.toFixed(2)}`);
  };

  // 3. Margen de Ganancia Estimado (30%)
  const opMargen = () => {
    const col = getSalesCol();
    if (!col) return setOutput('Cargue un CSV válido.');
    const ganancias = col.values.map((v) => (v * 0.30).toFixed(2));
    setOutput(`=== ESTIMACIÓN MARGEN DE GANANCIA (30% Por Producto/Venta) ===\nGanancias estimadas por fila:\n[${ganancias.join(', ')}]`);
  };

  // 4. Venta Máxima y Mínima
  const opExtremos = () => {
    const col = getSalesCol();
    if (!col) return setOutput('Cargue un CSV válido.');
    const max = Math.max(...col.values);
    const min = Math.min(...col.values);
    setOutput(`=== RANGOS DE VENTA ===\nVenta Más Alta (Mayor Compra): S/ ${max.toFixed(2)}\nVenta Más Baja (Menor Compra): S/ ${min.toFixed(2)}\nDiferencia de Escala: S/ ${(max - min).toFixed(2)}`);
  };

  // 5. Mediana de Ventas
  const opMediana = () => {
    const col = getSalesCol();
    if (!col) return setOutput('Cargue un CSV válido.');
    const sorted = [...col.values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const mediana = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    setOutput(`=== VENTA MEDIANA (PUNTO MEDIO DE FACTURACIÓN) ===\nMediana Comercial: S/ ${mediana.toFixed(2)}`);
  };

  return (
    <div>
      <header className="viewport-header">
        <h2>Cálculos Estadísticos de Ventas (NumPy)</h2>
      </header>

      <div className="dashboard-toolbar">
        <button className="btn-action" onClick={opTotales}>1. Ingresos y Ticket Promedio</button>
        <button className="btn-action" onClick={opIGV}>2. Cálculo IGV (18%)</button>
        <button className="btn-action" onClick={opMargen}>3. Ganancia Est. (30%)</button>
        <button className="btn-action" onClick={opExtremos}>4. Venta Máx / Mín</button>
        <button className="btn-action" onClick={opMediana}>5. Venta Mediana</button>
      </div>

      <pre className="console-box">{output || 'Seleccione una métrica comercial para calcular.'}</pre>
    </div>
  );
};