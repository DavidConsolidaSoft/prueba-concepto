// /lib/api/facturaService.ts
import AuthService from '../auth';
import { API_BASE_URL, apiRequest } from './config';

interface FacturaListParams {
  empresa: number;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  cliente?: string;
  pedido?: string;
  caja?: string;
  estado?: 'abiertas' | 'cerradas' | 'nulas' | 'todas';
  search?: string;  // NUEVO
  page?: number;    // NUEVO
  size?: number;    // NUEVO
}

// NUEVO: Interfaz para respuesta paginada
export interface FacturasPaginadas {
  items: FacturaListItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface FacturaListItem {
  empresa: number;
  factura: number;
  numedocu: string;
  fecha: string;
  nombre_cliente: string;
  nombre_vendedor: string;
  monto_total: number;
  estado: string;
  impresa: boolean;
  nula: boolean;
  pedido: string;
  tipo_movimiento: string;
  codigo_cliente: string;
  registro: string;
  nit: string;
  dui: string;
  vendedor_codigo: number;
  tasa_cambio: number;
  caja: string;
  estado_codigo: number;
  notas: string;
  hora: string;
  neto: number;
  propina: number;
  percepcion: number;
  retencion: number;
}

export interface FacturaDetalle {
  factura: number;
  numedocu: string;
  tipo_documento: string;
  estado: string;
  fecha: string;
  codigo_cliente: string;
  nombre_cliente: string;
  tipo_cliente: string;
  direccion: string;
  telefono: string;
  nit: string;
  dui: string;
  registro: string;
  giro: string;
  codigo_vendedor: number;
  nombre_vendedor: string;
  forma_pago: string;
  tipo_pago: string;
  plazo: number;
  subtotal: number;
  descuento_aplicado: number;
  descuento_porcentaje: number;
  iva: number;
  percepcion: number;
  retencion: number;
  propina: number;
  total_pagar: number;
  saldo_disponible: number;
  vencidas: number;
  monto_adeudado: number;
  bodega: string;
  caja: string;
  notas: string;
  empresa: number;
  moneda: string;
  tasa_cambio: number;
  productos: ProductoDetalle[];
}

export interface ProductoDetalle {
  dfactura: number;
  factura: number;
  producto: number;
  codigo_producto: string;
  nombre_producto: string;
  tipo_producto: string;
  bodega: string;
  lote: string;
  cantidad: number;
  bonificado: number;
  precio: number;
  descuento_porcentaje: number;
  descuento_valor: number;
  subtotal: number;
  iva: number;
  total: number;
  exento: boolean;
  servicio: boolean;
  linea: number;
  gratificado: number;
  reservado: number;
  costo: number;
}

class FacturaService {
  // Caché para búsquedas
  static cachedSearchResults: Map<string, { data: FacturaListItem[], timestamp: number }> = new Map();
  static CACHE_TTL = 30000; // 30 segundos de caché

