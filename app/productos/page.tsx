'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/app/components/layout/AppLayout';
import ProductosList from '@/app/components/productos/ProductosList';
import ProductoDetail from '@/app/components/productos/producto-detail/ProductoDetail';
import NewProductoButton from '@/app/components/productos/NewProductoButton';

export default function ProductosPage() {
  const [selectedProductoId, setSelectedProductoId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showList, setShowList] = useState(true);
  const [isCreatingProducto, setIsCreatingProducto] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
     
      // En escritorio, siempre mostrar la lista
      if (!mobile) {
        setShowList(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
   
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
 
  // En móvil, al seleccionar un producto ocultamos la lista y mostramos el detalle
  useEffect(() => {
    if (isMobile && (selectedProductoId || isCreatingProducto)) {
      setShowList(false);
    }
  }, [selectedProductoId, isCreatingProducto, isMobile]);
 
  // Manejador para volver a la lista en móvil
  const handleBackToList = () => {
    setShowList(true);
    setSelectedProductoId(null);
    setIsCreatingProducto(false);
  };
  
  // Función para crear nuevo producto
  const handleCreateNewProducto = () => {
    setSelectedProductoId(null); 
    setIsCreatingProducto(true);
    if (isMobile) {
      setShowList(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex h-full">
        {(!isMobile || (isMobile && showList)) && (
          <div className={`${isMobile ? 'w-full' : 'w-[400px]'} h-full flex-shrink-0`}>
            <ProductosList
              onSelectProducto={(id) => {
                setSelectedProductoId(id);
                setIsCreatingProducto(false);
                if (isMobile) {
                  setShowList(false);
                }
              }}
              selectedProductoId={selectedProductoId}
              onCreateProducto={handleCreateNewProducto}
            />
          </div>
        )}
       
        {/* Detalle del producto - en escritorio siempre visible, en móvil condicional */}
        {(!isMobile || (isMobile && !showList)) && (
          <div className="flex-1 p-3 md:p-6 detail-content overflow-y-auto">
            {selectedProductoId || isCreatingProducto ? (
              <ProductoDetail
                key={isCreatingProducto ? 'new' : selectedProductoId}
                productoId={selectedProductoId || 'new'}
                onBackToList={handleBackToList}
                isCreating={isCreatingProducto}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <h2 className="text-2xl mb-2">¡Selecciona</h2>
                  <h3 className="text-xl mb-2">Un Producto o</h3>
                  <h3 className="text-xl">Crea un Nuevo Producto!</h3>
                  <NewProductoButton onClick={handleCreateNewProducto} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}