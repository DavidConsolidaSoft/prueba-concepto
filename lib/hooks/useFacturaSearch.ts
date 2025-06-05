// hooks/useFacturaSearch.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import FacturaService, { FacturaListItem } from '@/lib/api/facturaService';

interface UseFacturaSearchParams {
  estado?: 'abiertas' | 'cerradas' | 'nulas' | 'todas';
  fechaInicio?: Date;
  fechaFin?: Date;
}

interface UseFacturaSearchResult {
  searchTerm: string;
  searchResults: FacturaListItem[];
  isSearching: boolean;
  searchMode: boolean;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  searchError: string | null;
  updateSearchContext: (params: UseFacturaSearchParams) => void;
}

export function useFacturaSearch(): UseFacturaSearchResult {
  // Estados principales
  const [searchTerm, setSearchTermState] = useState('');
  const [searchResults, setSearchResults] = useState<FacturaListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // NUEVO: Estado para mantener el contexto de los filtros
  const [searchContext, setSearchContext] = useState<UseFacturaSearchParams>({
    estado: 'todas',
    fechaInicio: new Date(),
    fechaFin: new Date()
  });
  
  // Referencias para control
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentSearchRef = useRef<string>('');
  
  // Constantes
  const SEARCH_DELAY = 300; // ms
  const MIN_SEARCH_LENGTH = 2;

  // NUEVO: Función para actualizar el contexto de búsqueda
  const updateSearchContext = useCallback((params: UseFacturaSearchParams) => {
    console.log('[useFacturaSearch] Actualizando contexto de búsqueda:', params);
    setSearchContext(params);
    
    // Si hay una búsqueda activa, re-ejecutarla con el nuevo contexto
    if (searchMode && searchTerm.trim().length >= MIN_SEARCH_LENGTH) {
      executeSearch(searchTerm.trim(), params);
    }
  }, [searchMode, searchTerm]);

  // Ejecutar búsqueda real - MODIFICADO para incluir contexto
  const executeSearch = useCallback(async (term: string, context?: UseFacturaSearchParams) => {
    const trimmedTerm = term.trim();
    const currentContext = context || searchContext;
    
    console.log(`[useFacturaSearch] Ejecutando búsqueda:`, {
      term: trimmedTerm,
      contexto: currentContext
    });
    
    // Si el término está vacío o es muy corto
    if (!trimmedTerm || trimmedTerm.length < MIN_SEARCH_LENGTH) {
      console.log(`[useFacturaSearch] Término muy corto, limpiando resultados`);
      setSearchResults([]);
      setSearchMode(false);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    // Marcar como búsqueda activa
    setIsSearching(true);
    setSearchError(null);
    setSearchMode(true);
    currentSearchRef.current = trimmedTerm;

    try {
      // Usar el endpoint principal con parámetros de búsqueda Y contexto
      const results = await FacturaService.getFacturas({
        search: trimmedTerm,
        estado: currentContext.estado,
        fecha_inicio: currentContext.fechaInicio,
        fecha_fin: currentContext.fechaFin,
        page: 1,
        size: 50 // Aumentar para obtener más resultados
      });
      
      console.log(`[useFacturaSearch] Resultados recibidos:`, {
        total: results.total,
        items: results.items.length,
        contexto: currentContext
      });
      
      // Verificar que la búsqueda sigue siendo relevante
      if (currentSearchRef.current === trimmedTerm) {
        setSearchResults(results.items);
        console.log(`[useFacturaSearch] Resultados aplicados: ${results.items.length} facturas`);
      } else {
        console.log(`[useFacturaSearch] Búsqueda cancelada - término cambió`);
      }
    } catch (error) {
      console.error('[useFacturaSearch] Error en búsqueda:', error);
      
      // Solo mostrar error si la búsqueda sigue siendo relevante
      if (currentSearchRef.current === trimmedTerm) {
        setSearchError('Error al buscar facturas');
        setSearchResults([]);
      }
    } finally {
      // Solo actualizar loading si la búsqueda sigue siendo relevante
      if (currentSearchRef.current === trimmedTerm) {
        setIsSearching(false);
      }
    }
  }, [searchContext]);

  // Manejar cambios en el término de búsqueda
  const setSearchTerm = useCallback((term: string) => {
    console.log(`[useFacturaSearch] setSearchTerm llamado con: "${term}"`);
    
    setSearchTermState(term);
    
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    const trimmedTerm = term.trim();

    // Si el término está vacío, limpiar inmediatamente
    if (!trimmedTerm) {
      console.log(`[useFacturaSearch] Término vacío, limpiando estado`);
      setSearchResults([]);
      setSearchMode(false);
      setSearchError(null);
      setIsSearching(false);
      currentSearchRef.current = '';
      return;
    }

    // Si el término es muy corto, no buscar todavía
    if (trimmedTerm.length < MIN_SEARCH_LENGTH) {
      console.log(`[useFacturaSearch] Término muy corto (${trimmedTerm.length} chars), esperando...`);
      setSearchResults([]);
      setSearchMode(false);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    // Configurar timeout para búsqueda
    console.log(`[useFacturaSearch] Configurando timeout para búsqueda en ${SEARCH_DELAY}ms`);
    searchTimeoutRef.current = setTimeout(() => {
      executeSearch(trimmedTerm);
    }, SEARCH_DELAY);
  }, [executeSearch]);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    console.log('[useFacturaSearch] Limpiando búsqueda');
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    setSearchTermState('');
    setSearchResults([]);
    setSearchMode(false);
    setSearchError(null);
    setIsSearching(false);
    currentSearchRef.current = '';
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Debug: Log cambios de estado importantes
  useEffect(() => {
    console.log(`[useFacturaSearch] Estado actualizado:`, {
      searchTerm,
      searchMode,
      isSearching,
      resultsCount: searchResults.length,
      searchError,
      contexto: searchContext
    });
  }, [searchTerm, searchMode, isSearching, searchResults.length, searchError, searchContext]);

  return {
    searchTerm,
    searchResults,
    isSearching,
    searchMode,
    setSearchTerm,
    clearSearch,
    searchError,
    updateSearchContext
  };
}