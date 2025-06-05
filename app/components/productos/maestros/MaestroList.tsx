import React from 'react';

interface MaestroItem {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion?: string;
}

interface MaestroListProps<T extends MaestroItem> {
  items: T[];
  filteredItems: T[];
  selectedItem: T | null;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectItem: (item: T) => void;
  onCreateNew: () => void;
  isLoading: boolean;
  entityName: string; // "Tipo", "Categoría", "Marca"
}

export function MaestroList<T extends MaestroItem>({
  items,
  filteredItems,
  selectedItem,
  searchTerm,
  onSearchChange,
  onSelectItem,
  onCreateNew,
  isLoading,
  entityName
}: MaestroListProps<T>) {
  
  // Limpiar búsqueda
  const handleClearSearch = () => {
    const fakeEvent = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLInputElement>;
    onSearchChange(fakeEvent);
  };

  return (
    <>
      {/* Campo de búsqueda */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={`Buscar ${entityName.toLowerCase()} por código o nombre...`}
          className="w-full p-2 pl-4 pr-10 bg-tertiary rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
        />
        
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
      </div>
      
      {/* Lista de elementos */}
      <div className="bg-secondary rounded-md overflow-hidden flex-1">
        <div className="overflow-y-auto h-full">
          {filteredItems.length > 0 ? (
            <div className="divide-y divide-[#888888]">
              {filteredItems.map((item) => (
                <div
                  key={`${item.id}-${item.codigo}`}
                  onClick={() => onSelectItem(item)}
                  className={`p-3 hover:bg-[#666666] cursor-pointer transition-colors duration-200 ${
                    selectedItem?.id === item.id ? 'bg-[#666666]' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{item.nombre}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.activo 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {item.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-secondary">
                          <span className="font-medium">Código:</span> {item.codigo || 'N/A'}
                        </p>
                        {item.descripcion && (
                          <p className="text-sm text-secondary truncate">
                            <span className="font-medium">Descripción:</span> {item.descripcion}
                          </p>
                        )}
                        {item.fechaCreacion && (
                          <p className="text-xs text-tertiary">
                            Creado: {new Date(item.fechaCreacion).toLocaleDateString('es-SV')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {selectedItem?.id === item.id && (
                      <div className="flex items-start ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Indicador de carga */}
              {isLoading && (
                <div className="p-4 flex justify-center">
                  <div className="flex items-center text-tertiary">
                    <svg className="animate-spin h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Cargando...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Estados vacíos */
            <div className="flex flex-col items-center justify-center h-full text-tertiary p-4">
              {searchTerm ? (
                /* No hay resultados de búsqueda */
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No se encontraron resultados</h3>
                  <p className="text-center text-sm mb-4 max-w-md">
                    No hay {entityName.toLowerCase()}s que coincidan con "<strong>{searchTerm}</strong>".
                  </p>
                  <button
                    onClick={onCreateNew}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm"
                  >
                    Crear {entityName} "{searchTerm}"
                  </button>
                </>
              ) : (
                /* Lista vacía */
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No hay {entityName.toLowerCase()}s</h3>
                  <p className="text-center text-sm mb-4">
                    Aún no tienes {entityName.toLowerCase()}s registrados. Crea el primer {entityName.toLowerCase()} para comenzar.
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
          onClick={onCreateNew}
          className="flex-1 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors duration-200"
        >
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Nuevo {entityName}
          </div>
        </button>
      </div>
    </>
  );
}