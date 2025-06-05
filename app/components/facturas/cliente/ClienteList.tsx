import React, { useEffect, useRef, useCallback } from 'react';
import { ClienteListProps } from './types';

export const ClienteList = ({
  clientes,
  filteredClientes,
  selectedCliente,
  searchTerm,
  onSearchChange,
  onSelectCliente,
  onCreateNewClient,
  isLoading,
  hasMore,
  onLoadMore,
  onSearch,
  searchMode
}: ClienteListProps) => {
  const observer = useRef<IntersectionObserver | null>(null);
  
  // Elemento de referencia para el último cliente en la lista
  const lastClienteElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || searchMode || !hasMore) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !searchMode) {
        console.log('[ClienteList] Cargando más clientes...');
        onLoadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, onLoadMore, searchMode]);

  // Cleanup del observer
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // Manejar cambio en el input de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log(`[ClienteList] Cambio en búsqueda: "${newValue}"`);
    
    // Llamar al manejador padre inmediatamente
    onSearchChange(e);
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    console.log('[ClienteList] Limpiando búsqueda');
    const fakeEvent = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLInputElement>;
    onSearchChange(fakeEvent);
  };

  return (
    <>
      {/* Campo de búsqueda mejorado */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Buscar por nombre, código, NIT o teléfono..."
          className="w-full p-2 pl-10 pr-10 bg-tertiary rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
        />
        
        {/* Icono de búsqueda */}
        {/* <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 absolute left-3 top-2.5 text-tertiary" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg> */}
        
        {/* Botón para limpiar búsqueda */}
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-2.5 text-tertiary hover:text-primary transition-colors"
            title="Limpiar búsqueda"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* Indicador de modo búsqueda */}
        {searchMode && (
          <div className="absolute right-12 top-2.5">
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Lista de clientes */}
      <div className="bg-secondary rounded-md overflow-hidden flex-1">
        <div className="overflow-y-auto h-full">
          {filteredClientes.length > 0 ? (
            <div className="divide-y divide-[#888888]">
              {filteredClientes.map((cliente, index) => {
                const isLastElement = index === filteredClientes.length - 1;
                
                return (
                  <div
                    key={`${cliente.id}-${cliente.codigo}`}
                    ref={isLastElement && !searchMode ? lastClienteElementRef : null}
                    onClick={() => onSelectCliente(cliente)}
                    className={`p-3 hover:bg-[#666666] cursor-pointer transition-colors duration-200 ${
                      selectedCliente?.id === cliente.id ? 'bg-[#666666]' : ''
                    }`}
                  >
                    <div className="flex justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{cliente.nombre || 'Sin nombre'}</h3>
                        <div className="space-y-1 mt-1">
                          <p className="text-sm text-secondary">
                            <span className="font-medium">Código:</span> {cliente.codigo || 'N/A'}
                          </p>
                          {cliente.numeroRegistro && (
                            <p className="text-sm text-secondary">
                              <span className="font-medium">{cliente.tipoDocumento}:</span> {cliente.numeroRegistro}
                            </p>
                          )}
                          {cliente.email && (
                            <p className="text-sm text-secondary truncate">
                              <span className="font-medium">Email:</span> {cliente.email}
                            </p>
                          )}
                          {cliente.telefono && (
                            <p className="text-sm text-secondary">
                              <span className="font-medium">Teléfono:</span> {cliente.telefono}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {selectedCliente?.id === cliente.id && (
                        <div className="flex items-start ml-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Indicador de carga para lazy loading - solo en modo normal */}
              {isLoading && !searchMode && (
                <div className="p-4 flex justify-center">
                  <div className="flex items-center text-tertiary">
                    <svg className="animate-spin h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Cargando más clientes...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Estados vacíos mejorados */
            <div className="flex flex-col items-center justify-center h-full text-tertiary p-4">
              {searchTerm ? (
                /* No hay resultados de búsqueda */
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No se encontraron clientes</h3>
                  <p className="text-center text-sm mb-4 max-w-md">
                    No hay clientes que coincidan con "<strong>{searchTerm}</strong>".
                    Intenta con un término diferente o crea un nuevo cliente.
                  </p>
                  <button
                    onClick={() => onCreateNewClient()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm"
                  >
                    Crear cliente "{searchTerm}"
                  </button>
                </>
              ) : (
                /* Lista vacía */
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No hay clientes</h3>
                  <p className="text-center text-sm mb-4">
                    Aún no tienes clientes registrados. Crea tu primer cliente para comenzar.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Botones de acción */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={onCreateNewClient}
          className="flex-1 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors duration-200"
        >
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Nuevo Cliente
          </div>
        </button>
      </div>
    </>
  );
};