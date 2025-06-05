'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([
    { text: "¿En qué puedo ayudarte hoy?", isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() === '') return;
    
    // Añadir mensaje del usuario
    const newMessages = [...messages, { text: inputText, isUser: true }];
    setMessages(newMessages);
    setInputText('');
    
    // Simular respuesta del asistente (en una aplicación real, esto vendría de una API)
    setTimeout(() => {
      setMessages([...newMessages, { text: "Gracias por tu mensaje. Soy el Agente IA y estoy aquí para ayudarte.", isUser: false }]);
    }, 1000);
  };
  
  return (
    <>
      {/* Botón para abrir el chat */}
      <button 
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-green-600 text-white rounded-full p-3 shadow-lg hover:bg-green-700 z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
      
      {/* Ventana de chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-gray-900 rounded-lg shadow-xl z-50 flex flex-col">
          {/* Header del chat */}
          <div className="bg-gray-800 rounded-t-lg p-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-500 p-1 rounded-full mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white">Agente IA</span>
            </div>
            <button onClick={toggleChat} className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3/4 rounded-lg px-3 py-2 ${msg.isUser ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          {/* Input para escribir */}
          <form onSubmit={sendMessage} className="p-3 border-t border-gray-700 flex">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-gray-700 text-white rounded-l-lg px-3 py-2 focus:outline-none"
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white rounded-r-lg px-4 hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}