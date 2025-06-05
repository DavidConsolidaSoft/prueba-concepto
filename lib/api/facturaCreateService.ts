// lib/api/facturaCreateService.ts
import AuthService from '../auth';
import { API_BASE_URL, API_ENDPOINTS, getCurrentEmpresaId, buildUrl, DEFAULT_VALUES } from './config';

export interface NuevaFacturaData {
  // Datos principales
  tipomov: number;              // Tipo de documento (factura, etc.)
  correl: number;               // Número correlativo automático
  fecha: string;                // Fecha de emisión
  clientes: string;             // Código del cliente
  vendedor: number;             // ID del vendedor
  formpago: number;             // ID de la forma de pago
  condpago: number;             // ID de la condición de pago
  
  // Datos adicionales
  bodega: number;               // ID de la bodega
  caja: number;                 // ID de la caja
  moneda: number;               // ID de la moneda
  tasacambio: number;           // Tasa de cambio
  
  // Valores monetarios
  neto: number;                 // Valor neto
  iva: number;                  // Valor del IVA
  propina: number;              // Valor de la propina
  percepcion: number;           // Valor de la percepción
  retencion: number;            // Valor de la retención
  
  // Descuentos
  descuentovalor: number;       // Valor del descuento
  descuentoporc: number;        // Porcentaje de descuento
  
  // Artículos de la factura
  productos: ProductoFacturaData[];
  
  // Otros campos opcionales
  notas?: string;               // Notas adicionales
  mesa?: number;                // ID de la mesa (para restaurantes)
  personasq?: number;           // Cantidad de personas
}

export interface ProductoFacturaData {
  kardex: number;               // ID del kardex
  producto: number;             // ID del producto
  cantidad: number;             // Cantidad
  bonificado: number;           // Cantidad bonificada
  gratificado: number;          // Cantidad gratuita
  tprecio: number;              // Precio unitario
  descuentoporc: number;        // Porcentaje de descuento
  descuentovalor: number;       // Valor del descuento
}

export interface FacturaCreatedResponse {
  factura: number;              // ID de la factura creada
  numedocu: string;             // Número de documento generado
  mensaje: string;              // Mensaje de respuesta
  success: boolean;             // Indicador de éxito
}

class FacturaCreateService {
  // Obtener headers con autenticación
  private static getHeaders(): HeadersInit {
    const token = AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Crear nueva factura
  static async crearFactura(datosFactura: NuevaFacturaData): Promise<FacturaCreatedResponse> {
    try {
      const empresaId = getCurrentEmpresaId();
      
      // Agregar empresa_id a los datos
      const datosCompletos = {
        ...datosFactura,
        empresa: empresaId
      };
      
      const response = await fetch(API_ENDPOINTS.FACTURAS.CREATE, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(datosCompletos)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al crear factura:', error);
      throw error;
    }
  }

  // Obtener número correlativo disponible para el tipo de documento
  static async obtenerCorrelativo(tipomovId: number): Promise<number> {
    try {
      const empresaId = getCurrentEmpresaId();
      const url = buildUrl(API_ENDPOINTS.FACTURAS.CORRELATIVO, {
        empresa_id: empresaId,
        tipomov_id: tipomovId
      });
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.correlativo;
    } catch (error) {
      console.error('Error al obtener correlativo:', error);
      throw error;
    }
  }

  // Actualizar una factura existente
  static async actualizarFactura(facturaId: number, datosFactura: Partial<NuevaFacturaData>): Promise<FacturaCreatedResponse> {
    try {
      const empresaId = getCurrentEmpresaId();
      
      // Agregar empresa_id a los datos
      const datosCompletos = {
        ...datosFactura,
        empresa: empresaId
      };
      
      const url = API_ENDPOINTS.FACTURAS.UPDATE(facturaId);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(datosCompletos)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al actualizar factura:', error);
      throw error;
    }
  }

  // Anular una factura
  static async anularFactura(facturaId: number, motivo: string): Promise<{ success: boolean, mensaje: string }> {
    try {
      const empresaId = getCurrentEmpresaId();
      const url = API_ENDPOINTS.FACTURAS.ANULAR(facturaId);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          empresa_id: empresaId,
          motivo: motivo
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al anular factura:', error);
      throw error;
    }
  }

  // Función para calcular los totales de la factura basado en los productos
  static calcularTotales(productos: ProductoFacturaData[], iva: number = DEFAULT_VALUES.FACTURA.IVA_PORCENTAJE) {
    let neto = 0;
    let descuentoTotal = 0;
    
    productos.forEach(producto => {
      const subtotal = producto.cantidad * producto.tprecio;
      const descuento = subtotal * (producto.descuentoporc / 100) + producto.descuentovalor;
      
      neto += subtotal - descuento;
      descuentoTotal += descuento;
    });
    
    const ivaValor = neto * iva;
    const total = neto + ivaValor;
    
    return {
      neto,
      iva: ivaValor,
      descuentoTotal,
      total
    };
  }
}

export default FacturaCreateService;