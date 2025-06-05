// lib/types/facturaTypes.ts

// Datos del cliente para la factura
export interface ClienteFactura {
  id: string;             // Código del cliente
  nombre: string;         // Nombre del cliente
  tipoDocumento: string;  // Tipo de documento (NIT, DUI)
  numeroRegistro: string; // Número de registro/documento
  direccion: string;      // Dirección
  telefono: string;       // Teléfono
  email: string;          // Correo electrónico
  tipoCliente: string;    // Tipo de cliente (Individual, Corporativo)
  contado: boolean;       // Si es cliente de contado
  credito: boolean;       // Si es cliente de crédito
  giro?: string;          // Giro comercial (para empresas)
  razonSocial?: string;   // Razón social (para empresas)
  limiteCredito?: number; // Límite de crédito
  // Atributos fiscales
  exento?: boolean;       // Si está exento de impuestos
  retencion?: boolean;    // Si aplica retención
  percepcion?: boolean;   // Si aplica percepción
  gobierno?: boolean;     // Si es entidad de gobierno
}

// Datos del vendedor para la factura
export interface VendedorFactura {
  id: number;             // ID del vendedor
  nombre: string;         // Nombre del vendedor
  activo: boolean;        // Si está activo
  tipo: string;           // Tipo de vendedor (si aplica)
  email?: string;         // Correo electrónico
}

// Tipo de documento para la factura
export interface TipoDocumentoFactura {
  id: number;             // ID del tipo de documento
  nombre: string;         // Nombre del tipo de documento
  correlativo: number;    // Correlativo actual
  aplicaIVA: boolean;     // Si aplica IVA
  esFactura: boolean;     // Si es factura
  esNotaCredito: boolean; // Si es nota de crédito
  esExportacion: boolean; // Si es para exportación
  preferido: boolean;     // Si es preferido
  noAplicaIVA: boolean;   // Si no aplica IVA
}

// Forma de pago para la factura
export interface FormaPagoFactura {
  id: number;             // ID de la forma de pago
  nombre: string;         // Nombre de la forma de pago
  fijo: boolean;          // Si es pago fijo
  obra: boolean;          // Si es pago por obra
  comision: boolean;      // Si es por comisión
  frecuente: boolean;     // Si es frecuente
}

// Condición de pago para la factura
export interface CondicionPagoFactura {
  id: number;             // ID de la condición de pago
  nombre: string;         // Nombre de la condición de pago
  plazo: number;          // Plazo en días
  contado: boolean;       // Si es de contado
  credito: boolean;       // Si es a crédito
  tarjeta: boolean;       // Si es con tarjeta
  cheque: boolean;        // Si es con cheque
}

// Producto para la factura
export interface ProductoFactura {
  id: number;                // ID del producto
  kardexId: number;          // ID de kardex
  loteId: number;            // ID del lote
  nombre: string;            // Nombre del producto
  codigo: string;            // Código del producto
  precio: number;            // Precio unitario
  cantidad: number;          // Cantidad
  descuento: number;         // Porcentaje de descuento
  subtotal: number;          // Subtotal (precio * cantidad)
  total: number;             // Total (subtotal - descuento)
  esServicio: boolean;       // Si es un servicio
  nolote?: string;           // Número de lote (si aplica)
  fechaVencimiento?: string; // Fecha de vencimiento del lote
}

// Datos de la factura
export interface FacturaData {
  // Datos principales
  id?: number;                 // ID de la factura (para edición)
  numeroDocumento?: string;    // Número de documento (para edición)
  tipoDocumento: TipoDocumentoFactura;
  fecha: string;               // Fecha de emisión
  cliente: ClienteFactura;
  vendedor: VendedorFactura;
  formaPago: FormaPagoFactura;
  condicionPago: CondicionPagoFactura;
  
  // Productos
  productos: ProductoFactura[];
  
  // Totales
  subtotal: number;            // Subtotal sin impuestos
  descuento: number;           // Valor del descuento
  porcentajeDescuento: number; // Porcentaje de descuento aplicado
  iva: number;                 // Valor del IVA
  percepcion: number;          // Valor de percepción
  retencion: number;           // Valor de retención
  propina: number;             // Valor de propina
  total: number;               // Total a pagar
  
  // Datos adicionales
  bodega: number;              // ID de la bodega
  caja: number;                // ID de la caja
  moneda: number;              // ID de la moneda (default: 1)
  tasaCambio: number;          // Tasa de cambio (default: 1)
  notas?: string;              // Notas adicionales
  
  // Estado
  estado?: string;             // Estado de la factura
  impresa?: boolean;           // Si ha sido impresa
  cerrada?: boolean;           // Si está cerrada
  nula?: boolean;              // Si está anulada
  usuarioCreacion?: number;    // ID del usuario que creó la factura
  fechaCreacion?: string;      // Fecha de creación
}