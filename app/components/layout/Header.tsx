'use client';
import { usePathname } from 'next/navigation';
import ThemeToggle from '../ui/ThemeToggle';

interface HeaderProps {
  isMobile: boolean;
  toggleSidebar?: () => void;
  userName?: string;
}

export default function Header({ isMobile, toggleSidebar, userName = 'Usuario' }: HeaderProps) {
  const pathname = usePathname();
 
  // Título basado en la ruta actual
  const getPageTitle = () => {
    if (pathname.startsWith('/facturas')) {
      return 'Facturas';
    } else if (pathname === '/dashboard') {
      return 'Dashboard';
    }
    return '';
  };
 
  return (
    <header className="h-14 bg-secondary border-b border-secondary flex items-center justify-between px-4 transition-colors duration-300">
      {/* Título de la página */}
      <div className="flex items-center">
        {/* <h1 className="text-lg font-semibold text-primary">{getPageTitle()}</h1> */}
      </div>
     
      {/* Controles del usuario */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <div className="text-sm text-primary">
          {userName}
        </div>
      </div>
    </header>
  );
}