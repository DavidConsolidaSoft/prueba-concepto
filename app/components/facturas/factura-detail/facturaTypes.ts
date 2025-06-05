// factura-detail/facturaTypes.ts
// Tipo Cliente debe coincidir exactamente con el de ClienteSelector.tsx
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
  vencidas?: string | number; // Puede venir como número de la API
  montoAdeudado?: string | number; // Puede venir como número de la API
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

export interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
  descuento: string; // Formato "X%" - descuento individual del producto
  total: string; // Total ya con descuento individual aplicado
  imagen: string;
  codigo: string;
  precio?: number; // Añadido para compatibilidad con API
}

export interface Factura {
  id: string;
  tipoDocumento: string;
  estado: string;
  cliente: Cliente | null;
  formaPago: string;
  descuento: string; // Descuento GENERAL de la factura (formato "X%")
  vendedor: string;
  totalPagar: string; // Total final después de aplicar descuento general
  saldoDisponible: string;
  vencidas: string | number; // Puede venir como número de la API
  montoAdeudado: string | number; // Puede venir como número de la API
  fecha: string;
  tipoCliente: string;
  productos: Producto[];
  // Campos adicionales para el desglose financiero
  subtotal?: number; // Subtotal de productos (con descuentos individuales)
  descuentoGeneralMonto?: number; // Monto del descuento general
  iva?: number;
  percepcion?: number;
  retencion?: number;
  propina?: number;
}

export const createEmptyFactura = (): Factura => ({
  id: `TMP-${Date.now()}`,
  tipoDocumento: 'Factura',
  estado: 'Abierta',
  cliente: null,
  formaPago: 'Efectivo',
  tipoCliente:'Primaria',
  descuento: '0%', // Descuento general
  vendedor: '',
  totalPagar: '$0.00',
  saldoDisponible: '$0.00',
  vencidas: '0.00',
  montoAdeudado: '0.00',
  fecha: new Date().toLocaleDateString('es-SV', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/-/g, '/'),
  productos: [],
  subtotal: 0,
  descuentoGeneralMonto: 0
});

// Cliente de ejemplo que coincide con el de ClienteSelector
export const CLIENTE_EJEMPLO: Cliente = {
  id: 1,
  codigo: '00054321',
  nombre: 'Key Process S.A de C.V',
  tipoDocumento: 'NIT',
  numeroRegistro: '202956-2',
  tipoCliente: 'Primaria',
  giro: 'Venta al por menor de otros productos',
  razonSocial: 'Key Process S.A de C.V',
  conglomerado: 'Alisal S.A de C.V',
  limiteCredito: '$5000,000,000,000',
  email: 'imarrotech@gmail.com',
  emailAlterno: 'imarrotech@consolida.com',
  telefono: '2270-2928',
  telefonoAlterno: '7727-8514',
  pais: 'El Salvador',
  departamento: 'San Salvador',
  municipio: 'San Salvador - San Salvador Centro',
  direccion: 'Calle Cuscatlan, Col. Escalón #4312',
  saldoDisponible: '$2,000.00',
  vencidas: '0.00',
  montoAdeudado: '0.00',
  verificadoDICOM: true,
  retencion: true,
  aplicaIVAPropia: true,
  noRestringirCredito: true,
  tasaCero: true,
  percepcion: true,
  gobierno: true,
  noSujeto: true,
  propioTalSol: true,
  autoConsumo: true,
  clienteExportacion: true,
  excentoImpuestos: true
};

export const MOCK_FACTURA_DETAIL: Factura = {
  id: 'S00084',
  tipoDocumento: 'Factura',
  estado: 'Abierta',
  cliente: CLIENTE_EJEMPLO,
  formaPago: 'Efectivo',
  descuento: '5%', // Descuento general del 5%
  tipoCliente: 'Primaria',
  vendedor: 'Alfonso Molina',
  totalPagar: '$570.25', // Total después del descuento general
  saldoDisponible: '$2000.00',
  vencidas: '0.00',
  montoAdeudado: '0.00',
  fecha: '02/05/2025',
  productos: [
    {
      id: 1,
      nombre: 'Taladro Black Bull Tools',
      cantidad: 2,
      descuento: '10%', // Descuento individual del producto
      total: '$540.00', // Precio ya con descuento individual (era $600, con 10% = $540)
      imagen: '/taladro.png',
      codigo: 'S00089'
    },
    {
      id: 2,
      nombre: 'Martillo Stanley',
      cantidad: 1,
      descuento: '0%', // Sin descuento individual
      total: '$60.00',
      imagen: '/martillo.png',
      codigo: 'S00090'
    }
  ],
  subtotal: 600.00, // $540 + $60 = $600 (subtotal de productos)
  descuentoGeneralMonto: 30.00 // 5% de $600 = $30
  // Total final: $600 - $30 = $570 (redondeado $570.25 en el ejemplo)
};

export const TIPOS_DOCUMENTO = ['Factura', 'CCF', 'Tiquete', 'Factura Exportación'];
export const FORMAS_PAGO = ['Efectivo', 'Cheque', 'Transferencia', 'Pago con tarjeta'];
export const VENDEDORES = [
  'Alfonso Molina',
  'María González',
  'Juan Pérez',
  'Carlos Rodríguez',
  'Ana Martínez',
  'Roberto Sánchez',
  'Luisa Fernández',
  'Eduardo Torres',
  'Carmen Ramírez',
  'Miguel López'
];

// Utilitarios para cálculos
export const FacturaCalculos = {
  /**
   * Parsea un precio string a número
   */
  parsePrice: (priceString: string): number => {
    if (typeof priceString === 'number') return priceString;
    const cleanPrice = priceString.replace(/[$,\s]/g, '');
    const numericPrice = parseFloat(cleanPrice);
    return isNaN(numericPrice) ? 0 : numericPrice;
  },

  /**
   * Formatea un número a precio
   */
  formatPrice: (price: number): string => {
    return `$${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  },

  /**
   * Calcula el total de un producto con su descuento individual
   */
  calcularTotalProducto: (precioUnitario: number, cantidad: number, descuentoPorcentaje: number): number => {
    const precioConDescuento = precioUnitario * (1 - descuentoPorcentaje / 100);
    return precioConDescuento * cantidad;
  },

  /**
   * Calcula los totales de una factura
   */
  calcularTotalesFactura: (productos: Producto[], descuentoGeneral: string) => {
    // 1. Subtotal de productos (ya incluye descuentos individuales)
    const subtotal = productos.reduce((sum, producto) => {
      return sum + FacturaCalculos.parsePrice(producto.total);
    }, 0);

    // 2. Descuento general
    const descuentoGeneralPorcentaje = parseFloat(descuentoGeneral.replace('%', '')) || 0;
    const descuentoGeneralMonto = subtotal * (descuentoGeneralPorcentaje / 100);
    
    // 3. Total final
    const totalFinal = subtotal - descuentoGeneralMonto;

    return {
      subtotal,
      descuentoGeneralPorcentaje,
      descuentoGeneralMonto,
      totalFinal
    };
  }
};