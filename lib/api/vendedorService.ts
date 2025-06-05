import AuthService from '../auth';
import { API_BASE_URL, apiRequest } from './config';

export interface Vendedor {
  vendedor: number;
  nvendedor: string;
  activo: boolean;
  lcobrador: boolean;
  lvendedor: boolean;
  empresa: number;
  fecingreso?: string;
  fecretiro?: string;
  vcorreo: string;
  tipovendedor: number;
  descrip?: string;
  idvend?: string;
}

class VendedorService {
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

  // Obtener todos los vendedores
  static async getVendedores(activo?: boolean): Promise<Vendedor[]> {
    try {
      const empresaId = this.getEmpresaId();
      const searchParams = new URLSearchParams({
        empresa_id: empresaId.toString()
      });

      if (activo !== undefined) {
        searchParams.append('activo', String(activo));
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/vendedores/?${searchParams}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener vendedores:', error);
      throw error;
    }
  }

  // Obtener detalle de un vendedor
  static async getVendedorDetalle(vendedorId: number): Promise<Vendedor> {
    try {
      const empresaId = this.getEmpresaId();
      const response = await fetch(`${API_BASE_URL}/api/v1/vendedores/${vendedorId}?empresa_id=${empresaId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener detalle del vendedor:', error);
      throw error;
    }
  }
}

export default VendedorService;