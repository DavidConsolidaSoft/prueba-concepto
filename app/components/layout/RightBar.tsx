// RightBar.tsx - VERSIÓN CORREGIDA
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import ReportCard from '../reportes/ReportCard';
import { useChat } from '@/context/ChatContext';

type RightContentType = 'chat' | 'pagos' | 'informes' | 'report' | 'none';

interface ReportMenuItem {
  id: string;
  title: string;
}

export default function RightBar() {
  const { activeSession, sendMessage, isMessageBeingSent, createNewSession } = useChat();
  const [rightContent, setRightContent] = useState<RightContentType>('none');
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([
    { text: "¿En qué puedo ayudarte hoy?", isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportMenuItem | null>(null);
  
  // ✅ NUEVO: Estado para trackear si hay un selector maestro abierto
  const [isMaestroSelectorOpen, setIsMaestroSelectorOpen] = useState(false);
  
  const availableReports: ReportMenuItem[] = [
    { id: 'ventas-periodo', title: 'Informe de Ventas Mensual' },
    { id: 'top-vendedores', title: 'Vendedores Más Activos' },
    { id: 'top-productos', title: 'Productos Más Vendidos' },
    { id: 'top-clientes', title: 'Clientes Más Activos' }
  ];
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // ✅ ESCUCHAR eventos de selectores maestros Y de facturas
  useEffect(() => {
    const handleMaestroSelectorStateChange = (event: CustomEvent) => {
      const { isOpen } = event.detail;
      setIsMaestroSelectorOpen(isOpen);
      
      // Si se abre un selector maestro, ajustar z-index del panel del chat
      if (isOpen) {
        const rightPanels = document.querySelectorAll('.rightbar-panel');
        rightPanels.forEach(panel => {
          (panel as HTMLElement).style.zIndex = '1001';
        });
      } else {
        const rightPanels = document.querySelectorAll('.rightbar-panel');
        rightPanels.forEach(panel => {
          (panel as HTMLElement).style.zIndex = '10';
        });
      }
    };

    // ✅ NUEVO: Escuchar eventos de selectores de facturas
    const handleFacturaSelectorStateChange = (event: CustomEvent) => {
      const { isOpen } = event.detail;
      setIsMaestroSelectorOpen(isOpen); // Usar el mismo estado para simplificar
      
      // Ajustar z-index del panel del chat
      if (isOpen) {
        const rightPanels = document.querySelectorAll('.rightbar-panel');
        rightPanels.forEach(panel => {
          (panel as HTMLElement).style.zIndex = '1001';
        });
      } else {
        const rightPanels = document.querySelectorAll('.rightbar-panel');
        rightPanels.forEach(panel => {
          (panel as HTMLElement).style.zIndex = '10';
        });
      }
    };
    
    document.addEventListener('maestroSelectorStateChange', handleMaestroSelectorStateChange as EventListener);
    document.addEventListener('facturaSelectorStateChange', handleFacturaSelectorStateChange as EventListener);
    
    return () => {
      document.removeEventListener('maestroSelectorStateChange', handleMaestroSelectorStateChange as EventListener);
      document.removeEventListener('facturaSelectorStateChange', handleFacturaSelectorStateChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleCloseRightPanels = () => {
      setRightContent('none');
    };
    
    document.addEventListener('closeRightPanels', handleCloseRightPanels);
    
    return () => {
      document.removeEventListener('closeRightPanels', handleCloseRightPanels);
    };
  }, []);
  
  // ✅ LÓGICA CORREGIDA: Solo aplicar desplazamiento si NO hay selector maestro/factura abierto
  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    const detailContent = document.querySelector('.detail-content');
    
    // ✅ CONDICIÓN CRÍTICA: Solo desplazar si el chat está abierto Y no hay ningún selector abierto
    // Verificar tanto selectores de productos como de facturas
    const isAnySelectorOpen = isMaestroSelectorOpen || document.body.hasAttribute('data-selector-open');
    
    if (rightContent !== 'none' && !isMobile && !isAnySelectorOpen) {
      mainContent?.classList.add('content-shifted');
      detailContent?.classList.add('content-shifted');
    } else {
      // Siempre remover la clase cuando no se cumplen las condiciones
      mainContent?.classList.remove('content-shifted');
      detailContent?.classList.remove('content-shifted');
    }
    
    // Añadir estilo dinámico si no existe
    if (!document.getElementById('dynamic-right-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'dynamic-right-styles';
      styleEl.innerHTML = `
        .content-shifted {
          transition: margin-right 0.3s ease;
          margin-right: 24rem !important; /* w-96 = 24rem */
        }
        .main-content, .detail-content {
          transition: margin-right 0.3s ease;
          margin-right: 0;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, [rightContent, isMobile, isMaestroSelectorOpen]); // ✅ Mantener isMaestroSelectorOpen como dependencia
  
  const toggleContent = (contentType: RightContentType) => {
    if (rightContent === contentType) {
      setRightContent('none');
      setSelectedReport(null);
    } else {
      setRightContent(contentType);
    }
  };
  
  const currentMessages = activeSession?.messages || messages;
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() === '' || isMessageBeingSent) return;
    
    if (activeSession) {
      await sendMessage(inputText);
      setInputText('');
      return;
    }
    
    const newMessages = [...messages, { text: inputText, isUser: true }];
    setMessages(newMessages);
    setInputText('');
    
    setTimeout(() => {
      setMessages([...newMessages, { text: "Gracias por tu mensaje. Soy el Agente IA y estoy aquí para ayudarte.", isUser: false }]);
    }, 1000);
  };
  
  const openReport = (report: ReportMenuItem) => {
    setSelectedReport(report);
    setRightContent('report');
  };
  
  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };
  
  return (
    <>
      {/* Panel de contenido */}
      {rightContent !== 'none' && (
        <div className="fixed right-[50px] top-14 bottom-0 w-96 bg-secondary flex flex-col overflow-hidden border-l border-primary z-10 rightbar-panel">
          {rightContent === 'chat' && (
            <>
              <div className="flex items-center justify-between px-3 py-2 bg-secondary border-b border-tertiary">
                <div className="flex items-center">
                  <div className="bg-primary p-1 rounded-full mr-2">
                  <Image
                    src="/consolida-lila.png"
                    alt="Agente IA"
                    width={32}
                    height={32}
                  />
                  </div>
                  <span className="text-primary font-medium">Agente IA</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => createNewSession()}
                    className="text-secondary hover:text-primary p-2"
                    title="Nueva conversación"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary">
                {currentMessages.map((msg, index) => (
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
                  </div>
                ))}
                
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
            </>
          )}
          
          {rightContent === 'pagos' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Gestión de Pagos</h2>
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
          
          {rightContent === 'informes' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Informes</h2>
              <div className="space-y-4">
                {availableReports.map(report => (
                  <button 
                    key={report.id}
                    className="bg-primary hover:bg-secondary w-full text-left p-3 rounded-lg"
                    onClick={() => openReport(report)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {report.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {rightContent === 'report' && selectedReport && (
            <ReportCard
              reportId={selectedReport.id}
              title={selectedReport.title}
              onClose={() => {
                setRightContent('informes');
                setSelectedReport(null);
              }}
              isMobile={isMobile}
            />
          )}
        </div>
      )}
      
      <div className="w-16 md:w-12 h-full bg-primary flex flex-col items-center py-4 border-l border-primary relative">
        <div className="absolute top-0 left-0 w-full h-[56px] flex items-center justify-center bg-primary">
          <Image
            src="/consolida-lila.ico"
            onClick={() => toggleContent('chat')}
            alt="Mascota Consolida"
            width={40}
            height={40}
            className="w-10 h-10 cursor-pointer"
          />
        </div>
        
        <div className="h-[56px]"></div>
        
        <div className="mt-8 flex flex-col items-center space-y-8">
          <button 
            onClick={() => toggleContent('pagos')}
            className={`p-2 rounded-lg ${rightContent === 'pagos' ? 'bg-[#666666]' : 'hover:bg-secondary'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <button 
            onClick={() => toggleContent('informes')}
            className={`p-2 rounded-lg ${rightContent === 'informes' || rightContent === 'report' ? 'bg-[#666666]' : 'hover:bg-secondary'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}