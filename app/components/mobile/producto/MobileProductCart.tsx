import React from 'react';
import { MobileProductCartProps, ProductoConCantidad } from './types';
import ProductoService from '@/lib/api/productoService';

export const MobileProductCart = ({
  selectedProducts,
  handleRemoveProduct,
  handleConfirmAdd,
  calculateTotal
}: MobileProductCartProps) => {
  const hasValidProducts = Array.from(selectedProducts.values()).some(p => p.cantidad > 0);
  const validProducts = Array.from(selectedProducts.values()).filter(p => p.cantidad > 0);
  
  // Calcular total general
  const totalGeneral = validProducts.reduce((sum, producto) => 
    sum + calculateTotal(producto, producto.cantidad, producto.descuento), 0
  );
  
  return (
    <div>
      {/* Encabezado con botón de agregar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">Productos a Facturar</h3>
          {validProducts.length > 0 && (
            <span className="ml-2 text-sm bg-blue-600 text-white px-2 py-1 rounded-full">
              {validProducts.length}
            </span>
          )}
        </div>
        <button
          className={`flex items-center justify-center py-2 px-4 rounded-md transition-colors duration-200 ${
            hasValidProducts
              ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer text-white shadow-md'
              : 'bg-gray-500 cursor-not-allowed text-gray-300'
          }`}
          onClick={handleConfirmAdd}
          disabled={!hasValidProducts}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar {validProducts.length > 0 && `(${validProducts.length})`}
        </button>
      </div>

      {/* Lista de productos seleccionados */}
      <div className="bg-secondary rounded-md overflow-hidden">
        <div className="overflow-y-auto" style={{ height: '31vh' }}>
          {validProducts.length > 0 ? (
            <>
              <div className="divide-y divide-[#888888]">
                {validProducts.map((producto) => (
                  <div
                    key={`selected-${producto.id}`}
                    className="p-3 hover:bg-[#666666] transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      {/* Información del producto */}
                      <div className="flex items-start flex-1 mr-3">
                        <div className="w-10 h-10 mr-3 flex-shrink-0 rounded-md overflow-hidden">
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
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-primary truncate">
                            {producto.nombre}
                            {producto.esPromo && (
                              <span className="ml-1 text-xs bg-red-500 text-white px-1 rounded">PROMO</span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-100">{producto.codigo}</p>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-100">
                                Cantidad: <span className="font-medium text-white">{producto.cantidad}</span>
                              </p>
                              <p className="text-sm text-gray-100">
                                Precio: <span className="font-medium text-white">{producto.precio}</span>
                              </p>
                            </div>
                            {producto.descuento > 0 && (
                              <p className="text-sm text-orange-400">
                                Descuento: {producto.descuento}%
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Total y botón eliminar */}
                      <div className="flex flex-col items-end">
                        <div className="text-center mb-2">
                          <p className="text-xs text-gray-100">Subtotal</p>
                          <p className="text-sm font-bold text-green-400">
                            {ProductoService.formatCurrency(calculateTotal(producto, producto.cantidad, producto.descuento))}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(producto.id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200 p-1 rounded-md hover:bg-red-900/20"
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
              <div className="p-3 bg-[#444444] border-t border-[#666666] sticky bottom-0">
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <p className="text-sm text-gray-300">Total General</p>
                    <p className="text-xs text-gray-400">
                      {validProducts.length} {validProducts.length === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">
                      {ProductoService.formatCurrency(totalGeneral)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-100 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-center font-medium">
                No has seleccionado ningún producto aún.
              </p>
              <p className="text-center text-sm text-gray-400 mt-1">
                Usa los controles + y - junto a cada producto para agregarlo al carrito.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};