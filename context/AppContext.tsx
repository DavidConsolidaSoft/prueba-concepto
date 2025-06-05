'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

// Tipos para el contenido del panel derecho
type RightContentType = 'chat' | 'pagos' | 'informes' | 'productos' | 'report' | 'none';

// Tipo para el reporte seleccionado
interface ReportItem {
  id: string;
  title: string;
}

// Tipo para el contexto
interface AppContextType {
  rightContent: RightContentType;
  setRightContent: (content: RightContentType) => void;
  selectedReport: ReportItem | null;
  setSelectedReport: (report: ReportItem | null) => void;
}

// Crear el contexto
const AppContext = createContext<AppContextType | undefined>(undefined);

// Proveedor del contexto
export function AppProvider({ children }: { children: ReactNode }) {
  const [rightContent, setRightContent] = useState<RightContentType>('none');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  return (
    <AppContext.Provider
      value={{
        rightContent,
        setRightContent,
        selectedReport,
        setSelectedReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Hook para usar el contexto
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext debe usarse dentro de un AppProvider');
  }
  return context;
}