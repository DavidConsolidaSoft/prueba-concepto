import React from 'react';
import { AlertModalProps } from './types';

export const MobileAlertModal = ({ isOpen, onClose, onConfirm, title, message }: AlertModalProps) => {
  if (!isOpen) return null;

  // Detectar el tipo de alerta para estilizar los botones
  const isDeleteAlert = title.toLowerCase().includes('eliminar');
  const isConfirmationAlert = title.toLowerCase().includes('confirmar');
  
  const getButtonColor = () => {
    if (isDeleteAlert) return 'bg-red-600 hover:bg-red-700';
    if (isConfirmationAlert) return 'bg-blue-600 hover:bg-blue-700';
    return 'bg-blue-600 hover:bg-blue-700';
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/60 z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div
        className="bg-tertiary/90 border border-[#555555] rounded-lg shadow-xl w-full max-w-md
                  transition-all duration-300 transform scale-100 animate-fadeIn"
      >
        <div className="p-4 border-b border-[#444444]">
          <h3 className="text-lg font-semibold text-primary">{title}</h3>
        </div>
        <div className="p-4">
          <p className="text-primary text-sm">{message}</p>
        </div>
        <div className="flex justify-end p-4 border-t border-[#444444]">
          <button
            onClick={onClose}
            className="bg-secondary text-primary px-4 py-2 rounded-md hover:bg-[#666666] transition-colors duration-200 mr-2 text-sm"
          >
            {title.toLowerCase().includes('confirmar') ? 'Cancelar' : 'No'}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`${getButtonColor()} text-white px-4 py-2 rounded-md transition-colors duration-200 text-sm`}
          >
            {title.toLowerCase().includes('confirmar') ? 'Confirmar' : 'Sí'}
          </button>
        </div>
      </div>
    </div>
  );
};