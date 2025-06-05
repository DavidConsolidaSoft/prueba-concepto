import AuthService from '../auth';
import { API_BASE_URL, apiRequest } from './config';

export interface FormaPago {
  formpago: number;
  nformpago: string;
  activo: boolean;
  frecuente: boolean;
  empresa: number;
}

export interface FormaPagoDetalle extends FormaPago {
  FIJO?: boolean;
  OBRA?: boolean;
  COMISION?: boolean;
  HORATIEMPO: string;
  usuario?: number;
}

export interface FormasPagoPorTipoResponse {
  fijas: FormaPago[];
  por_obra: FormaPago[];
  comision: FormaPago[];
  frecuentes: FormaPago[];
}

class FormaPagoService {
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
    // En una aplicación real, manejarías este caso apropiadamente
    return 1; // valor por defecto temporalmente
  }

  // Obtener todas las formas de pago
  static async getFormasPago(activo?: boolean, frecuente?: boolean): Promise<FormaPago[]> {
    try {
      const empresaId = this.getEmpresaId();
      const searchParams = new URLSearchParams({
        empresa_id: empresaId.toString()
      });

      if (activo !== undefined) {
        searchParams.append('activo', String(activo));
      }

      if (frecuente !== undefined) {
        searchParams.append('frecuente', String(frecuente));
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/formaspago/?${searchParams}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener formas de pago:', error);
      throw error;
    }
  }

  // Obtener formas de pago categorizadas por tipo
  static async getFormasPagoPorTipo(): Promise<FormasPagoPorTipoResponse> {
    try {
      const empresaId = this.getEmpresaId();
      const response = await fetch(`${API_BASE_URL}/api/v1/formaspago/por-tipo?empresa_id=${empresaId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener categorías de formas de pago:', error);
      throw error;
    }
  }

  // Obtener detalle de una forma de pago
  static async getFormaPagoDetalle(formpagoId: number): Promise<FormaPagoDetalle> {
    try {
      const empresaId = this.getEmpresaId();
      const response = await fetch(`${API_BASE_URL}/api/v1/formaspago/${formpagoId}?empresa_id=${empresaId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener detalle de la forma de pago:', error);
      throw error;
    }
  }
}

export default FormaPagoService;