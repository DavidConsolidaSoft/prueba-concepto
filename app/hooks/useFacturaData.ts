import { useState, useEffect, useCallback, useRef } from 'react';
import FacturaService, { FacturaListItem } from '@/lib/api/facturaService';
import { FacturaFilters } from './useFacturaFilters';

const PAGE_SIZE = 50;

export function useFacturaData(filters: FacturaFilters, searchTerm: string) {
  const [facturas, setFacturas] = useState<FacturaListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Evitar requests duplicados
  const abortController = useRef<AbortController>();

  const buildApiParams = useCallback(() => {
    const params: any = {
      page: currentPage,
      size: PAGE_SIZE
    };

    // Estado
    if (filters.status === 'open') params.estado = 'abiertas';
    else if (filters.status === 'closed') params.estado = 'cerradas';
    else if (filters.status === 'void') params.estado = 'nulas';
    else params.estado = 'todas';

    // Fechas
    const dateRange = getDateRange(filters.dateRange, filters.startDate, filters.endDate);
    if (dateRange) {
      params.fecha_inicio = dateRange.start;
      params.fecha_fin = dateRange.end;
    }

    // Búsqueda
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    return params;
  }, [filters, searchTerm, currentPage]);

  const loadFacturas = useCallback(async (isLoadMore = false) => {
    // Cancelar request anterior
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const params = buildApiParams();
      if (isLoadMore) {
        params.page = currentPage + 1;
      } else {
        params.page = 1;
      }

      const response = await FacturaService.getFacturas(params);
      
      if (isLoadMore) {
        setFacturas(prev => [...prev, ...response.items]);
        setCurrentPage(prev => prev + 1);
      } else {
        setFacturas(response.items);
        setCurrentPage(1);
      }

      setTotalCount(response.total);
      setHasMore(response.page < response.pages);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Error al cargar las facturas');
        console.error('Error cargando facturas:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [buildApiParams, currentPage]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadFacturas(true);
    }
  }, [loading, hasMore, loadFacturas]);

  const retry = useCallback(() => {
    loadFacturas(false);
  }, [loadFacturas]);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadFacturas(false);
    }, searchTerm ? 300 : 0); // Debounce para búsqueda

    return () => clearTimeout(timeoutId);
  }, [filters, searchTerm]); // No incluir loadFacturas para evitar loops

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return {
    facturas,
    loading,
    error,
    totalCount,
    hasMore,
    loadMore,
    retry
  };
}

// Utility function para rangos de fechas
function getDateRange(range: string, startDate?: Date, endDate?: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (range) {
    case 'today':
      return {
        start: new Date(today),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return {
        start: yesterday,
        end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 6);
      return {
        start: weekStart,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    
    case 'month':
      const monthStart = new Date(today);
      monthStart.setDate(today.getDate() - 29);
      return {
        start: monthStart,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    
    case 'custom':
      if (startDate && endDate) {
        return {
          start: startDate,
          end: new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      }
      return null;
    
    default:
      return null;
  }
}