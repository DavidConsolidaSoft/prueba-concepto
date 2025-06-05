import React from 'react';
import { ProductListProps } from './types'; // Importar desde types.ts
import { ProductQuantityControl } from './ProductQuantityControl';

export const ProductList = ({
  filteredProducts,
  selectedProducts,
  searchTerm,
  onSearchChange,
  handleQuantityChange,
  handleQuantityBlur,
  isMobile,
  isLoading,
  isLoadingMore,
  isSearching,
  hasMoreResults,
  error,
  onScroll,
  scrollContainerRef,
  onClearSearch
}: ProductListProps) => {
  const productListHeight = isMobile ? '30vh' : '35vh';

  return (
    <div className="mb-2">
      {/* Campo de búsqueda */}
      <div className="relative mb-3">
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Buscar por nombre, código o descripción..."
          className="w-full p-2 pl-10 pr-10 bg-tertiary rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 absolute left-3 top-2.5 text-tertiary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {isSearching && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {searchTerm && onClearSearch && (
          <button
            onClick={onClearSearch}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Lista de productos */}
      <h3 className="text-lg font-semibold mb-2">
        {searchTerm.length >= 2 ? 
          `Resultados de búsqueda${hasMoreResults ? ' (hay más...)' : ''}` : 
          'Productos disponibles'
        }
      </h3>
      
      <div className="bg-secondary rounded-md overflow-hidden">
        <div 
          {...(scrollContainerRef && { ref: scrollContainerRef })}
          className="overflow-y-auto" 
          style={{ height: productListHeight }}
          {...(onScroll && { onScroll })}
        >
          {isLoading ? (
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
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="divide-y divide-[#888888]">
                {filteredProducts.map(producto => {
                  const currentSelected = selectedProducts.get(producto.id);
                  const currentQuantity = currentSelected?.cantidad ?? 0;
                  const isSelected = selectedProducts.has(producto.id);

                  return (
                    <div
                      key={`${producto.id}-${producto.kardexId || 0}`}
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
                          <p className="text-sm text-gray-100">
                            {producto.codigo}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className={`text-sm ${
                              producto.existencias > 0 ? 'text-green-400' : 
                              producto.esServicio ? 'text-blue-400' : 'text-red-400'
                            }`}>
                              {producto.esServicio ? 'Servicio' : `Stock: ${producto.existencias}`}
                            </p>
                            {producto.cantidadReservada > 0 && (
                              <p className="text-xs text-yellow-400">
                                Reservado: {producto.cantidadReservada}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Precio y controles */}
                        <div className="text-end ml-2">
                          <p className="text-sm font-bold text-primary whitespace-nowrap mb-1">
                            {producto.precio}
                          </p>
                          <ProductQuantityControl
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
              {(isLoadingMore || isSearching) && (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-sm text-gray-300">
                    {searchTerm ? 'Buscando más resultados...' : 'Cargando más productos...'}
                  </span>
                </div>
              )}
              
              {/* Indicador de fin de resultados */}
              {!hasMoreResults && searchTerm && filteredProducts.length > 10 && (
                <div className="text-center p-4 text-gray-400 text-sm">
                  • Fin de los resultados •
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-tertiary p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-center">
                {searchTerm.length >= 2 ? 
                  `No se encontraron productos para "${searchTerm}"` :
                  'No hay productos disponibles con los filtros seleccionados.'
                }
              </p>
              {searchTerm.length >= 2 && onClearSearch && (
                <button
                  onClick={onClearSearch}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  Ver todos los productos
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};