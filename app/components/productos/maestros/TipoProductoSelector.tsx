'use client';
import { useState, useEffect, useCallback } from 'react';
import { TipoProducto, TipoProductoSelectorProps, TIPOS_PRODUCTO_EJEMPLO, createEmptyTipoProducto } from './tiposProductoTypes';
import { MaestroList } from './MaestroList';
import { MaestroFormHeader, MaestroDataForm, MaestroFormActions } from './MaestroFormComponents';
import { AlertModal } from '../../ui/AlertModal';
import { Toast } from '../../facturas/ui/Toast';

export default function TipoProductoSelector({ 
  onClose, 
  onTipoSelected, 
  tipoActual 
}: TipoProductoSelectorProps) {
  // Estados principales
  const [filteredTipos, setFilteredTipos] = useState<TipoProducto[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<TipoProducto | null>(tipoActual || null);
  const [editMode, setEditMode] = useState(false);
  const [tipoForm, setTipoForm] = useState<TipoProducto>(tipoActual || createEmptyTipoProducto());
  const [mode, setMode] = useState<'list' | 'view' | 'edit' | 'create'>(tipoActual ? 'view' : 'list');
  
  // Estados para alertas y notificaciones
  const [showUnlockAlert, setShowUnlockAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  
  // Estados para listado
  const [tipos, setTipos] = useState<TipoProducto[]>(TIPOS_PRODUCTO_EJEMPLO);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para mostrar toast
  const showToastNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  }, []);

  // Filtrar tipos basado en búsqueda
  useEffect(() => {
    const filtered = tipos.filter(tipo => 
      tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tipo.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tipo.descripcion && tipo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredTipos(filtered);
  }, [tipos, searchTerm]);

  // Manejar cambio en el término de búsqueda
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Manejar cambios en los campos del formulario
  const handleFieldChange = (field: keyof TipoProducto, value: any) => {
    setTipoForm(prev => ({ ...prev, [field]: value }));
  };

  // Seleccionar un tipo
  const handleSelectTipo = (tipo: TipoProducto) => {
    setSelectedTipo(tipo);
    setTipoForm(tipo);
    setMode('view');
  };

  // Confirmar selección de tipo
  const handleConfirmSelection = () => {
    if (selectedTipo) {
      onTipoSelected(selectedTipo);
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

  // Iniciar proceso de creación de nuevo tipo
  const handleCreateNew = () => {
    const newTipo = createEmptyTipoProducto();
    
    // Si hay un término de búsqueda, usarlo como nombre inicial
    if (searchTerm.trim()) {
      newTipo.nombre = searchTerm.trim().toUpperCase();
    }
    
    setTipoForm(newTipo);
    setEditMode(true);
    setMode('create');
  };

  // Guardar cambios en edición o creación
  const handleSaveChanges = async () => {
    try {
      // Validaciones básicas
      if (!tipoForm.nombre.trim()) {
        showToastNotification('ingrese el nombre del tipo', 'error');
        return;
      }
      if (!tipoForm.codigo.trim()) {
        showToastNotification('ingrese el código del tipo', 'error');
        return;
      }

      setLoading(true);

      if (mode === 'create') {
        // Simular creación
        const newTipo = {
          ...tipoForm,
          id: Math.max(...tipos.map(t => t.id)) + 1,
          fechaCreacion: new Date().toISOString()
        };
        
        setTipos(prev => [newTipo, ...prev]);
        setSelectedTipo(newTipo);
        setTipoForm(newTipo);
        
        showToastNotification('Tipo de producto creado exitosamente', 'success');
        
      } else if (mode === 'edit' && selectedTipo) {
        // Simular actualización
        const updatedTipo = { ...tipoForm };
        
        setTipos(prev => prev.map(t => t.id === selectedTipo.id ? updatedTipo : t));
        setSelectedTipo(updatedTipo);
        
        showToastNotification('Tipo de producto actualizado exitosamente', 'success');
      }
      
      setEditMode(false);
      setMode('view');
      
    } catch (error) {
      console.error('Error al guardar tipo:', error);
      showToastNotification('Error al guardar el tipo. Intente nuevamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar edición o creación
  const handleCancelEdit = () => {
    if (mode === 'edit' && selectedTipo) {
      setTipoForm(selectedTipo);
      setEditMode(false);
      setMode('view');
    } else if (mode === 'create') {
      if (selectedTipo) {
        setTipoForm(selectedTipo);
        setMode('view');
      } else {
        setMode('list');
      }
      setEditMode(false);
    }
  };

  // Eliminar un tipo
  const handleRequestDelete = () => {
    if (!selectedTipo) return;
    setShowDeleteAlert(true);
  };

  // Confirmar y ejecutar la eliminación
  const handleDeleteTipo = async () => {
    if (!selectedTipo) return;
    
    try {
      setLoading(true);
      
      // Simular eliminación
      setTipos(prev => prev.filter(t => t.id !== selectedTipo.id));
      
      showToastNotification('Tipo de producto eliminado exitosamente', 'success');
      
      // Regresar a la lista
      setSelectedTipo(null);
      setMode('list');
      
    } catch (error) {
      console.error('Error al eliminar tipo:', error);
      showToastNotification('Error al eliminar el tipo. Intente nuevamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-primary text-primary">
      {/* Encabezado con botón de cerrar */}
      <div className="flex items-center justify-between p-3 border-b border-[#555555]">
        <h2 className="text-xl font-medium">
          {mode === 'list' ? 'Seleccionar Tipo de Producto' : 
           mode === 'view' ? 'Información del Tipo' : 
           mode === 'edit' ? 'Editar Tipo' : 'Nuevo Tipo de Producto'}
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
          // Vista de lista de tipos
          <MaestroList
            items={tipos}
            filteredItems={filteredTipos}
            selectedItem={selectedTipo}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onSelectItem={handleSelectTipo}
            onCreateNew={handleCreateNew}
            isLoading={loading}
            entityName="Tipo"
          />
        ) : (
          // Modo visualización/edición/creación
          <div className="overflow-y-auto">
            <MaestroFormHeader
              mode={mode as 'view' | 'edit' | 'create'}
              entityName="Tipo de Producto"
              onListView={() => setMode('list')}
              onCreateNew={handleCreateNew}
              onRequestUnlock={handleRequestUnlock}
            />
            
            <MaestroDataForm
              item={tipoForm}
              editMode={editMode}
              entityName="Tipo de Producto"
              onChange={handleFieldChange}
            />
            
            <MaestroFormActions
              mode={mode}
              editMode={editMode}
              entityName="Tipo"
              onCancelEdit={handleCancelEdit}
              onSaveChanges={handleSaveChanges}
              onShowList={() => setMode('list')}
              onConfirmSelection={handleConfirmSelection}
              onDelete={mode === 'view' && selectedTipo?.id ? handleRequestDelete : undefined}
            />
          </div>
        )}
      </div>
      
      {/* Modales */}
      <AlertModal
        isOpen={showUnlockAlert}
        onClose={() => setShowUnlockAlert(false)}
        onConfirm={handleEnableEdit}
        title="Confirmar Edición"
        message="¿Está seguro que desea editar la información del tipo de producto? Esto permitirá modificar todos los campos."
      />
      
      <AlertModal
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={handleDeleteTipo}
        title="Eliminar Tipo"
        message={`¿Está seguro que desea eliminar el tipo "${selectedTipo?.nombre}"? Esta acción no se puede deshacer.`}
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