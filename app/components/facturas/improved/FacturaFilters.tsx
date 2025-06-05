import { FacturaFilters, FacturaStatus, DateRange } from '@/app/hooks/useFacturaFilters';

interface FacturaFiltersProps {
  filters: FacturaFilters;
  onFilterChange: <K extends keyof FacturaFilters>(key: K, value: FacturaFilters[K]) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  isMobile: boolean;
}

export function FacturaFilters({ 
  filters, 
  onFilterChange, 
  hasActiveFilters, 
  onClearFilters, 
  isMobile 
}: FacturaFiltersProps) {
  const statusOptions: { value: FacturaStatus; label: string; color: string }[] = [
    { value: 'open', label: 'Abiertas', color: 'text-green-600 border-green-200 bg-green-50' },
    { value: 'closed', label: 'Cerradas', color: 'text-blue-600 border-blue-200 bg-blue-50' },
    { value: 'void', label: 'Nulas', color: 'text-red-600 border-red-200 bg-red-50' },
    { value: 'all', label: 'Todas', color: 'text-gray-600 border-gray-200 bg-gray-50' }
  ];

  const dateOptions: { value: DateRange; label: string }[] = [
    { value: 'today', label: 'Hoy' },
    { value: 'yesterday', label: 'Ayer' },
    { value: 'week', label: '7 días' },
    { value: 'month', label: '30 días' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Filtros de estado */}
      <div className="flex overflow-x-auto">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onFilterChange('status', option.value)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              filters.status === option.value
                ? `${option.color} border-current`
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Filtros de fecha */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700">
        <div className="flex flex-wrap gap-2">
          {dateOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange('dateRange', option.value)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filters.dateRange === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
              }`}
            >
              {option.label}
            </button>
          ))}
          
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="ml-auto px-3 py-1 text-xs text-red-600 hover:text-red-800 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
}