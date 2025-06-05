import AuthService from '../auth';
import { API_BASE_URL, apiRequest } from './config';

export interface TipoDocumento {
  tipomov: number;
  ntipomov: string;
  activo: boolean;
  factura: boolean;
  notacred: boolean;
  compra: boolean;
  ANTICIPO: boolean;
  notadebito: boolean;
  pedido: boolean;
  inventario: boolean;
  cargo: string;
  correl: number;
  empresa: number;
}

export interface TipoDocumentoDetalle extends TipoDocumento {
  preferido: boolean;
  coniva: boolean;
  iva: boolean;
  cancelacion: boolean;
  anulacion: boolean;
  notacargo: boolean;
  produccion: boolean;
  cambodega: boolean;
  devolucion: boolean;
  efectivo: boolean;
  cheque: boolean;
  ajuste: boolean;
  impuesto: boolean;
  costo: boolean;
  bonificacion: boolean;
  bonifextra: boolean;
  invinicial: boolean;
  nlineasmax: number;
  modulo: number;
  controlcorrel: number;
  qmin: number;
  qmax: number;
}

export interface TiposDocumentoResponse {
  facturas: TipoDocumento[];
  notas_credito: TipoDocumento[];
  compras: TipoDocumento[];
  inventario: TipoDocumento[];
  pedidos: TipoDocumento[];
}

class TipoDocumentoService {
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

  // Obtener todos los tipos de documento
  static async getTiposDocumento(activo?: boolean, tipo?: string): Promise<TipoDocumento[]> {
    try {
      const empresaId = this.getEmpresaId();
      const searchParams = new URLSearchParams({
        empresa_id: empresaId.toString()
      });

      if (activo !== undefined) {
        searchParams.append('activo', String(activo));
      }

      if (tipo) {
        searchParams.append('tipo', tipo);
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/tipodocumentos/?${searchParams}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener tipos de documento:', error);
      throw error;
    }
  }

  // Obtener categorías de tipos de documento
  static async getTiposDocumentoCategorizados(): Promise<TiposDocumentoResponse> {
    try {
      const empresaId = this.getEmpresaId();
      const response = await fetch(`${API_BASE_URL}/api/v1/tipodocumentos/categorias?empresa_id=${empresaId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener categorías de documentos:', error);
      throw error;
    }
  }

  // Obtener detalle de un tipo de documento
  static async getTipoDocumentoDetalle(tipomovId: number): Promise<TipoDocumentoDetalle> {
    try {
      const empresaId = this.getEmpresaId();
      const response = await fetch(`${API_BASE_URL}/api/v1/tipodocumentos/${tipomovId}?empresa_id=${empresaId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener detalle del tipo de documento:', error);
      throw error;
    }
  }
}

export default TipoDocumentoService;