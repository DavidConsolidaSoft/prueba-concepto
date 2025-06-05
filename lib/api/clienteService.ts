// lib/api/clienteService.ts
import AuthService from '../auth';
import { API_BASE_URL, API_ENDPOINTS, getCurrentEmpresaId, buildUrl, DEFAULT_VALUES } from './config';

export interface ClienteBase {
  // Información básica
  nclientes?: string;
  propietario?: string;
  activo?: boolean;
  
  // Documentos e identificación
  registro?: string;
  nit?: string;
  dui?: string;
  
  // Información de contacto
  direccion?: string;
  telefono1?: string;
  telefono2?: string;
  celular?: string;
  email?: string;
  
  // Clasificación del cliente
  tipcli?: number;
  giro?: string;
  razonsoc?: string;
  contado?: boolean;
  
  // Información fiscal
  exento?: boolean;
  retencion?: boolean;
  nosujeto?: boolean;
  gobierno?: boolean;
  ivacero?: boolean;
  percepcion?: boolean;
  autoconsumo?: boolean;
  PROPIO?: boolean;
  ExcluirCredito?: boolean;
  
  // Configuración de créditos
  limitecredito?: number;
  
  // Información regional
  pais?: number;
  municip?: number;
  
  // Información adicional
  condpago?: number;
  prodprec?: number;
  cliencatego?: number;
}

export interface ClienteResponse extends ClienteBase {
  clientes: string;
  empresa: number;
  idClientes: number;
  horatiempo: string;
}

export interface ClienteDetalle extends ClienteResponse {
  // Campos adicionales para el detalle completo
  moneda: number;
  transpte: number;
  contacto: string;
  recomendado: string;
  razonsoc: string;
  fax: string;
  descuento: number;
  promcomp: number;
  prompago: number;
  saldo: string;
  notas: string;
  usuario: number;
  vendedor: number;
  bodega: number;
}

