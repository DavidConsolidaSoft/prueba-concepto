// Importar el tipo Producto del servicio real
import { type Producto as ProductoBase } from '@/lib/api/productoService';

// Extender el tipo base con propiedades opcionales para la UI
export interface Producto extends ProductoBase {
  cantidad?: number;
  descuento?: number;
}

export interface MobileProductSelectorProps {
  onBackToFactura: () => void;
  onProductsAdded: (productos: ProductoConCantidad[]) => void;
  facturaId: string;
  cajaId?: number;
  listaPrecioId?: number;
  bodega?: string;
}

export interface ProductoConCantidad extends Producto {
  cantidad: number;
  descuento: number;
}

export interface MobileProductListProps {
  productos: Producto[];
  selectedProducts: Map<number, ProductoConCantidad>;
  terminoBusqueda: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleQuantityChange: (productoId: number, newQuantity: number | string) => void;
  handleQuantityBlur: (e: React.ChangeEvent<HTMLInputElement>, productoId: number) => void;
  esCargando: boolean;
  esBuscando: boolean;
  error: string | null;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export interface MobileProductCartProps {
  selectedProducts: Map<number, ProductoConCantidad>;
  handleRemoveProduct: (productoId: number) => void;
  handleConfirmAdd: () => void;
  calculateTotal: (producto: Producto, cantidad: number, descuento: number) => number;
}

export interface MobileProductQuantityControlProps {
  productoId: number;
  currentQuantity: number;
  existencias: number;
  isSelected: boolean;
  handleQuantityChange: (productoId: number, newQuantity: number | string) => void;
  handleQuantityBlur: (e: React.ChangeEvent<HTMLInputElement>, productoId: number) => void;
  esServicio?: boolean;
}

export interface MobileConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (updatedProducts?: Map<number, ProductoConCantidad>) => void;
  selectedProducts: Map<number, ProductoConCantidad>;
  calculateTotal: (producto: Producto, cantidad: number, descuento: number) => number;
}

// Función para formatear números a moneda (mantenida por compatibilidad, pero usa ProductoService.formatCurrency)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Estados de carga para mejor UX
export interface LoadingStates {
  isLoading: boolean;
  isSearching: boolean;
  isLoadingMore: boolean;
  hasError: boolean;
  errorMessage?: string;
}

// Filtros disponibles para productos
export type ProductFilter = 'todos' | 'stock' | 'sin_stock' | 'servicios' | 'promociones';

export interface FilterOption {
  key: ProductFilter;
  label: string;
  count: number;
}

// Estadísticas de productos para la UI
export interface ProductStats {
  totalProductosUnicos: number;
  productosConStock: number;
  servicios: number;
  promoActivas: number;
}

// Configuración del selector de productos móvil
export interface MobileProductSelectorConfig {
  enableInfiniteScroll: boolean;
  enableSearch: boolean;
  enableFilters: boolean;
  itemsPerPage: number;
  searchDebounceMs: number;
  cacheEnabled: boolean;
}