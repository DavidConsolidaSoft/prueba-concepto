// ui/AlertModal.tsx
import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-secondary border border-primary rounded-lg shadow-xl w-full max-w-md 
                      transition-all duration-300 transform scale-100 animate-fadeIn">
        <div className="p-4 border-b border-primary">
          <h3 className="text-xl font-semibold text-primary">{title}</h3>
        </div>
        <div className="p-4">
          <p className="text-primary">{message}</p>
        </div>
        <div className="flex justify-end p-4 border-t border-primary">
          <button
            onClick={onClose}
            className="bg-primary text-primary px-4 py-2 rounded-md hover:bg-tertiary transition-colors duration-200 mr-2"
          >
            {title === 'Confirmar Guardado' ? 'Cancelar' : 'No'}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            {title === 'Confirmar Guardado' ? 'Guardar' : 'Sí'}
          </button>
        </div>
      </div>
    </div>
  );
};