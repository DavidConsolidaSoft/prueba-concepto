'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // No redirigimos hasta que se complete la carga para evitar parpadeos
    if (!loading) {
      if (isAuthenticated) {
        router.push('/facturas');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  // Pantalla de carga mientras se determina la autenticación
  return (
    <div className="flex h-screen items-center justify-center bg-primary">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-xl text-primary">Cargando...</p>
      </div>
    </div>
  );
}