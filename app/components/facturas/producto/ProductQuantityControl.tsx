import React, { useState, useEffect } from 'react';
import { ProductQuantityControlProps } from './types';

export const ProductQuantityControl = ({
  productoId,
  currentQuantity,
  existencias,
  isSelected,
  handleQuantityChange,
  handleQuantityBlur,
  esServicio = false
}: ProductQuantityControlProps) => {
  // Estado local para el input mientras se está editando
  const [inputValue, setInputValue] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);

  const maxQuantity = esServicio ? 999 : existencias;

  // Sincronizar el valor del input con la cantidad actual cuando no se está editando
  useEffect(() => {
    if (!isEditing) {
      setInputValue(currentQuantity === 0 && !isSelected ? '' : currentQuantity.toString());
    }
  }, [currentQuantity, isSelected, isEditing]);

  // Manejar cambio en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowEmptyWarning(false);

    // Si el valor no está vacío, actualizar inmediatamente
    if (value !== '' && value !== '-') {
      const numericValue = parseInt(value, 10);
      if (!isNaN(numericValue) && numericValue >= 0) {
        handleQuantityChange(productoId, numericValue);
      }
    }
  };

  // Manejar cuando el input recibe foco
  const handleInputFocus = () => {
    setIsEditing(true);
    setShowEmptyWarning(false);
    // Seleccionar todo el texto para facilitar la edición
    setTimeout(() => {
      const input = document.getElementById(`quantity-input-${productoId}`) as HTMLInputElement;
      if (input) {
        input.select();
      }
    }, 0);
  };

  // Manejar cuando el input pierde el foco
  const handleInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setIsEditing(false);

    // Si está vacío, mostrar advertencia y opciones
    if (value === '' || value === '0') {
      if (isSelected) {
        setShowEmptyWarning(true);
        // Auto-ocultar la advertencia después de 3 segundos
        setTimeout(() => setShowEmptyWarning(false), 3000);
      }
      setInputValue('');
      handleQuantityChange(productoId, 0);
      if (handleQuantityBlur) {
        handleQuantityBlur(e, productoId);
      }
      return;
    }

    // Validar y aplicar el valor
    let numericValue = parseInt(value, 10);
    if (isNaN(numericValue) || numericValue < 0) {
      numericValue = 0;
    }

    // Aplicar límites
    numericValue = Math.min(numericValue, maxQuantity);
    
    setInputValue(numericValue.toString());
    handleQuantityChange(productoId, numericValue);
    
    if (handleQuantityBlur) {
      handleQuantityBlur(e, productoId);
    }
  };

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter para confirmar
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    
    // Escape para cancelar cambios
    if (e.key === 'Escape') {
      setInputValue(currentQuantity.toString());
      setIsEditing(false);
      setShowEmptyWarning(false);
      (e.target as HTMLInputElement).blur();
    }
  };

  // Confirmar eliminación del producto
  const handleConfirmRemove = () => {
    handleQuantityChange(productoId, 0);
    setShowEmptyWarning(false);
    setInputValue('');
  };

  // Cancelar eliminación
  const handleCancelRemove = () => {
    setShowEmptyWarning(false);
    setInputValue(currentQuantity > 0 ? currentQuantity.toString() : '1');
    handleQuantityChange(productoId, currentQuantity > 0 ? currentQuantity : 1);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-end bg-primary rounded-md overflow-hidden">
        <button
          onClick={() => handleQuantityChange(productoId, Math.max(0, currentQuantity - 1))}
          className={`text-primary w-7 h-7 flex items-center justify-center transition-colors duration-150 ${
            currentQuantity > 0 ? 'hover:bg-secondary' : 'text-gray-500 cursor-not-allowed'
          }`}
          disabled={currentQuantity <= 0}
          title="Disminuir cantidad"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        
        <input
          id={`quantity-input-${productoId}`}
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          min="0"
          max={maxQuantity}
          placeholder="0"
          title={`Cantidad máxima: ${maxQuantity}`}
          className={`mx-1 w-12 h-7 text-center bg-tertiary text-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all duration-200 ${
            isEditing ? 'ring-2 ring-blue-400' : ''
          }`}
        />
        
        <button
          onClick={() => handleQuantityChange(productoId, Math.min(maxQuantity, currentQuantity + 1))}
          className={`text-primary w-7 h-7 flex items-center justify-center transition-colors duration-150 ${
            currentQuantity < maxQuantity ? 'hover:bg-secondary' : 'text-gray-500 cursor-not-allowed'
          }`}
          disabled={currentQuantity >= maxQuantity}
          title="Aumentar cantidad"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Advertencia de eliminación */}
      {showEmptyWarning && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 z-50 bg-yellow-600 text-white text-xs rounded-md p-2 shadow-lg border border-yellow-500 min-w-max">
          <div className="text-center mb-2">
            <p className="font-medium">¿Eliminar producto?</p>
            <p className="text-yellow-100">La cantidad está vacía</p>
          </div>
          <div className="flex gap-1 justify-center">
            <button
              onClick={handleConfirmRemove}
              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
            >
              Eliminar
            </button>
            <button
              onClick={handleCancelRemove}
              className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs transition-colors"
            >
              Cancelar
            </button>
          </div>
          {/* Flecha apuntando hacia arriba */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-yellow-600"></div>
        </div>
      )}
    </div>
  );
};