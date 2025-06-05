// ui/Modal.tsx
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div
        className="bg-secondary border border-primary rounded-lg shadow-xl w-full max-w-md
                  transition-all duration-300 transform scale-100 animate-fadeIn"
      >
        <div className="p-4 border-b border-primary">
          <h3 className="text-xl font-semibold text-primary">{title}</h3>
        </div>
        <div className="p-4">
          {children}
        </div>
        <div className="flex justify-end p-4 border-t border-primary">
          <button
            onClick={onClose}
            className="bg-primary text-primary px-4 py-2 rounded-md hover:bg-tertiary transition-colors duration-200 mr-2"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};