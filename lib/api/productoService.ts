// lib/api/productoService.ts - VERSIÓN OPTIMIZADA CON BÚSQUEDA MEJORADA
import AuthService from '../auth';
import { API_BASE_URL, API_ENDPOINTS, getCurrentEmpresaId, buildUrl, DEFAULT_VALUES } from './config';

export interface ProductoKardex {
  producto: number;
  nproducto: string;
  icdbarra?: string;
  codbarra?: string;
  cantidad: number;
  rcantidad: number;
  nolote?: string;
  orden?: string;
  kardex: number;
  lote: number;
  tprecio: number;
  fprecio: number;
  fecvence?: string;
  existencia: number;
  columna?: number;
  volumen?: number;
  tallak?: number;
  factor?: number;
  cant: number;
  qdec: number;
  servicios: boolean;
  promo: number;
  korden: number;
}

export interface ListaPrecio {
  prodprec: number;
  fechainicial?: string;
  fechafinal?: string;
}

export interface ProductosResponse {
  productos: ProductoKardex[];
  total: number;
  pagina: number;
  total_paginas: number;
  items_por_pagina: number;
  tiene_promociones: boolean;
}

export interface BusquedaTiempoRealResponse {
  productos: ProductoKardex[];
  total_resultados: number;
  termino_busqueda: string;
}

export interface Producto {
  id: number;
  nombre: string;
  codigo: string;
  precio: string;
  precioNumerico: number;
  imagen: string;
  existencias: number;
  kardexId: number;
  loteId: number;
  nolote?: string;
  esServicio: boolean;
  esPromo: boolean;
  fechaVencimiento?: string;
  codigoBarras?: string;
  cantidadReservada: number;
  // Nuevos campos para mejor control
  cantidadTotal: number; // Suma de todas las existencias de este producto
  registrosKardex: number; // Cantidad de registros de kardex para este producto
}

class ProductoService {
  // Cache optimizado para búsquedas
  private static searchCache: Map<string, { 
    data: ProductoKardex[], 
    timestamp: number,
    nextPage?: number 
  }> = new Map();
  
  private static productCache: Map<string, {
    data: ProductosResponse,
    timestamp: number
  }> = new Map();
  
  private static CACHE_TTL = 30000; // 30 segundos para búsquedas
  private static PRODUCT_CACHE_TTL = 60000; // 1 minuto para listado general

  // Obtener headers con autenticación
  private static getHeaders(): HeadersInit {
    const token = AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Normalizar término de búsqueda para mejor experiencia
  private static normalizeSearchTerm(term: string): string {
    if (!term) return '';
    
    return term
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
      .replace(/[^\w\s]/g, ''); // Remover caracteres especiales excepto espacios
  }

  // Generar clave de caché
  private static getCacheKey(params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return sortedParams;
  }

  // Obtener listas de precios disponibles
  static async getListasPrecios(): Promise<ListaPrecio[]> {
    try {
      const empresaId = getCurrentEmpresaId();
      const url = buildUrl(API_ENDPOINTS.PRODUCTOS.LISTAS_PRECIOS, { empresa_id: empresaId });
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener listas de precios:', error);
      throw error;
    }
  }

  // Consolidar productos duplicados (DESHABILITADO - Backend ya consolida)
  private static consolidateProducts(productos: ProductoKardex[]): ProductoKardex[] {
    // Ya no es necesario consolidar - el backend devuelve productos únicos
    return productos;
  }

  // Obtener productos del kardex con paginación - CORREGIDO PARA MOSTRAR TODOS
  static async getProductosKardex(
    cajaId: number,
    listaPrecioId: number,
    busqueda: string = '',
    bodega: string = '%',
    soloExistencias: boolean = false, // CAMBIADO: Por defecto mostrar todos
    conEstante: boolean = false,
    precioPromo: boolean = false,
    esControlMesa: boolean = false,
    pagina: number = 1,
    itemsPorPagina: number = 10
  ): Promise<ProductosResponse> {
    try {
      const empresaId = getCurrentEmpresaId();
      
      // Generar clave de caché
      const cacheParams = {
        empresaId, cajaId, listaPrecioId, busqueda, bodega, 
        soloExistencias, pagina, itemsPorPagina
      };
      const cacheKey = this.getCacheKey(cacheParams);
      
      // Verificar caché para listado general (no búsqueda)
      if (!busqueda && pagina === 1) {
        const cached = this.productCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < this.PRODUCT_CACHE_TTL)) {
          return cached.data;
        }
      }
      
      const params = {
        empresa_id: empresaId,
        caja_id: cajaId,
        prodprec_id: listaPrecioId,
        busqueda: busqueda || '%',
        bodega: bodega,
        solo_existencias: soloExistencias,
        con_estante: conEstante,
        precio_promo: precioPromo,
        es_control_mesa: esControlMesa,
        pagina: pagina,
        items_por_pagina: itemsPorPagina
      };
      
      const url = buildUrl(API_ENDPOINTS.PRODUCTOS.KARDEX, params);
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: ProductosResponse = await response.json();
      
      // Consolidar productos duplicados
      if (data.productos && data.productos.length > 0) {
        data.productos = this.consolidateProducts(data.productos);
      }
      
      // Guardar en caché si es listado general
      if (!busqueda && pagina === 1) {
        this.productCache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error al obtener productos del kardex:', error);
      throw error;
    }
  }

