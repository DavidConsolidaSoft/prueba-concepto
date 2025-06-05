// lib/api/config.ts - Versión corregida y estandarizada

// Función para obtener la URL base de forma inteligente
function getApiBaseUrl(): string {
  // Primera opción: Variable de entorno estándar
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  if (backendUrl) {
    console.log('✅ Using NEXT_PUBLIC_BACKEND_URL:', backendUrl);
    return backendUrl;
  }
  
  // Fallback: Detectar entorno automáticamente
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname.includes('azurestaticapps.net')) {
      console.log('🌐 Azure environment detected, using production backend');
      return 'https://siscal-agent-ai.siscal.one';
    }
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('🔧 Local environment detected, using local backend');
      return 'https://siscal-agent-ai.siscal.one'; // Usar backend remoto incluso en desarrollo
    }
  }
  
  // Fallback final
  console.warn('⚠️ No environment detected, using production backend');
  return 'https://siscal-agent-ai.siscal.one';
}

// URL base para la API - Función inteligente
export const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL configured:', API_BASE_URL);

// Endpoints API
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REFRESH: '/api/v1/auth/refresh',
    PROFILE: '/api/v1/auth/me',
    AZURE_LOGIN: '/api/v1/auth/azure-login',
    CALLBACK: '/api/v1/auth/callback',
  },
 
  // Clientes
  CLIENTES: {
    LIST: '/api/v1/clientes/',
    DETAIL: (id: string) => `/api/v1/clientes/${id}`,
    BY_TYPE: '/api/v1/clientes/por-tipo',
    SEARCH: '/api/v1/clientes/search',
  },
 
  // Vendedores
  VENDEDORES: {
    LIST: '/api/v1/vendedores/',
    DETAIL: (id: number) => `/api/v1/vendedores/${id}`,
  },
 
  // Tipos de Documento
  TIPO_DOCUMENTOS: {
    LIST: '/api/v1/tipodocumentos/',
    CATEGORIES: '/api/v1/tipodocumentos/categorias',
    DETAIL: (id: number) => `/api/v1/tipodocumentos/${id}`,
    FACTURAS_PAIS: '/api/v1/tipodocumentos/facturas/pais',
  },
 
  // Formas de Pago
  FORMAS_PAGO: {
    LIST: '/api/v1/formaspago/',
    BY_TYPE: '/api/v1/formaspago/por-tipo',
    DETAIL: (id: number) => `/api/v1/formaspago/${id}`,
  },
 
  // Condiciones de Pago
  CONDICIONES_PAGO: {
    LIST: '/api/v1/formaspago/condiciones/',
    DETAIL: (id: number) => `/api/v1/formaspago/condiciones/${id}`,
  },
 
  // Productos
  PRODUCTOS: {
    LISTAS_PRECIOS: '/api/v1/productos/listas-precios',
    KARDEX: '/api/v1/productos/kardex',
  },
 
  // Facturas
  FACTURAS: {
    LIST: '/api/v1/facturas/lista',
    DETAIL: (id: number) => `/api/v1/facturas/detalle/${id}`,
    CREATE: '/api/v1/facturas/crear',
    UPDATE: (id: number) => `/api/v1/facturas/${id}`,
    ANULAR: (id: number) => `/api/v1/facturas/${id}/anular`,
    CORRELATIVO: '/api/v1/facturas/correlativo',
  },
};

// Valores por defecto para facturas
export const DEFAULT_VALUES = {
  // Valores por defecto para creación de facturas
  FACTURA: {
    BODEGA_ID: 1,
    CAJA_ID: 1,
    MONEDA_ID: 1,
    TASA_CAMBIO: 1,
    IVA_PORCENTAJE: 0.13, // 13%
  },
 
  // Cantidad de elementos por página
  PAGE_SIZE: {
    CLIENTES: 50,
    PRODUCTOS: 20,
    FACTURAS: 20,
  },
};

// Función para construir URL con parámetros de consulta
export function buildUrl(endpoint: string, params: Record<string, any>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
 
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
 
  return url.toString();
}

// Función para obtener ID de empresa actual
export function getCurrentEmpresaId(): number {
  if (typeof window !== 'undefined') {
    const empresaInfo = localStorage.getItem('empresa_info');
    if (empresaInfo) {
      try {
        const empresa = JSON.parse(empresaInfo);
        return empresa.id;
      } catch (e) {
        console.error('Error parsing empresa_info:', e);
      }
    }
  }
 
  // Valor por defecto en caso de error o ejecución en servidor
  return 1;
}

// Función helper para hacer requests autenticados
export async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Headers por defecto
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Agregar token si está disponible
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // Combinar headers
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };
  
  console.log('🌐 API Request:', { url, method: options.method || 'GET' });
  
  return fetch(url, {
    ...options,
    headers,
  });
}