  // Obtener headers con autenticación
  private static getHeaders(): HeadersInit {
    const token = AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Obtener empresa del usuario actual
  private static getEmpresaId(): number {
    const empresaInfo = localStorage.getItem('empresa_info');
    if (empresaInfo) {
      const empresa = JSON.parse(empresaInfo);
      return empresa.id;
    }
    return 1; // valor por defecto temporalmente
  }

  // Normalizar término de búsqueda (consistente con backend)
  private static normalizeSearchTerm(searchTerm: string): string {
    if (!searchTerm) return '';
    
    // Eliminar espacios al inicio y final, convertir a minúsculas
    let normalized = searchTerm.trim().toLowerCase();
    
    // Eliminar espacios múltiples y dejar solo uno
    normalized = normalized.replace(/\s+/g, ' ');
    
    return normalized;
  }

  // Crear clave de caché normalizada
  private static createCacheKey(query: string, params?: any): string {
    const normalized = this.normalizeSearchTerm(query);
    const paramsStr = params ? JSON.stringify(params) : '';
    return `search_${normalized}_${paramsStr}`;
  }

  // Listar facturas con paginación mejorada
  static async getFacturas(params?: Partial<FacturaListParams>): Promise<FacturasPaginadas> {
    try {
      const empresaId = this.getEmpresaId();
      
      // Normalizar término de búsqueda si existe
      const searchNormalized = params?.search ? this.normalizeSearchTerm(params.search) : undefined;
      
      const searchParams = new URLSearchParams({
        empresa: empresaId.toString(),
        page: (params?.page || 1).toString(),
        size: (params?.size || 50).toString(),
        ...params && {
          ...(params.estado && { estado: params.estado }),
          ...(params.fecha_inicio && { fecha_inicio: params.fecha_inicio.toISOString().split('T')[0] }),
          ...(params.fecha_fin && { fecha_fin: params.fecha_fin.toISOString().split('T')[0] }),
          ...(params.cliente && { cliente: params.cliente }),
          ...(params.pedido && { pedido: params.pedido }),
          ...(params.caja && { caja: params.caja }),
          ...(searchNormalized && searchNormalized.length >= 2 && { search: searchNormalized }),
        }
      });

      console.log(`[FacturaService] Cargando facturas - página ${params?.page || 1}, búsqueda: '${searchNormalized || 'sin filtro'}'`);

      const response = await fetch(`${API_BASE_URL}/api/v1/facturas/lista?${searchParams}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[FacturaService] Cargadas ${data.items?.length || 0} facturas de ${data.total || 0} totales`);
      return data;
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      throw error;
    }
  }

  // NUEVO: Cargar más facturas (lazy loading)
  static async loadMoreFacturas(
    page: number,
    size: number = 50,
    params?: Partial<FacturaListParams>
  ): Promise<FacturasPaginadas> {
    return this.getFacturas({
      ...params,
      page,
      size
    });
  }

  // NUEVO: Búsqueda inmediata optimizada con caché
  static async searchFacturas(
    query: string,
    limit: number = 20,
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<FacturaListItem[]> {
    try {
      // Normalizar query
      const queryNormalized = this.normalizeSearchTerm(query);
      
      console.log(`[FacturaService] searchFacturas iniciado:`, {
        queryOriginal: query,
        queryNormalized,
        limit
      });
      
      // Validar longitud mínima
      if (!queryNormalized || queryNormalized.length < 2) {
        console.log(`[FacturaService] Query muy corto, retornando array vacío`);
        return [];
      }
      
      // Verificar caché
      const cacheKey = this.createCacheKey(queryNormalized, { limit, fechaInicio, fechaFin });
      const cachedData = this.cachedSearchResults.get(cacheKey);
      
      if (cachedData && (Date.now() - cachedData.timestamp < this.CACHE_TTL)) {
        console.log(`[FacturaService] Usando caché para: '${queryNormalized}', ${cachedData.data.length} resultados`);
        return cachedData.data;
      }
      
      const empresaId = this.getEmpresaId();
      const searchParams = new URLSearchParams({
        empresa: empresaId.toString(),
        query: queryNormalized,
        limit: limit.toString(),
        ...(fechaInicio && { fecha_inicio: fechaInicio.toISOString().split('T')[0] }),
        ...(fechaFin && { fecha_fin: fechaFin.toISOString().split('T')[0] })
      });

      const url = `${API_BASE_URL}/api/v1/facturas/search?${searchParams}`;
      console.log(`[FacturaService] Realizando fetch a:`, url);
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      console.log(`[FacturaService] Response status:`, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[FacturaService] Error ${response.status}:`, errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.text();
      console.log(`[FacturaService] Raw response:`, rawData.substring(0, 500) + '...');
      
      let data;
      try {
        data = JSON.parse(rawData) as FacturaListItem[];
      } catch (parseError) {
        console.error(`[FacturaService] Error parsing JSON:`, parseError);
        console.error(`[FacturaService] Raw data:`, rawData);
        throw new Error(`Error parsing response: ${parseError}`);
      }
      
      console.log(`[FacturaService] Parsed data:`, {
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'not array',
        firstItem: Array.isArray(data) && data.length > 0 ? data[0] : null
      });
      
      // Almacenar en caché
      this.cachedSearchResults.set(cacheKey, { 
        data: data, 
        timestamp: Date.now() 
      });
      
      // Limpiar caché expirado
      this.cleanExpiredCache();
      
      console.log(`[FacturaService] Búsqueda completada exitosamente: ${data.length} resultados`);
      return data;
    } catch (error) {
      console.error('[FacturaService] Error en búsqueda de facturas:', error);
      console.error('[FacturaService] Error stack:', error instanceof Error ? error.stack : 'No stack available');
      
      // Retornar array vacío en lugar de lanzar error
      return [];
    }
  }

  // Limpiar caché expirado
  private static cleanExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.cachedSearchResults.forEach((value, key) => {
      if (now - value.timestamp > this.CACHE_TTL) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => {
      this.cachedSearchResults.delete(key);
    });
    
    if (expiredKeys.length > 0) {
      console.log(`[FacturaService] Limpiadas ${expiredKeys.length} entradas de caché expiradas`);
    }
  }

  // Limpiar todo el caché manualmente
  static clearSearchCache(): void {
    this.cachedSearchResults.clear();
    console.log('[FacturaService] Caché de búsqueda limpiado');
  }

  // Obtener detalle de factura
  static async getFacturaDetalle(facturaId: number): Promise<FacturaDetalle> {
    try {
      const empresaId = this.getEmpresaId();
      const response = await fetch(`${API_BASE_URL}/api/v1/facturas/detalle/${facturaId}?empresa=${empresaId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener detalle de factura:', error);
      throw error;
    }
  }

  // Filtrar facturas localmente (para optimización) - MEJORADO
  static filterFacturas(
    facturas: FacturaListItem[], 
    searchTerm: string, 
    estado?: 'abiertas' | 'cerradas' | 'nulas'
  ): FacturaListItem[] {
    let filtered = [...facturas];

    // Filtrar por estado
    if (estado) {
      filtered = filtered.filter(factura => {
        if (estado === 'abiertas') return factura.estado === 'Abierta';
        if (estado === 'cerradas') return factura.estado === 'Cerrada';
        if (estado === 'nulas') return factura.estado === 'Nula';
        return true;
      });
    }

    // Filtrar por término de búsqueda normalizado
    if (searchTerm) {
      const searchNormalized = this.normalizeSearchTerm(searchTerm);
      const searchWords = searchNormalized.split(' ');
      
      filtered = filtered.filter(factura => {
        // Crear texto de búsqueda combinando todos los campos relevantes
        const searchableText = [
          factura.nombre_cliente,
          factura.numedocu,
          factura.nombre_vendedor,
          factura.pedido,
          factura.codigo_cliente,
          factura.notas
        ].join(' ').toLowerCase();
        
        // Verificar que todas las palabras estén presentes
        return searchWords.every(word => searchableText.includes(word));
      });
    }

    return filtered;
  }

  // Función auxiliar para formatear fecha
  static formatFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-SV', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Función auxiliar para formatear hora
  static formatHora(hora: string): string {
    return hora.split(' ')[0]; // Asumiendo que la hora viene en formato "HH:MM:SS"
  }

  // Función auxiliar para formatear moneda
  static formatMoneda(monto: number): string {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(monto);
  }
}

export default FacturaService;