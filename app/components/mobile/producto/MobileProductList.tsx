import React, { ChangeEvent } from 'react';
import { MobileProductListProps, ProductoConCantidad } from './types';
import { MobileProductQuantityControl } from './MobileProductQuantityControl';
import ProductoService from '@/lib/api/productoService';

export const MobileProductList = ({
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
}: MobileProductListProps) => {
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
        {terminoBusqueda && (
          <button
            onClick={() => onSearchChange({ target: { value: '' } } as ChangeEvent<HTMLInputElement>)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Lista de productos */}
      <div className="mb-1">
        {/* <h4 className="font-semibold mb-1">
          {terminoBusqueda.length >= 2 ? 'Resultados de búsqueda' : 'Productos disponibles'}
          <span className="ml-2 text-sm text-gray-400">
            ({productos.length} {productos.length === 1 ? 'producto' : 'productos'})
          </span>
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
                <p className="text-center text-sm">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  Intentar de nuevo
                </button>
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
                        key={`${producto.id}-${producto.kardexId || 0}`}
                        className="transition-colors duration-200 hover:bg-[#666666]"
                      >
                        <div className="flex items-center p-3">
                          {/* Imagen del producto */}
                          <div className="flex-shrink-0 mr-3">
                            <div className="w-12 h-12 rounded-md overflow-hidden flex items-center justify-center bg-gray-200">
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
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-primary truncate">
                                  {producto.nombre}
                                  {producto.esPromo && (
                                    <span className="ml-1 text-xs bg-red-500 text-white px-1 rounded">PROMO</span>
                                  )}
                                </h4>
                                <p className="text-sm text-gray-100">{producto.codigo}</p>
                                
                                {/* Estado del producto */}
                                <div className="flex items-center justify-between mt-1">
                                  <p className={`text-xs ${
                                    producto.existencias > 0 ? 'text-green-400' : 
                                    producto.esServicio ? 'text-blue-400' : 'text-red-400'
                                  }`}>
                                    {producto.esServicio ? 'Servicio' : `Stock: ${producto.existencias}`}
                                  </p>
                                  
                                  {/* Cantidad reservada si existe */}
                                  {producto.cantidadReservada && producto.cantidadReservada > 0 && (
                                    <p className="text-xs text-yellow-400">
                                      Reservado: {producto.cantidadReservada}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Precio y controles */}
                          <div className="text-end">
                            <p className="text-sm font-bold text-primary whitespace-nowrap mb-1">
                              {producto.precio}
                            </p>
                            <MobileProductQuantityControl
                              productoId={producto.id}
                              currentQuantity={currentQuantity}
                              existencias={producto.existencias}
                              isSelected={isSelected}
                              handleQuantityChange={handleQuantityChange}
                              handleQuantityBlur={handleQuantityBlur}
                              esServicio={producto.esServicio}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Indicador de carga para scroll infinito */}
                {esBuscando && (
                  <div className="flex items-center justify-center p-4 border-t border-[#666666]">
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
                <p className="text-center text-sm">
                  {terminoBusqueda.length >= 2 ? 
                    `No se encontraron productos para "${terminoBusqueda}"` :
                    'No hay productos disponibles.'
                  }
                </p>
                {terminoBusqueda.length >= 2 && (
                  <button
                    onClick={() => onSearchChange({ target: { value: '' } } as ChangeEvent<HTMLInputElement>)}
                    className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Ver todos los productos
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};