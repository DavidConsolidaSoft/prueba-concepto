import React, { useState } from 'react';
import Image from 'next/image';
import { Producto } from './facturaTypes';
import { AlertModal } from '../../ui/AlertModal';

interface ProductosListProps {
  productos: Producto[];
  isEditable: boolean;
  isCreatingInternal: boolean;
  isMobile: boolean;
  onAddProducto: () => void;
  onRemoveProducto: (id: number) => void;
  onUpdateProducto?: (id: number, updates: { cantidad?: number; descuento?: string }) => void;
}

export const ProductosList: React.FC<ProductosListProps> = ({
  productos,
  isEditable,
  isCreatingInternal,
  isMobile,
  onAddProducto,
  onRemoveProducto,
  onUpdateProducto
}) => {
  const [showEliminarProductoAlert, setShowEliminarProductoAlert] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<number | null>(null);
  
  // Estados para edición inline
  const [editingQuantity, setEditingQuantity] = useState<number | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<number | null>(null);
  const [tempQuantity, setTempQuantity] = useState<string>('');
  const [tempDiscount, setTempDiscount] = useState<string>('');

  const handleDeleteClick = (id: number) => {
    setProductoAEliminar(id);
    setShowEliminarProductoAlert(true);
  };

  const confirmDelete = () => {
    if (productoAEliminar !== null) {
      onRemoveProducto(productoAEliminar);
      setProductoAEliminar(null);
    }
  };

  // Helper para parsear precios
  const parsePrice = (priceString: string): number => {
    const cleanPrice = priceString.replace(/[$,\s]/g, '');
    const numericPrice = parseFloat(cleanPrice);
    return isNaN(numericPrice) ? 0 : numericPrice;
  };

  // Calcular subtotal y totales
  const calcularResumen = () => {
    const subtotal = productos.reduce((sum, producto) => {
      return sum + parsePrice(producto.total);
    }, 0);

    const cantidadTotal = productos.reduce((sum, producto) => {
      return sum + producto.cantidad;
    }, 0);

    const productosConDescuento = productos.filter(producto => 
      parseFloat(producto.descuento.replace('%', '')) > 0
    );

    return {
      subtotal,
      cantidadTotal,
      productosConDescuento: productosConDescuento.length
    };
  };

  const resumen = calcularResumen();

  // FUNCIONES PARA EDICIÓN INLINE

  // Manejar cambio de cantidad
  const handleQuantityChange = (productoId: number, newQuantity: number) => {
    if (onUpdateProducto && newQuantity >= 1) {
      onUpdateProducto(productoId, { cantidad: newQuantity });
    }
  };

  // Iniciar edición de cantidad
  const startQuantityEdit = (productoId: number, currentQuantity: number) => {
    setEditingQuantity(productoId);
    setTempQuantity(currentQuantity.toString());
  };

  // Confirmar edición de cantidad
  const confirmQuantityEdit = (productoId: number) => {
    const newQuantity = parseInt(tempQuantity);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      handleQuantityChange(productoId, newQuantity);
    }
    setEditingQuantity(null);
    setTempQuantity('');
  };

  // Cancelar edición de cantidad
  const cancelQuantityEdit = () => {
    setEditingQuantity(null);
    setTempQuantity('');
  };

  // Manejar cambio de descuento
  const handleDiscountChange = (productoId: number, newDiscount: string) => {
    if (onUpdateProducto) {
      const discountValue = parseFloat(newDiscount.replace('%', ''));
      if (!isNaN(discountValue) && discountValue >= 0 && discountValue <= 100) {
        onUpdateProducto(productoId, { descuento: `${discountValue}%` });
      }
    }
  };

  // Iniciar edición de descuento
  const startDiscountEdit = (productoId: number, currentDiscount: string) => {
    setEditingDiscount(productoId);
    setTempDiscount(currentDiscount.replace('%', ''));
  };

  // Confirmar edición de descuento
  const confirmDiscountEdit = (productoId: number) => {
    const discountValue = parseFloat(tempDiscount);
    if (!isNaN(discountValue) && discountValue >= 0 && discountValue <= 100) {
      handleDiscountChange(productoId, `${discountValue}%`);
    }
    setEditingDiscount(null);
    setTempDiscount('');
  };

  // Cancelar edición de descuento
  const cancelDiscountEdit = () => {
    setEditingDiscount(null);
    setTempDiscount('');
  };

  // Componente para controles de cantidad COMPACTOS
  const QuantityControls = ({ producto }: { producto: Producto }) => {
    if (!isEditable) {
      return <span className="text-sm text-secondary">Cantidad: {producto.cantidad}</span>;
    }

    if (editingQuantity === producto.id) {
      return (
        <div className="flex items-center space-x-1">
          <span className="text-xs text-secondary">Cant:</span>
          <input
            type="number"
            value={tempQuantity}
            onChange={(e) => setTempQuantity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmQuantityEdit(producto.id);
              if (e.key === 'Escape') cancelQuantityEdit();
            }}
            className="w-12 px-1 py-0.5 text-xs bg-tertiary text-primary rounded border focus:outline-none focus:ring-1 focus:ring-blue-500"
            min="1"
            autoFocus
          />
          <button
            onClick={() => confirmQuantityEdit(producto.id)}
            className="text-green-400 hover:text-green-300"
            title="Confirmar"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={cancelQuantityEdit}
            className="text-red-400 hover:text-red-300"
            title="Cancelar"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      );
    }

    // DISEÑO COMPACTO como en la imagen de referencia
    return (
      <div className="flex items-center bg-[#2a3441] rounded-lg overflow-hidden">
        {/* Botón menos */}
        <button
          onClick={() => handleQuantityChange(producto.id, producto.cantidad - 1)}
          disabled={producto.cantidad <= 1}
          className="w-10 h-8 flex items-center justify-center text-primary hover:bg-[#374151] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-r border-[#374151]"
          title="Disminuir cantidad"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        
        {/* Cantidad central clickeable */}
        <button
          onClick={() => startQuantityEdit(producto.id, producto.cantidad)}
          className="px-4 py-2 text-sm font-medium text-primary hover:bg-[#374151] transition-colors min-w-[3rem] text-center"
          title="Editar cantidad"
        >
          {producto.cantidad}
        </button>
        
        {/* Botón más */}
        <button
          onClick={() => handleQuantityChange(producto.id, producto.cantidad + 1)}
          className="w-10 h-8 flex items-center justify-center text-primary hover:bg-[#374151] transition-colors border-l border-[#374151]"
          title="Aumentar cantidad"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  };

  // Componente para controles de descuento COMPACTOS
  const DiscountControls = ({ producto }: { producto: Producto }) => {
    const tieneDescuento = parseFloat(producto.descuento.replace('%', '')) > 0;

    if (!isEditable) {
      return tieneDescuento ? (
        <span className="text-xs bg-orange-600 text-white px-1 rounded">
          -{producto.descuento}
        </span>
      ) : null;
    }

    if (editingDiscount === producto.id) {
      return (
        <div className="flex items-center space-x-1">
          <input
            type="number"
            value={tempDiscount}
            onChange={(e) => setTempDiscount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmDiscountEdit(producto.id);
              if (e.key === 'Escape') cancelDiscountEdit();
            }}
            className="w-14 px-2 py-1 text-xs bg-tertiary text-primary rounded border focus:outline-none focus:ring-1 focus:ring-blue-500"
            min="0"
            max="100"
            step="0.1"
            placeholder="0"
            autoFocus
          />
          <span className="text-xs text-secondary">%</span>
          <button
            onClick={() => confirmDiscountEdit(producto.id)}
            className="text-green-400 hover:text-green-300"
            title="Confirmar"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={cancelDiscountEdit}
            className="text-red-400 hover:text-red-300"
            title="Cancelar"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      );
    }

    // DISEÑO COMPACTO para descuento
    return (
      <button
        onClick={() => startDiscountEdit(producto.id, producto.descuento)}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          tieneDescuento
            ? 'bg-orange-600 text-white hover:bg-orange-700'
            : 'bg-[#2a3441] text-gray-300 hover:bg-[#374151]'
        }`}
        title="Editar descuento"
      >
        {tieneDescuento ? `-${producto.descuento}` : 'Sin desc.'}
      </button>
    );
  };

  return (
    <>
      <div className="bg-secondary p-0 rounded-md flex-1 flex flex-col">
        <div className="flex justify-between items-center px-2 py-1 border-b border-secondary">
          <div>
            <h3 className="text-lg font-semibold">Productos en Factura</h3>
            {productos.length > 0 && (
              <div className="text-xs text-gray-400 mt-1">
                {productos.length} productos • {resumen.cantidadTotal} unidades
                {resumen.productosConDescuento > 0 && (
                  <span className="text-orange-400 ml-2">
                    • {resumen.productosConDescuento} con descuento
                  </span>
                )}
              </div>
            )}
          </div>
          {isEditable && (
            <button 
              onClick={onAddProducto}
              className="bg-blue-600 hover:bg-blue-700 text-primary px-3 py-1 rounded-md flex items-center text-sm"
              title="Agregar más productos">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar
            </button>
          )}
        </div>
        
        <div className="max-h-[370px] overflow-y-auto">
          {productos.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-tertiary">
              {isCreatingInternal ? 'Agregue productos a la factura' : 'No hay productos en esta factura'}
            </div>
          ) : (
            <>
              {productos.map((producto, index) => {
                const tieneDescuento = parseFloat(producto.descuento.replace('%', '')) > 0;
                const precioUnitario = parsePrice(producto.total) / producto.cantidad;
                
                return (
                  <div key={`producto-${producto.id}-${index}`}>
                    {isMobile ? (
                      /* Versión móvil con controles compactos */
                      <div className="flex items-start p-2">
                        {/* Imagen del producto */}
                        <div className="w-16 h-16 mr-3 flex-shrink-0 flex items-center justify-center">
                          <Image
                            src={producto.imagen}
                            alt={producto.nombre}
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                        </div>
                        
                        {/* Información central */}
                        <div className="flex-1 flex flex-col space-y-1">
                          <h4 className="font-medium text-primary">{producto.nombre}</h4>
                          <p className="text-sm text-secondary">{producto.codigo}</p>
                          
                          {/* Controles inline móvil COMPACTOS */}
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-secondary">Cantidad:</span>
                              <QuantityControls producto={producto} />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-secondary">Descuento:</span>
                              <DiscountControls producto={producto} />
                            </div>
                            <p className="text-xs text-secondary">
                              Precio unit.: ${precioUnitario.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Precio y botón eliminar */}
                        <div className="flex flex-col items-center justify-between h-full ml-2">
                          <div className="text-center">
                            <p className="text-primary text-sm">Total</p>
                            <p className="font-bold text-primary">{producto.total}</p>
                            {tieneDescuento && (
                              <p className="text-xs text-orange-400">Con descuento</p>
                            )}
                          </div>
                          {isEditable && (
                            <button 
                              className="text-red-400 hover:text-red-300 mt-2"
                              onClick={() => handleDeleteClick(producto.id)}
                              title="Eliminar producto"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Versión escritorio con controles compactos */
                      <div className={tieneDescuento ? 'bg-orange-900/10' : ''}>
                        <div className="grid grid-cols-[80px_1fr_auto] gap-4 items-center py-3 px-4">
                          <div className="w-20 h-20 flex items-center justify-center">
                            <Image
                              src={producto.imagen || "/taladro.png"}
                              alt={producto.nombre}
                              width={80}
                              height={80}
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-primary flex items-center gap-2 mb-2">
                              {producto.nombre}
                              {tieneDescuento && (
                                <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full">
                                  Descuento: {producto.descuento}
                                </span>
                              )}
                            </h4>
                            <p className="text-secondary mb-2">Código: {producto.codigo}</p>
                            
                            {/* Controles inline escritorio COMPACTOS */}
                            <div className="flex items-center gap-6 mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-secondary">Cantidad:</span>
                                <QuantityControls producto={producto} />
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-secondary">Descuento:</span>
                                <DiscountControls producto={producto} />
                              </div>
                            </div>
                            
                            <p className="text-secondary text-sm">
                              Precio unitario: ${precioUnitario.toFixed(2)}
                            </p>
                            
                            {tieneDescuento && (
                              <div className="mt-1">
                                <p className="text-orange-400 text-sm">
                                  ⚡ Descuento individual aplicado: {producto.descuento}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="text-center flex flex-col items-center">
                            <p className="font-bold text-primary">Total</p>
                            <p className="font-bold text-primary text-lg">{producto.total}</p>
                            {tieneDescuento && (
                              <p className="text-xs text-orange-400 mt-1">Con descuento</p>
                            )}
                            {isEditable && (
                              <button 
                                className="text-red-400 hover:text-red-300 mt-2"
                                onClick={() => handleDeleteClick(producto.id)}
                                title="Eliminar producto"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {(index < productos.length - 1) && (
                      <hr className="border-t border-secondary my-1" />
                    )}
                  </div>
                );
              })}
              
              {/* Resumen al final de la lista */}
              {productos.length > 0 && (
                <div className="bg-[#333333] p-3 border-t border-secondary">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-300">
                        Subtotal productos ({productos.length} items, {resumen.cantidadTotal} unidades)
                      </p>
                      {resumen.productosConDescuento > 0 && (
                        <p className="text-xs text-orange-400 mt-1">
                          ⚡ {resumen.productosConDescuento} productos con descuentos individuales
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">
                        ${resumen.subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      </p>
                      <p className="text-xs text-gray-400">
                        (antes de descuento general)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Alert Modal para confirmar eliminación */}
      <AlertModal
        isOpen={showEliminarProductoAlert}
        onClose={() => setShowEliminarProductoAlert(false)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminación"
        message="¿Está seguro de que desea eliminar este producto de la factura?"
      />
    </>
  );
};