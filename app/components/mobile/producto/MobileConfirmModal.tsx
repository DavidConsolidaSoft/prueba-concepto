import React, { useState, useEffect } from 'react';
import { MobileConfirmModalProps, ProductoConCantidad } from './types';
import ProductoService from '@/lib/api/productoService';

export const MobileConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedProducts,
  calculateTotal
}: MobileConfirmModalProps) => {
  // Estado local para los productos editables
  const [editableProducts, setEditableProducts] = useState<Map<number, ProductoConCantidad>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);

  // Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setEditableProducts(new Map(selectedProducts));
      setHasChanges(false);
    }
  }, [isOpen, selectedProducts]);

  // Early return si el modal no está abierto
  if (!isOpen) return null;

  // Filtrar productos con cantidad > 0
  const validProducts = Array.from(editableProducts.values()).filter(item => item.cantidad > 0);
  const totalGeneral = validProducts.reduce((sum, producto) =>
    sum + calculateTotal(producto, producto.cantidad, producto.descuento), 0);

  // Manejar cambio de cantidad en el modal
  const handleQuantityChange = (productoId: number, newQuantity: number) => {
    setEditableProducts(currentProducts => {
      const producto = currentProducts.get(productoId);
      if (!producto) return currentProducts;

      // Validar disponibilidad
      const validacion = ProductoService.validarDisponibilidad(producto, newQuantity);
      const cantidadValida = Math.min(Math.max(0, newQuantity), validacion.cantidadMaxima);

      const newEditableProducts = new Map(currentProducts);
      
      if (cantidadValida <= 0) {
        newEditableProducts.delete(productoId);
      } else {
        newEditableProducts.set(productoId, {
          ...producto,
          cantidad: cantidadValida
        });
      }

      return newEditableProducts;
    });
    setHasChanges(true);
  };

  // Manejar cambio de descuento
  const handleDiscountChange = (productoId: number, newDiscount: number) => {
    setEditableProducts(currentProducts => {
      const producto = currentProducts.get(productoId);
      if (!producto) return currentProducts;

      const descuentoValido = Math.min(Math.max(0, newDiscount), 100);
      
      const newEditableProducts = new Map(currentProducts);
      newEditableProducts.set(productoId, {
        ...producto,
        descuento: descuentoValido
      });

      return newEditableProducts;
    });
    setHasChanges(true);
  };

  // Eliminar producto del modal
  const handleRemoveProduct = (productoId: number) => {
    setEditableProducts(currentProducts => {
      const newEditableProducts = new Map(currentProducts);
      newEditableProducts.delete(productoId);
      return newEditableProducts;
    });
    setHasChanges(true);
  };

  // Confirmar con los cambios aplicados
  const handleConfirmWithChanges = () => {
    // Pasar los productos editados al callback si hay cambios
    onConfirm(hasChanges ? editableProducts : undefined);
  };

  // Control de cantidad compacto para el modal
  const QuantityControl = ({ producto }: { producto: ProductoConCantidad }) => {
    const maxQuantity = producto.esServicio ? 999 : producto.existencias;
    
    return (
      <div className="flex items-center bg-gray-700 rounded-md overflow-hidden">
        <button
          onClick={() => handleQuantityChange(producto.id, producto.cantidad - 1)}
          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
          disabled={producto.cantidad <= 1}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        
        <div className="w-12 h-8 flex items-center justify-center">
          <input
            type="number"
            value={producto.cantidad}
            onChange={(e) => handleQuantityChange(producto.id, parseInt(e.target.value) || 0)}
            className="w-full h-full text-center bg-transparent text-white text-sm font-medium focus:outline-none appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="1"
            max={maxQuantity}
          />
        </div>
        
        <button
          onClick={() => handleQuantityChange(producto.id, producto.cantidad + 1)}
          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
          disabled={!producto.esServicio && producto.cantidad >= producto.existencias}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  };

  // Control de descuento compacto
  const DiscountControl = ({ producto }: { producto: ProductoConCantidad }) => (
    <div className="flex items-center space-x-2">
      <input
        type="number"
        value={producto.descuento}
        onChange={(e) => handleDiscountChange(producto.id, parseFloat(e.target.value) || 0)}
        className="w-16 h-8 text-center bg-gray-700 text-white text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min="0"
        max="100"
        step="0.1"
      />
      <span className="text-gray-400 text-sm">%</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-secondary border border-primary rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] transform animate-scaleIn flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-primary flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-primary">Confirmar Productos</h3>
            {hasChanges && (
              <p className="text-sm text-orange-400 mt-1">
                ✨ Tienes cambios sin guardar
              </p>
            )}
          </div>
          {validProducts.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-300">Total</p>
              <p className="text-lg font-bold text-green-400">
                {ProductoService.formatCurrency(totalGeneral)}
              </p>
            </div>
          )}
        </div>
        
        {/* Body - Lista de productos editables */}
        <div className="flex-1 overflow-y-auto p-4">
          {validProducts.length > 0 ? (
            <div className="space-y-3">
              {validProducts.map((producto) => (
                <div key={`confirm-${producto.id}`} className="bg-[#444444] rounded-lg p-3">
                  {/* Header del producto */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <h4 className="font-medium text-sm text-white truncate">
                        {producto.nombre}
                        {producto.esPromo && (
                          <span className="ml-1 text-xs bg-red-500 text-white px-1 rounded">PROMO</span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-300">{producto.codigo}</p>
                      <p className="text-sm text-gray-400">
                        Precio: {producto.precio}
                        {!producto.esServicio && ` • Stock: ${producto.existencias}`}
                      </p>
                    </div>
                    
                    {/* Botón eliminar */}
                    <button
                      onClick={() => handleRemoveProduct(producto.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded-md hover:bg-red-900/20 transition-colors"
                      aria-label={`Eliminar ${producto.nombre}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Controles de edición */}
                  <div className="grid grid-cols-3 gap-3 items-center">
                    {/* Cantidad */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Cantidad</label>
                      <QuantityControl producto={producto} />
                    </div>
                    
                    {/* Descuento */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Descuento</label>
                      <DiscountControl producto={producto} />
                    </div>
                    
                    {/* Subtotal */}
                    <div className="text-right">
                      <label className="block text-xs text-gray-400 mb-1">Subtotal</label>
                      <p className="text-sm font-bold text-green-400">
                        {ProductoService.formatCurrency(calculateTotal(producto, producto.cantidad, producto.descuento))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <p className="text-center">No hay productos para agregar</p>
            </div>
          )}
        </div>
        
        {/* Footer - Botones de acción */}
        <div className="p-4 border-t border-primary">
          {/* Resumen final */}
          {validProducts.length > 0 && (
            <div className="flex justify-between items-center mb-4 p-3 bg-[#333333] rounded-lg">
              <div>
                <p className="text-sm text-gray-300">
                  {validProducts.length} {validProducts.length === 1 ? 'producto' : 'productos'}
                </p>
                {hasChanges && (
                  <p className="text-xs text-orange-400">Con cambios aplicados</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Total General</p>
                <p className="text-xl font-bold text-green-400">
                  {ProductoService.formatCurrency(totalGeneral)}
                </p>
              </div>
            </div>
          )}
          
          {/* Botones */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmWithChanges}
              disabled={validProducts.length === 0}
              className={`px-6 py-2 rounded-md transition-colors duration-200 ${
                validProducts.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
            >
              {hasChanges ? 'Aplicar y Agregar' : 'Confirmar y Agregar'}
              {validProducts.length > 0 && ` (${validProducts.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};