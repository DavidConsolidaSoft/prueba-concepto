import React from 'react';

interface MaestroItem {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion?: string;
}

// Header del formulario
interface MaestroFormHeaderProps {
  mode: 'view' | 'edit' | 'create';
  entityName: string;
  onListView: () => void;
  onCreateNew: () => void;
  onRequestUnlock: () => void;
}

export const MaestroFormHeader = ({ 
  mode, 
  entityName, 
  onListView, 
  onCreateNew, 
  onRequestUnlock 
}: MaestroFormHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">
        {mode === 'view' ? `Información del ${entityName}` :
         mode === 'edit' ? `Editar ${entityName}` : `Crear Nuevo ${entityName}`}
      </h3>
      <div className="flex items-center gap-2">
        {/* Botón para volver a la lista */}
        <button
          onClick={onListView}
          className="p-2 rounded-md hover:bg-secondary text-secondary hover:text-primary transition-colors"
          title={`Ver lista de ${entityName.toLowerCase()}s`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </button>
       
        {/* Botón para crear nuevo */}
        <button
          onClick={onCreateNew}
          className="p-2 rounded-md hover:bg-secondary text-secondary hover:text-primary transition-colors"
          title={`Crear Nuevo ${entityName}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
       
        {/* Botón para editar/desbloquear */}
        {mode === 'view' ? (
          <button
            onClick={onRequestUnlock}
            className="p-2 rounded-md hover:bg-secondary text-secondary hover:text-primary transition-colors"
            title="Desbloquear para editar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </button>
        ) : (
          <div className="text-xs text-green-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            Modo Edición
          </div>
        )}
      </div>
    </div>
  );
};

// Formulario de datos del maestro
interface MaestroDataFormProps<T extends MaestroItem> {
  item: T;
  editMode: boolean;
  entityName: string;
  onChange: (field: keyof T, value: any) => void;
}

export function MaestroDataForm<T extends MaestroItem>({ 
  item, 
  editMode, 
  entityName, 
  onChange 
}: MaestroDataFormProps<T>) {
  const handleInputChange = (field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(field, e.target.value);
  };

  const handleCheckboxChange = (field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange(field, e.target.checked);
  };

  return (
    <div className="bg-secondary rounded-lg p-4 mb-4">
      <h4 className="text-md font-semibold mb-3">Información del {entityName}</h4>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <label className="block text-sm text-secondary mb-1">Código:</label>
          <input
            type="text"
            value={item.codigo || ''}
            onChange={handleInputChange('codigo' as keyof T)}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              editMode ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!editMode || (item.id > 0)} // No permitir editar código si es existente
            placeholder={`Código del ${entityName.toLowerCase()}`}
          />
        </div>
        
        <div>
          <label className="block text-sm text-secondary mb-1">Nombre:</label>
          <input
            type="text"
            value={item.nombre || ''}
            onChange={handleInputChange('nombre' as keyof T)}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              editMode ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!editMode}
            placeholder={`Nombre del ${entityName.toLowerCase()}`}
            required
          />
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm text-secondary mb-1">Descripción:</label>
          <textarea
            value={item.descripcion || ''}
            onChange={handleInputChange('descripcion' as keyof T)}
            rows={3}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none ${
              editMode ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!editMode}
            placeholder={`Descripción del ${entityName.toLowerCase()}`}
          />
        </div>
        
        <div className="col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              checked={item.activo}
              onChange={handleCheckboxChange('activo' as keyof T)}
              className="mr-2 h-4 w-4 text-blue-600 bg-tertiary border-secondary rounded focus:ring-blue-500 focus:ring-2"
              disabled={!editMode}
            />
            <label htmlFor="activo" className="text-sm text-primary">
              {entityName} activo
            </label>
          </div>
        </div>
        
        {item.fechaCreacion && (
          <div className="col-span-2">
            <label className="block text-sm text-secondary mb-1">Fecha de Creación:</label>
            <input
              type="text"
              value={new Date(item.fechaCreacion).toLocaleDateString('es-SV')}
              className="w-full p-2 rounded-md text-primary bg-primary"
              disabled
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Botones de acción del formulario
interface MaestroFormActionsProps {
  mode: 'list' | 'view' | 'edit' | 'create';
  editMode: boolean;
  entityName: string;
  onCancelEdit: () => void;
  onSaveChanges: () => void;
  onShowList: () => void;
  onConfirmSelection: () => void;
  onDelete?: () => void;
}

export const MaestroFormActions = ({
  mode,
  editMode,
  entityName,
  onCancelEdit,
  onSaveChanges,
  onShowList,
  onConfirmSelection,
  onDelete
}: MaestroFormActionsProps) => {
  return (
    <div className="mt-4 flex gap-2">
      {editMode ? (
        <>
          <button
            onClick={onCancelEdit}
            className="flex-1 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onSaveChanges}
            className="flex-1 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            {mode === 'create' ? `Crear ${entityName}` : 'Guardar Cambios'}
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onShowList}
            className="flex-1 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors duration-200"
          >
            Lista de {entityName}s
          </button>
         
          {mode === 'view' && onDelete && (
            <button
              onClick={onDelete}
              className="flex-1 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200"
            >
              Eliminar {entityName}
            </button>
          )}
         
          <button
            onClick={onConfirmSelection}
            className="flex-1 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            Usar este {entityName}
          </button>
        </>
      )}
    </div>
  );
};