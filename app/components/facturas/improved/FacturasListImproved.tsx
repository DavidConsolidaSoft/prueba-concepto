'use client';

import { useState, useEffect } from 'react';
import { FacturaHeader } from './FacturaHeader';
import { FacturaFilters } from './FacturaFilters';
import { FacturaGrid } from './FacturaGrid';
import { FacturaSearch } from './FacturaSearch';
import { useFacturaData } from '@/app/hooks/useFacturaData';
import { useFacturaFilters } from '@/app/hooks/useFacturaFilters';
import { FacturaListItem } from '@/lib/api/facturaService';

interface FacturasListProps {
  onSelectFactura: (id: string) => void;
  selectedFacturaId: string | null;
  onCreateFactura?: () => void;
}

export default function FacturasListImproved({ 
  onSelectFactura, 
  selectedFacturaId, 
  onCreateFactura 
}: FacturasListProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Hooks personalizados para separar responsabilidades
  const {
    filters,
    searchTerm,
    updateFilter,
    updateSearchTerm,
    clearAllFilters,
    hasActiveFilters
  } = useFacturaFilters();

  const {
    facturas,
    loading,
    error,
    totalCount,
    hasMore,
    loadMore,
    retry
  } = useFacturaData(filters, searchTerm);

  // Detectar vista móvil
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Estados de carga y error
  if (loading && facturas.length === 0) {
    return <LoadingState />;
  }

  if (error && facturas.length === 0) {
    return <ErrorState error={error} onRetry={retry} />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header fijo */}
      <FacturaHeader onCreateFactura={onCreateFactura} />
      
      {/* Búsqueda */}
      <FacturaSearch
        searchTerm={searchTerm}
        onSearchChange={updateSearchTerm}
        isMobile={isMobile}
      />
      
      {/* Filtros */}
      <FacturaFilters
        filters={filters}
        onFilterChange={updateFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
        isMobile={isMobile}
      />
      
      {/* Grid de facturas */}
      <FacturaGrid
        facturas={facturas}
        selectedFacturaId={selectedFacturaId}
        onSelectFactura={onSelectFactura}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        totalCount={totalCount}
        isMobile={isMobile}
      />
    </div>
  );
}

// Componentes de estado
const LoadingState = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Cargando facturas...</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-red-600 mb-4">{error}</p>
      <button 
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Reintentar
      </button>
    </div>
  </div>
);