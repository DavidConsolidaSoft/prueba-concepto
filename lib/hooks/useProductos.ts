// hooks/useProductos.ts - VERSIÓN CON TIPOS CORREGIDOS
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ProductoService, { type Producto, type ProductoKardex } from '@/lib/api/productoService';

// Definir interface para la información de debug
interface DebugInfo {
  listas_precios?: any[];
  conexion_exitosa?: boolean;
  error_conexion?: string;
  timestamp?: string;
  ultima_carga?: {
    pagina: number;
    productos_recibidos: number;
    total: number;
    timestamp: string;
  };
  ultimo_error?: {
    mensaje: string;
    pagina: number;
    timestamp: string;
  };
  ultima_busqueda?: {
    termino: string;
    resultados: number;
    estrategia: string;
    timestamp: string;
  };
  error_busqueda?: {
    termino: string;
    error: string;
    timestamp: string;
  };
  busqueda_por_codigo?: {
    codigo: string;
    producto_encontrado: Producto;
    timestamp: string;
  };
  error_busqueda_codigo?: {
    codigo: string;
    error: string;
    timestamp: string;
  };
  cache_limpiado?: string;
}

interface UseProductosConfig {
  cajaId: number;
  listaPrecioId: number;
  bodega?: string;
  soloExistencias?: boolean;
  itemsPorPagina?: number;
  debug?: boolean;
  autoLoad?: boolean; // Nueva opción para cargar datos automáticamente
}

interface UseProductosReturn {
  // Estado de productos principales
  productos: Producto[];
  totalProductos: number;
  paginaActual: number;
  totalPaginas: number;
  
  // Estado de búsqueda optimizada
  terminoBusqueda: string;
  resultadosBusqueda: Producto[];
  esBuscando: boolean;
  hayMasResultados: boolean;
  
  // Estado de carga
  esCargando: boolean;
  esCargandoMas: boolean;
  error: string | null;
  
  // Estadísticas útiles
  stats: {
    totalProductosUnicos: number;
    productosConStock: number;
    servicios: number;
    promoActivas: number;
  };
  
  // Debug info tipado
  debugInfo: DebugInfo;
  
  // Acciones principales
  buscarProductos: (termino: string) => void;
  limpiarBusqueda: () => void;
  cargarMasProductos: () => Promise<void>;
  cargarMasResultadosBusqueda: () => Promise<void>;
  recargarProductos: () => Promise<void>;
  buscarPorCodigo: (codigo: string) => Promise<Producto | null>;
  
  // Utilidades
  testConexion: () => Promise<boolean>;
  limpiarCache: () => void;
}

