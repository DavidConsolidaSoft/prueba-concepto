'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import NewFacturaButton from './NewFacturaButton';
import FacturaService, { FacturaListItem } from '@/lib/api/facturaService';
import { useFacturaSearch } from '@/lib/hooks/useFacturaSearch';
// Importación de react-datepicker (recomendado)
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Definir un tipo para el filtro como una unión de strings literal
type FilterType = 'Abiertas' | 'Cerradas' | 'Nulas' | 'Fechas';

// Definir un tipo para el filtro de fecha predeterminado
type DateFilterType = 'Hoy' | 'Ayer' | 'Últimos7Días' | 'Últimos30Días' | 'Rango';

interface FacturasListProps {
  onSelectFactura: (id: string) => void;
  selectedFacturaId: string | null;
  onCreateFactura?: () => void;
}

export default function FacturasList({ onSelectFactura, selectedFacturaId, onCreateFactura }: FacturasListProps) {
  const [filter, setFilter] = useState<FilterType>('Abiertas');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [fechasAplicadas, setFechasAplicadas] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Nuevo estado para filtro de fechas predeterminado (por defecto "Hoy")
  const [dateFilter, setDateFilter] = useState<DateFilterType>('Hoy');
  
  // Estado para DatePicker (opcional si decides usarlo)
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  
  // Estados para las facturas de la API y paginación
  const [facturas, setFacturas] = useState<FacturaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredFacturas, setFilteredFacturas] = useState<FacturaListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalFacturas, setTotalFacturas] = useState(0);
  const [pageSize] = useState(50);
  
  // Hook personalizado para búsqueda
  const {
    searchTerm,
    searchResults,
    isSearching,
    searchMode,
    setSearchTerm,
    clearSearch,
    searchError,
    updateSearchContext
  } = useFacturaSearch();

  // Referencias para lazy loading
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const { fecha_inicio, fecha_fin } = getDateRange(dateFilter);
    
    let estadoApi: 'abiertas' | 'cerradas' | 'nulas' | 'todas' = 'todas';
    if (filter === 'Abiertas') {
      estadoApi = 'abiertas';
    } else if (filter === 'Cerradas') {
      estadoApi = 'cerradas';
    } else if (filter === 'Nulas') {
      estadoApi = 'nulas';
    }
    
    updateSearchContext({
      estado: estadoApi,
      fechaInicio: fecha_inicio,
      fechaFin: fecha_fin
    });
  }, [filter, dateFilter, fechaDesde, fechaHasta, updateSearchContext]);

  // Mostrar error de búsqueda como toast/alerta
  useEffect(() => {
    if (searchError) {
      console.error('Error de búsqueda:', searchError);
      // Aquí puedes mostrar un toast o alerta si tienes componente para ello
    }
  }, [searchError]);

  // Actualizar lista filtrada basada en modo de búsqueda
  useEffect(() => {
    if (searchMode) {
      console.log(`[FacturasList] Modo búsqueda: ${searchResults.length} resultados`);
      setFilteredFacturas(searchResults);
    } else {
      console.log(`[FacturasList] Modo listado: ${facturas.length} facturas`);
      setFilteredFacturas(facturas);
    }
  }, [searchMode, searchResults, facturas]);

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Elemento de referencia para el último elemento de la lista
  const lastFacturaElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || searchMode || !hasMore) return; // No observar en modo búsqueda
    
    // Desconectar el observador anterior
    if (observer.current) observer.current.disconnect();
    
    // Crear un nuevo observador para detectar cuando el último elemento es visible
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !searchMode) {
        console.log('[FacturasList] Cargando más facturas...');
        loadMoreFacturas();
      }
    });
    
    // Observar el nuevo último elemento
    if (node) observer.current.observe(node);
  }, [loading, hasMore, searchMode]);

  // Cleanup del observer
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);
  
  // Función para obtener rango de fechas según el filtro seleccionado
  const getDateRange = (filterType: DateFilterType): { fecha_inicio: Date, fecha_fin: Date } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let startDate = new Date(today);
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    switch (filterType) {
      case 'Hoy':
        break;
      case 'Ayer':
        startDate.setDate(today.getDate() - 1);
        endDate.setDate(today.getDate() - 1);
        break;
      case 'Últimos7Días':
        startDate.setDate(today.getDate() - 6);
        break;
      case 'Últimos30Días':
        startDate.setDate(today.getDate() - 29);
        break;
      case 'Rango':
        if (fechaDesde) {
          startDate = new Date(fechaDesde);
        }
        if (fechaHasta) {
          endDate = new Date(fechaHasta);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
    }
    
    return { fecha_inicio: startDate, fecha_fin: endDate };
  };
  
  // Cargar facturas desde la API
  const cargarFacturas = async () => {
    if (searchMode) return; // No cargar si estamos en modo búsqueda
    
    setLoading(true);
    setError(null);
    
    try {
      let estadoApi: 'abiertas' | 'cerradas' | 'nulas' | 'todas' = 'todas';
      
      if (filter === 'Abiertas') {
        estadoApi = 'abiertas';
      } else if (filter === 'Cerradas') {
        estadoApi = 'cerradas';
      } else if (filter === 'Nulas') {
        estadoApi = 'nulas';
      }
      
      const { fecha_inicio, fecha_fin } = getDateRange(dateFilter);
      
      const params: any = {
        estado: estadoApi,
        fecha_inicio,
        fecha_fin,
        page: 1,
        size: pageSize
      };
      
      const facturasData = await FacturaService.getFacturas(params);
      setFacturas(facturasData.items);
      setTotalFacturas(facturasData.total);
      setHasMore(facturasData.page < facturasData.pages);
      setCurrentPage(1);
      
      console.log(`[FacturasList] Cargadas ${facturasData.items.length} facturas iniciales`);
    } catch (err) {
      setError('Error al cargar las facturas');
      console.error('Error cargando facturas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar más facturas (lazy loading)
  const loadMoreFacturas = useCallback(async () => {
    if (searchMode || !hasMore || loading) return;
    
    const nextPage = currentPage + 1;
    setLoading(true);
    
    try {
      let estadoApi: 'abiertas' | 'cerradas' | 'nulas' | 'todas' = 'todas';
      
      if (filter === 'Abiertas') {
        estadoApi = 'abiertas';
      } else if (filter === 'Cerradas') {
        estadoApi = 'cerradas';
      } else if (filter === 'Nulas') {
        estadoApi = 'nulas';
      } else if (filter === 'Fechas') {
        estadoApi = 'todas';
      }
      
      const { fecha_inicio, fecha_fin } = getDateRange(dateFilter);
      
      const params: any = {
        estado: estadoApi,
        fecha_inicio,
        fecha_fin,
        page: nextPage,
        size: pageSize
      };
      
      console.log(`[FacturasList] Cargando página ${nextPage}...`);
      const facturasData = await FacturaService.getFacturas(params);
      
      setFacturas(prev => [...prev, ...facturasData.items]);
      setCurrentPage(nextPage);
      setHasMore(nextPage < facturasData.pages);
      
      console.log(`[FacturasList] Añadidas ${facturasData.items.length} facturas más`);
    } catch (err) {
      setError('Error al cargar más facturas');
      console.error('Error cargando más facturas:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, hasMore, loading, pageSize, searchMode, filter, dateFilter, fechaDesde, fechaHasta]);
  
  // Cargar facturas cuando cambie el filtro, el filtro de fecha o se apliquen fechas
  useEffect(() => {
    // Solo cargar si NO estamos en modo búsqueda
    if (!searchMode) {
      cargarFacturas();
    }
  }, [filter, dateFilter, fechasAplicadas]);

  // Manejar cambio en el término de búsqueda
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    console.log(`[FacturasList] Cambio en búsqueda: "${newSearchTerm}"`);
    setSearchTerm(newSearchTerm);
  }, [setSearchTerm]);
  
  // Aplicar filtro de fechas
  const aplicarFiltroFechas = () => {
    setFechasAplicadas(true);
    if (dateFilter !== 'Rango') {
      setDateFilter('Rango');
    } else {
      cargarFacturas();
    }
  };
  
  // Limpiar filtro de fechas
  const limpiarFiltroFechas = () => {
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    setFechaDesde(todayFormatted);
    setFechaHasta(todayFormatted);
    setStartDate(new Date());
    setEndDate(new Date());
    setFechasAplicadas(false);
    setDateFilter('Hoy');
  };
  
  // Limpiar todos los filtros
  const limpiarTodosLosFiltros = () => {
    setFilter('Abiertas');
    clearSearch(); // Usar el método del hook
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    setFechaDesde(todayFormatted);
    setFechaHasta(todayFormatted);
    setStartDate(new Date());
    setEndDate(new Date());
    setFechasAplicadas(false);
    setDateFilter('Hoy');
  };
  
  // Manejar cambio de filtro de fecha
  const handleDateFilterChange = (newFilter: DateFilterType) => {
    setDateFilter(newFilter);
    
    if (newFilter === 'Rango') {
      const today = new Date();
      const todayFormatted = today.toISOString().split('T')[0];
      setFechaDesde(todayFormatted);
      setFechaHasta(todayFormatted);
      setStartDate(new Date());
      setEndDate(new Date());
      return;
    }
    
    setFechasAplicadas(false);
  };
  
  // Manejar cambios en los DatePickers
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date) {
      setFechaDesde(date.toISOString().split('T')[0]);
    } else {
      setFechaDesde('');
    }
  };
  
  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    if (date) {
      setFechaHasta(date.toISOString().split('T')[0]);
    } else {
      setFechaHasta('');
    }
  };
  
  // Determinar si hay filtros activos más allá del filtro por defecto (Abiertas)
  const hasFiltrosActivos = searchTerm.trim() !== '' ||
                            filter !== ('Abiertas' as FilterType) ||
                            dateFilter !== 'Hoy';
  
  // Function to determine button class based on filter status
  const getButtonClass = (buttonFilter: FilterType) => {
    const isActive = filter === buttonFilter;
    let borderClass = '';
    
    if (isActive) {
      switch (buttonFilter) {
        case 'Abiertas':
          borderClass = 'border-b-2 border-green-500';
          break;
        case 'Cerradas':
          borderClass = 'border-b-2 border-blue-500';
          break;
        case 'Nulas':
          borderClass = 'border-b-2 border-red-500';
          break;
        case 'Fechas':
          borderClass = 'border-b-2 border-yellow-500';
          break;
      }
    }
    
    return `flex-1 py-2 text-center ${isActive ? borderClass + ' text-primary bg-tertiary' : 'text-tertiary hover:text-primary'}`;
  };

  // Function to get icon color based on filter
  const getIconColor = (buttonFilter: FilterType) => {
    switch (buttonFilter) {
      case 'Abiertas':
        return 'text-green-400';
      case 'Cerradas':
        return 'text-blue-400';
      case 'Nulas':
        return 'text-red-400';
      case 'Fechas':
        return 'text-yellow-400';
    }
  };
  
  // Function to get date filter button class
  const getDateFilterButtonClass = (dateFilterType: DateFilterType) => {
    const isActive = dateFilter === dateFilterType;
    return `px-2 py-1 text-xs rounded-full ${isActive ? 
      'bg-yellow-600 text-white' : 
      'bg-tertiary text-secondary hover:bg-secondary hover:text-primary'}`;
  };

  if (loading && facturas.length === 0) {
    return (
      <div className="max-w-full h-full bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-primary">Cargando facturas...</p>
        </div>
      </div>
    );
  }

  if (error && facturas.length === 0) {
    return (
      <div className="max-w-full h-full bg-secondary flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={cargarFacturas}
            className="bg-blue-600 hover:bg-blue-700 text-primary px-4 py-2 rounded-md"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-full h-full bg-secondary flex flex-col transition-colors duration-300">
      {/* Título y búsqueda - área fija */}
      <div className="p-2 flex-shrink-1">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-primary">Facturas</h2>
          <NewFacturaButton onClick={onCreateFactura || (() => {})} variant="icon" />
        </div>
        <div className="flex items-center bg-tertiary rounded-md relative">
          <input
            type="text"
            placeholder={isMobile ? "Buscar..." : "Buscar por cliente, factura, vendedor o pedido"}
            value={searchTerm}
            onChange={handleSearchChange}
            className="p-2 bg-transparent focus:outline-none flex-1 text-primary text-sm pr-8"
          />
          {searchTerm && (
            <button 
              onClick={clearSearch}
              className="absolute right-10 text-tertiary hover:text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <button className="px-3">
            {/* Indicador de estado de búsqueda */}
            {searchMode && (
              <div className="absolute right-12 top-2.5">
                {isSearching ? (
                  <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <div className="h-2 w-2 rounded-full bg-green-500" title="Búsqueda activa"></div>
                )}
              </div>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${searchTerm ? 'text-green-400' : 'text-primary'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Filtros aplicados - muestra un indicador cuando hay filtros activos */}
      {hasFiltrosActivos && (
        <div className="px-4 pb-2 -mt-2 flex-shrink-0 flex items-center text-sm">
          <span className="text-green-400 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros:
          </span>
          
          {searchTerm && (
            <span className="bg-primary text-primary px-2 py-1 rounded-full text-xs mr-2">
              {searchTerm}
            </span>
          )}
          
          <span className={`${
            filter === 'Abiertas' ? 'bg-green-600' : 
            filter === 'Cerradas' ? 'bg-blue-600' : 
            filter === 'Nulas' ? 'bg-red-600' : 
            'bg-yellow-600'
          } text-primary px-2 py-1 rounded-full text-xs mr-2`}>
            {filter}
          </span>
          
          {dateFilter !== 'Hoy' && (
            <span className="bg-orange-500 text-primary px-2 py-1 rounded-full text-xs">
              {dateFilter === 'Rango' ? (
                fechaDesde || fechaHasta ? 
                  `${fechaDesde ? new Date(fechaDesde).toLocaleDateString() : 'Inicio'} - ${fechaHasta ? new Date(fechaHasta).toLocaleDateString() : 'Fin'}` 
                  : 'Personalizado'
              ) : dateFilter}
            </span>
          )}
          
          <button 
            onClick={limpiarTodosLosFiltros}
            className="ml-auto text-secondary hover:text-primary text-xs"
          >
            {isMobile ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              'Limpiar filtros'
            )}
          </button>
        </div>
      )}
      
      {/* Filtros - área fija */}
      <div className="flex border-y border-[#ffffff] flex-shrink-0">
        <button
          className={getButtonClass('Abiertas')}
          onClick={() => setFilter('Abiertas')}
        >
          {filter === 'Abiertas' && (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 inline-block mr-1 ${getIconColor('Abiertas')}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          Abiertas
        </button>
        <button
          className={getButtonClass('Cerradas')}
          onClick={() => setFilter('Cerradas')}
        >
          {filter === 'Cerradas' && (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 inline-block mr-1 ${getIconColor('Cerradas')}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          Cerradas
        </button>
        <button
          className={getButtonClass('Nulas')}
          onClick={() => setFilter('Nulas')}
        >
          {filter === 'Nulas' && (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 inline-block mr-1 ${getIconColor('Nulas')}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          Nulas
        </button>
      </div>
      
      {/* Filtros de fecha predeterminados - siempre visibles */}
      <div className="flex flex-wrap p-2 gap-1 border-b border-secondary bg-tertiary flex-shrink-0">
        <button
          className={getDateFilterButtonClass('Hoy')}
          onClick={() => handleDateFilterChange('Hoy')}
        >
          Hoy
        </button>
        <button
          className={getDateFilterButtonClass('Ayer')}
          onClick={() => handleDateFilterChange('Ayer')}
        >
          Ayer
        </button>
        <button
          className={getDateFilterButtonClass('Últimos7Días')}
          onClick={() => handleDateFilterChange('Últimos7Días')}
        >
          Últimos 7 días
        </button>
        <button
          className={getDateFilterButtonClass('Últimos30Días')}
          onClick={() => handleDateFilterChange('Últimos30Días')}
        >
          Últimos 30 días
        </button>
        <button
          className={getDateFilterButtonClass('Rango')}
          onClick={() => handleDateFilterChange('Rango')}
        >
          Fechas
        </button>
      </div>
      
      {/* Filtro de Fechas - visible solo cuando el filtro de fecha es "Rango" */}
      {dateFilter === 'Rango' && (
        <div className={`p-3 border-b border-secondary ${fechasAplicadas ? 'bg-[#3c3c3c]' : 'bg-primary'} flex-shrink-0`}>
          <div className="flex mb-2">
            <div className="w-1/2 pr-2">
              <label className="text-primary text-sm">Desde:</label>
            </div>
            <div className="w-1/2 pl-2">
              <label className="text-primary text-sm">Hasta:</label>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-1/2 pr-2">
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                className={`${fechasAplicadas ? 'bg-[#4c4c4c]' : 'bg-secondary'} text-primary px-2 py-1 rounded border ${fechasAplicadas ? 'border-yellow-500' : 'border-secondary'} w-full`}
              />
            </div>
            
            <div className="w-1/2 pl-2 pr-2">
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || undefined}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                className={`${fechasAplicadas ? 'bg-[#4c4c4c]' : 'bg-secondary'} text-primary px-2 py-1 rounded border ${fechasAplicadas ? 'border-yellow-500' : 'border-secondary'} w-full`}
              />
            </div>
            
            <button 
              onClick={aplicarFiltroFechas}
              className={`p-1 rounded-full ${fechasAplicadas ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-accent hover:bg-tertiary'} text-primary flex items-center justify-center w-8 h-8 ml-2`}
              disabled={!fechaDesde && !fechaHasta}
              title={fechasAplicadas ? "Actualizar filtro" : "Aplicar filtro"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          {fechasAplicadas && !isMobile && (
            <div className="mt-2 flex items-center text-yellow-400 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Filtro por fechas aplicado
            </div>
          )}
        </div>
      )}
      
      {/* Lista de facturas - área con scroll */}
      <div className="flex-1 overflow-auto">
        {filteredFacturas.length > 0 ? (
          <>
            {filteredFacturas.map((factura, index) => {
              const isLastElement = index === filteredFacturas.length - 1;
              
              return (
                <div 
                  key={`${factura.factura}-${factura.numedocu}`}
                  ref={isLastElement && !searchMode ? lastFacturaElementRef : null}
                  className={`border-b border-primary hover:bg-accent cursor-pointer transition-colors duration-200 ${
                    selectedFacturaId === factura.factura.toString() ? 'bg-accent' : ''
                  }`}
                  onClick={() => onSelectFactura(factura.factura.toString())}
                >
                  <div className="px-3 py-3 pr-3 relative">
                    {/* Línea 1: Cliente (sola en su línea) */}
                    <div className={`${isMobile ? 'text-sm' : 'text-base'} font-bold mb-0 text-primary`}>
                      {factura.nombre_cliente.trim() || 'Sin nombre'}
                    </div>
                    
                    {/* Línea 2: Código e Importe (alineados) */}
                    <div className="flex justify-between">
                      <div className="font-base text-primary">{factura.numedocu.trim()}</div>
                      <div className={`text-primary font-bold ${isMobile ? 'text-sm' : ''}`}>
                        {FacturaService.formatMoneda(factura.monto_total)}
                      </div>
                    </div>
                    
                    {/* Línea 3: "Vendedor:" y Fecha (alineados) */}
                    <div className="flex justify-between mt-0">
                      <div className={`font-base ${isMobile ? 'text-xs' : ''} text-secondary`}>Vendedor:</div>
                      <div className={`font-semibold ${isMobile ? 'text-xs' : ''} text-secondary`}>
                        {FacturaService.formatFecha(factura.fecha)}
                      </div>
                    </div>
                    
                    {/* Línea 4: Nombre del vendedor y Estado (alineados) */}
                    <div className="flex justify-between">
                      <div className={`font-base ${isMobile ? 'text-xs' : ''} text-secondary`}>
                        {factura.nombre_vendedor.trim() || 'Sin vendedor'}
                      </div>
                      <div className={`font-bold ${isMobile ? 'text-xs' : ''} ${
                        factura.estado === 'Abierta' ? 'text-green-400' : 
                        factura.estado === 'Cerrada' ? 'text-blue-400' : 
                        'text-red-400'
                      }`}>
                        {factura.estado}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Indicador de carga para lazy loading - solo en modo normal */}
            {loading && !searchMode && (
              <div className="p-4 flex justify-center">
                <div className="flex items-center text-tertiary">
                  <svg className="animate-spin h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Cargando más facturas...</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-tertiary p-6">
            {loading || isSearching ? (
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isSearching ? 'Buscando facturas...' : 'Cargando facturas...'}
              </div>
            ) : searchTerm ? (
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium mb-2">No se encontraron facturas</h3>
                <p className="text-sm">No hay facturas que coincidan con "<strong>{searchTerm}</strong>"</p>
              </div>
            ) : (
              'No se encontraron facturas'
            )}
          </div>
        )}
      </div>
      
      {/* Contador de resultados */}
      <div className="py-2 px-4 text-xs text-secondary border-t border-secondary flex items-center">
        <span>
          {searchMode 
            ? `${filteredFacturas.length} resultado${filteredFacturas.length !== 1 ? 's' : ''} de búsqueda`
            : `${filteredFacturas.length} de ${totalFacturas} facturas mostradas`
          }
        </span>
        
        {hasFiltrosActivos && (
          <button
            onClick={limpiarTodosLosFiltros}
            className="ml-auto text-secondary hover:text-primary flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {isMobile ? '' : 'Limpiar filtros'}
          </button>
        )}
      </div>
    </div>
  );
}