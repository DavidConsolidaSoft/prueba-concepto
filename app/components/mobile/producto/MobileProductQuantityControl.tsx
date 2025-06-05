import React, { ChangeEvent } from 'react';
import { MobileProductQuantityControlProps } from './types';

export const MobileProductQuantityControl = ({
  productoId,
  currentQuantity,
  existencias,
  isSelected,
  handleQuantityChange,
  handleQuantityBlur,
  esServicio = false
}: MobileProductQuantityControlProps & { esServicio?: boolean }) => {
  
  // Para servicios, no hay límite de existencias
  const maxQuantity = esServicio ? 999999 : existencias;
  const isAtMax = !esServicio && currentQuantity >= existencias;
  const isAtMin = currentQuantity <= 0;
  
  // Determinar si el producto tiene stock disponible
  const hasStock = esServicio || existencias > 0;
  
  return (
    <div className="flex items-center bg-primary rounded-md overflow-hidden">
      {/* Botón decrementar */}
      <button
        onClick={() => handleQuantityChange(productoId, Math.max(0, currentQuantity - 1))}
        className={`text-primary w-8 h-8 flex items-center justify-center transition-all duration-150 ${
          isAtMin 
            ? 'text-gray-500 cursor-not-allowed' 
            : 'hover:bg-secondary active:bg-tertiary'
        }`}
        disabled={isAtMin}
        aria-label="Disminuir cantidad"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      
      {/* Input de cantidad */}
      <input
        type="number"
        value={currentQuantity === 0 && !isSelected ? '' : currentQuantity}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleQuantityChange(productoId, e.target.value)}
        onBlur={(e: ChangeEvent<HTMLInputElement>) => handleQuantityBlur(e, productoId)}
        min="0"
        max={maxQuantity}
        placeholder="0"
        disabled={!hasStock}
        className={`w-12 h-8 text-center text-sm font-medium focus:outline-none transition-all duration-150 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
          hasStock 
            ? 'bg-tertiary text-primary focus:ring-1 focus:ring-blue-500 focus:bg-white' 
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
        aria-label="Cantidad del producto"
      />
      
      {/* Botón incrementar */}
      <button
        onClick={() => handleQuantityChange(productoId, currentQuantity + 1)}
        className={`text-primary w-8 h-8 flex items-center justify-center transition-all duration-150 ${
          isAtMax || !hasStock
            ? 'text-gray-500 cursor-not-allowed' 
            : 'hover:bg-secondary active:bg-tertiary'
        }`}
        disabled={isAtMax || !hasStock}
        aria-label="Incrementar cantidad"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      
      {/* Indicador de stock bajo (solo para productos físicos) */}
      {!esServicio && existencias > 0 && existencias <= 5 && (
        <div className="absolute -top-1 -right-1">
          <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-yellow-500 rounded-full">
            !
          </span>
        </div>
      )}
      
      {/* Indicador sin stock */}
      {!esServicio && existencias === 0 && (
        <div className="absolute inset-0 bg-red-900/50 rounded-md flex items-center justify-center">
          <span className="text-xs text-red-200 font-medium">Sin stock</span>
        </div>
      )}
    </div>
  );
};