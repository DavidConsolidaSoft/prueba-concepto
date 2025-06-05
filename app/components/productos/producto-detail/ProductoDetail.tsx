'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { ProductoHeader } from './ProductoHeader';
import { ProductoInfo } from './ProductoInfo';
import { ProductoCaracteristicas } from './ProductoCaracteristicas';
import { ProductoPropiedades } from './ProductoPropiedades';
import { AlertModal } from '../../ui/AlertModal';
import { Toast } from '../../facturas/ui/Toast';
import { 
  type Producto, 
  createEmptyProducto, 
  MOCK_PRODUCTO_DETAIL 
} from './productoTypes';

interface ProductoDetailProps {
  productoId: string;
  onBackToList?: () => void;
  isCreating?: boolean;
}

export default function ProductoDetail({
  productoId,
  onBackToList,
  isCreating = false
}: ProductoDetailProps) {
  const [isCreatingInternal, setIsCreatingInternal] = useState(isCreating);
  const [producto, setProducto] = useState<Producto>(
    isCreatingInternal ? createEmptyProducto() : MOCK_PRODUCTO_DETAIL
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isEditable, setIsEditable] = useState(isCreatingInternal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para modales
  const [showEditModeAlert, setShowEditModeAlert] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Estados para el Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  
  // ✅ Estado único para trackear si hay un selector maestro abierto
  const [isMaestroSelectorOpen, setIsMaestroSelectorOpen] = useState(false);
  
  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Función para mostrar toast
  const showToastNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  }, []);

  // ✅ Handler para recibir cambios de ProductoInfo
  const handleSelectorStateChange = useCallback((selectorOpen: boolean) => {
    console.log('Selector maestro abierto:', selectorOpen);
    setIsMaestroSelectorOpen(selectorOpen);
  }, []);

  // ✅ EFECTO CRÍTICO: Comunicar estado de selector maestro a nivel global
  useEffect(() => {
    // Emitir evento custom cuando cambia el estado del selector maestro
    const event = new CustomEvent('maestroSelectorStateChange', { 
      detail: { isOpen: isMaestroSelectorOpen } 
    });
    document.dispatchEvent(event);
    
    // Establecer atributo en body para CSS
    if (isMaestroSelectorOpen && !isMobile) {
      document.body.setAttribute('data-maestro-selector-open', 'true');
    } else {
      document.body.removeAttribute('data-maestro-selector-open');
    }

    return () => {
      document.body.removeAttribute('data-maestro-selector-open');
    };
  }, [isMaestroSelectorOpen, isMobile]);

  // Cargar datos del producto desde la API (simulado)
  useEffect(() => {
    if (!isCreatingInternal && productoId && productoId !== 'new') {
      loadProductoData();
    }
  }, [productoId, isCreatingInternal]);

  const loadProductoData = async () => {
    if (!productoId || productoId === 'new') return;
    
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducto(MOCK_PRODUCTO_DETAIL);
    } catch (err) {
      setError('Error al cargar los datos del producto');
      console.error('Error loading producto:', err);
      setProducto(MOCK_PRODUCTO_DETAIL);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCreatingInternal) {
      setProducto(createEmptyProducto());
    }
  }, [isCreatingInternal]);

  const handleBackClick = () => {
    if (onBackToList) {
      onBackToList();
    }
  };

  const enableEditMode = () => {
    setIsEditable(true);
  };

  const disableEditMode = () => {
    setIsEditable(false);
  };

  const handleLockToggle = () => {
    if (!isEditable && !isCreatingInternal) {
      setShowEditModeAlert(true);
    } else {
      disableEditMode();
    }
  };

  const handleSaveProducto = () => {
    if (isCreatingInternal) {
      // Validaciones básicas
      if (!producto.nombre.trim()) {
        showToastNotification('ingrese el nombre del producto', 'error');
        return;
      }
      if (!producto.codigo.trim()) {
        showToastNotification('ingrese el código del producto', 'error');
        return;
      }
      if (!producto.tipoProducto.trim()) {
        showToastNotification('seleccione el tipo de producto', 'error');
        return;
      }
      
      setShowSaveConfirmation(true);
    } else {
      console.log('Actualizando producto:', producto);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        disableEditMode();
      }, 2000);
    }
  };

  const confirmSaveProducto = () => {
    const generateProductoId = () => {
      const lastId = 100;
      return `PROD-${String(lastId + 1).padStart(5, '0')}`;
    };
    
    const newProductoId = generateProductoId();
    const newProducto = {
      ...producto,
      id: newProductoId
    };
    
    console.log('Guardando nuevo producto:', newProducto);
    
    setProducto(newProducto);
    setIsCreatingInternal(false);
    setIsEditable(false);
    setShowSuccessMessage(true);
    
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  // Manejar cambios en los campos del formulario
  const handleInputChange = (field: keyof Producto, value: any) => {
    if (isEditable) {
      setProducto(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-primary">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error && !producto.id) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadProductoData}
            className="bg-blue-600 hover:bg-blue-700 text-primary px-4 py-2 rounded-md"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
          {isCreatingInternal ? "Producto creado exitosamente" : "Producto actualizado exitosamente"}
        </div>
      )}
      
      {/* ✅ Contenedor principal con desplazamiento dinámico MEJORADO */}
      <div className={`h-full flex flex-col transition-all duration-300 ease-in-out overflow-auto ${
          isMaestroSelectorOpen && !isMobile ? 'mr-96' : ''
        }`}>
        <ProductoHeader
          producto={producto}
          isCreatingInternal={isCreatingInternal}
          isEditable={isEditable}
          isMobile={isMobile}
          onBackClick={handleBackClick}
          onSaveProducto={handleSaveProducto}
          onLockToggle={handleLockToggle}
          onDuplicateProducto={() => console.log('Duplicar producto')}
        />
        
        <ProductoInfo
          producto={producto}
          isEditable={isEditable}
          isCreatingInternal={isCreatingInternal}
          isMobile={isMobile}
          onFieldChange={handleInputChange}
          onSelectorStateChange={handleSelectorStateChange}
        />
        
        <ProductoCaracteristicas
          producto={producto}
          isEditable={isEditable}
          isCreatingInternal={isCreatingInternal}
          isMobile={isMobile}
          onFieldChange={handleInputChange}
        />

        <ProductoPropiedades
          producto={producto}
          isEditable={isEditable}
          isCreatingInternal={isCreatingInternal}
          isMobile={isMobile}
          onFieldChange={handleInputChange}
        />

        {/* Modales */}
        <AlertModal
          isOpen={showEditModeAlert}
          onClose={() => setShowEditModeAlert(false)}
          onConfirm={enableEditMode}
          title="Confirmar Edición"
          message={`¿Está seguro de que desea editar el producto ${producto.nombre}? Esto habilitará la modificación de todos los campos.`}
        />
        
        <AlertModal
          isOpen={showSaveConfirmation}
          onClose={() => setShowSaveConfirmation(false)}
          onConfirm={confirmSaveProducto}
          title="Confirmar Guardado"
          message={`¿Está seguro de que desea guardar este producto?`}
        />
      </div>

      {/* Toast centralizado */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          duration={3500}
        />
      )}
    </div>
  );
}