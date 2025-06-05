'use client';
import { useState, useEffect } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Registrar todos los componentes de ChartJS
ChartJS.register(...registerables);

// Tipos para los diferentes tipos de gráficos
type ChartType = 'bar' | 'pie' | 'line';

// Interfaz para los parámetros del reporte
interface ReportParams {
  fecha_inicio?: string;
  fecha_fin?: string;
  empresa?: number;
  limit?: number;
  periodo?: string;
  grafico_tipo?: string;
  bypass_cache?: boolean;
}

// Interfaz para los props del componente
interface ReportViewerProps {
  reportType: string;
  
  isMobile: boolean;
  onClose?: () => void;
}

export default function ReportViewer({ reportType, isMobile, onClose }: ReportViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [params, setParams] = useState<ReportParams>({
    empresa: 1,
    bypass_cache: false
  });

  // Efecto para cargar los datos del reporte
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Establecer parámetros por defecto según el tipo de reporte
        let updatedParams = { ...params };
        
        // Establecer fechas por defecto
        const today = new Date();
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        updatedParams.fecha_fin = today.toISOString().split('T')[0];
        
        switch (reportType) {
          case 'top-vendedores':
            updatedParams.fecha_inicio = firstDayOfYear.toISOString().split('T')[0];
            updatedParams.limit = 10;
            setChartType('bar');
            break;
          case 'top-productos':
            updatedParams.fecha_inicio = firstDayOfYear.toISOString().split('T')[0];
            updatedParams.limit = 20;
            updatedParams.grafico_tipo = 'pie_agrupado';
            setChartType('pie');
            break;
          case 'top-clientes':
            updatedParams.fecha_inicio = firstDayOfYear.toISOString().split('T')[0];
            updatedParams.limit = 20;
            setChartType('bar');
            break;
          case 'ventas-periodo':
            // Para ventas por periodo, tomamos el último año
            const lastYear = new Date();
            lastYear.setFullYear(lastYear.getFullYear() - 1);
            updatedParams.fecha_inicio = lastYear.toISOString().split('T')[0];
            updatedParams.periodo = 'mensual';
            setChartType('line');
            break;
          default:
            updatedParams.fecha_inicio = firstDayOfYear.toISOString().split('T')[0];
        }
        
        setParams(updatedParams);
        
        // Construir la URL con los parámetros
        let queryParams = new URLSearchParams();
        Object.entries(updatedParams).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });

        // Realizar la petición al backend
        const response = await fetch(`/api/v1/graficos/${reportType}?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Error al cargar el reporte: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.detail || 'Error desconocido al obtener los datos');
        }
        
        setReportData(data.data);
        
        // Actualizar el tipo de gráfico basado en los datos recibidos (si aplica)
        if (data.data?.chart?.chart_type) {
          switch (data.data.chart.chart_type) {
            case 'bar':
              setChartType('bar');
              break;
            case 'pie':
              setChartType('pie');
              break;
            case 'line':
              setChartType('line');
              break;
          }
        }
      } catch (err) {
        console.error('Error cargando reporte:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (reportType) {
      fetchReportData();
    }
  }, [reportType]);

  // Función para cambiar el tipo de gráfico
  const handleChangeChartType = (type: ChartType) => {
    setChartType(type);
    
    // Si el tipo es 'pie_agrupado', actualizar los parámetros y recargar
    if (type === 'pie' && reportType === 'top-productos') {
      setParams({
        ...params,
        grafico_tipo: 'pie_agrupado'
      });
    } else if (reportType === 'top-productos') {
      setParams({
        ...params,
        grafico_tipo: 'barras'
      });
    }
  };

  // Función para actualizar los parámetros y recargar los datos
  const handleUpdateParams = async (newParams: Partial<ReportParams>) => {
    const updatedParams = { ...params, ...newParams };
    setParams(updatedParams);
    
    // Recargar datos con los nuevos parámetros
    setLoading(true);
    
    try {
      let queryParams = new URLSearchParams();
      Object.entries(updatedParams).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/v1/graficos/${reportType}?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error al cargar el reporte: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.detail || 'Error desconocido al obtener los datos');
      }
      
      setReportData(data.data);
    } catch (err) {
      console.error('Error actualizando reporte:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Preparar los datos para la gráfica
  const chartData = {
    labels: reportData?.chart?.labels || [],
    datasets: reportData?.chart?.datasets?.map((dataset: any) => {
      const baseConfig = {
        data: dataset.data || [],
        label: dataset.label || '',
        backgroundColor: dataset.backgroundColor || []
      };
      
      // Configuración adicional según el tipo de gráfico
      if (chartType === 'line') {
        return {
          ...baseConfig,
          borderColor: dataset.borderColor || 'rgba(75, 192, 192, 1)',
          tension: dataset.tension || 0.4,
          fill: dataset.fill !== undefined ? dataset.fill : false
        };
      }
      
      return baseConfig;
    }) || []
  };

  // Opciones de la gráfica
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y || context.parsed || 0;
            const formattedValue = reportData?.chart?.datasets?.[context.datasetIndex]?.formattedData?.[context.dataIndex] || value;
            return `${datasetLabel ? datasetLabel + ': ' : ''}${formattedValue}`;
          }
        }
      },
      legend: {
        display: true,
        position: 'top' as const
      },
      title: {
        display: true,
        color: '#ffffff'
      }
    },
    scales: chartType !== 'pie' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff'
        }
      }
    } : undefined
  };

  // Renderizar componente según estado
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <h3 className="mt-4 text-lg font-medium">Cargando reporte...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="bg-red-600 bg-opacity-20 p-6 rounded-lg text-center max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold mb-2">Error al cargar el reporte</h3>
          <p className="text-secondary">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-primary rounded-md"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <h3 className="text-lg font-medium">No hay datos disponibles</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-secondary p-4 rounded-lg">
      {/* Cabecera con título y botones */}
      <div className="flex justify-between items-center mb-4">
        {/* <h2 className="text-xl font-bold">{title}</h2> */}
        
        {isMobile && onClose && (
          <button 
            onClick={onClose}
            className="text-secondary hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Filtros y opciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {reportType === 'ventas-periodo' && (
          <div className="col-span-1">
            <label className="block text-sm text-secondary mb-1">Periodo</label>
            <select 
              value={params.periodo || 'mensual'}
              onChange={(e) => handleUpdateParams({ periodo: e.target.value })}
              className="w-full bg-primary text-primary p-2 rounded-md"
            >
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>
        )}
        
        <div className="col-span-1">
          <label className="block text-sm text-secondary mb-1">Desde</label>
          <input 
            type="date" 
            value={params.fecha_inicio || ''}
            onChange={(e) => handleUpdateParams({ fecha_inicio: e.target.value })}
            className="w-full bg-primary text-primary p-2 rounded-md"
          />
        </div>
        
        <div className="col-span-1">
          <label className="block text-sm text-secondary mb-1">Hasta</label>
          <input 
            type="date" 
            value={params.fecha_fin || ''}
            onChange={(e) => handleUpdateParams({ fecha_fin: e.target.value })}
            className="w-full bg-primary text-primary p-2 rounded-md"
          />
        </div>
      </div>
      
      {/* Selector de tipo de gráfico (solo para algunos reportes) */}
      {(reportType === 'top-productos' || reportType === 'top-vendedores' || reportType === 'top-clientes') && (
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => handleChangeChartType('bar')}
            className={`px-3 py-1 rounded-md ${chartType === 'bar' ? 'bg-blue-600 text-primary' : 'bg-primary text-secondary'}`}
          >
            Barras
          </button>
          <button
            onClick={() => handleChangeChartType('pie')}
            className={`px-3 py-1 rounded-md ${chartType === 'pie' ? 'bg-blue-600 text-primary' : 'bg-primary text-secondary'}`}
          >
            Circular
          </button>
        </div>
      )}
      
      {/* Área de la gráfica */}
      <div className="flex-1 relative min-h-[300px]">
        {chartType === 'bar' && (
          <Bar data={chartData} options={chartOptions} />
        )}
        
        {chartType === 'pie' && (
          <Pie data={chartData} options={chartOptions} />
        )}
        
        {chartType === 'line' && (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
      
      {/* Información adicional */}
      <div className="mt-4 p-2 bg-primary rounded-md text-sm">
        <p className="text-secondary">
          Mostrando datos {reportData.from_cache ? 'desde caché' : 'actualizados'}.
          {reportData.processing_time && !reportData.from_cache && (
            <span className="ml-2">Tiempo de procesamiento: {reportData.processing_time.toFixed(2)}s</span>
          )}
        </p>
      </div>
    </div>
  );
}