'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useChat } from '@/context/ChatContext';
import { Message } from '@/lib/chat-service';
import ChatHistory from './ChatHistory';

interface ChatInterfaceProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export default function ChatInterface({ onClose, isMobile = false }: ChatInterfaceProps) {
  const { activeSession, sendMessage, isMessageBeingSent, createNewSession } = useChat();
  const [inputText, setInputText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages]);

  useEffect(() => {
    if (inputRef.current && !showHistory) {
      inputRef.current.focus();
    }
  }, [showHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() === '' || isMessageBeingSent) return;

    await sendMessage(inputText);
    setInputText('');
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleNewChat = () => {
    createNewSession();
    setInputText('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  if (showHistory) {
    return (
      <ChatHistory onClose={() => setShowHistory(false)} />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado del chat */}
      <div className="flex items-center justify-between px-4 py-3 bg-tertiary border-b border-secondary transition-colors duration-300">
        <div className="flex items-center">
          <div className="bg-tertiary p-1 rounded-full mr-2">
            <Image
              src="/consolida-lila.ico"
              alt="Agente IA"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </div>
          <span className="text-primary font-medium">Agente IA</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHistory(true)}
            className="text-secondary hover:text-primary p-2 transition-colors duration-200"
            title="Historial de conversaciones"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={handleNewChat}
            className="text-secondary hover:text-primary p-2 transition-colors duration-200"
            title="Nueva conversación"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary p-2 transition-colors duration-200"
              title="Cerrar chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-tertiary transition-colors duration-300">
        {activeSession?.messages.map((message: Message) => (
          <div 
            key={message.id} 
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-start`}
          >
            {!message.isUser && (
              <div className="w-8 h-8 mr-2 flex-shrink-0 rounded-full overflow-hidden bg-primary flex items-center justify-center">
                <Image
                  src="/consolida-lila.ico"
                  alt="Agente IA"
                  width={32}
                  height={32}
                  className="w-6 h-6"
                />
              </div>
            )}
            <div 
              className={`max-w-[85%] rounded-lg px-4 py-3 ${
                message.isUser 
                  ? 'bg-blue-600 text-primary' 
                  : 'bg-primary text-primary'
              }`}
            >
              {formatMessageText(message.text)}
            </div>
            {message.isUser && (
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
          <div className="flex justify-start items-start">
            <div className="w-8 h-8 mr-2 flex-shrink-0 rounded-full overflow-hidden bg-primary flex items-center justify-center">
              <Image
                src="/consolida-lila.ico"
                alt="Agente IA"
                width={32}
                height={32}
                className="w-6 h-6"
              />
            </div>
            <div className="bg-primary text-primary px-4 py-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.0s' }}></div>
                <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input para escribir mensajes */}
      <div className="p-3 bg-tertiary border-t border-secondary transition-colors duration-300">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-tertiary text-primary rounded-lg px-4 py-3 focus:outline-none"
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
  );
}