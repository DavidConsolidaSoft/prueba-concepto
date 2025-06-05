'use client';
import { useState, useCallback, ChangeEvent, useEffect, useRef } from 'react';
import { useProductos } from '@/lib/hooks/useProductos';
import ProductoService, { type Producto } from '@/lib/api/productoService';
import { MobileProductListProps, MobileProductCartProps } from './types';
import { MobileConfirmModal } from './MobileConfirmModal';
import Image from 'next/image';

interface MobileProductSelectorProps {
  onBackToFactura: () => void;
  onProductsAdded: (productos: ProductoConCantidad[]) => void;
  facturaId: string;
  cajaId?: number;
  listaPrecioId?: number;
  bodega?: string;
}

interface ProductoConCantidad extends Producto {
  cantidad: number;
  descuento: number;
}

// Componente de control de cantidad optimizado para móvil
const MobileProductQuantityControl = ({ 
  productoId, 
  currentQuantity, 
  existencias, 
  isSelected, 
  handleQuantityChange, 
  handleQuantityBlur 
}: {
  productoId: number;
  currentQuantity: number;
  existencias: number;
  isSelected: boolean;
  handleQuantityChange: (productoId: number, newQuantity: number | string) => void;
  handleQuantityBlur: (e: ChangeEvent<HTMLInputElement>, productoId: number) => void;
}) => {
  return (
    <div className="flex items-center mt-1 bg-primary rounded-md overflow-hidden">
      <button
        onClick={() => handleQuantityChange(productoId, currentQuantity - 1)}
        className={`text-primary w-7 h-7 flex items-center justify-center transition-colors duration-150 ${
          currentQuantity > 0 ? 'hover:bg-secondary' : 'text-gray-500 cursor-not-allowed'
        }`}
        disabled={currentQuantity <= 0}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <input
        type="number"
        value={currentQuantity === 0 && !isSelected ? '' : currentQuantity}
        onChange={(e) => handleQuantityChange(productoId, e.target.value)}
        onBlur={(e) => handleQuantityBlur(e, productoId)}
        min="0"
        max={existencias}
        placeholder="0"
        className="mx-1 w-10 h-7 text-center bg-tertiary text-primary text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        onClick={() => handleQuantityChange(productoId, currentQuantity + 1)}
        className={`text-primary w-7 h-7 flex items-center justify-center transition-colors duration-150 ${
          currentQuantity < existencias ? 'hover:bg-secondary' : 'text-gray-500 cursor-not-allowed'
        }`}
        disabled={currentQuantity >= existencias}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

// Componente de lista de productos móvil integrado
const MobileProductList = ({
  productos,
  selectedProducts,
  terminoBusqueda,
  onSearchChange,
  handleQuantityChange,
  handleQuantityBlur,
  esCargando,
  esBuscando,
  error,
  onScroll
}: {
  productos: Producto[];
  selectedProducts: Map<number, ProductoConCantidad>;
  terminoBusqueda: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleQuantityChange: (productoId: number, newQuantity: number | string) => void;
  handleQuantityBlur: (e: ChangeEvent<HTMLInputElement>, productoId: number) => void;
  esCargando: boolean;
  esBuscando: boolean;
  error: string | null;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}) => {
  return (
    <>
      {/* Campo de búsqueda */}
      <div className="relative mb-3">
        <input
          type="text"
          value={terminoBusqueda}
          onChange={onSearchChange}
          placeholder="Buscar productos por nombre o código..."
          className="w-full p-2 pl-10 pr-10 bg-tertiary rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 absolute left-3 top-2.5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {esBuscando && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Lista de productos */}
      <div className="mb-1">
        {/* <h4 className="font-semibold mb-1">
          {terminoBusqueda.length >= 2 ? 'Resultados de búsqueda' : 'Productos disponibles'}
        </h4> */}
        <div className="bg-secondary rounded-md overflow-hidden">
          <div 
            className="overflow-y-auto" 
            style={{ height: '36vh' }}
            onScroll={onScroll}
          >
            {esCargando && productos.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-300">Cargando productos...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-red-400 p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-center">{error}</p>
              </div>
            ) : productos.length > 0 ? (
              <>
                <div className="divide-y divide-[#888888]">
                  {productos.map(producto => {
                    const currentSelected = selectedProducts.get(producto.id);
                    const currentQuantity = currentSelected?.cantidad ?? 0;
                    const isSelected = selectedProducts.has(producto.id);

                    return (
                      <div
                        key={`${producto.id}-${producto.kardexId}`}
                        className="transition-colors duration-200 hover:bg-[#666666]"
                      >
                        <div className="flex items-center p-2">
                          {/* Imagen del producto */}
                          <div className="flex-shrink-0 mr-3">
                            <div className="w-10 h-10 rounded-md overflow-hidden flex items-center justify-center bg-gray-200">
                              <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                className="w-full h-full object-contain"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/producto-default.png';
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Información del producto */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">
                              {producto.nombre}
                              {producto.esPromo && (
                                <span className="ml-1 text-xs bg-red-500 text-white px-1 rounded">PROMO</span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-100">{producto.codigo}</p>
                            <p className={`text-sm ${
                              producto.existencias > 0 ? 'text-green-400' : 
                              producto.esServicio ? 'text-blue-400' : 'text-red-400'
                            }`}>
                              {producto.esServicio ? 'Servicio' : `Stock: ${producto.existencias}`}
                            </p>
                          </div>

                          {/* Precio y controles */}
                          <div className="text-end">
                            <p className="text-sm font-bold text-primary whitespace-nowrap">
                              {producto.precio}
                            </p>
                            <MobileProductQuantityControl
                              productoId={producto.id}
                              currentQuantity={currentQuantity}
                              existencias={producto.existencias}
                              isSelected={isSelected}
                              handleQuantityChange={handleQuantityChange}
                              handleQuantityBlur={handleQuantityBlur}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Indicador de carga para scroll infinito */}
                {(esBuscando) && (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-gray-300">
                      {terminoBusqueda ? 'Buscando más resultados...' : 'Cargando más productos...'}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-center">
                  {terminoBusqueda.length >= 2 ? 
                    `No se encontraron productos para "${terminoBusqueda}"` :
                    'No hay productos disponibles.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Componente de carrito móvil integrado
const MobileProductCart = ({
  selectedProducts,
  handleRemoveProduct,
  handleConfirmAdd,
  calculateTotal
}: {
  selectedProducts: Map<number, ProductoConCantidad>;
  handleRemoveProduct: (productoId: number) => void;
  handleConfirmAdd: () => void;
  calculateTotal: (producto: Producto, cantidad: number, descuento: number) => number;
}) => {
  const hasValidProducts = Array.from(selectedProducts.values()).some(p => p.cantidad > 0);
  
  return (
    <div>
      {/* Encabezado con botón de agregar */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">
          Productos a Facturar
          {Array.from(selectedProducts.values()).filter(p => p.cantidad > 0).length > 0 && (
            <span className="ml-2 text-sm bg-blue-600 text-white px-2 py-1 rounded-full">
              {Array.from(selectedProducts.values()).filter(p => p.cantidad > 0).length}
            </span>
          )}
        </h3>
        <button
          className={`flex items-center justify-center py-1 px-3 rounded-md transition-colors duration-200 ${
            hasValidProducts
              ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer text-white'
              : 'bg-gray-500 cursor-not-allowed text-gray-300'
          }`}
          onClick={handleConfirmAdd}
          disabled={!hasValidProducts}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar
        </button>
      </div>

      {/* Lista de productos seleccionados */}
      <div className="bg-secondary rounded-md overflow-hidden">
        <div className="overflow-y-auto" style={{ height: '31vh' }}>
          {Array.from(selectedProducts.values()).filter(item => item.cantidad > 0).length > 0 ? (
            <>
              <div className="divide-y divide-[#888888]">
                {Array.from(selectedProducts.values())
                  .filter(item => item.cantidad > 0)
                  .map((producto) => (
                  <div
                    key={`selected-${producto.id}`}
                    className="p-3 hover:bg-[#666666] transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="w-10 h-10 mr-3 flex-shrink-0 rounded-md overflow-hidden">
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{producto.nombre}</h4>
                          <p className="text-sm text-gray-100">{producto.codigo}</p>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-gray-100">
                              Cantidad: <span className="font-medium">{producto.cantidad}</span>
                            </p>
                            <p className="text-sm text-gray-100">
                              Precio unit.: <span className="font-medium">{producto.precio}</span>
                            </p>
                            {producto.descuento > 0 && (
                              <p className="text-sm text-orange-400">
                                Descuento: {producto.descuento}%
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="text-center mr-2 mb-2">
                          <p className="text-xs text-gray-100">Total</p>
                          <p className="text-sm font-bold text-green-400">
                            {ProductoService.formatCurrency(calculateTotal(producto, producto.cantidad, producto.descuento))}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(producto.id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200 p-1"
                          aria-label={`Eliminar ${producto.nombre}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Resumen total */}
              <div className="p-3 bg-[#444444] border-t border-[#666666]">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total General:</span>
                  <span className="text-lg font-bold text-green-400">
                    {ProductoService.formatCurrency(
                      Array.from(selectedProducts.values())
                        .filter(item => item.cantidad > 0)
                        .reduce((sum, producto) => sum + calculateTotal(producto, producto.cantidad, producto.descuento), 0)
                    )}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-100 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-center">No has seleccionado ningún producto aún.</p>
              <p className="text-center text-sm text-gray-400 mt-1">
                Usa los controles + y - junto a cada producto para agregarlo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MobileProductSelector({ 
  onBackToFactura, 
  onProductsAdded, 
  facturaId,
  cajaId = 1,
  listaPrecioId = 1,
  bodega = '%'
}: MobileProductSelectorProps) {
  
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

  // Estados locales
  const [selectedProducts, setSelectedProducts] = useState<Map<number, ProductoConCantidad>>(new Map());
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  
  // Referencias para scroll infinito
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Productos a mostrar según el contexto
  const productosAMostrar = terminoBusqueda.length >= 2 ? resultadosBusqueda : productos;

  // Manejar scroll infinito
  const handleScroll = useCallback(async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight * 0.85;
    
    if (!isNearBottom || esCargandoMas || esBuscando) return;
    
    if (terminoBusqueda.length >= 2) {
      if (hayMasResultados) {
        await cargarMasResultadosBusqueda();
      }
    } else {
      await cargarMasProductos();
    }
  }, [terminoBusqueda.length, esCargandoMas, esBuscando, hayMasResultados, cargarMasResultadosBusqueda, cargarMasProductos]);

  // Manejar cambio en la búsqueda
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    
    if (valor.length === 0) {
      limpiarBusqueda();
    } else {
      buscarProductos(valor);
    }
  }, [buscarProductos, limpiarBusqueda]);

  // Manejar cambio de cantidad
  const handleQuantityChange = useCallback((productoId: number, newQuantity: number | string) => {
    const producto = productosAMostrar.find(p => p.id === productoId);
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

    const validacion = ProductoService.validarDisponibilidad(producto, numericQuantity);
    const cantidadValida = Math.min(Math.max(0, numericQuantity), validacion.cantidadMaxima);

    const newSelectedProducts = new Map(selectedProducts);

    if (cantidadValida <= 0) {
      newSelectedProducts.delete(productoId);
    } else {
      const current = newSelectedProducts.get(productoId);
      if (current) {
        newSelectedProducts.set(productoId, { ...current, cantidad: cantidadValida });
      } else {
        newSelectedProducts.set(productoId, {
          ...producto,
          cantidad: cantidadValida,
          descuento: 0
        });
      }
    }

    setSelectedProducts(newSelectedProducts);
  }, [productosAMostrar, selectedProducts]);

  // Manejar blur en input de cantidad
  const handleQuantityBlur = useCallback((event: ChangeEvent<HTMLInputElement>, productoId: number) => {
    const value = event.target.value;
    const producto = productosAMostrar.find(p => p.id === productoId);
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
        newSelectedProducts.set(productoId, { ...current, cantidad: cantidadValida });
      } else {
        newSelectedProducts.set(productoId, {
          ...producto,
          cantidad: cantidadValida,
          descuento: 0
        });
      }
    }

    setSelectedProducts(newSelectedProducts);
  }, [productosAMostrar, selectedProducts]);

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

  // Agregar productos seleccionados
  const handleAddProducts = useCallback(() => {
    const productosToAdd = Array.from(selectedProducts.values())
      .filter(item => item.cantidad > 0);

    if (productosToAdd.length > 0) {
      onProductsAdded(productosToAdd);
      setSelectedProducts(new Map());
      onBackToFactura();
    }
    setShowConfirmAlert(false);
  }, [selectedProducts, onProductsAdded, onBackToFactura]);

  return (
    <div className="flex flex-col h-full bg-primary text-primary">
      {/* Encabezado con botón de volver */}
      <div className="flex items-center p-2 border-b border-[#555555]">
        <button
          onClick={onBackToFactura}
          className="text-gray-100 hover:text-primary mr-3"
          aria-label="Volver"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h5 className="font-medium">Agregar productos a Factura: {facturaId}</h5>
          {/* <div className="text-xs text-gray-300">
            {terminoBusqueda ? (
              `${stats.totalProductosUnicos} resultado(s) para "${terminoBusqueda}"`
            ) : (
              `${stats.totalProductosUnicos} productos disponibles`
            )}
          </div> */}
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="flex flex-col flex-1 overflow-hidden p-2">
        {/* Lista de productos disponibles */}
        <MobileProductList 
          productos={productosAMostrar}
          selectedProducts={selectedProducts}
          terminoBusqueda={terminoBusqueda}
          onSearchChange={handleSearchChange}
          handleQuantityChange={handleQuantityChange}
          handleQuantityBlur={handleQuantityBlur}
          esCargando={esCargando}
          esBuscando={esBuscando}
          error={error}
          onScroll={handleScroll}
        />

        {/* Lista de productos seleccionados */}
        <MobileProductCart
          selectedProducts={selectedProducts}
          handleRemoveProduct={handleRemoveProduct}
          handleConfirmAdd={handleConfirmAdd}
          calculateTotal={calculateTotal}
        />
      </div>

      {/* Modal de confirmación */}
      <MobileConfirmModal
        isOpen={showConfirmAlert}
        onClose={() => setShowConfirmAlert(false)}
        onConfirm={handleAddProducts}
        selectedProducts={selectedProducts}
        calculateTotal={calculateTotal}
      />
    </div>
  );
}