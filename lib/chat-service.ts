// lib/chat-service.ts
export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
  }
  
  export interface ChatSession {
    id: string;
    messages: Message[];
    title?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  class ChatService {
    private baseUrl: string;
  
    constructor() {
      // Usar la URL del backend configurada en el entorno o el valor por defecto
      this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://siscal-agent-ai.siscal.one';
    }
  
    // Método para enviar un mensaje al agente IA
    async sendMessage(text: string): Promise<Message> {
      try {
        const response = await fetch(`${this.baseUrl}/api/v1/reportes/dynamic-query-public`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });
  
        if (!response.ok) {
          throw new Error(`Error al enviar mensaje: ${response.statusText}`);
        }
  
        const data = await response.json();
        
        // Formatear la respuesta del agente
        let aiResponse = '';
        
        // Si hay resultados, formatearlos como texto
        if (data.results && data.results.length > 0) {
          // Determinar si los resultados son simples o complejos
          if (typeof data.results[0] === 'object') {
            // Para resultados complejos, crear un resumen
            aiResponse = `Encontré ${data.results.length} resultados para tu consulta.\n\n`;
            
            // Mostrar solo los primeros 3 resultados para no saturar el chat
            const previewResults = data.results.slice(0, 3);
            
            // Formatear cada resultado como texto
            previewResults.forEach((result: any, index: number) => {
              aiResponse += `Resultado ${index + 1}:\n`;
              
              // Extraer propiedades clave para mostrar (hasta 5 propiedades)
              const keys = Object.keys(result).slice(0, 5);
              keys.forEach(key => {
                aiResponse += `${key}: ${result[key]}\n`;
              });
              
              aiResponse += '\n';
            });
            
            // Si hay más resultados, indicarlo
            if (data.results.length > 3) {
              aiResponse += `... y ${data.results.length - 3} resultados más.`;
            }
          } else {
            // Para resultados simples, mostrarlos directamente
            aiResponse = `Resultados: ${data.results.join(', ')}`;
          }
        } else {
          // Si no hay resultados, proporcionar un mensaje amigable
          aiResponse = "No encontré resultados para tu consulta. ¿Podrías intentar reformularla?";
        }
        
        // Si hay un mensaje específico en la respuesta, agregarlo
        if (data.message) {
          aiResponse += `\n\n${data.message}`;
        }
        
        // Crear el objeto de mensaje
        return {
          id: Date.now().toString(),
          text: aiResponse,
          isUser: false,
          timestamp: new Date()
        };
      } catch (error) {
        console.error('Error al enviar mensaje al agente IA:', error);
        throw error;
      }
    }
  
    // Método para guardar la conversación en localStorage
    saveConversation(session: ChatSession): void {
      try {
        // Obtener conversaciones existentes
        const existingSessions = this.getConversations();
        
        // Buscar si ya existe esta sesión
        const sessionIndex = existingSessions.findIndex(s => s.id === session.id);
        
        if (sessionIndex >= 0) {
          // Actualizar sesión existente
          existingSessions[sessionIndex] = session;
        } else {
          // Agregar nueva sesión
          existingSessions.push(session);
        }
        
        // Guardar en localStorage
        localStorage.setItem('chat_sessions', JSON.stringify(existingSessions));
      } catch (error) {
        console.error('Error al guardar la conversación:', error);
      }
    }
  
    // Método para obtener todas las conversaciones
    getConversations(): ChatSession[] {
      try {
        const sessions = localStorage.getItem('chat_sessions');
        if (sessions) {
          return JSON.parse(sessions);
        }
        return [];
      } catch (error) {
        console.error('Error al obtener conversaciones:', error);
        return [];
      }
    }
  
    // Método para obtener una conversación específica
    getConversation(id: string): ChatSession | null {
      try {
        const sessions = this.getConversations();
        return sessions.find(session => session.id === id) || null;
      } catch (error) {
        console.error('Error al obtener conversación:', error);
        return null;
      }
    }
  
    // Método para crear una nueva sesión de chat
    createSession(): ChatSession {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        messages: [
          {
            id: 'welcome',
            text: '¡Hola! Soy el Agente IA de Consolida. ¿En qué puedo ayudarte hoy?',
            isUser: false,
            timestamp: new Date()
          }
        ],
        title: 'Nueva conversación',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Guardar la nueva sesión
      this.saveConversation(newSession);
      
      return newSession;
    }
  }
  
  // Exportar singleton
  export const chatService = new ChatService();