import { useState, useCallback, useMemo } from 'react';

export type FacturaStatus = 'all' | 'open' | 'closed' | 'void';
export type DateRange = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

export interface FacturaFilters {
  status: FacturaStatus;
  dateRange: DateRange;
  startDate?: Date;
  endDate?: Date;
}

const DEFAULT_FILTERS: FacturaFilters = {
  status: 'open',
  dateRange: 'today'
};

export function useFacturaFilters() {
  const [filters, setFilters] = useState<FacturaFilters>(DEFAULT_FILTERS);
  const [searchTerm, setSearchTerm] = useState('');

  const updateFilter = useCallback(<K extends keyof FacturaFilters>(
    key: K, 
    value: FacturaFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchTerm('');
  }, []);

  const hasActiveFilters = useMemo(() => {
    return searchTerm.trim() !== '' || 
           filters.status !== DEFAULT_FILTERS.status ||
           filters.dateRange !== DEFAULT_FILTERS.dateRange;
  }, [searchTerm, filters]);

  return {
    filters,
    searchTerm,
    updateFilter,
    updateSearchTerm,
    clearAllFilters,
    hasActiveFilters
  };
}