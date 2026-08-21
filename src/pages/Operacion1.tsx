import React, { useState, useEffect } from 'react';
import { Upload, RotateCcw, Search, Table as TableIcon, Filter, ArrowDownWideNarrow } from 'lucide-react';

type RecordRow = Record<string, string | number>;

interface Props {
  data: RecordRow[];
  headers: string[];
  onDataLoaded: (data: RecordRow[], headers: string[]) => void;
}

export const Operacion1: React.FC<Props> = ({ data, headers, onDataLoaded }) => {
  const [localData, setLocalData] = useState<RecordRow[]>(data);
  const [originalData, setOriginalData] = useState<RecordRow[]>(data);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const parsearCSV = (text: string) => {
    const lines = text.split('\n').filter((line) => line.trim() !== '');
    if (lines.length < 2) return;

    const headerRow = lines[0].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || lines[0].split(',');
    const cleanHeaders = headerRow.map((h) => h.replace(/^"|"$/g, '').trim());

    const parsedData: RecordRow[] = lines.slice(1).map((line) => {
      const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || line.split(',');
      const row: RecordRow = {};
      cleanHeaders.forEach((header, index) => {
        const rawValue = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
        const numValue = Number(rawValue);
        row[header] = !isNaN(numValue) && rawValue !== '' ? numValue : rawValue;
      });
      return row;
    });

    setLocalData(parsedData);
    setOriginalData(parsedData);
    onDataLoaded(parsedData, cleanHeaders);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => parsearCSV(evt.target?.result as string);
    reader.readAsText(file);
  };

  const numCol = headers.find((h) => typeof originalData[0]?.[h] === 'number') || headers[0];

  // 1. Búsqueda libre
  const filteredData = localData.filter((item) =>
    Object.values(item).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 2. Filtro: Compras/Ventas Mayores a 50 (o > 5 si son cantidades)
  const opVentasAltas = () => {
    if (!numCol) return;
    const filtrados = originalData.filter((row) => Number(row[numCol]) > 50 || Number(row[numCol]) > 5);
    setLocalData(filtrados);
  };

  // 3. Ordenar Ventas de Mayor a Menor (Descendente)
  const opSortMayorMenor = () => {
    if (!numCol) return;
    const sorted = [...localData].sort((a, b) => Number(b[numCol]) - Number(a[numCol]));
    setLocalData(sorted);
  };

  // 4. Ver Primeras 5 Ventas
  const opHead5 = () => setLocalData(originalData.slice(0, 5));

  // 5. Restablecer Datos
  const opReset = () => setLocalData(originalData);

  return (
    <div>
      <header className="viewport-header">
        <h2>Gestión de Transacciones y Filtros (Pandas)</h2>
      </header>

      <div className="search-bar-wrapper">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por cliente, producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={localData.length === 0}
        />
      </div>

      <div className="dashboard-toolbar">
        <label className="btn-upload">
          <Upload size={15} /> <span>1. Cargar CSV</span>
          <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
        <button className="btn-action" onClick={opVentasAltas} disabled={originalData.length === 0}>
          <Filter size={14} /> 2. Compras {'>'} 50 / {'>'} 5
        </button>
        <button className="btn-action" onClick={opSortMayorMenor} disabled={originalData.length === 0}>
          <ArrowDownWideNarrow size={14} /> 3. Ordenar Mayor a Menor
        </button>
        <button className="btn-action" onClick={opHead5} disabled={originalData.length === 0}>
          4. Ver Top 5
        </button>
        <button className="btn-action" onClick={opReset} disabled={originalData.length === 0}>
          <RotateCcw size={15} /> 5. Restablecer
        </button>
      </div>

      {filteredData.length > 0 ? (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filteredData.map((row, rI) => (
                <tr key={rI}>
                  {headers.map((h, cI) => <td key={cI}>{row[h]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <TableIcon size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>Cargue un archivo de ventas en formato CSV.</p>
        </div>
      )}
    </div>
  );
};