export interface ClientesPaginados {
  items: ClienteResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ClientesPorTipoResponse {
  individuales: ClienteResponse[];
  corporativos: ClienteResponse[];
  contado: ClienteResponse[];
  credito: ClienteResponse[];
}

export interface Cliente {
  id: number;
  codigo: string;
  nombre: string;
  tipoDocumento: string;
  numeroRegistro: string;
  tipoCliente: string;
  giro: string;
  razonSocial: string;
  conglomerado: string;
  limiteCredito: string;
  email: string;
  emailAlterno: string;
  telefono: string;
  telefonoAlterno: string;
  pais: string;
  departamento: string;
  municipio: string;
  direccion: string;
  saldoDisponible?: string;
  vencidas?: string | number;
  montoAdeudado?: string | number;
  verificadoDICOM: boolean;
  retencion: boolean;
  aplicaIVAPropia: boolean;
  noRestringirCredito: boolean;
  tasaCero: boolean;
  percepcion: boolean;
  gobierno: boolean;
  noSujeto: boolean;
  propioTalSol: boolean;
  autoConsumo: boolean;
  clienteExportacion: boolean;
  excentoImpuestos: boolean;
}

class ClienteService {
  // Obtener headers con autenticación
  private static getHeaders(): HeadersInit {
    const token = AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
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
  private static createCacheKey(query: string, limit: number): string {
    const normalized = this.normalizeSearchTerm(query);
    return `search_${normalized}_${limit}`;
  }

  // Obtener lista paginada de clientes
  static async getClientes(
    activo?: boolean, 
    tipcli?: number, 
    search?: string,
    page: number = 1, 
    size: number = DEFAULT_VALUES.PAGE_SIZE.CLIENTES
  ): Promise<ClientesPaginados> {
    try {
      const empresaId = getCurrentEmpresaId();
      // Normalizar término de búsqueda si existe
      const searchNormalized = search ? this.normalizeSearchTerm(search) : undefined;

      const params = {
        empresa_id: empresaId,
        page,
        size,
        activo: activo !== undefined ? activo : undefined,
        tipcli,
        search: searchNormalized && searchNormalized.length >= 2 ? searchNormalized : undefined
      };

      const url = buildUrl(API_ENDPOINTS.CLIENTES.LIST, params);
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  }

  // Obtener clientes agrupados por tipo
  static async getClientesPorTipo(): Promise<ClientesPorTipoResponse> {
    try {
      const empresaId = getCurrentEmpresaId();
      const url = buildUrl(API_ENDPOINTS.CLIENTES.BY_TYPE, { empresa_id: empresaId });
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener clientes por tipo:', error);
      throw error;
    }
  }

  // Obtener detalle de un cliente
  static async getClienteDetalle(clienteId: string): Promise<ClienteDetalle> {
    try {
      const empresaId = getCurrentEmpresaId();
      const url = buildUrl(API_ENDPOINTS.CLIENTES.DETAIL(clienteId), { empresa_id: empresaId });
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener detalle del cliente:', error);
      throw error;
    }
  }

  // Crear un nuevo cliente
  static async createCliente(clienteData: ClienteBase): Promise<ClienteResponse> {
    try {
      const empresaId = getCurrentEmpresaId();
      const url = buildUrl(API_ENDPOINTS.CLIENTES.LIST, { empresa_id: empresaId });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(clienteData)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  }

  // Actualizar un cliente existente
  static async updateCliente(clienteId: string, clienteData: ClienteBase): Promise<ClienteResponse> {
    try {
      const empresaId = getCurrentEmpresaId();
      const url = buildUrl(API_ENDPOINTS.CLIENTES.DETAIL(clienteId), { empresa_id: empresaId });
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(clienteData)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  }

  // Eliminar un cliente (marcar como inactivo)
  static async deleteCliente(clienteId: string): Promise<{ message: string }> {
    try {
      const empresaId = getCurrentEmpresaId();
      const url = buildUrl(API_ENDPOINTS.CLIENTES.DETAIL(clienteId), { empresa_id: empresaId });
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      throw error;
    }
  }

  // Mapear datos de API a interfaz Cliente utilizada en el frontend
  static mapApiClienteToUiCliente(apiCliente: ClienteResponse | ClienteDetalle): Cliente {
    return {
      id: apiCliente.idClientes,
      codigo: apiCliente.clientes,
      nombre: apiCliente.nclientes || '',
      tipoDocumento: apiCliente.nit ? 'NIT' : 'DUI',
      numeroRegistro: apiCliente.registro || '',
      tipoCliente: String(apiCliente.tipcli || ''),
      giro: apiCliente.giro || '',
      razonSocial: apiCliente.razonsoc || '',
      conglomerado: '',
      limiteCredito: `$${apiCliente.limitecredito?.toFixed(2) || '0.00'}`,
      email: apiCliente.email || '',
      emailAlterno: '',
      telefono: apiCliente.telefono1 || '',
      telefonoAlterno: apiCliente.telefono2 || '',
      pais: 'El Salvador',
      departamento: '',
      municipio: '',
      direccion: apiCliente.direccion || '',
      saldoDisponible: '$0.00',
      vencidas: '0.00',
      montoAdeudado: '0.00',
      verificadoDICOM: false,
      retencion: apiCliente.retencion || false,
      aplicaIVAPropia: false,
      noRestringirCredito: apiCliente.ExcluirCredito || false,
      tasaCero: apiCliente.ivacero || false,
      percepcion: apiCliente.percepcion || false,
      gobierno: apiCliente.gobierno || false,
      noSujeto: apiCliente.nosujeto || false,
      propioTalSol: apiCliente.PROPIO || false,
      autoConsumo: apiCliente.autoconsumo || false,
      clienteExportacion: false,
      excentoImpuestos: apiCliente.exento || false
    };
  }

  // Cargar clientes con paginación
  static async loadMoreClientes(
    page: number,
    size: number = DEFAULT_VALUES.PAGE_SIZE.CLIENTES,
    activo: boolean = true,
    tipcli?: number,
    search?: string
  ): Promise<ClientesPaginados> {
    return this.getClientes(activo, tipcli, search, page, size);
  }

  // Búsqueda inmediata optimizada con caché inteligente
  static cachedSearchResults: Map<string, { data: Cliente[], timestamp: number }> = new Map();
  static CACHE_TTL = 30000; // 30 segundos de caché

  static async searchClientes(
    query: string,
    limit: number = 20
  ): Promise<Cliente[]> {
    try {
      // Normalizar query
      const queryNormalized = this.normalizeSearchTerm(query);
      
      // Validar longitud mínima
      if (!queryNormalized || queryNormalized.length < 2) {
        console.log(`[ClienteService] Query muy corto: '${query}' -> '${queryNormalized}'`);
        return [];
      }
      
      // Verificar caché con clave normalizada
      const cacheKey = this.createCacheKey(queryNormalized, limit);
      const cachedData = this.cachedSearchResults.get(cacheKey);
      
      if (cachedData && (Date.now() - cachedData.timestamp < this.CACHE_TTL)) {
        console.log(`[ClienteService] Usando caché para: '${queryNormalized}'`);
        return cachedData.data;
      }
      
      const empresaId = getCurrentEmpresaId();
      const params = {
        empresa_id: empresaId,
        query: queryNormalized,
        limit
      };

      const url = buildUrl(API_ENDPOINTS.CLIENTES.SEARCH, params);
      console.log(`[ClienteService] Búsqueda API: '${queryNormalized}'`);
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as ClienteResponse[];
      
      // Mapear los datos a Cliente[]
      const mappedData = data.map(cliente => this.mapApiClienteToUiCliente(cliente));
      
      // Almacenar en caché con clave normalizada
      this.cachedSearchResults.set(cacheKey, { 
        data: mappedData, 
        timestamp: Date.now() 
      });
      
      // Limpiar caché expirado
      this.cleanExpiredCache();
      
      console.log(`[ClienteService] Búsqueda completada: ${mappedData.length} resultados para '${queryNormalized}'`);
      return mappedData;
    } catch (error) {
      console.error('Error en búsqueda de clientes:', error);
      return []; // Retornar array vacío en lugar de lanzar error
    }
  }

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
      console.log(`[ClienteService] Limpiadas ${expiredKeys.length} entradas de caché expiradas`);
    }
  }

  // Limpiar todo el caché manualmente
  static clearSearchCache(): void {
    this.cachedSearchResults.clear();
    console.log('[ClienteService] Caché de búsqueda limpiado');
  }

}

export default ClienteService;