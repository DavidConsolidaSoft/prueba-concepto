import React from 'react';
import { MobileClienteFormActionsProps } from './types';

export const MobileClienteFormActions = ({
  mode,
  editMode,
  onCancelEdit,
  onSaveChanges,
  onShowList,
  onConfirmSelection,
  onDeleteCliente
}: MobileClienteFormActionsProps) => {
  return (
    <div className="mt-3 flex gap-2">
      {editMode ? (
        <>
          <button
            onClick={onCancelEdit}
            className="flex-1 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors duration-200 text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onSaveChanges}
            className="flex-1 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            {mode === 'create' ? 'Crear Cliente' : 'Guardar Cambios'}
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onShowList}
            className="flex-1 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors duration-200 text-sm"
          >
            Lista de Clientes
          </button>
          
          {mode === 'view' && onDeleteCliente && (
            <button
              onClick={onDeleteCliente}
              className="flex-1 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200 text-sm"
            >
              Eliminar
            </button>
          )}
          
          <button
            onClick={onConfirmSelection}
            className="flex-1 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            Usar este Cliente
          </button>
        </>
      )}
    </div>
  );
};