import React, { createContext, useState, useContext, ReactNode } from 'react';
import { FacturaData, ProductoFactura } from '@/lib/types/facturaTypes';
import { useFacturaCreacion } from '@/lib/hooks/useFacturaCreacion';
import { useFacturaData } from '@/lib/hooks/useFacturaData';

type FacturaContextType = {
  // Estado de la factura
  facturaData: FacturaData | null;
  productosSeleccionados: ProductoFactura[];
  cajaId: number;
  bodegaId: number;

  // Estado de carga y mensajes
  loading: boolean;
  error: string | null;
  success: boolean;
  successMessage: string;

  // Datos para dropdowns
  clientes: any[];
  vendedores: any[];
  tiposDocumento: any[];
  formasPago: any[];
  condicionesPago: any[];
  loadingMasterData: boolean;

  // Manejo de factura
  setFacturaData: (data: FacturaData) => void;
  updateFacturaField: (field: string, value: any) => void;
  addProductoToFactura: (producto: ProductoFactura) => void;
  updateProductoInFactura: (index: number, producto: ProductoFactura) => void;
  removeProductoFromFactura: (index: number) => void;
  
  // Manejo de productos seleccionados
  setProductosSeleccionados: (productos: ProductoFactura[]) => void;
  addProductoToSeleccionados: (producto: ProductoFactura) => void;
  clearProductosSeleccionados: () => void;
  
  // Acciones de factura
  saveFactura: () => Promise<{ success: boolean, id?: number }>;
  anularFactura: (motivo: string) => Promise<{ success: boolean }>;
};

const FacturaContext = createContext<FacturaContextType | undefined>(undefined);

export const FacturaProvider: React.FC<{
  children: ReactNode;
  facturaId?: string | number;
  isCreating?: boolean;
}> = ({ children, facturaId, isCreating = false }) => {
  // Hook para manejo de factura
  const {
    facturaData,
    loading,
    error,
    success,
    successMessage,
    setFacturaData,
    updateFacturaField,
    addProductoToFactura,
    updateProductoInFactura,
    removeProductoFromFactura,
    saveFactura,
    anularFactura
  } = useFacturaCreacion({ facturaId, isCreating });

  // Hook para obtener datos maestros
  const {
    clientes,
    vendedores,
    tiposDocumento,
    formasPago,
    condicionesPago,
    loading: loadingMasterData,
  } = useFacturaData();

  // Estado para productos seleccionados temporalmente (antes de agregarlos a la factura)
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoFactura[]>([]);

  // Estado para caja y bodega actuales
  const [cajaId, setCajaId] = useState<number>(1);
  const [bodegaId, setBodegaId] = useState<number>(1);

  // Función para agregar un producto a los seleccionados
  const addProductoToSeleccionados = (producto: ProductoFactura) => {
    setProductosSeleccionados(prev => [...prev, producto]);
  };

  // Función para limpiar productos seleccionados
  const clearProductosSeleccionados = () => {
    setProductosSeleccionados([]);
  };

  // Valor del contexto
  const value: FacturaContextType = {
    facturaData,
    productosSeleccionados,
    cajaId,
    bodegaId,
    loading,
    error,
    success,
    successMessage,
    clientes,
    vendedores,
    tiposDocumento,
    formasPago,
    condicionesPago,
    loadingMasterData,
    setFacturaData,
    updateFacturaField,
    addProductoToFactura,
    updateProductoInFactura,
    removeProductoFromFactura,
    setProductosSeleccionados,
    addProductoToSeleccionados,
    clearProductosSeleccionados,
    saveFactura,
    anularFactura
  };

  return (
    <FacturaContext.Provider value={value}>
      {children}
    </FacturaContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useFactura = (): FacturaContextType => {
  const context = useContext(FacturaContext);
  
  if (context === undefined) {
    throw new Error('useFactura debe usarse dentro de un FacturaProvider');
  }
  
  return context;
};

export default FacturaContext;