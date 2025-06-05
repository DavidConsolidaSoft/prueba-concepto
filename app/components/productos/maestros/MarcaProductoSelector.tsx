// MarcaProductoSelector.tsx - Similar estructura pero para marcas
'use client';
import { useState, useEffect, useCallback } from 'react';
import { MarcaProducto, MarcaProductoSelectorProps, MARCAS_PRODUCTO_EJEMPLO, createEmptyMarcaProducto } from './tiposProductoTypes';
import { MaestroList } from './MaestroList';
import { MaestroFormHeader, MaestroDataForm, MaestroFormActions } from './MaestroFormComponents';
import { AlertModal } from '../../ui/AlertModal';
import { Toast } from '../../facturas/ui/Toast';

export function MarcaProductoSelector({ 
  onClose, 
  onMarcaSelected, 
  marcaActual 
}: MarcaProductoSelectorProps) {
  // Estados principales
  const [filteredMarcas, setFilteredMarcas] = useState<MarcaProducto[]>([]);
  const [selectedMarca, setSelectedMarca] = useState<MarcaProducto | null>(marcaActual || null);
  const [editMode, setEditMode] = useState(false);
  const [marcaForm, setMarcaForm] = useState<MarcaProducto>(marcaActual || createEmptyMarcaProducto());
  const [mode, setMode] = useState<'list' | 'view' | 'edit' | 'create'>(marcaActual ? 'view' : 'list');
  
  // Estados para alertas y notificaciones
  const [showUnlockAlert, setShowUnlockAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  
  // Estados para listado
  const [marcas, setMarcas] = useState<MarcaProducto[]>(MARCAS_PRODUCTO_EJEMPLO);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const showToastNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  }, []);

  useEffect(() => {
    const filtered = marcas.filter(marca => 
      marca.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      marca.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (marca.descripcion && marca.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredMarcas(filtered);
  }, [marcas, searchTerm]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleFieldChange = (field: keyof MarcaProducto, value: any) => {
    setMarcaForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectMarca = (marca: MarcaProducto) => {
    setSelectedMarca(marca);
    setMarcaForm(marca);
    setMode('view');
  };

  const handleConfirmSelection = () => {
    if (selectedMarca) {
      onMarcaSelected(selectedMarca);
      onClose();
    }
  };

  const handleRequestUnlock = () => setShowUnlockAlert(true);
  const handleEnableEdit = () => { setEditMode(true); setMode('edit'); };
  
  const handleCreateNew = () => {
    const newMarca = createEmptyMarcaProducto();
    if (searchTerm.trim()) {
      newMarca.nombre = searchTerm.trim().toUpperCase();
    }
    setMarcaForm(newMarca);
    setEditMode(true);
    setMode('create');
  };

  const handleSaveChanges = async () => {
    try {
      if (!marcaForm.nombre.trim()) {
        showToastNotification('ingrese el nombre de la marca', 'error');
        return;
      }
      if (!marcaForm.codigo.trim()) {
        showToastNotification('ingrese el código de la marca', 'error');
        return;
      }

      setLoading(true);

      if (mode === 'create') {
        const newMarca = {
          ...marcaForm,
          id: Math.max(...marcas.map(m => m.id)) + 1,
          fechaCreacion: new Date().toISOString()
        };
        
        setMarcas(prev => [newMarca, ...prev]);
        setSelectedMarca(newMarca);
        setMarcaForm(newMarca);
        
        showToastNotification('Marca creada exitosamente', 'success');
        
      } else if (mode === 'edit' && selectedMarca) {
        const updatedMarca = { ...marcaForm };
        setMarcas(prev => prev.map(m => m.id === selectedMarca.id ? updatedMarca : m));
        setSelectedMarca(updatedMarca);
        showToastNotification('Marca actualizada exitosamente', 'success');
      }
      
      setEditMode(false);
      setMode('view');
      
    } catch (error) {
      console.error('Error al guardar marca:', error);
      showToastNotification('Error al guardar la marca. Intente nuevamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (mode === 'edit' && selectedMarca) {
      setMarcaForm(selectedMarca);
      setEditMode(false);
      setMode('view');
    } else if (mode === 'create') {
      if (selectedMarca) {
        setMarcaForm(selectedMarca);
        setMode('view');
      } else {
        setMode('list');
      }
      setEditMode(false);
    }
  };

  const handleRequestDelete = () => {
    if (!selectedMarca) return;
    setShowDeleteAlert(true);
  };

  const handleDeleteMarca = async () => {
    if (!selectedMarca) return;
    
    try {
      setLoading(true);
      setMarcas(prev => prev.filter(m => m.id !== selectedMarca.id));
      showToastNotification('Marca eliminada exitosamente', 'success');
      setSelectedMarca(null);
      setMode('list');
    } catch (error) {
      console.error('Error al eliminar marca:', error);
      showToastNotification('Error al eliminar la marca. Intente nuevamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-primary text-primary">
      <div className="flex items-center justify-between p-3 border-b border-[#555555]">
        <h2 className="text-xl font-medium">
          {mode === 'list' ? 'Seleccionar Marca' : 
           mode === 'view' ? 'Información de la Marca' : 
           mode === 'edit' ? 'Editar Marca' : 'Nueva Marca'}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-md transition-colors" title="Cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden p-4">
        {mode === 'list' ? (
          <MaestroList
            items={marcas}
            filteredItems={filteredMarcas}
            selectedItem={selectedMarca}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onSelectItem={handleSelectMarca}
            onCreateNew={handleCreateNew}
            isLoading={loading}
            entityName="Marca"
          />
        ) : (
          <div className="overflow-y-auto">
            <MaestroFormHeader
              mode={mode as 'view' | 'edit' | 'create'}
              entityName="Marca"
              onListView={() => setMode('list')}
              onCreateNew={handleCreateNew}
              onRequestUnlock={handleRequestUnlock}
            />
            
            <MaestroDataForm
              item={marcaForm}
              editMode={editMode}
              entityName="Marca"
              onChange={handleFieldChange}
            />
            
            <MaestroFormActions
              mode={mode}
              editMode={editMode}
              entityName="Marca"
              onCancelEdit={handleCancelEdit}
              onSaveChanges={handleSaveChanges}
              onShowList={() => setMode('list')}
              onConfirmSelection={handleConfirmSelection}
              onDelete={mode === 'view' && selectedMarca?.id ? handleRequestDelete : undefined}
            />
          </div>
        )}
      </div>
      
      <AlertModal
        isOpen={showUnlockAlert}
        onClose={() => setShowUnlockAlert(false)}
        onConfirm={handleEnableEdit}
        title="Confirmar Edición"
        message="¿Está seguro que desea editar la información de la marca?"
      />
      
      <AlertModal
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={handleDeleteMarca}
        title="Eliminar Marca"
        message={`¿Está seguro que desea eliminar la marca "${selectedMarca?.nombre}"?`}
      />
      
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