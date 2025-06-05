'use client';
import { useState, useEffect, useCallback } from 'react';
import { Cliente, ClienteSelectorProps, CLIENTE_VACIO } from './types';
import { AlertModal } from './AlertModal';
import { ClienteList } from './ClienteList';
import { ClienteFormHeader } from './ClienteFormHeader';
import { ClienteDataForm } from './ClienteDataForm';
import { ClienteAddressForm } from './ClienteAddressForm';
import { ClienteFiscalAttributes } from './ClienteFiscalAttributes';
import { ClienteFormActions } from './ClienteFormActions';
import { Toast } from '../ui/Toast';
import { useClienteSearch } from '@/lib/hooks/useClienteSearch';
import ClienteService from '@/lib/api/clienteService';

export default function ClienteSelector({ 
  onClose, 
  onClienteSelected, 
  clienteActual, 
  isEdition = false 
}: ClienteSelectorProps) {
  // Estados principales
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(clienteActual || null);
  const [editMode, setEditMode] = useState(false);
  const [clienteForm, setClienteForm] = useState<Cliente>(clienteActual || CLIENTE_VACIO);
  const [mode, setMode] = useState<'list' | 'view' | 'edit' | 'create'>(clienteActual ? 'view' : 'list');
  
  // Estados para alertas y notificaciones
  const [showUnlockAlert, setShowUnlockAlert] = useState(false);
  const [showUseNewClienteAlert, setShowUseNewClienteAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [newCreatedCliente, setNewCreatedCliente] = useState<Cliente | null>(null);
  
  // Estados para listado y paginación
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize] = useState(50);

  // Hook personalizado para búsqueda
  const {
    searchTerm,
    searchResults,
    isSearching,
    searchMode,
    setSearchTerm,
    clearSearch,
    searchError
  } = useClienteSearch();

  // Mostrar error de búsqueda como toast
  useEffect(() => {
    if (searchError) {
      setToastType('error');
      setToastMessage(searchError);
      setShowToast(true);
    }
  }, [searchError]);

  // Actualizar lista filtrada basada en modo de búsqueda
  useEffect(() => {
    if (searchMode) {
      console.log(`[ClienteSelector] Modo búsqueda: ${searchResults.length} resultados`);
      setFilteredClientes(searchResults);
    } else {
      console.log(`[ClienteSelector] Modo listado: ${clientes.length} clientes`);
      setFilteredClientes(clientes);
    }
  }, [searchMode, searchResults, clientes]);

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadInitialClientes();
  }, []);
  
  // Cargar clientes iniciales
  const loadInitialClientes = async () => {
    if (searchMode) return; // No cargar si estamos en modo búsqueda
    
    setLoadingClientes(true);
    try {
      console.log('[ClienteSelector] Cargando clientes iniciales...');
      const response = await ClienteService.loadMoreClientes(1, pageSize, true);
      
      const clientesMapeados = response.items.map(cliente => 
        ClienteService.mapApiClienteToUiCliente(cliente)
      );
      
      setClientes(clientesMapeados);
      setHasMore(response.page < response.pages);
      setCurrentPage(1);
      
      console.log(`[ClienteSelector] Cargados ${clientesMapeados.length} clientes iniciales`);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setToastType('error');
      setToastMessage('Error al cargar los clientes. Intente nuevamente.');
      setShowToast(true);
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  };
  
  // Cargar más clientes (lazy loading)
  const loadMoreClientes = useCallback(async () => {
    if (searchMode || !hasMore || loadingClientes) return;
    
    const nextPage = currentPage + 1;
    setLoadingClientes(true);
    
    try {
      console.log(`[ClienteSelector] Cargando página ${nextPage}...`);
      const response = await ClienteService.loadMoreClientes(nextPage, pageSize, true);
      
      const clientesMapeados = response.items.map(cliente => 
        ClienteService.mapApiClienteToUiCliente(cliente)
      );
      
      setClientes(prevClientes => [...prevClientes, ...clientesMapeados]);
      setCurrentPage(nextPage);
      setHasMore(nextPage < response.pages);
      
      console.log(`[ClienteSelector] Añadidos ${clientesMapeados.length} clientes más`);
    } catch (error) {
      console.error('Error al cargar más clientes:', error);
      setToastType('error');
      setToastMessage('Error al cargar más clientes.');
      setShowToast(true);
    } finally {
      setLoadingClientes(false);
    }
  }, [currentPage, hasMore, loadingClientes, pageSize, searchMode]);

  // Manejar cambio en el término de búsqueda
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    console.log(`[ClienteSelector] Cambio en búsqueda: "${newSearchTerm}"`);
    setSearchTerm(newSearchTerm);
  }, [setSearchTerm]);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setClienteForm(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en los checkboxes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setClienteForm(prev => ({ ...prev, [name]: checked }));
  };

  // Seleccionar un cliente
  const handleSelectCliente = async (cliente: Cliente) => {
    console.log(`[ClienteSelector] Seleccionando cliente: ${cliente.nombre} (${cliente.codigo})`);
    setSelectedCliente(cliente);
    
    try {
      // Cargar el detalle completo del cliente
      const clienteDetalle = await ClienteService.getClienteDetalle(cliente.codigo);
      const clienteCompleto = ClienteService.mapApiClienteToUiCliente(clienteDetalle);
      setClienteForm(clienteCompleto);
    } catch (error) {
      console.error('Error al cargar detalle del cliente:', error);
      setClienteForm(cliente);
    }
    
    setMode('view');
  };

  // Confirmar selección de cliente
  const handleConfirmSelection = () => {
    if (selectedCliente) {
      console.log(`[ClienteSelector] Confirmando selección: ${selectedCliente.nombre}`);
      onClienteSelected(selectedCliente);
      onClose();
    }
  };

  // Solicitar confirmar desbloqueo para edición
  const handleRequestUnlock = () => {
    setShowUnlockAlert(true);
  };

  // Habilitar edición después de confirmar
  const handleEnableEdit = () => {
    setEditMode(true);
    setMode('edit');
  };

  // Iniciar proceso de creación de nuevo cliente
  const handleCreateNewClient = () => {
    console.log('[ClienteSelector] Iniciando creación de nuevo cliente');
    const newCliente = {...CLIENTE_VACIO};
    
    // Si hay un término de búsqueda, usarlo como nombre inicial
    if (searchTerm.trim()) {
      newCliente.nombre = searchTerm.trim();
      console.log(`[ClienteSelector] Usando término de búsqueda como nombre: "${searchTerm}"`);
    }
    
    setClienteForm(newCliente);
    setEditMode(true);
    setMode('create');
  };

  // Guardar cambios en edición o creación
  const handleSaveChanges = async () => {
    try {
      if (mode === 'create') {
        console.log('[ClienteSelector] Creando nuevo cliente...');
        
        // Preparar datos para la API
        const clienteData = {
          nclientes: clienteForm.nombre,
          propietario: clienteForm.nombre,
          activo: true,
          registro: clienteForm.numeroRegistro,
          nit: clienteForm.tipoDocumento === 'NIT' ? clienteForm.numeroRegistro : '',
          dui: clienteForm.tipoDocumento === 'DUI' ? clienteForm.numeroRegistro : '',
          direccion: clienteForm.direccion,
          telefono1: clienteForm.telefono,
          telefono2: clienteForm.telefonoAlterno,
          email: clienteForm.email,
          tipcli: parseInt(clienteForm.tipoCliente) || 1,
          giro: clienteForm.giro,
          razonsoc: clienteForm.razonSocial,
          limitecredito: parseFloat(clienteForm.limiteCredito.replace('$', '').replace(',', '')),
          exento: clienteForm.excentoImpuestos,
          retencion: clienteForm.retencion,
          nosujeto: clienteForm.noSujeto,
          gobierno: clienteForm.gobierno,
          ivacero: clienteForm.tasaCero,
          percepcion: clienteForm.percepcion,
          autoconsumo: clienteForm.autoConsumo,
          PROPIO: clienteForm.propioTalSol,
          ExcluirCredito: clienteForm.noRestringirCredito
        };
        
        const response = await ClienteService.createCliente(clienteData);
        const nuevoCliente = ClienteService.mapApiClienteToUiCliente(response);
        
        // Limpiar caché de búsqueda para incluir el nuevo cliente
        ClienteService.clearSearchCache();
        
        setToastType('success');
        setToastMessage('Cliente creado exitosamente');
        setShowToast(true);
        
        setNewCreatedCliente(nuevoCliente);
        setClienteForm(nuevoCliente);
        setEditMode(false);
        setMode('view');
        setSelectedCliente(nuevoCliente);
        
        // Actualizar listas
        setClientes(prev => [nuevoCliente, ...prev]);
        
        setShowUseNewClienteAlert(true);
        
      } else if (mode === 'edit' && selectedCliente) {
        console.log('[ClienteSelector] Actualizando cliente existente...');
        
        // Preparar datos para la API (misma estructura que creación)
        const clienteData = {
          nclientes: clienteForm.nombre,
          propietario: clienteForm.nombre,
          activo: true,
          registro: clienteForm.numeroRegistro,
          nit: clienteForm.tipoDocumento === 'NIT' ? clienteForm.numeroRegistro : '',
          dui: clienteForm.tipoDocumento === 'DUI' ? clienteForm.numeroRegistro : '',
          direccion: clienteForm.direccion,
          telefono1: clienteForm.telefono,
          telefono2: clienteForm.telefonoAlterno,
          email: clienteForm.email,
          tipcli: parseInt(clienteForm.tipoCliente) || 1,
          giro: clienteForm.giro,
          razonsoc: clienteForm.razonSocial,
          limitecredito: parseFloat(clienteForm.limiteCredito.replace('$', '').replace(',', '')),
          exento: clienteForm.excentoImpuestos,
          retencion: clienteForm.retencion,
          nosujeto: clienteForm.noSujeto,
          gobierno: clienteForm.gobierno,
          ivacero: clienteForm.tasaCero,
          percepcion: clienteForm.percepcion,
          autoconsumo: clienteForm.autoConsumo,
          PROPIO: clienteForm.propioTalSol,
          ExcluirCredito: clienteForm.noRestringirCredito
        };
        
        const response = await ClienteService.updateCliente(selectedCliente.codigo, clienteData);
        const clienteActualizado = ClienteService.mapApiClienteToUiCliente(response);
        
        // Limpiar caché de búsqueda
        ClienteService.clearSearchCache();
        
        setToastType('success');
        setToastMessage('Cliente actualizado exitosamente');
        setShowToast(true);
        
        setSelectedCliente(clienteActualizado);
        setClienteForm(clienteActualizado);
        setEditMode(false);
        setMode('view');
        
        // Actualizar listas
        setClientes(prev => prev.map(c => c.id === clienteActualizado.id ? clienteActualizado : c));
        
        onClienteSelected(clienteActualizado);
      }
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      setToastType('error');
      setToastMessage('Error al guardar el cliente. Intente nuevamente.');
      setShowToast(true);
    }
  };

  // Usar el cliente recién creado
  const handleUseNewClient = () => {
    if (newCreatedCliente) {
      onClienteSelected(newCreatedCliente);
      onClose();
    }
  };

  // Cancelar edición o creación
  const handleCancelEdit = () => {
    if (mode === 'edit' && selectedCliente) {
      setClienteForm(selectedCliente);
      setEditMode(false);
      setMode('view');
    } else if (mode === 'create') {
      if (selectedCliente) {
        setClienteForm(selectedCliente);
        setMode('view');
      } else {
        setMode('list');
      }
      setEditMode(false);
    }
  };

  // Eliminar un cliente
  const handleRequestDelete = () => {
    if (!selectedCliente) return;
    setShowDeleteAlert(true);
  };

  // Confirmar y ejecutar la eliminación
  const handleDeleteCliente = async () => {
    if (!selectedCliente) return;
    
    try {
      await ClienteService.deleteCliente(selectedCliente.codigo);
      
      // Limpiar caché de búsqueda
      ClienteService.clearSearchCache();
      
      setToastType('success');
      setToastMessage('Cliente eliminado exitosamente');
      setShowToast(true);
      
      // Actualizar listas
      setClientes(prev => prev.filter(c => c.id !== selectedCliente.id));
      
      // Regresar a la lista
      setSelectedCliente(null);
      setMode('list');
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      setToastType('error');
      setToastMessage('Error al eliminar el cliente. Intente nuevamente.');
      setShowToast(true);
    }
  };

  // Función dummy para compatibilidad con ClienteList
  const handleSearch = () => {
    // La búsqueda se maneja automáticamente por el hook useClienteSearch
  };

  return (
    <div className="flex flex-col h-full bg-primary text-primary">
      {/* Encabezado con botón de cerrar */}
      <div className="flex items-center justify-between p-3 border-b border-[#555555]">
        <h2 className="text-xl font-medium">
          {mode === 'list' ? 'Seleccionar Cliente' : 
           mode === 'view' ? 'Ficha de Cliente' : 
           mode === 'edit' ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h2>
        <div className="flex items-center gap-2">
          
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
            title="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Contenedor principal */}
      <div className="flex flex-col flex-1 overflow-hidden p-4">
        {mode === 'list' ? (
          // Vista de lista de clientes
          <ClienteList
            clientes={clientes}
            filteredClientes={filteredClientes}
            selectedCliente={selectedCliente}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onSelectCliente={handleSelectCliente}
            onCreateNewClient={handleCreateNewClient}
            isLoading={loadingClientes || isSearching}
            hasMore={hasMore}
            onLoadMore={loadMoreClientes}
            onSearch={handleSearch}
            searchMode={searchMode}
          />
        ) : (
          // Modo visualización/edición/creación con datos del cliente
          <div className="overflow-y-auto">
            {/* Encabezado con botones de acción */}
            <ClienteFormHeader
              mode={mode as 'view' | 'edit' | 'create'}
              onListView={() => setMode('list')}
              onCreateNew={handleCreateNewClient}
              onRequestUnlock={handleRequestUnlock}
            />
            
            {/* Tarjeta de información del cliente */}
            <ClienteDataForm
              cliente={clienteForm}
              editMode={editMode}
              onChange={handleInputChange}
            />
            
            {/* Sección de dirección */}
            <ClienteAddressForm
              cliente={clienteForm}
              editMode={editMode}
              onChange={handleInputChange}
            />
            
            {/* Sección de atributos fiscales */}
            <ClienteFiscalAttributes
              cliente={clienteForm}
              editMode={editMode}
              onCheckboxChange={handleCheckboxChange}
            />
            
            {/* Botones de acción */}
            <ClienteFormActions
              mode={mode}
              editMode={editMode}
              onCancelEdit={handleCancelEdit}
              onSaveChanges={handleSaveChanges}
              onShowList={() => setMode('list')}
              onConfirmSelection={handleConfirmSelection}
              onDeleteCliente={mode === 'view' && selectedCliente?.id ? handleRequestDelete : undefined}
            />
          </div>
        )}
      </div>
      
      {/* Indicador de carga para operaciones globales */}
      {(loadingClientes || isSearching) && mode !== 'list' && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-secondary p-4 rounded-md shadow-lg">
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{isSearching ? 'Buscando...' : 'Cargando datos...'}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación para desbloquear edición */}
      <AlertModal
        isOpen={showUnlockAlert}
        onClose={() => setShowUnlockAlert(false)}
        onConfirm={handleEnableEdit}
        title="Confirmar Edición"
        message="¿Está seguro que desea editar la información del cliente? Esto permitirá modificar todos los campos."
      />
      
      {/* Modal para preguntar si usar el cliente nuevo */}
      <AlertModal
        isOpen={showUseNewClienteAlert}
        onClose={() => setShowUseNewClienteAlert(false)}
        onConfirm={handleUseNewClient}
        title="Cliente Creado Exitosamente"
        message="¿Desea usar este nuevo cliente para la factura actual?"
      />
      
      {/* Modal de confirmación para eliminar cliente */}
      <AlertModal
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={handleDeleteCliente}
        title="Eliminar Cliente"
        message={`¿Está seguro que desea eliminar el cliente "${selectedCliente?.nombre}"? Esta acción no se puede deshacer.`}
      />
      
      {/* Toast de notificación */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}