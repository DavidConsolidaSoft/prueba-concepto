import React from 'react';
import { ClienteFormHeaderProps } from './types';

export const ClienteFormHeader = ({ mode, onListView, onCreateNew, onRequestUnlock }: ClienteFormHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">
        {mode === 'view' ? 'Información del Cliente' :
         mode === 'edit' ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
      </h3>
      <div className="flex items-center gap-2">
        {/* Botón para volver a la lista */}
        <button
          onClick={onListView}
          className="p-2 rounded-md hover:bg-secondary text-secondary hover:text-primary transition-colors"
          title="Ver lista de clientes"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-users">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </button>
       
        {/* Botón para crear nuevo cliente */}
        <button
          onClick={onCreateNew}
          className="p-2 rounded-md hover:bg-secondary text-secondary hover:text-primary transition-colors"
          title="Crear Nuevo Cliente"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user-plus">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
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