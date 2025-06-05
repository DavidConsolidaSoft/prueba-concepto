// CategoriaProductoSelector.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { CategoriaProducto, CategoriaProductoSelectorProps, CATEGORIAS_PRODUCTO_EJEMPLO, createEmptyCategoriaProducto } from './tiposProductoTypes';
import { MaestroList } from './MaestroList';
import { MaestroFormHeader, MaestroDataForm, MaestroFormActions } from './MaestroFormComponents';
import { AlertModal } from '../../ui/AlertModal';
import { Toast } from '../../facturas/ui/Toast';

export default function CategoriaProductoSelector({ 
  onClose, 
  onCategoriaSelected, 
  categoriaActual 
}: CategoriaProductoSelectorProps) {
  // Estados principales
  const [filteredCategorias, setFilteredCategorias] = useState<CategoriaProducto[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaProducto | null>(categoriaActual || null);
  const [editMode, setEditMode] = useState(false);
  const [categoriaForm, setCategoriaForm] = useState<CategoriaProducto>(categoriaActual || createEmptyCategoriaProducto());
  const [mode, setMode] = useState<'list' | 'view' | 'edit' | 'create'>(categoriaActual ? 'view' : 'list');
  
  // Estados para alertas y notificaciones
  const [showUnlockAlert, setShowUnlockAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  
  // Estados para listado
  const [categorias, setCategorias] = useState<CategoriaProducto[]>(CATEGORIAS_PRODUCTO_EJEMPLO);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para mostrar toast
  const showToastNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  }, []);

  // Filtrar categorías basado en búsqueda
  useEffect(() => {
    const filtered = categorias.filter(categoria => 
      categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoria.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (categoria.descripcion && categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCategorias(filtered);
  }, [categorias, searchTerm]);

  // Manejar cambio en el término de búsqueda
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Manejar cambios en los campos del formulario
  const handleFieldChange = (field: keyof CategoriaProducto, value: any) => {
    setCategoriaForm(prev => ({ ...prev, [field]: value }));
  };

  // Seleccionar una categoría
  const handleSelectCategoria = (categoria: CategoriaProducto) => {
    setSelectedCategoria(categoria);
    setCategoriaForm(categoria);
    setMode('view');
  };

  // Confirmar selección de categoría
  const handleConfirmSelection = () => {
    if (selectedCategoria) {
      onCategoriaSelected(selectedCategoria);
      onClose();
    }
  };

  // Resto de manejadores similares al TipoProductoSelector...
  const handleRequestUnlock = () => setShowUnlockAlert(true);
  const handleEnableEdit = () => { setEditMode(true); setMode('edit'); };
  
  const handleCreateNew = () => {
    const newCategoria = createEmptyCategoriaProducto();
    if (searchTerm.trim()) {
      newCategoria.nombre = searchTerm.trim().toUpperCase();
    }
    setCategoriaForm(newCategoria);
    setEditMode(true);
    setMode('create');
  };

  const handleSaveChanges = async () => {
    try {
      if (!categoriaForm.nombre.trim()) {
        showToastNotification('ingrese el nombre de la categoría', 'error');
        return;
      }
      if (!categoriaForm.codigo.trim()) {
        showToastNotification('ingrese el código de la categoría', 'error');
        return;
      }

      setLoading(true);

      if (mode === 'create') {
        const newCategoria = {
          ...categoriaForm,
          id: Math.max(...categorias.map(c => c.id)) + 1,
          fechaCreacion: new Date().toISOString()
        };
        
        setCategorias(prev => [newCategoria, ...prev]);
        setSelectedCategoria(newCategoria);
        setCategoriaForm(newCategoria);
        
        showToastNotification('Categoría creada exitosamente', 'success');
        
      } else if (mode === 'edit' && selectedCategoria) {
        const updatedCategoria = { ...categoriaForm };
        setCategorias(prev => prev.map(c => c.id === selectedCategoria.id ? updatedCategoria : c));
        setSelectedCategoria(updatedCategoria);
        showToastNotification('Categoría actualizada exitosamente', 'success');
      }
      
      setEditMode(false);
      setMode('view');
      
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      showToastNotification('Error al guardar la categoría. Intente nuevamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (mode === 'edit' && selectedCategoria) {
      setCategoriaForm(selectedCategoria);
      setEditMode(false);
      setMode('view');
    } else if (mode === 'create') {
      if (selectedCategoria) {
        setCategoriaForm(selectedCategoria);
        setMode('view');
      } else {
        setMode('list');
      }
      setEditMode(false);
    }
  };

  const handleRequestDelete = () => {
    if (!selectedCategoria) return;
    setShowDeleteAlert(true);
  };

  const handleDeleteCategoria = async () => {
    if (!selectedCategoria) return;
    
    try {
      setLoading(true);
      setCategorias(prev => prev.filter(c => c.id !== selectedCategoria.id));
      showToastNotification('Categoría eliminada exitosamente', 'success');
      setSelectedCategoria(null);
      setMode('list');
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      showToastNotification('Error al eliminar la categoría. Intente nuevamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-primary text-primary">
      <div className="flex items-center justify-between p-3 border-b border-[#555555]">
        <h2 className="text-xl font-medium">
          {mode === 'list' ? 'Seleccionar Categoría' : 
           mode === 'view' ? 'Información de la Categoría' : 
           mode === 'edit' ? 'Editar Categoría' : 'Nueva Categoría'}
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
            items={categorias}
            filteredItems={filteredCategorias}
            selectedItem={selectedCategoria}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onSelectItem={handleSelectCategoria}
            onCreateNew={handleCreateNew}
            isLoading={loading}
            entityName="Categoría"
          />
        ) : (
          <div className="overflow-y-auto">
            <MaestroFormHeader
              mode={mode as 'view' | 'edit' | 'create'}
              entityName="Categoría"
              onListView={() => setMode('list')}
              onCreateNew={handleCreateNew}
              onRequestUnlock={handleRequestUnlock}
            />
            
            <MaestroDataForm
              item={categoriaForm}
              editMode={editMode}
              entityName="Categoría"
              onChange={handleFieldChange}
            />
            
            <MaestroFormActions
              mode={mode}
              editMode={editMode}
              entityName="Categoría"
              onCancelEdit={handleCancelEdit}
              onSaveChanges={handleSaveChanges}
              onShowList={() => setMode('list')}
              onConfirmSelection={handleConfirmSelection}
              onDelete={mode === 'view' && selectedCategoria?.id ? handleRequestDelete : undefined}
            />
          </div>
        )}
      </div>
      
      <AlertModal
        isOpen={showUnlockAlert}
        onClose={() => setShowUnlockAlert(false)}
        onConfirm={handleEnableEdit}
        title="Confirmar Edición"
        message="¿Está seguro que desea editar la información de la categoría?"
      />
      
      <AlertModal
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={handleDeleteCategoria}
        title="Eliminar Categoría"
        message={`¿Está seguro que desea eliminar la categoría "${selectedCategoria?.nombre}"?`}
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