  // Búsqueda optimizada en tiempo real
  static async buscarProductosTiempoReal(
    cajaId: number,
    listaPrecioId: number,
    termino: string,
    limit: number = 15,
    bodega: string = '%'
  ): Promise<ProductoKardex[]> {
    // Validar longitud mínima
    if (!termino || termino.trim().length < 2) {
      return [];
    }

    const terminoNormalizado = this.normalizeSearchTerm(termino);
    const empresaId = getCurrentEmpresaId();
    
    const cacheKey = `search_${terminoNormalizado}_${empresaId}_${cajaId}_${listaPrecioId}_${limit}`;
    
    // Verificar caché
    const cached = this.searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
      return cached.data;
    }

    try {
      const params = {
        empresa_id: empresaId,
        caja_id: cajaId,
        prodprec_id: listaPrecioId,
        q: terminoNormalizado,
        limit: limit,
        bodega: bodega
      };
      
      const url = buildUrl('/api/v1/productos/buscar', params);
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        console.warn(`Búsqueda falló: ${response.status}`);
        return [];
      }
      
      const data: BusquedaTiempoRealResponse = await response.json();
      
      // Consolidar productos duplicados en la búsqueda
      const productosConsolidados = this.consolidateProducts(data.productos || []);
      
      // Guardar en caché
      this.searchCache.set(cacheKey, {
        data: productosConsolidados,
        timestamp: Date.now()
      });
      
      // Limpiar caché expirado
      this.cleanExpiredCache();
      
