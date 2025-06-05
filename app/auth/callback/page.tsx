'use client';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthService from '@/lib/auth';

function AuthCallbackContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuthState } = useAuth();
  const hasProcessed = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Prevenir doble procesamiento
    if (hasProcessed.current) {
      console.log('🔄 Callback ya procesado, saltando...');
      return;
    }
    
    const handleCallback = async () => {
      try {
        hasProcessed.current = true;
        console.log('🚀 === INICIANDO PROCESAMIENTO DE CALLBACK ===');
        
        // Limpiar cualquier timeout anterior
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // OPCIÓN 1: Parámetro auth_result directo del backend
        const authResult = searchParams?.get('auth_result');
        if (authResult) {
          console.log('📦 Procesando auth_result directo');
          console.log('📄 Auth result (primeros 100 chars):', authResult.substring(0, 100));
          
          try {
            const authData = AuthService.handleCallback(authResult);
            console.log('✅ Autenticación procesada exitosamente:', {
              status: authData.status,
              user: authData.user_info?.email,
              hasToken: !!authData.access_token
            });
            
            // Verificar que los datos se almacenaron correctamente
            const storedToken = AuthService.getToken();
            const storedUser = AuthService.getUserInfo();
            const isAuth = AuthService.isAuthenticated();
            
            console.log('📊 Verificación de almacenamiento:', {
              storedToken: !!storedToken,
              storedUser: !!storedUser,
              isAuthenticated: isAuth
            });
            
            if (!storedToken || !storedUser || !isAuth) {
              throw new Error('Los datos de autenticación no se almacenaron correctamente');
            }
            
            // Forzar actualización del contexto de autenticación
            console.log('🔄 Forzando actualización del contexto...');
            refreshAuthState();
            
            // Delay más largo para asegurar que el contexto se actualice
            setTimeout(() => {
              console.log('🔄 Redirigiendo a /facturas...');
              router.replace('/facturas');
            }, 500);
            return;
          } catch (err) {
            console.error('❌ Error procesando auth_result:', err);
            setError(err instanceof Error ? err.message : 'Error al procesar autenticación');
            setLoading(false);
            return;
          }
        }
        
        // OPCIÓN 2: Código de autorización para intercambio
        const code = searchParams?.get('code');
        if (code) {
          console.log('🔄 Intercambiando código por token');
          
          try {
            const authData = await AuthService.exchangeCodeForToken(code);
            console.log('✅ Intercambio exitoso:', {
              status: authData.status,
              user: authData.user_info?.email,
              hasToken: !!authData.access_token
            });
            
            // Almacenar datos de autenticación
            AuthService.storeAuthData(authData);
            
            // Verificar almacenamiento
            const storedToken = AuthService.getToken();
            const storedUser = AuthService.getUserInfo();
            const isAuth = AuthService.isAuthenticated();
            
            console.log('📊 Verificación de almacenamiento:', {
              storedToken: !!storedToken,
              storedUser: !!storedUser,
              isAuthenticated: isAuth
            });
            
            // Forzar actualización del contexto
            refreshAuthState();
            
            // Redirigir
            setTimeout(() => {
              console.log('🔄 Redirigiendo a /facturas...');
              router.replace('/facturas');
            }, 500);
            return;
          } catch (err) {
            console.error('❌ Error en intercambio de código:', err);
            setError(err instanceof Error ? err.message : 'Error al obtener token de acceso');
            setLoading(false);
            return;
          }
        }
        
        // OPCIÓN 3: Error en los parámetros
        const errorParam = searchParams?.get('error');
        if (errorParam) {
          const errorDescription = searchParams?.get('error_description') || 'Error de autenticación';
          console.error('❌ Error en callback:', errorParam, errorDescription);
          setError(`Error de autenticación: ${errorDescription}`);
          setLoading(false);
          return;
        }
        
        // Si no hay parámetros relevantes
        console.error('❌ No se encontraron parámetros de autenticación válidos');
        setError('No se encontraron datos de autenticación válidos');
        setLoading(false);
        
      } catch (error) {
        console.error('❌ Error inesperado en callback:', error);
        setError(error instanceof Error ? error.message : 'Error inesperado durante la autenticación');
        setLoading(false);
      }
    };
    
    // Configurar timeout de seguridad
    timeoutRef.current = setTimeout(() => {
      if (loading && !error) {
        console.error('⏰ Timeout en callback de autenticación');
        setError('Tiempo de espera agotado. Por favor, inténtelo de nuevo.');
        setLoading(false);
      }
    }, 15000); // 15 segundos de timeout
    
    handleCallback();
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [router, searchParams, refreshAuthState, loading, error]);
  
  // Componente de error
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl text-white font-bold mb-4">Error de Autenticación</h2>
          <p className="text-gray-300 mb-6 text-sm">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                console.log('🔄 Redirigiendo al login desde error...');
                router.replace('/login');
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Volver al Login
            </button>
            <button
              onClick={() => {
                console.log('🔄 Reintentando callback...');
                hasProcessed.current = false;
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Componente de carga
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl text-white mb-2">Procesando Autenticación...</h2>
        <p className="text-gray-400 text-sm mb-4">Por favor espere mientras validamos sus credenciales.</p>
        
        {/* Indicador de progreso más detallado */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>✅ Conectando con Microsoft</p>
          <p>🔄 Validando credenciales</p>
          <p>📦 Almacenando datos de sesión</p>
        </div>
      </div>
    </div>
  );
}

// Componente de loading para Suspense
function AuthCallbackLoading() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl text-white mb-2">Cargando Autenticación...</h2>
        <p className="text-gray-400 text-sm">Preparando el sistema de autenticación...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}