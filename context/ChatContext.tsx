'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { chatService, Message, ChatSession } from '@/lib/chat-service';

interface ChatContextType {
  activeSession: ChatSession | null;
  sessions: ChatSession[];
  loading: boolean;
  error: string | null;
  setActiveSession: (session: ChatSession) => void;
  createNewSession: () => ChatSession;
  sendMessage: (text: string) => Promise<void>;
  isMessageBeingSent: boolean;
}

const ChatContext = createContext<ChatContextType>({
  activeSession: null,
  sessions: [],
  loading: false,
  error: null,
  setActiveSession: () => {},
  createNewSession: () => ({
    id: '',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  sendMessage: async () => {},
  isMessageBeingSent: false
});

export const useChat = () => useContext(ChatContext);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMessageBeingSent, setIsMessageBeingSent] = useState(false);

  // Cargar conversaciones al iniciar
  useEffect(() => {
    try {
      const savedSessions = chatService.getConversations();
      setSessions(savedSessions);

      // Si hay sesiones, activar la más reciente
      if (savedSessions.length > 0) {
        // Ordenar por fecha de actualización (más reciente primero)
        const sortedSessions = [...savedSessions].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setActiveSession(sortedSessions[0]);
      } else {
        // Si no hay sesiones, crear una nueva
        const newSession = chatService.createSession();
        setSessions([newSession]);
        setActiveSession(newSession);
      }
    } catch (err) {
      console.error('Error al cargar conversaciones:', err);
      setError('Error al cargar conversaciones');
      
      // Crear una nueva sesión como fallback
      const newSession = chatService.createSession();
      setSessions([newSession]);
      setActiveSession(newSession);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para crear una nueva sesión
  const createNewSession = (): ChatSession => {
    const newSession = chatService.createSession();
    
    // Actualizar el estado
    setSessions(prevSessions => [...prevSessions, newSession]);
    setActiveSession(newSession);
    
    return newSession;
  };

  // Función para enviar un mensaje
  const sendMessage = async (text: string) => {
    if (!activeSession || !text.trim()) return;
    
    setIsMessageBeingSent(true);
    setError(null);
    
    try {
      // Crear el mensaje del usuario
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        isUser: true,
        timestamp: new Date()
      };
      
      // Actualizar sesión con el mensaje del usuario
      const updatedSession: ChatSession = {
        ...activeSession,
        messages: [...activeSession.messages, userMessage],
        updatedAt: new Date()
      };
      
      // Actualizar estado
      setActiveSession(updatedSession);
      chatService.saveConversation(updatedSession);
      
      // Actualizar la lista de sesiones
      setSessions(prevSessions => {
        const updatedSessions = prevSessions.map(session => 
          session.id === updatedSession.id ? updatedSession : session
        );
        return updatedSessions;
      });
      
      // Enviar mensaje al agente IA
      const aiResponse = await chatService.sendMessage(text);
      
      // Actualizar sesión con la respuesta del agente
      const sessionWithResponse: ChatSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiResponse],
        updatedAt: new Date()
      };
      
      // Si es la primera interacción, generar un título para la sesión
      if (sessionWithResponse.messages.length === 3 && !sessionWithResponse.title) {
        // Usar el primer mensaje del usuario como título (limitado a 30 caracteres)
        const title = text.length > 30 ? `${text.substring(0, 27)}...` : text;
        sessionWithResponse.title = title;
      }
      
      // Actualizar estado
      setActiveSession(sessionWithResponse);
      chatService.saveConversation(sessionWithResponse);
      
      // Actualizar la lista de sesiones
      setSessions(prevSessions => {
        const updatedSessions = prevSessions.map(session => 
          session.id === sessionWithResponse.id ? sessionWithResponse : session
        );
        return updatedSessions;
      });
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      setError('Error al comunicarse con el agente IA. Por favor, intenta de nuevo.');
      
      // Si hay un error, agregar un mensaje de error al chat
      if (activeSession) {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          text: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.',
          isUser: false,
          timestamp: new Date()
        };
        
        const sessionWithError: ChatSession = {
          ...activeSession,
          messages: [...activeSession.messages, errorMessage],
          updatedAt: new Date()
        };
        
        setActiveSession(sessionWithError);
        chatService.saveConversation(sessionWithError);
        
        setSessions(prevSessions => {
          const updatedSessions = prevSessions.map(session => 
            session.id === sessionWithError.id ? sessionWithError : session
          );
          return updatedSessions;
        });
      }
    } finally {
      setIsMessageBeingSent(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        activeSession,
        sessions,
        loading,
        error,
        setActiveSession,
        createNewSession,
        sendMessage,
        isMessageBeingSent
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};