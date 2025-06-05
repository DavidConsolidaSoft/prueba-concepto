// /lib/auth.ts - Versión completa y corregida
import { API_BASE_URL } from './api/config'; // Usar configuración centralizada

class AuthService {
  // Estado para prevenir múltiples inicializaciones
  private static isProcessing = false;

  // Método para manejar la respuesta del callback
  static handleCallback(authResultStr: string): any {
    try {
      console.log('🔍 Procesando callback con auth_result...');
      console.log('📄 Auth result string (primeros 200 chars):', authResultStr.substring(0, 200));
      
      // Decodificar la cadena URL encoded
      const decodedStr = decodeURIComponent(authResultStr);
      console.log('🔓 String decodificado:', decodedStr.substring(0, 200));
      
      // Parsear el JSON
      const authData = JSON.parse(decodedStr);
      console.log('📦 Datos parseados:', {
        status: authData.status,
        hasToken: !!authData.access_token,
        hasUserInfo: !!authData.user_info,
        userEmail: authData.user_info?.email
      });
     
      // Verificar si hay un error en la respuesta
      if (authData.status === 'error') {
        console.error('❌ Error en authData:', authData.message);
        throw new Error(authData.message || 'Error de autenticación');
      }
     
      // Almacenar los datos de autenticación
      console.log('💾 Almacenando datos de autenticación...');
      this.storeAuthData(authData);
      
      // Verificar que se almacenó correctamente
      const verification = {
        token: !!this.getToken(),
        user: !!this.getUserInfo(),
        authenticated: this.isAuthenticated()
      };
      console.log('✅ Verificación de almacenamiento:', verification);
     
      return authData;
    } catch (error) {
      console.error('❌ Error al procesar respuesta de autenticación:', error);
      throw error;
    }
  }
 
  // Método para almacenar los datos de autenticación
  static storeAuthData(authData: any): void {
    try {
      console.log('💾 Almacenando datos en localStorage...');
      
      // Guardar token en localStorage
      if (authData.access_token) {
        localStorage.setItem('access_token', authData.access_token);
        console.log('✅ Token almacenado');
      }
     
      // Guardar info del usuario
      if (authData.user_info) {
        localStorage.setItem('user_info', JSON.stringify(authData.user_info));
        console.log('✅ Info de usuario almacenada:', authData.user_info.email);
      }
     
      // Guardar info de la empresa si existe
      if (authData.empresa_info) {
        localStorage.setItem('empresa_info', JSON.stringify(authData.empresa_info));
        console.log('✅ Info de empresa almacenada');
      }
     
      // Marcar como autenticado
      localStorage.setItem('is_authenticated', 'true');
      console.log('✅ Estado de autenticación marcado como true');
      
      // Forzar un evento de storage para notificar a otros componentes
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'is_authenticated',
        newValue: 'true',
        storageArea: localStorage
      }));
      
    } catch (error) {
      console.error('❌ Error almacenando datos:', error);
      throw error;
    }
  }

  // Método para intercambiar código por token (nuevo)
  static async exchangeCodeForToken(code: string): Promise<any> {
    try {
      console.log('🔄 Intercambiando código por token...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/callback-debug?code=${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en respuesta:', errorText);
        
        let errorMessage = 'Error al intercambiar código por token';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const authData = await response.json();
      console.log('✅ Intercambio exitoso:', {
        status: authData.status,
        hasToken: !!authData.access_token,
        userEmail: authData.user_info?.email
      });
      
      if (authData.status === 'error') {
        throw new Error(authData.message || 'Error de autenticación');
      }
      
      return authData;
      
    } catch (error) {
      console.error('❌ Error en intercambio de código:', error);
      throw error;
    }
  }
 
  // Método mejorado para iniciar el proceso de autenticación con Microsoft
  static async loginWithMicrosoft(): Promise<void> {
    // Prevenir múltiples llamadas simultáneas
    if (this.isProcessing) {
      console.log('🔄 Login ya en proceso, ignorando...');
      return;
    }

    try {
      this.isProcessing = true;
      console.log('🚀 Iniciando login con Microsoft...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/azure-login`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
     
      const data = await response.json();
     
      if (!data.auth_url) {
        throw new Error('No se pudo obtener la URL de autenticación');
      }
     
      console.log('🔗 Redirigiendo a Microsoft...');
      // Redireccionar a la URL de autenticación de Microsoft
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('❌ Error al iniciar la autenticación con Microsoft:', error);
      this.isProcessing = false; // Reset en caso de error
      throw error;
    }
    // No reseteamos isProcessing aquí porque la página se va a recargar
  }
 
  // Método para cerrar sesión
  static logout(): void {
    console.log('🚪 Cerrando sesión y limpiando localStorage...');
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('empresa_info');
    localStorage.removeItem('is_authenticated');
    this.isProcessing = false; // Reset del estado
    
    // Disparar evento de storage para notificar cambios
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'is_authenticated',
      newValue: null,
      storageArea: localStorage
    }));
    
    console.log('✅ Sesión cerrada correctamente');
  }
 
  // Método para verificar si el usuario está autenticado
  static isAuthenticated(): boolean {
    const isAuth = localStorage.getItem('is_authenticated') === 'true';
    const hasToken = !!localStorage.getItem('access_token');
    const hasUser = !!localStorage.getItem('user_info');
    
    const result = isAuth && hasToken && hasUser;
    
    console.log('🔍 Verificación de autenticación:', {
      isAuth,
      hasToken,
      hasUser,
      result
    });
    
    return result;
  }
 
  // Método para obtener el token
  static getToken(): string | null {
    const token = localStorage.getItem('access_token');
    console.log('🔑 Obteniendo token:', !!token);
    return token;
  }
 
  // Método para obtener la información del usuario
  static getUserInfo(): any {
    try {
      const userInfo = localStorage.getItem('user_info');
      if (!userInfo) {
        console.log('👤 No hay info de usuario en localStorage');
        return null;
      }
      
      const parsed = JSON.parse(userInfo);
      console.log('👤 Info de usuario obtenida:', parsed.email);
      return parsed;
    } catch (error) {
      console.error('❌ Error parseando info de usuario:', error);
      return null;
    }
  }

  // Método para limpiar estado de procesamiento (útil para depuración)
  static resetProcessingState(): void {
    this.isProcessing = false;
    console.log('🔄 Estado de procesamiento reseteado');
  }

  // Método para debug - mostrar estado actual
  static debugState(): void {
    console.log('🐛 === DEBUG AUTH STATE ===');
    console.log('Token:', !!this.getToken());
    console.log('User Info:', this.getUserInfo());
    console.log('Is Authenticated:', this.isAuthenticated());
    console.log('Processing:', this.isProcessing);
    console.log('========================');
  }
}

export default AuthService;