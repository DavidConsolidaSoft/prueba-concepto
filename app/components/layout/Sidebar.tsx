'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

// Definimos la interfaz para las props
interface SidebarProps {
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  onLogout?: () => void;
}

export default function Sidebar({ isCollapsed = false, toggleCollapse, onLogout }: SidebarProps) {
  const pathname = usePathname();
 
  // Determinar si un enlace está activo
  const isActive = (path: string) => pathname === path || pathname.startsWith(path);
  
  return (
    <div 
      className={`h-full bg-primary flex flex-col items-center py-4 border-r border-primary overflow-y-auto transition-all duration-300`}
    >
      {/* Enlace a Dashboard */}
      <Link
        href="/dashboard"
        className={`flex justify-center items-center w-full py-4 text-sm transition-colors duration-300 ${
          isActive('/dashboard') ? 'text-primary bg-secondary' : 'text-secondary hover:text-primary hover:bg-secondary'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Link>
     
      {/* Enlace a Facturas */}
      <Link
        href="/facturas"
        className={`flex justify-center items-center w-full py-4 text-sm transition-colors duration-300 ${
          isActive('/facturas') ? 'text-primary bg-secondary' : 'text-secondary hover:text-primary hover:bg-secondary'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </Link>

      {/* Enlace a Clientes */}
      <Link
        href="/clientes"
        className={`flex justify-center items-center w-full py-4 text-sm transition-colors duration-300 ${
          isActive('/clientes') ? 'text-primary bg-secondary' : 'text-secondary hover:text-primary hover:bg-secondary'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </Link>

      {/* Enlace a Productos */}
      <Link
        href="/productos"
        className={`flex justify-center items-center w-full py-4 text-sm transition-colors duration-300 ${
          isActive('/productos') ? 'text-primary bg-secondary' : 'text-secondary hover:text-primary hover:bg-secondary'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </Link>

      {/* Enlace a Reportes */}
      <Link
        href="/reportes"
        className={`flex justify-center items-center w-full py-4 text-sm transition-colors duration-300 ${
          isActive('/reportes') ? 'text-primary bg-secondary' : 'text-secondary hover:text-primary hover:bg-secondary'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </Link>
     
      {/* Botón Cerrar Sesión (en la parte inferior) */}
      <div className="mt-auto">
        <button
          onClick={onLogout}
          className="flex justify-center items-center w-full py-4 text-sm text-secondary hover:text-primary hover:bg-secondary transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  );
}