import React, { useState } from 'react';

type RecordRow = Record<string, string | number>;

interface Props {
  data: RecordRow[];
  headers: string[];
}

export const Operacion4: React.FC<Props> = ({ data, headers }) => {
  const [output, setOutput] = useState<string>('');

  const getNumCol = () => {
    if (data.length === 0) return null;
    const numKey = headers.find((h) => typeof data[0][h] === 'number');
    return numKey ? { name: numKey, values: data.map((d) => Number(d[numKey]) || 0) } : null;
  };

  // 1. Producto Estrella
  const opProductoEstrella = () => {
    if (data.length === 0) return setOutput('Sin datos.');
    const col = getNumCol();
    if (!col) return setOutput('Sin columnas numéricas.');
    const maxVal = Math.max(...col.values);
    const topRow = data.find((d) => Number(d[col.name]) === maxVal);
    setOutput(`=== PRODUCTO / COMPRA ESTRELLA ===\nMonto Máximo Registrado: S/ ${maxVal.toFixed(2)}\nDetalle del Registro:\n${JSON.stringify(topRow, null, 2)}`);
  };

  // 2. Alertas de Compras Atípicas (Outliers)
  const opOutliers = () => {
    const col = getNumCol();
    if (!col) return setOutput('Sin columnas numéricas.');
    const mean = col.values.reduce((a, b) => a + b, 0) / col.values.length;
    const std = Math.sqrt(col.values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / col.values.length) || 1;
    const atipicas = col.values.filter((v) => Math.abs((v - mean) / std) > 1.5);
    setOutput(`=== DETECCIÓN DE COMPRAS ATÍPICAS (OUTLIERS) ===\nVenta Promedio: S/ ${mean.toFixed(2)}\nCantidad de Compras Fuera del Rango Habitual: ${atipicas.length}\nMontos Detectados: [${atipicas.join(', ')}]`);
  };

  // 3. Agrupación por Categoría / Cliente (GroupBy Sum)
  const opGroupBy = () => {
    if (data.length === 0 || headers.length < 2) return setOutput('Sin datos suficientes.');
    const catCol = headers[0];
    const numCol = headers.find((h) => typeof data[0][h] === 'number') || headers[1];
    
    const res: Record<string, number> = {};
    data.forEach((d) => {
      const cat = String(d[catCol]);
      const val = Number(d[numCol]) || 0;
      res[cat] = (res[cat] || 0) + val;
    });

    setOutput(`=== TOTAL FACTURADO AGRUPADO POR (${catCol}) ===\n` + Object.entries(res).map(([k, v]) => `${k}: S/ ${v.toFixed(2)}`).join('\n'));
  };

  // 4. Clientes / Ventas VIP (> S/ 100)
  const opVentasVIP = () => {
    const col = getNumCol();
    if (!col) return setOutput('Sin datos numéricos.');
    const vips = data.filter((d) => Number(d[col.name]) >= 100);
    setOutput(`=== FILTRO DE TRANSACCIONES VIP (S/ >= 100) ===\nTotal de Ventas VIP: ${vips.length}\nPorcentaje del total de ventas: ${((vips.length / data.length) * 100).toFixed(1)}%`);
  };

  // 5. Vista Previa para Exportación
  const opPreviewJSON = () => {
    setOutput(`=== ESTRUCTURA DE DATOS PARA INTEGRACIÓN / API ===\n${JSON.stringify(data.slice(0, 3), null, 2)}`);
  };

  return (
    <div>
      <header className="viewport-header">
        <h2>Inteligencia de Negocio (Pandas & NumPy)</h2>
      </header>

      <div className="dashboard-toolbar">
        <button className="btn-action" onClick={opProductoEstrella}>1. Producto Estrella</button>
        <button className="btn-action" onClick={opOutliers}>2. Compras Atípicas</button>
        <button className="btn-action" onClick={opGroupBy}>3. Totales por Categoría</button>
        <button className="btn-action" onClick={opVentasVIP}>4. Ventas VIP ({'>'} 100)</button>
        <button className="btn-action" onClick={opPreviewJSON}>5. Vista Previa JSON</button>
      </div>

      <pre className="console-box">{output || 'Seleccione un análisis integrado del negocio.'}</pre>
    </div>
  );
};