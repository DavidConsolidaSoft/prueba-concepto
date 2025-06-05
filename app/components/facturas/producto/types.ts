// Importar el tipo Producto del servicio real para mantener compatibilidad
import { type Producto as ProductoBase } from '@/lib/api/productoService';

// Usar el tipo del servicio como base y extender si es necesario
export interface Producto extends ProductoBase {
  // Propiedades adicionales si las necesitas en el futuro
}

export interface ProductSelectorProps {
  onClose: () => void;
  onProductsAdded: (productos: ProductoConCantidad[]) => void;
  isMobile: boolean;
}

export interface ProductListProps {
  filteredProducts: Producto[];
  selectedProducts: Map<number, { producto: Producto, cantidad: number, descuento: number }>;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleQuantityChange: (productoId: number, newQuantity: number | string) => void;
  handleQuantityBlur: (e: React.ChangeEvent<HTMLInputElement>, productoId: number) => void;
  isMobile: boolean;
  // Props adicionales para scroll infinito
  isLoading?: boolean;
  isLoadingMore?: boolean;
  isSearching?: boolean;
  hasMoreResults?: boolean;
  error?: string | null;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  onClearSearch?: () => void;
}

export interface ProductCartProps {
  selectedProducts: Map<number, { producto: Producto, cantidad: number, descuento: number }>;
  handleRemoveProduct: (productoId: number) => void;
  handleConfirmAdd: () => void;
  calculateTotal: (producto: Producto, cantidad: number, descuento: number) => number;
  isMobile: boolean;
}

export interface ProductQuantityControlProps {
  productoId: number;
  currentQuantity: number;
  existencias: number;
  isSelected: boolean;
  handleQuantityChange: (productoId: number, newQuantity: number | string) => void;
  handleQuantityBlur: (e: React.ChangeEvent<HTMLInputElement>, productoId: number) => void;
  esServicio?: boolean;
}

// Tipo extendido para productos con cantidad y descuento - usa el tipo base
export interface ProductoConCantidad extends Producto {
  cantidad: number;
  descuento: number;
  isUpdate?: boolean; // ← NUEVA PROPIEDAD OPCIONAL
}

// Props actualizadas para ConfirmModal con edición inline
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (updatedProducts?: Map<number, { producto: Producto, cantidad: number, descuento: number }>) => void;
  selectedProducts: Map<number, { producto: Producto, cantidad: number, descuento: number }>;
  calculateTotal: (producto: Producto, cantidad: number, descuento: number) => number;
}

// Función para formatear números a moneda - usar la del ProductoService para consistencia
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Estados de edición para mejor UX
export interface EditingStates {
  isEditing: boolean;
  hasChanges: boolean;
  editingProduct?: number;
}

// Configuración del modal de confirmación
export interface ConfirmModalConfig {
  enableInlineEditing: boolean;
  enableDiscountEditing: boolean;
  enableProductRemoval: boolean;
  showProductImages: boolean;
  maxModalHeight: string;
}