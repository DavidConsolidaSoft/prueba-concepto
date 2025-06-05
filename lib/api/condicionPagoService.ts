// lib/api/condicionPagoService.ts - Versión corregida
import AuthService from '../auth';
import { API_BASE_URL, apiRequest } from './config'; // Usar configuración centralizada

export interface CondicionPago {
  condpago: number;
  ncondpago: string;
  plazo: number;
  contado: boolean;
  preferido: boolean;
  tarjeta: boolean;
  cheque: boolean;
  vueltaviaje: boolean;
  remesa: boolean;
  otro: boolean;
}

export interface CondicionPagoDetalle extends CondicionPago {
  activo: boolean;
  empresa: number;
  usuario: number;
  horatiempo: string;
}

class CondicionPagoService {
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
      try {
        const empresa = JSON.parse(empresaInfo);
        return empresa.id;
      } catch (e) {
        console.error('Error parsing empresa_info:', e);
      }
    }
    return 1; // valor por defecto
  }

  // Obtener condiciones de pago según el tipo
  static async getCondicionesPago(tipo?: 'contado' | 'credito' | 'todos'): Promise<CondicionPago[]> {
    try {
      const empresaId = this.getEmpresaId();
     
      const searchParams = new URLSearchParams({
        empresa_id: empresaId.toString(),
      });
     
      if (tipo) {
        searchParams.append('tipo', tipo);
      }
     
      console.log('🔍 Obteniendo condiciones de pago:', { empresaId, tipo, url: API_BASE_URL });
     
      // Usar la función centralizada de API request
      const response = await apiRequest(`/api/v1/formaspago/condiciones/?${searchParams}`, {
        method: 'GET'
      });
     
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', { status: response.status, text: errorText });
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
     
      const data = await response.json();
      console.log('✅ Condiciones de pago obtenidas:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener condiciones de pago:', error);
      throw error;
    }
  }

  // Obtener detalle de una condición de pago específica
  static async getCondicionPagoDetalle(condpagoId: number): Promise<CondicionPagoDetalle> {
    try {
      const empresaId = this.getEmpresaId();
     
      console.log('🔍 Obteniendo detalle de condición de pago:', { condpagoId, empresaId });
     
      const response = await apiRequest(`/api/v1/formaspago/condiciones/${condpagoId}?empresa_id=${empresaId}`, {
        method: 'GET'
      });
     
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', { status: response.status, text: errorText });
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
     
      const data = await response.json();
      console.log('✅ Detalle de condición de pago obtenido');
      return data;
    } catch (error) {
      console.error('❌ Error al obtener detalle de la condición de pago:', error);
      throw error;
    }
  }
}

export default CondicionPagoService;