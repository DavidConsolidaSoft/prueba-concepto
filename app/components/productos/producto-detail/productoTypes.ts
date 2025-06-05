export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  tipoProducto: string;
  categoria: string;
  marca: string;
  referencia: string;
  referencia1: string;
  referencia2: string;
  descripcion: string;
  ubicacion: string;
  
  // Unidades y medidas
  unidadTrabajo: string;
  consumoMinimo: number;
  consumoMaximo: number;
  tiempoReposicion: number;
  promedioVentas: number;
  existenciaMinima: number;
  existenciaMaxima: number;
  puntoPedido: number;
  factorProduccion: number;
  peso: number;
  
  // Precios
  precioConImpuesto: number;
  precioSinImpuesto: number;
  
  // Propiedades booleanas
  activo: boolean;
  exento: boolean;
  enVenta: boolean;
  esServicio: boolean;
  ingredienteProduccion: boolean;
  esControlado: boolean;
  noSujeto: boolean;
  productoGenerico: boolean;
  noAplicaDescuento: boolean;
  taller: boolean;
  impuestoSeguridad: boolean;
  propio: boolean;
  vineta: boolean;
  prepago: boolean;
  disponibilidad: boolean;
  noAfecto: boolean;
  sinPropina: boolean;
}

export const createEmptyProducto = (): Producto => ({
  id: `TMP-${Date.now()}`,
  codigo: '',
  nombre: '',
  tipoProducto: '',
  categoria: '',
  marca: '',
  referencia: '',
  referencia1: '',
  referencia2: '',
  descripcion: '',
  ubicacion: '',
  unidadTrabajo: 'UNIDAD',
  consumoMinimo: 0,
  consumoMaximo: 0,
  tiempoReposicion: 0,
  promedioVentas: 0,
  existenciaMinima: 0,
  existenciaMaxima: 0,
  puntoPedido: 0,
  factorProduccion: 1,
  peso: 0,
  precioConImpuesto: 0,
  precioSinImpuesto: 0,
  activo: true,
  exento: false,
  enVenta: true,
  esServicio: false,
  ingredienteProduccion: false,
  esControlado: false,
  noSujeto: false,
  productoGenerico: false,
  noAplicaDescuento: false,
  taller: false,
  impuestoSeguridad: false,
  propio: false,
  vineta: false,
  prepago: false,
  disponibilidad: true,
  noAfecto: false,
  sinPropina: false
});

// Datos de ejemplo
export const MOCK_PRODUCTO_DETAIL: Producto = {
  id: '1',
  codigo: '001-834WBL',
  nombre: 'GUITARRA ELECT. PLAYER II TELECASTER WHITE BLONDE RW FENDER',
  tipoProducto: 'GUITARRA',
  categoria: 'MUSICA',
  marca: 'FENDER',
  referencia: 'PLY-II-TEL-WB',
  referencia1: 'FENDER-001',
  referencia2: 'TEL-WB-RW',
  descripcion: 'Guitarra eléctrica Fender Player II Telecaster con acabado White Blonde y diapasón de rosewood. Incluye pastillas Player II Alnico 5 y puente de 6 cuerdas.',
  ubicacion: 'A1-B2-C3',
  unidadTrabajo: 'UNIDAD',
  consumoMinimo: 0,
  consumoMaximo: 0,
  tiempoReposicion: 0,
  promedioVentas: 0,
  existenciaMinima: 0,
  existenciaMaxima: 0,
  puntoPedido: 0,
  factorProduccion: 1,
  peso: 0,
  precioConImpuesto: 850.00,
  precioSinImpuesto: 742.61,
  activo: true,
  exento: false,
  enVenta: true,
  esServicio: false,
  ingredienteProduccion: false,
  esControlado: false,
  noSujeto: false,
  productoGenerico: false,
  noAplicaDescuento: false,
  taller: false,
  impuestoSeguridad: false,
  propio: false,
  vineta: false,
  prepago: false,
  disponibilidad: true,
  noAfecto: false,
  sinPropina: false
};

// Opciones para los dropdowns
export const TIPOS_PRODUCTO = [
  'GUITARRA',
  'CUERDAS', 
  'CABLE',
  'CLAVIJAS',
  'TAPONES',
  'MP HILO BORDADO',
  'SERVICIO'
];

export const CATEGORIAS_PRODUCTO = [
  'MUSICA',
  'OMEGA',
  'SERVICIOS',
  'ELECTRONICA',
  'ACCESORIOS'
];

export const MARCAS_PRODUCTO = [
  'FENDER',
  'GIBSON',
  'OMEGA',
  'YAMAHA',
  'ROLAND',
  'BOSS',
  'MARSHALL'
];

export const UNIDADES_TRABAJO = [
  'UNIDAD',
  'METRO',
  'KILOGRAMO',
  'LITRO',
  'GRAMO',
  'CAJA',
  'PAQUETE',
  'SET',
  'PAR',
  'DOCENA'
];