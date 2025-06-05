'use client';
import { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import RightBar from './RightBar';
import MobileBottomNav from '../mobile/MobileBottomNav';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useChat } from '@/context/ChatContext';
import Image from 'next/image';
import ReportCard from '../reportes/ReportCard';

// Type para el contenido móvil (compatible con ToolType en MobileBottomNav)
type MobileRightContentType = 'chat' | 'pagos' | 'informes' | 'report' | 'none';

// Estructura para un reporte en el menú
interface ReportMenuItem {
  id: string;
  title: string;
}

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { activeSession, sendMessage, isMessageBeingSent, createNewSession } = useChat();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileRightContent, setMobileRightContent] = useState<MobileRightContentType>('none');
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(true);
  const [inputText, setInputText] = useState('');
  const { isAuthenticated, loading, logout, user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<ReportMenuItem | null>(null);
  const router = useRouter();

  // Lista de reportes disponibles para el menú de informes
  const availableReports: ReportMenuItem[] = [
    { id: 'ventas-periodo', title: 'Informe de Ventas Mensual' },
    { id: 'top-vendedores', title: 'Vendedores Más Activos' },
    { id: 'top-productos', title: 'Productos Más Vendidos' },
    { id: 'top-clientes', title: 'Clientes Más Activos' }
  ];

  // Verificar autenticación cuando se carga el componente
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Ajustar configuración según el tamaño de pantalla
      if (!mobile) {
        setMobileRightContent('none');
      }
    };

    // Inicializar en montaje
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Escuchar eventos personalizados para los selectores de factura
  useEffect(() => {
    const handleCloseRightPanels = () => {
      // Cuando se abre el selector de productos, cerramos cualquier panel de la derecha
      setMobileRightContent('none');
    };

    document.addEventListener('closeRightPanels', handleCloseRightPanels);
    
    return () => {
      document.removeEventListener('closeRightPanels', handleCloseRightPanels);
    };
  }, []);

  // Manejar contenido de la barra derecha en móvil
  const handleMobileRightContent = (content: MobileRightContentType) => {
    if (mobileRightContent === content) {
      setMobileRightContent('none');
      setSelectedReport(null);
    } else {
      setMobileRightContent(content);
    }
  };

  // Función para abrir un reporte específico en móvil
  const openMobileReport = (report: ReportMenuItem) => {
    setSelectedReport(report);
    setMobileRightContent('report');
  };

  // Alternar el menú lateral en móvil
  const toggleMobileMenu = () => {
    setIsMenuCollapsed(!isMenuCollapsed);
  };

  // Manejar cierre de sesión
  const handleLogout = async () => {
    try {
      await logout();
      // La redirección se maneja en el AuthContext
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  // Función para enviar mensaje en el chat móvil
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() === '' || isMessageBeingSent) return;
    
    await sendMessage(inputText);
    setInputText('');
  };
  
  // Función para formatear el texto del mensaje (para manejar saltos de línea)
  const formatMessageText = (text: string) => {
    // Convertir saltos de línea en <br>
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  // Verificar si el selector de productos o clientes está abierto
  const isProductSelectorOpen = () => {
    return document.body.hasAttribute('data-selector-open');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-primary">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // La redirección ya se manejó en el useEffect
  }

  // Este es el valor que se pasará al MobileBottomNav
  // No usamos null, en su lugar usamos 'none' cuando no hay contenido activo
  const activeTool = mobileRightContent;

  return (
    <div className="flex h-screen bg-primary text-primary overflow-hidden">
      {/* MODO WEB: Estructura original de tres columnas */}
      {!isMobile && (
        <>
          {/* Sidebar - modo web */}
          <div className="w-16 md:w-16 flex-shrink-0">
            <Sidebar onLogout={handleLogout} />
          </div>
          
          {/* Contenido principal - modo web */}
          <div className={`flex flex-col flex-1 overflow-hidden ${isProductSelectorOpen() ? 'pr-96' : ''}`}>
            <Header 
              isMobile={false} 
              toggleSidebar={() => {}} 
              userName={user?.nombre || 'Usuario'}
            />
            <main className="flex-1 overflow-auto p-0">
              {children}
            </main>
          </div>
          
          {/* Barra lateral derecha - modo web */}
          <div className={`w-16 md:w-12 flex-shrink-0 ${isProductSelectorOpen() ? 'opacity-50 pointer-events-none' : ''}`}>
            <RightBar />
          </div>
        </>
      )}
      
      {/* MODO MÓVIL: Estructura en "L" */}
      {isMobile && (
        <div className="flex flex-col h-full w-full">
          <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100% - 60px)' }}>
            {/* Sidebar - modo móvil, siempre visible */}
            <div className="w-10 h-full flex-shrink-0">
              <Sidebar onLogout={handleLogout} />
            </div>
            
            {/* Contenido principal - modo móvil */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header 
                isMobile={true} 
                toggleSidebar={toggleMobileMenu}
                userName={user?.nombre || 'Usuario'}
              />
              <main className="flex-1 overflow-auto p-0">
                {children}
              </main>
            </div>
          </div>
          
          {/* Barra inferior - modo móvil, siempre visible */}
          <div className="h-10 w-full bg-primary border-t border-secondary">
            <MobileBottomNav 
              onChatClick={() => handleMobileRightContent('chat')}
              onPagosClick={() => handleMobileRightContent('pagos')}
              onInformesClick={() => handleMobileRightContent('informes')}
              activeTool={mobileRightContent as 'chat' | 'pagos' | 'informes' | null}
            />
          </div>
        </div>
      )}
      
      {/* Modal para contenido de la barra derecha en móvil - VERSIÓN CORREGIDA */}
      {isMobile && mobileRightContent !== 'none' && !isProductSelectorOpen() && (
        <>
          {/* Overlay central semitransparente - NO cubre sidebar ni bottomNav */}
          <div 
            className="fixed top-0 bottom-10.5 left-10 right-0 z-40 bg-black/75"
            onClick={() => {
              setMobileRightContent('none');
              setSelectedReport(null);
            }}
          ></div>
          
          {/* Panel principal del modal */}
          <div className="fixed top-0 bottom-10.5 left-10 right-0 z-50 flex flex-col">
            <div className="flex-1 bg-secondary flex flex-col overflow-hidden shadow-lg border border-primary">
              {/* Cabecera con botón para cerrar - Solo visible cuando no es el modo reporte */}
              {mobileRightContent !== 'report' && (
                <div className="flex items-center justify-between p-4 border-b border-tertiary">
                  <h3 className="text-xl font-semibold">
                    {mobileRightContent === 'chat' ? 'Agente IA' : 
                    mobileRightContent === 'pagos' ? 'Gestión de Pagos' : 'Informes'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {mobileRightContent === 'chat' && (
                      <button
                        onClick={() => createNewSession()}
                        className="text-secondary hover:text-primary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setMobileRightContent('none');
                        setSelectedReport(null);
                      }} 
                      className="text-secondary hover:text-primary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Contenido específico según el tipo */}
              {mobileRightContent === 'chat' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Mensajes del agente y del usuario */}
                    {activeSession?.messages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} items-end`}>
                        {!msg.isUser && (
                          <div className="w-8 h-8 mr-2 flex-shrink-0">
                            <Image
                              src="/consolida-lila.ico"
                              alt="Agente IA"
                              width={32}
                              height={32}
                              className="w-full h-full"
                            />
                          </div>
                        )}
                        <div className={`max-w-[80%] rounded-lg px-3 py-2 ${msg.isUser ? 'bg-blue-600' : 'bg-primary'}`}>
                          {typeof msg.text === 'string' ? formatMessageText(msg.text) : msg.text}
                        </div>
                        {msg.isUser && (
                          <div className="w-8 h-8 ml-2 flex-shrink-0 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Indicador de escritura */}
                    {isMessageBeingSent && (
                      <div className="flex justify-start items-end">
                        <div className="w-8 h-8 mr-2 flex-shrink-0">
                          <Image
                            src="/consolida-lila.ico"
                            alt="Agente IA"
                            width={32}
                            height={32}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="bg-primary text-primary px-3 py-2 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.0s' }}></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Input para escribir mensajes */}
                  <div className="p-3 bg-secondary border-t border-secondary">
                    <form onSubmit={handleSendMessage} className="flex items-center">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-primary text-primary rounded-lg px-3 py-2 focus:outline-none"
                        disabled={isMessageBeingSent}
                      />
                      <button 
                        type="submit"
                        className={`ml-2 ${
                          isMessageBeingSent || !inputText.trim()
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-primary rounded-lg p-2 transition-colors`}
                        disabled={isMessageBeingSent || !inputText.trim()}
                      >
                        {isMessageBeingSent ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
              
              {mobileRightContent === 'pagos' && (
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="bg-primary rounded-lg p-4 mb-4">
                    <h3 className="font-medium mb-2">Pagos Pendientes</h3>
                    <p className="text-secondary">No hay pagos pendientes</p>
                  </div>
                  <div className="bg-primary rounded-lg p-4">
                    <h3 className="font-medium mb-2">Últimos Pagos</h3>
                    <div className="text-sm">
                      <div className="border-b border-[#555555] py-2">
                        <p className="font-medium">Factura #S00083</p>
                        <p className="text-secondary">$45,000.00 - 28/04/2025</p>
                      </div>
                      <div className="border-b border-[#555555] py-2">
                        <p className="font-medium">Factura #S00080</p>
                        <p className="text-secondary">$32,500.00 - 15/04/2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {mobileRightContent === 'informes' && (
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {availableReports.map(report => (
                      <button 
                        key={report.id}
                        className="bg-primary hover:bg-secondary w-full text-left p-3 rounded-lg flex items-center"
                        onClick={() => openMobileReport(report)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {report.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {mobileRightContent === 'report' && selectedReport && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <ReportCard
                    reportId={selectedReport.id}
                    title={selectedReport.title}
                    onClose={() => {
                      setMobileRightContent('informes');
                      setSelectedReport(null);
                    }}
                    isMobile={true}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}