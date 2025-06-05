import React from 'react';
import { ProductCartProps } from './types';
import ProductoService from '@/lib/api/productoService';

export const ProductCart = ({
  selectedProducts,
  handleRemoveProduct,
  handleConfirmAdd,
  calculateTotal,
  isMobile
}: ProductCartProps) => {
  const selectedProductsHeight = isMobile ? '25vh' : '30vh';
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
        <div
          className="overflow-y-auto"
          style={{ height: selectedProductsHeight }}
        >
          {Array.from(selectedProducts.values()).filter(item => item.cantidad > 0).length > 0 ? (
            <div className="divide-y divide-[#888888]">
              {Array.from(selectedProducts.values())
                .filter(item => item.cantidad > 0)
                .map((item) => (
                <div
                  key={`selected-${item.producto.id}`}
                  className="p-3 hover:bg-[#666666] transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    {/* Detalles del producto seleccionado */}
                    <div className="flex items-start">
                      <div className="w-10 h-10 mr-3 flex-shrink-0 rounded-md overflow-hidden">
                        <img
                          src={item.producto.imagen}
                          alt={item.producto.nombre}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{item.producto.nombre}</h4>
                        <p className="text-sm text-gray-100">{item.producto.codigo}</p>
                        <div className="mt-1 space-y-1">
                          <p className="text-sm text-gray-100">
                            Cantidad: <span className="font-medium">{item.cantidad}</span>
                          </p>
                          <p className="text-sm text-gray-100">
                            Precio unit.: <span className="font-medium">{item.producto.precio}</span>
                          </p>
                          {item.descuento > 0 && (
                            <p className="text-sm text-orange-400">
                              Descuento: {item.descuento}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Total y botón eliminar */}
                    <div className="flex flex-col items-end">
                      <div className="text-right mb-2">
                        <p className="text-xs text-gray-100">Total</p>
                        <p className="text-sm font-bold text-green-400">
                          {ProductoService.formatCurrency(calculateTotal(item.producto, item.cantidad, item.descuento))}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(item.producto.id)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200 p-1"
                        aria-label={`Eliminar ${item.producto.nombre}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Resumen total */}
              <div className="p-3 bg-[#444444] border-t border-[#666666]">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total General:</span>
                  <span className="text-lg font-bold text-green-400">
                    {ProductoService.formatCurrency(
                      Array.from(selectedProducts.values())
                        .filter(item => item.cantidad > 0)
                        .reduce((sum, item) => sum + calculateTotal(item.producto, item.cantidad, item.descuento), 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Mensaje si no hay productos seleccionados
            <div className="flex flex-col items-center justify-center h-full text-gray-100 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-center">
                No has seleccionado ningún producto aún.
              </p>
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