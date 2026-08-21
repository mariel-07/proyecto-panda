import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { ShoppingBag, TrendingUp, PieChart as PieIcon, BarChart3, LayoutGrid } from 'lucide-react';

type RecordRow = Record<string, string | number>;

interface Props {
  data: RecordRow[];
  headers: string[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Operacion3: React.FC<Props> = ({ data, headers }) => {
  const [activeReport, setActiveReport] = useState<number>(1);

  const getCols = () => {
    if (data.length === 0) return { numCol: null, labelCol: null };
    const numCol = headers.find((h) => typeof data[0][h] === 'number') || headers[1] || headers[0];
    const labelCol = headers.find((h) => typeof data[0][h] === 'string') || headers[0];
    return { numCol, labelCol };
  };

  const { numCol, labelCol } = getCols();

  const chartData = data.slice(0, 10).map((item, idx) => ({
    name: labelCol ? String(item[labelCol]).substring(0, 12) : `Item ${idx + 1}`,
    monto: numCol ? Number(item[numCol]) || 0 : idx * 10,
  }));

  const values = data.map((d) => (numCol ? Number(d[numCol]) || 0 : 0));
  const totalFacturado = values.reduce((a, b) => a + b, 0);
  const maxVal = values.length ? Math.max(...values) : 0;
  const minVal = values.length ? Math.min(...values) : 0;
  const avgVal = values.length ? totalFacturado / values.length : 0;

  const summaryData = [
    { metrica: 'Venta Mínima', monto: minVal },
    { metrica: 'Ticket Promedio', monto: Number(avgVal.toFixed(2)) },
    { metrica: 'Venta Máxima', monto: maxVal },
  ];

  return (
    <div>
      <header className="viewport-header">
        <h2>Reportes Gráficos de Comercialización</h2>
      </header>

      <div className="dashboard-toolbar">
        <button className={`btn-action ${activeReport === 1 ? 'active' : ''}`} onClick={() => setActiveReport(1)}>
          <BarChart3 size={15} /> 1. Ventas por Item
        </button>

        <button className={`btn-action ${activeReport === 2 ? 'active' : ''}`} onClick={() => setActiveReport(2)}>
          <TrendingUp size={15} /> 2. Tendencia de Facturación
        </button>

        <button className={`btn-action ${activeReport === 3 ? 'active' : ''}`} onClick={() => setActiveReport(3)}>
          <PieIcon size={15} /> 3. % Participación
        </button>

        <button className={`btn-action ${activeReport === 4 ? 'active' : ''}`} onClick={() => setActiveReport(4)}>
          <ShoppingBag size={15} /> 4. Comparativa Metas
        </button>

        <button className={`btn-action ${activeReport === 5 ? 'active' : ''}`} onClick={() => setActiveReport(5)}>
          <LayoutGrid size={15} /> 5. Tablero KPI
        </button>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          <p>Cargue un CSV de ventas en la pestaña <strong>Pandas</strong> para construir los gráficos.</p>
        </div>
      ) : (
        <div style={{ marginTop: '20px', background: '#1e1e2e', padding: '20px', borderRadius: '12px', minHeight: '350px' }}>
          
          {activeReport === 1 && (
            <div>
              <h3 style={{ marginBottom: '15px', color: '#fff' }}>1. Facturación por Producto / Transacción (`{numCol}`)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ backgroundColor: '#2d2d3d', border: 'none', color: '#fff' }} />
                  <Bar dataKey="monto" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeReport === 2 && (
            <div>
              <h3 style={{ marginBottom: '15px', color: '#fff' }}>2. Evolución y Tendencia de Transacciones</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ backgroundColor: '#2d2d3d', border: 'none', color: '#fff' }} />
                  <Line type="monotone" dataKey="monto" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeReport === 3 && (
            <div>
              <h3 style={{ marginBottom: '15px', color: '#fff' }}>3. Porcentaje de Participación en el Total Vendido</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData} dataKey="monto" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#2d2d3d', border: 'none', color: '#fff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeReport === 4 && (
            <div>
              <h3 style={{ marginBottom: '15px', color: '#fff' }}>4. Análisis Comparativo: Mínimo, Ticket Promedio y Máximo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summaryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="metrica" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ backgroundColor: '#2d2d3d', border: 'none', color: '#fff' }} />
                  <Bar dataKey="monto" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeReport === 5 && (
            <div>
              <h3 style={{ marginBottom: '20px', color: '#fff' }}>5. Tablero de Control y Métricas Clave (KPIs)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                <div style={{ background: '#27273a', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ color: '#888', fontSize: '13px' }}>Facturación Total</span>
                  <h2 style={{ color: '#10b981', marginTop: '8px' }}>S/ {totalFacturado.toFixed(2)}</h2>
                </div>
                <div style={{ background: '#27273a', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ color: '#888', fontSize: '13px' }}>Ticket Promedio</span>
                  <h2 style={{ color: '#6366f1', marginTop: '8px' }}>S/ {avgVal.toFixed(2)}</h2>
                </div>
                <div style={{ background: '#27273a', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ color: '#888', fontSize: '13px' }}>Venta Más Alta</span>
                  <h2 style={{ color: '#f59e0b', marginTop: '8px' }}>S/ {maxVal.toFixed(2)}</h2>
                </div>
                <div style={{ background: '#27273a', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ color: '#888', fontSize: '13px' }}>Transacciones</span>
                  <h2 style={{ color: '#38bdf8', marginTop: '8px' }}>{data.length}</h2>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};