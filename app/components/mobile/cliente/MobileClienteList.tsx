import React, { useRef, useCallback } from 'react';
import { MobileClienteListProps } from './types';

export const MobileClienteList = ({
  filteredClientes,
  selectedCliente,
  searchTerm,
  onSearchChange,
  onSelectCliente,
  onCreateNewClient,
  isLoading,
  searchMode,
  searchError,
  hasMore,
  onLoadMore
}: MobileClienteListProps) => {
  const observer = useRef<IntersectionObserver | null>(null);
  
  // Elemento de referencia para el último cliente en la lista (para el observador)
  const lastClienteElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || searchMode || !hasMore) return; // No observar en modo búsqueda
    
    // Desconectar el observador anterior
    if (observer.current) observer.current.disconnect();
    
    // Crear un nuevo observador para detectar cuando el último elemento es visible
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log('[MobileClienteList] Cargando más clientes...');
        onLoadMore();
      }
    });
    
    // Observar el nuevo último elemento
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, onLoadMore, searchMode]);

  // Cleanup del observer
  React.useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // Limpiar búsqueda
  const handleClearSearch = () => {
    console.log('[MobileClienteList] Limpiando búsqueda');
    const fakeEvent = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLInputElement>;
    onSearchChange(fakeEvent);
  };

  return (
    <>
      {/* Campo de búsqueda mejorado */}
      <div className="relative mb-3">
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Buscar cliente por nombre, código, NIT o teléfono..."
          className="w-full p-2 pl-10 pr-10 bg-tertiary rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
        />
        
        {/* Icono de búsqueda */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 absolute left-3 top-2.5 text-tertiary" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        
        {/* Botón para limpiar búsqueda */}
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-2.5 text-tertiary hover:text-primary transition-colors"
            title="Limpiar búsqueda"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* Indicador de estado de búsqueda */}
        {searchMode && (
          <div className="absolute right-10 top-2.5">
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <div className="h-2 w-2 rounded-full bg-green-500" title="Búsqueda activa"></div>
            )}
          </div>
        )}
      </div>

      {/* Información de búsqueda */}
      {searchMode && searchTerm && (
        <div className="mb-2 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Resultados para: <strong>"{searchTerm}"</strong>
            {filteredClientes.length > 0 && (
              <span className="ml-1">({filteredClientes.length})</span>
            )}
          </p>
        </div>
      )}

      {/* Error de búsqueda */}
      {searchError && (
        <div className="mb-2 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-md">
          <p className="text-xs text-red-700 dark:text-red-300">{searchError}</p>
        </div>
      )}

      {/* Lista de clientes */}
      <div className="bg-secondary rounded-md overflow-hidden flex-1">
        <div className="overflow-y-auto h-full">
          {filteredClientes.length > 0 ? (
            <div className="divide-y divide-[#666666]">
              {filteredClientes.map((cliente, index) => {
                // Si es el último elemento, le asignamos la referencia para el observer
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
                        <h3 className="font-medium text-sm truncate">{cliente.nombre || 'Sin nombre'}</h3>
                        <div className="space-y-0.5 mt-1">
                          <p className="text-xs text-secondary">
                            <span className="font-medium">Código:</span> {cliente.codigo || 'N/A'}
                          </p>
                          {cliente.numeroRegistro && (
                            <p className="text-xs text-secondary">
                              <span className="font-medium">{cliente.tipoDocumento}:</span> {cliente.numeroRegistro}
                            </p>
                          )}
                          {cliente.email && (
                            <p className="text-xs text-secondary truncate">
                              <span className="font-medium">Email:</span> {cliente.email}
                            </p>
                          )}
                          {cliente.telefono && (
                            <p className="text-xs text-secondary">
                              <span className="font-medium">Tel:</span> {cliente.telefono}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedCliente?.id === cliente.id && (
                        <div className="flex items-start ml-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
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
                <div className="p-3 flex justify-center">
                  <div className="flex items-center text-tertiary">
                    <svg className="animate-spin h-4 w-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs">Cargando más clientes...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Estados vacíos mejorados */
            <div className="flex flex-col items-center justify-center h-full text-tertiary p-4">
              {isLoading ? (
                /* Estado de carga */
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm">
                    {searchMode ? 'Buscando...' : 'Cargando clientes...'}
                  </span>
                </div>
              ) : searchTerm ? (
                /* No hay resultados de búsqueda */
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="font-medium mb-2 text-sm">No se encontraron clientes</h3>
                  <p className="text-center text-xs mb-3 max-w-xs">
                    No hay clientes que coincidan con "<strong>{searchTerm}</strong>".
                  </p>
                  <button
                    onClick={() => onCreateNewClient()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-xs"
                  >
                    Crear "{searchTerm}"
                  </button>
                </>
              ) : (
                /* Lista vacía */
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="font-medium mb-2 text-sm">No hay clientes</h3>
                  <p className="text-center text-xs mb-3">
                    Aún no tienes clientes registrados.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={onCreateNewClient}
          className="flex-1 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors duration-200"
        >
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm">Crear Nuevo Cliente</span>
          </div>
        </button>
      </div>
    </>
  );
};