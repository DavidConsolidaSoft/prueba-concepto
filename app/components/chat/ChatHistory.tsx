'use client';
import { useState, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { ChatSession } from '@/lib/chat-service';
import Image from 'next/image';

interface ChatHistoryProps {
  onClose: () => void;
}

export default function ChatHistory({ onClose }: ChatHistoryProps) {
  const { sessions, activeSession, setActiveSession, createNewSession } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);

  // Filtrar sesiones cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Si no hay término de búsqueda, mostrar todas las sesiones
      setFilteredSessions(sessions);
    } else {
      // Filtrar por título o contenido de mensajes
      const filtered = sessions.filter(session => 
        session.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        session.messages.some(msg => 
          msg.isUser && msg.text.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredSessions(filtered);
    }
  }, [searchTerm, sessions]);

  // Formato de fecha para mostrar
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    
    // Verificar si es hoy
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return `Hoy, ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Verificar si es ayer
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return `Ayer, ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Formato normal para otras fechas
    return d.toLocaleString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const handleNewChat = () => {
    createNewSession();
    onClose();
  };

  const handleSelectSession = (session: ChatSession) => {
    setActiveSession(session);
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-tertiary">
      {/* Encabezado */}
      <div className="flex items-center justify-between p-4 border-b border-[#444444]">
        <h2 className="text-xl font-medium">Historial de conversaciones</h2>
        <button
          onClick={onClose}
          className="text-secondary hover:text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Búsqueda y botón de nueva conversación */}
      <div className="p-4 space-y-3">
        <div className="flex items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar conversaciones..."
              className="w-full p-2 pl-10 bg-primary rounded-md text-primary focus:outline-none"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <button
          onClick={handleNewChat}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-primary rounded-md flex items-center justify-center font-medium transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva conversación
        </button>
      </div>
      
      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredSessions.length > 0 ? (
          <div className="space-y-2">
            {filteredSessions
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map(session => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    activeSession?.id === session.id
                      ? 'bg-blue-600'
                      : 'bg-primary hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                        <Image
                          src="/consolida-lila.ico"
                          alt="Agente IA"
                          width={24}
                          height={24}
                          className="w-6 h-6"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-medium truncate max-w-[200px]">
                          {session.title || 'Nueva conversación'}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {formatDate(session.updatedAt)}
                        </span>
                      </div>
                      <p className="text-xs text-secondary mt-1 truncate">
                        {session.messages.length > 1
                          ? `${session.messages.length - 1} mensaje${session.messages.length > 2 ? 's' : ''}`
                          : 'Sin mensajes'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-center">
              {searchTerm
                ? 'No se encontraron conversaciones que coincidan con tu búsqueda.'
                : 'No tienes conversaciones guardadas.'}
            </p>
            <button
              onClick={handleNewChat}
              className="mt-4 text-blue-400 hover:text-blue-300"
            >
              Iniciar una nueva conversación
            </button>
          </div>
        )}
      </div>
    </div>
  );
}