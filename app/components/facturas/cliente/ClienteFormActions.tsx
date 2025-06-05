import React from 'react';
import { ClienteFormActionsProps } from './types';

export const ClienteFormActions = ({
  mode,
  editMode,
  onCancelEdit,
  onSaveChanges,
  onShowList,
  onConfirmSelection,
  onDeleteCliente
}: ClienteFormActionsProps) => {
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
            {mode === 'create' ? 'Crear Cliente' : 'Guardar Cambios'}
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onShowList}
            className="flex-1 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors duration-200"
          >
            Lista de Clientes
          </button>
          
          {mode === 'view' && onDeleteCliente && (
            <button
              onClick={onDeleteCliente}
              className="flex-1 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200"
            >
              Eliminar Cliente
            </button>
          )}
          
          <button
            onClick={onConfirmSelection}
            className="flex-1 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            Usar este Cliente
          </button>
        </>
      )}
    </div>
  );
};