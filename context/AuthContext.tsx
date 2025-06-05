// /context/AuthContext.tsx - Versión corregida para el problema del token
'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AuthService from '@/lib/auth';

interface User {
  id: number;
  email: string;
  nombre: string;
  admin?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshAuthState: () => void; // Nueva función para forzar actualización
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  loginWithPassword: async () => {},
  loginWithMicrosoft: async () => {},
  logout: async () => {},
  clearError: () => {},
  refreshAuthState: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loginInProgress = useRef(false);
  const authCheckInProgress = useRef(false);

  // Función para verificar estado de autenticación
  const checkAuthState = () => {
    if (authCheckInProgress.current) {
      console.log('🔄 Auth check ya en progreso, saltando...');
      return;
    }

    try {
      authCheckInProgress.current = true;
      console.log('🔍 Verificando estado de autenticación...');
      
      const isAuth = AuthService.isAuthenticated();
      console.log('📊 Estado de autenticación:', isAuth);
      
      if (isAuth) {
        const userData = AuthService.getUserInfo();
        console.log('👤 Datos de usuario:', userData);
        
        if (userData) {
          setIsAuthenticated(true);
          setUser(userData);
          console.log('✅ Usuario autenticado correctamente');
        } else {
          console.log('❌ No se encontraron datos de usuario, limpiando estado');
          AuthService.logout();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log('❌ Usuario no autenticado');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('❌ Error verificando estado de autenticación:', err);
      // Si hay error leyendo el estado, limpiar todo
      AuthService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
      authCheckInProgress.current = false;
    }
  };

  // Función pública para forzar actualización del estado
  const refreshAuthState = () => {
    console.log('🔄 Forzando actualización de estado de auth...');
    checkAuthState();
  };

  // Verificar estado de autenticación al cargar
  useEffect(() => {
    console.log('🚀 AuthProvider: Inicializando...');
    
    // Pequeño delay para asegurar que localStorage esté disponible
    const timer = setTimeout(() => {
      checkAuthState();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Escuchar cambios en localStorage (para detectar cambios de otras pestañas/ventanas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'is_authenticated' || e.key === 'access_token' || e.key === 'user_info') {
        console.log('📡 Cambio detectado en localStorage:', e.key);
        checkAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Función para limpiar errores
  const clearError = () => {
    setError(null);
  };

  // Función para iniciar sesión con correo y contraseña
  const loginWithPassword = async (email: string, password: string) => {
    if (loginInProgress.current) {
      console.log('🔄 Login ya en progreso, ignorando...');
      return;
    }

    setLoading(true);
    setError(null);
    loginInProgress.current = true;
    
    try {
      console.log('🔐 Iniciando login con contraseña...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error de autenticación');
      }
      
      const data = await response.json();
      console.log('✅ Login con contraseña exitoso:', data);
      
      // Guardar datos de autenticación
      AuthService.storeAuthData(data);
      
      // Actualizar estado
      setIsAuthenticated(true);
      setUser(data.user_info);
      
      console.log('✅ Estado actualizado después del login');
    } catch (err) {
      console.error('❌ Error en login con contraseña:', err);
      setError(err instanceof Error ? err.message : 'Error de inicio de sesión');
      throw err;
    } finally {
      setLoading(false);
      loginInProgress.current = false;
    }
  };

  // Función para iniciar sesión con Microsoft
  const loginWithMicrosoft = async () => {
    if (loginInProgress.current) {
      console.log('🔄 Login con Microsoft ya en progreso, ignorando...');
      return;
    }

    setLoading(true);
    setError(null);
    loginInProgress.current = true;
    
    try {
      console.log('🔐 Iniciando login con Microsoft...');
      // AuthService se encarga de la redirección
      await AuthService.loginWithMicrosoft();
      // Nota: después de esta llamada, la página se redirigirá
    } catch (err) {
      console.error('❌ Error en login con Microsoft:', err);
      setLoading(false);
      loginInProgress.current = false;
      setError(err instanceof Error ? err.message : 'Error de inicio de sesión con Microsoft');
      throw err;
    }
    // No reseteamos loginInProgress aquí porque la página se va a recargar
  };

  // Función para cerrar sesión
  const logout = async () => {
    setLoading(true);
    
    try {
      console.log('🚪 Cerrando sesión...');
      const token = AuthService.getToken();
      
      // Llamar al endpoint de logout en el backend si hay token
      if (token) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (logoutError) {
          // No fallar el logout local si el servidor no responde
          console.error('❌ Error en logout del servidor:', logoutError);
        }
      }
      
      // Limpiar almacenamiento local
      AuthService.logout();
      
      // Actualizar estado
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
      loginInProgress.current = false;
      
      console.log('✅ Sesión cerrada exitosamente');
    } catch (err) {
      console.error('❌ Error en logout:', err);
    } finally {
      setLoading(false);
    }
  };

  console.log('🔍 AuthProvider render:', { 
    isAuthenticated, 
    user: user?.email, 
    loading 
  });

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        loginWithPassword,
        loginWithMicrosoft,
        logout,
        clearError,
        refreshAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};