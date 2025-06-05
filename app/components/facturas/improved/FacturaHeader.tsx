interface FacturaHeaderProps {
  onCreateFactura?: () => void;
}

export function FacturaHeader({ onCreateFactura }: FacturaHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        Facturas
      </h1>
      
      {onCreateFactura && (
        <button
          onClick={onCreateFactura}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Nueva Factura</span>
        </button>
      )}
    </div>
  );
}