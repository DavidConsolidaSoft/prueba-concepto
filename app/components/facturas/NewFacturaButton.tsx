'use client';

interface NewFacturaButtonProps {
  onClick: () => void;
  variant?: 'full' | 'icon'; // Nueva prop para controlar el estilo
}

export default function NewFacturaButton({ onClick, variant = 'full' }: NewFacturaButtonProps) {
  if (variant === 'icon') {
    return (
      <button
        onClick={onClick}
        className="bg-blue-600 hover:bg-blue-700 text-primary p-2 rounded-md transition-colors duration-200"
        title="Crear nueva factura"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="mt-6 bg-blue-600 hover:bg-blue-700 text-primary py-2 px-4 rounded-md flex items-center justify-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Crear Nueva Factura
    </button>
  );
}