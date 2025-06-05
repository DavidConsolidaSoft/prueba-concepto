'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/app/components/layout/AppLayout';
import FacturasList from '@/app/components/facturas/FacturasList';
import FacturaDetail from '@/app/components/facturas/factura-detail/FacturaDetail';
import NewFacturaButton from '@/app/components/facturas/NewFacturaButton';

export default function FacturasPage() {
  const [selectedFacturaId, setSelectedFacturaId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showList, setShowList] = useState(true);
  const [isCreatingFactura, setIsCreatingFactura] = useState(false);
 
  // Estado para los productos seleccionados
  const [productosSeleccionados, setProductosSeleccionados] = useState<any[]>([]);
 
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
 
  // En móvil, al seleccionar una factura ocultamos la lista y mostramos el detalle
  useEffect(() => {
    if (isMobile && (selectedFacturaId || isCreatingFactura)) {
      setShowList(false);
    }
  }, [selectedFacturaId, isCreatingFactura, isMobile]);
 
  // Manejador para volver a la lista en móvil
  const handleBackToList = () => {
    setShowList(true);
    setSelectedFacturaId(null);
    setIsCreatingFactura(false);
  };
  
  // Función para crear nueva factura
  const handleCreateNewFactura = () => {
    setSelectedFacturaId(null); 
    setIsCreatingFactura(true);
    setProductosSeleccionados([]); // Limpiar productos seleccionados
    if (isMobile) {
      setShowList(false);
    }
  };
 
  // Función para mostrar el selector de productos
  const handleShowProductSelector = () => {
    console.log("Mostrar selector de productos");
  };
 
  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Lista de facturas - en escritorio siempre visible, en móvil condicional */}
        {(!isMobile || (isMobile && showList)) && (
          <div className={`${isMobile ? 'w-full' : 'w-[400px]'} h-full flex-shrink-0`}>
            <FacturasList
              onSelectFactura={(id) => {
                setSelectedFacturaId(id);
                setIsCreatingFactura(false);
                if (isMobile) {
                  setShowList(false);
                }
              }}
              selectedFacturaId={selectedFacturaId}
              onCreateFactura={handleCreateNewFactura}
            />
          </div>
        )}
       
        {/* Detalle de la factura - en escritorio siempre visible, en móvil condicional */}
        {(!isMobile || (isMobile && !showList)) && (
          <div className="flex-1 p-3 md:p-6 detail-content overflow-y-auto">
            {selectedFacturaId || isCreatingFactura ? (
              <FacturaDetail
                key={isCreatingFactura ? 'new' : selectedFacturaId}
                facturaId={selectedFacturaId || 'new'}
                onBackToList={handleBackToList}
                onShowProductSelector={handleShowProductSelector}
                productosSeleccionados={productosSeleccionados}
                setProductosSeleccionados={setProductosSeleccionados}
                isCreating={isCreatingFactura}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <h2 className="text-2xl mb-2">¡Selecciona</h2>
                  <h3 className="text-xl mb-2">Una Factura o</h3>
                  <h3 className="text-xl">Crea una Nueva Factura!</h3>
                  <NewFacturaButton onClick={handleCreateNewFactura} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}