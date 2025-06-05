// hooks/useClienteSearch.ts (VERSIÓN CORREGIDA)
import { useState, useEffect, useCallback, useRef } from 'react';
import { Cliente } from '@/app/components/facturas/cliente/types';
import ClienteService from '@/lib/api/clienteService';

interface UseClienteSearchResult {
  searchTerm: string;
  searchResults: Cliente[];
  isSearching: boolean;
  searchMode: boolean;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  searchError: string | null;
}

export function useClienteSearch(): UseClienteSearchResult {
  // Estados principales
  const [searchTerm, setSearchTermState] = useState('');
  const [searchResults, setSearchResults] = useState<Cliente[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Referencias para control
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentSearchRef = useRef<string>('');
  
  // Constantes
  const SEARCH_DELAY = 300; // ms
  const MIN_SEARCH_LENGTH = 2;

  // Ejecutar búsqueda real
  const executeSearch = useCallback(async (term: string) => {
    const trimmedTerm = term.trim();
    
    console.log(`[useClienteSearch] Ejecutando búsqueda para: "${trimmedTerm}"`);
    
    // Si el término está vacío o es muy corto
    if (!trimmedTerm || trimmedTerm.length < MIN_SEARCH_LENGTH) {
      console.log(`[useClienteSearch] Término muy corto, limpiando resultados`);
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
      console.log(`[useClienteSearch] Llamando a ClienteService.searchClientes con: "${trimmedTerm}"`);
      
      const results = await ClienteService.searchClientes(trimmedTerm);
      
      console.log(`[useClienteSearch] Resultados recibidos:`, results);
      
      // Verificar que la búsqueda sigue siendo relevante
      if (currentSearchRef.current === trimmedTerm) {
        setSearchResults(results);
        console.log(`[useClienteSearch] Resultados aplicados: ${results.length} clientes`);
      } else {
        console.log(`[useClienteSearch] Búsqueda cancelada - término cambió`);
      }
    } catch (error) {
      console.error('[useClienteSearch] Error en búsqueda:', error);
      
      // Solo mostrar error si la búsqueda sigue siendo relevante
      if (currentSearchRef.current === trimmedTerm) {
        setSearchError('Error al buscar clientes');
        setSearchResults([]);
      }
    } finally {
      // Solo actualizar loading si la búsqueda sigue siendo relevante
      if (currentSearchRef.current === trimmedTerm) {
        setIsSearching(false);
      }
    }
  }, []);

  // Manejar cambios en el término de búsqueda
  const setSearchTerm = useCallback((term: string) => {
    console.log(`[useClienteSearch] setSearchTerm llamado con: "${term}"`);
    
    setSearchTermState(term);
    
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    const trimmedTerm = term.trim();

    // Si el término está vacío, limpiar inmediatamente
    if (!trimmedTerm) {
      console.log(`[useClienteSearch] Término vacío, limpiando estado`);
      setSearchResults([]);
      setSearchMode(false);
      setSearchError(null);
      setIsSearching(false);
      currentSearchRef.current = '';
      return;
    }

    // Si el término es muy corto, no buscar todavía
    if (trimmedTerm.length < MIN_SEARCH_LENGTH) {
      console.log(`[useClienteSearch] Término muy corto (${trimmedTerm.length} chars), esperando...`);
      setSearchResults([]);
      setSearchMode(false);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    // Configurar timeout para búsqueda
    console.log(`[useClienteSearch] Configurando timeout para búsqueda en ${SEARCH_DELAY}ms`);
    searchTimeoutRef.current = setTimeout(() => {
      executeSearch(trimmedTerm);
    }, SEARCH_DELAY);
  }, [executeSearch]);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    console.log('[useClienteSearch] Limpiando búsqueda');
    
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
    console.log(`[useClienteSearch] Estado actualizado:`, {
      searchTerm,
      searchMode,
      isSearching,
      resultsCount: searchResults.length,
      searchError
    });
  }, [searchTerm, searchMode, isSearching, searchResults.length, searchError]);

  return {
    searchTerm,
    searchResults,
    isSearching,
    searchMode,
    setSearchTerm,
    clearSearch,
    searchError
  };
}