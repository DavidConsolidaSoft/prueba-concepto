import { useEffect, useRef, useCallback } from 'react';
import FacturaService, { FacturaListItem } from '@/lib/api/facturaService';

interface FacturaGridProps {
  facturas: FacturaListItem[];
  selectedFacturaId: string | null;
  onSelectFactura: (id: string) => void;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  totalCount: number;
  isMobile: boolean;
}

export function FacturaGrid({
  facturas,
  selectedFacturaId,
  onSelectFactura,
  loading,
  hasMore,
  onLoadMore,
  totalCount,
  isMobile
}: FacturaGridProps) {
  const observerRef = useRef<IntersectionObserver>();

  // Intersection Observer para infinite scroll
  const lastFacturaElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, onLoadMore]);

  if (facturas.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No hay facturas</h3>
          <p className="text-gray-500 dark:text-gray-400">No se encontraron facturas con los filtros seleccionados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {facturas.map((factura, index) => {
          const isLast = index === facturas.length - 1;
          const isSelected = selectedFacturaId === factura.factura.toString();
          
          return (
            <div
              key={`${factura.factura}-${factura.numedocu}`}
              ref={isLast ? lastFacturaElementRef : null}
              onClick={() => onSelectFactura(factura.factura.toString())}
              className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
              }`}
            >
              <FacturaCard factura={factura} isMobile={isMobile} />
            </div>
          );
        })}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="p-4 flex justify-center">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Cargando más facturas...</span>
          </div>
        </div>
      )}

      {/* Results counter */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
        Mostrando {facturas.length} de {totalCount} facturas
      </div>
    </div>
  );
}

// Componente FacturaCard incluido
interface FacturaCardProps {
  factura: FacturaListItem;
  isMobile: boolean;
}

function FacturaCard({ factura, isMobile }: FacturaCardProps) {
  const statusColors = {
    'Abierta': 'text-green-600 bg-green-100',
    'Cerrada': 'text-blue-600 bg-blue-100',
    'Nula': 'text-red-600 bg-red-100'
  };

  return (
    <div className="space-y-2">
      {/* Cliente */}
      <div className="font-semibold text-gray-900 dark:text-white">
        {factura.nombre_cliente?.trim() || 'Sin nombre'}
      </div>
      
      {/* Número y monto */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600 dark:text-gray-400">
          {factura.numedocu?.trim()}
        </span>
        <span className="font-bold text-gray-900 dark:text-white">
          {FacturaService.formatMoneda(factura.monto_total)}
        </span>
      </div>
      
      {/* Vendedor y fecha */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          {factura.nombre_vendedor?.trim() || 'Sin vendedor'}
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {FacturaService.formatFecha(factura.fecha)}
        </span>
      </div>
      
      {/* Estado */}
      <div className="flex justify-end">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusColors[factura.estado as keyof typeof statusColors] || 'text-gray-600 bg-gray-100'
        }`}>
          {factura.estado}
        </span>
      </div>
    </div>
  );
}