      return productosConsolidados;
    } catch (error) {
      console.error('Error en búsqueda tiempo real:', error);
      return [];
    }
  }

  // Búsqueda con paginación para resultados extensos
  static async buscarProductosConPaginacion(
    cajaId: number,
    listaPrecioId: number,
    termino: string,
    pagina: number = 1,
    itemsPorPagina: number = 10,
    bodega: string = '%'
  ): Promise<ProductosResponse> {
    if (!termino || termino.trim().length < 2) {
      return {
        productos: [],
        total: 0,
        pagina: 1,
        total_paginas: 0,
        items_por_pagina: itemsPorPagina,
        tiene_promociones: false
      };
    }

    // Usar el endpoint de kardex con búsqueda para obtener paginación completa
    return this.getProductosKardex(
      cajaId,
      listaPrecioId,
      termino,
      bodega,
      true, // solo existencias
      false,
      false,
      false,
      pagina,
      itemsPorPagina
    );
  }

  // Mapear ProductoKardex a Producto para el frontend
  static mapApiProductoToUiProducto(apiProducto: ProductoKardex): Producto {
    // Calcular existencias reales (cantidad - cantidad reservada)
    const existenciasReales = Math.max(0, apiProducto.cantidad - (apiProducto.rcantidad || 0));
    
    return {
      id: apiProducto.producto,
      nombre: apiProducto.nproducto?.trim() || 'Sin nombre',
      codigo: apiProducto.icdbarra?.trim() || apiProducto.codbarra?.trim() || `P${apiProducto.producto}`,
      precio: this.formatCurrency(apiProducto.tprecio || 0),
      precioNumerico: apiProducto.tprecio || 0,
      imagen: '/producto-default.png',
      existencias: existenciasReales,
      kardexId: apiProducto.kardex,
      loteId: apiProducto.lote,
      nolote: apiProducto.nolote?.trim(),
      esServicio: apiProducto.servicios || false,
      esPromo: (apiProducto.promo || 0) > 0,
      fechaVencimiento: apiProducto.fecvence,
      codigoBarras: apiProducto.codbarra?.trim(),
      cantidadReservada: apiProducto.rcantidad || 0,
      cantidadTotal: apiProducto.cantidad || 0,
      registrosKardex: 1 // Este campo se puede mejorar con más información del backend
    };
  }

  // Mapear múltiples productos sin logs de debug
  static mapMultipleApiProductos(apiProductos: ProductoKardex[]): Producto[] {
    if (!Array.isArray(apiProductos)) {
      return [];
    }
    
    // Backend ya devuelve productos únicos, no necesitamos consolidar
    return apiProductos.map(producto => this.mapApiProductoToUiProducto(producto));
  }

  // Buscar producto por código específico (mejorado)
  static async buscarProductoPorCodigo(
    cajaId: number,
    listaPrecioId: number,
    codigo: string,
    bodega: string = '%'
  ): Promise<ProductoKardex | null> {
    try {
      // Primero buscar por código exacto
      const productos = await this.buscarProductosTiempoReal(
        cajaId,
        listaPrecioId,
        codigo,
        10,
        bodega
      );
      
      if (productos.length === 0) {
        return null;
      }
      
      // Buscar coincidencia exacta primero
      for (const producto of productos) {
        if (producto.codbarra?.trim() === codigo || 
            producto.icdbarra?.trim() === codigo ||
            producto.producto.toString() === codigo) {
          return producto;
        }
      }
      
      // Buscar coincidencia parcial en códigos
      for (const producto of productos) {
        if (producto.codbarra?.trim().includes(codigo) || 
            producto.icdbarra?.trim().includes(codigo)) {
          return producto;
        }
      }
      
      // Si no hay coincidencia de código, devolver el primero que coincida en nombre
      return productos[0];
      
    } catch (error) {
      console.error('Error al buscar producto por código:', error);
      return null;
    }
  }

  // Limpiar caché expirado
  private static cleanExpiredCache(): void {
    const now = Date.now();
    
    // Limpiar caché de búsqueda
    const expiredSearchKeys: string[] = [];
    this.searchCache.forEach((value, key) => {
      if (now - value.timestamp > this.CACHE_TTL) {
        expiredSearchKeys.push(key);
      }
    });
    expiredSearchKeys.forEach(key => this.searchCache.delete(key));
    
    // Limpiar caché de productos
    const expiredProductKeys: string[] = [];
    this.productCache.forEach((value, key) => {
      if (now - value.timestamp > this.PRODUCT_CACHE_TTL) {
        expiredProductKeys.push(key);
      }
    });
    expiredProductKeys.forEach(key => this.productCache.delete(key));
  }

  // Limpiar todo el caché
  static clearAllCache(): void {
    this.searchCache.clear();
    this.productCache.clear();
  }

  // Métodos de utilidad
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  static calcularDescuento(precio: number, cantidad: number, porcentajeDescuento: number): number {
    const subtotal = precio * cantidad;
    return subtotal * (porcentajeDescuento / 100);
  }

  static calcularPrecioConDescuento(
    precio: number, 
    cantidad: number, 
    porcentajeDescuento: number = 0
  ): number {
    const subtotal = precio * cantidad;
    const descuento = this.calcularDescuento(precio, cantidad, porcentajeDescuento);
    return subtotal - descuento;
  }

  static validarDisponibilidad(producto: Producto, cantidadSolicitada: number): {
    esValido: boolean;
    mensaje?: string;
    cantidadMaxima: number;
  } {
    // Los servicios siempre están disponibles
    if (producto.esServicio) {
      return {
        esValido: true,
        cantidadMaxima: 999999
      };
    }

    // Verificar existencias
    if (producto.existencias <= 0) {
      return {
        esValido: false,
        mensaje: 'Producto sin existencias',
        cantidadMaxima: 0
      };
    }

    if (cantidadSolicitada > producto.existencias) {
      return {
        esValido: false,
        mensaje: `Solo hay ${producto.existencias} unidades disponibles`,
        cantidadMaxima: producto.existencias
      };
    }

    return {
      esValido: true,
      cantidadMaxima: producto.existencias
    };
  }
}

export default ProductoService;