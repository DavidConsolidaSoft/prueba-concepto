'use client';
import { useState, useCallback, ChangeEvent, useEffect, useRef } from 'react';
import { useProductos } from '@/lib/hooks/useProductos';
import ProductoService, { type Producto } from '@/lib/api/productoService';
import { ProductList } from './ProductList'; // ← CORRECCIÓN: Usar ProductList, no ProductosList
import { ProductCart } from './ProductCart';
import { ConfirmModal } from './ConfirmModal';

interface ProductSelectorProps {
  onClose: () => void;
  onProductsAdded: (productos: ProductoConCantidad[]) => void;
  isMobile: boolean;
  cajaId?: number;
  listaPrecioId?: number;
  bodega?: string;
}

interface ProductoConCantidad extends Producto {
  cantidad: number;
  descuento: number;
  isUpdate?: boolean;
}

export default function ProductSelector({ 
  onClose, 
  onProductsAdded, 
  isMobile,
  cajaId = 1,
  listaPrecioId = 1,
  bodega = '%'
}: ProductSelectorProps) {
  
  // Hook personalizado optimizado para gestión de productos
  const {
    productos,
    resultadosBusqueda,
    terminoBusqueda,
    esBuscando,
    esCargando,
    esCargandoMas,
    hayMasResultados,
    error,
    stats,
    buscarProductos,
    limpiarBusqueda,
    cargarMasProductos,
    cargarMasResultadosBusqueda
  } = useProductos({
    cajaId,
    listaPrecioId,
    bodega,
    soloExistencias: false,
    itemsPorPagina: 50,
    debug: false,
    autoLoad: true
  });

  // Estados locales - ESTRUCTURA ACTUALIZADA para compatibilidad
  const [selectedProducts, setSelectedProducts] = useState<Map<number, { producto: Producto, cantidad: number, descuento: number }>>(new Map());
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'stock' | 'sin_stock' | 'servicios' | 'promociones'>('todos');
  
  // Estado para modal de duplicados
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateProductInfo, setDuplicateProductInfo] = useState<{
    producto: Producto;
    cantidadExistente: number;
    cantidadNueva: number;
  } | null>(null);

  // Referencias para scroll infinito
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchScrollContainerRef = useRef<HTMLDivElement>(null);

  // Productos a mostrar según el contexto
  const productosAMostrar = terminoBusqueda.length >= 2 ? resultadosBusqueda : productos;

  // Aplicar filtros adicionales
  const productosFiltrados = productosAMostrar.filter(producto => {
    switch (filtroTipo) {
      case 'stock':
        return producto.existencias > 0 && !producto.esServicio;
      case 'servicios':
        return producto.esServicio;
      case 'promociones':
        return producto.esPromo;
      case 'sin_stock':
        return producto.existencias <= 0 && !producto.esServicio;
      default:
        return true;
    }
  });

  // Eliminar productos duplicados manteniendo el que tenga más stock
  const productosUnicos = productosFiltrados.reduce((acc, producto) => {
    const existing = acc.find(p => p.id === producto.id);
    if (!existing) {
      acc.push(producto);
    } else if (producto.existencias > existing.existencias) {
      const index = acc.findIndex(p => p.id === producto.id);
      acc[index] = producto;
    }
    return acc;
  }, [] as Producto[]);

  // Manejar scroll infinito mejorado
  const handleScroll = useCallback(async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight * 0.85;
    
    if (!isNearBottom || esCargandoMas || esBuscando) return;
    
    if (terminoBusqueda.length >= 2) {
      // Cargar más resultados de búsqueda si están disponibles
      if (hayMasResultados) {
        await cargarMasResultadosBusqueda();
      }
    } else {
      // Cargar más productos generales
      await cargarMasProductos();
    }
  }, [terminoBusqueda.length, esCargandoMas, esBuscando, hayMasResultados, cargarMasResultadosBusqueda, cargarMasProductos]);

  // Manejar cambio en la búsqueda con optimizaciones
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    
    if (valor.length === 0) {
      limpiarBusqueda();
    } else {
      buscarProductos(valor);
    }
  }, [buscarProductos, limpiarBusqueda]);

  // Manejar cambio de cantidad - ESTRUCTURA ACTUALIZADA
  const handleQuantityChange = useCallback((productoId: number, newQuantity: number | string) => {
    const producto = productosUnicos.find(p => p.id === productoId);
    if (!producto) return;

    let numericQuantity: number;

    if (typeof newQuantity === 'string') {
      if (newQuantity === '' || newQuantity === '-') {
        const current = selectedProducts.get(productoId);
        if (current) {
          const newSelected = new Map(selectedProducts);
          newSelected.set(productoId, { ...current, cantidad: 0 });
          setSelectedProducts(newSelected);
        }
        return;
      }
      numericQuantity = parseInt(newQuantity, 10);
      if (isNaN(numericQuantity)) {
        numericQuantity = 0;
      }
    } else {
      numericQuantity = newQuantity;
    }

    // Validar disponibilidad
    const validacion = ProductoService.validarDisponibilidad(producto, numericQuantity);
    const cantidadValida = Math.min(Math.max(0, numericQuantity), validacion.cantidadMaxima);

    const newSelectedProducts = new Map(selectedProducts);

    if (cantidadValida <= 0) {
      newSelectedProducts.delete(productoId);
    } else {
      const current = newSelectedProducts.get(productoId);
      if (current) {
        newSelectedProducts.set(productoId, { 
          ...current, 
          cantidad: cantidadValida 
        });
      } else {
        newSelectedProducts.set(productoId, {
          producto: producto,
          cantidad: cantidadValida,
          descuento: 0
        });
      }
    }

    setSelectedProducts(newSelectedProducts);
  }, [productosUnicos, selectedProducts]);

  // Manejar blur en input de cantidad - ESTRUCTURA ACTUALIZADA
  const handleQuantityBlur = useCallback((event: ChangeEvent<HTMLInputElement>, productoId: number) => {
    const value = event.target.value;
    const producto = productosUnicos.find(p => p.id === productoId);
    if (!producto) return;

    let numericQuantity = parseInt(value, 10);
    if (value === '' || isNaN(numericQuantity) || numericQuantity < 0) {
      numericQuantity = 0;
    }

    const validacion = ProductoService.validarDisponibilidad(producto, numericQuantity);
    const cantidadValida = Math.min(Math.max(0, numericQuantity), validacion.cantidadMaxima);

    const newSelectedProducts = new Map(selectedProducts);

    if (cantidadValida === 0) {
      newSelectedProducts.delete(productoId);
    } else {
      const current = newSelectedProducts.get(productoId);
      if (current) {
        newSelectedProducts.set(productoId, { 
          ...current, 
          cantidad: cantidadValida 
        });
      } else {
        newSelectedProducts.set(productoId, {
          producto: producto,
          cantidad: cantidadValida,
          descuento: 0
        });
      }
    }

    setSelectedProducts(newSelectedProducts);
  }, [productosUnicos, selectedProducts]);

  // Eliminar producto seleccionado
  const handleRemoveProduct = useCallback((productoId: number) => {
    const newSelectedProducts = new Map(selectedProducts);
    newSelectedProducts.delete(productoId);
    setSelectedProducts(newSelectedProducts);
  }, [selectedProducts]);

  // Calcular total de un producto
  const calculateTotal = useCallback((producto: Producto, cantidad: number, descuento: number): number => {
    return ProductoService.calcularPrecioConDescuento(producto.precioNumerico, cantidad, descuento);
  }, []);

  // Confirmar adición de productos
  const handleConfirmAdd = useCallback(() => {
    const hasValidProducts = Array.from(selectedProducts.values()).some(p => p.cantidad > 0);
    if (hasValidProducts) {
      setShowConfirmAlert(true);
    }
  }, [selectedProducts]);

  const checkForDuplicates = useCallback((productosToAdd: ProductoConCantidad[], productosExistentes: ProductoConCantidad[]) => {
  const duplicates = [];
  const nonDuplicates = [];
  
  for (const newProduct of productosToAdd) {
    const existingProduct = productosExistentes.find(existing => existing.id === newProduct.id);
    if (existingProduct) {
      duplicates.push({
        producto: newProduct,
        cantidadExistente: existingProduct.cantidad,
        cantidadNueva: newProduct.cantidad
      });
    } else {
      nonDuplicates.push(newProduct);
    }
  }
  
  return { duplicates, nonDuplicates };
}, []);

  // Agregar productos seleccionados - VERSIÓN SIMPLIFICADA
  const handleAddProducts = useCallback((updatedProducts?: Map<number, { producto: Producto, cantidad: number, descuento: number }>) => {
  const productsToUse = updatedProducts || selectedProducts;
  
  const productosToAdd = Array.from(productsToUse.values())
    .filter(item => item.cantidad > 0)
    .map(item => ({
      ...item.producto,
      cantidad: item.cantidad,
      descuento: item.descuento
    } as ProductoConCantidad));

  if (productosToAdd.length > 0) {
    // Si tenemos una prop que nos diga qué productos ya están en la factura
    if (typeof onProductsAdded === 'function' && onProductsAdded.length > 1) {
      // Asumir que hay una función para obtener productos existentes
      // Esta lógica debe adaptarse según tu implementación específica
      const { duplicates, nonDuplicates } = checkForDuplicates(productosToAdd, []);
      
      if (duplicates.length > 0) {
        // Mostrar modal para el primer duplicado
        setDuplicateProductInfo(duplicates[0]);
        setShowDuplicateModal(true);
        return;
      }
    }
    
    // Si no hay duplicados, proceder normalmente
    onProductsAdded(productosToAdd);
    setSelectedProducts(new Map());
    onClose();
  }
  setShowConfirmAlert(false);
}, [selectedProducts, onProductsAdded, onClose, checkForDuplicates]);

  

  // Limpiar filtros al cambiar búsqueda
  useEffect(() => {
    if (terminoBusqueda) {
      setFiltroTipo('todos');
    }
  }, [terminoBusqueda]);

  // Modal de duplicados (agregar al JSX del ProductSelector)
