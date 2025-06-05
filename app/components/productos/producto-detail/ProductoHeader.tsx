import React from 'react';
import { Producto } from './productoTypes';

interface ProductoHeaderProps {
  producto: Producto;
  isCreatingInternal: boolean;
  isEditable: boolean;
  isMobile: boolean;
  onBackClick: () => void;
  onSaveProducto: () => void;
  onLockToggle: () => void;
  onDuplicateProducto: () => void;
}

export const ProductoHeader: React.FC<ProductoHeaderProps> = ({
  producto,
  isCreatingInternal,
  isEditable,
  isMobile,
  onBackClick,
  onSaveProducto,
  onLockToggle,
  onDuplicateProducto
}) => {
  if (isMobile) {
    return (
      <div className="flex items-center justify-between mb-4 pl-2">
        <div className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2 cursor-pointer" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            onClick={onBackClick}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          <h2 className="text-xl font-semibold">
            {isCreatingInternal ? 'Nuevo Producto' : producto.codigo}
          </h2>
        </div>
        <div className="flex space-x-2">
          {isCreatingInternal ? (
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-primary px-3 py-1 rounded-md text-xs"
              onClick={onSaveProducto}
            >
              Guardar Producto
            </button>
          ) : (
            <>
              {isEditable && (
                <button 
                  className="text-primary p-2 rounded"
                  onClick={onSaveProducto}
                  title="Guardar cambios"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}
              <button 
                className="text-primary p-2 rounded"
                onClick={onLockToggle}
                title={isEditable ? "Finalizar edición" : "Editar producto"}
              >
                {isEditable ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </button>
              <button 
                className="text-primary p-2 rounded"
                onClick={onDuplicateProducto}
                title="Duplicar producto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">
        {isCreatingInternal ? 'Nuevo Producto' : `${producto.codigo} - ${producto.nombre}`}
      </h2>
      <div className="flex space-x-4">
        {isCreatingInternal ? (
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-primary px-4 py-2 rounded-md text-sm flex items-center"
            onClick={onSaveProducto}
            title="Guardar producto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Guardar Producto
          </button>
        ) : (
          <>
            {isEditable && (
              <button 
                className="text-primary"
                onClick={onSaveProducto}
                title="Guardar cambios"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
            <button 
              className="text-primary"
              onClick={onLockToggle}
              title={isEditable ? "Finalizar edición" : "Editar producto"}
            >
              {isEditable ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </button>
            <button 
              className="text-primary"
              onClick={onDuplicateProducto}
              title="Duplicar producto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};