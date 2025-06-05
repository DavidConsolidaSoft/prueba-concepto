import React, { useState, useEffect } from 'react';
import { ConfirmModalProps } from './types';
import ProductoService from '@/lib/api/productoService';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedProducts,
  calculateTotal
}: ConfirmModalProps) => {
  // Estado local para los productos editables - mantiene el formato original
  const [editableProducts, setEditableProducts] = useState<Map<number, { producto: any, cantidad: number, descuento: number }>>(new Map());
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
  const totalGeneral = validProducts.reduce((sum, { producto, cantidad, descuento }) =>
    sum + calculateTotal(producto, cantidad, descuento), 0);

  // Manejar cambio de cantidad en el modal
  const handleQuantityChange = (productoId: number, newQuantity: number) => {
    setEditableProducts(currentProducts => {
      const item = currentProducts.get(productoId);
      if (!item) return currentProducts;

      // Validar disponibilidad
      const validacion = ProductoService.validarDisponibilidad(item.producto, newQuantity);
      const cantidadValida = Math.min(Math.max(0, newQuantity), validacion.cantidadMaxima);

      const newEditableProducts = new Map(currentProducts);
      
      if (cantidadValida <= 0) {
        newEditableProducts.delete(productoId);
      } else {
        newEditableProducts.set(productoId, {
          ...item,
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
      const item = currentProducts.get(productoId);
      if (!item) return currentProducts;

      const descuentoValido = Math.min(Math.max(0, newDiscount), 100);
      
      const newEditableProducts = new Map(currentProducts);
      newEditableProducts.set(productoId, {
        ...item,
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
    // Si hay cambios, pasamos los productos editados; si no, undefined
    if (hasChanges) {
      // Necesitamos pasar los productos editados al callback del ProductSelector
      // El ProductSelector manejará la conversión del formato
      onConfirm(editableProducts);
    } else {
      onConfirm();
    }
  };

  // Control de cantidad compacto para escritorio
  const QuantityControl = ({ item }: { item: { producto: any, cantidad: number, descuento: number } }) => {
    const [inputValue, setInputValue] = useState<string>(item.cantidad.toString());
    const [isEditing, setIsEditing] = useState(false);
    const [showEmptyWarning, setShowEmptyWarning] = useState(false);
    const maxQuantity = item.producto.esServicio ? 999 : item.producto.existencias;
    
    // Sincronizar cuando cambia la cantidad externa
    useEffect(() => {
      if (!isEditing) {
        setInputValue(item.cantidad.toString());
      }
    }, [item.cantidad, isEditing]);

    // Manejar cambio en el input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      setShowEmptyWarning(false);

      // Si el valor no está vacío, actualizar inmediatamente
      if (value !== '' && value !== '-') {
        const numericValue = parseInt(value, 10);
        if (!isNaN(numericValue) && numericValue >= 0) {
          handleQuantityChange(item.producto.id, Math.min(numericValue, maxQuantity));
        }
      }
    };

    // Manejar foco
    const handleInputFocus = () => {
      setIsEditing(true);
      setShowEmptyWarning(false);
      // Seleccionar todo el texto
      setTimeout(() => {
        const input = document.getElementById(`modal-quantity-${item.producto.id}`) as HTMLInputElement;
        if (input) input.select();
      }, 0);
    };

    // Manejar blur
    const handleInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      setIsEditing(false);

      // Si está vacío, mostrar advertencia
      if (value === '' || value === '0') {
        setShowEmptyWarning(true);
        setTimeout(() => setShowEmptyWarning(false), 4000);
        return;
      }

      // Validar y aplicar
      let numericValue = parseInt(value, 10);
      if (isNaN(numericValue) || numericValue < 1) {
        numericValue = 1;
      }
      numericValue = Math.min(numericValue, maxQuantity);
      
      setInputValue(numericValue.toString());
      handleQuantityChange(item.producto.id, numericValue);
    };

    // Manejar teclas
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      if (e.key === 'Escape') {
        setInputValue(item.cantidad.toString());
        setIsEditing(false);
        setShowEmptyWarning(false);
        (e.target as HTMLInputElement).blur();
      }
    };

    // Confirmar/Cancelar eliminación
    const handleConfirmRemove = () => {
      handleRemoveProduct(item.producto.id);
      setShowEmptyWarning(false);
    };

    const handleCancelRemove = () => {
      setShowEmptyWarning(false);
      setInputValue(item.cantidad > 0 ? item.cantidad.toString() : '1');
      if (item.cantidad === 0) {
        handleQuantityChange(item.producto.id, 1);
      }
    };
    
    return (
      <div className="relative">
        <div className="flex items-center bg-primary rounded-md overflow-hidden">
          <button
            onClick={() => handleQuantityChange(item.producto.id, Math.max(1, item.cantidad - 1))}
            className="w-7 h-7 flex items-center justify-center text-primary hover:bg-secondary transition-colors"
            disabled={item.cantidad <= 1}
            title="Disminuir cantidad"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <input
            id={`modal-quantity-${item.producto.id}`}
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className={`w-12 h-7 text-center bg-tertiary text-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all duration-200 ${
              isEditing ? 'ring-2 ring-blue-400' : ''
            }`}
            min="1"
            max={maxQuantity}
            title={`Cantidad máxima: ${maxQuantity}`}
          />
          
          <button
            onClick={() => handleQuantityChange(item.producto.id, Math.min(maxQuantity, item.cantidad + 1))}
            className="w-7 h-7 flex items-center justify-center text-primary hover:bg-secondary transition-colors"
            disabled={item.cantidad >= maxQuantity}
            title="Aumentar cantidad"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Advertencia de eliminación mejorada */}
        {showEmptyWarning && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-red-600 text-white text-xs rounded-lg p-3 shadow-xl border border-red-500 min-w-max">
            <div className="text-center mb-3">
              <svg className="w-6 h-6 mx-auto mb-1 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.198 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="font-medium">¿Eliminar producto del modal?</p>
              <p className="text-red-100 mt-1">"{item.producto.nombre}"</p>
              <p className="text-red-200 text-xs mt-1">La cantidad está vacía</p>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleConfirmRemove}
                className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
              <button
                onClick={handleCancelRemove}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
              >
                Conservar
              </button>
            </div>
            {/* Flecha */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-red-600"></div>
          </div>
        )}
      </div>
    );
  };

  // Control de descuento compacto
  const DiscountControl = ({ item }: { item: { producto: any, cantidad: number, descuento: number } }) => {
    const [inputValue, setInputValue] = useState<string>(item.descuento.toString());
    const [isEditing, setIsEditing] = useState(false);

    // Sincronizar cuando cambia el descuento externo
    useEffect(() => {
      if (!isEditing) {
        setInputValue(item.descuento.toString());
      }
    }, [item.descuento, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      if (value !== '' && value !== '-') {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
          handleDiscountChange(item.producto.id, numericValue);
        }
      }
    };

    const handleInputFocus = () => {
      setIsEditing(true);
      setTimeout(() => {
        const input = document.getElementById(`modal-discount-${item.producto.id}`) as HTMLInputElement;
        if (input) input.select();
      }, 0);
    };

    const handleInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      setIsEditing(false);

      let numericValue = parseFloat(value);
      if (isNaN(numericValue) || numericValue < 0) {
        numericValue = 0;
      } else if (numericValue > 100) {
        numericValue = 100;
      }

      setInputValue(numericValue.toString());
      handleDiscountChange(item.producto.id, numericValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      if (e.key === 'Escape') {
        setInputValue(item.descuento.toString());
        setIsEditing(false);
        (e.target as HTMLInputElement).blur();
      }
    };

    return (
      <div className="flex items-center space-x-1">
        <input
          id={`modal-discount-${item.producto.id}`}
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className={`w-14 h-7 text-center bg-tertiary text-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-md transition-all duration-200 ${
            isEditing ? 'ring-2 ring-blue-400' : ''
          }`}
          min="0"
          max="100"
          step="0.1"
          title="Descuento en porcentaje (0-100%)"
        />
        <span className="text-gray-400 text-sm">%</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-secondary border border-primary rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] transform animate-scaleIn flex flex-col">
        
        {/* Header mejorado */}
        <div className="p-4 border-b border-primary flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-primary">Confirmar Productos</h3>
            <p className="text-sm text-gray-300 mt-1">
              Revisa y ajusta los productos antes de agregarlos a la factura
            </p>
            {hasChanges && (
              <p className="text-sm text-orange-400 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Tienes cambios sin guardar
              </p>
            )}
          </div>
          {validProducts.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-300">Total General</p>
              <p className="text-2xl font-bold text-green-400">
                {ProductoService.formatCurrency(totalGeneral)}
              </p>
              <p className="text-xs text-gray-400">
                {validProducts.length} {validProducts.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          )}
        </div>
        
        {/* Body - Lista de productos editables */}
        <div className="flex-1 overflow-y-auto p-4">
          {validProducts.length > 0 ? (
            <div className="space-y-3">
              {/* Header de la tabla */}
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400 border-b border-primary pb-2">
                <div className="col-span-5">Producto</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-2 text-center">Descuento</div>
                <div className="col-span-2 text-right">Subtotal</div>
                <div className="col-span-1"></div>
              </div>
              
              {/* Lista de productos editables */}
              {validProducts.map((item) => (
                <div key={`confirm-${item.producto.id}`} className="grid grid-cols-12 gap-4 items-center p-3 bg-[#444444] rounded-lg hover:bg-[#4a4a4a] transition-colors">
                  {/* Información del producto */}
                  <div className="col-span-5">
                    <div className="flex items-center">
                      <div className="w-12 h-12 mr-3 flex-shrink-0 rounded-md overflow-hidden bg-gray-200">
                        <img
                          src={item.producto.imagen}
                          alt={item.producto.nombre}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/producto-default.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">
                          {item.producto.nombre}
                          {item.producto.esPromo && (
                            <span className="ml-2 text-xs bg-red-500 text-white px-1 rounded">PROMO</span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-300">{item.producto.codigo}</p>
                        <p className="text-xs text-gray-400">
                          {item.producto.precio}
                          {!item.producto.esServicio && ` • Stock: ${item.producto.existencias}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Control de cantidad */}
                  <div className="col-span-2 flex justify-center">
                    <QuantityControl item={item} />
                  </div>
                  
                  {/* Control de descuento */}
                  <div className="col-span-2 flex justify-center">
                    <DiscountControl item={item} />
                  </div>
                  
                  {/* Subtotal */}
                  <div className="col-span-2 text-right">
                    <p className="text-lg font-bold text-green-400">
                      {ProductoService.formatCurrency(calculateTotal(item.producto, item.cantidad, item.descuento))}
                    </p>
                  </div>
                  
                  {/* Botón eliminar */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => handleRemoveProduct(item.producto.id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-md hover:bg-red-900/20 transition-colors"
                      aria-label={`Eliminar ${item.producto.nombre}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <p className="text-center text-lg">No hay productos para agregar</p>
              <p className="text-center text-sm mt-1">Todos los productos han sido eliminados</p>
            </div>
          )}
        </div>
        
        {/* Footer - Resumen y botones */}
        <div className="p-4 border-t border-primary">
          {/* Resumen final */}
          {validProducts.length > 0 && (
            <div className="flex justify-between items-center mb-4 p-3 bg-[#333333] rounded-lg">
              <div>
                <p className="text-lg font-medium text-white">
                  {validProducts.length} {validProducts.length === 1 ? 'producto' : 'productos'} seleccionado{validProducts.length === 1 ? '' : 's'}
                </p>
                {hasChanges && (
                  <p className="text-sm text-orange-400 mt-1">
                    ⚠️ Con cambios aplicados - Los productos se actualizarán
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Total:</p>
                <p className="text-2xl font-bold text-green-400">
                  {ProductoService.formatCurrency(totalGeneral)}
                </p>
              </div>
            </div>
          )}
          
          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="bg-primary text-primary px-4 py-2 rounded-md hover:bg-tertiary transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmWithChanges}
              disabled={validProducts.length === 0}
              className={`px-6 py-2 rounded-md transition-colors duration-200 flex items-center ${
                validProducts.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
            >
              {hasChanges ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Aplicar Cambios y Agregar
                </>
              ) : (
                'Confirmar'
              )}
              {validProducts.length > 0 && ` (${validProducts.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};