const DuplicateModal = () => {
  if (!duplicateProductInfo) return null;

  const handleSumQuantity = () => {
  if (!duplicateProductInfo) return;
  
  const totalQuantity = duplicateProductInfo.cantidadExistente + duplicateProductInfo.cantidadNueva;
  
  // Crear objeto con todas las propiedades requeridas
    const updateData: ProductoConCantidad = {
      ...duplicateProductInfo.producto,
      cantidad: totalQuantity,
      descuento: 0, // ← PROPIEDAD FALTANTE AGREGADA
      isUpdate: true // ← FLAG PARA INDICAR ACTUALIZACIÓN
    };
    
    if (onProductsAdded) {
      onProductsAdded([updateData]);
    }
    
    setShowDuplicateModal(false);
    setDuplicateProductInfo(null);
    setSelectedProducts(new Map());
    onClose();
  };

  const handleCancel = () => {
    setShowDuplicateModal(false);
    setDuplicateProductInfo(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary border border-primary rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.198 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary">Producto Duplicado</h3>
            <p className="text-sm text-secondary">Este producto ya está en la factura</p>
          </div>
        </div>

        <div className="bg-[#333333] p-4 rounded-lg mb-6">
          <div className="flex items-center mb-3">
            <img
              src={duplicateProductInfo.producto.imagen}
              alt={duplicateProductInfo.producto.nombre}
              className="w-12 h-12 object-contain mr-3"
            />
            <div>
              <h4 className="font-medium text-primary">{duplicateProductInfo.producto.nombre}</h4>
              <p className="text-sm text-secondary">{duplicateProductInfo.producto.codigo}</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary">Cantidad actual en factura:</span>
              <span className="text-primary font-medium">{duplicateProductInfo.cantidadExistente}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Cantidad que deseas agregar:</span>
              <span className="text-primary font-medium">{duplicateProductInfo.cantidadNueva}</span>
            </div>
            <hr className="border-[#555555]" />
            <div className="flex justify-between">
              <span className="text-primary font-medium">Total resultante:</span>
              <span className="text-green-400 font-bold">
                {duplicateProductInfo.cantidadExistente + duplicateProductInfo.cantidadNueva}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            className="flex-1 bg-primary text-primary px-4 py-2 rounded-md hover:bg-tertiary transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSumQuantity}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Sumar Cantidad
          </button>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="flex flex-col h-full bg-primary text-primary">
      {/* Encabezado con estadísticas */}
      <div className="flex items-center justify-between p-3 border-b border-[#555555]">
        <div>
          <h2 className="text-xl font-medium">Agregar productos a la factura</h2>
        </div>
        <button
          onClick={onClose}
          className="text-secondary hover:text-primary transition-colors duration-200"
          aria-label="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden p-2">
        
        {/* COMPONENTE CORRECTO: ProductList (no ProductosList) */}
        <ProductList
          filteredProducts={productosUnicos}
          selectedProducts={selectedProducts}
          searchTerm={terminoBusqueda}
          onSearchChange={handleSearchChange}
          handleQuantityChange={handleQuantityChange}
          handleQuantityBlur={handleQuantityBlur}
          isMobile={isMobile}
          // Props adicionales para scroll infinito
          isLoading={esCargando}
          isLoadingMore={esCargandoMas}
          isSearching={esBuscando}
          hasMoreResults={hayMasResultados}
          error={error}
          onScroll={handleScroll}
          scrollContainerRef={terminoBusqueda ? searchScrollContainerRef : scrollContainerRef}
          onClearSearch={limpiarBusqueda}
        />

        {/* COMPONENTE REFACTORIZADO: ProductCart */}
        <ProductCart
          selectedProducts={selectedProducts}
          handleRemoveProduct={handleRemoveProduct}
          handleConfirmAdd={handleConfirmAdd}
          calculateTotal={calculateTotal}
          isMobile={isMobile}
        />
      </div>

      {/* COMPONENTE REFACTORIZADO: ConfirmModal */}
      <ConfirmModal
        isOpen={showConfirmAlert}
        onClose={() => setShowConfirmAlert(false)}
        onConfirm={handleAddProducts}
        selectedProducts={selectedProducts}
        calculateTotal={calculateTotal}
      />

      {showDuplicateModal && <DuplicateModal />}
    </div>
  );
}