export const useProductos = (config: UseProductosConfig): UseProductosReturn => {
  // Estados principales
  const [productos, setProductos] = useState<Producto[]>([]);
  const [totalProductos, setTotalProductos] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  
  // Estados de búsqueda optimizada
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<Producto[]>([]);
  const [paginaBusqueda, setPaginaBusqueda] = useState(1);
  const [totalPaginasBusqueda, setTotalPaginasBusqueda] = useState(1);
  const [esBuscando, setEsBuscando] = useState(false);
  const [hayMasResultados, setHayMasResultados] = useState(false);
  
  // Estados de carga
  const [esCargando, setEsCargando] = useState(false);
  const [esCargandoMas, setEsCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  
  // Referencias para control de búsqueda optimizada
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const ultimaBusquedaRef = useRef<string>('');
  const busquedaRapidaRef = useRef<boolean>(false);

  const {
    cajaId,
    listaPrecioId,
    bodega = '%',
    soloExistencias = false, // CAMBIADO: Por defecto mostrar todos
    itemsPorPagina = 10,
    debug = false,
    autoLoad = true
  } = config;

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const productosParaAnalisis = terminoBusqueda ? resultadosBusqueda : productos;
    
    return {
      totalProductosUnicos: productosParaAnalisis.length,
      productosConStock: productosParaAnalisis.filter(p => p.existencias > 0 || p.esServicio).length,
      servicios: productosParaAnalisis.filter(p => p.esServicio).length,
      promoActivas: productosParaAnalisis.filter(p => p.esPromo).length
    };
  }, [productos, resultadosBusqueda, terminoBusqueda]);

  // Test de conexión mejorado
  const testConexion = useCallback(async (): Promise<boolean> => {
    try {
      const listas = await ProductoService.getListasPrecios();
      
      if (debug) {
        setDebugInfo((prev: DebugInfo) => ({
          ...prev,
          listas_precios: listas,
          conexion_exitosa: true,
          timestamp: new Date().toISOString()
        }));
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      if (debug) {
        setDebugInfo((prev: DebugInfo) => ({
          ...prev,
          conexion_exitosa: false,
          error_conexion: errorMessage,
          timestamp: new Date().toISOString()
        }));
      }
      
      return false;
    }
  }, [debug]);

  // Cargar productos principales con optimizaciones
  const cargarProductos = useCallback(async (pagina: number = 1, esNuevaCarga: boolean = true) => {
    if (esNuevaCarga) {
      setEsCargando(true);
    } else {
      setEsCargandoMas(true);
    }
    
    setError(null);

    try {
      const response = await ProductoService.getProductosKardex(
        cajaId,
        listaPrecioId,
        '', // Sin búsqueda para carga general
        bodega,
        soloExistencias,
        false,
        false,
        false,
        pagina,
        itemsPorPagina
      );

      if (debug) {
        setDebugInfo((prev: DebugInfo) => ({
          ...prev,
          ultima_carga: {
            pagina,
            productos_recibidos: response.productos?.length || 0,
            total: response.total,
            timestamp: new Date().toISOString()
          }
        }));
      }

      const productosUi = ProductoService.mapMultipleApiProductos(response.productos || []);

      if (esNuevaCarga) {
        setProductos(productosUi);
        setPaginaActual(1);
      } else {
        setProductos((prev: Producto[]) => {
          // Evitar duplicados al cargar más páginas
          const productosExistentes = new Set(prev.map(p => p.id));
          const productosNuevos = productosUi.filter(p => !productosExistentes.has(p.id));
          return [...prev, ...productosNuevos];
        });
        setPaginaActual(pagina);
      }
      
      setTotalProductos(response.total || 0);
      setTotalPaginas(response.total_paginas || 1);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(errorMessage);
      
      if (debug) {
        setDebugInfo((prev: DebugInfo) => ({
          ...prev,
          ultimo_error: {
            mensaje: errorMessage,
            pagina,
            timestamp: new Date().toISOString()
          }
        }));
      }
      
      console.error('Error cargando productos:', err);
      
      if (esNuevaCarga) {
        setProductos([]);
        setTotalProductos(0);
        setTotalPaginas(1);
      }
    } finally {
      setEsCargando(false);
      setEsCargandoMas(false);
    }
  }, [cajaId, listaPrecioId, bodega, soloExistencias, itemsPorPagina, debug]);

  // Cargar más productos (lazy loading)
  const cargarMasProductos = useCallback(async () => {    
    if (esCargandoMas || paginaActual >= totalPaginas || terminoBusqueda) {
      return;
    }

    await cargarProductos(paginaActual + 1, false);
  }, [cargarProductos, esCargandoMas, paginaActual, totalPaginas, terminoBusqueda]);

  // Recargar productos desde el inicio
  const recargarProductos = useCallback(async () => {
    // Limpiar búsqueda si existe
    if (terminoBusqueda) {
      setTerminoBusqueda('');
      setResultadosBusqueda([]);
      setPaginaBusqueda(1);
    }
    
    await cargarProductos(1, true);
  }, [cargarProductos, terminoBusqueda]);

  // Búsqueda inteligente con diferentes estrategias
  const realizarBusqueda = useCallback(async (
    termino: string, 
    pagina: number = 1, 
    esNuevaBusqueda: boolean = true
  ): Promise<Producto[]> => {
    if (!termino || termino.trim().length < 2) {
      return [];
    }

    try {
      let productos: ProductoKardex[] = [];
      
      // Estrategia 1: Búsqueda rápida para términos cortos o resultados en tiempo real
      if (termino.length <= 10 || busquedaRapidaRef.current) {
        productos = await ProductoService.buscarProductosTiempoReal(
          cajaId,
          listaPrecioId,
          termino,
          15, // Límite para búsqueda rápida
          bodega
        );
        
        busquedaRapidaRef.current = true;
      } else {
        // Estrategia 2: Búsqueda con paginación para términos más específicos
        const response = await ProductoService.buscarProductosConPaginacion(
          cajaId,
          listaPrecioId,
          termino,
          pagina,
          itemsPorPagina,
          bodega
        );
        
        productos = response.productos || [];
        setTotalPaginasBusqueda(response.total_paginas || 1);
        busquedaRapidaRef.current = false;
      }
      
      return ProductoService.mapMultipleApiProductos(productos);
      
    } catch (error) {
      console.error('Error en búsqueda:', error);
      return [];
    }
  }, [cajaId, listaPrecioId, bodega, itemsPorPagina]);

  // Búsqueda con debouncing optimizado
  const buscarProductos = useCallback((termino: string) => {
    setTerminoBusqueda(termino);
    
    // Cancelar búsqueda anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Si el término es muy corto, limpiar resultados
    if (!termino || termino.trim().length < 2) {
      setResultadosBusqueda([]);
      setEsBuscando(false);
      setPaginaBusqueda(1);
      setHayMasResultados(false);
      busquedaRapidaRef.current = false;
      return;
    }

    setEsBuscando(true);
    ultimaBusquedaRef.current = termino;

    // Debounce inteligente: menos tiempo para búsquedas cortas
    const debounceTime = termino.length <= 3 ? 500 : 300;
    
    timeoutRef.current = setTimeout(async () => {
      try {
        abortControllerRef.current = new AbortController();
        
        if (debug) {
          console.log(`🔍 Buscando: "${termino}"`);
        }
        
        const productosEncontrados = await realizarBusqueda(termino, 1, true);

        // Verificar si la búsqueda sigue siendo relevante
        if (ultimaBusquedaRef.current !== termino) {
          return;
        }

        if (debug) {
          setDebugInfo((prev: DebugInfo) => ({
            ...prev,
            ultima_busqueda: {
              termino: termino,
              resultados: productosEncontrados.length,
              estrategia: busquedaRapidaRef.current ? 'rapida' : 'paginada',
              timestamp: new Date().toISOString()
            }
          }));
        }

        setResultadosBusqueda(productosEncontrados);
        setPaginaBusqueda(1);
        
        // Determinar si hay más resultados disponibles
        if (busquedaRapidaRef.current) {
          // Para búsqueda rápida, asumimos que hay más si llegamos al límite
          setHayMasResultados(productosEncontrados.length >= 15);
        } else {
          // Para búsqueda paginada, verificamos si hay más páginas
          setHayMasResultados(totalPaginasBusqueda > 1);
        }
        
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error en búsqueda:', err);
          setResultadosBusqueda([]);
          
          if (debug) {
            setDebugInfo((prev: DebugInfo) => ({
              ...prev,
              error_busqueda: {
                termino: termino,
                error: err.message,
                timestamp: new Date().toISOString()
              }
            }));
          }
        }
      } finally {
        setEsBuscando(false);
      }
    }, debounceTime);
  }, [realizarBusqueda, totalPaginasBusqueda, debug]);

  // Cargar más resultados de búsqueda
  const cargarMasResultadosBusqueda = useCallback(async () => {
    if (!terminoBusqueda || esBuscando || !hayMasResultados) {
      return;
    }

    setEsBuscando(true);
    
    try {
      const siguientePagina = paginaBusqueda + 1;
      const productosAdicionales = await realizarBusqueda(terminoBusqueda, siguientePagina, false);
      
      if (productosAdicionales.length > 0) {
        setResultadosBusqueda((prev: Producto[]) => {
          // Evitar duplicados
          const productosExistentes = new Set(prev.map(p => p.id));
          const productosNuevos = productosAdicionales.filter(p => !productosExistentes.has(p.id));
          return [...prev, ...productosNuevos];
        });
        
        setPaginaBusqueda(siguientePagina);
        
        // Actualizar si hay más resultados
        if (!busquedaRapidaRef.current) {
          setHayMasResultados(siguientePagina < totalPaginasBusqueda);
        } else {
          setHayMasResultados(productosAdicionales.length >= 15);
        }
      } else {
        setHayMasResultados(false);
      }
      
    } catch (error) {
      console.error('Error cargando más resultados:', error);
      setHayMasResultados(false);
    } finally {
      setEsBuscando(false);
    }
  }, [terminoBusqueda, paginaBusqueda, hayMasResultados, esBuscando, realizarBusqueda, totalPaginasBusqueda]);

  // Limpiar búsqueda
  const limpiarBusqueda = useCallback(() => {
    setTerminoBusqueda('');
    setResultadosBusqueda([]);
    setPaginaBusqueda(1);
    setTotalPaginasBusqueda(1);
    setHayMasResultados(false);
    setEsBuscando(false);
    busquedaRapidaRef.current = false;
    ultimaBusquedaRef.current = '';
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Buscar producto por código específico (mejorado)
  const buscarPorCodigo = useCallback(async (codigo: string): Promise<Producto | null> => {
    try {
      if (debug) {
        console.log(`🔍 Buscando por código: "${codigo}"`);
      }
      
      const productoEncontrado = await ProductoService.buscarProductoPorCodigo(
        cajaId,
        listaPrecioId,
        codigo,
        bodega
      );

      if (productoEncontrado) {
        const productoUi = ProductoService.mapApiProductoToUiProducto(productoEncontrado);
        
        if (debug) {
          setDebugInfo((prev: DebugInfo) => ({
            ...prev,
            busqueda_por_codigo: {
              codigo: codigo,
              producto_encontrado: productoUi,
              timestamp: new Date().toISOString()
            }
          }));
        }
        
        return productoUi;
      }
      
      return null;
    } catch (err) {
      console.error('Error buscando por código:', err);
      
      if (debug) {
        setDebugInfo((prev: DebugInfo) => ({
          ...prev,
          error_busqueda_codigo: {
            codigo: codigo,
            error: err instanceof Error ? err.message : 'Error desconocido',
            timestamp: new Date().toISOString()
          }
        }));
      }
      
      return null;
    }
  }, [cajaId, listaPrecioId, bodega, debug]);

  // Limpiar caché
  const limpiarCache = useCallback(() => {
    ProductoService.clearAllCache();
    if (debug) {
      setDebugInfo((prev: DebugInfo) => ({
        ...prev,
        cache_limpiado: new Date().toISOString()
      }));
    }
  }, [debug]);

  // Cargar productos iniciales al montar el componente
  useEffect(() => {
    if (autoLoad) {
      cargarProductos();
    }
  }, [cargarProductos, autoLoad]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Efecto para limpiar búsqueda cuando cambian los parámetros principales
  useEffect(() => {
    if (terminoBusqueda) {
      limpiarBusqueda();
    }
  }, [cajaId, listaPrecioId, bodega]); // No incluir limpiarBusqueda para evitar loop

  return {
    // Estado de productos principales
    productos,
    totalProductos,
    paginaActual,
    totalPaginas,
    
    // Estado de búsqueda optimizada
    terminoBusqueda,
    resultadosBusqueda,
    esBuscando,
    hayMasResultados,
    
    // Estado de carga
    esCargando,
    esCargandoMas,
    error,
    
    // Estadísticas
    stats,
    
    // Debug info
    debugInfo,
    
    // Acciones principales
    buscarProductos,
    limpiarBusqueda,
    cargarMasProductos,
    cargarMasResultadosBusqueda,
    recargarProductos,
    buscarPorCodigo,
    
    // Utilidades
    testConexion,
    limpiarCache
  };
};