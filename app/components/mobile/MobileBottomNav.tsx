'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Tipo actualizado para activeTool
type ToolType = 'chat' | 'pagos' | 'informes' | 'none' | null | undefined;

// Interface para las propiedades
interface MobileBottomNavProps {
  onChatClick: () => void;
  onPagosClick: () => void;
  onInformesClick: () => void;
  activeTool?: ToolType;
}

export default function MobileBottomNav({ 
  onChatClick, 
  onPagosClick, 
  onInformesClick, 
  activeTool 
}: MobileBottomNavProps) {
  const pathname = usePathname();
  
  // Estado para rastrear el botón activo actualmente
  const [activeButton, setActiveButton] = useState<string | null>(null);
  
  // Actualizar el estado local basado en la prop activeTool
  useEffect(() => {
    if (activeTool && activeTool !== 'none') {
      setActiveButton(activeTool);
    } else {
      setActiveButton(null);
    }
  }, [activeTool]);
  
  // Manejadores para los botones con toggle y estado
  const handleChatClick = () => {
    onChatClick();
  };
  
  const handlePagosClick = () => {
    onPagosClick();
  };
  
  const handleInformesClick = () => {
    onInformesClick();
  };
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-tertiary border-t border-[#555555] shadow-lg flex justify-around items-center py-0 z-30">
      {/* Botón Pagos */}
      <button
        onClick={handlePagosClick}
        className="flex flex-col items-center justify-center p-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 ${activeButton === 'pagos' ? 'text-blue-400' : 'text-tertiary'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      {/* Botón Informes */}
      <button
        onClick={handleInformesClick}
        className="flex flex-col items-center justify-center p-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 ${activeButton === 'informes' ? 'text-blue-400' : 'text-tertiary'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>
      
      {/* Botón Agente IA */}
      <button
        onClick={handleChatClick}
        className="flex flex-col items-center justify-center p-0 relative"
      >
        <div className={`h-10 w-10 rounded-full bg-tertiary border-4 ${activeButton === 'chat' ? 'border-blue-400' : 'border-[#555555]'} absolute -top-6 flex items-center justify-center`}>
          <Image
            src="/consolida-lila.ico"
            alt="Agente IA"
            width={28}
            height={28}
            className="w-7 h-7"
          />
        </div>
      </button>
    </div>
  );
}